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
		client: {start:"_app/immutable/entry/start.CY_tYWA3.js",app:"_app/immutable/entry/app.CCkPz9jS.js",imports:["_app/immutable/entry/start.CY_tYWA3.js","_app/immutable/chunks/BJXArWC2.js","_app/immutable/chunks/BVvvFQyP.js","_app/immutable/entry/app.CCkPz9jS.js","_app/immutable/chunks/BVvvFQyP.js","_app/immutable/chunks/-U615j4X.js","_app/immutable/chunks/BGw5cKeJ.js","_app/immutable/chunks/Du0dFdXu.js","_app/immutable/chunks/CaNZ-tzt.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
