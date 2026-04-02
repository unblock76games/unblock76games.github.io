function CSquares(oCageBackContainer, oCageFrontContainer, oSquaresContainer) {
    var _oWell;
    var _oWellAnimation;
    var _oGhost;
    var _oMaze;
    var _oBridge;
    var _oCageBack;
    var _oCageFront;
    var _oCageBackContainer = oCageBackContainer;
    var _oCageFrontContainer = oCageFrontContainer;
    var _oSquaresContainer = oSquaresContainer;
    var _iCageStart = -100;
    
    // This array will contain booleans for each square, if it's occupied or not
    var _aSqOccupiedCenter = [];
    
    // This array will contain booleans for each square's internal coordinates, if they are occupied or not
    var _aSqOccupiedPoints = [];

    // This array will contain all the logical rectangles of the squares
    var _aRect = [];

    this._init = function () {
        // Create the squares
        for (var i = 0; i <= LAST_SQUARE; i++) {
            var iX = BOARD_SQUARES[i][0];
            var iY = BOARD_SQUARES[i][1];
            
            // Generate a logic rectangle around each square
            var oRect = new createjs.Shape();
            oRect.graphics.beginFill("red");
            oRect.graphics.drawRect(0, 0, 24, 60);
            oRect.x = iX;
            oRect.y = iY;
            oRect.regX = 12;
            oRect.regY = 30;
            oRect.rotation = ANGLE_SQUARE[i];
            oRect.alpha = 0.5;
            oRect.visible = false;          // Comment this to see the squares
            oRect.setBounds();
            _aRect.push(oRect);
            _oSquaresContainer.addChild(oRect);
            
            // Set the square occupied to false
            _aSqOccupiedCenter.push(false);
            
            var aOccupiedSquares = [false, false, false, false];
            _aSqOccupiedPoints.push(aOccupiedSquares);
        };
        
        // Create a bridge on square 6
        var oData = {
                images: [s_oSpriteLibrary.getSprite("bridge")],
                framerate: 24,
                // width, height & registration point of each sprite
                frames: {width: 238, height: 174, regX: 119, regY: 87},
                animations: { idle1: [ 0,  3, "stop1"], stop1: [3,3],
                              idle2: [ 0, 11, "stop2"], stop2: [11,11],
                              idle3: [ 0, 22, "stop3"], stop3: [22,22],
                              idle4: [ 0, 30, "stop4"], stop4: [30,30],
                              idle5: [ 0, 34, "stop5"], stop5: [34,44],
                              idle6: [ 0, 42, "stop6"], stop6: [42,42],
                              endreturn: [0,0, "endreturn"],
                              return1: {
                                  frames: [3,2,1,0],
                                  next: "endreturn"},
                              return2: {
                                  frames: [11,10,9,8,7,6,5,4,3,2,1,0],
                                  next: "endreturn"},
                              return3: {
                                  frames: [22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],
                                  next: "endreturn"},
                              return4: {
                                  frames: [30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],
                                  next: "endreturn"},
                              return5: {
                                  frames: [34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],
                                  next: "endreturn"},
                              return6: {
                                  frames: [42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],
                                  next: "endreturn"},}
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oBridge = createSprite(oSpriteSheet, 0, 119, 87, 238, 174);
        _oBridge.x = BOARD_SQUARES[BRIDGE_SQUARE][0] + 140;
        _oBridge.y = BOARD_SQUARES[BRIDGE_SQUARE][1] - 50;
        _oBridge.visible = false;
        _oBridge.on("animationend", this.onBridgeAnimationEnd);
        _oSquaresContainer.addChild(_oBridge);
        
        // Create a well on square 31
        var sSpriteName = "well";
        _oWell = createBitmap(s_oSpriteLibrary.getSprite(sSpriteName));
        _oWell.regX = 33;
        _oWell.regY = 26;
        _oWell.x = BOARD_SQUARES[WELL_SQUARE][0];
        _oWell.y = BOARD_SQUARES[WELL_SQUARE][1];
        _oSquaresContainer.addChild(_oWell);

        var oData = {
                images: [s_oSpriteLibrary.getSprite("well_0"),
                         s_oSpriteLibrary.getSprite("well_1"),
                         s_oSpriteLibrary.getSprite("well_2"),
                         s_oSpriteLibrary.getSprite("well_3"),
                         s_oSpriteLibrary.getSprite("well_4"),
                         s_oSpriteLibrary.getSprite("well_5")],
                framerate: 30,
                // width, height & registration point of each sprite
                frames: {width: 82, height: 166, regX: 41, regY: 83},
                animations: { fall0: [  0,  12, "stop0"], stop0:[ 12, 12, "stop0"], 
                              fall1: [ 24,  36, "stop1"], stop1:[ 36, 36, "stop1"], 
                              fall2: [ 48,  60, "stop2"], stop2:[ 60, 60, "stop2"], 
                              fall3: [ 72,  84, "stop3"], stop3:[ 84, 84, "stop3"], 
                              fall4: [ 96, 108, "stop4"], stop4:[108,108, "stop4"], 
                              fall5: [120, 132, "stop5"], stop5:[132,132, "stop5"], 
                              exit0: [ 13, 21, "exitstop0"], exitstop0: [ 21, 21, "exitstop0"],
                              exit1: [ 37, 45, "exitstop1"], exitstop1: [ 45, 45, "exitstop1"],
                              exit2: [ 61, 69, "exitstop2"], exitstop2: [ 69, 69, "exitstop2"],
                              exit3: [ 85, 93, "exitstop3"], exitstop3: [ 93, 93, "exitstop3"],
                              exit4: [109,117, "exitstop4"], exitstop4: [117,117, "exitstop4"],
                              exit5: [133,141, "exitstop5"], exitstop5: [141,141, "exitstop5"]}
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oWellAnimation = createSprite(oSpriteSheet, 0, 41, 83, 82, 166);
        _oWellAnimation.x = BOARD_SQUARES[WELL_SQUARE][0] - 2;
        _oWellAnimation.y = BOARD_SQUARES[WELL_SQUARE][1] - 52;
        s_oStage.addChild(_oWellAnimation);
        _oWellAnimation.visible = false;

        // Create a maze on square 42
        var oData = {
                images: [s_oSpriteLibrary.getSprite("maze")],
                framerate: 30,
                // width, height & registration point of each sprite
                frames: {width: 106, height: 122, regX: 53, regY: 61},
                animations: { idle: [0,0], move: [ 0, 13, "idle"]}
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oMaze = createSprite(oSpriteSheet, 0, 53, 61, 106, 122);
        _oMaze.x = BOARD_SQUARES[MAZE_SQUARE][0] - 5;
        _oMaze.y = BOARD_SQUARES[MAZE_SQUARE][1] - 5;
        _oSquaresContainer.addChild(_oMaze);
        _oMaze.gotoAndPlay("idle");

        // Create a cage on square 52
        var sSpriteName = "cage_back";
        _oCageBack = createBitmap(s_oSpriteLibrary.getSprite(sSpriteName));
        _oCageBack.regX = 37;
        _oCageBack.regY = 68;
        _oCageBack.x = BOARD_SQUARES[PRISON_SQUARE][0];
        _oCageBack.y = _iCageStart;
        _oCageBackContainer.addChild(_oCageBack);
                
        var sSpriteName = "cage_front";
        _oCageFront = createBitmap(s_oSpriteLibrary.getSprite(sSpriteName));
        _oCageFront.regX = _oCageBack.regX;
        _oCageFront.regY = _oCageBack.regY;
        _oCageFront.x = _oCageBack.x;
        _oCageFront.y = _oCageBack.y;
        _oCageFrontContainer.addChild(_oCageFront);
    };
    
    
    this.onBridgeAnimationEnd = function() {
        if (_oBridge.currentAnimation === "idle1") {
            _oBridge.gotoAndPlay("return1");
        } else if (_oBridge.currentAnimation === "idle2") {
            _oBridge.gotoAndPlay("return2");
        } else if (_oBridge.currentAnimation === "idle3") {
            _oBridge.gotoAndPlay("return3");
        } else if (_oBridge.currentAnimation === "idle4") {
            _oBridge.gotoAndPlay("return4");
        } else if (_oBridge.currentAnimation === "idle5") {
            _oBridge.gotoAndPlay("return5");
        } else if (_oBridge.currentAnimation === "idle6") {
            _oBridge.gotoAndPlay("return6");
        } else if (_oBridge.currentAnimation === "endreturn") {
            _oBridge.visible = false;
        };
    };
    
    this.bridgeAnimation = function(value) {
        _oBridge.visible = true;
        switch(value){
            case 1:
                _oBridge.gotoAndPlay("idle1");
                break;
            case 2:
                _oBridge.gotoAndPlay("idle2");
                break;
            case 3:
                _oBridge.gotoAndPlay("idle3");
                break;
            case 4:
                _oBridge.gotoAndPlay("idle4");
                break;
            case 5:
                _oBridge.gotoAndPlay("idle5");
                break;
            case 6:
                _oBridge.gotoAndPlay("idle6");
                break;
        }
    };

    this.mazeAnimation = function() {
        _oMaze.gotoAndPlay("move");
    };
    
    this.ghostAnimation = function() {
        var oSpriteName = "ghost";
        var oData = {
                images: [s_oSpriteLibrary.getSprite(oSpriteName)],
                framerate: 30,
                frames: {width: 136, height: 138, regX: 90, regY: 130},
                animations: { idle: [0, 15, "idle"]}
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oGhost = createSprite(oSpriteSheet, 0, 68, 69, 136, 138);
        _oGhost.x = BOARD_SQUARES[SKULL_SQUARE][0];
        _oGhost.y = BOARD_SQUARES[SKULL_SQUARE][1];
        _oGhost.scaleX = _oGhost.scaleY = 0;
        _oGhost.alpha = 0;
        s_oStage.addChild(_oGhost);
        
        new createjs.Tween.get(_oGhost)
                .to({ alpha:1, scaleY:1.5, scaleX: 1.5}, 350, createjs.Ease.quadIn)
                .to({ scaleY:1, scaleX:1}, 350, createjs.Ease.quadIn)
                .call(this.ghostDelete);
    };
    
    this.ghostDelete = function(){
        new createjs.Tween.get(_oGhost)
            .to({alpha:0, scaleY:0, scaleX:0}, 3000, createjs.Ease.quadIn).call(function() {
                _oGhost = null;
            });
    };

    this.wellAnimation = function(iPlayer) {
        _oWell.visible = false;
        _oWellAnimation.visible = true;
        _oWellAnimation.gotoAndPlay("fall"+iPlayer);
    };
    
    this.wellExit = function(iPlayerFree, iPlayer) {
        _oWellAnimation.gotoAndPlay("exit"+iPlayerFree);
        s_oGame.setPlayerVisible(iPlayerFree);
        s_oGame.gotoWell(iPlayer);
    };

    this.startCageAnimation = function(){
        new createjs.Tween.get(_oCageBack)
            .to({ y: BOARD_SQUARES[PRISON_SQUARE][1]},250, createjs.Ease.quadIn);
        new createjs.Tween.get(_oCageFront)
            .to({ y: BOARD_SQUARES[PRISON_SQUARE][1]},250, createjs.Ease.quadIn)
            .call(function() {
                s_oGame.changePlayerTurn();
            });
    };
    
    this.reverseCageAnimation = function(){
        new createjs.Tween.get(_oCageBack)
            .to({ y: _iCageStart},100, createjs.Ease.quadOut);
        new createjs.Tween.get(_oCageFront)
            .to({ y: _iCageStart},100, createjs.Ease.quadOut);
    };
    
    this.setSquareOccupied = function(iSquare, value) {
        _aSqOccupiedCenter[iSquare] = value;
    };

    this.checkFreeSquarePoints = function(iSquare) {
        return _aSqOccupiedPoints[iSquare].indexOf(false);
    };
    
    this.unload = function () {
        s_oSquares = null;
    };

    this.reset = function(){
        _oWell.visible = true;
        _oWellAnimation.visible = false;
        this.reverseCageAnimation();
    };

    s_oSquares = this;

    this._init(oCageBackContainer, oCageFrontContainer);
}

var s_oSquares;