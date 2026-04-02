let VERSION_TIMESTAMP = "1640300674";
let forceCacheUrls = [
	"/",
	"/css.css",
	"/js.js",
	"/img/NuggetRoyaleLogo.png",
	"NuggetRoyale.woff2",
	"img/closeButton.svg",
	"img/cornerSettings/musicOn.svg",
	"img/cornerSettings/musicOff.svg",
	"img/cornerSettings/sfxOn.svg",
	"img/cornerSettings/sfxOff.svg",
];

let excludeCacheUrls = [
	"/config.json",
	"/leaderboard.json",
]

self.addEventListener("install", e => {
	e.waitUntil(onInstall());
});

async function onInstall(){
	await self.skipWaiting();
	let cache = await openCache();
	await cache.addAll(forceCacheUrls.map(url => new Request(url+"?v="+VERSION_TIMESTAMP)));
}

self.addEventListener("activate", e => {
	e.waitUntil(onActivate());
});

async function onActivate(){
	//clear old caches
	let keys = await caches.keys();
	for(const key of keys){
		let result = /mainCacheV(\d+)/.exec(key);
		if(result && result[1] != VERSION_TIMESTAMP){
			await caches.delete(key);
		}
	}
}

self.addEventListener("message", e => {
	e.waitUntil(this.onMessage(e));
});

async function onMessage(e){
	if(e.data.opCode){
		if(e.data.opCode == "messageWithResponse"){
			let result = null;
			if(e.data.opCode2){
				if(e.data.opCode2 == "newWindow"){
					let windows = await clients.matchAll({includeUncontrolled: true, type: "window"});
					if(windows.length > 1){
						for(const w of windows){
							if(w.id != e.source.id){
								w.postMessage({
									opCode: "otherWindowOpened",
								});
							}
						}
					}
				}
			}
			e.source.postMessage({
				opCode: "messageWithResponse",
				id: e.data.id,
				result: result,
			});
		}
	}
}

self.addEventListener("fetch", e => {
	if(VERSION_TIMESTAMP === "000") return;
	let url = new URL(e.request.url);
	let origin = url.origin;
	if(!origin.endsWith("/")) origin += "/";
	if(origin == self.registration.scope && !excludeCacheUrls.includes(url.pathname)){
		e.respondWith(getUrlFromCache(e));
	}
});

async function getUrlFromCache(e){
	let cacheResponse = await caches.match(e.request, {
		ignoreSearch: true,
	});
	if(cacheResponse) return cacheResponse;

	let fetchResponse = await fetch(e.request);
	if(fetchResponse.ok){
		let cache = await openCache();
		cache.put(e.request, fetchResponse.clone())
	}
	return fetchResponse;
}

async function openCache(){
	return await caches.open("mainCacheV"+VERSION_TIMESTAMP);
}
