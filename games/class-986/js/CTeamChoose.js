function CTeamChoose() {
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosContinue;
    var _pStartPosFullscreen;
    
    var _oBg;
    var _oMsgBox;
    var _oButContinue;
    var _oContTextSelectTeam;
    var _oFade;
    var _oAudioToggle;
    var _oButExit;
    var _oFlagSelect;
    var _oFade;
    var _oBackFlag;
    var _oNationalText;
    var _oNationalTextStroke;
    var _oContainer;
    var _aPlayerTeamFlag;
    var _aPlayerTeam;
    var _aTeamText;
    var _iActiveTeam;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function () {
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(_oBg);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;

        s_oStage.addChild(_oFade);

        var oSpriteMsgBox = s_oSpriteLibrary.getSprite('msg_box');
        _oMsgBox = createBitmap(oSpriteMsgBox);
        _oMsgBox.x = CANVAS_WIDTH * 0.5;
        _oMsgBox.y = CANVAS_HEIGHT * 0.5;
        _oMsgBox.regX = oSpriteMsgBox.width * 0.5;
        _oMsgBox.regY = oSpriteMsgBox.height * 0.5;
        s_oStage.addChild(_oMsgBox);

        _aTeamText = new Array();

        _aPlayerTeam = new Array();
        _aPlayerTeamFlag = new Array();

        _oContainer = new createjs.Container();

        _iActiveTeam = 0;

        var iTimeAnim = 1500;

        var oSpriteFlag = s_oSpriteLibrary.getSprite("flags");

        _oBackFlag = new CFlag(928, 293, 0, false, oSpriteFlag, _oContainer);
        _oBackFlag.block(true);

        var iOffsetX = START_POS_FLAG.x;
        var iOffsetY = START_POS_FLAG.y;

        var oSpriteFlagSmall = s_oSpriteLibrary.getSprite("flags_small");

        for (var i = 0; i < TOT_TEAM; i++) {
            var iTimeWait = Math.floor(Math.random() * 500);
            this._createFlag(i, iOffsetX, iOffsetY, iTimeWait, iTimeAnim, oSpriteFlagSmall, _oContainer);

            var oSpritePlayer = s_oSpriteLibrary.getSprite("turn_" + i);
            _aPlayerTeam[i] = new CTurnPlayer(976, 423, oSpritePlayer, _oContainer);
            _aPlayerTeam[i].setVisible(false);
            _aPlayerTeam[i].setScale(0.92);
            _aPlayerTeam[i].stopAnim();

            if (iOffsetX < FLAG_LIMIT_POS_X) {
                iOffsetX += FLAG_ADDED_POS.x;
            } else {
                iOffsetX = START_POS_FLAG.x;
                iOffsetY += FLAG_ADDED_POS.y;
            }
        }

        _aPlayerTeam[0].setVisible(true);
        _aPlayerTeam[0].playAnim();

        var oSpriteFlagSelection = s_oSpriteLibrary.getSprite("team_selection");

        _oFlagSelect = createBitmap(oSpriteFlagSelection);
        _oFlagSelect.x = _aPlayerTeamFlag[0].getX();
        _oFlagSelect.y = _aPlayerTeamFlag[0].getY() + 3;
        _oFlagSelect.regX = oSpriteFlagSelection.width * 0.5;
        _oFlagSelect.regY = oSpriteFlagSelection.height * 0.5;

        s_oStage.addChild(_oContainer);

        _oContainer.y = 0;

        _oContTextSelectTeam = new createjs.Container();

        var oSelectTeamText;

        oSelectTeamText = new createjs.Text(TEXT_SELECT_YOUR_TEAM, "48px " + FONT_GAME, TEXT_COLOR);
        oSelectTeamText.textAlign = "center";
        oSelectTeamText.x = 0;
        oSelectTeamText.y = 0;

        var oSelectTeamTextStroke;

        oSelectTeamTextStroke = new createjs.Text(TEXT_SELECT_YOUR_TEAM, "48px " + FONT_GAME, "#ff6000");
        oSelectTeamTextStroke.textAlign = "center";

        oSelectTeamTextStroke.x = 0;
        oSelectTeamTextStroke.y = 0;
        oSelectTeamTextStroke.outline = 5;

        _oContTextSelectTeam.x = 682;
        _oContTextSelectTeam.y = 115;

        _oContTextSelectTeam.addChild(oSelectTeamTextStroke, oSelectTeamText);

        s_oStage.addChild(_oContTextSelectTeam);

        _oNationalTextStroke = new createjs.Text(TEXT_TEAM[0], "48px " + FONT_GAME, "#ff6000");
        _oNationalTextStroke.textAlign = "center";
        _oNationalTextStroke.textBaseline = "middle";
        _oNationalTextStroke.x = 590;
        _oNationalTextStroke.y = 498;
        _oNationalTextStroke.outline = 4;

        s_oStage.addChild(_oNationalTextStroke);

        _oNationalText = new createjs.Text(TEXT_TEAM[0], "48px " + FONT_GAME, TEXT_COLOR);
        _oNationalText.textAlign = "center";
        _oNationalText.textBaseline = "middle";
        _oNationalText.x = _oNationalTextStroke.x;
        _oNationalText.y = _oNationalTextStroke.y;

        s_oStage.addChild(_oNationalText);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.width / 2) - 60, y: (oSprite.height / 2) + 20};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
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
            _pStartPosFullscreen = {x:oSprite.width/4 + 10,y:(oSprite.height / 2) + 20};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _pStartPosContinue = {x: 997, y: 481};
        var oSpriteContinue = s_oSpriteLibrary.getSprite("but_continue_small");

        _oButContinue = new CGfxButton(_pStartPosContinue.x, _pStartPosContinue.y, oSpriteContinue, s_oStage);
        _oButContinue.addEventListener(ON_MOUSE_UP, this._onButContinueRelease, this);
        _oButContinue.pulseAnimation();

        var oSpriteExit = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSpriteExit.height / 2) - 20, y: (oSpriteExit.height / 2) + 20};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSpriteExit, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, 1000).call(function () {
            _oFade.visible = false;
            _oContainer.addChild(_oFlagSelect);
        });

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this._createFlag = function (i, iOffsetX, iOffsetY, iTimeWait, iTimeAnim, oSprite, oContainer) {
        _aPlayerTeamFlag[i] = new CFlag(iOffsetX, iOffsetY, i, true, oSprite, oContainer);
        _aPlayerTeamFlag[i].addEventListenerWithParams(ON_MOUSE_UP, this._onButTeamChoose, this, i);

        _aPlayerTeamFlag[i].setScale(1);

        _aPlayerTeamFlag[i].showAnimation(iTimeWait, iTimeAnim);
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX, iNewY + _pStartPosExit.y);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
    };

    this._onButTeamChoose = function (iID) {
        if (_iActiveTeam !== iID) {
            _aPlayerTeam[iID].setVisible(true);
            _aPlayerTeam[iID].playAnim();
            _oBackFlag.changeTeam(iID);
            _oFlagSelect.x = _aPlayerTeamFlag[iID].getX();
            _oFlagSelect.y = _aPlayerTeamFlag[iID].getY() + 3;

            _oNationalText.text = TEXT_TEAM[iID];
            _oNationalTextStroke.text = _oNationalText.text;

            _aPlayerTeam[_iActiveTeam].setVisible(false);
            _aPlayerTeam[_iActiveTeam].stopAnim();

            _iActiveTeam = iID;
        }
    };

    this.unload = function () {
        for (var i = 0; i < _aPlayerTeamFlag.length; i++) {
            _aPlayerTeamFlag[i].unload();
            _aPlayerTeamFlag[i] = null;
        }

        _oButExit.unload();
        _oButExit = null;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        s_oStage.removeAllChildren();
        createjs.Tween.removeAllTweens();

        s_oTeamChoose = null;
    };

    this._onExit = function () {
        this.unload();

        s_oMain.gotoMenu();
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onButContinueRelease = function () {
        this.unload();

        s_oMain.gotoGame(_iActiveTeam);
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
    
    s_oTeamChoose = this;

    this._init();
}

var s_oTeamChoose = null;