function CHelpPanel() {
    var _oText1;
    var _oText1Shadow;
    var _oText2;
    var _oText2Shadow;
    var _oHelpBg;
    var _oGroup;
    var _oHandSwipeAnim;
    var _oButContinue;
    var _oPowerBar;

    this._init = function () {
        var oSprite = s_oSpriteLibrary.getSprite('msg_box_big');
        _oHelpBg = createBitmap(oSprite);
        _oHelpBg.regX = oSprite.width * 0.5;
        _oHelpBg.regY = oSprite.height * 0.5;
        _oHelpBg.x = CANVAS_WIDTH_HALF;
        _oHelpBg.y = CANVAS_HEIGHT_HALF;

        var oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        oFade.alpha = 0.5;

        var oText1Pos = {x: CANVAS_WIDTH / 2, y: (CANVAS_HEIGHT / 2) - 190};


        var szImage = "cursor";
        var szText_0 = TEXT_HELP_DESKTOP_1;
        var szText_1 = TEXT_HELP_DESKTOP_2;
        if (s_bMobile) {
            szText_0 = TEXT_HELP_MOBILE_1;
            szText_1 = TEXT_HELP_MOBILE_2;
            szImage = "hand_touch";
        }

        _oText1Shadow = new createjs.Text(szText_0, " 24px " + PRIMARY_FONT, "#000");
        _oText1Shadow.x = oText1Pos.x + 2;
        _oText1Shadow.y = oText1Pos.y + 2;
        _oText1Shadow.textAlign = "center";
        _oText1Shadow.textBaseline = "middle";
        _oText1Shadow.lineWidth = 500;
        _oText1Shadow.alpha = TEXT_SHADOWN_ALPHA;

        _oText1 = new createjs.Text(szText_0, " 24px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oText1.x = oText1Pos.x;
        _oText1.y = oText1Pos.y;
        _oText1.textAlign = "center";
        _oText1.textBaseline = "middle";
        _oText1.lineWidth = 500;

        var oText2Pos = {x: CANVAS_WIDTH / 2 -20, y: (CANVAS_HEIGHT / 2) + 50};

        _oText2Shadow = new createjs.Text(szText_1, " 24px " + PRIMARY_FONT, "#000");
        _oText2Shadow.x = oText2Pos.x + 2;
        _oText2Shadow.y = oText2Pos.y + 2;
        _oText2Shadow.textAlign = "center";
        _oText2Shadow.textBaseline = "middle";
        _oText2Shadow.lineWidth = 300;
        _oText2Shadow.alpha = TEXT_SHADOWN_ALPHA;

        _oText2 = new createjs.Text(szText_1, " 24px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oText2.x = oText2Pos.x;
        _oText2.y = oText2Pos.y;
        _oText2.textAlign = "center";
        _oText2.textBaseline = "middle";
        _oText2.lineWidth = _oText2Shadow.lineWidth;

        _oGroup = new createjs.Container();
        _oGroup.addChild(oFade, _oHelpBg, _oText1Shadow, _oText1, _oText2Shadow, _oText2);
        _oGroup.alpha = 0;
        s_oStage.addChild(_oGroup);

        _oHandSwipeAnim = new CHandSwipeAnim(START_HAND_SWIPE_POS, END_HAND_SWIPE_POS, s_oSpriteLibrary.getSprite(szImage), _oGroup);

        _oPowerBar = new CPowerBar(CANVAS_WIDTH_HALF - 220, CANVAS_HEIGHT_HALF - 50, _oGroup, false);
        _oPowerBar.animateMask(TIME_POWER_BAR);
        _oPowerBar.setScaleX(0.7);
        _oPowerBar.setScaleY(-0.7);

        createjs.Tween.get(_oGroup).to({alpha: 1}, 700, createjs.Ease.cubicIn).call(function () {
            _oHandSwipeAnim.animAllSwipe();
        });

        _oButContinue = new CGfxButton(CANVAS_WIDTH * 0.5 + 220, CANVAS_HEIGHT * 0.5 + 150, s_oSpriteLibrary.getSprite("but_continue"), _oGroup);
        //    _oButContinue.addEventListener(ON_MOUSE_DOWN, this._onExitHelp, this);
        _oButContinue.pulseAnimation();

        var oParent = this;
        _oGroup.on("pressup", function () {
            oParent._onExitHelp();
        }, null, true);

        _oGroup.cursor = "pointer";
    };

    this.unload = function () {
        s_oStage.removeChild(_oGroup);
        _oGroup.removeAllEventListeners();
    };

    this._onExitHelp = function () {
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha: 0}, 700, createjs.Ease.cubicOut).call(function () {
            oParent.unload();
            s_oGame._onExitHelp();
        });
    };

    this._init();
    return this;
}
