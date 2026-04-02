var pokiInitDone = false;

function initializePoki() {

  if (pokiInitDone) {
    onPokiInitialized();
  }
}

function pokiCommercialBreak() {
  PokiSDK.commercialBreak(() => {
    onPokiAdShow();
  }).then(() => {
    onPokiAdComplete();
  });
}

function pokiRewardedBreak() {
  PokiSDK.rewardedBreak(() => {
    onPokiAdShow();
  }).then((success) => {

      if(success) {
        onPokiAdCompleteWithReward();
      } else {
        onPokiAdComplete();
      }
  });
}

function pokiLoadingFinished() {
  PokiSDK.gameLoadingFinished();
}

function pokiGameplayStart() {
  PokiSDK.gameplayStart();
}

function pokiGameplayStop() {
  PokiSDK.gameplayStop();
}
