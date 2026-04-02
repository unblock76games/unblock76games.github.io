function CTurnBoard(oSprite, iX, iY) {

    var _pStartPosContainer;
    var _oContainer;
    var _oTurnBoard;
    var _oTurn;
    var _aNumberTurn;

    this._init = function (oSprite, iX, iY) {
        _aNumberTurn = new Array();
        _pStartPosContainer = {x: iX, y: iY};

        _oContainer = new createjs.Container();
        _oContainer.x = _pStartPosContainer.x;
        _oContainer.y = _pStartPosContainer.y;

        _oTurnBoard = createBitmap(oSprite);
        _oTurnBoard.x = 0;
        _oTurnBoard.y = 0;
        _oTurnBoard.regX = 0;
        _oTurnBoard.regY = 0;

        _oContainer.addChild(_oTurnBoard);

        var oSpritePlayer = s_oSpriteLibrary.getSprite("players");

        var iX = 30;
        var iY = 27;
        _oTurn = new CPlayer(iX, iY, oSpritePlayer, -1, false, false, 0, _oContainer);
        _oTurn.rotate(-1);

        var oSpriteTurnBall = s_oSpriteLibrary.getSprite("turn_ball");

        var iX = FIRST_POS_X_TURN_BALL;
        var iY = 27;

        for (var i = 0; i < NUM_OF_SHOT; i++) {
            _aNumberTurn[i] = this.createTurnBall(iX, iY, oSpriteTurnBall);
            _oContainer.addChild(_aNumberTurn[i]);
            iX += STEP_POS_X_TURN_BALL;
        }

        s_oStage.addChild(_oContainer);

    };

    this.createTurnBall = function (iX, iY, oSprite) {
        var oTurnBall = createBitmap(oSprite);
        oTurnBall.x = iX;
        oTurnBall.y = iY;
        oTurnBall.regX = oSprite.width * 0.5;
        oTurnBall.regY = oSprite.height * 0.5;

        return oTurnBall;
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

    this.refreshTurn = function (iID, bActive) {
        _aNumberTurn[iID].visible = bActive;
    };

    this.setTurn = function (iVal) {
        _oTurn.changeTeam(iVal);
    };

    this._init(oSprite, iX, iY);

    return this;
}