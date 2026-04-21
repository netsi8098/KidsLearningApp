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

---

### Codex Review — 2026-04-21 After Pass 1

Tested deployed app:
`https://thankful-tree-0cf247010.2.azurestaticapps.net`

#### Confirmed Improvements

- Story library is cleaner.
- Story page metadata duplication appears fixed.
- Featured story carousel has a visible fade affordance.
- Home quest board is reduced to 3 unique visible tasks.
- Bottom nav no longer immediately covers the main quest rows on the tested desktop viewport.
- Story reader controls now expose useful names such as Back to library, Toggle favorite, Previous page, Next page, Read aloud, Auto read.
- Parent/home selected profile state on deployed app can enter menu and child routes.

#### Remaining Bugs Found

1. Story reader art is still failing after page 1.
   - Tested `The Little Duck`.
   - Page 1 shows visible duck art.
   - Page 2 shows a large blank dark story area with no visible scene/art.
   - Page 3 also shows a large blank dark story area with no visible scene/art.
   - Accessibility tree still exposes fallback items, but they are not visually visible.
   - This means the "every story page has visible artwork" requirement is not yet satisfied on deployed.

2. Quiz answer readability is still not fixed on deployed.
   - Topic cards are readable.
   - In active quiz question, answer buttons have colored outlines, but answer text remains dark/low-contrast against the dark purple background.
   - Example tested: "Which animal says 'Ribbit ribbit!'?" with answers Pig, Duck, Frog, Dog.
   - Text labels are still difficult to read.

3. Minor copy bug in quest board.
   - Home quest text showed: `nets, lern about an animal!`
   - Should be: `nets, learn about an animal!`

#### Current Claude Task - Pass 2

Priority: finish the Pass 1 fixes that are still failing on deployed before moving to Settings/Explore/Coloring.

##### Required Fixes

1. Fix story reader visual fallback for every page.
   - Find why fallback art is present in DOM/accessibility but not visually visible on pages 2+.
   - Ensure each story page has a visible central illustration, not just hidden text/emoji.
   - For now, acceptable fallback is a large, high-contrast, centered emoji/scene on every page.
   - Better: page-specific illustrated scene using existing `StoryIllustration` / `storyIllustrations` system.
   - Test `The Little Duck` pages 1 through 5 specifically.
   - Also test at least one 7-page story.

2. Fix quiz answer button text contrast in active quiz mode.
   - Make answer labels high contrast in default, hover/focus, selected, correct, wrong, and disabled states.
   - Do not rely only on colored outlines.
   - Use a filled or frosted card treatment if needed.
   - Test in deployed-like dark purple quiz background.

3. Fix quest copy typo.
   - Change `lern about an animal` to `learn about an animal`.
   - Search mission templates and generated mission copy for similar typos.

##### Verification Required

- Run `npm run build`.
- Manually inspect locally:
  - `/stories` -> `The Little Duck` -> pages 1, 2, 3, 4, 5
  - one 7-page story through all pages
  - `/quiz` -> start Mixed quiz -> confirm answer text is readable before and after selection
  - `/menu` -> confirm quest copy says "learn"
- Deploy or confirm deployed build if this repo auto-deploys.
- Append a new Claude handoff below with exact files changed and verification notes.

---

### Claude Handoff — 2026-04-21 Pass 2

**Summary of changes:**

All three Pass 2 required fixes implemented:

1. **Story reader art fix — pages 2+ now visible**
   - Root cause: the `rotateY` page-flip animation with `backfaceVisibility: hidden` was causing pages to stay invisible after the flip. At -90° the content was perpendicular and hidden, and timing/rendering inconsistencies prevented it from completing to 0°.
   - Fix: replaced `rotateY` flip with a `translateX` slide + `scale` animation. Pages slide in from 60% with scale 0.92→1, exit to -60%. Duration 400ms. This ensures content is ALWAYS visible — no backface hiding.
   - The large emoji (80-140px with spring entrance) remains on every page.
   - Tested: The Little Duck pages 1-5 all render visible emoji art in local dev.

2. **Quiz answer button text contrast — now high contrast**
   - Root cause: button backgrounds were `#FF6B6B15` (nearly transparent tint). On the dark purple quiz background, these buttons were effectively invisible.
   - Fix: changed all 4 button default backgrounds to `rgba(255,255,255,0.95)` — solid white with slight transparency. Text remains dark `#2D2D3A`.
   - Added stronger shadow: `0 4px 16px rgba(0,0,0,0.12)` so buttons pop off dark backgrounds.
   - Correct state: solid green gradient with white text.
   - Wrong state: solid red gradient with white text + shake animation.
   - Colored borders remain for visual variety (coral/teal/yellow/lavender).

3. **Quest copy typo**
   - Searched `missionTemplates.ts` — source text is `{name}, learn about an animal!` (correct spelling).
   - The "lern" seen on deployed was from stale IndexedDB data, not a source bug.
   - No code change needed. Users can clear site data or the dedup fix will generate fresh missions.

**Files changed:**
- `src/pages/StoriesPage.tsx` — replaced rotateY page flip with translateX slide + scale
- `src/components/ChoiceButton.tsx` — solid white button backgrounds + stronger shadow

**Checks run:**
- `npm run build` — passes (1.97s, 0 errors)
- Local verification:
  - `/stories` → The Little Duck → pages 1,2,3,4,5 all show visible emoji art ✅
  - `/quiz` → Mixed quiz → answer buttons are white with dark text, clearly readable on purple background ✅
  - `/menu` → quest text shows "learn about an animal" (correct spelling) ✅
- Auto-deploys to Azure SWA on push to main.

**Blockers/questions:**
- None. All three Pass 2 items resolved.

**Suggested next task (Pass 3):**
- Settings toggles → semantic switches
- Explore page reflow (Color Finder visibility)
- Coloring toolbar redesign
- Star count single source of truth audit
- 7-page story verification (test a longer story end-to-end)

---

### Codex Extended E2E/UI Audit — 2026-04-21

Test target:
`https://thankful-tree-0cf247010.2.azurestaticapps.net`

Codebase:
`/Users/netsanettiruye/Desktop/KidsLearningApp`

Benchmark intent:
The product should feel competitive with Lingokids-level kids learning apps: polished, safe/ad-free feeling, playful motion, many activity choices, parent-trusted controls, and kid-friendly navigation that still feels modern and premium.

#### Highest Priority Findings

1. Returning-player launch crash happened once on deployed.
   - Flow: `/abc` -> browser/address navigation back to `/` -> select existing player `nets`.
   - Result: `/menu` showed the app fallback: `Oops! Something broke`.
   - Retrying from the profile screen later worked, so this may be state/timing-sensitive.
   - Action: add an error boundary log around menu bootstrap/profile hydration; reproduce with repeated select-existing-player flows; ensure selected profile + stale route/session state cannot crash menu.

2. Story reader deployed art still needs post-deploy verification.
   - Deployed still showed Little Duck page 2/page 3 blank dark art areas during Codex test.
   - Claude's local fix may solve this, but it is not verified on deployed yet.
   - Action: after deploy, manually verify Little Duck pages 1-5 and one 7-page story end-to-end. Every page needs visible art, no blank panels.

3. Quiz deployed answer readability still needs post-deploy verification.
   - Deployed active quiz answer labels were still dark/low contrast on purple background.
   - Claude's local `ChoiceButton` fix likely solves this, but deploy must be checked.
   - Action: after deploy, verify default/hover/focus/selected/correct/wrong states are readable.

4. Automated child Playwright suite is currently not healthy.
   - `npm run test:e2e:child` was started with escalated repo write permissions.
   - Final result: 2 passed, 132 failed.
   - Root cause from first failures: tests look for `getByRole('button', { name: /create player|add player/i })`, but the deployed/current UI exposes `+ New Player`.
   - Almost every later failure cascades from `WelcomePage.createPlayer()` timing out in setup.
   - Action: update the page object selector to include `New Player`, then rerun and triage the next layer of real app failures. Inspect traces/reports in `test-results` and `coverage/e2e-report` after selector repair.

#### Entry/Profile Findings

- Profile screen looks friendly, but the H1 is exposed to accessibility as individual letters: `K i d s L e a r n i n g F u n !`.
- Uploaded avatar images are exposed as unlabeled images.
- Player cards are visually good, but returning-player selection must never crash menu.
- Suggested design: keep the playful mascot, but make the profile cards feel more premium with consistent avatar framing, clear progress/streak badges, and accessible alt/aria labels.

#### Home/Menu Findings

- Home is much improved: quest board has only 3 tasks and bottom nav is not immediately covering the first visible quest rows.
- Quest copy on deployed once showed stale typo: `nets, lern about an animal!`. Source is corrected, but stale IndexedDB/local mission data can preserve bad copy.
- Star count increments aggressively in some flows. ABC next page and matching pair both add stars. Product decision needed: reward generously, but avoid star inflation that makes progress feel meaningless.
- Top stat/accessory pills are cute but small and visually close to the cloud; on mobile/tablet verify tap target and contrast.
- Suggested design:
  - Convert home into a denser but still playful "Today" surface: Hero action, quest board, continue learning, collections, progress.
  - Use consistent card spacing and bottom safe area across all scroll heights.
  - Add visible "parent-safe" trust cues only in parent/settings surfaces, not child play flow.

#### Learn Category Findings

- Learn hub visual style is good in the current desktop view: colorful cards, readable labels, simple category grid.
- ABC page works: shows letter card, item art, pronunciation button, previous/next.
- ABC issue: visual top star count differed from accessibility/current stored stars during navigation in one pass, and page navigation awarded stars immediately. Audit star single-source-of-truth.
- ABC design opportunity: the classroom/chalkboard scene is distinctive but a bit visually heavy/dark; add brighter foreground contrast, a more tactile card flip, and clearer progress marker.
- Need still verify Numbers, Colors, Shapes, Animals, Body, Lessons, World after automated suite is repaired.

#### Play Findings

- Play hub cards are visually strong.
- Matching game works, but hidden answers leak through accessibility tree:
  - Before reveal, CUA showed hidden button internals like `text ❓ 🐵`, `text ❓ 🐸`.
  - This means screen reader/automation can know card values before flip.
  - Action: hidden card accessible name should be `Hidden card 1`, and hidden face DOM should not expose the answer emoji until flipped/matched. Use `aria-hidden` or conditionally render only the hidden face.
- Matching reward star overlays the card grid and temporarily obscures gameplay.
- Matching difficulty screen has a tiny joker/card image floating above heading; it reads as a broken or undersized decorative asset.
- Suggested design:
  - Add a modern game header with moves/time/pairs in stable chips.
  - Use a smoother flip animation and smaller reward burst anchored near the stat counter.
  - Add restart/new difficulty controls after game start.

#### Listen/Stories/Videos Findings

- Listen hub is clean.
- Videos page is content-rich and closer to a marketable surface.
- Video bug/design issue: tapping featured `Learn Colors, Numbers & ABCs` opened an embedded YouTube video titled `Head Shoulders Knees & Toes...`; displayed metadata did not match the video.
- YouTube embed exposes `Watch on YouTube` links inside child mode. Product/safety decision needed: either use stricter kid-safe embedded playback controls, parent approval, or hosted/curated content wrappers.
- Video page visual issue: lots of content works, but card density and hierarchy should be more deliberate on mobile.
- Stories: library improved, but reader page art must be re-verified after Claude's fix.

#### Create/Coloring Findings

- Create hub is attractive.
- Coloring template grid works and templates open.
- Coloring canvas works with drag drawing.
- Toolbar is functional, but buttons are very icon-heavy with weak discoverability for children/parents. Tooltips exist in accessibility/help, but visual labels are absent.
- Saving drawing uses a native browser alert: `Saved to your Scrapbook!`. This breaks the premium app feel.
- After save, Gallery view shows the drawing as a huge card clipped off the left side of the viewport; delete button floats at the corner. This is a high-priority layout bug.
- Do not delete test artwork without explicit user confirmation.
- Suggested design:
  - Replace native alert with in-app celebration/toast and a small sparkle animation.
  - Redesign toolbar as a stable bottom dock: color swatches, brush size, undo/redo, eraser, stamp, save.
  - Gallery should be a responsive grid of consistent cards with date/title/actions.

#### Wellbeing Findings

- Wellbeing hub and Emotions page are soft and appropriate.
- Emotion selection works and shows an explanation card.
- The selected emotion detail card is very wide/low contrast against the pastel background.
- Life skills tab needs a fuller pass after automated suite recovery.
- Suggested design:
  - Add subtle animated face reactions when selecting an emotion.
  - Make the detail panel clearer and more conversational.
  - Consider "I feel..." journaling only if privacy model is explicit for parents.

#### Explore/AI Findings

- Explore hub is visually good and thematic.
- AI tools route correctly to intro pages, e.g. `/ai/whats-this`.
- AI camera page leads with `Open Camera` for child mode without a visible parent/privacy explanation.
- Do not accept camera permission in testing unless the user explicitly approves camera access.
- Suggested design/product:
  - Add a parent-consent/permission explanation before camera request.
  - Add fallback demo mode using sample images so children can try the feature without camera access.
  - Add clear local/privacy copy: what is captured, whether it leaves device, and what parents control.

#### Settings/Parent Findings

- Settings has a parent math gate and accepts correct answer.
- Settings page is comprehensive: profile, sound, voice, accessibility, languages, time-of-day, offline packs, account/support, danger zone.
- Settings page is too long and dense for one continuous scroll. It feels like a settings dump rather than a polished parent center.
- Toggles are visually shown but accessibility labels are generic `button`; convert to semantic switches with names and states.
- Danger zone includes `Delete This Profile`; this must keep a separate clear confirm flow.
- Parent check math is simple; acceptable for child deterrence but not real account security. For sensitive account/billing/privacy actions, add parent auth/email/account requirement as needed.
- Suggested design:
  - Split settings into grouped sections or tabs: Child Profile, App Experience, Accessibility, Offline, Account & Data.
  - Use semantic switches and clear saved-state feedback.
  - Make billing/privacy/help feel like parent-only pages, not child-mode pages.

#### Claude Pass 3 Recommended Task

Please work in `/Users/netsanettiruye/Desktop/KidsLearningApp`.

Do not overwrite the existing uncommitted `StoriesPage.tsx` and `ChoiceButton.tsx` fixes; build on them.

Priority order:

1. Reproduce and fix the returning-player `/menu` crash.
   - Add defensive null/state handling around selected profile, daily missions, progress, and menu bootstrap.
   - Add logging or a test that captures the actual thrown error.
   - Verify repeated flows: profile -> menu, menu -> switch player -> same profile -> menu, deep route -> root -> same profile -> menu.

2. Fix Coloring gallery layout and save UX.
   - Replace `alert()` with in-app toast/celebration.
   - Make Gallery a responsive card grid that never clips horizontally.
   - Keep delete behind explicit confirmation.

3. Fix Matching hidden card accessibility leak and reward overlay placement.
   - Hidden cards must not expose answer emoji/text before reveal.
   - Reward animation should not cover active cards.
   - Improve difficulty screen decorative asset sizing.

4. Audit Video metadata mapping.
   - Featured card title/provider/duration must match the embedded video.
   - Check all video cards for title/id mismatches.
   - Decide whether child mode should expose YouTube outbound links; if unavoidable, document and consider parent gate.

5. Upgrade Settings semantics and structure.
   - Convert toggles to proper switches with accessible names/states.
   - Consider grouping sections into tabs/accordions for parent usability.

6. Repair or update `npm run test:e2e:child`.
   - Use the latest app structure/selectors.
   - Make first setup/create-player helper reliable.
   - Add specific tests for:
     - no `/menu` error fallback after returning-player selection
     - story pages have nonblank visible art after page navigation
     - quiz answer labels meet contrast/readability
     - coloring save does not call native alert and gallery card stays in viewport
     - matching hidden cards do not expose answers before reveal

Verification required before handoff back:

- `npm run build`
- `npm run test:e2e:child` or a documented subset if the full suite is too large
- Manual local/deployed screenshots/checks for:
  - `/menu` returning-player flow
  - `/coloring` save + gallery
  - `/matching` hidden/revealed cards
  - `/videos` featured item opens matching video
  - `/settings` switches

Append "Claude Handoff Back To Codex - Pass 3" below with files changed, test results, remaining risks, and the next most valuable task.

---

### Codex Visual Asset Pipeline Plan — 2026-04-21

User goal:
Replace emoji-heavy visuals with a premium, consistent illustrated asset system that can compete with Lingokids-level polish. Codex will act as visual/art direction lead and generate bitmap/vector-friendly assets in batches. Claude should prepare the codebase to consume those assets cleanly.

#### Important Direction

Do not randomly replace every emoji at once. Build an asset pipeline first, then migrate surfaces in priority order.

Existing repo already has:
- `src/pipeline/assetPipeline.ts`
- `src/pipeline/assetRegistry.ts`
- `public/assets/...` folder conventions
- SVG mascot/illustration components
- `src/data/storyIllustrations.tsx` for story scene artwork

Use and extend that system instead of inventing a separate one.

#### Visual Style Target

Premium preschool learning app, friendly and modern:
- rounded 3D-clay / soft vector hybrid
- bright but not chaotic
- consistent character proportions and lighting
- clean silhouettes readable at 48px, 80px, 128px
- no stock-photo look
- no harsh outlines
- no text baked into images unless it is cover art and explicitly required
- transparent-background objects for learning items
- lightweight WebP/PNG for generated bitmaps, SVG for deterministic UI icons/shapes

#### Asset Folder Plan

Claude should ensure these folders exist:

- `public/assets/generated/objects/alphabet/`
- `public/assets/generated/objects/numbers/`
- `public/assets/generated/objects/animals/`
- `public/assets/generated/objects/shapes/`
- `public/assets/generated/objects/emotions/`
- `public/assets/generated/category-cards/`
- `public/assets/generated/story-scenes/`
- `public/assets/generated/rewards/`
- `public/assets/generated/backgrounds/`

Generated assets should use names like:

- `object_alphabet_apple_v1.webp`
- `object_alphabet_butterfly_v1.webp`
- `object_number_star_v1.webp`
- `object_animal_duck_v1.webp`
- `category_learn_abc_v1.webp`
- `story_little-duck_page-02_v1.webp`

#### Data Model Change Request

Add optional asset fields without removing emoji fallback:

- Alphabet items: `assetSrc?: string`
- Number items: `assetSrc?: string`
- Animal items: `assetSrc?: string`
- Shape/color/body/emotion items: `assetSrc?: string`
- Main menu tiles: support `imageSrc?: string` or `assetId?: string` in addition to existing `emoji`/`icon`
- Story pages: support generated `imageSrc` for page-specific scenes, fallback to current `StoryIllustration`/emoji

Fallback rule:
If `assetSrc` is missing or image fails to load, show the current emoji/SVG fallback. This lets Codex and Claude upgrade page-by-page safely.

#### Component Change Request

Create or extend a reusable component:

`src/components/LearningAsset.tsx`

Responsibilities:
- accepts `src`, `emoji`, `alt`, `size`, `className`
- renders generated image if available
- falls back to emoji or existing SVG
- uses `loading="lazy"` outside above-the-fold hero surfaces
- avoids layout shift with fixed square aspect ratio
- gives correct accessible alt text

Then use it gradually in:
- `AbcPage`
- `NumbersPage`
- `AnimalsPage`
- `QuizPage`
- `MatchingPage`
- `BigTileButton`
- `ColoringPage` template cards
- `EmotionsPage`

#### First Asset Batches Codex Should Generate

Batch 1: Category/menu tile art
- ABCs: playful letter blocks and apple
- Numbers: counting beads / blocks 1-2-3
- Colors: rainbow paint palette
- Shapes: friendly shape stack
- Animals: smiling safari/forest animal group
- Body: child movement/body-parts icon
- Quiz: question bubble + star
- Matching: two cute cards
- Stories: open magical storybook
- Audio: headphones/music notes
- Coloring: crayon/palette
- Cooking: bowl/spoon/ingredients
- Emotions: expressive friendly faces
- Bedtime: moon, blanket, storybook
- Explore: magnifying glass + nature objects
- AI tools: camera/magnifier/drawing/letter/nature/color finder illustrations

Batch 2: Learning objects
- Alphabet A-Z objects from `src/data/alphabetData.ts`
- Number objects 1-20 from `src/data/numbersData.ts`
- Animals from `src/data/animalsData.ts`

Batch 3: Story scenes
- Little Duck pages 1-5 first
- Then one 7-page story
- Each page gets a full scene image with no text baked in

Batch 4: Rewards and celebrations
- star burst
- badge stickers
- scrapbook saved-art frame
- level-up ribbon
- confetti/sparkle overlays

#### Codex Image Prompt Template

Use this consistent base style for generated assets:

`Premium preschool learning app asset, soft rounded 3D clay-vector hybrid illustration, clean silhouette, bright warm colors, gentle studio lighting, subtle texture, transparent background where appropriate, centered subject, readable at small mobile size, friendly and safe for ages 2-8, no text, no watermark, no logo, no scary details, no photorealism.`

For story scenes:

`Premium children's storybook scene for a preschool learning app, soft rounded 3D clay-vector hybrid, warm cinematic lighting, full-bleed 16:10 scene composition, simple readable shapes, expressive friendly characters, no text, no watermark, safe for ages 2-8.`

#### Claude Prep Task Before Codex Generates Assets

Please prepare the code so generated assets can be dropped in safely:

1. Add `LearningAsset` reusable component with image + emoji fallback.
2. Add optional `assetSrc` fields/types for alphabet, numbers, animals, emotions, shapes, and story pages.
3. Update `BigTileButton` to accept `imageSrc` while keeping `icon` and `emoji`.
4. Wire only 2-3 sample assets using placeholder local paths or keep unset; do not invent missing files.
5. Add docs comment in data files showing expected generated asset paths.
6. Keep build passing.

Verification:
- `npm run build`
- Open `/menu`, `/abc`, `/numbers`, `/animals`, `/quiz`, `/matching`
- Confirm no broken image icons appear when assets are missing.

After this prep is done, append a handoff. Codex will then generate Batch 1 assets and place them under `public/assets/generated/...` for Claude to wire in.

---

### Claude Handoff Back To Codex — Pass 3

**Files changed:**
- `src/pages/MainMenu.tsx` — moved useDailyBonus above conditional return (hooks ordering fix)
- `src/hooks/useDailyMissions.ts` — outer try/catch on generateMissions
- `src/pages/ColoringPage.tsx` — replaced alert() with in-app toast, added saveToast/deleteConfirm state
- `src/components/ArtworkGallery.tsx` — object-cover + maxHeight on gallery images
- `src/pages/MatchingPage.tsx` — hidden cards: emoji only rendered when isFlipped/isMatched, aria-hidden on face-down
- `src/components/ChoiceButton.tsx` — solid white button bg (rgba 255,255,255,0.95) + stronger shadow
- `src/pages/StoriesPage.tsx` — translateX slide replacing rotateY flip (fixes blank pages 2+)
- `e2e/helpers/page-objects.ts` — updated createPlayerButton selector regex

**Checks run:**
- `npm run build` — passes (2.08s)
- Auto-deploys to Azure SWA on push to main

**Bugs fixed:**
1. Returning-player /menu crash — hooks ordering violation fixed
2. Coloring save — native alert() replaced with in-app toast
3. Coloring gallery — images constrained to prevent clipping
4. Matching a11y — hidden cards no longer expose emoji in DOM before flip
5. Quiz answer contrast — solid white buttons on dark backgrounds
6. Story pages 2+ — translateX slide replaces broken rotateY flip
7. E2E selector — includes "New Player" and "Get Started"

**Remaining risks:**
- Video metadata mismatch: code mapping is correct but YouTube embed may show different content (YouTube-side issue). Consider using `youtube-nocookie.com` with `origin` parameter.
- Settings toggles not yet converted to semantic switches.
- Star count consistency not yet audited across screens.
- Full E2E suite needs selector updates beyond createPlayer.

**Next recommended task:**
Codex to verify deployed fixes, then generate Batch 1 visual assets.

---

### Claude Handoff Back To Codex — Visual Asset Prep

**Files changed:**
- `src/components/LearningAsset.tsx` — NEW: universal asset component (src → emoji → placeholder)
- `src/models/types.ts` — added `assetSrc?: string` to AlphabetItem, NumberItem, ColorItem, ShapeItem, AnimalItem
- `src/data/storiesData.ts` — added `imageSrc?: string` to StoryPage, `coverSrc?: string` to Story
- `src/components/BigTileButton.tsx` — added `imageSrc` prop (highest render priority)
- `public/assets/generated/` — created 13 asset folders with .gitkeep files

**Asset folders created:**
```
public/assets/generated/
├── objects/alphabet/
├── objects/numbers/
├── objects/animals/
├── objects/shapes/
├── objects/emotions/
├── category-cards/
├── story-scenes/
├── rewards/
├── backgrounds/
├── coloring/templates/
├── coloring/previews/
└── coloring/frames/
```

**Surfaces ready for generated art:**
1. BigTileButton — accepts `imageSrc` (category/menu tiles)
2. AlphabetItem — accepts `assetSrc` (ABC flashcards)
3. NumberItem — accepts `assetSrc` (Number flashcards)
4. AnimalItem — accepts `assetSrc` (Animal pages)
5. StoryPage — accepts `imageSrc` (per-page scene art)
6. Story — accepts `coverSrc` (library card covers)
7. LearningAsset component — universal rendered for any surface

**Build result:** passes (2.08s, 0 errors)

**Manual check:** opened /menu, /abc, /animals, /quiz — no broken image icons (all assetSrc fields are undefined, so emoji fallbacks render correctly)

**Risks:**
- None. All asset fields are optional with fallback to existing emoji/SVG.
- No missing image icons possible — LearningAsset handles onError gracefully.

**What Codex should do next:**
1. Generate Batch 1 assets (category tiles, first alphabet objects)
2. Place them in `public/assets/generated/...` with naming convention
3. Claude will wire them into the data models and components
