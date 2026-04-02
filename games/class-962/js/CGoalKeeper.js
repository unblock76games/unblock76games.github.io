function CGoalKeeper(oParentContainer){
    var _oTeamSprite;
    var _oSpriteSheetGoalKeeper = null;
    var _oAnimation = null;
    
    var _oContainer = oParentContainer;
    
    this._init = function(){
        
    };
    
    this.showIdle = function(iX, iY){
        _oTeamSprite = {   
            images: [s_oSpriteLibrary.getSprite("goalkeeper_idle")], 
            framerate: 15,
            // width, height & registration point of each sprite
            frames: {width: GOALKEEPER_WIDTH, height: GOALKEEPER_HEIGHT, regX: GOALKEEPER_WIDTH/2, regY: GOALKEEPER_WIDTH}, 
            animations: {idle:[0, 19, "idle"]}
        };
        _oSpriteSheetGoalKeeper = new createjs.SpriteSheet(_oTeamSprite);
        if(_oAnimation === null){
            _oAnimation = new createjs.Sprite(_oSpriteSheetGoalKeeper, "idle");
        }else{
            _oAnimation.spriteSheet = _oSpriteSheetGoalKeeper;
        }
        _oAnimation.x = iX;
        _oAnimation.y = iY;
        _oContainer.addChild(_oAnimation);
        _oAnimation.gotoAndPlay("idle");
    };
    
    this.showAction = function(iX, iY, szType, iSpriteNum, iWidth, iHeight){
        _oTeamSprite = {   
            images: [s_oSpriteLibrary.getSprite("goalkeeper_"+szType)], 
            framerate: 15,
            // width, height & registration point of each sprite
            frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight}, 
            animations: {idle:[0, iSpriteNum]}
        };
        _oSpriteSheetGoalKeeper = new createjs.SpriteSheet(_oTeamSprite);
        if(_oAnimation === null){
            _oAnimation = new createjs.Sprite(_oSpriteSheetGoalKeeper, "idle");
        }else{
            _oAnimation.spriteSheet = _oSpriteSheetGoalKeeper;
        }
        _oAnimation.x = iX;
        _oAnimation.y = iY;
        _oContainer.addChild(_oAnimation);
        _oAnimation.gotoAndPlay("idle");
    };
    
    this.stop = function(){
        _oAnimation.paused = true;
    };
    
    this.getFrame = function(){
        return _oAnimation.currentFrame;
    };
    
    this.unload = function(){
        _oContainer.removeAllChildren();
    };
    
    s_oPlayer = this;
    
    this._init(oParentContainer);
    
}
s_oPlayer = null;