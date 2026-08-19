# Lion mascot pose assets

This folder is the **source of truth for lion art**. Drop pose PNGs in and they
render automatically — **no code changes required**. `GeneratedLion` probes for
each file and falls back to the `PremiumLion` SVG for any pose whose file is
missing, so poses can ship one at a time.

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
- Aim for **< 300 KB** each.

## How it resolves at runtime

```
MascotState  →  POSE_FOR_STATE  →  LionPose  →  /assets/lion/<pose>.png
 (LionMascot.tsx)                                    ↓ missing / 404
                                              PremiumLion SVG
```

`LionMascot` owns **state**; `GeneratedLion` owns **artwork and per-pose motion**
(breathing, float, sway, blink). Body-level motion — lift, lean, settle,
look-at — is applied by `LionMascot` on top of whichever artwork renders, so real
art inherits the existing character performance for free.

Callers only ever name a state:

```tsx
<LionMascot state="waving" size={200} />
```

No page hard-codes a filename.

## State → pose mapping

Every state maps to a pose of the same name, except:

- `attention` → `idle` art (it is a *lean toward the pointer*, not a new drawing)

## Adding a new pose

1. Add the key to `LionPose` and a path to `POSE_PATHS` in
   `src/components/GeneratedLion.tsx`.
2. Add a motion config to `POSE_MOTION` in the same file (or let it inherit
   `BASE_MOTION`).
3. Add the state to `MascotState` and `POSE_FOR_STATE` in
   `src/components/character/LionMascot.tsx`.
