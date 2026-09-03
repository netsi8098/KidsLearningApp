/** Small shared helpers: process running, logging, fs, id/slug handling. */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

let stageNo = 0;

export const log = {
  stage(name) {
    stageNo += 1;
    console.log(`\n${c.bold(c.cyan(`[${stageNo}] ${name}`))}`);
  },
  info: (m) => console.log(`    ${m}`),
  detail: (m) => console.log(c.dim(`    ${m}`)),
  ok: (m) => console.log(`    ${c.green('✓')} ${m}`),
  warn: (m) => console.log(`    ${c.yellow('!')} ${m}`),
  err: (m) => console.error(`    ${c.red('✗')} ${m}`),
  resetStages: () => { stageNo = 0; },
};

/**
 * Run a command, resolving with stdout. Rejects with stderr on non-zero exit
 * so a broken ffmpeg/edge-tts invocation fails loudly instead of producing a
 * silently corrupt artifact.
 */
export function run(cmd, args, { cwd, input } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    p.on('error', (e) => reject(new Error(`${cmd} failed to start: ${e.message}`)));
    p.on('close', (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(`${cmd} exited ${code}\n${err.trim() || out.trim()}`));
    });
    if (input !== undefined) p.stdin.end(input);
    else p.stdin.end();
  });
}

/** True if a binary is on PATH. */
export async function hasBinary(name) {
  try { await run('which', [name]); return true; } catch { return false; }
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function writeJson(file, data) {
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

export async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

/** URL/filename-safe slug. */
export function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'episode';
}

/** Audio duration in ms via ffprobe. */
export async function audioDurationMs(file) {
  const out = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  const seconds = Number.parseFloat(out);
  if (!Number.isFinite(seconds)) throw new Error(`ffprobe gave no duration for ${file}`);
  return Math.round(seconds * 1000);
}

/** `3:07` style label used by the app's VideoItem.duration. */
export function formatDuration(ms) {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** `00:00:03.500` WebVTT timestamp. */
export function vttTime(ms) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const cs = Math.floor(ms % 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(h)}:${p(m)}:${p(s)}.${p(cs, 3)}`;
}
