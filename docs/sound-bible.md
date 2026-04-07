# Sound Bible -- Kids Learning Fun

Complete sound design specification. Every sound in the app is synthesized
at runtime using the Web Audio API. There are no MP3, WAV, or OGG files.

---

## 1. Sound Identity

The sonic identity of Kids Learning Fun is **warm, soft, playful, and safe**.

### Core Principles

- **Warm over sharp.** All tones use sine or triangle waveforms. Sawtooth
  and square waves are heavily filtered when used. No raw buzzing.
- **Soft over loud.** Maximum volume for any single sound is 0.3 (30%).
  Most sounds hover around 0.1-0.25.
- **Playful over clinical.** Sounds have musical intervals (major thirds,
  perfect fifths) rather than arbitrary beeps.
- **Safe over startling.** Error sounds descend gently. They never punish.
  Success sounds ascend. Transitions are smooth.
- **Never casino-like.** No rapid-fire jingles, slot-machine trills, or
  dopamine-trigger patterns. Rewards are celebratory but restrained.

### Frequency Guidelines

| Context          | Range        | Why                              |
|------------------|-------------|----------------------------------|
| Navigation       | 600-1000 Hz | Mid-range, unobtrusive           |
| Success          | 500-1050 Hz | Ascending through C major        |
| Error            | 200-330 Hz  | Lower, gentle, non-threatening   |
| Reward           | 500-1320 Hz | Wide range for excitement        |
| Ambient          | 130-330 Hz  | Low drones, barely audible       |
| Bedtime          | 130-1050 Hz | Filtered heavily below 1000 Hz   |
| Brand            | 520-1050 Hz | Memorable mid-range              |

---

## 2. Sound Category Reference

### Navigation (priority 3)
- `nav-tap` -- Soft pop for any interactive tap. 800 Hz sine, 50ms total.
- `nav-back` -- Softer reverse pop for back navigation. 600 Hz, slight left pan.

### Success (priority 2)
- `success-small` -- Two-note ascending chime (C5-E5). Correct answer.
- `success-medium` -- Three-note chime (C5-E5-G5). Section complete.
- `success-big` -- Full C-major arpeggio. Level/milestone complete.

### Error (priority 2-3)
- `error-gentle` -- Descending minor second (E4-Eb4). Triangle wave. Encouraging.
- `error-subtle` -- Very soft low buzz at 200 Hz. Almost imperceptible.

### Reward (priority 1)
- `reward-star` -- Ascending sweep 800-2400 Hz with shimmer. Star earned.
- `reward-badge` -- 5-note fanfare ascending to E6. Badge unlocked.
- `reward-streak` -- Rich C-major chord. Streak milestone.

### Ambient (priority 3)
- `ambient-daytime` -- C4+E4 sine pad, volume 0.04. Daytime warmth.
- `ambient-bedtime` -- C3+G3 drone, filtered at 600 Hz, volume 0.03.

### Transition (priority 3)
- `transition-whoosh` -- Bandpass-filtered noise sweep. Page transition.
- `transition-page` -- Highpass-filtered noise burst. Soft page turn.

### Interaction (priority 3)
- `interaction-select` -- 1000 Hz sine tap. Selecting items.
- `interaction-drag` -- 400-600 Hz sweep. Drag feedback.
- `interaction-drop` -- 180 Hz low thud. Drop/place confirmation.

### Story (priority 2-3)
- `story-page-turn` -- Bandpass noise at 4000 Hz. Papery swoosh.
- `story-dramatic` -- C minor chord (C4-Eb4-G4). Tension moment.

### Movement (priority 2)
- `movement-beat` -- 150 Hz sine pulse. Rhythmic activity beat.
- `movement-start` -- Ascending sweep 200-1200 Hz. Activity kickoff.

### Bedtime (priority 2-3)
- `bedtime-wind-down` -- Descending sweep 800-200 Hz over 1.2s. Calming.
- `bedtime-twinkle` -- C6-E6-C6 sequence at volume 0.06. Star sparkle.

### Brand (priority 1)
- `brand-startup` -- C5-G5-C6 three-note mnemonic. Sonic logo.
- `brand-complete` -- F-major chord (F3-A4-C5-F5). Session resolution.

---

## 3. Musical Mood Boards

Five mood boards define the tonal character of different contexts:

### Daytime Learning (C major, 100 BPM)
- Energy: 5/10, Warmth: 7/10, Brightness: 7/10
- Waveforms: sine, triangle
- Filter range: 800-4000 Hz
- Sounds: navigation, success, error, reward, ambient, interaction

### Bedtime (F major, 60 BPM)
- Energy: 2/10, Warmth: 10/10, Brightness: 2/10
- Waveforms: sine only
- Filter range: 200-1200 Hz
- Sounds: ambient-bedtime, bedtime-wind-down, bedtime-twinkle

### Movement & Dance (G major, 120 BPM)
- Energy: 8/10, Warmth: 6/10, Brightness: 8/10
- Waveforms: sine, triangle, sawtooth (filtered)
- Filter range: 400-5000 Hz
- Sounds: movement-beat, movement-start, success, reward

### Curiosity & Discovery (D major, 90 BPM)
- Energy: 4/10, Warmth: 7/10, Brightness: 6/10
- Waveforms: sine, triangle
- Filter range: 600-3500 Hz
- Sounds: navigation, success, reward, story, interaction

### Parent Mode (A minor, 80 BPM)
- Energy: 3/10, Warmth: 4/10, Brightness: 4/10
- Waveforms: sine only
- Filter range: 500-2500 Hz
- Sounds: nav-tap, nav-back, interaction-select, error-subtle

---

## 4. Repetition Management Strategy

Sounds that repeat frequently can become annoying. The registry enforces:

- **Cooldown timers.** Each sound has a `cooldownMs` value. The mixer
  refuses to re-trigger a sound within its cooldown window.
- **Navigation sounds** have very short cooldowns (60-100ms) since they
  trigger on every tap but are extremely brief.
- **Success sounds** have 200-1000ms cooldowns to prevent stacking during
  rapid correct answers.
- **Reward sounds** have 2000-3000ms cooldowns to maintain specialness.
- **Ambient drones** have 5000-8000ms cooldowns since they sustain.
- **Brand sounds** have 5000ms cooldowns -- they play at most once
  every 5 seconds.

Additionally, the mixer limits **maximum simultaneous sounds**:
- Default: 3 concurrent sounds
- Bedtime: 2 concurrent sounds
- Movement: 4 concurrent sounds

When slots are full, **priority preemption** applies: a priority-1 sound
can interrupt a priority-3 sound. Equal-priority sounds cannot preempt
each other.

---

## 5. Audio Mixing Rules

### Mixing Profiles

| Profile           | Voice | Music | FX   | Ambient | Max Sounds |
|-------------------|-------|-------|------|---------|------------|
| Default           | 0.9   | 0.4   | 0.7  | 0.3     | 3          |
| Narration Active  | 1.0   | 0.15  | 0.4  | 0.15    | 2          |
| Bedtime           | 0.7   | 0.2   | 0.3  | 0.25    | 2          |
| Movement          | 0.85  | 0.6   | 0.8  | 0.2     | 4          |
| Parent Mode       | 0.8   | 0.0   | 0.3  | 0.0     | 2          |

### Ducking Rules

When narration or TTS begins, the mixer "ducks" the music and ambient
channels:

- **Default duck:** Music drops to 30% of its current volume.
- **Duck attack:** 200ms ramp-down (smooth, not jarring).
- **Duck release:** 500ms ramp-up after narration ends.
- **Narration-active profile** uses even deeper ducking (15%).

### Bedtime Volume Reduction

All channels are multiplied by 0.6 in bedtime mode. Combined with the
bedtime mixing profile's already-lower volumes, the effective maximum
for any sound in bedtime is approximately 0.18 (18%).

### Priority Preemption

When all sound slots are occupied and a new sound wants to play:

1. Check if the new sound's priority is **lower** (numerically) than
   the lowest-priority active sound.
2. If yes, the oldest lowest-priority sound is faded out in 50ms and
   replaced by the new sound.
3. If no (equal or higher priority number), the new sound is dropped.

---

## 6. Technical Architecture

### Synthesis Pipeline

```
Sound Registry (parameters)
  -> useSoundMixer (slot management, profile, ducking)
    -> synthesize() (Web Audio API)
      -> OscillatorNode / BufferSource (noise)
        -> GainNode (ADSR envelope)
          -> BiquadFilterNode (optional)
            -> StereoPannerNode (optional)
              -> AudioContext.destination
```

### Shared AudioContext

A single `AudioContext` is created lazily on first sound playback.
It is reused for the app's lifetime. If the browser suspends it
(common on mobile before user interaction), it is resumed automatically.

### ADSR Envelope

Every sound uses an Attack-Decay-Sustain-Release envelope on its
GainNode:

1. **Attack**: linear ramp from 0.001 to peak (1.0)
2. **Decay**: linear ramp from peak to sustain level
3. **Sustain**: hold at sustain level
4. **Release**: exponential ramp from sustain to 0.001

### Synthesis Types

- **tone**: Single oscillator at one frequency.
- **chord**: Multiple oscillators at different frequencies, all sharing
  the same envelope timing.
- **sequence**: Multiple oscillators started at staggered delays, each
  with its own timing.
- **sweep**: Single oscillator with exponentialRampToValueAtTime on
  its frequency parameter.
- **noise**: White noise generated from a random-filled AudioBuffer,
  played through a BiquadFilter.

---

## 7. Sound Map by Screen

| Screen / Route        | Ambient Scene  | Mood Board          | Active Sounds                          |
|-----------------------|----------------|---------------------|----------------------------------------|
| Welcome / Menu        | daytime        | daytime-learning    | nav-tap, brand-startup                 |
| ABC / Numbers / etc.  | daytime        | daytime-learning    | nav-tap, success-*, error-*, reward-*  |
| Quiz / Assessment     | classroom      | daytime-learning    | interaction-select, success-*, error-* |
| Stories               | story          | curiosity-discovery | story-page-turn, story-dramatic        |
| Audio / Music         | music          | movement-dance      | nav-tap, success-small                 |
| Movement              | music          | movement-dance      | movement-beat, movement-start          |
| Bedtime               | bedtime        | bedtime             | bedtime-*, ambient-bedtime             |
| Discovery / Explorer  | discovery      | curiosity-discovery | nav-tap, success-*, reward-*           |
| Parent Dashboard      | classroom      | parent-mode         | nav-tap, interaction-select            |
| Settings              | classroom      | parent-mode         | nav-tap                                |
| Rewards               | daytime        | daytime-learning    | reward-star, reward-badge              |

---

## 8. Bedtime Sound Rules

When bedtime mode is active:

1. The mixing profile switches to `bedtime` automatically.
2. All volumes are multiplied by `bedtimeReduction` (0.6).
3. Sounds with `bedtimeVariant` use those parameters instead of defaults.
4. Typical bedtime variants: lower volume, lower filter cutoff, sine only.
5. Maximum simultaneous sounds drops to 2.
6. The ambient drone switches to `ambient-bedtime`.
7. Bright/energetic sounds (movement-beat, movement-start) are not
   included in the bedtime mood board and should not play.

---

## 9. Creating New Sounds (On-Brand Guide)

When adding a new sound to the registry:

1. **Choose the right waveform.** Prefer `sine` for warmth. Use
   `triangle` for slightly more presence. Use `sawtooth` only with
   heavy lowpass filtering. Avoid `square` except for very brief clicks.

2. **Keep volumes low.** Navigation: 0.08-0.18. Success: 0.15-0.30.
   Error: 0.08-0.18. Ambient: 0.03-0.06. Never exceed 0.35.

3. **Use musical intervals.** Base sounds on the C major scale or the
   current mood board's key. Common intervals: major third (C-E),
   perfect fifth (C-G), octave (C-C).

4. **Keep it short.** Most sounds should be under 500ms total duration.
   Ambient pads and celebration sequences are exceptions.

5. **Always provide a bedtime variant.** If the sound can play during
   bedtime, add a `bedtimeVariant` with reduced volume (typically 40-50%
   of normal) and a lower filter cutoff.

6. **Set appropriate priority.** 1 = critical (brand, reward -- must
   play). 2 = important (success, error). 3 = ambient (navigation,
   interaction -- can be skipped).

7. **Set cooldown wisely.** Fast interactions: 60-100ms. Standard
   feedback: 200-400ms. Celebrations: 1000-3000ms. Ambient: 5000+ms.

8. **Test in context.** Play the sound alongside existing sounds to
   ensure it blends well. Check against all 5 mixing profiles.

---

## 10. Performance Considerations

- **Lazy AudioContext.** The context is not created until the first
  sound plays, avoiding browser warnings and unnecessary resource use.

- **Automatic cleanup.** OscillatorNodes are scheduled to stop via
  `osc.stop(time)` and garbage-collected by the browser.

- **Slot system.** The mixer hard-caps concurrent sounds to prevent
  audio buffer overload and CPU spikes.

- **Cooldown prevention.** Rapid re-triggers (e.g., spam-tapping a
  button) are blocked at the cooldown check, before any AudioNode
  is created.

- **No AudioBuffer caching needed.** Oscillator-based synthesis is
  extremely cheap. Noise buffers are small (0.5s at sample rate).

- **Memory.** The sound registry is a static const object -- no
  runtime allocations. Active sound tracking uses a simple array
  with periodic cleanup.
