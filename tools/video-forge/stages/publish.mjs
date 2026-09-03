/**
 * Stage: publish.
 *
 * Moves finished artifacts into public/videos/ and regenerates
 * src/data/generatedVideos.ts, which the app imports alongside its curated
 * YouTube list.
 *
 * public/videos/index.json is the source of truth for what has been published.
 * The .ts manifest is derived from it on every run, so republishing an episode
 * updates it in place instead of appending a duplicate.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { paths } from '../config.mjs';
import { log, ensureDir, exists, readJson, writeJson, formatDuration } from '../lib/util.mjs';

const INDEX_FILE = () => path.join(paths.publicVideos, 'index.json');

/**
 * Episode topic → the app's VideoCategory union (src/data/videoConfig.ts).
 * Anything unmapped lands in 'learning', which always exists.
 */
const TOPIC_TO_CATEGORY = {
  colors: 'colors-shapes',
  shapes: 'colors-shapes',
  counting: 'numbers',
  alphabet: 'alphabet',
  animals: 'animals',
  emotions: 'learning',
  weather: 'learning',
  bodyparts: 'learning',
};

export function categoryFor(topic) {
  return TOPIC_TO_CATEGORY[topic] ?? 'learning';
}

async function loadIndex() {
  if (await exists(INDEX_FILE())) {
    try { return await readJson(INDEX_FILE()); } catch { return []; }
  }
  return [];
}

/** Emit the TypeScript manifest the app imports. */
function renderManifest(entries) {
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id));
  const rows = sorted.map((e) => `  {
    id: ${JSON.stringify(e.id)},
    title: ${JSON.stringify(e.title)},
    channel: ${JSON.stringify(e.channel)},
    thumbnail: ${JSON.stringify(e.thumbnail)},
    duration: ${JSON.stringify(e.duration)},
    category: ${JSON.stringify(e.category)},
    source: 'local',
    src: ${JSON.stringify(e.src)},
    captions: ${JSON.stringify(e.captions)},
    host: ${JSON.stringify(e.host)},
    topic: ${JSON.stringify(e.topic)},
    ageGroup: ${JSON.stringify(e.ageGroup)},
    segmentCount: ${e.segmentCount},
    generatedAt: ${JSON.stringify(e.generatedAt)},
    scriptProvider: ${JSON.stringify(e.scriptProvider)},
  },`).join('\n');

  return `// ─────────────────────────────────────────────────────────────────────────
// GENERATED FILE — do not edit by hand.
//
// Written by tools/video-forge. To change what is here, regenerate:
//     node tools/video-forge/forge.mjs "colors" --age 2-3 --host leo
//
// Source of truth for published episodes: public/videos/index.json
// ─────────────────────────────────────────────────────────────────────────
import type { VideoCategory } from './videoConfig';

/** A video produced locally by video-forge and served from /public/videos. */
export interface GeneratedVideo {
  /** Stable episode id (not a YouTube id). */
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  category: VideoCategory;
  /** Discriminator against curated YouTube entries. */
  source: 'local';
  /** Path to the mp4, relative to the site root. */
  src: string;
  /** WebVTT captions path. */
  captions: string;
  /** Mascot host character id. */
  host: string;
  topic: string;
  ageGroup: string;
  segmentCount: number;
  generatedAt: string;
  scriptProvider: string;
}

export const generatedVideos: GeneratedVideo[] = [
${rows}
];

/** Generated episodes for a given app video category. */
export function getGeneratedByCategory(category: VideoCategory): GeneratedVideo[] {
  return generatedVideos.filter((v) => v.category === category);
}

/** Generated episodes suitable for an age band ('all' always matches). */
export function getGeneratedByAge(ageGroup: string): GeneratedVideo[] {
  return generatedVideos.filter((v) => v.ageGroup === ageGroup || v.ageGroup === 'all');
}
`;
}

/**
 * Copy artifacts into public/videos, update the index, rewrite the manifest.
 *
 * @param episode    the validated episode
 * @param storyboard the timeline (for segment count)
 * @param artifacts  output of stages/mux.mjs
 * @param meta       { scriptProvider }
 */
export async function publish(episode, storyboard, artifacts, meta = {}) {
  await ensureDir(paths.publicVideos);
  const base = episode.id;

  const targets = {
    video: path.join(paths.publicVideos, `${base}.mp4`),
    poster: path.join(paths.publicVideos, `${base}.jpg`),
    captions: path.join(paths.publicVideos, `${base}.vtt`),
  };
  await fs.copyFile(artifacts.video, targets.video);
  await fs.copyFile(artifacts.poster, targets.poster);
  await fs.copyFile(artifacts.captions, targets.captions);

  const entry = {
    id: episode.id,
    title: episode.title,
    channel: 'Kids Learning Fun',
    thumbnail: `/videos/${base}.jpg`,
    duration: formatDuration(artifacts.durationMs),
    category: categoryFor(episode.topic),
    source: 'local',
    src: `/videos/${base}.mp4`,
    captions: `/videos/${base}.vtt`,
    host: episode.hostCharacterId,
    topic: episode.topic,
    ageGroup: episode.ageGroup,
    segmentCount: episode.segments.length,
    generatedAt: new Date().toISOString(),
    scriptProvider: meta.scriptProvider ?? 'unknown',
    bytes: artifacts.bytes,
    frameCount: storyboard.frameCount,
  };

  const index = await loadIndex();
  const at = index.findIndex((e) => e.id === entry.id);
  if (at >= 0) { index[at] = entry; log.detail(`replaced existing entry ${entry.id}`); }
  else index.push(entry);

  await writeJson(INDEX_FILE(), index);
  await fs.writeFile(paths.manifest, renderManifest(index), 'utf8');

  log.ok(`published ${entry.id} → public/videos/`);
  log.detail(`manifest: src/data/generatedVideos.ts (${index.length} episode${index.length === 1 ? '' : 's'})`);
  return entry;
}

/** Rebuild the .ts manifest from the index without generating anything. */
export async function reindex() {
  const index = await loadIndex();
  await fs.writeFile(paths.manifest, renderManifest(index), 'utf8');
  log.ok(`manifest rebuilt from index (${index.length} episodes)`);
  return index;
}
