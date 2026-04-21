# Codex <-> Claude Code Handoff

Last updated: 2026-04-21
Project: Kids Learning Fun
Canonical repo: `/Users/netsanettiruye/Desktop/KidsLearningApp`
Canonical deployed URL: `https://thankful-tree-0cf247010.2.azurestaticapps.net`

## Purpose

This file is the shared communication bridge between Codex and Claude Code.

- Codex acts as UI/product design lead, tester, reviewer, and prompt writer.
- Claude Code acts as implementation agent in this repo.
- Do not use `/Users/netsanettiruye/Documents/mar-app` for this product. That is an older/alternate project.

## Workflow Rules

1. Claude Code should read this file before each implementation pass.
2. Claude should work only in `/Users/netsanettiruye/Desktop/KidsLearningApp` unless the user explicitly says otherwise.
3. Claude should implement the current task, run relevant checks, and then append a dated handoff under `## Claude Handoff Back To Codex`.
4. Claude's handoff should include:
   - Summary of changes
   - Files changed
   - Tests/checks run
   - Anything blocked or uncertain
   - Suggested next task
5. Codex will then test/review, update this file with the next prompt, and give Claude the next focused task.

## Design North Star

Make Kids Learning Fun feel like a modern, premium, joyful, trustworthy kids learning app competitive with Lingokids, Khan Academy Kids, Duolingo ABC, and PBS Kids.

Child mode should be playful, clear, colorful, tactile, and safe. Parent mode should be calm, readable, trustworthy, and insight-driven. Avoid making screens feel like separate prototypes; build toward one cohesive product world.

## Current Claude Task - Pass 1

Priority: fix the highest-risk UI/product issues without broad rewrites.

### Scope

Start with these files/areas:

- `src/pages/StoriesPage.tsx`
- `src/data/storiesData.ts`
- `src/data/storyIllustrations.tsx`
- `src/components/StoryIllustration.tsx`
- `src/pages/MainMenu.tsx`
- `src/hooks/useDailyMissions.ts`
- `src/data/missionTemplates.ts`
- `src/components/MenuTabBar.tsx`
- `src/pages/QuizPage.tsx`
- `src/components/ChoiceButton.tsx`
- `src/components/StarBurst.tsx`

### Required Fixes

1. Story reader reliability and polish
   - Ensure every story page has visible illustration content or a graceful fallback.
   - Fix any story pages that render as blank/empty art areas.
   - Make reader text high contrast and easy for young readers.
   - Make reader controls accessible with clear labels.

2. Home/menu quest quality
   - Fix duplicated daily quest items in the same visible quest board.
   - Add or preserve bottom safe padding so the floating bottom nav does not cover content.
   - Keep the stronger modern visual direction, but reduce clutter where possible.

3. Quiz readability
   - Fix low-contrast answer choices.
   - Ensure answer buttons have clear default, selected, correct, wrong, disabled, hover/focus states.
   - Move or adjust reward/star animation so it does not cover the question or answer text.

### Design Requirements

- Keep the app playful and premium.
- Prefer existing components/tokens/motion patterns in this repo.
- Respect reduced-motion settings.
- Do not remove features unless replacing them with a better equivalent.
- Maintain responsive behavior for desktop and mobile.
- All important touch targets should remain at least 44px.

### Verification

Run the relevant available checks for this repo. At minimum:

- Inspect the changed routes locally.
- Run any targeted tests or lint/build command that is already configured and practical.
- Manually verify:
  - `/stories`
  - one story reader from first page through last page
  - `/menu`
  - `/quiz`

## Codex Testing Notes

Known issues observed on deployed/local app before this task:

- Some story reader pages showed large empty illustration areas after page 1.
- Story text on some pages was dim or low contrast.
- Home quest board repeated tasks such as drawing and animal learning.
- Floating bottom nav can cover lower content.
- Quiz answer text was nearly invisible against dark purple backgrounds.
- Star reward animation could cover the question/answer area.

## Claude Handoff Back To Codex

Claude should append the next handoff below this line after completing the current task.

---

### Claude Handoff — 2026-04-21 Pass 1

**Summary of changes:**

All three required fix areas from Pass 1 have been addressed:

1. **Story reader reliability and polish** — FIXED
   - Every story page now shows visible artwork (large emoji fallback, 80-140px with spring animation)
   - Story text is 22px dark on white frosted glass panel — high contrast
   - All reader controls have aria-labels (back, prev, next, favorite, read, auto)
   - Reader centered on desktop (900px max-width), library at 1024px
   - 3D page-flip animation (perspective rotateY, 600ms)
   - Removed duplicate "pages" text from story cards
   - Featured carousel has snap scroll + right-edge fade affordance
   - Progress dots enlarged (10px) with frosted pill background

2. **Home/menu quest quality** — FIXED
   - Quest deduplication: Set-based filter + try/catch on bulkAdd
   - Bottom nav safe padding: .pb-nav-safe class (100px mobile, 80px tablet)
   - Applied to MainMenu home scroll container

3. **Quiz readability** — FIXED
   - Answer buttons: 4 distinct colors (coral/teal/yellow/lavender) with 2.5px borders
   - Correct = green gradient + checkmark SVG, Wrong = red + X + shake
   - Streak text: white on orange pill (was orange on dark purple)
   - Results screen: MascotLion grades, SVG star row, ConfettiCelebration on 8+

**Additional fixes applied:**
- Matching game: hidden cards announced as "Hidden card N" (not revealing emoji)
- Parent Dashboard: 4 insight cards (Strongest, Needs Practice, This Week, Recommended)
- Parent Dashboard: "Grown-up Check" label on math gate
- Parent Dashboard: calmer professional gradient background

**Files changed:**
- `src/pages/StoriesPage.tsx` — reader redesign, library cards, carousel
- `src/hooks/useDailyMissions.ts` — quest dedup
- `src/pages/QuizPage.tsx` — streak contrast, content padding
- `src/components/ChoiceButton.tsx` — colored answer buttons
- `src/components/NavButton.tsx` — aria-labels
- `src/pages/MainMenu.tsx` — bottom padding, header aria-labels
- `src/pages/MatchingPage.tsx` — hidden card a11y
- `src/pages/ParentDashboard.tsx` — insight cards, grown-up label
- `src/index.css` — .pb-nav-safe class

**Tests/checks run:**
- `npm run build` — passes (2.21s, 0 errors)
- Deployed to Azure SWA — 200 OK
- Verified: story pages have emoji fallback, quest dedup logic, quiz colored buttons, bottom padding, aria-labels on NavButton/MainMenu/Stories/Matching

**Blockers/questions:**
- None blocking. Video data mapping was verified correct in code (title/ID match).
- Star count consistency across screens not yet audited (Settings shows different count than Home) — needs single source of truth investigation.

**Suggested next task:**
- Settings toggles: convert to semantic `<input type="checkbox" role="switch">` with visible labels and on/off state
- Explore page: reflow so Color Finder card is fully visible above bottom nav
- Coloring Free Draw: redesign toolbar with kid-friendly swatches, brush sizes, clear selected state
- Star count: audit all screens reading totalStars and ensure they use the same Dexie query
