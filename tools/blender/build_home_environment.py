"""
build_home_environment.py — River Garden homepage world (BLOCKOUT quality).

Phase 2 of the 3D homepage brief: establish SCALE and COMPOSITION before any
detailing. This script builds the authoritative environment source for the
River Garden world and locks the production camera and the named markers the
React runtime will consume instead of magic numbers.

Reference authority (see art/blender/references/README.md):
  1. motion_reference_frames/sky-river  — world layout, camera framing
  2. public/assets/worlds/river-garden/backplate.webp — colour and mood
  3. this blockout — a working interpretation, to be corrected against those

Run headless:
  blender --background --factory-startup \
    --python tools/blender/build_home_environment.py

Outputs:
  art/blender/home_environment.blend
  docs/assets/home-environment/*.png   (preview renders from CAM_Home_Main)

WORLD SCALE CONTRACT
  1 Blender unit = 1 metre. The lion is a stylised cub roughly 0.85 m at the
  shoulder, so the island reads at a child's scale rather than a landscape.
  Every marker below is authored against that contract; changing it invalidates
  the runtime camera and walk bounds.
"""

import math
import os
import sys

import bpy
from mathutils import Vector

# ── Scale contract ──────────────────────────────────────────────────────────
LION_SHOULDER_H = 0.85          # metres — drives every other proportion
ISLAND_R = 3.10                 # island radius at the grass rim
ISLAND_TOP_Z = 0.00             # island grass sits at world zero
WATER_Z = -0.62                 # river surface below the island rim
WALK_R = 2.05                   # radius the lion may roam on the island

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "home_environment.blend")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "home-environment")



# ── Island surface ──────────────────────────────────────────────────────────
DOME_SQUASH = 0.24              # vertical scale of the island hemisphere
DOME_CENTRE_Z = ISLAND_TOP_Z - 0.06


def island_surface_z(x, y):
    """Height of the island grass directly above (x, y).

    Every island prop must be seated with this. Placing them at a flat ground
    height buried them inside the dome the moment the island stopped being a
    displaced plane.
    """
    r = math.hypot(x, y)
    if r >= ISLAND_R:
        return DOME_CENTRE_Z
    return DOME_CENTRE_Z + DOME_SQUASH * math.sqrt(ISLAND_R ** 2 - r ** 2)


# ── Helpers ─────────────────────────────────────────────────────────────────
def reset_scene():
    """Factory-clean start so the build is reproducible."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "METERS"


def collection(name, parent=None):
    col = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(col)
    return col


def link(obj, col):
    """Move obj into col, unlinking from wherever bpy.ops dropped it."""
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)
    return obj


def material(name, rgb, roughness=0.72, metallic=0.0, emission=None):
    """Principled BSDF only — anything fancier will not survive glTF export."""
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission is not None:
        # Blender 4.x+ renamed the socket; support both.
        for key in ("Emission Color", "Emission"):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = (*emission, 1.0)
                break
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = 1.0
    return mat


def assign(obj, mat, smooth=True):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    if smooth:
        for p in obj.data.polygons:
            p.use_smooth = True
    return obj


def empty(name, location, col, kind="PLAIN_AXES", size=0.18):
    e = bpy.data.objects.new(name, None)
    e.empty_display_type = kind
    e.empty_display_size = size
    e.location = location
    col.objects.link(e)
    return e


# ── Palette (sampled from the approved backplate) ───────────────────────────
MAT = {}


def build_materials():
    MAT["grass"] = material("ENV_Grass", (0.310, 0.729, 0.216), 0.80)
    MAT["grass_dark"] = material("ENV_GrassShade", (0.161, 0.482, 0.129), 0.84)
    MAT["soil"] = material("ENV_Soil", (0.482, 0.353, 0.235), 0.90)
    MAT["rock"] = material("ENV_Rock", (0.706, 0.612, 0.478), 0.82)
    MAT["water"] = material("ENV_Water", (0.106, 0.647, 0.722), 0.14)
    MAT["water_deep"] = material("ENV_WaterDeep", (0.055, 0.404, 0.522), 0.18)
    MAT["foam"] = material("ENV_Foam", (0.945, 0.988, 1.000), 0.35)
    MAT["bark"] = material("ENV_Bark", (0.478, 0.353, 0.231), 0.88)
    MAT["leaf"] = material("ENV_Leaf", (0.220, 0.596, 0.200), 0.82)
    MAT["leaf_lit"] = material("ENV_LeafLit", (0.408, 0.808, 0.322), 0.78)
    MAT["blossom"] = material("ENV_Blossom", (1.000, 0.741, 0.859), 0.70)
    MAT["petal_white"] = material("ENV_PetalWhite", (0.996, 0.988, 0.945), 0.68)
    MAT["petal_gold"] = material("ENV_PetalGold", (1.000, 0.831, 0.298), 0.66)
    MAT["petal_violet"] = material("ENV_PetalViolet", (0.765, 0.694, 0.937), 0.70)
    MAT["hill_far"] = material("ENV_HillFar", (0.545, 0.831, 0.678), 0.90)
    MAT["hill_mid"] = material("ENV_HillMid", (0.412, 0.757, 0.510), 0.88)
    MAT["cloud"] = material("ENV_Cloud", (1.000, 0.996, 0.988), 0.95)


# ── Layer 1 — the island the lion stands on ─────────────────────────────────
def build_island(col):
    """Grass dome over a rocky underside — the hero stage.

    A subdivided grid displaced by a radial falloff, rather than a UV sphere:
    it keeps an even quad topology, gives a flat standing area in the middle,
    and exports cleanly.
    """
    # A squashed hemisphere, not a displaced grid. The grid version left a
    # rounded-SQUARE silhouette with visible straight edges at the rim, because
    # displacing Z alone cannot change a square outline. A UV sphere gives a
    # truly circular rim and a domed crown for free; its lower half is hidden
    # inside the rock below.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=56, ring_count=24, radius=ISLAND_R,
                                         location=(0, 0, DOME_CENTRE_Z))
    top = bpy.context.object
    top.name = "ENV_IslandGrass"
    top.scale = (1.0, 1.0, DOME_SQUASH)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(top, MAT["grass"])
    link(top, col)

    # Rocky underside, tapering to a point so the island reads as lifted.
    bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=ISLAND_R * 0.98, radius2=0.55,
                                    depth=1.55, location=(0, 0, ISLAND_TOP_Z - 0.86))
    base = bpy.context.object
    base.name = "ENV_IslandRock"
    assign(base, MAT["soil"])
    link(base, col)

    # Stone rim: the reference island is edged with rounded boulders.
    for i in range(22):
        a = (i / 22) * math.tau
        r = ISLAND_R * 0.965
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=12, ring_count=7, radius=0.30,
            location=(math.cos(a) * r, math.sin(a) * r, ISLAND_TOP_Z - 0.20))
        s = bpy.context.object
        s.name = f"ENV_RimStone_{i:02d}"
        s.scale = (1.0, 1.0, 0.72)
        assign(s, MAT["rock"])
        link(s, col)
    return top


# ── Layer 2 — river, banks and waterfall ────────────────────────────────────
def build_water(col):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=24, y_subdivisions=24,
                                    size=34.0, location=(0, 0, WATER_Z))
    w = bpy.context.object
    w.name = "ENV_RiverSurface"
    assign(w, MAT["water"])
    link(w, col)

    # Riverbed slightly below, so shallows read where the two are close.
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=2, y_subdivisions=2,
                                    size=34.0, location=(0, 0, WATER_Z - 0.55))
    bed = bpy.context.object
    bed.name = "ENV_RiverBed"
    assign(bed, MAT["water_deep"])
    link(bed, col)
    return w


def build_banks(col):
    """Far bank ring — encloses the river so the world has an edge."""
    bpy.ops.mesh.primitive_torus_add(
        major_radius=11.5, minor_radius=3.4, major_segments=44, minor_segments=14,
        location=(0, 0, WATER_Z - 0.30))
    ring = bpy.context.object
    ring.name = "ENV_FarBank"
    ring.scale = (1.0, 1.0, 0.42)
    assign(ring, MAT["grass_dark"])
    link(ring, col)

    # Receding hills: three arcs, each flatter and further back.
    for i, (rad, z, sc, mat) in enumerate([
        (17.0, WATER_Z + 0.55, 0.30, MAT["hill_mid"]),
        (23.0, WATER_Z + 1.25, 0.24, MAT["hill_far"]),
        (30.0, WATER_Z + 1.95, 0.18, MAT["hill_far"]),
    ]):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=22, ring_count=9, radius=rad,
                                             location=(0, 6.0 + i * 3.0, z - rad * (1 - sc)))
        h = bpy.context.object
        h.name = f"ENV_DistantHill_{i}"
        h.scale = (1.0, 0.55, sc)
        assign(h, mat)
        link(h, col)


def build_waterfall(col):
    """A cascade on the FAR bank, not in the foreground.

    Earlier passes built this as a large near-camera feature and it failed
    repeatedly — as a pale slab, a beige drum, and a green drum with white
    spikes. The diagnosis was never the shading: a foreground waterfall invites
    close inspection that blockout geometry cannot survive, and every added
    detail made it noisier.

    The reference treats it correctly — small, mid-distance, left of frame. At
    that scale a cascade only needs three legible cues: a gap in the bank, a
    bright vertical ribbon, and foam where it lands. Complexity is matched to
    the pixel budget instead of fighting it.
    """
    fx, fy = -9.4, 9.2                      # on the far bank, well behind the island
    bank_top = WATER_Z + 1.62

    # Notch: two rounded shoulders with a gap between them.
    for i, sx in enumerate((-1.35, 1.35)):
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=18, ring_count=12, radius=1.05,
            location=(fx + sx, fy, bank_top - 0.30))
        sh = bpy.context.object
        sh.name = f"ENV_FallShoulder_{i}"
        sh.scale = (1.0, 1.15, 0.95)
        assign(sh, MAT["grass_dark"])
        link(sh, col)

    # The ribbon of falling water, widening slightly toward the pool.
    fall_h = bank_top - WATER_Z
    bpy.ops.mesh.primitive_cone_add(
        vertices=16, radius1=0.42, radius2=0.62, depth=fall_h,
        location=(fx, fy - 0.55, WATER_Z + fall_h * 0.5))
    ribbon = bpy.context.object
    ribbon.name = "ENV_FallRibbon"
    ribbon.scale = (1.0, 0.42, 1.0)
    assign(ribbon, MAT["foam"])
    link(ribbon, col)

    # Foam where it meets the river.
    for i in range(3):
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=16, ring_count=10, radius=0.52 + i * 0.16,
            location=(fx + (i - 1) * 0.46, fy - 0.85, WATER_Z + 0.05))
        f = bpy.context.object
        f.name = f"ENV_FallFoam_{i}"
        f.scale = (1.0, 0.72, 0.26)
        assign(f, MAT["foam"])
        link(f, col)

    # One spreading ripple, enough to say "something lands here".
    bpy.ops.mesh.primitive_torus_add(major_radius=1.45, minor_radius=0.05,
                                     major_segments=28, minor_segments=6,
                                     location=(fx, fy - 0.95, WATER_Z + 0.03))
    ring = bpy.context.object
    ring.name = "ENV_FallRipple"
    assign(ring, MAT["foam"])
    link(ring, col)


def build_stepping_stones(col):
    """Stones crossing the near water, receding toward the island."""
    for i, (x, y, r) in enumerate([
        (3.9, -2.6, 0.62), (4.9, -3.6, 0.55),
        (5.8, -4.7, 0.48), (6.6, -5.9, 0.42),
    ]):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=10, radius=r,
                                             location=(x, y, WATER_Z + 0.05))
        s = bpy.context.object
        s.name = f"ENV_SteppingStone_{i}"
        s.scale = (1.0, 0.86, 0.34)
        assign(s, MAT["rock"])
        link(s, col)


def build_lily_pads(col):
    for i, (x, y, r) in enumerate([
        (-3.4, -3.5, 0.46), (-2.1, -4.6, 0.34), (2.2, -4.9, 0.40),
        (-5.0, -2.3, 0.30), (4.4, -1.6, 0.36),
    ]):
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=r, depth=0.045,
                                            location=(x, y, WATER_Z + 0.03))
        p = bpy.context.object
        p.name = f"ENV_LilyPad_{i}"
        assign(p, MAT["leaf"])
        link(p, col)


# ── Layer 3 — foliage ───────────────────────────────────────────────────────
def build_tree(name, loc, scale, col, blossom=True):
    """Stylised rounded tree: trunk plus three canopy masses.

    Deliberately low geometry. These read at a few hundred pixels; film-level
    complexity here would spend the GPU budget the lion needs.
    """
    parts = []
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.17, depth=1.25,
                                        location=(loc[0], loc[1], loc[2] + 0.62))
    trunk = bpy.context.object
    trunk.name = f"{name}_Trunk"
    assign(trunk, MAT["bark"])
    parts.append(trunk)

    for i, (dx, dy, dz, r, mat) in enumerate([
        (-0.30, 0.10, 1.48, 0.74, MAT["leaf"]),
        (0.32, -0.08, 1.62, 0.80, MAT["leaf_lit"]),
        (0.02, 0.06, 2.02, 0.66, MAT["leaf_lit"]),
    ]):
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=20, ring_count=12, radius=r,
            location=(loc[0] + dx, loc[1] + dy, loc[2] + dz))
        c = bpy.context.object
        c.name = f"{name}_Canopy_{i}"
        c.scale = (1.0, 1.0, 0.86)
        assign(c, mat)
        parts.append(c)

    if blossom:
        for i in range(7):
            a = (i / 7) * math.tau
            bpy.ops.mesh.primitive_uv_sphere_add(
                segments=7, ring_count=5, radius=0.10,
                location=(loc[0] + math.cos(a) * 0.72,
                          loc[1] + math.sin(a) * 0.62,
                          loc[2] + 1.70 + math.sin(a * 2) * 0.24))
            b = bpy.context.object
            b.name = f"{name}_Blossom_{i}"
            assign(b, MAT["blossom"])
            parts.append(b)

    for p in parts:
        p.scale = tuple(s * scale for s in p.scale)
        p.location = (loc[0] + (p.location.x - loc[0]) * scale,
                      loc[1] + (p.location.y - loc[1]) * scale,
                      loc[2] + (p.location.z - loc[2]) * scale)
        link(p, col)
    return parts


def build_foliage(col):
    # On-island trees sit off the lion's centre line so they never mask it.
    build_tree("ENV_TreeIslandL", (-2.05, 1.35, island_surface_z(-2.05, 1.35) - 0.05), 0.72, col)
    build_tree("ENV_TreeIslandR", (2.15, 1.05, island_surface_z(2.15, 1.05) - 0.05), 0.62, col)
    # Bank trees frame the composition.
    build_tree("ENV_TreeBankL", (-8.2, 5.0, WATER_Z + 0.55), 1.25, col)
    build_tree("ENV_TreeBankR", (8.6, 4.2, WATER_Z + 0.55), 1.35, col)
    build_tree("ENV_TreeBankFarL", (-12.0, 8.5, WATER_Z + 0.9), 1.0, col, blossom=False)
    build_tree("ENV_TreeBankFarR", (12.4, 9.2, WATER_Z + 0.9), 1.1, col, blossom=False)

    # Bushes soften the island rim.
    for i, (x, y, s) in enumerate([
        (-1.5, -1.9, 0.62), (1.8, -1.7, 0.54), (-2.6, -0.4, 0.46), (2.7, 0.1, 0.50),
    ]):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=s,
                                             location=(x, y, island_surface_z(x, y) - 0.06))
        b = bpy.context.object
        b.name = f"ENV_Bush_{i}"
        b.scale = (1.25, 1.0, 0.66)
        assign(b, MAT["leaf"])
        link(b, col)


def build_flowers(col):
    """Scattered blooms at three sizes — repetition at one size reads stamped."""
    spec = [
        (-1.15, -0.55, 0.085, MAT["petal_white"]), (0.95, -0.95, 0.075, MAT["petal_gold"]),
        (-0.55, 1.35, 0.090, MAT["petal_violet"]), (1.55, 0.65, 0.070, MAT["petal_white"]),
        (-1.85, 0.35, 0.080, MAT["petal_gold"]), (0.35, -1.55, 0.085, MAT["petal_violet"]),
        (2.05, -0.85, 0.065, MAT["petal_white"]), (-2.25, -1.15, 0.070, MAT["petal_gold"]),
    ]
    for i, (x, y, r, mat) in enumerate(spec):
        for k in range(5):
            a = (k / 5) * math.tau
            bpy.ops.mesh.primitive_uv_sphere_add(
                segments=8, ring_count=6, radius=r,
                location=(x + math.cos(a) * r * 1.5, y + math.sin(a) * r * 1.5,
                          island_surface_z(x, y) + 0.05))
            p = bpy.context.object
            p.name = f"ENV_Flower_{i}_P{k}"
            assign(p, mat)
            link(p, col)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=r * 0.7,
                                             location=(x, y, island_surface_z(x, y) + 0.07))
        c = bpy.context.object
        c.name = f"ENV_Flower_{i}_Core"
        assign(c, MAT["petal_gold"])
        link(c, col)




def build_island_detail(col):
    """Surface interest on the hero stage.

    Everything here stays OUTSIDE a clear radius around the centre: that is
    where the lion stands, and props competing with the character is exactly
    what the brief warns against. Detail rings the stage rather than filling it.
    """
    clear_r = 1.05          # keep the lion's footprint free

    # NOTE: individual grass tufts were tried here and removed. Upward cones
    # read as dark spikes at this scale no matter how they are tinted, and the
    # reference island is smooth grass carrying flowers, not visible blades.
    # Surface interest comes from blooms and bedded rocks instead.

    # Small rocks bedded into the grass give the surface scale.
    for i, (x, y, r) in enumerate([
        (-1.62, 0.92, 0.15), (1.78, -0.62, 0.12), (0.42, 1.72, 0.10),
        (-0.95, -1.68, 0.13), (2.05, 1.15, 0.11),
    ]):
        z = island_surface_z(x, y)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=r,
                                             location=(x, y, z - r * 0.35))
        o = bpy.context.object
        o.name = f"ENV_IslandRock_{i}"
        o.scale = (1.25, 1.0, 0.66)
        assign(o, MAT["rock"])
        link(o, col)

    # A second ring of blooms further out, at mixed scale.
    ring = [
        (-2.25, 0.35, 0.070, MAT["petal_white"]), (2.30, 0.55, 0.062, MAT["petal_violet"]),
        (-1.35, 1.95, 0.058, MAT["petal_gold"]), (1.55, 1.85, 0.066, MAT["petal_white"]),
        (-2.05, -1.35, 0.060, MAT["petal_violet"]), (2.10, -1.45, 0.055, MAT["petal_gold"]),
        (0.15, 2.25, 0.064, MAT["petal_white"]), (-0.35, -2.15, 0.058, MAT["petal_violet"]),
    ]
    for i, (x, y, r, mat) in enumerate(ring):
        z = island_surface_z(x, y)
        for k in range(5):
            a = (k / 5) * math.tau
            bpy.ops.mesh.primitive_uv_sphere_add(
                segments=8, ring_count=6, radius=r,
                location=(x + math.cos(a) * r * 1.5, y + math.sin(a) * r * 1.5, z + 0.05))
            pt = bpy.context.object
            pt.name = f"ENV_RingFlower_{i}_{k}"
            assign(pt, mat)
            link(pt, col)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=r * 0.7,
                                             location=(x, y, z + 0.07))
        c = bpy.context.object
        c.name = f"ENV_RingFlower_{i}_Core"
        assign(c, MAT["petal_gold"])
        link(c, col)


# ── Sky detail ──────────────────────────────────────────────────────────────
def build_clouds(col):
    """Soft cumulus clusters. Each cloud is 4-6 squashed spheres so the
    silhouette is lumpy rather than a single blob, which is what separates a
    stylised cloud from a grey ellipse."""
    clouds = [
        (-14.0, 26.0, 5.8, 2.1), (11.0, 30.0, 7.0, 2.5), (-3.0, 34.0, 8.4, 1.9),
        (21.0, 24.0, 6.0, 1.9), (-24.0, 22.0, 5.4, 1.7), (4.5, 20.0, 4.9, 1.4),
        (30.0, 32.0, 8.8, 2.2), (-32.0, 28.0, 7.2, 2.0), (16.0, 18.0, 4.4, 1.3),
    ]
    for ci, (cx, cy, cz, scale) in enumerate(clouds):
        for pi, (dx, dy, dz, r) in enumerate([
            (0.0, 0.0, 0.0, 1.00), (-1.15, 0.20, -0.18, 0.74),
            (1.20, -0.15, -0.22, 0.80), (0.35, 0.30, 0.52, 0.66),
            (-0.55, -0.25, 0.40, 0.58), (2.05, 0.10, -0.40, 0.50),
        ]):
            bpy.ops.mesh.primitive_uv_sphere_add(
                segments=12, ring_count=7, radius=r * scale,
                location=(cx + dx * scale, cy + dy * scale, cz + dz * scale))
            o = bpy.context.object
            o.name = f"ENV_Cloud_{ci:02d}_{pi}"
            o.scale = (1.25, 1.0, 0.62)
            assign(o, MAT["cloud"])
            link(o, col)


def build_rainbow(col):
    """Seven concentric bands, sunk so only the arc clears the hills.

    Modelled as full tori rather than arc geometry: the lower halves fall below
    the horizon line and behind the distant hills, which is how the arc reads
    without any trimmed topology to export.
    """
    bands = [
        ("Red", (0.988, 0.451, 0.451)), ("Orange", (1.000, 0.635, 0.353)),
        ("Yellow", (1.000, 0.878, 0.478)), ("Green", (0.573, 0.855, 0.510)),
        ("Cyan", (0.510, 0.804, 0.918)), ("Blue", (0.514, 0.620, 0.918)),
        ("Violet", (0.749, 0.663, 0.937)),
    ]
    cx, cy, cz = 7.0, 40.0, -4.2
    for i, (name, rgb) in enumerate(bands):
        mat = material(f"ENV_Rainbow{name}", rgb, roughness=0.9, emission=rgb)
        mat.blend_method = "BLEND"
        mat.use_backface_culling = False
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs["Alpha"].default_value = 0.34
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = 0.55
        bpy.ops.mesh.primitive_torus_add(
            major_radius=14.0 - i * 0.55, minor_radius=0.31,
            major_segments=64, minor_segments=8,
            location=(cx, cy, cz), rotation=(math.radians(90), 0, 0))
        o = bpy.context.object
        o.name = f"ENV_Rainbow_{name}"
        assign(o, mat)
        link(o, col)


def build_bubbles(col):
    """Drifting bubbles — a signature of the reference world."""
    mat = material("ENV_Bubble", (0.92, 0.98, 1.0), roughness=0.05,
                   emission=(0.72, 0.88, 1.0))
    mat.blend_method = "BLEND"
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Alpha"].default_value = 0.20
    if "Emission Strength" in bsdf.inputs:
        bsdf.inputs["Emission Strength"].default_value = 0.35
    spots = [
        (-4.2, -2.0, 1.35, 0.22), (3.6, -1.2, 1.85, 0.16), (-2.4, 2.6, 2.25, 0.13),
        (5.1, 1.4, 1.15, 0.19), (-6.0, -0.6, 2.60, 0.11), (1.4, 3.2, 2.95, 0.15),
        (6.4, -2.8, 2.10, 0.12), (-3.1, -3.6, 0.95, 0.17),
    ]
    for i, (x, y, z, r) in enumerate(spots):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8,
                                             radius=r, location=(x, y, z))
        o = bpy.context.object
        o.name = f"ENV_Bubble_{i}"
        assign(o, mat)
        link(o, col)


def build_reeds(col):
    """Foreground reeds at the near bank — the depth cue closest to camera."""
    for i, (x, y, h) in enumerate([
        (-7.4, -5.6, 1.5), (-6.6, -6.2, 1.9), (-7.9, -6.8, 1.3),
        (7.8, -5.2, 1.7), (8.5, -6.1, 2.1), (7.1, -6.6, 1.4),
    ]):
        for k in range(4):
            bpy.ops.mesh.primitive_cone_add(
                vertices=8, radius1=0.075, radius2=0.012, depth=h,
                location=(x + (k - 1.5) * 0.20, y + (k % 2) * 0.16,
                          WATER_Z + h * 0.5))
            r = bpy.context.object
            r.name = f"ENV_Reed_{i}_{k}"
            r.rotation_euler = (math.radians((k - 1.5) * 6), 0, math.radians(k * 22))
            assign(r, MAT["leaf"] if k % 2 else MAT["grass_dark"])
            link(r, col)


# ── Camera, markers, lighting ───────────────────────────────────────────────
def build_camera(col):
    """CAM_Home_Main — locked production camera.

    Focal length chosen by matching the reference framing, not by preference:
    the source frames show mild perspective (the island rim curves gently, the
    bank trees converge slightly), which a ~40 mm full-frame equivalent gives.
    A long lens flattened the island; a wide one bowed the horizon.
    """
    cam_data = bpy.data.cameras.new("CAM_Home_Main")
    cam_data.lens = 40.0
    cam_data.sensor_width = 36.0
    cam_data.clip_start = 0.05
    cam_data.clip_end = 220.0
    cam = bpy.data.objects.new("CAM_Home_Main", cam_data)
    cam.location = (0.0, -12.90, 4.95)
    cam.rotation_euler = (math.radians(76.5), 0.0, 0.0)
    col.objects.link(cam)
    bpy.context.scene.camera = cam
    return cam


def build_markers(col):
    """Named anchors the runtime consumes instead of magic coordinates."""
    m = {}
    m["spawn"] = empty("MARK_LionSpawn", (0.0, 0.0, island_surface_z(0.0, 0.0)), col, "SPHERE", 0.22)
    m["greeting"] = empty("MARK_LionGreeting", (0.0, -0.55, island_surface_z(0.0, -0.55)), col, "SPHERE", 0.20)
    m["walk_l"] = empty("MARK_WalkLeft", (-WALK_R, -0.20, island_surface_z(-WALK_R, -0.20)), col, "PLAIN_AXES")
    m["walk_r"] = empty("MARK_WalkRight", (WALK_R, -0.20, island_surface_z(WALK_R, -0.20)), col, "PLAIN_AXES")
    # Speech anchors beside the head, at the height the bubble should track.
    m["speech"] = empty("MARK_SpeechAnchor",
                        (0.62, -0.30, island_surface_z(0.62, -0.30) + LION_SHOULDER_H + 0.46), col, "ARROWS", 0.16)
    m["cam_target"] = empty("MARK_CameraTarget", (0.0, 0.0, island_surface_z(0, 0) + 0.55), col, "PLAIN_AXES")
    # DOM zones: not rendered, but they keep the 3D composition honest about
    # where React will place the title and the card row.
    m["title"] = empty("MARK_TitleZone", (0.0, -2.05, ISLAND_TOP_Z - 0.30), col, "CUBE", 0.30)
    m["cards"] = empty("MARK_CardShelfZone", (0.0, -4.60, WATER_Z + 0.30), col, "CUBE", 0.42)
    return m


def build_lighting(col):
    """Bright, soft, warm — and a key angled to keep the lion's face readable."""
    sun_data = bpy.data.lights.new("KeySun", type="SUN")
    sun_data.energy = 3.1
    sun_data.angle = math.radians(12.0)      # soft-edged shadows
    sun_data.color = (1.0, 0.968, 0.898)
    sun = bpy.data.objects.new("LIGHT_KeySun", sun_data)
    sun.rotation_euler = (math.radians(52), 0, math.radians(38))
    sun_data.use_shadow = True
    col.objects.link(sun)

    fill_data = bpy.data.lights.new("FillArea", type="AREA")
    fill_data.energy = 28.0
    fill_data.size = 9.0
    fill_data.color = (0.855, 0.937, 1.0)    # cool sky bounce
    fill = bpy.data.objects.new("LIGHT_SkyFill", fill_data)
    fill.location = (-5.2, -7.0, 5.4)
    fill.rotation_euler = (math.radians(58), 0, math.radians(-28))
    col.objects.link(fill)

    rim_data = bpy.data.lights.new("RimArea", type="AREA")
    rim_data.energy = 24.0
    rim_data.size = 6.0
    rim_data.color = (1.0, 0.918, 0.792)
    rim = bpy.data.objects.new("LIGHT_WarmRim", rim_data)
    rim.location = (4.6, 6.2, 3.8)
    rim.rotation_euler = (math.radians(112), 0, math.radians(28))
    col.objects.link(rim)

    # Sky gradient rather than a flat fill: warm near the horizon, cooler at
    # zenith, which is what makes a background read as air instead of paint.
    #
    # Driven by the Z component of the view direction. A Gradient texture with a
    # rotated mapping was the obvious approach and rendered the whole dome at the
    # horizon colour — Generated coordinates on a world shader are direction
    # vectors, so the gradient never resolved along altitude.
    world = bpy.data.worlds.new("ENV_World")
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()

    texco = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    rng = nt.nodes.new("ShaderNodeMapRange")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    bg = nt.nodes.new("ShaderNodeBackground")
    out = nt.nodes.new("ShaderNodeOutputWorld")

    rng.inputs["From Min"].default_value = -0.12   # a little below the horizon
    rng.inputs["From Max"].default_value = 0.48    # zenith arrives before straight up
    rng.inputs["To Min"].default_value = 0.0
    rng.inputs["To Max"].default_value = 1.0
    rng.clamp = True

    ramp.color_ramp.elements[0].position = 0.00
    ramp.color_ramp.elements[0].color = (0.878, 0.918, 0.906, 1.0)   # soft horizon haze
    ramp.color_ramp.elements[1].position = 0.30
    ramp.color_ramp.elements[1].color = (0.298, 0.663, 0.925, 1.0)   # mid sky
    top = ramp.color_ramp.elements.new(1.0)
    top.color = (0.141, 0.478, 0.859, 1.0)                            # deeper zenith
    # The world is both the visible sky AND the ambient light source. Dimming it
    # for saturation greyed the sky itself. Split by ray type: the camera sees a
    # full-strength sky, while everything else receives a much weaker bounce.
    bg_dim = nt.nodes.new("ShaderNodeBackground")
    lp = nt.nodes.new("ShaderNodeLightPath")
    mix = nt.nodes.new("ShaderNodeMixShader")

    bg.inputs[1].default_value = 1.0        # what the camera sees
    bg_dim.inputs[1].default_value = 0.30   # what the scene is lit by

    nt.links.new(texco.outputs["Generated"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Z"], rng.inputs["Value"])
    nt.links.new(rng.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    nt.links.new(ramp.outputs["Color"], bg_dim.inputs["Color"])
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(bg_dim.outputs["Background"], mix.inputs[1])
    nt.links.new(bg.outputs["Background"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    bpy.context.scene.world = world

    # Stylised art wants the colours it was authored with.
    vs = bpy.context.scene.view_settings
    vs.view_transform = "Standard"
    vs.look = "None"
    vs.exposure = 0.0
    vs.gamma = 1.0


# ── Preview render ──────────────────────────────────────────────────────────
def render_previews():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in {
        i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items
    } else "BLENDER_EEVEE"
    scene.render.resolution_x = 1440
    scene.render.resolution_y = 900
    scene.render.film_transparent = False
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    # Production framing, plus two diagnostic angles for scale checking.
    cam = bpy.data.objects["CAM_Home_Main"]
    shots = [
        ("home-main", cam.location.copy(), cam.rotation_euler.copy()),
        ("home-side", Vector((13.0, -7.0, 4.6)), (math.radians(76), 0, math.radians(58))),
        ("home-high", Vector((0.0, -8.0, 8.2)), (math.radians(56), 0, 0)),
    ]
    for name, loc, rot in shots:
        cam.location = loc
        cam.rotation_euler = rot
        scene.render.filepath = os.path.join(PREVIEW_DIR, f"{name}.png")
        bpy.ops.render.render(write_still=True)

    # Restore the locked production framing before saving.
    cam.location = shots[0][1]
    cam.rotation_euler = shots[0][2]


# ── Main ────────────────────────────────────────────────────────────────────
def main():
    reset_scene()
    build_materials()

    c_ground = collection("ENV_Ground")
    c_water = collection("ENV_Water")
    c_foliage = collection("ENV_Foliage")
    c_props = collection("ENV_Props")
    c_markers = collection("MARKERS")
    c_light = collection("LIGHTING")
    c_cam = collection("CAMERA")

    build_island(c_ground)
    build_banks(c_ground)
    build_water(c_water)
    build_waterfall(c_props)
    build_stepping_stones(c_props)
    build_lily_pads(c_water)
    build_foliage(c_foliage)
    build_flowers(c_props)
    build_reeds(c_props)
    build_island_detail(c_props)
    c_sky = collection("ENV_Sky")
    build_clouds(c_sky)
    build_rainbow(c_sky)
    build_bubbles(c_sky)
    build_camera(c_cam)
    build_markers(c_markers)
    build_lighting(c_light)

    os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    tris = 0
    for o in meshes:
        o.data.calc_loop_triangles()
        tris += len(o.data.loop_triangles)
    print("\n===ENV_BUILD===")
    print(f"BLEND={BLEND_OUT}")
    print(f"MESH_OBJECTS={len(meshes)}")
    print(f"TRIS={tris}")
    print(f"MATERIALS={len(bpy.data.materials)}")
    print(f"MARKERS={[o.name for o in bpy.data.objects if o.type == 'EMPTY']}")
    print(f"CAMERA={bpy.context.scene.camera.name} lens={bpy.context.scene.camera.data.lens}mm")
    print("===ENV_BUILD_END===")

    if "--no-render" not in sys.argv:
        render_previews()
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)


if __name__ == "__main__":
    main()
