import { expect, Locator, Page } from '@playwright/test';

export type ColumnId = 'todo' | 'inProgress' | 'done';

import { dragAndDrop } from '../helpers/dragDrop';

export class KanbanPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForBoardReady();
  }

  async waitForBoardReady() {
    await expect(this.page.getByRole('heading', { name: 'Antigravity Research Board' })).toBeVisible();
    await expect(this.column('todo')).toBeVisible();
  }

  column(id: ColumnId): Locator {
    return this.page.getByTestId(`kanban-column-${id}`);
  }

  columnCount(id: ColumnId): Locator {
    return this.page.getByTestId(`column-count-${id}`);
  }

  getImportInput(): Locator {
    return this.page.locator('input[type="file"][accept=".md"]');
  }

  exportButton(): Locator {
    return this.page.getByRole('button', { name: 'Export to Obsidian' });
  }

  cardByName(name: string): Locator {
    return this.page.locator('[data-testid^="repo-card-"]').filter({ hasText: name });
  }

  cardInColumn(name: string, column: ColumnId): Locator {
    return this.column(column).locator('[data-testid^="repo-card-"]').filter({ hasText: name });
  }

  cardLink(name: string): Locator {
    return this.cardByName(name).locator('a[title="Open Repository"]');
  }

  priorityIconForCard(name: string): Locator {
    return this.cardByName(name).getByTestId('priority-icon');
  }

  async getColumnCount(id: ColumnId): Promise<number> {
    const text = (await this.columnCount(id).innerText()).trim();
    return Number.parseInt(text, 10);
  }

  async getColumnCardNames(id: ColumnId): Promise<string[]> {
    return this.column(id)
      .getByTestId('card-title')
      .allInnerTexts();
  }

  async dragAndDrop(source: Locator, target: Locator) {
    await dragAndDrop(this.page, source, target);
  }

  async moveCardToColumn(cardName: string, target: ColumnId) {
    await this.dragAndDrop(this.cardByName(cardName), this.column(target));
  }

  async dragCardToInvalidZone(cardName: string) {
    const source = this.cardByName(cardName);
    const invalidTarget = this.page.locator('header');
    await this.dragAndDrop(source, invalidTarget);
  }

  async expectCardInColumn(cardName: string, column: ColumnId) {
    await expect(this.cardInColumn(cardName, column)).toBeVisible();
  }

  async expectCardNotInColumn(cardName: string, column: ColumnId) {
    await expect(this.cardInColumn(cardName, column)).toHaveCount(0);
  }

  async setImportContent(fileName: string, content: string) {
    await this.getImportInput().setInputFiles({
      name: fileName,
      mimeType: 'text/markdown',
      buffer: Buffer.from(content, 'utf-8')
    });
  }

  async acceptConfirmationDialog() {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  async mockFileReader(fileNameToContent: Record<string, string>) {
    await this.page.addInitScript((payload) => {
      class MockFileReader {
        onload: ((event: { target: { result: string } }) => void) | null = null;
        result: string | null = null;

        readAsText(file: { name?: string }) {
          const content = (file && file.name && payload[file.name]) || '';
          this.result = content;
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: content } });
            }
          }, 0);
        }
      }

      Object.defineProperty(window, 'FileReader', {
        configurable: true,
        writable: true,
        value: MockFileReader
      });
    }, fileNameToContent);
  }

  async startMarkdownExportCapture() {
    await this.page.evaluate(() => {
      // @ts-expect-error test-only bridge
      window.__capturedMarkdown = '';
      const originalCreateObjectURL = URL.createObjectURL.bind(URL);
      URL.createObjectURL = (blob: Blob) => {
        blob.text().then((text) => {
          // @ts-expect-error test-only bridge
          window.__capturedMarkdown = text;
        });
        return originalCreateObjectURL(blob);
      };
    });
  }

  async readCapturedMarkdown(): Promise<string> {
    await expect.poll(async () => {
      return this.page.evaluate(() => {
        // @ts-expect-error test-only bridge
        return window.__capturedMarkdown || '';
      });
    }).not.toBe('');

    return this.page.evaluate(() => {
      // @ts-expect-error test-only bridge
      return window.__capturedMarkdown as string;
    });
  }
}
