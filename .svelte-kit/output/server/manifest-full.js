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
		client: {start:"_app/immutable/entry/start.BB6rKwav.js",app:"_app/immutable/entry/app.C8Z5vAMb.js",imports:["_app/immutable/entry/start.BB6rKwav.js","_app/immutable/chunks/0Ar_k0hS.js","_app/immutable/chunks/D99GLro2.js","_app/immutable/chunks/45jJ2bl6.js","_app/immutable/entry/app.C8Z5vAMb.js","_app/immutable/chunks/D99GLro2.js","_app/immutable/chunks/BN-tp6At.js","_app/immutable/chunks/C-f-YIMz.js","_app/immutable/chunks/45jJ2bl6.js","_app/immutable/chunks/DR9Kj4yn.js","_app/immutable/chunks/8ftBPmIs.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
