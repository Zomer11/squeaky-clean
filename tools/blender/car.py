"""Stylised sedan for Auto Care Detailing hero. Run: python3 car.py out.glb preview.png"""
import bpy, bmesh, math, sys
from mathutils import Vector

OUT = sys.argv[-2]
PREVIEW = sys.argv[-1]

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

L = 4.62          # length
HALF = L / 2


def smooth(a, b, t):
    t = max(0.0, min(1.0, (t - a) / (b - a)))
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def interp(points, x):
    """piecewise smooth interpolation through (x, v) pairs sorted by x"""
    if x <= points[0][0]:
        return points[0][1]
    for (x0, v0), (x1, v1) in zip(points, points[1:]):
        if x <= x1:
            t = (x - x0) / (x1 - x0)
            t = t * t * (3 - 2 * t)
            return lerp(v0, v1, t)
    return points[-1][1]


# ---------- profiles (x: rear -2.31 .. front +2.31) ----------
BODY_TOP = [(-2.31, 0.80), (-2.12, 0.93), (-1.75, 0.985), (-1.45, 0.975),
            (0.95, 0.90), (1.55, 0.83), (2.05, 0.74), (2.31, 0.58)]
BODY_BOT = [(-2.31, 0.36), (-2.0, 0.22), (-1.6, 0.19), (1.7, 0.19),
            (2.1, 0.24), (2.31, 0.34)]
HALF_W = [(-2.31, 0.80), (-2.0, 0.885), (-1.2, 0.91), (0.9, 0.91),
          (1.8, 0.89), (2.31, 0.80)]
ROOF = [(-1.62, 0.97), (-1.05, 1.30), (-0.62, 1.425), (0.05, 1.44),
        (0.38, 1.415), (1.02, 0.91)]


def section(x):
    top = interp(BODY_TOP, x)
    bot = interp(BODY_BOT, x)
    w = interp(HALF_W, x)
    # round the nose / tail in plan view
    end = abs(x) - 1.95
    if end > 0:
        k = end / (HALF - 1.95)
        w *= math.sqrt(max(0.0, 1 - 0.55 * k ** 2.2))
    return top, bot, w


def loft(name, xs, ring_fn, n_ring, cap=True):
    bm = bmesh.new()
    rings = []
    for x in xs:
        ring = [bm.verts.new(p) for p in ring_fn(x, n_ring)]
        rings.append(ring)
    for r0, r1 in zip(rings, rings[1:]):
        for i in range(n_ring):
            j = (i + 1) % n_ring
            bm.faces.new((r0[i], r0[j], r1[j], r1[i]))
    if cap:
        for ring, flip in ((rings[0], True), (rings[-1], False)):
            c = sum((v.co for v in ring), Vector()) / len(ring)
            cv = bm.verts.new(c)
            for i in range(n_ring):
                j = (i + 1) % n_ring
                f = (ring[j], ring[i], cv) if flip else (ring[i], ring[j], cv)
                bm.faces.new(f)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    return ob


def body_ring(x, n):
    top, bot, w = section(x)
    mid = (top + bot) / 2
    h = (top - bot) / 2
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        c, s = math.cos(a), math.sin(a)
        e = 0.34 if s > 0 else 0.30  # squarer shoulders, softer sill
        y = w * math.copysign(abs(c) ** e, c)
        z = mid + h * math.copysign(abs(s) ** e, s)
        # tuck the sides in under the shoulder line (tumble-under)
        if s < 0:
            y *= 1 - 0.07 * abs(s) ** 2
        pts.append((x, y, z))
    return pts


def cabin_ring(x, n):
    roof = interp(ROOF, x)
    base = 0.86
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        c, s = math.cos(a), math.sin(a)
        zt = (s + 1) / 2  # 0 bottom .. 1 top
        e = 0.42
        sy = math.copysign(abs(c) ** e, c)
        sz = math.copysign(abs(s) ** e, s)
        z = lerp(base, roof, (sz + 1) / 2)
        hw = lerp(0.86, 0.66, smooth(0, 1, (z - base) / max(0.01, roof - base)))
        pts.append((x, hw * sy, z))
    return pts


def stations(a, b, n):
    # denser near the ends for clean noses
    out = []
    for i in range(n + 1):
        t = i / n
        t = 0.5 - 0.5 * math.cos(math.pi * t)
        out.append(lerp(a, b, t))
    return out


body = loft("Body", stations(-2.31, 2.31, 72), body_ring, 52)
cabin = loft("Cabin", stations(-1.62, 1.02, 40), cabin_ring, 40)

# ---------- wheel arches (boolean) ----------
WHEEL_X = (1.40, -1.40)
WHEEL_R = 0.345
WHEEL_Y = 0.80
for wx in WHEEL_X:
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.415, depth=2.4,
                                        location=(wx, 0, WHEEL_R + 0.02),
                                        rotation=(math.pi / 2, 0, 0))
    cutter = bpy.context.active_object
    # keep the middle (chassis) intact: cutter only near the sides via two booleans
    cutter.scale = (1, 1, 1)
    mod = body.modifiers.new("arch", "BOOLEAN")
    mod.object = cutter
    mod.operation = "DIFFERENCE"
    mod.solver = "EXACT"
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter)

# inner arch liners (dark) so the cut doesn't look hollow
def arch_liner(wx):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.41, depth=1.55,
                                        location=(wx, 0, WHEEL_R + 0.02),
                                        rotation=(math.pi / 2, 0, 0))
    ob = bpy.context.active_object
    ob.name = "ArchLiner"
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    # delete lower half + caps -> half tube
    for f in list(bm.faces):
        c = f.calc_center_median()
        if c.z < 0.0 - 0.02 or len(f.verts) > 4:
            bm.faces.remove(f)
    bm.to_mesh(ob.data)
    bm.free()
    return ob

liners = [arch_liner(wx) for wx in WHEEL_X]

# ---------- wheels ----------
def wheel(x, side):
    y = side * WHEEL_Y
    bpy.ops.mesh.primitive_torus_add(major_radius=0.27, minor_radius=0.085,
                                     major_segments=64, minor_segments=20,
                                     location=(x, y, WHEEL_R),
                                     rotation=(math.pi / 2, 0, 0))
    tyre = bpy.context.active_object
    tyre.scale = (1, 1, 1.45)  # wider tread (local z = axle after rotation)
    tyre.name = "Tyre"
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.245, depth=0.2,
                                        location=(x, y, WHEEL_R),
                                        rotation=(math.pi / 2, 0, 0))
    rim = bpy.context.active_object
    rim.name = "Rim"
    spokes = []
    for k in range(5):
        a = k * 2 * math.pi / 5
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y + side * 0.105, WHEEL_R))
        s = bpy.context.active_object
        s.scale = (0.05, 0.03, 0.44)
        s.rotation_euler = (0, a, 0)
        spokes.append(s)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.06, depth=0.05,
                                        location=(x, y + side * 0.115, WHEEL_R),
                                        rotation=(math.pi / 2, 0, 0))
    hub = bpy.context.active_object
    for o in spokes + [hub]:
        o.select_set(True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in spokes + [hub]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = spokes[0]
    bpy.ops.object.join()
    spk = bpy.context.active_object
    spk.name = "Spokes"
    # dark brake disc behind spokes
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.2, depth=0.03,
                                        location=(x, y - side * 0.02, WHEEL_R),
                                        rotation=(math.pi / 2, 0, 0))
    disc = bpy.context.active_object
    disc.name = "Disc"
    return tyre, rim, spk, disc

wheels = [wheel(x, s) for x in WHEEL_X for s in (1, -1)]

# ---------- details ----------
def box(name, loc, scale, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = scale
    o.name = name
    if bevel:
        bpy.ops.object.transform_apply(scale=True)
        m = o.modifiers.new("b", "BEVEL")
        m.width = bevel
        m.segments = 3
        bpy.ops.object.modifier_apply(modifier="b")
    return o

# headlights: slim wrap strips
heads = [box("HeadLight", (2.16, s * 0.58, 0.665), (0.16, 0.3, 0.035),
             rot=(0, -0.42, s * 0.3), bevel=0.012) for s in (1, -1)]
# full-width tail light bar
tail = box("TailLight", (-2.215, 0, 0.865), (0.05, 1.42, 0.05), rot=(0, 0.25, 0), bevel=0.01)
# grille
grille = box("Grille", (2.27, 0, 0.42), (0.06, 1.05, 0.15), rot=(0, 0.35, 0), bevel=0.02)
# mirrors
mirrors = [box("Mirror", (0.86, s * 0.93, 0.99), (0.15, 0.13, 0.085), rot=(0, 0, s * 0.25), bevel=0.03) for s in (1, -1)]
# sill trim
sills = [box("Sill", (0, s * 0.875, 0.23), (2.0, 0.04, 0.05), bevel=0.012) for s in (1, -1)]
# B-pillar trims on glass
pillars = [] and [box("Pillar", (-0.18, s * 0.79, 1.15), (0.09, 0.04, 0.5), rot=(s * -0.18, 0, 0), bevel=0.01) for s in (1, -1)]
# roof panel (paint) over the glass so the car reads as a car, not a bubble
def roof_ring(x, n):
    roof = interp(ROOF, x) + 0.012
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        c, s = math.cos(a), math.sin(a)
        y = 0.655 * math.copysign(abs(c) ** 0.3, c)
        z = roof - 0.04 + 0.04 * math.copysign(abs(s) ** 0.3, s)
        pts.append((x, y, z))
    return pts


# ---------- materials (names are read by three.js) ----------
def mat(name, color, metal=0.0, rough=0.5, emit=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = 4.0
    return m

M = {
    "Paint": mat("Paint", (0.012, 0.014, 0.018), 0.6, 0.25),
    "Glass": mat("Glass", (0.01, 0.012, 0.016), 0.0, 0.05),
    "Tyre": mat("Tyre", (0.02, 0.02, 0.02), 0.0, 0.85),
    "Rim": mat("Rim", (0.55, 0.56, 0.58), 1.0, 0.25),
    "Trim": mat("Trim", (0.008, 0.008, 0.01), 0.2, 0.5),
    "HeadLight": mat("HeadLight", (0.9, 0.95, 1.0), 0, 0.1, emit=(0.9, 0.95, 1.0)),
    "TailLight": mat("TailLight", (0.8, 0.02, 0.01), 0, 0.2, emit=(1.0, 0.05, 0.02)),
}

def assign(o, key):
    o.data.materials.clear()
    o.data.materials.append(M[key])

assign(body, "Paint")
cabin.data.materials.clear(); cabin.data.materials.append(M["Glass"]); cabin.data.materials.append(M["Paint"]); cabin.data.materials.append(M["Trim"])
bm = bmesh.new(); bm.from_mesh(cabin.data); bm.normal_update()
for f in bm.faces:
    c = f.calc_center_median(); r = interp(ROOF, c.x)
    if f.normal.z > 0.55 and c.z > r - 0.07 and -0.72 < c.x < 0.32:
        f.material_index = 1
    elif c.z < 0.93:
        f.material_index = 1
    elif abs(f.normal.x) < 0.5 and abs(c.x + 0.2) < 0.05:
        f.material_index = 2
bm.to_mesh(cabin.data); bm.free()
for o in liners: assign(o, "Trim")
for t, r, s, d in wheels:
    assign(t, "Tyre"); assign(r, "Rim"); assign(s, "Rim"); assign(d, "Trim")
for o in heads: assign(o, "HeadLight")
assign(tail, "TailLight"); assign(grille, "Trim")
for o in mirrors: assign(o, "Paint")
for o in sills + pillars: assign(o, "Trim")

# smooth shading
for o in scene.objects:
    if o.type == "MESH":
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        try:
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(50))
        except Exception:
            bpy.ops.object.shade_smooth()
        o.select_set(False)

# join everything by material so the glb has one mesh per material
groups = {}
for o in list(scene.objects):
    if o.type == "MESH":
        groups.setdefault("Cabin" if o.name.startswith("Cabin") else o.data.materials[0].name, []).append(o)
for name, obs in groups.items():
    bpy.ops.object.select_all(action="DESELECT")
    for o in obs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    if len(obs) > 1:
        bpy.ops.object.join()
    bpy.context.active_object.name = name

# front/rear wheels need to spin separately in three.js -> keep wheels as one mesh is fine (we spin per-wheel via pivot in code? no: keep static)

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True,
                          export_yup=True, export_draco_mesh_compression_enable=False)

# ---------- preview render ----------
world = bpy.data.worlds.new("w"); scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.35, 0.37, 0.4, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.8
bpy.ops.object.light_add(type="AREA", location=(0, 0, 6)); l = bpy.context.active_object
l.data.energy = 2500; l.data.size = 6
bpy.ops.object.light_add(type="AREA", location=(5, -5, 3)); l2 = bpy.context.active_object
l2.data.energy = 1500; l2.data.size = 4; l2.rotation_euler = (1.1, 0, 0.8)
bpy.ops.mesh.primitive_plane_add(size=40)
M["Paint"].node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.05, 0.18, 0.45, 1)
bpy.ops.object.camera_add(location=(6.2, -6.4, 2.4))
cam = bpy.context.active_object
cam.data.lens = 55
d = Vector((0, 0, 0.75)) - cam.location
cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
scene.camera = cam
scene.render.engine = "CYCLES"
scene.cycles.samples = 24
scene.cycles.device = "CPU"
scene.render.resolution_x = 960
scene.render.resolution_y = 540
scene.render.filepath = PREVIEW
bpy.ops.render.render(write_still=True)
print("DONE")
