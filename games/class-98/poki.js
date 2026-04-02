pauseGame  = function(){};
resumeGame = function(){};

PokiSDK.init().then(
    () => {
		startLoading();
        console.log("PokiSDK initialized");
    }   
).catch(
    () => {
		startLoading();
		//DataGame.isAdsBlock = true;
        console.log("Adblock enabled ", DataGame.isAdsBlock);
    }   
);
//PokiSDK.setDebug(true); //live disable

function showAdsPoki() {
	pauseGame();
	PokiSDK.commercialBreak().then(resumeGame);
	console.log("SHOW ADS POKI");
}