function CShopPanel(oFunction) {
    var _iGearLevel;
    var _iSpeedLevel;
    var _iNitroLevel;
    var _iCoins;

    var _oCoins;
    var _oCoinsText;
    var _oCoinsTextStroke;
    var _oButExit;
    var _oButGear;
    var _oButSpeed;
    var _oButNitro;
    var _oFade;
    var _oPanelContainer;
    var _oParent;
    
    var _pStartPanelPos;

    

    this._init = function (oFunction) {
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
        new createjs.Tween.get(_oPanelContainer).to({y:CANVAS_HEIGHT/2 - 40},500, createjs.Ease.cubicOut);
        
        var oTitleStroke = new createjs.Text(TEXT_SHOP," 50px "+PRIMARY_FONT, "#3e240b");
        oTitleStroke.y = -oSprite.height/2 + 50;
        oTitleStroke.textAlign = "center";
        oTitleStroke.textBaseline = "middle";
        oTitleStroke.lineWidth = 400;
        oTitleStroke.outline = 5;
        _oPanelContainer.addChild(oTitleStroke);

        var oTitle = new createjs.Text(TEXT_SHOP," 50px "+PRIMARY_FONT, "#ffffff");
        oTitle.y = oTitleStroke.y;
        oTitle.textAlign = "center";
        oTitle.textBaseline = "middle";
        oTitle.lineWidth = 400;
        _oPanelContainer.addChild(oTitle);

        _iCoins = parseInt(s_oLocalStorage.getItem(LOCALSTORAGE_COINS));
        _oCoins = {value: _iCoins};

        _oCoinsTextStroke = new createjs.Text(TEXT_CURRENCY + _oCoins.value," 40px "+PRIMARY_FONT, "#3e240b");
        _oCoinsTextStroke.y = 120;
        _oCoinsTextStroke.textAlign = "center";
        _oCoinsTextStroke.textBaseline = "middle";
        _oCoinsTextStroke.lineWidth = 400;
        _oCoinsTextStroke.outline = 5;
        _oPanelContainer.addChild(_oCoinsTextStroke);

        _oCoinsText = new createjs.Text(TEXT_CURRENCY + _oCoins.value," 40px "+PRIMARY_FONT, "#ffffff");
        _oCoinsText.y = _oCoinsTextStroke.y;
        _oCoinsText.textAlign = "center";
        _oCoinsText.textBaseline = "middle";
        _oCoinsText.lineWidth = 400;
        _oPanelContainer.addChild(_oCoinsText);

        var oSprite = s_oSpriteLibrary.getSprite('but_continue_small');
        _oButExit = new CGfxButton(282, 155, oSprite, _oPanelContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        _iGearLevel = parseInt(s_oLocalStorage.getItem(LOCALSTORAGE_GEARPOWER_LEVEL));
        _oButGear = new CUpgradeButton(-210, -34, s_oSpriteLibrary.getSprite('upgrade_gear'), _oPanelContainer, [100,300,900]);
        _oButGear.addEventListener(ON_MOUSE_UP, this._onButGear, this);
        _oButGear.setUpgrade(_iGearLevel);

        _iSpeedLevel = parseInt(s_oLocalStorage.getItem(LOCALSTORAGE_SPEEDPOWER_LEVEL));
        _oButSpeed = new CUpgradeButton(-8, -30, s_oSpriteLibrary.getSprite('upgrade_speed'), _oPanelContainer, [250,500,1000]);
        _oButSpeed.addEventListener(ON_MOUSE_UP, this._onButSpeed, this);
        _oButSpeed.setUpgrade(_iSpeedLevel);
        _oButSpeed.setTextPos(8);
        _oButSpeed.setSegmentPos(8);

        _iNitroLevel = parseInt(s_oLocalStorage.getItem(LOCALSTORAGE_NITROPOWER_LEVEL));
        _oButNitro = new CUpgradeButton(210, -30, s_oSpriteLibrary.getSprite('upgrade_nitro'), _oPanelContainer, [300,600,1200]);
        _oButNitro.addEventListener(ON_MOUSE_UP, this._onButNitro, this);
        _oButNitro.setUpgrade(_iNitroLevel);

        this._checkAvailability();

    };

    this._refreshCoins = function(){
        var iCoins = (_oCoins.value).toFixed(0);
        
        _oCoinsTextStroke.text = TEXT_CURRENCY + iCoins;
        _oCoinsText.text = TEXT_CURRENCY + iCoins;
    };

    this._onButGear = function(){
        _iGearLevel++;
        s_oLocalStorage.setItem(LOCALSTORAGE_GEARPOWER_LEVEL, _iGearLevel);
        
        GEAR_START_AREA.greenangle = GEAR_START_GREEN_WIDTH[_iGearLevel];
        GEAR_IN_RACE_AREA.greenangle = GEAR_INRACE_GREEN_WIDTH[_iGearLevel];
        WRONG_GEAR_CHANGE_STALL_DURATION = WRONG_GEAR_DURATION_INFO[_iGearLevel];
        
        _iCoins -= _oButGear.getPrice();
        s_oLocalStorage.setItem(LOCALSTORAGE_COINS, _iCoins);
        
        new createjs.Tween.get(_oCoins, {override:true}).to({value:_iCoins}, 2000, createjs.Ease.cubicOut).addEventListener("change", this._refreshCoins);
        
        _oButGear.increaseUpgrade();
        this._checkAvailability();
    };

    this._onButSpeed = function(){
        _iSpeedLevel++;
        s_oLocalStorage.setItem(LOCALSTORAGE_SPEEDPOWER_LEVEL, _iSpeedLevel);
        
        PLAYER_ENGINE_GEAR = PLAYER_ENGINE_INFO[_iSpeedLevel];
        
        _iCoins -= _oButSpeed.getPrice();
        s_oLocalStorage.setItem(LOCALSTORAGE_COINS, _iCoins);
        
        new createjs.Tween.get(_oCoins, {override:true}).to({value:_iCoins}, 2000, createjs.Ease.cubicOut).addEventListener("change", this._refreshCoins);
        
        _oButSpeed.increaseUpgrade();
        this._checkAvailability();
    };
    
    this._onButNitro = function(){
        _iNitroLevel++;
        s_oLocalStorage.setItem(LOCALSTORAGE_NITROPOWER_LEVEL, _iNitroLevel);
        
        NITRO_DURATION = NITRO_INFO[_iNitroLevel];
        
        _iCoins -= _oButNitro.getPrice();
        s_oLocalStorage.setItem(LOCALSTORAGE_COINS, _iCoins);
        
        new createjs.Tween.get(_oCoins, {override:true}).to({value:_iCoins}, 2000, createjs.Ease.cubicOut).addEventListener("change", this._refreshCoins);
        
        _oButNitro.increaseUpgrade();
        this._checkAvailability();
    };

    this._checkAvailability = function(){
        if(_iCoins<_oButGear.getPrice()){
            _oButGear.disable(true);
        }
        if(_iCoins<_oButSpeed.getPrice()){
            _oButSpeed.disable(true);
        }
        if(_iCoins<_oButNitro.getPrice()){
            _oButNitro.disable(true);
        }
    };

    this._onExit = function(){
        _oButGear.setClickable(false);
        _oButSpeed.setClickable(false);
        _oButNitro.setClickable(false);
        _oButExit.setClickable(false);
        
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){

            _oParent.unload();
            if(oFunction){
                oFunction();
            }
        }); 
    };

    this.unload = function () {
        _oButGear.unload();
        _oButSpeed.unload();
        _oButNitro.unload();
        _oButExit.unload();

        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        _oFade.off("mousedown",function(){});
        
        
    };

    _oParent = this;
    this._init(oFunction);
}


