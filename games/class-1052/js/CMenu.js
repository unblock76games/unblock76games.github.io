function CMenu(){
    var _oBg;
    var _oButPlay;
    var _oButContinue = null;
    var _oButInfo;
    var _oFade;
    var _oAudioToggle;
    var _oVariousHelp = null;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosAudio;
    var _pStartPosPlay;
    var _pStartPosContinue;
    var _pStartPosInfo;
    var _pStartPosFullscreen;
    
    this._init = function(){
        if(getItem("swimming_pro_mode") === null || s_iLevelReached >= s_oCityInfos.getNumLevels()){            
            this.removeLocalStorage();
        }else{
            s_iMode = +getItem("swimming_pro_mode");
            s_iLevelReached = +getItem("swimming_pro_levelreached");
            s_iModeSelected = +getItem("swimming_pro_modeselected");
            s_iPlayerMoney = +getItem("swimming_pro_money");
            s_iSpeedBought = +getItem("swimming_pro_speedbought");
            s_iEnergyBought = +getItem("swimming_pro_energybought");
            s_iSpeedAdder = +getItem("swimming_pro_speedadder");
            s_iEnergyAdder = +getItem("swimming_pro_energyadder");
            s_iTeamSelected = +getItem("swimming_pro_teamselected");
            s_szTeamSelectedSprite = getItem("swimming_pro_teamselectedsprite");
            s_aSwimmersScore = JSON.parse(getItem("swimming_pro_scores"));
            s_oCityInfos.getCitiesStorage();
        }

        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);

        var oSprite = s_oSpriteLibrary.getSprite('but_credits');
        _pStartPosInfo = {x:10+oSprite.width/2,y:10 + oSprite.height/2};
        _oButInfo = new CGfxButton(_pStartPosInfo.x,_pStartPosInfo.y,oSprite);
        _oButInfo.addEventListener(ON_MOUSE_UP, this._onCredits, this);
        
     
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10};            
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);          
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && inIframe() === false){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosInfo.x + oSprite.width/2 + 10,y:_pStartPosInfo.y};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        if(!s_bStorageAvailable){
            
            var oSprite = s_oSpriteLibrary.getSprite('but_play');
            _pStartPosPlay = {x: (CANVAS_WIDTH/2), y: CANVAS_HEIGHT -110};
            _oButPlay = new CGfxButton(_pStartPosPlay.x,_pStartPosPlay.y,oSprite);
            _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
            
            new CMsgBox(TEXT_ERR_LS,s_oStage);
        }else{
            if(getItem("swimming_pro_mode") === null){
                var oSprite = s_oSpriteLibrary.getSprite('but_play');
                _pStartPosPlay = {x: (CANVAS_WIDTH/2), y: CANVAS_HEIGHT -110};
                _oButPlay = new CGfxButton(_pStartPosPlay.x,_pStartPosPlay.y,oSprite);
                _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
            }else{
                var oSprite = s_oSpriteLibrary.getSprite('but_play');
                _pStartPosPlay = {x: (CANVAS_WIDTH/2-200), y: CANVAS_HEIGHT -110};
                _oButPlay = new CGfxButton(_pStartPosPlay.x,_pStartPosPlay.y,oSprite);
                _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);

                var oSprite = s_oSpriteLibrary.getSprite('but_continue');
                _pStartPosContinue = {x: (CANVAS_WIDTH/2+200), y: CANVAS_HEIGHT -110};
                _oButContinue = new CGfxButton(_pStartPosContinue.x,_pStartPosContinue.y,oSprite);
                _oButContinue.addEventListener(ON_MOUSE_UP, this._onButContinueRelease, this);
            }
        }
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 1000).call(function(){_oFade.visible = false;});  
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function(){
        _oButPlay.unload(); 
        _oButPlay = null;
        _oFade.visible = false;
        
        _oButInfo.unload();
        
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.unload();
        }
        
        if(_oVariousHelp !== null){
            _oVariousHelp.unload();
            _oVariousHelp = null;
        }
            
        s_oStage.removeChild(_oBg);
        _oBg = null;
        s_oMenu = null;
    };
    
    this.removeLocalStorage = function(){
        s_iMode = 0;
        s_iLevelReached = 1;
        s_iModeSelected = 0;
        s_iPlayerMoney = 0;
        s_iSpeedBought = 0;
        s_iEnergyBought = 0;
        s_iSpeedAdder = 0;
        s_iEnergyAdder = 0;
        s_iTeamSelected = 0;
        s_szTeamSelectedSprite = "swimmer_0";
        s_aSwimmersScore = [0, 0, 0, 0, 0, 0, 0, 0];
            
        s_oCityInfos.removeCitiesStorage();
        removeItem("swimming_pro_mode");
        removeItem("swimming_pro_levelreached");
        removeItem("swimming_pro_modeselected");
        removeItem("swimming_pro_money");
        removeItem("swimming_pro_speedbought");
        removeItem("swimming_pro_energybought");
        removeItem("swimming_pro_speedadder");
        removeItem("swimming_pro_energyadder");
        removeItem("swimming_pro_teamselected");
        removeItem("swimming_pro_teamselectedsprite");
        removeItem("swimming_pro_scores");
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        
        _oButPlay.setPosition(_pStartPosPlay.x,_pStartPosPlay.y - iNewY);
        
        if(_oButContinue){
            _oButContinue.setPosition(_pStartPosContinue.x,_pStartPosContinue.y - iNewY);
        }
        
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX,_pStartPosFullscreen.y + iNewY);
        }

        _oButInfo.setPosition(_pStartPosInfo.x + iNewX,iNewY + _pStartPosInfo.y);
        
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onCredits = function(){
        new CCreditsPanel();
    };
    
    this._onButPlayRelease = function(){
        if(s_bFirstTimePlay){
            s_oMain.pokiShowCommercial(s_oMenu._startGamePlay);
        } else {
            s_oMenu._startGamePlay();
        }
    };
    
    this._onButContinueRelease = function(){
        if(s_bFirstTimePlay){
            s_oMain.pokiShowCommercial(s_oMenu._startGameContinue);
        } else {
            s_oMenu._startGameContinue();
        }
    };
    
    this._startGamePlay = function(){        
        $(s_oMain).trigger("start_session");
        
        if (isIOS() && s_oSoundTrack === null) {
            playSound("soundtrack", 1,true);
        }
        
        if(getItem("swimming_pro_mode") === null){
            s_oMenu.unload();
            s_oMain.gotoTeamSelect();
        }else{
            if(_oVariousHelp === null){
                _oVariousHelp = new CVariousHelp(TEXT_ON_CAREER_RESET, CONFIRMATION_ON_CAREER_RESET);
            }
        }
        
        s_bFirstTimePlay = false;
    };
    
    this._startGameContinue = function(){
        $(s_oMain).trigger("start_session");
        s_oMenu.unload();

        s_oMain.gotoSelectLevel();
        
        s_bFirstTimePlay = false;
    };
    
    this.unloadVariousHelp = function(){
        _oVariousHelp.unload();
        _oVariousHelp = null;
    };
    
    this.onContinue = function(){
        
        s_oMenu.removeLocalStorage();
        s_oMenu.unload();
        s_oMain.gotoTeamSelect();
        
        s_bFirstTimePlay = false;
    };
    
    this.resetFullscreenBut = function(){
	_oButFullscreen.setActive(s_bFullscreen);
    };

    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
	
    s_oMenu = this;
    
    if(s_oCityInfos !== null){
        s_oCityInfos.unload();
        s_oCityInfos = null;
    }
        s_oCityInfos = new CCitySettings();
    
    this._init();
}

var s_oMenu = null;