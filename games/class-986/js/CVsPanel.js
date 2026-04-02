function CVsPanel(oSprite, iPlayerTeam, iOpponentTeam, iLv, iTimeAnim) {

    var _pStartContinuePos;
    var _oContainer;
    var _oVsPanel;
    var _oPlayerTeamFlag;
    var _oOpponentTeamFlag;
    var _oVsTextStroke;
    var _oVsText;
    var _oPlayerCharacter;
    var _oOpponentCharacter;
    var _oContPlayerTeam;
    var _oContOpponentTeam;
    var _oContVsText;
    var _oButContinue;
    var _oFade;

    this._init = function (oSprite, iPlayerTeam, iOpponentTeam, iLv, iTimeAnim) {
        _oContainer = new createjs.Container();

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;

        _oFade.on("click", function () {});

        _oContainer.addChild(_oFade);

        if (oSprite !== null) {
            _oVsPanel = createBitmap(oSprite);
            _oVsPanel.x = CANVAS_WIDTH * 0.5;
            _oVsPanel.y = CANVAS_HEIGHT * 0.5;
            _oVsPanel.regX = oSprite.width * 0.5;
            _oVsPanel.regY = oSprite.height * 0.5;

            _oContainer.addChild(_oVsPanel);
        }

        _oContPlayerTeam = new createjs.Container();
        _oContOpponentTeam = new createjs.Container();
        _oContVsText = new createjs.Container();

        var iLevel = iLv + 1;

        var oTextMatchStroke;
        oTextMatchStroke = new createjs.Text(TEXT_MATCH + " " + iLevel, "32px " + FONT_GAME, "#ff6000");
        oTextMatchStroke.x = CANVAS_WIDTH * 0.5;
        oTextMatchStroke.y = CANVAS_HEIGHT * 0.5 - 200;
        oTextMatchStroke.textAlign = "center";
        oTextMatchStroke.outline = 5;
        _oContainer.addChild(oTextMatchStroke);

        var oTextMatch;
        oTextMatch = new createjs.Text(TEXT_MATCH + " " + iLevel, "32px " + FONT_GAME, TEXT_COLOR);
        oTextMatch.x = CANVAS_WIDTH * 0.5;
        oTextMatch.y = CANVAS_HEIGHT * 0.5 - 200;
        oTextMatch.textAlign = "center";
        _oContainer.addChild(oTextMatch);

        var oSpriteFlag = s_oSpriteLibrary.getSprite("flags");

        _oPlayerTeamFlag = new CFlag(CANVAS_WIDTH * 0.5 - 225, 313, iPlayerTeam, false, oSpriteFlag, _oContPlayerTeam);
        _oPlayerTeamFlag.setScale(0.9);

        _oOpponentTeamFlag = new CFlag(CANVAS_WIDTH * 0.5 + 225, 313, iOpponentTeam, false, oSpriteFlag, _oContOpponentTeam);
        _oOpponentTeamFlag.setScale(0.9);

        var oSpritePlayer = s_oSpriteLibrary.getSprite("turn_" + iPlayerTeam);

        _oPlayerCharacter = new CTurnPlayer(CANVAS_WIDTH * 0.5 - 280, 451, oSpritePlayer, _oContPlayerTeam);
        _oPlayerCharacter.gotoAndStopAnim(21);
        _oPlayerCharacter.setScale(0.9);

        var oSpriteOpponent = s_oSpriteLibrary.getSprite("turn_" + iOpponentTeam);

        _oOpponentCharacter = new CTurnPlayer(CANVAS_WIDTH * 0.5 + 280, 451, oSpriteOpponent, _oContOpponentTeam);
        _oOpponentCharacter.gotoAndStopAnim(0);
        _oOpponentCharacter.setScale(0.9);

        _oContVsText.x = CANVAS_WIDTH * 0.5;
        _oContVsText.y = CANVAS_HEIGHT * 0.5;

        _oContainer.addChild(_oContPlayerTeam, _oContOpponentTeam, _oContVsText);

        var iT = iTimeAnim;

        if (iT !== null) {

        } else {
            iT = 0;
        }

        createjs.Tween.get(_oContOpponentTeam).wait(iT).to({x: 0}, 1000, createjs.Ease.elasticOut);

        var oParent = this;
        createjs.Tween.get(_oContPlayerTeam).wait(iT).to({x: 0}, 1000, createjs.Ease.elasticOut).call(function () {
            oParent._createVsText(_oContVsText);
            _oContVsText.scaleX = 9;
            _oContVsText.scaleY = 9;
            createjs.Tween.get(_oContVsText).to({scaleX: 1, scaleY: 1}, 1000, createjs.Ease.bounceOut).call(function () {
                oParent._createButContinue(_oContainer, CANVAS_WIDTH * 0.5 , CANVAS_HEIGHT * 0.5 + 150);
            });
        });

        s_oStage.addChild(_oContainer);

   
    };

    this._createButContinue = function (oContainer, iX, iY) {
        _pStartContinuePos = {x: iX, y: iY};
        var oSprite = s_oSpriteLibrary.getSprite('but_continue');
        _oButContinue = new CGfxButton(_pStartContinuePos.x, _pStartContinuePos.y, oSprite, oContainer);
        _oButContinue.addEventListener(ON_MOUSE_UP, this._onExitVsPanel, this);
        _oButContinue.pulseAnimation();
    };

    this._createVsText = function (oContainer) {
        _oVsTextStroke = new createjs.Text(TEXT_VS, "75px " + FONT_GAME, "#ff6000");
        _oVsTextStroke.x = 0;
        _oVsTextStroke.y = 0;
        _oVsTextStroke.textAlign = "center";
        _oVsTextStroke.textBaseline = "middle";
        _oVsTextStroke.outline = 5;
        oContainer.addChild(_oVsTextStroke);

        _oVsText = new createjs.Text(TEXT_VS, "75px " + FONT_GAME, TEXT_COLOR);
        _oVsText.x = 0;
        _oVsText.y = 0;
        _oVsText.textAlign = "center";
        _oVsText.textBaseline = "middle";
        oContainer.addChild(_oVsText);
    };

    this.setChildIndex = function (iVal) {
        s_oStage.setChildIndex(_oContainer, iVal);
    };

    this.unload = function () {
        _oFade.off("click", function () {});
        s_oStage.removeChild(_oContainer);
    };

    this._onExitVsPanel = function () {
        var oParent = this;

        oParent.unload();
        s_oGame._onExitVsPanel();
        s_oInterface.unloadHelpPanel();
    };

    this._init(oSprite, iPlayerTeam, iOpponentTeam, iLv, iTimeAnim);

    s_oVsPanel = this;

    return this;
}

var s_oVsPanel = null;