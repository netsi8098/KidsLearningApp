# Maintenance Mode & Degraded Service Strategy

> How Kids Learning Fun gracefully handles planned downtime, degraded services, and emergency maintenance windows.

---

## Table of Contents

1. [Overview](#overview)
2. [Service Modes](#service-modes)
3. [Activation Methods](#activation-methods)
4. [Backend Middleware](#backend-middleware)
5. [Frontend Fallback Behavior](#frontend-fallback-behavior)
6. [API Response Format](#api-response-format)
7. [Admin Controls](#admin-controls)
8. [Degraded Mode Strategies](#degraded-mode-strategies)
9. [Scheduled Maintenance](#scheduled-maintenance)
10. [Emergency Maintenance](#emergency-maintenance)
11. [Testing Maintenance Mode](#testing-maintenance-mode)
12. [Monitoring During Maintenance](#monitoring-during-maintenance)

---

## Overview

Kids Learning Fun is a PWA used by children and parents. Maintenance windows must be handled with extra care:

- **Children** will see a friendly, non-scary maintenance message
- **PWA offline mode** continues to work with cached content during API maintenance
- **IndexedDB data** is always preserved across maintenance windows
- **Admin operators** can still access system endpoints to monitor and control
- **Content that is already cached** remains available for offline use

---

## Service Modes

| Mode | API Behavior | Frontend Behavior | Worker Behavior | Trigger |
|---|---|---|---|---|
| **Normal** | All endpoints active | Full functionality | Processing all queues | Default state |
| **Full Maintenance** | All API returns 503 (except health/system) | Maintenance page + offline mode | Stopped | Env var, feature flag, or admin toggle |
| **API Degraded** | Non-critical endpoints return 503, core endpoints work | Reduced functionality with graceful fallbacks | Processing critical queues only | Feature flag per service |
| **Worker Paused** | All API endpoints active | Full functionality | Workers stopped, queue grows | Worker service scaled to 0 |
| **Search Unavailable** | Search returns 503, everything else works | Search disabled, browse still works | Search indexing paused | Feature flag `degraded.search` |
| **Sync Unavailable** | Sync endpoints return 503, offline mode continues | Offline queue grows, syncs when restored | Sync workers paused | Feature flag `degraded.sync` |
| **Read-Only** | GET requests work, POST/PUT/DELETE return 503 | Can view content, cannot modify | Workers paused | Feature flag `read_only_mode` |
| **Content Freeze** | Content CRUD returns 503, everything else works | Content browsing works, creation disabled | Content workers paused | Feature flag `content_freeze` |

---

## Activation Methods

### Method 1: Environment Variable (Startup)

Set `ENABLE_MAINTENANCE_MODE=true` in the environment before starting the API server.

```bash
# Enable via environment
ENABLE_MAINTENANCE_MODE=true npm start

# Or via docker-compose override
# docker-compose.override.yml:
# services:
#   api:
#     environment:
#       - ENABLE_MAINTENANCE_MODE=true
```

**When to use**: Planned maintenance where you control the deployment.

### Method 2: Runtime Toggle (API Endpoint)

Toggle maintenance mode without redeploying via the system API.

```bash
# Enable maintenance mode
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.kidslearningfun.app/api/system/maintenance \
  -d '{
    "enabled": true,
    "reason": "Database migration in progress",
    "estimatedEnd": "2026-03-26T15:00:00Z"
  }'

# Disable maintenance mode
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.kidslearningfun.app/api/system/maintenance \
  -d '{ "enabled": false }'

# Check maintenance status
curl https://api.kidslearningfun.app/api/system/maintenance
```

**When to use**: Emergency situations, or when you need to toggle without a deploy.

### Method 3: Feature Flag (Database)

Create a feature flag `maintenance_mode` in the feature flags system. The middleware will check this flag periodically (every 30 seconds) and activate maintenance mode when the flag is enabled.

```bash
# Create the maintenance mode feature flag
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.kidslearningfun.app/api/feature-flags \
  -d '{
    "key": "maintenance_mode",
    "name": "Maintenance Mode",
    "description": "Enables full maintenance mode across all API endpoints",
    "enabled": false
  }'

# Toggle on
curl -X PATCH \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.kidslearningfun.app/api/feature-flags/maintenance_mode \
  -d '{ "enabled": true }'
```

**When to use**: Scheduled maintenance managed via admin UI.

### Method 4: Admin Dashboard UI

The admin dashboard provides a maintenance mode control panel:
1. Navigate to **System > Maintenance Mode**
2. Toggle the switch to enable/disable
3. Set a reason message and estimated end time
4. Click **Activate** (requires confirmation)

**When to use**: Non-emergency planned maintenance by operations team.

---

## Backend Middleware

The maintenance mode middleware is located at `backend/src/middleware/maintenanceMode.ts`.

### Registration

The middleware should be registered after the health check endpoint but before API route handlers:

```typescript
// In backend/src/index.ts

// Health check (always available, even during maintenance)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Maintenance mode check (before all API routes)
import { maintenanceMode } from './middleware/maintenanceMode.js';
app.use(maintenanceMode);

// API routes (these will return 503 during maintenance)
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
// ...
```

### Allowed Paths During Maintenance

The following paths are always accessible, even during full maintenance:

| Path | Reason |
|---|---|
| `/health` | Load balancer health checks, monitoring |
| `/api/system/*` | Operator monitoring and control |
| `/api/auth/login` | Allow admin login to manage maintenance |

### Response Format

During maintenance, non-allowed endpoints return:

```json
HTTP/1.1 503 Service Unavailable
Retry-After: 1800
Content-Type: application/json

{
  "error": {
    "code": "MAINTENANCE",
    "message": "Service is under maintenance. Please try again later."
  },
  "retryAfter": "2026-03-26T15:00:00Z",
  "maintenance": {
    "startedAt": "2026-03-26T14:00:00Z",
    "estimatedEnd": "2026-03-26T15:00:00Z"
  }
}
```

---

## Frontend Fallback Behavior

### PWA Maintenance Page

When the frontend detects a 503 response with code `MAINTENANCE`:

1. Display a kid-friendly maintenance page (not scary, not confusing)
2. Show the estimated return time in simple language ("We'll be back soon!")
3. Continue allowing access to offline-cached content via IndexedDB
4. Periodically poll the health endpoint to detect when maintenance ends
5. Automatically redirect back to the app when the API is available

### Maintenance Page Design

```
+----------------------------------------------+
|                                               |
|     [Mascot waving with hard hat]             |
|                                               |
|     "We're making things even better!"        |
|                                               |
|     We'll be back soon.                       |
|     You can still play with your saved         |
|     activities while you wait!                 |
|                                               |
|     [Continue Offline]  [Check Again]          |
|                                               |
+----------------------------------------------+
```

### PWA Offline Continuity

During API maintenance, the PWA continues to function in offline mode:

- **Content browsing**: All cached content pages remain available
- **Activities**: Interactive activities work (they use local computation)
- **Progress tracking**: Progress saves to IndexedDB, syncs when API returns
- **Settings**: All user preferences preserved in IndexedDB
- **Videos**: Only cached videos available (YouTube embeds will fail)

### Service Worker Behavior

The service worker handles maintenance gracefully:

```
Request flow during maintenance:
1. App makes API request
2. API returns 503 with MAINTENANCE code
3. Service worker intercepts 503
4. If cached response exists: serve from cache
5. If no cache: forward 503 to app
6. App shows maintenance UI for uncacheable requests
```

---

## API Response Format

### Full Maintenance (503)

```json
{
  "error": {
    "code": "MAINTENANCE",
    "message": "Service is under maintenance. Please try again later."
  },
  "retryAfter": "2026-03-26T15:00:00Z"
}
```

### Degraded Feature (503)

```json
{
  "error": {
    "code": "FEATURE_UNAVAILABLE",
    "message": "Search is temporarily unavailable. Core functionality remains accessible."
  }
}
```

### Read-Only Mode (503 on writes)

```json
{
  "error": {
    "code": "READ_ONLY",
    "message": "The service is in read-only mode. Write operations are temporarily disabled."
  }
}
```

---

## Admin Controls

### System Maintenance Endpoint

```
POST /api/system/maintenance
Authorization: Bearer <admin-token>

Body:
{
  "enabled": boolean,
  "reason": string (optional),
  "estimatedEnd": string (optional, ISO 8601)
}

Response:
{
  "maintenance": {
    "enabled": true,
    "reason": "Database migration in progress",
    "estimatedEnd": "2026-03-26T15:00:00Z",
    "startedAt": "2026-03-26T14:00:00Z",
    "startedBy": "admin@example.com"
  }
}
```

### Check Maintenance Status

```
GET /api/system/maintenance

Response:
{
  "enabled": false,
  "allowedPaths": ["/health", "/api/system", ...]
}
```

---

## Degraded Mode Strategies

### Search Unavailable

**Trigger**: Feature flag `degraded.search` enabled, or search service/index down.

| Feature | Behavior |
|---|---|
| Search bar | Shows "Search is temporarily unavailable" |
| Browse by category | Works normally (database queries, not search index) |
| Content detail pages | Work normally |
| Admin search | Disabled with notice |

### Sync Unavailable

**Trigger**: Feature flag `degraded.sync` enabled, or sync service overloaded.

| Feature | Behavior |
|---|---|
| Content viewing | Works (from cache) |
| Progress tracking | Saves to IndexedDB, queues for later sync |
| New content | Not available until sync restored |
| Offline packs | Download disabled |

### Media Processing Unavailable

**Trigger**: Worker media queue backed up or S3 unavailable.

| Feature | Behavior |
|---|---|
| Existing content | Works (media already processed and cached) |
| New uploads | Return 503 with message |
| Admin uploads | Queued, processed when workers recover |
| Thumbnails | Serve originals as fallback |

---

## Scheduled Maintenance

### Pre-Maintenance Checklist

- [ ] Maintenance window communicated to team (48 hours ahead)
- [ ] Estimated duration and scope documented
- [ ] Rollback plan prepared
- [ ] On-call engineer assigned
- [ ] Admin dashboard access verified
- [ ] Maintenance reason and ETA configured

### Maintenance Sequence

```
T-60 min:  Notify team in #ops channel
T-30 min:  Final pre-maintenance health check
T-10 min:  Warn any active admin users
T-0:       Enable maintenance mode
            - Set reason: "Scheduled maintenance: [description]"
            - Set estimatedEnd: T+[duration]
T+work:    Perform maintenance tasks
T+verify:  Run smoke tests against API
T+done:    Disable maintenance mode
T+5 min:   Verify all services healthy
T+15 min:  Post-maintenance health check
T+30 min:  All-clear notification
```

### Post-Maintenance Checklist

- [ ] Maintenance mode disabled
- [ ] All API endpoints responding
- [ ] Error rates at baseline
- [ ] Worker queues processing (backlog draining)
- [ ] Sync endpoints functional
- [ ] Frontend loads without errors
- [ ] PWA update cycle triggered (if frontend changed)
- [ ] Team notified: maintenance complete

---

## Emergency Maintenance

For unplanned maintenance (security incident, data issue, cascading failure):

```
1. IMMEDIATE: Enable maintenance mode
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     https://api.kidslearningfun.app/api/system/maintenance \
     -d '{"enabled": true, "reason": "Emergency maintenance in progress"}'

2. Notify team in incident channel

3. Perform emergency work

4. Verify fix

5. Disable maintenance mode
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     https://api.kidslearningfun.app/api/system/maintenance \
     -d '{"enabled": false}'

6. Monitor for 30 minutes

7. Post-incident review within 48 hours
```

---

## Testing Maintenance Mode

### Local Testing

```bash
# Start API in maintenance mode
ENABLE_MAINTENANCE_MODE=true npm run dev

# Verify health check still works
curl http://localhost:4000/health
# Expected: 200 OK

# Verify API returns 503
curl http://localhost:4000/api/content
# Expected: 503 with MAINTENANCE code

# Verify system endpoints work
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/system/info
# Expected: 200 OK
```

### Integration Test

```typescript
describe('maintenanceMode middleware', () => {
  it('returns 503 when maintenance mode is enabled', async () => {
    enableMaintenance({ reason: 'Test maintenance' });
    const res = await request(app).get('/api/content');
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('MAINTENANCE');
    disableMaintenance();
  });

  it('allows health check during maintenance', async () => {
    enableMaintenance();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    disableMaintenance();
  });

  it('allows system endpoints during maintenance', async () => {
    enableMaintenance();
    const res = await request(app)
      .get('/api/system/info')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    disableMaintenance();
  });

  it('sets Retry-After header when estimatedEnd is provided', async () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString();
    enableMaintenance({ estimatedEnd: futureTime });
    const res = await request(app).get('/api/content');
    expect(res.headers['retry-after']).toBeDefined();
    disableMaintenance();
  });
});
```

---

## Monitoring During Maintenance

Even during maintenance, monitoring should continue:

### Always Available Endpoints
- `GET /health` - Basic health check
- `GET /api/system/health` - Detailed health with DB/Redis status
- `GET /api/system/queues` - Queue depths (admin auth required)
- `GET /api/system/info` - System info (admin auth required)
- `GET /api/system/maintenance` - Current maintenance status

### Key Metrics to Watch
- Health endpoint response time (should be < 100ms)
- Queue depth growth rate (acceptable during maintenance)
- Database connection pool usage
- Redis memory usage
- Error log volume (filter out expected 503s)

### Alerting Rules During Maintenance
- **Suppress**: 503 error rate alerts (expected)
- **Keep active**: Health check failures, database connectivity, Redis connectivity
- **Add**: Alert if maintenance exceeds estimated end time by > 30 minutes
