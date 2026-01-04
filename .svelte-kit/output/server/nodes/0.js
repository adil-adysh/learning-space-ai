

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.BaTY1Vcd.js","_app/immutable/chunks/up6PPZA2.js","_app/immutable/chunks/DoPReKMj.js","_app/immutable/chunks/C3QwWZOA.js"];
export const stylesheets = [];
export const fonts = [];
