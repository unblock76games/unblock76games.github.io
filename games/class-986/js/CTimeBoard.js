function CTimeBoard(oSprite, iX, iY) {

    var _pStartPosContainer;
    var _oContainer;
    var _oTimeBoard;
    var _oTimeText;
    var _oTimeTextStroke;

    this._init = function (oSprite, iX, iY) {
        _pStartPosContainer = {x: iX, y: iY};

        _oContainer = new createjs.Container();
        _oContainer.x = _pStartPosContainer.x;
        _oContainer.y = _pStartPosContainer.y;

        _oTimeBoard = createBitmap(oSprite);
        _oTimeBoard.x = 0;
        _oTimeBoard.y = 0;
        _oTimeBoard.regX = 0;
        _oTimeBoard.regY = 0;

        _oContainer.addChild(_oTimeBoard);

        _oTimeTextStroke = new createjs.Text(TEXT_TIME + ": 0", "22px " + FONT_GAME, "#ff6000");
        _oTimeTextStroke.x = oSprite.width * 0.5;
        _oTimeTextStroke.y = oSprite.height * 0.5;
        _oTimeTextStroke.textAlign = "center";
        _oTimeTextStroke.textBaseline = "middle";
        _oTimeTextStroke.outline = 4;
        _oContainer.addChild(_oTimeTextStroke);

        _oTimeText = new createjs.Text(TEXT_TIME + ": 0", "22px " + FONT_GAME, TEXT_COLOR);
        _oTimeText.x = oSprite.width * 0.5;
        _oTimeText.y = oSprite.height * 0.5;
        _oTimeText.textAlign = "center";
        _oTimeText.textBaseline = "middle";
        _oContainer.addChild(_oTimeText);

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

    this.refresh = function (szText) {
        _oTimeText.text = szText;
        _oTimeTextStroke.text = szText;
    };

    this._init(oSprite, iX, iY);

    return this;
}