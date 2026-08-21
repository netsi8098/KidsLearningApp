# Asset Manifest - Kids Learning Fun

Current source of truth for the visual assets actively used by the app.

**Last reconciled:** 2026-08-19

## Homepage Worlds

The homepage is a layered live composition. Painted plates provide scenery;
React, SVG, Three.js and Framer Motion provide the lion, title, speech, controls,
cards, parallax and ambient motion.

| World | Active painted assets | Dimensions | Runtime component |
|---|---|---|---|
| Sunny Rainbow Meadow | `public/assets/worlds/sunny-meadow/backplate.webp`, `stage.png` | 1672x941, 1774x887 | `SunnyMeadowWorld.tsx` |
| Sky Islands Adventure | `public/assets/worlds/sky-islands/backplate.webp`, `stage.webp` | 1672x941, 1536x1024 | `SkyIslandsWorld.tsx` |
| River Garden | `public/assets/worlds/river-garden/backplate.webp`, `stage.webp` | 1672x941, 1536x1024 | `RiverGardenWorld.tsx` |
| Treehouse Village | `public/assets/worlds/treehouse/backplate.webp`; patio is part of the plate | 1672x941 | `TreehouseWorld.tsx` |

There are no active `public/assets/themes/*-hero*.jpg` files. The old full-page
hero-image approach was retired because it baked fake UI into scenery.

### Approved Reference Mapping

| World | Design reference on this workstation |
|---|---|
| Sunny Rainbow Meadow | `/Users/netsanettiruye/Downloads/ChatGPT Image Apr 23, 2026 at 03_18_20 PM.png` |
| Treehouse Village | `/Users/netsanettiruye/Downloads/ChatGPT Image Apr 23, 2026 at 03_18_28 PM.png` |
| River Garden | `/Users/netsanettiruye/Downloads/ChatGPT Image Apr 23, 2026 at 03_18_35 PM.png` |
| Sky Islands Adventure | `/Users/netsanettiruye/Downloads/ChatGPT Image Apr 23, 2026 at 03_18_40 PM.png` |

Detailed composition and responsive rules live in
`public/assets/worlds/README.md`.

## Lion Mascot

### Authored Art Present

| File | Dimensions | Runtime use |
|---|---|---|
| `public/assets/lion/idle.png` | 1223x1286 | Neutral/default art and fallback art for missing emotional poses |
| `public/assets/lion/waving.png` | 1223x1286 | Homepage greeting |
| `public/assets/lion/thinking.png` | 1223x1286 | Profile setup/question moments |
| `public/assets/lion/celebrating.png` | 1223x1286 | Celebration moments |

Each file is approximately 1.3 MB. They are below the current Workbox 5 MB
per-file ceiling, but should be optimized before a production performance pass.

### Live Character System

- `LionMascot.tsx` owns semantic state and caller API.
- `GeneratedLion.tsx` resolves authored pose art. Missing poses intentionally
  reuse `idle.png` to preserve character identity.
- `ArticulatedLion.tsx` renders one persistent Three.js `SkinnedMesh` with 29
  bones, weighted deformation, leg and waving-arm IK, seven morph targets,
  gaze/blinks, procedural tail and mane springs, speech timing and reduced-motion
  behavior.
- The approved Vidu clips are motion references only. They are never embedded,
  played as the mascot, or converted into sprite frames.

The detailed pose contract is in `public/assets/lion/README.md`.

### Missing Authored Poses

`excited`, `encouraging`, `surprised`, `success`, `gentle-error`, `loading`,
`reading`, `pointing`, `sleepy`, `listening`, `sad-soft`, `clapping`, and
`jumping` currently reuse the approved idle image while the live rig supplies
state-specific movement.

## Live Visual Systems

| System | Location | Status |
|---|---|---|
| Animated world title and Treehouse hanging plaque | `src/components/homepage/WorldTitle.tsx` | Active |
| Per-world scene composition | `src/components/homepage/worlds/` | Active for all four worlds |
| Theme selector previews | `src/components/homepage/ThemePicker.tsx` | Active |
| Player cards and contact shelves | `src/components/homepage/PlayerCard.tsx`, `ShelfSurface.tsx` | Active |
| Real-time lion rig | `src/components/character/ArticulatedLion.tsx` | Active |
| Movement activity badges | `src/components/svg/MotionAssetPack.tsx` | Active fallback art; premium replacement backlog |
| Story covers/page art | `src/components/svg/` | Active |
| Coloring templates | `src/components/coloring/`, `src/data/coloringData.tsx` | Active |

## Motion References

Primary Treehouse/lion reference reviewed frame by frame:

- `/Users/netsanettiruye/Downloads/vidu-video-3263005378019917.mp4`
- Alternate export: `/Users/netsanettiruye/Downloads/vidu-video-3263005378019917 (1).mp4`
- Approximately 5.08 seconds, 1920x1080, 24 fps.

Use these clips to study timing, weight transfer, gaze, articulated waving,
blinking, tail counter-motion, mane follow-through and settling. Do not ship the
videos as app UI.

## Remaining Asset Priorities

1. Optimize the four current lion PNGs while preserving alpha and visual quality.
2. Author missing lion poses from the same character source, not independent
   generations that change face, mane, proportions or lighting.
3. Replace movement-page fallback illustrations with matched step-specific art
   or a rig that can accurately demonstrate each instruction.
4. Add optional transparent world props only where they improve depth without
   covering the lion, title, player cards or reference landmarks.
5. Continue replacing prominent emoji content with the established SVG or
   authored-asset systems.

## Asset Rules

- No text, controls, sample profiles or mascot imagery may be baked into scenic
  world plates.
- The lion must have a visible contact surface; player cards need a world-native
  shelf or patio.
- Use WebP for opaque scenery and PNG for transparency-sensitive assets.
- Keep decorative motion in code and respect `prefers-reduced-motion`.
- Record source, license and date for any third-party asset.
- Current PWA maximum file size to precache is 5 MB, configured once in
  `vite.config.ts`.

---

## 3D assets — 2026-08-21

| Path | Size | Contents |
|---|---|---|
| `public/assets/worlds/river-garden/home_environment.glb` | 3.10 MB | 85,000 tris · 29 materials · 10 markers · baked AO in vertex colours · no lights, no cameras |
| `public/assets/lion/rigged/lion_v2.glb` | 2.14 MB | **proxy character in production use.** 2 meshes, 2 materials, 41 joints, 10 clips, `COLOR_0` |
| `public/assets/lion/rigged/locomotion.json` | — | measured walk stride + cycle length. Generated; do not hand-edit. |
| `public/assets/lion/cage/lion_cage_rigged.glb` | 63.5 KB | **production cage.** 961 verts, 1,918 tris, 35 deform joints, 0 control bones |
| `public/assets/lion/cage/lion_cage.glb` | 63.3 KB | cage before rigging, kept for topology review |
| `public/assets/lion/retopo/lion_retopo.glb` | 278.5 KB | superseded Quadriflow pass |
| `public/assets/lion/rigged/lion.glb` | 2.51 MB | superseded first rig |

**Missing art, still tracked:** `assets/worlds/river-garden/stage.webp` and
`assets/worlds/sky-islands/stage.webp` were never produced. Both worlds now fail
the image silently instead of painting a broken-image box on the live homepage.

Every GLB passes `gltf-transform validate` with no errors or warnings.
`@gltf-transform/cli` is installed for the compression pass (meshopt, KTX2) —
not yet applied, since there are no textures yet.
