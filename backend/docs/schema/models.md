# Model Reference

All 30 Prisma models documented with fields, types, and relationships.

---

## Content Domain

### User

CMS admin users who create and manage content.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | Primary key |
| email | String | -- | Unique |
| password | String | -- | bcrypt hash |
| name | String | -- | Display name |
| role | Role enum | `viewer` | admin, editor, reviewer, viewer |
| createdAt | DateTime | `now()` | |
| updatedAt | DateTime | `@updatedAt` | |

**Relations:** has many Content, Review, ReviewComment, Brief, Release, Experiment.

---

### Content

Core content item. Supports 20 content types (alphabet, story, video, game, etc.).

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | Primary key |
| slug | String | -- | Unique URL-safe identifier |
| type | ContentType enum | -- | One of 20 types |
| title | String | -- | |
| emoji | String | `""` | Visual icon for UI |
| description | String | `""` | |
| body | Json | `{}` | Structured content data, varies by type |
| status | ContentStatus enum | `draft` | draft -> review -> approved -> scheduled -> published -> archived |
| accessTier | AccessTier enum | `free` | free or premium |
| ageGroup | AgeGroup enum | `all` | Target age range |
| difficulty | Difficulty enum? | null | easy, medium, hard |
| energyLevel | EnergyLevel enum? | null | calm, moderate, active |
| durationMinutes | Int? | null | Estimated duration |
| route | String? | null | Frontend route path |
| authorId | String? | null | FK to User |
| publishedAt | DateTime? | null | When first published |
| scheduledAt | DateTime? | null | Scheduled publish date |
| version | Int | `1` | Incremented on update |
| deletedAt | DateTime? | null | Soft delete |
| updatedBy | String? | null | Last editor user ID |
| featured | Boolean | `false` | Featured content flag |
| archivedAt | DateTime? | null | When archived |
| mood | String? | null | Content mood tag |
| bedtimeFriendly | Boolean | `false` | Safe for bedtime mode |
| language | String | `"en"` | Primary language |
| publishedSnapshot | Json? | null | Frozen copy at publish time |

**Indexes:** `[type, status]`, `[ageGroup]`, `[status, publishedAt]`, `[authorId, deletedAt]`

**Relations:** belongs to User (author). Has many tags, assets, reviews, releases, QA results, analytics, translations, story steps, illustration jobs, voice jobs, curriculum items, collection items, similar content (both sides), licensed rights, experiment variants, offline pack items, skills.

---

### Tag

Dimension-based taxonomy tag.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | Primary key |
| name | String | -- | Unique |
| dimension | String | -- | Category: age, level, duration, energy, skill, mood, theme, subject |
| createdAt | DateTime | `now()` | |
| deletedAt | DateTime? | null | Soft delete |

### ContentTag

Junction table for Content-Tag many-to-many.

| Field | Type | Notes |
|-------|------|-------|
| contentId | String | Composite PK, FK to Content (cascade delete) |
| tagId | String | Composite PK, FK to Tag (cascade delete) |

---

### Asset

Uploaded media file (image, audio, video).

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | Primary key |
| contentId | String? | null | FK to Content (SetNull on delete) |
| filename | String | -- | Original filename |
| storageKey | String | -- | Unique key in storage provider |
| mimeType | String | -- | e.g. image/png, audio/mp3 |
| sizeBytes | Int | -- | File size |
| width | Int? | null | Image width in px |
| height | Int? | null | Image height in px |
| alt | String? | null | Alt text for accessibility |
| metadata | Json | `{}` | Extensible metadata |
| createdAt | DateTime | `now()` | |
| deletedAt | DateTime? | null | Soft delete |
| updatedBy | String? | null | Last editor |

**Index:** `[contentId, mimeType]`

### AssetVariant

Responsive/optimized variants of an asset (thumbnail, 2x, webp).

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| assetId | String | FK to Asset (cascade delete) |
| variantKey | String | e.g. "thumbnail", "2x", "webp" |
| storageKey | String | Unique storage key |
| mimeType | String | |
| sizeBytes | Int | |
| width | Int? | |
| height | Int? | |

**Unique:** `[assetId, variantKey]`

---

### Collection / CollectionItem

Curated content bundles (e.g. "Animal Week", "Bedtime Stories").

**Collection:**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | Primary key |
| title | String | -- | |
| slug | String | -- | Unique |
| emoji | String | `""` | |
| description | String | `""` | |
| coverColor | String | `"#FFD93D"` | Hex color for cover |
| ageGroup | AgeGroup enum | `all` | |
| estimatedMinutes | Int | `0` | Total estimated duration |
| sequential | Boolean | `false` | Must items be completed in order? |
| published | Boolean | `false` | |
| deletedAt | DateTime? | null | Soft delete |

**CollectionItem:**

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| collectionId | String | FK to Collection (cascade delete) |
| contentId | String | FK to Content |
| orderIndex | Int | Sort order within collection |

**Unique:** `[collectionId, contentId]`

---

### Curriculum / CurriculumUnit / CurriculumItem

Structured learning paths organized into units.

**Curriculum:**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| title | String | -- | |
| description | String | `""` | |
| ageGroup | AgeGroup enum | -- | |
| version | Int | `1` | |
| published | Boolean | `false` | |
| deletedAt | DateTime? | null | Soft delete |

**CurriculumUnit:** Groups of items within a curriculum. Has `orderIndex` for sequencing.

**CurriculumItem:** Links content to a unit. `required` flag indicates mandatory vs optional items. Unique on `[unitId, contentId]`.

---

### Skill / ContentSkill

Skills graph mapping content to learning outcomes.

**Skill:**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| name | String | -- | Unique |
| category | String | -- | cognitive, motor, social, language, creative, emotional |
| description | String | `""` | |
| ageGroup | AgeGroup enum | `all` | |

**ContentSkill:** Junction table with `relevance` score (Float, default 1.0). Composite PK on `[contentId, skillId]`.

---

## Workflow Domain

### Review / ReviewComment

Content review workflow with inline field-level comments.

**Review:**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| contentId | String | -- | FK to Content |
| reviewerId | String | -- | FK to User |
| status | ReviewStatus enum | `pending` | pending, in_progress, approved, changes_requested, rejected |
| summary | String? | null | Review summary |

**Indexes:** `[contentId, status]`, `[reviewerId]`

**ReviewComment:** Field-targeted comments on reviews. `field` specifies which content field (e.g. "title", "body"). `resolved` tracks resolution status.

---

### Release

Scheduled content actions (publish, unpublish, archive, feature, unfeature).

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| contentId | String | -- | FK to Content |
| action | ReleaseAction enum | -- | publish, unpublish, archive, feature, unfeature |
| status | ReleaseStatus enum | `pending` | pending, scheduled, executing, completed, failed, cancelled |
| scheduledAt | DateTime? | null | When to execute |
| executedAt | DateTime? | null | When actually executed |
| createdBy | String | -- | FK to User |
| notes | String? | null | |

**Indexes:** `[status, scheduledAt]`, `[createdBy]`

---

### QAResult

Automated quality assurance check results per content item.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| contentId | String | -- | FK to Content |
| checkName | String | -- | Which QA check ran |
| category | String | -- | Check category |
| passed | Boolean | -- | Pass/fail |
| severity | String | -- | error, warning, info |
| message | String? | null | Failure details |
| autoFix | Boolean | `false` | Was auto-fixed? |
| runAt | DateTime | `now()` | |

**Index:** `[contentId, runAt]`

---

### Translation

Per-field content translations with workflow status.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| contentId | String | -- | FK to Content |
| locale | String | -- | e.g. en, es, fr, am |
| field | String | -- | Which field: title, description, body |
| value | String | -- | Translated text |
| status | String | `"draft"` | draft -> translated -> reviewed -> published |
| translator | String? | null | Who translated |

**Unique:** `[contentId, locale, field]`
**Index:** `[locale, status]`

---

## AI Domain

### Brief

AI content generation briefs. Editors create briefs, AI generates content, editors accept/reject.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| title | String | -- | |
| type | ContentType enum | -- | Target content type |
| ageGroup | AgeGroup enum | -- | Target audience |
| description | String | -- | What to generate |
| objectives | Json | `[]` | Learning objectives |
| constraints | Json | `{}` | Generation constraints |
| generatedContent | Json? | null | AI output |
| status | BriefStatus enum | `draft` | draft, generating, generated, accepted, rejected |
| createdBy | String | -- | FK to User |
| deletedAt | DateTime? | null | Soft delete |

---

### StoryStep

Multi-step story creation pipeline (outline -> draft -> review -> illustration -> voiceover -> assembly).

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| contentId | String | -- | FK to Content (cascade delete) |
| step | String | -- | Pipeline stage name |
| status | String | `"pending"` | |
| data | Json | `{}` | Step-specific data |
| orderIndex | Int | -- | Step sequence |

---

### IllustrationJob

AI illustration generation and review.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| contentId | String | -- | FK to Content |
| prompt | String | -- | Image generation prompt |
| style | String | `"flat-vector"` | Art style |
| status | String | `"pending"` | pending, generating, review, approved, rejected |
| resultUrl | String? | null | Generated image URL |
| metadata | Json | `{}` | Generation metadata |

---

### Prompt / PromptUsage

Prompt template registry with variable substitution and usage tracking.

**Prompt:**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| name | String | -- | Unique identifier |
| category | String | -- | story, illustration, brief, voice, qa |
| template | String | -- | Template with variable placeholders |
| variables | Json | `[]` | Expected variable definitions |
| version | Int | `1` | |
| isActive | Boolean | `true` | |
| deletedAt | DateTime? | null | Soft delete |

**PromptUsage:** Logs each prompt render with input, output, tokens used, and latency.

---

### VoiceJob

Text-to-speech rendering pipeline.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| contentId | String | -- | FK to Content |
| script | String | -- | Text to render |
| voiceProfile | String | `"narrator"` | Voice profile name |
| status | String | `"pending"` | pending, rendering, review, approved |
| audioUrl | String? | null | Rendered audio URL |
| durationMs | Int? | null | Audio duration |
| metadata | Json | `{}` | |

---

## Analytics Domain

### ContentAnalytics

Time-bucketed content metrics.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| contentId | String | -- | FK to Content |
| period | String | -- | daily, weekly, monthly |
| periodKey | String | -- | e.g. "2026-03-26", "2026-W13" |
| views | Int | `0` | |
| completions | Int | `0` | |
| avgTimeMs | Int | `0` | Average engagement time |
| stars | Int | `0` | Stars earned |
| favorites | Int | `0` | |
| shares | Int | `0` | |

**Unique:** `[contentId, period, periodKey]`
**Indexes:** `[periodKey]`, `[contentId, periodKey]`

---

### Experiment / ExperimentVariant / ExperimentResult

A/B testing framework.

**Experiment:** Named test with draft -> running -> paused -> completed -> cancelled lifecycle. Soft-deletable.

**ExperimentVariant:** A test variant optionally linked to content. `weight` controls traffic distribution (default 0.5).

**ExperimentResult:** Recorded metric observations per variant with sample size.

---

### SimilarContent

Content similarity pairs for deduplication.

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| contentAId | String | FK to Content |
| contentBId | String | FK to Content |
| score | Float | Similarity score (0-1) |
| method | String | Detection method: title-similarity, tag-overlap, content-hash |

**Unique:** `[contentAId, contentBId]`
**Index:** `[score]`

---

### OfflinePack / OfflinePackItem

Downloadable content bundles for offline use.

**OfflinePack:** Bundle metadata with version, estimated size, publish status. Soft-deletable.

**OfflinePackItem:** Links content to a pack. `includeAssets` flag controls whether media is bundled. Unique on `[packId, contentId]`.

---

## Household Domain

### Household

Family unit. Contains parents and children.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| name | String | -- | Family name |
| timezone | String | `"UTC"` | |
| locale | String | `"en"` | |
| plan | String | `"free"` | free, premium, family |
| deletedAt | DateTime? | null | Soft delete |

### ParentAccount

Parent or caregiver within a household. Separate from CMS `User`.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| householdId | String | -- | FK to Household (cascade delete) |
| email | String | -- | Unique |
| password | String | -- | bcrypt hash |
| name | String | -- | |
| role | String | `"primary"` | primary or caregiver |
| deletedAt | DateTime? | null | Soft delete |

**Index:** `[householdId]`

### ChildProfile

Child within a household with personalization and accessibility.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| householdId | String | -- | FK to Household (cascade delete) |
| name | String | -- | |
| avatarEmoji | String | `""` | |
| totalStars | Int | `0` | Gamification |
| streakDays | Int | `0` | |
| ageGroup | AgeGroup enum | `age_2_3` | |
| interests | Json | `[]` | Array of interest tags |
| bedtimeMode | Boolean | `false` | |
| reducedMotion | Boolean | `false` | Accessibility |
| largerText | Boolean | `false` | Accessibility |
| highContrast | Boolean | `false` | Accessibility |
| soundEnabled | Boolean | `true` | |
| musicEnabled | Boolean | `true` | |
| autoplayEnabled | Boolean | `true` | |
| deletedAt | DateTime? | null | Soft delete |

**Index:** `[householdId]`

### CaregiverInvite

Token-based invite for additional caregivers to join a household.

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| householdId | String | FK to Household (cascade delete) |
| email | String | Invited email |
| token | String | Unique invite token |
| expiresAt | DateTime | Token expiry |
| acceptedAt | DateTime? | When accepted |

**Indexes:** `[householdId]`, `[email]`

### ProfilePreference

Key-value preferences per child profile. Unique on `[profileId, key]`.

### ParentalSettings

Key-value settings per parent account. Unique on `[parentId, key]`.

---

## System Domain

### AuditLog

Immutable append-only action log.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| action | String | -- | create, update, delete, publish, approve, reject, login, etc. |
| entity | String | -- | Model name: Content, Asset, Collection, User, etc. |
| entityId | String | -- | ID of affected entity |
| changes | Json | `{}` | Before/after or payload snapshot |
| userId | String? | null | Who performed the action |
| ipAddress | String? | null | Client IP |
| createdAt | DateTime | `now()` | |

**Indexes:** `[entity, entityId]`, `[userId]`, `[createdAt]`

### Permission

Role-based access control matrix.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| role | String | -- | admin, editor, reviewer, viewer, parent |
| resource | String | -- | content, asset, collection, household, etc. |
| action | String | -- | create, read, update, delete, publish, approve |
| allowed | Boolean | `true` | |
| conditions | Json | `{}` | Optional condition constraints |

**Unique:** `[role, resource, action]`
**Index:** `[role]`

### LicensedRight

Content licensing and governance tracking.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | String (UUID) | `uuid()` | |
| contentId | String | -- | FK to Content |
| licensor | String | -- | License holder name |
| licenseType | String | -- | exclusive, non-exclusive, creative-commons, original |
| territories | Json | `["worldwide"]` | Where license applies |
| startDate | DateTime | -- | License start |
| endDate | DateTime? | null | License expiry (null = perpetual) |
| terms | String? | null | License terms text |
| contactEmail | String? | null | Licensor contact |
| deletedAt | DateTime? | null | Soft delete |

**Index:** `[endDate]`
