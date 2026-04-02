function CMain(oData){
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    
    var _oPreloader;
    var _oMenu;
    var _oModeMenu;
    var _oHelp;
    var _oGame;

    this.initContainer = function(){
        s_oCanvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(s_oCanvas);
	s_oStage.preventSelection = true;
        createjs.Touch.enable(s_oStage);
		
	s_bMobile = jQuery.browser.mobile;
        if(s_bMobile === false){
            s_oStage.enableMouseOver(FPS);  
            $('body').on('contextmenu', '#canvas', function(e){ return false; });
        }
		
        s_iPrevTime = new Date().getTime();

	createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.framerate = FPS;
        
        if(navigator.userAgent.match(/Windows Phone/i)){
                DISABLE_SOUND_MOBILE = true;
        }
        
        this._initData();
        
        s_oSpriteLibrary  = new CSpriteLibrary();

        s_oTweenController = new CTweenController();
        
        s_oLocalStorage = new CLocalStorage("car");

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
    
    this._initData = function(){
        GEAR_START_GREEN_WIDTH = oData.start_green_width;
        GEAR_INRACE_GREEN_WIDTH = oData.in_race_green_width;
        WRONG_GEAR_DURATION_INFO = oData.wrong_change_gear_duration;
        
        PLAYER_ENGINE_INFO = oData.player_engine;
        
        NITRO_INFO = oData.nitro_duration;
        
        OPPONENT_ENGINE_GEAR = oData.opponent_engine;
        SKILL = oData.opponent_skills;
        
        STAGE_METER_LENGTH = oData.track_meter_length;
        
        STAGE_WIN_REWARDS = oData.track_rewards;
        BONUS_REWARD_TRACKLENGTH_MULTIPLIER = oData.bonus_multiplier_length_reward;
        BONUS_REWARD_OVERTAKING_MULTIPLIER = oData.bonus_multiplier_overtaking_reward;
        BONUS_REWARD_DIFFICULTY_MULTIPLIER = oData.bonus_multiplier_difficulty;
        
        ENABLE_FULLSCREEN = false;
        ENABLE_CHECK_ORIENTATION = false;
        
    };
    
    this.preloaderReady = function(){
        PokiSDK.gameLoadingStart();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
        
        this._loadImages();
        _bUpdate = true;
    };
    
    this.soundLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        _oPreloader.refreshLoader(iPerc);
    };
    
    //INITIALIZE ALL THE SOUNDS TO LOAD
    this._initSounds = function(){
    
        var aSoundsInfo = new Array();
        
        aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
        aSoundsInfo.push({path: './sounds/',filename:'upgrade_car',loop:false,volume:1, ingamename: 'upgrade_car'});
        
        aSoundsInfo.push({path: './sounds/',filename:'press_button',loop:false,volume:1, ingamename: 'click'});
        aSoundsInfo.push({path: './sounds/',filename:'1',loop:false,volume:1, ingamename: '1'});
        aSoundsInfo.push({path: './sounds/',filename:'2',loop:false,volume:1, ingamename: '2'});
        aSoundsInfo.push({path: './sounds/',filename:'3',loop:false,volume:1, ingamename: '3'});
        aSoundsInfo.push({path: './sounds/',filename:'go',loop:false,volume:1, ingamename: 'go'});
        aSoundsInfo.push({path: './sounds/',filename:'arrive_lose',loop:false,volume:1, ingamename: 'arrive_lose'});
        aSoundsInfo.push({path: './sounds/',filename:'arrive_win',loop:false,volume:1, ingamename: 'arrive_win'});
        
        aSoundsInfo.push({path: './sounds/',filename:'ignition',loop:false,volume:1, ingamename: 'ignition'});
        aSoundsInfo.push({path: './sounds/',filename:'sprint_start',loop:false,volume:1, ingamename: 'sprint_start'});
        aSoundsInfo.push({path: './sounds/',filename:'fire_wheel',loop:true,volume:1, ingamename: 'fire_wheel'});
        aSoundsInfo.push({path: './sounds/',filename:'nitro',loop:false,volume:1, ingamename: 'nitro'});
        aSoundsInfo.push({path: './sounds/',filename:'change_gear',loop:false,volume:1, ingamename: 'change_gear'});
        aSoundsInfo.push({path: './sounds/',filename:'wrong_gear',loop:false,volume:1, ingamename: 'wrong_gear'});
        aSoundsInfo.push({path: './sounds/',filename:'stall',loop:true,volume:1, ingamename: 'stall'});
        aSoundsInfo.push({path: './sounds/',filename:'acceleration',loop:false,volume:1, ingamename: 'acceleration'});
        
        aSoundsInfo.push({path: './sounds/',filename:'engine',loop:false,volume:1, ingamename: 'engine'});
        aSoundsInfo.push({path: './sounds/',filename:'gear_player',loop:false,volume:1, ingamename: 'gear_player'});
        

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

        s_oSpriteLibrary.addSprite("curtain_bot","./sprites/preloader_bottom.jpg");
        s_oSpriteLibrary.addSprite("curtain_top","./sprites/preloader_top.jpg");

        s_oSpriteLibrary.addSprite("logo","./sprites/logo.png");

        s_oSpriteLibrary.addSprite("but_play","./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("but_continue_menu","./sprites/but_continue_menu.png");
        s_oSpriteLibrary.addSprite("msg_box","./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("ctl_logo","./sprites/ctl_logo.png");
        s_oSpriteLibrary.addSprite("but_info","./sprites/but_info.png");
        s_oSpriteLibrary.addSprite("but_yes_big","./sprites/but_yes.png");
        s_oSpriteLibrary.addSprite("but_exit_big","./sprites/but_not.png");
        s_oSpriteLibrary.addSprite("but_continue","./sprites/but_continue.png");
        s_oSpriteLibrary.addSprite("but_continue_small","./sprites/but_continue_small.png");
        s_oSpriteLibrary.addSprite("but_restart","./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("but_home","./sprites/but_home.png");
        s_oSpriteLibrary.addSprite("bg_game","./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("but_level","./sprites/but_level.png");
        
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","./sprites/but_fullscreen.png");
        s_oSpriteLibrary.addSprite("but_shop","./sprites/but_shop.png");
        
        s_oSpriteLibrary.addSprite("upgrade_gear","./sprites/upgrade_gear.png");
        s_oSpriteLibrary.addSprite("upgrade_speed","./sprites/upgrade_speed.png");
        s_oSpriteLibrary.addSprite("upgrade_nitro","./sprites/upgrade_nitro.png");  
        s_oSpriteLibrary.addSprite("but_nitro","./sprites/but_nitro.png");
        s_oSpriteLibrary.addSprite("accelerator","./sprites/accelerator.png");
        s_oSpriteLibrary.addSprite("but_gear","./sprites/but_gear.png");
        s_oSpriteLibrary.addSprite("gear_handle","./sprites/gear_handle.png");
        
        s_oSpriteLibrary.addSprite("map_track","./sprites/map_track.png");
        s_oSpriteLibrary.addSprite("car_track_0","./sprites/car_track_0.png");
        s_oSpriteLibrary.addSprite("car_track_1","./sprites/car_track_1.png");
        
        s_oSpriteLibrary.addSprite("tachometer","./sprites/tachometer.png");
        s_oSpriteLibrary.addSprite("indicator","./sprites/indicator.png");
        
        s_oSpriteLibrary.addSprite("smoke","./sprites/smoke.png");
        s_oSpriteLibrary.addSprite("woman_starting","./sprites/woman_starting.png");
        s_oSpriteLibrary.addSprite("parallaxe_1","./sprites/parallaxe_1.png");
        s_oSpriteLibrary.addSprite("street_piece","./sprites/street_piece.png");
        s_oSpriteLibrary.addSprite("parallaxe_2","./sprites/parallaxe_2.png");
        s_oSpriteLibrary.addSprite("lamp","./sprites/lamp.png");
        s_oSpriteLibrary.addSprite("arrive","./sprites/arrive.png");
        
        s_oSpriteLibrary.addSprite("fireline","./sprites/fireline.png");
        s_oSpriteLibrary.addSprite("firewheel","./sprites/firewheel.png");
            
        for(var i=0; i<= 10; i++){
            s_oSpriteLibrary.addSprite("car_"+i,"./sprites/cars/car_"+i+".png");
            s_oSpriteLibrary.addSprite("shadow_"+i,"./sprites/cars/car_"+i+"_shadow.png");
            s_oSpriteLibrary.addSprite("wheel_"+i,"./sprites/cars/car_"+i+"_wheel.png");
        }
        
        
        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        _oPreloader.refreshLoader(iPerc); 
    };
    
    this._onRemovePreloader = function(){
        PokiSDK.gameLoadingFinished();
        
        _oPreloader.unload();

        s_oSoundTrack = playSound('soundtrack', 1, true);

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
    
    this._onAllImagesLoaded = function(){
        
    };
    
    this.onAllPreloaderImagesLoaded = function(){
        this._loadImages();
    };
    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };
    
    
    this.gotoModeMenu = function(){
        _oModeMenu = new CModeMenu();
        _iState = STATE_MODEMENU;
    };
    

    this.gotoGame = function(iLevel){
        _oGame = new CGame(_oData, iLevel);   						
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
        Howler.mute(true);
     };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");

        if(s_bAudioActive){
                Howler.mute(false);
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
        } else if(_iState === STATE_MENU){
            s_oMenu.update();
        }
        
        s_oStage.update(event);

    };
    
    s_oMain = this;
    
    _oData = oData;
    
    this.initContainer();
}
var s_bMobile;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;
var s_bFullscreen = false;

var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oSoundTrack;
var s_oCanvas;
var s_oTweenController;
var s_oLocalStorage;
var s_aSounds;
var s_bPokiFirstTimePlay = true;