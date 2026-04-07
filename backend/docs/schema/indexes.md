# Index Strategy

All indexes in the schema, their purpose, and performance considerations.

## Explicit Indexes (`@@index`)

| Model | Columns | Purpose |
|-------|---------|---------|
| Content | `[type, status]` | List content filtered by type and status (most common admin query) |
| Content | `[ageGroup]` | Filter by age group (common in frontend API) |
| Content | `[status, publishedAt]` | Published content sorted by publish date |
| Content | `[authorId, deletedAt]` | "My content" query with soft-delete filter |
| Asset | `[contentId, mimeType]` | Find assets for a content item, optionally by type |
| Release | `[status, scheduledAt]` | Find pending/scheduled releases for execution |
| Release | `[createdBy]` | "My releases" query |
| QAResult | `[contentId, runAt]` | Get latest QA results for content |
| Review | `[contentId, status]` | Find reviews for content with status filter |
| Review | `[reviewerId]` | "My reviews" / review queue |
| Translation | `[locale, status]` | Translation coverage queries per locale |
| SimilarContent | `[score]` | Find highest similarity pairs for dedup |
| ContentAnalytics | `[periodKey]` | Time-range analytics queries |
| ContentAnalytics | `[contentId, periodKey]` | Content-specific analytics over time |
| LicensedRight | `[endDate]` | Find expiring licenses |
| AuditLog | `[entity, entityId]` | Entity audit trail |
| AuditLog | `[userId]` | User activity log |
| AuditLog | `[createdAt]` | Time-range audit queries |
| Permission | `[role]` | Load all permissions for a role |
| ParentAccount | `[householdId]` | Find parents in a household |
| ChildProfile | `[householdId]` | Find children in a household |
| CaregiverInvite | `[householdId]` | Find invites for a household |
| CaregiverInvite | `[email]` | Look up invites by email |

## Implicit Indexes (from `@unique` / `@@unique`)

Prisma creates a unique index for each `@unique` or `@@unique` constraint.

| Model | Columns | Type |
|-------|---------|------|
| User | `[email]` | `@unique` |
| Content | `[slug]` | `@unique` |
| Tag | `[name]` | `@unique` |
| Asset | `[storageKey]` | `@unique` |
| AssetVariant | `[storageKey]` | `@unique` |
| AssetVariant | `[assetId, variantKey]` | `@@unique` |
| Collection | `[slug]` | `@unique` |
| CurriculumItem | `[unitId, contentId]` | `@@unique` |
| CollectionItem | `[collectionId, contentId]` | `@@unique` |
| Prompt | `[name]` | `@unique` |
| Experiment | `[name]` | `@unique` |
| Translation | `[contentId, locale, field]` | `@@unique` |
| SimilarContent | `[contentAId, contentBId]` | `@@unique` |
| ContentAnalytics | `[contentId, period, periodKey]` | `@@unique` |
| OfflinePack | `[slug]` | `@unique` |
| OfflinePackItem | `[packId, contentId]` | `@@unique` |
| Permission | `[role, resource, action]` | `@@unique` |
| CaregiverInvite | `[token]` | `@unique` |
| ParentAccount | `[email]` | `@unique` |
| ProfilePreference | `[profileId, key]` | `@@unique` |
| ParentalSettings | `[parentId, key]` | `@@unique` |

## Composite Primary Keys

These use `@@id` instead of a single `@id` field.

| Model | Columns |
|-------|---------|
| ContentTag | `[contentId, tagId]` |
| ContentSkill | `[contentId, skillId]` |

## Primary Key Indexes

Every model has an `@id` field (UUID string), which PostgreSQL automatically indexes as the primary key.

## Performance Considerations

### High-Volume Tables
- **ContentAnalytics**: Triple-column unique index `[contentId, period, periodKey]` handles upsert-on-conflict for analytics aggregation. The `[periodKey]` index enables efficient time-range scans.
- **AuditLog**: Append-only and grows indefinitely. The three indexes cover the main query patterns (entity trail, user activity, time range). Consider partitioning by `createdAt` if the table exceeds millions of rows.
- **Content**: Four indexes cover the primary query patterns. The soft-delete filter (`deletedAt`) is handled by middleware, not an index -- acceptable because the ratio of deleted:active records should be low.

### Index-Only Scans
- Junction tables (`ContentTag`, `ContentSkill`) use composite primary keys that serve as covering indexes for relationship lookups.
- `Permission.[role, resource, action]` unique constraint enables index-only permission checks.

### Missing Indexes to Consider
- `Content.[language]` -- If multi-language content grows, filtering by language will need an index.
- `Brief.[status, createdBy]` -- For "my briefs" queries filtered by status.
- `VoiceJob.[contentId, status]` -- For finding pending voice jobs per content.
- `IllustrationJob.[contentId, status]` -- For finding pending illustration jobs per content.

These should be added when query patterns show they are needed. Over-indexing slows writes.
