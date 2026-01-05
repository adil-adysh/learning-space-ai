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
		client: {start:"_app/immutable/entry/start.BzKdjdzN.js",app:"_app/immutable/entry/app.zNLxA9rw.js",imports:["_app/immutable/entry/start.BzKdjdzN.js","_app/immutable/chunks/Pxr_jomG.js","_app/immutable/chunks/DFp9rl0W.js","_app/immutable/chunks/DZbSng_l.js","_app/immutable/entry/app.zNLxA9rw.js","_app/immutable/chunks/DFp9rl0W.js","_app/immutable/chunks/BWm9Vurl.js","_app/immutable/chunks/DURKmzXe.js","_app/immutable/chunks/DZbSng_l.js","_app/immutable/chunks/CcLtpFUX.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
