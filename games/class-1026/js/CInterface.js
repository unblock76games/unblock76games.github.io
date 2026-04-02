function CInterface() {
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosPause;
    var _pStartPosMatch;
    var _pStartPosGuiBox;
    var _pStartPosFullscreen;
    
    var _oButExit;
    var _oButPause;
    var _oKeeperText;
    var _oLaunchText;
    var _oHelpPanel = null;
    var _oGuiBox;
    var _oAudioToggle;
    var _oMatchText;
    var _oHelpText;
    var _oWinPanel = null;
    var _oLosePanel = null;
    var _oContainerGUI;
    var _oPause;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _iStep;

    this._init = function () {
        _pStartPosGuiBox = {x: 0, y: 0};
        
        
        
        

        _oGuiBox = createBitmap(s_oSpriteLibrary.getSprite("gui_panel"));
        s_oStage.addChild(_oGuiBox);
        
        _oContainerGUI = new createjs.Container();
        s_oStage.addChild(_oContainerGUI);
        

        _oKeeperText = new CTLText(_oContainerGUI, 
                    CANVAS_WIDTH * 0.5 -160, 30, 200, 64, 
                    32, "center", "#ffffff", FONT_GAME, 1,
                    0, 0,
                    TEXT_SCORE_BALL + "\n0",
                    true, true, true,
                    false );


        _oLaunchText = new CTLText(_oContainerGUI, 
                    CANVAS_WIDTH * 0.5 - 390, 30, 200, 64, 
                    32, "center", "#ffffff", FONT_GAME, 1,
                    0, 0,
                    TEXT_LAUNCH + "\n0",
                    true, true, true,
                    false );


        

        _oMatchText = new CTLText(_oContainerGUI, 
                    20, 30, 200, 64, 
                    32, "center", "#ffffff", FONT_GAME, 1,
                    0, 0,
                    TEXT_MATCH + "\n0",
                    true, true, true,
                    false );
                    

        
        _oHelpText = new CTLText(s_oStage, 
                    CANVAS_WIDTH * 0.5-350, 500, 700, 104, 
                    52, "center", "#ffffff", FONT_GAME, 1,
                    0, 0,
                    TEXT_START_MSG,
                    true, true, true,
                    false );
                    


        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height / 2) - 10, y: (oSprite.height / 2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_pause');
        _pStartPosPause = {x: _pStartPosExit.x - oSprite.height - 10, y: _pStartPosExit.y};
        _oButPause = new CGfxButton(_pStartPosPause.x, _pStartPosPause.y, oSprite);
        _oButPause.addEventListener(ON_MOUSE_UP, this.onButPauseRelease, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosPause.x - oSprite.height - 10, y: _pStartPosExit.y};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosAudio.x - oSprite.width/2 - 10,y:_pStartPosAudio.y};
        }else{
            _pStartPosFullscreen = {x: _pStartPosPause.x - oSprite.height - 10, y: _pStartPosExit.y};
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


        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX, iNewY + _pStartPosExit.y);
        _oButPause.setPosition(_pStartPosPause.x - iNewX, iNewY + _pStartPosPause.y);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }

        _oGuiBox.y = _pStartPosGuiBox.y + iNewY;
        _oContainerGUI.y = _pStartPosGuiBox.y + iNewY;
        _oContainerGUI.x = _pStartPosGuiBox.x + iNewX;
    };

    this.unload = function () {
        
        _oButExit.unload();
        _oButExit = null;

        this.onExitFromHelp();

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        s_oInterface = null;
    };

    
    this.showHelpText = function(bValue){
        _oHelpText.setVisible(bValue);
    };
    
    this.refreshBallCatch = function (iCatch, iTarget) {
        _oKeeperText.refreshText(TEXT_SCORE_BALL + "\n" + iCatch + " " + TEXT_OF + " " + iTarget);
    };

    this.refreshLaunch = function (iLaunch, iMaxLaunch) {
        _oLaunchText.refreshText(TEXT_LAUNCH + "\n" + iLaunch + " " + TEXT_OF + " " + iMaxLaunch);
    };

    this.onExitFromHelp = function () {
        if (_oHelpPanel !== null) {
            _oHelpPanel.unload();
            _oHelpPanel = null;
        }
    };

    this.createLosePanel = function (iBallSaved, iTarget) {
        _oLosePanel = new CLosePanel(s_oSpriteLibrary.getSprite("msg_box"));
        _oLosePanel.show(iBallSaved, iTarget);
    };

    this.createWinPanel = function ( iPerfect, iTarget, oScore, bEnd) {
        _oWinPanel = new CWinPanel(s_oSpriteLibrary.getSprite("msg_box"), bEnd);
        _oWinPanel.show(iPerfect, iTarget, oScore);
    };

    this.createHelpPanel = function () {
        createjs.Ticker.paused = false;
        _oHelpPanel = new CHelpPanel(0, 0, s_oSpriteLibrary.getSprite("msg_box"));
    };

    this.createAnimText = function (szText, iSize, bStrobo) {
        var oContainer = new createjs.Container();

        var oTextStroke = new CTLText(oContainer, 
                    -320, iSize + "px " + FONT_GAME, 640, 80, 
                    80, "center", "#000", FONT_GAME, 1,
                    0, 0,
                    szText,
                    true, true, true,
                    false );
        
        oTextStroke.setOutline(3);
       
        var oText = new CTLText(oContainer, 
                    -320, iSize + "px " + FONT_GAME, 640, 80, 
                    80, "center", "#fff", FONT_GAME, 1,
                    0, 0,
                    szText,
                    true, true, true,
                    false );


        oContainer.x = CANVAS_WIDTH_HALF;
        oContainer.y = -80;

        if (bStrobo) {
            s_oInterface.strobeText(oText.getText());

        }

        s_oStage.addChild(oContainer);

        createjs.Tween.get(oContainer).to({y: CANVAS_HEIGHT_HALF}, 500, createjs.Ease.cubicOut).call(function () {
            createjs.Tween.get(oContainer).wait(250).to({y: CANVAS_HEIGHT + 80}, 500, createjs.Ease.cubicIn).call(function () {
                if (bStrobo) {
                    createjs.Tween.removeTweens(oText.getText());
                }
                s_oStage.removeChild(oContainer);
            });
        });
    };

    this.strobeText = function (oText) {
        createjs.Tween.get(oText).wait(30).call(function () {
            if (_iStep < TEXT_EXCELLENT_COLOR.length - 1) {
                _iStep++;
            } else {
                _iStep = 0;
            }
            oText.color = TEXT_EXCELLENT_COLOR[_iStep];
            s_oInterface.strobeText(oText);
        });
    };

    
    this.refreshMatchNum = function (iLevel) {
        _oMatchText.refreshText(TEXT_MATCH + "\n" + iLevel);
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onExit = function () {
        var _oAreYouSure = new CAreYouSurePanel(s_oStage);
        _oAreYouSure.show();
    };

    this.unloadPause = function () {
        _oPause.unload();
        _oPause = null;
    };

    this.onButPauseRelease = function () {
        _oPause = new CPause();
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