# Kids Learning Fun -- Voice Lines Guide

> How the voice line system works, how lines are selected and played,
> and how to write new lines that match the brand.

---

## 1. Voice Line Categories

The library contains 100+ lines across 13 categories:

| Category | Count | Purpose |
|----------|-------|---------|
| `greeting` | 12 | Welcome the child on entry (time-of-day, session type, character) |
| `encouragement` | 16 | Support during activities (effort, progress, struggle) |
| `celebration` | 12 | Reward on achievement (graduated: small win to big milestone) |
| `hint` | 10 | Gentle guidance without giving away the answer |
| `retry` | 10 | Support after wrong answers (never shaming, always warm) |
| `bedtime` | 10 | Calm, soothing content for wind-down mode |
| `curiosity` | 8 | Spark wonder and exploration |
| `transition` | 8 | Bridge between activities or screens |
| `lesson-intro` | 7 | Open a new learning activity |
| `mistake-recovery` | 7 | Scaffold after errors (show the right approach) |
| `song-intro` | 5 | Lead into singalong activities |
| `story-intro` | 5 | Open a story experience |
| `goodbye` | 8 | Warm farewell at session end |

---

## 2. Emotional and Context Tagging System

### Emotion Tags

Every line is tagged with 1-3 emotions that describe how it should feel:

| Tag | Description | Example Use |
|-----|-------------|-------------|
| `calm` | Peaceful, grounded, still | Bedtime, transitions |
| `excited` | High energy, enthusiastic | Celebrations, discoveries |
| `gentle` | Soft, reassuring, tender | Mistakes, retries, bedtime |
| `proud` | Impressed, affirming | Completions, effort-praise |
| `curious` | Wondering, questioning | Hints, exploration, curiosity |
| `sleepy` | Drowsy, winding down | Bedtime only |
| `warm` | Friendly, loving, connected | Universal warmth layer |
| `playful` | Fun, silly, lighthearted | Games, songs, character lines |

### Context Tags

Lines are tagged with the context in which they should appear:

| Tag | Description | Triggered When |
|-----|-------------|----------------|
| `first-session` | Child's first ever visit | No play history exists |
| `returning` | Child has played before | Session count > 1 |
| `lesson-complete` | Just finished an activity | Completion event fires |
| `mistake` | Just gave a wrong answer | Error event fires |
| `story-time` | In a story activity | Story screen active |
| `song-time` | In a music activity | Singalong screen active |
| `bedtime` | Bedtime mode is active | `bedtimeMode === true` |
| `morning` | Before noon | Time-based check |
| `end-of-day` | Session ending or goodbye | Exit flow |
| `streak` | Multi-day streak | `streakDays >= 2` |

---

## 3. Playback Selection Logic

When a line needs to play, the system follows this selection algorithm:

```
1. FILTER by requested category/context/emotion
2. FILTER by age group (match player's age or "all")
3. FILTER by character (if character-specific requested)
4. EXCLUDE recently played lines (last 10)
5. SORT remaining by priority (1 = highest)
6. SELECT randomly among top-priority candidates
7. RESOLVE voice profile (see "Voice Profile Integration" below)
8. SELECT best available SpeechSynthesis voice (see "Voice Selection" below)
9. APPLY age-group rate/pitch adjustments from speechRules
10. SPEAK via natural speech engine (phrase-split with prosody variation)
11. TRACK line ID in rotation history
```

### Voice Profile Integration (`useAudio` + `voiceProfiles.ts`)

Learning pages (ABCs, Numbers, Shapes, Colors, Animals, etc.) use the
`useAudio` hook for all speech. Instead of hardcoded rate/pitch values,
`useAudio.speak()` now pulls TTS parameters from the voice profiles
defined in `src/voice/voiceProfiles.ts`.

The `speak` function signature:

```typescript
speak(text: string, profileOrRate?: VoiceProfileId | number)
```

- **`VoiceProfileId` argument** (recommended): Pass a profile ID such as
  `'narrator'`, `'mascot-host'`, `'bedtime-narrator'`, `'song-leader'`, or
  `'parent-guide'`. The hook looks up the matching profile and applies its
  `ttsHints` (rate, pitch, volume, lang) automatically.
- **Default**: When called with no second argument, the profile defaults to
  `'narrator'`.
- **Legacy numeric rate**: For backward compatibility, passing a plain number
  is still accepted. The number is ignored and the hook falls back to the
  `'narrator'` profile so that existing call sites continue to work without
  changes.

After profile parameters are resolved, the hook applies age-group adjustments
(`speechRules.ts`) to scale rate and offset pitch for the current player's
age group.

### Voice Selection

The `useAudio` hook selects the best available `SpeechSynthesisVoice` using a
premium-first ranked preference list:

```
1. Enhanced voices  (e.g. "Samantha (Enhanced)", "Karen (Enhanced)")
2. Premium voices   (e.g. "Samantha (Premium)", "Zoe (Premium)")
3. Siri voices
4. Standard macOS/iOS voices (Samantha, Karen, Zoe, Ava, Allison)
5. Google TTS voices (Google US English, Google UK English Female)
6. Windows voices   (Microsoft Zira, Microsoft Jenny)
7. Fallback: any English voice, or the first voice in the list
```

The voice list is filtered to English-language voices and the first match in
priority order wins. The selected voice is cached and refreshed whenever the
browser fires a `voiceschanged` event.

**User override**: Users (parents) can manually select a voice from the
Settings screen voice picker. The chosen voice name is persisted to
`localStorage` under the key `klf-preferred-voice`. When a user override is
present it takes absolute priority over the ranked list. Clearing the
selection in Settings removes the key and reverts to automatic selection.

Related exports from `useAudio.ts`:

| Function | Purpose |
|----------|---------|
| `setPreferredVoice(name)` | Save a user-chosen voice (or `null` to clear) |
| `getAvailableVoices()` | Return all English voices for the picker UI |
| `getActiveVoiceName()` | Return the name of the currently active voice |

### Bedtime Mode Overrides

When bedtime mode is active:
- Voice profile is forced to `bedtime-narrator`
- Emotion filtering prefers `calm` and `sleepy`
- Non-bedtime category requests fall back to `bedtime` category
- Rate drops to 72%, volume to soft

---

## 4. Rotation and Repetition Prevention

The `useVoiceLine` hook maintains a rotation buffer of the last 10 line IDs:

```
Buffer: [greet-003, enc-001, cel-004, hint-002, ...]
```

- When selecting a new line, any ID in the buffer is excluded from candidates
- If all candidates are in the buffer (small category), the buffer is ignored
  and a random selection is made
- The buffer is stored in a `useRef` and persists across renders but resets
  on unmount (navigation away)
- This prevents the child from hearing the same line twice in quick succession

---

## 5. Age-Appropriate Line Selection

Lines are tagged with an `ageGroup` field:

| Value | Matches |
|-------|---------|
| `'2-3'` | Toddlers only |
| `'4-5'` | Preschoolers only |
| `'6-8'` | Early learners only |
| `'all'` | Any age group |

The selection system reads the current player's `ageGroup` from the profile.
Lines tagged `'all'` are always eligible. Age-specific lines only appear for
their target group.

**If no player profile exists**, the system defaults to `'4-5'` as the middle ground.

---

## 6. How to Write New Voice Lines

### Brand Voice Checklist

Before adding a new line, verify it meets these criteria:

- [ ] **Warmth**: Does it feel like a caring friend, not a robot?
- [ ] **Specificity**: Is it about something concrete, not generic?
- [ ] **Positivity**: Does it focus on what the child DID, not what they failed?
- [ ] **Age match**: Is the vocabulary appropriate for the tagged age group?
- [ ] **No shame**: Could a child ever feel bad hearing this? (If yes, rewrite)
- [ ] **Brevity**: Is it as short as it can be while staying warm?
- [ ] **Speakability**: Read it aloud. Does it flow naturally?

### Writing Rules

1. **Use contractions carefully**: "You are" is clearer in TTS than "You're"
2. **Avoid idioms** for ages 2-5: "On fire" is confusing to a 3-year-old
3. **Use the child's perspective**: "You did it!" not "The task is complete"
4. **Name emotions**: "You must feel so proud!" helps emotional literacy
5. **Invite participation**: "Can you...?", "Let us...", "Show me..."
6. **Celebrate effort over results**: "You tried so hard!" > "You got it right!"
7. **No conditional love**: Never imply affection depends on performance

### Line Structure

```typescript
{
  id: 'cat-NNN',           // category prefix + zero-padded number
  text: 'The spoken text',  // Plain text, no SSML
  category: 'encouragement',
  emotionTags: ['warm', 'proud'],
  contextTags: ['lesson-complete'],
  ageGroup: '4-5',
  characterId: 'leo',       // optional: undefined = narrator
  voiceProfileId: 'mascot-host',
  ssml: '...',               // optional: SSML-enriched version
  priority: 2,               // 1 = must-play, 5 = filler
}
```

### Priority Guidelines

| Priority | Use Case |
|----------|----------|
| 1 | Core lines that must exist (first greeting, main celebration) |
| 2 | Strong variety lines that improve the experience |
| 3 | Nice-to-have variety for long sessions |
| 4 | Seasonal or situational lines |
| 5 | Filler that adds texture but is not essential |

### ID Naming Convention

| Prefix | Category |
|--------|----------|
| `greet-` | greeting |
| `enc-` | encouragement |
| `cel-` | celebration |
| `hint-` | hint |
| `retry-` | retry |
| `bed-` | bedtime |
| `cur-` | curiosity |
| `trans-` | transition |
| `les-` | lesson-intro |
| `mis-` | mistake-recovery |
| `song-` | song-intro |
| `story-` | story-intro |
| `bye-` | goodbye |

---

## 7. Example Usage in Various Screens

### ABC / Letters Page

```typescript
const { speakRandom, speakByContext } = useVoiceLine('leo');

// On page enter
speakByContext('returning', 'warm'); // "Hey there, friend! Leo here..."

// After correct answer
speakRandom('celebration'); // "You did it! Fantastic!"

// After wrong answer
speakRandom('retry'); // "Almost! Let us try again!"

// Hint button pressed
speakRandom('hint'); // "Look carefully. The answer is hiding right there!"
```

### Bedtime Mode

```typescript
const { speakRandom, speakByContext } = useVoiceLine('ollie');

// On entering bedtime mode
speakByContext('bedtime', 'sleepy');
// -> "Good evening, little one. The stars are out, and so are we."
// -> Automatically uses bedtime-narrator profile

// Starting a bedtime story
speakRandom('story-intro');
// -> "Hoot hoot! Ollie has a brand new story for you tonight..."
```

### Quiz / Matching Game

```typescript
const { speak, speakRandom } = useVoiceLine('ruby');

// Ruby introduces the game
speak('greet-005'); // "Hop hop hooray! You are here!"

// Streak of correct answers
speakRandom('encouragement'); // with streak context

// After completing the quiz
speakRandom('celebration');
```

### Leaving the App

```typescript
const { speakByContext } = useVoiceLine();

// Goodbye flow
speakByContext('end-of-day', 'warm');
// Narrator: "Bye bye for now! You were amazing today."
```
