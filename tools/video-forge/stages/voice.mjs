/**
 * Stage: narration.
 *
 * Turns every spoken line in the episode into an mp3 via edge-tts (free,
 * natural, no API key) and records its real measured duration. Timing comes
 * from the audio, never from a guess — the storyboard is built around these
 * numbers so picture and voice cannot drift.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { hostVoices, DEFAULT_VOICE, agePresets, video } from '../config.mjs';
import { log, run, ensureDir, audioDurationMs, exists } from '../lib/util.mjs';

/**
 * Flatten an episode into the ordered list of utterances to synthesize.
 * Each utterance knows which segment it belongs to and how long the picture
 * should hold after it (e.g. thinking time after a question).
 */
export function planUtterances(episode) {
  const lines = [];
  const add = (segIndex, seg, role, text, holdMs = 0) => {
    if (typeof text !== 'string' || !text.trim()) return;
    lines.push({
      key: `${String(lines.length).padStart(3, '0')}-${seg.type}-${role}`,
      segIndex,
      segType: seg.type,
      role,
      text: text.trim(),
      holdMs,
    });
  };

  episode.segments.forEach((seg, i) => {
    switch (seg.type) {
      case 'intro':
        add(i, seg, 'host', seg.hostLine, 400);
        break;
      case 'topic-reveal':
        add(i, seg, 'host', seg.hostLine, 600);
        break;
      case 'teach':
        add(i, seg, 'host', seg.hostLine, 800);
        break;
      case 'interaction':
        add(i, seg, 'prompt', seg.prompt, video.answerWaitMs);
        if (seg.hostHint) add(i, seg, 'hint', seg.hostHint, 600);
        break;
      case 'call-response':
        // The child needs a real gap to say the word back.
        add(i, seg, 'host', seg.hostLine, video.answerWaitMs);
        break;
      case 'recap':
        add(i, seg, 'host', seg.hostLine, 500);
        break;
      case 'goodbye':
        add(i, seg, 'host', seg.hostLine, 300);
        if (seg.nextSuggestion) add(i, seg, 'next', seg.nextSuggestion, 800);
        break;
      default:
        break;
    }
  });

  return lines;
}

/** Parse edge-tts subtitle output (SRT with comma decimals) into ms cues. */
function parseCues(srt) {
  const cues = [];
  const stamp = (s) => {
    const m = s.match(/(\d+):(\d+):(\d+)[,.](\d+)/);
    if (!m) return 0;
    return (+m[1]) * 3_600_000 + (+m[2]) * 60_000 + (+m[3]) * 1000 + (+m[4]);
  };
  for (const block of srt.trim().split(/\n\s*\n/)) {
    const rows = block.split('\n').filter(Boolean);
    const timeRow = rows.find((r) => r.includes('-->'));
    if (!timeRow) continue;
    const [from, to] = timeRow.split('-->');
    const text = rows.slice(rows.indexOf(timeRow) + 1).join(' ').trim();
    if (text) cues.push({ startMs: stamp(from), endMs: stamp(to), text });
  }
  return cues;
}

/**
 * edge-tts talks to a Microsoft endpoint that intermittently returns no audio
 * under rapid sequential requests (`NoAudioReceived`). It is transient — the
 * same voice and text succeed moments later — so a batch run must retry rather
 * than lose the whole episode. Observed in a 6-episode batch: 2 episodes died
 * mid-narration on an otherwise valid line.
 */
const TTS_ATTEMPTS = 4;
const TTS_BACKOFF_MS = [600, 1800, 4500];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A cached mp3 is only reusable if it has bytes and ffprobe can read it. */
async function isUsableAudio(file) {
  try {
    const { size } = await fs.stat(file);
    if (size === 0) return false;
    return (await audioDurationMs(file)) > 0;
  } catch {
    return false;
  }
}

async function synthesizeLine({ voice, rate, text, mp3, srt }) {
  let lastError;
  for (let attempt = 1; attempt <= TTS_ATTEMPTS; attempt += 1) {
    try {
      await run('python3', [
        '-m', 'edge_tts',
        '--voice', voice,
        `--rate=${rate}`,
        '--text', text,
        '--write-media', mp3,
        '--write-subtitles', srt,
      ]);
      // A "success" that wrote nothing is still a failure; catch it here so we
      // do not hand an empty file to ffprobe.
      const { size } = await fs.stat(mp3).catch(() => ({ size: 0 }));
      if (size > 0) {
        if (attempt > 1) log.detail(`recovered on attempt ${attempt}`);
        return;
      }
      lastError = new Error('edge-tts wrote an empty file');
    } catch (e) {
      lastError = e;
    }

    // Remove the partial file so a retry does not read a truncated mp3.
    await fs.rm(mp3, { force: true });

    if (attempt < TTS_ATTEMPTS) {
      const wait = TTS_BACKOFF_MS[attempt - 1] ?? 4500;
      const reason = /NoAudioReceived/.test(lastError.message) ? 'no audio received' : 'tts error';
      log.warn(`${reason} — retrying in ${wait}ms (attempt ${attempt + 1}/${TTS_ATTEMPTS})`);
      await sleep(wait);
    }
  }
  throw new Error(`edge-tts failed after ${TTS_ATTEMPTS} attempts for "${text.slice(0, 50)}": ${lastError?.message ?? 'unknown'}`);
}

/**
 * Synthesize all lines into `audioDir`. Skips a line whose mp3 already exists
 * so re-running the pipeline after a render tweak is cheap.
 */
export async function synthesize(episode, audioDir, { force = false } = {}) {
  await ensureDir(audioDir);
  const voice = hostVoices[episode.hostCharacterId] ?? DEFAULT_VOICE;
  const rate = (agePresets[episode.ageGroup] ?? agePresets['4-5']).speechRate;
  const utterances = planUtterances(episode);

  log.info(`voice: ${voice} at rate ${rate}`);
  log.info(`${utterances.length} lines to narrate`);

  const results = [];
  let reused = 0;

  for (const u of utterances) {
    const mp3 = path.join(audioDir, `${u.key}.mp3`);
    const srt = path.join(audioDir, `${u.key}.srt`);

    // Reuse a cached line only if it is actually usable. A run that died
    // mid-narration can leave a zero-byte or truncated mp3 behind, and
    // trusting it here would fail later in ffprobe or, worse, silently
    // produce a video with a missing line.
    let cached = false;
    if (!force && (await exists(mp3))) {
      cached = await isUsableAudio(mp3);
      if (!cached) log.detail(`${u.key}: discarding unusable cached audio`);
    }

    if (cached) {
      reused += 1;
    } else {
      await synthesizeLine({ voice, rate, text: u.text, mp3, srt });
    }

    const durationMs = await audioDurationMs(mp3);
    let cues = [];
    try {
      cues = parseCues(await fs.readFile(srt, 'utf8'));
    } catch {
      cues = [{ startMs: 0, endMs: durationMs, text: u.text }];
    }

    results.push({ ...u, audio: mp3, durationMs, cues });
    log.detail(`${u.key}  ${(durationMs / 1000).toFixed(2)}s  "${u.text.slice(0, 46)}${u.text.length > 46 ? '…' : ''}"`);
  }

  const spoken = results.reduce((n, r) => n + r.durationMs, 0);
  if (reused) log.detail(`${reused} line(s) reused from cache`);
  log.ok(`narrated ${results.length} lines, ${(spoken / 1000).toFixed(1)}s of speech`);

  return results;
}
