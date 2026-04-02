var NUM_ROWS_PAGE_LEVEL = 3;
var NUM_COLS_PAGE_LEVEL = 5;
function CLevelMenu(iTotLevel) {
    var _iCurPage;
    var _iHeightToggle;
    var _aLevelButs;
    var _aPointsX;
    var _aContainerPage;

    var _pStartPosSelect;
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosRight;
    var _pStartPosLeft;
    var _pStartPosTotal;

    var _oButExit;
    var _oAudioToggle;
    var _oArrowRight = null;
    var _oArrowLeft = null;
    var _oTextLevel;
    var _oTextTotalScore;
    var _oContainer;
    var _oFade;

    this._init = function (iTotLevel) {
        _iCurPage = 0;

        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);

        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_level_menu'));
        _oContainer.addChild(oBg);

        _pStartPosSelect = {x: CANVAS_WIDTH / 2, y: 180};

        _oTextLevel = new createjs.Text(TEXT_SELECT_LEVEL, "60px " + PRIMARY_FONT, TEXT_COLOR_4);
        _oTextLevel.x = _pStartPosSelect.x;
        _oTextLevel.y = _pStartPosSelect.y;
        _oTextLevel.textAlign = "center";
        s_oStage.addChild(_oTextLevel);

        _pStartPosTotal = {x: CANVAS_WIDTH_HALF, y: CANVAS_HEIGHT - 180};

        _oTextTotalScore = new createjs.Text(TEXT_TOTAL_SCORE + ": " + s_iBestScore, "50px " + PRIMARY_FONT, TEXT_COLOR_4);
        _oTextTotalScore.x = _pStartPosTotal.x;
        _oTextTotalScore.y = _pStartPosTotal.y;
        _oTextTotalScore.textAlign = "center";
        s_oStage.addChild(_oTextTotalScore);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height / 2) - 10, y: (oSprite.height / 2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        _iHeightToggle = oSprite.height;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _pStartPosAudio = {x: _oButExit.getX() - oSprite.width - 10, y: (oSprite.height / 2) + 10}
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, s_oSpriteLibrary.getSprite('audio_icon'), s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        this._checkBoundLimits();

        //FIND X COORDINATES FOR LEVEL BUTS
        _aPointsX = new Array();
        var iWidth = CANVAS_WIDTH - (EDGEBOARD_X * 4);
        var iOffsetX = Math.floor(iWidth / NUM_COLS_PAGE_LEVEL) / 2;
        var iXPos = 30;
        for (var i = 0; i < NUM_COLS_PAGE_LEVEL; i++) {
            _aPointsX.push(iXPos);
            iXPos += iOffsetX * 2;
        }

        _aContainerPage = new Array();
        this._createNewLevelPage(0, iTotLevel);

        if (_aContainerPage.length > 1) {
            //MULTIPLE PAGES
            for (var k = 1; k < _aContainerPage.length; k++) {
                _aContainerPage[k].visible = false;
            }

            _pStartPosRight = {x: CANVAS_WIDTH - 80, y: CANVAS_HEIGHT - 80};
            _oArrowRight = new CGfxButton(_pStartPosRight.x, _pStartPosRight.y, s_oSpriteLibrary.getSprite('arrow_right'), s_oStage);
            _oArrowRight.addEventListener(ON_MOUSE_UP, this._onRight, this);

            _pStartPosLeft = {x: 80, y: CANVAS_HEIGHT - 80};
            _oArrowLeft = new CGfxButton(_pStartPosLeft.x, _pStartPosLeft.y, s_oSpriteLibrary.getSprite('arrow_left'), s_oStage);
            _oArrowLeft.addEventListener(ON_MOUSE_UP, this._onLeft, this);
        }

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, MS_FADE_ANIM, createjs.Ease.cubicOut).call(function () {
            _oFade.visible = false;
        });

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.unload = function () {
        for (var i = 0; i < _aLevelButs.length; i++) {
            _aLevelButs[i].unload();
        }

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
        }

        _oButExit.unload();

        if (_oArrowLeft !== null) {
            _oArrowLeft.unload();
            _oArrowRight.unload();
        }
        s_oStage.removeAllChildren();
        s_oLevelMenu = null;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX, _pStartPosExit.y + iNewY);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }

        if (_oArrowLeft !== null) {
            _oArrowRight.setPosition(_pStartPosRight.x - iNewX, _pStartPosRight.y - iNewY);
            _oArrowLeft.setPosition(_pStartPosLeft.x + iNewX, _pStartPosLeft.y - iNewY);
        }

    };

    this._checkBoundLimits = function () {
        var oSprite = s_oSpriteLibrary.getSprite('but_level');
        var iY = 0;

        var iHeightBound = CANVAS_HEIGHT - (EDGEBOARD_Y * 2) - (_iHeightToggle * 2);
        var iNumRows = 0;

        while (iY < iHeightBound) {
            iY += oSprite.height + 20;
            iNumRows++;
        }

        if (NUM_ROWS_PAGE_LEVEL > iNumRows) {
            NUM_ROWS_PAGE_LEVEL = iNumRows;
        }


        var iNumCols = 0;
        var iX = 0;
        var iWidthBounds = CANVAS_WIDTH - (EDGEBOARD_X * 2);
        var oSprite = s_oSpriteLibrary.getSprite('but_level');

        while (iX < iWidthBounds) {
            iX += (oSprite.width / 2) + 5;
            iNumCols++;
        }
        if (NUM_COLS_PAGE_LEVEL > iNumCols) {
            NUM_COLS_PAGE_LEVEL = iNumCols;
        }
    };

    this._createNewLevelPage = function (iStartLevel, iEndLevel) {
        var oContainerLevelBut = new createjs.Container();
        _oContainer.addChild(oContainerLevelBut);
        _aContainerPage.push(oContainerLevelBut);

        _aLevelButs = new Array();
        var iCont = 0;
        var iY = 0;
        var iNumRow = 1;
        var bNewPage = false;
        var oSprite = s_oSpriteLibrary.getSprite('but_level');
        for (var i = iStartLevel; i < iEndLevel; i++) {
            var oBut = new CLevelBut(_aPointsX[iCont] + oSprite.width / 4, iY + oSprite.height / 2, i + 1, oSprite, (i + 1) > s_iLevelReached ? false : true, oContainerLevelBut);
            oBut.addEventListenerWithParams(ON_MOUSE_UP, this._onButLevelRelease, this, i);
            _aLevelButs.push(oBut);

            iCont++;
            if (iCont === _aPointsX.length) {
                iCont = 0;
                iY += oSprite.height + 50;
                iNumRow++;
                if (iNumRow > NUM_ROWS_PAGE_LEVEL) {
                    bNewPage = true;
                    break;
                }
            }
        }

        oContainerLevelBut.x = CANVAS_WIDTH / 2;
        oContainerLevelBut.y = 320;
        oContainerLevelBut.regX = oContainerLevelBut.getBounds().width / 2;

        if (bNewPage) {
            //ADD A PAGE
            this._createNewLevelPage(i + 1, iEndLevel);
        }

    };

    this._onRight = function () {
        _aContainerPage[_iCurPage].visible = false;

        _iCurPage++;
        if (_iCurPage >= _aContainerPage.length) {
            _iCurPage = 0;
        }

        _aContainerPage[_iCurPage].visible = true;
    };

    this._onLeft = function () {
        _aContainerPage[_iCurPage].visible = false;

        _iCurPage--;
        if (_iCurPage < 0) {
            _iCurPage = _aContainerPage.length - 1;
        }

        _aContainerPage[_iCurPage].visible = true;
    };

    this._onButLevelRelease = function (iLevel) {
        _oFade.visible = true;
        createjs.Tween.get(_oFade, {override: true}).to({alpha: 1}, MS_FADE_ANIM, createjs.Ease.cubicIn).call(function () {
            this.unload();
            s_oMain.gotoGame(iLevel);
        }, null, this);
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onExit = function () {
        _oFade.visible = true;
        createjs.Tween.get(_oFade, {override: true}).to({alpha: 1}, MS_FADE_ANIM, createjs.Ease.cubicIn).call(function () {
            this.unload();
            s_oMain.gotoMenu();
        }, null, this);

    };

    s_oLevelMenu = this;
    this._init(iTotLevel);
}

var s_oLevelMenu = null;