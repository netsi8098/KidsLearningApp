# Lip-Sync System Guide

Reference for the mascot lip-sync preparation system used in Kids Learning Fun.

## Mouth Shape Reference

The system uses 6 canonical mouth shapes that cover the full range of English speech visemes:

| Shape | Visual | Description | SVG |
|-------|--------|-------------|-----|
| `closed` | Lips together | Resting, bilabial consonants (m, b, p) | Gentle upward curve line |
| `open-small` | Slightly open | Alveolar consonants (t, d, n, l) | Small oval opening |
| `open-wide` | Wide open | Open vowels (a, ah) | Large oval opening with depth |
| `smile` | Smiling | Spread lips, gentle expression default | Wide curve with slight opening |
| `oh` | Rounded | Rounded vowels (o, u, w) | Vertical oval |
| `ee` | Wide thin | Front vowels and fricatives (e, i, s, f) | Wide horizontal slit |

## Phoneme Mapping Table

### Vowels

| Letter(s) | Mouth Shape | IPA Example | Notes |
|-----------|-------------|-------------|-------|
| a | `open-wide` | /ae/ as in "cat" | Jaw drops, wide opening |
| e | `ee` | /i:/ as in "see" | Lips spread horizontally |
| i | `ee` | /I/ as in "sit" | Similar to 'e' |
| o | `oh` | /oU/ as in "go" | Lips round forward |
| u | `oh` | /u:/ as in "blue" | Lips round, smaller opening |

### Consonants

| Letter(s) | Mouth Shape | Category | Notes |
|-----------|-------------|----------|-------|
| b, m, p | `closed` | Bilabial | Lips fully together |
| f, v | `ee` | Labiodental | Lower lip touches upper teeth |
| t, d, n, l, r | `open-small` | Alveolar | Tongue tip behind teeth, small opening |
| s, z | `ee` | Fricative | Teeth close together, air flow |
| k, g | `open-small` | Velar | Back of tongue, small jaw opening |
| h | `open-small` | Glottal | Relaxed open position |
| w | `oh` | Approximant | Rounded lips |
| y, j | `ee` | Palatal | Spread lips |
| q | `oh` | Velar + round | Rounded lips for "qu" |

### Punctuation and Whitespace

| Character | Mouth Shape | Notes |
|-----------|-------------|-------|
| Space | `closed` | Natural pause between words |
| Period | `closed` | End of sentence pause |
| Comma | `closed` | Brief pause |
| ! ? | `closed` | End of sentence pause |

## Timeline Format Spec

### LipSyncKeyframe

```typescript
interface LipSyncKeyframe {
  /** Milliseconds from the start of the utterance */
  time: number;
  /** Which mouth shape to render */
  mouthShape: MouthShape;
  /** Duration this shape holds, in milliseconds */
  duration: number;
}
```

### LipSyncTimeline

```typescript
type LipSyncTimeline = LipSyncKeyframe[];
```

A timeline is an array of keyframes sorted by `time` in ascending order. Each keyframe represents a period where one mouth shape is held. Adjacent identical shapes are merged during generation for efficiency.

### Example Timeline

For the text "Hello" spoken over 800ms:

```typescript
[
  { time: 0,   mouthShape: 'open-small', duration: 160 },  // H
  { time: 160, mouthShape: 'ee',         duration: 160 },  // e
  { time: 320, mouthShape: 'open-small', duration: 320 },  // ll (merged)
  { time: 640, mouthShape: 'oh',         duration: 160 },  // o
]
```

## API Reference

### generateSimpleLipSync

```typescript
function generateSimpleLipSync(text: string, durationMs: number): LipSyncTimeline
```

Generates an approximate lip-sync timeline by:
1. Mapping each character to a mouth shape
2. Distributing shapes evenly across the duration
3. Merging consecutive identical shapes
4. Appending a closing frame at the end

**Parameters:**
- `text` - The spoken text
- `durationMs` - Total speech duration in milliseconds

**Returns:** A `LipSyncTimeline` array

### generateFallbackLipSync

```typescript
function generateFallbackLipSync(durationMs: number, tempo?: number): LipSyncTimeline
```

Generates a simple alternating open/closed pattern for when no text is available.

**Parameters:**
- `durationMs` - Total duration
- `tempo` - Oscillations per second (default: 4, range: 2-8)

### getMouthShapeAtTime

```typescript
function getMouthShapeAtTime(timeline: LipSyncTimeline, timeMs: number): MouthShape
```

Looks up which mouth shape should be displayed at a given point in time.

### mouthShapePaths

```typescript
const mouthShapePaths: Record<MouthShape, string>
```

SVG path data for each mouth shape, designed for a coordinate system centered at (0, 0) with approximately 20x12 extent.

## Integration with TTS (SpeechSynthesis API)

The app uses the browser SpeechSynthesis API for text-to-speech. Integration approach:

### Current Integration Pattern

```typescript
// In a speaking component:
const utterance = new SpeechSynthesisUtterance(text);

// Estimate duration (rough: 80ms per character for child-speed TTS)
const estimatedDuration = text.length * 80;
const timeline = generateSimpleLipSync(text, estimatedDuration);

// Start speech and animation simultaneously
speechSynthesis.speak(utterance);
startLipSyncAnimation(timeline);

// On speech end, return to closed mouth
utterance.onend = () => stopLipSyncAnimation();
```

### Using with MascotCharacter

```tsx
function SpeakingMascot({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [mouthShape, setMouthShape] = useState<MouthShape>('closed');
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const speak = useCallback(() => {
    const duration = text.length * 80;
    const timeline = generateSimpleLipSync(text, duration);

    const utterance = new SpeechSynthesisUtterance(text);
    setSpeaking(true);
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      setMouthShape(getMouthShapeAtTime(timeline, elapsed));
      if (elapsed < duration) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    utterance.onend = () => {
      setSpeaking(false);
      setMouthShape('closed');
      cancelAnimationFrame(animFrameRef.current);
    };

    speechSynthesis.speak(utterance);
    animate();
  }, [text]);

  return (
    <MascotCharacter
      characterId="leo"
      expression="happy"
      pose="explaining"
      speaking={speaking}
      currentMouthShape={mouthShape}
    />
  );
}
```

### Natural Speech Engine Considerations

The `useAudio` hook now splits text into natural phrases before speaking. Each phrase is dispatched as a separate `SpeechSynthesisUtterance` with slight pitch and rate variation to produce a more organic cadence. This has several implications for lip-sync timing:

- **Inter-phrase pauses**: The browser inserts small gaps between queued utterances. Lip-sync timelines must account for these pauses rather than treating the full text as one continuous span. During gaps the mouth should return to `closed`.
- **Boundary events fire per phrase**: The `onboundary` event from SpeechSynthesis will fire within each individual utterance, not across the entire original text. Word-boundary offsets reset at the start of every phrase.
- **Per-utterance event listeners**: For accurate sync, attach `onstart` and `onend` handlers to every utterance in the queue. Use `onstart` to begin a new phrase-level timeline and `onend` to snap back to the resting mouth shape until the next phrase begins.
- **Duration estimation**: Because each phrase has independent pitch/rate tweaks, estimate duration per phrase (`phrase.length * 80 / utterance.rate`) rather than computing a single duration for the full text.

```typescript
// Lip-sync with natural phrase queue
phrases.forEach((phrase) => {
  const utt = new SpeechSynthesisUtterance(phrase);
  utt.rate = 0.95 + Math.random() * 0.1;  // slight variation

  const duration = phrase.length * 80 / utt.rate;
  const timeline = generateSimpleLipSync(phrase, duration);

  utt.onstart = () => startLipSyncAnimation(timeline);
  utt.onend = () => setMouthShape('closed');

  speechSynthesis.speak(utt);
});
```

## Integration with Pre-Recorded Audio

For future pre-recorded audio content:

### Approach 1: Pre-Generated Timelines

Store lip-sync timelines alongside audio files:

```typescript
// audioData.ts
export const audioClips = {
  'welcome-leo': {
    audioUrl: '/audio/welcome-leo.mp3',
    duration: 2400,
    lipSync: [
      { time: 0, mouthShape: 'open-small', duration: 200 },
      { time: 200, mouthShape: 'ee', duration: 300 },
      // ... pre-authored keyframes
    ],
  },
};
```

### Approach 2: Runtime Analysis

Use the Web Audio API's AnalyserNode to detect audio amplitude and map to mouth shapes:

```typescript
// Future: amplitude-based lip sync
function amplitudeToMouth(amplitude: number): MouthShape {
  if (amplitude < 0.05) return 'closed';
  if (amplitude < 0.2) return 'open-small';
  if (amplitude < 0.5) return 'ee';
  if (amplitude < 0.8) return 'open-wide';
  return 'oh';
}
```

## Fallback Behavior

When no text or timeline is available, the system provides two fallback modes:

1. **Oscillating fallback** (`generateFallbackLipSync`): Alternates between `closed` and `open-small` at a configurable tempo. Used when the mascot is known to be speaking but text is unavailable.

2. **Generic speaking animation** (in `MascotFace`): When `speaking={true}` but no `currentMouthShape` is provided, the mouth uses Framer Motion's `speakingMouthVariants` to oscillate the scaleY of an ellipse. This is the simplest fallback and requires no timeline computation.

### Fallback Priority
1. Lip-sync timeline with text -> precise mouth shapes
2. Fallback timeline without text -> rhythmic open/close
3. Generic speaking animation -> scaleY oscillation
4. Silent -> static expression mouth

## Future Expansion Notes

### Planned Enhancements

1. **Viseme-level mapping**: Instead of character-level mapping, integrate a phoneme dictionary (CMU Pronouncing Dictionary) for English words to get accurate phoneme sequences, then map phonemes to visemes.

2. **Emotion-influenced mouth shapes**: Blend the expression's mouth curve with lip-sync shapes so a happy character smiles between words while a sad character has a downturned rest position.

3. **Multi-language support**: The current character-to-mouth mapping is English-centric. For other languages, create locale-specific phoneme maps.

4. **Audio-driven sync**: Use Web Audio AnalyserNode for real-time amplitude detection with pre-recorded audio, enabling frame-accurate lip sync without pre-authored timelines.

5. **Timing refinement**: Add support for SpeechSynthesis `boundary` events to sync timeline progress with actual TTS word boundaries rather than relying on estimated character timing.

6. **Mouth shape blending**: Instead of snapping between discrete shapes, interpolate SVG paths between shapes for smoother transitions using Framer Motion's `animate` with path morphing.
