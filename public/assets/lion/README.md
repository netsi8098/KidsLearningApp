# Lion mascot pose assets

This folder is the **source of truth for lion art**. `GeneratedLion` resolves
approved pose PNGs and passes them to the persistent real-time rig. Missing
emotional poses reuse `idle.png` so the mascot keeps one face, mane, body and
lighting style instead of changing character or falling back to the retired SVG.

**Current authored poses (2026-08-19):** `idle.png`, `waving.png`,
`thinking.png`, and `celebrating.png` (all 1223x1286). Other wired states reuse
`idle.png` until matching art is approved.

## Required files

Exact filenames, lowercase, `.png`. Anything else is ignored.

| File | Pose key | Used for | Pose direction |
|---|---|---|---|
| `idle.png` | `idle` | homepage resting, waiting, default presence | Neutral happy stance, relaxed arms, soft smile, stable feet — must suit a breathing/blinking loop |
| `waving.png` | `waving` | homepage welcome, greeting, player-select, onboarding entry | One paw raised in a friendly wave, open cheerful expression |
| `excited.png` | `excited` | activity start, discovery, CTA reinforcement | Bright eyes, wide smile, energetic — lifted a little above idle |
| `thinking.png` | `thinking` | question moments, "what next?", helper moments | Paw near chin, curious eyes, gentle thoughtful expression |
| `celebrating.png` | `celebrating` | major milestones, reward sequences | Raised paws, open-mouth joy, dynamic but readable |
| `encouraging.png` | `encouraging` | nudges, motivational prompts, "keep going" | Supportive, reassuring posture — positive but not overexcited |
| `surprised.png` | `surprised` | discovery and reveal moments | Delighted surprise (never fear), widened eyes, playful |
| `success.png` | `success` | correct answers, completed activities | Confident smile, proud stance — calmer than `celebrating` |
| `gentle-error.png` | `gentle-error` | empty states, "try again", network hiccups | Reassuring and kind; never sad or harsh |
| `loading.png` | `loading` | active loading / waiting sequences | Intentionally "busy" — suits a bob / inspect / foot-tap loop |
| `reading.png` | `reading` | stories, read-aloud, library | Holding or reading a book, focused warm expression |
| `pointing.png` | `pointing` | directional guidance, onboarding, spotlighting | One paw clearly guiding — must read at small sizes |

### Optional future expansions

Already wired — add the file and it works: `sleepy.png`, `listening.png`,
`sad-soft.png`, `clapping.png`, `jumping.png`.

## Image format

- **PNG with a transparent background.** No baked scene, no white rectangle, no
  ground plane — the world draws its own stage beneath the character.
- **No baked motion, glow, or shadow.** These are *pose stills*; code supplies
  breathing, blink, bob, sway, glow pulse and celebratory lift.
- **No text, no UI, no title.** (The old `-hero-clean.jpg` theme plates failed
  exactly this rule — they had a title and a fake Parent pill painted in.)

## Canvas and size

- **Minimum 1024 × 1024**, **preferred 1400 × 1400**, square.
- **Safe padding on all sides** — never crop ears, tail, paws, mane or the
  gesture hand. Leave room for bounce, hover and scale motion (~6% headroom).
- Rendered in-app at **120 / 160 / 200 / 240 / 320 px**, so they must stay crisp
  and readable when small. Gestures like `pointing` must survive 120 px.
- Keep **body scale, lighting direction, mane colour, fur rendering and face
  style identical across every pose** — otherwise the character appears to jump
  size or change style when its state changes.
- Target **< 500 KB** each after visual-quality review. The current four PNGs
  are approximately 1.3 MB each and remain an explicit optimization backlog.
  Workbox currently allows up to 5 MB per precached file.

## How it resolves at runtime

```
MascotState  →  POSE_FOR_STATE  →  LionPose  → approved pose PNG
 (LionMascot.tsx)                          ↓ pose art not yet approved
                                      /assets/lion/idle.png
                                                ↓
                              ArticulatedLion persistent SkinnedMesh
```

`LionMascot` owns **state**; `GeneratedLion` owns approved artwork resolution;
`ArticulatedLion` owns the 29-bone weighted mesh, arm/leg IK, face morphs,
speech timing, gaze, breathing, tail and mane springs. The homepage uses
`grounded` mode so outer wrappers do not float the paws off their stage.

Callers only ever name a state:

```tsx
<LionMascot state="waving" size={200} />
```

No page hard-codes a filename.

## State → pose mapping

Every state maps to a pose of the same name, except:

- `attention` → `idle` art (it is a *lean toward the pointer*, not a new drawing)

## Adding a new pose

1. Export the approved PNG with the exact filename above.
2. Add the pose key to `AVAILABLE_ART_POSES` in
   `src/components/GeneratedLion.tsx` so runtime resolution is deliberate.
3. If the state is new, add it to `LionPose`, `MascotState`, `POSE_PATHS` and
   `POSE_FOR_STATE`. Existing wired states need only the asset and availability
   update.
4. Verify idle, speaking, reduced-motion and 390/820/1440 responsive states.
