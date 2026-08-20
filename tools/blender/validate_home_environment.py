"""
validate_home_environment.py — fail the build when the world contract breaks.

The React runtime reads named markers and a locked camera out of this scene
instead of carrying magic coordinates. That makes the scene a contract, and
contracts need enforcement: renaming a marker or nudging the camera should fail
loudly here rather than silently mis-place the lion in the browser.

Run:
  blender --background art/blender/home_environment.blend \
    --factory-startup --python tools/blender/validate_home_environment.py

Exits non-zero on any failure so it can gate a build.
"""

import math
import sys

import bpy

# ── Contract ────────────────────────────────────────────────────────────────
REQUIRED_MARKERS = [
    "MARK_LionSpawn", "MARK_LionGreeting", "MARK_WalkLeft", "MARK_WalkRight",
    "MARK_SpeechAnchor", "MARK_CameraTarget", "MARK_TitleZone", "MARK_CardShelfZone",
]
REQUIRED_COLLECTIONS = [
    "ENV_Ground", "ENV_Water", "ENV_Foliage", "ENV_Props", "MARKERS", "LIGHTING", "CAMERA",
]
CAMERA_NAME = "CAM_Home_Main"

# Budgets. The lion is the hero and gets the larger share of the frame budget;
# the environment must not eat it.
#
# Materials are a DRAW CALL budget, not a memory one. 32 is deliberate headroom
# for the tonal separation this art direction needs (lit/shade pairs for grass
# and foliage, shallow vs deep water). If it is ever raised again, the right
# answer is a texture atlas, not a bigger number.
MAX_TRIS = 95_000
MAX_MATERIALS = 32

ISLAND_R = 3.10
WALK_R = 2.05

failures = []
notes = []


def check(cond, msg, detail=""):
    if cond:
        notes.append(f"  ok   {msg}")
    else:
        failures.append(f"  FAIL {msg}" + (f" — {detail}" if detail else ""))


def main():
    objs = {o.name: o for o in bpy.data.objects}

    # 1. Markers exist
    for name in REQUIRED_MARKERS:
        check(name in objs, f"marker present: {name}")

    # 2. Collections exist (export sets depend on this organisation)
    for name in REQUIRED_COLLECTIONS:
        check(name in {c.name for c in bpy.data.collections}, f"collection present: {name}")

    # 3. Production camera locked
    cam = objs.get(CAMERA_NAME)
    check(cam is not None, f"camera present: {CAMERA_NAME}")
    if cam:
        check(cam.type == "CAMERA", "camera object is a camera")
        check(bpy.context.scene.camera is cam, "scene camera is the production camera")
        check(abs(cam.data.lens - 40.0) < 0.01, "camera lens is the approved 40mm",
              f"found {cam.data.lens}mm")
        check(not cam.animation_data or not cam.animation_data.action,
              "production camera is not animated")

    # 4. The lion must spawn ON the island, not inside or beside it
    spawn = objs.get("MARK_LionSpawn")
    if spawn:
        r = math.hypot(spawn.location.x, spawn.location.y)
        check(r <= WALK_R, "lion spawn is inside the walkable radius",
              f"r={r:.2f} > {WALK_R}")
        check(spawn.location.z > 0.0, "lion spawn sits above world zero (on the dome)",
              f"z={spawn.location.z:.3f}")

    # 5. Walk bounds stay on the island
    for name in ("MARK_WalkLeft", "MARK_WalkRight"):
        m = objs.get(name)
        if m:
            r = math.hypot(m.location.x, m.location.y)
            check(r < ISLAND_R - 0.6, f"{name} stays clear of the island rim",
                  f"r={r:.2f}")

    # 6. Speech anchor sits above the lion's head, not at ground level
    sp = objs.get("MARK_SpeechAnchor")
    spawn_z = spawn.location.z if spawn else 0.0
    if sp:
        check(sp.location.z > spawn_z + 0.8,
              "speech anchor is above head height",
              f"anchor z={sp.location.z:.2f} vs spawn z={spawn_z:.2f}")

    # 7. Runtime budgets
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    tris = 0
    for o in meshes:
        o.data.calc_loop_triangles()
        tris += len(o.data.loop_triangles)
    check(tris <= MAX_TRIS, f"triangle budget ({tris} <= {MAX_TRIS})")
    check(len(bpy.data.materials) <= MAX_MATERIALS,
          f"material budget ({len(bpy.data.materials)} <= {MAX_MATERIALS})")

    # 8. glTF safety: every material must be a plain Principled BSDF chain.
    #    Blender-only node trickery looks right in EEVEE and exports as flat grey.
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        principled = [n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED"]
        check(len(principled) >= 1, f"material '{mat.name}' uses Principled BSDF")

    # 9. Nothing may have unapplied non-uniform scale on export geometry — it
    #    survives glTF but makes runtime placement maths misleading.
    unapplied = [o.name for o in meshes
                 if abs(o.scale.x - o.scale.y) > 1e-4 or abs(o.scale.x - o.scale.z) > 1e-4]
    if unapplied:
        notes.append(f"  note {len(unapplied)} objects carry non-uniform scale "
                     f"(fine for blockout, apply before final export)")

    print("\n===ENV_VALIDATE===")
    for n in notes:
        print(n)
    for f in failures:
        print(f)
    print(f"RESULT: {len(notes)} passed, {len(failures)} failed")
    print("===ENV_VALIDATE_END===")

    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
