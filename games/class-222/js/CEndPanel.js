function CEndPanel(oSpriteBg) {
    var _iEventToLaunch;
    var _aCbCompleted;
    var _aCbOwner;
    var _oBg;
    var _oTitleTextStroke;
    var _oTitleText;
    var _oRecordText1Stroke;
    var _oRecordText1;
    var _oRecordText2Stroke;
    var _oRecordText2;
    var _oGroup;
    var _oButMenu;
    var _oButRestart;
    var _oFade;
    var _oButCheck;

    this._init = function (oSpriteBg) {
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.0;

        s_oStage.addChild(_oFade);

        _oGroup = new createjs.Container();
        _oGroup.alpha = 1;
        _oGroup.visible = false;
        _oGroup.y = CANVAS_HEIGHT;

        _oBg = createBitmap(oSpriteBg);
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;
        _oBg.regX = oSpriteBg.width * 0.5;
        _oBg.regY = oSpriteBg.height * 0.5;
        _oGroup.addChild(_oBg);

        _oTitleTextStroke =  new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, 180, 500, 40, 
                    40, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_WIN,
                    true, true, true,
                    false );
        _oTitleTextStroke.setOutline(5);
        
        _oTitleText = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, 180, 500, 40, 
                    40, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_WIN,
                    true, true, true,
                    false );

        _oRecordText1Stroke = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, 240, 500, 20, 
                    20, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_GAMES_PLAYED + ": " + s_aGamesPlayed,
                    true, true, true,
                    false );
        _oRecordText1Stroke.setOutline(3);

        _oRecordText1 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, 240, 500, 20, 
                    20, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_GAMES_PLAYED + ": " + s_aGamesPlayed,
                    true, true, true,
                    false );

        _oRecordText2Stroke = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, 270, 500, 20, 
                    20, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_GAMES_WON + ": " + s_aGamesWon,
                    true, true, true,
                    false );

_oRecordText2Stroke.setOutline(3);

        _oRecordText2 =  new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, 270, 500, 20, 
                    20, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_GAMES_WON + ": " + s_aGamesWon,
                    true, true, true,
                    false );

        s_oStage.addChild(_oGroup);

        var oSpriteButHome = s_oSpriteLibrary.getSprite("but_home");
        _oButMenu = new CGfxButton(CANVAS_WIDTH_HALF - 180, CANVAS_HEIGHT_HALF + 80, oSpriteButHome, _oGroup);
        _oButMenu.addEventListener(ON_MOUSE_DOWN, this._onExit, this);

        var oSpriteButHome = s_oSpriteLibrary.getSprite("but_check");
        _oButCheck = new CGfxButton(CANVAS_WIDTH_HALF, CANVAS_HEIGHT_HALF + 80, oSpriteButHome, _oGroup);
        _oButCheck.addEventListener(ON_MOUSE_DOWN, this._onCheck, this);
        
        var oSpriteButRestart = s_oSpriteLibrary.getSprite("but_restart");
        _oButRestart = new CGfxButton(CANVAS_WIDTH_HALF + 180, CANVAS_HEIGHT_HALF + 80, oSpriteButRestart, _oGroup);
        _oButRestart.addEventListener(ON_MOUSE_DOWN, this._onRestart, this);
        _oButRestart.pulseAnimation();
    };

    this.unload = function () {
        createjs.Tween.get(_oGroup).to({alpha: 0}, 500, createjs.Ease.cubicOut).call(function () {
            s_oStage.removeChild(_oGroup);
            _oButMenu.unload();
            _oButMenu = null;

            _oFade.removeAllEventListeners();

            _oButRestart.unload();
            _oButRestart = null;
        });
    };

    this.hide = function(){
        _oFade.visible = false;
        _oGroup.visible = false;
    };

    this.reShow = function(){
        _oFade.visible = true;
        _oGroup.visible = true;
    };

    this.show = function (bWin) {
        _oGroup.visible = true;
        _oFade.visible = true;

        if(bWin){
            _oTitleTextStroke.refreshText(TEXT_WIN);
            _oTitleText.refreshText(TEXT_WIN);
        } else {
            _oTitleTextStroke.refreshText(TEXT_LOSE);
            _oTitleText.refreshText(TEXT_LOSE);
        }

        _oRecordText1Stroke.refreshText(TEXT_GAMES_PLAYED + ": " + s_aGamesPlayed);
        _oRecordText1.refreshText(TEXT_GAMES_PLAYED + ": " + s_aGamesPlayed);
        
        _oRecordText2Stroke.refreshText(TEXT_GAMES_WON + ": " + s_aGamesWon);
        _oRecordText2.refreshText(TEXT_GAMES_WON + ": " + s_aGamesWon);

        createjs.Tween.get(_oFade).to({alpha: 0.5}, 500, createjs.Ease.cubicOut);

        _oFade.on("click", function () {});

        createjs.Tween.get(_oGroup).wait(250).to({y: 0}, 1250, createjs.Ease.elasticOut).call(function () {
            $(s_oMain).trigger("show_interlevel_ad");
        });
        
        $(s_oMain).trigger("share_event", s_aGamesWon);
        $(s_oMain).trigger("save_score", s_aGamesWon);
    };

    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };

    this._onCheck = function(){
        _iEventToLaunch = ON_CHECK;
        if(_aCbCompleted[_iEventToLaunch]){
            _aCbCompleted[_iEventToLaunch].call(_aCbOwner[_iEventToLaunch]);
        }
    };

    this._onRestart = function () {
        _iEventToLaunch = ON_RESTART;
        if(_aCbCompleted[_iEventToLaunch]){
            _aCbCompleted[_iEventToLaunch].call(_aCbOwner[_iEventToLaunch]);
        }
    };

    this._onExit = function () {
        _iEventToLaunch = ON_BACK_MENU;
        if(_aCbCompleted[_iEventToLaunch]){
            _aCbCompleted[_iEventToLaunch].call(_aCbOwner[_iEventToLaunch]);
        }
    };

    this._init(oSpriteBg);

    return this;
}