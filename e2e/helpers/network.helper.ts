import { type Page } from '@playwright/test';

/**
 * Simulate going offline by setting the browser context to offline mode.
 */
export async function goOffline(page: Page) {
  await page.context().setOffline(true);
}

/**
 * Simulate going back online by restoring the browser context to online mode.
 */
export async function goOnline(page: Page) {
  await page.context().setOffline(false);
}

/**
 * Simulate a slow network connection using Chrome DevTools Protocol.
 * Applies 2000ms latency with 50KB/s download and 20KB/s upload.
 *
 * NOTE: This only works with Chromium-based browsers.
 */
export async function simulateSlowNetwork(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 50 * 1024, // 50KB/s
    uploadThroughput: 20 * 1024,   // 20KB/s
    latency: 2000,                 // 2 seconds
  });
}

/**
 * Restore normal network conditions via Chrome DevTools Protocol.
 */
export async function restoreNetwork(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0,
  });
}

/**
 * Block specific request patterns (e.g., API calls, third-party scripts).
 */
export async function blockRequests(page: Page, patterns: string[]) {
  await page.route(
    (url) => patterns.some((p) => url.toString().includes(p)),
    (route) => route.abort(),
  );
}
