function CLevelScoreBoard(oSprite, iX, iY) {

    var _pStartPosContainer;
    var _oContainer;
    var _oBoard;
    var _oScoreText;
    var _oScoreTextStroke;

    this._init = function (oSprite, iX, iY) {
        _pStartPosContainer = {x: iX, y: iY};

        _oContainer = new createjs.Container();
        _oContainer.x = _pStartPosContainer.x;
        _oContainer.y = _pStartPosContainer.y;

        _oBoard = createBitmap(oSprite);
        _oBoard.x = 0;
        _oBoard.y = 0;
        _oBoard.regX = 0;
        _oBoard.regY = 0;

        _oContainer.addChild(_oBoard);

        _oScoreTextStroke = new createjs.Text("0 pt", "22px " + FONT_GAME, "#ff6000");
        _oScoreTextStroke.x = oSprite.width * 0.5;
        _oScoreTextStroke.y = oSprite.height * 0.5;
        _oScoreTextStroke.textAlign = "center";
        _oScoreTextStroke.textBaseline = "middle";
        _oScoreTextStroke.outline = 5;
        _oContainer.addChild(_oScoreTextStroke);

        _oScoreText = new createjs.Text("0 pt", "22px " + FONT_GAME, TEXT_COLOR);
        _oScoreText.x = oSprite.width * 0.5;
        _oScoreText.y = oSprite.height * 0.5;
        _oScoreText.textAlign = "center";
        _oScoreText.textBaseline = "middle";
        _oContainer.addChild(_oScoreText);

        s_oStage.addChild(_oContainer);

    };

    this.getStartPosition = function () {
        return _pStartPosContainer;
    };

    this.setPosition = function (iX, iY) {
        _oContainer.x = iX;
        _oContainer.y = iY;
    };

    this.unload = function () {
        s_oStage.removeChild(_oContainer);
    };

    this.refresh = function (iVal) {
        _oScoreText.text = iVal + " " + TEXT_PT;
        _oScoreTextStroke.text = _oScoreText.text;
    };

    this._init(oSprite, iX, iY);

    return this;
}