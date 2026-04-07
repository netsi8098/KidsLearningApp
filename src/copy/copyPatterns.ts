// ── Copy Patterns ───────────────────────────────────────────────────────────
// Reusable copy templates for every screen type in Kids Learning Fun.
// Templates use {placeholders} that are filled at runtime.
// Each pattern defines every text area on a screen with variants and rules.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export interface CopySection {
  /** Identifies the text area on screen (e.g. 'header', 'body', 'cta'). */
  area: string;
  /** Primary template string with {placeholders}. */
  template: string;
  /** Alternative templates — the system can cycle through these for freshness. */
  variants: string[];
  /** Writing rules specific to this area. */
  rules: string[];
}

export interface CopyPattern {
  /** Screen type identifier. */
  screenType: string;
  /** Description for the writer's room. */
  description: string;
  /** Ordered sections — top to bottom as they appear on screen. */
  sections: CopySection[];
}

// ── Pattern Definitions ─────────────────────────────────────────────────────

export const copyPatterns: CopyPattern[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // LESSON INTRO SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'lesson-intro',
    description: 'The first screen a child sees before a lesson begins. Sets tone and expectation.',
    sections: [
      {
        area: 'header',
        template: "Let's learn about {topic}!",
        variants: [
          'Time to explore {topic}!',
          "Ready to discover {topic}?",
          '{topic} — here we go!',
        ],
        rules: [
          'Topic name should be simple and recognizable.',
          'Max 6 words for ages 2-3, 8 words for 4-5, 10 words for 6-8.',
          'One exclamation point OR one question mark, never both.',
        ],
      },
      {
        area: 'mascot-bubble',
        template: 'I have been so excited to show you this! Are you ready?',
        variants: [
          'We are going to have so much fun with {topic}.',
          'I love {topic}. Let me show you!',
          'Pssst... I know something fun about {topic}. Come see!',
        ],
        rules: [
          'Mascot speech uses the active mascot voice profile from toneGuide.',
          'Keep to 2 sentences maximum.',
          'End with an invitation, not a command.',
        ],
      },
      {
        area: 'body',
        template: 'In this lesson, you will learn {learningGoal}.',
        variants: [
          'Today you will explore {learningGoal}.',
          'By the end, you will know {learningGoal}.',
        ],
        rules: [
          'One clear learning outcome. Do not list multiple goals.',
          'Use "you will" not "the learner will" or "students will".',
          'Keep it concrete: "the names of 5 shapes" not "shape recognition".',
        ],
      },
      {
        area: 'cta',
        template: "Let's go!",
        variants: [
          "I'm ready!",
          'Start!',
          'Begin!',
        ],
        rules: [
          'Max 3 words.',
          'Use first person ("I\'m ready") or collective ("Let\'s go").',
          'Never use "Submit" or "Proceed".',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVITY INSTRUCTION AREA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'activity-instruction',
    description: 'The instruction text during an interactive activity (quiz, matching, coloring, etc.).',
    sections: [
      {
        area: 'instruction',
        template: 'Tap the {target}.',
        variants: [
          'Find the {target} and tap it.',
          'Which one is the {target}? Tap it!',
          'Can you find the {target}?',
        ],
        rules: [
          'Lead with the action verb: tap, drag, find, listen, say, trace, count.',
          'Name the target clearly — use the same word shown on screen.',
          'Max one sentence. If two steps, break into two screens.',
          'Ages 2-3: one verb, one noun. "Tap the cat."',
          'Ages 4-5: can add a qualifier. "Tap the blue triangle."',
          'Ages 6-8: can include reasoning. "Tap the one that comes next in the pattern."',
        ],
      },
      {
        area: 'hint',
        template: 'Hint: Look for something {hintAdjective}.',
        variants: [
          'Need a clue? It starts with {hintDetail}.',
          'Here is a hint: {hintDetail}.',
          'Try looking at the {hintLocation}.',
        ],
        rules: [
          'Hints appear only after a pause or incorrect attempt.',
          'Never give away the answer — guide toward discovery.',
          'Keep hints warm, not condescending.',
          'Use the mascot voice when possible.',
        ],
      },
      {
        area: 'progress-label',
        template: '{current} of {total}',
        variants: [
          'Question {current} of {total}',
          '{current}/{total}',
        ],
        rules: [
          'Pure information — no decoration.',
          'Arabic numerals, not words.',
          'For ages 2-3, consider showing dots instead of numbers.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ QUESTION PRESENTATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'quiz-question',
    description: 'How a quiz question is framed for the child.',
    sections: [
      {
        area: 'question',
        template: '{questionText}',
        variants: [],
        rules: [
          'Questions are clear, direct, and answerable from what was taught.',
          'Avoid double negatives.',
          'Use "which" or "what" — avoid "can you tell me".',
          'Ages 2-3: Picture-based questions with minimal text.',
          'Ages 4-5: Simple text + picture.',
          'Ages 6-8: Text-based, may include reasoning.',
        ],
      },
      {
        area: 'correct-response',
        template: 'Yes! That is right.',
        variants: [
          'You got it!',
          'Exactly!',
          'That is the one!',
          'Perfect!',
        ],
        rules: [
          'Immediate and warm.',
          'One line only.',
          'Vary across questions — do not repeat the same praise twice in a row.',
          'Can reference what they got right: "Yes! That is the letter B."',
        ],
      },
      {
        area: 'incorrect-response',
        template: 'Not quite. The answer is {correctAnswer}.',
        variants: [
          'Almost! It was {correctAnswer}. You will get it next time.',
          'Good try! The right answer is {correctAnswer}.',
          'So close! {correctAnswer} is the one.',
        ],
        rules: [
          'Never say "wrong" or "incorrect".',
          'Always reveal the correct answer so the child learns.',
          'Follow up with encouragement, not disappointment.',
          'Keep the tone identical to a correct answer in warmth — just different words.',
        ],
      },
      {
        area: 'completion',
        template: 'Quiz done! You answered {correct} out of {total}.',
        variants: [
          'All finished! {correct} out of {total} — great work!',
          'You completed the quiz. {correct} right out of {total}!',
        ],
        rules: [
          'Always include the score.',
          'Frame the score positively — even 1 out of 5 is "You got one! Nice start."',
          'For perfect scores, add extra celebration.',
          'Offer a clear next action: "Try again" or "Next lesson".',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REWARD / CELEBRATION MOMENT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'reward-celebration',
    description: 'The moment a child earns a star, badge, or completes a milestone.',
    sections: [
      {
        area: 'header',
        template: 'You did it!',
        variants: [
          'Amazing!',
          'Look at you!',
          'Wow!',
          'Superstar!',
        ],
        rules: [
          'Big, bold, and celebratory.',
          'Max 4 words.',
          'One exclamation point.',
        ],
      },
      {
        area: 'body',
        template: 'You earned a {rewardType} for {achievement}.',
        variants: [
          'A shiny new {rewardType} — all because you {achievement}.',
          'This {rewardType} is yours. You {achievement}!',
          'For {achievement}, you earned a {rewardType}!',
        ],
        rules: [
          'Name the specific reward (star, badge name).',
          'Name the specific achievement (finished the colors lesson, matched 10 pairs).',
          'Never generic. "Badge earned" is not acceptable.',
          'Graduate energy: star = warm, badge = proud, milestone = full celebration.',
        ],
      },
      {
        area: 'mascot-reaction',
        template: 'I am so proud of you!',
        variants: [
          'ROAR! That was incredible!',
          'Hop hop hooray!',
          'Hoot hoot! Well done, wise one.',
          'What a discovery! You are amazing.',
          'Quack! Beautiful work!',
        ],
        rules: [
          'Must match the active mascot voice.',
          'Include the mascot signature sound for big wins.',
          'Keep to one sentence.',
        ],
      },
      {
        area: 'cta',
        template: 'Keep going!',
        variants: [
          "What's next?",
          'More!',
          'See my rewards',
        ],
        rules: [
          'Forward-looking — keep momentum.',
          'Offer "See my rewards" as a secondary option, not the primary CTA.',
          'Max 3 words.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'empty-state',
    description: 'When a collection, list, or area has no content yet.',
    sections: [
      {
        area: 'header',
        template: 'Nothing here yet!',
        variants: [
          'This is a fresh start.',
          'Your adventure begins here.',
          'Ready to get started?',
        ],
        rules: [
          'Never sad or apologetic.',
          'Frame emptiness as opportunity.',
          'Max 6 words.',
        ],
      },
      {
        area: 'body',
        template: '{contextMessage}',
        variants: [
          'Start exploring to fill this up!',
          'Complete activities to see them here.',
          'Tap the heart on things you love to save them.',
        ],
        rules: [
          'Explain HOW to fill the empty state.',
          'Use one concrete action.',
          'Keep it encouraging, not instructional.',
        ],
      },
      {
        area: 'cta',
        template: "Let's explore!",
        variants: [
          'Start now!',
          'Go discover!',
          'Begin!',
        ],
        rules: [
          'Action-oriented.',
          'Links to relevant content area.',
          'Max 3 words.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'error-state',
    description: 'When something goes wrong — loading failure, network issue, unexpected error.',
    sections: [
      {
        area: 'header',
        template: 'Oops!',
        variants: [
          'Uh oh!',
          'Hmm...',
          'Oh no!',
        ],
        rules: [
          'Friendly and non-alarming.',
          'One word or short exclamation.',
          'Never technical.',
        ],
      },
      {
        area: 'body',
        template: 'Something went a little sideways. Let us try again.',
        variants: [
          'That did not work quite right. Want to try one more time?',
          'We hit a little bump, but we can fix it!',
          'Something got tangled up. Let us sort it out.',
        ],
        rules: [
          'Never blame the child.',
          'Use "we" — the app and child are a team.',
          'Avoid technical language: no "error 404", "server", "timeout".',
          'Keep it light for children; keep it clear for parents.',
        ],
      },
      {
        area: 'cta',
        template: 'Try again',
        variants: [
          'Go back',
          'Retry',
          'Start over',
        ],
        rules: [
          'Clear action.',
          'Max 3 words.',
          'Always offer a way out (back button or home).',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH RESULTS / NO RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'search-results',
    description: 'Search results page, including the no-results state.',
    sections: [
      {
        area: 'results-header',
        template: '{count} results for "{query}"',
        variants: [
          'We found {count} things for "{query}"!',
          'Here is what we found for "{query}".',
        ],
        rules: [
          'Show the count and the search term.',
          'Keep the search term in quotes so the child sees what they typed.',
          'For ages 2-3, a parent helper likely typed — keep it simple.',
        ],
      },
      {
        area: 'no-results-header',
        template: 'No results found',
        variants: [
          'Hmm, nothing came up.',
          "We couldn't find that.",
        ],
        rules: [
          'Non-blaming.',
          'Short and clear.',
        ],
      },
      {
        area: 'no-results-body',
        template: 'Try different words or check the spelling.',
        variants: [
          'Try a shorter word!',
          "Let's search for something else.",
          'Maybe try another word?',
        ],
        rules: [
          'Offer a concrete next step.',
          'Ages 2-3: skip spelling advice.',
          'Ages 6-8: can mention spelling.',
        ],
      },
      {
        area: 'no-results-suggestion',
        template: 'How about exploring {suggestedTopic}?',
        variants: [
          'You might like {suggestedTopic}!',
          'While you are here, try {suggestedTopic}.',
        ],
        rules: [
          'Suggest something related or popular.',
          'Keep the child engaged — do not let no-results be a dead end.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BEDTIME TRANSITION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'bedtime-transition',
    description: 'The screen that transitions the child into bedtime mode.',
    sections: [
      {
        area: 'header',
        template: 'Time to wind down...',
        variants: [
          'Goodnight mode...',
          'The day is ending...',
          'Shhh... bedtime.',
        ],
        rules: [
          'No exclamation points.',
          'Use ellipses for gentle trailing.',
          'Lowercase energy. Soft words.',
        ],
      },
      {
        area: 'body',
        template: 'The stars are waking up and the moon is smiling down. Let us get cozy.',
        variants: [
          'The world outside is growing quiet. A perfect time for a gentle story.',
          'Close your eyes for a moment. Feel how calm everything is.',
          'The night is soft and warm. You are safe and loved.',
        ],
        rules: [
          'Lyrical, flowing language.',
          'Nature imagery: stars, moon, clouds, gentle breeze, quiet forest.',
          'No action verbs — this is about stillness.',
          'Address the child tenderly.',
          'Max 2 sentences.',
        ],
      },
      {
        area: 'mascot-message',
        template: 'Goodnight, little one. I will be right here in the morning.',
        variants: [
          'Hoot hoot... sleep well, dear friend.',
          'Shhh... the world will be here tomorrow. Rest now.',
          'What a wonderful day you had. Sweet dreams.',
        ],
        rules: [
          'Should come from Ollie (bedtime mascot) by default.',
          'Whisper-level energy.',
          'End with reassurance: "I will be here" or "see you tomorrow".',
        ],
      },
      {
        area: 'cta',
        template: 'Start bedtime story',
        variants: [
          'Begin',
          'Listen',
          'Drift off...',
        ],
        rules: [
          'Soft, lowercase energy.',
          'No exclamation points.',
          '"Drift off" only for breathing/sound activities, not stories.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAUSE / BREAK SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'pause-break',
    description: 'Screen shown when the app suggests a break or the child pauses.',
    sections: [
      {
        area: 'header',
        template: 'Brain Break!',
        variants: [
          'Time for a break!',
          'Pause!',
          'Rest stop!',
        ],
        rules: [
          'Friendly, not alarming.',
          'Use positive language — breaks are good!',
          'Max 3 words.',
        ],
      },
      {
        area: 'body',
        template: 'You have been learning so well. Give your brain a little rest.',
        variants: [
          'Great work! Stand up, stretch, and come back when you are ready.',
          'Time to let all that learning sink in. Take a quick break.',
          'Even superheroes take breaks. You earned this one!',
        ],
        rules: [
          'Normalize and celebrate the break.',
          'Suggest a physical action: stretch, drink water, wiggle.',
          'Never make the child feel forced to stop.',
          'Max 2 sentences.',
        ],
      },
      {
        area: 'suggestion',
        template: 'Try this: Stand up and stretch your arms high!',
        variants: [
          'Wiggle your fingers! Wiggle your toes!',
          'Take three slow, deep breaths.',
          'Get a sip of water and come right back!',
          'Look out the window. What do you see?',
        ],
        rules: [
          'One specific, simple physical action.',
          'Appropriate for the child to do alone and safely.',
          'No equipment needed.',
        ],
      },
      {
        area: 'cta',
        template: "I'm ready to come back!",
        variants: [
          'Keep learning!',
          "Let's go!",
          'Continue',
        ],
        rules: [
          'The child controls when the break ends.',
          'Never auto-resume.',
          'Use first person: "I\'m ready" not "Resume session".',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PARENTAL SETTINGS DESCRIPTION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'parent-settings',
    description: 'Description text below each setting toggle in the Settings page.',
    sections: [
      {
        area: 'setting-description',
        template: '{settingDescription}',
        variants: [],
        rules: [
          'One sentence that explains what the setting does AND why it matters.',
          'Use plain language — no tech jargon.',
          'Pattern: "When enabled, [benefit for child]. [Optional reassurance]."',
          'Example: "When enabled, the app reads instructions aloud. Great for early learners who are still building reading skills."',
          'Always end with a period.',
        ],
      },
      {
        area: 'setting-label',
        template: '{settingName}',
        variants: [],
        rules: [
          'Max 3 words.',
          'Use the common name: "Sound Effects" not "Audio Feedback System".',
          'Title case.',
        ],
      },
      {
        area: 'setting-confirmation',
        template: 'Saved! Your change is active now.',
        variants: [
          'Done! This setting takes effect right away.',
          'Updated! You can change this anytime.',
        ],
        rules: [
          'Brief confirmation — appears as a toast.',
          'Include reassurance that they can undo.',
          'Max one sentence.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STORY PAGE NARRATION CUES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'story-narration',
    description: 'Cues and UI text that frame the story reading experience.',
    sections: [
      {
        area: 'story-intro',
        template: 'Once upon a time...',
        variants: [
          'Long ago, in a land far away...',
          'Let me tell you a story...',
          'Are you sitting comfortably? Then let us begin.',
        ],
        rules: [
          'Classic storybook openings.',
          'Gentle, inviting tone.',
          'No exclamation points for bedtime stories.',
          'One exclamation point allowed for daytime adventure stories.',
        ],
      },
      {
        area: 'page-turn-prompt',
        template: 'Tap to turn the page.',
        variants: [
          'Swipe to continue.',
          'What happens next? Tap to find out.',
        ],
        rules: [
          'Keep focus on the story, not the UI.',
          'For bedtime: use softer "Tap when you are ready."',
          'Ages 2-3: parent likely turning pages — keep simple.',
        ],
      },
      {
        area: 'story-end',
        template: 'The End.',
        variants: [
          'And they all lived happily ever after.',
          'The End. What a lovely story!',
          'And so the adventure came to a close.',
        ],
        rules: [
          'Satisfying closure.',
          'For bedtime stories, follow with a goodnight message.',
          'For daytime stories, follow with a "What did you like?" prompt.',
        ],
      },
      {
        area: 'read-aloud-toggle',
        template: 'Read to me',
        variants: [
          'Listen along',
          'Hear the story',
        ],
        rules: [
          'Max 3 words.',
          'Makes it clear this enables audio narration.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GAME WIN / LOSS STATES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'game-result',
    description: 'End-of-game feedback for win and incomplete states (never "loss").',
    sections: [
      {
        area: 'win-header',
        template: 'You won!',
        variants: [
          'Amazing!',
          'Champion!',
          'You did it!',
        ],
        rules: [
          'Big and celebratory.',
          'Max 3 words.',
          'One exclamation point.',
        ],
      },
      {
        area: 'win-body',
        template: 'You scored {score} points! That is your best yet.',
        variants: [
          '{score} points! Look at you go!',
          'What a game! {score} points earned.',
          'You finished with {score} points. Incredible!',
        ],
        rules: [
          'Always show the score.',
          'Compare to personal best when applicable (not to other children).',
          'Celebrate improvement, not just high scores.',
        ],
      },
      {
        area: 'incomplete-header',
        template: 'Nice try!',
        variants: [
          'Good effort!',
          'So close!',
          'Almost there!',
        ],
        rules: [
          'NEVER say "you lost" or "game over" in a negative way.',
          'Frame incomplete as a step toward mastery.',
          'Same warmth level as a win.',
        ],
      },
      {
        area: 'incomplete-body',
        template: 'You scored {score}. Want to try and beat that?',
        variants: [
          '{score} points! I bet you can do even better. Ready to try?',
          'That was a great start. Play again to level up!',
          'Every game makes you better. Go for it again!',
        ],
        rules: [
          'Show the score without judgment.',
          'Always offer replay as the primary action.',
          'Frame replay as opportunity, not remediation.',
        ],
      },
      {
        area: 'cta-replay',
        template: 'Play again!',
        variants: [
          'One more time!',
          'Try again!',
          'Rematch!',
        ],
        rules: [
          'High energy.',
          'Max 3 words.',
          'Primary CTA should always be replay for games.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COLLECTION OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'collection-overview',
    description: 'A collection page showing grouped content (e.g., "All About Animals", "Counting Fun").',
    sections: [
      {
        area: 'header',
        template: '{collectionName}',
        variants: [],
        rules: [
          'Use the collection name exactly as defined in data.',
          'Title case.',
          'No punctuation in the title itself.',
        ],
      },
      {
        area: 'description',
        template: '{collectionDescription}',
        variants: [],
        rules: [
          'One sentence describing what the child will do or learn.',
          'Use active language: "Explore the world of..." not "This collection contains..."',
          'Max 15 words.',
        ],
      },
      {
        area: 'progress-label',
        template: '{completed} of {total} complete',
        variants: [
          '{completed}/{total} done!',
          '{percentage}% finished!',
        ],
        rules: [
          'Show both completed and total.',
          'For 0%, use empty state messaging instead.',
          'For 100%, use celebration messaging.',
        ],
      },
      {
        area: 'completion-message',
        template: 'You finished the whole collection! What an achievement.',
        variants: [
          'Every single one — done! You should be very proud.',
          'Collection complete! Time to celebrate!',
        ],
        rules: [
          'Only shows when 100% complete.',
          'Celebratory but not over-the-top for every collection.',
          'Name the effort: "every single one" reinforces accomplishment.',
        ],
      },
      {
        area: 'cta',
        template: 'Play next',
        variants: [
          'Continue',
          'Start next activity',
          'Keep going!',
        ],
        rules: [
          'Points to the next uncompleted activity.',
          'If all complete, CTA becomes "Play again" or "Explore more".',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEKLY RECAP SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    screenType: 'weekly-recap',
    description: 'Weekly summary shown in the parent dashboard and optionally to the child.',
    sections: [
      {
        area: 'parent-header',
        template: "This Week's Learning",
        variants: [
          'Weekly Recap',
          'Week of {dateRange}',
        ],
        rules: [
          'Clean, professional header for the parent view.',
          'Include date range when space allows.',
        ],
      },
      {
        area: 'parent-summary',
        template: '{name} completed {activityCount} activities across {topicCount} topics this week.',
        variants: [
          'A busy week! {activityCount} activities in {topicCount} different areas.',
          '{activityCount} activities completed. {topHighlight} was the favorite.',
        ],
        rules: [
          'Lead with numbers.',
          'Include the child\'s name.',
          'Mention variety (number of topics) to show breadth.',
          'Always positive framing.',
        ],
      },
      {
        area: 'parent-highlight',
        template: 'Highlight: {highlightDetail}.',
        variants: [
          'Standout moment: {highlightDetail}.',
          'This week\'s win: {highlightDetail}.',
        ],
        rules: [
          'Pick the most notable achievement.',
          'Specific: "Learned all uppercase letters" not "Good progress in reading".',
          'One sentence.',
        ],
      },
      {
        area: 'parent-recommendation',
        template: 'Next week, try introducing {suggestedTopic} for variety.',
        variants: [
          'Suggestion: {suggestedTopic} would be a great next step.',
          'Ready for more? {suggestedTopic} builds on this week\'s skills.',
        ],
        rules: [
          'One gentle suggestion, not a mandate.',
          'Explain why it is a good next step.',
          'Never critical of what was or was not done.',
        ],
      },
      {
        area: 'child-summary',
        template: 'Wow! You did {activityCount} activities this week. Look at all those stars!',
        variants: [
          'What a week! You learned so many new things.',
          'You were busy this week! {activityCount} activities. Amazing!',
        ],
        rules: [
          'Child-facing recap should be celebratory.',
          'Use visual metaphors (stars, badges) not raw numbers for ages 2-3.',
          'Ages 6-8 can appreciate the number.',
        ],
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Look up the copy pattern for a given screen type. */
export function getCopyPattern(screenType: string): CopyPattern | undefined {
  return copyPatterns.find((p) => p.screenType === screenType);
}

/** Get a specific section within a copy pattern. */
export function getCopySection(screenType: string, area: string): CopySection | undefined {
  const pattern = getCopyPattern(screenType);
  return pattern?.sections.find((s) => s.area === area);
}

/**
 * Fill a copy template with variables.
 * Usage: fillTemplate('lesson-intro', 'header', { topic: 'Colors' })
 * Returns: "Let's learn about Colors!"
 */
export function fillTemplate(
  screenType: string,
  area: string,
  vars: Record<string, string | number> = {},
  useVariant?: number,
): string {
  const section = getCopySection(screenType, area);
  if (!section) return '';

  let template: string;
  if (useVariant !== undefined && section.variants[useVariant]) {
    template = section.variants[useVariant];
  } else {
    template = section.template;
  }

  for (const [key, value] of Object.entries(vars)) {
    template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return template;
}

/**
 * Pick a random variant (or the default template) for a section.
 * Useful for keeping copy fresh across repeated visits.
 */
export function pickRandomTemplate(
  screenType: string,
  area: string,
  vars: Record<string, string | number> = {},
): string {
  const section = getCopySection(screenType, area);
  if (!section) return '';

  const allOptions = [section.template, ...section.variants];
  const template = allOptions[Math.floor(Math.random() * allOptions.length)];

  let filled = template;
  for (const [key, value] of Object.entries(vars)) {
    filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return filled;
}

/** All screen types defined in the system. */
export const allScreenTypes: string[] = copyPatterns.map((p) => p.screenType);
