function CInterface(refGame){
    var _bKeyIsDown;
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    
    var _bMouseBusy = true,
        _bVectorAquired = false,
        _bAnimX = false,
        _bAnimY = false,
        _bAnimXLeft = false,
        _bAnimYUp = false,
        _fReturnX = undefined,
        _fReturnY = undefined,

        _fMaxShotBallDistance = SHOTGUI_SIZE/3,
        _iIniShotBallPosX = CANVAS_WIDTH*0.85,
        _iIniShotBallPosY = CANVAS_HEIGHT*0.45,

        _refGame,
        _oShapeKeyListener,
        _oSpriteShotBallX,
        _oSpriteShotBallY,		
        _oSpriteShotGui,
        _oSpriteTimePanel,

        _oAudioToggle,
        _oExitBut,

        _oTextTime,
        _oTextPoints,
        _oTextShots,
        _oContainerDisplay;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;  

    this.init = function(refGame){

        _refGame = refGame;

	var oSpriteGUI = s_oSpriteLibrary.getSprite("shot_gui");
        _oSpriteShotGui = createBitmap(oSpriteGUI);
        _oSpriteShotGui.regX = SHOTGUI_SIZE/2;
        _oSpriteShotGui.regY = SHOTGUI_SIZE/2;
        _oSpriteShotGui.x = _iIniShotBallPosX;
        _oSpriteShotGui.y = _iIniShotBallPosY;
        s_oStage.addChild(_oSpriteShotGui);
        
        _oContainerDisplay = new createjs.Container();
        _oContainerDisplay.x = 80;
        s_oStage.addChild(_oContainerDisplay);
        
        var oSpritePanel = s_oSpriteLibrary.getSprite("time_panel");
        _oSpriteTimePanel = createBitmap(oSpritePanel);
        _oContainerDisplay.addChild(_oSpriteTimePanel);

        _oTextTime = new CTLText(_oContainerDisplay, 
                    _oSpriteTimePanel.x+5, 40, oSpritePanel.width-10, 24, 
                    24, "center", "#ffde00", FONT_GAME2, 1,
                    0, 0,
                    TEXT_TIME_LEFT+" "+formatTime(TIME_AVAILABLE),
                    true, true, false,
                    false );
        _oTextTime.setShadow("#000000", 3, 3, 4);


        var szPoints = TEXT_SCORE + " 0";
        _oTextPoints = new CTLText(_oContainerDisplay, 
                    _oSpriteTimePanel.x+5, 68, oSpritePanel.width-10, 30, 
                    30, "center", "#ffde00", FONT_GAME2, 1,
                    0, 0,
                    szPoints,
                    true, true, false,
                    false );

        _oTextPoints.setShadow("#000000", 3, 3, 4);


        var szShots = TEXT_SHOTS + " 0";
        _oTextShots = new CTLText(_oContainerDisplay, 
                    _oSpriteTimePanel.x+5, 100, oSpritePanel.width-10, 30, 
                    30, "center", "#ffde00", FONT_GAME2, 1,
                    0, 0,
                    szShots,
                    true, true, false,
                    false );
        _oTextShots.setShadow("#000000", 3, 3, 4);            
        

        _oSpriteShotBallX = createBitmap(s_oSpriteLibrary.getSprite("shot_ball"));
        _oSpriteShotBallX.regX = SHOTBALL_SIZE/2;
        _oSpriteShotBallX.regY = SHOTBALL_SIZE/2;
        _oSpriteShotBallX.x = _iIniShotBallPosX - 100;
        _oSpriteShotBallX.y = _iIniShotBallPosY;
        s_oStage.addChild(_oSpriteShotBallX);

        _oSpriteShotBallY = createBitmap(s_oSpriteLibrary.getSprite("shot_ball"));
        _oSpriteShotBallY.regX = SHOTBALL_SIZE/2;
        _oSpriteShotBallY.regY = SHOTBALL_SIZE/2;
        _oSpriteShotBallY.x = _iIniShotBallPosX ;
        _oSpriteShotBallY.y = _iIniShotBallPosY - 100;
        _oSpriteShotBallY.visible = false;
        s_oStage.addChild(_oSpriteShotBallY);

        _oShapeKeyListener = new createjs.Shape();
        _oShapeKeyListener.graphics.beginFill("Black").drawRect(0,75,CANVAS_WIDTH,CANVAS_HEIGHT-75);
        _oShapeKeyListener.alpha = 0.01;
        s_oStage.addChild(_oShapeKeyListener);
        _oShapeKeyListener.on("mousedown", this._handleClick, this);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.width/4) - 5, y: (oSprite.height/2) + 5};
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        };
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:oSprite.width/4 + 10,y:(oSprite.height/2) + 5};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.width/2) - 62, y: (oSprite.height/2) + 5};
        _oExitBut = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSprite);
        _oExitBut.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        _bKeyIsDown = false;
        if(s_bMobile === false){
            document.onkeydown   = this.onKeyDown; 
            document.onkeyup   = this.onKeyUp; 
        }
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oExitBut.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        } 
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
        
        _oContainerDisplay.y = iNewY;
    };

    this.unload = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
        };
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        _oExitBut.unload();
        document.onkeydown = null;
        document.onkeyup = null;
        s_oInterface = null;
    };
    
    this.resetFullscreenBut = function(){
	_oButFullscreen.setActive(s_bFullscreen);
    };

    this.updateTime = function(iTime){
        var szTimeLeft = TEXT_TIME_LEFT +" "+formatTime(iTime);
        _oTextTime.refreshText(szTimeLeft);		
    };

    this.updateScore = function(iScore){
        var szScore = TEXT_SCORE + " "+iScore;
        _oTextPoints.refreshText(szScore);		
    };

    this.updateShots = function(iShots){
        var szShots = TEXT_SHOTS + " "+iShots;
        _oTextShots.refreshText(szShots);		
    };

    this._handleClick = function(e){
        if (!_bMouseBusy) {
			_bMouseBusy = false;
            if (_bAnimX === true){
                    _bAnimX = false;
                    _bAnimY = true;
                    _fReturnX = Math.floor((_oSpriteShotBallX.x - _iIniShotBallPosX)/(_fMaxShotBallDistance)*100)/100;
                    _oSpriteShotBallY.visible = true;
                    return true;
            };

            if (_bAnimY === true){
                    _bAnimY = false;
                    _fReturnY = Math.floor((_oSpriteShotBallY.y - _iIniShotBallPosY)/(_fMaxShotBallDistance)*100)/100;
                    _bVectorAquired = true;
            };
        };
    };	
    
    this.onKeyUp = function(evt) { 
         _bKeyIsDown = false;
    };
        
    this.onKeyDown = function(evt) { 
        if(_bKeyIsDown){
            return;
        }
        _bKeyIsDown = true;
        if(!evt){ 
            evt = window.event; 
        }  
        
        switch(evt.keyCode) {  
           // spacebar  
           case 32: {
                   s_oInterface._handleClick();
                   break; 
               }
        }  
        
        evt.preventDefault();
	return false; 
    };

    this.listenForClick = function(){
        _bMouseBusy = false;

        if(_bVectorAquired){
                return true;
        } else if (_bAnimX === false && _bAnimY === false){
                _bAnimX = true;
                this._animateShotBall();
                return true;
        } else {
                this._animateShotBall();
                return true;
        };
    };

    this._animateShotBall = function(){
        if (_bAnimX) {
                // animX
                if (_bAnimXLeft) {
                        _oSpriteShotBallX.x -= SELECTOR_SPEED;
                        if (_oSpriteShotBallX.x < CANVAS_WIDTH*0.85 - _fMaxShotBallDistance) {
                                _bAnimXLeft = false;
                        };
                } else {
                        _oSpriteShotBallX.x += SELECTOR_SPEED;
                        if (_oSpriteShotBallX.x > CANVAS_WIDTH*0.85 + _fMaxShotBallDistance) {
                                _bAnimXLeft = true;
                        };
                };
        } else if (_bAnimY) {
                // animY
                if (_bAnimYUp) {
                        _oSpriteShotBallY.y -= SELECTOR_SPEED;
                        if (_oSpriteShotBallY.y < CANVAS_HEIGHT*0.45 - _fMaxShotBallDistance) {
                                _bAnimYUp = false;
                        };
                } else {
                        _oSpriteShotBallY.y += SELECTOR_SPEED;
                        if (_oSpriteShotBallY.y > CANVAS_HEIGHT*0.45 + _fMaxShotBallDistance) {
                                _bAnimYUp = true;
                        };
                };

        };
    };

    this.isVectorAquired = function(){
        return {state: _bVectorAquired,vector: {x: _fReturnX, y: _fReturnY}};
    };

    this.newBall = function(){
        _bMouseBusy = true;
        _bVectorAquired = false;
        _bAnimX = false;
        _bAnimY = false;
        _bAnimXLeft = false;
        _bAnimYUp = false;	
	_oSpriteShotBallX.x = _iIniShotBallPosX - 100;
        _oSpriteShotBallX.y = _iIniShotBallPosY;
		
	_oSpriteShotBallY.x = _iIniShotBallPosX ;
        _oSpriteShotBallY.y = _iIniShotBallPosY - 100;
		
        _oSpriteShotBallY.visible = false;
    };

    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onExit = function(){
    	_refGame.onExit();
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

    this.init(refGame);
};

var s_oInterface = null;