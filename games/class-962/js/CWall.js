function CWall(iX, iY, oParentContainer, i){
    var _oSpriteSheetWall = null;
    var _oAnimation = null;
    var _oParentContainer;
    
    this._init = function(iX, iY, i){
        if(i===0){
            oParentContainer.x = iX;
            oParentContainer.y = iY;
        }
    };
    
    this.showIdle = function(i){
        var oWallSprite = {   
            images: [s_oSpriteLibrary.getSprite("wall_idle")], 
            framerate: 10,
            // width, height & registration point of each sprite
            frames: {width: WALL_WIDTH, height: WALL_HEIGHT, regX: WALL_WIDTH/2, regY: 0}, 
            animations: {idle:[0, 23, "idle"]}
        };
        _oSpriteSheetWall = new createjs.SpriteSheet(oWallSprite);
        if(_oAnimation === null){
            _oAnimation = new createjs.Sprite(_oSpriteSheetWall, "idle");
        }else{
            _oAnimation.spriteSheet = _oSpriteSheetWall;
        }
        _oAnimation.x = (WALL_WIDTH-40)*i;
        _oAnimation.y = 0;
        _oAnimation.currentAnimationFrame = 0;
        _oParentContainer.addChild(_oAnimation);
    };
    
    this.showJump = function(i){
        if(_oAnimation !== null){
            _oParentContainer.removeChild(_oAnimation);
        }
        
        var oData = {   
            images: [s_oSpriteLibrary.getSprite("wall_jump")], 
            framerate: 15,
            // width, height & registration point of each sprite
            frames: {width: WALL_WIDTH, height: WALL_HEIGHT, regX: WALL_WIDTH/2}, 
            animations: {start:[0], jump:[0, 20,"start"]}
        };
        
        var oSpriteSheetWall = new createjs.SpriteSheet(oData);
        _oAnimation = new createjs.Sprite(oSpriteSheetWall, "jump");
		_oAnimation.x = (WALL_WIDTH-40)*i;
        _oParentContainer.addChild(_oAnimation);
    };
    
    this.stopAction = function(){
        _oAnimation.stop(0);
    };
    
    this.getFrame = function(){
        return _oAnimation.currentFrame;
    };
    
    this.getX = function(){
        return _oAnimation.x;
    };
    
    this.controlIfHitted = function(iBallx, iBally, NumPlayerInWall){
        if(iBally < _oParentContainer.y+WALL_HEIGHT && iBally > _oParentContainer.y){
            if(iBallx > _oParentContainer.x && iBallx < (_oParentContainer.x+(WALL_WIDTH-60)*NumPlayerInWall)){
                return true;
            }
        }
    };
    
    this.unload = function(){
        _oAnimation = null;
        _oParentContainer.removeChild(_oAnimation);
    };
    
    s_oPlayer = this;
    _oParentContainer = oParentContainer;
    
    this._init(iX, iY, i);
    
}
s_oPlayer = null;