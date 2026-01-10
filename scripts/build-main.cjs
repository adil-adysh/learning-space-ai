"use strict";
const esbuild = require("esbuild");

(async () => {
	try {
		await esbuild.build({
			entryPoints: ["src/main.ts"],
			bundle: true,
			platform: "node",
			target: ["node18"],
			outfile: "dist/main.cjs",
			format: "cjs",
			sourcemap: true,
			external: ["electron", "./preload.cjs", "./dist/preload.cjs"],
		});

		await esbuild.build({
			entryPoints: ["src/preload.ts"],
			bundle: true,
			platform: "node",
			target: ["node18"],
			outfile: "dist/preload.cjs",
			format: "iife",
			sourcemap: true,
			external: ["electron"],
		});

		console.log("esbuild: main & preload built");
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();
