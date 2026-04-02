function CNextLevelPanel(iLevel, iTime, iOvertakingDistance){
  
    var _oButContinue;
    var _oButRestart;
    var _oFade;
    var _oPanelContainer;
    var _oParent;
    var _oCoins;
    var _oCoinsText;
    var _oCoinsTextStroke;
    
    var _pStartPanelPos;
  
    this._init = function(iLevel, iTime, iOvertakingDistance){
        
        playSound('arrive_win', 1,false);
        
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
        new createjs.Tween.get(_oPanelContainer).wait(1000).to({y:CANVAS_HEIGHT/2 - 40},500, createjs.Ease.cubicOut);
        
        var oTitleStroke = new createjs.Text(TEXT_WIN," 50px "+PRIMARY_FONT, "#3e240b");
        oTitleStroke.y = -oSprite.height/2 + 60;
        oTitleStroke.textAlign = "center";
        oTitleStroke.textBaseline = "alphabetic";
        oTitleStroke.lineWidth = 400;
        oTitleStroke.outline = 5;
        _oPanelContainer.addChild(oTitleStroke);

        var oTitle = new createjs.Text(TEXT_WIN," 50px "+PRIMARY_FONT, "#ffffff");
        oTitle.y = oTitleStroke.y;
        oTitle.textAlign = "center";
        oTitle.textBaseline = "alphabetic";
        oTitle.lineWidth = 400;
        _oPanelContainer.addChild(oTitle);
        
        var iLastLevelCompleted = 0;
        var aLevelTime = s_oLocalStorage.getItemJson(LOCALSTORAGE_TIMES);
        for (var i = 0; i < aLevelTime.length; i++) {
            if(aLevelTime[i] > 0){
                iLastLevelCompleted++;
            }
        }
        
        var iFirstWinCoins = 0;
        var szFirstWin = TEXT_FIRST_WIN + ": -";
        if(iLevel >= iLastLevelCompleted){
            iFirstWinCoins = STAGE_WIN_REWARDS[iLevel];
            szFirstWin = TEXT_FIRST_WIN + ": "+ TEXT_CURRENCY + STAGE_WIN_REWARDS[iLevel];
        }

        var oFirstWinStroke = new createjs.Text(szFirstWin," 30px "+PRIMARY_FONT, "#3e240b");
        oFirstWinStroke.y = -oSprite.height/2 + 100;
        oFirstWinStroke.textAlign = "center";
        oFirstWinStroke.textBaseline = "alphabetic";
        oFirstWinStroke.lineWidth = 400;
        oFirstWinStroke.outline = 5;
        _oPanelContainer.addChild(oFirstWinStroke);

        var oFirstWin = new createjs.Text(szFirstWin," 30px "+PRIMARY_FONT, "#ffffff");
        oFirstWin.y = oFirstWinStroke.y;
        oFirstWin.textAlign = "center";
        oFirstWin.textBaseline = "alphabetic";
        oFirstWin.lineWidth = 400;
        _oPanelContainer.addChild(oFirstWin);
        
        
        var oBonusStroke = new createjs.Text(TEXT_BONUS," 26px "+PRIMARY_FONT, "#3e240b");
        oBonusStroke.x = -250;
        oBonusStroke.y = -oSprite.height/2 + 150;
        oBonusStroke.textAlign = "left";
        oBonusStroke.textBaseline = "alphabetic";
        oBonusStroke.lineWidth = 400;
        oBonusStroke.outline = 5;
        _oPanelContainer.addChild(oBonusStroke);

        var oBonus = new createjs.Text(TEXT_BONUS," 26px "+PRIMARY_FONT, "#ffffff");
        oBonus.x = oBonusStroke.x;
        oBonus.y = oBonusStroke.y;
        oBonus.textAlign = "left";
        oBonus.textBaseline = "alphabetic";
        oBonus.lineWidth = 400;
        _oPanelContainer.addChild(oBonus);
        
        var iTrackCoins = Math.floor(STAGE_METER_LENGTH[iLevel] * 0.01 * BONUS_REWARD_TRACKLENGTH_MULTIPLIER); 
        var oTrackLengthStroke = new createjs.Text(TEXT_BONUS_TRACK_LENGTH + ": "+TEXT_CURRENCY + iTrackCoins," 18px "+PRIMARY_FONT, "#3e240b");
        oTrackLengthStroke.x = -250;
        oTrackLengthStroke.y = -oSprite.height/2 + 180;
        oTrackLengthStroke.textAlign = "left";
        oTrackLengthStroke.textBaseline = "alphabetic";
        oTrackLengthStroke.lineWidth = 400;
        oTrackLengthStroke.outline = 5;
        _oPanelContainer.addChild(oTrackLengthStroke);

        var oTrackLength = new createjs.Text(oTrackLengthStroke.text," 18px "+PRIMARY_FONT, "#ffffff");
        oTrackLength.x = oTrackLengthStroke.x;
        oTrackLength.y = oTrackLengthStroke.y;
        oTrackLength.textAlign = "left";
        oTrackLength.textBaseline = "alphabetic";
        oTrackLength.lineWidth = 400;
        _oPanelContainer.addChild(oTrackLength);
        
        var iOvertakingCoins = Math.floor(iOvertakingDistance * 0.1 *BONUS_REWARD_OVERTAKING_MULTIPLIER);
        var oOvertakingStroke = new createjs.Text(TEXT_BONUS_OVERTAKING + ": "+TEXT_CURRENCY + iOvertakingCoins," 18px "+PRIMARY_FONT, "#3e240b");
        oOvertakingStroke.x = -250;
        oOvertakingStroke.y = -oSprite.height/2 + 205;
        oOvertakingStroke.textAlign = "left";
        oOvertakingStroke.textBaseline = "alphabetic";
        oOvertakingStroke.lineWidth = 400;
        oOvertakingStroke.outline = 5;
        _oPanelContainer.addChild(oOvertakingStroke);

        var oOvertaking = new createjs.Text(oOvertakingStroke.text," 18px "+PRIMARY_FONT, "#ffffff");
        oOvertaking.x = oOvertakingStroke.x;
        oOvertaking.y = oOvertakingStroke.y;
        oOvertaking.textAlign = "left";
        oOvertaking.textBaseline = "alphabetic";
        oOvertaking.lineWidth = 400;
        _oPanelContainer.addChild(oOvertaking);
        
        var iDifficultyCoins = (iLevel+1) * BONUS_REWARD_DIFFICULTY_MULTIPLIER;
        var oDifficultyStroke = new createjs.Text(TEXT_BONUS_DIFFICULTY + ": "+TEXT_CURRENCY + iDifficultyCoins," 18px "+PRIMARY_FONT, "#3e240b");
        oDifficultyStroke.x = -250;
        oDifficultyStroke.y = -oSprite.height/2 + 230;
        oDifficultyStroke.textAlign = "left";
        oDifficultyStroke.textBaseline = "alphabetic";
        oDifficultyStroke.lineWidth = 400;
        oDifficultyStroke.outline = 5;
        _oPanelContainer.addChild(oDifficultyStroke);

        var oDifficulty = new createjs.Text(oDifficultyStroke.text," 18px "+PRIMARY_FONT, "#ffffff");
        oDifficulty.x = oDifficultyStroke.x;
        oDifficulty.y = oDifficultyStroke.y;
        oDifficulty.textAlign = "left";
        oDifficulty.textBaseline = "alphabetic";
        oDifficulty.lineWidth = 400;
        _oPanelContainer.addChild(oDifficulty);
        
        _oButContinue = new CGfxButton(245, 120, s_oSpriteLibrary.getSprite('but_continue'), _oPanelContainer);
        _oButContinue.addEventListener(ON_MOUSE_UP, this._showShop, this);
        _oButContinue.pulseAnimation();   

        _oButRestart = new CGfxButton(-245, 120, s_oSpriteLibrary.getSprite('but_restart'), _oPanelContainer);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onButRestart, this);
        
        this._sendBestTime(iLevel, iTime);
        
        
        var iPrevCoins = parseInt(s_oLocalStorage.getItem(LOCALSTORAGE_COINS));
        var iNewCoins = iPrevCoins + iFirstWinCoins + iTrackCoins + iOvertakingCoins + iDifficultyCoins;
        s_oLocalStorage.setItem(LOCALSTORAGE_COINS, iNewCoins);
        
        _oCoinsTextStroke = new createjs.Text(TEXT_CURRENCY + iPrevCoins," 40px "+PRIMARY_FONT, "#3e240b");
        _oCoinsTextStroke.x = 250;
        _oCoinsTextStroke.y = oDifficulty.y;
        _oCoinsTextStroke.textAlign = "right";
        _oCoinsTextStroke.textBaseline = "alphabetic";
        _oCoinsTextStroke.lineWidth = 400;
        _oCoinsTextStroke.outline = 5;
        _oPanelContainer.addChild(_oCoinsTextStroke);

        _oCoinsText = new createjs.Text(TEXT_CURRENCY + iPrevCoins," 40px "+PRIMARY_FONT, "#ffffff");
        _oCoinsText.x = _oCoinsTextStroke.x;
        _oCoinsText.y = _oCoinsTextStroke.y;
        _oCoinsText.textAlign = "right";
        _oCoinsText.textBaseline = "alphabetic";
        _oCoinsText.lineWidth = 400;
        _oPanelContainer.addChild(_oCoinsText);
        
        _oCoins = {value:iPrevCoins};
        new createjs.Tween.get(_oCoins, {override:true}).to({value:iNewCoins}, 3000, createjs.Ease.cubicOut).addEventListener("change", this._refreshCoins);
        
    };
    
    this._refreshCoins = function(){
        var iCoins = (_oCoins.value).toFixed(0);
        
        _oCoinsTextStroke.text = TEXT_CURRENCY + iCoins;
        _oCoinsText.text = TEXT_CURRENCY + iCoins;
    };
    
    this._sendBestTime = function(iLevel, iTime){
        var aTimes = s_oLocalStorage.getItemJson(LOCALSTORAGE_TIMES);
        
        if(aTimes[iLevel] > iTime || aTimes[iLevel] === 0 ){
            aTimes[iLevel] = iTime;
            s_oLocalStorage.setItemJson(LOCALSTORAGE_TIMES, aTimes);
        }   
        
        $(s_oMain).trigger("share_event",iTime);
        $(s_oMain).trigger("save_score",iTime,iLevel);
    };
    
    this._showShop = function(){
        new CShopPanel(this._onButContinue);
    };
    
    this._onButContinue = function () {
        _oButRestart.setClickable(false);
        _oButContinue.setClickable(false);
        
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            _oParent.unload();
            s_oGame.nextLevel();
        }); 
    };

    this._onButRestart = function () {
        _oButRestart.setClickable(false);
        _oButContinue.setClickable(false);
        
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            _oParent.unload();
            s_oGame.restartGame();
        }); 
    };
    
    this.unload = function(){
        $(s_oMain).trigger("show_interlevel_ad");
        
        _oButRestart.unload();
        _oButContinue.unload();

        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        _oFade.off("mousedown",function(){});
    };
    
    _oParent = this;
    this._init(iLevel, iTime, iOvertakingDistance);
    
};


