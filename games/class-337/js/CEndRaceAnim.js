function CEndRaceAnim(){
    
    var _oSprite;
    var _oContainer;
    
    this._init = function(){
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        s_oStage.addChild(_oContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('flag_finish');
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: 309, height: 251, regX: 154, regY: 125}, 
                        animations: {start:0,anim:[0,19]}
                    };
        
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oSprite = createSprite(oSpriteSheet,"start",154,125,309,251);
        _oSprite.x = CANVAS_WIDTH/2;
        _oSprite.y = CANVAS_HEIGHT/2+5;
        _oContainer.addChild(_oSprite);
        
        var oTextOutline = new createjs.Text(TEXT_END_RACE, "32px " + FONT_GAME, "#000");
        oTextOutline.x = CANVAS_WIDTH/2;
        oTextOutline.y = CANVAS_HEIGHT/2;
        oTextOutline.textAlign = "center";
        oTextOutline.textBaseline = "middle";
        oTextOutline.outline = 6;
        _oContainer.addChild(oTextOutline);
        
        var oText = new createjs.Text(TEXT_END_RACE, "32px " + FONT_GAME, "#fff");
        oText.x = CANVAS_WIDTH/2;
        oText.y = CANVAS_HEIGHT/2;
        oText.textAlign = "center";
        oText.textBaseline = "middle";
        _oContainer.addChild(oText);
    };
    
    this.show = function(){
        _oContainer.alpha = 0;
        _oContainer.visible = true;
        
        _oSprite.gotoAndPlay("anim");
        createjs.Tween.get(_oContainer).to({alpha: 1}, 500, createjs.Ease.cubicOut);
    };
    
    this.hide = function(){
        createjs.Tween.get(_oContainer).to({alpha: 0}, 500, createjs.Ease.cubicOut).call(function(){
                                                                                _oContainer.visible = false;
                                                                                _oSprite.gotoAndStop("start");
                                                                    });
    };
    
    this._init();
    
}