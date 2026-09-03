/**
 * Stage: render.
 *
 * Drives scene/scene.html in headless Chromium and captures one image per
 * frame. Frames are pulled by seeking the scene to an exact timestamp
 * (`renderFrame(t)`) rather than letting it animate in real time, so capture
 * speed never affects the result and a re-run is byte-comparable.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { paths } from '../config.mjs';
import { log, ensureDir } from '../lib/util.mjs';

/** JPEG keeps disk and encode time down; 95 is visually lossless here. */
const JPEG_QUALITY = 95;

export async function renderFrames(storyboard, framesDir, { concurrency = 3 } = {}) {
  const { chromium } = await import('playwright');

  await fs.rm(framesDir, { recursive: true, force: true });
  await ensureDir(framesDir);

  const { fps, frameCount, width, height } = storyboard;
  const frameMs = 1000 / fps;
  log.info(`${frameCount} frames at ${fps}fps (${width}×${height})`);

  const browser = await chromium.launch({
    args: ['--force-color-profile=srgb', '--disable-lcd-text', '--hide-scrollbars'],
  });

  // Frames are independent, so several pages can capture in parallel. Each
  // page loads its own copy of the storyboard and renders a strided subset.
  const workers = Math.max(1, Math.min(concurrency, 6));
  const sceneUrl = pathToFileURL(paths.scene).href;
  const started = Date.now();
  let done = 0;

  async function makePage() {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await page.goto(sceneUrl, { waitUntil: 'load' });
    await page.waitForFunction(() => window.sceneReady === true, { timeout: 15_000 });
    const info = await page.evaluate((sb) => window.loadStoryboard(sb), storyboard);
    if (info.frames !== frameCount) {
      log.warn(`scene reports ${info.frames} frames, pipeline expects ${frameCount}`);
    }
    return page;
  }

  const pages = await Promise.all(Array.from({ length: workers }, makePage));

  await Promise.all(pages.map(async (page, w) => {
    for (let i = w; i < frameCount; i += workers) {
      const t = i * frameMs;
      await page.evaluate((ms) => window.renderFrame(ms), t);
      await page.screenshot({
        path: path.join(framesDir, `f${String(i).padStart(6, '0')}.jpg`),
        type: 'jpeg',
        quality: JPEG_QUALITY,
      });
      done += 1;
      if (done % 120 === 0 || done === frameCount) {
        const pct = ((done / frameCount) * 100).toFixed(0);
        const rate = done / ((Date.now() - started) / 1000);
        log.detail(`${done}/${frameCount} frames (${pct}%) · ${rate.toFixed(1)} fps capture`);
      }
    }
  }));

  await browser.close();

  const written = (await fs.readdir(framesDir)).filter((f) => f.endsWith('.jpg')).length;
  if (written !== frameCount) {
    throw new Error(`expected ${frameCount} frames, found ${written} in ${framesDir}`);
  }

  const secs = (Date.now() - started) / 1000;
  log.ok(`rendered ${written} frames in ${secs.toFixed(1)}s (${(written / secs).toFixed(1)} fps)`);
  return framesDir;
}

/** Capture a single frame — used by `--preview` to check the look fast. */
export async function renderSingleFrame(storyboard, atMs, outFile) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: storyboard.width, height: storyboard.height },
    deviceScaleFactor: 1,
  });
  await page.goto(pathToFileURL(paths.scene).href, { waitUntil: 'load' });
  await page.waitForFunction(() => window.sceneReady === true, { timeout: 15_000 });
  await page.evaluate((sb) => window.loadStoryboard(sb), storyboard);
  await page.evaluate((ms) => window.renderFrame(ms), atMs);
  await ensureDir(path.dirname(outFile));
  await page.screenshot({ path: outFile, type: 'png' });
  await browser.close();
  return outFile;
}
