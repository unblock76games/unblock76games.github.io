function COpponent(iXPos, iYPos, oSprite, iSpeed, oPhysicsObject, oOpponentCollision, oParentContainer) {

    var _oOpponent;
    var _iOffsetWallRight;
    var _iOffsetWallLeft;
    var _iOffsetCharacterWidth;
    var _iOffsetCharacterHeight;
    var _iSpeed;
    var _iSpeedRate;
    var _iSpeedDown;
    var _iDir = 0;
    var _iDistProtect;
    var _szState;
    var _oLeg;
    var _oHead;
    var _oHeel;
    var _oPhysicsObjectInstance;
    var _oOpponentCollision;
    var _oParentContainer;
    var _bLegShoot = false;
    var _bHeadShoot = false;
    var _bHeelShoot = false;
    var _bProtectGoal = false;
    var _bSaveBallFromGoal = false;
    var _bGoToBall = false;
    var _bAggressive = false;
    var _fTimeRandomHeel;
    var _fTimeReaction;
    var _fTimeProtectLong;
    var _fTimeIntervalShoot;
    var _fTimeRefreshAI;
    var _fTimeTry;

    this._init = function (iXPos, iYPos, oSprite, iSpeed, oPhysicsObject, oOpponentCollision, oParentContainer) {

        _oParentContainer = oParentContainer;

        var oData = {
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: oSprite.width / 8, height: oSprite.height / 7, regX: (oSprite.width / 2) / 8, regY: (oSprite.height / 2) / 7},
            animations: {
                idle: [0, 11, "idle", 0.5],
                run: [12, 22],
                shot: [23, 28],
                head_shot_run: [29, 37],
                head_shot_idle: [38, 48],
                heel_shot: [49, 55],
                reverse: {
                    frames: [22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12]
                }
            }
        };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oOpponent = createSprite(oSpriteSheet, "idle", (oSprite.width / 2) / 8, (oSprite.height / 2) / 7, oSprite.width / 8, oSprite.height / 7);

        _oOpponent.x = iXPos;
        _oOpponent.y = iYPos;

        _oOpponent.scaleX = -1;

        _iOffsetCharacterHeight = oSprite.height / 7;
        _iOffsetCharacterWidth = oSprite.width / 8;

        _iSpeedDown = 0;
        _fTimeProtectLong = 0;
        _fTimeIntervalShoot = 0;
        _fTimeReaction = 0;
        _fTimeRefreshAI = 0;
        _fTimeTry = TIME_TRY_TO_SHOT_BALL_OPPONENT;

        _oOpponentCollision = oOpponentCollision;

        var iEdgeRightWidth = -(_iOffsetCharacterWidth);
        var iEdgeLeftWidth = _iOffsetCharacterWidth;
        _iOffsetWallRight = CANVAS_WIDTH + iEdgeRightWidth;
        _iOffsetWallLeft = iEdgeLeftWidth;

        _iSpeedRate = iSpeed;

        _iSpeed = CHARACTER_SPEED * _iSpeedRate;

        _iDistProtect = OPPONENT_DISTANCE_PROTECTION;

        _oPhysicsObjectInstance = oPhysicsObject;

        _oParentContainer.addChild(_oOpponent);

    };

    this.setChildIndex = function (iVal) {
        _oParentContainer.setChildIndex(_oOpponent, iVal);
    };

    this.getChildIndex = function () {
        return _oParentContainer.getChildIndex(_oOpponent);
    };

    this.getX = function () {
        return _oOpponent.x;
    };

    this.getY = function () {
        return _oOpponent.y;
    };

    this.removeAllComponent = function () {
        if (_bLegShoot === true) {
            s_oGame.removeLeg(_oLeg);
            _bLegShoot = false;
        } else if (_bHeadShoot === true) {
            s_oGame.removeHead(_oHead);
            _bHeadShoot = false;
        } else if (_bHeelShoot === true) {
            s_oGame.removeLeg(_oHeel);
            _bHeelShoot = false;
        }
    };

    this.setPosition = function (iXPos, iYPos) {
        if (iXPos === null) {

        } else {
            _oOpponent.x = iXPos;
        }
        if (iYPos === null) {

        } else {
            _oOpponent.y = iYPos;
        }
    };

    this.rotate = function (iValue) {
        _oOpponent.scaleX = iValue;
    };

    this.changeState = function (szState) {

        _oOpponent.gotoAndPlay(szState);

        if (szState === "shot" || szState === "head_shot_run" || szState === "head_shot_idle" || szState === "heel_shot") {
            this._onFinishAnimation();
        }
    };

    this.stopAnimation = function () {
        _oOpponent.stop();
    };

    this.playAnimation = function () {
        _oOpponent.play();
    };

    this._onFinishAnimation = function () {
        _oOpponent.on("animationend", function () {
            if (_iDir === 0) {
                _oOpponent.gotoAndPlay("idle");
                _szState = "idle";
            } else if (_iDir === -1) {
                _oOpponent.gotoAndPlay("reverse");
                _szState = "reverse";
            } else {
                _oOpponent.gotoAndPlay("run");
                _szState = "run";
            }
            _oOpponent.removeAllEventListeners();
        });
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oOpponent);
    };

    this.createHead = function () {
        var oPlayerPos;

        oPlayerPos = {x: _oOpponent.x + OFFSET_HEAD_POS_OPPONENT.x, y: _oOpponent.y + OFFSET_HEAD_POS_OPPONENT.y};

        _oHead = _oPhysicsObjectInstance.addHead(oPlayerPos, OPPONENT_HEAD);

        _bHeadShoot = true;
    };

    this.createHeel = function () {
        var oPlayerPos;

        oPlayerPos = {x: _oOpponent.x + OFFSET_HEEL_POS_OPPONENT.x, y: _oOpponent.y + OFFSET_HEEL_POS_OPPONENT.y};

        _oHeel = _oPhysicsObjectInstance.addLeg(oPlayerPos, OPPONENT_HEEL);

        _bHeelShoot = true;
    };

    this.createLeg = function () {

        var oPlayerPos;

        oPlayerPos = {x: _oOpponent.x + OFFSET_LEG_POS_OPPONENT.x, y: _oOpponent.y + OFFSET_LEG_POS_OPPONENT.y};

        _oLeg = _oPhysicsObjectInstance.addLeg(oPlayerPos, OPPONENT_LEG);

        _bLegShoot = true;
    };

    this.getLegShoot = function () {
        return _bLegShoot;
    };

    this.getHeadShoot = function () {
        return _bHeadShoot;
    };

    this.getHeelShoot = function () {
        return _bHeelShoot;
    };

    this.protectTheGoal = function (fDistanceX, oGoalOpponentX, fDistanceBall, oBallPos, fSecond) {
        if (fDistanceX > 10 || fDistanceX < -10) {
            if (_oOpponent.x < oGoalOpponentX) {
                this.move(1, _oOpponentCollision);
            } else if (_oOpponent.x > oGoalOpponentX) {
                this.move(-1, _oOpponentCollision);
            }
        } else {
            this.move(0, _oOpponentCollision);
        }

        this.shot(fDistanceBall, oBallPos, fSecond);
    };

    this.saveTheBallFromGoal = function (fDistance, fDistGoalOpponentX) {
        _bSaveBallFromGoal = true;
        if (fDistGoalOpponentX > 10 || fDistGoalOpponentX < -10) {
            this.move(1, _oOpponentCollision);
        } else {
            this.move(0, _oOpponentCollision);
        }
        if (fDistance < HEEL_SHOOT_DISTANCE_OPPONENT) {
            if (_fTimeRandomHeel <= 0) {
                if (_bHeelShoot === false) {
                    this.createHeel();
                    this.changeState("heel_shot");
                    _fTimeRandomHeel = randomRange(REACT_OPP_FOR_HEEL_SHOOT.min, REACT_OPP_FOR_HEEL_SHOOT.max);
                }
            } else {
                _fTimeRandomHeel -= 1 / createjs.Ticker.framerate;
            }
        }
    };

    this.move = function (iDir) {
        if (iDir === 1) {
            if (_szState !== "reverse") {
                this.changeState("reverse");
            }
            _szState = "reverse";
        } else if (iDir === -1) {
            if (_szState !== "run")
                this.changeState("run");
            _szState = "run";
        } else if (iDir === 0) {
            if (_szState !== "idle")
                this.changeState("idle");
            _szState = "idle";
        }

        _iDir = iDir;

        var oPosFx1 = s_oPhysicsController.getElementPosition(_oOpponentCollision.fixture1);
        var oPosFx2 = s_oPhysicsController.getElementPosition(_oOpponentCollision.fixture2);
        var oPosFx3 = s_oPhysicsController.getElementPosition(_oOpponentCollision.fixture3);

        oPosFx1.x += (_iSpeed * iDir);

        if (oPosFx1.x >= _iOffsetWallRight) {
            oPosFx1.x = _iOffsetWallRight;
        } else if (oPosFx1.x <= _iOffsetWallLeft) {
            oPosFx1.x = _iOffsetWallLeft;
        }

        oPosFx2.x = oPosFx1.x + OPPONENT_COLLISION.sph_offset.x - OPPONENT_COLLISION.rec_offset.x;
        oPosFx3.x = oPosFx1.x + OPPONENT_COLLISION.rec_neck.x - OPPONENT_COLLISION.rec_offset.x;

        s_oPhysicsController.setElementPosition(_oOpponentCollision.fixture1, oPosFx1);
        s_oPhysicsController.setElementPosition(_oOpponentCollision.fixture2, oPosFx2);
        s_oPhysicsController.setElementPosition(_oOpponentCollision.fixture3, oPosFx3);

        _oOpponent.x = oPosFx1.x + OPPONENT_COLLISION.rec_center_width;
        _oOpponent.y = oPosFx1.y - OPPONENT_COLLISION.rec_offset.y;
    };

    this.goToBall = function (fDistance, oBallPos, fDistanceChar, fSecond, oCharPos, fTotVel) {

        if (fDistanceChar > MIN_DISTANCE_BETWEEN_PLAYER && _fTimeTry > 0 || oBallPos.x < oCharPos.x || fTotVel < 1) {
            this.move(-1, _oOpponentCollision);
        } else {
            if (_fTimeTry > 0 || _oOpponent.x > STOP_BACK_WALK_POSITION) {
                this.move(0, _oOpponentCollision);
                if (_fTimeTry <= 0) {
                    _fTimeTry = TIME_TRY_TO_SHOT_BALL_OPPONENT;
                } else {
                    _fTimeTry -= fSecond;
                }
            } else if (fDistanceChar < GO_TO_DISTANCE && oCharPos.x < oBallPos.x) {
                this.move(1, _oOpponentCollision);
            } else {
                _fTimeTry = TIME_TRY_TO_SHOT_BALL_OPPONENT;
            }
        }

        this.shot(fDistance, oBallPos, fSecond);
    };

    this.shot = function (fDistance, oBallPos, fSecond) {
        if (fDistance < DISTANCE_START_SHOOT_OPPONENT) {
            if (_fTimeIntervalShoot <= 0) {
                if (oBallPos.y < _oOpponent.y) {
                    if (_bHeadShoot === false) {
                        this.createHead();
                        if (_iDir === 1 || _iDir === -1) {
                            this.changeState("head_shot_run");
                        } else {
                            this.changeState("head_shot_idle");
                        }
                    }
                } else {
                    if (_bLegShoot === false) {
                        this.createLeg();
                        this.changeState("shot");
                    }
                }
                _fTimeIntervalShoot = randomRange(TIME_INTERVAL_SHOOT.min, TIME_INTERVAL_SHOOT.max);
            } else {
                _fTimeIntervalShoot -= fSecond;
            }
        }
    };

    this.checkAFinishedShoot = function () {
        if (_bLegShoot === true) {
            var fAngleLeg = s_oPhysicsController.getJointAngle(_oLeg.jointLeg);
            var oPos = {x: _oOpponent.x + OFFSET_LEG_POS_OPPONENT.x, y: _oOpponent.y + OFFSET_LEG_POS_OPPONENT.y};
            s_oPhysicsController.setElementPosition(_oLeg.fixture2, oPos);
            if (fAngleLeg <= DELETE_LEG_ANGLE_OPPONENT) {
                s_oGame.removeLeg(_oLeg);
                _bLegShoot = false;
            }
        } else if (_bHeadShoot === true) {
            var fTranslationHead = s_oPhysicsController.getJointTranslation(_oHead.joint);
            var oPos = {x: _oOpponent.x + OFFSET_HEAD_POS_OPPONENT.x, y: _oOpponent.y + OFFSET_HEAD_POS_OPPONENT.y};
            s_oPhysicsController.setElementPosition(_oHead.fixture2, oPos);
            if (fTranslationHead >= PLAYER_HEAD.distance - 0.1) {
                s_oGame.removeHead(_oHead);
                _bHeadShoot = false;
            }
        } else if (_bHeelShoot === true) {
            var fAngleHeel = s_oPhysicsController.getJointAngle(_oHeel.jointLeg);
            var oPos = {x: _oOpponent.x + OFFSET_HEEL_POS_OPPONENT.x, y: _oOpponent.y + OFFSET_HEEL_POS_OPPONENT.y};
            s_oPhysicsController.setElementPosition(_oHeel.fixture2, oPos);
            if (fAngleHeel >= DELETE_HEEL_ANGLE_OPPONENT) {
                s_oGame.removeLeg(_oHeel);
                _bHeelShoot = false;
            }
        }
    };

    this.getAggressive = function () {
        return _bAggressive;
    };

    this.setAggressive = function (bVal, iLv) {
        _bAggressive = bVal;
        if (_bAggressive) {
            _iDistProtect = OPPONENT_DISTANCE_PROTECTION_AGG;
        } else {
            _iDistProtect = OPPONENT_DISTANCE_PROTECTION[iLv];
        }
    };

    this.setDistanceProtection = function (iVal) {
        _iDistProtect = iVal;
    };

    this.restart = function () {
        _bProtectGoal = false;
        _bSaveBallFromGoal = false;
        _bGoToBall = false;

        _fTimeProtectLong = 0;
        _fTimeIntervalShoot = 0;
        _fTimeReaction = 0;
        _fTimeRefreshAI = 0;

        this.move(0, _oOpponentCollision);
    };

    this.activeProtectGoal = function () {
        if (_bProtectGoal === false) {
            _bProtectGoal = true;
            _bGoToBall = false;
            _fTimeReaction = randomRange(TIME_REACTION_FROM_SAVE_TO_GO.min, TIME_REACTION_FROM_SAVE_TO_GO.max);
            _fTimeIntervalShoot = randomRange(TIME_INTERVAL_SHOOT.min * 0.5, TIME_INTERVAL_SHOOT.max * 0.5);
            _fTimeProtectLong = randomRange(TIME_IN_PROTECT_STATE.min, TIME_IN_PROTECT_STATE.max);
            _fTimeTry = TIME_TRY_TO_SHOT_BALL_OPPONENT;
        }
    };

    this.activeGoToBall = function () {
        if (_bGoToBall === false) {
            _fTimeIntervalShoot = randomRange(TIME_INTERVAL_SHOOT.min * 0.5, TIME_INTERVAL_SHOOT.max * 0.5);
            _fTimeTry = TIME_TRY_TO_SHOT_BALL_OPPONENT;
            _bProtectGoal = false;
            _bGoToBall = true;
        }
    };

    this.chooseAction = function (fDistanceBall, oBallVelocity, fSecond) {
        _bSaveBallFromGoal = false;
        if (_fTimeReaction <= 0) {
            if (fDistanceBall > _iDistProtect && oBallVelocity.x < BALL_VELOCITY_X_REACTION) {
                this.activeProtectGoal();
            } else if (fDistanceBall < _iDistProtect || oBallVelocity.x > BALL_VELOCITY_X_REACTION_ATTACK) {
                this.activeGoToBall();
            } else {
                if (oBallVelocity.x < BALL_VELOCITY_X_REACTION_ATTACK) {
                    this.activeProtectGoal();
                } else {
                    this.activeGoToBall();
                }
            }
        } else {
            _fTimeReaction -= fSecond;
        }
    };

    this.decision = function (oBallPos, fDistOppForTakeBall, fDistanceBall, oBallVelocity, fSecond) {
        if (_oOpponent.x < oBallPos.x + fDistOppForTakeBall) {
            if (_bSaveBallFromGoal === false) {
                _fTimeRandomHeel = randomRange(REACT_OPP_FOR_HEEL_SHOOT.min, REACT_OPP_FOR_HEEL_SHOOT.max);
            }
            _bSaveBallFromGoal = true;
            _bProtectGoal = false;
            _bGoToBall = false;
        } else {
            this.chooseAction(fDistanceBall, oBallVelocity, fSecond);
        }
    };

    this.update = function (_oOpponentCollision, oBallVelocity, oCharPos, iLv) {
        var fSecond = 1 / createjs.Ticker.framerate;

        this.checkAFinishedShoot();

        var oBallPos = s_oGame.getBallSpritePos();

        var oGoalOpponentX = OBJECT[1][0].x;
        var fDistGoalOpponentX = oGoalOpponentX - _oOpponent.x;

        var fDistanceBall = distanceV2({x: _oOpponent.x, y: _oOpponent.y}, oBallPos);
        var fDistanceChar = distanceV2({x: _oOpponent.x, y: _oOpponent.y}, oCharPos);

        var fDistanceBallY = (_oOpponent.y - OPPONENT_COLLISION.recHeight) - oBallPos.y;

        var fDistOppForTakeBall = OFFSET_OPPONENT_FORWOARD_BALL + fDistanceBallY * 0.2;

        if (_fTimeRefreshAI <= 0) {
            this.decision(oBallPos, fDistOppForTakeBall, fDistanceBall, oBallVelocity, fSecond);
            _fTimeRefreshAI = TIME_REFRESH_AI[iLv];
        } else {
            _fTimeRefreshAI -= fSecond;
        }

        if (_bProtectGoal) {
            if (_fTimeProtectLong > 0) {
                this.protectTheGoal(fDistGoalOpponentX, oGoalOpponentX, fDistanceBall, oBallPos, fSecond);
                _fTimeProtectLong -= fSecond;
            } else {
                _bProtectGoal = false;
                _bGoToBall = true;
                _fTimeReaction = randomRange(TIME_AFTER_REACTION.min, TIME_AFTER_REACTION.max);
            }
        } else if (_bGoToBall) {
            var fBallVel = oBallVelocity.x * oBallVelocity.x + oBallVelocity.y * oBallVelocity.y;
            this.goToBall(fDistanceBall, oBallPos, fDistanceChar, fSecond, oCharPos, fBallVel);
        } else if (_bSaveBallFromGoal) {
            this.saveTheBallFromGoal(fDistanceBall, fDistGoalOpponentX);
        } else {
            this.move(0);
        }

        s_oPhysicsController.setElementAngle(_oOpponentCollision.fixture1, 0);


    };

    this._init(iXPos, iYPos, oSprite, iSpeed, oPhysicsObject, oOpponentCollision, oParentContainer);
}

