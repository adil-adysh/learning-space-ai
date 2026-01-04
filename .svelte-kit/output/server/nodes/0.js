

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.DbJO53l1.js","_app/immutable/chunks/DQ01h2FL.js","_app/immutable/chunks/YQmcHDhG.js","_app/immutable/chunks/BI2BPtbz.js"];
export const stylesheets = [];
export const fonts = [];
