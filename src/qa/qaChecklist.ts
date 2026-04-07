// ── QA Checklist Data Model & Check Items ────────────────────────
// Defines the complete quality assurance framework for Kids Learning Fun.
// Every piece of content must pass relevant checks before publishing.
// The checks enforce the premium feel across visual, auditory, motion,
// and accessibility dimensions.

// ── Type Definitions ────────────────────────────────────────────

export type QAArea =
  | 'visual'
  | 'mascot'
  | 'copy'
  | 'voice'
  | 'motion'
  | 'sound'
  | 'bedtime'
  | 'age-appropriate'
  | 'accessibility'
  | 'performance';

export type QASeverity = 'critical' | 'major' | 'minor';

export type ContentTypeForQA =
  | 'story'
  | 'lesson'
  | 'game'
  | 'video'
  | 'audio'
  | 'quiz'
  | 'coloring'
  | 'cooking'
  | 'movement'
  | 'explorer'
  | 'emotion'
  | 'homeactivity'
  | 'bedtime-content'
  | 'parent-facing';

export interface QACheckItem {
  /** Unique check identifier */
  readonly id: string;
  /** Area this check belongs to */
  readonly area: QAArea;
  /** The specific question or criterion to verify */
  readonly question: string;
  /** How severe a failure would be */
  readonly severity: QASeverity;
  /** Content types this check applies to */
  readonly applicableTo: ContentTypeForQA[];
  /** Guidance for the reviewer on what to look for */
  readonly guidance: string;
}

export interface QACheckResult {
  /** ID of the check item */
  readonly checkId: string;
  /** Whether this check passed */
  readonly passed: boolean;
  /** Optional reviewer note explaining the result */
  readonly note?: string;
}

export interface QAReview {
  /** ID of the content being reviewed */
  readonly contentId: string;
  /** Type of content being reviewed */
  readonly contentType: ContentTypeForQA;
  /** Reviewer identifier */
  readonly reviewerId: string;
  /** ISO date string of the review */
  readonly date: string;
  /** Results for each applicable check */
  readonly checks: QACheckResult[];
  /** Overall review status */
  readonly overallStatus: 'approved' | 'needs-revision' | 'rejected';
  /** Free-form reviewer notes */
  readonly notes: string;
  /** App version at time of review */
  readonly appVersion?: string;
}

// ── QA Area Metadata ──────────────────────────────────────────

export const qaAreaMeta: Record<QAArea, { label: string; description: string; icon: string }> = {
  visual: {
    label: 'Visual Design',
    description: 'Color palette, shape language, density, backgrounds, and overall visual coherence.',
    icon: 'palette',
  },
  mascot: {
    label: 'Mascot Usage',
    description: 'Character expression, pose appropriateness, frequency, and bedtime suitability.',
    icon: 'pets',
  },
  copy: {
    label: 'Copy & Text',
    description: 'Tone of voice, vocabulary level, grammar, and encouragement patterns.',
    icon: 'text_fields',
  },
  voice: {
    label: 'Voice & Speech',
    description: 'TTS voice profiles, pronunciation, pacing, and emotion tagging.',
    icon: 'record_voice_over',
  },
  motion: {
    label: 'Motion & Animation',
    description: 'Animation intensity, reduced-motion support, bedtime variants, and GPU compositing.',
    icon: 'animation',
  },
  sound: {
    label: 'Sound Effects',
    description: 'Volume levels, startle risk, bedtime safety, and repetition management.',
    icon: 'music_note',
  },
  bedtime: {
    label: 'Bedtime Mode',
    description: 'Calming visuals, dark palette, reduced motion and brightness for nighttime use.',
    icon: 'bedtime',
  },
  'age-appropriate': {
    label: 'Age Appropriateness',
    description: 'Visual density, vocabulary level, touch target sizing, and cognitive load.',
    icon: 'child_care',
  },
  accessibility: {
    label: 'Accessibility',
    description: 'Color contrast, reduced motion, screen reader support, and focus management.',
    icon: 'accessibility',
  },
  performance: {
    label: 'Performance',
    description: 'Asset sizes, animation efficiency, and offline capability.',
    icon: 'speed',
  },
};

// ── Complete Check Item List (40 items) ──────────────────────────

const ALL_CONTENT: ContentTypeForQA[] = [
  'story', 'lesson', 'game', 'video', 'audio', 'quiz',
  'coloring', 'cooking', 'movement', 'explorer', 'emotion',
  'homeactivity', 'bedtime-content',
];

const INTERACTIVE: ContentTypeForQA[] = [
  'game', 'quiz', 'coloring', 'cooking', 'movement', 'explorer',
];

const MEDIA: ContentTypeForQA[] = [
  'video', 'audio', 'story',
];

export const qaCheckItems: QACheckItem[] = [
  // ── Visual (8 checks) ──────────────────────────────────────

  {
    id: 'vis-01',
    area: 'visual',
    question: 'Does the color palette use only approved brand colors (cream, coral, teal, sunny, grape, leaf, tangerine, gold, sky, pink) and their tints/shades?',
    severity: 'major',
    applicableTo: ALL_CONTENT,
    guidance: 'Check every visible color against the palette in designTokens.ts. Tints and shades of brand colors are acceptable. No off-brand grays (use gray-100 through gray-900 from Tailwind). No neon or overly saturated colors that deviate from the brand warmth.',
  },
  {
    id: 'vis-02',
    area: 'visual',
    question: 'Is the shape language consistent -- all corners rounded (min 4px radius), no sharp geometric edges on organic content?',
    severity: 'major',
    applicableTo: ALL_CONTENT,
    guidance: 'Cards should use rounded-2xl (16px) or rounded-xl (12px). Buttons use rounded-xl or rounded-full. No square corners on interactive elements. Check illustrations for sharp corners that break the rounded visual language.',
  },
  {
    id: 'vis-03',
    area: 'visual',
    question: 'Is the visual density appropriate for the target age group? (2-3: max 4 items visible, 4-5: max 8, 6-8: max 12)',
    severity: 'critical',
    applicableTo: [...ALL_CONTENT, 'parent-facing'],
    guidance: 'Count the number of distinct interactive elements and content cards visible without scrolling. Compare against the visualDensity spec in artDirection.ts. For parent-facing content, density can be higher but should not feel cluttered.',
  },
  {
    id: 'vis-04',
    area: 'visual',
    question: 'Is the background appropriate for the content mood? (Learning: light blue, Bedtime: navy, Movement: warm coral wash, Stories: parchment, Parent: cool gray)',
    severity: 'minor',
    applicableTo: ALL_CONTENT,
    guidance: 'Verify the page background matches the mood color scheme defined in moodColorSchemes (artDirection.ts). The background should set the right emotional tone without competing with foreground content.',
  },
  {
    id: 'vis-05',
    area: 'visual',
    question: 'Is the depth layering correct? (Base > Decorative > Interaction > Floating, per depthSystem.ts)',
    severity: 'minor',
    applicableTo: ALL_CONTENT,
    guidance: 'Check z-index ordering: backgrounds at z-0, decorative overlays at z-10, cards/buttons at z-20, modals/toasts at z-30. No interactive element should be hidden behind a decorative layer. No accidental overlapping.',
  },
  {
    id: 'vis-06',
    area: 'visual',
    question: 'Do all text elements meet WCAG AA contrast ratios? (4.5:1 for normal text, 3:1 for large text 18px+)',
    severity: 'critical',
    applicableTo: [...ALL_CONTENT, 'parent-facing'],
    guidance: 'Test every text color against its immediate background. Use a contrast checker tool. Pay special attention to light text on colored backgrounds (e.g., white text on sunny yellow, text on gradient backgrounds). Muted/secondary text still needs 4.5:1.',
  },
  {
    id: 'vis-07',
    area: 'visual',
    question: 'Are shadows soft and consistent? (No harsh drop shadows, no pure black shadows, shadow color matches background)',
    severity: 'minor',
    applicableTo: ALL_CONTENT,
    guidance: 'Shadows should use rgba(0,0,0,0.05-0.10) as defined in shadowElevation (shapeLanguage). No CSS box-shadow with spread > 8px. In bedtime mode, shadows should be even softer or replaced with subtle glows.',
  },
  {
    id: 'vis-08',
    area: 'visual',
    question: 'Does the layout respond gracefully to different viewport sizes? (320px to 428px width range)',
    severity: 'major',
    applicableTo: [...ALL_CONTENT, 'parent-facing'],
    guidance: 'Test at iPhone SE width (320px), iPhone 14 (390px), and iPhone 14 Pro Max (428px). No text truncation that loses meaning. No overflow. Touch targets remain accessible. Grid layouts adapt column count appropriately.',
  },

  // ── Mascot (5 checks) ──────────────────────────────────────

  {
    id: 'msc-01',
    area: 'mascot',
    question: 'Is the mascot expression appropriate for the content context? (Learning: focused/encouraging, Play: excited/playful, Bedtime: sleepy/calm)',
    severity: 'major',
    applicableTo: ALL_CONTENT,
    guidance: 'Cross-reference the expression used against the expressions.ts emotion map. Leo should look brave/encouraging during challenges. Ollie should look calm during bedtime. No excited expressions during calm activities. No sad expressions during learning (even on incorrect answers).',
  },
  {
    id: 'msc-02',
    area: 'mascot',
    question: 'Does the mascot pose match the activity type? (Leo for learning challenges, Daisy for discovery, Ollie for reading/bedtime, Ruby for movement, Finn for puzzles)',
    severity: 'minor',
    applicableTo: ALL_CONTENT,
    guidance: 'Check mascotSpecs in artDirection.ts for each character\'s usageContext. The right character should appear for the right activity. It is acceptable to show any character as the user\'s active character preference, but the pose should still match the activity.',
  },
  {
    id: 'msc-03',
    area: 'mascot',
    question: 'Is the mascot not overused on this screen? (Max 1 mascot appearance per screen, except celebration overlays)',
    severity: 'minor',
    applicableTo: ALL_CONTENT,
    guidance: 'Count mascot instances on the screen. Maximum of 1 in the main content area. MascotBubble counts. Celebration overlays can include a mascot as a bonus appearance. Avoid mascot fatigue -- they should feel special.',
  },
  {
    id: 'msc-04',
    area: 'mascot',
    question: 'Are the character personality traits consistent? (Leo=brave, Daisy=curious, Ollie=wise, Ruby=energetic, Finn=clever)',
    severity: 'minor',
    applicableTo: ALL_CONTENT,
    guidance: 'Check speech bubbles and surrounding text. Leo should use encouraging language ("You can do it!"). Ollie should use calm, wise phrasing. Ruby should be enthusiastic. The personality should never contradict the character\'s established traits.',
  },
  {
    id: 'msc-05',
    area: 'mascot',
    question: 'In bedtime content, is only Ollie (the calm owl) shown, and with a sleepy/peaceful pose?',
    severity: 'major',
    applicableTo: ['bedtime-content'],
    guidance: 'During bedtime mode, only Ollie should appear as the guide character. Expression should be sleepy, calm, or peaceful. No excited/energetic characters or poses. Ollie\'s colors should be compatible with the dark bedtime background.',
  },

  // ── Copy & Text (5 checks) ─────────────────────────────────

  {
    id: 'cpy-01',
    area: 'copy',
    question: 'Does the text tone match the audience? (Warm, encouraging, simple for kids; professional and data-focused for parents)',
    severity: 'critical',
    applicableTo: [...ALL_CONTENT, 'parent-facing'],
    guidance: 'Child-facing: short sentences (5-10 words for ages 2-3, up to 15 for ages 6-8). Exclamation points OK but not excessive. Parent-facing: informative, neutral tone, no baby talk. Check toneGuide.ts for specific guidelines.',
  },
  {
    id: 'cpy-02',
    area: 'copy',
    question: 'Is the vocabulary age-appropriate? (2-3: basic nouns/verbs only, 4-5: simple sentences, 6-8: compound sentences OK)',
    severity: 'critical',
    applicableTo: ALL_CONTENT,
    guidance: 'Read all visible text. For ages 2-3: single words or 2-3 word phrases. For ages 4-5: simple "The cat is big" sentences. For ages 6-8: can include "because" and "but" conjunctions. No jargon, no idioms that young children would not understand.',
  },
  {
    id: 'cpy-03',
    area: 'copy',
    question: 'Does the text avoid shaming language? No "wrong!", "bad", "failed", or negative reinforcement on incorrect answers?',
    severity: 'critical',
    applicableTo: ALL_CONTENT,
    guidance: 'Check all error/incorrect states. Acceptable: "Try again!", "Almost!", "Let\'s try another one!", "Not quite -- you\'re learning!". Not acceptable: "Wrong!", "No!", "That\'s incorrect", "You failed", "Bad answer". Every incorrect answer should still feel encouraging.',
  },
  {
    id: 'cpy-04',
    area: 'copy',
    question: 'Does the text vary sufficiently from nearby content? (No two adjacent items should have identical encouragement phrases)',
    severity: 'minor',
    applicableTo: ALL_CONTENT,
    guidance: 'Check for repetitive praise text ("Great job!" appearing on every card). Use the variation patterns defined in toneGuide.ts. At minimum, rotate through 3-4 different encouragement phrases within a single screen\'s content items.',
  },
  {
    id: 'cpy-05',
    area: 'copy',
    question: 'Is all text grammatically correct with proper spelling, punctuation, and capitalization?',
    severity: 'major',
    applicableTo: [...ALL_CONTENT, 'parent-facing'],
    guidance: 'Review every text string visible on the screen. Check for typos, missing periods, inconsistent capitalization (Title Case vs sentence case). Button labels should be Title Case. Body text should be sentence case. Labels/headers should be consistent throughout.',
  },

  // ── Voice & Speech (4 checks) ──────────────────────────────

  {
    id: 'vox-01',
    area: 'voice',
    question: 'Does the TTS voice profile match the character speaking? (Each mascot has a distinct pitch, rate, and personality)',
    severity: 'major',
    applicableTo: ['story', 'lesson', 'audio', 'bedtime-content'],
    guidance: 'Cross-reference with voiceProfiles.ts. Leo: warm, mid-pitch, moderate pace. Ollie: gentle, lower pitch, slow pace. Ruby: bright, higher pitch, fast pace. If no character is speaking (narrator), use the neutral narrator profile. Test by listening with speech enabled.',
  },
  {
    id: 'vox-02',
    area: 'voice',
    question: 'Is the speech pacing appropriate for the content? (Bedtime: 0.8x speed, Learning: 0.9x, Normal: 1.0x)',
    severity: 'minor',
    applicableTo: ['story', 'lesson', 'audio', 'bedtime-content'],
    guidance: 'Listen to the actual TTS output. Bedtime content should feel slower and more soothing. Learning content should be slightly slower for comprehension. Fast pacing is acceptable only in movement/game contexts. Check speechRate property against voiceProfiles.ts.',
  },
  {
    id: 'vox-03',
    area: 'voice',
    question: 'Are pronunciations correct for educational content? (Letters, numbers, animal names, body parts all pronounced clearly)',
    severity: 'critical',
    applicableTo: ['lesson', 'quiz', 'audio'],
    guidance: 'Test TTS on every educational word/phrase. Letters should use phonetic pronunciation where appropriate ("A says /a/"). Numbers should be pronounced as words. Any proper nouns or unusual words should use SSML pronunciation hints if available. Verify on at least 2 different TTS engines/voices.',
  },
  {
    id: 'vox-04',
    area: 'voice',
    question: 'Are emotion tags in the speech data accurate for the context? (SSML prosody matches the intended emotion)',
    severity: 'minor',
    applicableTo: ['story', 'emotion', 'bedtime-content'],
    guidance: 'Check SSML or emotion tag data for each spoken line. Celebration lines should have enthusiastic prosody. Bedtime lines should have calm prosody. Sad story moments should have gentle prosody. No monotone delivery on emotional content.',
  },

  // ── Motion & Animation (4 checks) ──────────────────────────

  {
    id: 'mot-01',
    area: 'motion',
    question: 'Is the animation intensity appropriate -- not overstimulating for the target age? (No rapid flashing, no more than 3 simultaneous animated elements)',
    severity: 'critical',
    applicableTo: ALL_CONTENT,
    guidance: 'Count simultaneously animated elements. Max 3 for ages 2-3, max 5 for ages 4-5, max 8 for ages 6-8. No element should flash more than 3 times per second (WCAG 2.3.1). Celebration overlays are exempt but should still not flash. No seizure-risk patterns.',
  },
  {
    id: 'mot-02',
    area: 'motion',
    question: 'Does the animation support comprehension rather than distract from it? (Entrance animations guide attention to new content, not just decorate)',
    severity: 'major',
    applicableTo: ALL_CONTENT,
    guidance: 'Every animation should serve a purpose: guide attention (entrance stagger), provide feedback (button press), celebrate achievement (star burst), or indicate state change (page transition). Purely decorative animations should be classified as "ambient" level and be very subtle.',
  },
  {
    id: 'mot-03',
    area: 'motion',
    question: 'Is there a reduced-motion fallback? When prefers-reduced-motion is enabled, do animations degrade to simple opacity fades or no animation?',
    severity: 'critical',
    applicableTo: [...ALL_CONTENT, 'parent-facing'],
    guidance: 'Enable reduced-motion in Settings or via system preferences. Verify: no scale animations, no translate animations, no spring bounces. Only opacity transitions should remain (from reducedMotionEntrance). Interactive feedback should use opacity only (reducedMotionFeedback). Ambient animations should stop completely.',
  },
  {
    id: 'mot-04',
    area: 'motion',
    question: 'Does a bedtime variant exist that slows animations by 1.5x and removes springs/bouncing?',
    severity: 'major',
    applicableTo: ['bedtime-content', 'story', 'audio'],
    guidance: 'Enable bedtime mode. Verify: all spring animations replaced with gentle tween easing. Duration multiplied by BEDTIME_TIMING_MULTIPLIER (1.5x). No playful overshooting. Entrance animations should feel like gentle fades. Check against adaptForBedtime() in motionPrimitives.ts.',
  },

  // ── Sound Effects (4 checks) ───────────────────────────────

  {
    id: 'snd-01',
    area: 'sound',
    question: 'Are sound effect volumes appropriate? (UI sounds: 20-40% volume, Celebrations: 50-70%, no sound exceeds 80%)',
    severity: 'major',
    applicableTo: INTERACTIVE,
    guidance: 'Test with device volume at 75%. UI feedback sounds (tap, toggle) should be barely audible. Celebration sounds should be noticeable but not loud. No sound should be startling at full device volume. Check gain values in soundRegistry.ts.',
  },
  {
    id: 'snd-02',
    area: 'sound',
    question: 'Is there no startling or sudden loud sound? (All sounds must have a brief fade-in, no instantaneous full-volume onset)',
    severity: 'critical',
    applicableTo: [...INTERACTIVE, ...MEDIA],
    guidance: 'Play through the entire content flow with eyes closed, listening for any jarring sounds. Error/wrong-answer sounds must be gentle (soft tone, not a buzzer). Transition sounds must not have sharp attacks. Test from silence -- the first sound should not be a shock.',
  },
  {
    id: 'snd-03',
    area: 'sound',
    question: 'Are sounds safe for bedtime mode? (When bedtime mode is active, either sounds are muted or use the calming sound variant)',
    severity: 'major',
    applicableTo: ['bedtime-content', 'story', 'audio'],
    guidance: 'Enable bedtime mode. Check that either: (a) sounds are automatically muted, or (b) the bedtime sound mood variant from soundMoods.ts is active (gentle, quiet). No celebration fanfares, no energetic sound effects. Soft chimes and gentle tones only.',
  },
  {
    id: 'snd-04',
    area: 'sound',
    question: 'Is sound repetition managed? (Same sound effect should not play more than 3x in a row without variation)',
    severity: 'minor',
    applicableTo: INTERACTIVE,
    guidance: 'Tap through 10 sequential interactions. Check that feedback sounds rotate or have micro-variations in pitch. The same exact audio sample should not repeat identically more than 3 times consecutively. Refer to the repetition management rules in soundRegistry.ts.',
  },

  // ── Bedtime Mode (3 checks) ────────────────────────────────

  {
    id: 'bed-01',
    area: 'bedtime',
    question: 'Is the overall visual impression calming? (Dark backgrounds, muted colors, soft edges, no vibrant/exciting elements)',
    severity: 'critical',
    applicableTo: ['bedtime-content'],
    guidance: 'Enable bedtime mode and view the content. Background should be deep navy/indigo (#1a1a2e). Text should be light indigo/lavender tones. No coral, sunny, or tangerine appearing at full saturation. All card surfaces should use the calm dark surface (#16213e). The overall impression should make you feel sleepy, not alert.',
  },
  {
    id: 'bed-02',
    area: 'bedtime',
    question: 'Are bright/vibrant colors absent? (No coral, sunny yellow, tangerine, or full-saturation colors in bedtime mode)',
    severity: 'critical',
    applicableTo: ['bedtime-content'],
    guidance: 'Scan every visible element. Coral (#FF6B6B) must not appear. Sunny (#FFE66D) must not appear. Tangerine (#FF8C42) must not appear. Only indigo, purple, lavender, and muted blue-gray tones are allowed. Gold should be replaced with a muted amber if used for stars. Check the bedtime color scheme in moodColorSchemes.',
  },
  {
    id: 'bed-03',
    area: 'bedtime',
    question: 'Is motion reduced to gentle fades and slow transitions? (No bouncing, no popping, no confetti, no fast entrance animations)',
    severity: 'critical',
    applicableTo: ['bedtime-content'],
    guidance: 'Watch all animations in bedtime mode. Everything should feel like gentle breathing -- slow, smooth, no surprises. Page transitions should be soft crossfades lasting 800ms+. No spring animations (check for type:"spring" in Framer Motion). No celebration overlays. Star awards should be a gentle glow, not a burst.',
  },

  // ── Age Appropriateness (3 checks) ─────────────────────────

  {
    id: 'age-01',
    area: 'age-appropriate',
    question: 'Is the screen density appropriate for the age group? (Items visible, spacing, and complexity match visualDensity spec)',
    severity: 'critical',
    applicableTo: ALL_CONTENT,
    guidance: 'Compare the screen against the AgeDensitySpec in artDirection.ts. For 2-3: max 4 visible items, min 64px touch targets, 28px headings, 20px body text. For 4-5: max 8 items, 48px targets, 24px headings. For 6-8: max 12 items, 44px targets. If the content does not have an age group, it should target the preschool (4-5) density as the default.',
  },
  {
    id: 'age-02',
    area: 'age-appropriate',
    question: 'Is the vocabulary level correct for the labeled age group? (No complex words for toddlers, no baby talk for early readers)',
    severity: 'critical',
    applicableTo: ALL_CONTENT,
    guidance: 'Read all text. Ages 2-3: concrete nouns, basic verbs, colors, numbers 1-10. Ages 4-5: simple sentences, common adjectives, can count to 20. Ages 6-8: compound sentences, "because/if/when" OK, basic reading words. Never talk down to older kids or talk over younger kids.',
  },
  {
    id: 'age-03',
    area: 'age-appropriate',
    question: 'Are touch targets sized appropriately? (Min 64px for 2-3, 48px for 4-5, 44px for 6-8)',
    severity: 'critical',
    applicableTo: [...INTERACTIVE, 'parent-facing'],
    guidance: 'Measure all tappable elements using developer tools or overlay grid. Include padding in the measurement (the effective tap area, not just the visible area). Buttons, cards, toggles, and any interactive element must meet the minimum for the target age. Parent-facing content should meet at least the 44px WCAG minimum.',
  },

  // ── Accessibility (2 checks) ───────────────────────────────

  {
    id: 'a11-01',
    area: 'accessibility',
    question: 'Do all text and essential UI elements meet WCAG AA contrast ratio of 4.5:1 (3:1 for large text 18px+ or bold 14px+)?',
    severity: 'critical',
    applicableTo: [...ALL_CONTENT, 'parent-facing'],
    guidance: 'Use the browser\'s accessibility inspector or a contrast checker tool on every text color + background color pair. Pay special attention to: muted/secondary text, text on colored buttons, text on gradient backgrounds, placeholder text in inputs, and disabled state text. All must be 4.5:1 minimum (3:1 for large/bold text).',
  },
  {
    id: 'a11-02',
    area: 'accessibility',
    question: 'Is the prefers-reduced-motion preference respected? (All Framer Motion animations degrade gracefully)',
    severity: 'critical',
    applicableTo: [...ALL_CONTENT, 'parent-facing'],
    guidance: 'Enable "Reduce motion" in system settings or in-app Settings toggle. Navigate through the content. Verify: no scale animations play, no translate/slide animations play, no spring-based bouncing occurs. Only opacity transitions should remain. Content should still be fully functional and navigable. Auto-playing loops (ambient particles, floating shapes) should stop completely.',
  },

  // ── Performance (2 checks) ─────────────────────────────────

  {
    id: 'prf-01',
    area: 'performance',
    question: 'Are asset file sizes within budget? (Icons <2KB, scenes <30KB, mascots <15KB, total page assets <100KB)',
    severity: 'major',
    applicableTo: ALL_CONTENT,
    guidance: 'Check the network tab for all assets loaded by this content. Individual files must meet the size budgets from formatRules in assetPipeline.ts. The total weight of all assets loaded for a single page should not exceed 100KB (SVG + images, excluding the app bundle). PWA precache additions should be considered in the overall budget.',
  },
  {
    id: 'prf-02',
    area: 'performance',
    question: 'Are animations GPU-composited? (Only transform and opacity are animated, no layout-triggering properties like width/height/top/left)',
    severity: 'major',
    applicableTo: ALL_CONTENT,
    guidance: 'Use browser DevTools "Layers" panel or "Paint flashing" to verify. Framer Motion\'s x, y, scale, rotate, and opacity are GPU-composited. Avoid animating: width, height, top, left, right, bottom, padding, margin, border-radius. If layout animations are needed, use Framer Motion\'s layout prop which uses transform internally. Check for any CSS transitions on non-composite properties.',
  },
];

// ── Helper Functions ────────────────────────────────────────────

/**
 * Get all check items for a specific QA area.
 */
export function getChecksByArea(area: QAArea): QACheckItem[] {
  return qaCheckItems.filter((c) => c.area === area);
}

/**
 * Get all check items applicable to a specific content type.
 */
export function getChecksForContentType(type: ContentTypeForQA): QACheckItem[] {
  return qaCheckItems.filter((c) => c.applicableTo.includes(type));
}

/**
 * Get only critical checks for a content type (minimum viable review).
 */
export function getCriticalChecks(type: ContentTypeForQA): QACheckItem[] {
  return qaCheckItems.filter(
    (c) => c.applicableTo.includes(type) && c.severity === 'critical'
  );
}

/**
 * Calculate the overall status for a review based on check results.
 *
 * Logic:
 * - Any critical check failed -> 'rejected'
 * - Any major check failed -> 'needs-revision'
 * - All passed -> 'approved'
 */
export function calculateReviewStatus(
  checks: QACheckResult[],
  contentType: ContentTypeForQA,
): QAReview['overallStatus'] {
  const applicableChecks = getChecksForContentType(contentType);

  for (const result of checks) {
    if (!result.passed) {
      const checkDef = qaCheckItems.find((c) => c.id === result.checkId);
      if (checkDef?.severity === 'critical') return 'rejected';
    }
  }

  for (const result of checks) {
    if (!result.passed) {
      const checkDef = qaCheckItems.find((c) => c.id === result.checkId);
      if (checkDef?.severity === 'major') return 'needs-revision';
    }
  }

  // Check that all applicable checks have results
  const checkedIds = new Set(checks.map((c) => c.checkId));
  const unchecked = applicableChecks.filter((c) => !checkedIds.has(c.id));
  if (unchecked.length > 0) return 'needs-revision';

  return 'approved';
}

/**
 * Create an empty review template for a given content item.
 */
export function createEmptyReview(
  contentId: string,
  contentType: ContentTypeForQA,
  reviewerId: string,
): QAReview {
  const applicableChecks = getChecksForContentType(contentType);

  return {
    contentId,
    contentType,
    reviewerId,
    date: new Date().toISOString().split('T')[0],
    checks: applicableChecks.map((c) => ({
      checkId: c.id,
      passed: false,
    })),
    overallStatus: 'needs-revision',
    notes: '',
  };
}

/**
 * Summary statistics for a review.
 */
export function getReviewStats(review: QAReview): {
  total: number;
  passed: number;
  failed: number;
  critical_failed: number;
  major_failed: number;
  minor_failed: number;
} {
  const total = review.checks.length;
  const passed = review.checks.filter((c) => c.passed).length;
  const failed = total - passed;

  const failedChecks = review.checks.filter((c) => !c.passed);
  let critical_failed = 0;
  let major_failed = 0;
  let minor_failed = 0;

  for (const fc of failedChecks) {
    const def = qaCheckItems.find((c) => c.id === fc.checkId);
    if (def?.severity === 'critical') critical_failed++;
    else if (def?.severity === 'major') major_failed++;
    else minor_failed++;
  }

  return { total, passed, failed, critical_failed, major_failed, minor_failed };
}
