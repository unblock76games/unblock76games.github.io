function CMain(oData) {
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;

    var _oPreloader;
    var _oMenu;
    var _oHelp;
    var _oGame;
    var _oLevelMenu;

    this.initContainer = function () {
        s_oCanvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(s_oCanvas);
        s_oStage.preventSelection = true;
        createjs.Touch.enable(s_oStage);

        s_bMobile = jQuery.browser.mobile;
        if (s_bMobile === false) {
            s_oStage.enableMouseOver(FPS);
            $('body').on('contextmenu', '#canvas', function (e) {
                return false;
            });
        }

        s_iPrevTime = new Date().getTime();

        createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.setFPS(FPS);
        createjs.Ticker.timingMode = createjs.Ticker.RAF;

        if (navigator.userAgent.match(/Windows Phone/i)) {
            DISABLE_SOUND_MOBILE = true;
        }

        s_oSpriteLibrary = new CSpriteLibrary();

        PokiSDK.init().then(
            () => {
                // successfully initialized
                // console.log("PokiSDK initialized");
                // continue to game
                
                //ADD PRELOADER
                _oPreloader = new CPreloader();
            }   
        ).catch(
            () => {
                // initialized but the user has an adblock
                // console.log("Adblock enabled");
                // feel free to kindly ask the user to disable AdBlock, like forcing weird usernames or showing a sad face; be creative!
                // continue to the game
        
                //ADD PRELOADER
                _oPreloader = new CPreloader();
            }   
        );
        //PokiSDK.setDebug(true);
    };

    this.preloaderReady = function () {
        PokiSDK.gameLoadingStart();
        
        this._loadImages();
        
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            this._initSounds();
        }

        
        _bUpdate = true;
    };

    this.soundLoaded = function () {
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource / RESOURCE_TO_LOAD * 100);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        _oPreloader.refreshLoader(iPerc);

        if (_iCurResource === RESOURCE_TO_LOAD) {
           this._onRemovePreloader();
        }
    };
    
    this._initSounds = function(){
        var aSoundsInfo = new Array();
        aSoundsInfo.push({path: './sounds/',filename:'hit_ball',loop:false,volume:1, ingamename: 'hit_ball'});
        aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        aSoundsInfo.push({path: './sounds/',filename:'game_over',loop:false,volume:1, ingamename: 'game_over'});
        aSoundsInfo.push({path: './sounds/',filename:'hit_court',loop:false,volume:1, ingamename: 'hit_court'});
        aSoundsInfo.push({path: './sounds/',filename:'lose_match',loop:false,volume:1, ingamename: 'lose_match'});
        aSoundsInfo.push({path: './sounds/',filename:'crowd_applauses',loop:false,volume:1, ingamename: 'crowd_applauses'});
        aSoundsInfo.push({path: './sounds/',filename:'crowd_disappoint',loop:false,volume:1, ingamename: 'crowd_disappoint'});
        aSoundsInfo.push({path: './sounds/',filename:'crowd_disappoint',loop:false,volume:1, ingamename: 'crowd_disappoint'});
        aSoundsInfo.push({path: './sounds/',filename:'win_match',loop:false,volume:1, ingamename: 'win_match'});
        aSoundsInfo.push({path: './sounds/',filename:'out',loop:false,volume:1, ingamename: 'out'});
        aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
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

    this._loadImages = function () {
        s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);

        s_oSpriteLibrary.addSprite("but_play", "./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("msg_box", "./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("ctl_logo", "./sprites/ctl_logo.png");
        s_oSpriteLibrary.addSprite("but_info", "./sprites/but_info.png");
        s_oSpriteLibrary.addSprite("but_yes_big", "./sprites/but_yes_big.png");
        s_oSpriteLibrary.addSprite("but_exit_big", "./sprites/but_exit_big.png");
        s_oSpriteLibrary.addSprite("but_home", "./sprites/but_home.png");
        s_oSpriteLibrary.addSprite("but_continue", "./sprites/but_continue.png");
        s_oSpriteLibrary.addSprite("but_restart", "./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("but_level", "./sprites/but_level.png");
        s_oSpriteLibrary.addSprite("but_pause", "./sprites/but_pause.png");
        s_oSpriteLibrary.addSprite("but_continue_big", "./sprites/but_continue_big.png");
        s_oSpriteLibrary.addSprite("but_fullscreen", "./sprites/but_fullscreen.png");

        s_oSpriteLibrary.addSprite("bg_menu", "./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("bg_game", "./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("bg_level_menu", "./sprites/bg_level_menu.jpg");

        s_oSpriteLibrary.addSprite("but_exit", "./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("audio_icon", "./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("score_board", "./sprites/score_board.png");

        s_oSpriteLibrary.addSprite("ball", "./sprites/ball.png");
        s_oSpriteLibrary.addSprite("ball_shadow", "./sprites/ball_shadow.png");

        s_oSpriteLibrary.addSprite("power_bar_bg", "./sprites/power_bar_bg.png");
        s_oSpriteLibrary.addSprite("power_bar_fill", "./sprites/power_bar_fill.png");
        s_oSpriteLibrary.addSprite("power_bar_frame", "./sprites/power_bar_frame.png");

        s_oSpriteLibrary.addSprite("arrow_left", "./sprites/arrow_left.png");
        s_oSpriteLibrary.addSprite("arrow_right", "./sprites/arrow_right.png");
        s_oSpriteLibrary.addSprite("ball_trajectory", "./sprites/ball_trajectory.png");
        s_oSpriteLibrary.addSprite("cursor", "./sprites/cursor.png");
        s_oSpriteLibrary.addSprite("hand_touch", "./sprites/hand_touch.png");
        s_oSpriteLibrary.addSprite("net", "./sprites/net.png");
        s_oSpriteLibrary.addSprite("msg_box_big", "./sprites/msg_box_big.png");
        s_oSpriteLibrary.addSprite("placeholder", "./sprites/placeholder.png");
        s_oSpriteLibrary.addSprite("pattern_screen", "./sprites/pattern_screen.png");

        for (var i = 0; i < SPRITE_NAME_PLAYER.length; i++) {
            s_oSpriteLibrary.addSprite(SPRITE_NAME_PLAYER[i], "./sprites/player/" + SPRITE_NAME_PLAYER[i] + ".png");
        }

        for (var i = 0; i < SPRITE_NAME_OPPONENT.length; i++) {
            s_oSpriteLibrary.addSprite(SPRITE_NAME_OPPONENT[i], "./sprites/opponent/" + SPRITE_NAME_OPPONENT[i] + ".png");
        }

        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };

    this._onImagesLoaded = function () {
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource / RESOURCE_TO_LOAD * 100);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        //console.log("PERC: "+iPerc);
        _oPreloader.refreshLoader(iPerc);

        if (_iCurResource === RESOURCE_TO_LOAD) {
            this._onRemovePreloader();
        }
    };

    this._onAllImagesLoaded = function () {

    };
    
    this._onRemovePreloader = function(){
        PokiSDK.gameLoadingFinished();
        
        try{
            saveItem("ls_available","ok");
        }catch(evt){
            // localStorage not defined
            s_bStorageAvailable = false;
        }

        _oPreloader.unload();

        if (!isIOS()) {
                s_oSoundTrack = playSound("soundtrack", 1,true);
        }
        

        this.gotoMenu();
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
    
    this.gotoMenu = function () {
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };

    this.gotoLevelMenu = function () {
        _oLevelMenu = new CLevelMenu(OPPONENT_SPEED.length);
        _iState = STATE_MENU;
    };

    this.gotoGame = function (iLevel) {
        _oGame = new CGame(_oData, iLevel);
        _iState = STATE_GAME;
    };

    this.gotoHelp = function () {
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

    this._update = function (event) {
        if (_bUpdate === false) {
            return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;

        if (s_iCntTime >= 1000) {
            s_iCurFps = s_iCntFps;
            s_iCntTime -= 1000;
            s_iCntFps = 0;
        }

        if (_iState === STATE_GAME) {
            _oGame.update();
        }

        s_oStage.update(event);

    };

    s_oMain = this;

    _oData = oData;
    OPPONENT_SPEED = oData.opponent_speed;
    ENABLE_FULLSCREEN = oData.fullscreen;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;

    this.initContainer();
}
var s_bMobile;
var s_bAudioActive = true;
var s_bFullscreen = false;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;
var s_iAdsLevel = 1;
var s_iLevelReached = 1;
var s_aScores;
var s_iBestScore;

var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oSoundTrack = null;
var s_oCanvas;
var s_aSounds;
var s_bStorageAvailable = true;