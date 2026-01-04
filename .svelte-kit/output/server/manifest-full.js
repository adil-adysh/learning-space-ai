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
		client: {start:"_app/immutable/entry/start.LktIkzC-.js",app:"_app/immutable/entry/app.Biwtxfn-.js",imports:["_app/immutable/entry/start.LktIkzC-.js","_app/immutable/chunks/w2vjddhQ.js","_app/immutable/chunks/YQmcHDhG.js","_app/immutable/chunks/CQw7RRnt.js","_app/immutable/entry/app.Biwtxfn-.js","_app/immutable/chunks/YQmcHDhG.js","_app/immutable/chunks/CVmzytAt.js","_app/immutable/chunks/DQ01h2FL.js","_app/immutable/chunks/CQw7RRnt.js","_app/immutable/chunks/CKJ7kUYQ.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
