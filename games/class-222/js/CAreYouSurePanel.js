function CAreYouSurePanel() {
    var _oButYes;
    var _oButNo;
    var _oFade;
    var _oPanelContainer;
    var _oParent;
    var _oListener;
    
    var _pStartPanelPos;

    this._init = function () {
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oListener = _oFade.on("mousedown",function(){});
        s_oStage.addChild(_oFade);

        _oPanelContainer = new createjs.Container();        
        s_oStage.addChild(_oPanelContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        var oPanel = createBitmap(oSprite);  
        oPanel.regX = oSprite.width/2;
        oPanel.regY = oSprite.height/2;
        oPanel.x = CANVAS_WIDTH_HALF;
        oPanel.y = CANVAS_HEIGHT_HALF;
        _oPanelContainer.addChild(oPanel);

        _oPanelContainer.y = CANVAS_HEIGHT + oSprite.height/2;  
        _pStartPanelPos = {x: _oPanelContainer.x, y: _oPanelContainer.y};

        var oTitleBack = new CTLText(_oPanelContainer, 
                    CANVAS_WIDTH/2-200, CANVAS_HEIGHT_HALF - 130, 400, 100, 
                    50, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_ARE_SURE,
                    true, true, true,
                    false );
                    
        oTitleBack.setOutline(5);

        var oTitle = new CTLText(_oPanelContainer, 
                    CANVAS_WIDTH/2-200, CANVAS_HEIGHT_HALF - 130, 400, 100, 
                    50, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_ARE_SURE,
                    true, true, true,
                    false );

        
        var iButtonsY = CANVAS_HEIGHT_HALF + 80;

        _oButYes = new CGfxButton(CANVAS_WIDTH_HALF + 100, iButtonsY, s_oSpriteLibrary.getSprite('but_yes'), _oPanelContainer);
        _oButYes.addEventListener(ON_MOUSE_UP, this._onButYes, this);

        _oButNo = new CGfxButton(CANVAS_WIDTH_HALF - 100, iButtonsY, s_oSpriteLibrary.getSprite('but_no'), _oPanelContainer);
        _oButNo.addEventListener(ON_MOUSE_UP, this._onButNo, this);
        
        this.hide();
    };

    this._onButYes = function () {
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            _oParent.hide();
            s_oGame.onExit();
        }); 
    };

    this._onButNo = function () {
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            _oParent.hide();
        }); 
        
        s_oGame.unpause();
    };

    this.hide = function(){
        _oPanelContainer.visible = false;
    };

    this.show = function(){
        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        _oPanelContainer.y = CANVAS_HEIGHT + oSprite.height/2;  
        
        new createjs.Tween.get(_oPanelContainer).to({y:0},1000, createjs.Ease.backOut);
        new createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
        _oPanelContainer.visible = true;
    };

    this.unload = function () {
        _oButNo.unload();
        _oButYes.unload();
        
        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        _oFade.off("mousedown",_oListener);
    };

    _oParent = this;
    this._init();
}