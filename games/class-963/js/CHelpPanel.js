function CHelpPanel(){
    var _oHelpBg;
    var _oButExit;
    var _oContainer;

    this._init = function(){
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
        
        _oHelpBg = new createBitmap(s_oSpriteLibrary.getSprite('bg_help')); 
        _oContainer.addChild(_oHelpBg);
        
        var szText;
        if(s_bMobile){
            szText = TEXT_HELP_MOBILE;
        }else{
            szText = TEXT_HELP;
        }
        
	var oText = new CTLText(_oContainer, 
                    CANVAS_WIDTH/2-260, 220, 520, 120, 
                    48, "center", "#FFCC00", FONT_GAME, 1,
                    0, 0,
                    szText,
                    true, true, true,
                    false );

        oText.setShadow("#000", 2, 2, 2);
        
        var oTextPoint1 = new CTLText(_oContainer, 
                    260, 510, 130, 28, 
                    28, "center", "#FFCC00", FONT_GAME, 1,
                    0, 0,
                    "1 "+TEXT_POINT,
                    true, true, false,
                    false );

        oTextPoint1.setShadow("#000", 2, 2, 2);
        
        var oTextPoint2 = new CTLText(_oContainer, 
                    410, 510, 130, 28, 
                    28, "center", "#FFCC00", FONT_GAME, 1,
                    0, 0,
                    "2 "+TEXT_POINTS,
                    true, true, false,
                    false );

        oTextPoint2.setShadow("#000", 2, 2, 2);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_play');
        _oButExit = new CTextButton((CANVAS_WIDTH/2),CANVAS_HEIGHT -140,oSprite,TEXT_PLAY,FONT_GAME,"#fff",60,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this); 

        

    };

    this.unload = function(){
        _oButExit.unload();
        _oContainer.removeAllChildren();
    };

    this._onExit = function(){
        this.unload();
        s_oGame.exitFromHelp();
    };

    this._init();

}