

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.BV1z0yvW.js","_app/immutable/chunks/C1rc5x0e.js","_app/immutable/chunks/DljqI-rb.js","_app/immutable/chunks/CLt4up4s.js"];
export const stylesheets = [];
export const fonts = [];
