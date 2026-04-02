function CInterface() {
    var _oAudioToggle;
    var _oButExit;
    var _oButPause;
    var _oButFullscreen;
    var _oHelpPanel = null;
    var _oScoreBoard;
    var _oPause;
    var _oHelpText = null;
    var _oAnimText;
    var _oVelocityScreen;

    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosPause;
    var _pStartPosFullscreen; 

    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function () {

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height / 2) - 10, y: (oSprite.height / 2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_pause');
        _pStartPosPause = {x: _pStartPosExit.x - oSprite.height - 10, y: _pStartPosExit.y};
        _oButPause = new CGfxButton(_pStartPosPause.x, _pStartPosPause.y, oSprite, s_oStage);
        _oButPause.addEventListener(ON_MOUSE_UP, this.onButPauseRelease, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosPause.x - oSprite.height - 10, y: _pStartPosExit.y};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        } else {
            _pStartPosAudio = _pStartPosPause;
        }

        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (ENABLE_FULLSCREEN === false) {
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.enabled) {
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen");
            _pStartPosFullscreen = {x: _pStartPosAudio.x - oSprite.width / 2 - 10, y: _pStartPosExit.y};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, false, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreen, this);
        }

        var oSpriteBoard = s_oSpriteLibrary.getSprite("score_board");

        _oScoreBoard = new CScoreBoard(oSpriteBoard, oSpriteBoard.width * 0.5 + 43, oSpriteBoard.height * 0.5 + 10, s_oStage);

        _oVelocityScreen = new CVelocityScreen(911, 132, s_oStage);

        _oAnimText = new CAnimText(s_oStage);

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.unload = function () {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        _oButExit.unload();
        _oButExit = null;

        _oButPause.unload();
        _oButPause = null;

        if (_oHelpPanel !== null) {
            _oHelpPanel.unload();
        }

        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.unload();
            _oButFullscreen = null;
        }

        s_oInterface = null;
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.enabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    this._onFullscreen = function () {
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };

    this.createHelpText = function () {
        _oHelpText = new CHelpText(s_oStage);
        _oHelpText.fadeAnim(1, null);
    };

    this.unloadHelpText = function () {
        if (_oHelpText !== null) {
            _oHelpText.fadeAnim(0, _oHelpText.unload);
            _oHelpText = null;
        }
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX, iNewY + _pStartPosExit.y);
        _oButPause.setPosition(_pStartPosPause.x - iNewX, iNewY + _pStartPosPause.y);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        s_oGame.refreshPos(iNewX, iNewY);

        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - iNewX, _pStartPosFullscreen.y + iNewY);
        }

        _oScoreBoard.refreshScorePos(iNewX, iNewY);
    };

    this.refreshScoreBoard = function (iWho, iText, szText) {
        _oScoreBoard.refreshText(iWho, iText, szText);
    };

    this.refreshMatchBoard = function (iLevel) {
        //    _oLevelBoard.refreshTextLevel(iLevel);
    };

    this.refreshVelocityScreen = function (iVel) {
        _oVelocityScreen.refreshVelocityText(iVel);
    };

    this.startAnimText = function (szText, szSize, szColor) {
        _oAnimText.setText(szText, szSize, szColor);
        _oAnimText.animText();
    };

    this.createEndPanel = function (iPlayerSet, iOpponentSet, iPlayerPoint, iOpponentPoint, bPlayerWin, iMatchScore, iTotScore, bEnd) {
        var oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite("msg_box_big"), bPlayerWin, bEnd);
        oEndPanel.show(iPlayerSet, iOpponentSet, iPlayerPoint, iOpponentPoint, iMatchScore, iTotScore, bPlayerWin);
    };

    this.createHelpPanel = function () {
        _oHelpPanel = new CHelpPanel();
    };

    this._onButRestartRelease = function () {
        s_oGame.restartGame();
        $(s_oMain).trigger("restart_level", 1);
    };

    this.onExitFromHelp = function () {
        if (_oHelpPanel !== null) {
            _oHelpPanel.unload();
        }
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this.unloadPause = function () {
        _oPause.unload();
        _oPause = null;
    };

    this.onButPauseRelease = function () {
        _oPause = new CPause();
    };

    this._onExit = function () {
        new CAreYouSurePanel(s_oGame.onExit);
        s_oGame.pause(true);
    };

    s_oInterface = this;

    this._init();

    return this;
}

var s_oInterface = null;