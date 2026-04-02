function CInterface(oParentContainer) {
    var _oContainer;
    var _oAudioToggle;
    var _iBottomLinePos;
    
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosFullscreen;
    
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oButExit;   
    var _oBestScoreText;
    var _oScoreText;
    var _oAreYouSurePanel;
    var _oParentContainer;
    var _oPlayerLivesContainer;
    
    var _aPlayerLives;

    this._init = function () {
        _oParentContainer = oParentContainer;
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);
        _aPlayerLives = [];
        _oPlayerLivesContainer = new createjs.Container();
        _oParentContainer.addChild(_oPlayerLivesContainer);
        
        var oSpriteExit = s_oSpriteLibrary.getSprite('but_exit');        
        _pStartPosExit = {x: CANVAS_WIDTH - oSpriteExit.width/2 - 20, y: (oSpriteExit.height / 2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSpriteExit,_oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            
            _pStartPosAudio = {x: _pStartPosExit.x - oSpriteExit.width/2 - oSprite.width/4 - 10, y: _pStartPosExit.y};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive,_oContainer);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            _pStartPosFullscreen = {x:20 + oSprite.width/4,y:(oSprite.height / 2) + 10};
        }else{
            _pStartPosFullscreen = {x: _pStartPosExit.x - oSpriteExit.width - 10, y: _pStartPosExit.y};
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

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,_oContainer);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };
    
    this.initInterfacesText = function(){
        _iBottomLinePos = CANVAS_HEIGHT - 250;
        
        _oScoreText = new createjs.Text(TEXT_SCORE + " " + 0, "30px " + PRIMARY_FONT, PRIMARY_FONT_COLOUR);
        _oScoreText.textAlign = "left";
        _oScoreText.x = 60;
        _oScoreText.textBaseline = "alphabetic";
        _oScoreText.y = _iBottomLinePos;
	_oContainer.addChild(_oScoreText);
        
        _oBestScoreText = new createjs.Text(TEXT_BEST + " " + s_iBestScore, "30px " + PRIMARY_FONT, PRIMARY_FONT_COLOUR);
        _oBestScoreText.textAlign = "right";
        _oBestScoreText.x = CANVAS_WIDTH - 60;
        _oBestScoreText.textBaseline = "alphabetic";
        _oBestScoreText.y = _iBottomLinePos;
	_oContainer.addChild(_oBestScoreText);
        
        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };
    
    this.refreshButtonPos = function (iNewX, iNewY) {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, _pStartPosAudio.y + iNewY);
        };
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX,_pStartPosFullscreen.y + iNewY);
        };
        
        _oButExit.setPosition(_pStartPosExit.x - iNewX, _pStartPosExit.y + iNewY);
        
        // REFRESH BOTTOM TEXTS POSITION
        _iBottomLinePos = CANVAS_HEIGHT - iNewY - 50;        
        
        if (_oScoreText !== undefined) { 
            _oScoreText.y = _iBottomLinePos; 
        };
        
        if (_oBestScoreText !== undefined) { 
            _oBestScoreText.y = _iBottomLinePos; 
        };
        
        if (_oPlayerLivesContainer !== undefined) { 
            _oPlayerLivesContainer.y = _iBottomLinePos - 10;
        };
    };
    
    this.refreshScoreText = function (iValue) {        
        _oScoreText.text = TEXT_SCORE + " " + iValue;
    };
    
    this.refreshBestScoreText = function () {
        _oBestScoreText.text = TEXT_BEST + " " + s_iBestScore;
    };

    this.unload = function () {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        s_oInterface = null;
        s_oGame._bDisableEvents = false;
    };
    
    this._onExit = function () {
        _oAreYouSurePanel = new CAreYouSurePanel(_oContainer);
        s_oGame._bDisableEvents = true;
        s_oGame.setStartGame(false);
    };
    
    this.updatePlayerLives = function(){
        var iValue = s_oGame.getLives();
        
        for (var i = 0; i < iValue; i++) {
            var oSprite = s_oSpriteLibrary.getSprite('player_life');
            var oPlayerLife = createBitmap(oSprite, oSprite.width, oSprite.height);
            oPlayerLife.x = (PLAYER_LIFE_SIZE * 1.1) * i;
            _oPlayerLivesContainer.addChild(oPlayerLife);
            _aPlayerLives.push(oPlayerLife);                       
        };

        if (iValue === 0) {
            return;
        };
        
        this.resizePlayerLivesContainer();        
    };
    
    this.resizePlayerLivesContainer = function(){
        var bounds = _oPlayerLivesContainer.getBounds();
        _oPlayerLivesContainer.x = CANVAS_WIDTH_HALF;
        _oPlayerLivesContainer.y = _iBottomLinePos - 10;
        _oPlayerLivesContainer.regX = bounds.width/2;
        _oPlayerLivesContainer.regY = bounds.height/2;        
    };
    
    this.removeLife = function(){
        if (_aPlayerLives.length === 0) {
            return;
        };
        
        var iValue = s_oGame.getLives();

        createjs.Tween.get( _aPlayerLives[iValue] )
            .to({alpha: 0}, 500, createjs.Ease.cubicOut)
            .call(function(){
                // RESET THE PLAYER LIVES CONTAINER
                _oPlayerLivesContainer.removeAllChildren();
                _aPlayerLives = [];
                s_oInterface.updatePlayerLives();
            });
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

    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setActive(s_bFullscreen);
	}
    };
    
    s_oInterface = this;

    this._init();

    return this;
}

var s_oInterface = null;