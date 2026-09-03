# Homepage 3D Reference Lock

These files are production references only. They must not be shipped as video
backgrounds, sprite sequences, or baked application UI.

## Source Videos

- `vidu-video-3263035276416635.mp4`: Sky Islands changing into River Garden,
  with the approved lion performing a soft wave and full-body motion.
- `vidu-video-3263005378019917.mp4`: Treehouse Village, with the approved lion
  standing on the deck and settling from a welcoming wave.

Both sources are 1920x1080 HEVC at 24 fps and approximately five seconds long.

## Extracted Evidence

- `sky-river-contact-sheet.png`: 12-frame overview of the Sky Islands to River
  Garden source.
- `treehouse-contact-sheet.png`: 12-frame overview of the Treehouse source.
- `motion_reference_frames/sky-river/`: six selected full-resolution frames.
- `motion_reference_frames/treehouse/`: six selected full-resolution frames.
- `lion-sky-river-closeup.webp`: face, wave, mane, chest, and front-leg crop.
- `lion-treehouse-closeup.webp`: grounded stance and lowering-wave crop.
- `lion-turnaround-study-v1.png`: generated four-view modeling guide derived
  from both lion close-ups. This fills hidden front/side/rear anatomy only; it
  does not override visible identity evidence in the videos.
- `turnaround/front.png`, `side.png`, `rear.png`, and `three-quarter.png`:
  cropped camera-background plates used by `lion_reference_stage.blend`.

## Reference Authority

Use the sources in this order when they disagree:

1. original video frames and lion close-ups for face, personality, colors,
   apparent proportions, and motion
2. the generated turnaround for occluded side/rear anatomy and neutral stance
3. Blender blockouts only as working interpretations to be corrected

The turnaround is not app artwork and must not be rendered as a sprite, card
image, flattened mascot, or video replacement.

## Character Identity Lock

The production lion must preserve these observed traits:

- low quadruped stance with four readable weight-bearing paws
- oversized rounded head and large front paws
- short muzzle, broad smile, large warm eyes, and thick brows
- broad layered mane with a rounded outer silhouette and raised top tuft
- compact chest and belly with a cream muzzle, chest, belly, and paw accents
- golden coat, deep auburn mane, dark brown nose, and warm brown eyes
- short legs with soft joints rather than tall upright human-like proportions
- tail emerging naturally from the pelvis with a rounded tuft
- friendly, curious, playful personality without facial redesign

The current procedural Blender prototype does not yet satisfy this identity.
It is retained only to prove the armature, GLB, and runtime pipeline.

## Motion Lock

The references show one continuous character performance:

- body weight remains supported through the planted paws
- torso and pelvis shift as the front paw raises and lowers
- shoulder, elbow, wrist, and paw form a curved wave rather than one rigid arm
- head tilt, eye direction, eyelids, brows, cheeks, jaw, and smile overlap
- mane and tail settle after the primary movement
- breathing and small gaze changes continue while the wave plays
- movement uses anticipation, asymmetry, soft acceleration, and follow-through

The source transition between Sky Islands and River Garden is reference motion,
not a requirement to morph one 3D world into another. Runtime world changes may
use a short camera-safe crossfade after both environments are complete.

## World Composition Lock

### Sky Islands

- bright blue sky with deep soft clouds and warm sunlight from upper right
- central grassy floating island carrying the lion and title
- cloud shelf supporting player cards in the lower foreground
- secondary castle islands at left and right with large depth separation
- balloon and rabbit at upper left, pink ringed planet, rocket, rainbow, stars,
  and blue planet at the right edge
- saturated candy palette with white cloud framing and strong center focus

### River Garden

- central grass island surrounded by luminous turquoise water
- waterfall and lily pads on the left
- stepping-stone path and water channel on the right
- rounded layered trees, flowers, rocks, and foreground blooms
- rainbow, bubbles, alphabet bubbles, drifting fish, and light sparkles
- lion grounded behind the title with player cards across the water foreground

### Treehouse Village

- large dimensional treehouse and trunk framing the left side
- warm wooden deck spanning the complete foreground and supporting lion/cards
- hanging wooden title sign at upper right with ropes attached to real branches
- sunset mountain valley, warm rim light, lanterns, string lights, leaves, stars,
  flowers, and balloons
- lion grounded on the deck, never floating at its edge
- cream profile cards placed on the deck without covering the lion or sign

## Approval Rule

Do not connect new Blender art to React until each asset passes its offline
approval render:

1. lion neutral turntable and silhouette sheet
2. lion face and material close-up
3. lion four-paw grounded pose
4. wave motion preview with body support and facial performance
5. desktop, tablet, and phone composition renders for each world
6. lighting and material comparison against the contact sheets
