/**
 * Tests for storyboard timing and caption assembly.
 *
 * The storyboard is the contract between narration and picture: if shot
 * boundaries or cue offsets drift, the finished video goes out of sync while
 * every individual stage still looks correct. These tests pin that maths down.
 */
import { describe, it, expect } from 'vitest';

// @ts-expect-error — plain-ESM pipeline module, no type declarations by design
import { buildStoryboard } from '../../../tools/video-forge/stages/storyboard.mjs';
// @ts-expect-error — plain-ESM pipeline module
import { planUtterances } from '../../../tools/video-forge/stages/voice.mjs';
// @ts-expect-error — plain-ESM pipeline module
import { buildVtt } from '../../../tools/video-forge/stages/mux.mjs';
// @ts-expect-error — plain-ESM pipeline module
import { composeFromTemplate } from '../../../tools/video-forge/providers/template.mjs';

interface Shot {
  index: number; startMs: number; endMs: number; speakEndMs: number;
  segType: string; role: string; pose: string; expression: string;
  lipSync: { startMs: number; endMs: number; shape: string }[];
  cues: { startMs: number; endMs: number; text: string }[];
  visual: { kind: string; [k: string]: unknown };
}
interface Storyboard {
  totalMs: number; frameCount: number; fps: number; shots: Shot[];
  host: string; theme: { primary: string };
}

/** Build narration stubs with fixed durations so timing is exactly predictable. */
function fakeNarration(episode: { segments: { type: string }[] }, perLineMs = 2000) {
  return (planUtterances(episode) as {
    key: string; segIndex: number; segType: string; role: string; text: string; holdMs: number;
  }[]).map((u) => ({
    ...u,
    audio: `/tmp/${u.key}.mp3`,
    durationMs: perLineMs,
    cues: [
      { startMs: 0, endMs: perLineMs / 2, text: 'first half' },
      { startMs: perLineMs / 2, endMs: perLineMs, text: 'second half' },
    ],
  }));
}

function build(topic = 'colors', ageGroup = '2-3', host = 'leo'): Storyboard {
  const episode = composeFromTemplate({ topic, ageGroup, host });
  return buildStoryboard(episode, fakeNarration(episode)) as Storyboard;
}

describe('buildStoryboard — timing', () => {
  it('produces one shot per spoken line', () => {
    const episode = composeFromTemplate({ topic: 'colors', ageGroup: '2-3', host: 'leo' });
    const narration = fakeNarration(episode);
    const sb = buildStoryboard(episode, narration) as Storyboard;
    expect(sb.shots).toHaveLength(narration.length);
  });

  it('lays shots end to end with no gaps or overlaps', () => {
    const sb = build();
    expect(sb.shots[0].startMs).toBe(0);
    for (let i = 1; i < sb.shots.length; i += 1) {
      expect(sb.shots[i].startMs).toBe(sb.shots[i - 1].endMs);
    }
    expect(sb.shots.at(-1)!.endMs).toBe(sb.totalMs);
  });

  it('gives every shot a positive duration', () => {
    for (const shot of build().shots) {
      expect(shot.endMs).toBeGreaterThan(shot.startMs);
    }
  });

  it('ends speech before the shot ends, leaving hold time', () => {
    for (const shot of build().shots) {
      expect(shot.speakEndMs).toBeGreaterThan(shot.startMs);
      expect(shot.speakEndMs).toBeLessThanOrEqual(shot.endMs);
    }
  });

  it('gives interaction prompts a longer hold than a teach line', () => {
    const sb = build();
    const teach = sb.shots.find((s) => s.segType === 'teach')!;
    const prompt = sb.shots.find((s) => s.segType === 'interaction')!;
    // Same synthesized speech length, so the difference is pure thinking time.
    expect(prompt.endMs - prompt.speakEndMs).toBeGreaterThan(teach.endMs - teach.speakEndMs);
  });

  it('derives frame count from total duration and fps', () => {
    const sb = build();
    expect(sb.frameCount).toBe(Math.ceil((sb.totalMs / 1000) * sb.fps));
  });

  it('offsets cues to absolute timeline positions', () => {
    const sb = build();
    for (const shot of sb.shots) {
      for (const cue of shot.cues) {
        expect(cue.startMs).toBeGreaterThanOrEqual(shot.startMs);
        expect(cue.endMs).toBeLessThanOrEqual(shot.speakEndMs);
      }
    }
  });
});

describe('buildStoryboard — presentation', () => {
  it('keeps lip-sync frames inside the speaking window', () => {
    for (const shot of build().shots) {
      for (const f of shot.lipSync) {
        expect(f.startMs).toBeGreaterThanOrEqual(shot.startMs);
        // A trailing 'closed' frame may extend slightly past speech.
        expect(f.startMs).toBeLessThanOrEqual(shot.speakEndMs + 200);
        expect(f.endMs).toBeGreaterThan(f.startMs);
      }
    }
  });

  it('closes the mouth at the end of each phrase', () => {
    const shot = build().shots[0];
    expect(shot.lipSync.some((f) => f.shape === 'closed')).toBe(true);
  });

  it('assigns a listening pose while waiting for the child to answer', () => {
    const sb = build();
    const prompt = sb.shots.find((s) => s.segType === 'interaction')!;
    expect(prompt.pose).toBe('listening');
  });

  it('celebrates during the recap', () => {
    const sb = build();
    const recap = sb.shots.find((s) => s.segType === 'recap')!;
    expect(recap.expression).toBe('celebrating');
  });

  it('reveals the correct answer only on the hint shot', () => {
    const sb = build();
    const chooseShots = sb.shots.filter((s) => s.visual.kind === 'choose');
    expect(chooseShots.length).toBeGreaterThan(0);
    const prompt = chooseShots.find((s) => s.role === 'prompt')!;
    expect(prompt.visual.revealAnswer).toBe(false);

    const hint = chooseShots.find((s) => s.role === 'hint');
    if (hint) expect(hint.visual.revealAnswer).toBe(true);
  });

  it('carries the host theme through to the storyboard', () => {
    const sb = build('colors', '2-3', 'finn');
    expect(sb.host).toBe('finn');
    expect(sb.theme.primary).toMatch(/^#/);
  });
});

describe('buildVtt', () => {
  it('emits well-formed, monotonically increasing WebVTT', () => {
    const vtt = buildVtt(build()) as string;
    expect(vtt.startsWith('WEBVTT')).toBe(true);

    const stamps = [...vtt.matchAll(/(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/g)];
    expect(stamps.length).toBeGreaterThan(0);

    const toMs = (h: string, m: string, s: string, ms: string) =>
      +h * 3_600_000 + +m * 60_000 + +s * 1000 + +ms;

    let prevEnd = -1;
    for (const m of stamps) {
      const start = toMs(m[1], m[2], m[3], m[4]);
      const end = toMs(m[5], m[6], m[7], m[8]);
      expect(end).toBeGreaterThan(start);
      expect(start).toBeGreaterThanOrEqual(prevEnd);
      prevEnd = end;
    }
  });

  it('numbers cues sequentially from 1', () => {
    const vtt = buildVtt(build()) as string;
    const ids = vtt.split('\n').filter((l) => /^\d+$/.test(l)).map(Number);
    expect(ids[0]).toBe(1);
    ids.forEach((id, i) => expect(id).toBe(i + 1));
  });
});
