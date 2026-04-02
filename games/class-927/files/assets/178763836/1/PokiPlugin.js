var PokiPlugin = {
    adblock : false,
    isPaused : false,
    canShowAds : false,
    isGamePaused : false,
    isAlreadyLoaded : false,
    midrollInterval : 60 * 2 + 5,
    lastMidroll : -1,
    totalGameplay : 0,
    init : function(){
        if(window.admob){
            PokiPlugin.onLoad();
            return false;
        }

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

        setInterval(function(){
            PokiPlugin.tick();
        }, 1000);
    },
    tick : function(){
        if(!this.isGamePaused){
            this.totalGameplay++;
        }
    },
    loadCompleted : function(){
        if(this.isAlreadyLoaded){
            return false;
        }

        //requested to fire after load complete
        PokiSDK.gameLoadingFinished();

        //has been requested by Poki to trigger commercial before gameplay
        //PokiPlugin.showMidroll();
        //PokiPlugin.playGame();

        this.isAlreadyLoaded = true;
    },
    onPause : function(){
        if(this.isGamePaused){
            return false;
        }

        if(typeof PokiSDK !== 'undefined'){
            PokiSDK.gameplayStop();
        }

        console.log('[POKI] Stop');

        this.isGamePaused = true;
    },
    pauseGame : function(){
        if(typeof pc !== 'undefined'){
            pc.app.timeScale = 0;
            PokiPlugin.isPaused = true;

            if(pc.app.systems && pc.app.systems.sound){
                pc.app.systems.sound.volume = 0;
            }

            pc.app.fire('Player:Stop');
            pc.app.fire('Gameplay:Pause');
        }
        
        PokiPlugin.onPause();
    },
    onPlay : function(){
        if(!this.isGamePaused){
            return false;
        }

        console.log('[POKI] Play');

        if(typeof PokiSDK !== 'undefined'){
            PokiSDK.gameplayStart();
        }

        this.lastGameplayStart = Date.now();
        this.isGamePaused = false;
    },
    firstGameplayEvent : function(){
        if(this.isAlreadyTriggered){
            return false;
        }

        if(typeof PokiSDK !== 'undefined'){
            PokiSDK.gameplayStart();
        }
        
        this.lastGameplayStart = Date.now();
        this.isAlreadyTriggered = true;
    },
    playGame : function(){
        if(typeof pc !== 'undefined'){
            pc.app.timeScale = 1;
            PokiPlugin.isPaused = false;

            if(pc.app.systems && pc.app.systems.sound){
                pc.app.systems.sound.volume = 1.0;
            }
            
            pc.app.fire('Gameplay:Play');
        }

        PokiPlugin.onPlay();
    },
    showMidroll : function(callback){
        if(Date.now() - this.lastMidroll < 1000){
            if(callback){
                callback();
            }

            return false;
        }

        Utils.addAdsEvent();

        if(typeof PokiSDK !== 'undefined'){
            PokiPlugin.pauseGame();

            PokiSDK.commercialBreak(function(){
                pc.app.mouse.disablePointerLock();
            }).
            then(function(success){
                if(callback){
                    callback(success);
                }

                PokiPlugin.playGame();
            });
        }else{
            callback();
        }

        this.lastMidroll = Date.now();
    },
    showConditionedMidroll : function(callback){
        if(typeof PokiSDK !== 'undefined'){
            if(
                PokiPlugin.totalGameplay >= PokiPlugin.midrollInterval
            ){
                PokiPlugin.showMidroll(function(){
                    callback();
                });

                PokiPlugin.totalGameplay = 0;
            }else{
                callback();
            }
        }else{
            callback();
        }
    },
    showReward : function(callback, options){
        Utils.addAdsEvent();
        
        if(PokiPlugin.adblock){
            if(typeof pc !== 'undefined'){
                pc.app.fire('Overlay:Adblock');
            }
            
            return false;
        }

        if(!PokiPlugin.canShowAds){
            if(typeof pc !== 'undefined'){
                pc.app.fire('Overlay:Adblock');
            }
            return false;
        }

        if(options && options.disableEvents){
            //events disabled
            console.log('Events disabled');
        }else{
            PokiPlugin.pauseGame();
        }

        pc.app.mouse.disablePointerLock();

        PokiSDK.rewardedBreak().
        then(function(success){
            if(success){
                callback(success);
            }
        
            if(options && options.disableEvents){
                console.log('Events disabled');
                //events disabled
            }else{
                PokiPlugin.playGame();
            }

            //pc.app.mouse.enablePointerLock();
        });

        PokiPlugin.totalGameplay = 0;
    }
};

//dom loaded
document.addEventListener('DOMContentLoaded', function() {
    PokiPlugin.init();
});

/*
window.addEventListener('mousemove', function(ev){
    PokiPlugin.firstGameplayEvent();
});
*/

window.addEventListener('mousedown', function(ev){
    PokiPlugin.firstGameplayEvent();
});

window.addEventListener('keydown', function(ev){
    PokiPlugin.firstGameplayEvent();
    
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