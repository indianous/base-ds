/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  test: {
    passWithNoTests: true,
    // Caps the jsdom workers of the `unit` project (the default is one per CPU core minus one):
    // ~1.35 GB peak instead of ~2.5 GB on a 12-core machine, for ~6 s more. It doesn't limit the
    // browser projects — see `fileParallelism` there.
    maxWorkers: 4,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./src/setupTests.ts'],
          globals: true,
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          // One story file at a time: in parallel, each file got its own Chromium renderer
          // (~11 GB peak across both story projects). Sequential is ~3.3 GB and also faster.
          fileParallelism: false,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        // Same stories on the dark theme, so the a11y addon checks contrast in both themes.
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook-dark') })],
        test: {
          name: 'storybook-dark',
          fileParallelism: false,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
