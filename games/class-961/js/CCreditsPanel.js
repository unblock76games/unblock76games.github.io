function CCreditsPanel(){
    
    var _oFade;
    var _oPanelContainer;
    var _oButExit;
    var _oLogo;
    
    var _pStartPanelPos;
    
    this._init = function(){
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oFade.on("click",function(){});
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
        new createjs.Tween.get(_oPanelContainer).to({y:CANVAS_HEIGHT/2 - 40},500, createjs.Ease.cubicOut);

        var oTitleStroke = new createjs.Text("DEVELOPED BY"," 40px "+PRIMARY_FONT, "#3e240b");
        oTitleStroke.y = -oSprite.height/2 + 110;
        oTitleStroke.textAlign = "center";
        oTitleStroke.textBaseline = "middle";
        oTitleStroke.lineWidth = 500;
        oTitleStroke.outline = 5;
        _oPanelContainer.addChild(oTitleStroke);

        var oTitle = new createjs.Text("DEVELOPED BY"," 40px "+PRIMARY_FONT, "#ffffff");
        oTitle.y = oTitleStroke.y;
        oTitle.textAlign = "center";
        oTitle.textBaseline = "middle";
        oTitle.lineWidth = 500;
        _oPanelContainer.addChild(oTitle);

        var oLinkStroke = new createjs.Text("www.codethislab.com"," 40px "+PRIMARY_FONT, "#3e240b");
        oLinkStroke.y = 90;
        oLinkStroke.textAlign = "center";
        oLinkStroke.textBaseline = "middle";
        oLinkStroke.lineWidth = 600;
        oLinkStroke.outline = 5;
        //_oPanelContainer.addChild(oLinkStroke);

        var oLink = new createjs.Text("www.codethislab.com"," 40px "+PRIMARY_FONT, "#ffffff");
        oLink.y = oLinkStroke.y;
        oLink.textAlign = "center";
        oLink.textBaseline = "middle";
        oLink.lineWidth = 600;
        //_oPanelContainer.addChild(oLink);
        
        var oSprite = s_oSpriteLibrary.getSprite('ctl_logo');
        _oLogo = createBitmap(oSprite);
        _oLogo.on("click",this._onLogoButRelease);
        _oLogo.regX = oSprite.width/2;
        _oLogo.regY = oSprite.height/2;
        _oPanelContainer.addChild(_oLogo);
      
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _oButExit = new CGfxButton(282, -155, oSprite, _oPanelContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);
        
    };
    
    this.unload = function(){
        
        _oButExit.setClickable(false);
        
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            s_oStage.removeChild(_oFade);
            s_oStage.removeChild(_oPanelContainer);

            _oButExit.unload();
        }); 
        
        _oFade.off("click",function(){});
        _oLogo.off("click",this._onLogoButRelease);
        
        
    };
    
    this._onLogoButRelease = function(){
        //window.open("http://www.codethislab.com/index.php?&l=en");
    };
    
    this._onMoreGamesReleased = function(){
        //window.open("http://codecanyon.net/collections/5409142-games");
    };
    
    this._init();
    
    
};


