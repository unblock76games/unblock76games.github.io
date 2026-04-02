function CConfirmPanel(szText, oParentContainer) {

    var _iTextY = -100;
    var _iButtonY = 90;

    var _oParent = this;

    var _aCbCompleted = new Array();
    var _aCbOwner = new Array();
    var _aParams = new Array();

    var _oBg;
    var _oContainer;
    var _oContainerPos = {x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2};

    var _szText = szText;
    var _oMsgText;
    var _oMsgTextShadow;

    var _oShape;

    var _oButNo;
    var _oButYes;

    var _oParentContainer = oParentContainer;

    this._init = function () {
        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');

        _oContainer = new createjs.Container();
        _oContainer.x = _oContainerPos.x;
        _oContainer.y = -oSpriteBg.height;

        _oShape = new createjs.Shape();
        _oShape.graphics.beginFill("#000000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oShape.alpha = 0.0;
        _oShape.on("mousedown", this._onClick);
        _oParentContainer.addChild(_oShape);

        _oBg = createBitmap(oSpriteBg);
        _oBg.regX = oSpriteBg.width / 2;
        _oBg.regY = oSpriteBg.height / 2;
        _oContainer.addChild(_oBg);

        _oMsgTextShadow = new createjs.Text(_szText, " 32px " + PRIMARY_FONT, "#000");
        _oMsgTextShadow.x = 2;
        _oMsgTextShadow.y = _iTextY + 2;
        _oMsgTextShadow.textAlign = "center";
        _oMsgTextShadow.textBaseline = "alphabetic";
        _oMsgTextShadow.lineWidth = 400;
        _oMsgTextShadow.alpha = TEXT_SHADOWN_ALPHA;
        _oContainer.addChild(_oMsgTextShadow);

        _oMsgText = new createjs.Text(_szText, " 32px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oMsgText.y = _iTextY;
        _oMsgText.textAlign = "center";
        _oMsgText.textBaseline = "alphabetic";
        _oMsgText.lineWidth = 400;
        _oContainer.addChild(_oMsgText);

        _oButNo = new CGfxButton(-140, _iButtonY, s_oSpriteLibrary.getSprite('but_exit_big'), _oContainer);
        _oButNo.pulseAnimation();

        _oButYes = new CGfxButton(140, _iButtonY, s_oSpriteLibrary.getSprite('but_yes_big'), _oContainer);

        _oParentContainer.addChild(_oContainer);

        this.show();
    };

    this._initListener = function () {
        _oButNo.addEventListener(ON_MOUSE_DOWN, this.buttonNoDown, this);
        _oButYes.addEventListener(ON_MOUSE_DOWN, this.buttonYesDown, this);
    };

    this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };

    this.buttonNoDown = function () {

        if (_aCbCompleted[ON_BUT_NO_DOWN]) {
            _aCbCompleted[ON_BUT_NO_DOWN].call(_aCbOwner[ON_BUT_NO_DOWN], _aParams);
        }
    };

    this.buttonYesDown = function () {

        if (_aCbCompleted[ON_BUT_YES_DOWN]) {
            _aCbCompleted[ON_BUT_YES_DOWN].call(_aCbOwner[ON_BUT_YES_DOWN], _aParams);
        }
    };

    this._onClick = function () {

    };

    this.show = function () {
        createjs.Tween.get(_oShape).to({alpha: 0.7}, 500);

        createjs.Tween.get(_oContainer).to({y: _oContainerPos.y}, 500, createjs.Ease.quadOut).call(function () {
            _oParent._initListener();
        });
    };

    this.unload = function () {
        createjs.Tween.get(_oContainer).to({y: CANVAS_HEIGHT * 1.5}, 500).call(function () {
            _oParentContainer.removeChild(_oContainer);
        });

        createjs.Tween.get(_oShape).to({alpha: 0}, 500).call(function () {
            _oShape.removeAllEventListeners();
            _oParentContainer.removeChild(_oShape);
        });

    };

    this._init();

    return this;
}
