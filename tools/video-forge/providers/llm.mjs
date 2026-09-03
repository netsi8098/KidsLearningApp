/**
 * Script generation providers, tried in order of quality:
 *
 *   1. anthropic — best writing, needs ANTHROPIC_API_KEY
 *   2. ollama    — fully local/offline, needs `ollama serve` + a pulled model
 *   3. template  — deterministic composer, always available, no setup
 *
 * The template provider is not a stub: it produces a complete, valid,
 * age-appropriate episode from the curriculum bank. It exists so the pipeline
 * is never blocked on model availability, and so tests are reproducible.
 */
import { log } from '../lib/util.mjs';
import { agePresets } from '../config.mjs';
import { composeFromTemplate } from './template.mjs';

const ANTHROPIC_MODEL = process.env.VIDEO_FORGE_ANTHROPIC_MODEL ?? 'claude-sonnet-5';
const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.VIDEO_FORGE_OLLAMA_MODEL ?? 'llama3.2';

/** The contract we want the model to fill. Kept in sync with lib/episode.mjs. */
function buildPrompt({ topic, ageGroup, host, durationMinutes }) {
  const preset = agePresets[ageGroup] ?? agePresets['4-5'];
  return `You write scripts for short educational videos for young children.

Write ONE episode as JSON about: "${topic}"

Audience: children aged ${ageGroup}.
Host character id: "${host}"
Target length: ${durationMinutes} minutes (~${preset.targetSegments} segments).

Hard rules:
- Output ONLY a JSON object. No markdown, no commentary, no code fences.
- Keep every "hostLine" under ${preset.maxWordsPerLine} words. Short sentences.
- Warm, playful, encouraging tone. Address the child as "you" / "my friend".
- Concrete, familiar examples only (fruit, animals, toys, family, weather).
- Absolutely no: violence, fear, death, illness, ads, links, personal questions,
  or asking the child to keep anything from their parents.
- Include ${preset.teachCount} "teach" segments and at least 2 interactive
  segments ("interaction" or "call-response") so the child participates.

JSON shape — first segment MUST be "intro", last MUST be "goodbye":
{
  "id": "ep-<slug>",
  "title": "<child-friendly title>",
  "emoji": "<one emoji>",
  "hostCharacterId": "${host}",
  "topic": "${topic}",
  "ageGroup": "${ageGroup}",
  "durationMinutes": ${durationMinutes},
  "segments": [
    { "type": "intro", "hostLine": "...", "hostExpression": "excited", "hostPose": "waving", "durationMs": 4000 },
    { "type": "topic-reveal", "title": "...", "emoji": "...", "hostLine": "...", "revealAnimation": "rainbow-burst" },
    { "type": "teach", "content": "<fact for the parent-facing recap>", "visual": "<one emoji>", "hostLine": "<what the host says>" },
    { "type": "interaction", "prompt": "...", "interactionType": "choose", "options": ["<emoji>","<emoji>","<emoji>"], "correctAnswer": "<one of options>", "hostHint": "..." },
    { "type": "call-response", "hostLine": "...", "expectedResponse": "...", "celebrateOnResponse": true },
    { "type": "recap", "summary": "...", "hostLine": "...", "hostExpression": "celebrating" },
    { "type": "goodbye", "hostLine": "...", "nextSuggestion": "..." }
  ]
}`;
}

/** Pull the first balanced JSON object out of a model response. */
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf('{');
  if (start === -1) throw new Error('no JSON object in model response');
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < body.length; i += 1) {
    const ch = body[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return JSON.parse(body.slice(start, i + 1));
    }
  }
  throw new Error('unbalanced JSON in model response');
}

async function viaAnthropic(spec) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(spec) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  return extractJson(text);
}

async function viaOllama(spec) {
  let tags;
  try {
    const probe = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (!probe.ok) return null;
    tags = await probe.json();
  } catch {
    return null; // server not running
  }
  const models = (tags.models ?? []).map((m) => m.name);
  if (models.length === 0) return null;
  const model = models.find((m) => m.startsWith(OLLAMA_MODEL)) ?? models[0];
  log.detail(`ollama model: ${model}`);

  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: buildPrompt(spec),
      format: 'json',
      stream: false,
      options: { temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = await res.json();
  return extractJson(data.response ?? '');
}

/**
 * Generate an episode script. `preferred` forces one provider; otherwise the
 * chain degrades gracefully. Returns `{ episode, provider }`.
 */
export async function generateEpisode(spec, preferred = 'auto') {
  const chain = preferred === 'auto'
    ? [['anthropic', viaAnthropic], ['ollama', viaOllama]]
    : [[preferred, { anthropic: viaAnthropic, ollama: viaOllama, template: async () => null }[preferred]]].filter(([, fn]) => fn);

  for (const [name, fn] of chain) {
    if (!fn) continue;
    try {
      const episode = await fn(spec);
      if (episode) {
        log.ok(`script written by ${name}`);
        return { episode, provider: name };
      }
      log.detail(`${name}: unavailable, trying next`);
    } catch (e) {
      log.warn(`${name} failed: ${e.message}`);
    }
  }

  if (preferred !== 'auto' && preferred !== 'template') {
    throw new Error(`provider "${preferred}" was requested but is unavailable`);
  }
  log.ok('script composed by template provider (offline, deterministic)');
  return { episode: composeFromTemplate(spec), provider: 'template' };
}
