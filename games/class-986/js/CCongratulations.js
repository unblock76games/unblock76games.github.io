function CCongratulations(aResults, iScore) {
    var _pStartPosAudio;
    var _pStartPosPlay;
    var _oBg;
    var _oMsgBox;
    var _oButMenu;
    var _oTitleStroke;
    var _oTitle;
    var _oScoreStroke;
    var _oScore;
    var _oTrophy;
    var _oFade;
    var _oResultsContainer;
    var _oAudioToggle;

    this._init = function (aResults, iScore) {
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(_oBg);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;

        s_oStage.addChild(_oFade);

        var oSpriteMsgBox = s_oSpriteLibrary.getSprite('msg_box');
        _oMsgBox = createBitmap(oSpriteMsgBox);
        _oMsgBox.x = CANVAS_WIDTH * 0.5;
        _oMsgBox.y = CANVAS_HEIGHT * 0.5;
        _oMsgBox.regX = oSpriteMsgBox.width * 0.5;
        _oMsgBox.regY = oSpriteMsgBox.height * 0.5;
        s_oStage.addChild(_oMsgBox);

        var oSprite = s_oSpriteLibrary.getSprite('but_home');
        _pStartPosPlay = {x: CANVAS_WIDTH / 2, y: 470};
        _oButMenu = new CGfxButton(_pStartPosPlay.x, _pStartPosPlay.y, oSprite, s_oStage);
        _oButMenu.addEventListener(ON_MOUSE_UP, this._onButMenuRelease, this);
        _oButMenu.pulseAnimation();

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height / 2) - 10, y: (oSprite.height / 2) + 10};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        _oTitleStroke = new createjs.Text(TEXT_CONGRATULATIONS, "36px " + FONT_GAME, "#ff6000");
        _oTitleStroke.x = CANVAS_WIDTH * 0.5;
        _oTitleStroke.y = CANVAS_HEIGHT * 0.5 - 190;
        _oTitleStroke.textAlign = "center";
        _oTitleStroke.lineWidth = 800;
        _oTitleStroke.outline = 5;
        s_oStage.addChild(_oTitleStroke);

        _oTitle = new createjs.Text(TEXT_CONGRATULATIONS, "36px " + FONT_GAME, TEXT_COLOR);
        _oTitle.x = CANVAS_WIDTH * 0.5;
        _oTitle.y = _oTitleStroke.y;
        _oTitle.lineWidth = _oTitleStroke.lineWidth;
        _oTitle.textAlign = "center";
        s_oStage.addChild(_oTitle);

        var oInfo = this.createResultText(aResults);

        _oScoreStroke = new createjs.Text(TEXT_TOTAL_SCORE + ": " + iScore, "30px " + FONT_GAME, "#ff6000");
        _oScoreStroke.x = CANVAS_WIDTH * 0.5;
        _oScoreStroke.y = CANVAS_HEIGHT * 0.5 + oInfo.offsetY;
        _oScoreStroke.textAlign = "center";
        _oScoreStroke.outline = 5;
        s_oStage.addChild(_oScoreStroke);

        _oScore = new createjs.Text(TEXT_TOTAL_SCORE + ": " + iScore, "30px " + FONT_GAME, TEXT_COLOR);
        _oScore.x = CANVAS_WIDTH * 0.5;
        _oScore.y = CANVAS_HEIGHT * 0.5 + oInfo.offsetY;
        _oScore.textAlign = "center";
        s_oStage.addChild(_oScore);

        var oSpriteTrophy = s_oSpriteLibrary.getSprite("trophy");

        _oTrophy = createBitmap(oSpriteTrophy);
        _oTrophy.x = 406;
        _oTrophy.y = -oSpriteTrophy.height * 0.5;
        _oTrophy.regX = oSpriteTrophy.width * 0.5;
        _oTrophy.regY = oSpriteTrophy.height * 0.5;

        s_oStage.addChild(_oTrophy);

        createjs.Tween.get(_oTrophy).wait(oInfo.time).to({y: 431}, 1000, createjs.Ease.bounceOut);

        var oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(oFade);

        createjs.Tween.get(oFade).to({alpha: 0}, 1000).call(function () {
            s_oStage.removeChild(oFade);
        });

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.createResultText = function (aResults) {
        _oResultsContainer = new createjs.Container();

        var iOffsetY = -120;
        var iTime = 200;
        var bOdd = false;
        var iNumOdd = 0;

        if ((TOT_MATCH) % 2 === 1) {
            bOdd = true;
            iNumOdd = TOT_MATCH - 1;
        }

        for (var i = 0; i < aResults.length; i++, iTime += 150) {
            var oContainer = new createjs.Container();
            oContainer.alpha = 0;

            var szResult = aResults[i].result;
            var iMatchNumber = i + 1;

            var oGoalResultStroke;

            oGoalResultStroke = new createjs.Text(szResult, "28px " + FONT_GAME, "#ff6000");
            oGoalResultStroke.x = 0;
            oGoalResultStroke.y = 3;
            oGoalResultStroke.textAlign = "center";
            oGoalResultStroke.outline = 5;

            oContainer.addChild(oGoalResultStroke);

            var oGoalResult;

            oGoalResult = new createjs.Text(szResult, "28px " + FONT_GAME, TEXT_COLOR);
            oGoalResult.x = 0;
            oGoalResult.y = 3;
            oGoalResult.textAlign = "center";

            oContainer.addChild(oGoalResult);

            var oMatchNumberStroke;

            oMatchNumberStroke = new createjs.Text(iMatchNumber + ".", "28px " + FONT_GAME, "#ff6000");
            oMatchNumberStroke.x = -100;
            oMatchNumberStroke.y = 3;
            oMatchNumberStroke.textAlign = "center";
            oMatchNumberStroke.outline = 5;

            oContainer.addChild(oMatchNumberStroke);

            var oMatchNumber;

            oMatchNumber = new createjs.Text(iMatchNumber + ".", "28px " + FONT_GAME, TEXT_COLOR);
            oMatchNumber.x = oMatchNumberStroke.x;
            oMatchNumber.y = 3;
            oMatchNumber.textAlign = "center";

            oContainer.addChild(oMatchNumber);

            var oSpriteFlagSmall = s_oSpriteLibrary.getSprite("flags_small");

            var oPlayerTeamFlag = new CFlag(-65, 15, aResults[i].player_team, false, oSpriteFlagSmall, oContainer);
            oPlayerTeamFlag.setScale(0.7);

            var oOpponentTeamFlag = new CFlag(65, 15, aResults[i].opponent_team, false, oSpriteFlagSmall, oContainer);
            oOpponentTeamFlag.setScale(0.7);

            oContainer.y = CANVAS_HEIGHT * 0.5 + iOffsetY;
            var iX;
            if (i % 2 === 0) {
                if (iNumOdd === i && bOdd) {
                    iX = CANVAS_WIDTH * 0.5;
                } else {
                    iX = CANVAS_WIDTH * 0.5 - 250;
                }
                oContainer.x = -100;
            } else {
                oContainer.x = CANVAS_WIDTH + 100;
                iX = CANVAS_WIDTH * 0.5 + 250;
                iOffsetY += 40;
            }
            createjs.Tween.get(oContainer).wait(iTime).to({x: iX, alpha: 1}, 500, createjs.Ease.cubicIn);

            _oResultsContainer.addChild(oContainer);
        }

        s_oStage.addChild(_oResultsContainer);

        return {offsetY: iOffsetY + 50, time: iTime + 150};

    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
    };

    this.unload = function () {
        _oButMenu.unload();
        _oButMenu = null;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        s_oStage.removeAllChildren();
        createjs.Tween.removeAllTweens();

        s_oCongratulations = null;
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onButMenuRelease = function () {
        this.unload();

        s_oMain.gotoMenu();
    };

    s_oCongratulations = this;

    this._init(aResults, iScore);
}

var s_oCongratulations = null;