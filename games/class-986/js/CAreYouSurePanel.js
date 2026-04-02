function CAreYouSurePanel(oParentContainer) {
    var _oBg;
    var _oMsgStroke;
    var _oMsg;
    var _oButYes;
    var _oButNo;
    var _oContainer;
    var _oParentContainer;
    var _oFade;

    this._init = function () {
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        _oParentContainer.addChild(_oContainer);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;

        _oFade.on("click", function () {});

        _oContainer.addChild(_oFade);

        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');

        _oBg = createBitmap(oSpriteBg);
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;
        _oBg.regX = oSpriteBg.width * 0.5;
        _oBg.regY = oSpriteBg.height * 0.5;

        _oContainer.addChild(_oBg);

        _oMsgStroke = new createjs.Text(TEXT_ARE_SURE, "50px " + FONT_GAME, "#ff6000");
        _oMsgStroke.x = CANVAS_WIDTH / 2;
        _oMsgStroke.y = 250;
        _oMsgStroke.textAlign = "center";
        _oMsgStroke.textBaseline = "middle";
        _oMsgStroke.outline = 5;
        _oContainer.addChild(_oMsgStroke);

        _oMsg = new createjs.Text(_oMsgStroke.text, "50px " + FONT_GAME, TEXT_COLOR);
        _oMsg.x = _oMsgStroke.x;
        _oMsg.y = _oMsgStroke.y;
        _oMsg.textAlign = "center";
        _oMsg.textBaseline = "middle";
        _oContainer.addChild(_oMsg);

        _oButYes = new CGfxButton(CANVAS_WIDTH / 2 + 310, CANVAS_HEIGHT * 0.5 + 150, s_oSpriteLibrary.getSprite('but_yes'), _oContainer);
        _oButYes.addEventListener(ON_MOUSE_UP, this._onButYes, this);

        _oButNo = new CGfxButton(CANVAS_WIDTH / 2 - 310, CANVAS_HEIGHT * 0.5 + 150, s_oSpriteLibrary.getSprite('but_not'), _oContainer);
        _oButNo.addEventListener(ON_MOUSE_UP, this._onButNo, this);
    };

    this.show = function () {
        s_oGame.unpause(false);
        _oContainer.visible = true;
    };

    this._onButYes = function () {
        s_oGame.unpause(true);
        s_oGame.onExit();
        _oFade.removeAllEventListeners();
    };

    this._onButNo = function () {
        s_oGame.unpause(true);
        _oContainer.visible = false;
        _oFade.removeAllEventListeners();
    };

    _oParentContainer = oParentContainer;

    this._init();
}