function CRetryPanel(){
  
    var _oButHome;
    var _oButRestart;
    var _oFade;
    var _oPanelContainer;
    var _oParent;
    
    var _pStartPanelPos;
  
    this._init = function(){
        
        playSound('arrive_lose', 1,false);
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oFade.on("mousedown",function(){});
        s_oStage.addChild(_oFade);
        
        new createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
        _oPanelContainer = new createjs.Container();        
        s_oStage.addChild(_oPanelContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        var oPanel = createBitmap(oSprite);        
        oPanel.regX = oSprite.width/2;
        oPanel.regY = oSprite.height/2;
        _oPanelContainer.addChild(oPanel);
        
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = CANVAS_HEIGHT + oSprite.height/2;  
        _pStartPanelPos = {x: _oPanelContainer.x, y: _oPanelContainer.y};
        new createjs.Tween.get(_oPanelContainer).to({y:CANVAS_HEIGHT/2 - 40},500, createjs.Ease.quartIn);
        
        var oTitleStroke = new createjs.Text(TEXT_LOSE," 50px "+PRIMARY_FONT, "#000000");
        oTitleStroke.y = -oSprite.height/2 + 120;
        oTitleStroke.textAlign = "center";
        oTitleStroke.textBaseline = "middle";
        oTitleStroke.lineWidth = 500;
        oTitleStroke.outline = 5;
        _oPanelContainer.addChild(oTitleStroke);

        var oTitle = new createjs.Text(TEXT_LOSE," 50px "+PRIMARY_FONT, "#ffffff");
        oTitle.y = oTitleStroke.y;
        oTitle.textAlign = "center";
        oTitle.textBaseline = "middle";
        oTitle.lineWidth = 500;
        _oPanelContainer.addChild(oTitle);
        
        _oButRestart = new CGfxButton(110, 80, s_oSpriteLibrary.getSprite('but_restart'), _oPanelContainer);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onButRestart, this);
        _oButRestart.pulseAnimation();
        
        _oButHome = new CGfxButton(-110, 80, s_oSpriteLibrary.getSprite('but_home'), _oPanelContainer);
        _oButHome.addEventListener(ON_MOUSE_UP, this._onButHome, this); 

    };
    
    this._showShop = function(){
        new CShopPanel(this._onButContinue);
    };
    
    this._onButHome = function () {
        _oButRestart.setClickable(false);
        _oButHome.setClickable(false);
        
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            _oParent.unload();
            s_oGame.onExit();
        }); 
    };

    this._onButRestart = function () {
        _oButRestart.setClickable(false);
        _oButHome.setClickable(false);
        
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            _oParent.unload();
            s_oGame.restartGame();
            $(s_oMain).trigger("show_interlevel_ad");
        }); 
    };
    
    this.unload = function(){
        _oButRestart.unload();
        _oButHome.unload();

        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        _oFade.off("mousedown",function(){});
    };
    
    _oParent = this;
    this._init();
    
};




