# Asset Generation Prompts

Ready-to-use prompts for DALL-E, Midjourney, or Stable Diffusion.
All prompts target consistent 3D cartoon style (Pixar-adjacent, soft lighting, friendly).

## Implementation Status - 2026-08-19

This is a **generation backlog**, not the runtime asset manifest. Consult
`docs/asset-manifest.md` before generating or replacing anything.

- Four homepage backplates are implemented under `public/assets/worlds/`.
- Sunny Meadow, Sky Islands and River Garden also have approved stage art.
- Treehouse deliberately uses the real patio already painted into its backplate.
- Lion `idle`, `waving`, `thinking` and `celebrating` art is implemented and
  driven by the real-time articulated rig. Remaining lion prompts are backlog.
- Do not overwrite current assets from these prompts without side-by-side visual
  approval. Generate candidates to a temporary review location first.
- Wan/Vidu clips are motion study material only; never embed them as the live
  mascot or convert them to frames/sprites.

---

## BATCH 1: Lion Mascot Poses (generate first — sets character style)

**Style anchor for all lion prompts:**
> Cute cartoon lion character, 3D rendered, Pixar-style, soft golden fur, big friendly brown eyes, round face, fluffy mane, small nose, warm smile, soft lighting, transparent background, centered composition, full body visible, aimed at children ages 2-8

### 1A. Lion — Idle/Standing
```
Cute cartoon lion character standing upright, 3D rendered Pixar-style, soft golden fur, big friendly brown eyes, fluffy warm mane, small rounded body, gentle smile, arms at sides, facing forward, soft studio lighting, transparent/white background, full body, children's educational app character
```
**Size**: 1024x1024 → crop to 800x800
**Output**: `public/assets/lion/idle.png`

### 1B. Lion — Waving Hello
```
Cute cartoon lion character waving one paw happily, 3D rendered Pixar-style, soft golden fur, big friendly eyes, fluffy mane, cheerful open-mouth smile, other arm relaxed, facing slightly left, soft warm lighting, transparent/white background, full body, welcoming pose, children's app character
```
**Output**: `public/assets/lion/waving.png`

### 1C. Lion — Excited/Celebrating
```
Cute cartoon lion character jumping with joy, both paws raised in celebration, 3D rendered Pixar-style, soft golden fur, big sparkling eyes, wide happy smile, confetti or sparkles around, energetic pose, soft lighting, transparent/white background, full body, children's app
```
**Output**: `public/assets/lion/excited.png`

### 1D. Lion — Thinking
```
Cute cartoon lion character with one paw on chin, thinking expression, 3D rendered Pixar-style, soft golden fur, big curious eyes looking upward, slight head tilt, thoughtful smile, question mark nearby, soft lighting, transparent/white background, full body, children's educational app
```
**Output**: `public/assets/lion/thinking.png`

### 1E. Lion — Sleeping
```
Cute cartoon lion character sleeping peacefully, curled up, 3D rendered Pixar-style, soft golden fur, eyes closed gently, peaceful smile, small z's floating above, cozy pose, soft moonlit blue lighting, transparent/white background, children's bedtime app
```
**Output**: `public/assets/lion/sleeping.png`

### 1F. Lion — Reading
```
Cute cartoon lion character sitting and holding an open book, 3D rendered Pixar-style, soft golden fur, big focused eyes looking at book, content smile, cross-legged sitting pose, colorful storybook, soft warm lighting, transparent/white background, children's reading app
```
**Output**: `public/assets/lion/reading.png`

---

## BATCH 2: Homepage World Backgrounds (layered)

**Style anchor for all world prompts:**
> Children's educational app background, 3D rendered cartoon style, vibrant colors, soft lighting, rich depth, layered composition, no text, no UI elements, no characters, landscape orientation 16:9

### 2A. River Garden — Background Layer
```
Lush cartoon river garden scene, 3D rendered, blue sky with soft clouds, rainbow in distance, rounded green trees on both sides, sparkling river flowing through center, small waterfall on left, stepping stones on right, pink and yellow flowers scattered, grassy hills, warm sunlight, no characters, no text, landscape 16:9, children's app background
```
**Size**: 1920x1080
**Output**: `public/assets/worlds/river-garden/background.webp`

### 2B. River Garden — Foreground Layer
```
Grassy riverbank foreground, 3D cartoon style, lush green grass with pink and yellow flowers, smooth rocks, water edge visible at top, transparent sky/background, ground-level perspective, rich detail, soft lighting, landscape, meant to be bottom layer of parallax scene, PNG with transparency
```
**Size**: 1920x400
**Output**: `public/assets/worlds/river-garden/foreground.png`

### 2C. Treehouse Village — Background Layer
```
Cozy treehouse village scene at golden hour, 3D rendered cartoon style, massive tree trunk with wooden treehouse, warm orange-purple sunset sky, hanging paper lanterns glowing warmly, wooden bridges and platforms, green leaves and vines, fireflies, no characters, no text, landscape 16:9, children's app
```
**Size**: 1920x1080
**Output**: `public/assets/worlds/treehouse/background.webp`

### 2D. Sky Islands Adventure — Background Layer
```
Dreamy floating islands in a magical sky, 3D cartoon style, soft purple-blue gradient sky, fluffy white clouds, small green islands floating at different heights, rainbow arc, distant stars and planets visible, hot air balloon, soft ethereal lighting, no characters, no text, landscape 16:9, children's adventure app
```
**Size**: 1920x1080
**Output**: `public/assets/worlds/sky-islands/background.webp`

### 2E. Sunny Rainbow Meadow — Background Layer
```
Bright sunny meadow scene, 3D cartoon style, vibrant blue sky, large rainbow, rolling green hills, colorful wildflowers everywhere, bright cheerful trees, butterflies in the air, soft puffy clouds, warm spring sunshine, no characters, no text, landscape 16:9, children's app
```
**Size**: 1920x1080
**Output**: `public/assets/worlds/sunny-meadow/background.webp`

---

## BATCH 3: World Decorative Elements (transparent PNGs)

### 3A. Fish (River Garden)
```
Cute small cartoon tropical fish, 3D rendered, orange and white stripes, big eye, friendly expression, side view swimming right, transparent background, soft lighting, children's style, isolated object
```
**Size**: 512x512 → crop to ~200x120
**Output**: `public/assets/worlds/river-garden/elements/fish-1.png`

### 3B. Second Fish
```
Cute small cartoon blue fish, 3D rendered, blue-green scales, round body, happy expression, side view swimming left, transparent background, soft lighting, children's style, isolated object
```
**Output**: `public/assets/worlds/river-garden/elements/fish-2.png`

### 3C. Glowing Lantern (Treehouse)
```
Warm glowing paper lantern, 3D cartoon style, round shape, soft orange-yellow light, slight glow effect, hanging from a thin string, warm cozy feeling, transparent background, children's app element
```
**Output**: `public/assets/worlds/treehouse/elements/lantern.png`

### 3D. Falling Leaf (Treehouse)
```
Single autumn leaf, 3D cartoon style, warm orange-red colors, slightly curled, soft lighting, transparent background, children's illustration style
```
**Output**: `public/assets/worlds/treehouse/elements/leaf-1.png`

### 3E. Rocket (Sky Islands)
```
Cute small cartoon rocket ship, 3D rendered, red and white with round window, small flame trail, friendly design with a face on the window, transparent background, children's space theme
```
**Output**: `public/assets/worlds/sky-islands/elements/rocket.png`

### 3F. Butterfly (Sunny Meadow)
```
Cute cartoon butterfly, 3D rendered, pink and purple wings with spots, small round body, big friendly eyes, wings spread open, transparent background, soft lighting, children's nature style
```
**Output**: `public/assets/worlds/sunny-meadow/elements/butterfly-1.png`

### 3G. Cartoon Cloud
```
Fluffy white cartoon cloud, 3D rendered, soft puffy shape, slightly transparent edges, gentle shadow underneath, isolated on transparent background, children's illustration
```
**Output**: `public/assets/worlds/river-garden/elements/cloud.png` (shared across worlds)

---

## BATCH 4: Movement Activity Characters

**Style anchor:**
> Cute cartoon child character, 3D rendered, diverse representation, joyful expression, dynamic action pose, colorful clothing, soft lighting, transparent background, children's fitness/movement app

### 4A-4J. (10 activities)
```
4A: Child dancing energetically, arms and legs in motion, colorful clothes, music notes around
4B: Child imitating animal movements (jumping like a frog), playful expression
4C: Child dancing with rainbow trail following their movement
4D: Children playing Simon Says, one pointing, others copying
4E: Line of children following a leader, marching happily
4F: Child jumping over a small hurdle, determined face
4G: Child doing morning stretches with sunrise behind them
4H: Child and a cat both stretching together
4I: Child in tree pose (yoga), peaceful expression, nature background hints
4J: Child frozen in funny dance pose, snowflake/freeze effect around them
```
**Output**: `public/assets/characters/movement/[activity-name].png`

---

## WAN2.1 Video Prompts (motion reference only — not app assets)

These generate short clips to study motion patterns for code animation.

```
wan-01: "Gentle river water surface with light shimmer reflections, soft sunlight, cartoon style, top-down view"
wan-02: "Small colorful fish swimming slowly in clear cartoon water, side view"
wan-03: "Transparent soap bubbles floating upward against green nature background"
wan-04: "Sparkle glints and light particles floating in a sunny garden, dreamy"
wan-05: "Cartoon lion character idle breathing animation, gentle sway, 3D rendered"
wan-06: "Warm paper lanterns swaying gently on strings, golden evening light"
wan-07: "Autumn leaves drifting and falling slowly, warm golden hour light"
wan-08: "Hot air balloon gently bobbing in clouds, pastel sky, cartoon"
wan-09: "Colorful butterflies fluttering over a flower meadow, spring sunshine"
wan-10: "Twinkling stars and sparkles in a purple night sky, magical"
```

---

## Post-Processing Notes

1. **Remove backgrounds**: Use remove.bg or rembg for transparent PNGs
2. **Optimize**: Convert backgrounds to WebP (80% quality), keep elements as PNG
3. **Size budget**: Max 500KB per image (PWA precache constraint)
4. **Consistency check**: All lion poses should look like the same character
5. **Naming**: lowercase-kebab-case, descriptive (`lion-waving.png`, not `img_003.png`)
