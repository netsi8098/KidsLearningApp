# Release Train Model

> How Kids Learning Fun ships code and content to production safely and predictably.

---

## Table of Contents

1. [Version Format](#version-format)
2. [Release Cadence](#release-cadence)
3. [Branch Strategy](#branch-strategy)
4. [Regular Release Flow](#regular-release-flow)
5. [Hotfix Flow](#hotfix-flow)
6. [Content-Only Release](#content-only-release)
7. [Freeze Periods](#freeze-periods)
8. [Go/No-Go Gates](#gono-go-gates)
9. [Rollback Criteria](#rollback-criteria)
10. [Roles & Responsibilities](#roles--responsibilities)
11. [Communication Plan](#communication-plan)

---

## Version Format

| Release Type | Format | Example |
|---|---|---|
| Regular release | `v{major}.{minor}.{patch}` | `v1.3.0` |
| Hotfix | `v{major}.{minor}.{patch}` (patch increment) | `v1.3.1` |
| Release candidate | `v{major}.{minor}.{patch}-rc.{n}` | `v1.3.0-rc.1` |
| Content drop | `content-{YYYY-MM-DD}` | `content-2026-04-01` |
| Major release | `v{major}.0.0` | `v2.0.0` |

We follow [Semantic Versioning](https://semver.org/):
- **Major**: Breaking API changes, database schema overhauls, major UX redesigns
- **Minor**: New features, non-breaking API additions, new content categories
- **Patch**: Bug fixes, performance improvements, copy changes

---

## Release Cadence

### Regular Releases (Biweekly)
- **Schedule**: Every 2 weeks, Tuesday afternoon
- **Cut date**: Monday of release week (release branch cut from `develop`)
- **Deploy date**: Tuesday 2:00 PM (after go/no-go meeting at 1:30 PM)
- **Monitoring window**: Tuesday 2:00 PM - Wednesday 12:00 PM

### Content Drops
- **Schedule**: Any business day, independent of code releases
- **Process**: Content team approves via admin dashboard, no code deployment needed
- **Frequency**: Typically 2-3 per week during active content creation periods

### Hotfixes
- **Schedule**: As needed, any time
- **SLA**: Critical bugs fixed and deployed within 4 hours
- **Process**: Fast-track branch, abbreviated QA, expedited review

### Major Releases (Quarterly)
- **Schedule**: Once per quarter (March, June, September, December)
- **Extended staging soak**: 1 full week instead of 1 day
- **Additional gates**: Performance benchmarks, accessibility audit, COPPA review

---

## Branch Strategy

```
main (production)
  |
  +--- hotfix/v1.3.1        (branches from main, merges back to main + develop)
  |
develop (integration)
  |
  +--- feature/add-phonics   (branches from develop, merges back to develop)
  +--- feature/new-mascot    (branches from develop, merges back to develop)
  |
  +--- release/v1.4.0        (branches from develop on cut day, merges to main)
```

### Branch Rules

| Branch | Push directly? | Required reviews | CI must pass? | Deploy target |
|---|---|---|---|---|
| `main` | No | 2 approvals | Yes | Production |
| `develop` | No | 1 approval | Yes | Dev environment |
| `release/*` | No | 1 approval | Yes | Staging |
| `hotfix/*` | No | 1 approval (expedited) | Yes | Staging then Production |
| `feature/*` | Yes | 1 approval to merge | Yes | Preview (optional) |

---

## Regular Release Flow

### Week 1: Feature Development

```
Mon-Fri: Feature development on develop branch
  - Engineers work on feature/* branches
  - PRs merged to develop after review
  - Dev environment auto-deploys from develop
  - Feature flags used for incomplete features
```

### Week 2: Release Week

```
Monday
  09:00  Release manager creates release/v1.x.0 branch from develop
  09:30  CI pipeline runs full test suite on release branch
  10:00  Deploy release branch to staging environment
  10:30  QA begins staging verification (smoke tests + regression)

  Afternoon:
  - Bug fixes go into release branch (cherry-picked back to develop)
  - No new features allowed on release branch
  - Staging soak begins (monitoring error rates, performance)

Tuesday
  13:30  Go/No-Go meeting (release manager, QA lead, engineering lead)
  14:00  If GO: Tag v1.x.0 on release branch, merge to main
  14:15  Production deployment begins (triggered by tag)
  14:30  Post-deploy verification (health checks, smoke tests)
  14:45  Monitor production (error rates, performance dashboards)

  If NO-GO:
  - Document blocking issues
  - Fix on release branch
  - Reschedule for Wednesday or next cycle

Wednesday
  09:00  Final production monitoring check
  09:30  Release retrospective (what went well, what didn't)
  10:00  Release branch merged to develop (if not already)
  10:30  Release notes published to changelog
```

### Release Branch Lock Rules

Once a release branch is cut:
- **Allowed**: Bug fixes, copy corrections, config changes
- **Not allowed**: New features, refactors, dependency updates
- **Exception**: Critical security patches

---

## Hotfix Flow

For production-impacting bugs that cannot wait for the next regular release.

```
1. Triage
   - Confirm production impact (error rates, user reports)
   - Assign severity: P0 (site down), P1 (major feature broken), P2 (degraded)
   - P0/P1 trigger hotfix flow; P2 waits for next release

2. Branch & Fix
   - Create hotfix/v1.x.{patch} from main
   - Implement fix with test coverage
   - Open PR to main (expedited single-reviewer approval)

3. Staging Verification
   - Deploy hotfix branch to staging
   - Run targeted test suite (affected area + smoke tests)
   - Minimum 30-minute soak period
   - QA verifies the specific fix

4. Production Deploy
   - Tag v1.x.{patch} on the hotfix branch
   - Deploy to production (triggered by tag)
   - Monitor for 1 hour post-deploy

5. Backport
   - Cherry-pick the fix commit(s) to develop
   - Cherry-pick to any open release/* branch
   - Close the hotfix branch

6. Post-mortem
   - Within 48 hours: root cause analysis
   - Document in incident log
   - Add regression test if not already covered
```

### Hotfix Severity SLAs

| Severity | Definition | Fix SLA | Deploy SLA |
|---|---|---|---|
| P0 | Complete outage or data loss | 1 hour | 2 hours |
| P1 | Major feature broken, no workaround | 4 hours | 8 hours |
| P2 | Feature degraded, workaround exists | Next release | Next release |

---

## Content-Only Release

Content releases are independent of code deployments and are managed entirely through the admin dashboard.

```
1. Content Creation
   - Content team creates/edits content in admin dashboard
   - Content goes through editorial workflow: draft -> review -> approved

2. Content Release Creation
   - Admin user creates a content release via admin UI
   - Selects approved content items to include
   - Sets publish mode: immediate or scheduled

3. Publishing
   - Immediate: Content becomes live via API within minutes
   - Scheduled: Content publishes at the specified date/time
   - No code deployment required (content served from database)

4. Post-Publish
   - CDN cache invalidation for affected media assets
   - Content sync pushed to connected devices
   - Analytics tracking begins for new content

5. Rollback (if needed)
   - Unpublish individual content items from admin dashboard
   - Full release rollback available (reverts all items in the release)
   - No code deployment needed for content rollback
```

### Content Release Checklist

- [ ] All content items reviewed and approved
- [ ] Media assets uploaded and processed (thumbnails, variants)
- [ ] Age-appropriateness verified
- [ ] Accessibility metadata complete (alt text, captions)
- [ ] Content notes written (for parent-facing release notes)
- [ ] Preview verified on staging

---

## Freeze Periods

### Holiday Freeze
- **Dates**: December 20 - January 3 (annually)
- **Code releases**: Frozen (no regular releases)
- **Content drops**: Allowed (pre-approved content only)
- **Hotfixes**: Allowed with on-call approval

### Extended Freeze Events
- Major infrastructure migrations (announced 2 weeks ahead)
- Third-party service maintenance windows
- Compliance audit periods

### Freeze Exceptions
Any deployment during a freeze requires:
1. Written approval from engineering lead
2. Documented rollback plan
3. On-call engineer available for 2 hours post-deploy
4. Incident channel open during deployment

---

## Go/No-Go Gates

### Regular Release Gates

| # | Gate | Required? | Checked by | How |
|---|---|---|---|---|
| 1 | All CI checks pass | Yes | Automated | GitHub Actions status |
| 2 | Staging soak (1+ hours) | Yes | Release manager | No new errors in monitoring |
| 3 | QA sign-off | Yes | QA lead | QA checklist completed |
| 4 | Bundle size within budget | Yes | Automated | CI bundle size check (200KB gzip limit) |
| 5 | No P1/P0 alerts in staging | Yes | On-call engineer | Monitoring dashboard |
| 6 | Release notes drafted | Yes | Release manager | CHANGELOG.md updated |
| 7 | Rollback plan documented | Yes | Release manager | Standard or custom plan |
| 8 | Database migration safe | Yes (if migrations) | Engineering lead | Expand-only, no locks |
| 9 | Feature flags configured | Yes (if new flags) | Engineering lead | Flags created in all environments |
| 10 | COPPA compliance check | Quarterly | Legal/compliance | Privacy review complete |

### Hotfix Gates

| # | Gate | Required? | Notes |
|---|---|---|---|
| 1 | CI checks pass | Yes | Full suite |
| 2 | Staging soak (30+ min) | Yes | Abbreviated |
| 3 | QA verification | Yes | Targeted (affected area only) |
| 4 | No P1/P0 in staging | Yes | Same as regular |
| 5 | Release notes | No | Can be written post-deploy |
| 6 | Rollback plan | Yes | Standard rollback applies |

### Content Release Gates

| # | Gate | Required? | Notes |
|---|---|---|---|
| 1 | Content review complete | Yes | Editorial sign-off |
| 2 | Age-appropriateness verified | Yes | Content team |
| 3 | Media assets processed | Yes | Automated processing |
| 4 | Preview verified | Yes | Visual check in staging |
| 5 | Content notes written | Yes | For parent-facing changelog |

---

## Rollback Criteria

A release should be rolled back if any of the following occur within the monitoring window:

- **Error rate** exceeds 5% (compared to pre-deploy baseline)
- **P99 latency** exceeds 2x baseline for more than 10 minutes
- **Any P0 bug** introduced by the release
- **Data integrity issue** detected
- **Health check failures** on more than 1 instance

See [disaster-recovery.md](./disaster-recovery.md) for detailed rollback procedures.

---

## Roles & Responsibilities

### Release Manager (Rotating Weekly)
- Creates release branch on cut day
- Monitors staging deployment
- Runs go/no-go meeting
- Tags release and monitors production deploy
- Publishes release notes
- Coordinates rollback if needed

### QA Lead
- Creates and executes staging test plan
- Signs off on go/no-go
- Verifies hotfix deployments
- Maintains regression test suite

### On-Call Engineer
- Available during deploy window
- Monitors production post-deploy
- First responder for rollback decisions
- Hotfix triage and coordination

### Engineering Lead
- Final approval for major releases
- Migration safety review
- Freeze exception approval
- Post-mortem facilitation

---

## Communication Plan

### Before Release
- **Monday AM**: Release branch cut notification in #releases channel
- **Monday PM**: QA status update
- **Tuesday 1:30 PM**: Go/no-go meeting (Slack huddle or video call)

### During Release
- **Tuesday 2:00 PM**: Deploy start notification
- **Real-time updates**: In #releases channel during deploy
- **Tuesday 2:30 PM**: Deploy complete + verification status

### After Release
- **Tuesday 3:00 PM**: Release announcement in #general
- **Wednesday AM**: Monitoring all-clear or issues summary
- **Wednesday PM**: Release retrospective notes posted

### Hotfix Communication
- **Incident channel**: Created immediately for P0/P1
- **Status page**: Updated if user-facing impact
- **All-hands notification**: Within 1 hour of P0 detection
- **Post-mortem**: Published within 48 hours
