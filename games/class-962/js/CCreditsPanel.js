function CCreditsPanel(){
    var _pStartPosExit;
    var _oListener;
    var _oHitArea;
    var _oPanelContainer;
    var _oButExit;
    var _oLogo;
    
    this._init = function(){
        _oPanelContainer = new createjs.Container();        
        s_oStage.addChild(_oPanelContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('credits_bg');
        var oPanel = createBitmap(oSprite);        
        _oPanelContainer.addChild(oPanel);
        
        var oTitleOutline = new createjs.Text(TEXT_DEVELOPED," 30px "+FONT_GAME, "#000");
        oTitleOutline.x = CANVAS_WIDTH/2;
        oTitleOutline.y = 255;
        oTitleOutline.textAlign = "center";
        oTitleOutline.textBaseline = "middle";
        oTitleOutline.lineWidth = 300;
        oTitleOutline.outline = 2;
        _oPanelContainer.addChild(oTitleOutline);
        
        var oTitle = new createjs.Text(TEXT_DEVELOPED," 30px "+FONT_GAME, "#fcff00");
        oTitle.x = CANVAS_WIDTH/2;
        oTitle.y = 255;
        oTitle.textAlign = "center";
        oTitle.textBaseline = "middle";
        oTitle.lineWidth = 300;
        _oPanelContainer.addChild(oTitle);
        
        var oLinkOutline = new createjs.Text("www.codethislab.com"," 26px "+FONT_GAME, "#000");
        oLinkOutline.x = CANVAS_WIDTH/2;
        oLinkOutline.y = 390;
        oLinkOutline.textAlign = "center";
        oLinkOutline.textBaseline = "middle";
        oLinkOutline.lineWidth = 300;
        oLinkOutline.outline = 2;
        //_oPanelContainer.addChild(oLinkOutline);
        
        var oLink = new createjs.Text("www.codethislab.com"," 26px "+FONT_GAME, "#fcff00");
        oLink.x = CANVAS_WIDTH/2;
        oLink.y = 390;
        oLink.textAlign = "center";
        oLink.textBaseline = "middle";
        oLink.lineWidth = 300;
        //_oPanelContainer.addChild(oLink);
        
        var oSprite = s_oSpriteLibrary.getSprite('ctl_logo');
        _oLogo = createBitmap(oSprite);
        _oLogo.regX = oSprite.width/2;
        _oLogo.regY = oSprite.height/2;
        _oLogo.x = CANVAS_WIDTH/2;
        _oLogo.y = CANVAS_HEIGHT/2;
        _oPanelContainer.addChild(_oLogo);
      
        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("#0f0f0f").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oHitArea.alpha = 0.01;
        _oListener = _oHitArea.on("click", this._onLogoButRelease);
        _oPanelContainer.addChild(_oHitArea);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x:CANVAS_WIDTH - oSprite.width/2 - 10,y:oSprite.height/2 + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, _oPanelContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function(){
        _oHitArea.off("click", _oListener);
        s_oStage.removeChild(_oPanelContainer);

        _oButExit.unload();
        
        s_oMenu.exitFromCredits();
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButExit.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
    };  
        
    this._onLogoButRelease = function(){
        //window.open("http://www.codethislab.com/index.php?&l=en");
    };
    
    this._init();
    
    
};


