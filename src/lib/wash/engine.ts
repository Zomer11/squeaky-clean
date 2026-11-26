import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import {
  CALLOUT_RANGE,
  CUES,
  GLOSS_RANGE,
  SPIN_RANGE,
  WASH_RANGE,
  smoothstep,
  window01,
  type Shot,
} from "./cues";

/* ------------------------------------------------------------------ */
/* Dirt / foam / wet shader — injected into MeshPhysicalMaterial       */
/* ------------------------------------------------------------------ */

const NOISE = /* glsl */ `
uniform mat4 uCarInv;
uniform float uFoamX;
uniform float uWashX;
uniform float uTime;
uniform float uBead;
uniform float uDirtAmt;
uniform float uFoamLift;
uniform vec3 uDirtTint;
varying vec3 vCar;
varying vec3 vCarN;
float gDirt = 0.0;
float gFoam = 0.0;
float gWet = 0.0;
float gDrop = 0.0;
float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = 0.5; float s = 0.0; for (int i = 0; i < 4; i++){ s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
float washEdge(vec3 p){ return (fbm(p * 5.0 + 3.1) - 0.5) * 0.45; }
`;

/** Thick foam: push the surface out where it's foamed, so the foam has real volume. */
const FOAM_VERTEX = /* glsl */ `
{
  vec3 cp = (uCarInv * modelMatrix * vec4(transformed, 1.0)).xyz;
  float e = washEdge(cp);
  float cl = smoothstep(-0.05, 0.05, cp.x - uWashX + e);
  float fo = smoothstep(-0.07, 0.07, cp.x - uFoamX + e) * (1.0 - cl);
  transformed += objectNormal * fo * uFoamLift * (0.012 + 0.03 * fbm(cp * 14.0));
}
`;

/** Stripes + door decal (paint only), drawn before the dirt so dirt sits on top. */
const LIVERY_FRAG = /* glsl */ `
#ifdef ACD_PAINT
{
  float az = abs(vCar.z);
  float st = smoothstep(0.028, 0.034, az) * (1.0 - smoothstep(0.186, 0.192, az)) * step(0.3, vCar.y) * step(0.2, vCarN.y + 0.6);
  diffuseColor.rgb = mix(diffuseColor.rgb, uAccent, st);
  if (abs(vCarN.z) > 0.55) {
    float u = (vCar.x + 0.88) / 1.22;
    if (vCar.z < 0.0) u = 1.0 - u;
    float v = (vCar.y - 0.42) / 0.3;
    if (u > 0.0 && u < 1.0 && v > 0.0 && v < 1.0) {
      vec4 d = texture2D(uDecal, vec2(u, v));
      diffuseColor.rgb = mix(diffuseColor.rgb, d.rgb, d.a);
    }
  }
}
#endif
`;

const DIRT_FRAG = /* glsl */ `
{
  float n = fbm(vCar * 3.2);
  float low = 1.0 - smoothstep(0.2, 1.15, vCar.y);
  float streak = fbm(vec3(vCar.x * 16.0, vCar.y * 1.4, vCar.z * 16.0));
  float splat = smoothstep(0.55, 0.8, fbm(vCar * 11.0));
  float mask = clamp(0.32 + 0.75 * low + (n - 0.5) * 1.1 + (streak - 0.5) * 0.5 + splat * 0.35, 0.0, 1.0) * uDirtAmt;
  float edge = washEdge(vCar);
  float clean = smoothstep(-0.05, 0.05, vCar.x - uWashX + edge);
  float foamed = smoothstep(-0.07, 0.07, vCar.x - uFoamX + edge) * (1.0 - clean);
  gWet = clean * (1.0 - smoothstep(0.0, 1.1, vCar.x - uWashX + edge));
  gDirt = mask * (1.0 - clean) * (1.0 - foamed * 0.85);
  vec3 dirtCol = mix(vec3(0.46, 0.39, 0.3), vec3(0.2, 0.16, 0.12), n) * uDirtTint;
  diffuseColor.rgb = mix(diffuseColor.rgb, dirtCol, gDirt * 0.9);
  float bub = fbm(vCar * 70.0 + vec3(0.0, -uTime * 0.12, 0.0));
  float drip = smoothstep(0.45, 0.8, fbm(vec3(vCar.x * 9.0, vCar.y * 1.2 + uTime * 0.05, vCar.z * 9.0)));
  gFoam = foamed * step(0.01, uDirtAmt) * (1.0 - 0.35 * drip * smoothstep(0.9, 0.3, vCar.y));
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0) * (0.9 + 0.1 * bub), gFoam);
  diffuseColor.rgb *= mix(1.0, 0.78, gWet);
  // water beads left on the clean paint after the rinse
  float cell = vnoise(vCar * vec3(46.0, 46.0, 46.0));
  gDrop = smoothstep(0.83, 0.86, cell) * clean * uBead * step(0.01, uDirtAmt);
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.7, gDrop);
}
`;

type Patched = THREE.MeshPhysicalMaterial & { userData: { dirt: { value: number } } };

function patchDirt(
  mat: THREE.MeshPhysicalMaterial,
  shared: Record<string, THREE.IUniform>,
  amount: number,
  tint = new THREE.Color(1, 1, 1),
  opts: { paint?: boolean; foamLift?: number } = {},
) {
  const dirt = { value: amount };
  const tintU = { value: tint };
  const lift = { value: opts.foamLift ?? 0 };
  (mat as Patched).userData.dirt = dirt;
  if (opts.paint) mat.defines = { ...(mat.defines ?? {}), ACD_PAINT: "" };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared, { uDirtAmt: dirt, uDirtTint: tintU, uFoamLift: lift });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\n" + NOISE)
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n" + FOAM_VERTEX)
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
vCar = (uCarInv * modelMatrix * vec4(transformed, 1.0)).xyz;
vCarN = normalize(mat3(uCarInv * modelMatrix) * objectNormal);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\n" + NOISE + "\nuniform sampler2D uDecal;\nuniform vec3 uAccent;",
      )
      .replace("#include <color_fragment>", "#include <color_fragment>\n" + LIVERY_FRAG + DIRT_FRAG)
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 0.9, gDirt);
roughnessFactor = mix(roughnessFactor, 0.7, gFoam);
roughnessFactor = mix(roughnessFactor, 0.015, gWet * 0.85);
roughnessFactor = mix(roughnessFactor, 0.0, gDrop);`,
      )
      .replace(
        "#include <metalnessmap_fragment>",
        "#include <metalnessmap_fragment>\nmetalnessFactor *= 1.0 - max(max(gDirt, gFoam), gDrop);",
      )
      .replace(
        "#include <lights_physical_fragment>",
        `#include <lights_physical_fragment>
#ifdef USE_CLEARCOAT
material.clearcoat *= 1.0 - max(gDirt * 0.7, gFoam * 0.6);
#endif`,
      );
  };
  mat.customProgramCacheKey = () => (opts.paint ? "dirt-v2-paint" : "dirt-v2");
}

/* ------------------------------------------------------------------ */
/* Spray particles                                                     */
/* ------------------------------------------------------------------ */

class Spray {
  readonly points: THREE.Points;
  private pos: Float32Array;
  private vel: Float32Array;
  private life: Float32Array;
  private kind: Float32Array;
  private size: Float32Array;
  private cursor = 0;
  private carry = 0;

  constructor(private count: number, pixelRatio: number) {
    this.pos = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    this.life = new Float32Array(count);
    this.kind = new Float32Array(count);
    this.size = new Float32Array(count);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aLife", new THREE.BufferAttribute(this.life, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aKind", new THREE.BufferAttribute(this.kind, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aSize", new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uPR: { value: pixelRatio } },
      vertexShader: /* glsl */ `
        attribute float aLife; attribute float aKind; attribute float aSize;
        uniform float uPR; varying float vLife; varying float vKind;
        void main(){
          vLife = aLife; vKind = aKind;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aLife > 0.0 ? aSize * uPR * (260.0 / -mv.z) : 0.0;
        }`,
      fragmentShader: /* glsl */ `
        varying float vLife; varying float vKind;
        void main(){
          vec2 c = gl_PointCoord - 0.5; float d = length(c);
          if (d > 0.5) discard;
          float soft = smoothstep(0.5, 0.0, d);
          vec3 water = vec3(0.78, 0.9, 1.0) * 1.6;
          vec3 foam = vec3(0.96, 0.97, 0.98);
          vec3 col = mix(water, foam, vKind);
          float a = mix(0.32 * soft, 0.92 * smoothstep(0.5, 0.35, d), vKind) * clamp(vLife, 0.0, 1.0);
          gl_FragColor = vec4(col, a);
        }`,
    });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
  }

  emit(dt: number, rate: number, origin: THREE.Vector3, foam: boolean) {
    this.carry += rate * dt;
    const n = Math.floor(this.carry);
    this.carry -= n;
    for (let k = 0; k < n; k++) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % this.count;
      const fan = (Math.random() - 0.5) * (foam ? 0.9 : 0.75); // vertical fan
      const side = (Math.random() - 0.5) * 0.12;
      const speed = foam ? 4.2 + Math.random() * 1.5 : 9 + Math.random() * 3;
      this.pos[i * 3] = origin.x;
      this.pos[i * 3 + 1] = origin.y;
      this.pos[i * 3 + 2] = origin.z;
      this.vel[i * 3] = side * speed;
      this.vel[i * 3 + 1] = (fan - 0.12) * speed;
      this.vel[i * 3 + 2] = -speed;
      this.life[i] = 1;
      this.kind[i] = foam ? 1 : 0;
      this.size[i] = foam ? 0.05 + Math.random() * 0.05 : 0.025 + Math.random() * 0.03;
    }
  }

  update(dt: number) {
    const { pos, vel, life, kind } = this;
    for (let i = 0; i < this.count; i++) {
      if (life[i] <= 0) continue;
      const foam = kind[i] > 0.5;
      vel[i * 3 + 1] -= (foam ? 2.5 : 9.8) * dt;
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      const y = pos[i * 3 + 1];
      const surf = y < 0.9 ? 0.96 : y < 1.28 ? 0.7 : -9;
      if (vel[i * 3 + 2] < 0 && pos[i * 3 + 2] < surf && y > 0.15) {
        pos[i * 3 + 2] = surf;
        if (foam) {
          vel[i * 3] = vel[i * 3 + 1] = vel[i * 3 + 2] = 0;
        } else {
          vel[i * 3] = (Math.random() - 0.5) * 2.2;
          vel[i * 3 + 1] = Math.random() * 1.6;
          vel[i * 3 + 2] = 0.6 + Math.random() * 1.4;
        }
      }
      if (y < 0.02) {
        pos[i * 3 + 1] = 0.02;
        vel[i * 3 + 1] *= -0.2;
      }
      life[i] -= dt * (foam ? 0.9 : 1.7);
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.aLife.needsUpdate = true;
    g.attributes.aKind.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
  }
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export type EngineOptions = {
  modelUrl: string;
  mobile: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
  onError?: (e: unknown) => void;
  onSpray?: (intensity: number, foam: boolean) => void;
};

const CALLOUT_POINTS: [number, number, number][] = [
  [1.45, 0.82, 0.32], // bonnet paint
  [1.42, 0.36, 1.0], // front wheel
  [0.05, 1.12, 0.62], // glass
  [-1.38, 0.08, 1.0], // rear tyre
];

const tmpV = new THREE.Vector3();

export class WashEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private carRoot = new THREE.Group();
  private paint: THREE.MeshPhysicalMaterial | null = null;
  private heads: THREE.MeshBasicMaterial[] = [];
  private tails: THREE.MeshBasicMaterial[] = [];
  private floorMat!: THREE.MeshPhysicalMaterial;
  private spray: Spray;
  private lance = new THREE.Group();
  private grid: THREE.GridHelper;
  private edges: THREE.LineSegments[] = [];
  private meshes: THREE.Mesh[] = [];
  private shared: Record<string, THREE.IUniform> = {
    uCarInv: { value: new THREE.Matrix4() },
    uFoamX: { value: 3 },
    uWashX: { value: 3 },
    uTime: { value: 0 },
    uBead: { value: 0 },
    uDecal: { value: null as THREE.Texture | null },
    uAccent: { value: new THREE.Color(1.0, 0.16, 0.02) },
  };
  private wheels: THREE.Object3D[] = [];
  /** seconds the car takes to roll into frame on load */
  private static ROLL = 2.6;

  private progress = 0;
  private pointer = new THREE.Vector2();
  private pointerEased = new THREE.Vector2();
  private holding = false;
  private holdW = 0;
  private w = 0;
  private lastW = 0;
  private sprayLevel = 0;
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private camFov = 32;
  private camOffset = 0;
  private firstFrame = true;
  private timer = new THREE.Timer();
  private raf = 0;
  private active = true;
  private loadedAt = 0;
  private ready = false;
  private calloutEls: HTMLElement[] = [];
  private calloutWrap: HTMLElement | null = null;
  private blueprint = false;
  private paintTarget = new THREE.Color("#14171c");
  private pr: number;
  private frames = 0;
  private frameTime = 0;
  private quality = 2;
  private ro: ResizeObserver;
  /** ?snap in the URL: skip easing (for screenshots / QA). */
  private snap = typeof location !== "undefined" && location.search.includes("snap");

  constructor(private canvas: HTMLCanvasElement, private opts: EngineOptions) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.pr = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.75 : 2);
    this.renderer.setPixelRatio(this.pr);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    const rt = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: opts.mobile ? 2 : 4,
    });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.45, 0.97);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.scene.background = new THREE.Color("#070809");
    this.buildStudio();
    this.buildFloor();

    this.spray = new Spray(opts.mobile ? 900 : 1800, this.pr);
    this.scene.add(this.spray.points);
    this.buildLance();

    this.grid = new THREE.GridHelper(14, 28, 0xff6a2b, 0x2a2f36);
    (this.grid.material as THREE.Material).transparent = true;
    (this.grid.material as THREE.Material).opacity = 0.5;
    this.grid.visible = false;
    this.scene.add(this.grid);

    this.scene.add(this.carRoot);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas.parentElement ?? canvas);
    this.resize();
  }

  /* ---------- scene building ---------- */

  private buildStudio() {
    const studio = new THREE.Scene();
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(30, 14, 30),
      new THREE.MeshBasicMaterial({ color: 0x050506, side: THREE.BackSide }),
    );
    room.position.y = 5;
    studio.add(room);
    const panel = (w: number, h: number, k: number, p: [number, number, number], warm = false) => {
      const m = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
      m.color.setRGB(k, k * (warm ? 0.82 : 0.98), k * (warm ? 0.62 : 1.0));
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      mesh.position.set(...p);
      mesh.lookAt(0, 0.6, 0);
      studio.add(mesh);
    };
    panel(9, 5, 3.2, [0, 9, 0]); // key softbox overhead
    panel(1.2, 12, 5.5, [9, 3, 5]); // strip right front
    panel(1.2, 12, 4.5, [-9, 3, 4]); // strip left
    panel(10, 1.0, 6.0, [0, 4, -10]); // rear rim line
    panel(3, 3, 2.2, [6, 2, -7], true); // warm accent (brand orange glow)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(studio, 0.035).texture;
    this.scene.environmentIntensity = 1;
    pmrem.dispose();
  }

  private buildFloor() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(0.3, "#9a9a9a");
    grad.addColorStop(0.62, "#000");
    grad.addColorStop(1, "#000");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const alpha = new THREE.CanvasTexture(c);
    this.floorMat = new THREE.MeshPhysicalMaterial({
      color: 0x030303,
      roughness: 0.6,
      metalness: 0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.3,
      alphaMap: alpha,
      transparent: true,
      envMapIntensity: 0.22,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    // contact shadow
    const s = document.createElement("canvas");
    s.width = 256;
    s.height = 128;
    const sg = s.getContext("2d")!;
    const sgrad = sg.createRadialGradient(128, 64, 4, 128, 64, 128);
    sgrad.addColorStop(0, "rgba(0,0,0,0.95)");
    sgrad.addColorStop(0.5, "rgba(0,0,0,0.6)");
    sgrad.addColorStop(1, "rgba(0,0,0,0)");
    sg.fillStyle = sgrad;
    sg.fillRect(0, 0, 256, 128);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 3.0),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(s),
        transparent: true,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.004;
    this.carRoot.add(shadow);
  }

  private buildLance() {
    const wand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 1.4, 12),
      new THREE.MeshPhysicalMaterial({ color: 0x15171a, metalness: 0.8, roughness: 0.3 }),
    );
    wand.position.y = 0.7;
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.028, 0.12, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0xff5a1f,
        emissive: 0xff5a1f,
        emissiveIntensity: 0.6,
        roughness: 0.35,
      }),
    );
    const pivot = new THREE.Group();
    pivot.add(wand, tip);
    // point the lance down toward the car (-z), handle trailing up toward camera
    pivot.rotation.x = 1.05;
    this.lance.add(pivot);
    this.lance.visible = false;
    this.scene.add(this.lance);
  }

  async load() {
    const loader = new GLTFLoader();
    try {
      // Fetch the bytes ourselves so the model can also ship as base64 JSON
      // ({ "glb": "..." }) on hosts that only serve text types.
      const res = await fetch(this.opts.modelUrl);
      let bytes: ArrayBuffer = await res.arrayBuffer();
      if (this.opts.modelUrl.endsWith(".json")) {
        const { glb } = JSON.parse(new TextDecoder().decode(bytes)) as { glb: string };
        bytes = Uint8Array.from(atob(glb), (c) => c.charCodeAt(0)).buffer;
      }
      const gltf = await loader.parseAsync(bytes, "");
      const model = gltf.scene;
      this.shared.uDecal.value = await this.buildDecal();
      model.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const src = mesh.material as THREE.Material;
        mesh.material = this.materialFor(src.name);
        this.meshes.push(mesh);
      });
      model.traverse((o) => {
        if (o.name.startsWith("Wheel_")) this.wheels.push(o);
      });
      this.carRoot.add(model);
      this.carRoot.updateMatrixWorld(true);
      if (!this.opts.reducedMotion && !this.snap) this.loadedAt = performance.now();
      await this.renderer.compileAsync(this.scene, this.camera);
      this.ready = true;
      this.opts.onReady?.();
      this.loop();
    } catch (e) {
      this.opts.onError?.(e);
    }
  }

  /** "AUTO CARE DETAILING" door decal, drawn with the site's own display font. */
  private async buildDecal(): Promise<THREE.Texture> {
    try {
      await document.fonts?.ready;
    } catch {
      /* fonts API missing: fall back to system font */
    }
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() ||
      "system-ui, sans-serif";
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, c.width, c.height);
    // car-outline swoosh
    g.strokeStyle = "#ff5a1f";
    g.lineWidth = 9;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(330, 74);
    g.bezierCurveTo(400, 26, 560, 18, 640, 54);
    g.lineTo(720, 66);
    g.stroke();
    g.font = `800 108px ${family}`;
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.fillStyle = "#ff5a1f";
    g.fillText("AUTO CARE", 512, 170);
    g.font = `600 58px ${family}`;
    g.fillStyle = "#cfd3d8";
    // letter-spaced second line
    const word = "DETAILING";
    const spacing = 14;
    const widths = [...word].map((ch) => g.measureText(ch).width);
    let x = 512 - (widths.reduce((a, b) => a + b, 0) + spacing * (word.length - 1)) / 2;
    g.textAlign = "left";
    [...word].forEach((ch, i) => {
      g.fillText(ch, x, 236);
      x += widths[i] + spacing;
    });
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  private matCache = new Map<string, THREE.Material>();
  private materialFor(name: string): THREE.Material {
    const hit = this.matCache.get(name);
    if (hit) return hit;
    const m = this.makeMaterial(name);
    this.matCache.set(name, m);
    return m;
  }

  private makeMaterial(name: string): THREE.Material {
    const shared = this.shared;
    switch (name) {
      case "Paint": {
        const m = new THREE.MeshPhysicalMaterial({
          color: this.paintTarget.clone(),
          metalness: 0.5,
          roughness: 0.28,
          clearcoat: 1,
          clearcoatRoughness: 0.025,
          envMapIntensity: 1.3,
        });
        patchDirt(m, shared, 1, undefined, { paint: true, foamLift: 1 });
        this.paint = m;
        return m;
      }
      case "Glass": {
        const m = new THREE.MeshPhysicalMaterial({
          color: 0x040507,
          metalness: 0,
          roughness: 0.02,
          clearcoat: 1,
          clearcoatRoughness: 0,
          envMapIntensity: 1.6,
        });
        patchDirt(m, shared, 0.55, undefined, { foamLift: 0.7 });
        return m;
      }
      case "Rim": {
        const m = new THREE.MeshPhysicalMaterial({
          color: 0x1b1d21,
          metalness: 0.9,
          roughness: 0.32,
          envMapIntensity: 1.2,
        });
        patchDirt(m, shared, 1, new THREE.Color(0.55, 0.5, 0.45));
        return m;
      }
      case "Accent": {
        const m = new THREE.MeshPhysicalMaterial({
          color: 0xff5a1f,
          metalness: 0.1,
          roughness: 0.3,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.1,
        });
        patchDirt(m, shared, 0.6);
        return m;
      }
      case "Metal": {
        const m = new THREE.MeshPhysicalMaterial({
          color: 0xa9adb3,
          metalness: 1,
          roughness: 0.25,
          envMapIntensity: 1.2,
        });
        patchDirt(m, shared, 0.7, new THREE.Color(0.55, 0.5, 0.45));
        return m;
      }
      case "Tyre": {
        const m = new THREE.MeshPhysicalMaterial({ color: 0x0d0d0e, roughness: 0.86 });
        patchDirt(m, shared, 0.45, undefined, { foamLift: 0.4 });
        return m;
      }
      case "HeadLight": {
        const m = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.heads.push(m);
        return m;
      }
      case "TailLight": {
        const m = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.tails.push(m);
        return m;
      }
      default: {
        const m = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0b, roughness: 0.45, metalness: 0.3 });
        patchDirt(m, shared, 0.5);
        return m;
      }
    }
  }

  /* ---------- public controls ---------- */

  setProgress(p: number) {
    this.progress = Math.min(1, Math.max(0, p));
  }
  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
  }
  setHolding(h: boolean) {
    this.holding = h;
  }
  setActive(a: boolean) {
    if (a === this.active) return;
    this.active = a;
    if (a && this.ready) {
      this.timer.update();
      this.loop();
    }
  }
  setPaint(hex: string) {
    this.paintTarget.set(hex);
  }
  setCallouts(wrap: HTMLElement | null, els: HTMLElement[]) {
    this.calloutWrap = wrap;
    this.calloutEls = els;
  }
  get washAmount() {
    return this.w;
  }

  setBlueprint(on: boolean) {
    this.blueprint = on;
    if (on && this.edges.length === 0) {
      const mat = new THREE.LineBasicMaterial({ color: 0xff7a3d, transparent: true, opacity: 0.75 });
      for (const m of this.meshes) {
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 32), mat);
        m.add(e);
        this.edges.push(e);
      }
    }
    for (const m of this.meshes) (m.material as THREE.Material).visible = !on;
    for (const e of this.edges) e.visible = on;
    this.grid.visible = on;
  }

  /* ---------- per-frame ---------- */

  private shotAt(p: number): Shot {
    const portrait = this.camera.aspect < 0.85;
    const resolve = (i: number): Shot => {
      const c = CUES[i];
      return portrait && c.mobile ? { ...c.shot, ...c.mobile } : c.shot;
    };
    let i = 0;
    while (i < CUES.length - 2 && p > CUES[i + 1].at) i++;
    const a = resolve(i);
    const b = resolve(i + 1);
    const t = smoothstep(CUES[i].at, CUES[i + 1].at, p);
    const l = (x: number, y: number) => x + (y - x) * t;
    return {
      pos: [l(a.pos[0], b.pos[0]), l(a.pos[1], b.pos[1]), l(a.pos[2], b.pos[2])],
      look: [l(a.look[0], b.look[0]), l(a.look[1], b.look[1]), l(a.look[2], b.look[2])],
      fov: l(a.fov, b.fov),
      offset: l(a.offset ?? 0, b.offset ?? 0),
    };
  }

  private loop = () => {
    if (!this.active) return;
    this.raf = requestAnimationFrame(this.loop);
    this.timer.update();
    const dt = Math.min(0.05, this.timer.getDelta());
    this.tick(dt);
    this.composer.render(dt);
    this.adapt(dt);
  };

  private tick(dt: number) {
    const p = this.progress;
    const t = this.timer.getElapsed();
    this.shared.uTime.value = t;
    const k = this.snap ? 1 : 1 - Math.exp(-dt * 5);

    // --- wash amount: scroll OR hold-to-wash
    const scrollW = smoothstep(WASH_RANGE[0], WASH_RANGE[1], p);
    if (this.holding) this.holdW = Math.min(1, this.holdW + dt * 0.2);
    if (p > 0.6) this.holdW = 0;
    this.w += (Math.max(scrollW, this.holdW) - this.w) * (this.snap ? 1 : 1 - Math.exp(-dt * 8));
    const w = this.w;
    const foamPhase = Math.min(1, w / 0.45);
    const rinsePhase = Math.min(1, Math.max(0, (w - 0.4) / 0.6));
    const foamX = 3 - 6 * foamPhase;
    const washX = 3 - 6 * rinsePhase;
    this.shared.uFoamX.value = foamX;
    this.shared.uWashX.value = washX;
    this.shared.uBead.value = rinsePhase * (1 - smoothstep(0.53, 0.58, p));

    // spray intensity from how fast the wash is moving
    const dw = Math.abs(w - this.lastW) / Math.max(dt, 1e-3);
    this.lastW = w;
    const target = w > 0.002 && w < 0.998 ? Math.min(1, dw * 6 + (this.holding ? 1 : 0)) : 0;
    this.sprayLevel += (target - this.sprayLevel) * (1 - Math.exp(-dt * (target > this.sprayLevel ? 14 : 4)));
    const foaming = w < 0.42;
    this.opts.onSpray?.(this.sprayLevel, foaming);

    // nozzle follows the active front
    const front = foaming ? foamX : washX;
    const nx = Math.min(2.5, Math.max(-2.5, front + 0.25)) + Math.sin(t * 6.5) * 0.18;
    const ny = 0.75 + Math.sin(t * 2.7) * 0.28;
    const nozzle = tmpV.set(nx, ny + 0.35, 2.05);
    this.lance.position.copy(nozzle);
    this.lance.visible = this.sprayLevel > 0.04 && !this.blueprint;
    if (!this.opts.reducedMotion && this.sprayLevel > 0.02) {
      this.spray.emit(dt, this.sprayLevel * (this.opts.mobile ? 900 : 1800), nozzle, foaming);
    }
    this.spray.update(dt);

    // wet floor once rinsing starts
    this.floorMat.roughness = 0.6 - 0.35 * rinsePhase;
    this.floorMat.clearcoat = 0.25 + 0.3 * rinsePhase;

    // --- car turntable + paint easing
    const spin = smoothstep(SPIN_RANGE[0], SPIN_RANGE[1], p);
    this.carRoot.rotation.y = spin * Math.PI * 0.55 + Math.sin(t * 0.3) * 0.02 * spin;
    // roll-in on load: drives in from behind and settles, wheels turning
    const since = this.loadedAt ? (performance.now() - this.loadedAt) / 1000 : 99;
    const roll = Math.min(1, since / WashEngine.ROLL);
    const eased = 1 - Math.pow(1 - roll, 3);
    const x = -11 * (1 - eased);
    const dx = x - this.carRoot.position.x;
    this.carRoot.position.x = x;
    if (dx !== 0) for (const w of this.wheels) w.rotation.z -= dx / 0.345;
    this.carRoot.updateMatrixWorld(true);
    (this.shared.uCarInv.value as THREE.Matrix4).copy(this.carRoot.matrixWorld).invert();
    if (this.paint) this.paint.color.lerp(this.paintTarget, 1 - Math.exp(-dt * 4));

    // --- lights: intro flicker, then steady
    let lightK = 1;
    if (this.loadedAt) {
      const s = (performance.now() - this.loadedAt) / 1000;
      lightK = s < 0.2 ? 0 : s < 0.3 ? 1 : s < 0.42 ? 0.1 : s < 0.5 ? 1 : s < 0.58 ? 0.3 : s < 1.0 ? Math.min(1, (s - 0.58) * 2 + 0.5) : 1;
    }
    for (const m of this.heads) m.color.setRGB(6 * lightK, 6.2 * lightK, 6.6 * lightK);
    for (const m of this.tails) m.color.setRGB(4 * lightK, 0.12 * lightK, 0.06 * lightK);

    // --- camera
    this.pointerEased.lerp(this.pointer, this.snap ? 1 : 1 - Math.exp(-dt * 3));
    const shot = this.shotAt(p);
    const px = this.pointerEased.x;
    const py = this.pointerEased.y;
    const goal = new THREE.Vector3(...shot.pos);
    const side = new THREE.Vector3().crossVectors(goal, new THREE.Vector3(0, 1, 0)).normalize();
    goal.addScaledVector(side, px * 0.35);
    goal.y += py * 0.18 + Math.sin(t * 0.45) * 0.03;
    const look = new THREE.Vector3(...shot.look);
    // during the wash the camera follows the active front
    const track = window01(p, 0.13, 0.42, 0.08);
    const followX = Math.min(1.9, Math.max(-1.9, front)) - look.x;
    look.x += followX * track * 0.75;
    goal.x += followX * track * 0.75;
    const offGoal = shot.offset ?? 0;
    if (this.firstFrame) {
      this.camOffset = offGoal;
      this.camPos.copy(goal);
      this.camLook.copy(look);
      this.camFov = shot.fov;
      this.firstFrame = false;
    }
    this.camPos.lerp(goal, k);
    this.camLook.lerp(look, k);
    this.camFov += (shot.fov - this.camFov) * k;
    this.camOffset += (offGoal - this.camOffset) * k;
    this.applyOffset();
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
    if (Math.abs(this.camera.fov - this.camFov) > 0.01) {
      this.camera.fov = this.camFov;
      this.camera.updateProjectionMatrix();
    }

    // --- studio rotation: gloss sweep + cursor
    const sweep = smoothstep(GLOSS_RANGE[0], GLOSS_RANGE[1], p);
    this.scene.environmentRotation.set(py * 0.25, sweep * 2.4 - px * 0.6, 0);

    // --- callouts
    this.placeCallouts(p);
  }

  private viewW = 1;
  private viewH = 1;
  private lastOffset = NaN;
  private applyOffset() {
    if (Math.abs(this.camOffset - this.lastOffset) < 1e-4) return;
    this.lastOffset = this.camOffset;
    const w = this.viewW;
    const h = this.viewH;
    this.camera.setViewOffset(w, h, -this.camOffset * w, 0, w, h);
  }

  private placeCallouts(p: number) {
    if (!this.calloutWrap) return;
    const vis = window01(p, CALLOUT_RANGE[0], CALLOUT_RANGE[1], 0.035);
    this.calloutWrap.style.opacity = String(vis);
    if (vis <= 0) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.calloutEls.forEach((el, i) => {
      const pt = CALLOUT_POINTS[i];
      if (!pt) return;
      tmpV.set(...pt);
      this.carRoot.localToWorld(tmpV);
      tmpV.project(this.camera);
      const x = (tmpV.x * 0.5 + 0.5) * w;
      const y = (-tmpV.y * 0.5 + 0.5) * h;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.classList.toggle("is-flip", x > w * 0.6);
    });
  }

  private adapt(dt: number) {
    if (this.quality === 0) return;
    this.frames++;
    this.frameTime += dt;
    if (this.frames < 90) return;
    const fps = this.frames / this.frameTime;
    this.frames = 0;
    this.frameTime = 0;
    if (fps < 40) {
      if (this.pr > 1) {
        this.pr = Math.max(1, this.pr - 0.5);
        this.renderer.setPixelRatio(this.pr);
        this.resize();
      } else if (this.bloom.enabled) {
        this.bloom.enabled = false;
        this.quality = 0;
      }
    }
  }

  private resize() {
    const el = this.canvas.parentElement ?? this.canvas;
    const w = el.clientWidth || window.innerWidth;
    const h = el.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(this.pr);
    this.composer.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    this.camera.aspect = w / h;
    this.viewW = w;
    this.viewH = h;
    this.lastOffset = NaN;
    this.applyOffset();
    this.camera.updateProjectionMatrix();
    if (this.ready && !this.active) this.composer.render(0);
  }

  dispose() {
    this.active = false;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose?.();
    });
    this.composer.dispose();
    this.renderer.dispose();
  }
}
