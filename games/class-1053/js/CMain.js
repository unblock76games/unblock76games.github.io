function CMain(oData, oApiInstance){
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    
    var _oPreloader;
    var _oMenu;
    var _oPSelection;
    var _oHelp;
    var _oGame;

    this.initContainer = function(){
        
        s_oCanvas = document.getElementById("canvas");
     
        if (location.search.match(/c/i)) {
            // force it to use Context2D if c2d appears in the query string: ex. index.html?c2d        
            s_oStage = new createjs.Stage("canvas");
            s_oStageBg = new createjs.Stage("canvasbg"); 
            s_oStageInterface = new createjs.Stage("canvas_interface"); 
                
        } else {
            // s_oStage = new createjs.Stage("canvas");             	
            s_oStage = new createjs.SpriteStage("canvas",false,false);	
            s_oStageBg = new createjs.SpriteStage("canvasbg",false,false);	  
            s_oStageInterface = new createjs.SpriteStage("canvas_interface",false,false);	  
                
        }
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
        
        new CBitmapFont();

        
    };
	
	
    
    this.preloaderReady = function(){
        PokiSDK.gameLoadingStart();
        
        this._loadImages();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }

        _bUpdate = true;
    };
    
    this.soundLoaded = function(evt){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        if(_iCurResource === RESOURCE_TO_LOAD){
           s_oMain._onRemovePreloader();
        }
    };
    
    this._initSounds = function(){
        var aSoundsInfo = new Array();
        aSoundsInfo.push({path: './sounds/',filename:'start_match',loop:false,volume:1, ingamename: 'start_match'});
        aSoundsInfo.push({path: './sounds/',filename:'crowd_desperation',loop:false,volume:1, ingamename: 'crowd_desperation'});
        aSoundsInfo.push({path: './sounds/',filename:'crowd_exultance',loop:false,volume:1, ingamename: 'crowd_exultance'});
        aSoundsInfo.push({path: './sounds/',filename:'crowd_idle',loop:false,volume:1, ingamename: 'crowd_idle'});
        aSoundsInfo.push({path: './sounds/',filename:'ko',loop:false,volume:1, ingamename: 'ko'});
        aSoundsInfo.push({path: './sounds/',filename:'falling',loop:false,volume:1, ingamename: 'falling'});
        aSoundsInfo.push({path: './sounds/',filename:'punch_left',loop:false,volume:1, ingamename: 'punch_left'});
        aSoundsInfo.push({path: './sounds/',filename:'punch_right',loop:false,volume:1, ingamename: 'punch_right'});
        aSoundsInfo.push({path: './sounds/',filename:'uppercut',loop:false,volume:1, ingamename: 'uppercut'});
        aSoundsInfo.push({path: './sounds/',filename:'1',loop:false,volume:1, ingamename: '1'});
        aSoundsInfo.push({path: './sounds/',filename:'2',loop:false,volume:1, ingamename: '2'});
        aSoundsInfo.push({path: './sounds/',filename:'3',loop:false,volume:1, ingamename: '3'});
        aSoundsInfo.push({path: './sounds/',filename:'4',loop:false,volume:1, ingamename: '4'});
        aSoundsInfo.push({path: './sounds/',filename:'5',loop:false,volume:1, ingamename: '5'});
        aSoundsInfo.push({path: './sounds/',filename:'6',loop:false,volume:1, ingamename: '6'});
        aSoundsInfo.push({path: './sounds/',filename:'7',loop:false,volume:1, ingamename: '7'});
        aSoundsInfo.push({path: './sounds/',filename:'8',loop:false,volume:1, ingamename: '8'});
        aSoundsInfo.push({path: './sounds/',filename:'9',loop:false,volume:1, ingamename: '9'});
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
                                                            onload: s_oMain.soundLoaded
                                                        });
        }
        
    };  


    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("button","./sprites/button.png");
        s_oSpriteLibrary.addSprite("but_play","./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("but_defence","./sprites/but_defence.png");
        s_oSpriteLibrary.addSprite("energy_bar","./sprites/energy_bar.png");
        s_oSpriteLibrary.addSprite("fill_energy","./sprites/fill_energy.png");
        s_oSpriteLibrary.addSprite("mask_energy","./sprites/mask_energy.png");
        s_oSpriteLibrary.addSprite("fill_stamina","./sprites/fill_stamina.png");
        s_oSpriteLibrary.addSprite("energy_avatar_white","./sprites/energy_avatar_white.png");
        s_oSpriteLibrary.addSprite("energy_avatar_black","./sprites/energy_avatar_black.png");
        s_oSpriteLibrary.addSprite("icon_energy","./sprites/icon_energy.png");
        s_oSpriteLibrary.addSprite("icon_stamina","./sprites/icon_stamina.png");
        s_oSpriteLibrary.addSprite("countdown_panel_white","./sprites/countdown_panel_white.png");
        s_oSpriteLibrary.addSprite("countdown_panel_black","./sprites/countdown_panel_black.png");
        s_oSpriteLibrary.addSprite("countdown_panel_continue_white","./sprites/countdown_panel_continue_white.png");
        s_oSpriteLibrary.addSprite("countdown_panel_continue_black","./sprites/countdown_panel_continue_black.png");
        s_oSpriteLibrary.addSprite("logo","./sprites/logo.png");
        s_oSpriteLibrary.addSprite("logo_text","./sprites/choose_player_text.png");
        s_oSpriteLibrary.addSprite("bw_selection","./sprites/bw_selection.png");
        s_oSpriteLibrary.addSprite("bb_selection","./sprites/bb_selection.png");
        s_oSpriteLibrary.addSprite("bw_versus","./sprites/bw_versus.png");
        s_oSpriteLibrary.addSprite("bb_versus","./sprites/bb_versus.png");
        s_oSpriteLibrary.addSprite("ko_white","./sprites/ko_player.png");
        s_oSpriteLibrary.addSprite("ko_black","./sprites/ko_enemy.png");
        s_oSpriteLibrary.addSprite("bg_pselection","./sprites/bg_mod_menu.jpg");
        s_oSpriteLibrary.addSprite("bg_game","./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("fade","./sprites/fade.png");
        s_oSpriteLibrary.addSprite("vs","./sprites/vs.png");
        s_oSpriteLibrary.addSprite("but_exit_big","./sprites/but_exit_big.png");
        s_oSpriteLibrary.addSprite("but_restart","./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("audio_icon2","./sprites/audio_icon2.png");
        s_oSpriteLibrary.addSprite("bg_help_1","./sprites/bg_help_1.png");
        s_oSpriteLibrary.addSprite("bg_help_2","./sprites/bg_help_2.png");
        s_oSpriteLibrary.addSprite("but_fight","./sprites/but_fight.png");
        s_oSpriteLibrary.addSprite("but_skip","./sprites/but_skip.png");
        s_oSpriteLibrary.addSprite("but_credits","./sprites/but_credits.png");
        s_oSpriteLibrary.addSprite("logo_credits","./sprites/logo_credits.png");
        s_oSpriteLibrary.addSprite("hit_area","./sprites/hit_area.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","./sprites/but_fullscreen.png");
        
        for(var i=0;i<5;i++){
            s_oSpriteLibrary.addSprite("particle_"+i,"./sprites/particle/particle_"+i+".png"); 
        }

        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
        
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);
        
        PokiSDK.gameLoadingProgress({percentageDone: _iCurResource/RESOURCE_TO_LOAD});
        
        if(_iCurResource === RESOURCE_TO_LOAD){
            s_oMain._onRemovePreloader();
        }
    };
    
    this._onRemovePreloader = function(){
        PokiSDK.gameLoadingFinished();
            
        _oPreloader.unload();            

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
    
    this.gotoMenu = function(){
        
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };
    this.gotoPSelection = function(){
        _oPSelection = new CSelectCharacter();
        
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
    
    this.playAllSounds = function(bVal){
        Howler.mute(!bVal);
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
    ENABLE_FULLSCREEN = oData.fullscreen;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    
    this.initContainer();
}
var s_bMobile;
var s_bLoadedPlayerWhite=false;
var s_bLoadedPlayerBlack=false;
var s_bAudioActive = true;
var s_iPlayerSelected= 0;//0=WHITE 1=BLACK
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_oDrawLayer;
var s_oStage;
var s_oStageBg;
var s_oStageInterface;
var s_oMain = null;
var s_oSpriteLibrary;
var s_oCanvas;

var s_oSoundTrack = null;
var s_bFullscreen = false;
var s_bFirstTimePlay = true;