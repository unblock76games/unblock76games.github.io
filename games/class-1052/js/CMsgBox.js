function CMsgBox(szText,oParentContainer){
    var _oMsgStroke;
    var _oMsg;
    var _oButOk;
    var _oThis;
    var _oContainer;
    var _oParentContainer;

    this._init = function (szText) {
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);

        var oFade;

        oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        oFade.alpha = 0.5;

        oFade.on("click", function () {});

        _oContainer.addChild(oFade);

        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');
        var oBg = createBitmap(oSpriteBg);
        _oContainer.addChild(oBg);

        _oMsg = new createjs.Text(szText, "28px " + FONT, "#fff");
        _oMsg.x = CANVAS_WIDTH/2;
        _oMsg.y = 200;
        _oMsg.textAlign = "center";
        _oMsg.textBaseline = "alphabetic";
        _oMsg.lineWidth = 550;
        _oContainer.addChild(_oMsg);

        _oButOk = new CGfxButton(CANVAS_WIDTH / 2, 450, s_oSpriteLibrary.getSprite('but_yes'), _oContainer);
        _oButOk.addEventListener(ON_MOUSE_UP, this._onButOk, this);
    };

    this._onButOk = function () {
        _oThis.unload();
    };

    this.unload = function () {
        _oButOk.unload();
        _oParentContainer.removeChild(_oContainer);
    };
    
    _oThis = this;
    _oParentContainer = oParentContainer;

    this._init(szText);
}