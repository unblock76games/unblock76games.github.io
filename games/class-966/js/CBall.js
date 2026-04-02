function CBall(iXPos, iYPos, oSprite, oPhysics, oParentContainer) {

    var _oBall;
    var _oBallTrajectory;
    var _oParentContainer;
    var _oPhysics;
    var _oShadow;
    var _oContainer;
    var _fStartShadowPos = null;
    var _fScale = (FOV * BALL_RADIUS) - 284;
    var _fScaleShadow = _fScale;
    var _oTween = null;
    var _bCastShadown = true;

    this._init = function (iXPos, iYPos, oSprite) {
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);

        _oBall = createBitmap(oSprite);
        _oBall.x = iXPos;
        _oBall.y = iYPos;
        _oBall.regX = oSprite.width * 0.5;
        _oBall.regY = oSprite.height * 0.5;

        var oSpriteShadow = s_oSpriteLibrary.getSprite("ball_shadow");
        _oShadow = createBitmap(oSpriteShadow);
        _oShadow.x = iXPos;
        _oShadow.y = iYPos;
        _oShadow.regX = oSpriteShadow.width * 0.5;
        _oShadow.regY = oSpriteShadow.height * 0.5;

        this.scaleShadow(_fScaleShadow);

        _oBallTrajectory = new CBallTrajectory(_oContainer);

        _oContainer.addChild(_oShadow, _oBall);
    };

    this.castShadown = function () {
        return _bCastShadown;
    };

    this.unload = function () {
        _oBall.removeAllEventListeners();
        _oParentContainer.removeChild(_oBall);
    };

    this.setVisible = function (bVisible) {
        _oContainer.visible = bVisible;
    };

    this.getStartScale = function () {
        return _fScale;
    };

    this.startPosShadowY = function (fYPos) {
        _fStartShadowPos = fYPos;
    };

    this.getStartShadowYPos = function () {
        return _fStartShadowPos;
    };

    this.fadeAnimation = function (fVal, iTime, iWait) {
        this.tweenFade(fVal, iTime, iWait);
    };

    this.tweenFade = function (fVal, iTime, iWait) {
        _oTween = createjs.Tween.get(_oContainer, {override: true}).wait(iWait).to({alpha: fVal}, iTime).call(function () {
            _oTween = null;
        });
    };

    this.getPos = function () {
        return {x: _oBall.x, y: _oBall.y};
    };

    this.setPositionShadow = function (iX, iY) {
        _oShadow.x = iX;
        _oShadow.y = iY;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oBall.x = iXPos;
        _oBall.y = iYPos;
    };

    this.getPhysics = function () {
        return _oPhysics;
    };

    this.setAngle = function (iAngle) {
        _oBall.rotation = iAngle;
    };

    this.getX = function () {
        return _oBall.x;
    };

    this.getY = function () {
        return _oBall.y;
    };

    this.getStartScale = function () {
        return _fScale;
    };

    this.scale = function (fValue) {
        _oBall.scaleX = fValue;
        _oBall.scaleY = fValue;
    };

    this.scaleShadow = function (fScale) {
        if (fScale > 0.08) {
            _oShadow.scaleX = fScale;
            _oShadow.scaleY = fScale;
        } else {
            _oShadow.scaleX = 0.08;
            _oShadow.scaleY = 0.08;
        }
    };

    this.setAlphaByHeight = function (fHeight) {
        _oShadow.alpha = fHeight;
    };

    this.getScale = function () {
        return _oBall.scaleX;
    };

    this.getObject = function () {
        return _oContainer;
    };

    this.getDepthPos = function () {
        return _oPhysics.position.y;
    };

    this.update = function () {

        if (Math.abs(_oPhysics.velocity.x) > MIN_VELOCITY_SPAWN_TRAJECTORY || Math.abs(_oPhysics.velocity.y) > MIN_VELOCITY_SPAWN_TRAJECTORY
                || Math.abs(_oPhysics.velocity.z) > MIN_VELOCITY_SPAWN_TRAJECTORY) {
            _oBallTrajectory.update(this.getPos());
        }
    };

    _oPhysics = oPhysics;
    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos, oSprite);

    return this;
}
