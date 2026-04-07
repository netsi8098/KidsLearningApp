# QA Playbook

> Maintaining the premium feel of Kids Learning Fun over time.

## QA Philosophy

Kids Learning Fun is a premium educational app for children ages 2-8. Quality is not just about bug-free code -- it is about maintaining a **cohesive, trustworthy, developmentally appropriate experience** across every interaction.

Every piece of content goes through a structured review process before publishing. This playbook is the guide for that process.

### Core Principles

1. **Children deserve premium quality.** No rough edges, no jarring sounds, no confusing layouts. If it does not feel polished, it is not ready.

2. **Parents must trust the app.** Every screen a child sees has been reviewed for age-appropriateness, safety, and educational value.

3. **Consistency compounds.** One off-brand element might go unnoticed. Fifty create a messy experience. Every check matters.

4. **Bedtime is sacred.** Content used at bedtime has the strictest requirements. No bright colors, no exciting animations, no sudden sounds.

5. **Accessibility is not optional.** Every child deserves access, regardless of ability. Contrast ratios, reduced motion, and touch targets are critical-severity checks.

---

## QA Areas (10 Dimensions)

| Area | Icon | Description | Typical Checks |
|------|------|-------------|----------------|
| **Visual** | palette | Color, shape, density, shadows | 8 checks |
| **Mascot** | pets | Expression, pose, frequency, personality | 5 checks |
| **Copy** | text | Tone, vocabulary, grammar, encouragement | 5 checks |
| **Voice** | voice | TTS profile, pacing, pronunciation | 4 checks |
| **Motion** | animation | Intensity, purpose, reduced-motion, bedtime | 4 checks |
| **Sound** | music | Volume, startle risk, bedtime safety | 4 checks |
| **Bedtime** | bedtime | Calming visuals, dark palette, reduced motion | 3 checks |
| **Age** | child | Density, vocabulary, touch targets | 3 checks |
| **Accessibility** | a11y | Contrast, reduced motion | 2 checks |
| **Performance** | speed | Asset sizes, GPU compositing | 2 checks |

**Total: 40 checks** across all areas.

---

## Checklist Reference by Area

### Visual Design (8 checks)

| ID | Severity | Check |
|----|----------|-------|
| vis-01 | Major | Color palette uses only approved brand colors and tints/shades |
| vis-02 | Major | Shape language consistent -- all corners rounded (min 4px), no sharp edges |
| vis-03 | Critical | Visual density appropriate for target age group |
| vis-04 | Minor | Background matches content mood (learning/bedtime/movement/stories/parent) |
| vis-05 | Minor | Depth layering correct (base > decorative > interaction > floating) |
| vis-06 | Critical | Text meets WCAG AA contrast ratios (4.5:1 normal, 3:1 large) |
| vis-07 | Minor | Shadows soft and consistent, no harsh/black shadows |
| vis-08 | Major | Layout responds to viewport sizes (320px to 428px) |

### Mascot Usage (5 checks)

| ID | Severity | Check |
|----|----------|-------|
| msc-01 | Major | Expression appropriate for context (learning/play/bedtime) |
| msc-02 | Minor | Pose matches activity type (Leo=learning, Ollie=reading, etc.) |
| msc-03 | Minor | Not overused (max 1 per screen, except celebrations) |
| msc-04 | Minor | Character personality traits consistent |
| msc-05 | Major | Bedtime content shows only Ollie with sleepy/calm pose |

### Copy and Text (5 checks)

| ID | Severity | Check |
|----|----------|-------|
| cpy-01 | Critical | Tone matches audience (warm for kids, professional for parents) |
| cpy-02 | Critical | Vocabulary age-appropriate (2-3: basic, 4-5: simple, 6-8: compound OK) |
| cpy-03 | Critical | No shaming language on incorrect answers |
| cpy-04 | Minor | Text varies from nearby content (no repetitive praise) |
| cpy-05 | Major | Grammar, spelling, punctuation, and capitalization correct |

### Voice and Speech (4 checks)

| ID | Severity | Check |
|----|----------|-------|
| vox-01 | Major | TTS voice profile matches the speaking character |
| vox-02 | Minor | Speech pacing appropriate (bedtime: 0.8x, learning: 0.9x) |
| vox-03 | Critical | Pronunciations correct for all educational content |
| vox-04 | Minor | Emotion tags/prosody accurate for context |

### Motion and Animation (4 checks)

| ID | Severity | Check |
|----|----------|-------|
| mot-01 | Critical | Not overstimulating (max 3 simultaneous animations for toddlers) |
| mot-02 | Major | Animation supports comprehension, not just decoration |
| mot-03 | Critical | Reduced-motion fallback exists (opacity-only transitions) |
| mot-04 | Major | Bedtime variant exists (1.5x slower, no springs/bouncing) |

### Sound Effects (4 checks)

| ID | Severity | Check |
|----|----------|-------|
| snd-01 | Major | Volume levels appropriate (UI: 20-40%, Celebrations: 50-70%, max: 80%) |
| snd-02 | Critical | No startling sudden sounds (all have fade-in) |
| snd-03 | Major | Bedtime-safe (muted or calming variant active) |
| snd-04 | Minor | Repetition managed (same sound max 3x in a row) |

### Bedtime Mode (3 checks)

| ID | Severity | Check |
|----|----------|-------|
| bed-01 | Critical | Overall impression calming (dark bg, muted colors, soft edges) |
| bed-02 | Critical | No bright/vibrant colors (no coral, sunny, tangerine at full saturation) |
| bed-03 | Critical | Motion reduced to gentle fades and slow transitions only |

### Age Appropriateness (3 checks)

| ID | Severity | Check |
|----|----------|-------|
| age-01 | Critical | Screen density matches age group (4/8/12 items max) |
| age-02 | Critical | Vocabulary level correct for labeled age |
| age-03 | Critical | Touch targets sized correctly (64px/48px/44px minimum) |

### Accessibility (2 checks)

| ID | Severity | Check |
|----|----------|-------|
| a11-01 | Critical | All text/UI meets WCAG AA contrast (4.5:1 / 3:1 for large) |
| a11-02 | Critical | prefers-reduced-motion respected |

### Performance (2 checks)

| ID | Severity | Check |
|----|----------|-------|
| prf-01 | Major | Asset file sizes within budget (page total < 100KB) |
| prf-02 | Major | Animations GPU-composited (only transform/opacity animated) |

---

## Review Matrix per Content Type

The matrix defines which QA areas are **required** vs **optional** for each content type, with weights (1-10) indicating relative importance.

### Legend
- **R** = Required, **O** = Optional, **--** = Not applicable
- Number in parentheses = weight (higher = more important)

| Content Type | Visual | Mascot | Copy | Voice | Motion | Sound | Bedtime | Age | A11y | Perf |
|-------------|--------|--------|------|-------|--------|-------|---------|-----|------|------|
| Stories | R(9) | R(7) | R(10) | R(9) | R(7) | R(6) | R(8) | R(10) | R(8) | R(5) |
| Lessons | R(9) | R(6) | R(10) | R(9) | R(6) | O(4) | O(3) | R(10) | R(8) | R(5) |
| Games | R(8) | R(5) | R(7) | O(3) | R(9) | R(9) | -- | R(9) | R(7) | R(9) |
| Videos | R(6) | -- | R(9) | -- | R(4) | O(3) | R(5) | R(10) | R(7) | R(6) |
| Audio | R(5) | R(4) | R(7) | R(10) | R(4) | R(8) | R(7) | R(8) | R(5) | R(4) |
| Quizzes | R(8) | R(6) | R(10) | R(7) | R(7) | R(7) | -- | R(10) | R(8) | R(4) |
| Coloring | R(9) | -- | R(4) | -- | R(5) | R(4) | R(6) | R(7) | R(6) | R(9) |
| Cooking | R(8) | R(5) | R(9) | R(6) | R(4) | R(3) | -- | R(10) | R(6) | R(3) |
| Movement | R(7) | R(8) | R(6) | R(8) | R(9) | R(10) | -- | R(8) | R(5) | R(7) |
| Explorer | R(9) | R(7) | R(8) | R(7) | R(6) | R(5) | O(3) | R(9) | R(6) | R(6) |
| Emotions | R(9) | R(8) | R(10) | R(8) | R(5) | R(5) | R(6) | R(10) | R(7) | R(3) |
| Home Activities | R(7) | R(4) | R(9) | R(5) | R(3) | R(2) | -- | R(10) | R(5) | R(2) |
| Bedtime Content | R(9) | R(8) | R(8) | R(9) | R(9) | R(9) | R(10) | R(8) | R(7) | R(4) |
| Parent-Facing | R(9) | -- | R(9) | -- | R(5) | -- | -- | -- | R(8) | R(6) |

---

## QA Preview Panel Usage

The QA Preview Panel (`QAPreviewPanel.tsx`) is a development tool for reviewing content.

### Accessing the Panel

The panel is accessible from the PreviewPage (behind parent gate) or can be rendered as an overlay on any content page during development.

```tsx
import QAPreviewPanel from '../qa/QAPreviewPanel';

<QAPreviewPanel
  contentId="lesson:l-2-abc-1"
  visible={showQA}
  onClose={() => setShowQA(false)}
/>
```

### Panel Features

1. **Metadata Tab**: Shows content ID, type, tags, skills, badges, age group, and access tier.
2. **Preview Controls**: Toggle grid overlay, simulate reduced motion, simulate bedtime mode.
3. **Checklist Tab**: All applicable checks with pass/fail toggles, severity badges, guidance details, and per-check notes.
4. **Matrix Tab**: Shows required vs optional QA areas for this content type with weights.
5. **Review Progress**: Bar showing how many checks have been completed and passed.
6. **Actions**: "Approve All" (marks everything passed), "Needs Revision", and "Export" (downloads review as JSON).

### Exporting Reviews

The Export button downloads a JSON file with the complete review data:

```json
{
  "contentId": "lesson:l-2-abc-1",
  "contentType": "lesson",
  "reviewerId": "dev",
  "date": "2026-03-26",
  "checks": [
    { "checkId": "vis-01", "passed": true },
    { "checkId": "vis-02", "passed": true, "note": "Rounded corners OK" },
    ...
  ],
  "overallStatus": "approved",
  "notes": "Ready for production"
}
```

---

## Content Approval Workflow

```
DRAFT          REVIEW           APPROVED         PUBLISHED
  |               |                |                |
  | Content       | Reviewer runs  | All critical   | Content appears
  | created by    | QA checklist   | checks pass.   | in live app for
  | team member   | in Preview     | No major       | all users.
  |               | Panel          | failures.      |
  |               |                |                |
  | Tagged with   | Status set to  | Registry entry | releaseConfig
  | badges: new   | approved /     | gets           | badges applied
  |               | needs-revision | approved: true | (new, popular)
```

### Status Definitions

- **Draft**: Content exists in data files but has not been reviewed. May have `approved: false` in asset registry.
- **Review**: Content is being actively reviewed. Reviewer is working through the checklist.
- **Approved**: All critical checks pass. No more than 2 minor failures. Ready for production.
- **Needs Revision**: One or more major checks failed. Content needs changes before re-review.
- **Rejected**: One or more critical checks failed. Significant issues require substantial rework.

### Status Calculation Logic

```
Any critical check failed?  -->  REJECTED
Any major check failed?     -->  NEEDS REVISION
All checks have results?
  No                        -->  NEEDS REVISION (incomplete review)
  Yes, all passed           -->  APPROVED
```

---

## Red Flags to Watch For

These patterns indicate potential quality issues and should trigger extra scrutiny:

### Visual Red Flags
- Off-brand colors (especially neon greens, pure blacks, or grays not from Tailwind)
- Sharp corners on cards, buttons, or interactive elements
- Inconsistent shadow styles (some hard, some soft)
- Text over complex backgrounds without sufficient contrast

### Copy Red Flags
- Shaming language: "Wrong!", "Bad!", "Failed!", "No!"
- Baby talk for 6-8 age group: "Does wittle Johnny want to...?"
- Repetitive encouragement: "Great job!" on every single card
- Typos or inconsistent capitalization

### Motion Red Flags
- More than 3 elements animating simultaneously for toddler content
- Flashing more than 3 times per second (seizure risk)
- Spring animations in bedtime content
- No reduced-motion fallback for any animation

### Sound Red Flags
- Any sound that is startling when played from silence
- Error/wrong-answer sounds that feel punishing (buzzers, harsh tones)
- Full-volume sounds with no fade-in
- Same sound repeating identically 4+ times in a row

### Bedtime Red Flags
- Any coral, sunny yellow, or tangerine color visible
- Spring-based bouncy animations
- Celebration confetti or fireworks
- Non-Ollie mascot characters
- Excited/energetic text or voice prosody

---

## QA for Bedtime Content

Bedtime content receives special attention because it directly affects children's sleep quality.

### Mandatory Bedtime Checks

All 3 bedtime checks (bed-01, bed-02, bed-03) are **critical severity** for bedtime content. Any failure blocks publication.

### Additional Bedtime Criteria

1. **Colors**: Only indigo (#4338CA), purple (#7C3AED), lavender (#C4B5FD), light indigo text (#E0E7FF), and muted blue-gray. No warm colors.

2. **Mascot**: Only Ollie the Owl appears. Expression must be sleepy, calm, or peaceful. No other characters.

3. **Voice**: Ollie's TTS voice at 0.8x speed. Gentle, low-pitched delivery. Long pauses between sentences.

4. **Sound**: Maximum 30% volume. Only soft chimes, gentle nature sounds, or white noise. Auto-fade after 10 seconds of inactivity.

5. **Motion**: All animations use tween easing (no springs). Duration multiplied by 1.5x. No entrance animations with Y-offset > 5px. No scale animations > 1.02.

6. **Content**: No stimulating content (games, quizzes, energetic activities). Only stories, lullabies, guided breathing, and gentle ambient experiences.

7. **Screen brightness**: Consider adding a dimming overlay (10-20% opacity black) for extra eye comfort.

### Bedtime Testing Procedure

1. Set device brightness to 50%.
2. Enable bedtime mode in Settings.
3. Navigate to the bedtime content.
4. Observe the screen from arm's length in a dimly lit room.
5. Ask: "Would I feel calm looking at this while getting sleepy?"
6. Listen to all audio: "Would this help me fall asleep?"
7. Watch all animations: "Is anything drawing my eye or creating urgency?"

---

## QA for Age Appropriateness

Age-appropriate design is not just about content -- it is about the entire interaction model.

### Ages 2-3 (Toddler)

- **Max 4 items** visible without scrolling
- **Touch targets >= 64px** (preferably 72px)
- **Text: single words** or 2-3 word phrases
- **Font size >= 20px** for body text
- **Simple animations** only (fade, basic scale)
- **No scrolling required** for primary content
- **Large, central focal point** on each screen
- **Immediate audio feedback** on every tap

### Ages 4-5 (Preschool)

- **Max 8 items** visible without scrolling
- **Touch targets >= 48px** (preferably 56px)
- **Text: simple sentences** (5-10 words)
- **Font size >= 16px** for body text
- **Moderate animations** (entrance staggers OK)
- **Minimal scrolling** (1-2 screenfuls max)
- **2-3 focal areas** per screen
- **Audio feedback** on interactive elements

### Ages 6-8 (Early Reader)

- **Max 12 items** visible without scrolling
- **Touch targets >= 44px** (preferably 48px)
- **Text: compound sentences** OK
- **Font size >= 14px** for body text
- **Rich animations** (springs, staggers, celebrations)
- **Scrolling OK** for lists and galleries
- **Multiple focal areas** with clear visual hierarchy
- **Audio feedback** optional (text reading ability assumed)

---

## How to Add New QA Checks

As the app grows, new checks may be needed. Follow this process:

### 1. Identify the Gap

What quality issue has been observed that existing checks do not catch?

### 2. Define the Check

Add a new entry to `qaCheckItems` in `qaChecklist.ts`:

```typescript
{
  id: 'vis-09',                    // Sequential ID within the area
  area: 'visual',                  // Which QA area
  question: 'Is the specific question to verify?',
  severity: 'major',              // critical | major | minor
  applicableTo: ['story', 'lesson'],  // Which content types
  guidance: 'Detailed instructions for the reviewer...',
}
```

### 3. Update the Matrix

If the check introduces a new area or changes the required/optional status for a content type, update `qaMatrix.ts`.

### 4. Test the Panel

Verify the new check appears in the QA Preview Panel for applicable content types.

### 5. Document

Add the check to this playbook in the appropriate area section.

---

## Small Team Workflow

For a team of 1-3 people developing Kids Learning Fun:

### Solo Developer

- Use the QA Preview Panel during development as a self-review tool
- Focus on critical-severity checks first
- Review bedtime content in an actual dark room before publishing
- Export JSON reviews as a personal audit trail

### Two-Person Team

- Developer creates content, partner reviews in QA Preview Panel
- Use "Export" to share review JSON via commit or issue tracker
- Alternate reviewer roles to prevent blind spots
- Prioritize: critical checks on every piece, major checks on new content types

### Three-Person Team

- Content creator writes copy and configures data files
- Developer implements the screen/component
- Reviewer runs QA checklist and either approves or sends back with notes
- Weekly review meeting to discuss any needs-revision items
- Track review stats: percentage approved on first review = quality signal

### Batch Review Approach

When adding multiple content items of the same type:

1. Review the first item thoroughly (all checks)
2. For subsequent items of the same type, focus on:
   - Copy checks (each item has unique text)
   - Age-appropriate checks (if age groups vary)
   - Any checks that failed on the first item
3. Spot-check visual and motion on every 5th item

---

## File Reference

| File | Purpose |
|------|---------|
| `src/qa/qaChecklist.ts` | Check item definitions (40 items), review data model, status calculation, helper functions |
| `src/qa/qaMatrix.ts` | Content type vs QA area matrix, required/optional weights, scoring |
| `src/qa/QAPreviewPanel.tsx` | React component for the interactive QA review panel |
| `src/brand/artDirection.ts` | Illustration style rules, color mood schemes, visual density specs |
| `src/brand/parentMode.ts` | Parent mode visual configuration |
| `src/motion/motionPrimitives.ts` | Motion tokens, bedtime adaptations, reduced-motion variants |
| `src/sound/soundRegistry.ts` | Sound effect definitions and volume rules |
| `src/copy/toneGuide.ts` | Tone of voice guidelines |
| `src/voice/voiceProfiles.ts` | TTS voice profiles per character |
