// ── Script Templates ───────────────────────────────────────────────────────
// Pre-formatted script blocks for voice actors and TTS rendering.
// Each block represents a complete scene with acting directions,
// emotional beats, SSML markup, and timing notes.

import type { VoiceProfileId } from './voiceProfiles';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ScriptLine {
  /** References a voiceLine.id or is a scene-specific ID */
  lineId: string;
  /** Character name or "Narrator" */
  character: string;
  voiceProfile: VoiceProfileId;
  /** Acting direction for voice talent */
  direction: string;
  /** Plain-text version */
  text: string;
  /** SSML-enriched version (valid SSML fragment) */
  ssml: string;
  /** The emotional beat this line serves in the scene */
  emotionalBeat: string;
  /** Words that need special pronunciation */
  pronunciationNotes?: Record<string, string>;
  /** Timing cues */
  timing?: {
    /** Silence before this line begins (ms) */
    leadInMs: number;
    /** Pace description for the actor */
    paceNote: string;
  };
}

export interface ScriptBlock {
  sceneId: string;
  sceneName: string;
  /** Context description for the director/engineer */
  context: string;
  lines: ScriptLine[];
}

// ── Script Blocks ──────────────────────────────────────────────────────────

// ─── 1. Lesson Introduction ────────────────────────────────────────────────

export const lessonIntroScript: ScriptBlock = {
  sceneId: 'scene-lesson-intro',
  sceneName: 'Lesson Introduction - Letters',
  context:
    'The child opens a new letter-learning lesson. The narrator warmly welcomes ' +
    'them, Leo introduces the letter with excitement, and the narrator guides ' +
    'the child through the first interaction. Tone moves from welcoming to ' +
    'excited to instructional.',
  lines: [
    {
      lineId: 'les-intro-001',
      character: 'Narrator',
      voiceProfile: 'narrator',
      direction:
        'Warm, inviting smile in the voice. As if opening a picture book ' +
        'and seeing the child\'s face light up. Moderate pace.',
      text: 'Today we are going to meet a brand new letter! I wonder which one it will be.',
      ssml: '<speak><prosody rate="90%" pitch="+8%" volume="medium">Today we are going to meet a brand new letter! <break time="500ms"/> I wonder which one it will be.</prosody></speak>',
      emotionalBeat: 'anticipation / warm welcome',
      timing: { leadInMs: 0, paceNote: 'Gentle, unhurried opening' },
    },
    {
      lineId: 'les-intro-002',
      character: 'Leo Lion',
      voiceProfile: 'mascot-host',
      direction:
        'Big, excited energy, like a child who cannot wait to share a secret. ' +
        'ROAR should be playful, not scary. Build to the reveal.',
      text: 'ROAR! It is the letter B! B for big, B for brave, B for BRILLIANT!',
      ssml: '<speak><prosody rate="105%" pitch="+15%" volume="medium"><emphasis level="strong">ROAR!</emphasis> <break time="200ms"/> It is the letter B! <break time="200ms"/> B for big, <break time="150ms"/> B for brave, <break time="150ms"/> B for <emphasis level="strong">BRILLIANT!</emphasis></prosody></speak>',
      emotionalBeat: 'excited reveal',
      pronunciationNotes: {
        'B': 'Emphasise the /b/ sound. Hold the lip pop slightly longer than natural.',
      },
      timing: { leadInMs: 400, paceNote: 'Energetic but clear articulation on each B-word' },
    },
    {
      lineId: 'les-intro-003',
      character: 'Narrator',
      voiceProfile: 'narrator',
      direction:
        'Settle back to teaching mode. Friendly, clear, with rising intonation ' +
        'on the question to invite a response. Slight pause after "Can you say" ' +
        'to give the child a moment to try.',
      text: 'That is right! The letter B. Can you say B? Buh! B!',
      ssml: '<speak><prosody rate="88%" pitch="+8%" volume="medium">That is right! The letter B. <break time="500ms"/> Can you say B? <break time="800ms"/> <phoneme alphabet="ipa" ph="b\u028C">Buh</phoneme>! <break time="300ms"/> B!</prosody></speak>',
      emotionalBeat: 'guided participation',
      pronunciationNotes: {
        'Buh': '/b\u028C/ - voiced bilabial stop with short schwa. Demonstrate clearly.',
      },
      timing: { leadInMs: 300, paceNote: 'Slow down for the phonics demonstration' },
    },
    {
      lineId: 'les-intro-004',
      character: 'Narrator',
      voiceProfile: 'narrator',
      direction:
        'Praise regardless of whether the child actually spoke. Assume the best. ' +
        'Genuine delight in the voice.',
      text: 'Wonderful! You said it! Now let us see what other things start with B.',
      ssml: '<speak><prosody rate="92%" pitch="+10%" volume="medium"><emphasis level="moderate">Wonderful!</emphasis> <break time="300ms"/> You said it! <break time="400ms"/> Now let us see what other things start with B.</prosody></speak>',
      emotionalBeat: 'affirmation / transition forward',
      timing: { leadInMs: 1200, paceNote: 'Wait for child response before praise' },
    },
  ],
};

// ─── 2. Praise & Celebration ───────────────────────────────────────────────

export const celebrationScript: ScriptBlock = {
  sceneId: 'scene-celebration',
  sceneName: 'Big Achievement Celebration',
  context:
    'The child completes an entire lesson or earns a major badge. This is the ' +
    'emotional peak of a session. Build from genuine surprise through pride ' +
    'to a satisfying close. This plays alongside confetti animation.',
  lines: [
    {
      lineId: 'cel-script-001',
      character: 'Narrator',
      voiceProfile: 'narrator',
      direction:
        'Genuine surprise and delight, as if you just saw them accomplish ' +
        'something you did not think was possible yet. Eyes wide, voice lifted.',
      text: 'Oh my goodness! Look at what you just did!',
      ssml: '<speak><prosody rate="95%" pitch="+12%" volume="medium">Oh my goodness! <break time="300ms"/> Look at what you just did!</prosody></speak>',
      emotionalBeat: 'surprise / delight',
      timing: { leadInMs: 200, paceNote: 'Quick onset, genuine surprise' },
    },
    {
      lineId: 'cel-script-002',
      character: 'Leo Lion',
      voiceProfile: 'mascot-host',
      direction:
        'Pure celebration energy. Leo is jumping up and down. Each "you did it" ' +
        'gets bigger. The roar is joyful, never aggressive.',
      text: 'You did it! You did it! YOU DID IT! ROOOOAR!',
      ssml: '<speak><prosody rate="108%" pitch="+18%" volume="loud">You did it! <break time="150ms"/> You did it! <break time="150ms"/> <emphasis level="strong">YOU DID IT!</emphasis> <break time="200ms"/> <emphasis level="strong">ROOOOAR!</emphasis></prosody></speak>',
      emotionalBeat: 'peak celebration',
      timing: { leadInMs: 300, paceNote: 'Escalating energy, each phrase bigger than the last' },
    },
    {
      lineId: 'cel-script-003',
      character: 'Narrator',
      voiceProfile: 'narrator',
      direction:
        'Bring the energy down to a warm glow. The pride is real and specific. ' +
        'This is the "I am so proud" moment. Let it land.',
      text: 'You completed the whole lesson, start to finish. I am so, so proud of you.',
      ssml: '<speak><prosody rate="88%" pitch="+5%" volume="medium">You completed the whole lesson, <break time="300ms"/> start to finish. <break time="500ms"/> I am <emphasis level="moderate">so, so proud</emphasis> of you.</prosody></speak>',
      emotionalBeat: 'warm pride / landing',
      timing: { leadInMs: 500, paceNote: 'Settle, slower delivery for emotional weight' },
    },
    {
      lineId: 'cel-script-004',
      character: 'Narrator',
      voiceProfile: 'narrator',
      direction:
        'Shift to forward-looking excitement. Plant the seed for next time. ' +
        'Upbeat but not manic.',
      text: 'You earned a shiny new star! I cannot wait to see what you learn next.',
      ssml: '<speak><prosody rate="92%" pitch="+8%" volume="medium">You earned a shiny new star! <break time="400ms"/> I cannot wait to see what you learn next.</prosody></speak>',
      emotionalBeat: 'reward + anticipation',
      timing: { leadInMs: 300, paceNote: 'Bright, looking-forward energy' },
    },
  ],
};

// ─── 3. Bedtime Narration ──────────────────────────────────────────────────

export const bedtimeScript: ScriptBlock = {
  sceneId: 'scene-bedtime',
  sceneName: 'Bedtime Wind-Down',
  context:
    'The child has entered bedtime mode. The screen dims to deep blues and ' +
    'purples. Everything slows down. Ollie guides the child toward sleep with ' +
    'a brief calming sequence. Volume should feel like a whisper by the end.',
  lines: [
    {
      lineId: 'bed-script-001',
      character: 'Ollie Owl',
      voiceProfile: 'bedtime-narrator',
      direction:
        'Soft, velvety, like a warm blanket made of sound. Imagine the room is ' +
        'dimly lit by starlight. Every word floats.',
      text: 'Hoot hoot. Hello, little one. The stars are coming out just for you tonight.',
      ssml: '<speak><prosody rate="72%" pitch="-5%" volume="soft">Hoot hoot. <break time="600ms"/> Hello, little one. <break time="500ms"/> The stars are coming out <break time="300ms"/> just for you tonight.</prosody></speak>',
      emotionalBeat: 'soft welcome',
      timing: { leadInMs: 1000, paceNote: 'Very slow, each phrase a gentle wave' },
    },
    {
      lineId: 'bed-script-002',
      character: 'Ollie Owl',
      voiceProfile: 'bedtime-narrator',
      direction:
        'Guided breathing. Match your own breathing to the pace. The breath in ' +
        'is audible and slow. The breath out even slower.',
      text: 'Let us take three big, sleepy breaths together. Breathe in... and out. In... and out. In... and out.',
      ssml: '<speak><prosody rate="65%" pitch="-8%" volume="soft">Let us take three big, sleepy breaths together. <break time="800ms"/> Breathe in... <break time="1500ms"/> and out. <break time="1000ms"/> In... <break time="1500ms"/> and out. <break time="1000ms"/> In... <break time="1500ms"/> and out.</prosody></speak>',
      emotionalBeat: 'guided relaxation',
      timing: { leadInMs: 800, paceNote: 'Match real breathing rhythm. Do not rush.' },
    },
    {
      lineId: 'bed-script-003',
      character: 'Ollie Owl',
      voiceProfile: 'bedtime-narrator',
      direction:
        'Reflective, warm, proud. Remind the child of their day without ' +
        'stimulating them. Keep everything soft and glowing.',
      text: 'You learned so many wonderful things today. Your brain is full of new ideas, and now it needs to rest.',
      ssml: '<speak><prosody rate="70%" pitch="-5%" volume="soft">You learned so many wonderful things today. <break time="700ms"/> Your brain is full of new ideas, <break time="500ms"/> and now it needs to rest.</prosody></speak>',
      emotionalBeat: 'gentle pride / transition to sleep',
      timing: { leadInMs: 600, paceNote: 'Dreamy, descending energy' },
    },
    {
      lineId: 'bed-script-004',
      character: 'Ollie Owl',
      voiceProfile: 'bedtime-narrator',
      direction:
        'The final line. Almost a whisper. The last word should nearly dissolve ' +
        'into silence. Imagine the child\'s eyes are closing.',
      text: 'Goodnight, sweet friend. Ollie will watch over you while you sleep. Sweet dreams.',
      ssml: '<speak><prosody rate="65%" pitch="-8%" volume="x-soft">Goodnight, sweet friend. <break time="800ms"/> Ollie will watch over you while you sleep. <break time="1000ms"/> Sweet dreams.</prosody></speak>',
      emotionalBeat: 'peaceful close',
      timing: { leadInMs: 800, paceNote: 'Whisper-level. Final words dissolve into silence.' },
    },
  ],
};

// ─── 4. Mistake Recovery ───────────────────────────────────────────────────

export const mistakeRecoveryScript: ScriptBlock = {
  sceneId: 'scene-mistake-recovery',
  sceneName: 'Gentle Mistake Recovery',
  context:
    'The child has just given a wrong answer. The critical requirement is zero ' +
    'shame. The voice must communicate that mistakes are not only okay but ' +
    'valuable. The emotional arc moves from gentle acknowledgement through ' +
    'support to re-engagement.',
  lines: [
    {
      lineId: 'mis-script-001',
      character: 'Narrator',
      voiceProfile: 'narrator',
      direction:
        'Zero judgement. Slightly lower energy than before the mistake, but not ' +
        'sad. Think of a friend who says "Hmm, not that one" with a kind smile.',
      text: 'Hmm, not quite. But that was a really good try!',
      ssml: '<speak><prosody rate="88%" pitch="+3%" volume="medium">Hmm, not quite. <break time="400ms"/> But that was a really good try!</prosody></speak>',
      emotionalBeat: 'gentle acknowledgement',
      timing: { leadInMs: 300, paceNote: 'Calm, unrushed, no alarm in the voice' },
    },
    {
      lineId: 'mis-script-002',
      character: 'Narrator',
      voiceProfile: 'narrator',
      direction:
        'Normalise the mistake. Energy lifts slightly. This is the "it happens ' +
        'to everyone" reassurance. Warmth is paramount.',
      text: 'Even the smartest learners get tricky ones wrong sometimes. That is how we grow!',
      ssml: '<speak><prosody rate="90%" pitch="+5%" volume="medium">Even the smartest learners get tricky ones wrong sometimes. <break time="400ms"/> That is how we grow!</prosody></speak>',
      emotionalBeat: 'normalisation / reassurance',
      timing: { leadInMs: 200, paceNote: 'Slightly warmer, building back up' },
    },
    {
      lineId: 'mis-script-003',
      character: 'Leo Lion',
      voiceProfile: 'mascot-host',
      direction:
        'Leo steps in as the encouraging friend. Conspiratorial, like sharing ' +
        'a secret. "I will help you" energy, not "you need help" energy.',
      text: 'Hey, I know this one! Want me to give you a little clue? Look at the colour!',
      ssml: '<speak><prosody rate="100%" pitch="+12%" volume="medium">Hey, I know this one! <break time="300ms"/> Want me to give you a little clue? <break time="400ms"/> Look at the colour!</prosody></speak>',
      emotionalBeat: 'helpful hint / re-engagement',
      timing: { leadInMs: 300, paceNote: 'Playful, leaning-in energy' },
    },
    {
      lineId: 'mis-script-004',
      character: 'Narrator',
      voiceProfile: 'narrator',
      direction:
        'Re-energise for the retry. This line bridges back to full engagement. ' +
        'The child should feel excited to try again, not anxious.',
      text: 'You have got this! Take another look and give it one more try.',
      ssml: '<speak><prosody rate="92%" pitch="+8%" volume="medium">You have got this! <break time="400ms"/> Take another look and give it one more try.</prosody></speak>',
      emotionalBeat: 'confident re-engagement',
      timing: { leadInMs: 400, paceNote: 'Upbeat, forward-leaning, but patient' },
    },
  ],
};

// ─── 5. Song Introduction ──────────────────────────────────────────────────

export const songIntroScript: ScriptBlock = {
  sceneId: 'scene-song-intro',
  sceneName: 'Singalong Introduction - ABC Song',
  context:
    'A singalong activity is starting. Daisy Duck leads. The energy is high ' +
    'and rhythmic from the start. The voice needs to invite physical ' +
    'participation (clapping, movement) before the music begins.',
  lines: [
    {
      lineId: 'song-script-001',
      character: 'Daisy Duck',
      voiceProfile: 'song-leader',
      direction:
        'Burst of excitement! Daisy has been waiting for this. The "quack quack" ' +
        'is musical and rhythmic, almost the start of the beat.',
      text: 'Quack quack! It is music time! Daisy is SO excited!',
      ssml: '<speak><prosody rate="110%" pitch="+15%" volume="medium"><emphasis level="strong">Quack quack!</emphasis> <break time="200ms"/> It is music time! <break time="200ms"/> Daisy is <emphasis level="strong">SO</emphasis> excited!</prosody></speak>',
      emotionalBeat: 'burst of excitement',
      timing: { leadInMs: 0, paceNote: 'High energy from the very first syllable' },
    },
    {
      lineId: 'song-script-002',
      character: 'Daisy Duck',
      voiceProfile: 'song-leader',
      direction:
        'Rhythmic instruction. Clap on each "clap" word. The pacing should ' +
        'establish the tempo of the upcoming song.',
      text: 'Can you clap your hands with me? Clap! Clap! Clap! Great!',
      ssml: '<speak><prosody rate="105%" pitch="+12%" volume="medium">Can you clap your hands with me? <break time="400ms"/> Clap! <break time="400ms"/> Clap! <break time="400ms"/> Clap! <break time="300ms"/> <emphasis level="moderate">Great!</emphasis></prosody></speak>',
      emotionalBeat: 'physical engagement',
      pronunciationNotes: {
        'Clap': 'Sharp, percussive onset. Each "Clap" is rhythmically even.',
      },
      timing: { leadInMs: 300, paceNote: 'Rhythmic, establishes the song tempo' },
    },
    {
      lineId: 'song-script-003',
      character: 'Daisy Duck',
      voiceProfile: 'song-leader',
      direction:
        'Build anticipation. The countdown should feel like the moment before ' +
        'a firework goes off. Pure joy.',
      text: 'Now let us sing the ABC song together! Ready? One, two, three!',
      ssml: '<speak><prosody rate="108%" pitch="+15%" volume="loud">Now let us sing the ABC song together! <break time="400ms"/> Ready? <break time="300ms"/> One, <break time="250ms"/> two, <break time="250ms"/> <emphasis level="strong">three!</emphasis></prosody></speak>',
      emotionalBeat: 'countdown / launch',
      timing: { leadInMs: 200, paceNote: 'Countdown builds momentum toward the song' },
    },
  ],
};

// ── Export all script blocks ───────────────────────────────────────────────

export const allScriptBlocks: ScriptBlock[] = [
  lessonIntroScript,
  celebrationScript,
  bedtimeScript,
  mistakeRecoveryScript,
  songIntroScript,
];

/**
 * Look up a script block by scene ID.
 */
export function getScriptBlock(sceneId: string): ScriptBlock | undefined {
  return allScriptBlocks.find((block) => block.sceneId === sceneId);
}

/**
 * Flatten all script lines across all blocks into a single array.
 * Useful for building pronunciation guides or batch TTS rendering.
 */
export function getAllScriptLines(): ScriptLine[] {
  return allScriptBlocks.flatMap((block) => block.lines);
}
