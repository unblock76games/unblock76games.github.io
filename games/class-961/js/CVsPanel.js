function CVsPanel(iStage){
    var _bExitPanel;
    
    var _iWidth;
    var _iHeight;
    
    var _oFade;
    var _oPanelContainer;
    var _oParent;
    var _oOpponentCar;
    var _oPlayerCar;
    var _oVsTextStroke;
    var _oVsText;
    var _oCoinsTextStroke;
    var _oCoinsText;
    
    var _pStartPanelPos;
    
    this._init = function(iStage){
        _bExitPanel = false;
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oFade.on("mousedown",function(){_oParent._onExit()});
        s_oStage.addChild(_oFade);
        
        new createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
        _oPanelContainer = new createjs.Container();     
        _oPanelContainer.on("pressup",function(){_oParent._onExit()});
        s_oStage.addChild(_oPanelContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        _iWidth = oSprite.width;
        _iHeight = oSprite.height;
        var oPanel = createBitmap(oSprite);        
        oPanel.regX = _iWidth/2;
        oPanel.regY = _iHeight/2;
        _oPanelContainer.addChild(oPanel);
        
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = CANVAS_HEIGHT/2;  
        _pStartPanelPos = {x: _oPanelContainer.x, y: _oPanelContainer.y};
        new createjs.Tween.get(_oPanelContainer).to({y:CANVAS_HEIGHT/2},500, createjs.Ease.cubicIn);

        _oPlayerCar = new CCar(CANVAS_WIDTH/2, 135, _oPanelContainer, 0, true, OPPONENT_ENGINE_GEAR[iStage], iStage);
        _oPlayerCar.getCar().scaleX = -1;
        _oOpponentCar = new CCar(-CANVAS_WIDTH/2, -45, _oPanelContainer, iStage+1, false, OPPONENT_ENGINE_GEAR[iStage], iStage);
      
        _oVsTextStroke = new createjs.Text(TEXT_VS," 100px "+PRIMARY_FONT, "#3e240b");
        _oVsTextStroke.textAlign = "center";
        _oVsTextStroke.textBaseline = "middle";
        _oVsTextStroke.lineWidth = 400;
        _oVsTextStroke.outline = 5;
        _oVsTextStroke.alpha = 0;
        _oVsTextStroke.scaleX = _oVsTextStroke.scaleY = 4;
        _oVsTextStroke.y = 15;
        _oPanelContainer.addChild(_oVsTextStroke);

        _oVsText = new createjs.Text(_oVsTextStroke.text," 100px "+PRIMARY_FONT, "rgba(255,224,0,1)");
        _oVsText.textAlign = "center";
        _oVsText.textBaseline = "middle";
        _oVsText.lineWidth = 400;
        _oVsText.alpha = 0;
        _oVsText.scaleX = _oVsText.scaleY = 4;
        _oVsText.y = _oVsTextStroke.y;  
        _oPanelContainer.addChild(_oVsText);
      
        var iLastLevelCompleted = 0;
        var aLevelTime = s_oLocalStorage.getItemJson(LOCALSTORAGE_TIMES);
        for (var i = 0; i < aLevelTime.length; i++) {
            if(aLevelTime[i] > 0){
                iLastLevelCompleted++;
            }
        }

        var iFirstWinCoins = 0;
        var szFirstWin = "";
        if(iStage >= iLastLevelCompleted){
            iFirstWinCoins = STAGE_WIN_REWARDS[iStage];
            szFirstWin = TEXT_CURRENCY + iFirstWinCoins;
        } else {
            szFirstWin = TEXT_BONUS_ONLY;
        }
         iFirstWinCoins = STAGE_WIN_REWARDS[iStage];
        _oCoinsTextStroke = new createjs.Text(TEXT_PRIZE +": " +szFirstWin," 40px "+PRIMARY_FONT, "#3e240b");
        _oCoinsTextStroke.x = -302;
        _oCoinsTextStroke.y = 160;
        _oCoinsTextStroke.textAlign = "left";
        _oCoinsTextStroke.textBaseline = "middle";
        _oCoinsTextStroke.lineWidth = 700;
        _oCoinsTextStroke.outline = 5;
        _oCoinsTextStroke.alpha = 0;
        _oCoinsTextStroke.scaleX = _oCoinsTextStroke.scaleY = 4;
        _oPanelContainer.addChild(_oCoinsTextStroke);

        _oCoinsText = new createjs.Text(_oCoinsTextStroke.text," 40px "+PRIMARY_FONT, "rgba(255,224,0,1)");
        _oCoinsText.x = _oCoinsTextStroke.x;
        _oCoinsText.y = _oCoinsTextStroke.y;
        _oCoinsText.textAlign = "left";
        _oCoinsText.textBaseline = "middle";
        _oCoinsText.lineWidth = 700;
        _oCoinsText.alpha = 0;
        _oCoinsText.scaleX = _oCoinsText.scaleY = 4;
        _oPanelContainer.addChild(_oCoinsText);

      
        this._introAnim();
        
    };
    
    this.unload = function(){
        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        _oPanelContainer.off("pressup",function(){_oParent._onExit();});
        _oFade.off("pressup",function(){_oParent._onExit();});

        _oPlayerCar.unload();
        _oOpponentCar.unload();

    };
    
    this._introAnim = function(){
        new createjs.Tween.get(_oOpponentCar.getCar()).to({x:-200}, 2000, createjs.Ease.cubicOut);
        new createjs.Tween.get(_oOpponentCar.getWheels().right).to({rotation:1500}, 2000, createjs.Ease.cubicOut);
        new createjs.Tween.get(_oOpponentCar.getWheels().left).to({rotation:1500}, 2000, createjs.Ease.cubicOut);
        
        new createjs.Tween.get(_oPlayerCar.getCar()).to({x:200}, 2000, createjs.Ease.cubicOut);
        new createjs.Tween.get(_oPlayerCar.getWheels().right).to({rotation:1500}, 2000, createjs.Ease.cubicOut);
        new createjs.Tween.get(_oPlayerCar.getWheels().left).to({rotation:1500}, 2000, createjs.Ease.cubicOut);
        
        new createjs.Tween.get(_oVsText).wait(500).to({alpha: 1, scaleX:1, scaleY:1}, 1000, createjs.Ease.cubicIn);
        new createjs.Tween.get(_oVsTextStroke).wait(500).to({alpha: 1, scaleX:1, scaleY:1}, 1000, createjs.Ease.cubicIn);
        
        new createjs.Tween.get(_oCoinsText).wait(750).to({alpha: 1, scaleX:1, scaleY:1}, 1000, createjs.Ease.cubicIn);
        new createjs.Tween.get(_oCoinsTextStroke).wait(750).to({alpha: 1, scaleX:1, scaleY:1}, 1000, createjs.Ease.cubicIn);
    };
    
    this._outroAnim = function(){

        setTimeout(function(){
            _oOpponentCar.highlight();
            _oPlayerCar.highlight();
        }, 300);
        
        playSound('acceleration', 1, false);
        
        new createjs.Tween.get(_oOpponentCar.getCar(), {override:true}).to({x:CANVAS_WIDTH/2}, 1000, createjs.Ease.cubicIn);
        new createjs.Tween.get(_oOpponentCar.getWheels().right, {override:true}).to({rotation:3000}, 1000, createjs.Ease.cubicIn);
        new createjs.Tween.get(_oOpponentCar.getWheels().left, {override:true}).to({rotation:3000}, 1000, createjs.Ease.cubicIn);
        
        new createjs.Tween.get(_oPlayerCar.getCar(), {override:true}).to({x:-CANVAS_WIDTH/2}, 1000, createjs.Ease.cubicIn);
        new createjs.Tween.get(_oPlayerCar.getWheels().right, {override:true}).to({rotation:3000}, 1000, createjs.Ease.cubicIn);
        new createjs.Tween.get(_oPlayerCar.getWheels().left, {override:true}).to({rotation:3000}, 1000, createjs.Ease.cubicIn);
    };
    
    this._onExit = function(){
        if(_bExitPanel){
            return;
        }
        _bExitPanel = true;

        _oParent._outroAnim();
        
        new createjs.Tween.get(_oFade).to({alpha:0},1000);
        new createjs.Tween.get(_oPanelContainer).to({alpha:0},1000).call(function(){
            s_oGame._onExitVersusPanel();
            _oParent.unload();
        });
        
        
    };
    
    _oParent = this;
    this._init(iStage);
}

