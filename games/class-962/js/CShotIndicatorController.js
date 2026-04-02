function CShotIndicatorController(iRange,bVertical){
	
    var _bShow = true;
    var _bVertical;
    var _iCntFrames;
    var _iCursorSpeed;
    var _iRange;
    var _pStartingPoint;
    var _pEndingPoint;

    var _oMcContainer;
    var _oStartOffset;
    var _oEndOffset;

    var _oBar;
    var _oCursor;
    var _iTopCursorX = 0;
    var _iTopCursorY = -10;
    var _iRightCursorX = 60;
    var _iRightCursorY = 0;
    
    var _bLeft = true;
    var _bUp = true;
  
    this.init = function(iRange,bVertical){

            _iRange=iRange;
            _oMcContainer=new createjs.Container();
            s_oStage.addChild(_oMcContainer)
            
            _bVertical=bVertical;
            
            if(bVertical === false){
                var oTopBar = s_oSpriteLibrary.getSprite("high_bar");
                _oBar = createBitmap(oTopBar);
                _oMcContainer.addChild(_oBar);
                _oMcContainer.x = 290;
                _oMcContainer.y = CANVAS_HEIGHT/2-170;
                
                var oCursor = s_oSpriteLibrary.getSprite("arrow_bar");
                _oCursor = createBitmap(oCursor);
                _oCursor.x = _iTopCursorX;
                _oCursor.y = _iTopCursorY;
                _oMcContainer.addChild(_oCursor);
                
                _oStartOffset = { x: 20, y: CANVAS_HEIGHT/2-150};
                _oEndOffset   = { x: TOP_BARX-50, y: CANVAS_HEIGHT/2-150 };
            }else{
                var oRightBar = s_oSpriteLibrary.getSprite("right_bar");
                oTopBar = createBitmap(oRightBar);
                _oMcContainer.addChild(oTopBar);
                _oMcContainer.x = CANVAS_WIDTH/2+345;
                _oMcContainer.y = CANVAS_HEIGHT/2-130;

                var oCursor = s_oSpriteLibrary.getSprite("arrow_bar");
                _oCursor = createBitmap(oCursor);
                _oCursor.x = _iRightCursorX;
                _oCursor.y = _iRightCursorY;
                _oCursor.rotation = 90;
                _oMcContainer.addChild(_oCursor);
                
                _oStartOffset = { x: CANVAS_WIDTH/2+375, y: 0};
                _oEndOffset   = { x: CANVAS_WIDTH/2+375, y: RIGHT_BARY-50 };
            }
            
            this.reset();
    };
		
    this.reset = function(){
        _iCntFrames=0;
        _iCursorSpeed = SHOT_INDICATOR_SPEED;
        _pStartingPoint=new CVector2();
        _pStartingPoint.set(_oStartOffset.x,_oStartOffset.y);
        _pEndingPoint=new CVector2();
        _pEndingPoint.set(_oEndOffset.x,_oEndOffset.y);
    };
		
    this.increaseSpeed =  function(){
        _iCursorSpeed-=DECREASE_SHOT_INDICATOR_SPEED;
    };

    this.show = function(){
        _bShow=true;
        _oMcContainer.visible=_bShow;
    };

    this.hide = function(){
        _bShow=false;
        _oMcContainer.visible=_bShow;
    };

    this.getPositionBallEnd = function(){
        var iRes;
        if(_bVertical){
                iRes=Math.floor(_oCursor.y/_iRange);
        }else{
                iRes=Math.floor(_oCursor.x/_iRange);
        }
        return iRes;
    };
    
    this.startAnimation = function(){
        var oParent = this;
        
        if(_bVertical){
            if(_bUp){
                createjs.Tween.get(_oCursor, {override: true}).to({y: _oEndOffset.y }, _iCursorSpeed, createjs.Ease.quadInOut).call(function() { 
                    _bUp = !_bUp; 
                    oParent.startAnimation();
                });
            }else{
                createjs.Tween.get(_oCursor, {override: true}).to({y: _oStartOffset.y }, _iCursorSpeed, createjs.Ease.quadInOut).call(function() {
                    _bUp = !_bUp;
                    oParent.startAnimation();
                });
            } 
        }else{
            if(_bLeft){
                createjs.Tween.get(_oCursor, {override: true}).to({x: _oEndOffset.x }, _iCursorSpeed, createjs.Ease.quadInOut).call(function() { 
                    _bLeft = !_bLeft; 
                    oParent.startAnimation();
                });
            }else{
                createjs.Tween.get(_oCursor, {override: true}).to({x: _oStartOffset.x }, _iCursorSpeed, createjs.Ease.quadInOut).call(function() {
                    _bLeft = !_bLeft;
                    oParent.startAnimation();
                });
            } 
        } 
    };
    
    this.endAnimation = function(){
        if(_bVertical){
                createjs.Tween.get(_oCursor, {override: true}).to({y: _oCursor.y }, 0).call(function() { });
        }else{
                createjs.Tween.get(_oCursor, {override: true}).to({x: _oCursor.x }, 0).call(function() { });
        } 
    };


    this.update = function(){
    
    };
    
    this.init(iRange,bVertical);
}