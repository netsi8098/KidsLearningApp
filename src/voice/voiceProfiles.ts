// ── Voice Profiles ─────────────────────────────────────────────────────────
// Defines the 5 core voice categories for Kids Learning Fun.
// Each profile maps to SpeechSynthesis hints and SSML prosody for
// consistent personality across TTS and future pre-recorded audio.

// ── Types ──────────────────────────────────────────────────────────────────

export type VoiceProfileId =
  | 'narrator'
  | 'mascot-host'
  | 'bedtime-narrator'
  | 'song-leader'
  | 'parent-guide';

export interface TTSHints {
  /** SpeechSynthesisUtterance.rate  (0.5 - 2.0) */
  rate: number;
  /** SpeechSynthesisUtterance.pitch (0 - 2.0) */
  pitch: number;
  /** SpeechSynthesisUtterance.volume (0 - 1.0) */
  volume: number;
  /** Best-match voice name on common platforms */
  preferredVoiceName?: string;
  /** Fallback language tag */
  lang: string;
}

export interface SSMLProsody {
  rate: string;   // e.g. "90%", "slow"
  pitch: string;  // e.g. "+5%", "medium"
  volume: string; // e.g. "soft", "medium"
}

export interface VoiceProfile {
  id: VoiceProfileId;
  label: string;
  description: string;
  /** Primary tonal quality */
  tone: string;
  /** How old the voice "feels" to the listener */
  ageFeel: string;
  pacing: 'slow' | 'moderate' | 'upbeat';
  pitchDirection: 'low-warm' | 'mid-bright' | 'mid-warm' | 'high-playful';
  /** Overall vocal warmth 1 (cool/neutral) to 10 (very warm) */
  warmth: number;
  /** Overall energy 1 (whisper-calm) to 10 (bursting) */
  energy: number;
  /** Emotions this voice can credibly express */
  emotionalRange: string[];
  /** Direct SpeechSynthesis API parameters */
  ttsHints: TTSHints;
  /** SSML <prosody> attributes for templating */
  ssmlProsody: SSMLProsody;
}

// ── Profile Definitions ────────────────────────────────────────────────────

export const voiceProfiles: Record<VoiceProfileId, VoiceProfile> = {

  // ─── 1. Narrator ─────────────────────────────────────────────────────────
  narrator: {
    id: 'narrator',
    label: 'Friendly Narrator',
    description:
      'The primary teaching voice. Think of a favourite early-years teacher who ' +
      'genuinely delights in every small discovery a child makes. Clear diction, ' +
      'unhurried delivery, a smile you can hear.',
    tone: 'warm, clear, encouraging',
    ageFeel: 'friendly young-adult teacher (late 20s)',
    pacing: 'moderate',
    pitchDirection: 'mid-bright',
    warmth: 8,
    energy: 6,
    emotionalRange: [
      'nurturing', 'proud', 'gently excited', 'curious',
      'reassuring', 'patient', 'delighted',
    ],
    ttsHints: {
      rate: 0.88,
      pitch: 1.15,
      volume: 0.92,
      preferredVoiceName: 'Samantha',
      lang: 'en-US',
    },
    ssmlProsody: {
      rate: '92%',
      pitch: '+8%',
      volume: 'medium',
    },
  },

  // ─── 2. Mascot Host ──────────────────────────────────────────────────────
  'mascot-host': {
    id: 'mascot-host',
    label: 'Mascot Host',
    description:
      'The voice behind Leo, Ruby, Daisy, Ollie, and Finn when they address the ' +
      'child directly. Bubbly, characterful, full of personality. Each mascot ' +
      'adds its own flavour on top of this base profile.',
    tone: 'playful, animated, expressive',
    ageFeel: 'energetic older sibling or camp counsellor',
    pacing: 'upbeat',
    pitchDirection: 'high-playful',
    warmth: 9,
    energy: 8,
    emotionalRange: [
      'excited', 'silly', 'proud', 'surprised',
      'encouraging', 'conspiratorial', 'celebratory',
    ],
    ttsHints: {
      rate: 1.0,
      pitch: 1.3,
      volume: 0.95,
      preferredVoiceName: 'Karen',
      lang: 'en-US',
    },
    ssmlProsody: {
      rate: '105%',
      pitch: '+15%',
      volume: 'medium',
    },
  },

  // ─── 3. Bedtime Narrator ─────────────────────────────────────────────────
  'bedtime-narrator': {
    id: 'bedtime-narrator',
    label: 'Bedtime Storyteller',
    description:
      'Soft, velvety, and deeply calming. Imagine a gentle parent reading by ' +
      'lamplight. Every syllable floats. Pace is deliberately slow with long, ' +
      'natural pauses between sentences. Volume dips toward the end of each ' +
      'phrase as if the speaker is falling asleep alongside the child.',
    tone: 'gentle, hushed, soothing',
    ageFeel: 'warm parent or grandparent at the bedside',
    pacing: 'slow',
    pitchDirection: 'low-warm',
    warmth: 10,
    energy: 2,
    emotionalRange: [
      'peaceful', 'loving', 'dreamy', 'reassuring',
      'tender', 'sleepy', 'safe',
    ],
    ttsHints: {
      rate: 0.72,
      pitch: 0.9,
      volume: 0.7,
      preferredVoiceName: 'Samantha',
      lang: 'en-US',
    },
    ssmlProsody: {
      rate: '75%',
      pitch: '-5%',
      volume: 'soft',
    },
  },

  // ─── 4. Song Leader ──────────────────────────────────────────────────────
  'song-leader': {
    id: 'song-leader',
    label: 'Song Leader',
    description:
      'Rhythmic, melodic, and irresistibly singable. This voice leads singalongs, ' +
      'chants letter sounds, and counts with a bouncy beat. Emphasis lands on the ' +
      'down-beat of each phrase. Slightly exaggerated pitch rises on questions to ' +
      'invite the child to join in.',
    tone: 'melodic, rhythmic, inviting',
    ageFeel: 'music teacher or children\'s show host',
    pacing: 'upbeat',
    pitchDirection: 'mid-bright',
    warmth: 7,
    energy: 9,
    emotionalRange: [
      'joyful', 'rhythmic', 'encouraging', 'celebratory',
      'playful', 'infectious', 'triumphant',
    ],
    ttsHints: {
      rate: 1.05,
      pitch: 1.25,
      volume: 1.0,
      preferredVoiceName: 'Karen',
      lang: 'en-US',
    },
    ssmlProsody: {
      rate: '108%',
      pitch: '+12%',
      volume: 'medium',
    },
  },

  // ─── 5. Parent Guide ────────────────────────────────────────────────────
  'parent-guide': {
    id: 'parent-guide',
    label: 'Parent Guide',
    description:
      'Reserved for parent-facing content: the settings screen, dashboard tips, ' +
      'and learning-progress summaries. Natural adult register, professional but ' +
      'warm, never clinical. Speaks peer-to-peer with parents, with an ' +
      'undercurrent of shared pride in the child\'s achievements.',
    tone: 'professional, warm, peer-to-peer',
    ageFeel: 'supportive parenting expert (30s-40s)',
    pacing: 'moderate',
    pitchDirection: 'mid-warm',
    warmth: 6,
    energy: 4,
    emotionalRange: [
      'informative', 'supportive', 'confident',
      'encouraging', 'empathetic', 'reassuring',
    ],
    ttsHints: {
      rate: 0.95,
      pitch: 1.0,
      volume: 0.88,
      preferredVoiceName: 'Samantha',
      lang: 'en-US',
    },
    ssmlProsody: {
      rate: '98%',
      pitch: '+0%',
      volume: 'medium',
    },
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Get a voice profile by ID. Falls back to narrator. */
export function getVoiceProfile(id: VoiceProfileId): VoiceProfile {
  return voiceProfiles[id] ?? voiceProfiles.narrator;
}

/** All profile IDs as an array, useful for iteration. */
export const allVoiceProfileIds: VoiceProfileId[] = Object.keys(
  voiceProfiles,
) as VoiceProfileId[];

/**
 * Map a mascot character ID to the best-fit voice profile override.
 * Ollie in bedtime mode gets bedtime-narrator; others get mascot-host
 * unless context overrides.
 */
export function getProfileForCharacter(
  characterId: string,
  isBedtime = false,
): VoiceProfileId {
  if (isBedtime) return 'bedtime-narrator';
  if (characterId === 'ollie') return 'narrator'; // Ollie is calmer
  if (characterId === 'daisy') return 'song-leader'; // Daisy is musical
  return 'mascot-host';
}
