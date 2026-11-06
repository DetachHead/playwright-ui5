import { type PlaywrightTestConfig, devices } from "@playwright/test";
import isCI from "is-ci";

/** See https://playwright.dev/docs/test-configuration. */
const config: PlaywrightTestConfig = {
  globalSetup: require.resolve("./tests/global-setup"),
  testDir: "./tests",
  testMatch: /.*\.spec\.ts/u,
  timeout: 30 * 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met. For example in `await
     * expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  forbidOnly: isCI,
  reporter: "html",
  use: {
    actionTimeout: 0,
    trace: "on",
    headless: isCI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],
};

export default config;
