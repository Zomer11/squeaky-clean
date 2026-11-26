"""Auto Care Detailing hero car: an original low, wide fastback coupe.

Run:  python3 tools/blender/coupe.py out.glb preview.png [logo]
      (pip install bpy). Material names are read by the three.js engine.
      Wheels export as separate nodes Wheel_FL / Wheel_FR / Wheel_RL / Wheel_RR
      with their origin on the axle so they can spin.
"""
import bpy, bmesh, math, sys
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
OUT, PREVIEW = args[0], args[1]
MODE = args[2] if len(args) > 2 else "preview"

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection

L = 4.56
HALF = L / 2


def lerp(a, b, t):
    return a + (b - a) * t


def sstep(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def interp(pts, x):
    if x <= pts[0][0]:
        return pts[0][1]
    for (x0, v0), (x1, v1) in zip(pts, pts[1:]):
        if x <= x1:
            return lerp(v0, v1, sstep((x - x0) / (x1 - x0)))
    return pts[-1][1]


# ---------- side / plan profiles (x: tail -2.28 .. nose +2.28) ----------
BODY_TOP = [(-2.28, 0.74), (-2.2, 0.9), (-2.02, 0.955), (-1.75, 0.95), (-1.35, 0.92),
            (0.5, 0.88), (1.15, 0.8), (1.7, 0.71), (2.05, 0.62), (2.28, 0.47)]
BODY_BOT = [(-2.28, 0.3), (-2.05, 0.16), (-1.7, 0.12), (1.75, 0.12), (2.1, 0.15), (2.28, 0.24)]
HALF_W = [(-2.28, 0.8), (-2.05, 0.94), (-1.5, 0.985), (-0.95, 0.955), (-0.3, 0.925),
          (0.6, 0.93), (1.35, 0.965), (1.85, 0.93), (2.28, 0.79)]
ROOF = [(-2.02, 0.95), (-1.6, 1.04), (-1.05, 1.2), (-0.55, 1.275), (0.0, 1.26),
        (0.35, 1.18), (0.62, 0.9)]


def body_ring(x, n):
    top, bot, w = interp(BODY_TOP, x), interp(BODY_BOT, x), interp(HALF_W, x)
    end = abs(x) - 1.98
    if end > 0:
        k = end / (HALF - 1.98)
        w *= math.sqrt(max(0.0, 1 - 0.5 * k ** 2.4))
    mid, h = (top + bot) / 2, (top - bot) / 2
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        c, s = math.cos(a), math.sin(a)
        e = 0.3 if s > 0 else 0.26
        y = w * math.copysign(abs(c) ** e, c)
        z = mid + h * math.copysign(abs(s) ** e, s)
        # crisp character line: pinch the side slightly above mid-height
        if 0.05 < s < 0.6:
            y *= 1 - 0.018 * math.sin((s - 0.05) / 0.55 * math.pi)
        if s < 0:
            y *= 1 - 0.06 * abs(s) ** 2
        pts.append((x, y, z))
    return pts


def cabin_ring(x, n):
    roof, base = interp(ROOF, x), 0.84
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        c, s = math.cos(a), math.sin(a)
        sy = math.copysign(abs(c) ** 0.45, c)
        sz = math.copysign(abs(s) ** 0.45, s)
        z = lerp(base, roof, (sz + 1) / 2)
        hw = lerp(0.86, 0.6, sstep((z - base) / max(0.01, roof - base)))
        pts.append((x, hw * sy, z))
    return pts


def stations(a, b, n):
    return [lerp(a, b, 0.5 - 0.5 * math.cos(math.pi * i / n)) for i in range(n + 1)]


def loft(name, xs, fn, n):
    bm = bmesh.new()
    rings = [[bm.verts.new(p) for p in fn(x, n)] for x in xs]
    for r0, r1 in zip(rings, rings[1:]):
        for i in range(n):
            j = (i + 1) % n
            bm.faces.new((r0[i], r0[j], r1[j], r1[i]))
    for ring, flip in ((rings[0], True), (rings[-1], False)):
        cv = bm.verts.new(sum((v.co for v in ring), Vector()) / len(ring))
        for i in range(n):
            j = (i + 1) % n
            bm.faces.new((ring[j], ring[i], cv) if flip else (ring[i], ring[j], cv))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    return ob


body = loft("Body", stations(-2.28, 2.28, 96), body_ring, 72)
cabin = loft("Cabin", stations(-2.02, 0.62, 56), cabin_ring, 56)

# ---------- wheel arches ----------
WHEELS = {"FL": (1.42, 1), "FR": (1.42, -1), "RL": (-1.38, 1), "RR": (-1.38, -1)}
R = 0.345
TRACK = 0.835


def apply_bool(target, cutter, op="DIFFERENCE"):
    m = target.modifiers.new("b", "BOOLEAN")
    m.object = cutter
    m.operation = op
    m.solver = "EXACT"
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(cutter)


for wx in (1.42, -1.38):
    bpy.ops.mesh.primitive_cylinder_add(vertices=72, radius=0.405, depth=2.6,
                                        location=(wx, 0, R + 0.015), rotation=(math.pi / 2, 0, 0))
    apply_bool(body, bpy.context.active_object)

# side vent behind the front wheel + door seams as shallow cuts
for s in (1, -1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.88, s * 0.97, 0.5))
    v = bpy.context.active_object
    v.scale = (0.32, 0.12, 0.05)
    v.rotation_euler = (0, -0.18, 0)
    apply_bool(body, v)


def box(name, loc, scale, rot=(0, 0, 0), bevel=0.0, seg=3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = scale
    o.name = name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        m = o.modifiers.new("bv", "BEVEL")
        m.width = bevel
        m.segments = seg
        bpy.ops.object.modifier_apply(modifier="bv")
    return o


def cyl(name, loc, r, depth, rot=(math.pi / 2, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    return o


# ---------- materials ----------
def mat(name, color, metal=0.0, rough=0.5, emit=None, strength=4.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m


M = {
    "Paint": mat("Paint", (0.01, 0.011, 0.013), 0.5, 0.18),
    "Glass": mat("Glass", (0.01, 0.012, 0.016), 0.0, 0.04),
    "Tyre": mat("Tyre", (0.018, 0.018, 0.018), 0.0, 0.85),
    "Rim": mat("Rim", (0.03, 0.032, 0.035), 0.9, 0.3),
    "Accent": mat("Accent", (1.0, 0.16, 0.02), 0.2, 0.3),
    "Trim": mat("Trim", (0.006, 0.006, 0.007), 0.2, 0.5),
    "Metal": mat("Metal", (0.6, 0.61, 0.63), 1.0, 0.28),
    "HeadLight": mat("HeadLight", (0.9, 0.95, 1.0), 0, 0.1, emit=(0.9, 0.95, 1.0)),
    "TailLight": mat("TailLight", (0.8, 0.02, 0.01), 0, 0.2, emit=(1.0, 0.04, 0.02)),
}


def assign(o, key):
    o.data.materials.clear()
    o.data.materials.append(M[key])
    return o


assign(body, "Paint")
cabin.data.materials.clear()
for k in ("Glass", "Paint", "Trim"):
    cabin.data.materials.append(M[k])
bm = bmesh.new()
bm.from_mesh(cabin.data)
bm.normal_update()
for f in bm.faces:
    c = f.calc_center_median()
    r = interp(ROOF, c.x)
    if f.normal.z > 0.6 and c.z > r - 0.05 and -0.95 < c.x < 0.22:
        f.material_index = 1  # painted roof panel
    elif c.z < 0.9:
        f.material_index = 1  # belt line in body colour
    elif abs(f.normal.x) < 0.45 and (abs(c.x - 0.42) < 0.035 or abs(c.x + 1.5) < 0.04):
        f.material_index = 2  # A / C pillar blackout
bm.to_mesh(cabin.data)
bm.free()

static = []  # (object, material) pairs that don't spin


def add(o, key):
    assign(o, key)
    static.append(o)
    return o


# lights: slim swept LED blades + DRL
for s in (1, -1):
    add(box("Head", (2.07, s * 0.6, 0.6), (0.2, 0.26, 0.03), rot=(0, -0.42, s * 0.22), bevel=0.01), "HeadLight")
    add(box("DRL", (2.15, s * 0.5, 0.5), (0.1, 0.22, 0.012), rot=(0, -0.55, s * 0.3), bevel=0.004), "HeadLight")
add(box("Tail", (-2.215, 0, 0.84), (0.04, 1.52, 0.035), rot=(0, 0.42, 0), bevel=0.01), "TailLight")
for s in (1, -1):
    add(box("TailEnd", (-2.14, s * 0.79, 0.8), (0.12, 0.06, 0.11), rot=(0, 0.3, s * 0.35), bevel=0.012), "TailLight")

# front: wide intake, splitter, brake ducts
add(box("Intake", (2.2, 0, 0.33), (0.1, 1.15, 0.17), rot=(0, 0.42, 0), bevel=0.03), "Trim")
for s in (1, -1):
    add(box("Duct", (2.08, s * 0.72, 0.28), (0.1, 0.26, 0.11), rot=(0, 0.35, s * 0.3), bevel=0.02), "Trim")
add(box("Splitter", (2.1, 0, 0.13), (0.24, 1.4, 0.022), bevel=0.008), "Trim")
add(box("SplitterLip", (2.22, 0, 0.13), (0.025, 1.3, 0.016), bevel=0.006), "Accent")

# sides: skirts with accent edge, mirrors, handles
for s in (1, -1):
    add(box("Skirt", (0.02, s * 0.9, 0.17), (2.25, 0.06, 0.08), bevel=0.015), "Trim")
    add(box("SkirtLip", (0.02, s * 0.93, 0.13), (2.1, 0.03, 0.012), bevel=0.004), "Accent")
    add(box("MirrorStalk", (0.52, s * 0.88, 0.94), (0.06, 0.12, 0.025), rot=(s * 0.35, 0, 0)), "Trim")
    add(box("Mirror", (0.5, s * 0.95, 0.975), (0.17, 0.1, 0.08), rot=(0, 0, s * 0.2), bevel=0.03), "Paint")
    add(box("Handle", (-0.42, s * 0.935, 0.78), (0.14, 0.012, 0.022), bevel=0.006), "Trim")
    add(box("Vent", (0.88, s * 0.955, 0.5), (0.3, 0.02, 0.04), rot=(0, -0.18, 0)), "Trim")

# rear: diffuser with fins, quad exhausts, deck lid lip
add(box("Diffuser", (-2.12, 0, 0.19), (0.16, 1.2, 0.1), rot=(0, -0.4, 0), bevel=0.02), "Trim")
for k in range(-2, 3):
    add(box("Fin", (-2.15, k * 0.22, 0.19), (0.14, 0.012, 0.08), rot=(0, -0.4, 0)), "Trim")
for s in (1, -1):
    for dy in (0.42, 0.58):
        add(cyl("Exhaust", (-2.2, s * dy, 0.24), 0.042, 0.14, rot=(0, math.pi / 2, 0), verts=32), "Metal")

# wing: two stalks + airfoil with accent end plates
for s in (1, -1):
    add(box("WingStalk", (-1.95, s * 0.5, 1.03), (0.12, 0.025, 0.16), rot=(0, 0.25, 0), bevel=0.006), "Trim")
add(box("Wing", (-2.0, 0, 1.12), (0.28, 1.62, 0.03), rot=(0, 0.12, 0), bevel=0.012), "Trim")
for s in (1, -1):
    add(box("Endplate", (-2.0, s * 0.82, 1.1), (0.32, 0.015, 0.11), bevel=0.008), "Accent")

# inner arch liners
for wx in (1.42, -1.38):
    o = cyl("Liner", (wx, 0, R + 0.015), 0.4, 1.7, verts=72)
    bm = bmesh.new()
    bm.from_mesh(o.data)
    for f in list(bm.faces):
        if f.calc_center_median().z < -0.02 or len(f.verts) > 4:
            bm.faces.remove(f)
    bm.to_mesh(o.data)
    bm.free()
    add(o, "Trim")


# ---------- wheels (spin) + brakes (static) ----------
def wheel(tag, x, side):
    y = side * TRACK
    rear = x < 0
    width = 1.6 if rear else 1.4
    parts = []
    bpy.ops.mesh.primitive_torus_add(major_radius=0.27, minor_radius=0.078, major_segments=72,
                                     minor_segments=18, location=(x, y, R), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.active_object
    t.scale = (1, 1, width)
    parts.append(assign(t, "Tyre"))
    # rim barrel + face
    parts.append(assign(cyl("Barrel", (x, y, R), 0.245, 0.2, verts=64), "Rim"))
    # orange lip ring at the outer edge
    bpy.ops.mesh.primitive_torus_add(major_radius=0.248, minor_radius=0.012, major_segments=72,
                                     minor_segments=10, location=(x, y + side * 0.105, R),
                                     rotation=(math.pi / 2, 0, 0))
    parts.append(assign(bpy.context.active_object, "Accent"))
    # 10 split spokes
    for k in range(10):
        a = k * 2 * math.pi / 10
        sp = box("Spoke", (x, y + side * 0.1, R), (0.026, 0.02, 0.44))
        sp.rotation_euler = (0, a, 0)
        bpy.ops.object.transform_apply(rotation=True)
        parts.append(assign(sp, "Rim"))
    parts.append(assign(cyl("Hub", (x, y + side * 0.112, R), 0.055, 0.03, verts=6), "Metal"))
    for p in parts:
        bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.join()
    w = bpy.context.active_object
    w.name = f"Wheel_{tag}"
    scene.cursor.location = (x, y, R)
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    # static brakes: drilled disc + calliper
    add(cyl("Disc", (x, y - side * 0.01, R), 0.205, 0.028, verts=48), "Metal")
    ang = 0.6 if not rear else 2.5
    cal = box("Caliper", (x + 0.17 * math.cos(ang), y + side * 0.04, R + 0.17 * math.sin(ang)),
              (0.1, 0.05, 0.14), rot=(0, -ang, 0), bevel=0.015)
    add(cal, "Accent")
    return w


wheels = [wheel(tag, x, s) for tag, (x, s) in WHEELS.items()]

# ---------- smooth + join statics by material ----------
for o in list(col.objects):
    if o.type != "MESH":
        continue
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    if not o.name.startswith("Wheel_"):
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
    except Exception:
        bpy.ops.object.shade_smooth()

groups = {}
for o in list(col.objects):
    if o.type != "MESH" or o.name.startswith("Wheel_") or o in (cabin,):
        continue
    groups.setdefault(o.data.materials[0].name, []).append(o)
for name, obs in groups.items():
    bpy.ops.object.select_all(action="DESELECT")
    for o in obs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    if len(obs) > 1:
        bpy.ops.object.join()
    bpy.context.active_object.name = name

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True)

# ---------- preview / logo render ----------
# stripes + sill line for the still renders (three.js draws its own in a shader)
p = M["Paint"]
nt = p.node_tree
geo = nt.nodes.new("ShaderNodeNewGeometry")
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(geo.outputs["Position"], sep.inputs[0])
ab = nt.nodes.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"
nt.links.new(sep.outputs["Y"], ab.inputs[0])
def band(lo, hi):
    g1 = nt.nodes.new("ShaderNodeMath"); g1.operation = "GREATER_THAN"; g1.inputs[1].default_value = lo
    l1 = nt.nodes.new("ShaderNodeMath"); l1.operation = "LESS_THAN"; l1.inputs[1].default_value = hi
    nt.links.new(ab.outputs[0], g1.inputs[0]); nt.links.new(ab.outputs[0], l1.inputs[0])
    m = nt.nodes.new("ShaderNodeMath"); m.operation = "MULTIPLY"
    nt.links.new(g1.outputs[0], m.inputs[0]); nt.links.new(l1.outputs[0], m.inputs[1])
    return m
outer = band(0.03, 0.19)
up = nt.nodes.new("ShaderNodeMath"); up.operation = "GREATER_THAN"; up.inputs[1].default_value = 0.33
nt.links.new(sep.outputs["Z"], up.inputs[0])
stripe = nt.nodes.new("ShaderNodeMath"); stripe.operation = "MULTIPLY"
nt.links.new(outer.outputs[0], stripe.inputs[0]); nt.links.new(up.outputs[0], stripe.inputs[1])
mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
mix.inputs[6].default_value = (0.01, 0.011, 0.013, 1)
mix.inputs[7].default_value = (1.0, 0.16, 0.02, 1)
nt.links.new(stripe.outputs[0], mix.inputs[0])
nt.links.new(mix.outputs[2], nt.nodes["Principled BSDF"].inputs["Base Color"])
bsdf = nt.nodes["Principled BSDF"]
bsdf.inputs["Coat Weight"].default_value = 1.0
bsdf.inputs["Coat Roughness"].default_value = 0.03

world = bpy.data.worlds.new("w")
scene.world = world
world.color = (0.0, 0.0, 0.0)


def area(loc, rot, size, energy, color=(1, 1, 1)):
    bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
    l = bpy.context.active_object
    l.data.energy = energy
    l.data.size = size[0]
    l.data.shape = "RECTANGLE"
    l.data.size_y = size[1]
    l.data.color = color
    return l


area((0, 0, 5.5), (0, 0, 0), (7, 3), 1600)
area((4.5, -4.5, 2.2), (1.2, 0, 0.78), (0.6, 6), 900)
area((-5, -3, 2.0), (1.25, 0, -0.95), (0.6, 6), 600)
area((-1, 5, 2.5), (-1.1, 0, 0), (6, 0.6), 700, (1.0, 0.55, 0.25))

floor_m = mat("Floor", (0.005, 0.005, 0.006), 0.0, 0.25)
bpy.ops.mesh.primitive_plane_add(size=60)
assign(bpy.context.active_object, "Tyre").data.materials[0] = floor_m

if MODE == "logo":
    # foam bed + soap bubbles around the car
    import random
    random.seed(7)
    foam_m = mat("Foam", (0.95, 0.96, 0.97), 0.0, 0.6)
    bub_m = bpy.data.materials.new("Bubble")
    bub_m.use_nodes = True
    bb = bub_m.node_tree.nodes["Principled BSDF"]
    bb.inputs["Transmission Weight"].default_value = 1.0
    bb.inputs["Roughness"].default_value = 0.0
    bb.inputs["IOR"].default_value = 1.05
    bb.inputs["Base Color"].default_value = (1, 1, 1, 1)
    for i in range(420):
        a = random.random() * 2 * math.pi
        rx, ry = 2.55 + random.random() * 0.5, 1.25 + random.random() * 0.45
        x, y = rx * math.cos(a), ry * math.sin(a)
        r = 0.07 + random.random() * 0.11
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(x, y, r * 0.5), segments=24, ring_count=12)
        o = bpy.context.active_object
        o.scale = (1, 1, 0.75)
        bpy.ops.object.shade_smooth()
        o.data.materials.append(foam_m)
    placed = 0
    while placed < 34:
        x = (random.random() - 0.5) * 6.6
        y = (random.random() - 0.5) * 3.6
        z = 0.4 + random.random() * 1.9
        # keep bubbles off the car itself so it reads cleanly
        if abs(x) < 2.6 and abs(y) < 1.3 and z < 1.6:
            continue
        placed += 1
        r = 0.04 + random.random() ** 2 * 0.22
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(x, y, z), segments=32, ring_count=16)
        o = bpy.context.active_object
        bpy.ops.object.shade_smooth()
        o.data.materials.append(bub_m)
    scene.render.film_transparent = True
    bpy.data.objects.remove(bpy.data.objects["Plane"]) if "Plane" in bpy.data.objects else None

bpy.ops.object.camera_add(location=(6.4, -5.4, 1.7) if MODE != "side" else (0, -12, 0.6))
cam = bpy.context.active_object
cam.data.lens = 50 if MODE != "side" else 85
target = Vector((0.1, 0, 0.55))
cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.camera = cam
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 48 if MODE == "logo" else 24
scene.render.resolution_x = 1600 if MODE == "logo" else 960
scene.render.resolution_y = 1000 if MODE == "logo" else 540
scene.render.filepath = PREVIEW
bpy.ops.render.render(write_still=True)
print("DONE")
