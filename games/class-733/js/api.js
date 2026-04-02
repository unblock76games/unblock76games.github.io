
game_shell.onGameEvent = function(event){
    console.log('onGameEvent',event.msg);
    switch(event.msg){
        case "scripts_loaded":

            game_shell.poki.lock();

            game_shell.onReady = function() {
                core.GenericGame.prototype.bootstrap.call(this, game_shell.BootStrap);
                //add a dedicated mute controller to sound
                game_shell.poki.initSound();
            }

            PokiSDK.gameLoadingStart();

            core.screens.LoadScreen.prototype.run  = function(){
                this.loadBar = this.createBar();

                this.loadComplete = this._loadComplete.bind(this);

                if(!game_shell.loader.isLoading){
                    this.loadComplete();
                } else {
                    //NOTE - loader events are automatically removed on complete
                    var self = this;
                    game_shell.loader.on("progress", function(event){
                        self.loadBar.progress(event.value);
                        PokiSDK.gameLoadingProgress({
                            percentageDone: event.value
                        });
                    });
                    game_shell.loader.on("complete", this.loadComplete);
                }
            };
            core.screens.LoadScreen.prototype._loadComplete = function(){
                this.loadBar.progress(1);
                this.fadeOut();
                PokiSDK.gameLoadingFinished();
            };
            break;
        case 'game_start'://called on entering game screen
            if (!game_shell.keyController) {
                game_shell.keyController = new game_shell.poki.keys().init({});
            }
            break;
        case 'level_start'://on creation of a game scene
            PokiSDK.gameplayStart();
            break;
        case 'level_complete':
            PokiSDK.gameplayStop();

            //there are 40 levels, which was it? (currentLevel was already incremented)
            const levelIndex = game_shell.user.currentLevel - 1;
            const happiness = levelIndex / 40;
            console.log('level complete', levelIndex, happiness)
            PokiSDK.happyTime(happiness);
            break;
        case 'game_over':
            //console.log('onGameEvent',event.msg);
            break;
        case 'enter_menu'://called on entering the menu screen
            //console.log('onGameEvent',event.msg);
            game_shell.poki.disposeKeys();
            break;
        case 'exit_menu'://called when a level is selected in the menu
            game_shell.poki.showAdd();
            //console.log('onGameEvent',event.msg);
            break;
        case 'exit_to_menu'://called on pressing the home button in the game screen
            PokiSDK.gameplayStop();
            //game_shell.poki.showAdd();
            break;
        case 'restart_level':
            PokiSDK.gameplayStop();
            game_shell.poki.showAdd();
            break;
    }
};

game_shell.poki = {};

game_shell.poki.initSound = function() {
    //check for webaudio
    if (game_shell.snd.webAudio) {
        const snd = game_shell.snd.snd;
        snd.globalMute.node.disconnect(0);
        //create an additional mute
        game_shell.poki.gainNode = core.audio.WebAudioMgr.prototype.createGainNode.call(snd);
        //connect the new mute to the context destination
        game_shell.poki.gainNode.connect(snd.context.destination);
        //create the old global mute to the new mute
        snd.globalMute.connect(game_shell.poki.gainNode);
    }
}

game_shell.poki.muteSound = function(bool){
    game_shell.poki.gainNode.gain.value = bool ? 0 : 1;
}

game_shell.poki.showAdd = function() {
    game_shell.pauseController.pause(true);
    game_shell.poki.muteSound(true);
    try {
        console.log('show add')
        PokiSDK.commercialBreak()
        .then(
            () => { //you can also use a normal function here
                console.log('End of commercial break');
                game_shell.pauseController.pause(false);
                game_shell.poki.muteSound(false);
            }
        );
    } catch(e){
        game_shell.pauseController.pause(false);
        game_shell.snd.pause(false);
    }

}

game_shell.poki.init = function(callback) {
    PokiSDK.init().then(
        () => {
            // successfully initialized
            console.log("PokiSDK initialized");
            // continue to game
            callback();
        }
    ).catch(
        () => {
            // initialized but the user has an adblock
            console.log("Adblock enabled");
            // continue to the game
            callback();
        }
    );
}

game_shell.poki.disposeKeys = function(){
    if (game_shell.keyController) {
        game_shell.keyController.dispose();
        game_shell.keyController = null;
    }
}

game_shell.poki.keys = function() {

}

game_shell.poki.keys.prototype.init = function(config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.handleKey = this._handleKey.bind(this);

    this.currentIndex = 0;

    this.enable();

    return this;
}

game_shell.poki.keys.prototype._handleKey = function(event){
    //console.log('key', event.keyCode, event.key)
    //37 = left
    //38 = up
    //39 = right
    //40 = down
};

game_shell.poki.keys.prototype.dispose = function(){
    window.removeEventListener('keyup', this.handleKey)
}

game_shell.poki.keys.prototype.enable = function(){
    window.addEventListener('keyup', this.handleKey, false)
}

Object.defineProperties(core.display.Button.prototype, {
    blocks: {
        get: function() {
            return game_shell.screenMgr.currentScreen.scene.blocks;
        }
    }
});

game_shell.poki.lock = function() {
}
