function CGame(oData, iTeamChoosed) {
    var _bStartGame = true;
    var _bFinish = false;
    var _bGoal = false;
    var _bScrollWorld = false;
    var _bPlayerSelected = false;
    var _bRestart = false;
    var _bUpdatePhysics = false;
    var _bPlayerLaunched = false;
    var _bActiveFollowBall = false;
    var _bFirstHitNoOpponent = false;
    var _bFoulCommitted = false;
    var _bCpuTurn = false;
    var _bExtendedMatch = false;
    var _iTotScore;
    var _iLevelScore;
    var _iLevel;
    var _iPlayerTeam;
    var _iGoalPlayer;
    var _iGoalOpponent;
    var _iDirScrollWorld;
    var _iPlayerIDSelect;
    var _iNumOfShot;
    var _oInterface;
    var _oBg;
    var _oBall;
    var _oCharacter;
    var _oOpponent;
    var _oGoal;
    var _oArrow;
    var _oArrowDir;
    var _oArrowSelected;
    var _oCrowdAudio;
    var _oReleasePoint;
    var _oEdgeGoalUser;
    var _oEdgeGoalOpponent;
    var _aFieldEdges;
    var _aFieldEdgesBall;
    var _aGoalsKeeperEdges;
    var _oGoalKepperEdgeOpponent;
    var _aPlayers;
    var _aPlayerOpponent;
    var _aCollisionObject;
    var _aResults;
    var _aPlayerUser;
    var _aOpponentsTeamVs;
    var _fTimeDespawnHead;
    var _fTimeAfterGoal;
    var _fTimeMatch;
    var _fScrollWorldSpeed;
    var _fTimePenality;
    var _fForce;

    this._init = function () {
        $(s_oMain).trigger("start_session");
        s_oScrollStage = new createjs.Container();

        s_oStage.addChild(s_oScrollStage);

        _iPlayerTeam = iTeamChoosed;

        _bStartGame = false;
        _iTotScore = 0;

        _iLevelScore = 0;

        _iLevel = 0;

        _iPlayerIDSelect = -1;

        _fScrollWorldSpeed = 0.0;

        _iNumOfShot = NUM_OF_SHOT;

        _fTimePenality = LAUNCH_PENALITY_SECOND;

        _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));
        s_oScrollStage.addChild(_oBg);

        _aResults = new Array();
        _aPlayerUser = new Array();
        _aPlayers = new Array();
        _aPlayerOpponent = new Array();
        _aCollisionObject = new Array();

        _aFieldEdges = this.createFieldEdges(FIELD_DIAGRAM_PLAYERS);
        _aFieldEdgesBall = this.createFieldEdges(FIELD_DIAGRAM_BALL);

        this._createEdgeGoals();

        playSound("crowd", 1, true);

        _aGoalsKeeperEdges = this._createEdgeGoalKeeper(EDGE_FOR_KEEPERS);

        _oGoalKepperEdgeOpponent = new CEdge(EDGE_FOR_KEEPERS[4][0].x, EDGE_FOR_KEEPERS[4][0].y, EDGE_FOR_KEEPERS[7][0].x, EDGE_FOR_KEEPERS[7][0].y);

        _oArrow = new CArrow(0, 0, s_oScrollStage);
        _oArrow.setVisible(false);

        _oGoal = new CGoal(s_oScrollStage);

        _aOpponentsTeamVs = this._createRandomOpponentTeamOrder();

        var iID = this._createPlayers();

        var oSpriteBall = s_oSpriteLibrary.getSprite("ball");
        this._createBall(oSpriteBall, BALL_POSITION.x, BALL_POSITION.y, iID, s_oScrollStage);

        _aCollisionObject.push(_oBall);

        this._createOtherCollision(_aCollisionObject, iID);

        _oReleasePoint = {x: s_oStage.mouseX/s_iScaleFactor - s_oScrollStage.x, y: s_oStage.mouseY};

        _oGoal.createGoalFront();

        _iGoalOpponent = 0;
        _iGoalPlayer = 0;

        _fTimeAfterGoal = 0;

        _fTimeDespawnHead = 0;

        var oSpriteArrowSelected = s_oSpriteLibrary.getSprite("player_selected");

        _oArrowSelected = new CArrowPlayerSelected(0, 0, oSpriteArrowSelected, s_oScrollStage);
        _oArrowSelected.setVisible(false);

        _oInterface = new CInterface(iTeamChoosed, _aOpponentsTeamVs[_iLevel]);

        _oInterface.refreshResult(_iGoalPlayer, _iGoalOpponent);

        _fTimeMatch = REGULAR_MATCH_TIME;

        _oInterface.refreshTime(TEXT_TIME + ": " + Math.ceil(_fTimeMatch));
    };

    this._createPlayers = function () {
        var oSpritePlayers = s_oSpriteLibrary.getSprite("players");
        var iID = 0;
        for (var i = 0; i < PLAYERS_ON_FIELD; i++) {
            var iUserTeam = _iPlayerTeam;
            var iOpponentTeam = _aOpponentsTeamVs[_iLevel];
            if (USER_PLAYERS[i].goal_keeper) {
                var iRand = Math.floor(Math.random() * KEEPERS.length);
                iUserTeam = KEEPERS[iRand];
            }
            if (OPPONENT_PLAYERS[i].goal_keeper) {
                var iRand = Math.floor(Math.random() * KEEPERS.length);
                while (iRand === iUserTeam) {
                    iRand = Math.floor(Math.random() * KEEPERS.length);
                }
                iOpponentTeam = KEEPERS[iRand];
            }

            _aPlayers.push(_aPlayerUser[i] = this.createPlayer(oSpritePlayers, USER_PLAYERS[i].x, USER_PLAYERS[i].y, iID, -1, true, USER_PLAYERS[i].goal_keeper, iUserTeam, PLAYERS_USER, s_oScrollStage));
            iID++;
            _aPlayers.push(_aPlayerOpponent[i] = this.createPlayer(oSpritePlayers, OPPONENT_PLAYERS[i].x, OPPONENT_PLAYERS[i].y, iID, 1, false, OPPONENT_PLAYERS[i].goal_keeper, iOpponentTeam, PLAYERS_OPPONENT, s_oScrollStage));
            iID++;
            _aCollisionObject.push(_aPlayerUser[i]);
            _aCollisionObject.push(_aPlayerOpponent[i]);
        }
        return iID;
    };

    this._createOtherCollision = function (aCollision, iID) {
        for (var i = 0; i < OTHER_COLLISION.length; i++) {
            iID++;
            aCollision.push(new CInvisibleCollision(OTHER_COLLISION[i].x, OTHER_COLLISION[i].y, iID, LOGIC_COLLISION,
                    OTHER_COLLISION[i].radius, s_oScrollStage));
        }
    };

    this._createEdgeGoalKeeper = function (aGoalDiagram) {
        var aEdge = new Array();

        for (var i = 0; i < aGoalDiagram.length; i++) {
            aEdge.push(new CEdge(aGoalDiagram[i][0].x, aGoalDiagram[i][0].y, aGoalDiagram[i][1].x, aGoalDiagram[i][1].y));
        }

        return aEdge;
    };

    this._createEdgeGoals = function () {
        _oEdgeGoalOpponent = new CEdge(GOAL_OPPONENT[0].x, GOAL_OPPONENT[0].y, GOAL_OPPONENT[1].x, GOAL_OPPONENT[1].y);
        _oEdgeGoalUser = new CEdge(GOAL_USER[0].x, GOAL_USER[0].y, GOAL_USER[1].x, GOAL_USER[1].y);

        if (SHOW_EDGE_COLLISION) {
            this.createGraphicsCollision(GOAL_OPPONENT, false, LINE_COLOR_GOALS);
            this.createGraphicsCollision(GOAL_USER, false, LINE_COLOR_GOALS);
        }
    };

    this._createRandomOpponentTeamOrder = function () {
        var aTeam = new Array();
        var iID = 0;
        for (var i = 0; i < TOT_TEAM; i++) {
            if (_iPlayerTeam !== i) {
                aTeam[iID] = i;
                iID++;
            }
        }
        aTeam = shuffle(aTeam);
        return aTeam;
    };

    this.createFieldEdges = function (aLevelDiagram) {
        var aEdge = new Array();

        for (var i = 0; i < aLevelDiagram.length; i++) {
            aEdge.push(new CEdge(aLevelDiagram[i][0].x, aLevelDiagram[i][0].y, aLevelDiagram[i][1].x, aLevelDiagram[i][1].y));
        }

        if (SHOW_EDGE_COLLISION) {
            this.createGraphicsCollision(aLevelDiagram, true, LINE_COLOR);
        }

        return aEdge;
    };

    this.createGraphicsCollision = function (aEdge, bDiagram, szColor) {
        var oField = new createjs.Shape();
        oField.graphics.beginStroke(szColor);
        oField.graphics.setStrokeStyle(2);
        for (var i = 0; i < aEdge.length; i++) {
            if (bDiagram) {
                oField.graphics.lineTo(aEdge[i][0].x, aEdge[i][0].y);
            } else {
                oField.graphics.lineTo(aEdge[i].x, aEdge[i].y);
            }
        }

        oField.graphics.closePath();

        s_oScrollStage.addChild(oField);
    };

    this.unload = function () {
        _bStartGame = false;

        _oInterface.unload();

        for (var i = 0; i < _aPlayers.length; i++) {
            _aPlayers[i].unload();
            _aPlayers[i] = null;
        }

        stopSound("crowd");

        s_oStage.removeAllChildren();

        createjs.Tween.removeAllTweens();

        if (s_bMobile === false) {
            document.onkeydown = null;
            document.onkeyup = null;
        }
    };

    this.createPlayer = function (oSprite, iX, iY, iID, fScale, bUserPlayer, bGoalKeeper, iTeam, iType, oParentContainer) {
        var oPlayer;
        oPlayer = new CPlayer(iX, iY, oSprite, iID, bUserPlayer, bGoalKeeper, iType, oParentContainer);
        oPlayer.rotate(fScale);

        oPlayer.changeTeam(iTeam);

        return oPlayer;
    };

    this.createOpponent = function (iTeam, iX, iY, oParentContainer) {
        var oSprite = s_oSpriteLibrary.getSprite("team_" + iTeam);
        _oOpponent = new COpponent(iX, iY, oSprite, OPPONENT_SPEEDS[_iLevel], _oPhysicsObject, _oOpponentCollision, oParentContainer);
        _oOpponent.setDistanceProtection(OPPONENT_DISTANCE_PROTECTION[_iLevel]);
    };

    this._createOpponentCollision = function () {
        var oCollision;
        oCollision = _oPhysicsObject.addCollisionShape(OPPONENT_COLLISION);
        return oCollision;
    };

    this.onPlayerSelect = function (oInfo) {
        if (oInfo.id !== _iPlayerIDSelect && !_bPlayerLaunched) {
            _bPlayerSelected = true;
            _iPlayerIDSelect = oInfo.id;
            _oArrowSelected.setPosition(oInfo.pos.x, oInfo.pos.y + Y_POS_ARROW_SELECTED_OFFSET);
            _oArrowSelected.setVisible(true);
            _oArrowSelected.animation();
            _oArrow.setPosition(oInfo.pos.x, oInfo.pos.y);
            _oArrow.setVisible(true);
        }
    };

    this.arrowDraw = function () {
        if (!_bPlayerSelected) {
            return;
        }
        
        var oDif = {x: _oReleasePoint.x - _oArrow.getX(), y: _oReleasePoint.y - _oArrow.getY()};
        var iAngle = Math.atan2(oDif.y, oDif.x);

        _oArrowDir = {x: Math.cos(iAngle), y: Math.sin(iAngle)};

        iAngle = iAngle * (180 / Math.PI) + OFFSET_ANGLE_ARROW;
        _oArrow.setAngle(iAngle);
        
        var fDistance = Math.ceil(distance({x: _oArrow.getX(), y: _oArrow.getY()}, _oReleasePoint));

        if (fDistance > 100) {
            fDistance = 100;
        }
            
        this.setForce(-fDistance);

        _oArrow.mask(fDistance);
        _oArrow.circle(fDistance);
        
    };

    this.setForce = function (fVal) {
        _fForce = fVal * FORCE_MULTIPLIER;
    };

    this.onPressMove = function () {
        if (!_bPlayerSelected || _bFinish) {
            return;
        }
        _oReleasePoint = {x: s_oStage.mouseX/s_iScaleFactor - s_oScrollStage.x, y: s_oStage.mouseY/s_iScaleFactor};
    };

    this.onPressUp = function () {
        if (!_bPlayerSelected || _aPlayers[_iPlayerIDSelect] === null || _bFinish) {
            return;
        }

        var vHitDir = new CVector2(_aPlayers[_iPlayerIDSelect].getX() - _oReleasePoint.x,
                _aPlayers[_iPlayerIDSelect].getY() - _oReleasePoint.y);

        vHitDir.scalarProduct(_fForce);

        var fForceLength = vHitDir.length();

        if (fForceLength > HIT_PLAYER_MIN_FORCE) {

            if (fForceLength > HIT_PLAYER_MAX_FORCE) {
                vHitDir.normalize();
                vHitDir.scalarProduct(HIT_PLAYER_MAX_FORCE);
            }

            vHitDir.set(-vHitDir.getX(), -vHitDir.getY());

            s_oGame.addForceToPlayer(_aPlayers[_iPlayerIDSelect], vHitDir);
            s_oGame.upadtePhysics(true);
            _bPlayerLaunched = true;
            _iNumOfShot--;
            _fTimePenality = LAUNCH_PENALITY_SECOND;

            _oInterface.refreshTurnNumber(_iNumOfShot, false);

        } else {
            console.log("TIRO NULLO");
        }

        _bPlayerSelected = false;
        _oReleasePoint.x = 0;
        _oReleasePoint.y = 0;
        _fForce = 0;
        _fScrollWorldSpeed = 0;
        _bActiveFollowBall = true;
        _oArrowSelected.setVisible(false);
        _oArrowSelected.removeTween();

        _oArrow.setVisible(false);

    };

    this.startSmootFollowBall = function () {
        var iNewX = -_oBall.getX() + CANVAS_WIDTH_HALF;

        if (iNewX <= -iHalfOffsetX) {
            s_oScrollStage.x = -iHalfOffsetX;
            return;
        } else if (iNewX >= iHalfOffsetX) {
            s_oScrollStage.x = iHalfOffsetX;
            return;
        }

        createjs.Tween.get(s_oScrollStage).to({x: iNewX}, 750, createjs.Ease.cubicOut).call(function () {
            _bActiveFollowBall = true;
        });
    };

    this.addForceToPlayer = function (oObject, vForce) {
        oObject.addForce(vForce);
    };

    this._createBall = function (oSprite, iX, iY, iID, oContainer) {
        _oBall = new CBall(iX, iY, oSprite, iID, oContainer);
    };

    this.getBallSpritePos = function () {
        var oPos = {x: _oBallSprite.getX(), y: _oBallSprite.getY()};
        return oPos;
    };

    this.getCharacterPos = function () {
        var oPos = {x: _oCharacter.getX(), y: _oCharacter.getY()};
        return oPos;
    };

    this.getPlayerTeam = function () {
        return _iPlayerTeam;
    };

    this.getOpponentTeam = function () {
        return _aOpponentsTeamVs[_iLevel];
    };

    this.playKickSound = function () {
        if (!_bFinish)
            playSound("kick", 1, false);
    };

    this.onExit = function () {
        this.unload();
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
        setVolume("soundtrack", 1);
        s_oMain.gotoMenu();
    };

    this._onExitHelp = function () {
        _oInterface.onExitFromHelp();
    };

    this._onExitVsPanel = function () {
        _oInterface._onExitVsPanel();
        _oInterface.createStartMatchText();


        $(s_oMain).trigger("start_level", _iLevel);
    };

    this.startMatch = function () {
        PokiSDK.gameplayStart();
        
        _bStartGame = true;
        _bFinish = false;

        setVolume("soundtrack", 0.3);
        playSound("kick_off", 1, false);
    };

    this.onContinue = function (iIndex) {
        _iLevel++;

        this.nextLevel();
        this.resetLevel();

        this.tweenScrollStage(-_oBall.getX() + CANVAS_WIDTH_HALF);

        var oSpriteMsgBox = s_oSpriteLibrary.getSprite("msg_box");
        _oInterface.createVsPanel(oSpriteMsgBox, _iPlayerTeam, _aOpponentsTeamVs[_iLevel], iIndex, _iLevel, 750);
    };

    this.nextLevel = function () {

        this.changeOpponenPlayersTeam();

        _oInterface.setTeams(_iPlayerTeam, _aOpponentsTeamVs[_iLevel]);
        _oInterface.setTeamsFlagScoreBoard(_aOpponentsTeamVs[_iLevel]);
    };

    this.changeOpponenPlayersTeam = function () {
        for (var i = 0; i < _aPlayerOpponent.length - 1; i++) {
            _aPlayerOpponent[i].changeTeam(_aOpponentsTeamVs[_iLevel]);
        }

        var iRand = Math.floor(Math.random() * KEEPERS.length);
        while (iRand === _aPlayerUser[_aPlayerUser.length - 1].getTeam()) {
            iRand = Math.floor(Math.random() * KEEPERS.length);
        }
        _aPlayerOpponent[_aPlayerOpponent.length - 1].changeTeam(KEEPERS[iRand]);
    };

    this.restartLevel = function () {

        this.resetLevel();

        _oInterface.refreshScore(_iTotScore);
        _oInterface.createStartMatchText();

        this.tweenScrollStage(-_oBall.getX() + CANVAS_WIDTH_HALF);

        $(s_oMain).trigger("restart_level", _iLevel);
    };

    this.resetLevel = function () {
        this.resetResult();
        this.resetAllObjectPos();
        _bFinish = false;
        _bPlayerLaunched = false;
        _bActiveFollowBall = false;
        _bPlayerSelected = false;
        _bCpuTurn = false;
        _bUpdatePhysics = false;
        _bFoulCommitted = false;
        _bFirstHitNoOpponent = false;
        _bExtendedMatch = false;
        _iPlayerIDSelect = -1;
        _iLevelScore = 0;
        _iNumOfShot = NUM_OF_SHOT;
        _oArrowSelected.setVisible(false);
        _oArrowSelected.removeTween();
        _oArrow.setVisible(false);
        this.activeAllTurnBall();
    };

    this.tweenScrollStage = function (iX) {
        createjs.Tween.get(s_oScrollStage).to({x: iX}, 800, createjs.Ease.cubicOut);
    };

    this.resetResult = function () {
        _fTimeMatch = REGULAR_MATCH_TIME;
        _oInterface.refreshTime(TEXT_TIME + ": " + Math.ceil(_fTimeMatch));

        _iGoalOpponent = 0;
        _iGoalPlayer = 0;

        _oInterface.refreshResult(_iGoalPlayer, _iGoalOpponent);
    };

    this.matchTime = function (fSecond) {
        if (_fTimeMatch > 0) {
            _fTimeMatch -= fSecond;
            _oInterface.refreshTime(TEXT_TIME + ": " + Math.ceil(_fTimeMatch));
        } else {
            this.finishTime();
        }
    };

    this.finishTime = function () {
        _bFinish = true;

        var bWin;
        var bEnd = false;
        var oScore;

        if (_iGoalPlayer === _iGoalOpponent && _bExtendedMatch === false) {
            s_oMain.pokiShowCommercial(function(){
                _oInterface.createExtendedTimeText();
                _bExtendedMatch = true;
            });
            
            return;
        }

        if (_iGoalPlayer > _iGoalOpponent) {
            PokiSDK.happyTime(1);
            
            bWin = true;
            playSound("goal", 1, false);
            oScore = this.calculateNewScore();
            this.storesResult();
            _iTotScore = oScore.new_score = oScore.new_score + _iLevelScore;
            _oInterface.refreshScore(_iTotScore);
            if (_iLevel === TOT_MATCH - 1) {
                bEnd = true;
            }
        } else {
            bWin = false;
            oScore = _iTotScore + _iLevelScore;
            playSound("game_over", 1, false);
        }

        $(s_oMain).trigger("end_level", _iLevel);

        _oInterface.createEndMatchText(_iGoalPlayer, _iGoalOpponent, bWin, oScore, bEnd);
        
        PokiSDK.gameplayStop();
    };

    this.extendTime = function () {
        this.resetAllObjectPos();
        _bFinish = false;
        _bPlayerLaunched = false;
        _bActiveFollowBall = false;
        _bPlayerSelected = false;
        _bCpuTurn = false;
        _bUpdatePhysics = false;
        _bFoulCommitted = false;
        _bFirstHitNoOpponent = false;
        _iPlayerIDSelect = -1;
        _iNumOfShot = NUM_OF_SHOT;
        _oArrowSelected.setVisible(false);
        _oArrowSelected.removeTween();
        _oArrow.setVisible(false);

        this.activeAllTurnBall();
        this.tweenScrollStage(-_oBall.getX() + CANVAS_WIDTH_HALF);

        _fTimeMatch = EXTENDED_MATCH_TIME;
        _oInterface.refreshTime(TEXT_TIME_EXT + ": " + Math.ceil(_fTimeMatch));
        _bFinish = false;

        playSound("kick_off", 1, false);
    };

    this.storesResult = function () {
        _aResults[_iLevel] = {player_team: _iPlayerTeam, opponent_team: _aOpponentsTeamVs[_iLevel],
            result: _oInterface.getScoreBoardResult()};
    };

    this.unpause = function (bVal) {
        _bStartGame = bVal;
        
        if(_bStartGame){
            PokiSDK.gameplayStart();
        }else {
            PokiSDK.gameplayStop();
        }
    };

    this._onEnd = function () {
        this.unload();
        $(s_oMain).trigger("end_session");
        setVolume("soundtrack", 1);
        s_oMain.gotoCongratulations(_aResults, _iTotScore);
    };

    this.calculateNewScore = function () {
        var oInfo = {score: _iTotScore, player_goal_score: 0, opponent_goal_score: 0, score_match: 0, new_score: 0};

        oInfo.player_goal_score = _iGoalPlayer * SCORE_PLAYER_GOAL;
        oInfo.opponent_goal_score = _iGoalOpponent * SCORE_OPPONENT_GOAL;

        if (_bExtendedMatch) {
            oInfo.score_match = SCORE_TIE;
        } else {
            oInfo.score_match = SCORE_WIN;
        }

        oInfo.new_score = oInfo.score + oInfo.player_goal_score + oInfo.opponent_goal_score + oInfo.score_match;

        return oInfo;
    };

    this.dirScrollWorld = function (oInfo) {
        if (!_bPlayerLaunched) {
            _bScrollWorld = oInfo.press;
            _iDirScrollWorld = oInfo.dir;
            _fScrollWorldSpeed = oInfo.velocity;
        }
    };

    this.objectsPhysics = function () {
        var oObject;
        var bAllObjectStopped = true;

        for (var i = 0; i < _aCollisionObject.length; i++) {
            oObject = _aCollisionObject[i];
            if (oObject.type() !== LOGIC_COLLISION) {
                oObject.vCurForce().addV(oObject.vTmpForce());
                oObject.vTmpForce().set(0, 0);
                oObject.vPrevPos().setV(oObject.vPos());
                oObject.setPosVector();

                this.collideCircleWithEdges(oObject, _aFieldEdges);

                oObject.vCurForce().scalarProduct(PLAYERS_FRICTION);

                if (oObject.vCurForce().length2() < MIN_PLAYER_FORCE_VEL) {
                    oObject.vCurForce().set(0, 0);
                } else {
                    bAllObjectStopped = false;
                }
                this.sortZIndex(i);
            }

        }
        if (bAllObjectStopped) {
            this.allObjectsStop();
        }
    };

    this.sortZIndex = function (iID) {
        for (var i = 0; i < _aCollisionObject.length; i++) {
            if (iID !== i) {
                this.sortByY(_aCollisionObject[iID].getObject(), _aCollisionObject[i].getObject());
            }
        }
    };

    this.sortByY = function (oCol1, oCol2) {
        var a = oCol1;
        var b = oCol2;
        if (a === null || b === null) {
            return;
        }

        if (a.y < b.y) {
            if (s_oScrollStage.getChildIndex(a) > s_oScrollStage.getChildIndex(b)) {
                s_oScrollStage.swapChildren(a, b);
            }
        } else if (a.y > b.y) {
            if (s_oScrollStage.getChildIndex(b) > s_oScrollStage.getChildIndex(a)) {
                s_oScrollStage.swapChildren(b, a);
            }
        }
    };

    this.allObjectsStop = function () {
        this.upadtePhysics(false);
        _bPlayerLaunched = false;
        _iPlayerIDSelect = -1;
        _bFirstHitNoOpponent = false;
        _bActiveFollowBall = false;
        _bFoulCommitted = false;
        if (!_bFinish)
            this.checkTurn();
    };

    this.checkTurn = function () {
        if (!_bCpuTurn) {
            if (_iNumOfShot === 0) {
                _iNumOfShot = NUM_OF_SHOT;
                this.activeAllTurnBall();
                _bCpuTurn = true;
                if (_fTimePenality <= 0) {
                    _oInterface.turnAnim(TEXT_LAUNCH_DELAY_PENALTY);
                } else {
                    _oInterface.turnAnim(TEXT_CPU_TURN);
                }
                _oInterface.refreshTurnTeam(_aOpponentsTeamVs[_iLevel]);
                this.cpuTurn();
            }
        } else {
            if (_iNumOfShot === 0) {
                _iNumOfShot = NUM_OF_SHOT;
                this.activeAllTurnBall();
                _bCpuTurn = false;
                _oInterface.turnAnim(TEXT_PLAYER_TURN);
                _oInterface.refreshTurnTeam(_iPlayerTeam);
            } else {
                this.cpuTurn();
            }
        }
    };

    this.activeAllTurnBall = function () {
        for (var i = 0; i < NUM_OF_SHOT; i++) {
            _oInterface.refreshTurnNumber(i, true);
        }
    };

    this.goal = function (iGoalSide) {
        if (_bFinish) {
            return;
        }

        _bRestart = true;
        if (iGoalSide === LEFT_SIDE) {
            _iGoalOpponent++;
            _bCpuTurn = false;
            playSound("game_over", 1, false);
        } else {
            _iGoalPlayer++;
            _bCpuTurn = true;
            playSound("goal", 1, false);
            
            PokiSDK.happyTime(1);
        }
        _oInterface.refreshResult(_iGoalPlayer, _iGoalOpponent);
        _oInterface.createGoalText(CANVAS_WIDTH_HALF, CANVAS_HEIGHT_HALF);
        _bActiveFollowBall = false;

        _iNumOfShot = NUM_OF_SHOT;
        this.activeAllTurnBall();
        _oInterface.refreshTurnTeam(_iPlayerTeam);

        createjs.Tween.get(s_oScrollStage).to({x: 0}, 1000, createjs.Ease.cubicOut).call(function () {
            if (_bCpuTurn) {
                _oInterface.turnAnim(TEXT_CPU_TURN);
                _iNumOfShot = NUM_OF_SHOT;
                s_oGame.activeAllTurnBall();
                _oInterface.refreshTurnTeam(_aOpponentsTeamVs[_iLevel]);
            } else {
                _oInterface.turnAnim(TEXT_PLAYER_TURN);
                _iNumOfShot = NUM_OF_SHOT;
                s_oGame.activeAllTurnBall();
                _oInterface.refreshTurnTeam(_iPlayerTeam);
            }
            s_oGame.resetAllObjectPos();
            _bRestart = false;
        });
    };

    this.matchTime = function (fSecond) {
        if (_fTimeMatch > 0) {
            _fTimeMatch -= fSecond;
            _oInterface.refreshTime(TEXT_TIME + ": " + Math.ceil(_fTimeMatch));
        } else {
            this.finishTime();
        }
    };

    this.resetAllObjectPos = function () {
        for (var i = 0; i < _aCollisionObject.length; i++) {
            _aCollisionObject[i].resetPos();
        }
    };

    this.cpuTurn = function () {
        if (_bFinish) {
            return;
        }
        //***************************
        // creo i vettori
        var vDirGoal = new CVector2();
        var vPortaTop = new CVector2();
        var vPortaBottom = new CVector2();
        var vTargetPlayer = new CVector2();
        var vTargetBall;

        //***************************
        // setto i punti della linea di porta
        vPortaTop.set(GOAL_USER[0].x, GOAL_USER[0].y);
        vPortaBottom.set(GOAL_USER[1].x, GOAL_USER[1].y);

        //***************************
        // calcolo il punto più vicino del portiere umano alla linea di porta
        var vClosestPointOnPorta = closestPointOnLine(vPortaTop, vPortaBottom, _aPlayerUser[_aPlayerUser.length - 1].vPos());

        //***************************
        // calcolo le distanze a sx e dx del portiere rispetto ai pali
        var iDist1 = distanceV2WithoutSQRT(vClosestPointOnPorta, vPortaTop);
        var iDist2 = distanceV2WithoutSQRT(vClosestPointOnPorta, vPortaBottom);

        //***************************
        // calcolo il punto medio della porzione di porta in cui conviene tirare per la cpu
        if (iDist1 > iDist2) {
            vTargetBall = centerBetweenPointsV2(vPortaTop, vClosestPointOnPorta);
        } else {
            vTargetBall = centerBetweenPointsV2(vPortaBottom, vClosestPointOnPorta);
        }

        //****************************
        // calcolo la direzione della palla che deve avere per raggiungere il target in rete
        vDirGoal.setV(vTargetBall);
        vDirGoal.subtract(_oBall.vPos());
        vDirGoal.normalize();

        //precision Random range
        var fPrecision = 1;
        var fMin = PRECISION_CPU_RATE[_iLevel].min;
        var fMax = PRECISION_CPU_RATE[_iLevel].max;

        var fPrecision = (Math.random() * (fMax - fMin)) + fMin;

        //****************************
        // calcolo il punto d'impatto da raggiungere per la cpu
        // in modo che colpisca la palla per fargli ottenere vDirGoal		
        vTargetPlayer.setV(vDirGoal);
        vTargetPlayer.invert();
        vTargetPlayer.scalarProduct(_oBall.getRadius() * fPrecision + PLAYERS_RADIUS_HALF * 0.5);
        vTargetPlayer.addV(_oBall.vPos());

        //****************************
        // inverto la direzione della palla in porta
        vDirGoal.invert();

        //****************************
        // cerco il giocatore della cpu che ha i requisiti per segnare oppure 
        // per avvicinarsi alla palla

        this.findPlayerCpU(_oBall.getX(), vDirGoal, vTargetPlayer);
    };

    this.findPlayerCpU = function (iBallX, vBallDirInverse, vTargetPlayer) {
        var aLogicInformation = new Array();
        var bAllPlayerLeftBall = true;
        var iMaxSteps = 0;
        var iForce = HIT_PLAYER_MAX_FORCE;
        while (iForce > HIT_PLAYER_MIN_FORCE) {
            iMaxSteps += iForce;
            iForce *= PLAYERS_FRICTION;
        }
        iMaxSteps *= iMaxSteps;

        var vBallCenter = new CVector2();

        vBallCenter.set(_oBall.getX(), _oBall.getY());

        var szRes = classifySphere(vBallCenter, _oGoalKepperEdgeOpponent.getNormal(),
                _oGoalKepperEdgeOpponent.m_pCenter(), _oBall.getRadius());

        if ((szRes !== "FRONT") && (szRes !== "INTERSECT FRONT") &&
                (vBallCenter.getY() > EDGE_FOR_KEEPERS[4][0].y) &&
                (vBallCenter.getY() < EDGE_FOR_KEEPERS[7][0].y)) {

            this.prepareCpuForLaunch(_aPlayerOpponent[_aPlayerOpponent.length - 1], false, vTargetPlayer, true);
            return;
        }

        for (var i = 0; i < (_aPlayerOpponent.length - 1); i++) {
            var edgeDist = new CEdge();
            var iAngle = 0;
            var iDist2 = 0;
            var bLeft = false;
            var bObstacle = false;
            var bInsufficientPower = false;

            //verifichiamo se esistono ostacoli tra la palla e il giocatore
            edgeDist.set(_aPlayerOpponent[i].vPos().getX(), _aPlayerOpponent[i].vPos().getY(), vTargetPlayer.getX(), vTargetPlayer.getY());

            for (var k = 0; k < _aCollisionObject.length; k++) {
                if ((_aCollisionObject[k].getID() === _aPlayerOpponent[i].getID()) || _aCollisionObject[k].type() === BALL) {
                    continue;
                }

                if ((bObstacle = collideEdgeWithCircle(edgeDist, _aCollisionObject[k].vPos(), _aCollisionObject[k].getRadius() * 2, null))
                        === true) {
                    bInsufficientPower = true;
                    break;
                }
            }

            iDist2 = distanceV2WithoutSQRT(_aPlayerOpponent[i].vPos(), vTargetPlayer);

            if ((iMaxSteps) < iDist2 && bInsufficientPower === false) {
                bInsufficientPower = true;
            }

            var vPresuntaDir = new CVector2();
            vPresuntaDir.setV(_aPlayerOpponent[i].vPos());
            vPresuntaDir.subtract(vTargetPlayer);
            vPresuntaDir.normalize();

            iAngle = dotProductV2(vBallDirInverse, vPresuntaDir);

            //controlliamo se il giocatore è alla sinistra della palla
            if (iAngle < 0) {
                bLeft = true;
            } else {
                bAllPlayerLeftBall = false;
            }

            //iAngle = (1 + iAngle) * 0.5;

            aLogicInformation.push({iAngle: iAngle,
                iDist2: iDist2,
                bLeft: bLeft,
                bObstacle: bObstacle,
                bInsufficientPower: bInsufficientPower,
                oPlayer: _aPlayerOpponent[i],
                iScoreDist2: 0,
                iScoreAngle: iAngle,
                iTotScore: 0
            });
        }

        var oPlayerChoosed = this.evaluatePlayers(aLogicInformation, bAllPlayerLeftBall);
        this.prepareCpuForLaunch(oPlayerChoosed, bAllPlayerLeftBall, vTargetPlayer, false);
    };

    this.prepareCpuForLaunch = function (oPlayer, bAllPlayerLeftBall, vTargetPlayer, isGoalKeeper) {
        var vDirPlayerForGoal = new CVector2();
        var iPower = CPU_POWER_PLAYER[_iLevel];

        _iNumOfShot--;

        _oInterface.refreshTurnNumber(_iNumOfShot, false);
        //trace("Numero Tiri CPU "+ m_iNumShot);
        if (oPlayer.isGoalKeeper()) {
            iPower = CPU_POWER_PLAYER[_iLevel] * 0.5;
        }
        if (bAllPlayerLeftBall) {
            if (oPlayer.getY() > _oBall.getY()) {
                vDirPlayerForGoal.set(_oBall.getX(), _oBall.getY() + _oBall.getRadius() * 2 - 5);
            } else {
                vDirPlayerForGoal.set(_oBall.getX(), _oBall.getY() - _oBall.getRadius() * 2 + 5);
            }
            vDirPlayerForGoal.subtract(oPlayer.vPos());
            vDirPlayerForGoal.normalize();
            iPower = CPU_POWER_PLAYER[_iLevel] * 0.8;
        } else {
            //****************************
            // calcolo il raggio con cui la cpu deve tirare
            if (isGoalKeeper) {
                vDirPlayerForGoal.setV(_oBall.vPos());
            } else {
                vDirPlayerForGoal.setV(vTargetPlayer);
            }
            vDirPlayerForGoal.subtract(oPlayer.vPos());
            vDirPlayerForGoal.normalize();
        }
        //****************************
        // lancio il giocatore della cpu
        var vForce = new CVector2();

        vForce.setV(vDirPlayerForGoal);
        vForce.scalarProduct(iPower * HIT_PLAYER_MAX_FORCE);

        oPlayer.addForce(vForce);

        _bActiveFollowBall = true;
        _bPlayerLaunched = true;
        _bUpdatePhysics = true;
    };

    this.evaluatePlayers = function (aLogicInformation, bAllPlayerLeftBall) {
        var iMin;
        var iMax;

        //ordino l'array rispetto la distanza minima

        aLogicInformation = this.sortArrayDecrescending("iDist2", aLogicInformation);
        var oNearestPlayer = aLogicInformation[0].oPlayer;
        //la distanza minima ottiene il valore 1
        aLogicInformation[0].iScoreDist2 = 1;

        iMin = aLogicInformation[0].iDist2;
        iMax = aLogicInformation[aLogicInformation.length - 1].iDist2;

        //calcoliamo lo score per ogni player 
        for (var i = 1; i < aLogicInformation.length - 1; i++) {
            aLogicInformation[i].iScoreDist2 = 1 - ((aLogicInformation[i].iDist2 - iMin) / (iMax - iMin));
        }

        //ordiniamo l'array rispetto l'angolo

        aLogicInformation = this.sortArrayDecrescending("iAngle", aLogicInformation);

        //la distanza minima ottiene il valore 1
        iMax = aLogicInformation[aLogicInformation.length - 1].iAngle;
        aLogicInformation[aLogicInformation.length - 1].iScoreAngle = 1;

        iMin = aLogicInformation[0].iAngle;
        aLogicInformation[0].iScoreAngle = 0;

        //calcoliamo lo score per ogni player 
        for (var i = 1; i < aLogicInformation.length - 1; i++) {
            aLogicInformation[i].iScoreAngle = ((aLogicInformation[i].iAngle - iMin) / (iMax - iMin));
        }

        for (var k = 0; k < aLogicInformation.length; k++) {
            aLogicInformation[k].iTotScore = aLogicInformation[k].iScoreDist2 +
                    aLogicInformation[k].iScoreAngle;

            if (aLogicInformation[k].bObstacle === false) {
                aLogicInformation[k].iTotScore += 1;
            }

            if (aLogicInformation[k].bInsufficientPower === false) {
                aLogicInformation[k].iTotScore += 1;
            }
        }

        aLogicInformation = this.sortArrayDecrescending("iTotScore", aLogicInformation);

        if (bAllPlayerLeftBall) {
            return oNearestPlayer;
        }
        return aLogicInformation[aLogicInformation.length - 1].oPlayer;
    };

    this.sortArrayDecrescending = function (szKey, aArray) {
        var aNewArray = new Array();

        for (var i = 0; i < aArray.length; i++) {
            aNewArray[i] = aArray[i];
        }

        for (var i = 0; i < aNewArray.length - 1; i++) {
            for (var j = i + 1; j < aNewArray.length; j++) {
                if (aNewArray[i][szKey] > aNewArray[j][szKey]) {
                    var oTmp = aNewArray[i];
                    aNewArray[i] = aNewArray[j];
                    aNewArray[j] = oTmp;
                }
            }
        }
        return aNewArray;
    };

    this.collideCircleWithEdges = function (oObject, aEdges) {
        var i;

        var vDir = new CVector2();
        vDir.setV(oObject.vCurForce());
        vDir.normalize();

        var iCurForce = oObject.vCurForce().length();

        var iFactorForce = 2.0;
        var iTimes = Math.floor(iCurForce / iFactorForce);
        var bHit = false;
        var bHitBalls = false;
        var vPos = new CVector2();

        vPos.setV(oObject.vPrevPos());

        vDir.normalize();
        vDir.scalarProduct(iFactorForce);

        var k;
        for (k = 0; k < (iTimes + 1); k++) {
            if (k === iTimes) {
                vDir.normalize();
                vDir.scalarProduct(iCurForce - (iTimes * iFactorForce));
            }
            vPos.addV(vDir);
            if (oObject.isGoalKeeper()) {
                aEdges = _aGoalsKeeperEdges;
                for (i = 0; i < _aGoalsKeeperEdges.length; i++) {
                    bHit = collideEdgeWithCircle(_aGoalsKeeperEdges[i], vPos, oObject.getRadius(), null);
                    if (bHit === true) {
                        vPos.subtract(vDir);
                        break;
                    }
                }

            } else {
                if (oObject.type() === BALL) {
                    aEdges = _aFieldEdgesBall;
                }
                for (i = 0; i < aEdges.length; i++) {
                    bHit = collideEdgeWithCircle(aEdges[i], vPos, oObject.getRadius(), null);
                    if (bHit === true) {
                        vDir.scalarProduct(1.3);
                        vPos.subtract(vDir);
                        break;
                    }
                }

                if (oObject.type() === BALL && !_bRestart) {
                    var iSide;
                    if (oObject.getX() < CANVAS_WIDTH_HALF) {
                        _bGoal = collideEdgeWithCircle(_oEdgeGoalUser, vPos, 3, null);
                        iSide = LEFT_SIDE;
                    } else {
                        _bGoal = collideEdgeWithCircle(_oEdgeGoalOpponent, vPos, 3, null);
                        iSide = RIGHT_SIDE;
                    }
                    if (_bGoal) {
                        this.goal(iSide);
                        return;
                    }
                }

                if (bHit === true) {
                    break;
                }
            }
            oObject.vPos().setV(vPos);

            if (this.collideObjectWithObjects(oObject) === true) {
                return;
            }
        }

        if (bHit === true) {
            var vReflectedDir = reflectVectorV2(oObject.vCurForce(), aEdges[i].getNormal());

            oObject.vPos().setV(vPos);
            oObject.vCurForce().setV(vReflectedDir);

        } else {
            oObject.vPos().addV(oObject.vCurForce());
        }

        oObject.vPos().setV(vPos);
        if (this.collideObjectWithObjects(oObject) === true) {
            return;
        }
    };

    this.upadtePhysics = function (bVal) {
        _bUpdatePhysics = bVal;
    };

    this.collideObjectWithObjects = function (oObject) {
        var tmpDist, minDist = MIN_DIST_COLLISION_DETECT;
        var iPos;
        var aCollisions = new Array();
        for (var i = 0; i < _aCollisionObject.length; i++) {
            if (oObject.getID() !== _aCollisionObject[i].getID()) {
                tmpDist = distanceV2WithoutSQRT(oObject.vPos(), _aCollisionObject[i].vPos());

                if (tmpDist <= oObject.getRadiusQuadro() + _aCollisionObject[i].getRadiusQuadro()) {
                    aCollisions.push({oObject: _aCollisionObject[i], iDist: tmpDist});
                    if (minDist > tmpDist) {
                        minDist = tmpDist;
                        iPos = aCollisions.length - 1;
                    }
                }
            }
        }

        if (aCollisions.length === 0) {
            return;
        }

        var vPos = new CVector2();
        var vRayCollision = new CVector2();
        var vDirInvert = new CVector2();
        vDirInvert.setV(oObject.vCurForce());
        vDirInvert.invert();
        vDirInvert.normalize();

        vRayCollision.setV(oObject.vPos());


        vRayCollision.subtract(aCollisions[iPos].oObject.vPos());
        vRayCollision.normalize();

        vPos.setV(vRayCollision);
        vPos.scalarProduct(oObject.getRadius() * 1.5);

        vPos.addV(aCollisions[iPos].oObject.vPos());

        oObject.vPos().setV(vPos);

        var iAngle = angleBetweenVectors(vDirInvert, vRayCollision);

        var iForceTransfer = iAngle / (HALF_PI);

        var vTmpDir = new CVector2();
        vTmpDir.setV(oObject.vCurForce());
        vTmpDir.normalize();
        var iNewForce = oObject.vCurForce().length();

        oObject.vCurForce().setV(reflectVectorV2(vTmpDir, vRayCollision));

        iNewForce = (iNewForce * K_IMPACT_BALL);
        oObject.vCurForce().normalize();
        oObject.vCurForce().scalarProduct((iNewForce * 0.15));

        this.checkPlayersCollisionSound(oObject, aCollisions[iPos].oObject);

        this.checkPlayersCollisionAnimationDangle(oObject, aCollisions[iPos].oObject);

        this.checkPlayerBallCollision(oObject, aCollisions[iPos].oObject);

        this.checkThereIsAFoul(oObject, aCollisions[iPos].oObject);

        vRayCollision.invert();
        vRayCollision.normalize();
        vRayCollision.scalarProduct(iNewForce * (1 - iForceTransfer) + (iNewForce * 0.10));


        if (aCollisions[iPos].oObject.type() !== LOGIC_COLLISION)
            aCollisions[iPos].oObject.addForce(vRayCollision);

        return true;
    };

    this.checkPlayersCollisionSound = function (oObj1, oObj2) {
        if (oObj1.type() === PLAYERS_OPPONENT && oObj2.type() === PLAYERS_USER ||
                oObj1.type() === PLAYERS_USER && oObj2.type() === PLAYERS_OPPONENT ||
                oObj1.type() === PLAYERS_USER && oObj2.type() === PLAYERS_USER ||
                oObj1.type() === PLAYERS_OPPONENT && oObj2.type() === PLAYERS_OPPONENT) {
            playSound("player_collision", 1, false);
        }
    };

    this.checkThereIsAFoul = function (oObj1, oObj2) {
        if (!_bFirstHitNoOpponent) {
            if (oObj1.type() === PLAYERS_OPPONENT && oObj2.type() === PLAYERS_USER || oObj1.type() === PLAYERS_USER && oObj2.type() === PLAYERS_OPPONENT) {
                this.foul();
            } else {
                _bFirstHitNoOpponent = true;
            }
        }
    };

    this.checkPlayersCollisionAnimationDangle = function (oObj1, oObj2) {
        if (oObj1.type() === PLAYERS_OPPONENT || oObj1.type() === PLAYERS_USER) {
            oObj1.animDangle();
        }
        if (oObj2.type() === PLAYERS_OPPONENT || oObj2.type() === PLAYERS_USER) {
            oObj2.animDangle();
        }
    };

    this.checkPlayerBallCollision = function (oObj1, oObj2) {
        if (oObj1.type() === BALL && oObj2.type() === PLAYERS_USER || oObj1.type() === PLAYERS_USER && oObj2.type() === BALL) {
            this.addScore(TOUCH_BALL_SCORE);
            playSound("kick", 1, false);
        } else if (oObj1.type() === BALL && oObj2.type() === PLAYERS_OPPONENT || oObj1.type() === PLAYERS_OPPONENT && oObj2.type() === BALL) {
            playSound("kick", 1, false);
        }
    };

    this.foul = function () {
        if (_bFinish) {
            return;
        }
        if (!_bFoulCommitted) {
            _bFoulCommitted = true;
            playSound("kick_off", 1, false);
            if (!_bCpuTurn) {
                if ((_iLevelScore + FOUL_SCORE) > -1) {
                    this.addScore(FOUL_SCORE);
                } else {
                    _iLevelScore = 0;
                    this.addScore(0);
                }
                _bCpuTurn = true;
                _oInterface.turnAnim(TEXT_FOUL + " " + TEXT_CPU_TURN);
                _oInterface.refreshTurnTeam(_aOpponentsTeamVs[_iLevel]);
            } else {
                _bCpuTurn = false;
                _oInterface.turnAnim(TEXT_FOUL + " " + TEXT_PLAYER_TURN);
                _oInterface.refreshTurnTeam(_iPlayerTeam);
            }
            _iNumOfShot = NUM_OF_SHOT;
            for (var i = 0; i < NUM_OF_SHOT; i++) {
                _oInterface.refreshTurnNumber(i, true);
            }
        }
    };

    this.addScore = function (iVal) {
        if (_bFinish) {
            return;
        }
        _iLevelScore += iVal;
        _oInterface.refreshScore(_iTotScore + _iLevelScore);
    };

    this.followBall = function () {
        if (!_bActiveFollowBall) {
            return;
        }
        var iNewX = -_oBall.getX() + CANVAS_WIDTH_HALF;

        if (iNewX <= -s_iOffsetX) {
            s_oScrollStage.x = -s_iOffsetX;
            return;
        } else if (iNewX >= s_iOffsetX) {
            s_oScrollStage.x = s_iOffsetX;
            return;
        }

        var fDistX = (iNewX - s_oScrollStage.x) * 0.25;
        s_oScrollStage.x += fDistX;
    };


    this.scrollWorld = function () {
        if (s_oScrollStage.x <= -s_iOffsetX && _iDirScrollWorld === RIGHT_SCROLL_WORLD) {
            s_oScrollStage.x = -s_iOffsetX;
            return;
        } else if (s_oScrollStage.x >= s_iOffsetX && _iDirScrollWorld === LEFT_SCROLL_WORLD) {
            s_oScrollStage.x = s_iOffsetX;
            return;
        }

        if (!_bScrollWorld) {
            if (_iDirScrollWorld === RIGHT_SCROLL_WORLD) {
                if (_fScrollWorldSpeed >= 0) {
                    _fScrollWorldSpeed = 0;
                    return;
                }
                _fScrollWorldSpeed += SMOOTH_SCROLL_OFFSET;
            } else {
                if (_fScrollWorldSpeed <= 0) {
                    _fScrollWorldSpeed = 0;
                    return;
                }
                _fScrollWorldSpeed -= SMOOTH_SCROLL_OFFSET;
            }
        }
        s_oScrollStage.x += _fScrollWorldSpeed;
    };

    this.launchDelayPenality = function (fSecond) {
        if (_bFinish) {
            return;
        }
        if (_fTimePenality > 0) {
            _fTimePenality -= fSecond;
        } else {
            _iNumOfShot = 0;
            _iPlayerIDSelect = -1;
            _oArrow.setVisible(false);
            _bPlayerSelected = false;
            _oArrowSelected.setVisible(false);
            _oArrowSelected.removeTween();
            this.checkTurn();
            _fTimePenality = LAUNCH_PENALITY_SECOND;
        }
    };

    this.update = function () {
        if (_bStartGame) {

            if (!_bPlayerLaunched && !_bCpuTurn) {
                this.scrollWorld();
                
                this.arrowDraw();
                
                this.launchDelayPenality(FPS_TIME_SECONDS);
            } else {
                this.followBall();
            }

            if (!_bFinish) {
                this.matchTime(FPS_TIME_SECONDS);
            }


            if (_bUpdatePhysics) {
                this.objectsPhysics();
                _oBall.rolls();
                this.sortGoalsFront();
            }
        }
    };

    this.sortGoalsFront = function () {
        var oGoal = _oGoal.getGoalPlayerFront();
        if (_oBall.getY() > CANVAS_WIDTH_HALF) {
            oGoal = _oGoal.getGoalEnemyFront();
        }
        for (var i = 0; i < _aCollisionObject.length; i++) {

            this.sortByY(oGoal, _aCollisionObject[i].getObject());
        }

    };

    s_oGame = this;

    TIME_RESET_BALL = oData.time_reset_ball;
    REGULAR_MATCH_TIME = oData.regular_match_time;
    EXTENDED_MATCH_TIME = oData.extend_match_time;
    LAUNCH_PENALITY_SECOND = oData.launch_penality_second;
    SCORE_PLAYER_GOAL = oData.add_score_player_goal;
    SCORE_OPPONENT_GOAL = oData.remove_score_opponent_goal;
    SCORE_WIN = oData.score_win;
    SCORE_TIE = oData.score_tie;
    SCROLL_VELOCITY = oData.scroll_velocity;
    TOUCH_BALL_SCORE = oData.touch_ball_score;
    FOUL_SCORE = oData.foul_score;
    NUM_OF_SHOT = oData.num_of_shot;
    PRECISION_CPU_RATE = oData.precision_cpu_rate;
    CPU_POWER_PLAYER = oData.cpu_power_players;
    NUM_LEVEL_FOR_ADS = oData.num_levels_for_ads;

    this._init();
}

var s_oGame;