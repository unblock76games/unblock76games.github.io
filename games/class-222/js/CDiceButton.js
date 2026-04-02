function CDiceButton(iXPos, iYPos, oParentContainer) {
    var _aCbCompleted;
    var _aCbOwner;
    var _oButton;
    var _aParams;
    var _fScaleX;
    var _fScaleY;
    var _oParent;
    var _oTween;
    var _bBlock = false;
    var _oListenerMouseDown;
    var _oListenerMouseUp;

    var _oParentContainer;

    this._init = function (iXPos, iYPos) {
        _aCbCompleted = new Array();
        _aCbOwner = new Array();
        _aParams = new Array();
        
        var oData = {   
                images: [s_oSpriteLibrary.getSprite('but_dices_on'),
                         s_oSpriteLibrary.getSprite('but_dices_off')],
                framerate: 0,
                // width, height & registration point of each sprite
                frames: {width: 120, height: 119, regX: 60, regY: 60}, 
                animations: { on: [0, 0, false], off: [1, 1, false]}
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oButton = createSprite(oSpriteSheet, "on", 60, 60, 120, 119);
        _oButton.x = iXPos;
        _oButton.y = iYPos;
        _oButton.gotoAndPlay("off");

        _fScaleX = 1;
        _fScaleY = 1;

        if (!s_bMobile)
            _oButton.cursor = "pointer";

        _oParentContainer.addChild(_oButton);

        this._initListener();
    };

    this.unload = function () {
        _oButton.off("mousedown", _oListenerMouseDown);
        _oButton.off("pressup", _oListenerMouseUp);

        _oParentContainer.removeChild(_oButton);
    };
    
    this.toggle = function(evt) {
        if (!evt) {
            _oButton.gotoAndPlay("off");
        } else {
            _oButton.gotoAndPlay("on");
        };
    };

    this.setVisible = function (bVisible) {
        _oButton.visible = bVisible;
    };

    this.setCursorType = function (szValue) {
        _oButton.cursor = szValue;
    };

    this._initListener = function () {
        _oListenerMouseDown = _oButton.on("mousedown", this.buttonDown);
        _oListenerMouseUp = _oButton.on("pressup", this.buttonRelease);
    };

    this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };

    this.addEventListenerWithParams = function (iEvent, cbCompleted, cbOwner, aParams) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        _aParams[iEvent] = aParams;
    };

    this.buttonRelease = function () {
        if (_bBlock) {
            return;
        }

        if (_fScaleX > 0) {
            _oButton.scaleX = 1;
        } else {
            _oButton.scaleX = -1;
        }
        _oButton.scaleY = 1;

        playSound("click", 1, 0);

        if (_aCbCompleted[ON_MOUSE_UP]) {
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP], _aParams[ON_MOUSE_UP]);
        }
    };

    this.buttonDown = function () {
        if (_bBlock) {
            return;
        }

        if (_fScaleX > 0) {
            _oButton.scaleX = 0.9;
        } else {
            _oButton.scaleX = -0.9;
        }
        _oButton.scaleY = 0.9;

        if (_aCbCompleted[ON_MOUSE_DOWN]) {
            _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN], _aParams[ON_MOUSE_DOWN]);
        }
    };

    this.rotation = function (iRotation) {
        _oButton.rotation = iRotation;
    };

    this.getButton = function () {
        return _oButton;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oButton.x = iXPos;
        _oButton.y = iYPos;
    };

    this.setX = function (iXPos) {
        _oButton.x = iXPos;
    };

    this.setY = function (iYPos) {
        _oButton.y = iYPos;
    };

    this.getButtonImage = function () {
        return _oButton;
    };

    this.block = function (bVal) {
        _bBlock = bVal;
        _oButton.scaleX = _fScaleX;
        _oButton.scaleY = _fScaleY;
    };

    this.setScaleX = function (fValue) {
        _oButton.scaleX = fValue;
        _fScaleX = fValue;
    };

    this.getX = function () {
        return _oButton.x;
    };

    this.getY = function () {
        return _oButton.y;
    };

    this.pulseAnimation = function () {
        _oTween = createjs.Tween.get(_oButton, {loop: true})
                .to({scaleX: _fScaleX * 0.9, scaleY: _fScaleY * 0.9}, 850, createjs.Ease.quadOut)
                .to({scaleX: _fScaleX, scaleY: _fScaleY}, 650, createjs.Ease.quadIn);
    };

    this.trebleAnimation = function () {
        _oTween = createjs.Tween.get(_oButton)
                .to({rotation: 5}, 75, createjs.Ease.quadOut)
                .to({rotation: -5}, 140, createjs.Ease.quadIn)
                .to({rotation: 0}, 75, createjs.Ease.quadIn)
                .wait(750).call(function () {
            _oParent.trebleAnimation();
        });
    };

    this.removeAllTweens = function () {
        createjs.Tween.removeTweens(_oButton);
    };

    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos);

    _oParent = this;

    return this;
}