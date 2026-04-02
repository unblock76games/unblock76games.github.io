function CMsgBox(oText) {
    var _oBg;
    var _oMsgText;
    var _oMsgTextStroke;
    var _oContainer;
    var _oText = oText; // THE TEXT THAT WILL BE USED IN THIS MESSAGE

    this._init = function () {
        _oContainer = new createjs.Container();
        _oContainer.x = CANVAS_WIDTH_HALF;
        _oContainer.y = CANVAS_HEIGHT_HALF;
        _oContainer.scaleX = 0;
        _oContainer.scaleY = 0;
        s_oStage.addChild(_oContainer);

        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box_small');
        _oBg = createBitmap(oSpriteBg);
        _oBg.regX = oSpriteBg.width/2;
        _oBg.regY = oSpriteBg.height/2;
        _oContainer.addChild(_oBg);

        _oMsgTextStroke = new CTLText(_oContainer, 
                    -110, -70, 220, 140, 
                    20, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    _oText,
                    true, true, true,
                    false );
        _oMsgTextStroke.setOutline(3);            
        

        _oMsgText = new CTLText(_oContainer, 
                    -110, -70, 220, 140, 
                    20, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    _oText,
                    true, true, true,
                    false );

        new createjs.Tween.get(_oContainer)
                .to({scaleX: 1, scaleY: 1},1000, createjs.Ease.elasticOut)
                .call(this.fadeOut);
    };

    this.fadeOut = function() {
        new createjs.Tween.get(_oContainer)
                .wait(1000)
                .to({scaleX: 0, scaleY: 0},500, createjs.Ease.cubicOut)
                .call( function() { s_oStage.removeChild(_oContainer); } );
    };

    this._init(oText);
}