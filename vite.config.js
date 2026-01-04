import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Electron compatibility
	base: './', // Use relative paths for file:// protocol
	build: {
		target: 'esnext',
		outDir: 'build'
	},
	server: {
		port: 5173,
		strictPort: true
	}
});
