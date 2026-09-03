/**
 * Stage: mux.
 *
 * Assembles the narration into one gapless track positioned to the storyboard,
 * encodes the captured frames, and writes the deliverables: mp4, poster, VTT.
 *
 * Audio placement uses `adelay` per line rather than concatenating with
 * silence, because the storyboard already knows each line's absolute start —
 * mixing to a fixed timeline keeps picture and voice locked even if a line's
 * measured duration and its shot length differ slightly.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { log, run, ensureDir, vttTime, formatDuration } from '../lib/util.mjs';

/** Build one audio track with each line delayed to its absolute start. */
async function buildAudioTrack(storyboard, outFile) {
  const shots = storyboard.shots.filter((s) => s.audio);
  if (shots.length === 0) throw new Error('storyboard has no audio');

  const args = [];
  for (const s of shots) args.push('-i', s.audio);

  // Delay each input to its shot start, pad all to the full duration, then mix.
  const totalMs = storyboard.totalMs;
  const filters = shots
    .map((s, i) => `[${i}:a]adelay=${Math.round(s.startMs)}|${Math.round(s.startMs)},apad[a${i}]`)
    .join(';');
  const mixInputs = shots.map((_, i) => `[a${i}]`).join('');
  const graph = `${filters};${mixInputs}amix=inputs=${shots.length}:normalize=0:dropout_transition=0[mixed];`
    + `[mixed]atrim=0:${(totalMs / 1000).toFixed(3)},asetpts=N/SR/TB,`
    // Gentle limiter so overlapping tails never clip in kids' headphones.
    + `alimiter=limit=0.95,aresample=48000[out]`;

  await run('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    ...args,
    '-filter_complex', graph,
    '-map', '[out]',
    '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
    outFile,
  ]);
  return outFile;
}

/** Encode frames + audio into a web-ready mp4. */
async function encodeVideo(storyboard, framesDir, audioFile, outFile) {
  await run('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-framerate', String(storyboard.fps),
    '-i', path.join(framesDir, 'f%06d.jpg'),
    '-i', audioFile,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    // yuv420p + faststart so it plays in every browser and starts streaming
    // before the whole file has downloaded.
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-c:a', 'copy',
    '-shortest',
    outFile,
  ]);
  return outFile;
}

/** Poster frame — taken from the topic reveal so the card looks inviting. */
async function writePoster(storyboard, framesDir, outFile) {
  const reveal = storyboard.shots.find((s) => s.visual.kind === 'reveal')
    ?? storyboard.shots.find((s) => s.visual.kind === 'teach')
    ?? storyboard.shots[0];
  // A second into the shot, once the pop-in has settled.
  const atMs = reveal.startMs + Math.min(1000, (reveal.endMs - reveal.startMs) / 2);
  const frameIndex = Math.min(storyboard.frameCount - 1, Math.round((atMs / 1000) * storyboard.fps));
  const src = path.join(framesDir, `f${String(frameIndex).padStart(6, '0')}.jpg`);
  await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-vf', 'scale=640:-1', outFile]);
  return outFile;
}

/** WebVTT captions from the shot cues. */
export function buildVtt(storyboard) {
  const lines = ['WEBVTT', ''];
  let n = 0;
  for (const shot of storyboard.shots) {
    for (const cue of shot.cues) {
      if (!cue.text?.trim() || cue.endMs <= cue.startMs) continue;
      n += 1;
      lines.push(String(n));
      lines.push(`${vttTime(cue.startMs)} --> ${vttTime(cue.endMs)}`);
      lines.push(cue.text.trim());
      lines.push('');
    }
  }
  return lines.join('\n');
}

/**
 * Produce mp4 + poster + captions into `outDir`.
 * Returns the artifact paths and the measured video duration.
 */
export async function mux(storyboard, framesDir, outDir, baseName) {
  await ensureDir(outDir);
  const audioFile = path.join(outDir, `${baseName}.m4a`);
  const videoFile = path.join(outDir, `${baseName}.mp4`);
  const posterFile = path.join(outDir, `${baseName}.jpg`);
  const vttFile = path.join(outDir, `${baseName}.vtt`);

  log.info('mixing narration onto the timeline');
  await buildAudioTrack(storyboard, audioFile);

  log.info('encoding H.264 mp4');
  await encodeVideo(storyboard, framesDir, audioFile, videoFile);

  await writePoster(storyboard, framesDir, posterFile);
  await fs.writeFile(vttFile, buildVtt(storyboard), 'utf8');
  // The intermediate audio track is not shipped.
  await fs.rm(audioFile, { force: true });

  const stat = await fs.stat(videoFile);
  const probe = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', videoFile,
  ]);
  const durationMs = Math.round(Number.parseFloat(probe) * 1000);

  log.ok(`${path.basename(videoFile)} · ${formatDuration(durationMs)} · ${(stat.size / 1e6).toFixed(1)} MB`);
  return {
    video: videoFile,
    poster: posterFile,
    captions: vttFile,
    durationMs,
    bytes: stat.size,
  };
}
