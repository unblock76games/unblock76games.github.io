function CEndPanel(iTimeLeft,iScore,iShots,refGame){

    var _refGame;
    var _oListener;
    
    var _oSprPanel;
    var _oTextScore;
    var _oTextShots;
    var _oTextTime;
    var _oTextSuccessPerc;
    var _oButReplay;
    
    this._init = function(iTimeLeft,iScore,iShots,refGame){
        s_oGame.setPokiStart(false);
        
        _refGame = refGame;

        _oSprPanel = createBitmap(s_oSpriteLibrary.getSprite('msg_box'));
        _oListener = _oSprPanel.on("click",function(){});
        s_oStage.addChild(_oSprPanel);

        var _szFinalScore = TEXT_FINALSCORE + " "+iScore;
        _oTextScore = new CTLText(s_oStage, 
                    CANVAS_WIDTH/2-250, 205, 500, 52, 
                    52, "center", "#FFCC00", FONT_GAME, 1,
                    0, 0,
                    _szFinalScore,
                    true, true, false,
                    false );
        _oTextScore.setAlpha(0);            
        _oTextScore.setShadow("#000000", 4, 4, 3);

        
        
        createjs.Tween.get(_oTextScore.getText()).to({x:CANVAS_WIDTH/2,y:(CANVAS_HEIGHT/2) - 130,alpha:1}, 1600,createjs.Ease.quadOut);
        
        var _szFinalShots = TEXT_FINALSHOTS + " "+iShots;
        _oTextShots = new CTLText(s_oStage, 
                    CANVAS_WIDTH/2-250, (CANVAS_HEIGHT/2) - 85, 500, 52, 
                    36, "center", "#FFCC00", FONT_GAME, 1,
                    0, 0,
                    _szFinalShots,
                    true, true, false,
                    false );
        _oTextShots.setAlpha(0);            
        _oTextShots.setShadow("#000000", 3, 3, 3);


        createjs.Tween.get(_oTextShots.getText()).wait(500).to({alpha:1}, 500,createjs.Ease.quadOut);
        
        if(iTimeLeft <= 0){
            iTimeLeft = 0;
        }else{
            iTimeLeft = formatTime(iTimeLeft);
        }
        
        var _szFinalTime = TEXT_FINALTIME + " "+ iTimeLeft;
        _oTextTime = new CTLText(s_oStage, 
                    CANVAS_WIDTH/2-250, (CANVAS_HEIGHT/2) - 30, 500, 52, 
                    36, "center", "#FFCC00", FONT_GAME, 1,
                    0, 0,
                    _szFinalTime,
                    true, true, false,
                    false );
        _oTextTime.setAlpha(0);            
        _oTextTime.setShadow("#000000", 3, 3, 3);            

        createjs.Tween.get(_oTextTime.getText()).wait(750).to({alpha:1}, 500,createjs.Ease.quadOut);

        var succP;
        if (iShots === 0) {succP=0;} else{succP=((iScore/iShots)*100).toFixed(1);};
        var _szFinalSuccPerc = TEXT_FINALSUCCESSPERC + " "+succP + "%";
        _oTextSuccessPerc = new CTLText(s_oStage, 
                    CANVAS_WIDTH/2-250, (CANVAS_HEIGHT/2) +25, 500, 52, 
                    36, "center", "#FFCC00", FONT_GAME, 1,
                    0, 0,
                    _szFinalSuccPerc,
                    true, true, false,
                    false );
        _oTextSuccessPerc.setAlpha(0);            
        _oTextSuccessPerc.setShadow("#000000", 3, 3, 3);     


        var that = this; 
        createjs.Tween.get(_oTextSuccessPerc.getText())
            .wait(1000)
            .to({alpha:1}, 500,createjs.Ease.quadOut)
            .call(function(){
                    var oSprite = s_oSpriteLibrary.getSprite('but_play');
                    _oButReplay = new CTextButton(CANVAS_WIDTH/2,CANVAS_HEIGHT/2 + 125,oSprite,TEXT_PLAYAGAIN,FONT_GAME,"#ffffff",30,s_oStage);
                    _oButReplay.addEventListener(ON_MOUSE_UP, that._onButPlayAgain, that); 
                    $(s_oMain).trigger("show_interlevel_ad");
                },that);

        
        $(s_oMain).trigger("save_score",iScore);
        $(s_oMain).trigger("end_level");
    };
    
    this.unload = function(){
        _oSprPanel.off("click",_oListener);
        
        _oButReplay.unload(); 
        _oButReplay = null;
    };
    
    this._onButPlayAgain = function(){
        _refGame.onExit();
    };
    
    this._init(iTimeLeft,iScore,iShots,refGame);
}