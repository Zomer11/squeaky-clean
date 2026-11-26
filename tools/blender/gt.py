"""Auto Care Detailing — original GT coupe, built for realism.

  python3 tools/blender/gt.py concept  out_prefix      -> photoreal stills (Cycles)
  python3 tools/blender/gt.py export   out.glb         -> web model (material names read by three.js)

Original design: front-engine GT proportions, no third-party badge, grille or lights.
"""
import bpy, bmesh, math, sys, random
from mathutils import Vector

ARGS = sys.argv[1:]
MODE, OUT = ARGS[0], ARGS[1]
random.seed(3)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection


def lerp(a, b, t):
    return a + (b - a) * t


def sstep(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def bump(x, c, w):
    d = (x - c) / w
    return math.exp(-d * d)


def interp(pts, x):
    if x <= pts[0][0]:
        return pts[0][1]
    for (x0, v0), (x1, v1) in zip(pts, pts[1:]):
        if x <= x1:
            return lerp(v0, v1, sstep((x - x0) / (x1 - x0)))
    return pts[-1][1]


L, HALF = 4.6, 2.3
FX, RX = 1.45, -1.33  # axle positions
R = 0.35  # tyre radius (21" wheel, low profile)

# centre-line top, underside, half width
TOP = [(-2.3, 0.7), (-2.24, 0.86), (-2.12, 0.95), (-1.9, 0.96), (-1.45, 0.93), (0.55, 0.86),
       (1.2, 0.79), (1.75, 0.7), (2.1, 0.6), (2.3, 0.44)]
BOT = [(-2.3, 0.3), (-2.1, 0.17), (-1.8, 0.13), (1.8, 0.13), (2.15, 0.16), (2.3, 0.24)]
WID = [(-2.3, 0.78), (-2.08, 0.93), (-1.5, 0.985), (-0.9, 0.95), (-0.2, 0.92), (0.7, 0.925),
       (1.45, 0.96), (1.95, 0.92), (2.3, 0.76)]
ROOF = [(-2.08, 0.95), (-1.7, 1.03), (-1.15, 1.19), (-0.6, 1.27), (-0.05, 1.265), (0.3, 1.2),
        (0.66, 0.89)]


def body_ring(x, n):
    top, bot, w = interp(TOP, x), interp(BOT, x), interp(WID, x)
    end = abs(x) - 2.0
    if end > 0:
        k = end / (HALF - 2.0)
        w *= math.sqrt(max(0.0, 1 - 0.45 * k ** 2.2))
    # sculpted fender peaks over each axle, hood sits in a shallow valley
    peak = 0.075 * bump(x, FX, 0.5) + 0.06 * bump(x, RX - 0.05, 0.55)
    mid, h = (top + bot) / 2, (top - bot) / 2
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        c, s = math.cos(a), math.sin(a)
        e = 0.28 if s > 0 else 0.24
        y = w * math.copysign(abs(c) ** e, c)
        z = mid + h * math.copysign(abs(s) ** e, s)
        if s > 0:
            ac = abs(c)
            z += peak * sstep((ac - 0.25) / 0.6) * sstep((s - 0.1) / 0.5)
            # crisp shoulder line
            if 0.15 < s < 0.55:
                y *= 1 + 0.012 * math.sin((s - 0.15) / 0.4 * math.pi)
        else:
            y *= 1 - 0.07 * abs(s) ** 2
        pts.append((x, y, z))
    return pts


def cabin_ring(x, n):
    roof, base = interp(ROOF, x), 0.83
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        c, s = math.cos(a), math.sin(a)
        sy = math.copysign(abs(c) ** 0.42, c)
        sz = math.copysign(abs(s) ** 0.42, s)
        z = lerp(base, roof, (sz + 1) / 2)
        hw = lerp(0.87, 0.6, sstep((z - base) / max(0.01, roof - base)))
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


HI = MODE == "concept"
body = loft("Body", stations(-2.3, 2.3, 140 if HI else 90), body_ring, 112 if HI else 72)
cabin = loft("Cabin", stations(-2.08, 0.66, 70 if HI else 48), cabin_ring, 80 if HI else 56)


def cut(target, cutter):
    m = target.modifiers.new("b", "BOOLEAN")
    m.object = cutter
    m.operation = "DIFFERENCE"
    m.solver = "EXACT"
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(cutter)


def cutter_box(loc, scale, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = scale
    return o


# wheel arches
for wx in (FX, RX):
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=0.41, depth=2.6,
                                        location=(wx, 0, R + 0.02), rotation=(math.pi / 2, 0, 0))
    cut(body, bpy.context.active_object)

# panel gaps (4 mm slots): bonnet, doors, boot lid
G = 0.004
for s in (1, -1):
    cut(body, cutter_box((1.45, s * 0.63, 0.8), (1.6, G, 0.5)))            # bonnet side shut lines
    cut(body, cutter_box((0.62, s * 0.98, 0.56), (G, 0.32, 0.62), (0, 0.1, 0)))   # door front edge
    cut(body, cutter_box((-0.86, s * 0.98, 0.56), (G, 0.32, 0.62), (0, -0.22, 0)))  # door rear edge
    cut(body, cutter_box((-1.95, s * 0.6, 0.9), (0.5, G, 0.3)))            # boot lid sides
cut(body, cutter_box((2.15, 0, 0.62), (G, 1.3, 0.4), (0, -0.6, 0)))         # bonnet front edge
cut(body, cutter_box((-2.2, 0, 0.88), (G, 1.2, 0.3), (0, 0.5, 0)))          # boot lid rear edge

# recesses: lower intake, headlight pockets, side vents, taillight channel
cut(body, cutter_box((2.33, 0, 0.31), (0.14, 0.95, 0.12)))
for s in (1, -1):
    cut(body, cutter_box((2.13, s * 0.62, 0.6), (0.2, 0.36, 0.06), (0, -0.38, s * 0.26)))
    cut(body, cutter_box((0.95, s * 0.98, 0.47), (0.36, 0.09, 0.13), (0, -0.15, 0)))
cut(body, cutter_box((-2.27, 0, 0.83), (0.07, 1.6, 0.045), (0, 0.45, 0)))
cut(body, cutter_box((-2.28, 0, 0.22), (0.14, 1.4, 0.14)))

# ---------- materials ----------
nodes_cache = {}


def principled(name, base, metal=0.0, rough=0.5, coat=0.0, coat_rough=0.03, trans=0.0, ior=1.45,
               emit=None, emit_k=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = coat_rough
    b.inputs["Transmission Weight"].default_value = trans
    b.inputs["IOR"].default_value = ior
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = emit_k
    return m


def add_bump(m, scale, strength, kind="noise", detail=2.0):
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    if kind == "noise":
        tx = nt.nodes.new("ShaderNodeTexNoise")
        tx.inputs["Scale"].default_value = scale
        tx.inputs["Detail"].default_value = detail
        nt.links.new(tc.outputs["Object"], tx.inputs["Vector"])
        out = tx.outputs["Fac"]
    elif kind == "voronoi":
        tx = nt.nodes.new("ShaderNodeTexVoronoi")
        tx.inputs["Scale"].default_value = scale
        nt.links.new(tc.outputs["Object"], tx.inputs["Vector"])
        out = tx.outputs["Distance"]
    else:  # wave rings (brushed / tread)
        tx = nt.nodes.new("ShaderNodeTexWave")
        tx.inputs["Scale"].default_value = scale
        tx.wave_type = "RINGS" if kind == "rings" else "BANDS"
        nt.links.new(tc.outputs["Object"], tx.inputs["Vector"])
        out = tx.outputs["Fac"]
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = strength
    nt.links.new(out, bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


M = {
    "Paint": add_bump(principled("Paint", (0.028, 0.04, 0.066), 0.55, 0.42, coat=0.35, coat_rough=0.32),
                      2400, 0.02, "voronoi"),
    "Gloss": principled("Gloss", (0.004, 0.004, 0.005), 0.2, 0.08, coat=1.0, coat_rough=0.02),
    "Glass": principled("Glass", (0.6, 0.62, 0.64), 0.0, 0.0, trans=1.0, ior=1.5),
    "Tint": principled("Tint", (0.006, 0.0065, 0.008), 0.0, 0.03, coat=1.0, coat_rough=0.0),
    "Tyre": add_bump(principled("Tyre", (0.025, 0.025, 0.026), 0.0, 0.78), 900, 0.15, "noise"),
    "Rim": add_bump(principled("Rim", (0.06, 0.062, 0.066), 0.95, 0.24, coat=0.6), 600, 0.02, "rings"),
    "RimLip": principled("RimLip", (0.85, 0.86, 0.88), 1.0, 0.12),
    "Accent": principled("Accent", (1.0, 0.18, 0.025), 0.1, 0.32, coat=1.0),
    "Carbon": add_bump(principled("Carbon", (0.012, 0.012, 0.014), 0.3, 0.25, coat=1.0), 260, 0.05, "bands"),
    "Trim": principled("Trim", (0.008, 0.008, 0.009), 0.1, 0.55),
    "Metal": add_bump(principled("Metal", (0.62, 0.63, 0.65), 1.0, 0.3), 300, 0.03, "rings"),
    "Chrome": principled("Chrome", (0.9, 0.9, 0.92), 1.0, 0.04),
    "Leather": add_bump(principled("Leather", (0.03, 0.028, 0.026), 0.0, 0.55), 220, 0.12, "noise"),
    "HeadLight": principled("HeadLight", (0.9, 0.95, 1.0), 0, 0.1, emit=(0.85, 0.92, 1.0), emit_k=12),
    "TailLight": principled("TailLight", (0.5, 0.01, 0.01), 0, 0.15, emit=(1.0, 0.03, 0.02), emit_k=6),
    "Lens": principled("Lens", (0.95, 0.95, 0.95), 0.0, 0.0, trans=1.0, ior=1.5),
    "Grille": add_bump(principled("Grille", (0.01, 0.01, 0.011), 0.4, 0.4), 70, 0.6, "voronoi"),
}


def assign(o, *keys):
    o.data.materials.clear()
    for k in keys:
        o.data.materials.append(M[k])
    return o


def box(name, loc, scale, rot=(0, 0, 0), bevel=0.0, seg=3, key="Trim"):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = scale
    o.name = name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mm = o.modifiers.new("bv", "BEVEL")
        mm.width = bevel
        mm.segments = seg
        bpy.ops.object.modifier_apply(modifier="bv")
    return assign(o, key)


def cyl(name, loc, r, depth, rot=(math.pi / 2, 0, 0), verts=48, key="Trim"):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    return assign(o, key)


def lathe(name, profile, loc, axis_rot=(math.pi / 2, 0, 0), steps=96, key="Tyre"):
    """Revolve a (radius, z) profile around local Z, then orient it as a wheel."""
    bm = bmesh.new()
    rings = []
    for k in range(steps):
        a = 2 * math.pi * k / steps
        rings.append([bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for r, z in profile])
    for k in range(steps):
        r0, r1 = rings[k], rings[(k + 1) % steps]
        for i in range(len(profile) - 1):
            bm.faces.new((r0[i], r0[i + 1], r1[i + 1], r1[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    col.objects.link(o)
    o.location = loc
    o.rotation_euler = axis_rot
    return assign(o, key)


assign(body, "Paint")
# cabin: glass greenhouse with painted roof and blacked-out pillars
assign(cabin, "Tint", "Paint", "Trim")
bm = bmesh.new()
bm.from_mesh(cabin.data)
bm.normal_update()
for f in bm.faces:
    c = f.calc_center_median()
    r = interp(ROOF, c.x)
    if f.normal.z > 0.62 and c.z > r - 0.05 and -0.98 < c.x < 0.2:
        f.material_index = 1
    elif c.z < 0.86:
        f.material_index = 1
    elif c.z < 0.895:
        f.material_index = 2
    elif abs(f.normal.x) < 0.5 and (abs(c.x - 0.42) < 0.04 or abs(c.x + 1.55) < 0.05 or abs(c.x + 0.86) < 0.012):
        f.material_index = 2
bm.to_mesh(cabin.data)
bm.free()

parts = []


def keep(o):
    parts.append(o)
    return o


# --- front: intake mesh, splitter, headlights (housing, projectors, LED blade), fog ducts
keep(box("IntakeMesh", (2.27, 0, 0.31), (0.03, 0.94, 0.11), key="Grille"))
keep(box("Splitter", (2.12, 0, 0.145), (0.2, 1.36, 0.018), bevel=0.006, key="Carbon"))
for s in (1, -1):
    for k, dy in enumerate((0.5, 0.64)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.03, location=(2.09 - k * 0.025, s * dy, 0.59), segments=24, ring_count=12)
        keep(assign(bpy.context.active_object, "Lens"))
        keep(cyl("Reflector", (2.075 - k * 0.025, s * dy, 0.59), 0.034, 0.02, rot=(0, math.pi / 2 - 0.38, 0), key="Chrome"))
    keep(box("LED", (2.13, s * 0.6, 0.575), (0.12, 0.32, 0.008), rot=(0, -0.38, s * 0.26), key="HeadLight"))
# --- sides: carbon sills, mirrors, flush handles, vent fins
for s in (1, -1):
    keep(box("Sill", (0.05, s * 0.9, 0.165), (2.3, 0.07, 0.07), bevel=0.015, key="Carbon"))
    keep(box("MirrorArm", (0.5, s * 0.9, 0.93), (0.06, 0.1, 0.02), rot=(s * 0.3, 0, 0), bevel=0.008, key="Carbon"))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1, location=(0.5, s * 0.95, 0.965), segments=32, ring_count=16)
    mo = bpy.context.active_object
    mo.scale = (1.3, 0.75, 0.62)
    keep(assign(mo, "Carbon"))
    keep(box("Handle", (-0.48, s * 0.947, 0.77), (0.16, 0.006, 0.024), bevel=0.008, key="Gloss"))
    for k in range(4):
        keep(box("VentFin", (0.84 + k * 0.07, s * 0.952, 0.47), (0.03, 0.04, 0.1), rot=(0, -0.15, 0.25 * s), bevel=0.004, key="Gloss"))
# --- rear: light bar, diffuser + fins, quad tailpipes, ducktail lip
keep(box("TailBar", (-2.235, 0, 0.83), (0.03, 1.56, 0.03), rot=(0, 0.45, 0), key="TailLight"))
for s in (1, -1):
    keep(box("TailEnd", (-2.16, s * 0.78, 0.79), (0.1, 0.07, 0.09), rot=(0, 0.3, s * 0.35), bevel=0.012, key="TailLight"))
keep(box("Diffuser", (-2.14, 0, 0.18), (0.16, 1.2, 0.07), rot=(0, -0.3, 0), bevel=0.01, key="Carbon"))
for k in range(-3, 4):
    keep(box("DiffFin", (-2.16, k * 0.16, 0.18), (0.15, 0.008, 0.07), rot=(0, -0.3, 0), key="Carbon"))
for s in (1, -1):
    for dy in (0.42, 0.56):
        keep(cyl("Pipe", (-2.2, s * dy, 0.26), 0.042, 0.14, rot=(0, math.pi / 2, 0), verts=40, key="Metal"))
        keep(cyl("PipeIn", (-2.27, s * dy, 0.26), 0.034, 0.01, rot=(0, math.pi / 2, 0), verts=40, key="Trim"))
keep(box("Ducktail", (-2.16, 0, 0.965), (0.12, 1.4, 0.02), rot=(0, 0.22, 0), bevel=0.01, key="Carbon"))

# --- interior silhouettes behind the glass
for s in (1, -1):
    keep(box("Seat", (-0.55, s * 0.36, 0.72), (0.5, 0.44, 0.16), bevel=0.06, key="Leather"))
    keep(box("SeatBack", (-0.8, s * 0.36, 0.98), (0.12, 0.44, 0.5), rot=(0, 0.25, 0), bevel=0.06, key="Leather"))
keep(box("Dash", (0.32, 0, 0.88), (0.3, 1.5, 0.16), bevel=0.05, key="Leather"))
bpy.ops.mesh.primitive_torus_add(major_radius=0.17, minor_radius=0.02, location=(0.05, 0.36, 0.95), rotation=(0, math.pi / 2 - 0.4, 0))
keep(assign(bpy.context.active_object, "Leather"))

# --- arch liners
for wx in (FX, RX):
    o = cyl("Liner", (wx, 0, R + 0.02), 0.405, 1.72, verts=96)
    bm = bmesh.new()
    bm.from_mesh(o.data)
    for f in list(bm.faces):
        if f.calc_center_median().z < -0.02 or len(f.verts) > 4:
            bm.faces.remove(f)
    bm.to_mesh(o.data)
    bm.free()
    keep(o)


# ---------- wheels: real tyre profile, concave 5-twin-spoke rim, drilled brakes ----------
def tyre_profile(width):
    hw = width / 2
    rim = 0.267
    pts = [(rim, -hw + 0.01), (0.29, -hw - 0.004), (0.32, -hw + 0.004), (0.338, -hw + 0.022)]
    # tread with 4 circumferential grooves
    xs = [-hw + 0.03 + i * (width - 0.06) / 12 for i in range(13)]
    for i, z in enumerate(xs):
        groove = i in (3, 6, 9)
        pts.append((R - (0.008 if groove else 0.0), z))
    pts += [(0.338, hw - 0.022), (0.32, hw - 0.004), (0.29, hw + 0.004), (rim, hw - 0.01)]
    return pts


def rim_barrel(width):
    hw = width / 2
    return [(0.262, -hw + 0.012), (0.27, -hw + 0.01), (0.27, -hw + 0.02), (0.24, -hw + 0.06),
            (0.24, hw - 0.06), (0.262, hw - 0.025), (0.275, hw - 0.012), (0.275, hw - 0.002), (0.262, hw)]


def wheel(tag, x, side):
    rear = x < 0
    width = 0.3 if rear else 0.265
    y = side * (0.84 if rear else 0.83)
    rot = (math.pi / 2, 0, 0) if side < 0 else (-math.pi / 2, 0, 0)  # +local Z points outward
    objs = []
    objs.append(lathe("Tyre", tyre_profile(width), (x, y, R), rot, 120, "Tyre"))
    objs.append(lathe("Barrel", rim_barrel(width), (x, y, R), rot, 120, "Rim"))
    objs.append(lathe("Lip", [(0.262, width / 2 - 0.002), (0.276, width / 2 - 0.006), (0.276, width / 2 - 0.016)],
                      (x, y, R), rot, 120, "RimLip"))
    out = side  # +1 → outward along +y
    face = width / 2 - 0.02
    for k in range(5):
        a = k * 2 * math.pi / 5
        for tw in (-0.11, 0.11):
            aa = a + tw
            # concave: hub sits deeper than the outer end
            r0, r1 = 0.07, 0.25
            z0, z1 = face - 0.05, face - 0.005
            mid = Vector(((r0 + r1) / 2 * math.cos(aa), (r0 + r1) / 2 * math.sin(aa), (z0 + z1) / 2))
            bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
            sp = bpy.context.active_object
            sp.scale = (r1 - r0, 0.024, 0.028)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            mm = sp.modifiers.new("bv", "BEVEL")
            mm.width = 0.006
            mm.segments = 2
            bpy.ops.object.modifier_apply(modifier="bv")
            tilt = math.atan2(z1 - z0, r1 - r0)
            sp.rotation_euler = (0, -tilt, aa)
            sp.location = mid
            objs.append(assign(sp, "Rim"))
            sp["local"] = True
    hub = cyl("Hub", (0, 0, face - 0.045), 0.075, 0.04, rot=(0, 0, 0), verts=40, key="Rim")
    hub["local"] = True
    objs.append(hub)
    cap = cyl("Cap", (0, 0, face - 0.022), 0.032, 0.01, rot=(0, 0, 0), verts=32, key="Chrome")
    cap["local"] = True
    objs.append(cap)
    for k in range(5):
        a = k * 2 * math.pi / 5 + math.pi / 5
        n = cyl("Lug", (0.052 * math.cos(a), 0.052 * math.sin(a), face - 0.022), 0.009, 0.016, rot=(0, 0, 0), verts=6, key="Chrome")
        n["local"] = True
        objs.append(n)
    # move "local" parts (built around origin, +Z outward) into the wheel frame
    from mathutils import Matrix, Euler
    bpy.context.view_layer.update()
    frame = Matrix.Translation((x, y, R)) @ Euler(rot).to_matrix().to_4x4()
    for o in objs:
        if o.get("local"):
            o.matrix_world = frame @ o.matrix_world
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.join()
    w = bpy.context.active_object
    w.name = f"Wheel_{tag}"
    scene.cursor.location = (x, y, R)
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    # brakes (don't spin): disc with drilled holes + calliper
    disc = cyl("Disc", (x, y - side * 0.03, R), 0.2, 0.03, verts=64, key="Metal")
    hub_hole = cyl("h", (x, y - side * 0.03, R), 0.09, 0.1, verts=32)
    cut(disc, hub_hole)
    for k in range(24):
        a = k * 2 * math.pi / 24
        rr = 0.13 + (k % 3) * 0.022
        hole = cyl("h", (x + rr * math.cos(a), y - side * 0.03, R + rr * math.sin(a)), 0.006, 0.1, verts=8)
        cut(disc, hole)
    keep(disc)
    ang = 0.75 if not rear else 2.4
    cal = box("Caliper", (x + 0.165 * math.cos(ang), y - side * 0.005, R + 0.165 * math.sin(ang)),
              (0.11, 0.06, 0.16), rot=(0, -ang, 0), bevel=0.02, key="Accent")
    keep(cal)
    return w


wheels = [wheel(t, x, s) for t, (x, s) in {"FL": (FX, 1), "FR": (FX, -1), "RL": (RX, 1), "RR": (RX, -1)}.items()]

for o in list(col.objects):
    if o.type == "MESH":
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        try:
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
        except Exception:
            bpy.ops.object.shade_smooth()

if MODE == "export":
    groups = {}
    for o in list(col.objects):
        if o.type != "MESH" or o.name.startswith("Wheel_") or o is cabin:
            continue
        groups.setdefault(o.data.materials[0].name, []).append(o)
    for name, obs in groups.items():
        bpy.ops.object.select_all(action="DESELECT")
        for o in obs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = obs[0]
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        if len(obs) > 1:
            bpy.ops.object.join()
        bpy.context.active_object.name = name
    bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True)
    print("DONE")
    sys.exit(0)

# ---------- concept render: late-afternoon driveway ----------
world = bpy.data.worlds.new("w")
scene.world = world
world.use_nodes = True
wn = world.node_tree
sky = wn.nodes.new("ShaderNodeTexSky")
try:
    sky.sky_type = "NISHITA"
    sky.sun_elevation = math.radians(9)
    sky.sun_rotation = math.radians(200)
    sky.air_density = 1.2
    sky.dust_density = 2.0
except Exception:
    pass
wn.links.new(sky.outputs[0], wn.nodes["Background"].inputs[0])
wn.nodes["Background"].inputs[1].default_value = 0.22

# concrete driveway
scene.cursor.location = (0, 0, 0)
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, 0))
ground = bpy.context.active_object
gm = principled("Concrete", (0.32, 0.31, 0.29), 0.0, 0.7)
nt = gm.node_tree
tc = nt.nodes.new("ShaderNodeTexCoord")
nz = nt.nodes.new("ShaderNodeTexNoise")
nz.inputs["Scale"].default_value = 3.0
nz.inputs["Detail"].default_value = 10
nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.07, 0.068, 0.064, 1)
ramp.color_ramp.elements[1].color = (0.17, 0.165, 0.155, 1)
nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
# damp patches (just washed)
nz2 = nt.nodes.new("ShaderNodeTexNoise")
nz2.inputs["Scale"].default_value = 0.6
nt.links.new(tc.outputs["Object"], nz2.inputs["Vector"])
r2 = nt.nodes.new("ShaderNodeMapRange")
r2.inputs["From Min"].default_value = 0.45
r2.inputs["From Max"].default_value = 0.6
r2.inputs["To Min"].default_value = 0.95
r2.inputs["To Max"].default_value = 0.55
nt.links.new(nz2.outputs["Fac"], r2.inputs["Value"])
nt.links.new(r2.outputs["Result"], nt.nodes["Principled BSDF"].inputs["Roughness"])
ground.data.materials.append(gm)

# warm key (sun) + soft fill
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(81), 0, math.radians(200)))
sun = bpy.context.active_object
sun.data.energy = 3.2
sun.data.color = (1.0, 0.78, 0.55)
sun.data.angle = math.radians(1.5)
bpy.ops.object.light_add(type="AREA", location=(3.5, -5, 4), rotation=(0.9, 0, 0.6))
fill = bpy.context.active_object
fill.data.energy = 900
fill.data.size = 6
fill.data.color = (0.75, 0.85, 1.0)
# backdrop wall (garage / fence) so reflections have structure
bpy.ops.mesh.primitive_plane_add(size=1, location=(-1, 9, 2.5), rotation=(math.pi / 2, 0, 0))
wall = bpy.context.active_object
wall.scale = (30, 6, 1)
wall.data.materials.append(add_bump(principled("Wall", (0.035, 0.034, 0.033), 0.0, 0.7), 1.2, 0.4, "bands"))

scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
import os
QUICK = os.environ.get("QUICK")
scene.cycles.samples = 10 if QUICK else int(os.environ.get("SAMPLES", "64"))
scene.cycles.use_denoising = True
scene.render.resolution_x = 1600
scene.render.resolution_y = 900
scene.view_settings.view_transform = "AgX"
try:
    scene.view_settings.look = "AgX - Medium High Contrast"
except Exception:
    pass

shots = {
    "front": ((5.6, -4.3, 1.05), (0.25, 0, 0.55), 50),
    "rear": ((-5.4, -3.9, 1.25), (-0.3, 0, 0.6), 50),
    "wheel": ((2.55, -2.05, 0.55), (FX, -0.85, 0.36), 70),
    "side": ((0.2, -4.3, 0.85), (0.05, -0.9, 0.78), 45),
}
if QUICK and not os.environ.get("FULL"):
    scene.render.resolution_x, scene.render.resolution_y = 960, 540
    shots = {k: v for k, v in shots.items() if k in QUICK.split(",")}
for name, (loc, look, lens) in shots.items():
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.active_object
    cam.data.lens = lens
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = (Vector(look) - Vector(loc)).length
    cam.data.dof.aperture_fstop = 4.0 if name != "wheel" else 2.8
    cam.rotation_euler = (Vector(look) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    scene.render.filepath = f"{OUT}_{name}.png"
    bpy.ops.render.render(write_still=True)
    print("RENDERED", name)
print("DONE")
