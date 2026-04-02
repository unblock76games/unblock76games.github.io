function CGame(iPlayers, iPlayerColour, iMode, aPlayersColor) {
    var _iPlayers = iPlayers;               // HOW MANY PLAYERS WILL BE IN THIS MATCH (INCLUDING THE HUMAN PLAYER)
    var _iPlayerColour = iPlayerColour;     // WHAT COLOR THE PLAYER HAS CHOSEN   
    var _iStartingPlayer;
    var _iPlayerTurn;
    var _iMode;
    var _bStartGame;
    var _bTurnReady;
    var _bSpecialSquareActive;
    var _oHelpPanel;
    var _oInterface;
    var _oEndPanel;
    var _oMsgPanel;
    var _oBg;
    var _oGameLogo;
    var _oCallbackSpecialSquare;
    var _oCageBackContainer;
    var _oCageFrontContainer;
    var _oSquaresContainer;
    var _oPlayersContainer;
    var _oPlayersShadowsContainer;
    var _oPlayersArrowContainer;
    var _oSquares;
    var _oPlayersInterface;
    var _oDiceLaunch;
    var _oPuff;
    var _aPlayers;              // Array containing the players
    var _aNestPlayer = [];      // Array with the players on the "house square"
    var _aNestEgg = [];         // Array with the eggs used on the "house square" to display players
    var _iDiceResult;
    var _iTurn;
    var _iDiceResult1;
    var _iDiceResult2;
    var _iMazeTimer;
    var _iLogoTimer;
    var _iSpecialSquareTimer;

    var _bPokiStart;

    this._init = function (iPlayers, iPlayerColour, iMode, aPlayersColor) {
        _bPokiStart = false;
        
        $(s_oMain).trigger("start_session");
        _iStartingPlayer = 0;
        _iMode = iMode;
        this.resetVariables();
        
        _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));
        _oBg.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        s_oStage.addChild(_oBg);

        _oGameLogo = createBitmap(s_oSpriteLibrary.getSprite('logo_game'));
        _oGameLogo.regX = 158;
        _oGameLogo.regY = 70;
        _oGameLogo.x = CANVAS_WIDTH_HALF - 10;
        _oGameLogo.y = CANVAS_HEIGHT_HALF - 5;
        s_oStage.addChild(_oGameLogo);

        _oSquaresContainer = new createjs.Container;
        s_oStage.addChild(_oSquaresContainer);
        
        _oCageBackContainer = new createjs.Container;
        _oCageFrontContainer = new createjs.Container;
        s_oStage.addChild(_oCageBackContainer);

        _oSquares = new CSquares(_oCageBackContainer, _oCageFrontContainer, _oSquaresContainer);
        
        _oPlayersShadowsContainer = new createjs.Container;
        s_oStage.addChild(_oPlayersShadowsContainer);
        
        _oPlayersContainer = new createjs.Container;
        s_oStage.addChild(_oPlayersContainer);

        _oPlayersArrowContainer = new createjs.Container;
        s_oStage.addChild(_oPlayersArrowContainer);

        // CREATE THE PLAYERS
        _aPlayers = new Array();
        if (_iMode === HUMAN_VS_CPU) {
            var aRandomColors = [0,1,2,3,4,5];
            shuffle(aRandomColors);
            
            /////DELETE PLAYER COLOR FROM ARRAY
            var iIndexToDelete = aRandomColors.indexOf(_iPlayerColour);
            aRandomColors.splice(iIndexToDelete,1);
            
            _iPlayerTurn = Math.floor(Math.random()*_iPlayers);

            aRandomColors.splice(_iPlayerTurn,0, _iPlayerColour);

            // CREATE THE PLAYERS
            var aPlayersColor = new Array();
            for (var i = 0; i < _iPlayers; i++) {
                _aPlayers.push(new CPlayers(i, _oPlayersContainer, _oPlayersShadowsContainer, _oPlayersArrowContainer, aRandomColors[i]));
                aPlayersColor.push(aRandomColors[i]);
            };
        } else {
            for (var i = 0; i < _iPlayers; i++) {
                _aPlayers.push(new CPlayers(i, _oPlayersContainer, _oPlayersShadowsContainer, _oPlayersArrowContainer, aPlayersColor[i]));
            };
        }

        s_oStage.addChild(_oCageFrontContainer);

        this.createPuff();              // Create a "puff" effect to be used later
        
        _oDiceLaunch = new CDices();
        _oPlayersInterface = new CPlayersInterface(aPlayersColor);
        _oInterface = new CInterface(_oPlayersInterface);
        
        _oHelpPanel = new CHelpPanel();
        
        _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
        _oEndPanel.addEventListener(ON_BACK_MENU,this.onExit,this);
        _oEndPanel.addEventListener(ON_RESTART,this.restartGame,this);
        _oEndPanel.addEventListener(ON_CHECK,this.checkBoard,this);

        setVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME);
        
        
        
    };
    
    this.resetVariables = function(){
        _iMazeTimer = 0;
        _iLogoTimer = 0;
        
        _iTurn = _iStartingPlayer; 
        if(_iStartingPlayer === _iPlayerTurn){
            s_oGame.setPokiStart(true);
        }
        
        _bStartGame = false;
        _bTurnReady = false;
        _bSpecialSquareActive = false;

    };
    
    this.createPuff = function() {
        var oData = {
                images: [s_oSpriteLibrary.getSprite("puff")],
                framerate: 30,
                // width, height & registration point of each sprite
                frames: {width: 104, height: 110, regX: 52, regY: 55},
                animations: { idle: [ 0, 20]}
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oPuff = createSprite(oSpriteSheet, 0, 52, 55, 104, 1110);
        _oPuff.x = 0;
        _oPuff.y = 0;
        _oPuff.visible = false;
        _oPuff.on("animationend", function() { _oPuff.visible = false; });
        _oPlayersContainer.addChild(_oPuff);
    };

    this._unload = function () {
        _bStartGame = false;

        _oEndPanel.unload();
        
        _oSquares.unload();
        _oDiceLaunch.unload();
        _oInterface.unload();
        s_oStage.removeAllChildren();
        createjs.Tween.removeAllTweens();

        if (s_bMobile === false) {
            document.onkeydown = null;
            document.onkeyup = null;
        }
    };

    this.onExit = function () {
        s_oGame.setPokiStart(false);
        s_oMain.pokiShowCommercial( ()=>{
            s_oGame._unload();
            $(s_oMain).trigger("show_interlevel_ad");
            $(s_oMain).trigger("end_session");
            setVolume("soundtrack", 1);
            s_oMain.gotoMenu();
        });
    };

    this._onExitHelp = function () {
        _bStartGame = true;
        _bTurnReady = true;
        
        if ( (_iMode === HUMAN_VS_CPU && _iPlayerTurn === 0) ||  _iMode === HUMAN_VS_HUMAN) {
            s_oGame.setPokiStart(true);
        }
        
        //s_oGame.setPokiStart(true);
    };

    this.pause = function () {
        _bStartGame = false;
        _bTurnReady = false;
    };

    this.unpause = function () {
        _bStartGame = true;
        _bTurnReady = true;
    };

    this.getDiceResult1 = function(value) {
        _iDiceResult1 = value;
    };

    this.getDiceResult2 = function(value) {
        _iDiceResult2 = value;
    };

    this.movePlayer = function(iResult) {
        _iDiceResult = iResult;
        _aPlayers[_iTurn].setArrowVisible(false);
        this.setPlayerPos(_iTurn);
    };

    this.setPlayerPos = function(iPlayerN) {
        this.playerAdvance(iPlayerN, _iDiceResult);
    };

    this.nestExitAnimation = function(iPlayerN) {
        s_oGame.puffAnimation(BOARD_SQUARES[HOUSE_SQUARE][0], BOARD_SQUARES[HOUSE_SQUARE][1]);
        
        var iColor = _aPlayers[iPlayerN].getColor();
        
        new createjs.Tween.get( _aPlayers[iPlayerN].getSprite() )
                .to({ alpha: 1},150, createjs.Ease.quadIn);
        new createjs.Tween.get( _aPlayers[iPlayerN].getShadow() )
                .to({ alpha: 1},150, createjs.Ease.quadIn);
        
        _oPlayersContainer.removeChild(_aNestPlayer[iColor]);
        _oPlayersContainer.removeChild(_aNestEgg[iColor]);
        _aNestPlayer[iColor] = null;
        _aNestEgg[iColor] = null;
    };

    this.nestEnterAnimation = function(iPlayerN) {
        playSound("sleeping",1,0);

        new createjs.Tween.get( _aPlayers[iPlayerN].getSprite() )
                .to({ alpha: 0},150, createjs.Ease.quadIn);
        new createjs.Tween.get( _aPlayers[iPlayerN].getShadow() )
                .to({ alpha: 0},150, createjs.Ease.quadIn);
        
        var iColor = _aPlayers[iPlayerN].getColor();
        
        var oSpriteName = "nest_"+iColor;
        var oData = {
                images: [s_oSpriteLibrary.getSprite(oSpriteName)],
                framerate: 30,
                frames: {width: 56, height: 68, regX: 28, regY: 34},
                animations: { idle: [0, 39, "idle"]}
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _aNestPlayer[iColor] = createSprite(oSpriteSheet, 0, 28, 34, 56, 68);
        _aNestPlayer[iColor].x = BOARD_SQUARES[HOUSE_SQUARE][0] - 2;
        _aNestPlayer[iColor].y = BOARD_SQUARES[HOUSE_SQUARE][1] - 20;
        _oPlayersContainer.addChild(_aNestPlayer[iColor]);
    };

    this.nestEggs = function(iPlayerN){
        var iEggsX = [-30, -20, -5, 5, 15, 22];
        var iEggsY = [0, 12, 15, 14, 10, -5];
        
        var iColor = _aPlayers[iPlayerN].getColor();
        
        var oSpriteName = "eggs";
        var oData = {
                images: [s_oSpriteLibrary.getSprite(oSpriteName)],
                framerate: 30,
                frames: {width: 8, height: 10, regX: 4, regY: 5}
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _aNestEgg[iColor] = createSprite(oSpriteSheet, 0, 4, 5, 8, 10);
        _aNestEgg[iColor].x = BOARD_SQUARES[HOUSE_SQUARE][0] + iEggsX[iPlayerN];
        _aNestEgg[iColor].y = BOARD_SQUARES[HOUSE_SQUARE][1] + iEggsY[iPlayerN];
        _aNestEgg[iColor].alpha = 0;
        _aNestEgg[iColor].gotoAndStop(iColor);
        _oPlayersContainer.addChild(_aNestEgg[iColor]);
        
        new createjs.Tween.get(_aNestEgg[iColor])
                .to({ alpha: 1},300, createjs.Ease.quadOut);
    };

    this.arrangeSquarePlayers = function(iPlayer, iSquare, iPlayersInSquare) {
        var iOffsetFixed = 5;
        var iOffset = 0;
        
        if (iPlayersInSquare%2 === 0) {
            iOffset = iOffsetFixed * (Math.floor(iPlayersInSquare/2));
        } else {
            iOffset = -1 * iOffsetFixed * (Math.floor(iPlayersInSquare/2));
        }

        new createjs.Tween.get(_aPlayers[iPlayer].getSprite()).to({
            x: this.getBoardSquareX( iSquare ) + iOffset,
            y: this.getBoardSquareY( iSquare ) + iOffset
            },150);
        new createjs.Tween.get(_aPlayers[iPlayer].getShadow()).to({
            x: this.getBoardSquareX( iSquare ) + iOffset,
            y: this.getBoardSquareY( iSquare ) + iOffset
            },150);
            
        this.arrangePlayerZ();
    };
    
    this.checkForAnotherPlayer = function(iSquare, iPlayerN) {
        var iPlayersInTheSameSquare = 0;
        
        for (var i = 0; i < _aPlayers.length; i++) {
            var iPosition = _aPlayers[i].getPosition();
            
            if ( iPosition === iSquare) {
                iPlayersInTheSameSquare += 1;
            };
        }
    
        // If there's more then one player in the square, arrange their positions for a better view
        if (iPlayersInTheSameSquare > 1) {
            s_oGame.arrangeSquarePlayers(iPlayerN, iSquare, iPlayersInTheSameSquare);
        } else {
            s_oSquares.setSquareOccupied(iSquare, false);
        };
    };

    this.gotoPrison = function(){
        playSound("cage_impact",1,0);
        s_oSquares.startCageAnimation();
    };
    
    this.exitfromPrison = function(iPlayerFree, iPlayerN){
        s_oSquares.reverseCageAnimation();
        
        new createjs.Tween.get(_aPlayers[iPlayerFree])
            .to({ x: _aPlayers[iPlayerFree].x - 40, y: _aPlayers[iPlayerFree].y + 20}, 100);
              
        s_oGame.gotoPrison(iPlayerN);
    };

    this.squareGooseOrBridge = function(iPlayerN) {
        var iSquare = _aPlayers[iPlayerN].getPosition();
        _iDiceResult--;         // TO MATCH THE GRAPHIC AND LOGIC POSITION
        
        playSound("bonus",1,0);
        if (iSquare === BRIDGE_SQUARE) { 
            s_oSquares.bridgeAnimation(_iDiceResult);
            s_oGame.msgBox(TEXT_SQUARE_BRIDGE); 
        } else {
            s_oGame.msgBox(TEXT_SQUARE_GOOSE); 
        };
        s_oGame.setPlayerPos(iPlayerN);
    };
    
    this.squareHouse = function(iPlayerN) {
        playSound("malus",1,0);
        s_oGame.puffAnimation(BOARD_SQUARES[HOUSE_SQUARE][0], BOARD_SQUARES[HOUSE_SQUARE][1]);
        s_oGame.nestEggs(iPlayerN);
        s_oGame.nestEnterAnimation(iPlayerN);
        s_oGame.msgBox(TEXT_SQUARE_HOUSE); 
        _aPlayers[iPlayerN].setPenality(HOUSE_PENALITIES);
        s_oGame.changePlayerTurn();
    };
    
    this.squareWellOrPrison = function(iPlayerN) {
        var iSquare = _aPlayers[iPlayerN].getPosition();
        
        playSound("malus",1,0);
        if (iSquare === WELL_SQUARE) {
            s_oGame.functionWellOrPrison(iSquare, iPlayerN, TEXT_SQUARE_WELL);
            s_oGame.changePlayerTurn();
        } else {
            s_oGame.functionWellOrPrison(iSquare, iPlayerN, TEXT_SQUARE_PRISON);
        };
    };
    
    this.squareMaze = function(iPlayerN) {
        playSound("malus",1,0);
        playSound("maze_hit",1,0);
        s_oSquares.mazeAnimation();
        s_oGame.msgBox(TEXT_SQUARE_MAZE);
        s_oGame.playerBack(iPlayerN, 42-39);
    };
    
    this.squareSkull = function(iPlayerN) {
        playSound("malus",1,0);
        playSound("ghost",1,0);
        s_oSquares.ghostAnimation();
        s_oGame.msgBox(TEXT_SQUARE_SKULL);
        s_oGame.playerBack(iPlayerN, 58-1);
    };

    this.checkForSpecialSquares = function(iPlayerN) { 
        var iSquare = _aPlayers[iPlayerN].getPosition();
        
        this.checkForAnotherPlayer(iSquare, iPlayerN);

        _bSpecialSquareActive = true;
        _iSpecialSquareTimer = 0;
        
        // GOOSE/BRIDGE: MOVE AGAIN OF THE SAME RESULT;
        if (ifArrayContainsValue(REPEAT_SQUARES, iSquare) === true) {
            _oCallbackSpecialSquare = {function:this.squareGooseOrBridge,param:iPlayerN};
        // HOUSE, STAY IN THIS SQUARE FOR 3 TURNS
        } else if (iSquare === HOUSE_SQUARE) {
            _oCallbackSpecialSquare = {function:this.squareHouse,param:iPlayerN};
        // WELL/PRISON: STAY IN THIS SQUARE UNTIL SOMEONE WILL STOP AT THIS SQUARE
        } else if (iSquare === WELL_SQUARE || iSquare === PRISON_SQUARE) {
            _oCallbackSpecialSquare = {function:this.squareWellOrPrison,param:iPlayerN};
        // MAZE: GO BACK TO SQUARE 39
        } else if (iSquare === MAZE_SQUARE) {
            _oCallbackSpecialSquare = {function:this.squareMaze,param:iPlayerN};
        // SKULL: GO BACK TO SQUARE 1
        } else if (iSquare === SKULL_SQUARE) {
            _oCallbackSpecialSquare = {function:this.squareSkull,param:iPlayerN};
        // END OF THE BOARD: GAME OVER
        } else if (iSquare === END_SQUARE) {
            _oCallbackSpecialSquare = {function:this.onWin,param:iPlayerN};
        // IF THE SQUARE IS NOT A SPECIAL ONE, CHANGE TURN
        } else {
            _oCallbackSpecialSquare = {function:this.changeTurn,param:true};
        }; 
    };
    
    this.endTimeoutSpecialSquare = function(){
        var oFunctionToCall = _oCallbackSpecialSquare.function;
        oFunctionToCall(_oCallbackSpecialSquare.param);
        _bSpecialSquareActive = false;
    };
    
    this.changeTurn = function() {
        _iTurn++;
        s_oDices.fadeOutTween();
        
        if (_iTurn > _iPlayers-1) {
            _iTurn = 0;
            
            
        };
        
        
        if (_iMode === HUMAN_VS_CPU ) {
            if(!_iPlayerTurn === _iTurn){
                s_oGame.setPokiStart(false);
            }
        } 
        
       
        s_oGame.changePlayerTurn();     
    };
    
    this.stepSounds = function(iPlayerN){
        var _aGrassSquares = [6,10,15,19,24,28,33,37,43,46,51,55,60];   // All the squares with grass (used to play the correct sound)

        if (ifArrayContainsValue(_aGrassSquares, _aPlayers[iPlayerN].getPosition()) === true) {
            playSound("step_grass",1,0);
        } else if (_aPlayers[iPlayerN].getPosition() === 7) {
            playSound("step_wood",1,0);
        } else {
            playSound("step_land",1,0);
        };
    };
    
    // WHEN THE PLAYER ARRIVES IN THE CORRECT SQUARE
    this.playerArrived = function(iPlayerN){
        _iDiceResult++;                            // TO MATCH THE DICE RESULT (FOR NEXT SQUARES)
        _aPlayers[iPlayerN].decreasePosition();    // TO MATCH GRAPHIC AND LOGICAL POSITION OF THE PLAYER
        
        this.checkForSpecialSquares(iPlayerN);
    };
    
    this.playerBounceTween = function(iPlayerN, iYvar){
        new createjs.Tween.get(_aPlayers[iPlayerN].getSprite())
            .to({ y: s_oGame.getBoardSquareY( _aPlayers[iPlayerN].getPosition() ) - iYvar},150, createjs.Ease.quadIn)
            .to({ y: s_oGame.getBoardSquareY( _aPlayers[iPlayerN].getPosition() )},150, createjs.Ease.quadIn).call( function() {
                s_oGame.stepSounds(iPlayerN); }); 
    };
    
    this.playerAdvance = function(iPlayerN, iStepsCounter) {
        _aPlayers[iPlayerN].increasePosition();
        
        if (iStepsCounter === 0) {
            s_oGame.playerArrived(iPlayerN);
            return;
        };
        
        if (iStepsCounter > 0) {
            s_oGame.checkToFlip(iPlayerN);

            // "Bounce" effect (according to player's position)
            if ( _aPlayers[iPlayerN].getPosition() >= 0 && _aPlayers[iPlayerN].getPosition() < 25) {
                this.playerBounceTween(iPlayerN, 20); };
            if ( _aPlayers[iPlayerN].getPosition() >= 25 && _aPlayers[iPlayerN].getPosition() < 37) {
                this.playerBounceTween(iPlayerN, 40); };
            if ( _aPlayers[iPlayerN].getPosition() >= 37 && _aPlayers[iPlayerN].getPosition() < 57) {
                this.playerBounceTween(iPlayerN, 20); };
            if ( _aPlayers[iPlayerN].getPosition() >= 57) {
                this.playerBounceTween(iPlayerN, 40); };

            // Shadow "Bounce" effect
            new createjs.Tween.get(_aPlayers[iPlayerN].getShadow())
                .to({ alpha: 0.5},150, createjs.Ease.quadIn)
                .to({ alpha: 1},150, createjs.Ease.quadIn);

            // Movement to the next square
            new createjs.Tween.get(_aPlayers[iPlayerN].getSprite()).to({
                x: s_oGame.getBoardSquareX( _aPlayers[iPlayerN].getPosition() ),
                y: s_oGame.getBoardSquareY( _aPlayers[iPlayerN].getPosition() )
                },300, createjs.Ease.quadIn).call( function() {
                    // ALWAYS RESPECT PLAYERS' Z POSITIONS
                    s_oGame.arrangePlayerZ();
                    
                    iStepsCounter--;
                    
                    // IF THE PLAYER ARRIVES PRECISELY AT THE END OF THE BOARD IS GAME OVER
                    if (_aPlayers[iPlayerN].getPosition() === LAST_SQUARE && iStepsCounter === 0) {
                        s_oGame.onWin(iPlayerN);
                    };
                    
                    if (_aPlayers[iPlayerN].getPosition() >= LAST_SQUARE) {
                        // IF THE PLAYER ARRIVES AT THE END OF THE MAZE WITH POINTS TO SPEND, GO BACK
                        s_oGame.playerBack(iPlayerN, iStepsCounter); 
                    } else {
                        s_oGame.playerAdvance(iPlayerN, iStepsCounter); 
                    };
                });
            new createjs.Tween.get(_aPlayers[iPlayerN].getShadow()).to({
                x: s_oGame.getBoardSquareX( _aPlayers[iPlayerN].getPosition() ),
                y: s_oGame.getBoardSquareY( _aPlayers[iPlayerN].getPosition() )
                },300, createjs.Ease.quadIn);
        };
    };

    this.playerBack = function(iPlayerN, iStepsCounter) {
        _aPlayers[iPlayerN].decreasePosition();
        
        if (iStepsCounter === 0) {
            _iDiceResult--;                         // TO MATCH THE DICE RESULT (FOR NEXT SQUARES)
            _aPlayers[iPlayerN].increasePosition(); // TO MATCH GRAPHIC AND LOGICAL POSITION OF THE PLAYER
            s_oGame.checkForSpecialSquares(iPlayerN);
            return;
        };
        
        if (iStepsCounter > 0) {
            s_oGame.checkToFlip(iPlayerN);
            
            new createjs.Tween.get(_aPlayers[iPlayerN].getSprite()).to({
                x: s_oGame.getBoardSquareX( _aPlayers[iPlayerN].getPosition() ),
                y: s_oGame.getBoardSquareY( _aPlayers[iPlayerN].getPosition() )
                },100, createjs.Ease.quadIn).call( function() {
                    // ALWAYS RESPECT PLAYERS' Z POSITIONS
                    s_oGame.arrangePlayerZ();

                    iStepsCounter--;
                    s_oGame.playerBack(iPlayerN, iStepsCounter);
                });
            new createjs.Tween.get(_aPlayers[iPlayerN].getShadow()).to({
                x: s_oGame.getBoardSquareX( _aPlayers[iPlayerN].getPosition() ),
                y: s_oGame.getBoardSquareY( _aPlayers[iPlayerN].getPosition() )
                },100, createjs.Ease.quadIn);
        };
    };

    this.changePlayerTurn = function() {
        s_oGame.setTurnReady(true);
        return false;
    };

    this.functionWellOrPrison = function(iSquare, iPlayerN, Text) {
        s_oGame.msgBox(Text); 
        
        // If there's another player in this square, this frees him and the new player on the square is stopped
        var iPlayerFree = null;
        
        for (var i = 0; i < _aPlayers.length; i++) {
            var iPosition = _aPlayers[i].getPosition();
            
            if ( iPosition === iSquare) {
                if (i !== iPlayerN) {
                    iPlayerFree = i;
                };
            };
        }

        if (iPlayerFree !==  null) {

            _aPlayers[iPlayerFree].setPenality(0);
            
            if (iSquare === PRISON_SQUARE) { 
                s_oGame.exitfromPrison(iPlayerFree, iPlayerN);
            } else {
                s_oGame.exitfromWell(iPlayerFree, iPlayerN);
            };
        } else {
            if (iSquare === PRISON_SQUARE) { 
                s_oGame.gotoPrison();
            } else {
                s_oGame.gotoWell(iPlayerN);
            };
        };
        
        _aPlayers[iPlayerN].setPenality(PRISON_PENALITIES);
    };

    this.gotoWell = function(iPlayer) {
        playSound("well_in",1,0);
        _aPlayers[iPlayer].setVisible(false);
        
        var iColor = _aPlayers[iPlayer].getColor();
        s_oSquares.wellAnimation(iColor);
    };

    this.exitfromWell = function(iPlayerFree, iPlayer) {
        playSound("well_out",1,0);
        s_oSquares.wellExit(iPlayerFree, iPlayer);
    };
    
    this.setPlayerVisible = function(iPlayer) {
        _aPlayers[iPlayer].setVisible(true);
    };

    this.onWin = function(playerN) {
        s_oGame.setPokiStart(false);

        _bStartGame = false;
        _iTurn = null;
        s_aGamesPlayed++;
        saveItem("goosegame_gamesplayed",s_aGamesPlayed);
        
        if (_iMode === HUMAN_VS_CPU) {
            if (playerN === _iPlayerTurn) {
                // PLAYER WINS!
                s_aGamesWon++;
                saveItem("goosegame_gameswon",s_aGamesWon);
                s_oGame.gameWin();
                
                PokiSDK.happyTime(1);
            } else {
                // CPU WINS!
                s_oGame.gameOver();
            };
        } else {
            s_aGamesWon++;
            saveItem("goosegame_gameswon",s_aGamesWon);
            s_oGame.gameWin();
            
            PokiSDK.happyTime(1);
        };
    };
    
    this.msgBox = function(oText) {
        if (_bStartGame === false) {
            return;
        } else {
            _oMsgPanel = new CMsgBox(oText); 
        };
    };

    this.gameWin = function() {
        _bStartGame = false;
        
        playSound("game_win",1,0);

        _oEndPanel.show(true);
    };

    this.setTurnReady = function(value) {
        _bTurnReady = value;
    };
    
    this.isTurnReady = function() {
        return _bTurnReady;
    };
    
    this.gameOver = function() {
        _bStartGame = false;
        
        playSound("game_over",1,0);

        _oEndPanel.show(false);
    };

    this.checkBoard = function(){ 
    
        var oClickPanel = new createjs.Shape();
        oClickPanel.graphics.beginFill("rgba(0,0,0,0.4)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        oClickPanel.on("click", s_oGame.returnToEndPanel, s_oGame, true, oClickPanel);
        s_oStage.addChild(oClickPanel);

        _oEndPanel.hide();
    };

    this.returnToEndPanel = function(evt, oClickPanel){ 
        s_oStage.removeChild(oClickPanel);
        _oEndPanel.reShow();
    };

    this.restartGame = function() {
        s_oMain.pokiShowCommercial( ()=>{
            _iStartingPlayer++;
            if(_iStartingPlayer >= _iPlayers){
                _iStartingPlayer = 0;
            }

            s_oDices.hide();
            _oEndPanel.hide();
            s_oSquares.reset();

            s_oGame.resetVariables();
            _bStartGame = true;
            _bTurnReady = true;

            for(var i=0; i<6; i++){
                if(_aNestPlayer){
                    _oPlayersContainer.removeChild(_aNestPlayer[i]);
                    _aNestPlayer[i] = null; 
                }
                if(_aNestEgg[i]){
                    _oPlayersContainer.removeChild(_aNestEgg[i]);
                    _aNestEgg[i] = null;
                }
            }

            for(var i=0; i<_aPlayers.length; i++){
                _aPlayers[i].reset();
            }

            s_oGame.arrangePlayerZ();
        });
    };

    this.launchDices = function() {
        if (_iMode === HUMAN_VS_CPU) {
            s_oGame.setPokiStart(false);
            if (_iTurn !== _iPlayerTurn) {
                return; 
            };
        };
        if (s_oInterface.DicesEnabled() !== true) {
            return;
        } else if (s_oGame.isTurnReady() === true) {
            // LAUNCH DICES
            s_oDices.show();
        };
    };

    this.launchManual = function(iNumber){
        if (_iMode === HUMAN_VS_CPU) {
            if (_iTurn !== _iPlayerTurn) {
                return; 
            };
        };
        if (s_oInterface.DicesEnabled() !== true) {
            return;
        } else if (s_oGame.isTurnReady() === true) {
            // LAUNCH DICES
            s_oDices.manualShow(iNumber);
        };
    };

    this.puffAnimation = function(iX, iY){
        _oPuff.x = iX;
        _oPuff.y = iY;
        _oPuff.visible = true;
        _oPuff.gotoAndPlay("idle");
    };

    this.getBoardSquareX = function(iPosPlayer) {
        return BOARD_SQUARES[iPosPlayer][0];
    };

    this.getBoardSquareY = function(iPosPlayer) {
        return BOARD_SQUARES[iPosPlayer][1];
    };

    this.checkPenalities = function(iPlayerN) {
        // ON 2 PLAYERS MODE, IF THEY ARE BOTH BLOCKED IN PRISON 
        // AND WELL, THE GAME CAN'T GO ON. SO, WE FORCE A GAMEOVER
        if (_iPlayers === 2) {
            if (_aPlayers[0].getPosition() === PRISON_SQUARE &&
                _aPlayers[1].getPosition() === WELL_SQUARE ) {
                s_oGame.gameOver();
            };
            
            if (_aPlayers[1].getPosition() === PRISON_SQUARE &&
                _aPlayers[0].getPosition() === WELL_SQUARE ) {
                s_oGame.gameOver();
            };
        };
        
        return _aPlayers[iPlayerN].getPenality();
    };

    this.decreasePenalities = function(iPlayerN) {
        _aPlayers[iPlayerN].decreasePenality();
        
        // IF THE PLAYER IS OUT OF HIS HOUSE PENALITY, PLAY ANIMATIONS
        if ( _aPlayers[iPlayerN].getPenality() === 0) {
            s_oGame.nestExitAnimation( iPlayerN );
        };
    };

    this.arrangePlayerZ = function() {
        var aPlayersList = new Array();
        for (var i = 0; i < _oPlayersContainer.children.length; i++){
            var oPlayer = _oPlayersContainer.children[i];
            aPlayersList.push({ height: oPlayer.y, player: oPlayer });
        };
        aPlayersList.sort(this.compareHeight);

        var iCurDepth = 0;
        for (var i = 0; i < _oPlayersContainer.children.length; i++){
            _oPlayersContainer.setChildIndex(aPlayersList[i].player, iCurDepth++);
        }
    };

    this.compareHeight = function(a,b) {
        if (a.height < b.height)
           return -1;
        if (a.height > b.height)
          return 1;
        return 0;
    };
    
    this.getPlayerX = function(iPlayer) {
        var oPlayer = _aPlayers[iPlayer].getSprite();
        return oPlayer.x;
    };
    
    this.getPlayerY = function(iPlayer) {
        var oPlayer = _aPlayers[iPlayer].getSprite();
        return oPlayer.y;
    };

    this.checkToFlip = function(iPlayerN) {
        // CHECK IF IT'S NEEDED TO FLIP THE PLAYER IMAGE (HORIZONTALLY)
        var oPlayer = _aPlayers[iPlayerN].getSprite();
        
        if (this.getPlayerY(iPlayerN) < CANVAS_HEIGHT_HALF) {
            oPlayer.scaleX = -1;
        } else {
            oPlayer.scaleX = 1;
        };
    };
    
    this.setArrow = function(iTurn) {
        _aPlayers[iTurn].setArrowX(this.getPlayerX(iTurn));
        _aPlayers[iTurn].setArrowY(this.getPlayerY(iTurn));
    };

    this.checkForNextTurn = function() {
        // CHECK FOR ANY PENALITIES
        if (this.checkPenalities(_iTurn) !== 0) {
            // IF THE PLAYER HAS PENALITIES, IT MUST WAIT
            this.decreasePenalities(_iTurn);
            this.changeTurn();
        } else if (this.checkPenalities(_iTurn) === 0) {
            if (_iMode === HUMAN_VS_CPU) {
                // CHECK IF IT IS A CPU OR PLAYER TURN, ENABLE/DISABLE THE BUTTON
                if (_iTurn !== _iPlayerTurn) {
                    // CPU TURN
                    _aPlayers[_iTurn].setArrowVisible(false);
                    s_oDices.show();
                    _oInterface.enableDices(false);
                    _oInterface.animationDiceButtonStop();
                } else {
                    // PLAYER TURN
                    if ( _aPlayers[_iTurn].isArrowVisible() === false ) {
                        _aPlayers[_iTurn].setArrowVisible(true);
                        this.setArrow(_iTurn);
                    };
                    _oInterface.enableDices(true);
                    s_oGame.setPokiStart(true);
                    if (_oInterface.DicesEnabled() === true) {
                        _oInterface.animationDiceButton();
                    };
                };
            } else {
                // PLAYER TURN
                if ( _aPlayers[_iTurn].isArrowVisible() === false ) {
                    _aPlayers[_iTurn].setArrowVisible(true);
                    this.setArrow(_iTurn);
                };
                _oInterface.enableDices(true);
                s_oGame.setPokiStart(true);
                if (_oInterface.DicesEnabled() === true) {
                    _oInterface.animationDiceButton();
                };
            };            
        };
        
        _oPlayersInterface.setTurn(_iTurn);
    };
    
    this.checkForFirstTurn = function(){
        if (s_oDices.isFirstLaunch) {
            
            for (var i = 0; i < _aPlayers.length; i++) {
                var iPlayerPos = _aPlayers[i].getPosition();

                if (iPlayerPos > 0) {
                    s_oDices.setFirstLaunch(false);
                } else {
                    s_oDices.setFirstLaunch(true);
                }
            }
        };
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
        if (_bStartGame !== true) {
            return;
        } else {
            // LOGO ANIMATION
            _iLogoTimer += s_iTimeElaps;
            if (_iLogoTimer > LOGO_TIME) {
                _iLogoTimer = 0;
                createjs.Tween.get(_oGameLogo)
                    .to({scaleX: 1.1, scaleY: 1.1}, 200, createjs.Ease.quadOut)
                    .to({scaleX: 1, scaleY: 1}, 100, createjs.Ease.quadIn);
            };

            // MAZE ANIMATION
            _iMazeTimer += s_iTimeElaps;
            if (_iMazeTimer > MAZE_TIME) {
                _iMazeTimer = 0;
                playSound("maze_idle",1,0);
                s_oSquares.mazeAnimation();
            };

            // SET THE NEXT TURN PLAYER
            if (_bTurnReady === true) {
                this.checkForNextTurn();
            };
            
            // TIMER FOR SPECIAL SQUARES CONTROL
            if (_bSpecialSquareActive === true) {
                _iSpecialSquareTimer += s_iTimeElaps;
                
                if (_iSpecialSquareTimer > 500) {
                    this.endTimeoutSpecialSquare();
                };
            };
        };
    };

    s_oGame = this;

    this._init(iPlayers, iPlayerColour, iMode, aPlayersColor);
}

var s_oGame;