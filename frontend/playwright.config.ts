import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

type getGoogleCredentialsType = {
  GOOGLE_CLIENT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
};

function getGoogleCredentials(): getGoogleCredentialsType {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    };
  }
  const encoded_creds = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (!encoded_creds) {
    throw new Error(`Missing google creds`);
  }
  const decoded_creds = JSON.parse(atob(encoded_creds));
  return {
    GOOGLE_CLIENT_EMAIL: decoded_creds.client_email,
    GOOGLE_PRIVATE_KEY: decoded_creds.private_key,
  };
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './test',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        VITE_FIREBASE_EMULATE: 'true',
        VITE_FIREBASE_EMULATOR_URL: 'http://localhost:9099',
        GOOGLE_STORAGE_BUCKET: 'pq-reference-app-dev.firebasestorage.app',
        VITE_API_URL: 'http://127.0.0.1:3000',
      },
    },
    {
      command: 'npm run firebase:emulator',
      url: 'http://localhost:9099',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'npm run start -w backend',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      url: 'http://localhost:3000/users',
      cwd: '..',
      env: {
        FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
        GOOGLE_STORAGE_BUCKET: 'pq-reference-app-dev.firebasestorage.app',
        FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
        ...getGoogleCredentials(),
      },
    },
  ],
});
