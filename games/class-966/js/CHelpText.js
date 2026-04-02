var MS_TIME_FADE_HELP_TEXT = 500;
function CHelpText(oParentContainer) {

    var _oParentContainer = oParentContainer;
    var _oHelpText;
    var _oContainer;
    var _oFade;

    this._init = function () {
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;
        _oContainer.addChild(_oFade);

        _oHelpText = new createjs.Text(TEXT_HELP_DESKTOP_0, "42px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oHelpText.x = CANVAS_WIDTH / 2;
        _oHelpText.y = CANVAS_HEIGHT_HALF;
        _oHelpText.textAlign = "center";
        _oHelpText.lineWidth = "700";

        _oContainer.addChild(_oHelpText);

        _oParentContainer.swapChildren(_oContainer, s_oGame.getPowerBar().getObject());

        _oContainer.alpha = 0;
    };

    this.fadeAnim = function (fVal, oFunc) {
        createjs.Tween.get(_oContainer, {override: true}).to({alpha: fVal}, MS_TIME_FADE_HELP_TEXT).call(function () {
            if (oFunc !== null) {
                oFunc();
            }
        }, null, this);
    };

    this.unload = function () {
        createjs.Tween.removeTweens(_oContainer);
        _oParentContainer.removeChild(_oContainer);
    };

    this._init();

    return this;
}