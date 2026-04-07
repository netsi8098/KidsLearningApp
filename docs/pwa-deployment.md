# Kids Learning Fun -- PWA Deployment Strategy

> Version 1.0 | Last updated: 2026-03-26

This document covers the Progressive Web App deployment lifecycle, including service
worker update management, asset fingerprinting, cache invalidation, stale manifest
recovery, and version compatibility across the Kids Learning Fun platform.

---

## Table of Contents

1. [Current PWA Configuration](#current-pwa-configuration)
2. [Service Worker Update Flow](#service-worker-update-flow)
3. [Asset Fingerprinting](#asset-fingerprinting)
4. [Cache Strategy Matrix](#cache-strategy-matrix)
5. [Stale Manifest Handling](#stale-manifest-handling)
6. [Version Compatibility](#version-compatibility)
7. [CDN and Nginx Cache Headers](#cdn-and-nginx-cache-headers)
8. [Offline Content Packs](#offline-content-packs)
9. [Deployment Checklist](#deployment-checklist)

---

## Current PWA Configuration

The frontend PWA is built with `vite-plugin-pwa` 1.2.0, configured in `vite.config.ts`:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png', 'sounds/*.mp3'],
  manifest: {
    name: 'Kids Learning Fun',
    short_name: 'KidLearn',
    theme_color: '#FF6B6B',
    background_color: '#FFF8F0',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    scope: '/',
    // icons...
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
  },
})
```

**Key characteristics:**
- `registerType: 'autoUpdate'` -- new service workers activate immediately via
  `skipWaiting()` and `clients.claim()`
- Workbox precaches all JS, CSS, HTML, and static assets
- The generated `sw.js` contains a precache manifest with content hashes
- The generated `registerSW.js` handles registration and auto-update

---

## Service Worker Update Flow

### Standard Lifecycle

```
User opens app
      |
      v
Browser checks for sw.js update (every navigation + every 24h)
      |
      v
Has sw.js changed? ----NO----> Use existing cached version
      |
     YES
      |
      v
Download new sw.js
      |
      v
Install event fires:
  - New SW precaches updated assets
  - Downloads only changed files (by hash comparison)
      |
      v
[autoUpdate mode]: skipWaiting() called immediately
      |
      v
Activate event fires:
  - Old caches cleaned up
  - clients.claim() takes control of all tabs
      |
      v
New version is live on next navigation/fetch
```

### Enhanced Update Flow with User Notification

While `autoUpdate` handles the technical update silently, users benefit from
knowing when new content is available. The enhanced flow adds a notification layer:

```
New SW installed and waiting
      |
      v
sw-update.ts detects 'onNeedRefresh' callback
      |
      v
UpdatePrompt component shows gentle banner:
  "New activities available! Tap to update."
      |
      +-------> User taps "Update"
      |              |
      |              v
      |         Page reloads with new version
      |
      +-------> User dismisses banner
                     |
                     v
                Banner hides, but update applies
                automatically on next app launch
```

**Implementation files:**
- `src/sw-update.ts` -- Hooks into vite-plugin-pwa's update lifecycle
- `src/components/UpdatePrompt.tsx` -- UI notification component

### Update Timing Considerations

For a children's app, updates should be minimally disruptive:

1. **Never interrupt active play**: The update banner appears only on the main menu
   or during navigation between activities, not during an active lesson or game.
2. **Auto-update on cold start**: If the user dismissed the banner, the update
   activates automatically the next time the app is opened fresh.
3. **Background precaching**: New assets download in the background while the child
   continues using the current version.

---

## Asset Fingerprinting

### Vite Content Hashing

Vite automatically adds content hashes to built assets:

```
dist/
  index.html                          <-- No hash (entry point)
  manifest.webmanifest                <-- No hash (must be stable URL)
  sw.js                               <-- No hash (must be stable URL)
  registerSW.js                       <-- No hash (must be stable URL)
  assets/
    index-BfG3k2Lq.js                <-- Content hash in filename
    index-Dw8xPq4r.css               <-- Content hash in filename
    AbcPage-a3Kf9xLm.js              <-- Code-split chunk with hash
    NumbersPage-Pk2mW8vN.js           <-- Code-split chunk with hash
    vendor-Qr7nJ5tB.js               <-- Vendor chunk with hash
  favicon.ico                         <-- Static, no hash
  icon-192.png                        <-- Static, no hash
  icon-512.png                        <-- Static, no hash
```

### Hash Behavior by Asset Type

| Asset Type | Hash in Filename | Cache Behavior | Notes |
|-----------|-----------------|----------------|-------|
| JS chunks | Yes (`-[hash].js`) | Immutable, 1 year | New build = new hash = new URL |
| CSS chunks | Yes (`-[hash].css`) | Immutable, 1 year | Same as JS |
| `index.html` | No | No cache | References hashed chunks |
| `sw.js` | No | No store | Contains precache manifest hashes |
| `registerSW.js` | No | No store | Bootstrap for SW registration |
| `manifest.webmanifest` | No | No cache | May change on version bumps |
| Icons (`.png`, `.ico`) | No | 1 day cache | Rarely change, but must update for rebrand |
| Sounds (`.mp3`) | No | 7 day cache | Change filename on update |

### Ensuring Static Asset Cache Busting

For static assets without content hashes (icons, sounds), use these strategies:

1. **Query string versioning**: Append `?v=2` to asset URLs in the manifest and HTML.
   Example: `<link rel="icon" href="/favicon.ico?v=2">`

2. **Filename versioning for sounds**: When updating a sound effect, change the
   filename rather than overwriting: `celebration-v2.mp3` instead of `celebration.mp3`

3. **Workbox revision**: The Workbox precache manifest includes a `revision` hash
   for assets without content hashes, so the SW correctly invalidates them.

---

## Cache Strategy Matrix

| Asset Type | Cache-Control Header | SW Strategy | TTL | Invalidation Method |
|-----------|---------------------|-------------|-----|-------------------|
| `index.html` | `no-cache, must-revalidate` | Network-first | 0 | Every deploy (CDN invalidation) |
| JS/CSS chunks (`assets/`) | `public, immutable, max-age=31536000` | Cache-first (precache) | 1 year | Hash-based (new filename) |
| Service worker (`sw.js`) | `no-store, no-cache, must-revalidate` | N/A (browser-managed) | 0 | Every deploy (content change) |
| Registration (`registerSW.js`) | `no-store, no-cache, must-revalidate` | N/A | 0 | Every deploy |
| Manifest (`.webmanifest`) | `no-cache, must-revalidate` | N/A | 0 | Every deploy |
| Icons / images | `public, max-age=86400` | Precache (with revision) | 1 day | Workbox revision hash change |
| Audio / sounds | `public, max-age=604800` | Precache (with revision) | 7 days | New filename |
| Offline content packs | Cache API (manual) | Cache-first | Manual eviction | Version-tagged pack ID |
| API responses | `no-store` (default) | Network-only | 0 | Real-time |
| Font files | `public, max-age=31536000` | Precache | 1 year | Filename change |

### Strategy Definitions

- **Cache-first (precache)**: Assets are downloaded during SW install and served
  from cache on subsequent requests. The SW update cycle handles invalidation.

- **Network-first**: Try the network first; fall back to cache if offline. Used for
  HTML so users always get the latest shell.

- **Network-only**: Never cache. Used for API calls to ensure data freshness.

- **Stale-while-revalidate**: Serve from cache immediately, then update cache in
  background. Could be used for non-critical images if desired.

---

## Stale Manifest Handling

### The Problem

When a new version is deployed, the precache manifest in `sw.js` references new
chunk filenames (e.g., `index-NewHash.js`). But a user with a cached old version
may have:

1. An old `index.html` that references `index-OldHash.js`
2. An old SW that has `index-OldHash.js` in its cache
3. The server no longer has `index-OldHash.js` (it was replaced)

### Scenario Analysis

```
Case 1: User opens app, SW auto-updates
  +-----------------------------------------------------------+
  | 1. Browser loads cached index.html (old references)        |
  | 2. Browser fetches sw.js from network (always fresh)       |
  | 3. New sw.js has updated precache manifest                 |
  | 4. SW install: downloads new chunks, deletes old ones      |
  | 5. SW activates: clients.claim() + page reload hint        |
  | 6. Page reloads with new index.html and new chunks         |
  | Result: CLEAN UPDATE                                       |
  +-----------------------------------------------------------+

Case 2: User opens app offline with stale cache
  +-----------------------------------------------------------+
  | 1. Browser loads cached index.html (old references)        |
  | 2. Old SW serves old chunks from cache                     |
  | 3. App works fine with old cached version                  |
  | 4. When online again, SW checks for updates                |
  | 5. Normal update flow resumes                              |
  | Result: WORKS OFFLINE, UPDATES WHEN ONLINE                 |
  +-----------------------------------------------------------+

Case 3: User opens app, SW update partially failed
  +-----------------------------------------------------------+
  | 1. New sw.js downloaded, install begins                    |
  | 2. Some new chunks fail to download (network issue)        |
  | 3. SW install fails, old SW remains active                 |
  | 4. Old chunks still in cache, old index.html works         |
  | 5. Next visit: SW update retried automatically             |
  | Result: SAFE FALLBACK TO OLD VERSION                       |
  +-----------------------------------------------------------+

Case 4: Chunk 404 during navigation (worst case)
  +-----------------------------------------------------------+
  | 1. User is on old cached version                           |
  | 2. User navigates to a code-split route                    |
  | 3. Browser tries to fetch old chunk: 404                   |
  | 4. React.lazy fails, ErrorBoundary catches                 |
  | 5. ErrorBoundary shows "Update needed" message             |
  | 6. Force SW update: registration.update() + reload         |
  | Result: RECOVERED WITH USER ACTION                         |
  +-----------------------------------------------------------+
```

### Recovery Mechanisms

**Automatic recovery (SW level):**
```typescript
// In the service worker (via Workbox config):
// If a precached asset returns 404, Workbox removes it from cache
// and the next SW update will re-fetch it.
```

**Application-level recovery (ErrorBoundary):**
```typescript
// In ErrorBoundary.tsx, detect chunk load failures:
if (error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Loading chunk')) {
  // Force SW update check
  const registration = await navigator.serviceWorker.getRegistration();
  await registration?.update();
  // Reload to get fresh index.html
  window.location.reload();
}
```

**Nuclear option (manual cache clear):**
```typescript
// Last resort: clear all caches and unregister SW
async function forceCleanUpdate() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(r => r.unregister()));
  window.location.reload();
}
```

---

## Version Compatibility

### The Multi-Version Reality

At any given time after a deployment, these versions may coexist:

```
User A: Frontend v5 (just updated) + API v5 (latest)
User B: Frontend v4 (cached, not updated yet) + API v5 (latest)
User C: Frontend v3 (offline for days) + API v5 (latest, when back online)
```

### API Backward Compatibility

The API MUST support the current version and at minimum N-1 (the previous version).

**Rules:**
1. Never remove an API endpoint in the same release that the frontend stops using it
2. New required fields must have server-side defaults for N-1 clients
3. Response shape changes must be additive (new fields only, never remove)
4. If a breaking change is unavoidable, version the endpoint: `/api/v2/content`

**Example -- adding a field:**
```
v1 API response:  { id: 1, title: "ABCs" }
v2 API response:  { id: 1, title: "ABCs", difficulty: "easy" }

v1 Frontend: ignores 'difficulty' field (safe)
v2 Frontend: uses 'difficulty' field (works with v2 API)
```

**Example -- removing a field (requires 2 releases):**
```
Release N:   API still sends 'oldField', frontend stops reading it
Release N+1: API stops sending 'oldField' (safe, no client reads it)
```

### IndexedDB Schema Compatibility

The frontend uses Dexie.js with versioned schema migrations:

```typescript
// In database.ts:
db.version(6).stores({
  // 30 tables defined
});
```

**Dexie migration rules:**
- Incrementing the version triggers Dexie's upgrade mechanism
- Old data is preserved; new tables/indexes are added
- If a user has v5 schema and opens a v6 app, Dexie auto-migrates
- If Dexie migration fails (HMR edge case), user must close and reopen tab
- Never decrement the version number

### Service Worker Version Tracking

To enable version-aware behavior, the SW includes a version identifier:

```typescript
// In vite.config.ts or a custom SW plugin:
// The build injects APP_VERSION into the SW

// In sw-update.ts, the app can check:
// - What version the current SW is running
// - What version the new SW will be
// - Whether a reload is needed
```

### Mixed-Version Safety Checklist

For every release, verify:

- [ ] New API endpoints are deployed BEFORE frontend code that calls them
- [ ] Old API endpoints remain functional for cached frontend versions
- [ ] IndexedDB schema version is incremented if tables/indexes change
- [ ] Job payloads include a `version` field for worker compatibility
- [ ] Feature flags gate new features that depend on API changes

---

## CDN and Nginx Cache Headers

### Nginx Configuration (Current)

The `nginx.conf` in the project root correctly sets cache headers:

```nginx
# Service worker -- MUST never be cached
location = /sw.js {
    expires off;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}

location = /registerSW.js {
    expires off;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}

# Hashed assets -- cache forever
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Manifest
location = /manifest.webmanifest {
    expires 1d;
    add_header Cache-Control "public";
}

# Icons and images
location ~* \.(ico|png|svg|jpg|jpeg|gif|webp)$ {
    expires 30d;
    add_header Cache-Control "public";
}
```

### Recommended CDN Configuration

If using CloudFront, Cloudflare, or similar:

| Path Pattern | CDN TTL | Origin TTL | CDN Behavior |
|-------------|---------|------------|--------------|
| `/sw.js` | 0 | 0 | Always forward to origin |
| `/registerSW.js` | 0 | 0 | Always forward to origin |
| `/index.html` | 0 | 0 | Always forward to origin |
| `/manifest.webmanifest` | 0 | 0 | Always forward to origin |
| `/assets/*` | 365 days | 365 days | Cache, respect immutable |
| `*.ico`, `*.png` | 1 day | 30 days | Cache |
| `*.mp3` | 7 days | 7 days | Cache |

### Post-Deploy CDN Invalidation

After every frontend deployment, invalidate these paths:

```bash
# CloudFront example:
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/index.html" "/sw.js" "/registerSW.js" "/manifest.webmanifest"

# Cloudflare example:
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -d '{"files":["https://kidslearningfun.app/index.html","https://kidslearningfun.app/sw.js","https://kidslearningfun.app/registerSW.js","https://kidslearningfun.app/manifest.webmanifest"]}'
```

Hashed assets (`/assets/*`) do NOT need invalidation because their filenames change.

---

## Offline Content Packs

### Pack Structure

Offline packs are downloadable bundles that let children use content without an
internet connection. They are managed separately from the PWA precache.

```
Pack structure:
  pack-animals-v3/
    manifest.json        <-- Pack metadata, version, content list
    data.json            <-- Content data (stories, quiz questions)
    images/              <-- Associated images
    sounds/              <-- Associated sounds
```

### Pack Cache Management

```typescript
// Packs use the Cache API directly (not Workbox precache)
const PACK_CACHE_NAME = 'offline-packs-v1';

// Download a pack:
async function downloadPack(packId: string, version: number) {
  const cache = await caches.open(PACK_CACHE_NAME);
  const manifest = await fetch(`/api/offline-packs/${packId}/manifest`);
  const assets = await manifest.json();
  await cache.addAll(assets.urls);
}

// Evict old pack version:
async function evictPack(packId: string) {
  const cache = await caches.open(PACK_CACHE_NAME);
  const keys = await cache.keys();
  const packKeys = keys.filter(k => k.url.includes(packId));
  await Promise.all(packKeys.map(k => cache.delete(k)));
}
```

### Pack Versioning

- Each pack has a `version` number in its manifest
- When a new pack version is available, the app shows a download prompt
- Old pack version remains usable until the new one is fully downloaded
- Pack updates are independent of the PWA service worker update cycle

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass (`npm run test:certify`)
- [ ] Build succeeds with no TypeScript errors (`npm run build`)
- [ ] Service worker precache manifest is reasonable size (< 2MB total)
- [ ] No secrets or `.env` values baked into the build
- [ ] Feature flags configured for any new features
- [ ] Database migration tested against staging data copy

### During Deployment

- [ ] CDN invalidation triggered for non-hashed files
- [ ] Health checks passing on new instances
- [ ] Service worker update detected in staging browser test
- [ ] No 404s for chunk files in browser console
- [ ] Offline mode still works (airplane mode test)

### Post-Deployment

- [ ] CDN cache hit ratio recovering to normal (> 80%)
- [ ] No new error patterns in logs
- [ ] Service worker version matches expected in DevTools > Application
- [ ] PWA install still works from browser
- [ ] Core Web Vitals not degraded (check Lighthouse)
- [ ] Old cached versions can still load and auto-update
