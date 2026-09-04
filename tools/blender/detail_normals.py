"""
detail_normals.py — the surface-detail stage the lion pipeline never had.

WHY THIS EXISTS

The shipped lion GLB carried ZERO images and ZERO textures: three flat
materials and a vertex-colour attribute. Every piece of surface detail the
approved reference gets from maps, this asset was being asked to get from
geometry and flat colour — and the previous pass measured exactly how far that
can go. Baking cavity and curvature into the coat bought +20% of local contrast
on the mane and moved its mean luminance by 5 of 255, because an ALBEDO
modulation has to fight the light rather than work with it.

A normal map modulates the LIGHTING. That is the difference, and it is why this
is the stage that actually closes the gap.

WHERE THE DETAIL COMES FROM

A normal map is usually baked from a high-poly sculpt onto a low-poly cage, and
there is no sculpt here — this asset is script-built end to end, and a self-bake
of the mesh onto itself returns flat (0.502, 0.502, 1.0), which is what the
feasibility probe found.

So the detail is authored PROCEDURALLY in the shader and baked out of it.
Blender's `NORMAL` bake pass includes whatever is wired into the material's
Normal input, so a Bump node driven by stretched noise becomes a normal map in
one operator call. The procedural nodes are then removed and the baked image is
wired back in their place, so what ships is a texture and not a node tree the
glTF exporter would have to approximate.

AND THE MEASUREMENT HAD TO CHANGE TOO

Global contrast — the standard deviation of the render's luminance — cannot see
this. Measured on the raked mane it goes 43.0 -> 40.0 as the normal map is
turned up, i.e. DOWN, while the mane visibly gains strand detail. Contrast is a
large-scale statistic and this is fine structure. High-frequency energy, the
mean absolute difference between the render and a 2.5-pixel blur of itself,
tracks it properly: 1.97 flat -> 3.86 at the shipped strength, +96%.

Two surfaces, two different detail fields, and the anisotropy is the point:

  * THE MANE gets noise stretched VERTICALLY. Its locks hang and sweep
    downward, so detail that is fine across the strand and smooth along it
    reads as hair; isotropic noise on a mane reads as gravel.
  * THE BODY gets a fine, near-isotropic nap — the velvet surface the
    reference has, which is much subtler than the mane's.

THE MATERIALS HAD TO SPLIT

`LionCage` and `LionMane` both used `Face_Matte`. One material cannot carry two
different normal maps, so the mane gets its own. This costs NO draw calls: the
two were already separate meshes because the mane is appended after
`join_by_material` runs, so the count stays at four.

UVs

The mane had no UV layer at all and the cage's used 15% of the space with
67,000 loops in it — overlapping, and useless for baking anything unique.
`smart_project` runs headless (verified) and takes the mane to 66%. Unwrapping
happens here, after the join, so there is one island set per shipped mesh.

Run via `assemble_lion.py`. Not a standalone entry point: it needs the joined,
rest-position, morph-neutral scene the assembler has at stage 3d.
"""

import os

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEX_DIR = os.path.join(REPO, "art", "blender", "textures")

# Resolution per surface, and THE BODY IS OFF BY DEFAULT — measured, not
# squeamishness.
#
# The images are not what a normal map costs on this asset. `smart_project`
# cuts seams, seams SPLIT VERTICES, and every split vertex is multiplied by the
# mesh's morph-target count:
#
#     mesh        verts before  after   morphs   what the split costs
#     LionCage       16,795     20,209    16     ~655 KB of morph deltas
#     LionMane       19,735     23,995     0     ~256 KB, attributes only
#
# The cage carries all 16 morphs, so unwrapping it is the single most expensive
# thing in the file — this asset's own header already warns that at L2 the
# deltas are 3.1 MB on their own. Mapping both surfaces took the GLB to 6.13 MB
# against a 6.00 MB contract and failed validation.
#
# And the value is the other way round. The mane is what this whole stage is
# FOR: its locks are the detail the reference has and the asset does not. The
# body's nap is deliberately subtle — the reference's body is smooth stylised
# fur, not visible pile. So the expensive surface is the one with least to
# gain, and the cheap surface is the one with most.
#
# THAT WAS TRUE OF A BAKED ATLAS AND IS NO LONGER TRUE. The body now gets a
# generated, seamless, TILED nap over a cylinder projection instead, which
# costs +35 KB of morph deltas rather than +640 and a 256 image rather than a
# 512 atlas. It is on by default. See `nap_map` and `_tiling_nap`.
# 512, not 1024. The relief is a matter of SLOPE, not resolution — at 1024
# the PNG was 1.27 MB of incompressible noise and took the GLB to 6.10 MB
# against a 6.00 MB contract, for detail that reads identically at 512.
MANE_RES = int(os.environ.get("LION_MANE_NRM_RES", "384"))
BODY_RES = int(os.environ.get("LION_BODY_NRM_RES", "128"))
BODY_ENABLED = os.environ.get("LION_BODY_NRM", "1") != "0"
# How many times the nap repeats across the cylinder, and how wide a
# feature is in map pixels. Together these set the real-world grain.
BODY_TILES = float(os.environ.get("LION_BODY_TILES", "9.0"))
BODY_FEATURE_PX = float(os.environ.get("LION_BODY_FEATURE_PX", "4.0"))
# Spectral slope of the body nap HEIGHT field: amplitude ~ 1/r**NAP_BETA.
#
# 1.2, not 0.8, and the reason is that the PNG stores the height's GRADIENT.
# Differentiation multiplies a spectrum by r, so a height field at 1/r**0.8
# hands the normal map 1/r**-0.2 — rising with frequency — and the quartic
# rolloff then turns that rise into a peak. Measured on the generator, the
# gradient's radial power peaks at r=17 of 64 for beta 0.8, which is a preferred
# cell size and therefore the dimples again, one derivative later.
#
# beta 1.2 puts the gradient at 1/r**0.2 — near-white, no preferred scale, which
# is what "a fine even pile with no direction" asks for. The radial peak moves
# to r=3, i.e. monotone. Steeper is worse in the other direction: beta 2.0 gives
# pink NORMALS, which read as large soft blotches rather than nap.
NAP_BETA = float(os.environ.get("LION_NAP_BETA", "1.2"))
# The eye centres, from `lion_skeleton`'s own eye bones, and how far the
# nap is held off them. See the mask in `nap_map`.
EYE_X, EYE_Y, EYE_Z = 0.095, 0.580, 0.6564
EYE_MASK_R = float(os.environ.get("LION_EYE_MASK_R", "0.058"))
BAKE_SAMPLES = int(os.environ.get("LION_NRM_SAMPLES", "4"))

# Detail strength, in Bump-node units before baking. The mane's is far stronger
# than the body's for the same reason its resolution is.
# 12, and the first value was 0.55 — which produced a real map with a 4.5
# degree tilt, invisible in every render. The Sobel scaling needed an order
# of magnitude more, and the sweep is in the commit: 4 -> +32% of
# high-frequency energy, 12 -> +96%, 30 -> +131%. 12 is the knee; 30 starts
# to read as noise rather than hair.
# 8, down from 12, and the sweep is in `tools/cad/nap_qa.py`'s gate. With the
# radial fan the relief is directional, so less of it reads as more hair rather
# than less: bump 8 is both SOFTER and more uniformly elongated than 12 (side
# 1.64 against 1.23), and 18 chased the reference's amplitude number into a
# render that read as coarse corduroy.
MANE_BUMP = float(os.environ.get("LION_MANE_BUMP", "8.0"))
BODY_BUMP = float(os.environ.get("LION_BODY_BUMP", "4.0"))
# How much the normal map is applied at render time, 0..1+. Separate from the
# bake strength so the look can be tuned without a rebake.
MANE_SCALE = float(os.environ.get("LION_MANE_NRM_SCALE", "1.0"))
# How far the mane's noise is squashed along object Z, and how fine it is.
# Tunable because the anisotropy is the whole point of the mane's field and it
# has to be measured in the RENDER, not asserted in the node graph.
MANE_STRETCH_Z = float(os.environ.get("LION_MANE_STRETCH_Z", "0.22"))
MANE_DETAIL_SCALE = float(os.environ.get("LION_MANE_DETAIL", "11.0"))
MANE_OCTAVES = float(os.environ.get("LION_MANE_OCTAVES", "3.0"))
# The radial fan the mane's noise is sampled in. See `_procedural_height`.
# FAN_Z is the mane's own axis height — `mane_foundation` builds every ring
# about (0, y, face_centre_front.h) and 0.604 is that value.
FAN_Z = float(os.environ.get("LION_MANE_FAN_Z", "0.604"))

FAN_ACROSS = float(os.environ.get("LION_MANE_FAN_ACROSS", "5.0"))
FAN_ALONG = float(os.environ.get("LION_MANE_FAN_ALONG", "0.4"))
BODY_SCALE = float(os.environ.get("LION_BODY_NRM_SCALE", "0.12"))


def unwrap(obj, margin=0.006):
    """Smart-project `obj` in place, replacing any existing layout."""
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=margin)
    bpy.ops.object.mode_set(mode="OBJECT")
    uv = obj.data.uv_layers.active
    cells = set()
    for d in uv.data:
        cells.add((int(min(0.999, max(0.0, d.uv.x)) * 64),
                   int(min(0.999, max(0.0, d.uv.y)) * 64)))
    frac = len(cells) / 4096.0
    print(f"[nrm] {obj.name}: unwrapped, {frac:.0%} of UV space used")
    return frac


def _procedural_height(nt, bsdf, stretch, detail_scale):
    """Wire stretched noise into EMISSION, so the bake returns a HEIGHT field.

    NOT a Bump node, and that is the whole point of this function.

    The obvious construction is noise -> Bump -> the BSDF's Normal input, and
    then `bake(type="NORMAL")`, which does include the material's normal input.
    It bakes FLAT. Measured on the result: standard deviation 0.009 on both R
    and G, against 0.502/0.502 for a flat tangent normal — the 0.000..0.988
    range it reported was a handful of seam pixels, and a min/max check was
    fooled by them where a standard deviation was not.

    The reason is that `ShaderNodeBump` derives its slope from SCREEN-SPACE
    derivatives of its height input. A bake has no screen space, so the
    derivatives are degenerate and the node contributes nothing. This is a
    property of the node, not of the noise or the strength.

    So the noise is baked as a scalar through the EMIT pass, which returns the
    node value untouched, and the height-to-normal conversion is done
    afterwards in numpy where the derivatives are real pixels.

    Object coordinates rather than UV, deliberately. `smart_project` cuts a
    surface into islands with arbitrary orientation, so a UV-driven field would
    change direction at every seam and the strands would visibly break. Object
    space is continuous across the whole form.

    A RADIAL FAN, NOT ONE SQUASHED AXIS, and the measurement is why.

    This used to squash the noise along object Z — `mapping.Scale = (1,1,0.22)`
    — on the reasoning that "a mane's locks hang downward". Some of them do. The
    locks on the flanks hang, the ones on the crown run outward and the ones on
    the sides sweep back, so one global axis can only align with a third of the
    mane. Measured as the elongation of the rendered grain (the ratio of the
    major to minor eigenvalue of its power spectrum's second-moment matrix,
    which is direction-agnostic), against the reference artwork's 2.24:

        stretch Z    front   side    3/4
        0.22 shipped  1.43   1.04   1.46
        0.06          1.72   1.16   1.72
        0.02          1.83   1.16   1.72

    It saturates. Squashing harder buys nothing after 0.06 and the SIDE never
    moves at all, because no amount of Z-stretching aligns with a lock that runs
    along Y.

    `reference_model.json` already said what the field should be — "a mane is a
    radial fan around the face opening, not a tube swept backward" — and that is
    a curvilinear frame, not an axis. So the noise is sampled at

        v = normalize(d_xz) * FAN_ACROSS + d * FAN_ALONG

    where d is the object position relative to the mane's own axis height.
    Moving ACROSS a lock turns `normalize(d_xz)` quickly, so the field varies
    fast; moving ALONG one leaves it unchanged and only the small `d` term
    advances, so the field varies slowly. The elongation is about
    (FAN_ACROSS / r) / FAN_ALONG, roughly 16:1 at the mane's own radius, and it
    holds that ratio in every direction the locks actually run.
    """
    coord = nt.nodes.new("ShaderNodeTexCoord")
    coord.location = (-1700, -320)
    # d = object position - the mane's own axis height, so the fan is centred
    # where the mane radiates from rather than on the world origin.
    off = nt.nodes.new("ShaderNodeVectorMath")
    off.location = (-1500, -320)
    off.operation = "SUBTRACT"
    off.inputs[1].default_value = (0.0, 0.0, FAN_Z)
    # d with Y REMOVED, so the fan's angle is measured in the x-z plane.
    #
    # Fanning in 3D from a point at the face OPENING is the more obvious
    # reading of "a radial fan around the face opening", and it measured worse
    # everywhere: with the origin on the face plane, `d` points mostly backward
    # for every point on the mane, so `normalize(d)` barely turns and the field
    # goes flat. Elongation front 2.61 -> 1.40, 3/4 2.31 -> 1.68, side
    # unchanged at 1.24, mean 2.05 -> 1.44. The x-z fan keeps `normalize(d)`
    # turning through a full revolution around the axis, which is where the
    # variation has to come from.
    flat = nt.nodes.new("ShaderNodeVectorMath")
    flat.location = (-1300, -420)
    flat.operation = "MULTIPLY"
    flat.inputs[1].default_value = (1.0, 0.0, 1.0)
    norm = nt.nodes.new("ShaderNodeVectorMath")
    norm.location = (-1150, -420)
    norm.operation = "NORMALIZE"
    ang = nt.nodes.new("ShaderNodeVectorMath")
    ang.location = (-1000, -420)
    ang.operation = "SCALE"
    ang.inputs["Scale"].default_value = FAN_ACROSS
    rad = nt.nodes.new("ShaderNodeVectorMath")
    rad.location = (-1000, -240)
    rad.operation = "SCALE"
    rad.inputs["Scale"].default_value = FAN_ALONG
    add = nt.nodes.new("ShaderNodeVectorMath")
    add.location = (-850, -320)
    add.operation = "ADD"
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-700, -320)
    noise.inputs["Scale"].default_value = detail_scale
    noise.inputs["Detail"].default_value = MANE_OCTAVES
    if "Roughness" in noise.inputs:
        noise.inputs["Roughness"].default_value = 0.62

    nt.links.new(coord.outputs["Object"], off.inputs[0])
    nt.links.new(off.outputs["Vector"], flat.inputs[0])
    nt.links.new(flat.outputs["Vector"], norm.inputs[0])
    nt.links.new(norm.outputs["Vector"], ang.inputs[0])
    nt.links.new(off.outputs["Vector"], rad.inputs[0])
    nt.links.new(ang.outputs["Vector"], add.inputs[0])
    nt.links.new(rad.outputs["Vector"], add.inputs[1])
    nt.links.new(add.outputs["Vector"], noise.inputs["Vector"])
    made = [coord, off, flat, norm, ang, rad, add, noise]

    # EMIT bakes the emission colour, so the height has to arrive there. The
    # base colour is left alone: the coat's vertex colours are already in it.
    emit_in = "Emission Color" if "Emission Color" in bsdf.inputs else "Emission"
    nt.links.new(noise.outputs["Fac"], bsdf.inputs[emit_in])
    keep_strength = None
    if "Emission Strength" in bsdf.inputs:
        keep_strength = bsdf.inputs["Emission Strength"].default_value
        bsdf.inputs["Emission Strength"].default_value = 1.0
    return made, emit_in, keep_strength


def _height_to_normal(height, strength):
    """Sobel the height field into a tangent-space normal map.

    Done here rather than in Blender because this is where the derivatives are
    real: adjacent PIXELS of a baked image, not screen-space derivatives that a
    bake does not have.

    The gradient is scaled by the resolution so `strength` means the same thing
    at 512 and at 1024 — otherwise doubling the map would halve the relief.
    """
    import numpy as np

    res = height.shape[0]
    gy, gx = np.gradient(height.astype(np.float32))
    k = strength * res / 256.0
    nx = -gx * k
    ny = -gy * k
    nz = np.ones_like(nx)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    out = np.empty((res, res, 4), dtype=np.float32)
    out[..., 0] = nx / ln * 0.5 + 0.5
    out[..., 1] = ny / ln * 0.5 + 0.5
    out[..., 2] = nz / ln * 0.5 + 0.5
    out[..., 3] = 1.0
    return out


def bake_normal(obj, name, res, stretch, bump, detail_scale, nrm_scale):
    """Bake a height field, convert it to a normal map, and wire it in.

    TANGENT SPACE, because glTF's `normalTexture` is tangent-space by
    definition. The asset ships no TANGENT attribute, so three.js derives the
    tangent frame from the UVs.
    """
    import numpy as np

    me = obj.data
    if not me.materials:
        print(f"[nrm] {obj.name}: no material — skipped")
        return None
    mat = me.materials[0]
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    if bsdf is None:
        print(f"[nrm] {obj.name}: material '{mat.name}' has no Principled BSDF")
        return None

    temp, emit_in, keep_strength = _procedural_height(nt, bsdf, stretch, detail_scale)

    hgt = bpy.data.images.new(f"{name}_h", res, res, alpha=False, float_buffer=True)
    hgt.colorspace_settings.name = "Non-Color"
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = hgt
    tex.location = (-1100, 320)
    nt.nodes.active = tex

    sc = bpy.context.scene
    keep_engine = sc.render.engine
    sc.render.engine = "CYCLES"
    sc.cycles.samples = BAKE_SAMPLES
    sc.cycles.use_denoising = False
    sc.cycles.device = "CPU"
    sc.render.bake.target = "IMAGE_TEXTURES"
    sc.render.bake.use_selected_to_active = False
    sc.render.bake.margin = max(4, res // 128)

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    ok = True
    try:
        bpy.ops.object.bake(type="EMIT")
    except Exception as exc:                          # noqa: BLE001
        print(f"[nrm] {obj.name}: height bake FAILED: {exc}")
        ok = False
    sc.render.engine = keep_engine

    # Unwire the procedural height before anything else can see it.
    for n in temp:
        nt.nodes.remove(n)
    if keep_strength is not None:
        bsdf.inputs["Emission Strength"].default_value = keep_strength
    if not ok:
        nt.nodes.remove(tex)
        bpy.data.images.remove(hgt)
        return None

    h = np.array(hgt.pixels[:], dtype=np.float32).reshape(res, res, 4)[..., 0]
    h_sd = float(h.std())
    nrm_px = _height_to_normal(h, bump)
    bpy.data.images.remove(hgt)

    img = bpy.data.images.new(name, res, res, alpha=False, float_buffer=False)
    img.colorspace_settings.name = "Non-Color"
    img.pixels = nrm_px.ravel().tolist()
    tex.image = img

    os.makedirs(TEX_DIR, exist_ok=True)
    path = os.path.join(TEX_DIR, f"{name}.png")
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()

    nrm = nt.nodes.new("ShaderNodeNormalMap")
    nrm.location = (-780, 320)
    nrm.inputs["Strength"].default_value = nrm_scale
    nt.links.new(tex.outputs["Color"], nrm.inputs["Color"])
    nt.links.new(nrm.outputs["Normal"], bsdf.inputs["Normal"])

    # STANDARD DEVIATION, not min/max. The first version of this check reported
    # a 0.000..0.988 range on a map whose actual deviation was 0.009 — the range
    # was a few seam pixels and the map was flat. A spread cannot be faked by
    # outliers.
    sd_r = float(nrm_px[..., 0].std())
    sd_g = float(nrm_px[..., 1].std())
    print(f"[nrm] {obj.name}: baked {res}x{res} -> {os.path.relpath(path, REPO)}  "
          f"height sd {h_sd:.4f}, normal sd R {sd_r:.4f} G {sd_g:.4f}, "
          f"strength {nrm_scale}")
    if sd_r < 0.02 and sd_g < 0.02:
        print(f"[nrm] WARNING {obj.name}: normal map is FLAT (sd {sd_r:.4f}) — "
              f"the procedural detail did not bake")
    return path


def _tiling_nap(res, feature_px, strength):
    """A SEAMLESS band-limited noise normal map, generated rather than baked.

    The body does not need a baked atlas and should not have one. Its nap is
    ISOTROPIC AND SCALE-FREE — the reference's body is smooth stylised fur, a
    fine even pile with no direction and no relationship to the form — so there
    is nothing for a surface bake to capture that a tiling map does not already
    say. The mane is the opposite and keeps its unique bake, because its strands
    have to follow the locks.

    Periodic by construction. The field is built in the FREQUENCY domain: white
    noise shaped by a radial spectrum, inverse FFT. An inverse FFT is periodic in
    both axes by definition, so the map tiles with no seam — the thing a
    spatial-domain noise cannot promise. The gradient is then taken with
    `np.roll`, which wraps, so even the normals match across the join.

    A POWER LAW, NOT A BAND-PASS, and the difference is the hexagons.

    This used to shape the noise with a Gaussian band-pass centred on
    `res / feature_px` — one dominant wavelength. Band-passed noise is not
    irregular: with a single preferred spacing its blobs pack against each other
    at that spacing, which is a hexagonal cellular field. It is the standard
    Turing/labyrinth spectrum, and it shipped as golf-ball dimples down the
    lion's flank, plainly visible in the running app.

    The paragraph above this one already said what was wanted — "ISOTROPIC AND
    SCALE-FREE" — and a band-pass imposes a scale by construction. So the
    spectrum is now `1 / r**NAP_BETA`, which is scale-free: no wavelength is
    preferred, so nothing packs, and the field is irregular at every scale the
    map can carry. `feature_px` survives only as the high-frequency rolloff, a
    soft quartic cutoff that keeps the finest features a few pixels across
    instead of aliasing at one.

    Measured by `tools/cad/nap_qa.py`, which compares a patch of plain gold coat
    against the same patch of the reference artwork after removing the shading
    gradient:

        image                sd     peak/mean
        REFERENCE          25.20        82.2
        band-pass          12.78       130.0    x1.58 as periodic
        power law           (see the gate output)
    """
    import numpy as np

    rng = np.random.default_rng(20260904)
    w = rng.standard_normal((res, res))
    fy = np.fft.fftfreq(res)[:, None] * res
    fx = np.fft.fftfreq(res)[None, :] * res
    r = np.hypot(fx, fy)
    r[0, 0] = 1.0
    amp = r ** (-NAP_BETA)
    # Soft quartic rolloff so the finest features stay a few pixels across.
    # `feature_px` is a rolloff scale now, not a resonance.
    cut = res / max(2.0, feature_px)
    amp = amp * np.exp(-((r / cut) ** 4))
    amp[0, 0] = 0.0
    h = np.real(np.fft.ifft2(np.fft.fft2(w) * amp))
    h /= (h.std() or 1.0)

    gx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5
    gy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 0.5
    nx, ny = -gx * strength, -gy * strength
    nz = np.ones_like(nx)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    out = np.empty((res, res, 4), dtype=np.float32)
    out[..., 0] = nx / ln * 0.5 + 0.5
    out[..., 1] = ny / ln * 0.5 + 0.5
    out[..., 2] = nz / ln * 0.5 + 0.5
    out[..., 3] = 1.0
    return out


def nap_map(obj, name, res, tiles, feature_px, strength, nrm_scale):
    """Cylinder-project `obj`, tile a generated nap over it, wire it in.

    CYLINDER, NOT SMART-PROJECT, and the difference is the whole reason the
    body was skipped last pass. Seams split vertices and every split vertex is
    multiplied by the mesh's 16 morph targets:

        smart_project   +3,414 export verts   +640 KB of morph deltas
        cylinder        +  187 export verts   + 35 KB

    Eighteen times cheaper, because a cylinder cuts one seam where an atlas cuts
    hundreds. Its distortion is irrelevant to a field with no direction in it.

    The UVs are then multiplied by `tiles` so a small map repeats instead of
    being stretched. glTF's default sampler wrap is REPEAT, so this needs no
    extra declaration — and a 256 map tiled eight times carries the detail of a
    2048 atlas for a fortieth of the bytes.
    """
    import numpy as np

    me = obj.data
    if not me.materials:
        return None
    mat = me.materials[0]
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    if bsdf is None:
        return None

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    # CUBE, NOT CYLINDER, and this cost a rebuild to learn.
    #
    # A cylinder is eighteen times cheaper in seams (+187 export verts against
    # +3,256) and unusable. It has POLES: where the surface faces the
    # projection axis the UVs converge and the map smears radially. Measured,
    # the stretch ratio's 99th percentile is 5.6x its median against 1.0x for a
    # cube. On this asset the poles land on the muzzle and the eye whites —
    # both of which are `Face_Matte` decals joined into `LionCage` — and the
    # nap rendered as radial scratch marks across the face. It was still
    # obviously wrong at a strength of 0.20, because a projection defect does
    # not fade with strength.
    #
    # A cube has no poles. It costs the seams, and the maps were shrunk to pay
    # for them.
    bpy.ops.uv.cube_project()
    bpy.ops.object.mode_set(mode="OBJECT")
    uv = me.uv_layers.active
    for d in uv.data:
        d.uv = (d.uv.x * tiles, d.uv.y * tiles)

    # THE EYE WHITES MUST STAY SMOOTH, and they are on this mesh.
    #
    # After `join_by_material` the sclera is part of `LionCage` — 280 verts
    # within 55 mm of the eye centre carry `Face_Matte` — so it inherits the
    # coat's nap and rendered as pebbled leather. An eye white is the one
    # surface on this character that must be glossy and clean, and a whole
    # earlier pass went into making the irises readable at all.
    #
    # glTF has a single `normalTexture` scale per material, so the nap cannot
    # be masked by strength. It CAN be masked by UV: pixel (0, 0) of the map is
    # forced to exactly flat, and every loop near an eye is snapped to the
    # centre of that pixel. Those faces then sample a perfectly flat normal and
    # are untouched, at no cost in geometry, materials or draw calls.
    #
    # Keyed on the eye bones' own measured positions rather than on colour: the
    # coat has cream regions that SHOULD have fur — the paws, the tail tuft —
    # so a luminance mask would strip the nap from exactly the wrong places.
    flat_uv = (0.5 / res, 0.5 / res)
    masked = 0
    for lp, d in zip(me.loops, uv.data):
        co = obj.matrix_world @ me.vertices[lp.vertex_index].co
        for ex in (EYE_X, -EYE_X):
            if (co - Vector((ex, EYE_Y, EYE_Z))).length < EYE_MASK_R:
                d.uv = flat_uv
                masked += 1
                break

    px = _tiling_nap(res, feature_px, strength)
    # The flat pixel the mask above points at. Exactly (0.5, 0.5, 1.0).
    px[0, 0, 0] = 0.5
    px[0, 0, 1] = 0.5
    px[0, 0, 2] = 1.0
    img = bpy.data.images.new(name, res, res, alpha=False, float_buffer=False)
    img.colorspace_settings.name = "Non-Color"
    img.pixels = px.ravel().tolist()

    os.makedirs(TEX_DIR, exist_ok=True)
    path = os.path.join(TEX_DIR, f"{name}.png")
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()

    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    tex.location = (-1100, 320)
    nrm = nt.nodes.new("ShaderNodeNormalMap")
    nrm.location = (-780, 320)
    nrm.inputs["Strength"].default_value = nrm_scale
    nt.links.new(tex.outputs["Color"], nrm.inputs["Color"])
    nt.links.new(nrm.outputs["Normal"], bsdf.inputs["Normal"])

    sd_r = float(px[..., 0].std())
    print(f"[nrm] {obj.name}: {masked} loops masked flat around the eyes")
    print(f"[nrm] {obj.name}: nap {res}x{res} tiled {tiles}x -> "
          f"{os.path.relpath(path, REPO)}  normal sd R {sd_r:.4f}, "
          f"strength {nrm_scale}")
    if sd_r < 0.02:
        print(f"[nrm] WARNING {obj.name}: nap map is FLAT (sd {sd_r:.4f})")
    return path


def split_mane_material(mane):
    """Give the mane its own material so it can carry its own normal map.

    `LionCage` and `LionMane` both used `Face_Matte`, and one material cannot
    hold two different maps. Copying it keeps every other property — the
    vertex-colour wiring, the roughness — and costs no draw call, because the
    two were already separate meshes.
    """
    if not mane.data.materials:
        return None
    src = mane.data.materials[0]
    if src.name.startswith("Mane_"):
        return src
    mat = src.copy()
    mat.name = "Mane_Matte"
    mane.data.materials[0] = mat
    print(f"[nrm] mane material split: '{src.name}' -> '{mat.name}'")
    return mat


def build(meshes):
    """Unwrap and normal-map the two coat surfaces. Returns paths written."""
    by_name = {o.name: o for o in meshes if o.type == "MESH"}
    mane = by_name.get("LionMane")
    cage = by_name.get("LionCage")
    written = []

    if mane is not None:
        split_mane_material(mane)
        unwrap(mane)
        # Z squashed to 0.22: the noise is sampled slowly up the mane and
        # quickly around it, so the grain runs with the locks.
        p = bake_normal(mane, "lion_mane_normal", MANE_RES,
                        (1.0, 1.0, MANE_STRETCH_Z), MANE_BUMP,
                        MANE_DETAIL_SCALE, MANE_SCALE)
        if p:
            written.append(p)

    if cage is not None and BODY_ENABLED:
        # A tiled, generated nap rather than a baked atlas — see `nap_map`.
        p = nap_map(cage, "lion_body_nap", BODY_RES, BODY_TILES,
                    BODY_FEATURE_PX, BODY_BUMP, BODY_SCALE)
        if p:
            written.append(p)

    return written
