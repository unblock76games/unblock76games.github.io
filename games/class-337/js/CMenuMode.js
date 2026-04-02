function CMenuMode(){
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosFullscreen;
    
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oButExit;
    var _oAudioToggle;
    var _oButQuickRace;
    var _oButChallenge;
    var _oContainer;
    
    var _oThis = this;
    
    this._init = function(){
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
        _oContainer.addChild(oBg);
        
        var oSprite = s_oSpriteLibrary.getSprite("but_exit");
        _pStartPosExit = {x:CANVAS_WIDTH - oSprite.width/2 - 10,y:oSprite.height/2 + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSprite,_oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP,this._onExit,this);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosExit.x - (oSprite.width/2), y: _pStartPosExit.y};      
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:  oSprite.width/4 + 10,y:_pStartPosExit.y};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oButQuickRace = new CButModeMenu(CANVAS_WIDTH/2 - 200,CANVAS_HEIGHT/2,s_oSpriteLibrary.getSprite("but_quick_race"),TEXT_QUICK_RACE,FONT_GAME,"#fff",20,_oContainer);
        _oButQuickRace.addEventListener(ON_MOUSE_UP,this._onQuickRace,this);
        
        _oButChallenge = new CButModeMenu(CANVAS_WIDTH/2 + 200,CANVAS_HEIGHT/2,s_oSpriteLibrary.getSprite("but_challenge"),TEXT_CHALLENGE,FONT_GAME,"#fff",20,_oContainer);
        _oButChallenge.addEventListener(ON_MOUSE_UP,this._onChallenge,this);
        
        
        this.refreshButtonPos();	
    };
    
    this.unload = function(){
        _oButChallenge.unload();
        _oButQuickRace.unload();
        _oButExit.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        s_oStage.removeAllChildren();
        
        s_oModeMenu = null;
    };
    
    this.refreshButtonPos = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
	_oButExit.setPosition(_pStartPosExit.x - s_iOffsetX,_pStartPosExit.y + s_iOffsetY);
    };
    
    this._onQuickRace = function(){
        _oThis.unload();
        
        s_bQuickRace = true;
        s_oMain.gotoMenuDifficulty();
    };
    
    this._onChallenge = function(){
        _oThis.unload();
        
        s_bQuickRace = false;
        s_oMain.gotoMenuDifficulty();
    };
    
    this._onExit = function(){
        _oThis.unload();
        s_oMain.gotoMenu();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
	s_bAudioActive = !s_bAudioActive;
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.enabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    s_oModeMenu = this;
    this._init();
}

var s_oModeMenu = null;