import { type Page, type Locator, expect } from '@playwright/test';

// ── Base Page ────────────────────────────────────────────────

export class AppPage {
  constructor(protected page: Page) {}

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /** Wait for lazy-loaded content to finish rendering (no Loading... screen). */
  async waitForLazyLoad() {
    await this.page.waitForFunction(
      () => !document.body.textContent?.includes('Loading...'),
      { timeout: 10_000 },
    );
  }

  /**
   * Navigate to a page path, handling profile re-selection if the app
   * redirects to the welcome page (React context is lost on full reload).
   */
  async gotoAsPlayer(path: string, profileName: string) {
    await this.page.goto(path);
    await this.page.waitForTimeout(500);
    // If we ended up on welcome page, select the profile first
    const onWelcome = await this.page
      .getByText('Kids Learning Fun!')
      .isVisible({ timeout: 1500 })
      .catch(() => false);
    if (onWelcome) {
      // Click existing profile to log in
      await this.page
        .getByRole('button', { name: new RegExp(profileName, 'i') })
        .click();
      await this.page.waitForURL('**/menu');
      // Now navigate to the target page via client-side routing
      if (path !== '/' && path !== '/menu') {
        await this.page.evaluate((p) => window.history.pushState({}, '', p), path);
        await this.page.goto(path);
        // Re-select profile if needed again
        const onWelcome2 = await this.page
          .getByText('Kids Learning Fun!')
          .isVisible({ timeout: 1500 })
          .catch(() => false);
        if (onWelcome2) {
          await this.page
            .getByRole('button', { name: new RegExp(profileName, 'i') })
            .click();
          await this.page.waitForURL('**/menu');
        }
      }
    }
    await this.waitForLazyLoad();
  }

  /** Verify the standard page layout pattern is present. */
  async assertPageContainer() {
    await expect(this.page.locator('.min-h-dvh')).toBeVisible();
  }

  /** Take a named screenshot for debugging. */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `coverage/e2e-report/${name}.png` });
  }
}

// ── Welcome / Profile Selection ──────────────────────────────

export class WelcomePage extends AppPage {
  get title(): Locator {
    return this.page.getByText('Kids Learning Fun!');
  }

  get subtitle(): Locator {
    return this.page.getByText('Choose a player to start');
  }

  /** "+ Create Player" (empty state) or "Add Player" (with existing profiles). */
  get createPlayerButton(): Locator {
    return this.page.getByRole('button', { name: /create player|add player/i });
  }

  get nameInput(): Locator {
    return this.page.getByPlaceholder(/enter name/i);
  }

  get nextButton(): Locator {
    return this.page.getByRole('button', { name: /^next$/i });
  }

  get skipButton(): Locator {
    return this.page.getByRole('button', { name: /^skip$/i });
  }

  get backButton(): Locator {
    return this.page.getByRole('button', { name: /^back$/i });
  }

  /** Select an existing profile by player name. */
  async selectProfile(name: string) {
    await this.page.getByRole('button', { name: new RegExp(name, 'i') }).click();
  }

  /** Create a new player profile and navigate to the main menu.
   *  Flow: click create → enter name → Next → Skip age → Skip interests → arrives at /menu */
  async createPlayer(name: string) {
    await this.createPlayerButton.click();
    await this.nameInput.fill(name);
    await this.nextButton.click();
    // Skip age selection
    await this.skipButton.click();
    // Skip interests (calls handleFinishCreate)
    await this.skipButton.click();
    // Should now be on the main menu
    await this.page.waitForURL('**/menu');
  }
}

// ── Main Menu ────────────────────────────────────────────────

export class MainMenuPage extends AppPage {
  get learnTab(): Locator {
    return this.page.getByRole('button', { name: /learn/i }).first();
  }

  get playTab(): Locator {
    return this.page.getByRole('button', { name: /play/i }).first();
  }

  get createTab(): Locator {
    return this.page.getByRole('button', { name: /create/i }).first();
  }

  get listenTab(): Locator {
    return this.page.getByRole('button', { name: /listen/i }).first();
  }

  get wellbeingTab(): Locator {
    return this.page.getByRole('button', { name: /wellbeing/i }).first();
  }

  get exploreTab(): Locator {
    return this.page.getByRole('button', { name: /explore/i }).first();
  }

  get settingsButton(): Locator {
    return this.page.getByRole('button', { name: /settings/i });
  }

  get rewardsButton(): Locator {
    return this.page.getByRole('button', { name: /rewards/i });
  }

  get parentsButton(): Locator {
    return this.page.getByRole('button', { name: /parents/i });
  }

  get scrapbookButton(): Locator {
    return this.page.getByRole('button', { name: /scrapbook/i });
  }

  get missionsSection(): Locator {
    return this.page.getByText("Today's Quest Board");
  }

  get progressSection(): Locator {
    return this.page.getByText('Your Progress');
  }

  /** All six tabs as an array for iteration. */
  getAllTabs(): Locator[] {
    return [this.learnTab, this.playTab, this.createTab, this.listenTab, this.wellbeingTab, this.exploreTab];
  }

  /** Click a tile in the current tab grid by label. */
  async clickTile(label: string) {
    await this.page.getByRole('button', { name: new RegExp(label, 'i') }).click();
  }
}

// ── Parent Gate ──────────────────────────────────────────────

export class ParentGate {
  constructor(private page: Page) {}

  /** Solve the math parent gate shown on Settings, ParentDashboard, Billing, Routines, etc. */
  async solve() {
    // The gate renders "num1 + num2 = ?" as text content.
    const questionText = await this.page.locator('p.text-3xl').textContent();
    if (!questionText) throw new Error('Parent gate question not found');

    // Parse "X + Y = ?"
    const match = questionText.match(/(\d+)\s*\+\s*(\d+)/);
    if (!match) throw new Error(`Could not parse parent gate: "${questionText}"`);

    const answer = parseInt(match[1], 10) + parseInt(match[2], 10);
    await this.page.getByPlaceholder(/answer/i).fill(String(answer));
    await this.page.getByRole('button', { name: /check/i }).click();
  }
}

// ── Lesson Page (ABCs, Numbers, etc.) ────────────────────────

export class LessonPage extends AppPage {
  get backButton(): Locator {
    // NavButton with "back" direction renders the ◀️ emoji
    return this.page.locator('button').filter({ hasText: /◀/ });
  }

  get nextButton(): Locator {
    return this.page.locator('button').filter({ hasText: /➡/ });
  }

  get prevButton(): Locator {
    return this.page.locator('button').filter({ hasText: /⬅/ });
  }

  get hearItButton(): Locator {
    return this.page.getByRole('button', { name: /hear it/i });
  }

  /** Navigate forward through N items. */
  async advance(steps: number) {
    for (let i = 0; i < steps; i++) {
      await this.nextButton.click();
      // Brief pause for animation
      await this.page.waitForTimeout(200);
    }
  }
}

// ── Story Page ───────────────────────────────────────────────

export class StoryPage extends AppPage {
  get libraryTitle(): Locator {
    return this.page.getByText('Story Time');
  }

  /** Click the first story card in the library grid. */
  async openFirstStory() {
    // Story cards use rounded-[18px] or rounded-[20px] classes
    await this.page.locator('[class*="rounded-[18px]"], [class*="rounded-[20px]"]')
      .filter({ has: this.page.locator('[class*="text-7xl"], [class*="text-6xl"], [class*="text-5xl"]') })
      .first()
      .click();
  }

  get readAloudButton(): Locator {
    return this.page.getByRole('button', { name: /read aloud/i });
  }

  get nextPageButton(): Locator {
    return this.page.locator('button').filter({ hasText: /➡/ });
  }

  get prevPageButton(): Locator {
    return this.page.locator('button').filter({ hasText: /⬅/ });
  }

  get backToLibraryButton(): Locator {
    return this.page.getByRole('button', { name: /back to library/i });
  }

  get closeButton(): Locator {
    return this.page.locator('button').filter({ hasText: /✕/ });
  }

  /** Page indicator showing "Page X of Y". */
  get pageIndicator(): Locator {
    return this.page.getByText(/page \d+ of \d+/i);
  }
}

// ── Games Page ───────────────────────────────────────────────

export class GamePage extends AppPage {
  get hubTitle(): Locator {
    return this.page.getByText('Mini Games');
  }

  get gamesHeading(): Locator {
    return this.page.getByText('Games').first();
  }

  /** Select a game by title from the hub grid. */
  async selectGame(title: string) {
    await this.page.locator('.grid').getByRole('button', { name: new RegExp(title, 'i') }).click();
  }

  /** Select difficulty level. */
  async selectDifficulty(level: 'easy' | 'medium' | 'hard') {
    const labels: Record<string, string> = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    };
    await this.page.getByRole('button', { name: new RegExp(labels[level] || level, 'i') }).first().click();
  }

  get difficultyHeading(): Locator {
    return this.page.getByText('Choose Difficulty');
  }

  get backButton(): Locator {
    return this.page.locator('button').filter({ hasText: /◀/ });
  }

  /** Game grid container. */
  get gameGrid(): Locator {
    return this.page.locator('.grid.grid-cols-2');
  }
}

// ── Settings Page ────────────────────────────────────────────

export class SettingsPage extends AppPage {
  get heading(): Locator {
    return this.page.getByText('Settings');
  }

  get billingLink(): Locator {
    return this.page.getByRole('button', { name: /billing/i });
  }

  get privacyLink(): Locator {
    return this.page.getByRole('button', { name: /privacy/i });
  }

  get helpLink(): Locator {
    return this.page.getByRole('button', { name: /help center/i });
  }

  get editProfileButton(): Locator {
    return this.page.getByRole('button', { name: /edit/i });
  }

  get accountSupportSection(): Locator {
    return this.page.getByText('Account & Support');
  }
}

// ── Parent Dashboard ─────────────────────────────────────────

export class ParentDashboardPage extends AppPage {
  get heading(): Locator {
    return this.page.getByText(/Progress$/);
  }

  get inboxButton(): Locator {
    return this.page.getByRole('button', { name: /inbox/i });
  }

  get routinesButton(): Locator {
    return this.page.getByRole('button', { name: /routines/i });
  }

  get overviewCards(): Locator {
    return this.page.locator('.grid.grid-cols-2.gap-3 > div');
  }

  get weeklyActivitySection(): Locator {
    return this.page.getByText('Weekly Activity');
  }

  get categoryProgressSection(): Locator {
    return this.page.getByText('Category Progress');
  }

  get weeklyRecapButton(): Locator {
    return this.page.getByRole('button', { name: /weekly recap/i });
  }
}

// ── Billing Page ─────────────────────────────────────────────

export class BillingPage extends AppPage {
  get heading(): Locator {
    return this.page.getByText(/billing|subscription/i);
  }
}

// ── Privacy Page ─────────────────────────────────────────────

export class PrivacyPage extends AppPage {
  get heading(): Locator {
    return this.page.getByText(/privacy/i).first();
  }
}

// ── Help Center Page ─────────────────────────────────────────

export class HelpCenterPage extends AppPage {
  get heading(): Locator {
    return this.page.getByText(/help center/i).first();
  }
}

// ── Inbox Page ───────────────────────────────────────────────

export class InboxPage extends AppPage {
  get heading(): Locator {
    return this.page.getByText(/inbox/i).first();
  }
}

// ── Routine Planner Page ─────────────────────────────────────

export class RoutinePlannerPage extends AppPage {
  get heading(): Locator {
    return this.page.getByText(/routine/i).first();
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: /create|new routine/i });
  }

  get templatesButton(): Locator {
    return this.page.getByRole('button', { name: /template/i });
  }
}

// ── Rewards Page ─────────────────────────────────────────────

export class RewardsPage extends AppPage {
  get heading(): Locator {
    return this.page.getByText('My Rewards');
  }

  get totalStars(): Locator {
    return this.page.getByText('Total Stars');
  }

  get badgesCount(): Locator {
    return this.page.getByText(/of \d+ Badges/);
  }

  get daysLearning(): Locator {
    return this.page.getByText(/Days Learning/);
  }

  /** Main section tabs: Badges, History, Favorites */
  get badgesTab(): Locator {
    return this.page.getByRole('button', { name: /badges/i }).first();
  }

  get historyTab(): Locator {
    return this.page.getByRole('button', { name: /history/i }).first();
  }

  get favoritesTab(): Locator {
    return this.page.getByRole('button', { name: /favorites/i }).first();
  }

  /** Badge sub-tabs: All, Earned, Locked (inside Badges section) */
  get allBadgesTab(): Locator {
    return this.page.getByRole('button', { name: /^all\s*\(/i });
  }

  get earnedTab(): Locator {
    return this.page.getByRole('button', { name: /earned/i });
  }

  get lockedTab(): Locator {
    return this.page.getByRole('button', { name: /locked/i });
  }

  get badgeGrid(): Locator {
    return this.page.locator('.grid.grid-cols-2');
  }

  get nextAchievement(): Locator {
    return this.page.getByText('Next Achievement');
  }
}
