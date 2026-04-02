function CArrowPlayerSelected(iXPos, iYPos, oSprite, oParentContainer) {

    var _iArrowY;

    var _oArrowSelect;
    var _oParentContainer;

    this._init = function (iXPos, iYPos, oSprite) {

        _oArrowSelect = createBitmap(oSprite);
        _oArrowSelect.x = iXPos;
        _oArrowSelect.y = iYPos;
        _oArrowSelect.regX = oSprite.width * 0.5;
        _oArrowSelect.regY = oSprite.height * 0.5;

        _iArrowY = iYPos;

        _oParentContainer.addChild(_oArrowSelect);
    };

    this.unload = function () {
        this.removeTween();
        _oParentContainer.removeChild(_oArrowSelect);
    };

    this.setVisible = function (bVisible) {
        _oArrowSelect.visible = bVisible;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oArrowSelect.x = iXPos;
        _oArrowSelect.y = iYPos;

        _iArrowY = iYPos;
    };

    this.animation = function () {
        var oParent = this;
        createjs.Tween.get(_oArrowSelect).to({y: _iArrowY + Y_POS_ARROW_SELECTED}, 400, createjs.Ease.cubicOut).call(function () {
            createjs.Tween.get(_oArrowSelect).to({y: _iArrowY - Y_POS_ARROW_SELECTED}, 400, createjs.Ease.cubicOut).call(function () {
                oParent.animation();
            });
        });
    };

    this.getX = function () {
        return _oArrowSelect.x;
    };

    this.getY = function () {
        return _oArrowSelect.y;
    };

    this.removeTween = function () {
        createjs.Tween.removeTweens(_oArrowSelect);
    };

    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos, oSprite);

    return this;
}