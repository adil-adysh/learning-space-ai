

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.vUeAozSD.js","_app/immutable/chunks/t9XZ3s1d.js","_app/immutable/chunks/ChQVnDdA.js","_app/immutable/chunks/C0yemUDO.js"];
export const stylesheets = [];
export const fonts = [];
