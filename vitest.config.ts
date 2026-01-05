import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: [],
    projects: [
      {
        test: {
          name: 'unit',
          globals: true,
          environment: 'node',
          include: ['src/**/*.unit.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          globals: true,
          include: ['src/**/*.svelte.test.ts'],
          browser: {
            enabled: true,
            provider: playwright({
              launchOptions: { headless: true },
            }),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: './src/setupTests.ts',
        },
      },
    ],
  },
});
