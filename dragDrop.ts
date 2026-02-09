import { Page, Locator } from '@playwright/test';

/**
 * Bulletproof drag-drop for React components
 * Works across Chromium, Firefox, WebKit (including Mobile Safari)
 */
export async function dragAndDrop(
    page: Page,
    source: string | Locator,
    target: string | Locator,
    options: {
        waitAfterDrop?: number;
    } = {}
) {
    const { waitAfterDrop = 500 } = options;

    // Convert selectors to locators
    const sourceLocator = typeof source === 'string' ? page.locator(source) : source;
    const targetLocator = typeof target === 'string' ? page.locator(target) : target;

    // Critical: Create DataTransfer in browser context
    const dataTransferHandle = await page.evaluateHandle(() => new DataTransfer());

    // Step 1: Fire dragstart with proper dataTransfer
    await sourceLocator.dispatchEvent('dragstart', {
        dataTransfer: dataTransferHandle,
        bubbles: true,
        cancelable: true
    });

    // Step 2: Fire dragenter on target
    await targetLocator.dispatchEvent('dragenter', {
        dataTransfer: dataTransferHandle,
        bubbles: true,
        cancelable: true
    });

    // Step 3: Fire dragover (required for drop to work)
    await targetLocator.dispatchEvent('dragover', {
        dataTransfer: dataTransferHandle,
        bubbles: true,
        cancelable: true
    });

    // Step 4: Fire drop event
    await targetLocator.dispatchEvent('drop', {
        dataTransfer: dataTransferHandle,
        bubbles: true,
        cancelable: true
    });

    // Step 5: Fire dragend on source (cleanup)
    await sourceLocator.dispatchEvent('dragend', {
        dataTransfer: dataTransferHandle,
        bubbles: true,
        cancelable: true
    });

    // Wait for React state updates
    await page.waitForTimeout(waitAfterDrop);
}
