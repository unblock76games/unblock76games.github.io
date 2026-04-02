function CInterface(oDrawContainer){
    
    var _iNumChips;
    
    var _aWhiteChips;
    var _aBlackChips;
    
    var _oButExit;
    var _oAudioToggle;
    var _oHelpPanel=null;
    var _oWhitePanel;    
    var _oBlackPanel;
    var _oAreYouSurePanel;
    var _oButFullscreen;
    var _oWhiteContainer;
    var _oBlackContainer;
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    var _pStartPosFullscreen;
    var _pStartPosExit;
    var _pStartPosAudio;
    
    
    this._init = function(){                
        var oExitX;        
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 25};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        oExitX = CANVAS_WIDTH - (oSprite.width/2) - 125;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
           
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: oExitX, y: 25+ (oSprite.height/2)}; 
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
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:oSprite.width/4 + 20,y:(oSprite.height/2) +25};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oWhitePanel = new CInfoTurn(1690 - s_iOffsetX, 1854- s_iOffsetY,PAWN_WHITE, s_oStage);        
        _oBlackPanel = new CInfoTurn(685,90,PAWN_BLACK, s_oStage);
        
        var iOffset = 19;
        _iNumChips = 12;

        _oWhiteContainer = new createjs.Container();
        _oWhiteContainer.x = 339;
        _oWhiteContainer.y = 509;
        oDrawContainer.addChild(_oWhiteContainer);
        
        _oBlackContainer = new createjs.Container();
        _oBlackContainer.x = -320;
        _oBlackContainer.y = -507;
        oDrawContainer.addChild(_oBlackContainer);

        _aBlackChips = new Array();
        var oSprite = s_oSpriteLibrary.getSprite('black_chip');
        for(var i=0; i<_iNumChips; i++){
            _aBlackChips[i] = createBitmap(oSprite);
            _aBlackChips[i].regX = oSprite.width/2;
            _aBlackChips[i].regY = oSprite.height/2;
            //_aBlackChips[i].x = 310 + i*iOffset;
            //_aBlackChips[i].y = 410;
            _aBlackChips[i].x = i*iOffset;
            _aBlackChips[i].visible = false;
            _oBlackContainer.addChild(_aBlackChips[i]);
        }
        
        _aWhiteChips = new Array();
        for(var i=0; i<_iNumChips; i++){
            var oSprite = s_oSpriteLibrary.getSprite('white_chip');
            _aWhiteChips[i] = createBitmap(oSprite);
            _aWhiteChips[i].regX = oSprite.width/2;
            _aWhiteChips[i].regY = oSprite.height/2;
            //_aWhiteChips[i].x = 970 - i*iOffset;
            //_aWhiteChips[i].y = 1424;
            _aWhiteChips[i].x = -i*iOffset;
            _aWhiteChips[i].visible = false;
            _oWhiteContainer.addChild(_aWhiteChips[i]);
        }
       
       this.refreshButtonPos();
    };
    
    this.unload = function(){
        _oButExit.unload();
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
        }
        if(_oHelpPanel!==null){
            _oHelpPanel.unload();
        }
        
        _oBlackPanel.unload();
        _oWhitePanel.unload();
        
        for(var i=0; i<_iNumChips; i++){
            s_oStage.removeChild(_aWhiteChips[i]);
            s_oStage.removeChild(_aBlackChips[i]);
        };
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        _oAreYouSurePanel = null;
        s_oInterface = null;        
    };
    
    this.refreshButtonPos = function(){
        _oButExit.setPosition(_pStartPosExit.x - s_iOffsetX,s_iOffsetY + _pStartPosExit.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,s_iOffsetY + _pStartPosFullscreen.y);
        }
        
        _oWhitePanel.setPosition(1690 - s_iOffsetX, 1854 - s_iOffsetY);
        _oBlackPanel.setPosition(210 + s_iOffsetX, 70 + s_iOffsetY);
        
    };

    this.refreshWhitePawnNumber = function(iNum){

        if(iNum < 0){
            iNum = 0;
        }
        for(var i=0; i<iNum; i++){
            _aWhiteChips[i].visible = true;
        }
        for(var i=iNum; i<_iNumChips; i++){
            _aWhiteChips[i].visible = false;
        }
        
    };
    
    this.refreshWhiteTime = function(iTime){
        if(iTime > 50){
            _oWhitePanel.refreshTime(formatTime(iTime));
        }
        
    };
    
    this.refreshBlackPawnNumber = function(iNum){        
        if(iNum < 0){
            iNum = 0;
        }
        for(var i=0; i<iNum; i++){
            _aBlackChips[i].visible = true;
        }
        for(var i=iNum; i<_iNumChips; i++){
            _aBlackChips[i].visible = false;
        }
        
    };
    
    this.refreshBlackTime = function(iTime){
        if(iTime > 50){
            _oBlackPanel.refreshTime(formatTime(iTime));
        }
        
    };
    
    this.activePlayer = function(iCurPlayer){
        if(iCurPlayer === PAWN_WHITE){
            _oBlackPanel.active(false);
            _oWhitePanel.active(true);
        } else {
            _oWhitePanel.active(false);
            _oBlackPanel.active(true);
        }
    };

    this.setInfoVisible = function(bVal){
        _oWhitePanel.setPanelVisible(bVal);
        _oBlackPanel.setPanelVisible(bVal);
    };

    this._onButConfigRelease = function(){
        new CConfigPanel();
    };
    
    this._onButRestartRelease = function(){
        s_oGame.restartGame();
    };
    
    this.onExitFromHelp = function(){
        _oHelpPanel.unload();
    };
    
    this._onExit = function(){
        if(!s_oGame.isGameEnd()){
            PokiSDK.gameplayStop();
        }
        
        _oAreYouSurePanel = new CAreYouSurePanel(s_oInterface._onConfirmExit);
    };
    
    this._onConfirmExit = function(){
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("show_interlevel_ad");
        s_oGame.onExit();  
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
    
    s_oInterface = this;
    
    this._init();
    
    return this;
}

var s_oInterface = null;