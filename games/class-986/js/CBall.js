function CBall(iXPos, iYPos, oSprite, iID, oParentContainer) {

    var _oParentContainer;
    var _oContainer;
    var _oBall;
    var _oShadow;
    var _oStartPos;
    var _vPos;
    var _vPrevPos;
    var _vTmpForce;
    var _vCurForce;
    var _iID;
    var _iRadius;
    var _iRadiusQuadro;
    var _iBufferTime = 0;
    var _iFrame = 0;

    this._init = function (iXPos, iYPos, oSprite, iID) {
        _oContainer = new createjs.Container();
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;

        this.createShadow();

        var oData = {
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: oSprite.width / 7, height: oSprite.height, regX: (oSprite.width / 2) / 7, regY: oSprite.height / 2}
        };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oBall = createSprite(oSpriteSheet, 0, (oSprite.width / 2) / 7, oSprite.height / 2, oSprite.width / 7, oSprite.height / 2);
        _oBall.stop();

        _oContainer.addChild(_oBall);

        _vPos = new CVector2();
        _vPos.set(_oContainer.x, _oContainer.y);
        _vPrevPos = new CVector2();
        _vPrevPos.set(0, 0);
        _vTmpForce = new CVector2();
        _vTmpForce.set(0, 0);

        _iID = iID;

        _oStartPos = {x: iXPos, y: iYPos};

        _iRadius = (oSprite.width * 0.5) / 7;

        _iRadiusQuadro = _iRadius * _iRadius;

        _vCurForce = new CVector2();
        _vCurForce.set(0, 0);

        _oParentContainer.addChild(_oContainer);

    };

    this.createShadow = function () {
        var oSpriteShadow = s_oSpriteLibrary.getSprite("player_shadow");
        _oShadow = createBitmap(oSpriteShadow);
        _oShadow.regX = oSpriteShadow.width * 0.5;
        _oShadow.regY = -7;
        _oShadow.scaleX = 0.8;
        _oShadow.scaleY = 0.8;

        _oContainer.addChild(_oShadow);
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oContainer);
    };

    this.setVisible = function (bVisible) {
        _oContainer.visible = bVisible;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;
    };

    this.resetPos = function () {
        _oContainer.x = _oStartPos.x;
        _oContainer.y = _oStartPos.y;
        _vPos.set(_oContainer.x, _oContainer.y);
        _vTmpForce.set(0, 0);
        _vCurForce.set(0, 0);
    };

    this.setAngle = function (iAngle) {
        _oBall.rotation = iAngle;
    };

    this.getX = function () {
        return _oContainer.x;
    };

    this.getY = function () {
        return _oContainer.y;
    };

    this.scale = function (fValue) {
        _oContainer.scaleX = fValue;
        _oContainer.scaleY = fValue;
    };

    this.getScale = function () {
        return _oContainer.scaleX;
    };

    this.vTmpForce = function () {
        return _vTmpForce;
    };

    this.type = function () {
        return BALL;
    };

    this.vCurForce = function () {
        return _vCurForce;
    };

    this.vPos = function () {
        return _vPos;
    };

    this.vPrevPos = function () {
        return _vPrevPos;
    };

    this.getRadius = function () {
        return _iRadius;
    };

    this.getRadiusQuadro = function () {
        return _iRadiusQuadro;
    };

    this.addForce = function (vForce) {
        _vTmpForce.addV(vForce);
    };

    this.setPosVector = function () {
        _oContainer.x = _vPos.getX();
        _oContainer.y = _vPos.getY();
    };

    this.isGoalKeeper = function () {
        return false;
    };

    this.getID = function () {
        return _iID;
    };

    this.rolls = function () {
        var iForceX = _vCurForce.getX();

        var iFactorX = 1;

        if (iForceX < 0) {
            iFactorX = -1;
        }

        iForceX = Math.abs(iForceX);
        //  console.log(iForceX);

        if (iForceX > 4) {
            _oBall.rotation += 10 * iFactorX;
        } else if (iForceX > 3) {
            _iBufferTime++;
            if (_iBufferTime === 2) {
                _oBall.rotation += 8 * iFactorX;
                _iBufferTime = 0;
            }
        } else if (iForceX > 1) {
            _iBufferTime++;
            if (_iBufferTime === 3) {
                _oBall.rotation += 4 * iFactorX;
                _iBufferTime = 0;
            }
        } else if (iForceX > MIN_PLAYER_FORCE_VEL) {
            _iBufferTime++;
            if (_iBufferTime === 4) {
                _oBall.rotation += 2 * iFactorX;
                _iBufferTime = 0;
            }
        }

        var iForceY = Math.abs(_vCurForce.getY());

        var oFuncRot = this._goToPrevFrame;

        if (_vCurForce.getY() < 0) {
            oFuncRot = this._goToNextFrame;
        }



        if (iForceY > 5) {
            oFuncRot();
        } else if (iForceY > 3) {
            _iBufferTime++;
            if (_iBufferTime > 2) {
                oFuncRot();
                _iBufferTime = 0;
            }
        } else if (iForceY > 1) {
            _iBufferTime++;
            if (_iBufferTime > 3) {
                oFuncRot();
                _iBufferTime = 0;
            }
        } else if (iForceY > MIN_PLAYER_FORCE_VEL) {
            _iBufferTime++;
            if (_iBufferTime > 4) {
                oFuncRot();
                _iBufferTime = 0;
            }
        }
    };

    this._goToPrevFrame = function () {
        if (_iFrame === 0) {
            _iFrame = 6;
            _oBall.gotoAndStop(_iFrame);
        } else {
            _iFrame--;
            _oBall.gotoAndStop(_iFrame);
        }
    };

    this._goToNextFrame = function () {
        if (_iFrame === 7) {
            _iFrame = 1;
            _oBall.gotoAndStop(_iFrame);
        } else {
            _iFrame++;
            _oBall.gotoAndStop(_iFrame);
        }
    };


    this.getChildIndex = function () {
        _oParentContainer.getChildIndex(_oContainer);
    };

    this.setChildIndex = function (iValue) {
        _oParentContainer.setChildIndex(_oContainer, iValue);
    };

    this.getObject = function () {
        return _oContainer;
    };

    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos, oSprite, iID);

    return this;
}
