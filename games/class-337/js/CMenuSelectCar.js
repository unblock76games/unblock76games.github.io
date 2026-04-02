function CMenuSelectCar(){
    
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosFullscreen;
    
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oButExit;
    var _oAudioToggle;
    var _oButNext;
    var _oContainer;
    var _oPlayer1;
    var _oPlayer2;
    
    var _oThis = this;
    
    this._init = function(){
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_menu_level"));
        _oContainer.addChild(oBg);
        
        var oSpriteMsgBox = s_oSpriteLibrary.getSprite("msg_box_big");
        var oMsgBox =  createBitmap(oSpriteMsgBox);
        oMsgBox.regX = oSpriteMsgBox.width/2;
        oMsgBox.regY = oSpriteMsgBox.height/2;
        oMsgBox.x = CANVAS_WIDTH/2;
        oMsgBox.y = CANVAS_HEIGHT/2;
        _oContainer.addChild(oMsgBox);
        
        var oSpriteTrack = s_oSpriteLibrary.getSprite("track_shape_"+s_iLevelSelected);
        var oTrack = createBitmap(oSpriteTrack);
        oTrack.regX = oSpriteTrack.width/2;
        oTrack.regY = oSpriteTrack.height/2;
        oTrack.x = CANVAS_WIDTH/2 ;
        oTrack.y = CANVAS_HEIGHT/2 ;
        oTrack.alpha = 0.5;
        _oContainer.addChild(oTrack);
        
        var oSprite = s_oSpriteLibrary.getSprite("but_exit");
        _pStartPosExit = {x:CANVAS_WIDTH - oSprite.width/2 - 10,y:oSprite.height/2 + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSprite,_oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP,this._onExit,this);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosExit.x - (oSprite.width/2)-10, y: _pStartPosExit.y};      
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
        
        
        _oPlayer1 = new CCarSelectionMsgBox(CANVAS_WIDTH/2+100,180,TEXT_PLAYER + " 1","car_"+s_iSelectCar1,_oContainer);
        _oPlayer1.addEventListener(ON_CAR_SELECTION_LEFT,this._onLeft1,this);
        _oPlayer1.addEventListener(ON_CAR_SELECTION_RIGHT,this._onRight1,this);
       
        _oButNext = new CGfxButton(CANVAS_WIDTH/2 +160,CANVAS_HEIGHT/2+100,s_oSpriteLibrary.getSprite("but_skip"),_oContainer);
        _oButNext.addEventListener(ON_MOUSE_UP,this._onStartGame,this);
        
       if(!s_bSingleMode){
            _oPlayer2 = new CCarSelectionMsgBox(CANVAS_WIDTH/2-60,350,TEXT_PLAYER + " 2","car_"+s_iSelectCar2,_oContainer);
            _oPlayer2.addEventListener(ON_CAR_SELECTION_LEFT,this._onLeft2,this);
            _oPlayer2.addEventListener(ON_CAR_SELECTION_RIGHT,this._onRight2,this);
        }else{
            _oPlayer1.setPos(CANVAS_WIDTH/2+20,200);
            _oButNext.setPosition(CANVAS_WIDTH/2,CANVAS_HEIGHT/2+100);
        }

        this.refreshButtonPos();
    };
    
    this.unload = function(){
        _oButExit.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        s_oStage.removeAllChildren();
        
        s_oSelectCarMenu = null;
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
    
    this._onExit = function(){
        _oThis.unload();
        s_oMain.gotoMenu();
    };
    
    this._onStartGame = function(){
        _oThis.unload();
        s_oMain.gotoGame();
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
    
    this._onLeft1 = function(){
        s_iSelectCar1--;
        if(s_iSelectCar1 < 0){
            s_iSelectCar1 = NUM_CAR_SPRITE-1;
        }
      
        if(!s_bSingleMode && s_iSelectCar1 === s_iSelectCar2){
            s_iSelectCar1--;
            if(s_iSelectCar1 < 0){
                s_iSelectCar1 = NUM_CAR_SPRITE-1;
            }
        }
        
        _oPlayer1.changeState("car_"+s_iSelectCar1);
    };
    
    this._onRight1 = function(){
        s_iSelectCar1++;

        if(s_iSelectCar1 === NUM_CAR_SPRITE){
            s_iSelectCar1 = 0;
        }
        
        if(!s_bSingleMode && s_iSelectCar1 === s_iSelectCar2){
            s_iSelectCar1++;
            if(s_iSelectCar1 === NUM_CAR_SPRITE){
                s_iSelectCar1 = 0;
            }
        }
        
        _oPlayer1.changeState("car_"+s_iSelectCar1);
    };
    
    this._onLeft2 = function(){
        s_iSelectCar2--;
        if(s_iSelectCar2 < 0){
            s_iSelectCar2 = NUM_CAR_SPRITE-1;
        }
      
        if(s_iSelectCar1 === s_iSelectCar2){
            s_iSelectCar2--;
            if(s_iSelectCar2 < 0){
                s_iSelectCar2 = NUM_CAR_SPRITE-1;
            }
        }
        
        _oPlayer2.changeState("car_"+s_iSelectCar2);
    };
    
    this._onRight2 = function(){
        s_iSelectCar2++;
        if(s_iSelectCar2 === NUM_CAR_SPRITE){
            s_iSelectCar2 = 0;
        }
        
        if(s_iSelectCar1 === s_iSelectCar2){
            s_iSelectCar2++;
            if(s_iSelectCar2 === NUM_CAR_SPRITE){
                s_iSelectCar2 = 0;
            }
        }
        
        _oPlayer2.changeState("car_"+s_iSelectCar2);
    };
    
    s_oSelectCarMenu =this;
    
    this._init();
}

var s_oSelectCarMenu = null;