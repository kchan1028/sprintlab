import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { cspMetaPlugin } from './config/csp.ts'

// https://vite.dev/config/ and https://vitest.dev/config/
export default defineConfig({
  // GitHub Pages serves the app under /sprintlab/ (set by .github/workflows/pages.yml); everywhere else it's /.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), cspMetaPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
