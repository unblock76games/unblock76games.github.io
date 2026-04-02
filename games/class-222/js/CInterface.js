function CInterface(_oPlayersInterface) {
    var _oAudioToggle;
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosDices;
    var _pStartPosFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oButExit;
    var _oButDices;
    var _oButFullscreen;
    var _oAreYouSurePanel;
    var s_oPlayersInterface = _oPlayersInterface;
    var _bDiceEnabled;

    this._init = function () {
        var oSpriteExit = s_oSpriteLibrary.getSprite('but_exit');        
        _pStartPosExit = {x: CANVAS_WIDTH - oSpriteExit.width/2 - 20, y: (oSpriteExit.height / 2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSpriteExit,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        _pStartPosDices = {x: CANVAS_WIDTH - 100, y: CANVAS_HEIGHT - 100};
        _oButDices = new CDiceButton(_pStartPosDices.x, _pStartPosDices.y, s_oStage);
        _oButDices.addEventListener(ON_MOUSE_UP, this._onDicesLaunch, this);
        _bDiceEnabled = false;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            
            _pStartPosAudio = {x: _pStartPosExit.x - oSprite.width/2 - 10, y: _pStartPosExit.y};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            _pStartPosFullscreen = {x: _pStartPosAudio.x - oSprite.width/2 - 10, y:_pStartPosAudio.y};
        }else{
            _pStartPosFullscreen = {x: _pStartPosExit.x - oSpriteExit.width/2 - 10, y: _pStartPosExit.y};
        }

        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        _oAreYouSurePanel = new CAreYouSurePanel();

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
        
        /*
        //////////// DEBUG MANUAL LAUNCH TO TEST SINGLE SQUARES ///////////////////
        for(var i=2; i<=12; i++){
            var oSprite = s_oSpriteLibrary.getSprite('arrow');
            var oButManual = new CTextButton(200+i*50, CANVAS_HEIGHT/2 + 200, oSprite, i, "Arial", "#000", "bold "+ 20, s_oStage);  
            oButManual.addEventListenerWithParams(ON_MOUSE_UP, this._onDiceManual, this, i);
        };
        */
        
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - iNewX,_pStartPosFullscreen.y);
        }
        
        _oButExit.setPosition(_pStartPosExit.x - iNewX, _pStartPosExit.y);
        _oButDices.setPosition(_pStartPosDices.x - iNewX, _pStartPosDices.y - iNewY);
        s_oPlayersInterface.refreshPosition(iNewX);
    };

    this.unload = function () {        
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        _oButDices.unload();
        _oAreYouSurePanel.unload();
        s_oInterface = null;
    };
    
    this.animationDiceButton = function(){
        _oButDices.pulseAnimation();
    };
    
    this.animationDiceButtonStop = function(){
        _oButDices.removeAllTweens();
    };
    

    this.getButDicesX = function() {
        return _oButDices.getX();
    };
    
    this.gameOver = function(iScore){
        new CEndPanel(iScore);
    };
    
    this.showWin = function(){
        new CWinPanel();
    };
    
    this.getButtonDices = function(){
        return _oButDices;
    };
    
    this.enableDices = function(evt) {
        _bDiceEnabled = evt;
        _oButDices.toggle(evt);
    };

    this.DicesEnabled = function() {
        return _bDiceEnabled;
    };
    
    this._onDicesLaunch = function() {
        s_oGame.launchDices();
        this.enableDices(false);
        this.animationDiceButtonStop();
    };
    
    this._onDiceManual = function(iNumber){
        s_oGame.launchManual(iNumber);
        this.enableDices(false);
        this.animationDiceButtonStop();
    };
    
    this._onExit = function () {
        s_oGame.pause();
        _oAreYouSurePanel.show();
    };

    this.isAreYouSurePanel = function() {
        if (_oAreYouSurePanel === null) {
            return false;
        } else {
            return true;
        }
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onFullscreenRelease = function(){
	if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    this._onRestart = function(){
        s_oGame.onRestart();  
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.isEnabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    s_oInterface = this;

    this._init();

    return this;
}

var s_oInterface = null;