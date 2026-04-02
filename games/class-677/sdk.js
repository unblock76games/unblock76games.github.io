PokiSDK.init()
  .then(() => {
    console.log("PokiSDK initialized");
    PokiSDK.gameLoadingStart();
  })
  .catch(() => {
    console.log("Adblock enabled");
  });
//   PokiSDK.setDebug(true);

let adStatus = 0;

function getAdStatus() {
  return adStatus;
}

function gamePlayStart() {
  PokiSDK.gameplayStart();
}

function gamePlayStop() {
  PokiSDK.gameplayStop();
}

function showCommercialAD() {
  adStatus = 1;
  PokiSDK.commercialBreak()
    .then(() => {
      adStatus = 0;
      console.log("Commercial Break finished");
    })
    .catch(err => {
      adStatus = 0;
    });
}

function showRewardedAD() {
  adStatus = 1;
  PokiSDK.rewardedBreak().then(withReward => {
    adStatus = 0;
    console.log(`Should the user get a reward? ${withReward}`);
  });
}

function happyTime(intensity) {
  PokiSDK.happyTime(intensity);
}

function gameLoadingFinished() {
  PokiSDK.gameLoadingFinished();
}
