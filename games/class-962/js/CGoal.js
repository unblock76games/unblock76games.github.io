function CGoal(iX, iY, oParentContainer){
    var _oGoal;
    
    this._init = function(iX, iY, oParentContainer){
        
        _oGoal = createBitmap(s_oSpriteLibrary.getSprite('goal'));
        _oGoal.x = iX;
        _oGoal.y = iY;
        _oGoal.regX = GOAL_WIDTH/2;
        _oGoal.regY = GOAL_HEIGHT/2;
        oParentContainer.addChild(_oGoal);
    };
    
    this._init(iX, iY, oParentContainer);
    
}
s_oBatter = null;