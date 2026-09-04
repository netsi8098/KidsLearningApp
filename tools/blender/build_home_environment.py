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
ISLAND_R = 2.15                 # island radius at the grass rim
ISLAND_TOP_Z = 0.00             # island grass sits at world zero
WATER_Z = -0.62                 # river surface below the island rim
WALK_R = 1.35                   # radius the lion may roam on the island

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
    # Bridge planks. Warmer and lighter than `trunk`, because the approved
    # reference art (`lion-treehouse-closeup.webp`) builds its architecture out
    # of honey-coloured wood, and a bridge in tree-bark brown reads as a fallen
    # log rather than as something someone built.
    MAT["plank"] = material("ENV_Plank", (0.686, 0.478, 0.278), 0.74)
    MAT["plank_dark"] = material("ENV_PlankShade", (0.529, 0.353, 0.196), 0.78)
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
    MAT["leaf_dark"] = material("ENV_LeafDark", (0.133, 0.404, 0.129), 0.86)
    MAT["grass_lit"] = material("ENV_GrassLit", (0.427, 0.816, 0.290), 0.78)
    MAT["water_shallow"] = material("ENV_WaterShallow", (0.208, 0.749, 0.780), 0.13)
    MAT["soil_dark"] = material("ENV_SoilDark", (0.353, 0.243, 0.157), 0.92)


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
# Canopy schema, in NORMALISED units so ONE table serves every tree size.
#   dx, dy — lobe centre offset, in crown radii
#   dz     — lobe centre height, as a fraction of TRUNK height
#   r      — lobe radius, as a fraction of the crown radius
#   tone   — which of the three foliage greens
#
# Trunk height is the tree's single driver, and that is deliberate: it is the
# number `world_audit` measures (its patterns match the `*_Trunk` object, not
# the canopy), and it is also the number the target's REASON is about — "the
# canopy must clear its head" is a statement about how much bare trunk there
# is. Deriving the crown from it keeps the measurement and the intent the same
# quantity instead of two that drift apart.
CANOPY_LOBES = [
    (0.00, 0.00, 0.86, 1.00, "mid"),      # the main mass
    (-0.60, -0.32, 0.74, 0.74, "dark"),   # shadow lobe, low and away from sun
    (0.50, 0.38, 0.92, 0.78, "lit"),      # lit lobe, sun side and higher
    (-0.32, 0.50, 0.97, 0.58, "mid"),
    (0.56, -0.44, 0.80, 0.60, "mid"),
    (0.22, 0.26, 1.02, 0.46, "lit"),      # crown tip
    (-0.66, 0.16, 0.68, 0.50, "dark"),
    (0.04, -0.60, 0.88, 0.52, "mid"),
]
CROWN_R_FRAC = 0.30       # default crown radius, as a fraction of trunk height
LOBE_SQUASH = 0.80        # lobes are flattened, not spherical

# Two facts fall out of the table, and the framing depends on both. At the
# default crown ratio a tree is 1.13 x its trunk tall, and its canopy floor —
# the height the character walks under — is 0.56 x. `build_tree` recomputes
# them from the crown ratio it is actually given.


def build_tree(name, loc, col, trunk_h, blossom=True, crown_r=None, twist=0.0):
    """Stylised tree, authored in METRES from its trunk height.

    `loc` is the point on the ground the trunk grows out of; the trunk's
    bounding box is exactly `trunk_h` tall, so what the scale gate measures is
    what this argument says.

    WHY IT IS NO LONGER A `scale` MULTIPLIER
    The previous version built a fixed 2.57 m tree and multiplied every part by
    a scale factor, which meant the only way to find out how tall a tree was
    was to multiply two numbers in your head — and nobody did. The world shipped
    with its tallest trunk at 1.82 m against a 1.30 m character.

    WHY THE CANOPY IS LOBES AND NOT A BALL
    Asymmetry and a lit/shaded split are what make a stylised canopy read as
    foliage: a shadow mass low and away from the sun, lit masses on the sun
    side and higher, a tip that is not the centre of anything, and small clumps
    breaking the outer silhouette. Eight overlapping lobes at five radii cost
    the same as eight identical ones.
    """
    parts = []
    crown_r = crown_r or trunk_h * CROWN_R_FRAC
    bx, by, bz = loc
    sun = (0.62, 0.78)                 # matches LIGHT_KeySun's azimuth
    drop = LOBE_SQUASH * crown_r / trunk_h
    floor_frac = min(dz - drop * rf for _, _, dz, rf, _ in CANOPY_LOBES)

    # Foliage lobes get more segments when the tree is big on screen and fewer
    # when it is a distant silhouette. A 6 m tree at the far bank is ~40% of the
    # frame height; a 1 m bank shrub is 30 px.
    seg, ring = (18, 11) if crown_r >= 1.05 else (14, 9)

    def lobe(nm, x, y, z, r, mat, s=None, segs=None):
        sg, rg = segs or (seg, ring)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=sg, ring_count=rg, radius=r,
                                             location=(x, y, z))
        o = bpy.context.object
        o.name = nm
        o.scale = s or (1.0, 1.0, LOBE_SQUASH)
        assign(o, mat)
        parts.append(o)
        return o

    # Trunk: one tapered cone whose bbox height IS trunk_h. Radius scales with
    # height so a 5 m tree is not a 5 m broomstick.
    bpy.ops.mesh.primitive_cone_add(
        vertices=12, radius1=trunk_h * 0.056, radius2=trunk_h * 0.030,
        depth=trunk_h, location=(bx, by, bz + trunk_h * 0.5))
    trunk = bpy.context.object
    trunk.name = f"{name}_Trunk"
    assign(trunk, MAT["bark"])
    parts.append(trunk)

    # Root flare, so it grows out of the ground rather than being pushed into it.
    bpy.ops.mesh.primitive_cone_add(
        vertices=12, radius1=trunk_h * 0.098, radius2=trunk_h * 0.058,
        depth=trunk_h * 0.11, location=(bx, by, bz + trunk_h * 0.055))
    flare = bpy.context.object
    flare.name = f"{name}_RootFlare"
    assign(flare, MAT["bark"])
    parts.append(flare)

    # Three limbs leaving the trunk below the canopy floor, so the structure is
    # visible in the gap the character walks through rather than hidden inside
    # the leaves.
    for i in range(3):
        a = twist + i * math.tau / 3.0
        limb_l = trunk_h * 0.26
        cz = bz + trunk_h * (floor_frac + 0.10)
        tilt = math.radians(38.0)
        bpy.ops.mesh.primitive_cone_add(
            vertices=6, radius1=trunk_h * 0.026, radius2=trunk_h * 0.011,
            depth=limb_l,
            location=(bx + math.cos(a) * limb_l * 0.42,
                      by + math.sin(a) * limb_l * 0.42,
                      cz + limb_l * 0.38))
        b = bpy.context.object
        b.name = f"{name}_Branch_{i}"
        b.rotation_euler = (0.0, tilt, a)
        assign(b, MAT["bark"])
        parts.append(b)

    tone_map = {"dark": MAT["leaf_dark"], "mid": MAT["leaf"], "lit": MAT["leaf_lit"]}
    for i, (dx, dy, dz, rf, key) in enumerate(CANOPY_LOBES):
        lobe(f"{name}_Canopy_{i}",
             bx + dx * crown_r, by + dy * crown_r, bz + dz * trunk_h,
             rf * crown_r, tone_map[key])

    # Small clumps break the outer silhouette so it is not a smooth blob.
    for i in range(6):
        a = twist + (i / 6.0) * math.tau + 0.4
        rr = crown_r * 0.92
        lobe(f"{name}_Clump_{i}",
             bx + math.cos(a) * rr, by + math.sin(a) * rr * 0.88,
             bz + trunk_h * (0.86 + math.sin(a * 1.7) * 0.13),
             crown_r * 0.26, MAT["leaf_lit"] if i % 2 else MAT["leaf"],
             segs=(10, 6))

    if blossom:
        for i in range(11):
            a = twist + (i / 11.0) * math.tau
            bpy.ops.mesh.primitive_ico_sphere_add(
                subdivisions=1, radius=crown_r * 0.095,
                location=(bx + math.cos(a) * crown_r * 0.97,
                          by + math.sin(a) * crown_r * 0.86,
                          bz + trunk_h * (0.90 + math.sin(a * 2.3) * 0.12)))
            b = bpy.context.object
            b.name = f"{name}_Blossom_{i}"
            b.scale = (1.0, 1.0, 0.78)
            assign(b, MAT["blossom"] if i % 3 else MAT["petal_white"])
            parts.append(b)

    # Sun-side lobes are nudged toward the key so the lit/shade split is not
    # purely a material trick — the geometry leans into the light too.
    for pt in parts:
        if "_Canopy_" in pt.name or "_Clump_" in pt.name:
            pt.location.x += sun[0] * crown_r * 0.04
            pt.location.y += sun[1] * crown_r * 0.04
        link(pt, col)
    return parts


def build_foliage(col):
    """The trees, sized against the character rather than against each other.

    The island pair is the load-bearing change. At trunk 4.20 m the canopy
    floor (0.56 x trunk) sits at 2.35 m, so a 1.30 m lion walks under it with a
    metre of daylight — which is the whole point of the `tree_mid` target and
    was not true of the 1.86 m trees that used to stand here.

    They also MOVED INWARD. The old pair stood at r = 2.46 and r = 2.39, i.e.
    OUTSIDE `ISLAND_R`, where `island_surface_z` falls back to the flat dome
    centre height. At 1.9 m tall that was invisible; at 4.7 m a trunk rooted in
    the rim stones over open water is the first thing you see. They now sit at
    r ~ 1.9, on real dome surface, still well off the lion's centre line and
    BEHIND it in y so they cannot mask the character.

    Their crowns are NARROWER than the default 0.30 x trunk. The first pass at
    this size filled the top 45% of the production frame with leaves and put out
    the rainbow; a crown at 0.265 x trunk is 2.1 m across instead of 2.5 m,
    which is the difference between framing the sky and being it.
    """
    for name, x, y, trunk_h, twist in (
        ("ENV_TreeIslandL", -1.58, 1.20, 4.05, 0.0),
        ("ENV_TreeIslandR", 1.72, 0.92, 3.95, 1.1),
    ):
        build_tree(name, (x, y, island_surface_z(x, y) - 0.05), col, trunk_h,
                   crown_r=trunk_h * 0.265, twist=twist)

    # Bank trees frame the composition; they sit at or just past the frame edge
    # so their trunks are vertical bookends rather than subjects.
    build_tree("ENV_TreeBankL", (-8.2, 5.0, WATER_Z + 0.55), col, 4.40, twist=0.6)
    build_tree("ENV_TreeBankR", (8.6, 4.2, WATER_Z + 0.55), col, 4.65, twist=2.2)
    build_tree("ENV_TreeBankFarL", (-12.0, 8.5, WATER_Z + 0.90), col, 4.20,
               blossom=False, twist=1.7)
    build_tree("ENV_TreeBankFarR", (12.4, 9.2, WATER_Z + 0.90), col, 4.55,
               blossom=False, twist=0.3)

    # Bushes soften the island rim. Kept at waist-to-shoulder on the character
    # deliberately — with the trees now four times the lion's height, the bushes
    # are the rung of the ladder that says the island is small.
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


def flower_clump(name, x, y, z, col, height, mat, petals=5, phase=0.0):
    """One flower: a stem, a ring of leaning petals, a centre.

    WHY IT IS NOT A RING OF BALLS ANY MORE
    Two separate problems, one fix.

    It did not READ. Five equal spheres flat on the grass plus a sixth in the
    middle is a bead cluster; at the production camera a flower is ~30 px tall
    and a lozenge leaning off a stem is the only thing that says "petal" at
    that size.

    And it did not MEASURE. `world_audit` judges the flower scatter on the
    MEDIAN HEIGHT of the objects named Flower/Petal/Bloom, and a bloom built
    from six 0.11 m balls scores 0.08 x the character however wide the clump
    gets. Height has to live in the geometry rather than in the footprint, so
    the petals stand up: an upright lozenge tilted 26 degrees outward is
    0.87 x the flower's height in its own bounding box, and the stem is 0.56 x.
    """
    H = height
    stem_h = H * 0.56
    pl, pw, pt = H * 0.40, H * 0.17, H * 0.10      # petal half length/width/thickness
    tilt = math.radians(26.5)

    bpy.ops.mesh.primitive_cone_add(
        vertices=6, radius1=H * 0.055, radius2=H * 0.032, depth=stem_h,
        location=(x, y, z + stem_h * 0.5))
    st = bpy.context.object
    st.name = f"{name}_Stem"
    assign(st, MAT["grass_dark"])
    link(st, col)

    for k in range(petals):
        a = phase + (k / float(petals)) * math.tau
        bpy.ops.mesh.primitive_ico_sphere_add(
            subdivisions=1, radius=pl,
            location=(x + math.cos(a) * H * 0.20,
                      y + math.sin(a) * H * 0.20,
                      z + stem_h - H * 0.05))
        p = bpy.context.object
        p.name = f"{name}_Petal_{k}"
        p.scale = (pw / pl, pt / pl, 1.0)
        p.rotation_euler = (0.0, tilt, a)
        assign(p, mat)
        link(p, col)

    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=1, radius=H * 0.20,
        location=(x, y, z + stem_h + H * 0.02))
    c = bpy.context.object
    c.name = f"{name}_Core"
    c.scale = (1.0, 1.0, 0.85)
    assign(c, MAT["petal_gold"])
    link(c, col)


def build_flowers(col):
    """The island's blooms — three sizes, because one size reads stamped.

    Everything stays at r >= 1.4 and clear of the walk line between
    MARK_WalkLeft and MARK_WalkRight: a 0.3 m flower is knee-high on the
    character now, so a bloom under its feet would read as trampled rather
    than as ground cover.
    """
    spec = [
        (-1.42, -0.62, 0.38, MAT["petal_white"]), (1.16, -1.08, 0.32, MAT["petal_gold"]),
        (-0.66, 1.52, 0.40, MAT["petal_violet"]), (1.64, 0.74, 0.31, MAT["petal_white"]),
        (-1.90, 0.42, 0.36, MAT["petal_gold"]), (0.42, -1.64, 0.37, MAT["petal_violet"]),
        (1.88, -0.68, 0.30, MAT["petal_white"]), (-1.62, -1.14, 0.34, MAT["petal_gold"]),
        (0.94, 1.60, 0.32, MAT["petal_white"]), (-0.22, -1.94, 0.35, MAT["petal_violet"]),
        (-1.20, 1.68, 0.30, MAT["petal_gold"]),
    ]
    for i, (x, y, h, mat) in enumerate(spec):
        flower_clump(f"ENV_Flower_{i}", x, y, island_surface_z(x, y) - 0.02, col,
                     height=h, mat=mat, phase=i * 0.7)


def build_island_detail(col):
    """Surface interest on the hero stage.

    Everything here stays OUTSIDE a clear radius around the centre: that is
    where the lion stands, and props competing with the character is exactly
    what the brief warns against. Detail rings the stage rather than filling it.

    THE PEBBLES ARE NOT DECORATION. `world_audit`'s `stone_small` row exists
    because scale is read from the smallest legible thing in frame as much as
    from the tallest: with the trees at 4.7 m and the flowers at 0.3 m there was
    nothing between 0.3 m and nothing, so the eye had no bottom rung. It was
    reported MISSING, and it was — the five bedded rocks that were here were
    named `ENV_IslandRock_*`, which collided with the island's own rock
    underside and matched no category.
    """
    clear_r = 1.05          # keep the lion's footprint free

    # NOTE: individual grass tufts were tried here and removed. Upward cones
    # read as dark spikes at this scale no matter how they are tinted, and the
    # reference island is smooth grass carrying flowers, not visible blades.
    # Surface interest comes from blooms and bedded rocks instead.

    # Bedded rocks — the big end of the stone scatter, half-sunk in the grass.
    for i, (x, y, r) in enumerate([
        (-1.62, 0.92, 0.15), (1.78, -0.62, 0.12), (0.42, 1.72, 0.10),
        (-0.95, -1.68, 0.13), (0.86, -1.84, 0.11),
    ]):
        z = island_surface_z(x, y)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=r,
                                             location=(x, y, z - r * 0.35))
        o = bpy.context.object
        o.name = f"ENV_SmallRock_{i}"
        o.scale = (1.25, 1.0, 0.66)
        assign(o, MAT["rock"])
        link(o, col)

    # Pebble scatter. An icosphere at one subdivision is 20 triangles, which is
    # what a 9 cm stone 13 m from camera is worth; a UV sphere here would cost
    # four times that for pixels nobody can resolve.
    # Every one of these is inside ISLAND_R with room to spare. Six of the first
    # draft's were not, and `island_surface_z` answers the flat dome-centre
    # height outside the rim — so they bedded themselves into the stone band
    # instead of the grass.
    pebbles = [
        (-1.28, 1.36, 0.085), (1.44, 1.22, 0.070), (-1.86, -0.34, 0.075),
        (1.92, -0.18, 0.065), (0.62, -1.42, 0.080), (-0.58, -1.36, 0.062),
        (1.18, 1.62, 0.058), (-1.05, -1.72, 0.072), (1.68, -1.24, 0.068),
        (-1.88, 0.60, 0.060), (0.24, 1.98, 0.066), (-0.86, 1.82, 0.055),
        (2.02, 0.34, 0.062), (-1.70, 1.10, 0.052), (0.90, -1.72, 0.058),
        (-0.30, -1.20, 0.050), (1.34, 0.42, 0.048), (-1.32, 0.34, 0.054),
        (0.76, 1.18, 0.046), (-0.48, 1.24, 0.050), (1.44, -1.48, 0.056),
        (-1.80, -0.94, 0.064),
    ]
    for i, (x, y, r) in enumerate(pebbles):
        if math.hypot(x, y) < clear_r:
            continue
        z = island_surface_z(x, y)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=r,
                                              location=(x, y, z - r * 0.30))
        o = bpy.context.object
        o.name = f"ENV_Pebble_{i:02d}"
        o.scale = (1.30, 1.0, 0.62)
        assign(o, MAT["soil"] if i % 4 == 0 else MAT["rock"])
        link(o, col)

    # A second ring of blooms further out, at mixed scale. Pulled inside
    # ISLAND_R (they were at r = 2.2-2.3, where `island_surface_z` gives the
    # flat fallback height and a flower floats above the rim slope).
    ring = [
        (-1.98, 0.30, 0.31, MAT["petal_white"]), (1.96, 0.48, 0.29, MAT["petal_violet"]),
        (-1.24, 1.62, 0.30, MAT["petal_gold"]), (1.42, 1.50, 0.32, MAT["petal_white"]),
        (-1.86, -0.86, 0.30, MAT["petal_violet"]), (1.82, -0.90, 0.31, MAT["petal_gold"]),
        (0.14, 1.98, 0.33, MAT["petal_white"]), (-0.32, -1.94, 0.30, MAT["petal_violet"]),
    ]
    for i, (x, y, h, mat) in enumerate(ring):
        flower_clump(f"ENV_RingFlower_{i}", x, y, island_surface_z(x, y) - 0.02, col,
                     height=h, mat=mat, petals=5, phase=0.35 + i * 0.9)


def build_island_edge(col):
    """Grass lip and soil band where the island meets its stone rim.

    A grass dome sitting straight on stones reads as two stacked primitives. In
    the reference the turf visibly overhangs its edge with soil showing beneath,
    which is what makes the island read as ground rather than a cake.
    """
    # Overhanging turf lip, slightly wider than the dome.
    bpy.ops.mesh.primitive_torus_add(major_radius=ISLAND_R * 0.985, minor_radius=0.20,
                                     major_segments=56, minor_segments=10,
                                     location=(0, 0, DOME_CENTRE_Z + 0.05))
    lip = bpy.context.object
    lip.name = "ENV_IslandLip"
    lip.scale = (1.0, 1.0, 0.72)
    assign(lip, MAT["grass_lit"])
    link(lip, col)

    # Exposed soil under the lip.
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=ISLAND_R * 0.955, depth=0.40,
                                        location=(0, 0, DOME_CENTRE_Z - 0.22))
    band = bpy.context.object
    band.name = "ENV_IslandSoilBand"
    assign(band, MAT["soil_dark"])
    link(band, col)

    # Tufts spilling over the edge, tucked so they read as overhang not spikes.
    for i in range(26):
        a = (i / 26) * math.tau
        r = ISLAND_R * 0.94
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=10, ring_count=7, radius=0.19 + (i % 3) * 0.05,
            location=(math.cos(a) * r, math.sin(a) * r, DOME_CENTRE_Z + 0.02))
        t = bpy.context.object
        t.name = f"ENV_EdgeTuft_{i:02d}"
        t.scale = (1.0, 1.0, 0.52)
        assign(t, MAT["grass_lit"] if i % 2 else MAT["grass"])
        link(t, col)


def build_water_detail(col):
    """Shallows, contact ripples and blooming lily pads."""
    # Lighter shallow ring hugging the island — depth cue in the water itself.
    bpy.ops.mesh.primitive_torus_add(major_radius=ISLAND_R + 0.55, minor_radius=0.62,
                                     major_segments=48, minor_segments=8,
                                     location=(0, 0, WATER_Z + 0.012))
    sh = bpy.context.object
    sh.name = "ENV_Shallows"
    sh.scale = (1.0, 1.0, 0.035)
    assign(sh, MAT["water_shallow"])
    link(sh, col)

    # NOTE: concentric contact ripples were tried here and removed. Three bright
    # rings around the island read as a painted racetrack and pulled the eye
    # straight off the hero stage. The shallow band alone is enough to say the
    # island displaces water; the reference has no such rings either.

    # More lily pads, some carrying a bloom.
    pads = [
        (-4.55, -2.30, 0.46, True), (-3.10, -3.55, 0.34, False),
        (3.05, -3.70, 0.40, True), (-5.45, -1.15, 0.30, False),
        (4.85, -1.05, 0.36, False), (5.60, -2.55, 0.28, True),
        (-4.05, -0.70, 0.32, False), (3.90, -2.20, 0.26, False),
    ]
    for i, (x, y, r, bloom) in enumerate(pads):
        bpy.ops.mesh.primitive_cylinder_add(vertices=22, radius=r, depth=0.05,
                                            location=(x, y, WATER_Z + 0.035))
        pad = bpy.context.object
        pad.name = f"ENV_LilyPadB_{i}"
        assign(pad, MAT["leaf"])
        link(pad, col)
        # Notch stem: a small darker wedge reads as the pad's split.
        bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=r * 0.22, depth=0.055,
                                            location=(x + r * 0.7, y, WATER_Z + 0.036))
        notch = bpy.context.object
        notch.name = f"ENV_LilyNotch_{i}"
        assign(notch, MAT["water"])
        link(notch, col)
        if bloom:
            for k in range(5):
                a = (k / 5) * math.tau
                bpy.ops.mesh.primitive_uv_sphere_add(
                    segments=8, ring_count=6, radius=0.075,
                    location=(x + math.cos(a) * 0.10, y + math.sin(a) * 0.10, WATER_Z + 0.10))
                pb = bpy.context.object
                pb.name = f"ENV_LilyBloom_{i}_{k}"
                assign(pb, MAT["blossom"])
                link(pb, col)
            bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.055,
                                                 location=(x, y, WATER_Z + 0.125))
            core = bpy.context.object
            core.name = f"ENV_LilyBloomCore_{i}"
            assign(core, MAT["petal_gold"])
            link(core, col)


def build_far_bank_detail(col):
    """The far bank's silhouette, and the world's skyline.

    THREE BUGS WERE HIDING IN HERE, and the first two are why the bank still
    "read as one smooth green band" after the pass that was meant to fix it:

      1. The mounds were authored at angles 200-330 degrees and then gated on
         `y >= 1.0`. Every one of those angles gives sin(a) < -0.3, so with
         r ~ 11.5 the guard skipped ALL FOURTEEN. Same for the nine bushes at
         `y >= 1.5`. The bank has never had either.
      2. The four trees named `ENV_BankTree_*` — the objects `world_audit`
         measures as the `tree_tall` category, "the far bank's skyline" —
         landed at y = -6.0 to -9.6. That is the NEAR foreground, off both
         sides of the production frame. Nothing was on the far bank at all.
      3. They were seated at a constant `WATER_Z + 0.7`, which is not the far
         bank's surface anywhere. `ENV_FarBank` is a torus, so its top is a
         function of radius; `bank_z` below derives it instead of guessing.

    The angles now stay inside 0-180 degrees, which is the half of the ring
    that is actually behind the island and in shot.
    """
    bank_r, bank_tube = 11.5, 3.4       # must track ENV_FarBank in build_banks
    bank_squash = 0.42

    def bank_z(r):
        """Top surface of the far-bank torus at radius r from the island."""
        d = min(abs(r - bank_r) / bank_tube, 1.0)
        return (WATER_Z - 0.30) + bank_tube * bank_squash * math.sqrt(1.0 - d * d)

    # Rolling mounds so the bank's top edge is not a clean arc. The notch the
    # waterfall runs through is a feature of this bank, so mounds that would
    # bury it are skipped rather than nudged — the first pass parked a 4.6 x
    # 3.7 m mound directly on top of it and the cascade vanished.
    fall_x, fall_y = -9.4, 9.2
    for i in range(14):
        a = math.radians(16.0 + i * 11.0)
        r = 10.6 + (i % 3) * 0.85
        x, y = math.cos(a) * r, math.sin(a) * r
        rad = 1.25 + (i % 4) * 0.45
        if math.hypot(x - fall_x, y - fall_y) < rad * 1.5 + 1.4:
            continue
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=16, ring_count=9, radius=rad,
            location=(x, y, bank_z(r) + rad * 0.05))
        m = bpy.context.object
        m.name = f"ENV_BankMound_{i:02d}"
        m.scale = (1.5, 1.2, 0.44)
        assign(m, MAT["grass_dark"] if i % 2 else MAT["grass"])
        link(m, col)

    # Low shrubs dotted along it. Deliberately capped under 1 m: `Bush` is a
    # measured category ("waist-to-shoulder on the character"), and a bank
    # thicket sized by eye at this distance would have failed it at 0.86 x.
    for i in range(9):
        a = math.radians(22.0 + i * 17.0)
        r = 12.3
        x, y = math.cos(a) * r, math.sin(a) * r
        rad = 0.40 + (i % 3) * 0.11
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=rad,
                                             location=(x, y, bank_z(r) + rad * 0.18))
        b = bpy.context.object
        b.name = f"ENV_BankBush_{i}"
        b.scale = (1.3, 1.1, 0.78)
        assign(b, MAT["leaf"] if i % 2 else MAT["leaf_dark"])
        link(b, col)

    # THE SKYLINE. Trunk 5.2-5.4 m = 4.0-4.15 x the character, which puts the
    # crown top at 1.13 x that, ~5.9 m — and the production camera's top edge
    # at this depth is 5.9 m. So these are the tallest trees the frame can
    # hold, which is what "reads as distance, never walked under" should mean.
    #
    # POSITIONS ARE CHOSEN IN SCREEN SPACE, not as a tidy arc, and the first
    # attempt at them is why: two of the four landed at frame x = 479 and 877,
    # and the two island trees are at 480 and 815. Concentric crowns at two
    # depths do not read as two trees, they read as one green ceiling, and the
    # rainbow went out behind it. These four sit at roughly x = 215, 375, 985
    # and 1155 of 1280, interleaved with the island pair and leaving the middle
    # third of the frame — where the rainbow arcs and MARK_TitleZoneHero sits —
    # open sky. All four stay clear of the waterfall notch at (-9.4, 9.2).
    for i, (x, y, trunk_h, twist) in enumerate((
        (-7.12, 10.90, 5.35, 0.0),
        (-4.67, 12.15, 5.20, 1.3),
        (5.94, 11.55, 5.25, 2.4),
        (8.31, 10.00, 5.40, 0.8),
    )):
        r = math.hypot(x, y)
        build_tree(f"ENV_BankTree_{i}", (x, y, bank_z(r) - 0.55), col, trunk_h,
                   crown_r=trunk_h * 0.28, blossom=(i % 2 == 0), twist=twist)


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
    """Reeds at the water's edge — the ladder rung between grass and tree.

    TWO THINGS WERE WRONG, and they were the same thing twice.

    The heights: 1.3-2.1 m, i.e. 1.0-1.6 x the character. `world_audit` calls
    that a hedge and it is right — the reeds were the tallest thing in the world
    relative to what they should be, which is how the scale hierarchy came out
    INVERTED. They are now 0.52-0.92 m, ground cover the lion stands beside.

    The places: (+-7 to 8.5, -5 to -6.6), described in the old docstring as "the
    depth cue closest to camera". They are not in the production frame at all —
    the bottom edge of that frame crosses the water at y = -2.9, and everything
    here was 3 m below it and 4 m outside it. A depth cue nobody can see is not
    a depth cue. They now ring the island's own waterline, where they double as
    the join between the rim stones and the river, plus two clumps at the foot
    of the far bank.
    """
    # Kept at r = 2.7-2.9, just outside the rim stones. The first pass had them
    # at r = 3.7-3.8, far enough out that they read as reeds growing in open
    # water rather than as the join between the island's stone rim and the
    # river, which is the job.
    clumps = [
        (-2.35, -1.35, 0.78), (2.45, -1.15, 0.72),      # flanking the island front
        (-2.80, 0.45, 0.86), (2.85, 0.30, 0.92),        # island sides
        (-1.85, 2.05, 0.68), (1.95, 2.10, 0.74),        # behind the island
        (-4.60, 7.30, 0.62), (5.10, 6.90, 0.58),        # foot of the far bank
    ]
    def _reed_tilt(k):
        return math.radians(9.0 + (k % 3) * 4.0)

    for i, (x, y, h) in enumerate(clumps):
        splay = i * 0.9                                 # each clump leans its own way
        blades = 5
        for k in range(blades):
            bh = h * (0.66 + 0.09 * k)                  # a clump is not a comb
            bx = x + (k - (blades - 1) * 0.5) * 0.12
            by = y + (k % 2) * 0.11
            bpy.ops.mesh.primitive_cone_add(
                vertices=6, radius1=h * 0.055, radius2=h * 0.010, depth=bh,
                location=(bx, by, WATER_Z + bh * 0.5))
            r = bpy.context.object
            r.name = f"ENV_Reed_{i}_{k}"
            # Lean, then spin the lean around: four rigid verticals read as
            # drinking straws, and the only thing that costs is two numbers.
            r.rotation_euler = (_reed_tilt(k), 0.0, splay + k * 1.15)
            assign(r, MAT["leaf"] if k % 2 else MAT["grass_dark"])
            link(r, col)

        # A seed head on two of the blades. Twenty triangles apiece, and they
        # are what stops the clump reading as a bundle of green spikes.
        # Placed at the blade's ACTUAL tip: a cone rotated about its own centre
        # swings its top sideways by half its length times sin(tilt), and a head
        # dropped at the untilted x/y floats off the end of the stalk.
        for k in (2, 4):
            bh = h * (0.66 + 0.09 * k)
            tx, rz = _reed_tilt(k), splay + k * 1.15
            reach = bh * 0.46                           # just short of the tip
            bpy.ops.mesh.primitive_ico_sphere_add(
                subdivisions=1, radius=h * 0.085,
                location=(x + (k - (blades - 1) * 0.5) * 0.12
                          + math.sin(rz) * math.sin(tx) * reach,
                          y + (k % 2) * 0.11
                          - math.cos(rz) * math.sin(tx) * reach,
                          WATER_Z + bh * 0.5 + math.cos(tx) * reach))
            s = bpy.context.object
            s.name = f"ENV_ReedHead_{i}_{k}"
            s.scale = (0.62, 0.62, 1.35)
            assign(s, MAT["soil"] if k % 2 else MAT["grass_dark"])
            link(s, col)


# ── Camera, markers, lighting ───────────────────────────────────────────────

# ── Bridge ──────────────────────────────────────────────────────────────────
# Where the bridge goes, and why it is on the +X side rather than straight back.
#
# The production camera sits at roughly y = -12.9 looking toward +y, so the far
# bank, the waterfall and the hills are all BEHIND the island from the child's
# point of view. A bridge running back that way would be crossed largely out of
# sight behind the island's own dome — and the whole point of the crossing is
# that the child WATCHES the lion leave. On the +X side the deck is in profile
# to the camera, so the walk reads end to end.
BRIDGE_Y = 0.10                 # a hair off centre, so it does not fight the tail
BRIDGE_NEAR_X = 1.10            # the WALK-ON point; see the note below
BRIDGE_DECK_X0 = 1.45           # where the planks actually start, on the grass
BRIDGE_FAR_X = 8.90             # centre of the landing platform
BRIDGE_HALF_W = 0.45            # deck half width; the brain's corridor matches
BRIDGE_LANDING_R = 1.15
BRIDGE_RISE = 0.14              # how much the deck arcs up at its middle
BRIDGE_PLANKS = 22


def bridge_deck_z(t):
    """Deck height at fraction `t` along the span, 0 at the island end.

    A shallow arc rather than a straight ramp: the island end has to meet the
    dome at +0.255 and the landing sits near zero, and a straight line between
    them reads as a plank leaning on a rock. The sine term lifts the middle so
    it reads as a bridge.
    """
    a = island_surface_z(BRIDGE_DECK_X0, BRIDGE_Y)
    b = 0.02
    return a + (b - a) * t + BRIDGE_RISE * math.sin(math.pi * t)


def build_bridge(col):
    """Planks, railings and a landing, so the lion can walk out of this world.

    THE NEAR MARKER IS DELIBERATELY INSIDE THE ISLAND'S WALK CIRCLE.

    `MARK_BridgeNear` is at x 1.10 and the planks begin at x 1.66. That looks
    like an error and is the opposite: the runtime's walkable region is the
    island circle (radius 1.35, from MARK_WalkLeft/Right) UNION the bridge
    corridor, and if the corridor started where the planks do there would be a
    0.31 m ring belonging to neither. The lion would be clamped to the island
    rim, unable to reach a bridge it can see.

    So the marker names what the BRAIN needs — a corridor anchor that overlaps
    the circle — while the geometry starts where a bridge should start. See
    `LionBrain.setBridge` and `clampToWalkable`.
    """
    span = BRIDGE_FAR_X - BRIDGE_DECK_X0

    # Landing platform first: it defines the far end's height, so the deck has
    # something real to meet rather than a number someone picked.
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=20, radius=BRIDGE_LANDING_R, depth=0.34,
        location=(BRIDGE_FAR_X, BRIDGE_Y, -0.15))
    pad = bpy.context.object
    pad.name = "ENV_BridgeLanding"
    assign(pad, MAT["grass"])
    link(pad, col)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=20, radius=BRIDGE_LANDING_R * 0.98, depth=0.6,
        location=(BRIDGE_FAR_X, BRIDGE_Y, -0.52))
    skirt = pad and bpy.context.object
    skirt.name = "ENV_BridgeLandingSoil"
    assign(skirt, MAT["soil"])
    link(skirt, col)

    # Deck planks. Individual boxes rather than one long slab because the gaps
    # between them are the only thing that says "planks" at this distance, and
    # they cost 12 triangles each.
    for i in range(BRIDGE_PLANKS):
        t = (i + 0.5) / BRIDGE_PLANKS
        x = BRIDGE_DECK_X0 + span * t
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, BRIDGE_Y, bridge_deck_z(t)))
        pl = bpy.context.object
        pl.name = f"ENV_BridgePlank_{i:02d}"
        # SCALE IS THE FULL DIMENSION, not a half-extent. `primitive_cube_add`
        # with size=1.0 makes a unit cube, so `scale` sets the box's actual
        # width, and the first version of this treated it as a half-extent in
        # three places at once: the deck came out 0.45 m wide instead of 0.90
        # (a lion is 0.44 wide, so it barely fitted), the stringers spanned
        # half the bridge, and every rail segment was half its own length —
        # which is why the railing rendered as a row of floating bars.
        #
        # 0.82 of the plank pitch, so the gaps read as gaps. At 0.40 the gaps
        # are wider than the planks and the deck renders as a LADDER.
        pl.scale = (span / BRIDGE_PLANKS * 0.82, BRIDGE_HALF_W * 2.0, 0.07)
        assign(pl, MAT["plank"], smooth=False)
        link(pl, col)

    # Two stringers under the planks, so the deck is not floating on air when
    # seen from the eye-level review shot.
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(
            size=1.0, location=(BRIDGE_DECK_X0 + span * 0.5,
                                BRIDGE_Y + side * BRIDGE_HALF_W * 0.78,
                                bridge_deck_z(0.5) - 0.09))
        st = bpy.context.object
        st.name = f"ENV_BridgeStringer_{'R' if side > 0 else 'L'}"
        st.scale = (span, 0.05, 0.07)
        assign(st, MAT["plank_dark"], smooth=False)
        link(st, col)

    # Railings: posts plus a top rail, both sides. A bridge without a railing
    # over water reads as a plank, and the rail is also what gives the crossing
    # a sense of length as the lion passes each post.
    posts = 7
    for side in (-1, 1):
        for i in range(posts):
            t = i / (posts - 1)
            x = BRIDGE_DECK_X0 + span * t
            zb = bridge_deck_z(t)
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=6, radius=0.045, depth=0.42,
                location=(x, BRIDGE_Y + side * BRIDGE_HALF_W, zb + 0.19))
            po = bpy.context.object
            po.name = f"ENV_BridgePost_{'R' if side > 0 else 'L'}_{i}"
            assign(po, MAT["plank_dark"], smooth=False)
            link(po, col)

        # The rail follows the deck's arc in a few straight segments rather
        # than one long box, or it sinks into the deck at the middle.
        segs = posts - 1
        for i in range(segs):
            t0, t1 = i / segs, (i + 1) / segs
            x0 = BRIDGE_DECK_X0 + span * t0
            x1 = BRIDGE_DECK_X0 + span * t1
            z0 = bridge_deck_z(t0) + 0.38
            z1 = bridge_deck_z(t1) + 0.38
            bpy.ops.mesh.primitive_cube_add(
                size=1.0, location=((x0 + x1) / 2, BRIDGE_Y + side * BRIDGE_HALF_W,
                                    (z0 + z1) / 2))
            ra = bpy.context.object
            ra.name = f"ENV_BridgeRail_{'R' if side > 0 else 'L'}_{i}"
            # The DIAGONAL length, not the horizontal run, or each segment
            # falls short of the next post by 1/cos(slope) and the rail breaks
            # into pieces at the arc's steepest point.
            ra.scale = (math.hypot(x1 - x0, z1 - z0), 0.05, 0.05)
            ra.rotation_euler = (0.0, -math.atan2(z1 - z0, x1 - x0), 0.0)
            assign(ra, MAT["plank"], smooth=False)
            link(ra, col)

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
    # Set BACK from the island centre. At the hero camera distance a lion on the
    # centre mark stands directly behind the player cards, and its chest and
    # front paws are covered — which the art direction rules out. Moving the
    # mark rather than nudging the card layout keeps one authority for where the
    # character stands.
    m["spawn"] = empty("MARK_LionSpawn", (0.0, 0.42, island_surface_z(0.0, 0.42)), col, "SPHERE", 0.22)
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

    # Hero framing anchors. MARK_TitleZone and MARK_CardShelfZone were authored
    # against the wide establishing camera; the homepage dollies in so the
    # mascot reads as a hero, and at that distance the island's front edge —
    # where those two sit — is off the bottom of the screen entirely. Clamping
    # their projection would have been a lie dressed as an anchor, so the hero
    # composition gets its own authored anchors: title in the sky above the
    # lion, cards on the near slope of the island.
    m["title_hero"] = empty("MARK_TitleZoneHero",
                            (0.0, -0.30, island_surface_z(0, 0) + 2.12), col, "CUBE", 0.26)
    m["cards_hero"] = empty("MARK_CardShelfZoneHero",
                            (0.0, -1.55, island_surface_z(0.0, -1.55) + 0.10), col, "CUBE", 0.34)

    # THE BRIDGE'S TWO ENDS, read by name by `HomeWorld3D` and handed to
    # `LionBrain.setBridge`. The near one sits INSIDE the island's walk circle
    # on purpose — see the note in `build_bridge` for why a corridor that
    # started at the planks would leave the lion unable to reach them.
    m["bridge_near"] = empty("MARK_BridgeNear",
                             (BRIDGE_NEAR_X, BRIDGE_Y,
                              island_surface_z(BRIDGE_NEAR_X, BRIDGE_Y)),
                             col, "ARROWS", 0.20)
    m["bridge_far"] = empty("MARK_BridgeFar",
                            (BRIDGE_FAR_X, BRIDGE_Y, 0.02), col, "ARROWS", 0.20)
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
    build_island_edge(c_ground)
    build_bridge(c_props)
    build_water_detail(c_water)
    build_far_bank_detail(c_foliage)
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
