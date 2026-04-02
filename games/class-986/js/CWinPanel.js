function CWinPanel(oSpriteBg, bEnd) {

    var _oBg;
    var _oResultTextStroke;
    var _oResultText;
    var _oTitleTextStoke;
    var _oTitleText;
    var _oScoreTextGoalPlayerStroke;
    var _oScoreTextGoalPlayer;
    var _oScoreTextGoalOpponentStroke;
    var _oScoreTextGoalOpponent;
    var _oScoreMatchTextStroke;
    var _oScoreMatchText;
    var _oNewScoreTextStroke;
    var _oNewScoreText;
    var _oNewScoreText;
    var _oTitleText;
    var _oGroup;
    var _oButMenu;
    var _oButContinue;
    var _oFade;

    this._init = function (oSpriteBg, bEnd) {
        var iSizeFontSecondaryText = 24;

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

        _oTitleTextStoke = new createjs.Text("", "50px " + FONT_GAME, "#ff6000");
        _oTitleTextStoke.x = CANVAS_WIDTH / 2;
        _oTitleTextStoke.y = CANVAS_HEIGHT_HALF - 200;
        _oTitleTextStoke.textAlign = "center";
        _oTitleTextStoke.outline = 5;

        _oGroup.addChild(_oTitleTextStoke);

        _oTitleText = new createjs.Text("", "50px " + FONT_GAME, TEXT_COLOR);
        _oTitleText.x = CANVAS_WIDTH / 2;
        _oTitleText.y = _oTitleTextStoke.y;
        _oTitleText.textAlign = "center";

        _oGroup.addChild(_oTitleText);

        _oResultTextStroke = new createjs.Text("", "26px " + FONT_GAME, "#ff6000");
        _oResultTextStroke.x = CANVAS_WIDTH / 2;
        _oResultTextStroke.y = (CANVAS_HEIGHT / 2) - 90;
        _oResultTextStroke.textAlign = "center";
        _oResultTextStroke.textBaseline = "middle";
        _oResultTextStroke.outline = 5;

        _oGroup.addChild(_oResultTextStroke);

        _oResultText = new createjs.Text("", "26px " + FONT_GAME, TEXT_COLOR);
        _oResultText.x = CANVAS_WIDTH / 2;
        _oResultText.y = _oResultTextStroke.y;
        _oResultText.textAlign = "center";
        _oResultText.textBaseline = "middle";

        _oGroup.addChild(_oResultText);

        _oScoreTextGoalPlayerStroke = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, "#ff6000");
        _oScoreTextGoalPlayerStroke.x = CANVAS_WIDTH / 2;
        _oScoreTextGoalPlayerStroke.y = (CANVAS_HEIGHT / 2) - 20;
        _oScoreTextGoalPlayerStroke.textAlign = "center";
        _oScoreTextGoalPlayerStroke.outline = 5;

        _oGroup.addChild(_oScoreTextGoalPlayerStroke);

        _oScoreTextGoalPlayer = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, TEXT_COLOR);
        _oScoreTextGoalPlayer.x = CANVAS_WIDTH / 2;
        _oScoreTextGoalPlayer.y = _oScoreTextGoalPlayerStroke.y;
        _oScoreTextGoalPlayer.textAlign = "center";

        _oGroup.addChild(_oScoreTextGoalPlayer);

        _oScoreTextGoalOpponentStroke = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, "#ff6000");
        _oScoreTextGoalOpponentStroke.x = CANVAS_WIDTH / 2;
        _oScoreTextGoalOpponentStroke.y = (CANVAS_HEIGHT / 2) + 40;
        _oScoreTextGoalOpponentStroke.textAlign = "center";
        _oScoreTextGoalOpponentStroke.outline = 5;

        _oGroup.addChild(_oScoreTextGoalOpponentStroke);

        _oScoreTextGoalOpponent = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, TEXT_COLOR);
        _oScoreTextGoalOpponent.x = CANVAS_WIDTH / 2;
        _oScoreTextGoalOpponent.y = _oScoreTextGoalOpponentStroke.y;
        _oScoreTextGoalOpponent.textAlign = "center";

        _oGroup.addChild(_oScoreTextGoalOpponent);


        _oScoreMatchTextStroke = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, "#ff6000");
        _oScoreMatchTextStroke.x = CANVAS_WIDTH / 2;
        _oScoreMatchTextStroke.y = (CANVAS_HEIGHT / 2) + 100;
        _oScoreMatchTextStroke.textAlign = "center";
        _oScoreMatchTextStroke.outline = 5;

        _oGroup.addChild(_oScoreMatchTextStroke);

        _oScoreMatchText = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, TEXT_COLOR);
        _oScoreMatchText.x = CANVAS_WIDTH / 2;
        _oScoreMatchText.y = _oScoreMatchTextStroke.y;
        _oScoreMatchText.textAlign = "center";

        _oGroup.addChild(_oScoreMatchText);

        _oNewScoreTextStroke = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, "#ff6000");
        _oNewScoreTextStroke.x = CANVAS_WIDTH / 2;
        _oNewScoreTextStroke.y = (CANVAS_HEIGHT / 2) + 160;
        _oNewScoreTextStroke.textAlign = "center";
        _oNewScoreTextStroke.outline = 5;

        _oGroup.addChild(_oNewScoreTextStroke);

        _oNewScoreText = new createjs.Text("", iSizeFontSecondaryText + "px " + FONT_GAME, TEXT_COLOR);
        _oNewScoreText.x = CANVAS_WIDTH / 2;
        _oNewScoreText.y = _oNewScoreTextStroke.y;
        _oNewScoreText.textAlign = "center";

        _oGroup.addChild(_oNewScoreText);

        var oSpriteButContinue = s_oSpriteLibrary.getSprite("but_continue");
        _oButContinue = new CGfxButton(CANVAS_WIDTH * 0.5 + 310, CANVAS_HEIGHT * 0.5 + 150, oSpriteButContinue, _oGroup);
        _oButContinue.pulseAnimation();

        if (bEnd === false) {
            var oSpriteButHome = s_oSpriteLibrary.getSprite("but_home");
            _oButMenu = new CGfxButton(CANVAS_WIDTH * 0.5 - 310, CANVAS_HEIGHT * 0.5 + 150, oSpriteButHome, _oGroup);
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

    this.show = function (iGoalPlayer, iGoalOpponent, iPlayerTeam, iOpponentTeam, oInfoScore) {

        var szPlayerTeam = TEXT_TEAM_CODE[iPlayerTeam];
        var szOpponentTeam = TEXT_TEAM_CODE[iOpponentTeam];

        _oResultText.text = szPlayerTeam + " " + iGoalPlayer + " - " + iGoalOpponent + " " + szOpponentTeam;
        _oResultTextStroke.text = szPlayerTeam + " " + iGoalPlayer + " - " + iGoalOpponent + " " + szOpponentTeam;

        _oTitleTextStoke.text = TEXT_WIN;
        _oTitleText.text = TEXT_WIN;

        _oScoreTextGoalPlayerStroke.text = TEXT_SCORE_GOAL_PLAYER + " " + oInfoScore.player_goal_score;
        _oScoreTextGoalPlayer.text = TEXT_SCORE_GOAL_PLAYER + " " + oInfoScore.player_goal_score;

        _oScoreTextGoalOpponentStroke.text = TEXT_SCORE_GOAL_OPPONENT + " " + oInfoScore.opponent_goal_score;
        _oScoreTextGoalOpponent.text = TEXT_SCORE_GOAL_OPPONENT + " " + oInfoScore.opponent_goal_score;

        _oScoreMatchTextStroke.text = TEXT_MACTH_SCORE + ": " + oInfoScore.score_match;
        _oScoreMatchText.text = TEXT_MACTH_SCORE + ": " + oInfoScore.score_match;

        _oNewScoreTextStroke.text = TEXT_TOTAL_SCORE + ": " + oInfoScore.new_score;
        _oNewScoreText.text = TEXT_TOTAL_SCORE + ": " + oInfoScore.new_score;

        var oSpriteFlagSmall = s_oSpriteLibrary.getSprite("flags_small");

        var oFlagPlayer = new CFlag(_oResultText.x - 160, _oResultText.y, iPlayerTeam, false, oSpriteFlagSmall, _oGroup);

        var oFlagOpponent = new CFlag(_oResultText.x + 160, _oResultText.y, iOpponentTeam, false, oSpriteFlagSmall, _oGroup);

        _oGroup.visible = true;

        createjs.Tween.get(_oFade).to({alpha: 0.5}, 500, createjs.Ease.cubicOut);

        createjs.Tween.get(_oGroup).wait(250).to({y: 0}, 1250, createjs.Ease.bounceOut).call(function () {
            if (s_oAdsLevel === NUM_LEVEL_FOR_ADS) {
                $(s_oMain).trigger("show_interlevel_ad");
                s_oAdsLevel = 1;
            } else {
                s_oAdsLevel++;
            }
        });

        $(s_oMain).trigger("save_score", oInfoScore.new_score);
        $(s_oMain).trigger("share_event", oInfoScore.new_score);
    };

    this._onContinue = function () {
        var oParent = this;
        s_oMain.pokiShowCommercial(function(){
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
        });
        
        
        
    };

    this._onEnd = function () {
        _oButContinue.block(true);
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