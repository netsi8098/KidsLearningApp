/**
 * Stage: storyboard.
 *
 * Merges the episode script with measured audio durations into one absolute
 * timeline. This is the hand-off artifact: the renderer is a pure function of
 * (storyboard, timeMs), and the muxer uses the same numbers to place audio.
 * Nothing downstream re-derives timing.
 */
import { video, hostThemes } from '../config.mjs';

/** Mouth shapes, matching MouthShape in src/mascot/lipSync.ts. */
const MOUTH_BY_VOWEL = {
  a: 'open-wide', e: 'ee', i: 'ee', o: 'oh', u: 'oh',
};

/**
 * Build a mouth-shape track for one spoken phrase. edge-tts gives us
 * phrase-level cues, so we animate within each cue by cycling shapes on
 * syllable-ish boundaries — enough to read as talking at 24fps without
 * needing a real phoneme aligner.
 */
function lipSyncTrack(cues, startMs, durationMs) {
  const frames = [];
  const source = cues.length ? cues : [{ startMs: 0, endMs: durationMs, text: '' }];

  for (const cue of source) {
    const cueStart = startMs + cue.startMs;
    const cueEnd = startMs + Math.min(cue.endMs, durationMs);
    const letters = cue.text.toLowerCase().replace(/[^a-z]/g, '');
    const vowels = [...letters].filter((ch) => 'aeiou'.includes(ch));
    // One mouth change per vowel, but never faster than ~90ms (a frame or two).
    const steps = Math.max(1, Math.min(vowels.length || 1, Math.floor((cueEnd - cueStart) / 90)));
    const step = (cueEnd - cueStart) / steps;

    for (let i = 0; i < steps; i += 1) {
      const vowel = vowels[i % Math.max(1, vowels.length)];
      frames.push({
        startMs: Math.round(cueStart + i * step),
        endMs: Math.round(cueStart + (i + 1) * step),
        shape: MOUTH_BY_VOWEL[vowel] ?? (i % 2 ? 'open-small' : 'smile'),
      });
    }
    // Close the mouth in the gap before the next phrase.
    frames.push({ startMs: Math.round(cueEnd), endMs: Math.round(cueEnd) + 120, shape: 'closed' });
  }
  return frames;
}

/** Pose + expression the host holds during a given segment type. */
function hostStateFor(segType, role) {
  switch (segType) {
    case 'intro':          return { pose: 'waving',     expression: 'excited' };
    case 'topic-reveal':   return { pose: 'explaining', expression: 'happy' };
    case 'teach':          return { pose: 'pointing',   expression: 'happy' };
    case 'interaction':    return { pose: role === 'hint' ? 'explaining' : 'listening', expression: 'curious' };
    case 'call-response':  return { pose: 'listening',  expression: 'encouraging' };
    case 'recap':          return { pose: 'cheering',   expression: 'celebrating' };
    case 'goodbye':        return { pose: 'waving',     expression: 'warm' };
    default:               return { pose: 'explaining', expression: 'happy' };
  }
}

/**
 * Compose the timeline.
 *
 * @param episode  validated HostedEpisode
 * @param narration output of stages/voice.mjs synthesize()
 */
export function buildStoryboard(episode, narration) {
  const theme = hostThemes[episode.hostCharacterId] ?? hostThemes.leo;
  const shots = [];
  let cursor = 0;

  for (const line of narration) {
    const seg = episode.segments[line.segIndex];
    const state = hostStateFor(line.segType, line.role);
    const startMs = cursor;
    // A shot lasts as long as its speech plus its hold, plus a breathing beat.
    const speakMs = line.durationMs;
    const shotMs = speakMs + line.holdMs + video.beatPaddingMs;

    shots.push({
      index: shots.length,
      startMs,
      endMs: startMs + shotMs,
      speakEndMs: startMs + speakMs,
      segIndex: line.segIndex,
      segType: line.segType,
      role: line.role,
      text: line.text,
      audio: line.audio,
      audioDurationMs: speakMs,
      pose: state.pose,
      expression: state.expression,
      lipSync: lipSyncTrack(line.cues, startMs, speakMs),
      cues: line.cues.map((c) => ({
        startMs: startMs + c.startMs,
        endMs: startMs + Math.min(c.endMs, speakMs),
        text: c.text,
      })),
      // Visual payload the scene renderer draws for this shot.
      visual: buildVisual(seg, line),
    });

    cursor += shotMs;
  }

  const totalMs = cursor;
  return {
    episodeId: episode.id,
    title: episode.title,
    emoji: episode.emoji,
    host: episode.hostCharacterId,
    hostName: theme.name,
    hostAnimal: theme.animal,
    topic: episode.topic,
    ageGroup: episode.ageGroup,
    theme,
    width: video.width,
    height: video.height,
    fps: video.fps,
    totalMs,
    frameCount: Math.ceil((totalMs / 1000) * video.fps),
    shots,
  };
}

/** What appears on the stage (beside the host) for a given line. */
function buildVisual(seg, line) {
  switch (seg.type) {
    case 'intro':
      return { kind: 'title', headline: line.text.split('!')[0] || 'Hello!', sub: '' };
    case 'topic-reveal':
      return { kind: 'reveal', headline: seg.title, emoji: seg.emoji, animation: seg.revealAnimation };
    case 'teach':
      return { kind: 'teach', emoji: seg.visual, caption: seg.content };
    case 'interaction':
      return {
        kind: 'choose',
        prompt: seg.prompt,
        options: seg.options ?? [],
        correctAnswer: seg.correctAnswer ?? null,
        // The answer is only highlighted once the hint plays, so the child
        // gets the full wait on the prompt shot before seeing it.
        revealAnswer: line.role === 'hint',
      };
    case 'call-response':
      return { kind: 'repeat', word: seg.expectedResponse, celebrate: !!seg.celebrateOnResponse };
    case 'recap':
      return { kind: 'recap', summary: seg.summary };
    case 'goodbye':
      return { kind: 'goodbye', headline: 'See you soon!', sub: seg.nextSuggestion ?? '' };
    default:
      return { kind: 'title', headline: '', sub: '' };
  }
}
