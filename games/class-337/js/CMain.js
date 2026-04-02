function CMain(oData){
    var _bUpdate;
    var _bGameUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    
    var _oPreloader;
    var _oMenu;
    var _oModeMenu;
    var _oLevelMenu;
    var _oMenuDifficulty;
    var _oSelectCarMenu;
    var _oGame;

    this.initContainer = function(){
        var canvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(canvas);    
        s_oStage.preventSelection = false;
        createjs.Touch.enable(s_oStage);
        
        s_bMobile = jQuery.browser.mobile;
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
        }
        
        
        s_iPrevTime = new Date().getTime();

        createjs.Ticker.framerate = FPS;

        createjs.Ticker.on("tick",this._update);
        
        if(navigator.userAgent.match(/Windows Phone/i)){
            DISABLE_SOUND_MOBILE = true;
        }
		
        s_oSpriteLibrary  = new CSpriteLibrary();
        
        s_oLevelSettings = new CLevelSettings(); 
        
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
        //PokiSDK.setDebug(false);
    };

    
    this.setLocalStorageLevel = function(iLevel){
        var iSavedLevel = getItem("slotcar_level_diff_"+s_iDifficulty);
        if(iSavedLevel === null || iSavedLevel < iLevel){
            s_iLastLevel = iLevel;
            saveItem("slotcar_level_diff_"+s_iDifficulty, s_iLastLevel);
        }
    };
    
    this.setLocalStorageScore = function(iCurScore,iLevel){
        saveItem("slotcar_score_level_"+iLevel+"_diff_"+s_iDifficulty, iCurScore);
    };
    
    this.setLocalStorageTime = function(iTime,iLevel){
        trace("save best "+iTime+ " for level "+iLevel);
        saveItem("slotcar_time_level_"+iLevel, iTime);
    };
    
    this.clearLocalStorage = function(){
        s_iLastLevel = 1;
        if(s_bStorageAvailable){
            localStorage.clear();
        }
    };
    
    this.getScoreTillLevel = function(iLevel){
        if(!s_bStorageAvailable){
            return 0;
        }
        
        var iScore = 0;
        for(var i=0;i<iLevel-1;i++){
            iScore += parseInt(getItem("slotcar_score_level_"+(i+1) +"_diff_"+s_iDifficulty));
        }
        
        return iScore;
    };
    
    this.getBestTime = function(iLevel){
        if(!s_bStorageAvailable){
            return 0;
        }
        
        return getItem("slotcar_time_level_"+iLevel);
    };
    
    this.preloaderReady = function(){
        PokiSDK.gameLoadingStart();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
        
        this._loadImages();
        
        _bGameUpdate = true;
        _bUpdate = true;
        
    };
    
    this.soundLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);

        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});

        _oPreloader.refreshLoader(iPerc);
    };
    
    this._initSounds = function(){
        var aSoundsInfo = new Array();
        aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        aSoundsInfo.push({path: './sounds/',filename:'arrival_lose',loop:false,volume:1, ingamename: 'arrival_lose'});
        aSoundsInfo.push({path: './sounds/',filename:'arrival_win',loop:false,volume:1, ingamename: 'arrival_win'});
        aSoundsInfo.push({path: './sounds/',filename:'countdown_1',loop:false,volume:1, ingamename: 'countdown_1'});
        aSoundsInfo.push({path: './sounds/',filename:'countdown_2',loop:false,volume:1, ingamename: 'countdown_2'});
        aSoundsInfo.push({path: './sounds/',filename:'engine',loop:false,volume:1, ingamename: 'engine'});
        aSoundsInfo.push({path: './sounds/',filename:'hit',loop:false,volume:1, ingamename: 'hit'});
        aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
        RESOURCE_TO_LOAD += aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<aSoundsInfo.length; i++){
            s_aSounds[aSoundsInfo[i].ingamename] = new Howl({ 
                                                            src: [aSoundsInfo[i].path+aSoundsInfo[i].filename+'.mp3'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: aSoundsInfo[i].loop, 
                                                            volume: aSoundsInfo[i].volume,
                                                            onload: s_oMain.soundLoaded
                                                        });
        }
        
    };  
    
    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("but_continue","./sprites/but_continue.png");
        s_oSpriteLibrary.addSprite("but_generic_small","./sprites/but_generic_small.png");
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("bg_menu","./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("logo_menu","./sprites/logo_menu.png");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("but_pause","./sprites/but_pause.png");
        s_oSpriteLibrary.addSprite("msg_box","./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("msg_box_big","./sprites/msg_box_big.png");
        s_oSpriteLibrary.addSprite("bg_game","./sprites/bg_game.jpg");
        
        s_oSpriteLibrary.addSprite("bg_menu_level","./sprites/bg_menu_level.jpg");
        s_oSpriteLibrary.addSprite("arrow_left","./sprites/arrow_left.png");
        s_oSpriteLibrary.addSprite("arrow_right","./sprites/arrow_right.png");
        s_oSpriteLibrary.addSprite("logo_ctl","./sprites/logo_ctl.png");
        s_oSpriteLibrary.addSprite("but_credits","./sprites/but_credits.png");
        s_oSpriteLibrary.addSprite("but_yes","./sprites/but_yes.png");
        s_oSpriteLibrary.addSprite("but_no","./sprites/but_no.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","./sprites/but_fullscreen.png");
        s_oSpriteLibrary.addSprite("cars","./sprites/cars.png");
        s_oSpriteLibrary.addSprite("cars_big","./sprites/cars_big.png");
        s_oSpriteLibrary.addSprite("but_challenge","./sprites/but_challenge.png");
        s_oSpriteLibrary.addSprite("but_quick_race","./sprites/but_quick_race.png");
        s_oSpriteLibrary.addSprite("but_generic","./sprites/but_generic.png");
        s_oSpriteLibrary.addSprite("car_info_bg","./sprites/car_info_bg.png");
        s_oSpriteLibrary.addSprite("select_car_bg","./sprites/select_car_bg.png");
        s_oSpriteLibrary.addSprite("car_highlight","./sprites/car_highlight.png");
        s_oSpriteLibrary.addSprite("but_settings","./sprites/but_settings.png");
        s_oSpriteLibrary.addSprite("but_track","./sprites/but_track.png");
        s_oSpriteLibrary.addSprite("but_go","./sprites/but_go.png");
        s_oSpriteLibrary.addSprite("but_home","./sprites/but_home.png");
        s_oSpriteLibrary.addSprite("but_restart","./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("key_0","./sprites/key_0.png");
        s_oSpriteLibrary.addSprite("key_1","./sprites/key_1.png");
        s_oSpriteLibrary.addSprite("key_0_mobile","./sprites/key_0_mobile.png");
        s_oSpriteLibrary.addSprite("key_1_mobile","./sprites/key_1_mobile.png");
        s_oSpriteLibrary.addSprite("semaphore","./sprites/semaphore.png");
        s_oSpriteLibrary.addSprite("icon_track","./sprites/icon_track.png");
        s_oSpriteLibrary.addSprite("icon_best","./sprites/icon_best.png");
        s_oSpriteLibrary.addSprite("icon_time","./sprites/icon_time.png");
        s_oSpriteLibrary.addSprite("flag_finish","./sprites/flag_finish.png");
        s_oSpriteLibrary.addSprite("but_skip","./sprites/but_skip.png");
		
        for(var i=1;i<NUM_LEVELS+1;i++){
            s_oSpriteLibrary.addSprite("track_"+i,"./sprites/track_"+i+".png");
            s_oSpriteLibrary.addSprite("but_track_"+i,"./sprites/but_track_"+i+".png");
            s_oSpriteLibrary.addSprite("track_shape_"+i,"./sprites/track_shape_"+i+".png");
        }
        

        s_oSpriteLibrary.addSprite("but_p1","./sprites/but_p1.png");
        s_oSpriteLibrary.addSprite("but_p2","./sprites/but_p2.png");

        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();

        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;

        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);

        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});

        _oPreloader.refreshLoader(iPerc);
    };
    
    this._onAllImagesLoaded = function(){
        
    };

    this._allResourcesLoaded = function(){
        PokiSDK.gameLoadingFinished();
        
        _oPreloader.unload(); 
       
        try{
            saveItem("ls_available","ok");
        }catch(evt){
            // localStorage not defined
            s_bStorageAvailable = false;
        }

        s_oSoundTrack = playSound("soundtrack", 1, true);

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
    
    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };
    
    this.gotoModeMenu = function(){
        _oModeMenu = new CMenuMode();
        _iState = STATE_MODE_MENU;
    };
    
    this.gotoLevelMenu = function(){
        
        _oLevelMenu = new CLevelMenu();
        _iState = STATE_MENU_LEVEL;
    };
    
    this.gotoMenuDifficulty = function(){
        
        _oMenuDifficulty = new CMenuDifficulty();
        _iState = STATE_MENU_DIFFICULTY;
    };
    
    this.gotoSelectCar = function(){
        _oSelectCarMenu = new CMenuSelectCar();
        _iState = STATE_MENU_SELECT_CAR;
    };
    
    this.gotoGame = function(){
        _oGame = new CGame();   
							
        _iState = STATE_GAME;
    };
    
    this.levelSelected = function(iLevel){
        s_iLevelSelected = iLevel;
        _oLevelMenu.unload();
        if(iLevel >= s_iLastLevel){
            s_iLastLevel = iLevel;
        }
        

        s_oMain.gotoSelectCar(); 
    };
    
    this.stopUpdateNoBlockAndTick = function(){
        _bGameUpdate = false;
    };
    
    this.startUpdateNoBlockAndTick = function(){
        _bGameUpdate = true;
    };
    
    this.stopUpdateNoBlock = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
    };

    this.startUpdateNoBlock = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false; 
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
                
        if(_iState === STATE_GAME && _bGameUpdate){
            _oGame.update();
        }
        
        if(s_oStage !== undefined){
            s_oStage.update(event);
        }
    };
    
    s_oMain = this;
    
    NUM_LAPS = oData.num_laps;
    ACCELLERATION_STEP = oData.acceleration;
    DECELLERATION_STEP = oData.deceleration;
    MAX_SPEED = oData.max_speed;
    MAX_SPEED_PER_TYPE = new Array();
    MAX_SPEED_PER_TYPE[0] = MAX_SPEED;
    MAX_SPEED_PER_TYPE[1] = Math.round(MAX_SPEED * 0.9);
    MAX_SPEED_PER_TYPE[2] = Math.round(MAX_SPEED * 0.8);
    MAX_SPEED_PER_TYPE[3] = Math.round(MAX_SPEED * 0.7);
    
    KEYCODE_CAR1 = oData.key_code_1;
    KEYCODE_CAR2 = oData.key_code_2;
    
    ENABLE_FULLSCREEN = false;
    ENABLE_CHECK_ORIENTATION = false;
    
    this.initContainer();
}

var s_bMobile;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_oSoundTrack = null;
var s_oDrawLayer;
var s_oStage;
var s_oMain = null;
var s_oSpriteLibrary;
var s_oLevelSettings;

var s_iLastLevel = 1;
var s_iLevelSelected = 1;
var s_bFullscreen = false;
var s_bStorageAvailable = true;
var s_bSingleMode = false;
var s_bQuickRace = false;
var s_iDifficulty =DIFFICULT_EASY;
var s_iSelectCar1 = 0;
var s_iSelectCar2 = 1;
var s_bPokiFirstTimePlay = true;