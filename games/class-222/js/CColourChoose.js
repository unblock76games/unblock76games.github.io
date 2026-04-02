function CColourChoose(iPlayers, iMode) {
    var _iPlayers = iPlayers;
    var _iMode;
    var _pStartPosAudio;
    var _pStartPosExit;
    var _oBg;
    var _oMsgBox;
    var _oContTextSelectColour;
    var _oFade;
    var _oAudioToggle;
    var _oButExit;
    var _aButColour;
    var _oContainer;
    var _oContainerButColours;
    var _oSelectColourTextStroke;
    var _oSelectColourText;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    var _iCurPlayerToChoose;
    var _aPlayerColors;

    this._init = function () {
        _iMode = iMode;
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;

        s_oStage.addChild(_oFade);

        _oContainer = new createjs.Container;
        s_oStage.addChild(_oContainer);
        
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        _oBg.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oContainer.addChild(_oBg);

        var oSpriteMsgBox = s_oSpriteLibrary.getSprite('msg_box');
        _oMsgBox = createBitmap(oSpriteMsgBox);
        _oMsgBox.x = CANVAS_WIDTH * 0.5;
        _oMsgBox.y = CANVAS_HEIGHT * 0.5;
        _oMsgBox.regX = oSpriteMsgBox.width * 0.5;
        _oMsgBox.regY = oSpriteMsgBox.height * 0.5;
        _oContainer.addChild(_oMsgBox);

        _oContTextSelectColour = new createjs.Container();
        _oContTextSelectColour.x = 682;
        _oContTextSelectColour.y = 135;
        _oContainer.addChild(_oContTextSelectColour);
        
        _oSelectColourTextStroke = new CTLText(_oContTextSelectColour, 
                    -250, 40, 500, 40, 
                    40, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SELECT_COLOUR,
                    true, true, true,
                    false );
        _oSelectColourTextStroke.setOutline(5);
        
        _oSelectColourText = new CTLText(_oContTextSelectColour, 
                    -250, 40, 500, 40, 
                    40, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SELECT_COLOUR,
                    true, true, true,
                    false );


        if (_iMode === HUMAN_VS_HUMAN) {
            _aPlayerColors = new Array();
            _iCurPlayerToChoose = 1;
            
            _oSelectColourText.text = TEXT_PLAYER_COLOUR.format(_iCurPlayerToChoose);
            _oSelectColourTextStroke.text = TEXT_PLAYER_COLOUR.format(_iCurPlayerToChoose);
        }

        
        
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.width / 2) - 60, y: (oSprite.height / 2) + 20};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        _oContainerButColours = new createjs.Container;
        _oContainer.addChild(_oContainerButColours);
        
        // CREATE BUTTONS FOR EACH COLOUR TO CHOOSE (ACCORDING TO HOW MANY PLAYERS WILL BE IN THE GAME)

        _aButColour = new Array();

        var _iOffsetX = 50;

        var oSprite = s_oSpriteLibrary.getSprite('goose_0');
        _aButColour[0] = new CGfxButton(oSprite.width/2, oSprite.height/2, oSprite, _oContainerButColours);
        _aButColour[0].addEventListener(ON_MOUSE_UP, function() { this._onButColourRelease(0); }, this);
        
        var oSprite = s_oSpriteLibrary.getSprite('goose_1');
        _aButColour[1] = new CGfxButton( oSprite.width/2*2 + _iOffsetX, oSprite.height/2, oSprite, _oContainerButColours);
        _aButColour[1].addEventListener(ON_MOUSE_UP, function() { this._onButColourRelease(1); }, this);
        
        var oSprite = s_oSpriteLibrary.getSprite('goose_2');
        _aButColour[2] = new CGfxButton( oSprite.width/2*3 + (_iOffsetX*2), oSprite.height/2, oSprite, _oContainerButColours);
        _aButColour[2].addEventListener(ON_MOUSE_UP, function() { this._onButColourRelease(2); }, this);
        
        var oSprite = s_oSpriteLibrary.getSprite('goose_3');
        _aButColour[3] = new CGfxButton( oSprite.width/2*4 + (_iOffsetX*3), oSprite.height/2, oSprite, _oContainerButColours);
        _aButColour[3].addEventListener(ON_MOUSE_UP, function() { this._onButColourRelease(3); }, this);
        
        var oSprite = s_oSpriteLibrary.getSprite('goose_4');
        _aButColour[4] = new CGfxButton( oSprite.width/2*5 + (_iOffsetX*4), oSprite.height/2, oSprite, _oContainerButColours);
        _aButColour[4].addEventListener(ON_MOUSE_UP, function() { this._onButColourRelease(4); }, this);
        
        var oSprite = s_oSpriteLibrary.getSprite('goose_5');
        _aButColour[5] = new CGfxButton( oSprite.width/2*6 + (_iOffsetX*5), oSprite.height/2, oSprite, _oContainerButColours);
        _aButColour[5].addEventListener(ON_MOUSE_UP, function() { this._onButColourRelease(5); }, this);


        var bounds = _oContainerButColours.getBounds();
        _oContainerButColours.x = CANVAS_WIDTH_HALF;
        _oContainerButColours.y = CANVAS_HEIGHT_HALF + 10;
        _oContainerButColours.regX = bounds.width/2;
        _oContainerButColours.regY = bounds.height/2;

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
        _oButExit = null;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        s_oStage.removeAllChildren();
        createjs.Tween.removeAllTweens();
        s_oColourChoose = null;
    };

    this._onExit = function () {
        this.unload();

        s_oMain.gotoMenu();
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onButColourRelease = function(iColour) {
        if (_iMode === HUMAN_VS_CPU) {
            this.unload();
            s_oMain.gotoGame(_iPlayers, iColour, _iMode);
        }else {
            _aPlayerColors[_iCurPlayerToChoose-1] = iColour;
            
            _iCurPlayerToChoose++;
            _aButColour[iColour].setVisible(false);
            _oSelectColourText.text = TEXT_PLAYER_COLOUR.format(_iCurPlayerToChoose);
            _oSelectColourTextStroke.text = TEXT_PLAYER_COLOUR.format(_iCurPlayerToChoose);

            if(_iCurPlayerToChoose > _iPlayers){
                this.unload();
                s_oMain.gotoGame(_iPlayers, iColour, _iMode, _aPlayerColors);
            }
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

    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.isEnabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    s_oColourChoose = this;

    this._init();
}

var s_oColourChoose = null;