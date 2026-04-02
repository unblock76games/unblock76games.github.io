function CVelocityScreen(iX, iY, oParentContainer) {

    var _oParentContainer = oParentContainer;
    var _oPattern;
    var _oVelocityText;
    var _oKMHText;
    var _oContainer;

    this._init = function (iX, iY) {
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;

        _oParentContainer.addChild(_oContainer);

        var oSpritePattern = s_oSpriteLibrary.getSprite("pattern_screen");

        var oPatternSize = {x: -53, y: -23, w: 106, h: 46};

        _oVelocityText = new createjs.Text("444", "44px " + SECONDARY_FONT, TEXT_COLOR_3);
        _oVelocityText.x = -20;
        _oVelocityText.textAlign = "center";
        _oVelocityText.textBaseline = "middle";
        _oContainer.addChild(_oVelocityText);

        _oKMHText = new createjs.Text(TEXT_KMH, "26px " + SECONDARY_FONT, TEXT_COLOR_3);
        _oKMHText.x = 30;
        _oKMHText.y = 15;
        _oKMHText.textAlign = "center";
        _oKMHText.textBaseline = "middle";
        _oContainer.addChild(_oKMHText);

        var matTiling = new createjs.Matrix2D();

        matTiling.a = matTiling.d = 0.16;

        _oPattern = new createjs.Shape();
        _oPattern.graphics.beginBitmapFill(oSpritePattern, 'repeat', matTiling).drawRect(oPatternSize.x, oPatternSize.y, oPatternSize.w, oPatternSize.h);
        _oPattern.alpha = 0.5;

        _oContainer.addChild(_oPattern);

        _oContainer.cache(oPatternSize.x, oPatternSize.y, oPatternSize.w, oPatternSize.h);
    };

    this.refreshVelocityText = function (iVelocity) {
        var szText = iVelocity;
        if (iVelocity < 100 && iVelocity > 9) {
            szText = "0" + iVelocity;
        } else if (iVelocity < 10) {
            szText = "00" + iVelocity;
        }

        _oVelocityText.text = szText;

        _oContainer.updateCache();
    };

    this._init(iX, iY);

    return this;
}