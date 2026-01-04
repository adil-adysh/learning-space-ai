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
		client: {start:"_app/immutable/entry/start.B4DUE-fB.js",app:"_app/immutable/entry/app.CeSCWBkY.js",imports:["_app/immutable/entry/start.B4DUE-fB.js","_app/immutable/chunks/C59s4Hco.js","_app/immutable/chunks/DljqI-rb.js","_app/immutable/chunks/DEdcqu9q.js","_app/immutable/entry/app.CeSCWBkY.js","_app/immutable/chunks/DljqI-rb.js","_app/immutable/chunks/AcsUjBIT.js","_app/immutable/chunks/C1rc5x0e.js","_app/immutable/chunks/DEdcqu9q.js","_app/immutable/chunks/COjQm-7I.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
