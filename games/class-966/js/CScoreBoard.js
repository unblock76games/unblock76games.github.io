function CScoreBoard(oSprite, iX, iY, oParentContainer) {

    var _oParentContainer = oParentContainer;
    var _pStartPosContainer;
    var _oContainer;
    var _oScoreBoard;
    var _oPlayerName;
    var _oPlayerNameShadow;
    var _oOpponentName;
    var _oOpponentNameShadow;
    var _oPlayerSet;
    var _oOpponentSet;
    var _oPlayerPoint;
    var _oOpponentPoint;
    var _aTexts;
    var _oCacheSize;
    var _oPlaceHolder;
    var _aPosPlaceHolder;

    this._init = function (oSprite, iX, iY) {
        _pStartPosContainer = {x: iX, y: iY};

        _oContainer = new createjs.Container();
        _oContainer.x = _pStartPosContainer.x;
        _oContainer.y = _pStartPosContainer.y;

        _oScoreBoard = createBitmap(oSprite);
        _oScoreBoard.x = 0;
        _oScoreBoard.y = 0;
        _oScoreBoard.regX = oSprite.width * 0.5;
        _oScoreBoard.regY = oSprite.height * 0.5;

        _oContainer.addChild(_oScoreBoard);

        _aTexts = new Array();

        for (var i = 0; i < 2; i++) {
            _aTexts[i] = new Array();
        }
        _oPlayerNameShadow = new createjs.Text(TEXT_CHARACTERS_NAMES[PLAYER_SIDE], "24px " + PRIMARY_FONT, "#000");
        _oPlayerNameShadow.x = -oSprite.width * 0.5 + 12;
        _oPlayerNameShadow.y = -oSprite.height * 0.5 + 26;
        _oPlayerNameShadow.textAlign = "left";
        _oPlayerNameShadow.textBaseline = "middle";
        _oContainer.addChild(_oPlayerNameShadow);
        _aTexts[PLAYER_SIDE][NAME_TEXT] = _oPlayerName;
        _oPlayerNameShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oPlayerName = new createjs.Text(TEXT_CHARACTERS_NAMES[PLAYER_SIDE], "24px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oPlayerName.x = -oSprite.width * 0.5 + 10;
        _oPlayerName.y = -oSprite.height * 0.5 + 24;
        _oPlayerName.textAlign = "left";
        _oPlayerName.textBaseline = "middle";
        _oContainer.addChild(_oPlayerName);
        _aTexts[PLAYER_SIDE][NAME_TEXT] = _oPlayerName;

        _oOpponentNameShadow = new createjs.Text(TEXT_CHARACTERS_NAMES[OPPONENT_SIDE], "24px " + PRIMARY_FONT, "#000");
        _oOpponentNameShadow.x = -oSprite.width * 0.5 + 12;
        _oOpponentNameShadow.y = oSprite.height * 0.5 - 24;
        _oOpponentNameShadow.textAlign = "left";
        _oOpponentNameShadow.textBaseline = "middle";
        _oContainer.addChild(_oOpponentNameShadow);
        _aTexts[OPPONENT_SIDE][NAME_TEXT] = _oOpponentName;
        _oOpponentNameShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oOpponentName = new createjs.Text(TEXT_CHARACTERS_NAMES[OPPONENT_SIDE], "24px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oOpponentName.x = -oSprite.width * 0.5 + 10;
        _oOpponentName.y = oSprite.height * 0.5 - 26;
        _oOpponentName.textAlign = "left";
        _oOpponentName.textBaseline = "middle";
        _oContainer.addChild(_oOpponentName);
        _aTexts[OPPONENT_SIDE][NAME_TEXT] = _oOpponentName;

        _oPlayerSet = new createjs.Text(0, "28px " + PRIMARY_FONT, TEXT_COLOR_1);
        _oPlayerSet.x = 62;
        _oPlayerSet.y = _oPlayerName.y;
        _oPlayerSet.textAlign = "center";
        _oPlayerSet.textBaseline = "middle";
        _oContainer.addChild(_oPlayerSet);
        _aTexts[PLAYER_SIDE][SET_TEXT] = _oPlayerSet;

        _oOpponentSet = new createjs.Text(0, "28px " + PRIMARY_FONT, TEXT_COLOR_1);
        _oOpponentSet.x = _oPlayerSet.x;
        _oOpponentSet.y = _oOpponentName.y;
        _oOpponentSet.textAlign = "center";
        _oOpponentSet.textBaseline = "middle";
        _oContainer.addChild(_oOpponentSet);
        _aTexts[OPPONENT_SIDE][SET_TEXT] = _oOpponentSet;

        _oPlayerPoint = new createjs.Text(45, "28px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oPlayerPoint.x = 97;
        _oPlayerPoint.y = _oPlayerName.y;
        _oPlayerPoint.textAlign = "center";
        _oPlayerPoint.textBaseline = "middle";
        _oContainer.addChild(_oPlayerPoint);
        _aTexts[PLAYER_SIDE][POINT_TEXT] = _oPlayerPoint;

        _oOpponentPoint = new createjs.Text(45, "28px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oOpponentPoint.x = 97;
        _oOpponentPoint.y = _oOpponentName.y;
        _oOpponentPoint.textAlign = "center";
        _oOpponentPoint.textBaseline = "middle";
        _oContainer.addChild(_oOpponentPoint);
        _aTexts[OPPONENT_SIDE][POINT_TEXT] = _oOpponentPoint

        var oSprtiePlaceHorder = s_oSpriteLibrary.getSprite("placeholder");
        _aPosPlaceHolder = new Array();
        _aPosPlaceHolder.push(oSprtiePlaceHorder.height * 0.5 + oSprtiePlaceHorder.height * 0.5 - 34);//Opponent
        _aPosPlaceHolder.push(oSprtiePlaceHorder.height * 0.5 - oSprtiePlaceHorder.height * 0.5 - 24);//Player

        _oPlaceHolder = createBitmap(oSprtiePlaceHorder);
        _oPlaceHolder.regX = oSprtiePlaceHorder.width * 0.5;
        _oPlaceHolder.regY = oSprtiePlaceHorder.height * 0.5;
        _oPlaceHolder.x = -oSprite.width * 0.5 - oSprtiePlaceHorder.width * 0.5 + 6;
        _oPlaceHolder.y = _aPosPlaceHolder[SERVICE_BY];

        _oContainer.addChild(_oPlaceHolder);

        _oCacheSize = {x: _oScoreBoard.regX * 3 + oSprtiePlaceHorder.width, y: _oScoreBoard.regY * 3};

        this.resizeChache();

        _oParentContainer.addChild(_oContainer);
    };

    this.resizeChache = function () {
        _oContainer.cache(_oContainer.x - _oCacheSize.x, _oContainer.y - _oCacheSize.y, _oCacheSize.x, _oCacheSize.y);
    };

    this.getStartPosition = function () {
        return _pStartPosContainer;
    };

    this.setPosition = function (iX, iY) {
        _oContainer.x = iX;
        _oContainer.y = iY;

    };

    this.refreshScorePos = function (iNewX, iNewY) {
        this.setPosition(_pStartPosContainer.x + iNewX, _pStartPosContainer.y + iNewY);
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oContainer);
    };

    this.refreshText = function (iWho, iText, szText) {
        _aTexts[iWho][iText].text = szText;
        _oPlaceHolder.y = _aPosPlaceHolder[SERVICE_BY]
        _oContainer.updateCache();
    };

    this._init(oSprite, iX, iY);

    return this;
}