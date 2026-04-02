window.GAME_ID = 'cannon-clash';
window.GAME_STORAGE_PREFIX = 'cannon-clash';
window.GAME_VERSION = 'v0.9.5i';

if (!new URLSearchParams(window.location.search).get('noPoki') && window.PokiSDK) {

    PokiSDK.init().then(() => {
        console.log("Poki SDK successfully initialized");
        // fire your function to continue to game
    }).catch(() => {
        console.log("Initialized, but the user likely has adblock");
        // fire your function to continue to game
    });
}