function CCharacter(iXPos, iYPos, iScaleMult, iStartAnim, aOffsetAnim, aSpriteAnimNames, aAnimation, aSubAnimation, oPhysics, iWho, oParentContainer) {
    var _oContainer;
    var _aAnimation;
    var _aStateAnim;
    var _oParentContainer;
    var _oPhysics = oPhysics;
    var _oActionFunc = null;
    var _iAnimType = iStartAnim;
    var _iWho = iWho;
    var _fSpeed = 0;
    var _fMaxSpeed;
    var _fAcceleration = 0;
    var _fScale = FOV * iScaleMult;
    var _bCastShadown = false;

    this._init = function (iXPos, iYPos, aOffsetAnim, aSpriteAnimNames, aAnimation, aSubAnimation, oParentContainer) {

        _oParentContainer = oParentContainer;

        _oContainer = new createjs.Container();
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;
        _oParentContainer.addChild(_oContainer);
        //   _oContainer.tickChildren = false;

        _aStateAnim = new Array();
        _aAnimation = new Array();

        for (var i = 0; i < aSpriteAnimNames.length; i++) {
            _aAnimation.push(this.loadAnim(aSpriteAnimNames[i], aSubAnimation[i], aAnimation[i], _oContainer));
            _aAnimation[i].x = aOffsetAnim[i].x;
            _aAnimation[i].y = aOffsetAnim[i].y;
            _aAnimation[i].visible = false;
            _oContainer.addChild(_aAnimation[i]);
            _aStateAnim[i] = false;
        }

        var oReverseRun = this.loadAnim(aSpriteAnimNames[RUN], aSubAnimation[RUN], aAnimation[RUN_REVERSE], _oContainer);
        _aAnimation.push(oReverseRun);
        oReverseRun.x = aOffsetAnim[RUN].x;
        oReverseRun.y = aOffsetAnim[RUN].y;
        oReverseRun.visible = false;
        _oContainer.addChild(oReverseRun);
        _aStateAnim.push(false);

        var oSprite = s_oSpriteLibrary.getSprite(aSpriteAnimNames[IDLE]);
        //_oContainer.regX = (oSprite.width * 0.5) / aSubAnimation[IDLE].w;
        _oContainer.regY = -(oSprite.height * 0.5) / aSubAnimation[IDLE].h;

        //    _oContainer.cache(0, 0, oSprite.width, oSprite.height);

        _aAnimation[_iAnimType].visible = true;
        _aStateAnim[_iAnimType] = true;
        
         _aAnimation[BACKHAND].visible = true;
        _aStateAnim[BACKHAND] = true;
    };

    this.getAnimType = function () {
        return _iAnimType;
    };

    this.getPos = function () {
        return {x: _oContainer.x, y: _oContainer.y};
    };

    this.loadAnim = function (szSprite, aSubAnimation, aAnimation, oContainer) {
        var oSprite = s_oSpriteLibrary.getSprite(szSprite);
        var oData = {
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: oSprite.width / aSubAnimation.w, height: oSprite.height / aSubAnimation.h, regX: (oSprite.width / 2) / aSubAnimation.w, regY: oSprite.height / aSubAnimation.h},
            animations: aAnimation
        };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        var oAnim = createSprite(oSpriteSheet, "start", (oSprite.width / 2) / aSubAnimation.w, oSprite.height / aSubAnimation.h, oSprite.width / aSubAnimation.w, oSprite.height / aSubAnimation.h);
        oAnim.stop();
        oContainer.addChild(oAnim);

        return oAnim;
    };

    this.pauseAnim = function (bVal) {
        if (bVal) {
            _aAnimation[_iAnimType].stop();
        } else {
            _aAnimation[_iAnimType].play();
        }
    };

    this.getX = function () {
        return _oContainer.x;
    };

    this.getY = function () {
        return _oContainer.y;
    };

    this.castShadown = function () {
        return _bCastShadown;
    };

    this.disableAllAnim = function () {
        for (var i = 0; i < _aAnimation.length; i++) {
            _aAnimation[i].visible = false;
            _aAnimation[i].stop();
        }
    };

    this.getPhysics = function () {
        return _oPhysics;
    };

    this.setAcceleration = function (fVal) {
        _fAcceleration = fVal;
    };

    this.getAcceleration = function () {
        return _fAcceleration;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;
    };

    this.setVisible = function (bVal) {
        _oContainer.visible = bVal;
    };

    this.whoIs = function () {
        return _iWho;
    };

    this.mirror = function () {
        _oContainer.scaleX *= -1;
    };

    this.setScale = function (fScale) {
        _fScale = _oContainer.scaleX = _oContainer.scaleY = fScale;
    };

    this.scale = function (fValue) {
        _oContainer.scaleX = -fValue;
        _oContainer.scaleY = fValue;
    };

    this.getStartScale = function () {
        return _fScale;
    };

    this.fadeAnimation = function (fVal) {
        createjs.Tween.get(_oContainer, {override: true}).to({alpha: fVal}, 500);
    };

    this.setAlpha = function (fVal) {
        _oContainer.alpha = fVal;
    };

    this.getObject = function () {
        return _oContainer;
    };

    this.getFrame = function () {
        return _aAnimation[_iAnimType].currentFrame;
    };

    this.getDepthPos = function () {
        return _oPhysics.position.y;
    };

    this.runAnimCharacter = function () {
        var iEndFrame = _aAnimation[_iAnimType].spriteSheet._data.end.frames[0];
        if (this.getFrame() >= iEndFrame) {
            return false;
        } else {
            return true;
        }
    };

    this.setMaxSpeed = function (fVal) {
        _fMaxSpeed = fVal;
    };

    this.getMaxSpeed = function () {
        return _fMaxSpeed;
    };

    this.setSpeed = function (fVal) {
        _fSpeed = fVal;
    };

    this.getSpeed = function () {
        return _fSpeed;
    };

    this.getStateAnim = function () {
        return _aStateAnim[_iAnimType];
    };

    this.startAnimation = function (iType, bVal) {
        _aAnimation[iType].visible = bVal;
        _aAnimation[iType].gotoAndPlay("start");
    };

    this.runAnim = function (iVal) {
        this.disableAllAnim();
        this.startAnimation(iVal, true);
        _aStateAnim[iVal] = true;
        _iAnimType = iVal;
    };

    this.setActionFunc = function (oFunc) {
        _oActionFunc = oFunc;
    };

    this.animWithEnd = function (iNextAnim, iActionFrame) {
        _aStateAnim[_iAnimType] = this.update();
        if (this.getFrame() === iActionFrame) {
            if (_oActionFunc !== null) {
                _oActionFunc();
                _oActionFunc = null;
            }
        }
        if (!_aStateAnim[_iAnimType]) {
            this.runAnim(iNextAnim);
        }
    };

    this.update = function () {
        return this.runAnimCharacter();
    };

    this._init(iXPos, iYPos, aOffsetAnim, aSpriteAnimNames, aAnimation, aSubAnimation, oParentContainer);

    return this;
}

