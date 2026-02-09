import { test, expect } from '@playwright/test';
import { KanbanPage } from './pages/KanbanPage';

test.describe('Kanban Remote Sync', () => {
    let kanban: KanbanPage;

    test.beforeEach(async ({ page }) => {
        kanban = new KanbanPage(page);
        await kanban.goto();
    });

    test('TC-021: Successful Push to Remote', async ({ page }) => {
        // Intercept POST request with slight delay
        await page.route('**/api/obsidian/sync', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            await route.fulfill({ status: 200, body: 'Synced!' });
        });

        const pushBtn = page.getByRole('button', { name: 'Push to Docker Obsidian' });
        await expect(pushBtn).toBeVisible();
        await pushBtn.click();

        await expect(page.getByText('Pushing...')).toBeVisible();
        await expect(page.getByText('Synced!')).toBeVisible();
    });

    test('TC-022: Successful Pull from Remote', async ({ page }) => {
        const mockRemoteMarkdown = `
# Remote Board
## To Explore
- [ ] [Remote Item](http://remote.com) - Remote Description
    `.trim();

        // Intercept GET request with slight delay
        await page.route('**/api/obsidian/sync', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            await route.fulfill({
                status: 200,
                contentType: 'text/markdown',
                body: mockRemoteMarkdown
            });
        });

        const pullBtn = page.getByRole('button', { name: 'Pull from Docker Obsidian' });
        await expect(pullBtn).toBeVisible();
        await pullBtn.click();

        await expect(page.getByText('Pulling...')).toBeVisible();
        await expect(page.getByText('Updated!')).toBeVisible();

        // Verify board updated
        await expect(kanban.cardByName('Remote Item')).toBeVisible();
        await expect(kanban.columnCount('todo')).toHaveText('1');
    });

    test('TC-023: Remote Error Handling', async ({ page }) => {
        // Intercept with error and slight delay
        await page.route('**/api/obsidian/sync', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            await route.fulfill({ status: 500 });
        });

        const pushBtn = page.getByRole('button', { name: 'Push to Docker Obsidian' });
        await pushBtn.click();

        await expect(page.getByText('Failed (See Console)')).toBeVisible();
    });
});
