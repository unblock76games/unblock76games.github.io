function CAreYouSurePanel(oFunction) {

    var _oButYes;
    var _oButNo;
    var _oFade;
    var _oPanelContainer;
    var _oParent;

    var _pStartPanelPos;

    this._init = function () {
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oFade.on("mousedown", function () {});
        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade, {ignoreGlobalPause: true}).to({alpha: 0.7}, 500);

        _oPanelContainer = new createjs.Container();
        s_oStage.addChild(_oPanelContainer);

        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        var oPanel = createBitmap(oSprite);
        oPanel.regX = oSprite.width / 2;
        oPanel.regY = oSprite.height / 2;
        _oPanelContainer.addChild(oPanel);

        _oPanelContainer.x = CANVAS_WIDTH / 2;
        _oPanelContainer.y = CANVAS_HEIGHT + oSprite.height / 2;
        _pStartPanelPos = {x: _oPanelContainer.x, y: _oPanelContainer.y};
        createjs.Tween.get(_oPanelContainer, {ignoreGlobalPause: true}).to({y: CANVAS_HEIGHT / 2 - 40}, 500, createjs.Ease.backOut);

        var oTitleShadow = new createjs.Text(TEXT_ARE_SURE, "34px " + PRIMARY_FONT, "#000");
        oTitleShadow.x = 2;
        oTitleShadow.y = -oSprite.height / 2 + 52;
        oTitleShadow.textAlign = "center";
        oTitleShadow.textBaseline = "middle";
        oTitleShadow.lineWidth = 400;
        oTitleShadow.alpha = TEXT_SHADOWN_ALPHA;
        _oPanelContainer.addChild(oTitleShadow);

        var oTitle = new createjs.Text(TEXT_ARE_SURE, "34px " + PRIMARY_FONT, TEXT_COLOR_0);
        oTitle.y = -oSprite.height / 2 + 50;
        oTitle.textAlign = "center";
        oTitle.textBaseline = "middle";
        oTitle.lineWidth = 400;
        _oPanelContainer.addChild(oTitle);

        _oButYes = new CGfxButton(140, 90, s_oSpriteLibrary.getSprite('but_yes_big'), _oPanelContainer);
        _oButYes.addEventListener(ON_MOUSE_UP, this._onButYes, this);

        _oButNo = new CGfxButton(-140, 90, s_oSpriteLibrary.getSprite('but_exit_big'), _oPanelContainer);
        _oButNo.addEventListener(ON_MOUSE_UP, this._onButNo, this);
        _oButNo.pulseAnimation();
    };

    this._onButYes = function () {
        _oButNo.setClickable(false);
        _oButYes.setClickable(false);

        createjs.Tween.get(_oFade, {ignoreGlobalPause: true}).to({alpha: 0}, 500);
        createjs.Tween.get(_oPanelContainer, {ignoreGlobalPause: true}).to({y: _pStartPanelPos.y}, 400, createjs.Ease.backIn).call(function () {

            _oParent.unload();
            oFunction();
            createjs.Ticker.paused = false;
        });
    };

    this._onButNo = function () {
        _oButNo.setClickable(false);
        _oButYes.setClickable(false);

        createjs.Tween.get(_oFade, {ignoreGlobalPause: true}).to({alpha: 0}, 500);
        createjs.Tween.get(_oPanelContainer, {ignoreGlobalPause: true}).to({y: _pStartPanelPos.y}, 400, createjs.Ease.backIn).call(function () {
            _oParent.unload();
            s_oGame.pause(false);
        });


    };

    this.unload = function () {
        _oButNo.unload();
        _oButYes.unload();

        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        _oFade.off("mousedown", function () {});
    };

    _oParent = this;
    this._init(oFunction);
}

