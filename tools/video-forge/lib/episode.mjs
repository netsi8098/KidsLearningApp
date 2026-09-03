/**
 * Episode validation + kid-safety gate.
 *
 * Mirrors the TypeScript contract in src/segments/episodeSchema.ts. Because the
 * pipeline is plain JS and the app is TS, this file is the runtime guard that
 * keeps generated JSON assignable to `HostedEpisode` — if you change the schema
 * there, change the SEGMENT_RULES here.
 */
import { agePresets } from '../config.mjs';

export const HOST_IDS = ['leo', 'daisy', 'ollie', 'ruby', 'finn'];
export const AGE_GROUPS = ['2-3', '4-5', '6-8', 'all'];

/** Required + optional fields per segment type, from episodeSchema.ts. */
const SEGMENT_RULES = {
  intro:          { required: ['hostLine', 'hostExpression', 'hostPose', 'durationMs'] },
  'topic-reveal': { required: ['title', 'emoji', 'hostLine', 'revealAnimation'] },
  teach:          { required: ['content', 'visual', 'hostLine'] },
  interaction:    { required: ['prompt', 'interactionType'], optional: ['options', 'correctAnswer', 'hostHint'] },
  'call-response':{ required: ['hostLine', 'expectedResponse', 'celebrateOnResponse'] },
  recap:          { required: ['summary', 'hostLine', 'hostExpression'] },
  goodbye:        { required: ['hostLine'], optional: ['nextSuggestion'] },
};

const INTERACTION_TYPES = ['tap', 'drag', 'voice', 'choose'];

/**
 * Words that must never reach a preschooler. Deliberately blunt substring
 * matching on word boundaries — a false positive costs one regeneration,
 * a false negative ships unsafe content to a 3-year-old.
 */
const UNSAFE_TERMS = [
  'kill', 'killed', 'killing', 'die', 'died', 'dead', 'death', 'blood', 'bloody',
  'gun', 'guns', 'shoot', 'shot', 'knife', 'stab', 'weapon', 'war', 'bomb',
  'hate', 'stupid', 'dumb', 'idiot', 'ugly', 'fat', 'shut up',
  'scary', 'terrifying', 'nightmare', 'monster', 'demon', 'devil', 'hell',
  'drug', 'drugs', 'alcohol', 'beer', 'wine', 'cigarette', 'smoking',
  'sex', 'sexy', 'naked', 'kiss me',
  'hurt', 'pain', 'punish', 'beat', 'hit you', 'sick', 'disease', 'hospital',
  'buy now', 'subscribe', 'click here', 'credit card', 'password',
];

/** Phrases that pressure or frighten a child even without an unsafe word. */
const UNSAFE_PATTERNS = [
  { re: /\bdon'?t tell (your )?(mom|dad|mommy|daddy|parents)\b/i, why: 'asks child to keep secrets from parents' },
  { re: /\b(meet|visit) me\b/i, why: 'suggests meeting someone' },
  { re: /\b(your|whats your) (address|phone|full name)\b/i, why: 'solicits personal information' },
  { re: /\bhurry\b.*\b(buy|order|pay)\b/i, why: 'commercial pressure' },
];

class ValidationReport {
  constructor() { this.errors = []; this.warnings = []; }
  error(msg) { this.errors.push(msg); }
  warn(msg) { this.warnings.push(msg); }
  get ok() { return this.errors.length === 0; }
}

/** Every string a child will hear or read, with a label for error messages. */
export function collectText(episode) {
  const out = [];
  const push = (label, value) => {
    if (typeof value === 'string' && value.trim()) out.push({ label, text: value });
  };
  push('title', episode.title);
  push('topic', episode.topic);
  (episode.segments ?? []).forEach((seg, i) => {
    const at = `segment ${i + 1} (${seg?.type})`;
    for (const key of ['hostLine', 'content', 'summary', 'prompt', 'hostHint', 'title', 'nextSuggestion', 'expectedResponse']) {
      push(`${at}.${key}`, seg?.[key]);
    }
    if (Array.isArray(seg?.options)) seg.options.forEach((o, j) => push(`${at}.options[${j}]`, o));
  });
  return out;
}

/** Structural validation against the HostedEpisode contract. */
export function validateStructure(episode, report = new ValidationReport()) {
  if (!episode || typeof episode !== 'object') {
    report.error('episode is not an object');
    return report;
  }
  for (const field of ['id', 'title', 'emoji', 'hostCharacterId', 'topic', 'ageGroup']) {
    if (!episode[field]) report.error(`missing required field: ${field}`);
  }
  if (episode.hostCharacterId && !HOST_IDS.includes(episode.hostCharacterId)) {
    report.error(`hostCharacterId "${episode.hostCharacterId}" is not one of ${HOST_IDS.join(', ')}`);
  }
  if (episode.ageGroup && !AGE_GROUPS.includes(episode.ageGroup)) {
    report.error(`ageGroup "${episode.ageGroup}" is not one of ${AGE_GROUPS.join(', ')}`);
  }
  if (!Array.isArray(episode.segments) || episode.segments.length === 0) {
    report.error('segments must be a non-empty array');
    return report;
  }

  episode.segments.forEach((seg, i) => {
    const at = `segment ${i + 1}`;
    const rule = SEGMENT_RULES[seg?.type];
    if (!rule) {
      report.error(`${at}: unknown type "${seg?.type}" (expected one of ${Object.keys(SEGMENT_RULES).join(', ')})`);
      return;
    }
    for (const field of rule.required) {
      if (seg[field] === undefined || seg[field] === null || seg[field] === '') {
        report.error(`${at} (${seg.type}): missing required field "${field}"`);
      }
    }
    if (seg.type === 'interaction') {
      if (!INTERACTION_TYPES.includes(seg.interactionType)) {
        report.error(`${at}: interactionType "${seg.interactionType}" invalid`);
      }
      if (seg.interactionType === 'choose') {
        if (!Array.isArray(seg.options) || seg.options.length < 2) {
          report.error(`${at}: a "choose" interaction needs at least 2 options`);
        } else if (seg.correctAnswer && !seg.options.includes(seg.correctAnswer)) {
          report.error(`${at}: correctAnswer "${seg.correctAnswer}" is not among options`);
        }
      }
    }
  });

  // Shape rules: an episode should open and close cleanly.
  const types = episode.segments.map((s) => s?.type);
  if (types[0] !== 'intro') report.error('first segment must be an "intro"');
  if (types[types.length - 1] !== 'goodbye') report.error('last segment must be a "goodbye"');
  if (!types.includes('recap')) report.warn('no "recap" segment — kids retain more with a recap');
  if (!types.some((t) => t === 'interaction' || t === 'call-response')) {
    report.error('episode has no interaction or call-response — it would be passive viewing');
  }
  return report;
}

/** Kid-safety and reading-level validation. */
export function validateSafety(episode, report = new ValidationReport()) {
  const preset = agePresets[episode?.ageGroup] ?? agePresets['4-5'];
  for (const { label, text } of collectText(episode)) {
    const lower = text.toLowerCase();
    for (const term of UNSAFE_TERMS) {
      // Word-boundary match so "die" does not fire inside "audience".
      if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lower)) {
        report.error(`unsafe word "${term}" in ${label}: "${text.slice(0, 70)}"`);
      }
    }
    for (const { re, why } of UNSAFE_PATTERNS) {
      if (re.test(text)) report.error(`unsafe phrasing (${why}) in ${label}`);
    }
    if (/https?:\/\//i.test(text)) report.error(`contains a URL in ${label}`);

    const words = text.trim().split(/\s+/).length;
    if (label.endsWith('hostLine') && words > preset.maxWordsPerLine * 2.5) {
      report.warn(`${label} is ${words} words — long for age ${episode.ageGroup}`);
    }
  }
  return report;
}

/** Run both gates. Returns a report with `.ok`, `.errors`, `.warnings`. */
export function validateEpisode(episode) {
  const report = new ValidationReport();
  validateStructure(episode, report);
  if (report.ok) validateSafety(episode, report);
  return report;
}
