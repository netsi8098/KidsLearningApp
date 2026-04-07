# Schema Overview

The Kids Learning Backend uses **PostgreSQL** via **Prisma ORM** with **30 models** across 6 domains.

## Model Count by Domain

| Domain | Models | Description |
|--------|--------|-------------|
| **Content** | 10 | Core CMS: content, tags, assets, collections, curriculum, skills |
| **Workflow** | 6 | Review, release, QA, translation pipelines |
| **AI** | 5 | Brief, story pipeline, illustration, prompts, voice |
| **Analytics** | 4 | Content analytics, experiments, A/B testing, dedup |
| **Household** | 6 | Household, parents, children, invites, preferences, settings |
| **System** | 3 | Audit log, permissions, licensed content governance |

## Models by Domain

### Content (10 models)
- `User` -- Admin CMS users (editors, reviewers, admins)
- `Content` -- Core content items (20 content types)
- `Tag` / `ContentTag` -- Tag system with dimension-based taxonomy
- `Asset` / `AssetVariant` -- Media files with responsive variants
- `Collection` / `CollectionItem` -- Curated content collections
- `Curriculum` / `CurriculumUnit` / `CurriculumItem` -- Structured learning paths
- `Skill` / `ContentSkill` -- Skills graph linking content to learning outcomes

### Workflow (6 models)
- `Review` / `ReviewComment` -- Content review with inline comments
- `Release` -- Scheduled publish/unpublish/archive actions
- `QAResult` -- Automated quality checks per content
- `Translation` -- Per-field localization with status tracking

### AI (5 models)
- `Brief` -- AI content generation briefs
- `StoryStep` -- Multi-step story creation pipeline
- `IllustrationJob` -- AI illustration generation jobs
- `Prompt` / `PromptUsage` -- Prompt template registry with usage logging
- `VoiceJob` -- Text-to-speech rendering jobs

### Analytics (4 models)
- `ContentAnalytics` -- Aggregated metrics (daily/weekly/monthly)
- `Experiment` / `ExperimentVariant` / `ExperimentResult` -- A/B testing
- `SimilarContent` -- Content similarity pairs for dedup
- `OfflinePack` / `OfflinePackItem` -- Downloadable content bundles

### Household (6 models)
- `Household` -- Family unit with plan and locale
- `ParentAccount` -- Parent/caregiver credentials
- `ChildProfile` -- Child with age, preferences, accessibility settings
- `CaregiverInvite` -- Token-based invite for additional caregivers
- `ProfilePreference` -- Key-value preferences per child
- `ParentalSettings` -- Key-value settings per parent

### System (3 models)
- `AuditLog` -- Immutable action log (who did what, when)
- `Permission` -- Role-resource-action permission matrix
- `LicensedRight` -- Content licensing/governance tracking

## Key Design Decisions

### Soft-Delete Pattern
13 models use `deletedAt: DateTime?` for soft deletion. A Prisma middleware automatically:
- Filters `deletedAt: null` on all reads (`findMany`, `findFirst`, `count`)
- Converts `delete` operations to `update { deletedAt: now() }`

Soft-delete models: Content, Asset, Collection, Curriculum, Tag, OfflinePack, Experiment, Prompt, Brief, LicensedRight, Household, ParentAccount, ChildProfile.

### Audit Logging
The `AuditLog` model is append-only. A shared `logAudit()` helper writes entries without blocking the main operation (fire-and-forget with error swallowing).

### Junction Tables
Many-to-many relationships use explicit junction tables with composite primary keys:
- `ContentTag` (contentId + tagId)
- `ContentSkill` (contentId + skillId)
- `CollectionItem`, `CurriculumItem`, `OfflinePackItem` use unique constraints on parent+content pairs

### Versioning
- `Content.version` tracks content revisions (incremented on update)
- `Prompt.version` tracks prompt template versions
- `Curriculum.version` tracks curriculum revisions

### Enums
The schema uses 10 PostgreSQL enums for type safety: `Role`, `ContentType` (20 values), `ContentStatus`, `AccessTier`, `AgeGroup`, `Difficulty`, `EnergyLevel`, `ReleaseAction`, `ReleaseStatus`, `ReviewStatus`, `BriefStatus`, `ExperimentStatus`.

### JSON Fields
Several models use `Json` fields for flexible/extensible data:
- `Content.body` -- Structured content data varies by type
- `Brief.objectives` / `Brief.constraints` -- AI generation parameters
- `Experiment.config` / `ExperimentVariant.config` -- Test configuration
- `Household`-related `ProfilePreference.value` / `ParentalSettings.value` -- Extensible settings
