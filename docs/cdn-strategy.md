# CDN and Edge Caching Strategy

Last updated: 2026-03-26

This document defines the caching strategy for all asset types served by the Kids Learning App, covering CloudFront configuration, cache-control headers, invalidation workflows, and fallback behavior.

---

## Architecture Overview

```
[Browser / PWA]
    |
    |-- Static assets (JS/CSS/icons) --> CloudFront (frontend dist)
    |                                        \--> S3 origin (kidslearn-{env}-static)
    |
    |-- Media assets (images/audio)  --> CloudFront (media dist)
    |                                        \--> S3 origin (kidslearn-{env}-assets)
    |
    |-- API requests (/api/*)        --> CloudFront (pass-through, no cache)
    |                                        \--> ALB --> API instances
    |
    |-- Admin panel                  --> CloudFront (admin dist)
                                         \--> S3 origin (kidslearn-{env}-admin)
```

Three CloudFront distributions:
1. **Frontend** (`app.kidslearning.app`) - PWA static files
2. **Media** (`media.kidslearning.app`) - User-uploaded and content media
3. **Admin** (`admin.kidslearning.app`) - CMS admin panel

---

## Cache Strategy by Asset Type

| Asset | Origin | CDN TTL | Browser TTL | Cache-Control Header | Invalidation Strategy |
|-------|--------|---------|-------------|---------------------|----------------------|
| `index.html` | S3/static | 60s | 0 | `no-cache, must-revalidate` | Deploy invalidation (`/index.html`) |
| JS chunks (`*.js`) | S3/static | 365 days | 365 days | `public, max-age=31536000, immutable` | Content-hash in filename |
| CSS chunks (`*.css`) | S3/static | 365 days | 365 days | `public, max-age=31536000, immutable` | Content-hash in filename |
| `sw.js` (service worker) | S3/static | 0 | 0 | `no-store` | Every deploy; browser checks on each navigation |
| `manifest.webmanifest` | S3/static | 60s | 0 | `no-cache, must-revalidate` | Deploy invalidation |
| `workbox-*.js` | S3/static | 365 days | 365 days | `public, max-age=31536000, immutable` | Content-hash in filename |
| App icons (png/svg) | S3/static | 1 day | 1 day | `public, max-age=86400` | Version in path (`/icons/v2/`) |
| `favicon.svg` | S3/static | 1 day | 1 day | `public, max-age=86400` | Deploy invalidation |
| Thumbnails | S3/assets | 7 days | 7 days | `public, max-age=604800` | New storage key on re-upload |
| Content images | S3/assets | 30 days | 7 days | `public, max-age=604800, s-maxage=2592000` | New storage key on re-upload |
| Audio files | S3/assets | 30 days | 7 days | `public, max-age=604800, s-maxage=2592000` | New storage key on re-upload |
| Story illustration assets | S3/assets | 30 days | 7 days | `public, max-age=604800, s-maxage=2592000` | New storage key on re-upload |
| Video poster images | S3/assets | 7 days | 7 days | `public, max-age=604800` | New storage key |
| Offline packs (`.zip`) | S3/assets | 1 day | 1 day | `public, max-age=86400` | Version in filename (`pack-v3.zip`) |
| Admin JS/CSS chunks | S3/admin | 365 days | 365 days | `public, max-age=31536000, immutable` | Content-hash in filename |
| Admin `index.html` | S3/admin | 60s | 0 | `no-cache, must-revalidate` | Deploy invalidation |
| API responses (`/api/*`) | ALB | 0 | 0 | `private, no-store` | N/A (never cached at CDN) |
| API public endpoints (e.g., `/api/health`) | ALB | 10s | 0 | `public, max-age=10` | N/A |
| Signed media URLs | S3/assets | Varies | Varies | Signed URL expiry | URL expiry handles invalidation |

---

## CloudFront Distribution Configuration

### Frontend Distribution (`app.kidslearning.app`)

```yaml
Origins:
  - Id: S3-static
    DomainName: kidslearn-{env}-static.s3.amazonaws.com
    S3OriginConfig:
      OriginAccessIdentity: origin-access-identity/cloudfront/{oai-id}

DefaultCacheBehavior:
  ViewerProtocolPolicy: redirect-to-https
  AllowedMethods: [GET, HEAD, OPTIONS]
  CachedMethods: [GET, HEAD]
  Compress: true
  CachePolicyId: # Custom policy (see below)
  ResponseHeadersPolicyId: # Security headers policy

CacheBehaviors:
  # Immutable hashed assets (JS/CSS/workbox)
  - PathPattern: "/assets/*"
    CachePolicyId: Immutable-365d
    Compress: true

  # Service worker - never cache
  - PathPattern: "/sw.js"
    CachePolicyId: NoCache
    Compress: true

  # Manifest
  - PathPattern: "/manifest.webmanifest"
    CachePolicyId: ShortCache-60s
    Compress: true

  # Icons
  - PathPattern: "/icons/*"
    CachePolicyId: MediumCache-1d

HttpVersion: http2and3
PriceClass: PriceClass_All  # (PriceClass_100 for staging)
ViewerCertificate:
  AcmCertificateArn: arn:aws:acm:us-east-1:{account}:certificate/{cert-id}
  SslSupportMethod: sni-only
  MinimumProtocolVersion: TLSv1.2_2021

CustomErrorResponses:
  # SPA fallback: serve index.html for 404s
  - ErrorCode: 404
    ResponseCode: 200
    ResponsePagePath: /index.html
    ErrorCachingMinTTL: 60
  # Maintenance page for 503
  - ErrorCode: 503
    ResponseCode: 503
    ResponsePagePath: /maintenance.html
    ErrorCachingMinTTL: 10
```

### Media Distribution (`media.kidslearning.app`)

```yaml
Origins:
  - Id: S3-assets
    DomainName: kidslearn-{env}-assets.s3.amazonaws.com
    S3OriginConfig:
      OriginAccessIdentity: origin-access-identity/cloudfront/{oai-id}

DefaultCacheBehavior:
  ViewerProtocolPolicy: redirect-to-https
  Compress: true
  CachePolicyId: MediaCache-7d

CacheBehaviors:
  # Thumbnails (shorter cache, frequently regenerated)
  - PathPattern: "/thumbs/*"
    CachePolicyId: MediaCache-7d

  # Audio (longer CDN cache)
  - PathPattern: "/audio/*"
    CachePolicyId: LongCache-30d

  # Offline packs (version in filename)
  - PathPattern: "/packs/*"
    CachePolicyId: MediumCache-1d

  # Signed premium content
  - PathPattern: "/premium/*"
    TrustedSigners: [self]
    CachePolicyId: SignedMediaCache-7d
```

### Cache Policy Definitions

| Policy Name | Min TTL | Default TTL | Max TTL | Use Case |
|------------|---------|-------------|---------|----------|
| `NoCache` | 0 | 0 | 0 | `sw.js`, API pass-through |
| `ShortCache-60s` | 0 | 60 | 300 | `index.html`, manifest |
| `MediumCache-1d` | 0 | 86400 | 86400 | Icons, offline packs |
| `MediaCache-7d` | 0 | 604800 | 604800 | Thumbnails, images |
| `LongCache-30d` | 0 | 2592000 | 2592000 | Audio, illustrations |
| `Immutable-365d` | 31536000 | 31536000 | 31536000 | Hashed JS/CSS chunks |
| `SignedMediaCache-7d` | 0 | 604800 | 604800 | Premium signed content |

---

## Compression

All text-based assets are compressed at the CDN edge:

| Content Type | Compression | Notes |
|-------------|-------------|-------|
| `text/html` | Brotli > Gzip | index.html, error pages |
| `application/javascript` | Brotli > Gzip | JS bundles |
| `text/css` | Brotli > Gzip | CSS bundles |
| `application/json` | Brotli > Gzip | API responses, manifest |
| `image/svg+xml` | Brotli > Gzip | SVG icons |
| `image/png` | None | Already compressed |
| `image/webp` | None | Already compressed |
| `audio/mpeg` | None | Already compressed |
| `audio/ogg` | None | Already compressed |
| `application/zip` | None | Already compressed |

CloudFront automatically negotiates `Accept-Encoding` (br > gzip > identity).

---

## Signed URLs for Premium Content

Premium media assets (audio stories, exclusive illustrations) are served via CloudFront signed URLs to prevent unauthorized access.

### Flow

1. Parent app requests content playback via API
2. API checks entitlement for the household
3. If entitled, API generates a CloudFront signed URL with 2-hour expiry
4. Signed URL returned to client
5. Client fetches media directly from CDN using signed URL
6. Service worker caches the response (for offline playback during the session)

### Configuration

```typescript
// Backend: generate signed URL
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

function signMediaUrl(storageKey: string): string {
  return getSignedUrl({
    url: `https://media.kidslearning.app/premium/${storageKey}`,
    keyPairId: process.env.CF_KEY_PAIR_ID!,
    privateKey: process.env.CF_PRIVATE_KEY!,
    dateLessThan: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
  });
}
```

### Signed URL Cache Behavior
- CDN caches the response keyed on the full URL (including signature)
- Different signed URLs for the same asset create separate cache entries
- This is acceptable because premium media has high CDN TTL and low churn

---

## Invalidation Workflow

### 1. Frontend Deploy (CI/CD)

```bash
# After S3 sync of new build
aws cloudfront create-invalidation \
  --distribution-id $CF_FRONTEND_DIST \
  --paths "/index.html" "/manifest.webmanifest" "/sw.js"
```

- Hashed JS/CSS chunks do NOT need invalidation (new filenames)
- Only invalidate the entry points that reference new chunk filenames
- Cost: free (first 1000 paths/month)

### 2. Admin Panel Deploy

```bash
aws cloudfront create-invalidation \
  --distribution-id $CF_ADMIN_DIST \
  --paths "/index.html"
```

### 3. New Content Published

When content is published and has new media assets:

```typescript
// Backend: after content publish
async function invalidateContentMedia(storageKeys: string[]) {
  const paths = storageKeys.map(key => `/${key}`);
  await cloudfront.createInvalidation({
    DistributionId: process.env.CF_MEDIA_DIST!,
    InvalidationBatch: {
      CallerReference: `content-${Date.now()}`,
      Paths: { Quantity: paths.length, Items: paths },
    },
  });
}
```

### 4. Offline Pack Updated

No invalidation needed. Offline packs use versioned filenames:
- `packs/starter-pack-v1.zip`
- `packs/starter-pack-v2.zip`

The API returns the current version URL. Old versions are cleaned up by S3 lifecycle.

### 5. Emergency Wildcard Invalidation

```bash
# Use sparingly - costs $0.005 per path after first 1000/month
aws cloudfront create-invalidation \
  --distribution-id $CF_FRONTEND_DIST \
  --paths "/*"
```

Only use for:
- Security patches (compromised asset)
- Critical bug in cached HTML
- Corrupted service worker

---

## Fallback Handling

### CDN Cache Miss + Origin 5xx

CloudFront custom error caching serves stale content when the origin is down:

```yaml
CustomErrorResponses:
  - ErrorCode: 502
    ErrorCachingMinTTL: 30  # Serve stale for 30s, then retry origin
  - ErrorCode: 503
    ResponseCode: 503
    ResponsePagePath: /maintenance.html
    ErrorCachingMinTTL: 10
  - ErrorCode: 504
    ErrorCachingMinTTL: 10
```

### Asset 404

- **Frontend**: PWA service worker intercepts and serves cached fallback
- **Media**: Returns a placeholder image/audio (configured per content type)
- **API**: Returns standard JSON error `{ error: "Not found" }`

### Service Worker Fallback Chain

```
1. Try network (with timeout)
2. If network fails, try service worker cache
3. If cache misses, try IndexedDB (Dexie offline data)
4. If all fail, show offline fallback page
```

### Admin Panel Fallback

- If CDN or API is unavailable, show "Unable to load. Please refresh or try again later." with a retry button
- No offline mode for admin (requires real-time data)

---

## Security Headers

Applied via CloudFront Response Headers Policy on all distributions:

```yaml
SecurityHeaders:
  StrictTransportSecurity:
    AccessControlMaxAgeSec: 63072000  # 2 years
    IncludeSubdomains: true
    Preload: true
  ContentTypeOptions:
    Override: true  # X-Content-Type-Options: nosniff
  FrameOptions:
    FrameOption: DENY
  XSSProtection:
    ModeBlock: true
    Override: true
  ReferrerPolicy:
    ReferrerPolicy: strict-origin-when-cross-origin
  ContentSecurityPolicy:
    ContentSecurityPolicy: >
      default-src 'self';
      script-src 'self';
      style-src 'self' 'unsafe-inline';
      img-src 'self' https://media.kidslearning.app data:;
      media-src 'self' https://media.kidslearning.app;
      connect-src 'self' https://api.kidslearning.app;
      frame-src https://www.youtube-nocookie.com;
      font-src 'self';
```

---

## Monitoring

### Key Metrics to Track

| Metric | Source | Alert Threshold |
|--------|--------|----------------|
| Cache hit ratio | CloudFront metrics | < 85% (frontend), < 90% (media) |
| Origin latency (p95) | CloudFront metrics | > 2000ms |
| 4xx error rate | CloudFront metrics | > 5% |
| 5xx error rate | CloudFront metrics | > 1% |
| Invalidation count/day | CloudWatch | > 20 (unexpected churn) |
| Total bytes transferred | CloudFront metrics | Budget monitoring |
| Compression ratio | CloudFront + S3 | < 60% savings = investigate |

### CloudWatch Alarms

```yaml
Alarms:
  - Name: CDN-High-5xx-Rate
    Metric: 5xxErrorRate
    Threshold: 1
    Period: 300
    EvaluationPeriods: 2
    Action: SNS notification

  - Name: CDN-Low-Cache-Hit
    Metric: CacheHitRate
    Threshold: 80
    ComparisonOperator: LessThanThreshold
    Period: 3600
    Action: SNS notification

  - Name: CDN-High-Origin-Latency
    Metric: OriginLatency
    Statistic: p95
    Threshold: 3000
    Period: 300
    Action: SNS notification
```

---

## Cost Optimization

1. **Use content-hash filenames**: Eliminates need for invalidation on deploy (free)
2. **Compress everything text-based**: Brotli reduces transfer by 15-25% vs gzip alone
3. **Long TTLs for immutable assets**: Reduces origin requests by 99%+
4. **Regional price class for staging**: `PriceClass_100` (cheapest edge locations)
5. **S3 lifecycle rules**: Auto-delete old asset versions after 90 days
6. **Reserved capacity**: Consider CloudFront Security Savings Bundle for production
7. **Origin Shield**: Enable for media distribution to reduce origin load

---

## PWA + CDN Interaction

The service worker (Workbox) and CloudFront work together:

| Request Type | Workbox Strategy | CDN Behavior |
|-------------|-----------------|-------------|
| App shell (`index.html`) | StaleWhileRevalidate | Short TTL (60s) |
| JS/CSS chunks | CacheFirst | Immutable (365d) |
| API calls | NetworkFirst (5s timeout) | Pass-through (no cache) |
| Media images | CacheFirst | Long TTL (7-30d) |
| Audio files | CacheFirst | Long TTL (30d) |
| Fonts | CacheFirst | Long TTL (365d) |

### Precache Manifest

Vite + `vite-plugin-pwa` generates the precache manifest at build time. Currently ~97 entries, ~1290KB total. The service worker precaches these on install, so they are available offline immediately.

### Update Flow

1. New deploy uploads hashed chunks to S3
2. CloudFront invalidation clears `index.html` and `sw.js`
3. Browser fetches new `sw.js` on next navigation
4. New service worker installs, precaches new chunks
5. On next navigation, new service worker activates
6. Old cached chunks are cleaned up by Workbox
