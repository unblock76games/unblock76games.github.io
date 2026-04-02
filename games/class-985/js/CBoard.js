function CBoard(oParentContainer) {
    var _oParentContainer;
    var _oBoardContainer;
    var _oBoardSprite;
    var _oLeftSide;
    var _oRightSide;
    
    var _oHoopLeftSide;
    var _oHoopRightSide;
    var _oHoopLeftSidePtA;
    var _oHoopLeftSidePtB;
    var _oHoopRightSidePtA;
    var _oHoopRightSidePtB;
    var _oHoopLeftSideEdge;
    var _oHoopRightSideEdge;
    var _oExcludeCollisionRectangle;
    var _oStartPosition;
    var _oBasketTop;
    var _oBasketBottom;

    var _iLeftSideX;
    var _iRightSideX;
    var _iSideY;        

    var _iExcludeCollisionRectangleLimitLeft;
    var _iExcludeCollisionRectangleLimitRight;
    var _iExcludeCollisionRectangleLimitTop;
    var _iExcludeCollisionRectangleLimitBottom;    
    
    var _aBoardRingEdges;
    var _aHoopSidesModels;

    // FOR TWEEN
    var _bUpdate;
    var _iCntTime;
    var _iMaxTime;
    var _iCurStartX;
    var _iCurStartY;
    var _iCurXIndex;
    var _iCurYIndex;
    var _iDestinationX;
    var _iDestinationY;
    var _iMovementsCounter;

    var _bHorizontalMovement;
    var _bVerticalMovement;
    var _bDebugMode = false;        // <------ SET THIS TO TRUE TO SET COLLISION SHAPES AND EDGES VISIBLE
    
    this._init = function () {
        _bUpdate = false;
        _bHorizontalMovement = false;
        _bVerticalMovement = false;
        _aBoardRingEdges = [];
        _aHoopSidesModels = [];
        _iMovementsCounter = 0;
        
        _oBoardContainer = new createjs.Container();
        _oParentContainer.addChild(_oBoardContainer);
        
        _oStartPosition = {x: CANVAS_WIDTH_HALF, y: CANVAS_HEIGHT_HALF - 200};        
        
        var oSprite = s_oSpriteLibrary.getSprite('board');
        _oBoardSprite = createBitmap(oSprite, oSprite.width, oSprite.height);
        _oBoardSprite.regX = oSprite.width/2;
        _oBoardSprite.regY = oSprite.height/2;    
        _oBoardContainer.addChild(_oBoardSprite);
        _oBoardContainer.x = _oStartPosition.x;
        _oBoardContainer.y = _oStartPosition.y;
        
        if (_bDebugMode === true) {
            _oBoardSprite.alpha = 0.5;
        };
        
        this.initHoopSides();
        this.initBoardSides();
        this.initBasketLogic();
        this.createExcludeCollisionRectangle();
    
        _iCurXIndex = 0;
        _iCurYIndex = 0;
        _iCurStartX = _oBoardContainer.x;
        _iCurStartY = _oBoardContainer.y;
        _iCntTime = 0;
        _iMaxTime = BOARD_MOVEMENT_DURATION;
    };
    
    this.initHoopSides = function() {
        var iThickness = 5;
        
        _oHoopLeftSidePtA = {x: -80, y: 60};
        _oHoopLeftSidePtB = {x: -65, y: 190};
        _oHoopRightSidePtA = {x: 80, y: 60};
        _oHoopRightSidePtB = {x: 65, y: 190};
        
        // CREATE GRAPHIC RENDITION OF THE SIDES
        _oHoopLeftSide = new createjs.Shape()
        _oHoopLeftSide.graphics.setStrokeStyle(iThickness).beginStroke("red");
        _oHoopLeftSide.graphics.moveTo(_oHoopLeftSidePtA.x, _oHoopLeftSidePtA.y);
        _oHoopLeftSide.graphics.lineTo(_oHoopLeftSidePtB.x, _oHoopLeftSidePtB.y);
        _oHoopLeftSide.graphics.endStroke();

        _oHoopRightSide = new createjs.Shape()        
        _oHoopRightSide.graphics.setStrokeStyle(iThickness).beginStroke("red");
        _oHoopRightSide.graphics.moveTo(_oHoopRightSidePtA.x, _oHoopRightSidePtA.y);
        _oHoopRightSide.graphics.lineTo(_oHoopRightSidePtB.x, _oHoopRightSidePtB.y);
        _oHoopRightSide.graphics.endStroke();
        
        _oHoopLeftSide.visible = _oHoopRightSide.visible = _bDebugMode;
        _oBoardContainer.addChild(_oHoopLeftSide, _oHoopRightSide);
        
        this.initHoopSidesEdges();        
    };
    
    this.initHoopSidesEdges = function(){
        var iThickness = 10;
        
        _oHoopLeftSideEdge = new CEdge(this.getHoopLeftSidePtB().x, this.getHoopLeftSidePtB().y, 
            this.getHoopLeftSidePtA().x, this.getHoopLeftSidePtA().y, iThickness, false);                
            
        _oHoopRightSideEdge = new CEdge(this.getHoopRightSidePtA().x, this.getHoopRightSidePtA().y, 
            this.getHoopRightSidePtB().x, this.getHoopRightSidePtB().y, iThickness, false);
        
        _aHoopSidesModels[EDGE_LEFT] = _oHoopLeftSideEdge.getModel();        
        _aHoopSidesModels[EDGE_RIGHT] = _oHoopRightSideEdge.getModel();
    };
    
    this.getHoopLeftSidePtA = function(){
        var oPoint = {
            x: _oBoardContainer.x + _oHoopLeftSidePtA.x,
            y: _oBoardContainer.y + _oHoopLeftSidePtA.y
        };
        return oPoint;
    };
    
    this.getHoopLeftSidePtB = function(){
        var oPoint = {
            x: _oBoardContainer.x + _oHoopLeftSidePtB.x,
            y: _oBoardContainer.y + _oHoopLeftSidePtB.y
        };
        return oPoint;
    };
    
    this.getHoopRightSidePtA = function(){
        var oPoint = {
            x: _oBoardContainer.x + _oHoopRightSidePtA.x,
            y: _oBoardContainer.y + _oHoopRightSidePtA.y
        };
        return oPoint;
    };
    
    this.getHoopRightSidePtB = function(){
        var oPoint = {
            x: _oBoardContainer.x + _oHoopRightSidePtB.x,
            y: _oBoardContainer.y + _oHoopRightSidePtB.y
        };
        return oPoint;
    };
    
    this.getHoopSideEdges = function(){
        return _aHoopSidesModels;
    };

    this.initBasketLogic = function(){
        var iHeight = 10;
        var iTopP1X = _oBoardContainer.x - 60;
        var iTopP2X = _oBoardContainer.x + 60;
        var iTopY = _oBoardContainer.y + 50;
        var iBottomP1X = _oBoardContainer.x - 40;
        var iBottomP2X = _oBoardContainer.x + 40;
        var iBottomY = _oBoardContainer.y + 180;

        _oBasketTop = new CEdge(iTopP1X, iTopY, iTopP2X, iTopY, iHeight, _bDebugMode);
        _oBasketBottom = new CEdge(iBottomP1X, iBottomY, iBottomP2X, iBottomY, iHeight, _bDebugMode);        
    };
    
    this.initBoardSides = function(){       
        _iLeftSideX = -82;
        _iRightSideX = _iLeftSideX * -1;
        _iSideY = 52;
        
        _oLeftSide = new createjs.Shape()        
        _oLeftSide.graphics.beginFill("blue");
        _oLeftSide.graphics.drawCircle(_iLeftSideX, _iSideY, BOARD_SIDES_SIZE);
        _oLeftSide.graphics.endStroke();
        _oBoardContainer.addChild(_oLeftSide);
        _aBoardRingEdges[EDGE_LEFT] = _oLeftSide;
        
        _oRightSide = new createjs.Shape()        
        _oRightSide.graphics.beginFill("blue");
        _oRightSide.graphics.drawCircle(_iRightSideX, _iSideY, BOARD_SIDES_SIZE);
        _oRightSide.graphics.endStroke();
        _oBoardContainer.addChild(_oRightSide);
        _aBoardRingEdges[EDGE_RIGHT] = _oRightSide;
        
        _oLeftSide.visible = _oRightSide.visible = _bDebugMode;
    };
    
    this.createExcludeCollisionRectangle = function(){
        var iWidth = 400;
        var iHeight = 300;
        
        _oExcludeCollisionRectangle = new createjs.Shape();
        _oExcludeCollisionRectangle.graphics.beginFill("white");
        _oExcludeCollisionRectangle.graphics.drawRect(0, 0, iWidth, iHeight);
        _oExcludeCollisionRectangle.graphics.endFill();
        _oExcludeCollisionRectangle.alpha = 0.1;
        _oExcludeCollisionRectangle.x = -1 * iWidth/2;
        _oExcludeCollisionRectangle.y = (-1 * iHeight/2) + 50;
        _oExcludeCollisionRectangle.width = iWidth;
        _oExcludeCollisionRectangle.height = iHeight;
        _oExcludeCollisionRectangle.visible = _bDebugMode;
        _oBoardContainer.addChild(_oExcludeCollisionRectangle);

        this.setExcludeCollisionRectangleLimits();
    };
    
    this.setExcludeCollisionRectangleLimits = function(){
        _iExcludeCollisionRectangleLimitLeft = _oBoardContainer.x + _oExcludeCollisionRectangle.x;
        _iExcludeCollisionRectangleLimitRight = _oBoardContainer.x + _oExcludeCollisionRectangle.x + _oExcludeCollisionRectangle.width;
        _iExcludeCollisionRectangleLimitTop = _oBoardContainer.y + _oExcludeCollisionRectangle.y;
        _iExcludeCollisionRectangleLimitBottom = _oBoardContainer.y + _oExcludeCollisionRectangle.y + _oExcludeCollisionRectangle.height;
    };
    
    this.destroyCollisions = function(){
        for (var i = 0; i < _aBoardRingEdges.length; i++) {
            _oBoardContainer.removeChild(_aBoardRingEdges[i]);
        };
        _aBoardRingEdges = [];
        
        for (var i = 0; i < _aHoopSidesModels.length; i++) {
            _aHoopSidesModels[i].destroy();
        };
        _aHoopSidesModels = [];
        
        _oBasketTop.destroy();
        _oBasketBottom.destroy();        
        _oBoardContainer.removeChild(_oExcludeCollisionRectangle);
        _oExcludeCollisionRectangle = null;       
    };
    
    this.getLimitLeft = function(){
        return _iExcludeCollisionRectangleLimitLeft;
    };
    
    this.getLimitRight = function(){
        return _iExcludeCollisionRectangleLimitRight;
    };
    
    this.getLimitTop = function(){
        return _iExcludeCollisionRectangleLimitTop;
    };
    
    this.getLimitBottom = function(){
        return _iExcludeCollisionRectangleLimitBottom;
    };
    
    this.getBoardRingEdges = function(){
        return _aBoardRingEdges;
    };
    
    this.getBoardSideLeftPosition = function(){
        var oPoint = {
            x: _oBoardContainer.x + _iLeftSideX,
            y: _oBoardContainer.y + _iSideY
        };
        return oPoint;
    };

    this.getBoardSideRightPosition = function(){
        var oPoint = {
            x: _oBoardContainer.x + _iRightSideX,
            y: _oBoardContainer.y + _iSideY
        };
        return oPoint;
    };
    
    this.getStartPosition = function(){
        return _oStartPosition;
    };
    
    this.getX = function(){
        return _oBoardContainer.x;
    };
    
    this.getY = function(){
        return _oBoardContainer.y;
    };
    
    this.setUpdate = function(bValue) {
        _bUpdate = bValue;        
    };
    
    this.getBasketTop = function(){
        return _oBasketTop.getModel();
    };
    
    this.getBasketBottom = function(){
        return _oBasketBottom.getModel();
    };
    
    this.isUpdate = function() {
        return _bUpdate;
    };
    
    this.getBoardContainer = function(){        
        return _oBoardContainer;
    };
    
    this.resetBoardPhysicSimulation = function(){
        this.destroyCollisions();
        this.initBoardSides();
        this.initBasketLogic();
        this.createExcludeCollisionRectangle();
        this.initHoopSidesEdges();
    };
    
    this.setBoardHorizontalMovement = function(bValue) {
        _bHorizontalMovement = bValue;
    };
    
    this.setBoardVerticalMovement = function(bValue) {
        _bVerticalMovement = bValue;
    };
    
    this.resetBoardMovement = function(){
        var iDestX = BOARD_MOVEMENT_HORIZONTAL;
        var iDestY = BOARD_MOVEMENT_VERTICAL;
        _iCurStartX = _oBoardContainer.x;
        _iCurStartY = _oBoardContainer.y;
        _iDestinationX = _oStartPosition.x;
        _iDestinationY = _oStartPosition.y;
        
        switch(_iMovementsCounter) {
            case 0: {
                    _iDestinationX = _oStartPosition.x + iDestX;                    
                    if (_bVerticalMovement === true) {
                        _iDestinationY = _oStartPosition.y + iDestY;
                    }
                }
                break;
            case 1: {
                    _iDestinationX = _oStartPosition.x;
                    if (_bVerticalMovement === true) {
                        _iDestinationY = _oStartPosition.y;
                    }
                }
                break;
            case 2: {
                    _iDestinationX = _oStartPosition.x - iDestX;
                    if (_bVerticalMovement === true) {
                        _iDestinationY = _oStartPosition.y - iDestY;
                    }
                }
                break;
            case 3: {
                    _iDestinationX = _oStartPosition.x;
                    if (_bVerticalMovement === true) {
                        _iDestinationY = _oStartPosition.y;
                    }
                }
                break;
            case 4: {
                    _iDestinationX = _oStartPosition.x + iDestX;
                    if (_bVerticalMovement === true) {
                        _iDestinationY = _oStartPosition.y - iDestY;
                    }
                }
                break;
            case 5: {
                    _iDestinationX = _oStartPosition.x;
                    if (_bVerticalMovement === true) {
                        _iDestinationY = _oStartPosition.y;
                    }
                }
                break;
            case 6: {
                    _iDestinationX = _oStartPosition.x - iDestX;
                    if (_bVerticalMovement === true) {
                        _iDestinationY = _oStartPosition.y + iDestY;
                    }
                }
                break;
            case 7: {
                    _iDestinationX = _oStartPosition.x;
                    if (_bVerticalMovement === true) {
                        _iDestinationY = _oStartPosition.y;
                    }
                }
                break;
            default:
                _iMovementsCounter = 0;
                break;
        };

        _iCntTime = 0;
        _bUpdate = true;
    };
    
    // UPDATE THE Y POSITION IN A "TWEEN" WAY
    this.update = function(){
        if (!_bUpdate) {
            return; 
        };
        
        _iCntTime+= s_iTimeElaps;
        
        if ( _iCntTime >= _iMaxTime ){            
            _bUpdate = false;
            _iMovementsCounter++;
            
            if (_iMovementsCounter > 7) {
                _iMovementsCounter = 0;
            };

            this.resetBoardMovement();
        } else {
            var fLerpX = s_oTweenController.easeLinear( _iCntTime, 0 ,1, _iMaxTime);
            var fLerpY = s_oTweenController.easeLinear( _iCntTime, 0 ,1, _iMaxTime);
            var iValueX = s_oTweenController.tweenValue( _iCurStartX, _iDestinationX, fLerpX);
            var iValueY = s_oTweenController.tweenValue( _iCurStartY, _iDestinationY, fLerpY);
            _oBoardContainer.x = iValueX;
            _oBoardContainer.y = iValueY;
            
            this.resetBoardPhysicSimulation();            
        }
    };
    
    _oParentContainer = oParentContainer;

    this._init();

    return this;
}
