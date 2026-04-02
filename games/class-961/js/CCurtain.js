function CCurtain(oParentContainer){
    
    var _oTop;
    var _oBot;
    var _oCurtain;
    
    this._init = function(oParentContainer){
        
        _oCurtain = new createjs.Container();
        oParentContainer.addChild(_oCurtain);
        
        ////////TOP SECTION
        _oTop = new createjs.Container();
        _oTop.y = 0;
        _oTop.on("mousedown", function(){});
        _oCurtain.addChild(_oTop);
        
        var oSprite = s_oSpriteLibrary.getSprite('curtain_top');
        var oTopSprite = createBitmap(oSprite);
        _oTop.addChild(oTopSprite);
        
        ////////BOT SECTION
        _oBot = new createjs.Container();
        _oBot.y = CANVAS_HEIGHT/2;
        _oBot.on("mousedown", function(){});
        _oCurtain.addChild(_oBot);
        
        var oSprite = s_oSpriteLibrary.getSprite('curtain_bot');
        var oBotSprite = createBitmap(oSprite);
        _oBot.addChild(oBotSprite);
        
    };
    
    this.unload = function(){
        oParentContainer.removeChild(_oCurtain);
    };
    
    this.openAnim = function(){
        _oTop.y = 0;
        _oBot.y = CANVAS_HEIGHT/2;
        
        new createjs.Tween.get(_oTop, {override: true}).to({y:-CANVAS_HEIGHT/2}, 1000, createjs.Ease.cubicOut);
        new createjs.Tween.get(_oBot, {override: true}).to({y:CANVAS_HEIGHT}, 1000, createjs.Ease.cubicOut);
    };
    
    this.closeAnim = function(oFunction){
        _oTop.y = -CANVAS_HEIGHT/2;
        _oBot.y = CANVAS_HEIGHT;
        
        new createjs.Tween.get(_oTop, {override: true}).to({y:0}, 1000, createjs.Ease.cubicOut);
        new createjs.Tween.get(_oBot, {override: true}).to({y:CANVAS_HEIGHT/2}, 1000, createjs.Ease.cubicOut).call(function(){
            if(oFunction){
                oFunction();
            }
        });
    };
    
    this._init(oParentContainer);
    
}


