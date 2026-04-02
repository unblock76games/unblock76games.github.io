var PokiPlugin = {
    adblock : false,
    canShowAds : false,
    init : function(){
        var isMobile = Utils.getURLParam('isMobile');
    
        if(isMobile){
            console.log('It works in mobile application wrapper, PokiSDK wont be working');
            
            return false;
        }

        var style = document.createElement('style');
        style.innerHTML = '#application-console{ display:none; }'
        document.head.appendChild(style);
        
        var script = document.createElement('script');
        script.src = '/poki-sdk.js';
        script.onload = function(){
            PokiPlugin.onLoad();
        };

        document.head.append(script);
    },
    onLoad : function(){
        PokiSDK.init({ volume: 0.35 }).then(function(){
            console.log('PokiSDK Loaded!');
            PokiPlugin.loadCompleted();
            PokiPlugin.canShowAds = true;
        }).catch(function(){
            PokiPlugin.adblock = true;
            PokiPlugin.loadCompleted();
            console.log('Initialized, but the user likely has adblock');
        });
    },
    loadCompleted : function(){
        //requested to fire after load complete
        PokiSDK.gameLoadingFinished();

        //has been requested by Poki to trigger commercial before gameplay
        PokiPlugin.showMidroll();
        //PokiPlugin.playGame();

        Utils.logCheckpoint('first_entry');
    },
    pauseGame : function(){
        if(typeof pc !== 'undefined'){
            pc.app.timeScale = 0;

            if(pc.app.systems && pc.app.systems.sound){
                pc.app.systems.sound.volume = 0;
            }

            pc.app.fire('Player:Stop');
            pc.app.fire('Gameplay:Pause');
        }
        
        PokiSDK.gameplayStop();
    },
    playGame : function(){
        if(typeof pc !== 'undefined'){
            pc.app.timeScale = 1;

            if(pc.app.systems && pc.app.systems.sound){
                pc.app.systems.sound.volume = 0.5;
            }
            
            pc.app.fire('Gameplay:Play');
        }

        try{
            PokiSDK.gameplayStart();
        }catch(e){

        }
    },
    showMidroll : function(callback){
        try{
            PokiSDK.commercialBreak(function(){
                PokiPlugin.pauseGame();
            }).then(function(success){
                if(callback){
                    callback(success);
                }

                PokiPlugin.playGame();
            });
        }catch(e){
            PokiPlugin.playGame();
        }
    },
    showReward : function(callback){
        if(PokiPlugin.adblock){
            return false;
        }

        if(!PokiPlugin.canShowAds){
            return false;
        }

        PokiSDK.rewardedBreak(function(){
            PokiPlugin.pauseGame();
        }).then(function(success){
            if(success){
                callback(success);
            }
        
            PokiPlugin.playGame();
        });
    }
};

PokiPlugin.init();

window.addEventListener('keydown', function(ev){
    if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
        ev.preventDefault();
    }
});

window.addEventListener('wheel', function(ev){
    ev.preventDefault()
}, { passive: false });

//disable context
window.addEventListener('contextmenu', function(ev){
    ev.preventDefault();
});
