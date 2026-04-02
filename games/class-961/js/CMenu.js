function CMenu(){
    
    var _iAcceleration;
    var _iAcceleration2;
    var _iCarSpeed;
    var _iCarSpeed2;
    
    var _oBg;
    var _oStreet;
    var _oButPlay;
    var _oButContinue;
    var _oFade;
    var _oAudioToggle;
    var _oCreditsBut;
    var _oParent;
    var _oCurtain;
    var _oBgContainer;
    var _oFgContainer;
    var _oCar;
    var _oCar2;
    var _oButFullscreen;
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosCredits;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    
    
    
    this._init = function(){        
        _iAcceleration = randomFloatBetween(0.02, 0.07);
        _iAcceleration2 = randomFloatBetween(0.02, 0.07);
        _iCarSpeed = 0;
        _iCarSpeed2 = 0;
        
        _oBgContainer = new createjs.Container();
        s_oStage.addChild(_oBgContainer);
        
        _oFgContainer = new createjs.Container();
        s_oStage.addChild(_oFgContainer);
        
        _oBg = new CBackground(_oBgContainer);
        _oStreet = new CStreet(0, _oBgContainer, _oFgContainer);
        _oStreet.setArrive(-400);

        _oCar2 = new CCar(-randomFloatBetween(200, 1000), 400, _oBgContainer, Math.floor(Math.random()*5), false, OPPONENT_ENGINE_GEAR[0], 0);
        _oCar2.setScale(0.85);
        _oCar = new CCar(-randomFloatBetween(200, 1000), 500, _oBgContainer, Math.floor(Math.random()*5), false, OPPONENT_ENGINE_GEAR[0], 0);
        

        var oSprite = s_oSpriteLibrary.getSprite('logo');
        var oLogo = createBitmap(oSprite);
        oLogo.regX = oSprite.width/2;
        oLogo.regY = oSprite.height/2;
        oLogo.x = -1000;
        oLogo.y = CANVAS_HEIGHT/2 - 160;
        s_oStage.addChild(oLogo);

        new createjs.Tween.get(oLogo).to({x:CANVAS_WIDTH/2}, 1500, createjs.Ease.cubicOut);
        
        if(s_oLocalStorage.isDirty()){
            var oSprite = s_oSpriteLibrary.getSprite('but_play');
            _oButPlay = new CGfxButton(CANVAS_WIDTH/2 - 1070,CANVAS_HEIGHT -180,oSprite, s_oStage);
            _oButPlay.addEventListener(ON_MOUSE_UP, this._onButReset, this);
            new createjs.Tween.get(_oButPlay.getButtonImage()).wait(500).to({x: CANVAS_WIDTH/2 - 170}, 1500, createjs.Ease.cubicOut);

            var oSprite = s_oSpriteLibrary.getSprite('but_continue_menu');
            _oButContinue = new CGfxButton((CANVAS_WIDTH/2) - 780,CANVAS_HEIGHT -180,oSprite, s_oStage);
            _oButContinue.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
            new createjs.Tween.get(_oButContinue.getButtonImage()).wait(1000).to({x: (CANVAS_WIDTH/2) + 120}, 1000, createjs.Ease.cubicOut).call(function(){
                _oButContinue.pulseAnimation();
            });        
                    
        } else {
            var oSprite = s_oSpriteLibrary.getSprite('but_play');
            _oButPlay = new CGfxButton((CANVAS_WIDTH/2) - 780,CANVAS_HEIGHT -180,oSprite, s_oStage);
            _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
            new createjs.Tween.get(_oButPlay.getButtonImage()).wait(500).to({x: (CANVAS_WIDTH/2)}, 1500, createjs.Ease.cubicOut).call(function(){
                _oButPlay.pulseAnimation();
            }); 
        }

        var oSprite = s_oSpriteLibrary.getSprite('but_info');
        _pStartPosCredits = {x: (oSprite.height/2) + 10, y: (oSprite.height/2) + 10};            
        _oCreditsBut = new CGfxButton((CANVAS_WIDTH/2),CANVAS_HEIGHT -240,oSprite, s_oStage);
        _oCreditsBut.addEventListener(ON_MOUSE_UP, this._onCreditsBut, this);
     
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10};            
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive, s_oStage);
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
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen")
            _pStartPosFullscreen = {x:_pStartPosCredits.x + oSprite.width/2 + 10,y:(oSprite.height/2) + 10};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this);
        }

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 1000).call(function(){_oFade.visible = false;});  
        
        _oCurtain = new CCurtain(s_oStage);
        _oCurtain.openAnim();
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);

        if(!s_oLocalStorage.isUsed()){
            new CMsgBox(TEXT_IOS_PRIVATE);
        }
    };
    
    this.unload = function(){
        _oButPlay.unload(); 
        _oButPlay = null;
        _oFade.visible = false;
        
        _oCreditsBut.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
                _oButFullscreen.unload();
        }
        
        s_oStage.removeChild(_oBg);
        _oBg = null;
        s_oMenu = null;
        
        _oCurtain.unload();
        _oCar.unload();
        _oCar2.unload();
        
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oCreditsBut.setPosition(_pStartPosCredits.x + iNewX,iNewY + _pStartPosCredits.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
                _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y + iNewY);
        }
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
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onCreditsBut = function(){
        new CCreditsPanel();
    };
    
    this._onButPlayRelease = function(){
        s_oMain.pokiShowCommercial(s_oMenu._startGame);
        /*
        if(s_bPokiFirstTimePlay){
            s_oMain.pokiShowCommercial(s_oMenu._startGame);
        } else {
            s_oMenu._startGame();
        }
        */
    };
    
    this._startGame = function(){
        if(s_oLocalStorage.isDirty()){
            _oButPlay.setClickable(false);
            _oButContinue.setClickable(false);
        } else {
            _oButPlay.setClickable(false);
        }
        
        
        _oCurtain.closeAnim(_oParent._onCurtainClose);  
        
        s_bPokiFirstTimePlay = false;
    };
    
    this._onButReset = function () {
        var oSafetyPanel = new CAreYouSurePanel(s_oMenu.removeDataAndContinue);
        oSafetyPanel.changeMessage(TEXT_SAVE_REMOVE, 40);
    };

    this.removeDataAndContinue = function(){
        s_oLocalStorage.resetAllData();
        s_oLocalStorage.loadData();
        
        s_oMenu._onButPlayRelease();
    }

    this._onCurtainClose = function(){
        _oParent.unload();

        $(s_oMain).trigger("start_session");
        s_oMain.gotoModeMenu();
    };

    this.resetAnim = function(){
        _oCar.unload();
        _oCar.unload();
        
        _iAcceleration = randomFloatBetween(0.02, 0.07);
        _iAcceleration2 = randomFloatBetween(0.02, 0.07);
        _iCarSpeed = 0;
        _iCarSpeed2 = 0;
        
        _oCar2 = new CCar(-randomFloatBetween(200, 1000), 400, _oBgContainer, Math.floor(Math.random()*5), false, OPPONENT_ENGINE_GEAR[0], 0);
        _oCar2.setScale(0.85);
        _oCar = new CCar(-randomFloatBetween(200, 1000), 500, _oBgContainer, Math.floor(Math.random()*5), false, OPPONENT_ENGINE_GEAR[0], 0);
        
    };

    this.update = function(){
        _oStreet.menuMovement(25);
        
        _iCarSpeed -= _iAcceleration;
        _iCarSpeed2 -= _iAcceleration2;
        
        _oCar.move(_iCarSpeed);
        _oCar2.move(_iCarSpeed2);
        
        if(_oCar.getCar().x > 2*CANVAS_WIDTH && _oCar2.getCar().x > 2*CANVAS_WIDTH){
            this.resetAnim();
        }
    };
    
    s_oMenu = this;
    
    _oParent = this;
    this._init();
}

var s_oMenu = null;