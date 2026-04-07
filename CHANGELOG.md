# Changelog

All notable changes to Kids Learning Fun will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changelog entries can be generated automatically using:
```bash
./scripts/generate-changelog.sh <from-tag> <to-tag>
```

Parent-facing release notes can be generated using:
```bash
./scripts/generate-release-notes.sh <from-tag> <to-tag>
```

---

## [Unreleased] - 2026-03-30

### Added
- Natural speech engine in `useAudio` hook — splits text into phrases with pitch/rate variation for human-like delivery
- Voice picker UI in Settings page — browse and preview all available system voices
- Premium voice auto-selection with ranked preference list (Enhanced/Premium > Standard > Google > fallback)
- Age-aware speech adjustments — rate and pitch adapt to child's age group (2-3, 4-5, 6-8)
- Voice preference persistence via localStorage (`klf-preferred-voice`)
- Exported helpers: `setPreferredVoice()`, `getAvailableVoices()`, `getActiveVoiceName()`
- Instructions in Settings to download Enhanced voices from macOS System Settings

### Changed
- `useAudio.speak()` now uses voice profiles from `voiceProfiles.ts` instead of hardcoded rate/pitch
- Speech toggle in Settings now expands to show voice picker when enabled

### Fixed
- E2E test suite: updated page objects and selectors to match current UI (WelcomePage, MainMenu tabs, quest board)
- Installed missing `@playwright/test` dependency and Playwright browsers

---

## [1.0.0] - 2026-03-26

### Added
- Initial release of Kids Learning Fun
- 36 interactive learning pages across 6 categories (Learn, Play, Create, Listen, Wellbeing, Explore)
- 316+ content items across 8 content types
- PWA with full offline support via service worker and IndexedDB
- 5 mascot characters with 10 expressions and 10 poses
- Voice system with 5 voice profiles and 118 voice lines
- Sound system with 25 synthesized sounds and 5 mood boards
- Motion system with 10 animation variants and transition presets
- Cover art system with 7 color palettes
- Sing-along player with 3 songs and lyric highlighting (3 modes)
- Storybook system with 7 scene templates and 6 mood transitions
- Hosted segment player with episode schema
- Ambience system with 6 animated SVG scenes
- Startup sequence with 4 variants
- Content registry with universal tags, skills graph, and collections
- Time-of-day system with 5 auto-detected modes
- Bedtime mode with reduced stimulation
- Accessibility support: reduced motion, larger text, high contrast
- Parent dashboard with progress tracking and weekly recaps
- Parent gate (math problem) for settings access
- Onboarding flow for new users
- Backend API with 40 modules and 178+ endpoints
- Admin dashboard with content management, editorial workflow, and analytics
- Background workers for media processing, AI tasks, and maintenance
- Authentication with JWT and role-based access control (admin, editor, reviewer, viewer)
- Feature flag system with targeting and overrides
- Audit logging for all administrative actions
- Content governance with approval workflows
- Search with full-text indexing
- Sync system for offline-to-online data reconciliation
- Media processing pipeline with image optimization and variant generation
- Export system for data portability
- Household management with caregiver invites
- Subscription and entitlement management
- CI/CD pipeline with GitHub Actions (lint, typecheck, unit tests, integration tests, E2E, certification)
- Docker containerization for all services
- Database migrations via Prisma
- Security scanning workflow (dependency audit, lockfile integrity, secret scanning, license compliance)
- Deployment pipeline with staging and production environments

### Infrastructure
- Express 4 API server with Helmet, CORS, and rate limiting
- PostgreSQL database with Prisma ORM (30+ tables)
- Redis for caching and BullMQ job queues (7 queue types)
- S3-compatible object storage for media assets
- Nginx reverse proxy configuration
- Docker Compose for local development
- GitHub Actions CI/CD with change detection and parallel jobs

---

*For detailed technical changes, see the git log. For parent-facing release notes, run `./scripts/generate-release-notes.sh`.*
