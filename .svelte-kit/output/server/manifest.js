export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.CTY4z1-S.js",app:"_app/immutable/entry/app.BmHxupA7.js",imports:["_app/immutable/entry/start.CTY4z1-S.js","_app/immutable/chunks/JSRwZYkv.js","_app/immutable/chunks/DzgE3F9E.js","_app/immutable/chunks/CpuRQmVs.js","_app/immutable/entry/app.BmHxupA7.js","_app/immutable/chunks/DzgE3F9E.js","_app/immutable/chunks/DnIN349N.js","_app/immutable/chunks/fMaAp8ef.js","_app/immutable/chunks/CpuRQmVs.js","_app/immutable/chunks/Dw-W-a9x.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
