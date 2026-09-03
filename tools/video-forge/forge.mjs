#!/usr/bin/env node
/**
 * video-forge — generates educational animation videos for the kids app.
 *
 * Replaces the Flowise install: the flow is code, versioned with the app,
 * runnable in CI, with no server to keep alive.
 *
 *   script → validate → narrate → storyboard → render → mux → publish
 *
 * Usage:
 *   node tools/video-forge/forge.mjs "colors" --age 2-3 --host leo
 *   node tools/video-forge/forge.mjs "counting" --preview
 *   node tools/video-forge/forge.mjs --batch batch.json
 *   node tools/video-forge/forge.mjs --reindex
 *   node tools/video-forge/forge.mjs --list-topics
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { paths, video } from './config.mjs';
import { log, ensureDir, writeJson, slug, hasBinary, formatDuration } from './lib/util.mjs';
import { validateEpisode } from './lib/episode.mjs';
import { generateEpisode } from './providers/llm.mjs';
import { availableTopics } from './providers/template.mjs';
import { synthesize } from './stages/voice.mjs';
import { buildStoryboard } from './stages/storyboard.mjs';
import { renderFrames, renderSingleFrame } from './stages/render.mjs';
import { mux } from './stages/mux.mjs';
import { publish, reindex } from './stages/publish.mjs';

const HOSTS = ['leo', 'daisy', 'ollie', 'ruby', 'finn'];

function parseArgs(argv) {
  const opts = {
    topic: null, age: '4-5', host: 'leo', minutes: 3,
    provider: 'auto', preview: false, keepFrames: false,
    force: false, concurrency: 3, batch: null,
    reindex: false, listTopics: false, dryRun: false,
  };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--age': opts.age = next(); break;
      case '--host': opts.host = next(); break;
      case '--minutes': opts.minutes = Number(next()); break;
      case '--provider': opts.provider = next(); break;
      case '--concurrency': opts.concurrency = Number(next()); break;
      case '--batch': opts.batch = next(); break;
      case '--preview': opts.preview = true; break;
      case '--keep-frames': opts.keepFrames = true; break;
      case '--force': opts.force = true; break;
      case '--dry-run': opts.dryRun = true; break;
      case '--reindex': opts.reindex = true; break;
      case '--list-topics': opts.listTopics = true; break;
      case '-h': case '--help': opts.help = true; break;
      default:
        if (a.startsWith('--')) throw new Error(`unknown flag: ${a}`);
        rest.push(a);
    }
  }
  if (rest.length) opts.topic = rest.join(' ');
  return opts;
}

function usage() {
  console.log(`
video-forge — educational animation videos for the kids app

  node tools/video-forge/forge.mjs <topic> [options]

Options
  --age <2-3|4-5|6-8>    target age band            (default 4-5)
  --host <id>            mascot host: ${HOSTS.join(', ')}
  --minutes <n>          target length hint         (default 3)
  --provider <name>      auto | anthropic | ollama | template
  --preview              render one still frame only, no video
  --dry-run              write the script + storyboard, skip render
  --force                re-synthesize narration, ignoring cache
  --concurrency <n>      parallel render pages      (default 3)
  --keep-frames          keep captured frames for debugging
  --batch <file.json>    generate many: [{ "topic": "...", "age": "2-3" }]
  --reindex              rebuild the .ts manifest from index.json
  --list-topics          show built-in curriculum topics

Examples
  node tools/video-forge/forge.mjs "colors" --age 2-3 --host leo
  node tools/video-forge/forge.mjs "counting" --age 4-5 --host ollie --preview
`);
}

/** Verify external tools before doing expensive work. */
async function preflight() {
  const missing = [];
  for (const bin of ['ffmpeg', 'ffprobe', 'python3']) {
    if (!(await hasBinary(bin))) missing.push(bin);
  }
  if (missing.length) {
    throw new Error(`missing required tools: ${missing.join(', ')}\n`
      + `  ffmpeg/ffprobe: brew install ffmpeg\n`
      + `  python3 + edge-tts: pip3 install edge-tts`);
  }
  try {
    await import('playwright');
  } catch {
    throw new Error('playwright is not installed — run: npm install && npx playwright install chromium');
  }
}

/** One episode, end to end. */
async function forgeOne(spec, opts) {
  log.resetStages();
  const label = `${spec.topic} · age ${spec.ageGroup} · host ${spec.host}`;
  console.log(`\n\x1b[1m━━ forging: ${label} ━━\x1b[0m`);

  // ── 1. script ───────────────────────────────────────
  log.stage('Script');
  const { episode, provider } = await generateEpisode(spec, opts.provider);

  // ── 2. validate ─────────────────────────────────────
  log.stage('Validate & safety gate');
  const report = validateEpisode(episode);
  for (const w of report.warnings) log.warn(w);
  if (!report.ok) {
    report.errors.forEach((e) => log.err(e));
    throw new Error(`episode failed validation (${report.errors.length} error(s)) — nothing was published`);
  }
  log.ok(`${episode.segments.length} segments valid · kid-safety passed`);

  const workDir = path.join(paths.work, episode.id);
  await ensureDir(workDir);
  await writeJson(path.join(workDir, 'episode.json'), episode);

  // ── 3. narrate ──────────────────────────────────────
  log.stage('Narrate (edge-tts)');
  const narration = await synthesize(episode, path.join(workDir, 'audio'), { force: opts.force });

  // ── 4. storyboard ───────────────────────────────────
  log.stage('Storyboard');
  const storyboard = buildStoryboard(episode, narration);
  await writeJson(path.join(workDir, 'storyboard.json'), storyboard);
  log.ok(`${storyboard.shots.length} shots · ${formatDuration(storyboard.totalMs)} · ${storyboard.frameCount} frames`);

  if (opts.preview) {
    const still = path.join(workDir, 'preview.png');
    const at = storyboard.shots[Math.min(2, storyboard.shots.length - 1)];
    await renderSingleFrame(storyboard, at.startMs + 700, still);
    log.ok(`preview still: ${path.relative(paths.root, still)}`);
    return { preview: still, episode, storyboard };
  }

  if (opts.dryRun) {
    log.ok(`dry run — script and storyboard written to ${path.relative(paths.root, workDir)}`);
    return { episode, storyboard, dryRun: true };
  }

  // ── 5. render ───────────────────────────────────────
  log.stage('Render frames (headless Chromium)');
  const framesDir = path.join(workDir, 'frames');
  await renderFrames(storyboard, framesDir, { concurrency: opts.concurrency });

  // ── 6. mux ──────────────────────────────────────────
  log.stage('Mux (ffmpeg)');
  const artifacts = await mux(storyboard, framesDir, path.join(workDir, 'out'), episode.id);

  // ── 7. publish ──────────────────────────────────────
  log.stage('Publish to app');
  const entry = await publish(episode, storyboard, artifacts, { scriptProvider: provider });

  if (!opts.keepFrames) {
    await fs.rm(framesDir, { recursive: true, force: true });
    log.detail('frames discarded (use --keep-frames to keep them)');
  }

  return { entry, episode, storyboard, artifacts };
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`\x1b[31m${e.message}\x1b[0m`);
    usage();
    process.exit(2);
  }

  if (opts.help) { usage(); return; }

  if (opts.listTopics) {
    console.log('\nBuilt-in curriculum topics (template provider):');
    availableTopics().forEach((t) => console.log(`  · ${t}`));
    console.log('\nAny other topic still works — it falls back to a generic'
      + '\nexploration lesson, or use --provider anthropic/ollama for open-ended topics.\n');
    return;
  }

  if (opts.reindex) { await reindex(); return; }

  await preflight();

  // ── batch mode ──────────────────────────────────────
  if (opts.batch) {
    const jobs = JSON.parse(await fs.readFile(opts.batch, 'utf8'));
    if (!Array.isArray(jobs) || jobs.length === 0) throw new Error('batch file must be a non-empty JSON array');
    console.log(`\nbatch: ${jobs.length} episode(s) from ${opts.batch}`);

    const done = [];
    const failed = [];
    for (const [i, job] of jobs.entries()) {
      console.log(`\n\x1b[2m── ${i + 1}/${jobs.length} ─────────────────────────────\x1b[0m`);
      const spec = {
        topic: job.topic,
        ageGroup: job.age ?? job.ageGroup ?? opts.age,
        host: job.host ?? HOSTS[i % HOSTS.length],
        durationMinutes: job.minutes ?? opts.minutes,
      };
      try {
        const res = await forgeOne(spec, opts);
        done.push(res.entry ?? { id: res.episode.id });
      } catch (e) {
        log.err(e.message);
        failed.push({ topic: job.topic, error: e.message });
      }
    }
    console.log(`\n\x1b[1mbatch complete: ${done.length} succeeded, ${failed.length} failed\x1b[0m`);
    done.forEach((d) => console.log(`  ✓ ${d.id}`));
    failed.forEach((f) => console.log(`  ✗ ${f.topic}: ${f.error}`));
    if (failed.length) process.exitCode = 1;
    return;
  }

  // ── single episode ──────────────────────────────────
  if (!opts.topic) { usage(); process.exit(2); }
  if (!HOSTS.includes(opts.host)) {
    throw new Error(`--host must be one of ${HOSTS.join(', ')} (got "${opts.host}")`);
  }

  const res = await forgeOne({
    topic: opts.topic,
    ageGroup: opts.age,
    host: opts.host,
    durationMinutes: opts.minutes,
  }, opts);

  if (res.entry) {
    console.log(`\n\x1b[32m\x1b[1m✓ done\x1b[0m  ${res.entry.title}`);
    console.log(`  video    public${res.entry.src}`);
    console.log(`  poster   public${res.entry.thumbnail}`);
    console.log(`  length   ${res.entry.duration}`);
    console.log(`  category ${res.entry.category}   age ${res.entry.ageGroup}\n`);
  }
}

main().catch((e) => {
  console.error(`\n\x1b[31m\x1b[1m✗ ${e.message}\x1b[0m\n`);
  process.exit(1);
});
