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
# Set LION_BODY_NRM=1 to map the body too, and expect roughly 900 KB.
# 512, not 1024. The relief is a matter of SLOPE, not resolution — at 1024
# the PNG was 1.27 MB of incompressible noise and took the GLB to 6.10 MB
# against a 6.00 MB contract, for detail that reads identically at 512.
MANE_RES = int(os.environ.get("LION_MANE_NRM_RES", "512"))
BODY_RES = int(os.environ.get("LION_BODY_NRM_RES", "512"))
BODY_ENABLED = os.environ.get("LION_BODY_NRM", "0") != "0"
BAKE_SAMPLES = int(os.environ.get("LION_NRM_SAMPLES", "4"))

# Detail strength, in Bump-node units before baking. The mane's is far stronger
# than the body's for the same reason its resolution is.
# 12, and the first value was 0.55 — which produced a real map with a 4.5
# degree tilt, invisible in every render. The Sobel scaling needed an order
# of magnitude more, and the sweep is in the commit: 4 -> +32% of
# high-frequency energy, 12 -> +96%, 30 -> +131%. 12 is the knee; 30 starts
# to read as noise rather than hair.
MANE_BUMP = float(os.environ.get("LION_MANE_BUMP", "12.0"))
BODY_BUMP = float(os.environ.get("LION_BODY_BUMP", "4.0"))
# How much the normal map is applied at render time, 0..1+. Separate from the
# bake strength so the look can be tuned without a rebake.
MANE_SCALE = float(os.environ.get("LION_MANE_NRM_SCALE", "1.0"))
BODY_SCALE = float(os.environ.get("LION_BODY_NRM_SCALE", "0.7"))


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

    `stretch` squashes the noise along one axis. A mane's locks hang downward,
    so sampling Z slowly makes the noise fine ACROSS the strand and smooth
    ALONG it. Isotropic noise on a mane reads as gravel.
    """
    coord = nt.nodes.new("ShaderNodeTexCoord")
    coord.location = (-1100, -320)
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.location = (-900, -320)
    mapping.inputs["Scale"].default_value = stretch
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-700, -320)
    noise.inputs["Scale"].default_value = detail_scale
    noise.inputs["Detail"].default_value = 6.0
    if "Roughness" in noise.inputs:
        noise.inputs["Roughness"].default_value = 0.62

    made = [coord, mapping, noise]
    nt.links.new(coord.outputs["Object"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], noise.inputs["Vector"])

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
                        (1.0, 1.0, 0.22), MANE_BUMP, 26.0, MANE_SCALE)
        if p:
            written.append(p)

    if cage is not None and BODY_ENABLED:
        unwrap(cage)
        # Near-isotropic and much finer: a velvet nap, not hair.
        p = bake_normal(cage, "lion_body_normal", BODY_RES,
                        (1.0, 1.0, 0.75), BODY_BUMP, 54.0, BODY_SCALE)
        if p:
            written.append(p)

    return written
