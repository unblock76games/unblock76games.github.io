window.GAME_ID = 'simply-prop-hunt';
window.GAME_STORAGE_PREFIX = 'simply-prop-hunt';
window.GAME_VERSION = 'v0.9.1e';

if (!new URLSearchParams(window.location.search).get('noPoki') && window.PokiSDK) {

    PokiSDK.init().then(() => {
        console.log("Poki SDK successfully initialized");
        // fire your function to continue to game
    }).catch(() => {
        console.log("Initialized, but the user likely has adblock");
        // fire your function to continue to game
    });
}