import { defineConfig, devices } from '@playwright/test'

// An unusual fixed port, and never reuse a server already on it: other local
// projects run dev servers on common ports, and tests must hit SprintLab.
const PORT = 4317
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  // `.e2e.ts` keeps these files out of Vitest's default `*.test.*` / `*.spec.*` match.
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Test the production build, as deployed, rather than the dev server.
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
