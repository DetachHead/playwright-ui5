import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'
import isCI from 'is-ci'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    globalSetup: require.resolve('./tests/globalSetup'),
    testDir: './tests',
    testMatch: /.*\.spec\.ts/u,
    /* Maximum time one test can run for. */
    timeout: 30 * 60 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000,
    },
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: isCI,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://localhost:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on',
        headless: isCI,
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
            },
        },

        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
            },
        },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',
}

export default config
