# video-forge

Generates narrated, animated educational videos for the kids app and publishes
them straight into it.

This replaces the Flowise install that previously held these flows. The flow is
code now: versioned with the app, unit-tested, runnable in CI, no server to keep
alive. See `~/Archive/FLOWISE-RETIRED.md` for that history.

## Quick start

```bash
node tools/video-forge/forge.mjs "colors" --age 2-3 --host leo
```

That writes `public/videos/ep-colors-23.mp4` (+ poster, + captions) and adds it
to `src/data/generatedVideos.ts`, which the app already reads. Nothing else to
wire up — the episode appears on the Videos page, in search, and in
recommendations.

## The pipeline

```
  topic
    │
    ├─1─ script      LLM writes a HostedEpisode  → Anthropic | Ollama | template
    ├─2─ validate    schema + kid-safety gate    → blocks publish on failure
    ├─3─ narrate     edge-tts per line           → mp3 + measured durations
    ├─4─ storyboard  merge script + real audio   → absolute timeline
    ├─5─ render      headless Chromium           → one JPEG per frame
    ├─6─ mux         ffmpeg                      → mp4 + poster + WebVTT
    └─7─ publish     copy + manifest             → public/videos/ + .ts
```

Two design rules hold the thing together:

**Timing comes from the audio, never from a guess.** Stage 3 measures every
synthesized line with `ffprobe`; stage 4 builds the timeline from those numbers;
stage 6 places audio at those same offsets. Picture and voice cannot drift.

**The renderer is a pure function of `(storyboard, timeMs)`.** `scene.html`
has no CSS animations and no `requestAnimationFrame` — Playwright seeks it to an
exact timestamp and screenshots. Capture speed cannot affect the output, and
frame 900 is identical on every run.

## Performance

On an M4 (16 GB), a 1-minute episode takes well under a minute end to end;
frame capture runs at ~160 fps with `--concurrency 4`.

For contrast: this repo's sibling `~/Wan2.1` diffusion setup runs on CPU on this
machine (MPS has matmul dtype limits) at roughly 30–90 minutes of compute per
*second* of video. That is why this pipeline is programmatic animation rather
than a video diffusion model. If a CUDA box ever enters the picture, diffusion
becomes viable for short hero shots — but not for whole lessons.

## Options

```
--age <2-3|4-5|6-8>    target age band; drives pacing, vocabulary, choice count
--host <id>            leo | daisy | ollie | ruby | finn
--minutes <n>          length hint passed to the script generator
--provider <name>      auto | anthropic | ollama | template
--preview              render one still frame only — fast visual check
--dry-run              write script + storyboard, skip render
--force                re-synthesize narration, ignoring the audio cache
--concurrency <n>      parallel render pages (default 3)
--keep-frames          keep captured frames for debugging
--batch <file.json>    generate many at once
--reindex              rebuild the .ts manifest from index.json
--list-topics          show built-in curriculum topics
```

### Script providers

Tried in order, degrading gracefully:

1. **anthropic** — best writing. Set `ANTHROPIC_API_KEY`. Model override:
   `VIDEO_FORGE_ANTHROPIC_MODEL` (default `claude-sonnet-5`).
2. **ollama** — fully local. Needs `ollama serve` and a pulled model. Override
   with `VIDEO_FORGE_OLLAMA_MODEL` (default `llama3.2`).
3. **template** — deterministic composer over a built-in curriculum bank
   (colors, counting, shapes, alphabet, animals, emotions, weather, bodyparts).
   No network, no setup, same output every time. Unknown topics fall back to a
   generic exploration lesson rather than inventing facts.

The template provider is why this works with zero configuration, and why the
tests are reproducible.

### Batch

```bash
node tools/video-forge/forge.mjs --batch tools/video-forge/batch.example.json
```

```json
[
  { "topic": "colors",   "age": "2-3", "host": "leo" },
  { "topic": "counting", "age": "2-3", "host": "ollie" }
]
```

A failing episode is reported and skipped; the rest still generate.

## The safety gate

Stage 2 blocks publishing outright — a failed episode produces no video. It
checks:

- **Structure** — every segment matches `HostedEpisode` in
  `src/segments/episodeSchema.ts`; must open on `intro`, close on `goodbye`,
  and contain at least one interactive segment (no passive viewing).
- **Content** — a banned-term list (violence, death, fear, illness, commercial
  pressure, adult themes) matched on word boundaries, so `audience` and `diet`
  do not trip on `die`.
- **Phrasing** — patterns that are unsafe even without a banned word: asking a
  child to keep secrets from parents, suggesting meeting up, soliciting personal
  details, purchase pressure.
- **URLs** — never allowed in narration.
- **Reading level** — warns when a line runs long for the target age.

Every child-facing string is scanned, including answer options — not just host
lines.

## App integration

`src/data/videoConfig.ts` merges generated episodes ahead of the curated
YouTube catalog into `curatedVideos`, the list every page reads. `VideoItem`
gained three optional fields — `source`, `src`, `captions` — so existing
YouTube entries need no migration: a missing `source` means YouTube.

`VideoPlayer` branches on `source === 'local'` and renders a `<video>` element
with captions on by default, instead of the YouTube iframe. Local episodes play
fully offline.

`public/videos/index.json` is the source of truth for what has been published;
the `.ts` manifest is regenerated from it every run, so re-forging an episode
updates it in place rather than appending a duplicate.

## Files

```
forge.mjs              CLI + orchestration
config.mjs             paths, video settings, host voices/themes, age presets
lib/util.mjs           shell, logging, ffprobe, time formatting
lib/episode.mjs        schema validation + kid-safety gate
providers/llm.mjs      provider chain (anthropic → ollama → template)
providers/template.mjs deterministic curriculum composer
stages/voice.mjs       edge-tts narration + duration measurement
stages/storyboard.mjs  timeline, lip-sync, pose/expression, visuals
stages/render.mjs      Playwright frame capture
stages/mux.mjs         ffmpeg audio mix, encode, poster, WebVTT
stages/publish.mjs     public/videos + generatedVideos.ts
scene/scene.html       the renderer — pure function of (storyboard, t)
```

## Requirements

- Node 20+ (the pipeline is plain ESM, so it needs no build step)
- `ffmpeg` + `ffprobe` — `brew install ffmpeg`
- `python3` + `edge-tts` — `pip3 install edge-tts`
- Playwright Chromium — `npx playwright install chromium`

`forge.mjs` preflights all of these and names what is missing before it starts
doing expensive work.

## Tests

```bash
npx vitest run tests/unit/video-forge
```

45 tests over the episode contract, the safety gate, the template composer, and
storyboard/caption timing.

## Notes and known limits

- **Repo size.** Each minute of video is roughly 5–6 MB. Six episodes is ~30 MB
  of committed binaries. If the library grows past a few dozen, move
  `public/videos/` to object storage or Git LFS and generate in CI instead.
- **The service worker does not precache videos.** `vite.config.ts` lists
  `globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']` — mp4 is deliberately
  absent, so a 5 MB episode is not pulled into the PWA precache. Offline
  playback of a generated episode therefore needs an explicit runtime caching
  rule; it is not automatic today.
- **Lip-sync is phrase-level.** edge-tts gives phrase boundaries, not phonemes,
  so mouth shapes cycle within each phrase. It reads as talking at 24fps but is
  not a true phoneme alignment.
- **Emoji rendering depends on the host font.** Frames are captured with the
  system emoji font, so output is Apple-styled on macOS and would differ in a
  Linux CI container without a matching font installed.
