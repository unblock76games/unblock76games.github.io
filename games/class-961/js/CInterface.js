function CInterface(){
    var _oAudioToggle;
    var _oButExit;
    var _oHelpPanel=null;
    var _oHUD;
    var _oCountdownTextStroke;
    var _oCountdownText;
    var _oMapTrack;
    var _oButFullscreen;
    
    var _aNumCountDown;
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosHUD;
    var _pStartPosMap;
    var _pStartPosFullscreen;
    
    this._init = function(){                
        var oExitX;        
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        oExitX = CANVAS_WIDTH - (oSprite.width/2) - 80;
        _pStartPosAudio = {x: oExitX, y: (oSprite.height/2) + 10};
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosExit.x - oSprite.height - 10,_pStartPosAudio.y,oSprite,s_bAudioActive, s_oStage);
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
            _pStartPosFullscreen = {x:oSprite.width/4 + 10,y:(oSprite.height/2) + 10};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this);
        }

        _oCountdownTextStroke = new createjs.Text(""," 300px "+PRIMARY_FONT, "#3e240b");
        _oCountdownTextStroke.x = CANVAS_WIDTH/2;
        _oCountdownTextStroke.y = CANVAS_HEIGHT/2;
        _oCountdownTextStroke.textAlign = "center";
        _oCountdownTextStroke.textBaseline = "middle";
        _oCountdownTextStroke.lineWidth = 200;
        _oCountdownTextStroke.outline = 20;
        s_oStage.addChild(_oCountdownTextStroke);

        _oCountdownText = new createjs.Text(""," 300px "+PRIMARY_FONT, "rgba(255,224,0,1)");
        _oCountdownText.x = CANVAS_WIDTH/2;
        _oCountdownText.y = CANVAS_HEIGHT/2;
        _oCountdownText.textAlign = "center";
        _oCountdownText.textBaseline = "middle";
        _oCountdownText.lineWidth = 200;
        s_oStage.addChild(_oCountdownText);
        
        
        _aNumCountDown = new Array();
        for(var i=0; i<=3; i++){
            _aNumCountDown[i] = false;
        }
        
        _pStartPosHUD = {x: CANVAS_WIDTH/2, y:720};
        _oHUD = new CHUD(s_oStage);
        
        _pStartPosMap = {x: CANVAS_WIDTH/2 - 100, y:46};
        _oMapTrack = new CMapTrack(_pStartPosMap.x, _pStartPosMap.y, s_oStage, s_oGame.getStage());
       
       this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        _oButExit.unload();
        if (_fRequestFullScreen && screenfull.enabled){
			_oButFullscreen.unload();
		}		
        
        s_oInterface = null;
        
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButExit.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
                _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y + iNewY);
        }	
        
        _oHUD.setPos(_pStartPosHUD.x, _pStartPosHUD.y - iNewY);
        _oMapTrack.setPos(_pStartPosMap.x, _pStartPosMap.y + iNewY);
        
    };
    
    this.resetFullscreenBut = function(){
	_oButFullscreen.setActive(s_bFullscreen);
    };

    this.refreshMap = function(iPlayerX, iOpponentX, iTime){
        _oMapTrack.refreshMap(iPlayerX, iOpponentX, iTime);
    };


    this.refreshCountdown = function(iTime){
        var iIntNum = Math.ceil(iTime/1000);  
        var iNum = (iIntNum * 1000 - iTime)/1000;

        _oCountdownText.alpha = 1-iNum;
        _oCountdownText.scaleX = _oCountdownText.scaleY = iNum;
        _oCountdownText.text = Math.ceil(iTime/1000);

        _oCountdownTextStroke.alpha = _oCountdownText.alpha;
        _oCountdownTextStroke.scaleX = _oCountdownTextStroke.scaleY = iNum;
        _oCountdownTextStroke.text = _oCountdownText.text;

        if(iIntNum === 3 && !_aNumCountDown[3]){
            _aNumCountDown[3] = true;
            playSound('3', 1, false);
        } else if(iIntNum === 2 && !_aNumCountDown[2]){
            _aNumCountDown[2] = true;
            playSound('2', 1, false);
        } else if(iIntNum === 1 && !_aNumCountDown[1]){
            _aNumCountDown[1] = true;
            playSound('1', 1, false);
        } else if(iIntNum === 0){
            _aNumCountDown[0] = true;
            playSound('go', 1, false);
        }

        
    };

    this.removeCountdown = function(){
        _oCountdownText.visible = false;
    };
    
    this._onFullscreenRelease = function(){
	if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };

    this._onButHelpRelease = function(){
        _oHelpPanel = new CHelpPanel();
    };
    
    this._onButRestartRelease = function(){
        s_oGame.restartGame();
    };
    
    this.onExitFromHelp = function(){
        _oHelpPanel.unload();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        new CAreYouSurePanel(this._onConfirmExit);
    };
    
    this._onConfirmExit = function(){
        trace("pokistop");
        PokiSDK.gameplayStop();
        
        s_oGame.onExit();
    };
    
    s_oInterface = this;
    
    this._init();
    
    return this;
}

var s_oInterface = null;