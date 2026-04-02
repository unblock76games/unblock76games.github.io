function CAnimText(oParentContainer) {

    var _oParentContainer = oParentContainer;
    var _oContainer;
    var _oText;
    var _oTextBounds;

    this._init = function () {
        _oContainer = new createjs.Container();

        _oText = new createjs.Text(null, 28 + "px " + PRIMARY_FONT, "#fff");
        _oText.textAlign = "center";
        _oText.textBaseline = "middle";
        _oContainer.addChild(_oText);

        _oContainer.x = CANVAS_WIDTH_HALF;
        _oContainer.y = -28;
        _oContainer.visible = false;

        _oParentContainer.addChild(_oContainer);
    };

    this.setText = function (szText, szFont, szColor) {
        _oText.text = szText;
        _oText.color = szColor;
        _oText.font = szFont;
        _oTextBounds = _oText.getBounds();
    };

    this.animText = function () {
        _oContainer.visible = true;
        createjs.Tween.get(_oContainer).to({y: CANVAS_HEIGHT_HALF}, 500, createjs.Ease.cubicOut).call(function () {
            createjs.Tween.get(_oContainer).wait(250).to({y: CANVAS_HEIGHT + _oTextBounds.height}, 500, createjs.Ease.cubicIn).set({visible: false, y: -_oTextBounds.height});
        });
    };

    this._init();

    return this;
}

