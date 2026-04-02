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
    var _oTeamChoose;
    var _oColourChoose;
    var _oModeSelection;

    this.initContainer = function () {
        var canvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(canvas);
        createjs.Touch.enable(s_oStage);
        s_oStage.preventSelection = false;

        canvas.opacity = 0.5;

        s_bMobile = jQuery.browser.mobile;
        if (s_bMobile === false) {
            s_oStage.enableMouseOver(20);
            $('body').on('contextmenu', '#canvas', function (e) {
                return false;
            });
        }

        s_iPrevTime = new Date().getTime();

        createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.framerate = FPS;

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

        _bUpdate = true;
    };

    this.soundLoaded = function () {
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource / RESOURCE_TO_LOAD * 100);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        _oPreloader.refreshLoader(iPerc);
    };
    
    this._initSounds = function(){
        Howler.mute(!s_bAudioActive);


        s_aSoundsInfo = new Array();
        s_aSoundsInfo.push({path: './sounds/',filename:'game_win',loop:false,volume:1, ingamename: 'game_win'});
        s_aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        s_aSoundsInfo.push({path: './sounds/',filename:'game_over',loop:false,volume:1, ingamename: 'game_over'});
        s_aSoundsInfo.push({path: './sounds/',filename:'bonus',loop:false,volume:1, ingamename: 'bonus'});
        s_aSoundsInfo.push({path: './sounds/',filename:'cage_impact',loop:false,volume:1, ingamename: 'cage_impact'});
        s_aSoundsInfo.push({path: './sounds/',filename:'ghost',loop:false,volume:1, ingamename: 'ghost'});
        s_aSoundsInfo.push({path: './sounds/',filename:'malus',loop:false,volume:1, ingamename: 'malus'});
        s_aSoundsInfo.push({path: './sounds/',filename:'maze_hit',loop:false,volume:1, ingamename: 'maze_hit'});
        s_aSoundsInfo.push({path: './sounds/',filename:'maze_idle',loop:false,volume:1, ingamename: 'maze_idle'});
        s_aSoundsInfo.push({path: './sounds/',filename:'sleeping',loop:false,volume:1, ingamename: 'sleeping'});
        s_aSoundsInfo.push({path: './sounds/',filename:'step_grass',loop:false,volume:1, ingamename: 'step_grass'});
        s_aSoundsInfo.push({path: './sounds/',filename:'step_land',loop:false,volume:1, ingamename: 'step_land'});
        s_aSoundsInfo.push({path: './sounds/',filename:'step_wood',loop:false,volume:1, ingamename: 'step_wood'});
        s_aSoundsInfo.push({path: './sounds/',filename:'well_in',loop:false,volume:1, ingamename: 'well_in'});
        s_aSoundsInfo.push({path: './sounds/',filename:'well_out',loop:false,volume:1, ingamename: 'well_out'});
        s_aSoundsInfo.push({path: './sounds/',filename:'dices',loop:false,volume:1, ingamename: 'dices'});
        s_aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
        RESOURCE_TO_LOAD += s_aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<s_aSoundsInfo.length; i++){
            this.tryToLoadSound(s_aSoundsInfo[i], false);
        }
        
    };  

    this.tryToLoadSound = function(oSoundInfo, bDelay){
        
       setTimeout(function(){        
            s_aSounds[oSoundInfo.ingamename] = new Howl({ 
                                                            src: [oSoundInfo.path+oSoundInfo.filename+'.mp3'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: oSoundInfo.loop, 
                                                            volume: oSoundInfo.volume,
                                                            onload: s_oMain.soundLoaded,
                                                            onloaderror: function(szId,szMsg){
                                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                         s_oMain.tryToLoadSound(s_aSoundsInfo[i], true);
                                                                                         break;
                                                                                     }
                                                                                }
                                                                        },
                                                            onplayerror: function(szId) {
                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                          s_aSounds[s_aSoundsInfo[i].ingamename].once('unlock', function() {
                                                                                            s_aSounds[s_aSoundsInfo[i].ingamename].play();
                                                                                            if(s_aSoundsInfo[i].ingamename === "soundtrack" && s_oGame !== null){
                                                                                                setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
                                                                                            }

                                                                                          });
                                                                                         break;
                                                                                     }
                                                                                 }
                                                                       
                                                            } 
                                                        });

            
        }, (bDelay ? 200 : 0) );
        
        
    };

    
    this._loadImages = function () {
        s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);

        for (var i = 2; i < 7; i++) {
            s_oSpriteLibrary.addSprite("but_play_" + i, "./sprites/but_play_" + i + ".png");
        };

        for (var i = 0; i < 6; i++) {
            s_oSpriteLibrary.addSprite("goose_" + i, "./sprites/goose_" + i + ".png");
            s_oSpriteLibrary.addSprite("player_" + i, "./sprites/players/goose_" + i + ".png");
            s_oSpriteLibrary.addSprite("well_" + i, "./sprites/well_" + i + ".png");
            s_oSpriteLibrary.addSprite("nest_" + i, "./sprites/nest_" + i + ".png");
        };

        for (var i = 1; i < 7; i++) {
            s_oSpriteLibrary.addSprite("dice_a_" + i, "./sprites/dice_a_" + i + ".png");
            s_oSpriteLibrary.addSprite("dice_b_" + i, "./sprites/dice_b_" + i + ".png");
        };

        for (var i = 1; i < 9; i++) {
            s_oSpriteLibrary.addSprite("square_help" + i, "./sprites/square_help" + i + ".png");
        };

        s_oSpriteLibrary.addSprite("logo_menu", "./sprites/logo_menu.png");
        s_oSpriteLibrary.addSprite("logo_game", "./sprites/logo_game.png");
        s_oSpriteLibrary.addSprite("but_play", "./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("but_dices_on", "./sprites/but_dices0.png");
        s_oSpriteLibrary.addSprite("but_dices_off", "./sprites/but_dices1.png");
        s_oSpriteLibrary.addSprite("but_exit", "./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("but_info", "./sprites/but_info.png");
        s_oSpriteLibrary.addSprite("but_continue", "./sprites/but_continue.png");
        s_oSpriteLibrary.addSprite("but_fullscreen", "./sprites/but_fullscreen.png");
        s_oSpriteLibrary.addSprite("but_yes", "./sprites/but_yes.png");
        s_oSpriteLibrary.addSprite("but_no", "./sprites/but_no.png");
        s_oSpriteLibrary.addSprite("but_back_small", "./sprites/but_back_small.png");
        s_oSpriteLibrary.addSprite("but_continue_small", "./sprites/but_continue_small.png");
        s_oSpriteLibrary.addSprite("but_skip_small", "./sprites/but_skip_small.png");
        s_oSpriteLibrary.addSprite("bg_menu", "./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("bg_game", "./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("msg_box", "./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("msg_box_small", "./sprites/msg_box_small.png");
        s_oSpriteLibrary.addSprite("bg_help", "./sprites/bg_help.png");
        s_oSpriteLibrary.addSprite("audio_icon", "./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("but_home", "./sprites/but_home.png");
        s_oSpriteLibrary.addSprite("but_check", "./sprites/but_check.png");
        s_oSpriteLibrary.addSprite("but_restart", "./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("logo_ctl", "./sprites/logo_ctl.png");
        s_oSpriteLibrary.addSprite("launch_dices", "./sprites/launch_dices.png");
        s_oSpriteLibrary.addSprite("player_shadow", "./sprites/player_shadow.png");
        s_oSpriteLibrary.addSprite("well", "./sprites/well.png");
        s_oSpriteLibrary.addSprite("cage_back", "./sprites/wire_back.png");
        s_oSpriteLibrary.addSprite("cage_front", "./sprites/wire_front.png");
        s_oSpriteLibrary.addSprite("ghost", "./sprites/ghost.png");
        s_oSpriteLibrary.addSprite("puff", "./sprites/puff.png");
        s_oSpriteLibrary.addSprite("bridge", "./sprites/bridge.png");
        s_oSpriteLibrary.addSprite("maze", "./sprites/maze.png");
        s_oSpriteLibrary.addSprite("eggs", "./sprites/eggs.png");
        s_oSpriteLibrary.addSprite("turn_panel", "./sprites/turn_panel.png");
        s_oSpriteLibrary.addSprite("turns", "./sprites/turns.png");
        s_oSpriteLibrary.addSprite("arrow", "./sprites/arrow.png");
        s_oSpriteLibrary.addSprite("vs_man_panel", "./sprites/vs_man_panel.png");
        s_oSpriteLibrary.addSprite("vs_pc_panel", "./sprites/vs_pc_panel.png");

        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };

    this._onImagesLoaded = function () {
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource / RESOURCE_TO_LOAD * 100);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        _oPreloader.refreshLoader(iPerc);
    };

    this._onAllImagesLoaded = function () {

    };

    this.preloaderReady = function () {
        PokiSDK.gameLoadingStart();
        
        this._loadImages();
        
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
           this._initSounds();
        }
        
        _bUpdate = true;
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

        s_oSoundtrack = playSound('soundtrack', 1, true);

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

    this.gotoModeSelection = function () {
        _oModeSelection = new CModeSelection();
        _iState = STATE_MENU;
    };

    this.gotoTeamChoose = function (iMode) {
        _oTeamChoose = new CTeamChoose(iMode);
        _iState = STATE_MENU;
    };

    this.gotoColourChoose = function (iPlayers, iMode) {
        _oColourChoose = new CColourChoose(iPlayers, iMode);
        _iState = STATE_MENU;
    };

    this.gotoGame = function (iPlayers, iColour, iMode, aPlayersColor) {
        _oGame = new CGame(iPlayers, iColour, iMode, aPlayersColor);
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
    ENABLE_FULLSCREEN = oData.fullscreen;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    HOUSE_PENALITIES = oData.house_penalities;
    PRISON_PENALITIES = oData.prison_penalities;
    MAZE_TIME = oData.maze_time;
    LOGO_TIME = oData.logo_time;
    s_bAudioActive = oData.audio_enable_on_startup;


    this.initContainer();
}
var s_bMobile;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_bFullscreen = false;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;
var s_oPhysicsController;
var s_oAdsLevel = 1;

var s_oDrawLayer;
var s_oStage;
var s_oScrollStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oSoundTrack;
var s_bStorageAvailable = true;
var s_aGamesWon = 0;
var s_aGamesPlayed = 0;
var s_aSoundsInfo;