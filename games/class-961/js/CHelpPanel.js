function CHelpPanel(){
    var _bExitPanel;
    
    var _oText1;
    var _oText1Back;
    var _oText2;
    var _oText2Back;    

    var _oFade;
    var _oPanelContainer;
    var _oParent;
    var _oButGear;

    var _pStartPanelPos;

    this._init = function(){
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oFade.on("mousedown",function(){_oParent._onExitHelp()});
        s_oStage.addChild(_oFade);
        
        new createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
        _oPanelContainer = new createjs.Container();     
        _oPanelContainer.on("pressup",function(){_oParent._onExitHelp()});
        s_oStage.addChild(_oPanelContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        var oPanel = createBitmap(oSprite);        
        oPanel.regX = oSprite.width/2;
        oPanel.regY = oSprite.height/2;
        _oPanelContainer.addChild(oPanel);
        
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = CANVAS_HEIGHT + oSprite.height/2;  
        _pStartPanelPos = {x: _oPanelContainer.x, y: _oPanelContainer.y};
        new createjs.Tween.get(_oPanelContainer).to({y:CANVAS_HEIGHT/2 - 40},500, createjs.Ease.cubicOut);
  
        var oText1Pos = {x: -280, y: -150};
  
        _oText1Back = new createjs.Text(TEXT_HELP1," 24px "+PRIMARY_FONT, "#3e240b");
        _oText1Back.x = oText1Pos.x;
        _oText1Back.y = oText1Pos.y;
        _oText1Back.textAlign = "left";
        _oText1Back.textBaseline = "alphabetic";
        _oText1Back.lineWidth = 400;
        _oText1Back.outline = 4;
        _oPanelContainer.addChild(_oText1Back);
  
        _oText1 = new createjs.Text(TEXT_HELP1," 24px "+PRIMARY_FONT, "#ffffff");
        _oText1.x = oText1Pos.x;
        _oText1.y = oText1Pos.y;
        _oText1.textAlign = "left";
        _oText1.textBaseline = "alphabetic";
        _oText1.lineWidth = 400;                
        _oPanelContainer.addChild(_oText1);
  
        var oSprite = s_oSpriteLibrary.getSprite('accelerator');
        var oAccelerator = createBitmap(oSprite);        
        oAccelerator.regX = oSprite.width/2;
        oAccelerator.regY = oSprite.height/2;
        oAccelerator.x = 200;
        oAccelerator.y = -100;
        oAccelerator.scaleX = oAccelerator.scaleY = 0.7; 
        _oPanelContainer.addChild(oAccelerator);
  
        var oText2Pos = {x: -280, y:70};
  
        _oText2Back = new createjs.Text(TEXT_HELP2," 24px "+PRIMARY_FONT, "#3e240b");
        _oText2Back.x = oText2Pos.x;
        _oText2Back.y = oText2Pos.y;
        _oText2Back.textAlign = "left";
        _oText2Back.textBaseline = "alphabetic";
        _oText2Back.lineWidth = 350;
        _oText2Back.outline = 4;
        _oPanelContainer.addChild(_oText2Back);
  
        _oText2 = new createjs.Text(TEXT_HELP2," 24px "+PRIMARY_FONT, "#ffffff");
        _oText2.x = oText2Pos.x;
        _oText2.y = oText2Pos.y;
        _oText2.textAlign = "left";
        _oText2.textBaseline = "alphabetic";
        _oText2.lineWidth = 350;        
        _oPanelContainer.addChild(_oText2);

        var oSprite = s_oSpriteLibrary.getSprite('but_gear');
        var pStartPosGear = {x: 200, y: 80};
        _oButGear = new CGearButton(pStartPosGear.x, pStartPosGear.y, oSprite, _oPanelContainer);
        _oButGear.setClickable(false);

    };

    this.unload = function(){
        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        _oPanelContainer.off("pressup",function(){_oParent._onExitHelp()});
        _oFade.off("pressup",function(){_oParent._onExitHelp()});
        
        _oButGear.unload();
    };

    this._onExitHelp = function(){
        if(_bExitPanel){
            return;
        }
        _bExitPanel = true;

        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){

            _oParent.unload();
            s_oGame._onExitHelp();
        });
    };

    _oParent=this;
    this._init();

}
