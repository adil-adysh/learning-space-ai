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
		client: {start:"_app/immutable/entry/start.DbFdsn0X.js",app:"_app/immutable/entry/app.DkC2SyZT.js",imports:["_app/immutable/entry/start.DbFdsn0X.js","_app/immutable/chunks/B9qLDZ5C.js","_app/immutable/chunks/B1B6PQ97.js","_app/immutable/entry/app.DkC2SyZT.js","_app/immutable/chunks/B1B6PQ97.js","_app/immutable/chunks/CCWcSCnQ.js","_app/immutable/chunks/B2XB6Hb_.js","_app/immutable/chunks/BHP9vwf3.js","_app/immutable/chunks/NIXgpxN9.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
