import { expect, test } from '@playwright/test';
import { KanbanPage } from './pages/KanbanPage';

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
});

test.describe('Kanban Drag/Drop and Responsive Behavior', () => {
  test('TC-001: Move item Todo -> In Progress with count updates', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    const todoBefore = await kanban.getColumnCount('todo');
    const inProgressBefore = await kanban.getColumnCount('inProgress');

    await kanban.moveCardToColumn('awesome-claude-skills', 'inProgress');

    await kanban.expectCardNotInColumn('awesome-claude-skills', 'todo');
    await kanban.expectCardInColumn('awesome-claude-skills', 'inProgress');
    await expect(kanban.columnCount('todo')).toHaveText(String(todoBefore - 1));
    await expect(kanban.columnCount('inProgress')).toHaveText(String(inProgressBefore + 1));
  });

  test('TC-002: Move item In Progress -> Done', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    await kanban.moveCardToColumn('awesome-claude-skills', 'inProgress');
    const doneBefore = await kanban.getColumnCount('done');

    await kanban.moveCardToColumn('awesome-claude-skills', 'done');

    await kanban.expectCardNotInColumn('awesome-claude-skills', 'inProgress');
    await kanban.expectCardInColumn('awesome-claude-skills', 'done');
    await expect(kanban.columnCount('done')).toHaveText(String(doneBefore + 1));
  });

  test('TC-003: Move item Done -> Todo and preserve metadata', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    await kanban.moveCardToColumn('awesome-claude-skills', 'inProgress');
    await kanban.moveCardToColumn('awesome-claude-skills', 'done');
    await kanban.moveCardToColumn('awesome-claude-skills', 'todo');

    const card = kanban.cardInColumn('awesome-claude-skills', 'todo');
    await expect(card).toContainText('awesome-claude-skills');
    await expect(card).toContainText('Python');
    await expect(card).toContainText('32.7k');
  });

  test('TC-004: Drag to invalid zone does not change state', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    const todoBefore = await kanban.getColumnCount('todo');
    const inProgressBefore = await kanban.getColumnCount('inProgress');
    const doneBefore = await kanban.getColumnCount('done');

    await kanban.dragCardToInvalidZone('awesome-claude-skills');

    await kanban.expectCardInColumn('awesome-claude-skills', 'todo');
    await expect(kanban.columnCount('todo')).toHaveText(String(todoBefore));
    await expect(kanban.columnCount('inProgress')).toHaveText(String(inProgressBefore));
    await expect(kanban.columnCount('done')).toHaveText(String(doneBefore));
  });

  test('TC-017: Mobile viewport keeps horizontal scroll behavior', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const kanban = new KanbanPage(page);
    await kanban.goto();

    const main = page.locator('main');
    await expect(main).toHaveClass(/overflow-x-auto/);
    await expect(kanban.column('todo')).toHaveClass(/min-w-\[300px\]/);

    await main.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await expect(kanban.column('done')).toBeVisible();
  });

  test('TC-018: Columns do not stack vertically on narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const kanban = new KanbanPage(page);
    await kanban.goto();

    const boardRow = page.locator('main > div');
    const direction = await boardRow.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(direction).toBe('row');
  });

  test('TC-019: Mobile header layout and import/export button accessibility', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const kanban = new KanbanPage(page);
    await kanban.goto();

    const header = page.locator('header');
    const direction = await header.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(direction).toBe('column');

    await expect(page.getByText('Import Obsidian')).toBeVisible();
    await expect(kanban.exportButton()).toBeVisible();
  });

  test('TC-020: Empty state placeholder remains visible with drop target height', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();

    await kanban.moveCardToColumn('awesome-claude-skills', 'inProgress');
    await kanban.moveCardToColumn('awesome-claude-skills', 'todo');

    const placeholder = kanban.column('inProgress').getByText('Drop items here');
    await expect(placeholder).toBeVisible();
    const height = await placeholder.evaluate((el) => getComputedStyle(el).minHeight);
    expect(height).toBe('96px');
  });
});
