function CQuarterback(iXPos, iYPos, oSprite, oParentContainer) {

    var _oQuarterback;
    var _oParentContainer;

    this._init = function (iXPos, iYPos, oSprite, oParentContainer) {

        _oParentContainer = oParentContainer;

        var oData = {
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: oSprite.width / 10, height: oSprite.height / 8, regX: (oSprite.width / 2) / 10, regY: (oSprite.height) / 8},
            animations: {
                idle:0,
                shot: [0, 36, "stay", 30 / FPS],
                stay: [37, 79, "remain", 30 / FPS],
                remain: [79]
            }
        };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oQuarterback = createSprite(oSpriteSheet, "idle", (oSprite.width / 2) / 10, (oSprite.height) / 8, oSprite.width / 10, oSprite.height / 8);
        _oQuarterback.x = iXPos;
        _oQuarterback.y = iYPos;
        _oParentContainer.addChild(_oQuarterback);

    };
    
    this.reset = function(){
        _oQuarterback.gotoAndStop("idle");
    };

    this.getX = function () {
        return _oQuarterback.x;
    };

    this.getY = function () {
        return _oQuarterback.y;
    };

    this.setPosition = function (iXPos, iYPos) {
        if (iXPos !== null) {
            _oQuarterback.x = iXPos;
        }
        if (iYPos === null) {

        } else {
            _oQuarterback.y = iYPos;
        }
    };

    this.rotate = function (iValue) {
        _oQuarterback.scaleX = iValue;
    };

    this.setVisible = function (bVal) {
        _oQuarterback.visible = bVal;
    };

    this.changeState = function (szState) {
        _oQuarterback.gotoAndPlay(szState);

    };

    this.stopAnimation = function () {
        _oQuarterback.stop();
    };

    this.playAnimation = function () {
        _oQuarterback.play();
    };

    this.onFinishAnimation = function () {

        _oQuarterback.on("animationend", function (evt) {
            s_oGame.addImpulseToBall();

            _oQuarterback.removeAllEventListeners();
        });
    };

    this.fadeAnimation = function (fVal) {
        createjs.Tween.get(_oQuarterback).to({alpha: fVal}, 500);
    };

    this.removeTweens = function () {
        createjs.Tween.removeTweens(_oQuarterback);
    };

    this._init(iXPos, iYPos, oSprite, oParentContainer);

    return this;
}

