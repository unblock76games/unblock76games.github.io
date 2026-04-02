function CFlag(iXPos, iYPos, iTeam, bButton, oSprite, oParentContainer) {

    var _aCbCompleted = null;
    var _aCbOwner = null;
    var _oFlag;
    var _aParams = null;
    var _fScaleX;
    var _fScaleY;
    var _oParent;
    var _bBlock = false;
    var _bButton = false;

    var _oParentContainer;

    this._init = function (iXPos, iYPos, oSprite, iTeam, bButton) {

        var oData = {
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: oSprite.width / 6, height: oSprite.height / 6, regX: (oSprite.width / 2) / 6, regY: (oSprite.height / 2) / 6}
        };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oFlag = createSprite(oSpriteSheet, iTeam, (oSprite.width / 2) / 6, (oSprite.height / 2) / 6, oSprite.width / 6, oSprite.height / 6);

        _oFlag.gotoAndStop(iTeam);

        _oFlag.x = iXPos;
        _oFlag.y = iYPos;

        _fScaleX = 1;
        _fScaleY = 1;

        _oParentContainer.addChild(_oFlag);

        _bButton = bButton;

        if (_bButton) {
            if (!s_bMobile)
                _oFlag.cursor = "pointer";
            this._initListener();
            _aCbCompleted = new Array();
            _aCbOwner = new Array();
        }
    };

    this.unload = function () {
        if (_bButton) {
            _oFlag.off("mousedown", this.buttonDown);
            _oFlag.off("pressup", this.buttonRelease);
        }

        _oParentContainer.removeChild(_oFlag);
    };

    this.setVisible = function (bVisible) {
        _oFlag.visible = bVisible;
    };

    this.setCursorType = function (szValue) {
        _oFlag.cursor = szValue;
    };

    this._initListener = function () {
        _oFlag.on("mousedown", this.buttonDown);
        _oFlag.on("pressup", this.buttonRelease);
    };

    this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };

    this.addEventListenerWithParams = function (iEvent, cbCompleted, cbOwner, aParams) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        _aParams = aParams;
    };

    this.buttonRelease = function () {

        if (_bBlock) {
            return;
        }

        if (_fScaleX > 0) {
            _oFlag.scaleX = _fScaleX;
        } else {
            _oFlag.scaleX = -_fScaleX;
        }

        if (_fScaleY > 0) {
            _oFlag.scaleY = _fScaleY;
        } else {
            _oFlag.scaleY = -_fScaleY;
        }

        playSound("click", 1, false);

        if (_aCbCompleted[ON_MOUSE_UP]) {
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP], _aParams);
        }
    };

    this.buttonDown = function () {
        if (_bBlock) {
            return;
        }

        if (_fScaleX > 0) {
            _oFlag.scaleX = _fScaleX - 0.1;
        } else {
            _oFlag.scaleX = -_fScaleX + 0.1;
        }

        if (_fScaleY > 0) {
            _oFlag.scaleY = _fScaleY - 0.1;
        } else {
            _oFlag.scaleY = -_fScaleY + 0.1;
        }


        if (_aCbCompleted[ON_MOUSE_DOWN]) {
            _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN], _aParams);
        }
    };

    this.rotation = function (iRotation) {
        _oFlag.rotation = iRotation;
    };

    this.getButton = function () {
        return _oFlag;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oFlag.x = iXPos;
        _oFlag.y = iYPos;
    };

    this.setX = function (iXPos) {
        _oFlag.x = iXPos;
    };

    this.setY = function (iYPos) {
        _oFlag.y = iYPos;
    };

    this.getButtonImage = function () {
        return _oFlag;
    };

    this.block = function (bVal) {
        _bBlock = bVal;
        _oFlag.scaleX = _fScaleX;
        _oFlag.scaleY = _fScaleY;
    };

    this.setScaleX = function (fValue) {
        _oFlag.scaleX = fValue;
        _fScaleX = fValue;
    };

    this.setScale = function (fValue) {
        _oFlag.scaleX = fValue;
        _oFlag.scaleY = fValue;

        _fScaleX = fValue;
        _fScaleY = fValue;
    };

    this.changeTeam = function (iVal) {
        _oFlag.gotoAndStop(iVal);
    };

    this.getX = function () {
        return _oFlag.x;
    };

    this.getY = function () {
        return _oFlag.y;
    };

    this.showAnimation = function (iTimeWait, iTimeAnim) {
        _oFlag.scaleX = 0;
        _oFlag.scaleY = 0;

        createjs.Tween.get(_oFlag).wait(iTimeWait).to({scaleY: _fScaleY, scaleX: _fScaleX}, iTimeAnim, createjs.Ease.elasticOut);
    };

    this.removeAllTweens = function () {
        createjs.Tween.removeTweens(_oFlag);
    };

    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos, oSprite, iTeam, bButton);

    _oParent = this;

    return this;
}