function CMenu(){
    var _pStartPosAudio;
    var _pStartPosCredits;
    var _pStartPosFullscreen;
	
    var _oBg;
    var _oButPlaySingle;
    var _oButTwoPlayers;
    var _oButContinue = null;
    var _oAudioToggle;
    var _oButCredits;
    var _oFade;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    
    
    this._init = function(){
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
	s_oStage.addChild(_oBg);
	
        var oSpriteLogo = s_oSpriteLibrary.getSprite("logo_menu");
        var oLogo = createBitmap(oSpriteLogo);
        oLogo.regX = oSpriteLogo.width/2;
        oLogo.regY = oSpriteLogo.height/2;
        oLogo.x = CANVAS_WIDTH/2;
        oLogo.y = CANVAS_HEIGHT/2 - 50;
        s_oStage.addChild(oLogo);
        
	
		

        _oButPlaySingle = new CGfxButton((CANVAS_WIDTH/2 - 200),CANVAS_HEIGHT - 150,s_oSpriteLibrary.getSprite('but_p1'),s_oStage);
        _oButPlaySingle.addEventListener(ON_MOUSE_UP, this._onButPlaySingle, this);

        _oButTwoPlayers = new CGfxButton((CANVAS_WIDTH/2 + 200),CANVAS_HEIGHT - 150,s_oSpriteLibrary.getSprite('but_p2'),s_oStage);
        _oButTwoPlayers.addEventListener(ON_MOUSE_UP, this._onButPlayTwo, this);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2)-10, y: (oSprite.height/2)+10};      
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
		
        var oSprite = s_oSpriteLibrary.getSprite('but_credits');
        _pStartPosCredits = {x:(oSprite.width/2) + 10,y:(oSprite.height/2) + 10};
        _oButCredits = new CGfxButton(_pStartPosCredits.x,_pStartPosCredits.y,oSprite,s_oStage);
        _oButCredits.addEventListener(ON_MOUSE_UP, this._onButCreditsRelease, this);
	
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x: _pStartPosCredits.x + oSprite.width/2 + 10,y:_pStartPosCredits.y};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        
        if(!s_bStorageAvailable){
            new CAlertSavingBox(TEXT_ERR_LS,s_oStage);
        }
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 400).call(function(){_oFade.visible = false;}); 
        
        setVolume("soundtrack",1);
	this.refreshButtonPos();		
    };
    
    this.unload = function(){
        _oButPlaySingle.unload(); 
        _oButTwoPlayers.unload();
        _oButCredits.unload();
        
        if(_oButContinue !== null){
            _oButContinue.unload();
        }
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        s_oStage.removeChild(_oBg);
        _oBg = null;
        
        s_oStage.removeChild(_oFade);
        _oFade = null;
	s_oMenu = null;
    };
	
    this.refreshButtonPos = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
	_oButCredits.setPosition(_pStartPosCredits.x + s_iOffsetX,_pStartPosCredits.y + s_iOffsetY);
    };
    
    this._onButPlaySingle = function(){
        s_oMain.pokiShowCommercial(s_oMenu._startGameSingle);
        /*
        if(s_bPokiFirstTimePlay){
            s_oMain.pokiShowCommercial(s_oMenu._startGame);
        } else {
            s_oMenu._startGame();
        }
        */
    };
    
    this._onButPlayTwo = function(){
        s_oMain.pokiShowCommercial(s_oMenu._startGameTwo);
        /*
        if(s_bPokiFirstTimePlay){
            s_oMain.pokiShowCommercial(s_oMenu._startGame);
        } else {
            s_oMenu._startGame();
        }
        */
    };
	
    this._startGameSingle = function(){
        s_bSingleMode = true;
        s_oMenu.unload();
        s_oMain.gotoModeMenu();
        $(s_oMain).trigger("start_session");
        
        s_bPokiFirstTimePlay = false;
    };    
       
    this._startGameTwo = function(){
        s_bSingleMode = false;
        s_oMenu.unload();
        s_oMain.gotoLevelMenu(true);
        $(s_oMain).trigger("start_session");
        
        s_bPokiFirstTimePlay = false;
    };  
    
    this._onButCreditsRelease = function(){
        new CCreditsPanel();
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
    
    s_oMenu = this;
	
    this._init();
}

var s_oMenu = null;