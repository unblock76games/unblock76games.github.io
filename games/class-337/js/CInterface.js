function CInterface(iScore){
    var _aCarInfos;
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosScore;
    var _pStartPosBest;
    var _pStartPosFullscreen;
    var _pStartPosCarInfo;
    var _pStartPosButCar0;
    var _pStartPosButCar1;
	
    var _oBestTimeText;
    var _oScoreText;
    var _oButExit;
    var _oAudioToggle;
    var _oButFullscreen;
    var _oContainerCarInfo;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oGUIExpandible;
    var _oAreYouSurePanel;
    var _oButCar0;
    var _oButCar1;
    var _oFpsText;
    
    this._init = function(iScore){
        _oFpsText = new createjs.Text(s_iCntFps,"30px "+FONT_GAME, "#fff");
        _oFpsText.x = 450;
        _oFpsText.y = CANVAS_HEIGHT - 40;
        _oFpsText.textAlign = "center";
        //s_oStage.addChild(_oFpsText);
        
        
        var oSprite = s_oSpriteLibrary.getSprite("key_0_mobile");
        _pStartPosButCar0 = {x: oSprite.width/2 + 10,y:CANVAS_HEIGHT - oSprite.height/2 - 10};
        _oButCar0 = new CButPlayerMobile(_pStartPosButCar0.x,_pStartPosButCar0.y,0,s_iSelectCar1,s_oStage);
        _oButCar0.addEventListener(ON_MOUSE_DOWN,this._onPressCar0,this);
        _oButCar0.addEventListener(ON_MOUSE_UP,this._onUpCar0,this);
            
        if(!s_bMobile) {
            //KEY LISTENER
            document.onkeydown   = s_oGame.onKeyDown;
            document.onkeyup   = s_oGame.onKeyUp;
            
            if(!s_bSingleMode){
                _oButCar0.setVisible(false);
            }
        }else{
            if(!s_bSingleMode){
                var oSprite = s_oSpriteLibrary.getSprite("key_1_mobile");
                _pStartPosButCar1 = {x:CANVAS_WIDTH - oSprite.width/2 - 10,y:CANVAS_HEIGHT - oSprite.height/2 - 10};
                _oButCar1 = new CButPlayerMobile(_pStartPosButCar1.x,_pStartPosButCar1.y,1,s_iSelectCar2,s_oStage);
                _oButCar1.addEventListener(ON_MOUSE_DOWN,this._onPressCar1,this);
                _oButCar1.addEventListener(ON_MOUSE_UP,this._onUpCar1,this);
            }
        }
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
	_pStartPosExit = {x:CANVAS_WIDTH - (oSprite.width/2) ,y:(oSprite.height/2) +4};
        _oButExit = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _pStartPosAudio = {x:_pStartPosExit.x - oSprite.width,y:_pStartPosExit.y}
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            
            _pStartPosFullscreen = {x: _pStartPosAudio.x - oSprite.width/2,y:_pStartPosAudio.y};
        }else{
            _pStartPosFullscreen = {x:_pStartPosExit.x - oSprite.width,y:_pStartPosExit.y}
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
            

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        var oSprite = s_oSpriteLibrary.getSprite('but_settings');
        _oGUIExpandible = new CGUIExpandible(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oGUIExpandible.addButton(_oButExit);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oGUIExpandible.addButton(_oAudioToggle);
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oGUIExpandible.addButton(_oButFullscreen);
        }
        
        _pStartPosCarInfo = {x:10,y:10};
        _oContainerCarInfo = new createjs.Container();
        _oContainerCarInfo.x = _pStartPosCarInfo.x;
        _oContainerCarInfo.y = _pStartPosCarInfo.y;
        s_oStage.addChild(_oContainerCarInfo);
        
        
        
        _aCarInfos = new Array();
        var iX = 0;
        var iY = 0;
        for(var i=0;i<NUM_CARS;i++){
            var oCarInfo = new CCarInfoPanel(iX,iY,i,_oContainerCarInfo);
            _aCarInfos.push(oCarInfo);
            
            iX += 110;
        }
        
        if(s_bSingleMode){
            _pStartPosScore = {x:10,y:90};
            _oScoreText = new createjs.Text(TEXT_SCORE + " " + iScore,"20px "+FONT_GAME, "#fff");
            _oScoreText.x = _pStartPosScore.x;
            _oScoreText.y = _pStartPosScore.y;
            _oScoreText.textBaseline = "alphabetic";
            _oScoreText.textAlign = "left";
            s_oStage.addChild(_oScoreText);
            
            _pStartPosBest= {x:10,y:_oScoreText.y + 20};
        }else{
            _pStartPosBest= {x:10,y:90};
        }
        
        
        _oBestTimeText = new createjs.Text(TEXT_BEST_TIME + " 00:00" ,"20px "+FONT_GAME, "#fff");
        _oBestTimeText.x = _pStartPosBest.x;
        _oBestTimeText.y = _pStartPosBest.y;
        _oBestTimeText.textAlign = "left";
        _oBestTimeText.textBaseline = "alphabetic";
        _oBestTimeText.shadow = new createjs.Shadow("#000000", 2, 2, 5);
        s_oStage.addChild(_oBestTimeText);
        

        _oAreYouSurePanel = new CAreYouSurePanel();
        _oAreYouSurePanel.addEventListener(ON_BUT_YES_DOWN,this._onExitYes,this);
        
	this.refreshButtonPos();		
    };
    
    this.unload = function(){
        _oButExit.unload();
        _oButExit = null;
        _oGUIExpandible.unload();
        _oAreYouSurePanel.unload();
        
        if(DISABLE_SOUND_MOBILE === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        _oButCar0.unload();
        if(!s_bMobile) {
            //KEY LISTENER
            document.onkeydown   = null;
            document.onkeyup   = null;
        }else{
            
            if(!s_bSingleMode){
                _oButCar1.unload();
            }
            
        }
        
        
        s_oStage.removeAllChildren();
	s_oInterface = null;
    };
    
    this.reset = function(szTime,aCarTypes,iScore){
        this.refreshBestTime(szTime);
        this.setCarType(aCarTypes);
        
        for(var i=0;i<_aCarInfos.length;i++){
            _aCarInfos[i].reset();
        }
        
        if(s_bSingleMode){
            _oScoreText.text = TEXT_SCORE + " " + iScore;
        }
        
        this.enablePlayerButs();
        
    };
	
    this.refreshButtonPos = function(){
        if(s_bSingleMode){
            _oScoreText.x = _pStartPosScore.x + s_iOffsetX;
            _oScoreText.y = _pStartPosScore.y + s_iOffsetY;
        }
        
        _oBestTimeText.x = _pStartPosBest.x + s_iOffsetX;
        _oBestTimeText.y = _pStartPosBest.y + s_iOffsetY;

        _oGUIExpandible.refreshPos();
        
        _oContainerCarInfo.x = _pStartPosCarInfo.x + s_iOffsetX;
        _oContainerCarInfo.y = _pStartPosCarInfo.y + s_iOffsetY;
        
        _oButCar0.setPosition(_pStartPosButCar0.x + s_iOffsetX,_pStartPosButCar0.y - s_iOffsetY);
        if(s_bMobile){
            
            if(!s_bSingleMode){
                _oButCar1.setPosition(_pStartPosButCar1.x - s_iOffsetX,_pStartPosButCar1.y - s_iOffsetY);
            }
            
        }
    };
    
    this.disablePlayerButs = function(){
        _oButCar0.disable();
        if(!s_bSingleMode && s_bMobile){
            _oButCar1.disable();
        }
    };
    
    this.enablePlayerButs = function(){
        _oButCar0.enable();
        if(!s_bSingleMode  && s_bMobile){
            _oButCar1.enable();
        }
    };
    
    
    this.refreshBestTime = function(szTime){
        _oBestTimeText.text = TEXT_BEST_TIME + " " + szTime;
    };
    
    this.refreshLap = function(iCarIndex,iLaps){
        _aCarInfos[iCarIndex].refreshLap(iLaps);
    };
    
    this.refreshBest = function(iCarIndex,szBest){
        _aCarInfos[iCarIndex].refreshBest(szBest);
    };
    
    this.refreshTotTime = function(iCarIndex,szTot){
       _aCarInfos[iCarIndex].refreshTotTime(szTot);
    };
    
    this.setCarType = function(aTypes){
        for(var i=0;i<_aCarInfos.length;i++){
            _aCarInfos[i].setCarType(aTypes[i]);
        }
    };
    
    this._onExit = function(){
        _oAreYouSurePanel.show(TEXT_ARE_SURE);
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
    
    this._onPressCar0 = function(){
        s_oGame._onPressButCar0();
    };
    
    this._onPressCar1 = function(){
        s_oGame._onPressButCar1();
    };
    
    this._onUpCar0 = function(){
        s_oGame._onUpButCar0();
    };
    
    this._onUpCar1 = function(){
        s_oGame._onUpButCar1();
    };
    
    this._onExitYes = function(){
        s_oGame.onExit();  
    };
    
    this.update = function(){
        _oFpsText.text = s_iCurFps;
    };
    
    s_oInterface = this;
    
    this._init(iScore);
    
    return this;
}

var s_oInterface = null;