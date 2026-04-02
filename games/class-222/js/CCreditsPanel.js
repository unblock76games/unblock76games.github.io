function CCreditsPanel() {
    var _oBg;
    var _oButLogo;
    var _oButExit;
    var _oMsgText;
    var _oMsgTextStroke;
    var _oHitArea;
    var _oLink;
    var _oLinkStroke;
    var _pStartPosExit;
    var _oContainer;
    var _oListener;

    this._init = function () {
        var oSpriteMsgBox = s_oSpriteLibrary.getSprite('msg_box');
        _oContainer = new createjs.Container();
        _oContainer.y = CANVAS_HEIGHT + oSpriteMsgBox.height/2; 
        s_oStage.addChild(_oContainer);

        _oBg = createBitmap(oSpriteMsgBox);
        _oBg.regX = oSpriteMsgBox.width/2;
        _oBg.regY = oSpriteMsgBox.height/2;
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;
        _oContainer.addChild(_oBg);
        
        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("#0f0f0f").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oHitArea.alpha = 0.01;
        _oListener = _oHitArea.on("click", this._onLogoButRelease);
        _oContainer.addChild(_oHitArea);
                
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH_HALF + 230 , y: CANVAS_HEIGHT_HALF - 130};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, _oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);

        _oMsgTextStroke = new createjs.Text(TEXT_CREDITS_DEVELOPED, "40px " + PRIMARY_FONT, SECONDARY_FONT_COLOR);
        _oMsgTextStroke.textAlign = "center";
        _oMsgTextStroke.textBaseline = "alphabetic";
	_oMsgTextStroke.x = CANVAS_WIDTH_HALF;
        _oMsgTextStroke.y = CANVAS_HEIGHT_HALF - 70;
        _oMsgTextStroke.outline = 5;
	_oContainer.addChild(_oMsgTextStroke);

        _oMsgText = new createjs.Text(TEXT_CREDITS_DEVELOPED, "40px " + PRIMARY_FONT, PRIMARY_FONT_COLOR);
        _oMsgText.textAlign = "center";
        _oMsgText.textBaseline = "alphabetic";
	_oMsgText.x = _oMsgTextStroke.x;
        _oMsgText.y = _oMsgTextStroke.y;
	_oContainer.addChild(_oMsgText);

        oSprite = s_oSpriteLibrary.getSprite('logo_ctl');
        _oButLogo = createBitmap(oSprite);
        _oButLogo.regX = oSprite.width/2;
        _oButLogo.regY = oSprite.height/2;
        _oButLogo.x = CANVAS_WIDTH_HALF;
        _oButLogo.y = CANVAS_HEIGHT_HALF;
        _oContainer.addChild(_oButLogo);

        _oLinkStroke = new createjs.Text("www.codethislab.com", "28px " + PRIMARY_FONT, SECONDARY_FONT_COLOR);
        _oLinkStroke.textAlign = "center";
        _oLinkStroke.textBaseline = "alphabetic";
	_oLinkStroke.x = CANVAS_WIDTH_HALF;
        _oLinkStroke.y = CANVAS_HEIGHT_HALF + 90;
        _oLinkStroke.outline = 5;
        _oContainer.addChild(_oLinkStroke);

        _oLink = new createjs.Text("www.codethislab.com", "28px " + PRIMARY_FONT, PRIMARY_FONT_COLOR);
        _oLink.textAlign = "center";
        _oLink.textBaseline = "alphabetic";
	_oLink.x = _oLinkStroke.x;
        _oLink.y = _oLinkStroke.y;
        _oContainer.addChild(_oLink);

        new createjs.Tween.get(_oContainer).to({y:0},1000, createjs.Ease.backOut);
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