function CPlayer(iXPos, iYPos, oSprite, iID, bUserPlayer, bGoalKeeper, iType, oParentContainer) {

    var _oPlayer;
    var _oShadow;
    var _oContainer;
    var _oStartPos;
    var _oParentContainer;
    var _iID;
    var _iRadius;
    var _iRadiusQuadro;
    var _iType;
    var _iTeam;
    var _vPos;
    var _vPrevPos;
    var _vTmpForce;
    var _vCurForce;
    var _bGoalKeeper;
    var _bAnimate = false;
    var _bUserPlayer;

    this._init = function (iXPos, iYPos, iID, bUserPlayer, bGoalKeeper, iType, oSprite) {
        _iID = iID;

        _oContainer = new createjs.Container();
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;

        this.createShadow();

        var oData = {
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: oSprite.width / 12, height: oSprite.height / 3, regX: (oSprite.width / 2) / 12, regY: oSprite.height / 3 + PLAYER_REGY_OFFSET}
        };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oPlayer = createSprite(oSpriteSheet, 0, (oSprite.width / 2) / 12, oSprite.height / 3 + PLAYER_REGY_OFFSET, oSprite.width / 12, oSprite.height / 3);
        _oPlayer.stop();

        _oContainer.addChild(_oPlayer);

        _vPos = new CVector2();
        _vPos.set(_oContainer.x, _oContainer.y);
        _vPrevPos = new CVector2();
        _vPrevPos.set(0, 0);
        _vTmpForce = new CVector2();
        _vTmpForce.set(0, 0);

        _vCurForce = new CVector2();
        _vCurForce.set(0, 0);

        _bGoalKeeper = bGoalKeeper;

        if (_bGoalKeeper) {
            _iRadius = PLAYERS_KEEPER_RADIUS;
            _iRadiusQuadro = PLAYERS_KEEPER_RADIUS * PLAYERS_KEEPER_RADIUS;
        } else {
            _iRadius = PLAYERS_RADIUS;
            _iRadiusQuadro = PLAYERS_RADIUS * PLAYERS_RADIUS;
        }

        _iType = iType;

        _oStartPos = {x: iXPos, y: iYPos};

        _bUserPlayer = bUserPlayer;
        if (_bUserPlayer) {
            this._initListner();
            _oPlayer.cursor = "pointer";
        }
        _oShadow.x = _oPlayer.x;
        _oShadow.y = _oPlayer.y;

        _oParentContainer.addChild(_oContainer);

    };

    this._initListner = function () {
        _oPlayer.on("mousedown", this.onSelect);
        _oPlayer.on("pressmove", this.onPressMove);
        _oPlayer.on("pressup", this.onPressUp);
    };

    this.getX = function () {
        return _oContainer.x;
    };

    this.getY = function () {
        return _oContainer.y;
    };

    this.resetPos = function () {
        _oContainer.x = _oStartPos.x;
        _oContainer.y = _oStartPos.y;
        _vPos.set(_oContainer.x, _oContainer.y);
        _vTmpForce.set(0, 0);
        _vCurForce.set(0, 0);
    };

    this.createShadow = function () {
        var oSpriteShadow = s_oSpriteLibrary.getSprite("player_shadow");
        _oShadow = createBitmap(oSpriteShadow);
        _oShadow.regX = oSpriteShadow.width * 0.5;

        _oContainer.addChild(_oShadow);
    };

    this.onSelect = function () {
        var oInfo = {pos: {x: _oContainer.x, y: _oContainer.y}, id: _iID};
        s_oGame.onPlayerSelect(oInfo);
    };

    this.onPressMove = function () {
        s_oGame.onPressMove();
    };

    this.onPressUp = function () {
        s_oGame.onPressUp({x: _oContainer.x, y: _oContainer.y});
    };

    this.isGoalKeeper = function () {
        return _bGoalKeeper;
    };

    this.setPosition = function (iXPos, iYPos) {
        if (iXPos === null) {

        } else {
            _oContainer.x = iXPos;
        }
        if (iYPos === null) {

        } else {
            _oContainer.y = iYPos;
        }
    };

    this.rotate = function (iValue) {
        _oContainer.scaleX = iValue;
    };

    this.setVisible = function (bVal) {
        _oContainer.visible = bVal;
    };

    this.changeTeam = function (iVal) {
        _oPlayer.gotoAndStop(iVal);
        _iTeam = iVal;
    };

    this.getTeam = function () {
        return _iTeam;
    };

    this.vTmpForce = function () {
        return _vTmpForce;
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

    this.animDangle = function () {
        if (_bAnimate) {
            return;
        }
        _bAnimate = true;
        createjs.Tween.get(_oPlayer).to({rotation: DANGLE_DEGREE}, 250, createjs.Ease.cubicOut).call(function () {
            createjs.Tween.get(_oPlayer).to({rotation: -DANGLE_DEGREE}, 250, createjs.Ease.cubicOut).call(function () {
                createjs.Tween.get(_oPlayer).to({rotation: DANGLE_DEGREE * 0.5}, 300, createjs.Ease.cubicOut).call(function () {
                    createjs.Tween.get(_oPlayer).to({rotation: -DANGLE_DEGREE * 0.5}, 300, createjs.Ease.cubicOut).call(function () {
                        createjs.Tween.get(_oPlayer).to({rotation: DANGLE_DEGREE * 0.1}, 300, createjs.Ease.cubicOut).call(function () {
                            createjs.Tween.get(_oPlayer).to({rotation: -DANGLE_DEGREE * 0.1}, 300, createjs.Ease.cubicOut).call(function () {
                                createjs.Tween.get(_oPlayer).to({rotation: 0}, 300, createjs.Ease.cubicOut).call(function () {
                                    _bAnimate = false;
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    this.setPosVector = function () {
        _oContainer.x = _vPos.getX();
        _oContainer.y = _vPos.getY();
    };

    this.getRadius = function () {
        return _iRadius;
    };

    this.getID = function () {
        return _iID;
    };

    this.type = function () {
        return _iType;
    };

    this.getRadiusQuadro = function () {
        return _iRadiusQuadro;
    };

    this.addForce = function (vForce) {
        _vTmpForce.addV(vForce);
    };

    this.getChildIndex = function () {
        return _oParentContainer.getChildIndex(_oContainer);
    };

    this.setChildIndex = function (iValue) {
        _oParentContainer.setChildIndex(_oContainer, iValue);
    };

    this.getObject = function () {
        return _oContainer;
    };

    this.unload = function () {
        if (_bUserPlayer) {
            _oPlayer.off("mousedown", this.onSelect);
            _oPlayer.off("pressmove", this.onPressMove);
            _oPlayer.off("pressup", this.onPressUp);
        }
        _oParentContainer.removeChild(_oPlayer);
        _oPlayer = null;
    };

    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos, iID, bUserPlayer, bGoalKeeper, iType, oSprite);
}


