function CSetAllowed(oParentContainer) {
    var _oText1;
    var _oText1Shadow;
    var _oBg;
    var _oGroup;
    var _oButHome;
    var _oParentContainer = oParentContainer;

    this._init = function () {
        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        _oBg = createBitmap(oSprite);
        _oBg.regX = oSprite.width * 0.5;
        _oBg.regY = oSprite.height * 0.5;
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;

        var oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        oFade.alpha = 0.5;

        var oText1Pos = {x: CANVAS_WIDTH / 2, y: (CANVAS_HEIGHT / 2) - 110};

        _oText1Shadow = new createjs.Text(TEXT_WRONG, " 24px " + PRIMARY_FONT, "#000");
        _oText1Shadow.x = oText1Pos.x + 2;
        _oText1Shadow.y = oText1Pos.y + 2;
        _oText1Shadow.textAlign = "center";
        _oText1Shadow.textBaseline = "middle";
        _oText1Shadow.lineWidth = 300;
        _oText1Shadow.alpha = TEXT_SHADOWN_ALPHA;

        _oText1 = new createjs.Text(TEXT_WRONG, " 24px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oText1.x = oText1Pos.x;
        _oText1.y = oText1Pos.y;
        _oText1.textAlign = "center";
        _oText1.textBaseline = "middle";
        _oText1.lineWidth = 300;

        _oGroup = new createjs.Container();
        _oGroup.addChild(oFade, _oBg, _oText1Shadow, _oText1);
        _oGroup.alpha = 0;
        _oParentContainer.addChild(_oGroup);

        _oButHome = new CGfxButton(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5 + 70, s_oSpriteLibrary.getSprite("but_home"), _oGroup);
        // _oButHome.addEventListener(ON_MOUSE_DOWN, this._onExitHelp, this);
        _oButHome.pulseAnimation();

        var oParent = this;
        _oGroup.on("pressup", function () {
            oParent._onPressUp();
        }, null, true);

        _oGroup.cursor = "pointer";

        createjs.Tween.get(_oGroup).to({alpha: 1}, 1000, createjs.cubicOut);
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oGroup);
        _oGroup.removeAllEventListeners();
        _oButHome.unload();
        _oButHome = null;
    };

    this._onPressUp = function () {
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha: 0}, 700, createjs.Ease.cubicOut).call(function () {
            oParent.unload();
            s_oGame.onExit();
        });
    };

    this._init();
    return this;
}
