function CWinPanel(oSpriteBg, bEnd) {

    var _oBg;
    var _oResultTextStroke;
    var _oResultText;
    var _oTitleTextStoke;
    var _oTitleText;
    var _oScoreTextBallSavedStroke;
    var _oScoreTextBallSaved;
    var _oScoreTextBallPerfectStroke;
    var _oScoreTextBallPerfect;
    var _oScoreOpponentTextStroke;
    var _oScoreOpponentText;
    var _oScoreMatchTextStroke;
    var _oScoreMatchText;
    var _oNewScoreTextStroke;
    var _oNewScoreText;
    var _oGroup;
    var _oButMenu;
    var _oButContinue;
    var _oFade;

    this._init = function (oSpriteBg, bEnd) {
        var iSizeFontSecondaryText = 34;

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.0;

        s_oStage.addChild(_oFade);

        _oGroup = new createjs.Container();
        _oGroup.alpha = 1;
        _oGroup.visible = false;
        _oGroup.y = CANVAS_HEIGHT;

        _oBg = createBitmap(oSpriteBg);
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;
        _oBg.regX = oSpriteBg.width * 0.5;
        _oBg.regY = oSpriteBg.height * 0.5;
        _oGroup.addChild(_oBg);

        _oTitleText = new createjs.Text("", "50px " + FONT_GAME, "#ffffff");
        _oTitleText.x = CANVAS_WIDTH / 2;
        _oTitleText.y = CANVAS_HEIGHT_HALF - 230;
        _oTitleText.textAlign = "center";

        _oGroup.addChild(_oTitleText);

        _oResultText = new createjs.Text("", "34px " + FONT_GAME, "#ffffff");
        _oResultText.x = CANVAS_WIDTH / 2;
        _oResultText.y = (CANVAS_HEIGHT / 2) - 120;
        _oResultText.textAlign = "center";
        _oResultText.textBaseline = "middle";

        _oGroup.addChild(_oResultText);

        _oScoreTextBallSaved = new createjs.Text("",  iSizeFontSecondaryText + "px " + FONT_GAME, "#ffffff");
        _oScoreTextBallSaved.x = CANVAS_WIDTH / 2;
        _oScoreTextBallSaved.y = (CANVAS_HEIGHT / 2) - 70;
        _oScoreTextBallSaved.textAlign = "center";

        _oGroup.addChild(_oScoreTextBallSaved);

        _oScoreTextBallPerfect = new createjs.Text("",  iSizeFontSecondaryText + "px " + FONT_GAME, "#ffffff");
        _oScoreTextBallPerfect.x = CANVAS_WIDTH / 2;
        _oScoreTextBallPerfect.y = (CANVAS_HEIGHT / 2) - 10;
        _oScoreTextBallPerfect.textAlign = "center";

        _oGroup.addChild(_oScoreTextBallPerfect);

        _oScoreOpponentText = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, "#ffffff");
        _oScoreOpponentText.x = CANVAS_WIDTH / 2;
        _oScoreOpponentText.y = (CANVAS_HEIGHT / 2) + 50;
        _oScoreOpponentText.textAlign = "center";

        _oGroup.addChild(_oScoreOpponentText);

        _oNewScoreText = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, "#ffffff");
        _oNewScoreText.x = CANVAS_WIDTH / 2;
        _oNewScoreText.y = (CANVAS_HEIGHT / 2) + 170;
        _oNewScoreText.textAlign = "center";

        _oGroup.addChild(_oNewScoreText);

        var oSpriteButContinue = s_oSpriteLibrary.getSprite("but_continue");
        _oButContinue = new CGfxButton(CANVAS_WIDTH * 0.5 + 360, CANVAS_HEIGHT * 0.5 + 180, oSpriteButContinue, _oGroup);
        _oButContinue.pulseAnimation();

        if (bEnd === false) {
            var oSpriteButHome = s_oSpriteLibrary.getSprite("but_home");
            _oButMenu = new CGfxButton(CANVAS_WIDTH * 0.5 - 360, CANVAS_HEIGHT * 0.5 + 180, oSpriteButHome, _oGroup);
            _oButMenu.addEventListener(ON_MOUSE_DOWN, this._onExit, this);

            _oButContinue.addEventListener(ON_MOUSE_DOWN, this._onContinue, this);
        } else {
            _oButContinue.addEventListener(ON_MOUSE_DOWN, this._onEnd, this);
        }

        s_oStage.addChild(_oGroup);

    };

    this.unload = function () {

        s_oStage.removeChild(_oGroup);
        if (_oButMenu) {
            _oButMenu.unload();
            _oButMenu = null;
        }

        if (_oButContinue) {
            _oButContinue.unload();
            _oButContinue = null;
        }
    };

    this.show = function (iBallSaved, iPerfect, iTarget, oScore) {
        _oTitleText.text = TEXT_WIN;

        _oResultText.text = TEXT_WIN_RESULT + " " + iBallSaved + " " + TEXT_OF + " " + iTarget + " " + TEXT_BALLS;

        _oScoreTextBallSaved.text = TEXT_SCORE_BALL_SAVED + ": " + oScore.ball_saved;

        _oScoreTextBallPerfect.text = TEXT_SCORE_BALL_SAVED_PERFECT + ": " + oScore.ball_saved_perfect;

        _oScoreOpponentText.text = TEXT_GOAL_OPPONENT + ": " + oScore.opponent_goal;
        
        _oNewScoreText.text = TEXT_TOTAL_SCORE + ": " + oScore.new_score;

        _oGroup.visible = true;

        createjs.Tween.get(_oFade).to({alpha: 0.5}, 500, createjs.Ease.cubicOut);

        createjs.Tween.get(_oGroup).wait(250).to({y: 0}, 1250, createjs.Ease.bounceOut).call(function () {
            if (s_iAdsLevel === NUM_LEVEL_FOR_ADS) {
                $(s_oMain).trigger("show_interlevel_ad");
                s_iAdsLevel = 1;
            } else {
                s_iAdsLevel++;
            }
        });

        $(s_oMain).trigger("save_score", oScore.new_score);
        $(s_oMain).trigger("share_event", oScore.new_score);
    };

    this._onContinue = function () {
        var oParent = this;
        createjs.Tween.get(_oGroup).to({y: CANVAS_HEIGHT}, 750, createjs.Ease.quartIn).call(function () {
            oParent.unload();
        });

        createjs.Tween.get(_oFade).to({alpha: 0}, 400, createjs.Ease.cubicOut).call(function () {
            s_oStage.removeChild(_oFade);
            _oFade.removeAllEventListeners();
        });

        _oButContinue.block(true);
        _oButMenu.block(true);

        s_oGame.onContinue(s_oStage.getChildIndex(_oGroup));
    };

    this._onEnd = function () {
        this.unload();
        s_oGame._onEnd();
    };

    this._onExit = function () {
        this.unload();

        _oFade.off("click", function () {});

        s_oGame.onExit();
    };

    this._init(oSpriteBg, bEnd);

    return this;
}