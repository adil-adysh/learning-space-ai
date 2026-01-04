

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.DiHytfQc.js","_app/immutable/chunks/B5PUMfxm.js","_app/immutable/chunks/BgyVqQB0.js","_app/immutable/chunks/DWiubQqv.js"];
export const stylesheets = [];
export const fonts = [];
