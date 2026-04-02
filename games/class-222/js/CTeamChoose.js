function CTeamChoose(iMode) {
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosPlay;
    var _oBg;
    var _oMsgBox;
    var _oContTextSelectTeam;
    var _oFade;
    var _oAudioToggle;
    var _oButExit;
    var _oButPlay2;
    var _oButPlay3;
    var _oButPlay4;
    var _oButPlay5;
    var _oButPlay6;
    var _iMode;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    this._init = function () {
        _pStartPosPlay = {x: CANVAS_WIDTH_HALF, y: CANVAS_HEIGHT_HALF - 20};
        _iMode = iMode;
        
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        _oBg.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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

        _oContTextSelectTeam = new createjs.Container();
        _oContTextSelectTeam.x = 682;
        _oContTextSelectTeam.y = 135;
        s_oStage.addChild(_oContTextSelectTeam);
        
        
        var  oSelectTeamTextStroke = new CTLText(_oContTextSelectTeam, 
                    -250, 40, 500, 40, 
                    40, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SELECT_PLAYERS,
                    true, true, true,
                    false );
        oSelectTeamTextStroke.setOutline(5);
                    
        var oSelectTeamText = new CTLText(_oContTextSelectTeam, 
                    -250, 40, 500, 40, 
                    40, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SELECT_PLAYERS,
                    true, true, true,
                    false );
                    

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.width / 2) - 60, y: (oSprite.height / 2) + 20};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
        
        var iXOffset;
        
        var oSprite = s_oSpriteLibrary.getSprite('but_play_2');
        iXOffset = oSprite.width * 0.9;
        _oButPlay2 = new CGfxButton(_pStartPosPlay.x - iXOffset*2, _pStartPosPlay.y + 12, oSprite, s_oStage);
        _oButPlay2.addEventListener(ON_MOUSE_UP, function() { this._onButPlayRelease(2) }, this);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_play_3');
        _oButPlay3 = new CGfxButton(_pStartPosPlay.x - iXOffset, _pStartPosPlay.y + 100, oSprite, s_oStage);
        _oButPlay3.addEventListener(ON_MOUSE_UP, function() { this._onButPlayRelease(3) }, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_play_4');
        _oButPlay4 = new CGfxButton(_pStartPosPlay.x, _pStartPosPlay.y, oSprite, s_oStage);
        _oButPlay4.addEventListener(ON_MOUSE_UP, function() { this._onButPlayRelease(4) }, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_play_5');
        _oButPlay5 = new CGfxButton(_pStartPosPlay.x + iXOffset, _pStartPosPlay.y + 90, oSprite, s_oStage);
        _oButPlay5.addEventListener(ON_MOUSE_UP, function() { this._onButPlayRelease(5) }, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_play_6');
        _oButPlay6 = new CGfxButton(_pStartPosPlay.x + iXOffset*2, _pStartPosPlay.y, oSprite, s_oStage);
        _oButPlay6.addEventListener(ON_MOUSE_UP, function() { this._onButPlayRelease(6) }, this);
        
        var oSpriteExit = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSpriteExit.height / 2) - 20, y: (oSpriteExit.height / 2) + 20};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSpriteExit, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, 1000).call(function () {
            _oFade.visible = false;
        });

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX, _pStartPosExit.y);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, _pStartPosAudio.y);
        }
    };

    this.unload = function () {
        _oButExit.unload();
        _oButPlay2.unload();
        _oButPlay3.unload();
        _oButPlay4.unload();
        _oButPlay5.unload();
        _oButPlay6.unload();
        _oButExit = null;
        _oButPlay2 = null;
        _oButPlay3 = null;
        _oButPlay4 = null;
        _oButPlay5 = null;
        _oButPlay6 = null;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
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

    this._onButPlayRelease = function(iPlayers) {
        this.unload();
        
        if (_iMode === HUMAN_VS_CPU) {
            s_oMain.gotoColourChoose(iPlayers, _iMode);
        } else {
            s_oMain.gotoColourChoose(iPlayers, _iMode);
        };
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
	if (_fRequestFullScreen && screenfull.isEnabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    s_oTeamChoose = this;

    this._init();
}

var s_oTeamChoose = null;