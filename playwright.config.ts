import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // Parallel execution for faster CI (Codex Business has better quotas)
    fullyParallel: true,
    workers: process.env.CI ? 2 : 4,

    // Test isolation for drag-drop state management
    projects: [
        {
            name: 'chromium-desktop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
            },
        },
        {
            name: 'webkit-mobile',
            use: {
                ...devices['iPhone 13'],
                isMobile: true,
                hasTouch: true, // Critical for touch drag-drop
            },
        },
        {
            name: 'firefox-desktop',
            use: {
                ...devices['Desktop Firefox'],
                // Firefox has different drag-drop behavior
                launchOptions: {
                    firefoxUserPrefs: {
                        'dom.dataTransfer.mozAtAPIs': true,
                    }
                }
            },
        }
    ],

    // Codex-optimized timeouts (account for proxy routing)
    use: {
        actionTimeout: 15000, // Antigravity → Codex Business latency buffer
        navigationTimeout: 30000,
        trace: 'retain-on-failure', // Codex can analyze traces
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',

        // Base URL for local dev or CI deployment
        baseURL: process.env.BASE_URL || 'http://localhost:5173',
    },

    // Single test directory - all Codex-generated
    testDir: './tests/e2e',
    testMatch: '**/*.spec.ts',

    // Retry strategy for flaky drag-drop
    retries: process.env.CI ? 2 : 0,

    // Reporter configuration for Codex analysis
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results.json' }], // Feed back to Codex for failure analysis
        ['list'], // Console output
    ],

    // Shared test fixtures
    // globalSetup: require.resolve('./tests/global-setup'),

    // Environment setup
    webServer: {
        command: 'npm run dev',
        port: 5173,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
