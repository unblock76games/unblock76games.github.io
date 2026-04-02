function CEndPanel(oSpriteBg, bPlayerWin, bEnd) {

    var _oBg;
    var _oNameTextPlayer;
    var _oNameTextOpponent;
    var _oTitleText;
    var _oSetText;
    var _oSetPlayerText;
    var _oSetOpponentText;
    var _oNewScoreText;
    var _oEarnedScoreText;
    var _oTitleTextShadow;
    var _oNameTextPlayerShadow;
    var _oNameTextOpponentShadow;
    var _oSetTextShadow;
    var _oSetPlayerTextShadow;
    var _oSetOpponentTextShadow;
    var _oNewScoreTextShadow;
    var _oEarnedScoreTextShadow;
    var _oGroup;
    var _oButMenu;
    var _oButAction = null;
    var _oFade;

    this._init = function (oSpriteBg, bPlayerWin, bEnd) {
        var iSizeFontSecondaryText = 34;

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.0;
        _oFade.on("click", function () {});

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

        _oTitleTextShadow = new createjs.Text("", "50px " + PRIMARY_FONT, "#000");
        _oTitleTextShadow.x = CANVAS_WIDTH / 2 + 2;
        _oTitleTextShadow.y = CANVAS_HEIGHT_HALF - 208;
        _oTitleTextShadow.textAlign = "center";
        _oTitleTextShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oGroup.addChild(_oTitleTextShadow);

        _oTitleText = new createjs.Text("", "50px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oTitleText.x = CANVAS_WIDTH / 2;
        _oTitleText.y = CANVAS_HEIGHT_HALF - 210;
        _oTitleText.textAlign = "center";

        _oGroup.addChild(_oTitleText);

        _oNameTextPlayerShadow = new createjs.Text("", "34px " + PRIMARY_FONT, "#000");
        _oNameTextPlayerShadow.x = CANVAS_WIDTH / 2 - 178;
        _oNameTextPlayerShadow.y = (CANVAS_HEIGHT / 2) - 118;
        _oNameTextPlayerShadow.textAlign = "center";
        _oNameTextPlayerShadow.textBaseline = "middle";
        _oNameTextPlayerShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oGroup.addChild(_oNameTextPlayerShadow);

        _oNameTextPlayer = new createjs.Text("", "34px " + PRIMARY_FONT, TEXT_COLOR_4);
        _oNameTextPlayer.x = CANVAS_WIDTH / 2 - 180;
        _oNameTextPlayer.y = (CANVAS_HEIGHT / 2) - 120;
        _oNameTextPlayer.textAlign = "center";
        _oNameTextPlayer.textBaseline = "middle";

        _oGroup.addChild(_oNameTextPlayer);

        _oNameTextOpponentShadow = new createjs.Text("", "34px " + PRIMARY_FONT, "#000");
        _oNameTextOpponentShadow.x = CANVAS_WIDTH / 2 + 182;
        _oNameTextOpponentShadow.y = (CANVAS_HEIGHT / 2) - 118;
        _oNameTextOpponentShadow.textAlign = "center";
        _oNameTextOpponentShadow.textBaseline = "middle";
        _oNameTextOpponentShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oGroup.addChild(_oNameTextOpponentShadow);

        _oNameTextOpponent = new createjs.Text("", "34px " + PRIMARY_FONT, TEXT_COLOR_4);
        _oNameTextOpponent.x = CANVAS_WIDTH / 2 + 180;
        _oNameTextOpponent.y = (CANVAS_HEIGHT / 2) - 120;
        _oNameTextOpponent.textAlign = "center";
        _oNameTextOpponent.textBaseline = "middle";

        _oGroup.addChild(_oNameTextOpponent);

        _oSetTextShadow = new createjs.Text("", iSizeFontSecondaryText + "px " + PRIMARY_FONT, "#000");
        _oSetTextShadow.x = CANVAS_WIDTH / 2 + 2;
        _oSetTextShadow.y = (CANVAS_HEIGHT / 2) - 83;
        _oSetTextShadow.textAlign = "center";
        _oSetTextShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oGroup.addChild(_oSetTextShadow);

        _oSetText = new createjs.Text("", iSizeFontSecondaryText + "px " + PRIMARY_FONT, TEXT_COLOR_4);
        _oSetText.x = CANVAS_WIDTH / 2;
        _oSetText.y = (CANVAS_HEIGHT / 2) - 85;
        _oSetText.textAlign = "center";

        _oGroup.addChild(_oSetText);

        _oSetPlayerTextShadow = new createjs.Text("", iSizeFontSecondaryText + "px " + PRIMARY_FONT, "#000");
        _oSetPlayerTextShadow.x = _oNameTextPlayer.x + 2;
        _oSetPlayerTextShadow.y = _oSetText.y + 2;
        _oSetPlayerTextShadow.textAlign = "center";
        _oSetPlayerTextShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oGroup.addChild(_oSetPlayerTextShadow);

        _oSetPlayerText = new createjs.Text("", iSizeFontSecondaryText + "px " + PRIMARY_FONT, TEXT_COLOR_4);
        _oSetPlayerText.x = _oNameTextPlayer.x;
        _oSetPlayerText.y = _oSetText.y;
        _oSetPlayerText.textAlign = "center";

        _oGroup.addChild(_oSetPlayerText);

        _oSetOpponentTextShadow = new createjs.Text("", iSizeFontSecondaryText + "px " + PRIMARY_FONT, "#000");
        _oSetOpponentTextShadow.x = _oNameTextOpponent.x + 2;
        _oSetOpponentTextShadow.y = _oSetText.y + 2;
        _oSetOpponentTextShadow.textAlign = "center";
        _oSetOpponentTextShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oGroup.addChild(_oSetOpponentTextShadow);

        _oSetOpponentText = new createjs.Text("", iSizeFontSecondaryText + "px " + PRIMARY_FONT, TEXT_COLOR_4);
        _oSetOpponentText.x = _oNameTextOpponent.x;
        _oSetOpponentText.y = _oSetText.y;
        _oSetOpponentText.textAlign = "center";

        _oGroup.addChild(_oSetOpponentText);

        _oEarnedScoreTextShadow = new createjs.Text("", iSizeFontSecondaryText + "px " + PRIMARY_FONT, "#000");
        _oEarnedScoreTextShadow.x = CANVAS_WIDTH / 2 + 2;
        _oEarnedScoreTextShadow.y = (CANVAS_HEIGHT / 2) - 13;
        _oEarnedScoreTextShadow.textAlign = "center";
        _oEarnedScoreTextShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oGroup.addChild(_oEarnedScoreTextShadow);

        _oEarnedScoreText = new createjs.Text("",  iSizeFontSecondaryText + "px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oEarnedScoreText.x = CANVAS_WIDTH / 2;
        _oEarnedScoreText.y = (CANVAS_HEIGHT / 2) - 15;
        _oEarnedScoreText.textAlign = "center";

        _oGroup.addChild(_oEarnedScoreText);

        _oNewScoreTextShadow = new createjs.Text("", iSizeFontSecondaryText + "px " + PRIMARY_FONT, "#000");
        _oNewScoreTextShadow.x = CANVAS_WIDTH / 2 + 2;
        _oNewScoreTextShadow.y = (CANVAS_HEIGHT / 2) + 57;
        _oNewScoreTextShadow.textAlign = "center";
        _oNewScoreTextShadow.alpha = TEXT_SHADOWN_ALPHA;

        _oGroup.addChild(_oNewScoreTextShadow);

        _oNewScoreText = new createjs.Text("", iSizeFontSecondaryText + "px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oNewScoreText.x = CANVAS_WIDTH / 2;
        _oNewScoreText.y = (CANVAS_HEIGHT / 2) + 55;
        _oNewScoreText.textAlign = "center";

        _oGroup.addChild(_oNewScoreText);

        var oSpriteButHome = s_oSpriteLibrary.getSprite("but_home");
        _oButMenu = new CGfxButton(CANVAS_WIDTH * 0.5 - 220, CANVAS_HEIGHT * 0.5 + 150, oSpriteButHome, _oGroup);
        _oButMenu.addEventListener(ON_MOUSE_DOWN, this._onExit, this);

        var oSpriteButAction = s_oSpriteLibrary.getSprite("but_continue");
        var oCallFunc = this._onContinue;

        if (bPlayerWin === false) {
            oSpriteButAction = s_oSpriteLibrary.getSprite("but_restart");
            oCallFunc = this._onRestart;
        } else if (bEnd === true) {
            oCallFunc = this._onEnd;
        }

        _oButAction = new CGfxButton(CANVAS_WIDTH * 0.5 + 220, CANVAS_HEIGHT * 0.5 + 150, oSpriteButAction, _oGroup);
        _oButAction.addEventListener(ON_MOUSE_DOWN, oCallFunc, this);
        _oButAction.pulseAnimation();

        s_oStage.addChild(_oGroup);
    };

    this.unload = function () {
        createjs.Tween.get(_oGroup).to({y: CANVAS_HEIGHT}, 750, createjs.Ease.quartIn).call(function () {
            s_oStage.removeChild(_oGroup);
            if (_oButMenu) {
                _oButMenu.unload();
                _oButMenu = null;
            }

            if (_oButAction) {
                _oButAction.unload();
                _oButAction = null;
            }
        });

        createjs.Tween.get(_oFade).to({alpha: 0}, 400, createjs.Ease.cubicOut).call(function () {
            s_oStage.removeChild(_oFade);
            _oFade.removeAllEventListeners();
        });

        _oButAction.setClickable(false);
        _oButMenu.setClickable(false);
    };

    this.show = function (iPlayerSet, iOpponentSet, iPlayerPoint, iOpponentPoint, iScore, iTotScore, bWin) {

        _oTitleText.text = TEXT_WIN;

        if (!bWin) {
            _oTitleText.text = TEXT_LOSE;
        }
        _oTitleTextShadow.text = _oTitleText.text;

        _oNameTextPlayer.text = TEXT_CHARACTERS_NAMES[PLAYER_SIDE];
        _oNameTextOpponent.text = TEXT_CHARACTERS_NAMES[OPPONENT_SIDE];

        _oNameTextPlayerShadow.text = TEXT_CHARACTERS_NAMES[PLAYER_SIDE];
        _oNameTextOpponentShadow.text = TEXT_CHARACTERS_NAMES[OPPONENT_SIDE];

        _oSetText.text = TEXT_SET;
        _oSetTextShadow.text = _oSetText.text;

        _oSetPlayerText.text = iPlayerSet;
        _oSetOpponentText.text = iOpponentSet;
        _oSetPlayerTextShadow.text = iPlayerSet;
        _oSetOpponentTextShadow.text = iOpponentSet;

        _oEarnedScoreText.text = TEXT_SCORE_MATCH + ": " + iScore;
        _oEarnedScoreTextShadow.text = _oEarnedScoreText.text;

        _oNewScoreText.text = TEXT_TOTAL_SCORE + ": " + iTotScore;
        _oNewScoreTextShadow.text = _oNewScoreText.text;

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

        $(s_oMain).trigger("save_score", iTotScore);
        $(s_oMain).trigger("share_event", iTotScore);
    };

    this._onContinue = function () {
        this.unload();
        s_oGame.onContinue();
    };

    this._onRestart = function () {
        this.unload();

        s_oGame.restartGame();
    }

    this._onEnd = function () {
        this.unload();
        s_oGame.onExit();
    };

    this._onExit = function () {
        this.unload();


        s_oGame.onExit();
    };

    this._init(oSpriteBg, bPlayerWin, bEnd);

    return this;
}