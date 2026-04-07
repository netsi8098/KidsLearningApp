# Disaster Recovery & Rollback Runbook

> Procedures for recovering from failures across all Kids Learning Fun services.

---

## Table of Contents

1. [Recovery Targets](#recovery-targets)
2. [Rollback Decision Framework](#rollback-decision-framework)
3. [Runbook: Bad Frontend Deploy](#runbook-bad-frontend-deploy)
4. [Runbook: Bad API Deploy](#runbook-bad-api-deploy)
5. [Runbook: Bad Worker Deploy](#runbook-bad-worker-deploy)
6. [Runbook: Failed Database Migration](#runbook-failed-database-migration)
7. [Runbook: Database Corruption](#runbook-database-corruption)
8. [Runbook: Redis Failure](#runbook-redis-failure)
9. [Runbook: S3/Object Storage Outage](#runbook-s3object-storage-outage)
10. [Runbook: Certificate Expiry](#runbook-certificate-expiry)
11. [Runbook: Secrets Leak](#runbook-secrets-leak)
12. [Backup Strategy](#backup-strategy)
13. [Backup Validation](#backup-validation)
14. [DR Rehearsal Schedule](#dr-rehearsal-schedule)
15. [Incident Response Checklist](#incident-response-checklist)
16. [Contact List](#contact-list)

---

## Recovery Targets

| Service | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) | Method |
|---|---|---|---|
| Frontend PWA | 5 minutes | 0 (CDN revert) | Revert CloudFront origin to previous S3 prefix |
| Admin Dashboard | 5 minutes | 0 (CDN revert) | Revert CloudFront origin to previous S3 prefix |
| Backend API | 10 minutes | 0 (container revert) | Redeploy previous ECS task definition |
| Workers | 15 minutes | Job replay from queue | Redeploy previous image, drain and replay queue |
| PostgreSQL Database | 30 minutes | Last backup (daily) + WAL replay | Restore from RDS automated snapshot |
| Redis (Cache + Queues) | 10 minutes | Queue persistent, cache rebuild | Restart ElastiCache, queues self-recover |
| Object Storage (S3) | 1 hour | S3 versioning (instant) | Serve from CloudFront cache, restore objects |
| Search Index | 30 minutes | Rebuild from database | Trigger full reindex job |

---

## Rollback Decision Framework

Use this flowchart when deciding whether to roll back:

```
Is the issue user-facing?
  |
  +-- No --> Monitor. Fix in next release.
  |
  +-- Yes --> Is there a workaround?
                |
                +-- Yes --> How many users affected?
                |             |
                |             +-- < 1% --> Monitor. Fix in next release.
                |             +-- > 1% --> Is a hotfix faster than rollback?
                |                           |
                |                           +-- Yes --> Hotfix
                |                           +-- No  --> ROLLBACK
                |
                +-- No  --> Is error rate > 5%?
                              |
                              +-- Yes --> ROLLBACK IMMEDIATELY
                              +-- No  --> Is data integrity at risk?
                                            |
                                            +-- Yes --> ROLLBACK IMMEDIATELY
                                            +-- No  --> Hotfix if < 2 hours, else ROLLBACK
```

### Rollback Authority

| Time of Day | Who Can Authorize Rollback |
|---|---|
| Business hours | Release manager OR engineering lead |
| After hours | On-call engineer (any severity) |
| P0 anytime | Any engineer (notify within 15 min) |

---

## Runbook: Bad Frontend Deploy

### Symptoms
- Users report blank page or broken UI
- Increased JavaScript errors in monitoring
- Console errors in browser
- Service worker serving stale or broken assets

### Diagnosis
1. Check CloudFront distribution status
2. Verify S3 bucket has the new assets
3. Check browser console for JS/CSS load failures
4. Compare deployed build hash with expected tag

### Resolution Steps

```bash
# 1. Identify the previous working version
aws s3 ls s3://kidslearningfun-frontend/ --recursive | sort -k1,2 | tail -20

# 2. Revert CloudFront origin to previous S3 prefix
aws cloudfront get-distribution-config --id $DIST_ID > /tmp/cf-config.json
# Edit origin path to point to previous version prefix
# e.g., /v1.2.0 instead of /v1.3.0
aws cloudfront update-distribution --id $DIST_ID --distribution-config file:///tmp/cf-config-reverted.json --if-match $ETAG

# 3. Invalidate CDN cache to serve previous version immediately
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

# 4. Verify rollback
curl -s https://kidslearningfun.app/ | grep -o 'assets/index-[a-f0-9]*\.js'
# Should match previous version's hash
```

### PWA-Specific Considerations
- Service worker may cache the broken version
- Users with cached broken version will self-heal on next SW update cycle (typically 24 hours)
- For faster recovery, bump the SW version in the reverted deploy to force update
- IndexedDB data is preserved across frontend rollbacks

### Verification
- [ ] CloudFront serving correct origin
- [ ] CDN invalidation completed
- [ ] Browser loads without JS errors
- [ ] PWA install prompt works
- [ ] Offline mode functional with cached content

### Post-mortem Actions
- [ ] Identify what broke (build config, dependency, code bug)
- [ ] Add E2E test for the failure mode
- [ ] Review bundle diff between versions

---

## Runbook: Bad API Deploy

### Symptoms
- Health check endpoint returns non-200
- Elevated 5xx error rates in monitoring
- API response times significantly increased
- Frontend showing "connection error" messages
- Worker jobs failing to enqueue

### Diagnosis
1. Check ECS service events: `aws ecs describe-services --cluster prod --services api`
2. Check container logs: `aws logs tail /ecs/api --since 30m`
3. Check health endpoint: `curl -v https://api.kidslearningfun.app/health`
4. Verify database connectivity from new containers
5. Check if migration ran and succeeded

### Resolution Steps

```bash
# 1. Identify the previous working task definition
aws ecs list-task-definitions --family-prefix kidslearningfun-api --sort DESC --max-items 5

# 2. Update service to use previous task definition
aws ecs update-service \
  --cluster prod \
  --service api \
  --task-definition kidslearningfun-api:<PREVIOUS_REVISION> \
  --force-new-deployment

# 3. Wait for deployment to stabilize
aws ecs wait services-stable --cluster prod --services api

# 4. Verify health
curl -f https://api.kidslearningfun.app/health
```

### If the new version ran a database migration

**If migration was expand-only (adding columns/tables)**:
- Safe to roll back API. Old code ignores new columns.
- New columns/tables remain but are unused.

**If migration was contracting (removing columns/tables)**:
- DO NOT roll back without reviewing migration.
- The old code may depend on removed columns.
- See [Failed Database Migration](#runbook-failed-database-migration) runbook.

### Verification
- [ ] Health endpoint returns 200
- [ ] API response times normal
- [ ] Error rate back to baseline
- [ ] Frontend can authenticate and fetch data
- [ ] Worker jobs processing normally
- [ ] Sync endpoints functional

### Post-mortem Actions
- [ ] Container logs collected from failed deployment
- [ ] Root cause identified (config, code, dependency)
- [ ] Canary deployment considered for future releases

---

## Runbook: Bad Worker Deploy

### Symptoms
- Job queue depth growing (jobs not being processed)
- Worker container crash loops in ECS
- Failed job count increasing in BullMQ dashboard
- Content processing (media, AI) stalled
- Analytics pipeline delayed

### Diagnosis
1. Check worker container status: `aws ecs describe-tasks --cluster prod --tasks $(aws ecs list-tasks --cluster prod --service-name worker --query 'taskArns' --output text)`
2. Check worker logs: `aws logs tail /ecs/worker --since 30m`
3. Check queue depths: `curl https://api.kidslearningfun.app/api/system/queues` (admin auth required)
4. Check Redis connectivity

### Resolution Steps

```bash
# 1. Stop the broken workers to prevent further damage
aws ecs update-service --cluster prod --service worker --desired-count 0

# 2. Wait for workers to drain (allow current jobs to finish or timeout)
sleep 60

# 3. Redeploy previous worker image
aws ecs update-service \
  --cluster prod \
  --service worker \
  --task-definition kidslearningfun-worker:<PREVIOUS_REVISION> \
  --desired-count 2 \
  --force-new-deployment

# 4. Wait for stabilization
aws ecs wait services-stable --cluster prod --services worker

# 5. Check queue depths are decreasing
watch -n 10 'curl -s -H "Authorization: Bearer $ADMIN_TOKEN" https://api.kidslearningfun.app/api/system/queues | jq .'
```

### Queue Recovery
- BullMQ queues are persisted in Redis, so jobs survive worker restarts
- Failed jobs can be retried via admin API: `POST /api/system/queues/{queue}/jobs/{id}/retry`
- If jobs are permanently poisoned, move them to a dead-letter queue via admin
- For media processing queue: check if source files are intact before retry

### Verification
- [ ] Worker containers healthy
- [ ] Queue depths decreasing
- [ ] No new failed jobs appearing
- [ ] Media processing completing
- [ ] Analytics pipeline caught up
- [ ] Scheduled maintenance jobs executing

### Post-mortem Actions
- [ ] Identify which queue(s) were affected
- [ ] Count and triage failed jobs
- [ ] Add worker health check that verifies queue processing ability

---

## Runbook: Failed Database Migration

### Symptoms
- API fails to start after deployment (migration error in logs)
- Prisma migration status shows failed migration
- API returns 500 on previously working endpoints

### Diagnosis

```bash
# Check migration status
cd backend && npx prisma migrate status

# Check what the migration does
cat backend/prisma/migrations/<MIGRATION_NAME>/migration.sql

# Identify migration type:
# - EXPAND: CREATE TABLE, ADD COLUMN, CREATE INDEX -> safe, old code works
# - CONTRACT: DROP TABLE, DROP COLUMN, RENAME -> dangerous, old code may break
# - ALTER: ALTER COLUMN type change -> depends on direction
```

### Resolution by Migration Type

#### Expand-Only Migration (Safe)
No rollback needed. The old code simply ignores the new columns/tables.
```bash
# Roll back the API code only (see Bad API Deploy runbook)
# Leave the database changes in place
# Fix the code and redeploy
```

#### Contract Migration (Dangerous)

```bash
# 1. DO NOT roll back the API yet if the migration succeeded
#    Old code depends on removed columns

# 2. Write a compensating migration to undo the contract
cat > /tmp/rollback.sql << 'SQL'
-- Example: re-add a dropped column
ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "legacyField" TEXT;
SQL

# 3. Run the compensating migration against production DB
psql $DATABASE_URL -f /tmp/rollback.sql

# 4. Now safe to roll back the API code
# Follow the Bad API Deploy runbook

# 5. Mark the failed prisma migration as rolled back
npx prisma migrate resolve --rolled-back <MIGRATION_NAME>
```

#### Failed Migration (Partially Applied)

```bash
# 1. Check what was applied
psql $DATABASE_URL -c "SELECT * FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;"

# 2. If migration failed mid-way, check what DDL was applied
# Compare the migration.sql with actual schema

# 3. Manually undo partially applied changes
psql $DATABASE_URL -f /tmp/manual-rollback.sql

# 4. Mark as rolled back in prisma
npx prisma migrate resolve --rolled-back <MIGRATION_NAME>

# 5. Redeploy previous API version
```

### Prevention
- Always use expand-then-contract pattern for schema changes
- Never combine expand and contract in the same migration
- Test migrations against a copy of production data before deploying
- Use `prisma migrate diff` to review changes before applying

### Verification
- [ ] `prisma migrate status` shows clean state
- [ ] API starts without migration errors
- [ ] All endpoints return expected data
- [ ] No data loss in affected tables

---

## Runbook: Database Corruption

### Symptoms
- Prisma/PG errors about corrupt data, missing pages, or constraint violations
- Unexpected null values in non-nullable fields
- Queries returning wrong results
- PostgreSQL checksum failures in logs

### Diagnosis

```bash
# Check PostgreSQL logs
aws rds describe-events --source-type db-instance --source-identifier kidslearningfun-prod --duration 60

# Check for corruption indicators
psql $DATABASE_URL -c "SELECT datname, checksum_failures FROM pg_stat_database WHERE datname = current_database();"

# Run data integrity checks on critical tables
psql $DATABASE_URL << 'SQL'
-- Check for orphaned records
SELECT COUNT(*) as orphaned_assets FROM "Asset" WHERE "contentId" NOT IN (SELECT id FROM "Content");
SELECT COUNT(*) as orphaned_sessions FROM "Session" WHERE "userId" NOT IN (SELECT id FROM "User");
SQL
```

### Resolution Steps

```bash
# 1. IMMEDIATELY: Put API in maintenance mode to prevent further writes
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.kidslearningfun.app/api/system/maintenance \
  -d '{"enabled": true, "reason": "Database recovery in progress"}'

# 2. List available RDS snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier kidslearningfun-prod \
  --query 'DBSnapshots[].{ID:DBSnapshotIdentifier,Time:SnapshotCreateTime,Status:Status}' \
  --output table

# 3. Restore from the most recent clean snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier kidslearningfun-recovery \
  --db-snapshot-identifier <SNAPSHOT_ID> \
  --db-instance-class db.t3.medium

# 4. Wait for restoration (~20-30 minutes)
aws rds wait db-instance-available --db-instance-identifier kidslearningfun-recovery

# 5. Verify restored data integrity
psql $RECOVERY_DB_URL -c "SELECT COUNT(*) FROM \"Content\" WHERE status = 'published';"
# Compare with expected counts

# 6. Point API to recovered database
# Update DATABASE_URL in AWS Secrets Manager or environment
# Redeploy API service

# 7. Run all pending migrations on restored DB
cd backend && DATABASE_URL=$RECOVERY_DB_URL npx prisma migrate deploy

# 8. Disable maintenance mode
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.kidslearningfun.app/api/system/maintenance \
  -d '{"enabled": false}'
```

### Data Loss Assessment
After restoration, compare restored data with any available WAL (Write-Ahead Log) archives to determine:
- How much data was lost (RPO gap)
- Which records need manual recovery
- Whether any user-generated data (progress, preferences) needs reconstruction

### Verification
- [ ] Database connections healthy
- [ ] All tables present with expected row counts
- [ ] Prisma migration status clean
- [ ] API health check passing
- [ ] User data integrity verified (spot-check 10 accounts)
- [ ] Content data integrity verified
- [ ] Audit log intact

---

## Runbook: Redis Failure

### Symptoms
- API returns 500 on routes that use caching
- Worker jobs not being processed (queues stored in Redis)
- Session/auth failures (if sessions stored in Redis)
- Feature flag evaluation slow (cache miss on every request)
- BullMQ dashboard shows no connection

### Diagnosis

```bash
# Check ElastiCache cluster status
aws elasticache describe-cache-clusters --cache-cluster-id kidslearningfun-prod --show-cache-node-info

# Check replication group status (if using Redis cluster)
aws elasticache describe-replication-groups --replication-group-id kidslearningfun-prod

# Test connectivity from API container
redis-cli -h $REDIS_HOST -p 6379 ping
```

### Resolution Steps

```bash
# Scenario A: ElastiCache node failure (auto-failover)
# If Multi-AZ is enabled, failover happens automatically (~30 seconds)
# Verify:
aws elasticache describe-replication-groups \
  --replication-group-id kidslearningfun-prod \
  --query 'ReplicationGroups[0].NodeGroups[0].NodeGroupMembers'

# Scenario B: Manual restart needed
aws elasticache reboot-cache-cluster \
  --cache-cluster-id kidslearningfun-prod \
  --cache-node-ids-to-reboot 0001

# Scenario C: Complete cluster recreation
# Only if cluster is unrecoverable
aws elasticache create-cache-cluster \
  --cache-cluster-id kidslearningfun-prod-new \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --num-cache-nodes 1
```

### Queue Recovery After Redis Restart
- BullMQ with Redis persistence (RDB + AOF): jobs survive restart
- Jobs that were mid-processing when Redis died will be retried (BullMQ stalledInterval)
- Check for duplicate processing if jobs are not idempotent
- Verify queue health: `GET /api/system/queues`

### Cache Warming
After Redis recovery, caches are cold. Expect:
- Higher database load for 10-30 minutes
- Slower API responses until caches rebuild
- Feature flag evaluation hits database on every request until cached

### Verification
- [ ] Redis responds to PING
- [ ] API connects to Redis (check health endpoint)
- [ ] BullMQ queues accessible
- [ ] Worker processing jobs
- [ ] Feature flag caching working
- [ ] Error rates back to baseline

---

## Runbook: S3/Object Storage Outage

### Symptoms
- Images and media not loading in the app
- Upload endpoints returning errors
- Media processing worker jobs failing
- Admin dashboard showing broken images
- CloudFront returning 5xx for media URLs

### Diagnosis
```bash
# Check S3 service health
aws s3 ls s3://kidslearningfun-media/ --max-items 1

# Check if CloudFront is serving cached content
curl -I https://media.kidslearningfun.app/some-known-asset.jpg
# Look for: X-Cache: Hit from cloudfront (cached = OK even if S3 is down)

# Check S3 bucket metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name 5xxErrors \
  --dimensions Name=BucketName,Value=kidslearningfun-media \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### Resolution Steps

```bash
# 1. CloudFront will continue serving cached content
#    No action needed for existing assets that are cached

# 2. Disable media upload endpoints to prevent user-facing errors
#    Enable 'media_uploads_disabled' feature flag
curl -X PATCH -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.kidslearningfun.app/api/feature-flags/media_uploads_disabled \
  -d '{"enabled": true}'

# 3. If S3 is completely unavailable, serve placeholder images
#    Update media service to return placeholder for missing assets

# 4. When S3 recovers:
#    - Verify bucket integrity
aws s3api head-bucket --bucket kidslearningfun-media
#    - Check for any failed uploads during outage
#    - Re-process any queued media jobs
#    - Re-enable upload endpoints
```

### S3 Versioning Recovery
If objects were accidentally deleted or overwritten:
```bash
# List deleted objects
aws s3api list-object-versions --bucket kidslearningfun-media --prefix "content/" \
  --query 'DeleteMarkers[?IsLatest==`true`].{Key:Key,VersionId:VersionId}'

# Restore deleted object by removing delete marker
aws s3api delete-object --bucket kidslearningfun-media \
  --key "content/image.jpg" --version-id "<DELETE_MARKER_VERSION_ID>"
```

### Verification
- [ ] S3 bucket accessible
- [ ] Existing media serving correctly
- [ ] Upload endpoint functional
- [ ] Media processing pipeline operational
- [ ] CloudFront cache warming for new assets
- [ ] No broken images in app or admin

---

## Runbook: Certificate Expiry

### Symptoms
- Browser showing "connection not secure" or NET::ERR_CERT_DATE_INVALID
- API clients rejecting HTTPS connections
- curl returning SSL certificate errors
- Monitoring alerts for certificate expiry

### Diagnosis
```bash
# Check certificate expiry for all domains
echo | openssl s_client -connect kidslearningfun.app:443 -servername kidslearningfun.app 2>/dev/null | openssl x509 -noout -dates
echo | openssl s_client -connect api.kidslearningfun.app:443 -servername api.kidslearningfun.app 2>/dev/null | openssl x509 -noout -dates
echo | openssl s_client -connect admin.kidslearningfun.app:443 -servername admin.kidslearningfun.app 2>/dev/null | openssl x509 -noout -dates

# Check ACM certificate status
aws acm list-certificates --query 'CertificateSummaryList[*].{Domain:DomainName,Status:Status,Expiry:NotAfter}'
```

### Resolution Steps

```bash
# ACM certificates auto-renew. If renewal failed:

# 1. Check why renewal failed
aws acm describe-certificate --certificate-arn $CERT_ARN \
  --query 'Certificate.RenewalSummary'

# 2. If DNS validation issue:
#    Verify CNAME records are still in place
aws route53 list-resource-record-sets --hosted-zone-id $ZONE_ID \
  --query "ResourceRecordSets[?Type=='CNAME']"

# 3. Request new certificate if renewal is stuck
aws acm request-certificate \
  --domain-name kidslearningfun.app \
  --subject-alternative-names "*.kidslearningfun.app" \
  --validation-method DNS

# 4. Add DNS validation records
# (Follow ACM console instructions)

# 5. Update CloudFront/ALB to use new certificate
aws cloudfront update-distribution --id $DIST_ID \
  --viewer-certificate "ACMCertificateArn=$NEW_CERT_ARN,SSLSupportMethod=sni-only,MinimumProtocolVersion=TLSv1.2_2021"
```

### Prevention
- Monitor certificate expiry dates (alert at 30, 14, 7 days)
- Ensure DNS validation CNAME records are permanent (not temporary)
- Use ACM-managed certificates wherever possible (auto-renewal)

### Verification
- [ ] Certificate valid and not expired
- [ ] All domains resolve with valid certificate
- [ ] No browser security warnings
- [ ] API clients connecting successfully

---

## Runbook: Secrets Leak

### Symptoms
- Security scanner alerts (GitHub secret scanning, Snyk)
- Credentials found in git history, logs, or public-facing output
- Unauthorized access detected in audit logs
- AWS CloudTrail showing unusual API calls

### Resolution Steps -- IMMEDIATE ACTION REQUIRED

```bash
# 1. IMMEDIATELY: Identify what was leaked
# Common leaked secrets:
# - JWT_SECRET
# - DATABASE_URL (includes password)
# - AWS access keys (AKIA...)
# - OpenAI/Anthropic API keys
# - S3 credentials

# 2. Rotate ALL potentially compromised credentials
# Even if you think only one was leaked, rotate aggressively

# JWT_SECRET
# Generate new secret and update in AWS Secrets Manager
aws secretsmanager update-secret --secret-id kidslearningfun/prod/jwt \
  --secret-string "$(openssl rand -hex 64)"
# NOTE: This invalidates ALL active user sessions

# Database password
aws rds modify-db-instance \
  --db-instance-identifier kidslearningfun-prod \
  --master-user-password "$(openssl rand -base64 32)"
# Update DATABASE_URL in secrets manager

# AWS Access Keys
aws iam create-access-key --user-name kidslearningfun-api
# Delete old access key
aws iam delete-access-key --user-name kidslearningfun-api --access-key-id $OLD_KEY_ID

# 3. Redeploy ALL services with new credentials
# This forces all containers to pick up new secrets
aws ecs update-service --cluster prod --service api --force-new-deployment
aws ecs update-service --cluster prod --service worker --force-new-deployment

# 4. Check for unauthorized access
# Review CloudTrail for the compromised credential
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=AccessKeyId,AttributeValue=$LEAKED_KEY_ID \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S)

# 5. If the leak was in git history
# Remove from git history (requires force push)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch $LEAKED_FILE" \
  --prune-empty --tag-name-filter cat -- --all
# WARNING: Coordinate with all team members before force push

# 6. Audit database for unauthorized changes
psql $DATABASE_URL -c "SELECT * FROM \"AuditLog\" WHERE \"createdAt\" > NOW() - INTERVAL '7 days' ORDER BY \"createdAt\" DESC LIMIT 100;"
```

### Post-Incident
- [ ] All compromised credentials rotated
- [ ] Services redeployed with new credentials
- [ ] Git history cleaned (if applicable)
- [ ] `.gitignore` updated to prevent recurrence
- [ ] Pre-commit hooks added to scan for secrets
- [ ] Audit log reviewed for unauthorized access
- [ ] Incident report filed
- [ ] Team notified of session invalidation (if JWT rotated)
- [ ] Users notified if any user data was potentially exposed

---

## Backup Strategy

### Automated Backups

| Data Store | Backup Method | Frequency | Retention | Location |
|---|---|---|---|---|
| PostgreSQL | RDS automated snapshots | Daily (2:00 AM UTC) | 30 days | Same region |
| PostgreSQL | Cross-region snapshot copy | Weekly (Sunday) | 90 days | Secondary region |
| PostgreSQL | WAL archiving | Continuous | 7 days | S3 bucket |
| Redis | RDB snapshots | Every 6 hours | 7 days | ElastiCache managed |
| S3 Media | S3 versioning | On every write | 90 days | Same bucket |
| S3 Media | Cross-region replication | Real-time | Indefinite | Secondary region |
| Git Repository | GitHub mirror | On every push | Indefinite | GitHub |
| Secrets | AWS Secrets Manager | Versioned | 30 versions | AWS managed |

### Manual Backup Commands

```bash
# Create manual RDS snapshot before risky operations
aws rds create-db-snapshot \
  --db-instance-identifier kidslearningfun-prod \
  --db-snapshot-identifier manual-pre-migration-$(date +%Y%m%d-%H%M)

# Export specific tables for archival
pg_dump $DATABASE_URL --table="Content" --table="Asset" --format=custom \
  -f backup-content-$(date +%Y%m%d).dump

# Verify backup integrity
pg_restore --list backup-content-$(date +%Y%m%d).dump
```

---

## Backup Validation

### Monthly Validation (First Monday)
1. Restore latest RDS snapshot to a staging instance
2. Run `prisma migrate status` to verify schema consistency
3. Run data integrity queries (row counts, foreign key checks)
4. Verify a sample of media assets from S3 backup
5. Document results in backup validation log

### Quarterly DR Rehearsal (First Week of Quarter)
1. Simulate production database failure
2. Restore from backup to isolated environment
3. Deploy all services pointing to restored database
4. Run full smoke test suite
5. Measure actual RTO and RPO
6. Document gaps and improvements

### Validation Queries

```sql
-- Row count validation (compare with production)
SELECT 'Content' AS table_name, COUNT(*) AS row_count FROM "Content"
UNION ALL SELECT 'Asset', COUNT(*) FROM "Asset"
UNION ALL SELECT 'User', COUNT(*) FROM "User"
UNION ALL SELECT 'Household', COUNT(*) FROM "Household"
UNION ALL SELECT 'Collection', COUNT(*) FROM "Collection"
UNION ALL SELECT 'AuditLog', COUNT(*) FROM "AuditLog"
ORDER BY table_name;

-- Foreign key integrity
SELECT COUNT(*) AS orphaned_assets
FROM "Asset" a
LEFT JOIN "Content" c ON a."contentId" = c.id
WHERE a."contentId" IS NOT NULL AND c.id IS NULL;

-- Recent data check (last 24 hours should exist)
SELECT COUNT(*) AS recent_audit_entries
FROM "AuditLog"
WHERE "createdAt" > NOW() - INTERVAL '24 hours';
```

---

## DR Rehearsal Schedule

| Month | Activity | Scope | Duration |
|---|---|---|---|
| January | Full DR rehearsal | All services | Half day |
| February | Backup validation | Database + S3 | 2 hours |
| March | Full DR rehearsal | All services | Half day |
| April | Backup validation + Redis recovery | DB + Redis | 3 hours |
| May | Backup validation | Database + S3 | 2 hours |
| June | Full DR rehearsal + cross-region | All services | Full day |
| July | Backup validation | Database + S3 | 2 hours |
| August | Backup validation | Database + S3 | 2 hours |
| September | Full DR rehearsal | All services | Half day |
| October | Backup validation + secret rotation | DB + Secrets | 3 hours |
| November | Backup validation | Database + S3 | 2 hours |
| December | Full DR rehearsal (before freeze) | All services | Half day |

---

## Incident Response Checklist

Use this checklist when any production incident occurs:

### Detection (0-5 minutes)
- [ ] Alert received and acknowledged
- [ ] Initial severity assessment (P0/P1/P2)
- [ ] Incident channel created (e.g., `#inc-20260326-api-down`)
- [ ] On-call engineer notified

### Triage (5-15 minutes)
- [ ] Identify affected service(s)
- [ ] Identify affected user population (all users, subset, internal only)
- [ ] Determine if rollback, hotfix, or configuration change needed
- [ ] Status page updated (if user-facing impact)

### Resolution (15 minutes - RTO target)
- [ ] Execute appropriate runbook from this document
- [ ] Verify fix via health checks and monitoring
- [ ] Confirm error rates returning to baseline
- [ ] Remove maintenance mode (if enabled)

### Communication (During resolution)
- [ ] Updates every 15 minutes in incident channel
- [ ] Status page updated with ETR (estimated time to resolution)
- [ ] Stakeholders notified (engineering lead, product)

### Closure (After resolution)
- [ ] Final verification of all services
- [ ] Status page updated to "resolved"
- [ ] Incident channel summary posted
- [ ] Post-mortem scheduled (within 48 hours for P0/P1)

### Post-mortem (Within 48 hours)
- [ ] Timeline of events documented
- [ ] Root cause identified
- [ ] Contributing factors listed
- [ ] Action items created with owners and deadlines
- [ ] Monitoring/alerting improvements identified
- [ ] Runbook updated if procedures were missing or incorrect

---

## Contact List

| Role | Primary | Backup | Escalation |
|---|---|---|---|
| On-Call Engineer | Rotating (PagerDuty) | Engineering Lead | CTO |
| Release Manager | Rotating weekly | Engineering Lead | CTO |
| QA Lead | QA team | Any QA engineer | Engineering Lead |
| Database Admin | DevOps team | Cloud provider support | CTO |
| Security | Security team | Engineering Lead | CTO + Legal |
| AWS Support | Support ticket | TAM (if enterprise) | AWS escalation |

### External Contacts
- **AWS Support**: Support Center console or `aws support create-case`
- **Domain registrar**: For DNS emergencies
- **CDN (CloudFront)**: Via AWS support
- **GitHub**: status.github.com for service issues
