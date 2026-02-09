import { expect, test } from '@playwright/test';
import { MALFORMED_IMPORT_TEXT, PRIORITY_IMPORT_MD, VALID_OBSIDIAN_IMPORT_MD } from '../fixtures/sample-data';
import { KanbanPage } from './pages/KanbanPage';

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'
});

test.describe('Kanban Import/Export', () => {
  test('TC-009: CSV import happy path via mocked FileReader', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.mockFileReader({ 'obsidian_valid.md': VALID_OBSIDIAN_IMPORT_MD });
    await kanban.goto();

    await kanban.acceptConfirmationDialog();
    await kanban.setImportContent('obsidian_valid.md', 'placeholder');

    await expect(kanban.columnCount('todo')).toHaveText('2');
    await expect(kanban.columnCount('inProgress')).toHaveText('1');
    await expect(kanban.columnCount('done')).toHaveText('1');
    await kanban.expectCardInColumn('Foo', 'todo');
    await kanban.expectCardInColumn('Working Item', 'inProgress');
    await kanban.expectCardInColumn('Done Item', 'done');
  });

  test('TC-010: Malformed import does not crash and safely replaces board', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.mockFileReader({ 'bad_format.txt': MALFORMED_IMPORT_TEXT });
    await kanban.goto();

    await kanban.acceptConfirmationDialog();
    await kanban.getImportInput().setInputFiles({
      name: 'bad_format.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('placeholder', 'utf-8')
    });

    await expect(kanban.columnCount('todo')).toHaveText('0');
    await expect(kanban.columnCount('inProgress')).toHaveText('0');
    await expect(kanban.columnCount('done')).toHaveText('0');
    await expect(page.getByText('Drop items here').first()).toBeVisible();
  });

  test('TC-011: Priority metadata recovery from #priority/high', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.mockFileReader({ 'priority.md': PRIORITY_IMPORT_MD });
    await kanban.goto();

    await kanban.acceptConfirmationDialog();
    await kanban.setImportContent('priority.md', 'placeholder');

    await kanban.expectCardInColumn('Proxy Tool', 'todo');
    await expect(kanban.priorityIconForCard('Proxy Tool')).toBeVisible();
  });

  test('TC-012: Export generates antigravity-board.md download', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();
    await kanban.startMarkdownExportCapture();

    const downloadPromise = page.waitForEvent('download');
    await kanban.exportButton().click();
    const download = await downloadPromise;
    const markdown = await kanban.readCapturedMarkdown();

    expect(download.suggestedFilename()).toBe('antigravity-board.md');
    expect(markdown.startsWith('# Antigravity Tool Research')).toBeTruthy();
  });

  test('TC-013: Export keeps checkbox and link formatting', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.mockFileReader({ 'obsidian_valid.md': VALID_OBSIDIAN_IMPORT_MD });
    await kanban.goto();
    await kanban.acceptConfirmationDialog();
    await kanban.setImportContent('obsidian_valid.md', 'placeholder');
    await kanban.startMarkdownExportCapture();

    await kanban.exportButton().click();
    const markdown = await kanban.readCapturedMarkdown();

    expect(markdown).toContain('- [ ] [Foo](http://bar.com)');
    expect(markdown).toMatch(/^- \[ \] \[.*\]\(http.*\)/m);
  });

  test('TC-014: Export includes star values in k-notation', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();
    await kanban.startMarkdownExportCapture();

    await kanban.exportButton().click();
    const markdown = await kanban.readCapturedMarkdown();

    expect(markdown).toContain('(⭐32.7k)');
    expect(markdown).toMatch(/\(⭐\d+\.\dk\)/);
  });

  test('TC-015: Export normalizes language tags (C++ -> #lang/c)', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();
    await kanban.startMarkdownExportCapture();

    await kanban.exportButton().click();
    const markdown = await kanban.readCapturedMarkdown();

    expect(markdown).toContain('#lang/c');
  });

  test('TC-016: Export header includes current date format', async ({ page }) => {
    const kanban = new KanbanPage(page);
    await kanban.goto();
    await kanban.startMarkdownExportCapture();

    await kanban.exportButton().click();
    const markdown = await kanban.readCapturedMarkdown();

    expect(markdown).toMatch(/^# Antigravity Tool Research - \d{4}-\d{2}-\d{2}/);
  });
});
