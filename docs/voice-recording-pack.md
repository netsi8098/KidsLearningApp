# Kids Learning Fun -- Voice Recording Production Pack

> Complete guide for recording, managing, and delivering professional voice
> assets for Kids Learning Fun.

---

## 1. Script Formatting Conventions

### Script Block Structure

Every recording script is organised into **scene blocks**. Each block represents
a self-contained audio moment (a lesson intro, a celebration, a bedtime sequence).

```
Scene: Lesson Introduction - Letters
Context: Child opens a new letter-learning lesson.
---
[Narrator / narrator / Warm inviting opening]
"Today we are going to meet a brand new letter! I wonder which one it will be."
Beat: anticipation / warm welcome
Pace: Gentle, unhurried
Lead-in: 0ms

[Leo Lion / mascot-host / Big excited energy]
"ROAR! It is the letter B! B for big, B for brave, B for BRILLIANT!"
Beat: excited reveal
Pace: Energetic but clear on each B-word
Lead-in: 400ms
Note: "B" - emphasise the /b/ sound
```

### Script Line Format

Each line in a script contains:

| Field | Description |
|-------|-------------|
| **Character** | Who is speaking (Narrator, Leo Lion, Daisy Duck, etc.) |
| **Voice Profile** | Which of the 5 profiles to use |
| **Direction** | Acting notes: how to deliver the line |
| **Text** | The exact words to speak |
| **Emotional Beat** | What this moment means in the scene |
| **Pace Note** | Speed and rhythm guidance |
| **Lead-in** | Silence before the line starts (ms) |
| **Pronunciation** | Any words needing special treatment |

---

## 2. Character Direction Notes for Voice Actors

### General Principles (All Characters)

- **You are speaking to ONE child**, not an audience. It is intimate.
- **Assume the child can hear your smile.** Facial expression affects vocal tone.
- **Never talk down.** These are young people, not lesser people.
- **If a line praises, make it genuine.** Hollow praise is worse than silence.
- **Mistakes are celebrated** as learning moments, never scolded.

### Leo Lion

| Trait | Direction |
|-------|-----------|
| Energy | 7/10 baseline. Peaks at 9/10 for celebrations |
| Vocal register | Warm mid-range. Not deep, not high |
| "ROAR!" | Playful, triumphant, NEVER scary. Think excited puppy, not predator |
| Teaching mode | Slightly slower, more deliberate. Leo takes learning seriously |
| Favourite words | "friend", "learn", "amazing", "together" |
| Avoid | Sounding condescending. Leo is excited, not superior |

### Daisy Duck

| Trait | Direction |
|-------|-----------|
| Energy | 8/10 baseline. Creative excitement, not athletic |
| Vocal register | Bright, slightly higher, musical quality |
| "Quack quack!" | Melodic, almost sung. Two distinct notes |
| Creative mode | Gasps of wonder. "Oooh!" and "Wow!" come naturally |
| Favourite words | "beautiful", "create", "colour", "imagine" |
| Avoid | Being shrill. Bright but not piercing |

### Ollie Owl

| Trait | Direction |
|-------|-----------|
| Energy | 3/10 baseline. Never above 5/10 |
| Vocal register | Lowest of all characters. Warm baritone/alto feel |
| "Hoot hoot" | Soft, gentle, like a lullaby's first two notes |
| Bedtime mode | Whisper-level by the end. Words dissolve into silence |
| Favourite words | "gentle", "wisdom", "dream", "rest", "wonder" |
| Avoid | Sounding monotone. Ollie is calm, not bored |

### Ruby Rabbit

| Trait | Direction |
|-------|-----------|
| Energy | 9/10 baseline. Rarely drops below 7/10 |
| Vocal register | Highest of all characters. Bouncy, percussive |
| "Hop hop!" | Sharp, rhythmic, like a drumbeat |
| Game mode | Competitive excitement. "You can do it! Go go go!" |
| Favourite words | "jump", "fast", "play", "champion", "hooray" |
| Avoid | Being exhausting. Peak energy should be in bursts, not sustained |

### Finn Fox

| Trait | Direction |
|-------|-----------|
| Energy | 6/10 baseline. Curiosity-driven, not just raw energy |
| Vocal register | Mid-range, slightly conspiratorial |
| "Psst!" | Whispered, like sharing a secret. Eyes wide |
| Explorer mode | Wonder and discovery. "Whoa, look at this!" |
| Favourite words | "discover", "explore", "secret", "adventure", "cool" |
| Avoid | Sounding know-it-all. Finn discovers WITH the child |

---

## 3. Line Naming Conventions

### File Naming Pattern

```
{character}_{category}_{lineNumber}_take{N}.{ext}
```

| Component | Format | Example |
|-----------|--------|---------|
| character | lowercase, no spaces | `leo`, `narrator`, `daisy` |
| category | lowercase, hyphens | `greeting`, `lesson-intro`, `mistake-recovery` |
| lineNumber | 3-digit zero-padded | `001`, `012`, `099` |
| take | integer | `take1`, `take2`, `take3` |
| ext | format extension | `wav` (source), `mp3` (delivery) |

**Examples:**
```
leo_greeting_004_take2.wav
narrator_bedtime_003_take1.wav
daisy_song-intro_001_take3.mp3
ollie_story-intro_002_take1.wav
ruby_celebration_006_take4.wav
```

---

## 4. Recording Session Workflow

### Pre-Session (Producer)

1. **Select lines** for the session from the voice line library
2. **Generate pronunciation sheet** using `generatePronunciationSheet()`
3. **Prepare script blocks** with acting directions
4. **Set up session metadata** (session ID, date, voice actor, character)
5. **Record 10 seconds of room tone** at the start

### During Session (Engineer + Actor)

1. **Warm-up**: Actor reads 3-4 lines at casual pace to settle in
2. **Record in category blocks**: All greetings, then all encouragements, etc.
3. **Minimum 2 takes per line** (target 3 for key lines)
4. **Mark "favourite take" live** if obvious
5. **Note pronunciation issues** in real-time
6. **Break every 30 minutes** to prevent vocal fatigue

### Post-Session (Engineer)

1. **Review all takes** and select best for each line
2. **Trim silence** to 50ms head and tail
3. **Normalise audio** to -16 LUFS with -1 dBTP true peak
4. **Export processed WAVs** to `recordings/processed/`
5. **Encode delivery MP3s** at 128 kbps CBR
6. **Update session metadata** with selected takes, durations, and approval status
7. **Flag retakes** for lines that did not meet quality bar

### Retake Workflow

1. Create a `RetakeRequest` with the line ID, reason, and new direction notes
2. Retake requests are prioritised: `urgent`, `normal`, `low`
3. Group retakes by character for efficient sessions
4. Retakes follow the same recording and processing pipeline
5. Mark original `RetakeRequest` as fulfilled when the new take is approved

---

## 5. Emotional Variation Labeling

Each recorded take is labeled with a compound emotion descriptor:

```
{primary}-{modifier}
```

| Primary | Modifiers |
|---------|-----------|
| warm | excited, gentle, proud, teaching |
| excited | proud, playful, surprised, triumphant |
| gentle | reassuring, sleepy, wise, loving |
| calm | peaceful, dreamy, safe, hushed |
| playful | silly, bouncy, conspiratorial, mischievous |
| curious | wondering, discovering, whispering, awed |

**Examples:**
- `warm-excited` -- A greeting from Leo
- `gentle-sleepy` -- Ollie during bedtime
- `excited-triumphant` -- Big celebration moment
- `curious-discovering` -- Finn finds something new

---

## 6. Audio Delivery Specs

### Source Files (WAV)

| Parameter | Value |
|-----------|-------|
| Format | WAV (PCM) |
| Sample rate | 44,100 Hz |
| Bit depth | 24-bit (recording), 16-bit (processed) |
| Channels | Mono |
| Noise floor | -60 dB maximum |

### Delivery Files (MP3)

| Parameter | Value |
|-----------|-------|
| Format | MP3 |
| Encoder | LAME |
| Bit rate | 128 kbps CBR |
| Sample rate | 44,100 Hz |
| Channels | Mono |
| Fade | 20ms fade-in, 20ms fade-out |
| Head/tail silence | 50ms maximum |

### Quality Checklist

- [ ] No audible background noise
- [ ] No mouth clicks or plosive pops
- [ ] Consistent volume across all lines in a session
- [ ] Normalised to -16 LUFS
- [ ] True peak does not exceed -1 dBTP
- [ ] Silence trimmed to 50ms head/tail
- [ ] File name matches convention exactly
- [ ] Metadata updated in session JSON

---

## 7. Metadata Schema Reference

### RecordingSession

```typescript
{
  sessionId: string;      // "session-YYYY-MM-DD-{character}-{NN}"
  date: string;           // ISO date "YYYY-MM-DD"
  character: string;      // "leo" | "daisy" | "ollie" | "ruby" | "finn" | "narrator"
  voiceActor: string;     // Actor name
  sessionNotes?: string;  // General session notes
  lines: RecordingLine[];
}
```

### RecordingLine

```typescript
{
  lineId: string;         // References voiceLine.id
  text: string;           // Exact text spoken
  direction: string;      // Acting direction
  emotionLabel: string;   // Compound emotion label
  takesRecorded: number;  // Total takes
  selectedTake: number;   // 1-indexed selected take
  fileName: string;       // Generated filename
  duration: number;       // Seconds (to 1 decimal)
  approved: boolean;      // Quick-check flag
  status: ApprovalStatus; // "pending" | "approved" | "needs-retake" | "cut"
  notes?: string;         // Review notes
}
```

### AudioAssetManifest

```typescript
{
  version: string;              // Semantic version
  generatedAt: string;          // ISO timestamp
  totalFiles: number;
  totalDurationSeconds: number;
  assets: AudioAssetEntry[];    // One per approved line
}
```

### AudioAssetEntry

```typescript
{
  lineId: string;    // References voiceLine.id
  path: string;      // Relative path from assets dir
  format: string;    // "mp3" | "ogg" | "wav"
  duration: number;  // Seconds
  sizeBytes: number; // File size
  hash: string;      // SHA-256 for integrity
}
```

---

## 8. Small Team Workflow Recommendations

### Team of 1-2 People

If you are recording with a minimal team (common for indie apps):

1. **One person wears all hats**: Record yourself, direct yourself, process audio
2. **Use a USB condenser mic** with a pop filter (AT2020 or similar)
3. **Record in a closet** (clothes absorb echo) if you do not have a booth
4. **Process in Audacity** (free): noise reduction, normalisation, trim, export
5. **Record one character per session** to stay in vocal character
6. **Take breaks** every 20 minutes when self-directing
7. **Review the next day** with fresh ears before marking approved

### Team of 3-5 People

1. **Split roles**: Director, engineer, actor (can be 2 people, 3 is ideal)
2. **Director manages script and performance quality**
3. **Engineer manages technical quality and file management**
4. **Record all of one character before switching actors** (if multiple actors)
5. **Use the CSV export** for tracking across team members
6. **Hold a 15-minute review meeting** after each session

### Export Formats for Team Collaboration

```typescript
import { exportLineTracking, toCSV, toJSON } from './recordingPack';

// Export all sessions to CSV for spreadsheet collaboration
const records = exportLineTracking(allSessions);
const csvContent = toCSV(records);
// Save to recordings/metadata/exports/tracking-YYYY-MM-DD.csv

// Export to JSON for developer handoff
const jsonContent = toJSON(records);
// Save to recordings/metadata/exports/tracking-YYYY-MM-DD.json
```

### Recommended Recording Order

Record in this order to build vocal confidence before the hardest categories:

1. **Greetings** -- Easy, natural energy
2. **Encouragements** -- Warm, builds on greeting energy
3. **Celebrations** -- Peak energy (after warming up)
4. **Transitions** -- Medium energy, palate cleanser
5. **Lesson intros** -- Teaching mode
6. **Hints** -- Gentle, nuanced
7. **Retry / Mistake recovery** -- Hardest: must be warm without being patronising
8. **Curiosity** -- Fun, exploratory
9. **Song intros** -- High energy, musical
10. **Story intros** -- Moderate, narrative
11. **Goodbyes** -- Wind down
12. **Bedtime** -- Always record last (hardest to sustain after high-energy takes)

---

## 9. Directory Structure Reference

```
recordings/
+-- raw/                          # Original WAV source files
|   +-- narrator/
|   |   +-- greeting/
|   |   +-- encouragement/
|   |   +-- celebration/
|   |   +-- hint/
|   |   +-- retry/
|   |   +-- bedtime/
|   |   +-- curiosity/
|   |   +-- transition/
|   |   +-- lesson-intro/
|   |   +-- mistake-recovery/
|   |   +-- song-intro/
|   |   +-- story-intro/
|   |   +-- goodbye/
|   +-- leo/
|   |   +-- (same categories)
|   +-- daisy/
|   +-- ollie/
|   +-- ruby/
|   +-- finn/
+-- processed/                    # Normalised, trimmed WAVs
|   +-- (mirrors raw/ structure)
+-- delivery/                     # Final MP3s for app integration
|   +-- (mirrors raw/ structure)
+-- metadata/
|   +-- sessions/                 # JSON session files
|   |   +-- session-2026-03-26-leo-01.json
|   +-- pronunciation/           # Pronunciation guides
|   |   +-- alphabet-guide.pdf
|   |   +-- session-specific-notes.pdf
|   +-- exports/                  # Tracking spreadsheets
|       +-- tracking-2026-03-26.csv
|       +-- tracking-2026-03-26.json
+-- retakes/                      # Lines flagged for re-recording
    +-- retake-requests.json
```
