function CMain(oData){
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    
    var _oPreloader;
    var _oMenu;
    var _oHelp;
    var _oGame;

    this.initContainer = function(){
        s_oCanvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(s_oCanvas);
        s_oStage.preventSelection = false;
        createjs.Touch.enable(s_oStage);
		
	s_bMobile = jQuery.browser.mobile;
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
            $('body').on('contextmenu', '#canvas', function(e){ return false; });
        }
		
        s_iPrevTime = new Date().getTime();

	createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.setFPS(FPS);
        
        if(navigator.userAgent.match(/Windows Phone/i)){
                DISABLE_SOUND_MOBILE = true;
        }
        
        s_oSpriteLibrary  = new CSpriteLibrary();

        PokiSDK.init().then(
            () => {
                // successfully initialized
                //console.log("PokiSDK initialized");
                // continue to game
                
                //ADD PRELOADER
                _oPreloader = new CPreloader();
            }   
        ).catch(
            () => {
                // initialized but the user has an adblock
                //console.log("Adblock enabled");
                // feel free to kindly ask the user to disable AdBlock, like forcing weird usernames or showing a sad face; be creative!
                // continue to the game
        
                //ADD PRELOADER
                _oPreloader = new CPreloader();
            }   
        );
        PokiSDK.setDebug(false);
        
    };
    
    this.preloaderReady = function(){
        //POKI_TRACKER.track(poki.tracking.screen.gameLoaderStart);
        PokiSDK.gameLoadingStart();
        
        s_oMain._loadImages();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            s_oMain._initSounds();
        }
    };
    
    this.soundLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);

        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});

        if(_iCurResource === RESOURCE_TO_LOAD){
            this._allResourcesLoaded();
        }
    };
    
    this._initSounds = function(){
    
        var aSoundsInfo = new Array();
        aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        aSoundsInfo.push({path: './sounds/',filename:'money',loop:false,volume:1, ingamename: 'money'});
        aSoundsInfo.push({path: './sounds/',filename:'spinner_noise',loop:false,volume:1, ingamename: 'spinner_noise'});
        aSoundsInfo.push({path: './sounds/',filename:'upgrade',loop:false,volume:1, ingamename: 'upgrade'});
        
        RESOURCE_TO_LOAD += aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<aSoundsInfo.length; i++){
            s_aSounds[aSoundsInfo[i].ingamename] = new Howl({ 
                                                            src: [aSoundsInfo[i].path+aSoundsInfo[i].filename+'.mp3', aSoundsInfo[i].path+aSoundsInfo[i].filename+'.ogg'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: aSoundsInfo[i].loop, 
                                                            volume: aSoundsInfo[i].volume,
                                                            onload: s_oMain.soundLoaded()
                                                        });
        }
        
    };  
    
    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("but_play","./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("msg_box","./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("but_credits","./sprites/but_credits.png");
        s_oSpriteLibrary.addSprite("ctl_logo","./sprites/ctl_logo.png");
        
        s_oSpriteLibrary.addSprite("bg_game","./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","./sprites/but_fullscreen.png");
        
        s_oSpriteLibrary.addSprite("but_yes","./sprites/but_yes.png");
        s_oSpriteLibrary.addSprite("but_no","./sprites/but_no.png");
        s_oSpriteLibrary.addSprite("but_home","./sprites/but_home.png");
        s_oSpriteLibrary.addSprite("but_restart","./sprites/but_restart.png");
        
        s_oSpriteLibrary.addSprite("bar_bg","./sprites/bar_bg.png");
        s_oSpriteLibrary.addSprite("bar_fill","./sprites/bar_fill.png");
        s_oSpriteLibrary.addSprite("multiplier_bg","./sprites/multiplier_bg.png");
        s_oSpriteLibrary.addSprite("swipe_icon","./sprites/swipe_icon.png");
        s_oSpriteLibrary.addSprite("coin","./sprites/coin.png");
        s_oSpriteLibrary.addSprite("but_friction","./sprites/but_friction.png");
        s_oSpriteLibrary.addSprite("but_max_speed","./sprites/but_max_speed.png");
        s_oSpriteLibrary.addSprite("but_change","./sprites/but_change.png");
        s_oSpriteLibrary.addSprite("but_friction","./sprites/but_friction.png");
        s_oSpriteLibrary.addSprite("but_max_speed","./sprites/but_max_speed.png");
        s_oSpriteLibrary.addSprite("but_change","./sprites/but_change.png");
        s_oSpriteLibrary.addSprite("bg_spinner_panel","./sprites/bg_spinner_panel.png");
        s_oSpriteLibrary.addSprite("buy_spinner_bg","./sprites/buy_spinner_bg.png");
        s_oSpriteLibrary.addSprite("arrow_left","./sprites/arrow_left.png");
        s_oSpriteLibrary.addSprite("arrow_right","./sprites/arrow_right.png");
        
        s_oSpriteLibrary.addSprite("spinner","./sprites/spinner.png");
        s_oSpriteLibrary.addSprite("spinner_center","./sprites/spinner_center.png");
        
        

        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        if(_iCurResource === RESOURCE_TO_LOAD){
            this._allResourcesLoaded();
        }
    };
    
    this._allResourcesLoaded = function(){
        //POKI_TRACKER.track(poki.tracking.screen.gameLoaderFinished);
        PokiSDK.gameLoadingFinished();
        
        s_oLocalStorage = new CLocalStorage();

        _oPreloader.unload();
        
        if (!isIOS()) {
            s_oSoundTrack = playSound("soundtrack", 1,true); 
        }
        
        s_oMain.gotoMenu();
        
    };
    
    this.pokiShowCommercial = function(oCb){
        s_oMain.stopUpdate();
        PokiSDK.commercialBreak().then(
            () => {
                //console.log("Commercial Break finished");
                s_oMain.startUpdate();
                if(oCb){
                    oCb();
                }
            }
        );
    };
    
    this._onAllImagesLoaded = function(){
        
    };
    
    this.onAllPreloaderImagesLoaded = function(){

    };
    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };   

    this.gotoGame = function(){
        _oGame = new CGame(_oData);  
        
        _iState = STATE_GAME;
    };
    
    this.gotoHelp = function(){
        _oHelp = new CHelp();
        _iState = STATE_HELP;
    };

    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $("#block_game").css("display","block");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }
        
    };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(s_bAudioActive){
                Howler.mute(false);
            }
        }
        
    };
    
    this._update = function(event){
        if(_bUpdate === false){
                return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;
        
        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }
                
        if(_iState === STATE_GAME){
            _oGame.update();
        }
        
        s_oStage.update(event);

    };
    
    s_oMain = this;
    
    _oData = oData;
    NUM_SWIPE = oData.num_swipe;
    ENABLE_FULLSCREEN = oData.fullscreen;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    NUM_SPINS_FOR_ADS = oData.num_spins_for_ads;
    
    this.initContainer();
}
var s_bMobile;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oCanvas;
var s_bFullscreen = false;
var s_oSoundTrack = null;
var s_aSounds;
var s_oLocalStorage;
var s_bFirstTimePlay = true;