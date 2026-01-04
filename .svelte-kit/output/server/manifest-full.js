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
		client: {start:"_app/immutable/entry/start.CO6dtK7U.js",app:"_app/immutable/entry/app.Cg0F8xHV.js",imports:["_app/immutable/entry/start.CO6dtK7U.js","_app/immutable/chunks/DPz34o5g.js","_app/immutable/chunks/DoPReKMj.js","_app/immutable/chunks/CCiP9t0x.js","_app/immutable/entry/app.Cg0F8xHV.js","_app/immutable/chunks/DoPReKMj.js","_app/immutable/chunks/C9RPriGG.js","_app/immutable/chunks/up6PPZA2.js","_app/immutable/chunks/CCiP9t0x.js","_app/immutable/chunks/Buq5sgrN.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
