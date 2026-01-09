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
		client: {start:"_app/immutable/entry/start.Cy7If_i3.js",app:"_app/immutable/entry/app.DYhfzf7T.js",imports:["_app/immutable/entry/start.Cy7If_i3.js","_app/immutable/chunks/Da2MPshA.js","_app/immutable/chunks/DpE5ENCz.js","_app/immutable/entry/app.DYhfzf7T.js","_app/immutable/chunks/DpE5ENCz.js","_app/immutable/chunks/CS-_FEE7.js","_app/immutable/chunks/Cya_I9ET.js","_app/immutable/chunks/DPMZ7aM5.js","_app/immutable/chunks/B-sDEcXw.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
