// ============================================================
// Service Worker Update Manager
// ============================================================
// Hooks into vite-plugin-pwa's update lifecycle to provide
// callbacks for UI notification when a new version is available.
//
// Usage:
//   import { registerSWUpdate } from './sw-update';
//
//   registerSWUpdate({
//     onNeedRefresh: () => setShowUpdateBanner(true),
//     onOfflineReady: () => console.log('App ready for offline use'),
//   });
// ============================================================

/**
 * Options for the SW update registration.
 */
export interface SWUpdateOptions {
  /**
   * Called when a new service worker has been installed and is waiting
   * to activate. The UI should show an update prompt to the user.
   */
  onNeedRefresh: () => void;

  /**
   * Called when the service worker has successfully precached all assets
   * and the app is ready to work offline.
   */
  onOfflineReady: () => void;
}

/** Handle returned by registerSWUpdate for imperative control. */
export interface SWUpdateHandle {
  /**
   * Accept the pending update: tells the waiting service worker to
   * skipWaiting and then reloads the page to activate the new version.
   */
  acceptUpdate: () => Promise<void>;

  /**
   * Dismiss the update prompt. The update will be applied automatically
   * on the next full app launch (cold start).
   */
  dismissUpdate: () => void;

  /**
   * Force-check for a service worker update right now, regardless of
   * the browser's 24-hour check interval.
   */
  checkForUpdate: () => Promise<void>;
}

// ── Internal state ──────────────────────────────────────────

let registration: ServiceWorkerRegistration | null = null;
let waitingWorker: ServiceWorker | null = null;
let refreshCallback: (() => void) | null = null;

// ── Public API ──────────────────────────────────────────────

/**
 * Register for service worker update notifications.
 *
 * This function works with vite-plugin-pwa's `registerType: 'autoUpdate'`
 * configuration. It detects when a new service worker is waiting and
 * provides callbacks so the UI can notify the user.
 *
 * Call this once during app initialization (e.g., in main.tsx or App.tsx).
 */
export function registerSWUpdate(options: SWUpdateOptions): SWUpdateHandle {
  const { onNeedRefresh, onOfflineReady } = options;
  refreshCallback = onNeedRefresh;

  // Only register if service workers are supported
  if (!('serviceWorker' in navigator)) {
    return createNoopHandle();
  }

  // Listen for the vite-plugin-pwa registration
  initServiceWorkerListener(onNeedRefresh, onOfflineReady);

  return {
    acceptUpdate,
    dismissUpdate,
    checkForUpdate,
  };
}

// ── Core Logic ──────────────────────────────────────────────

async function initServiceWorkerListener(
  onNeedRefresh: () => void,
  onOfflineReady: () => void,
): Promise<void> {
  try {
    // Wait for the existing registration (vite-plugin-pwa registers it)
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      // No SW registered yet; wait for the first registration
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // First install: the app is now offline-ready
        onOfflineReady();
      });
      return;
    }

    registration = reg;

    // Case 1: A new SW is already waiting (e.g., user reopened a stale tab)
    if (reg.waiting) {
      waitingWorker = reg.waiting;
      onNeedRefresh();
      return;
    }

    // Case 2: A new SW is currently installing
    if (reg.installing) {
      trackInstallingWorker(reg.installing, onNeedRefresh, onOfflineReady);
      return;
    }

    // Case 3: Listen for future updates
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (newWorker) {
        trackInstallingWorker(newWorker, onNeedRefresh, onOfflineReady);
      }
    });

    // If there's already an active SW controlling this page, we're offline-ready
    if (reg.active && navigator.serviceWorker.controller) {
      onOfflineReady();
    }
  } catch (err) {
    console.warn('[sw-update] Failed to initialize SW listener:', err);
  }
}

/**
 * Track an installing service worker and fire the appropriate callback
 * when it transitions to 'installed' (waiting) or 'activated'.
 */
function trackInstallingWorker(
  worker: ServiceWorker,
  onNeedRefresh: () => void,
  onOfflineReady: () => void,
): void {
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed') {
      if (navigator.serviceWorker.controller) {
        // There's an existing SW controlling the page, so this is an UPDATE.
        // The new SW is now waiting to activate.
        waitingWorker = worker;
        onNeedRefresh();
      } else {
        // No existing controller -- this is the FIRST install.
        // The app is now cached and ready for offline use.
        onOfflineReady();
      }
    }
  });
}

/**
 * Tell the waiting service worker to skip waiting and take control.
 * Then reload the page so the new version is fully active.
 */
async function acceptUpdate(): Promise<void> {
  if (!waitingWorker) {
    // No waiting worker; try a force update check instead
    await checkForUpdate();
    return;
  }

  // Tell the waiting SW to activate
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });

  // Listen for the new SW to take control, then reload
  return new Promise<void>((resolve) => {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
      resolve();
    }, { once: true });

    // Safety timeout: if controllerchange doesn't fire within 3s, reload anyway
    setTimeout(() => {
      window.location.reload();
      resolve();
    }, 3000);
  });
}

/**
 * Dismiss the update banner. The update will apply automatically on
 * the next cold start because vite-plugin-pwa's autoUpdate mode
 * calls skipWaiting() during the install phase.
 */
function dismissUpdate(): void {
  // No action needed -- the waiting SW will activate on next navigation
  // or when all tabs are closed and reopened.
  waitingWorker = null;
  refreshCallback = null;
}

/**
 * Manually trigger a service worker update check.
 * Useful for "Check for updates" buttons in settings.
 */
async function checkForUpdate(): Promise<void> {
  if (!registration) {
    registration = (await navigator.serviceWorker.getRegistration()) ?? null;
  }

  if (registration) {
    try {
      await registration.update();
    } catch (err) {
      console.warn('[sw-update] Update check failed:', err);
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────

function createNoopHandle(): SWUpdateHandle {
  return {
    acceptUpdate: async () => {},
    dismissUpdate: () => {},
    checkForUpdate: async () => {},
  };
}

// ── Chunk Load Error Recovery ───────────────────────────────

/**
 * Detect and recover from stale chunk errors (e.g., after a deploy
 * when old chunk filenames are no longer on the server).
 *
 * Call this in your ErrorBoundary's componentDidCatch or in a global
 * error handler.
 */
export function handleChunkLoadError(error: Error): boolean {
  const isChunkError =
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Loading CSS chunk') ||
    error.message.includes('error loading dynamically imported module');

  if (!isChunkError) {
    return false; // Not a chunk error, let normal error handling proceed
  }

  console.warn('[sw-update] Chunk load error detected. Attempting recovery...');

  // Force a SW update check and reload
  navigator.serviceWorker
    .getRegistration()
    .then((reg) => reg?.update())
    .then(() => {
      // Small delay to let the new SW install
      setTimeout(() => window.location.reload(), 500);
    })
    .catch(() => {
      // If SW update fails, just reload (will get fresh index.html)
      window.location.reload();
    });

  return true; // Error was handled
}

// ── Force Clean Update (Nuclear Option) ─────────────────────

/**
 * Clear ALL service worker caches and unregister the SW.
 * Use only as a last resort when the app is in a broken state.
 *
 * This can be triggered from a hidden "reset" option in parent settings.
 */
export async function forceCleanUpdate(): Promise<void> {
  console.warn('[sw-update] Force clean update: clearing all caches and SW');

  // Delete all Cache Storage entries
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));

  // Unregister all service workers
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((r) => r.unregister()));

  // Reload to fetch everything fresh from network
  window.location.reload();
}
