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
		client: {start:"_app/immutable/entry/start.B2gFeZuD.js",app:"_app/immutable/entry/app.BcGMR84F.js",imports:["_app/immutable/entry/start.B2gFeZuD.js","_app/immutable/chunks/CvnhLNiI.js","_app/immutable/chunks/S5IkUKKS.js","_app/immutable/chunks/DuYnsd-i.js","_app/immutable/entry/app.BcGMR84F.js","_app/immutable/chunks/S5IkUKKS.js","_app/immutable/chunks/DoppdJSp.js","_app/immutable/chunks/ULpU1OEv.js","_app/immutable/chunks/DuYnsd-i.js","_app/immutable/chunks/DNNsX8Uk.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
