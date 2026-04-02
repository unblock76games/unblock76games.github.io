function CInterface(iPlayerTeam, iOpponentTeam) {
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosPause;
    var _pStartPosLeftScroll;
    var _pStartPosRightScroll;
    var _pStartPosFullscreen;
    
    var _oButExit;
    var _oButPause;
    var _oHelpPanel;
    var _oAudioToggle;
    var _oVsPanel;
    var _oFadeLock;
    var _oLosePanel;
    var _oWinPanel;
    var _oScoreBoard;
    var _oTimeBoard;
    var _oTurnBoard;
    var _oLevelScoreBoard;
    var _oCrowd;
    var _oPause;
    var _oButtonLeftScroll;
    var _oButtonRightScroll;
    var _iPlayerTeam;
    var _iOpponentTeam;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function (iPlayerTeam, iOpponentTeam) {

        this.setTeams(iPlayerTeam, iOpponentTeam);

        var oSpriteScoreBoard = s_oSpriteLibrary.getSprite("gui_box");
        var _iHeighthhalf = oSpriteScoreBoard.height * 0.5;

        _oScoreBoard = new CScoreBoard(oSpriteScoreBoard, CANVAS_WIDTH * 0.5, _iHeighthhalf, _iPlayerTeam, _iOpponentTeam);

        _oTimeBoard = new CTimeBoard(oSpriteScoreBoard, 20, _iHeighthhalf - 4);

        _oTurnBoard = new CTurnBoard(oSpriteScoreBoard, 20, CANVAS_HEIGHT - _iHeighthhalf * 2 - 20);

        _oLevelScoreBoard = new CLevelScoreBoard(oSpriteScoreBoard, CANVAS_WIDTH - oSpriteScoreBoard.width - 20, CANVAS_HEIGHT - _iHeighthhalf * 2 - 20);

        _oTurnBoard.setTurn(iPlayerTeam);

        this._createScrollButtons();

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height / 2) - 20, y: (oSprite.height / 2) + 20};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_pause');
        _pStartPosPause = {x: _pStartPosExit.x - oSprite.height - 20, y: _pStartPosExit.y};
        _oButPause = new CGfxButton(_pStartPosPause.x, _pStartPosPause.y, oSprite, s_oStage);
        _oButPause.addEventListener(ON_MOUSE_UP, this._onPause, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosPause.x - oSprite.height - 20, y: _pStartPosExit.y};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosAudio.x - oSprite.width/2 - 10,y:_pStartPosAudio.y};
        }else{
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x: _pStartPosPause.x - oSprite.height - 20, y: _pStartPosExit.y};
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oHelpPanel = new CHelpPanel(0, 0, s_oSpriteLibrary.getSprite('bg_help'), _iPlayerTeam);

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.setTeams = function (iPlayerTeam, iOpponentTeam) {
        _iPlayerTeam = iPlayerTeam;
        _iOpponentTeam = iOpponentTeam;
    };

    this.setTeamsFlagScoreBoard = function (iOpponentTeam) {
        _oScoreBoard.changeOpponentTeamFlag(iOpponentTeam);
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX, iNewY + _pStartPosExit.y);
        _oButPause.setPosition(_pStartPosPause.x - iNewX, iNewY + _pStartPosPause.y);
        _oButtonLeftScroll.setPosition(_pStartPosLeftScroll.x + iNewX, _pStartPosLeftScroll.y);
        _oButtonRightScroll.setPosition(_pStartPosRightScroll.x - iNewX, _pStartPosRightScroll.y);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
        
        var oPosScore = _oScoreBoard.getStartPosition();
        _oScoreBoard.setPosition(oPosScore.x, oPosScore.y + iNewY);

        var oPosTime = _oTimeBoard.getStartPosition();
        _oTimeBoard.setPosition(oPosTime.x + iNewX, oPosTime.y + iNewY);

        var oPosTurn = _oTurnBoard.getStartPosition();
        _oTurnBoard.setPosition(oPosTurn.x + iNewX, oPosTurn.y - iNewY);

        var oPosLevelScore = _oLevelScoreBoard.getStartPosition();
        _oLevelScoreBoard.setPosition(oPosLevelScore.x - iNewX, oPosLevelScore.y - iNewY);

    };


    this.unload = function () {
        _oButExit.unload();
        _oButExit = null;

        if (_oHelpPanel)
            _oHelpPanel.unload();

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }


        s_oInterface = null;
    };

    this.refreshResult = function (iYouResult, iOpponentResult) {
        _oScoreBoard.refresh(iYouResult + " - " + iOpponentResult);
    };

    this.refreshTime = function (szTime) {
        _oTimeBoard.refresh(szTime);
    };

    this.onExitFromHelp = function () {
        this.unloadHelpPanel();
        var oSpriteBg = s_oSpriteLibrary.getSprite("msg_box");
        this.createVsPanel(oSpriteBg, _iPlayerTeam, _iOpponentTeam, null, null, 0);
    };

    this.crowdEffectOn = function () {
        var oPos = _oCrowd.getPosition();

        var oSpriteCrowdOn = s_oSpriteLibrary.getSprite("crowd_on");

        oPos.y += oSpriteCrowdOn.height * 0.3;

        _oCrowd.crowOn(s_oSpriteLibrary.getSprite("crowd_on"), oPos.x, oPos.y, 750);
    };

    this.createEndMatchText = function (iGoalPlayer, iOpponentPlayer, bWin, iScore, bEnd) {
        var oContainer = new createjs.Container();

        oContainer.x = CANVAS_WIDTH * 0.5;
        oContainer.y = -50;

        var oEndMatchTextStroke = new createjs.Text(TEXT_FINISH, "50px " + FONT_GAME, "#ff6000");
        oEndMatchTextStroke.x = 0;
        oEndMatchTextStroke.y = 0;
        oEndMatchTextStroke.textAlign = "center";
        oEndMatchTextStroke.outline = 5;
        oContainer.addChild(oEndMatchTextStroke);

        var oEndMatchText = new createjs.Text(TEXT_FINISH, "50px " + FONT_GAME, TEXT_COLOR);
        oEndMatchText.x = 0;
        oEndMatchText.y = 0;
        oEndMatchText.textAlign = "center";
        oContainer.addChild(oEndMatchText);

        s_oStage.addChild(oContainer);

        createjs.Tween.get(oContainer).to({y: TWEEN_END_MACTH_Y}, 1250, createjs.Ease.elasticOut).call(function () {
            createjs.Tween.get(oContainer).to({scaleX: 0, scaleY: 0}, 500, createjs.Ease.quartIn).call(function () {
                if (bWin) {
                    s_oInterface.createWinPanel(iGoalPlayer, iOpponentPlayer, iScore, bEnd);
                } else {
                    s_oInterface.createLosePanel(iGoalPlayer, iOpponentPlayer, iScore);
                }
                setVolume("soundtrack", 1);
                s_oGame.unpause(false);
                s_oStage.removeChild(oContainer);
            });
        });
    };

    this.createExtendedTimeText = function () {
        var oContainer = new createjs.Container();

        oContainer.x = -100;
        oContainer.y = CANVAS_HEIGHT * 0.5;

        var oExtTimeTextStroke = new createjs.Text(TEXT_TIME_EXTENDED, "50px " + FONT_GAME, "#ff6000");
        oExtTimeTextStroke.x = 0;
        oExtTimeTextStroke.y = 0;
        oExtTimeTextStroke.textAlign = "center";
        oExtTimeTextStroke.outline = 5;
        oContainer.addChild(oExtTimeTextStroke);

        var oExtTimeText = new createjs.Text(TEXT_TIME_EXTENDED, "50px " + FONT_GAME, TEXT_COLOR);
        oExtTimeText.x = 0;
        oExtTimeText.y = 0;
        oExtTimeText.textAlign = "center";
        oContainer.addChild(oExtTimeText);

        s_oStage.addChild(oContainer);

        createjs.Tween.get(oContainer).to({x: CANVAS_WIDTH * 0.5}, 750, createjs.Ease.cubicOut).call(function () {
            createjs.Tween.get(oContainer).to({x: CANVAS_WIDTH + 100}, 750, createjs.Ease.cubicIn).call(function () {
                s_oGame.extendTime();
                s_oStage.removeChild(oContainer);
            });
        });
    };

    this.createLosePanel = function (iGoalPlayer, iOpponentPlayer, iScore) {
        _oLosePanel = new CLosePanel(s_oSpriteLibrary.getSprite("msg_box"));
        _oLosePanel.show(iGoalPlayer, iOpponentPlayer, _iPlayerTeam, _iOpponentTeam, iScore);
    };

    this.createWinPanel = function (iGoalPlayer, iOpponentPlayer, iScore, bEnd) {
        _oWinPanel = new CWinPanel(s_oSpriteLibrary.getSprite("msg_box"), bEnd);
        _oWinPanel.show(iGoalPlayer, iOpponentPlayer, _iPlayerTeam, _iOpponentTeam, iScore);
    };

    this.createVsPanel = function (oSprite, iPlayerTeam, iOpponentTeam, iIndex, iLv, iTimeAnim) {
        _oVsPanel = new CVsPanel(oSprite, iPlayerTeam, iOpponentTeam, iLv, iTimeAnim);
        if (iIndex !== null) {
            _oVsPanel.setChildIndex(iIndex);
        }
    };

    this.blockAllButton = function (bVal) {
        _oButExit.block(bVal);
        _oButPause.block(bVal);
    };

    this.getScoreBoardResult = function () {
        return _oScoreBoard.getResult();
    };

    this.unloadHelpPanel = function () {
        if (_oHelpPanel) {
            _oHelpPanel.unload();
            _oHelpPanel = null;
        }
    };

    this.createGoalText = function (iX, iY) {
        var oSpriteGoal = s_oSpriteLibrary.getSprite("goal_text");

        var oGoal;

        oGoal = createBitmap(oSpriteGoal);
        oGoal.regX = oSpriteGoal.width * 0.5;
        oGoal.regY = oSpriteGoal.height * 0.5;
        oGoal.x = iX;
        oGoal.y = iY;
        oGoal.scaleX = 0;
        oGoal.scaleY = 0;

        s_oStage.addChild(oGoal);

        createjs.Tween.get(oGoal).to({scaleX: 1, scaleY: 1}, 500, createjs.Ease.quadOut).call(function () {
            createjs.Tween.get(oGoal).wait(500).to({scaleX: 0, scaleY: 0, alpha: 0}, 500, createjs.Ease.quadOut).call(function () {
                s_oStage.removeChild(oGoal);
            });
        });
    };

    this._onExitVsPanel = function () {
        _oVsPanel.unload();
        _oVsPanel = null;
    };

    this.createStartMatchText = function () {

        var oContainer = new createjs.Container();

        oContainer.x = CANVAS_WIDTH * 0.5;
        oContainer.y = -50;

        _oFadeLock = new createjs.Shape();
        _oFadeLock.graphics.beginFill("black").drawRect(-CANVAS_WIDTH_HALF, -CANVAS_HEIGHT_HALF, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFadeLock.alpha = 0.01;

        _oFadeLock.on("click", function () {});

        oContainer.addChild(_oFadeLock);

        var oStartMatchTextStroke = new createjs.Text(TEXT_KICK_OFF, "50px " + FONT_GAME, "#ff6000");
        oStartMatchTextStroke.x = 0;
        oStartMatchTextStroke.y = 0;
        oStartMatchTextStroke.textAlign = "center";
        oStartMatchTextStroke.outline = 5;
        oContainer.addChild(oStartMatchTextStroke);

        var oStartMatchText = new createjs.Text(TEXT_KICK_OFF, "50px " + FONT_GAME, TEXT_COLOR);
        oStartMatchText.x = 0;
        oStartMatchText.y = 0;
        oStartMatchText.textAlign = "center";
        oContainer.addChild(oStartMatchText);

        s_oStage.addChild(oContainer);

        createjs.Tween.get(oContainer).to({y: TWEEN_END_MACTH_Y}, 1250, createjs.Ease.elasticOut).call(function () {
            createjs.Tween.get(oContainer).to({scaleX: 0, scaleY: 0}, 500, createjs.Ease.quartIn).call(function () {
                s_oGame.startMatch();
                _oFadeLock.off("click", function () {});
                s_oStage.removeChild(oContainer);
            });
        });
    };

    this.createPauseInterface = function () {
        _oPause = new CPause();
    };

    this.refreshTurnNumber = function (iVal, bState) {
        _oTurnBoard.refreshTurn(iVal, bState);
    };

    this.refreshTurnTeam = function (iVal) {
        _oTurnBoard.setTurn(iVal);
    };

    this.refreshScore = function (iVal) {
        _oLevelScoreBoard.refresh(iVal);
    };

    this.turnAnim = function (szText) {
        var oContainer = new createjs.Container();

        oContainer.x = -200;
        oContainer.y = CANVAS_HEIGHT_HALF;


        var oTurnMatchTextStroke = new createjs.Text(szText, "50px " + FONT_GAME, "#ff6000");
        oTurnMatchTextStroke.x = 0;
        oTurnMatchTextStroke.y = 0;
        oTurnMatchTextStroke.textAlign = "center";
        oTurnMatchTextStroke.lineWidth = 800;
        oTurnMatchTextStroke.outline = 5;
        oContainer.addChild(oTurnMatchTextStroke);

        var oTurnMatchText = new createjs.Text(szText, "50px " + FONT_GAME, TEXT_COLOR);
        oTurnMatchText.x = 0;
        oTurnMatchText.y = 0;
        oTurnMatchText.textAlign = "center";
        oTurnMatchText.lineWidth = oTurnMatchTextStroke.lineWidth;
        oContainer.addChild(oTurnMatchText);

        s_oStage.addChild(oContainer);

        createjs.Tween.get(oContainer).to({x: CANVAS_WIDTH_HALF}, 750, createjs.Ease.quartOut).call(function () {
            createjs.Tween.get(oContainer).wait(300).to({x: CANVAS_WIDTH + 200}, 750, createjs.Ease.quartIn).call(function () {
                s_oStage.removeChild(oContainer);
            });
        });
    };

    this.unloadPause = function () {
        _oPause.unload();
        _oPause = null;
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onExit = function () {
        var _oAreYouSure = new CAreYouSurePanel(s_oStage);
        _oAreYouSure.show();
    };

    this._onPause = function () {
        s_oGame.unpause(false);
        this.createPauseInterface();
    };

    this.getScoreBoardResult = function () {
        return _oScoreBoard.getResult();
    };

    this._createScrollButtons = function () {

        var oSprite = s_oSpriteLibrary.getSprite('but_scroll');
        _pStartPosLeftScroll = {x: oSprite.width * 0.5 + 10, y: CANVAS_HEIGHT * 0.5};
        _oButtonLeftScroll = new CGfxButton(_pStartPosLeftScroll.x, _pStartPosLeftScroll.y, oSprite, s_oStage);
        _oButtonLeftScroll.addEventListenerWithParams(ON_MOUSE_DOWN, s_oGame.dirScrollWorld, this, {velocity: SCROLL_VELOCITY, press: true, dir: LEFT_SCROLL_WORLD});
        _oButtonLeftScroll.addEventListenerWithParams(ON_MOUSE_UP, s_oGame.dirScrollWorld, this, {velocity: SCROLL_VELOCITY, press: false, dir: LEFT_SCROLL_WORLD});

        _pStartPosRightScroll = {x: CANVAS_WIDTH - oSprite.width * 0.5 - 10, y: CANVAS_HEIGHT * 0.5};
        _oButtonRightScroll = new CGfxButton(_pStartPosRightScroll.x, _pStartPosRightScroll.y, oSprite, s_oStage);
        _oButtonRightScroll.setScaleX(-1);
        _oButtonRightScroll.addEventListenerWithParams(ON_MOUSE_DOWN, s_oGame.dirScrollWorld, this, {velocity: -SCROLL_VELOCITY, press: true, dir: RIGHT_SCROLL_WORLD});
        _oButtonRightScroll.addEventListenerWithParams(ON_MOUSE_UP, s_oGame.dirScrollWorld, this, {velocity: -SCROLL_VELOCITY, press: false, dir: RIGHT_SCROLL_WORLD});
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

    this._init(iPlayerTeam, iOpponentTeam);

    return this;
}

var s_oInterface = null;