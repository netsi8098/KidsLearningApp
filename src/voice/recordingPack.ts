// ── Voice Recording Production Pack ────────────────────────────────────────
// Production metadata, file naming, quality specs, and workflow tools
// for managing voice recordings for Kids Learning Fun.

// ── Types ──────────────────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'needs-retake' | 'cut';

export interface RecordingLine {
  /** References a voiceLine.id */
  lineId: string;
  /** Plain-text of the line */
  text: string;
  /** Acting direction for the voice actor */
  direction: string;
  /** Emotional label for this take */
  emotionLabel: string;
  /** Total number of takes recorded */
  takesRecorded: number;
  /** Which take number was selected (1-indexed) */
  selectedTake: number;
  /** Generated filename: {character}_{category}_{lineNumber}_take{N}.wav */
  fileName: string;
  /** Duration of the selected take in seconds */
  duration: number;
  /** Whether this take has been approved */
  approved: boolean;
  /** Approval status with more granularity */
  status: ApprovalStatus;
  /** Optional notes from the director/reviewer */
  notes?: string;
}

export interface RecordingSession {
  sessionId: string;
  /** ISO date string of the session */
  date: string;
  /** Character being recorded */
  character: string;
  /** Voice actor name */
  voiceActor: string;
  /** Session-level notes */
  sessionNotes?: string;
  /** All lines recorded in this session */
  lines: RecordingLine[];
}

// ── File Naming Convention ─────────────────────────────────────────────────

/**
 * Generate a standardised filename for a voice recording.
 *
 * Pattern: `{character}_{category}_{lineNumber}_take{N}.{ext}`
 *
 * Examples:
 * - `leo_greeting_001_take1.wav`
 * - `narrator_bedtime_003_take2.wav`
 * - `daisy_song-intro_001_take3.mp3`
 *
 * @param character   Lowercase character ID (or "narrator")
 * @param category    Line category from the voice line system
 * @param lineNumber  Sequential number (zero-padded to 3 digits)
 * @param take        Take number (1-indexed)
 * @param ext         File extension (default: "wav")
 */
export function generateFileName(
  character: string,
  category: string,
  lineNumber: number,
  take: number,
  ext: 'wav' | 'mp3' | 'ogg' = 'wav',
): string {
  const charSlug = character.toLowerCase().replace(/\s+/g, '-');
  const catSlug = category.toLowerCase().replace(/\s+/g, '-');
  const numStr = String(lineNumber).padStart(3, '0');
  return `${charSlug}_${catSlug}_${numStr}_take${take}.${ext}`;
}

// ── Directory Structure Spec ───────────────────────────────────────────────

/**
 * Recommended directory structure for the recording project.
 *
 * ```
 * recordings/
 * +-- raw/                        # Original WAV source files
 * |   +-- narrator/
 * |   |   +-- greeting/
 * |   |   +-- encouragement/
 * |   |   +-- celebration/
 * |   |   +-- hint/
 * |   |   +-- retry/
 * |   |   +-- bedtime/
 * |   |   +-- curiosity/
 * |   |   +-- transition/
 * |   |   +-- lesson-intro/
 * |   |   +-- mistake-recovery/
 * |   |   +-- song-intro/
 * |   |   +-- story-intro/
 * |   |   +-- goodbye/
 * |   +-- leo/
 * |   +-- daisy/
 * |   +-- ollie/
 * |   +-- ruby/
 * |   +-- finn/
 * +-- processed/                  # Normalised, trimmed WAVs
 * |   +-- (same structure as raw/)
 * +-- delivery/                   # Final MP3s for app integration
 * |   +-- (same structure as raw/)
 * +-- metadata/                   # Session logs, approval sheets
 * |   +-- sessions/               # JSON session files
 * |   +-- pronunciation/          # Pronunciation guide PDFs
 * |   +-- exports/                # CSV/JSON batch exports
 * +-- retakes/                    # Lines flagged for re-recording
 * ```
 */
export const directoryStructure = {
  root: 'recordings',
  raw: 'recordings/raw',
  processed: 'recordings/processed',
  delivery: 'recordings/delivery',
  metadata: 'recordings/metadata',
  sessions: 'recordings/metadata/sessions',
  pronunciation: 'recordings/metadata/pronunciation',
  exports: 'recordings/metadata/exports',
  retakes: 'recordings/retakes',
  characters: ['narrator', 'leo', 'daisy', 'ollie', 'ruby', 'finn'],
  categories: [
    'greeting', 'encouragement', 'celebration', 'hint', 'retry',
    'bedtime', 'curiosity', 'transition', 'lesson-intro',
    'mistake-recovery', 'song-intro', 'story-intro', 'goodbye',
  ],
} as const;

// ── Audio Quality Requirements ─────────────────────────────────────────────

export const audioQualitySpec = {
  /** Source recording format */
  source: {
    format: 'WAV',
    sampleRate: 44100,
    bitDepth: 24,
    channels: 1, // Mono
    notes: 'Record in 24-bit for headroom. Final delivery will be 16-bit.',
  },
  /** Processed (normalised) format */
  processed: {
    format: 'WAV',
    sampleRate: 44100,
    bitDepth: 16,
    channels: 1,
    loudnessTarget: -16, // LUFS
    truePeak: -1.0,      // dBTP
    notes: 'Normalise to -16 LUFS with -1 dBTP true peak. Trim silence to 50ms head/tail.',
  },
  /** App delivery format */
  delivery: {
    format: 'MP3',
    sampleRate: 44100,
    bitRate: 128, // kbps - good quality for speech, small file size
    channels: 1,
    notes: 'Encode with LAME at 128 kbps CBR. Add 20ms fade in/out.',
  },
  /** Recording environment requirements */
  environment: {
    noiseFloor: -60,       // dB (maximum acceptable)
    roomTone: 'required',  // Record 10s of silence at start of each session
    popFilter: 'required',
    micDistance: '6-8 inches',
    notes: 'Record in a treated space or professional booth. No air conditioning during takes.',
  },
} as const;

// ── Retake Workflow ────────────────────────────────────────────────────────

export interface RetakeRequest {
  lineId: string;
  originalFileName: string;
  reason: string;
  directionNotes: string;
  priority: 'urgent' | 'normal' | 'low';
  requestedBy: string;
  requestDate: string;
  fulfilled: boolean;
  newFileName?: string;
}

/**
 * Create a retake request for a line that needs re-recording.
 */
export function createRetakeRequest(
  lineId: string,
  originalFileName: string,
  reason: string,
  directionNotes: string,
  requestedBy: string,
  priority: 'urgent' | 'normal' | 'low' = 'normal',
): RetakeRequest {
  return {
    lineId,
    originalFileName,
    reason,
    directionNotes,
    priority,
    requestedBy,
    requestDate: new Date().toISOString().split('T')[0],
    fulfilled: false,
  };
}

// ── Pronunciation Sheet Template ───────────────────────────────────────────

export interface PronunciationSheetEntry {
  word: string;
  phonetic: string;
  notes: string;
  category: string;
}

/**
 * Generate a pronunciation sheet for a recording session.
 * Extracts unique words from lines that may need pronunciation guidance.
 */
export function generatePronunciationSheet(
  lines: Array<{ text: string; lineId: string }>,
): PronunciationSheetEntry[] {
  // Words that commonly need pronunciation guidance in children's content
  const guidanceWords: Record<string, { phonetic: string; notes: string }> = {
    'roar': { phonetic: 'ROHR', notes: 'Playful, not scary. Lion-like but friendly.' },
    'hoot': { phonetic: 'HOOT', notes: 'Owl sound. Soft, gentle, not loud.' },
    'quack': { phonetic: 'KWAK', notes: 'Duck sound. Bright, crisp onset.' },
    'buh': { phonetic: 'BUH', notes: 'Phonics B sound. Short schwa vowel after the b.' },
    'sss': { phonetic: 'SSSS', notes: 'Sustained sibilant. Like a snake hissing gently.' },
    'zzz': { phonetic: 'ZZZZ', notes: 'Voiced sibilant. Buzzing like a bee.' },
    'mmm': { phonetic: 'MMMM', notes: 'Sustained nasal. Humming sound.' },
    'nnn': { phonetic: 'NNNN', notes: 'Sustained nasal. Tongue behind teeth.' },
    'fff': { phonetic: 'FFFF', notes: 'Sustained fricative. Gentle, not harsh.' },
    'lll': { phonetic: 'LLLL', notes: 'Sustained lateral. Tongue tip to roof of mouth.' },
  };

  const entries: PronunciationSheetEntry[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const words = line.text.toLowerCase().split(/\s+/);
    for (const word of words) {
      const clean = word.replace(/[^a-z]/g, '');
      if (clean && guidanceWords[clean] && !seen.has(clean)) {
        seen.add(clean);
        entries.push({
          word: clean,
          phonetic: guidanceWords[clean].phonetic,
          notes: guidanceWords[clean].notes,
          category: 'pronunciation-guide',
        });
      }
    }
  }

  return entries;
}

// ── CSV / JSON Export ──────────────────────────────────────────────────────

export interface LineTrackingRecord {
  lineId: string;
  character: string;
  category: string;
  text: string;
  direction: string;
  emotionLabel: string;
  status: ApprovalStatus;
  fileName: string;
  duration: number;
  sessionId: string;
  sessionDate: string;
  voiceActor: string;
  notes: string;
}

/**
 * Convert recording sessions to a flat tracking array for CSV/JSON export.
 */
export function exportLineTracking(sessions: RecordingSession[]): LineTrackingRecord[] {
  const records: LineTrackingRecord[] = [];

  for (const session of sessions) {
    for (const line of session.lines) {
      records.push({
        lineId: line.lineId,
        character: session.character,
        category: extractCategory(line.lineId),
        text: line.text,
        direction: line.direction,
        emotionLabel: line.emotionLabel,
        status: line.status,
        fileName: line.fileName,
        duration: line.duration,
        sessionId: session.sessionId,
        sessionDate: session.date,
        voiceActor: session.voiceActor,
        notes: line.notes ?? '',
      });
    }
  }

  return records;
}

/**
 * Convert tracking records to CSV string.
 */
export function toCSV(records: LineTrackingRecord[]): string {
  const headers = [
    'lineId', 'character', 'category', 'text', 'direction',
    'emotionLabel', 'status', 'fileName', 'duration',
    'sessionId', 'sessionDate', 'voiceActor', 'notes',
  ];

  const escapeCSV = (val: string | number): string => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = records.map((r) =>
    headers.map((h) => escapeCSV(r[h as keyof LineTrackingRecord])).join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Convert tracking records to formatted JSON string.
 */
export function toJSON(records: LineTrackingRecord[]): string {
  return JSON.stringify(records, null, 2);
}

// ── App-Side Import Interface ──────────────────────────────────────────────

/**
 * Interface for importing pre-recorded audio into the app.
 * When pre-recorded audio is available, it takes priority over TTS.
 */
export interface AudioAssetManifest {
  version: string;
  generatedAt: string;
  totalFiles: number;
  totalDurationSeconds: number;
  assets: AudioAssetEntry[];
}

export interface AudioAssetEntry {
  /** References a voiceLine.id */
  lineId: string;
  /** Relative path from the assets directory */
  path: string;
  /** File format */
  format: 'mp3' | 'ogg' | 'wav';
  /** Duration in seconds */
  duration: number;
  /** File size in bytes */
  sizeBytes: number;
  /** SHA-256 hash for integrity verification */
  hash: string;
}

/**
 * Generate a manifest template for a set of recording sessions.
 * In production, hashes and sizes would be calculated from actual files.
 */
export function generateManifestTemplate(
  sessions: RecordingSession[],
): AudioAssetManifest {
  const assets: AudioAssetEntry[] = [];
  let totalDuration = 0;

  for (const session of sessions) {
    for (const line of session.lines) {
      if (line.status !== 'approved') continue;
      const mp3Name = line.fileName.replace(/\.wav$/, '.mp3');
      const category = extractCategory(line.lineId);
      assets.push({
        lineId: line.lineId,
        path: `audio/voice/${session.character}/${category}/${mp3Name}`,
        format: 'mp3',
        duration: line.duration,
        sizeBytes: 0,    // To be filled during build
        hash: '',         // To be filled during build
      });
      totalDuration += line.duration;
    }
  }

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalFiles: assets.length,
    totalDurationSeconds: Math.round(totalDuration * 100) / 100,
    assets,
  };
}

// ── Example Session ────────────────────────────────────────────────────────

/**
 * Example recording session for reference and testing.
 */
export const exampleSession: RecordingSession = {
  sessionId: 'session-2026-03-26-leo-01',
  date: '2026-03-26',
  character: 'leo',
  voiceActor: 'TBD',
  sessionNotes: 'First recording session for Leo Lion. Focus on greetings and encouragements.',
  lines: [
    {
      lineId: 'greet-004',
      text: 'Hey there, friend! Leo here. Shall we learn something amazing together?',
      direction: 'Warm, excited, like greeting a best friend after a week apart. Big smile energy.',
      emotionLabel: 'warm-excited',
      takesRecorded: 3,
      selectedTake: 2,
      fileName: 'leo_greeting_004_take2.wav',
      duration: 3.2,
      approved: true,
      status: 'approved',
      notes: 'Take 2 had the best energy. Take 1 was slightly flat. Take 3 was too fast.',
    },
    {
      lineId: 'enc-007',
      text: 'ROAR! You are getting stronger and smarter every single day!',
      direction: 'Big celebration energy. ROAR is playful, not scary. Build excitement through the sentence.',
      emotionLabel: 'excited-proud',
      takesRecorded: 4,
      selectedTake: 3,
      fileName: 'leo_encouragement_007_take3.wav',
      duration: 2.8,
      approved: true,
      status: 'approved',
      notes: 'Take 3 nailed the ROAR. Perfect playful energy.',
    },
    {
      lineId: 'les-005',
      text: 'ROAR! Leo is so excited to teach you this one! Listen up, friend!',
      direction: 'Teaching excitement. Less celebration, more anticipation. Leo is about to share knowledge.',
      emotionLabel: 'excited-teaching',
      takesRecorded: 2,
      selectedTake: 1,
      fileName: 'leo_lesson-intro_005_take1.wav',
      duration: 2.9,
      approved: false,
      status: 'needs-retake',
      notes: 'Both takes lacked the teaching quality. Need a retake with more warmth in "Listen up, friend!"',
    },
  ],
};

// ── Utility ────────────────────────────────────────────────────────────────

/**
 * Extract the category from a line ID.
 * e.g. "greet-004" -> "greeting", "enc-007" -> "encouragement"
 */
function extractCategory(lineId: string): string {
  const prefix = lineId.split('-')[0];
  const map: Record<string, string> = {
    greet: 'greeting',
    enc: 'encouragement',
    cel: 'celebration',
    hint: 'hint',
    retry: 'retry',
    bed: 'bedtime',
    cur: 'curiosity',
    trans: 'transition',
    les: 'lesson-intro',
    mis: 'mistake-recovery',
    song: 'song-intro',
    story: 'story-intro',
    bye: 'goodbye',
  };
  return map[prefix] ?? 'unknown';
}

/**
 * Get recording session statistics.
 */
export function getSessionStats(session: RecordingSession): {
  totalLines: number;
  approved: number;
  needsRetake: number;
  pending: number;
  totalTakes: number;
  totalDuration: number;
  avgTakesPerLine: number;
} {
  const lines = session.lines;
  return {
    totalLines: lines.length,
    approved: lines.filter((l) => l.status === 'approved').length,
    needsRetake: lines.filter((l) => l.status === 'needs-retake').length,
    pending: lines.filter((l) => l.status === 'pending').length,
    totalTakes: lines.reduce((sum, l) => sum + l.takesRecorded, 0),
    totalDuration: Math.round(lines.reduce((sum, l) => sum + l.duration, 0) * 100) / 100,
    avgTakesPerLine: lines.length > 0
      ? Math.round((lines.reduce((sum, l) => sum + l.takesRecorded, 0) / lines.length) * 10) / 10
      : 0,
  };
}
