function CCreditsPanel() {

    var _oBg;
    var _oButLogo;
    var _oButExit;
    var _oMsgText;
    var _oMsgTextOutline;

    var _oHitArea;

    var _oLink;
    var _oLinkOutline;
    
    var _oListener;
    var _pStartPosExit;

    var _oContainer;

    this._init = function () {
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);

        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');

        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("#000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oHitArea.alpha = 0.5;
        _oListener = _oHitArea.on("click", this._onLogoButRelease);
        _oHitArea.cursor = "pointer";
        _oContainer.addChild(_oHitArea);

        _oBg = createBitmap(oSpriteBg);
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;
        _oBg.regX = oSpriteBg.width * 0.5;
        _oBg.regY = oSpriteBg.height * 0.5;

        _oContainer.addChild(_oBg);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH * 0.5 + 330, y: 140};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, _oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);

        _oMsgTextOutline = new createjs.Text(TEXT_CREDITS_DEVELOPED, "40px " + FONT_GAME, "#ff6000");
        _oMsgTextOutline.textAlign = "center";
        _oMsgTextOutline.textBaseline = "alphabetic";
        _oMsgTextOutline.x = CANVAS_WIDTH / 2;
        _oMsgTextOutline.y = 250;
        _oMsgTextOutline.outline = 5;
        _oContainer.addChild(_oMsgTextOutline);

        _oMsgText = new createjs.Text(TEXT_CREDITS_DEVELOPED, "40px " + FONT_GAME, TEXT_COLOR);
        _oMsgText.textAlign = "center";
        _oMsgText.textBaseline = "alphabetic";
        _oMsgText.x = _oMsgTextOutline.x;
        _oMsgText.y = _oMsgTextOutline.y;
        _oContainer.addChild(_oMsgText);

        oSprite = s_oSpriteLibrary.getSprite('logo_ctl');
        _oButLogo = createBitmap(oSprite);
        _oButLogo.regX = oSprite.width / 2;
        _oButLogo.regY = oSprite.height / 2;
        _oButLogo.x = CANVAS_WIDTH / 2;
        _oButLogo.y = 350;
        _oContainer.addChild(_oButLogo);

        _oLinkOutline = new createjs.Text("www.codethislab.com", "36px " + FONT_GAME, "#ff6000");
        _oLinkOutline.textAlign = "center";
        _oLinkOutline.textBaseline = "alphabetic";
        _oLinkOutline.x = CANVAS_WIDTH / 2;
        _oLinkOutline.y = 430;
        _oLinkOutline.outline = 5;
        //_oContainer.addChild(_oLinkOutline);

        _oLink = new createjs.Text("www.codethislab.com", "36px " + FONT_GAME, TEXT_COLOR);
        _oLink.textAlign = "center";
        _oLink.textBaseline = "alphabetic";
        _oLink.x = _oLinkOutline.x;
        _oLink.y = _oLinkOutline.y;
        //_oContainer.addChild(_oLink);

    };

    this.unload = function () {
        _oHitArea.off("click", _oListener);

        _oButExit.unload();
        _oButExit = null;

        s_oStage.removeChild(_oContainer);
    };

    this._onLogoButRelease = function () {
        //window.open("http://www.codethislab.com/index.php?&l=en", "_blank");
    };

    this._init();


}


