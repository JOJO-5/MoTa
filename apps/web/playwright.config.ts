import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = path.dirname(fileURLToPath(import.meta.url))
const viteEntry = path.join(webRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const viteCommand = path.join(
  webRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vite.cmd' : 'vite'
)
const systemChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const chromiumExecutablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
  (process.platform === 'win32' && existsSync(systemChrome) ? systemChrome : undefined)

const chromiumLaunchOptions = {
  args: ['--use-gl=swiftshader'],
  ...(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {}),
}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    // Invoke Vite's JS entry directly on Windows; quoting a .cmd shim can
    // leave Playwright waiting forever without ever opening the web server.
    command:
      process.platform === 'win32'
        ? `node "${viteEntry}" --host 127.0.0.1`
        : `"${viteCommand}" --host 127.0.0.1`,
    cwd: webRoot,
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: chromiumLaunchOptions,
      },
    },
    {
      name: 'mobile-pixel-7',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
        launchOptions: chromiumLaunchOptions,
      },
    },
  ],
})
