function CCountdown(oInfo,oParentContainer){
    var _iCurTimeOffset;
    var _iCurState;

    var _oSprite;
    var _oParentContainer = oParentContainer;
    
    this._init = function(oInfo){
        _iCurState = 0;
        _iCurTimeOffset = 0;
        
        var oSprite = s_oSpriteLibrary.getSprite("semaphore");
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: oSprite.width/5, height: oSprite.height/3}, 
                        animations: {state_0:0,state_1:1,state_2:2,state_3:3,state_4:4,state_5:[5,14,"state_0"]}
                    };
        
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oSprite = createSprite(oSpriteSheet,"state_"+_iCurState,0,0,oSprite.width/5,oSprite.height/3);
        _oSprite.x = oInfo.x;
        _oSprite.y = oInfo.y;
        _oSprite.rotation = oInfo.rot;
        _oSprite.scaleX = _oSprite.scaleY = oInfo.scale;
        _oParentContainer.addChild(_oSprite);
    };
    
    this.unload = function(){
        _oParentContainer.removeChild(_oSprite);
    };
    
    this.update = function(){
        _iCurTimeOffset += s_iTimeElaps;
        if(_iCurTimeOffset > 1000){
            _iCurTimeOffset = 0;
            _iCurState++;
            _oSprite.gotoAndStop("state_"+_iCurState);
            playSound("countdown_1",1,false);
            if(_iCurState === 4){
                playSound("countdown_2",1,false);
                setTimeout(function(){_oSprite.gotoAndPlay("state_5");},1500);
                s_oGame.startRace();
            }
        } 
    };
    
    
    this._init(oInfo);
}