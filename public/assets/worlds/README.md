# Homepage world assets

Each homepage world is a **layered live composition**, never a wallpaper. Today
every layer is drawn in code; painted plates dropped in here take over a layer
**individually**, and any plate that is absent leaves the code layer visible.

## Directory

```
public/assets/worlds/
  sunny-meadow/   sky-islands/   treehouse/   river-garden/   shared/
```

## Expected files per world

| File | Format | Purpose | Must NOT contain |
|---|---|---|---|
| `backplate.webp` | webp | Far environment: sky tone, distant hills, cloud banks, mountain silhouettes, atmospheric light | mascot, title, cards, any UI |
| `midground.webp` | webp | World-defining structures: waterfall, floating islands, treehouse body, rainbow, castle, planets, balloon, distant trees | mascot, title, cards, any UI |
| `stage.png` | png (transparent) | The hero platform the lion stands on: grass mound, wood deck, island top, riverbank ledge | the lion itself |
| `shelf.png` | png (transparent) | Foreground surface the player-card row rests on: cloud shelf, grassy bank, plank platform, riverbank lip | player cards, names, counts |
| `foreground.png` | png (transparent) | Close depth accents: flowers, leaves, vines, fence pieces, rocks, lanterns, bushes | anything covering the hero or cards |

### Master sizes

- **backplate / midground:** 1920×1080 minimum, **2560×1440 preferred**
- **stage / shelf / foreground:** ≥1600 px wide for horizontal plates
- Transparent elements: export large enough to stay sharp on desktop

One image never fits all — the renderer composes responsively per breakpoint.

## Composition rules

1. The lion has a **dedicated stage**; it must never look like it is floating.
2. Player cards sit on a **designed shelf**, never dropped straight onto scenery.
3. The title is **compositionally integrated** with the world.
4. Foreground decoration adds depth without blocking usability.
5. **Never bake live data** — no player names, counts, buttons, titles or the
   Parent pill in scenic art. (The retired `-hero-clean.jpg` plates broke this:
   they had the title, subtitle and a fake Parent pill painted in, which
   double-rendered against the real UI.)

## Current status

| World | backplate | midground | stage | shelf | foreground |
|---|---|---|---|---|---|
| sunny-meadow | code | code | code | code | code |
| sky-islands | code | code | code | code | code |
| treehouse | code | code | code | code | code |
| river-garden | code | code | code | code | code |

**No painted plates exist yet — every layer is code-built and is the fallback.**

## How a plate is adopted

```tsx
<WorldPlate theme="sunny-meadow" layer="backplate" />
```

`WorldPlate` probes the file and renders nothing until it is confirmed present,
so shipping art for one layer never breaks the others. `useWorldPlate(theme,
layer)` returns availability, letting a world skip drawing its code equivalent
once real art is in place.

Layer placement and z-order live in `src/components/homepage/worldAssets.ts`.

## Ambient motion stays in code

Scenic plates are **stills**. Drift, sparkles, pollen, cloud movement, lantern
flicker, fish, bubbles, butterflies, leaf drift, water shimmer, mist, light
pulses and parallax are all code overlays (`SkyLife`, `useSceneParallax`, and
each world's L6 layer) and must remain separate from the art.

## Per-world art direction

- **sunny-meadow** — cheerful daylight, soft rainbow, flowers, rounded hills,
  butterflies. Materials: grass, flowers, soft cloud, pastel light.
- **sky-islands** — floating islands, balloon, planets, rocket trail, dreamy
  depth, cloud shelf. Materials: cloud, air glow, floating stone/grass, sparkle.
- **treehouse** — wooden structure, lanterns, cozy dusk glow, balloons,
  handcrafted signage. Materials: wood, rope, lantern glass, leaves, bark.
- **river-garden** — waterfall, river wraparound, stepping stones, rounded
  trees, fish and bubbles, distant rainbow. Materials: water, grass, foliage,
  smooth rock, mist.
