function CTurnPlayer(iXPos, iYPos, oSprite, oParentContainer) {

    var _oCharacter;
    var _oParentContainer;

    this._init = function (iXPos, iYPos, oSprite) {

        var oData = {
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: oSprite.width / 10, height: oSprite.height / 3, regX: (oSprite.width / 2) / 10, regY: oSprite.height / 3},
            animations: {rotate: [0, 29, "rotate", 0.7]}
        };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oCharacter = createSprite(oSpriteSheet, "rotate", (oSprite.width / 2) / 10, oSprite.height / 3, oSprite.width / 10, oSprite.height / 3);

        _oCharacter.x = iXPos;
        _oCharacter.y = iYPos;

        _oParentContainer.addChild(_oCharacter);

    };

    this.gotoAndStopAnim = function (iVal) {
        _oCharacter.gotoAndStop(iVal);
    };

    this.stopAnim = function () {
        _oCharacter.stop();
    };

    this.playAnim = function () {
        _oCharacter.play();
    };

    this.getX = function () {
        return _oCharacter.x;
    };

    this.getY = function () {
        return _oCharacter.y;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oCharacter.x = iXPos;
        _oCharacter.y = iYPos;
    };

    this.setScale = function (fScale) {
        _oCharacter.scaleX = fScale;
        _oCharacter.scaleY = fScale;
    };

    this.setVisible = function (bVal) {
        _oCharacter.visible = bVal;
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oCharacter);
    };

    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos, oSprite);

    return this;
}



