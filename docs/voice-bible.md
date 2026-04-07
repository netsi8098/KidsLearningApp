# Kids Learning Fun -- Voice Design Bible

> The definitive guide to voice, speech, and audio personality for Kids Learning Fun.
> Every spoken word in this app should feel like it comes from a trusted, warm,
> delightful friend who genuinely cares about the child.

---

## 1. Voice Categories Overview

Kids Learning Fun uses **five distinct voice profiles**, each designed for a specific
emotional and functional context. Together they create a cohesive audio personality
that adapts to what the child is doing.

| Profile | Label | Tone | Energy | When Used |
|---------|-------|------|--------|-----------|
| `narrator` | Friendly Narrator | Warm, clear, encouraging | 6/10 | Lesson teaching, general guidance |
| `mascot-host` | Mascot Host | Playful, animated, expressive | 8/10 | Character dialogue, celebrations |
| `bedtime-narrator` | Bedtime Storyteller | Gentle, hushed, soothing | 2/10 | Bedtime mode, wind-down |
| `song-leader` | Song Leader | Melodic, rhythmic, inviting | 9/10 | Singalongs, chants, counting songs |
| `parent-guide` | Parent Guide | Professional, warm, peer-to-peer | 4/10 | Settings, dashboard, parent tips |

### Profile Selection Logic

```
if (bedtimeMode) -> bedtime-narrator
if (screen === 'parent-dashboard' || screen === 'settings') -> parent-guide
if (activity === 'singalong' || activity === 'counting-song') -> song-leader
if (characterSpeaking) -> mascot-host (with character flavour)
else -> narrator (default)
```

---

## 2. Character Voice Descriptions

Each of the five mascots has a unique vocal personality layered on top of the
`mascot-host` base profile.

### Leo Lion
- **Vocal quality**: Warm, enthusiastic, slightly deeper than the others
- **Signature sound**: "ROAR!" (always playful, never scary)
- **Energy**: High but controlled. Think camp counsellor on the first morning
- **Topics**: Letters, numbers, lessons -- Leo is the learning leader
- **Key direction**: Leo celebrates effort. Every encouragement should feel earned

### Daisy Duck
- **Vocal quality**: Bright, musical, slightly lilting
- **Signature sound**: "Quack quack!" (melodic, almost a musical phrase)
- **Energy**: Creative, bouncy, artistic
- **Topics**: Coloring, cooking, creative activities
- **Key direction**: Daisy sees beauty in everything. She gasps at creations

### Ollie Owl
- **Vocal quality**: Calm, wise, measured, softest of all characters
- **Signature sound**: "Hoot hoot" (gentle, almost whispery)
- **Energy**: Low and steady. The calmest presence in the app
- **Topics**: Bedtime, stories, audio tales
- **Key direction**: Ollie never rushes. Every pause is intentional

### Ruby Rabbit
- **Vocal quality**: Fast, bouncy, high-energy, slightly higher pitch
- **Signature sound**: "Hop hop!" (percussive, rhythmic)
- **Energy**: Maximum. Ruby is always moving
- **Topics**: Games, movement, matching
- **Key direction**: Ruby turns everything into a game. Even mistakes are fun

### Finn Fox
- **Vocal quality**: Curious, conspiratorial, wonder-filled
- **Signature sound**: "Psst!" (like sharing a secret)
- **Energy**: Medium-high, driven by curiosity rather than excitement
- **Topics**: Animals, exploration, home activities
- **Key direction**: Finn discovers alongside the child. Never all-knowing

---

## 3. Speech Performance Rules

### Age-Specific Speech Rules

#### Toddlers (2-3)
- Maximum 6 words per sentence
- Use only 1-2 syllable words
- Repeat key words 3 times: "Ball! Ball! Ball!"
- Rate: 78% of normal speech speed
- Pitch: +15% above baseline
- Warmth: Maximum (10/10)
- Pause 1200ms after questions
- Pause 600ms between sentences
- Never use abstract concepts
- Always refer to visible, concrete objects

#### Preschool (4-5)
- Maximum 10 words per sentence
- Up to 3-syllable words
- Repeat key concepts twice
- Rate: 88% of normal speech speed
- Pitch: +10% above baseline
- Warmth: High (8/10)
- Pause 800ms after questions
- Pause 400ms between sentences
- Introduce one new word at a time with explanation
- Use "Let us" to invite collaboration

#### Early Learners (6-8)
- Maximum 15 words per sentence
- Up to 4-syllable words
- No forced repetition (natural flow)
- Rate: 95% of normal speech speed
- Pitch: +5% above baseline
- Warmth: Good (7/10)
- Pause 600ms after questions
- Pause 300ms between sentences
- Vocabulary building with context
- Use "why" and "how" questions

### Concept Introduction Pattern

Every new concept follows a 5-step sequence:

1. **Name It** -- "This is the letter B!" (pause 500ms)
2. **Show It** -- "Look! Here it is. See the letter B?" (pause 800ms)
3. **Explain It** -- "The letter B makes a 'buh' sound." (pause 600ms)
4. **Repeat It** -- "Can you say B? Say it with me! B!" (pause 1200ms)
5. **Practice It** -- "Now touch the letter B on the screen!"

### Pause Rules

| Context | Duration | Notes |
|---------|----------|-------|
| After a question | 500ms (toddlers: 1200ms) | Never rush past a question |
| Between sentences | 300ms (bedtime: 500ms) | Natural breathing pause |
| Dramatic pause / reveal | 1000ms | Before surprise or new concept |
| After praise | 400ms | Let the child feel the praise |
| Before retry prompt | 600ms | Processing time after mistake |
| Bedtime breath cues | 1500ms | Match real breathing rhythm |
| Between counted numbers | 400ms (toddlers: 600ms) | Even spacing |
| Song countdown | 250ms | Rhythmic, establishes tempo |

---

## 4. Pronunciation Guide Overview

The app includes a comprehensive pronunciation system covering:

- **26 alphabet letters** with IPA, friendly sounds, example words, and SSML phoneme tags
- **Numbers 1-20** with word forms, syllable breakdowns, and teaching phrases
- **12 phonics patterns** (sh, ch, th, ee, oo, ai, ck, ng, wh, igh, ou, ar)
- **30 age-graded vocabulary words** across three age brackets
- **12 educational phrases** that recur throughout the app

See `src/voice/pronunciationGuide.ts` for the full data and lookup functions.

---

## 5. Technical Voice System

### Current: Web SpeechSynthesis API

The app currently uses the browser's built-in `SpeechSynthesis` API for all voice output.

```typescript
// Basic usage via the useVoiceLine hook
const { speak, speakRandom, speakByContext, stop, isSpeaking } = useVoiceLine('leo');

// Speak a specific line
speak('greet-004');

// Speak a contextually matched line
speakByContext('returning', 'warm');

// Speak a random encouragement
speakRandom('encouragement');
```

**Voice selection priority:**
1. Preferred voice name from profile (e.g. "Samantha" on macOS/iOS)
2. Google voices (commonly available in Chrome)
3. Any English voice
4. First available voice

**Parameter mapping:**
Each voice profile defines `ttsHints` that map directly to `SpeechSynthesisUtterance`:
- `rate`: 0.5-2.0 (profile base * age group multiplier)
- `pitch`: 0-2.0 (profile base + age group offset)
- `volume`: 0-1.0

### Future: Pre-recorded Audio

When professional recordings become available:
1. An `AudioAssetManifest` maps line IDs to MP3 files
2. The playback system checks for a pre-recorded asset first
3. Falls back to TTS if the asset is missing
4. Manifest includes SHA-256 hashes for cache integrity

---

## 6. SSML Usage Guide

SSML (Speech Synthesis Markup Language) is used in voice line definitions for
richer TTS rendering where supported.

### Supported Elements

```xml
<!-- Prosody: rate, pitch, volume -->
<prosody rate="90%" pitch="+8%" volume="medium">
  Hello there!
</prosody>

<!-- Break: timed pauses -->
<break time="500ms"/>

<!-- Emphasis: stress a word -->
<emphasis level="moderate">amazing</emphasis>

<!-- Phoneme: exact pronunciation -->
<phoneme alphabet="ipa" ph="bʌ">Buh</phoneme>
```

### Best Practices

- Always wrap complete utterances in `<speak>` tags
- Use `<break>` for pedagogical pauses (after questions, before reveals)
- Use `<emphasis>` sparingly -- only for genuinely important words
- Rate as percentage is more portable than named values
- Keep SSML fragments simple; complex nesting reduces compatibility

### Helper Functions

```typescript
import { buildSSML, wrapWithProsody, addPauses, emphasize, ssmlBreak } from './speechRules';

// Auto-apply age-appropriate prosody and pauses
const ssml = buildSSML('Can you say B? Buh!', '4-5', {
  emphasizeWords: ['B'],
  volume: 'medium',
});
```

---

## 7. Audio UX Rules

### Auto-play vs Tap-to-play

| Context | Behaviour |
|---------|-----------|
| Lesson intro | Auto-play after 500ms delay |
| Question/prompt | Auto-play immediately |
| Praise/celebration | Auto-play after correct answer |
| Hint | Tap-to-play (user requests help) |
| Story narration | Auto-play, sequential |
| Bedtime | Auto-play with long fade-in |
| Character greeting | Auto-play on screen enter |
| Song intro | Auto-play before music starts |

### Interruption Rules

- **New navigation cancels current speech** (via `speechSynthesis.cancel()`)
- **Tap on a new interactive element cancels and replays** for that element
- **Bedtime mode**: no interruptions; speech completes before transition
- **Celebration sounds play alongside speech** (different audio channels)

### Replay

- All spoken content should have a visible **replay button** (speaker icon)
- Tapping replay cancels current speech and restarts the same utterance
- Replay uses the same voice profile and parameters

### Captions / Accessibility

- All voice lines have a `.text` property that serves as the caption
- When `speechEnabled` is false, text should still appear visually
- Screen readers should read the `.text` content
- Reduced motion mode does not affect audio, only visual animations

### Volume Hierarchy

1. **Music/ambience**: Lowest layer (duck when speech plays)
2. **Sound effects**: Mid layer (short, non-overlapping with speech)
3. **Voice/speech**: Highest priority (always audible)

---

## 8. Fallback Strategy

### When Speech is Unavailable

Some browsers or devices may not support `SpeechSynthesis`. The app handles this gracefully:

1. **Check availability**: `'speechSynthesis' in window`
2. **If unavailable**: All voice functions become no-ops
3. **Visual fallback**: Text bubbles, mascot speech bubbles, and on-screen text
   display the `.text` content of voice lines
4. **No error states**: The child never sees a broken or error UI

### When Voices Load Asynchronously

Some browsers (especially Chrome) load voices asynchronously:
1. Listen for the `voiceschanged` event
2. Cache voices after first load
3. If voices are empty at speak time, attempt to reload
4. If still empty, use default (first available) voice

### TTS to Pre-recorded Migration

When transitioning from TTS to professional recordings:
1. Deploy pre-recorded audio alongside TTS
2. Audio manifest maps line IDs to file paths
3. Playback checks manifest first; falls back to TTS on cache miss
4. Gradually increase pre-recorded coverage
5. TTS remains as permanent fallback for new/unrecorded lines
