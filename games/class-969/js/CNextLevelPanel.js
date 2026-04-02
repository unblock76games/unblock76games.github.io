function CNextLevelPanel(iTimeElaps, iScore, iLevel){
    
    var _oPanelContainer;
    var _oFade;
    var _oParent;
    var _oAchievementStars;
    var _oContinueBut;
    var _oRestartBut;    
    
    var _pStartPanelPos;
    this._init = function(iTimeElaps, iScore, iLevel){
        
        playSound("arrive_win", 1, false);
        setVolume(s_aSounds["game_soundtrack"], 0.5);
        
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

        var iX = 0;
        var iY = -oSprite.height/2 + 70;
        var iWidth = 500;
        var iHeight = 100;
        var oTitleStroke = new CTLText(_oPanelContainer, 
                    iX -iWidth/2,iY - iHeight/2, iWidth, iHeight, 
                    40, "center", "#000", PRIMARY_FONT, 1,
                    0, 0,
                    TEXT_TRACK_COMPLETED,
                    true, true, true,
                    false );
        oTitleStroke.setOutline(5);
        var oTitle = new CTLText(_oPanelContainer, 
                    iX -iWidth/2,iY - iHeight/2, iWidth, iHeight, 
                    40, "center", "#fff", PRIMARY_FONT, 1,
                    0, 0,
                    TEXT_TRACK_COMPLETED,
                    true, true, true,
                    false ); 


        var oTimerContainer = new createjs.Container();
        oTimerContainer.x = -220;
        oTimerContainer.y = -30;
        _oPanelContainer.addChild(oTimerContainer);

        var oSprite = s_oSpriteLibrary.getSprite('timer');
        var oTimer = createBitmap(oSprite);
        oTimer.regX = oSprite.width/2;
        oTimer.regY = oSprite.height/2;
        oTimerContainer.addChild(oTimer);
        
        var iTime = LEVEL_INFO[iLevel].time - iTimeElaps
        
        
        var iX = 34;
        var iY = 0;
        var iWidth = 200;
        var iHeight = 100;
        var oTimeText = new CTLText(oTimerContainer, 
                    iX,iY - iHeight/2, iWidth, iHeight, 
                    50, "left", "#fff", PRIMARY_FONT, 1,
                    0, 0,
                    formatTime(iTime),
                    true, true, true,
                    false ); 
        
       
        var oScoreContainer = new createjs.Container();
        oScoreContainer.x = 100;
        oScoreContainer.y = oTimerContainer.y;
        _oPanelContainer.addChild(oScoreContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('star');
        var oStar = createBitmap(oSprite);
        oStar.regX = oSprite.width/2;
        oStar.regY = oSprite.height/2;
        oScoreContainer.addChild(oStar);
        
        var iX = 34;
        var iY = 0;
        var iWidth = 200;
        var iHeight = 100;
        var oScoreText = new CTLText(oScoreContainer, 
                    iX,iY - iHeight/2, iWidth, iHeight, 
                    50, "left", "#fff", PRIMARY_FONT, 1,
                    0, 0,
                    "0",
                    true, true, true,
                    false ); 
        
       
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = CANVAS_HEIGHT + oSprite.height/2;      
        _pStartPanelPos = {x: _oPanelContainer.x, y: _oPanelContainer.y};
        new createjs.Tween.get(_oPanelContainer).to({y:CANVAS_HEIGHT/2},500, createjs.Ease.quartIn).call(function(){
            new CRollingText(oScoreText.getText(), iScore, 5000, false);
           
        });
        this._sendScore(); 
        
       
        var oSprite = s_oSpriteLibrary.getSprite('but_next');
        _oContinueBut = new CGfxButton(120, 100, oSprite,_oPanelContainer);
        _oContinueBut.addEventListener(ON_MOUSE_UP, this._onContinue, this);
        _oContinueBut.pulseAnimation();
        
        var oSprite = s_oSpriteLibrary.getSprite('but_restart');
        _oRestartBut = new CGfxButton(-120, 100, oSprite,_oPanelContainer);
        _oRestartBut.addEventListener(ON_MOUSE_UP, this._onRestart, this);
                
        
        
    };
    
    this.unload = function(){
        
        _oFade.off("mousedown",function(){});
        
        s_oStage.removeChild(_oFade);
        _oPanelContainer.removeAllChildren(_oFade);
        
        _oContinueBut.unload();
        _oRestartBut.unload();
        
    };
    
    this._sendScore = function(){
        var iNewTimeScore = LEVEL_INFO[iLevel].time - iTimeElaps;
        
        s_iTotalScore += iScore;
        
        if(iNewTimeScore < s_aTimeScore[iLevel] || s_aTimeScore[iLevel] === 0){
            s_aTimeScore[iLevel] = iNewTimeScore;
        }

        s_oLocalStorage.saveData();
        
        $(s_oMain).trigger("save_score", s_iTotalScore);
    };
    
    this._onContinue = function(){
        
        _oRestartBut.setClickable(false);
        _oContinueBut.setClickable(false);
        
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            s_oMain.pokiShowCommercial(function(){
                _oParent.unload();
                s_oGame.nextLevel();
            });
        });        
    };
    
    this._onRestart = function(){

        _oRestartBut.setClickable(false);
        _oContinueBut.setClickable(false);

        new createjs.Tween.get(_oFade).to({alpha:0},500);
        new createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            s_oMain.pokiShowCommercial(function(){
                _oParent.unload();
                s_oGame.nextLevel();
            });
        }); 
    };
    
    this._onFinishRolling = function(){
        
    };
    
    this._onRollingRemoved = function(){

    };
    
    this._onRollingText = function(iStep){
        
        _oAchievementStars.playManualMode(iStep, STAR_EFFECT_SCALE);
 
    };
    
    _oParent = this;
    this._init(iTimeElaps, iScore, iLevel);
}