var CHARACTERS;
var BALL;
var SERVICE_BY = PLAYER_SIDE;
function CGame(oData, iLevel) {
    var _bTouchActive;
    var _bInitGame;
    var _bService = false;
    var _bBallLaunched = false;
    var _bBallFieldTouch = false;
    var _bMouseDown = false;
    var _bOut = false;
    var _bShowHelpText = true;

    var _iScore;
    var _iScoreMatch;
    var _iGameState = -1;
    var _iTimePressDown = 0;
    var _iBallSide;
    var _iBallShot;
    var _iPlayerPoint = 0;
    var _iOpponentPoint = 0;
    var _iPlayerSet = 0;
    var _iOpponentSet = 0;
    var _iServiceAttempt = 0;

    var _oInterface;
    var _oEndPanel = null;
    var _oParent;
    var _oScene;
    var _oCamera;
    var _oBall;
    var _oContainerGame;
    var _oClickPoint;
    var _oReleasePoint;
    var _oHitArea = null;
    var _oPlayer;
    var _oOpponent;
    var _oPowerBar;
    var _oControllerMovement;
    var _oNet;
    var _oAI;
    var _oFade;
    var _szAudioMatch = null;

    var _aObjects;

    var _vHitDir;
    
    var _bPokiStart;

    this._init = function () {
        _bPokiStart = false;;
        
        $(s_oMain).trigger("start_session");

        _aObjects = new Array();
        CHARACTERS = new Array();

        _bTouchActive = false;
        _bInitGame = true;

        _iScore = 0;
        _iScoreMatch = 0;

        _iScore = 0;
        for (var i = 0; i < s_iLevel; i++) {
            _iScore += s_aScores[i];
        }

        _oContainerGame = new createjs.Container();
        s_oStage.addChild(_oContainerGame);

        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        oBg.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oContainerGame.addChild(oBg); //Draws on canvas

        _oScene = new CScenario();

        if (!CAMERA_TEST) {
            camera = createCamera();
        }
        _oCamera = camera;

        this.createBall();
        _oBall.getPhysics().mass = 0;
        _aObjects.push(_oBall);

        resizeCanvas3D();

        _oClickPoint = {x: 0, y: 0};
        _oReleasePoint = {x: 0, y: 0};

        _oOpponent = new CCharacter(0, 0, OPPONENT_SCALE_MULTIPLIER,
                IDLE, OFFSET_CONTAINER_OPPONENT, SPRITE_NAME_OPPONENT, CHARACTERS_ANIMATIONS, ANIMATION_SPRITE_SHEET_SECTION,
                _oScene.opponentBody(), OPPONENT_SIDE, _oContainerGame);
        _oOpponent.runAnim(IDLE);
        _oOpponent.setMaxSpeed(OPPONENT_SPEED[s_iLevel]);
        _oOpponent.setAcceleration(OPPONENT_ACCELERATION[s_iLevel]);

        _aObjects.push(_oOpponent);

        CHARACTERS.push(_oOpponent);

        _oPlayer = new CCharacter(0, 0, PLAYER_SCALE_MULTIPLIER,
                IDLE, OFFSET_CONTAINER_PLAYER, SPRITE_NAME_PLAYER, CHARACTERS_ANIMATIONS, ANIMATION_SPRITE_SHEET_SECTION,
                _oScene.playerBody(), PLAYER_SIDE, _oContainerGame);

        _oPlayer.runAnim(IDLE);
        _oPlayer.setMaxSpeed(PLAYER_SPEED);
        _oPlayer.setAcceleration(PLAYER_ACCELERATION);

        CHARACTERS.push(_oPlayer);

        _aObjects.push(_oPlayer);

        _oNet = new CNet(315, 255, s_oSpriteLibrary.getSprite("net"), _oContainerGame);
        _aObjects.push(_oNet);

        _oPowerBar = new CPowerBar(CANVAS_WIDTH_HALF - 550, CANVAS_HEIGHT_HALF - 100, s_oStage, true);
        _oPowerBar.setVisible(false);
        _oPowerBar.setAlpha(0);

        _oControllerMovement = new CControllerMovement();
        _oAI = new CAI(_oOpponent);

        _oInterface = new CInterface();
        _oInterface.refreshMatchBoard(s_iLevel + 1);
        _oInterface.refreshVelocityScreen(0);
        this.refreshScoreBoard();

        tweenVolume("soundtrack", 0.3, MS_TIME_FADE_VOL);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, MS_FADE_ANIM, createjs.Ease.cubicOut).call(function () {
            _oFade.visible = false;
        });

        _vHitDir = new CANNON.Vec3(0, 0, 0);

        if (SET_FOR_WIN === 1 || SET_FOR_WIN === 3 || SET_FOR_WIN === 5) {
            if (s_iLevel === 0 && !SHOW_3D_RENDER) {
                _oInterface.createHelpPanel();
            } else {
                _bShowHelpText = false;
                this._onExitHelp();
            }
        } else {
            new CSetAllowed(s_oStage);
        }
    };

    this.scenarioLoaded = function () {
        _iGameState = STATE_INIT;
    };

    this.changeState = function (iVal) {
        _iGameState = iVal;
    };

    this.serviceBy = function () {
        _oPowerBar.mask(0);
        if (SERVICE_BY === PLAYER_SIDE) {
            this.activeStateLaunchPower();
            _oOpponent.runAnim(STANCE);
            _oPlayer.runAnim(SERVICE);
            _oPlayer.pauseAnim(true);
        } else {
            createjs.Tween.get(this).wait(500).call(function () {
                this.startAnimPlayerService(_oOpponent, _oAI.serve);
            });
            _oPlayer.runAnim(STANCE);
            _oOpponent.runAnim(SERVICE);
            _oOpponent.pauseAnim(true);
            _oPowerBar.setVisible(false);
        }
    };

    this.activeStateLaunchPower = function () {
        if (_bShowHelpText) {
            _oInterface.createHelpText();
        }
        _oPowerBar.setVisible(true);
        _oPowerBar.animFade(1, null);
        _oPowerBar.animateMask(TIME_POWER_BAR);
    };

    this.startAnimPlayerService = function (oCharacter, oFunc) {
        oCharacter.runAnim(SERVICE);
        oCharacter.setActionFunc(oFunc);
        s_oGame.playerService();
    };

    this.playerService = function () {

        _oInterface.unloadHelpText();
        _bShowHelpText = false;

        _oBall.getPhysics().mass = BALL_MASS;

        if (_iBallSide === OPPONENT_SIDE) {
            this.addImpulseToBall(START_LAUNCH_IMPULSE_BALL_OPPONENT);
        } else {
            this.addImpulseToBall(START_LAUNCH_IMPULSE_BALL_PLAYER);
        }

        _bService = true;
    };

    this.playerServeBall = function () {
        var fForce = ((_oPowerBar.getMaskValue() / _oPowerBar.getMaskHeight()) * SERVICE_POWER_RATE) + OFFSET_FORCE_Y_PLAYER;
        if (fForce < SERVICE_POWER_MIN) {
            fForce = SERVICE_POWER_MIN;
        }

        var fForceTot = fForce * BALL_DENSITY;

        var oDir = {x: SERVICE_IMPULSE_PLAYER_SIDE[s_iServiceSide].x * (fForceTot * 0.1), y: fForceTot,
            z: SERVICE_IMPULSE_PLAYER_SIDE[s_iServiceSide].z * (fForceTot * 0.1)};

        s_oGame.addImpulseToBall(oDir);

        _oPowerBar.mask(0);
        _oPowerBar.animFade(0, _oPowerBar.setVisible, false);

        s_oGame.calculateVelocityService(oDir);

        playSound("hit_ball", 1, false);
    };

    this.calculateVelocityService = function (oImpulse) {
        var fMagnitude = Math.sqrt((oImpulse.x * oImpulse.x) + (oImpulse.y * oImpulse.y) + (oImpulse.z * oImpulse.z)) / BALL_DENSITY;

        _oInterface.refreshVelocityScreen(Math.floor(fMagnitude * KMH));
    };

    this.refreshPos = function (iXPos, iYPos) {
        _oPowerBar.setPosition(_oPowerBar.getStartPos().x + iXPos, _oPowerBar.getStartPos().y - iYPos);
    };

    this.createControl = function () {
        if (!SHOW_3D_RENDER) {
            _oHitArea = new createjs.Shape();
            _oHitArea.graphics.beginFill("rgba(255,0,0,0.01)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            _oContainerGame.addChild(_oHitArea);

            _oHitArea.on('mousedown', this.onMouseDown);
            _oHitArea.on('pressmove', this.onPressMove);
            _oHitArea.on('pressup', this.onPressUp);
        } else {
            window.addEventListener('mousedown', this.onMouseDown);
            window.addEventListener('mousemove', this.onPressMove);
            window.addEventListener('mouseup', this.onPressUp);
        }
    };

    this.createBall = function () {
        var oSpriteBall = s_oSpriteLibrary.getSprite("ball");
        _oBall = new CBall(0, 0, oSpriteBall, _oScene.ballBody(), _oContainerGame);
        BALL = _oBall;
        _aObjects.push(_oBall);
    };

    this.onMouseDown = function () {
        _oClickPoint = {x: s_oStage.mouseX, y: s_oStage.mouseY};
        if (!_bService && SERVICE_BY === PLAYER_SIDE) {
            _oPowerBar.removeTweensMask();
            s_oGame.ballShotBy(PLAYER_SIDE);
            s_oGame.startAnimPlayerService(_oPlayer, s_oGame.playerServeBall);
            return;
        } else if (_iBallShot === PLAYER_SIDE || !_bService) {
            _oPowerBar.mask(0);
            _oPowerBar.animFade(0, _oPowerBar.setVisible, false);
            return;
        }

        _oPowerBar.mask(0);
        _oPowerBar.setVisible(true);
        _oPowerBar.animFade(1, null);
        _bMouseDown = true;
    };

    this.pause = function (bVal) {
        if (bVal === true) {
            createjs.Ticker.paused = true;
            _iGameState = STATE_PAUSE;
        } else {
            createjs.Ticker.paused = false;
            _iGameState = STATE_PLAY;
        }
        for (var i = 0; i < CHARACTERS.length; i++) {
            if (CHARACTERS[i].getAnimType() !== SERVICE || _bService) {
                CHARACTERS[i].pauseAnim(bVal);
            }
        }
        
        s_oGame.setPokiStart(!bVal);
    };

    this.onPressMove = function () {
        if (!_bService || !_bMouseDown || _iBallShot === PLAYER_SIDE) {
            return;
        }
        _oReleasePoint = {x: s_oStage.mouseX, y: s_oStage.mouseY};
    };

    this.onPressUp = function () {
        if (!_bService || !_bMouseDown || _iBallShot === PLAYER_SIDE) {
            return;
        }
        if (_oReleasePoint.x === 0 && _oReleasePoint.y === 0) {
            _oClickPoint.x = 0;
            _oClickPoint.y = 0;
        }

        var fDistance = Math.ceil(distanceV2(_oClickPoint, _oReleasePoint)) * FORCE_RATE;

        var fDefaultZ = 0;

        if (fDistance > FORCE_MAX) {
            fDistance = FORCE_MAX;
        } else if (fDistance < DETECT_FORCE_DIRECTION) {
            _oReleasePoint.x = _oClickPoint.x;
            fDefaultZ = DEFAULT_Z_FORCE;
        }

        var vHitDir2D = new CVector2(_oClickPoint.x - _oReleasePoint.x,
                _oClickPoint.y - _oReleasePoint.y);

        vHitDir2D.scalarProduct(fDistance);

        var fForceLength = vHitDir2D.length();


        if (fForceLength > HIT_BALL_MAX_FORCE) {
            vHitDir2D.normalize();
            vHitDir2D.scalarProduct(HIT_BALL_MAX_FORCE);
        }

        var fForceY = _iTimePressDown;

        if (fForceY > MAX_FORCE_Y) {
            fForceY = MAX_FORCE_Y;
        } else if (fForceY < MIN_FORCE_Y) {
            fForceY = MIN_FORCE_Y;
        }

        _vHitDir.set(-vHitDir2D.getX() * FORCE_MULTIPLIER_AXIS_PLAYER.x, fForceY * FORCE_MULTIPLIER_AXIS_PLAYER.y,
                fDefaultZ + vHitDir2D.getY() * FORCE_MULTIPLIER_AXIS_PLAYER.z);

        _oReleasePoint.x = 0;
        _oReleasePoint.y = 0;

        _bMouseDown = false;

        _iTimePressDown = 0;
    };

    this.onContinue = function () {
        s_iLevel++;
        _oOpponent.setSpeed(0);
        _oOpponent.setAcceleration(OPPONENT_ACCELERATION[s_iLevel]);
        _oOpponent.setMaxSpeed(OPPONENT_SPEED[s_iLevel]);
        _oInterface.refreshMatchBoard(s_iLevel + 1);

        this.restartGame();
    };

    this.launchBall = function () {
        if (!_bBallLaunched) {
            return;
        } else if (_vHitDir.x === 0 && _vHitDir.y === 0 && _vHitDir.z === 0) {
            return;
        }

        s_oGame.addImpulseToBall(_vHitDir);
        if (!_bOut) {
            s_oGame.ballShotBy(PLAYER_SIDE);
            playSound("hit_ball", 1, false);
        }
        _vHitDir.set(0, 0, 0);
        _iTimePressDown = 0;
        _oPowerBar.mask(0);
        _oPowerBar.animFade(0, _oPowerBar.setVisible, false);
    };

    this.addImpulseToBall = function (oDir) {
        if (oDir.x === 0 && oDir.y === 0 && oDir.z === 0) {
            return;
        }
        if (_iGameState !== STATE_PLAY || _oBall.getPhysics().mass === 0 || _bOut) {
            return;
        }
        var oBall = _oScene.ballBody();
        oBall.velocity.set(0, 0, 0);
        _oScene.addImpulse(oBall, oDir);
        oBall.angularVelocity.set(0, 0, 0);

        if (oBall.position.z < OFFSET_BALL_FIELD_Z_IMP) {
            oBall.position.z += 0.2;
        }

        _bBallFieldTouch = false;
    };

    this.resetBallPosition = function () {
        var oBallBody = _oScene.ballBody();

        oBallBody.position.set(START_BALL_POSITION[SERVICE_BY][s_iServiceSide].x, START_BALL_POSITION[SERVICE_BY][s_iServiceSide].y,
                START_BALL_POSITION[SERVICE_BY][s_iServiceSide].z);
        oBallBody.velocity.set(0, 0, 0);
        oBallBody.angularVelocity.set(0, 0, 0);
        oBallBody.mass = 0;
    };

    this.resetScene = function () {
        _bBallLaunched = false;
        _bBallFieldTouch = false;
        _bOut = false;
        _bService = false;
        _bMouseDown = false;
        _vHitDir.set(0, 0, 0);
        _iTimePressDown = 0;

        this.resetBallPosition();
        this.resetCharactersPosition();

        this.serviceBy();
    };

    this.resetCharactersPosition = function () {
        _oPlayer.getPhysics().position.set(PLAYER_POS_3D[s_iServiceSide].x, PLAYER_POS_3D[s_iServiceSide].y, PLAYER_POS_3D[s_iServiceSide].z);
        _oPlayer.runAnim(IDLE);
        _oOpponent.getPhysics().position.set(OPPONENT_POS_3D[s_iServiceSide].x, OPPONENT_POS_3D[s_iServiceSide].y, OPPONENT_POS_3D[s_iServiceSide].z);
        _oOpponent.runAnim(IDLE);
    };

    this.restartGame = function () {
        s_oMain.pokiShowCommercial( ()=>{
            s_oGame.setPokiStart(true);
            
            _iOpponentPoint = 0;
            _iOpponentSet = 0;
            _iPlayerPoint = 0;
            _iPlayerSet = 0;
            _iServiceAttempt = 0;
            _iScore -= _iScoreMatch;
            _iScoreMatch = 0;
            _iGameState = STATE_PLAY;

            s_oGame.refreshScoreBoard();

            s_oGame.unloadAudioMatch();

            tweenVolume("soundtrack", 0, MS_TIME_FADE_VOL);

            s_oGame.resetScene();
            $(s_oMain).trigger("restart_level", s_iLevel);
        }); 
        
    };

    this.unloadAudioMatch = function () {
        if (_szAudioMatch !== null) {
            stopSound(_szAudioMatch);
        }
    };

    this.unload = function () {
        _bInitGame = false;

        _oInterface.unload();
        if (_oEndPanel !== null) {
            _oEndPanel.unload();
        }
        s_oGame.unloadAudioMatch();

        if (_oHitArea !== null) {
            _oHitArea.removeAllEventListeners();
        }

        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();
    };

    this.onExit = function () {
        s_oMain.pokiShowCommercial( ()=>{
            $(s_oMain).trigger("end_session");
            $(s_oMain).trigger("end_level", s_iLevel);
            _oFade.visible = true;
            s_oStage.setChildIndex(_oFade, s_oStage.numChildren - 1);

            createjs.Tween.get(_oFade, {override: true}).to({alpha: 1}, MS_FADE_ANIM, createjs.Ease.cubicOut).call(function () {
                $(s_oMain).trigger("show_interlevel_ad");
                s_oGame.unload();
                if (s_oSoundTrack !== undefined)
                    tweenVolume("soundtrack", 1, MS_TIME_FADE_VOL);
                s_oMain.gotoMenu();
            }, null, this);
        });
    };

    this._onExitHelp = function () {
        _oInterface.onExitFromHelp();
        this.createControl();
        $(s_oMain).trigger("start_level", s_iLevel);
        tweenVolume("soundtrack", 0, MS_TIME_FADE_VOL);
        this.serviceBy();
        
        s_oGame.setPokiStart(true);
    };

    this.refreshObjectPosition2D = function (oObject, fScaleFactor) {
        var oBody = oObject.getPhysics();

        var oPos2D = this.convert3dPosTo2dScreen(oBody.position, _oCamera);

        var fScaleDistance = oPos2D.z * (fScaleFactor - oObject.getStartScale()) + oObject.getStartScale();

        oObject.setPosition(oPos2D.x, oPos2D.y);
        oObject.scale(fScaleDistance);

        if (oObject.castShadown()) {
            this.refreshShadowCast(oObject, oBody, fScaleDistance);
        }
    };

    this.refreshShadowCast = function (oObject, oBody, fScaleDistance) {
        var oFieldBody = _oScene.getField();

        if (oBody.position.z < oFieldBody.position.z) {
            oObject.scaleShadow(0);
            return;
        }

        var oPosShadow = {x: oBody.position.x, y: oBody.position.y, z: oFieldBody.position.z};

        var oPos2dShadow = this.convert3dPosTo2dScreen(oPosShadow, _oCamera);

        var fDistance = (oBody.position.z - BALL_SHADOW_POS) * ((oFieldBody.position.z - SHADOWN_FACTOR) - oFieldBody.position.z) + oFieldBody.position.z;

        var fScaleHeight = fDistance;

        if (fScaleHeight < 0) {
            return;
        } else if (fScaleHeight > 1) {
            fScaleHeight = 1;
        }

        oObject.scaleShadow(fScaleHeight);

        oObject.setAlphaByHeight(fDistance);
        oObject.setPositionShadow(oPos2dShadow.x, oPos2dShadow.y);
    };

    this.swapChildrenIndex = function () {
        for (var i = 0; i < _aObjects.length - 1; i++) {
            for (var j = i + 1; j < _aObjects.length; j++) {
                if (_aObjects[i].getObject().visible && _aObjects[j].getObject().visible)
                    this.sortDepth(_aObjects[i], _aObjects[j]);
            }
        }
    };

    this.sortDepth = function (oObj1, oObj2) {
        if (oObj1.getDepthPos() > oObj2.getDepthPos()) {
            if (_oContainerGame.getChildIndex(oObj1.getObject()) > _oContainerGame.getChildIndex(oObj2.getObject())) {
                _oContainerGame.swapChildren(oObj1.getObject(), oObj2.getObject());
            }
        } else if (oObj1.getDepthPos() < oObj2.getDepthPos()) {
            if (_oContainerGame.getChildIndex(oObj2.getObject()) > _oContainerGame.getChildIndex(oObj1.getObject())) {
                _oContainerGame.swapChildren(oObj2.getObject(), oObj1.getObject());
            }
        }
    };

    this.convert2dScreenPosTo3d = function (oPos2d, oBody) {
        var iWidth = (s_iCanvasResizeWidth);
        var iHeight = (s_iCanvasResizeHeight);

        var mouse3D = new THREE.Vector3((oPos2d.x / iWidth) * 2 - 1, //x
                -(oPos2d.y / iHeight) * 2 + 1, //y
                -1);                                            //z
        mouse3D.unproject(_oCamera);
        mouse3D.sub(_oCamera.position);
        mouse3D.normalize();

        var fFactor = oBody.position.y;//Object3d.y

        mouse3D.multiply(new THREE.Vector3(fFactor, 1, fFactor));

        return mouse3D;
    };

    this.convert3dPosTo2dScreen = function (pos, oCamera) {
        var v3 = new THREE.Vector3(pos.x, pos.y, pos.z);
        var vector = v3.project(oCamera);

        var widthHalf = Math.floor(s_iCanvasResizeWidth) * 0.5;
        var heightHalf = Math.floor(s_iCanvasResizeHeight) * 0.5;


        vector.x = ((vector.x * widthHalf) + widthHalf) * s_fInverseScaling;
        vector.y = (-(vector.y * heightHalf) + heightHalf) * s_fInverseScaling;

        return vector;
    };

    this.ballShotBy = function (iVal) {
        _iBallShot = iVal;
    };

    this.animCharacters = function () {
        for (var i = 0; i < CHARACTERS.length; i++) {
            switch (CHARACTERS[i].getAnimType()) {
                case SERVICE:
                    if (CHARACTERS[i].getStateAnim()) {
                        CHARACTERS[i].animWithEnd(IDLE, SERVICE_FRAME_SHOT);//next anim, call function at frame
                    }
                    break;
                case FOREHAND:
                    if (CHARACTERS[i].getStateAnim()) {
                        CHARACTERS[i].animWithEnd(IDLE, FOREHAND_FRAME_SHOT);//next anim, call function at frame
                    }
                    break;
                case BACKHAND:
                    if (CHARACTERS[i].getStateAnim()) {
                        CHARACTERS[i].animWithEnd(IDLE, BACKHAND_FRAME_SHOT);//next anim, call function at frame
                    }
                    break;
            }
        }
    };

    this.charactersPosition2D = function () {
        for (var i = 0; i < CHARACTERS.length; i++) {
            this.refreshObjectPosition2D(CHARACTERS[i], CHARACTERS_SCALE_FACTOR);
        }
    };

    this.ballSide = function () {
        if (_oScene.getNetBody().position.y < _oBall.getPhysics().position.y) {
            if (SERVICE_BY === PLAYER_SIDE) {
                _bBallLaunched = true;
            }
            _iBallSide = OPPONENT_SIDE;
        } else {
            if (SERVICE_BY === OPPONENT_SIDE) {
                _bBallLaunched = true;
            }
            _iBallSide = PLAYER_SIDE;
        }
    };

    this.idleCharacterForBallOut = function (oChar) {
        if (oChar.getAnimType() !== IDLE && oChar.getAnimType() !== FOREHAND && oChar.getAnimType() !== BACKHAND) {
            oChar.runAnim(IDLE);
        }
    };

    this.charactersMovement = function () {
        if (!_bBallLaunched || _bOut) {
            return false;
        } else if (!_bBallFieldTouch) {
            if (Math.abs(_oBall.getPhysics().position.x) > FIELD_OUT_BALL_WIDTH) {
                this.idleCharacterForBallOut(CHARACTERS[_iBallSide]);
                return false;
            } else if (Math.abs(_oBall.getPhysics().position.y) > FIELD_HALF_LENGHT) {
                this.idleCharacterForBallOut(CHARACTERS[_iBallSide]);
                return false;
            }
        }

        if (_iBallShot === OPPONENT_SIDE) {
            switch (_oOpponent.getAnimType()) {
                case IDLE:
                case STANCE:
                case RUN:
                case RUN_REVERSE:
                case STRAFE_LEFT:
                case STRAFE_RIGHT:
                    if (!this.checkDistanceCharacterToPos(_oOpponent, RETURN_POS_CHARACTERS_OPPONENT)) {
                        _oControllerMovement.moveCharacterToPos(_oOpponent, RETURN_POS_CHARACTERS_OPPONENT);
                    }
                    break;
                default:
                    if (_oBall.getPhysics().velocity.y < 0 && _iBallSide === OPPONENT_SIDE) {
                        if (_oPlayer.getAnimType() !== IDLE) {
                            _oPlayer.runAnim(IDLE);
                            return false;
                        }
                    }
                    break;
            }
        } else if (_iBallShot === PLAYER_SIDE) {
            switch (_oPlayer.getAnimType()) {
                case IDLE:
                case STANCE:
                case RUN:
                case RUN_REVERSE:
                case STRAFE_LEFT:
                case STRAFE_RIGHT:
                    if (!this.checkDistanceCharacterToPos(_oPlayer, RETURN_POS_CHARACTERS_PLAYER)) {
                        _oControllerMovement.moveCharacterToPos(_oPlayer, RETURN_POS_CHARACTERS_PLAYER);
                    }
                    break;
                default:
                    if (_oBall.getPhysics().velocity.y > 0 && _iBallSide === PLAYER_SIDE) {
                        if (_oOpponent.getAnimType() !== IDLE) {
                            _oOpponent.runAnim(IDLE);

                            return false;
                        }
                    }
                    break;
            }
        }

        if (CHARACTERS[_iBallSide].getPhysics().position.y < PLAYER_LIMIT_POS_Y) {
            if (_oPlayer.getAnimType() !== IDLE) {
                _oPlayer.runAnim(IDLE);
            }
            return false;
        }

        if (_iBallShot !== _iBallSide) {
            return   _oControllerMovement.moveCharacterToBall(CHARACTERS[_iBallSide], _oBall);
        } else {
            return false;
        }
    };

    this.checkDistanceCharacterToPos = function (oCharacter, oPos) {
        var fDistance = distanceV2({x: oCharacter.getPhysics().position.x, y: oCharacter.getPhysics().position.y}, oPos);
        if (fDistance < TO_POS_CHAR_DISTANCE_OFFSET) {

            if (oCharacter.getAnimType() !== IDLE) {
                oCharacter.runAnim(IDLE);
            }
            oCharacter.setSpeed(0);
            return true;//REACH THE POSITION;
        }
        return false;
    };

    this.characterShoot = function (bCanShoot) {
        if (!bCanShoot) {
            return;
        }

        if (_iBallSide === OPPONENT_SIDE && _iBallShot === PLAYER_SIDE) {
            switch (_oOpponent.getAnimType()) {
                case IDLE:
                case STANCE:
                case RUN:
                case RUN_REVERSE:
                case STRAFE_LEFT:
                case STRAFE_RIGHT:
                    this.runAnimation(_oOpponent, _oAI.shot);
            }
        } else if (_iBallSide === PLAYER_SIDE && _iBallShot === OPPONENT_SIDE) {
            switch (_oPlayer.getAnimType()) {
                case IDLE:
                case STANCE:
                case RUN:
                case RUN_REVERSE:
                case STRAFE_LEFT:
                case STRAFE_RIGHT:
                    this.runAnimation(_oPlayer, s_oGame.launchBall);
            }
        }
    };

    this.runAnimation = function (oChar, oCallFunc) {
        var oPosChar = oChar.getPhysics().position;

        var oPosBall = _oBall.getPhysics().position;

        if (oPosBall.z > VOLLEY_SHOOT_Z) {
            //    oChar.runAnim(VOLLEY);
        } else {
            if (_iBallSide === PLAYER_SIDE) {
                if (oPosBall.x > oPosChar.x) {
                    oChar.runAnim(BACKHAND);
                } else {
                    oChar.runAnim(FOREHAND);
                }
            } else {
                if (oPosBall.x > oPosChar.x) {
                    oChar.runAnim(FOREHAND);
                } else {
                    oChar.runAnim(BACKHAND);
                }
            }
        }
        oChar.setActionFunc(oCallFunc);
    };

    this.shotMouseDown = function () {
        if (_bMouseDown) {
            _iTimePressDown += s_iTimeElaps * 1.5;
            _oPowerBar.graphicsForceMask(_iTimePressDown);
        }
    };

    this._updatePlay = function () {
        _oScene.update();

        this._updateBall2DPosition();

        this.ballSide();

        this.shotMouseDown();

        this.characterShoot(this.charactersMovement());

        this.charactersPosition2D();

        this.animCharacters();

        this.swapChildrenIndex();
        this.cameraUpdate();
    };

    this.ballCollideNet = function () {
        if (!_bBallLaunched && !_bBallFieldTouch) {
            this.serviceAttempt();
            return;
        }
    };

    this.ballOut = function () {
        if (_bOut) {
            return;
        }

        if (_bBallFieldTouch) {
            if (_iBallShot === PLAYER_SIDE && _iBallSide === OPPONENT_SIDE) {
                this.pointTo(PLAYER_SIDE, false);
            } else if (_iBallShot === OPPONENT_SIDE && _iBallSide === PLAYER_SIDE) {
                this.pointTo(OPPONENT_SIDE, false);
            } else if (_iBallShot === PLAYER_SIDE && _iBallSide === PLAYER_SIDE) {
                this.pointTo(OPPONENT_SIDE, false);
            } else if (_iBallShot === OPPONENT_SIDE && _iBallSide === OPPONENT_SIDE) {
                this.pointTo(PLAYER_SIDE, false);
            }
        } else {
            if (_iBallShot === PLAYER_SIDE && _iBallSide === OPPONENT_SIDE) {
                this.pointTo(OPPONENT_SIDE, true);
            } else if (_iBallShot === OPPONENT_SIDE && _iBallSide === PLAYER_SIDE) {
                this.pointTo(PLAYER_SIDE, true);
            } else if (_iBallShot === PLAYER_SIDE && _iBallSide === PLAYER_SIDE) {
                this.pointTo(OPPONENT_SIDE, true);
            } else if (_iBallShot === OPPONENT_SIDE && _iBallSide === OPPONENT_SIDE) {
                this.pointTo(PLAYER_SIDE, true);
            }
            _oInterface.startAnimText(TEXT_OUT, "80px " + PRIMARY_FONT, TEXT_COLOR_0);
        }
    };

    this.refreshScoreBoard = function () {
        _oInterface.refreshScoreBoard(PLAYER_SIDE, POINT_TEXT, POINT[_iPlayerPoint]);                                                                                                                                                                       //iWho, iText, szText
        _oInterface.refreshScoreBoard(OPPONENT_SIDE, POINT_TEXT, POINT[_iOpponentPoint]);

        _oInterface.refreshScoreBoard(PLAYER_SIDE, SET_TEXT, _iPlayerSet);                                                                                                                                                                       //iWho, iText, szText
        _oInterface.refreshScoreBoard(OPPONENT_SIDE, SET_TEXT, _iOpponentSet);
    };

    this.resultSound = function (szPlaySound, bOut) {
        if (bOut) {
            playSound("out", 1, false);

            setTimeout(function(){playSound(szPlaySound, 1, false);},1000);
        } else {
            playSound(szPlaySound, 1, false);
        }
    };

    this.pointTo = function (iWho, bOut) {
        if (iWho === OPPONENT_SIDE) {
            _iOpponentPoint++;
            _iScoreMatch += SCORES_TO_LOSE;
            this.resultSound("crowd_disappoint", bOut);
        } else {
            _iPlayerPoint++;
            
            PokiSDK.happyTime(0.5);
            
            _iScoreMatch += SCORES_TO_EARN;
            this.resultSound("crowd_applauses", bOut);
        }

        var iPointForSet = POINT.length;
        if (_iPlayerPoint < 3 || _iOpponentPoint < 3) {
            iPointForSet -= 1;
        }

        if (_iPlayerPoint === 4 && _iOpponentPoint === 4) {
            _iPlayerPoint = 3;
            _iOpponentPoint = 3;
        }
        var bSet = false;

        if (_iPlayerPoint === iPointForSet) {
            _iPlayerSet++;
            bSet = true;
        } else if (_iOpponentPoint === iPointForSet) {
            _iOpponentSet++;
            bSet = true;
        }

        if (bSet) {
            _iOpponentPoint = 0;
            _iPlayerPoint = 0;
            this.changeService();
        }

        this.refreshScoreBoard();
        _bOut = true;

        _oPlayer.runAnim(IDLE);
        _oOpponent.runAnim(IDLE);
        createjs.Tween.get(this).wait(MS_TIME_AFTER_BALL_OUT).call(function () {
            if (_iPlayerSet === SET_FOR_WIN) {
                this.gameOver(true);
                PokiSDK.happyTime(1);
            } else if (_iOpponentSet === SET_FOR_WIN) {
                this.gameOver(false);
            } else {
                this.resetScene();
            }
        });
    };

    this.gameOver = function (bPlayerWin) {
        var bEnd = false;


        if (_iScoreMatch < 0) {
            _iScoreMatch = 0;
        }
        if (bPlayerWin) {
            _iScore += _iScoreMatch;
            this.saveProgress();
            if (s_iLevel === OPPONENT_SPEED.length - 1) {
                bEnd = true;
            }
            _szAudioMatch = playSound("win_match", 1, false);
        } else {
            _szAudioMatch = playSound("lose_match", 1, false);
        }

        _iGameState = STATE_FINISH;

        _oOpponent.runAnim(IDLE);
        _oPlayer.runAnim(IDLE);

        setTimeout(function () {
            s_oGame.unloadAudioMatch();
            tweenVolume("soundtrack", 0.3, MS_TIME_FADE_VOL);
        },8000);

        $(s_oMain).trigger("end_level", s_iLevel);

        s_oGame.setPokiStart(false);

        _oInterface.createEndPanel(_iPlayerSet, _iOpponentSet, _iPlayerPoint, _iOpponentPoint, bPlayerWin, _iScoreMatch, s_iBestScore, bEnd);
    };

    this.saveProgress = function () {
        if (s_iLevelReached < s_iLevel + 2) {
            s_iLevelReached = s_iLevel + 2;
        }


        if (_iScoreMatch > s_aScores[s_iLevel]) {
            s_aScores[s_iLevel] = _iScore;
        }

        s_iBestScore = 0;
        for (var i = 0; i < s_aScores.length; i++) {
            s_iBestScore += s_aScores[i];
        }

        saveItem("tennis_levelreached", s_iLevelReached);
        saveItem("tennis_scores", JSON.stringify(s_aScores));
        saveItem("tennis_best_score", s_iBestScore);
    };

    this.changeService = function () {
        if (SERVICE_BY === OPPONENT_SIDE) {
            SERVICE_BY = PLAYER_SIDE;
        } else {
            SERVICE_BY = OPPONENT_SIDE;
        }
    };

    this.serviceAttempt = function () {
        if (_iServiceAttempt === MAX_SERVICE_ATTEMPT) {
            _iServiceAttempt = 0;
            if (SERVICE_BY === PLAYER_SIDE) {
                this.pointTo(OPPONENT_SIDE);
            } else {
                this.pointTo(PLAYER_SIDE);
            }
        } else {
            _iServiceAttempt++;
            _oInterface.startAnimText(TEXT_FAULT, "80px " + PRIMARY_FONT, TEXT_COLOR_0);
            createjs.Tween.get(this).wait(MS_TIME_AFTER_BALL_OUT).call(function () {
                this.resetScene();
            });

        }
    };

    this.ballFieldTouch = function () {
        if (_bOut) {
            return;
        }

        if (!_bBallLaunched) {
            this.serviceAttempt();
            _bBallFieldTouch = true;
            return;
        }

        if (!_bBallFieldTouch) {
            if (_iBallShot === PLAYER_SIDE && _iBallSide === PLAYER_SIDE) {
                this.pointTo(OPPONENT_SIDE);
            } else if (_iBallShot === OPPONENT_SIDE && _iBallSide === OPPONENT_SIDE) {
                this.pointTo(PLAYER_SIDE);
            }
            _bBallFieldTouch = true;
            return;
        }

        if (_iBallShot === PLAYER_SIDE && _iBallSide === OPPONENT_SIDE) {
            this.pointTo(PLAYER_SIDE);
        } else if (_iBallShot === OPPONENT_SIDE && _iBallSide === PLAYER_SIDE) {
            this.pointTo(OPPONENT_SIDE);
        }
        _oBall.getPhysics().position.z += 0.1;
    };

    this.cameraUpdate = function () {
        _oCamera.updateProjectionMatrix();
        _oCamera.updateMatrixWorld();
    };

    this._updateBall2DPosition = function () {
        this.refreshObjectPosition2D(_oBall, BALL_SCALE_FACTOR);
        _oBall.update();
    };

    this._updateInit = function () {
        _oScene.update();
        this._updateBall2DPosition();
        this.charactersPosition2D();
        _iGameState = STATE_PLAY;
    };

    this.setPokiStart = function(bVal){       
        if(bVal && !_bPokiStart){
            PokiSDK.gameplayStart();
            _bPokiStart = true;
        }else if(!bVal && _bPokiStart) {
            PokiSDK.gameplayStop();
            _bPokiStart = false;
        }
    };

    this.update = function () {
        switch (_iGameState) {
            case STATE_INIT:
                this._updateInit();
                break;
            case STATE_PLAY:
                this._updatePlay();
                break;
            case STATE_FINISH:

                break;
            case STATE_PAUSE:

                break;
        }

        this.getPowerBar = function () {
            return _oPowerBar;
        };
    };

    s_oGame = this;

    
    SCORES_TO_EARN = oData.scores_to_earn;
    SCORES_TO_LOSE = oData.scores_to_lose;
    PLAYER_SPEED = oData.player_speed;
    PLAYER_ACCELERATION = oData.player_acceleration;
    OPPONENT_ACCELERATION = oData.opponent_acceleration;
    AI_RANGE_FORCE_X = oData.opponent_force_x_range;
    AI_RANGE_FORCE_Y = oData.opponent_force_y_range;
    AI_RANGE_Z = oData.opponent_force_z_range;
    AI_DISTANCE_Y_MULTIPLIER = oData.opponent_distance_y_multiplier;
    SET_FOR_WIN = oData.set_for_win;

    NUM_LEVEL_FOR_ADS = oData.ad_show_counter;

    s_iLevel = iLevel;

    _oParent = this;
    this._init();
}

var s_oGame;
var s_iServiceSide = LEFT_SERVICE;
var s_iLevel;