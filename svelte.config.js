import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: false,
    }),
    // Use relative paths for Electron file:// protocol
    paths: {
      base: '',
      assets: '',
    },
    appDir: '_app',
    // Disable prerendering for Electron SPA mode
    prerender: {
      entries: [],
    },
    // Announce route changes for accessibility
    inlineStyleThreshold: 1024,
  },
};

export default config;
