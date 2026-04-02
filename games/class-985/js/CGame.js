function CGame(oData) {
    var _bStartGame;
    var _bDisableEvents;
    var _bTurn;
    var _bLaunched;
    var _bPressMove;
    var _bLastShotScored;
    var _bLastShotPerfect;
    var _bScoreBonusActive;
    var _bBasketTopScored;
    var _bBasketBottomScored;
    var _bBallFalling;
    var _bBallTouchingHood;
    var _bScored;
    var _bNewBestScore;

    var _iTotalScore;
    var _iScore;
    var _iBallLimit;
    var _iBonus;
    var _iPlayerLives;

    var _oGameContainer;
    var _oInterface;
    var _oEndPanel;
    var _oHelpPanel;
    var _oHitArea;
    var _oBallStartPosition;
    var _oClickPoint;
    var _oReleasePoint;
    var _oBall;
    var _oBoard;
    var _oBoardHoop;
    var _oStarBonus;
    var _oScoreBonusText;
    var _oNewBestScoreText;
    var _oShake;

    var _vGravity;
    var _vRingEdgeNormal;

    var _bPokiStart;
    
    this._init = function () {
        _bPokiStart = false;
        
        s_oTweenController = new CTweenController();

        _oGameContainer = new createjs.Container();
        s_oStage.addChild(_oGameContainer);
        this.resetVariables();

        var oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));
        oBg.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oGameContainer.addChild(oBg);

        _iBallLimit = BOTTOM_LIMIT - (BALL_SIZE / 2);
        _oBallStartPosition = {x: CANVAS_WIDTH_HALF, y: _iBallLimit};

        _vGravity = new CVector3(0, GRAVITY_Y, 0);  // INIT GRAVITY
        _vGravity.normalize();

        _oBoard = new CBoard(_oGameContainer); // INIT BOARD AND HOOP
        this.initHoop();
        this.initScoreBonusText();
        this.initNewBestScoreText();
        _oShake = new CShake(_oBoardHoop, 500, 7, 20);

        _oBall = new CBall(_oGameContainer);   // INIT BALL

        this.initRingEdgeNormal();
        this.initHitArea();

        _oInterface = new CInterface(_oGameContainer);
        _oInterface.initInterfacesText();
        _oInterface.updatePlayerLives();

        if (s_bFirstTimePlaying === true) {
            _oHelpPanel = new CHelpPanel();
        } else {
            this._onExitHelp();
        }
    };

    this.initRingEdgeNormal = function () {
        _vRingEdgeNormal = new CVector2(0, -1);
        _vRingEdgeNormal.normalize();
    };

    this.initHoop = function () {
        var oData = {   
                images: [s_oSpriteLibrary.getSprite('hoop')],
                framerate: 20,
                frames: {width: 256, height: 284, regX: 256/2, regY: 284/2},
                animations: { idle: [0, 0, "idle"],
                              move: [1, 15, "idle"] }
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oBoardHoop = createSprite(oSpriteSheet, "idle", 256/2, 284/2, 256, 284);        
        _oBoardHoop.scaleX = _oBoardHoop.scaleY = 0.7;
        _oBoardHoop.x = _oBoard.getX();
        _oBoardHoop.y = _oBoard.getY() + BOARD_HOOP_Y_OFFSET;
        _oGameContainer.addChild(_oBoardHoop);
    };
    
    this.moveHoop = function(){
        if ( _oBoardHoop.currentAnimation === "idle" ) {
            _oBoardHoop.gotoAndPlay("move");
        };
    };
    
    this.initNewBestScoreText = function(){
        _oNewBestScoreText = new createjs.Text(TEXT_NEWBESTSCORE, "50px " + PRIMARY_FONT, PRIMARY_FONT_COLOUR);
        _oNewBestScoreText.textAlign = "center";
        _oNewBestScoreText.textBaseline = "alphabetic";
        _oNewBestScoreText.x = CANVAS_WIDTH_HALF;
        _oNewBestScoreText.y = CANVAS_HEIGHT_HALF + 200;

        _oNewBestScoreText.visible = false;
        _oGameContainer.addChild(_oNewBestScoreText);
    };

    this.initScoreBonusText = function () {
        _oScoreBonusText = new createjs.Text("x" + BONUS_MULTIPLIER + " " + TEXT_BONUS + "!", "50px " + PRIMARY_FONT, PRIMARY_FONT_COLOUR);
        _oScoreBonusText.textAlign = "center";
        _oScoreBonusText.textBaseline = "alphabetic";
        _oScoreBonusText.x = CANVAS_WIDTH_HALF;
        _oScoreBonusText.y = CANVAS_HEIGHT_HALF - 350;

        _oScoreBonusText.visible = false;
        _oGameContainer.addChild(_oScoreBonusText);
    };

    this.resetTurnVariables = function () {
        _bLaunched = false;
        _bPressMove = false;
        _bBasketTopScored = false;
        _bBasketBottomScored = false;
        _bLastShotScored = false;
        _bBallFalling = false;
        _bBallTouchingHood = false;
        _bScored = false;        
    };

    this.resetVariables = function () {
        _oEndPanel = null;

        _bStartGame = false;
        _bDisableEvents = false;
        this.resetTurnVariables();
        _bTurn = false;
        _bLastShotPerfect = false;
        _bScoreBonusActive = false;
        _bNewBestScore = false;

        _iScore = 0;
        _iBonus = NO_BONUS;
        _iPlayerLives = PLAYER_LIVES;
        _iTotalScore = s_iTotalScore;

        _oStarBonus = null;

        setVolume("soundtrack", 0.5);
    };

    this.getBallStartPosition = function () {
        return _oBallStartPosition;
    };

    this.initHitArea = function () {
        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oHitArea.alpha = 0.01;

        _oHitArea.on("mousedown", function (evt) { s_oGame.onPressDown(evt); });
        _oHitArea.on("pressmove", function (evt) { s_oGame.onPressMove(evt); });
        _oHitArea.on("pressup", function () { s_oGame.onPressUp(); });

        _oGameContainer.addChild(_oHitArea);
    };

    this.onPressDown = function (evt) {
        if (_bLaunched) {
            return;
        }

        _oClickPoint = {x: s_oStage.mouseX, y: s_oStage.mouseY};
    };

    this.onPressMove = function (evt) {
        if (_bLaunched) {
            return;
        }

        _oReleasePoint = {x: s_oStage.mouseX, y: s_oStage.mouseY};
        _bPressMove = true;
    };

    this.onPressUp = function () {
        if (!_bPressMove || _bLaunched) {
            return;
        }

        this.launchBallOnClick();
        _bPressMove = false;
    };

    this.launchBallOnClick = function () {
        // CHECK IF SWIPE IS LONG ENOUGH FOR THE LAUNCH
        var iDistance = distanceBetweenTwoPoints(_oClickPoint.x, _oClickPoint.y, _oReleasePoint.x, _oReleasePoint.y);        
        if (iDistance < SWIPE_LIMIT_MIN) {
            return;
        };
        
        playSound("swish", 1, false);        
        _oBall.shadowFadeOut();

        var vForce = new CVector3(_oReleasePoint.x - _oClickPoint.x, _oReleasePoint.y - _oClickPoint.y, 1);
        // AVOID LAUNCHING THE BALL BELOW ITS Y
        if (_oReleasePoint.y - _oClickPoint.y > 0) {
            vForce.set(_oReleasePoint.x - _oClickPoint.x, -1, 1);
        }
        vForce.normalize();

        // AVOID THROWING THE BALL HORIZONTALLY ONLY
        if (vForce.getX() > FORCE_X_LIMIT_MAX) {
            vForce.set(FORCE_X_LIMIT_MAX, -1, 1);
        }
        
        if (vForce.getX() < FORCE_X_LIMIT_MIN) {
            vForce.set(FORCE_X_LIMIT_MIN, -1, 1);
        }

        this.launchBall(vForce);
        _oBall.startBallAnimation();

        _oReleasePoint.x = 0;
        _oReleasePoint.y = 0;
        this.setLaunched(true);
    };

    this.launchBall = function (vForce) {
        var vBallCurForce = _oBall.vCurForce();
        var vDirection = new CVector3(vForce.getX(), vForce.getY(), vForce.getZ());
        vDirection.scalarProduct(LAUNCH_POWER_LIMIT_MIN);   // ADD A FORCE MODULE TO MOVE THE BALL
        vBallCurForce.setV(vDirection);                     // SET THE BALL FORCE TO THE VECTOR WE CREATED
    };

    this.setLaunched = function (bValue) {
        _bLaunched = bValue;
    };

    this.unload = function () {
        _oInterface.unload();
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();
        s_oGame = null;
    };

    this.onExit = function () {
        s_oMain.pokiShowCommercial( ()=>{
            setVolume("soundtrack", 1);
            s_oGame.unload();
            s_oMain.gotoMenu();
            $(s_oMain).trigger("end_session");
            $(s_oMain).trigger("show_interlevel_ad");
        });
    };

    this.restart = function () {
        s_oMain.pokiShowCommercial( ()=>{
            setVolume("soundtrack", 0.3);
            $(s_oMain).trigger("restart_level");
            s_oGame.unload();
            s_oMain.gotoGame();
        });
    };

    this._onExitHelp = function () {
        _bStartGame = true;
        this.setTurn(true);
        s_bFirstTimePlaying = false;
        
        s_oGame.setPokiStart(true);
    };

    this.updateScore = function () {
        // UPDATE TOTAL SCORE
        _iTotalScore += _iScore;
        s_iTotalScore = _iTotalScore;
        saveItem("swipebasketball_total_score", s_iTotalScore);

        // UPDATE BEST SCORE
        if (_iScore > s_iBestScore) {
            s_iBestScore = _iScore;
            saveItem("swipebasketball_best_score", s_iBestScore);
        }
    };

    this.addScore = function (iValue, bBonus) {
        var iMultiplier = 1;
        if (_bScoreBonusActive === true) {
            iMultiplier = BONUS_MULTIPLIER;
            PokiSDK.happyTime(1);
        }else {
            PokiSDK.happyTime(0.5);
        }

        this.initScoreText(iValue * iMultiplier, bBonus);
        _iScore += iValue * iMultiplier;
        _oInterface.refreshScoreText(_iScore);
        
        // SHOW A "NEW BEST SCORE" TEXT, IF NEEDED
        if (_iScore > s_iBestScore) {
            this.showNewBestScore();
            s_iBestScore = _iScore;
            saveItem("swipebasketball_best_score", s_iBestScore);
            _oInterface.refreshBestScoreText();
            _bNewBestScore = true;
        }
    };

    this.checkForBoardMovement = function () {
        if (_iScore >= BOARD_HORIZONTAL_MOVEMENT_LIMIT) {
            _oBoard.setBoardHorizontalMovement(true);

            if (_oBoard.isUpdate() === false) {
                _oBoard.resetBoardMovement();
                _oBoard.setUpdate(true);
            }
        }

        if (_iScore >= BOARD_VERTICAL_MOVEMENT_LIMIT) {
            _oBoard.setBoardVerticalMovement(true);
        }
    };

    this.initScoreText = function (iValue, bBonus) {
        var iY;

        if (bBonus === false) {
            iY = _oBoard.getY();
        } else {
            iY = _oBoard.getY() - 100;
        }

        var oScoreText = new createjs.Text("+" + iValue, "40px " + PRIMARY_FONT, PRIMARY_FONT_COLOUR);
        oScoreText.textAlign = "center";
        oScoreText.textBaseline = "alphabetic";
        oScoreText.x = _oBoard.getX();
        oScoreText.y = iY;
        _oGameContainer.addChild(oScoreText);

        createjs.Tween.get(oScoreText)
            .to({y: oScoreText.y - 300, alpha: 0}, 1500, createjs.Ease.quadIn)
            .call(function () {
                createjs.Tween.removeTweens(oScoreText);
                _oGameContainer.removeChild(oScoreText);
            });
    };

    this.gameOver = function () {
        s_oGame.setPokiStart(false);
        
        _bStartGame = false;

        this.updateScore();

        if (_oEndPanel === null) {
            playSound("game_over", 1, false);
            stopSound("soundtrack");

            setTimeout(function () {
                playSound("soundtrack", 0.5, false);
            }, 2000);

            _oEndPanel = new CEndPanel(_iScore);
            _bDisableEvents = true;

            $(s_oMain).trigger("share_event", s_iBestScore);
            $(s_oMain).trigger("save_score", s_iBestScore);
        }
    };

    this.setTurn = function (bValue) {
        _bTurn = bValue;
    };

    this.setNetInFront = function () {
        _oGameContainer.setChildIndex(_oBoardHoop, _oGameContainer.numChildren - 1);
    };

    this.resetNetZIndex = function () {
        _oGameContainer.addChildAt(_oBoardHoop, _oGameContainer.getChildIndex(_oBoard.getBoardContainer()) + 1);
    };

    this.moveBall = function () {
        // IF THE BALL IS ALREADY STOPPED, SKIP
        if (_oBall.isStopped() === true) {
            return;
        }

        var vForce = _oBall.vCurForce();
        vForce.addV(_vGravity);
        _oBall.vPos().addV(vForce);  // MOVE THE BALL WITH ITS FORCE MODULE PLUS GRAVITY

        if (_oBall.getY() < _oBoard.getY() && _bBallFalling === false) {
            this.setNetInFront();
            _bBallFalling = true;
        }
        
        // CHECK FOR COLLISIONS ON THE BASKET BOARD
        if (this.checkPointIsInRectSquaresApprossimate() === true) {
            this.checkIfBallIsInBasket();
            this.checkCollisionWithHoop();
        };
        
        // CHECK FOR COLLISIONS WITH BONUS OR IF THE BALL IS OUT OF THE SCREEN
        this.checkCollisionWithBonus();
        this.checkCollisionWithWalls();
        
        _oBall.updateSpritePosition();
    };

    this.checkCollisionWithHoop = function () {
        // CHECK IF THE BALL IS FALLING DOWN
        if (_bBallFalling === false) {
            return;
        }
        
        var bCollide = false;
        
        if (_oBall.getX() < _oBoard.getX()) { // COMING FROM LEFT
            if (this.checkForBoardRingEdgeCollision(_oBoard.getBoardSideLeftPosition()) === true) {                    
                // IF THERE IS A COLLISION WITH THE LEFT RING EDGE
                bCollide = true;    
            }
        } else {                              // COMING FROM RIGHT
            if (this.checkForBoardRingEdgeCollision(_oBoard.getBoardSideRightPosition()) === true) {                    
                // IF THERE IS A COLLISION WITH THE RIGHT RING EDGE
                bCollide = true;    
            }
        }            

        var aBoardSide = _oBoard.getHoopSideEdges();

        if (_oBall.getX() < _oBoard.getX()) { // COMING FROM LEFT
            var oLeftSide = {p1: _oBoard.getHoopLeftSidePtA(), p2: _oBoard.getHoopLeftSidePtB()};
            if (this.checkIfBallIsCollidingOnHoopSides(oLeftSide) === true) {                    
                // BOUNCE BACK FROM THE HOOP
                this.reflectBallOnBoard(aBoardSide[EDGE_LEFT]);   
                bCollide = true;
            }
        } else {                              // COMING FROM RIGHT
            var RightSide = {p1: _oBoard.getHoopRightSidePtA(), p2: _oBoard.getHoopRightSidePtB()};
            if (this.checkIfBallIsCollidingOnHoopSides(RightSide) === true) {
                // BOUNCE BACK FROM THE HOOP
                this.reflectBallOnBoard(aBoardSide[EDGE_RIGHT]);  
                bCollide = true;
            }
        }
        
        return bCollide;
    };

    this.checkCollisionWithBonus = function () {
        // IF THERE'S NO BONUS, DON'T CHECK FOR COLLISIONS
        if (_oStarBonus === null || _bBallFalling === false) {
            return;
        }
        
        if (this.checkIfBallIsCollidingWithBonus() === true && _oStarBonus.isBonusTaken() === false) {
            // BONUS TAKEN
            playSound("bonus_taken", 1, false);
            this.addScore(STAR_BONUS_POINTS, true);
            _oStarBonus.onBonusTaken();
            _oStarBonus = null;
            return true;
        } else {
            return false;
        }
    };

    this.checkIfBallIsCollidingWithBonus = function () {
        // CHECK IF THE BALL HAS COLLIDED WITH THE BONUS
        if (_oBall.getX() > _oStarBonus.getX() - _oStarBonus.getWidth() &&
            _oBall.getX() < _oStarBonus.getX() + _oStarBonus.getWidth() &&
            _oBall.getY() > _oStarBonus.getY() - _oStarBonus.getHeight() &&
            _oBall.getY() < _oStarBonus.getY() + _oStarBonus.getHeight()) {
            return true;
        // IF THE BALL IS NOT INSIDE THE BOARD'S LIMIT RECTANGLE, RETURN FALSE
        } else {
            return false;
        }
    };

    this.checkIfBallIsInBasket = function () {
        /* WE WILL CHECK IF THE BALL IS IN COLLISION WITH THE BASKET_TOP FIRST,
         * AND THEN WITH THE BASKET_BOTTOM. IF BOTH CONDITIONS ARE TRUE, IN THIS
         * ORDER, THE BALL HAS CORRECTLY FALLEN IN THE BASKET, AND IT'S A POINT.
         */

        // THE BALL HAS NOT COLLIDED WITH THE BASKET YET
        if (_bBasketTopScored === false && _bBasketBottomScored === false) {            
            _bBasketTopScored = this.checkCollisionWithBasket( _oBoard.getBasketTop() );
        }

        // THE BALL HAS COLLIDED WITH THE BASKET_TOP ONLY
        if (_bBasketTopScored === true && _bBasketBottomScored === false) {
            _bBasketBottomScored = this.checkCollisionWithBasket( _oBoard.getBasketBottom() );
        }

        // THE BALL HAS COLLIDED WITH BOTH BASKET_TOP AND BASKET_BOTTOM
        if (_bBasketTopScored === true && _bBasketBottomScored === true && _bScored === false) {
            this.moveHoop();            
            this.onScore();            
            _bScored = true;
        }
    };
    
    this.checkCollisionWithBasket = function (oEdgeModel) {
        var oInfo = collideEdgeWithCircle(oEdgeModel, _oBall.vPos(), _oBall.getRadius());
        
        if (oInfo) { // ON COLLISION FOUND
            return true;
        } else {    // NO COLLISION
            return false;
        }
    };

    this.onScore = function () {        
        if (_bBallTouchingHood === false) {
            _iBonus = BONUS_NO_COLLISIONS;
        } else {
            _iBonus = NO_BONUS;
        }

        playSound("score", 1, false);
        this.addScore(BALL_POINTS * _iBonus, false);

        if (_bBallTouchingHood === false) {
            if (_bLastShotPerfect === false) {
                _bLastShotPerfect = true;
            } else {
                _bScoreBonusActive = true;
            }
        } else {
            _bScoreBonusActive = false;
            _bLastShotPerfect = false;
        }

        _bBasketTopScored = false;
        _bBasketBottomScored = false;
        _bLastShotScored = true;
    };

    this.checkForBoardRingEdgeCollision = function (oRingSide) {
        // CHECK COLLISION WITH BOARD RING EDGES
        if (this.checkDistanceBetweenTwoCircles(_oBall.getX(), _oBall.getY(),
                oRingSide.x, oRingSide.y) < _oBall.getRadiusForCollisionRingEdge()) {

            if (soundPlaying("boing") === false) {
                playSound("boing", 1, false);
            }

            _bBallTouchingHood = true;

            // FIND THE POINT BETWEEN THE BALL AND THE RING
            var vRingSide = new CVector2();
            vRingSide.set(oRingSide.x, oRingSide.y);
            
            var vNewBallPosition = new CVector2( _oBall.getX(), _oBall.getY());
            vNewBallPosition.subtractV(vRingSide);
            vNewBallPosition.normalize();
            
            vNewBallPosition.scalarProduct((BOARD_SIDES_RADIUS + _oBall.getRadiusForCollisionRingEdge()) * 1.2);
            vNewBallPosition.addV(vRingSide);
            
            _oShake.updateObject(_oBoardHoop);
            _oShake._tremble();
            
            // MAKE THE BALL BOUNCE
            this.bounceBallOnRingEdge(vNewBallPosition, vRingSide);
            return true;
        } else {
            // NO COLLISION FOUND
            return false;
        }
    };

    this.bounceBallOnRingEdge = function (vNewPosition, vRingSide) {
        var vNewDirection = new CVector2( _oBall.getX(), _oBall.getY() );
        vNewDirection.subtractV(vRingSide);
        vNewDirection.normalize();
        vNewDirection.scalarProduct( _oBall.vCurForce().length() );
        
        _oBall.setPosition( vNewPosition.getX(), vNewPosition.getY(), _oBall.getZ() );
        
        if ( vNewDirection.length() > BALL_FORCE_MINIMUM_LIMIT) {
            vNewDirection.scalarProduct(DAMPING_VARIABLE);
        };
        _oBall.setForce(vNewDirection.getX(), vNewDirection.getY());
    };

    this.checkIfBallIsCollidingOnHoopSides = function (oSide) {        
        if (circleDistFromLineSeg(_oBall.getX(), _oBall.getY(), oSide) < _oBall.getRadiusWithTolerance()) {
            // IF THE BALL IS TOUCHING THE SIDE, RETURN TRUE
            return true;        
        } else {
            // IF THERE'S NO COLLISION, RETURN FALSE
            return false;
        }
    };

    this.reflectBallOnBoard = function (oEdgeModel) {
        // CHECK FOR COLLISIONS
        var oInfo = collideEdgeWithCircle(oEdgeModel, _oBall.vPos(), _oBall.getRadius());
        
        // IF THERE'S A COLLISION WITH A SIDE
        if (oInfo) {    
            this.bounceBallOnHoopSideEdge(oInfo, oEdgeModel);
            _bBallTouchingHood = true;
            this.moveHoop();
            return true;
        }
        // IF THERE'S NO COLLISION
        return false;  
    };

    this.checkDistanceBetweenTwoCircles = function (iCircle1X, iCircle1Y, iCircle2X, iCircle2Y) {
        var a = iCircle1X - iCircle2X;
        var b = iCircle1Y - iCircle2Y;
        var iDistance = Math.sqrt(a * a + b * b);
        return iDistance;
    };

    this.checkPointIsInRectSquaresApprossimate = function () {
        // IF THE BALL IS INSIDE THE BOARD'S LIMIT RECTANGLE, RETURN TRUE
        if (_oBall.getX() > _oBoard.getLimitLeft() &&
            _oBall.getX() < _oBoard.getLimitRight() &&
            _oBall.getY() > _oBoard.getLimitTop() &&
            _oBall.getY() < _oBoard.getLimitBottom()) {
            return true;
        // IF THE BALL IS NOT INSIDE THE BOARD'S LIMIT RECTANGLE, RETURN FALSE
        } else {
            return false;
        }
    };

    this.getLives = function(){
        return _iPlayerLives;
    };

    this.checkCollisionWithWalls = function () {
        var bCollide = false;
        
        if ( _oBall.getX() > CANVAS_WIDTH - BALL_SIZE/2) {
            _oBall.fadeOut();
        } else if (_oBall.getX() < 0 + BALL_SIZE/2) {
            _oBall.fadeOut();
        };
        
        // IF THE BALL GOES OUT OF THE SCREEN
        if ( _oBall.getX() > CANVAS_WIDTH) {
            bCollide = true;
            
            _oBall.stopBall();
            this.resetTurn();
        // IF THE BALL GOES OUT OF THE SCREEN
        } else if (_oBall.getX() < 0) {
            bCollide = true;
            _oBall.fadeOut();
            _oBall.stopBall();
            this.resetTurn();
        };
        
        return bCollide;
    };

    this.bounceBallOnHoopSideEdge = function (oInfo, oEdgeModel) {
        var vNewPosition = new CVector2();
        vNewPosition.setV(oEdgeModel.getNormal());  // CREATE THE EDGE NORMAL, CHECK FOR ALL THE DISTANCE TO FIND THE COLLISION POINT
        vNewPosition.scalarProduct(_oBall.getRadiusWithTolerance());
        vNewPosition.addV(oInfo.closest_point);
        
        var vNewPos = new CVector3(vNewPosition.getX(), vNewPosition.getY(), _oBall.getZ());
        _oBall.setPos(vNewPos);
        
        var vNewForce = new CVector2( _oBall.vCurForce().getX(), _oBall.vCurForce().getY() );
        reflectVectorV2(vNewForce, oEdgeModel.getNormal());

        vNewForce.scalarProduct(DAMPING_VARIABLE/2);
        _oBall.setForce(vNewForce.getX(), vNewForce.getY());
    };

    this.updateBoardHoopPosition = function () {
        if (_oBoardHoop.x !== _oBoard.getX()) {
            _oBoardHoop.x = _oBoard.getX();
        }

        if (_oBoardHoop.y !== _oBoard.getY() + BOARD_HOOP_Y_OFFSET) {
            _oBoardHoop.y = _oBoard.getY() + BOARD_HOOP_Y_OFFSET;
        }
    };

    this.setStartGame = function (bValue) {
        _bStartGame = bValue;
        
        s_oGame.setPokiStart(_bStartGame);
    };

    this.setNextTurn = function () {
        _bTurn = true;
        this.resetTurnVariables();
        this.checkForBoardMovement();
        this.setNextStartPosition();
        this.resetNetZIndex();
        this.initNewStarBonus();
    };
    
    this.showNewBestScore = function(){
        if (_bNewBestScore === true || s_bFirstTimePlaying === true) {
            return;
        };
        
        var iScaleMax = 1.2;
        _oNewBestScoreText.visible = true;
        
        if (soundPlaying("newbestscore") === false) {
            playSound("newbestscore", 1, false);
        }

        new createjs.Tween.get(_oNewBestScoreText)
            .to({alpha: 1}, 500, createjs.Ease.quadIn)
            .call(function () {
                new createjs.Tween.get(_oNewBestScoreText, {loop: true})
                    .to({scaleX: iScaleMax, scaleY: iScaleMax}, 1000, createjs.Ease.quadOut)
                    .to({scaleX: 1, scaleY: 1}, 1000, createjs.Ease.quadIn);
                new createjs.Tween.get(_oNewBestScoreText)
                    .wait(2000)
                    .to({alpha: 0}, 1000, createjs.Ease.quadOut)
                    .call(function(){
                            _oNewBestScoreText.visible = false;
                    });
            });
    };

    this.showScoreBonus = function () {
        var iScaleMax = 1.2;
        _oScoreBonusText.visible = true;
        playSound("bonus", 1, false);

        new createjs.Tween.get(_oScoreBonusText)
            .to({alpha: 1}, 250, createjs.Ease.quadIn)
            .call(function () {
                new createjs.Tween.get(_oScoreBonusText, {loop: true})
                    .to({scaleX: iScaleMax, scaleY: iScaleMax}, 1000, createjs.Ease.quadOut)
                    .to({scaleX: 1, scaleY: 1}, 1000, createjs.Ease.quadIn)
            });
    };

    this.hideScoreBonus = function () {
        _oScoreBonusText.visible = false;
        createjs.Tween.removeTweens(_oScoreBonusText);
    };

    this.initNewStarBonus = function () {
        if (_oStarBonus !== null) {
            return;
        }

        // TRY TO CREATE A NEW BONUS, IF THE RANDOM OCCURRENCY IS SATISFIED
        var iRandomOccurrency = Math.floor(Math.random() * 100);
        if (iRandomOccurrency > RANDOM_BONUS_OCCURRENCY) {
            return;
        }

        var iIndex = _oGameContainer.getChildIndex( _oBall.getContainer() );
        _oStarBonus = new CBonus(CANVAS_WIDTH_HALF, CANVAS_HEIGHT_HALF - 200, _oGameContainer, iIndex);
    };

    this.setNextStartPosition = function () {
        // IF THE SCORE IS AT LEAST THIS LIMIT, THE BALL WILL START IN RANDOM POSITIONS
        if (_iScore < RANDOM_BALL_START_LIMIT) {
            _oBallStartPosition.x = CANVAS_WIDTH_HALF;
        } else {
            _oBallStartPosition.x = Math.random() * (CANVAS_WIDTH - 100 - 100) + 100;
        }

        _oBall.resetPosition(_oBallStartPosition.x, _iBallLimit, 0);
    };

    this.resetTurn = function () {
        if (_bScoreBonusActive === false) {
            this.hideScoreBonus();
        } else {
            this.showScoreBonus();
        }

        // IF THE PLAYER SCORED THE LAST SHOT, THERE'S ANOTHER TURN
        if (_bLastShotScored === true) {
            this.setNextTurn();
            _oBall.setBonus(_bScoreBonusActive);
        // IF THE PLAYER FAILED THE SHOT, IT'S GAME OVER
        } else {
            this.subtractPlayerLives();
            return;
        }
    };

    this.subtractPlayerLives = function () {
        // RESET THE SCORE BONUS
        _bScoreBonusActive = false;
        _bLastShotScored = false;
        _bLastShotPerfect = false;
        _oBall.setBonus(false);
        this.hideScoreBonus();

        // SUBTRACT LIFE AND UPDATE INTERFACE
        playSound("malus", 1, false);
        _iPlayerLives--;
        _oInterface.removeLife();

        // CHECK IF THE PLAYER HAS MORE LIVES LEFT
        if (_iPlayerLives > 0) {
            this.setNextTurn();
        // IF NO LIFE IS LEFT, IT'S GAMEOVER
        } else {
            _oBoard.setUpdate(false);
            this.gameOver();
        }
    };
    
    this.checkForBallFadeOut = function(){
        if (_oBall.isStopped() === true) {
            return;
        }
        
        _oBall.fadeOut();
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
        _oBoard.update();
        this.updateBoardHoopPosition();

        // LOOP FOR N TIMES IN EACH FPS        
        for (var i = 0; i < PHYSICS_ITERATIONS; i++) {
            if (_bStartGame === false || _bTurn === false || _bLaunched === false) {
                return;
            }

            // UPDATE BALL MOVEMENTS WHEN THE PLAYER HAS LAUNCHED AND CHECK FOR COLLISIONS
            this.moveBall();

            // ON BOTTOM WALL COLLISION, STOP THE BALL AND CHECK FOR NEXT TURN
            if (_oBall.getY() > _iBallLimit) {
                _oBall.stopBall();
                this.resetTurn();
                return;
            }

            // ON BOTTOM WALL COLLISION, STOP THE BALL AND CHECK FOR NEXT TURN
            if (_bBallFalling === true && _oBall.getY() > BALL_LIMIT_FADEOUT) {
                this.checkForBallFadeOut();
            }
        }
    };

    s_oGame = this;

    BALL_POINTS = oData.ball_points;
    BONUS_MULTIPLIER = oData.bonus_multiplier;
    STAR_BONUS_POINTS = oData.star_bonus_points;
    BONUS_NO_COLLISIONS = oData.bonus_no_collision;
    RANDOM_BONUS_OCCURRENCY = oData.random_bonus_occurrency;
    RANDOM_BALL_START_LIMIT = oData.random_ball_start_limit;
    BOARD_HORIZONTAL_MOVEMENT_LIMIT = oData.board_horizontal_movement_limit;
    BOARD_VERTICAL_MOVEMENT_LIMIT = oData.board_vertical_movement_limit;
    PLAYER_LIVES = oData.player_lives;

    this._init();
}

var s_oGame;
var s_oTweenController;