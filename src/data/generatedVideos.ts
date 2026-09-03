// ─────────────────────────────────────────────────────────────────────────
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
  {
    id: "ep-alphabet-45",
    title: "Letters and Their Sounds",
    channel: "Kids Learning Fun",
    thumbnail: "/videos/ep-alphabet-45.jpg",
    duration: "1:19",
    category: "alphabet",
    source: 'local',
    src: "/videos/ep-alphabet-45.mp4",
    captions: "/videos/ep-alphabet-45.vtt",
    host: "daisy",
    topic: "alphabet",
    ageGroup: "4-5",
    segmentCount: 10,
    generatedAt: "2026-09-03T16:07:12.266Z",
    scriptProvider: "template",
  },
  {
    id: "ep-animals-23",
    title: "Animals and Their Sounds",
    channel: "Kids Learning Fun",
    thumbnail: "/videos/ep-animals-23.jpg",
    duration: "1:19",
    category: "animals",
    source: 'local',
    src: "/videos/ep-animals-23.mp4",
    captions: "/videos/ep-animals-23.vtt",
    host: "finn",
    topic: "animals",
    ageGroup: "2-3",
    segmentCount: 8,
    generatedAt: "2026-09-03T16:02:40.017Z",
    scriptProvider: "template",
  },
  {
    id: "ep-colors-23",
    title: "Colors All Around Us",
    channel: "Kids Learning Fun",
    thumbnail: "/videos/ep-colors-23.jpg",
    duration: "1:02",
    category: "colors-shapes",
    source: 'local',
    src: "/videos/ep-colors-23.mp4",
    captions: "/videos/ep-colors-23.vtt",
    host: "leo",
    topic: "colors",
    ageGroup: "2-3",
    segmentCount: 8,
    generatedAt: "2026-09-03T16:00:28.344Z",
    scriptProvider: "template",
  },
  {
    id: "ep-counting-23",
    title: "Counting Together",
    channel: "Kids Learning Fun",
    thumbnail: "/videos/ep-counting-23.jpg",
    duration: "1:21",
    category: "numbers",
    source: 'local',
    src: "/videos/ep-counting-23.mp4",
    captions: "/videos/ep-counting-23.vtt",
    host: "ollie",
    topic: "counting",
    ageGroup: "2-3",
    segmentCount: 8,
    generatedAt: "2026-09-03T16:05:24.178Z",
    scriptProvider: "template",
  },
  {
    id: "ep-emotions-45",
    title: "How Are You Feeling?",
    channel: "Kids Learning Fun",
    thumbnail: "/videos/ep-emotions-45.jpg",
    duration: "1:23",
    category: "learning",
    source: 'local',
    src: "/videos/ep-emotions-45.mp4",
    captions: "/videos/ep-emotions-45.vtt",
    host: "daisy",
    topic: "emotions",
    ageGroup: "4-5",
    segmentCount: 10,
    generatedAt: "2026-09-03T16:08:23.178Z",
    scriptProvider: "template",
  },
  {
    id: "ep-shapes-45",
    title: "Shapes Everywhere",
    channel: "Kids Learning Fun",
    thumbnail: "/videos/ep-shapes-45.jpg",
    duration: "1:21",
    category: "colors-shapes",
    source: 'local',
    src: "/videos/ep-shapes-45.mp4",
    captions: "/videos/ep-shapes-45.vtt",
    host: "ruby",
    topic: "shapes",
    ageGroup: "4-5",
    segmentCount: 10,
    generatedAt: "2026-09-03T16:01:18.695Z",
    scriptProvider: "template",
  },
];

/** Generated episodes for a given app video category. */
export function getGeneratedByCategory(category: VideoCategory): GeneratedVideo[] {
  return generatedVideos.filter((v) => v.category === category);
}

/** Generated episodes suitable for an age band ('all' always matches). */
export function getGeneratedByAge(ageGroup: string): GeneratedVideo[] {
  return generatedVideos.filter((v) => v.ageGroup === ageGroup || v.ageGroup === 'all');
}
