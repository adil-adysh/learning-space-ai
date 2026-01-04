

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.Bo_5YgFV.js","_app/immutable/chunks/ULpU1OEv.js","_app/immutable/chunks/S5IkUKKS.js","_app/immutable/chunks/9kEBWlIL.js"];
export const stylesheets = [];
export const fonts = [];
