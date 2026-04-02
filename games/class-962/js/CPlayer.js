function CPlayer(oParentContainer){
    var _oTeamSprite;
    var _oPlayer;
    var _oSpriteSheetPlayer = null;
    var _oAnimation = null;
    
    var _oContainer = oParentContainer;
    
    this._init = function(){
        
    };
    
    this.showIdle = function(iX, iY, szSpriteSelected){
        _oTeamSprite = {   
            images: [s_oSpriteLibrary.getSprite(szSpriteSelected+"_idle")], 
            framerate: 10,
            // width, height & registration point of each sprite
            frames: {width: PLAYER_WIDTH, height: PLAYER_HEIGHT, regX: PLAYER_WIDTH/2, regY: PLAYER_WIDTH}, 
            animations: {idle:[0, 23, "idle"]}
        };
        _oSpriteSheetPlayer = new createjs.SpriteSheet(_oTeamSprite);
        if(_oAnimation === null){
            _oAnimation = new createjs.Sprite(_oSpriteSheetPlayer, "idle");
        }else{
            _oAnimation.spriteSheet = _oSpriteSheetPlayer;
        }
        _oAnimation.x = iX;
        _oAnimation.y = iY;
        _oAnimation.currentAnimationFrame = 0;
        _oContainer.addChild(_oAnimation);
    };
    
    this.showShot = function(iX, iY, szSpriteSelected){
        _oTeamSprite = {   
            images: [s_oSpriteLibrary.getSprite(szSpriteSelected+"_shot")], 
            framerate: 15,
            // width, height & registration point of each sprite
            frames: {width: PLAYER_WIDTH, height: PLAYER_HEIGHT, regX: PLAYER_WIDTH/2, regY: PLAYER_WIDTH}, 
            animations: {idle:[0, 20, "idle"]}
        };
        _oSpriteSheetPlayer = new createjs.SpriteSheet(_oTeamSprite);
        if(_oAnimation === null){
            _oAnimation = new createjs.Sprite(_oSpriteSheetPlayer, "idle");
        }else{
            _oAnimation.spriteSheet = _oSpriteSheetPlayer;
        }
        _oAnimation.x = iX;
        _oAnimation.y = iY;
        _oAnimation.currentAnimationFrame = 0;
        _oContainer.addChild(_oAnimation);
    };
    
    this.changeAlpha = function(){
        _oAnimation.alpha = 0.5;
    };
    
    this.getFrame = function(){
        return _oAnimation.currentFrame;
    };
    
    this.unload = function(){
        _oPlayer = null;
        _oContainer.removeAllChildren();
    };
    
    s_oPlayer = this;
    
    this._init(oParentContainer);
    
}
s_oPlayer = null;