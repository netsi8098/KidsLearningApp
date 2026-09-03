/**
 * Tests for the video-forge episode contract: structural validation, the
 * kid-safety gate, and the deterministic template composer.
 *
 * These guard the two properties that matter most about generated content:
 * it must be assignable to HostedEpisode, and it must never carry unsafe
 * language to a child.
 */
import { describe, it, expect } from 'vitest';

// @ts-expect-error — plain-ESM pipeline module, no type declarations by design
import { validateEpisode, collectText, HOST_IDS } from '../../../tools/video-forge/lib/episode.mjs';
// @ts-expect-error — plain-ESM pipeline module
import { composeFromTemplate, resolveTopic, availableTopics } from '../../../tools/video-forge/providers/template.mjs';

interface Segment { type: string; [k: string]: unknown }
interface Episode {
  id: string; title: string; emoji: string; hostCharacterId: string;
  topic: string; ageGroup: string; durationMinutes: number; segments: Segment[];
}

function baseEpisode(): Episode {
  return {
    id: 'ep-test',
    title: 'Test Episode',
    emoji: '🎨',
    hostCharacterId: 'leo',
    topic: 'colors',
    ageGroup: '2-3',
    durationMinutes: 3,
    segments: [
      { type: 'intro', hostLine: 'Hello friend!', hostExpression: 'excited', hostPose: 'waving', durationMs: 4000 },
      { type: 'teach', content: 'Red is a color', visual: '🍓', hostLine: 'This is red!' },
      { type: 'interaction', prompt: 'Which is red?', interactionType: 'choose', options: ['🍓', '🍌'], correctAnswer: '🍓' },
      { type: 'recap', summary: 'We learned red', hostLine: 'Great job!', hostExpression: 'celebrating' },
      { type: 'goodbye', hostLine: 'Bye bye!' },
    ],
  };
}

describe('validateEpisode — structure', () => {
  it('accepts a well-formed episode', () => {
    const report = validateEpisode(baseEpisode());
    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
  });

  it('rejects an unknown host character', () => {
    const ep = baseEpisode();
    ep.hostCharacterId = 'gandalf';
    const report = validateEpisode(ep);
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toMatch(/hostCharacterId/);
  });

  it('rejects an unknown segment type', () => {
    const ep = baseEpisode();
    ep.segments.splice(2, 0, { type: 'musical-number', hostLine: 'La la la' });
    const report = validateEpisode(ep);
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toMatch(/unknown type "musical-number"/);
  });

  it('rejects a segment missing a required field', () => {
    const ep = baseEpisode();
    delete (ep.segments[1] as Record<string, unknown>).visual;
    const report = validateEpisode(ep);
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toMatch(/missing required field "visual"/);
  });

  it('requires the first segment to be an intro and the last a goodbye', () => {
    const ep = baseEpisode();
    ep.segments = ep.segments.slice(1); // drop the intro
    expect(validateEpisode(ep).errors.join(' ')).toMatch(/first segment must be an "intro"/);

    const ep2 = baseEpisode();
    ep2.segments.pop(); // drop the goodbye
    expect(validateEpisode(ep2).errors.join(' ')).toMatch(/last segment must be a "goodbye"/);
  });

  it('rejects a passive episode with no interaction', () => {
    const ep = baseEpisode();
    ep.segments = ep.segments.filter((s) => s.type !== 'interaction');
    const report = validateEpisode(ep);
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toMatch(/no interaction or call-response/);
  });

  it('rejects a "choose" interaction whose answer is not among the options', () => {
    const ep = baseEpisode();
    (ep.segments[2] as Record<string, unknown>).correctAnswer = '🥒';
    const report = validateEpisode(ep);
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toMatch(/correctAnswer .* not among options/);
  });

  it('rejects a "choose" interaction with fewer than two options', () => {
    const ep = baseEpisode();
    (ep.segments[2] as Record<string, unknown>).options = ['🍓'];
    (ep.segments[2] as Record<string, unknown>).correctAnswer = '🍓';
    expect(validateEpisode(ep).errors.join(' ')).toMatch(/at least 2 options/);
  });
});

describe('validateEpisode — kid-safety gate', () => {
  it.each([
    ['violence', 'The hunter will shoot the animal'],
    ['death', 'The little bird died in the winter'],
    ['frightening', 'A scary monster lives in there'],
    ['commercial', 'Click here to subscribe now'],
  ])('blocks %s', (_label, line) => {
    const ep = baseEpisode();
    (ep.segments[1] as Record<string, unknown>).hostLine = line;
    const report = validateEpisode(ep);
    expect(report.ok).toBe(false);
  });

  it('blocks grooming-style phrasing even without a banned word', () => {
    const ep = baseEpisode();
    (ep.segments[1] as Record<string, unknown>).hostLine = "Don't tell your mom, just meet me outside";
    const report = validateEpisode(ep);
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toMatch(/secrets from parents/);
  });

  it('blocks URLs in narration', () => {
    const ep = baseEpisode();
    (ep.segments[1] as Record<string, unknown>).hostLine = 'Go to https://example.com for more';
    expect(validateEpisode(ep).errors.join(' ')).toMatch(/contains a URL/);
  });

  it('does not false-positive on innocent words containing banned substrings', () => {
    const ep = baseEpisode();
    // "audience" contains "die", "diet" contains "die", "assistant" etc.
    (ep.segments[1] as Record<string, unknown>).hostLine = 'The audience enjoys a healthy diet of fruit';
    expect(validateEpisode(ep).ok).toBe(true);
  });

  it('scans option text, not just host lines', () => {
    const ep = baseEpisode();
    (ep.segments[2] as Record<string, unknown>).options = ['🍓', 'a gun'];
    expect(validateEpisode(ep).ok).toBe(false);
  });
});

describe('collectText', () => {
  it('gathers every child-facing string', () => {
    const texts = collectText(baseEpisode()).map((t: { text: string }) => t.text);
    expect(texts).toContain('Hello friend!');
    expect(texts).toContain('Which is red?');
    expect(texts).toContain('🍓');
    expect(texts).toContain('Bye bye!');
  });
});

describe('composeFromTemplate', () => {
  it('produces a valid episode for every built-in topic', () => {
    for (const topic of availableTopics() as string[]) {
      const ep = composeFromTemplate({ topic, ageGroup: '4-5', host: 'leo' });
      const report = validateEpisode(ep);
      expect(report.ok, `${topic}: ${report.errors.join('; ')}`).toBe(true);
    }
  });

  it('produces a valid episode for an unknown topic via the generic bank', () => {
    const ep = composeFromTemplate({ topic: 'volcanoes and lava', ageGroup: '6-8', host: 'finn' });
    expect(validateEpisode(ep).ok).toBe(true);
    expect(ep.segments.length).toBeGreaterThan(6);
  });

  it('is deterministic — same spec yields an identical script', () => {
    const spec = { topic: 'colors', ageGroup: '2-3', host: 'ollie' };
    expect(composeFromTemplate(spec)).toEqual(composeFromTemplate(spec));
  });

  it('scales segment count with the age band', () => {
    const toddler = composeFromTemplate({ topic: 'counting', ageGroup: '2-3', host: 'leo' });
    const older = composeFromTemplate({ topic: 'counting', ageGroup: '6-8', host: 'leo' });
    expect(older.segments.length).toBeGreaterThan(toddler.segments.length);
  });

  it('works with every valid host id', () => {
    for (const host of HOST_IDS as string[]) {
      const ep = composeFromTemplate({ topic: 'shapes', ageGroup: '4-5', host });
      expect(ep.hostCharacterId).toBe(host);
      expect(validateEpisode(ep).ok).toBe(true);
    }
  });

  it('gives toddlers at most three answer choices', () => {
    const ep = composeFromTemplate({ topic: 'colors', ageGroup: '2-3', host: 'leo' });
    for (const seg of ep.segments) {
      if (seg.type === 'interaction' && Array.isArray(seg.options)) {
        expect(seg.options.length).toBeLessThanOrEqual(3);
      }
    }
  });
});

describe('resolveTopic', () => {
  it.each([
    ['colours', 'colors'],
    ['numbers', 'counting'],
    ['ABC', 'alphabet'],
    ['farm animals', 'animals'],
    ['feelings', 'emotions'],
    ['learn about colors', 'colors'],
  ])('maps %s → %s', (input, expected) => {
    expect(resolveTopic(input)).toBe(expected);
  });

  it('returns null for a topic outside the curriculum', () => {
    expect(resolveTopic('quantum chromodynamics')).toBeNull();
  });
});
