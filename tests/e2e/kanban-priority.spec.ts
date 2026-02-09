import { expect, test } from '@playwright/test';
import { KanbanPage } from './pages/KanbanPage';

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
});

test.describe('Kanban Priority Sorting and Visuals', () => {
  test('TC-005: Initial priority sorting in To Explore', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    const names = await kanban.getColumnCardNames('todo');
    expect(names.length).toBeGreaterThan(3);

    const firstCard = kanban.column('todo').locator('[data-testid^="repo-card-"]').first();
    const lastCard = kanban.column('todo').locator('[data-testid^="repo-card-"]').last();

    await expect(firstCard.getByTestId('priority-icon')).toBeVisible();
    await expect(lastCard.getByTestId('priority-icon')).toHaveCount(0);

    const priorityIndex = names.findIndex((name) => name.includes('Antigravity-Manager'));
    const nonPriorityIndex = names.findIndex((name) => name.includes('awesome-claude-skills'));
    expect(priorityIndex).toBeGreaterThanOrEqual(0);
    expect(nonPriorityIndex).toBeGreaterThanOrEqual(0);
    expect(priorityIndex).toBeLessThan(nonPriorityIndex);
  });

  test('TC-006: Red priority dot visibility and tooltip text', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    const icon = kanban.priorityIconForCard('Antigravity-Manager');
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('title', /High Priority/);
  });

  test('TC-007: Priority item dropped into todo moves to top', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    await kanban.moveCardToColumn('Antigravity-Manager', 'inProgress');
    await kanban.moveCardToColumn('Antigravity-Manager', 'todo');

    const firstTitle = kanban.column('todo').getByTestId('card-title').first();
    await expect(firstTitle).toHaveText('Antigravity-Manager');
  });

  test('TC-008: Non-priority item dropped into todo appends to bottom', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    await kanban.moveCardToColumn('awesome-claude-skills', 'inProgress');
    await kanban.moveCardToColumn('awesome-claude-skills', 'todo');

    const lastTitle = kanban.column('todo').getByTestId('card-title').last();
    await expect(lastTitle).toHaveText('awesome-claude-skills');
  });

  test('Visual regression: priority icon renders with red indicator', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    await expect(kanban.priorityIconForCard('Antigravity-Manager')).toHaveScreenshot(
      'priority-icon-antigravity-manager.png'
    );
  });
});
