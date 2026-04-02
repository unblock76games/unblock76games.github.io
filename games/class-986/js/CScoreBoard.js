function CScoreBoard(oSprite, iX, iY, iPlayerTeam, iOpponentTeam) {

    var _pStartPosGoalResultContainer;
    var _oContainer;
    var _oScoreBoard;
    var _oGoalResult;
    var _oGoalResultStroke;
    var _oPlayerTeamFlag;
    var _oOpponentTeamFlag;

    this._init = function (oSprite, iX, iY, iPlayerTeam, iOpponentTeam) {
        _pStartPosGoalResultContainer = {x: iX, y: iY};

        _oContainer = new createjs.Container();
        _oContainer.x = _pStartPosGoalResultContainer.x;
        _oContainer.y = _pStartPosGoalResultContainer.y;

        _oScoreBoard = createBitmap(oSprite);
        _oScoreBoard.x = 0;
        _oScoreBoard.y = -3;
        _oScoreBoard.regX = oSprite.width * 0.5;
        _oScoreBoard.regY = 0;

        _oContainer.addChild(_oScoreBoard);

        _oGoalResultStroke = new createjs.Text(" 0 - 0 ", "24px " + FONT_GAME, "#ff6000");
        _oGoalResultStroke.x = 0;
        _oGoalResultStroke.y = oSprite.height * 0.5 - 3;
        _oGoalResultStroke.textAlign = "center";
        _oGoalResultStroke.textBaseline = "middle";
        _oGoalResultStroke.outline = 5;

        _oContainer.addChild(_oGoalResultStroke);

        _oGoalResult = new createjs.Text(" 0 - 0 ", "24px " + FONT_GAME, TEXT_COLOR);
        _oGoalResult.x = 0;
        _oGoalResult.y = _oGoalResultStroke.y;
        _oGoalResult.textAlign = "center";
        _oGoalResult.textBaseline = "middle";

        _oContainer.addChild(_oGoalResult);

        var iCorX = 65;
        var iCorY = 23;

        var oSpriteFlagSmall = s_oSpriteLibrary.getSprite("flags_small");

        _oPlayerTeamFlag = new CFlag(-iCorX, iCorY, iPlayerTeam, false, oSpriteFlagSmall, _oContainer);
        _oPlayerTeamFlag.setScale(0.7);

        _oOpponentTeamFlag = new CFlag(iCorX, iCorY, iOpponentTeam, false, oSpriteFlagSmall, _oContainer);
        _oOpponentTeamFlag.setScale(0.7);

        s_oStage.addChild(_oContainer);

    };

    this.changeOpponentTeamFlag = function (iOpponentTeam) {
        _oOpponentTeamFlag.changeTeam(iOpponentTeam);
    };

    this.getStartPosition = function () {
        return _pStartPosGoalResultContainer;
    };

    this.setPosition = function (iX, iY) {
        _oContainer.x = iX;
        _oContainer.y = iY;
    };

    this.unload = function () {
        s_oStage.removeChild(_oContainer);
    };

    this.refresh = function (szText) {
        _oGoalResultStroke.text = szText;
        _oGoalResult.text = szText;
    };

    this.getResult = function () {
        var szText = _oGoalResult.text;
        return szText;
    };

    this._init(oSprite, iX, iY, iPlayerTeam, iOpponentTeam);

    return this;
}