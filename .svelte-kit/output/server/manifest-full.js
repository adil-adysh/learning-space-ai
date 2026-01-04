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
		client: {start:"_app/immutable/entry/start.Y7jfESd4.js",app:"_app/immutable/entry/app.DQOGlod1.js",imports:["_app/immutable/entry/start.Y7jfESd4.js","_app/immutable/chunks/wQrN2lzV.js","_app/immutable/chunks/BgyVqQB0.js","_app/immutable/chunks/CMNNw03A.js","_app/immutable/entry/app.DQOGlod1.js","_app/immutable/chunks/BgyVqQB0.js","_app/immutable/chunks/D7ijz6kA.js","_app/immutable/chunks/B5PUMfxm.js","_app/immutable/chunks/CMNNw03A.js","_app/immutable/chunks/Ch9oNCAl.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
