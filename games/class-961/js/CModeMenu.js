function CModeMenu(){
    
    var _bNumActive;

    var _iCurLevelActive;
    var _ilevelSelected;

    var _oLevelTextContainer;
    var _aLevels = new Array();
    var _aLevelTime;  
    
    var _oModeNumOff;
    var _oModeNumOn;

    var _oBg;
    var _oStreet;
    var _oButExit;
    var _oAudioToggle;
    var _oButShop;

    var _oFade;
    var _oCurtain;

    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosShop;

    this._init = function () {
        _iCurLevelActive = 0;
        
        _oBg = new CBackground(s_oStage);
        _oStreet = new CStreet(0, s_oStage, s_oStage);
        _oStreet.setArrive(-400);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0.7;
        s_oStage.addChild(_oFade);

        _bNumActive = false;

        _oLevelTextContainer = new createjs.Container();
        _oLevelTextContainer.x = 0;
        _oLevelTextContainer.y = 0;

        var iY = 180;

        var oLevelTextStroke = new createjs.Text(TEXT_SELECT_STAGE, " 70px " + PRIMARY_FONT, "#3e240b");
        oLevelTextStroke.x = CANVAS_WIDTH / 2;
        oLevelTextStroke.y = iY;
        oLevelTextStroke.outline = 10;
        oLevelTextStroke.textAlign = "center";
        oLevelTextStroke.textBaseline = "alphabetic";
        oLevelTextStroke.lineWidth = 1000;

        var oLevelText = new createjs.Text(TEXT_SELECT_STAGE, " 70px " + PRIMARY_FONT, "#ffffff");
        oLevelText.x = CANVAS_WIDTH / 2;
        oLevelText.y = iY;
        oLevelText.textAlign = "center";
        oLevelText.textBaseline = "alphabetic";
        oLevelText.lineWidth = 1000;

        _oLevelTextContainer.addChild(oLevelTextStroke, oLevelText);
        s_oStage.addChild(_oLevelTextContainer);

        var oModePos = {x: CANVAS_WIDTH * 0.5 - 20, y: 425};

        var offset_x = -200;
        var offset_y = -100;
        
        _aLevelTime = new Array();
        
        _aLevelTime = s_oLocalStorage.getItemJson(LOCALSTORAGE_TIMES);
        for (var i = 0; i < _aLevelTime.length; i++) {
            if(_aLevelTime[i] > 0){
                _iCurLevelActive++;
            }
        }                
        
        for (var i = 0; i < NUM_TRACK; i++, offset_x += 170) {
            if (offset_x > 600) {
                offset_x = -200;
                offset_y += 200;
            }

            if (i <= _iCurLevelActive) {
                _aLevels[i] = new CLevelBut((oModePos.x - 120) + offset_x, oModePos.y + offset_y, s_oSpriteLibrary.getSprite('but_level'), true, i + 1, s_oStage);
                _aLevels[i].addEventListenerWithParams(ON_MOUSE_UP, this._onClick, this, i);
                _aLevels[i].enable();
            } else {
                _aLevels[i] = new CLevelBut((oModePos.x - 120) + offset_x, oModePos.y + offset_y, s_oSpriteLibrary.getSprite('but_level'), false, i + 1, s_oStage);
                _aLevels[i].disable();
            }

            _aLevels[i].addLevelText(i + 1);
            _aLevels[i].disable();

            s_bFirstTime = true;
        }
        this._setLevelInfo();
        

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height / 2) - 10, y: (oSprite.height / 2) + 17};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosExit.x - oSprite.height - 10, y: _pStartPosExit.y};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            
            var oSprite = s_oSpriteLibrary.getSprite('but_shop');
            _pStartPosShop = {x: _pStartPosAudio.x - oSprite.height - 10, y: _pStartPosAudio.y};
            _oButShop = new CGfxButton(_pStartPosShop.x, _pStartPosShop.y, oSprite, s_oStage);
            _oButShop.addEventListener(ON_MOUSE_UP, this._onShop, this);
        } else {
            var oSprite = s_oSpriteLibrary.getSprite('but_shop');
            _pStartPosShop = {x: _pStartPosExit.x - oSprite.height - 10, y: _pStartPosExit.y};
            _oButShop = new CGfxButton(_pStartPosShop.x, _pStartPosShop.y, oSprite, s_oStage);
            _oButShop.addEventListener(ON_MOUSE_UP, this._onShop, this);
        }

        

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        new createjs.Tween.get(_oFade).to({alpha: 0}, 1000);

        _oCurtain = new CCurtain(s_oStage);
        _oCurtain.openAnim();

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
        
    };

    this.unload = function () {
        for (var i = 0; i < NUM_TRACK; i++) {
            _aLevels[i].unload();
        }
        _oFade.off("mousedown");
        
        s_oLevelMenu = null;
        s_oStage.removeAllChildren();
        
        _oCurtain.unload();
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, _pStartPosAudio.y + iNewY);
        }
        _oButExit.setPosition(_pStartPosExit.x - iNewX, _pStartPosExit.y + iNewY);
        _oButShop.setPosition(_pStartPosShop.x - iNewX, _pStartPosShop.y + iNewY);
    };

    this._setLevelInfo = function(){
        
        
        if(_iCurLevelActive < NUM_TRACK){
            _aLevels[_iCurLevelActive].enable();
            _aLevels[_iCurLevelActive].pulseAnimation();
        }

        for(var i=0; i<_iCurLevelActive; i++){ 
            _aLevels[i].enable();
            
            _aLevels[i].addScore(_aLevelTime[i]);
        }
        
        
    };

    this._onNumModeToggle = function (iData) {
        if (iData === NUM_ACTIVE) {
            _bNumActive = true;
            _oModeNumOff.setActive(false);
            _oModeNumOn.setActive(true);

        } else {
            _bNumActive = false;
            _oModeNumOff.setActive(true);
            _oModeNumOn.setActive(false);
        }
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onClick = function (i) {
  
        _ilevelSelected = i;
        _oFade.on("mousedown", function(){});
        createjs.Tween.get(_oFade, {override:true}).to({alpha: 1}, 500);
        
        _oCurtain.closeAnim(this._onCurtainClose);
    };

    this._onCurtainClose = function(){
        s_oLevelMenu.unload();
        s_oMain.gotoGame(_ilevelSelected);
    };

    this._onExit = function () {
        $(s_oMain).trigger("end_session");
        _oCurtain.closeAnim(this._onExitCurtainClose);
    };
    
    this._onExitCurtainClose = function(){
        s_oLevelMenu.unload();
        s_oMain.gotoMenu();
    };

    this._onShop = function(){
        new CShopPanel();
    };

    s_oLevelMenu = this;
    this._init();
};


var s_oLevelMenu = null;