

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.BW2a9D1C.js","_app/immutable/chunks/fMaAp8ef.js","_app/immutable/chunks/DzgE3F9E.js","_app/immutable/chunks/Dl-ksUSf.js"];
export const stylesheets = [];
export const fonts = [];
