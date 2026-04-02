function CHelpPanel(){
    var _oTextBack1;
    var _oTextBack2;
    var _oTextBack3;
    var _oText1;
    var _oText2;
    var _oText3;
    var _oFade;
    var _oBg;
    var _oGroup;
    var _oContinueBut;
    var _oBackBut;
    var _oSkipBut;
    var _pStartPosSkip;
    var _pStartPosContinue;
    var _pStartPosBack;
    var _oPag2Text1;
    var _oPag2Text2;
    var _oPag2Text3;
    var _oPag2Text4;
    var _oPag2Text5;
    var _oPag2Text6;
    var _oPag2Text7;
    var _oPag2Text8;
    var _oPag2TextBack1;
    var _oPag2TextBack2;
    var _oPag2TextBack3;
    var _oPag2TextBack4;
    var _oPag2TextBack5;
    var _oPag2TextBack6;
    var _oPag2TextBack7;
    var _oPag2TextBack8;
    var _oPag4TextBack1;
    var _oPag4TextBack2;
    var _oPag4TextBack3;
    var _oPag4Text1;
    var _oPag4Text2;
    var _oPag4Text3;
    var _oSquareHelp1;
    var _oSquareHelp2;
    var _oSquareHelp3;
    var _oSquareHelp4;
    var _oSquareHelp5;
    var _oSquareHelp6;
    var _oSquareHelp7;
    var _oSquareHelp8;
    var _oListener;
    
    var _iColumn = CANVAS_WIDTH_HALF - 150;
    var _iRow1 = CANVAS_HEIGHT_HALF - 140;
    var _iRow2 = CANVAS_HEIGHT_HALF - 60;
    var _iRow3 = CANVAS_HEIGHT_HALF + 30;
    var _iRow4 = CANVAS_HEIGHT_HALF + 100;

    var _iLineHeight = 20;
    var _iLineWidth = 400;
    var _iOutline = 3;
    
    var _iPageN;

    this._init = function(){
        _iPageN = 1;
        
        var oSpriteBg = s_oSpriteLibrary.getSprite('bg_help');
        _oBg = createBitmap(oSpriteBg);
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;
        _oBg.regX = oSpriteBg.width * 0.5;
        _oBg.regY = oSpriteBg.height * 0.5;
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;
        _oListener = _oFade.on("click", function(){});

        _oGroup = new createjs.Container();
        _oGroup.addChild(_oFade, _oBg);
        s_oStage.addChild(_oGroup);

        this.initHelpPage1();

        var iArrowOffset = 320;

        var oSpriteBack = s_oSpriteLibrary.getSprite('but_back_small');        
        _pStartPosBack = {x: CANVAS_WIDTH_HALF - oSpriteBack.width/2 - iArrowOffset, y: CANVAS_HEIGHT_HALF};
        _oBackBut = new CGfxButton(_pStartPosBack.x, _pStartPosBack.y, oSpriteBack, s_oStage);
        _oBackBut.addEventListener(ON_MOUSE_UP, this._onBack, this);

        var oSpriteContinue = s_oSpriteLibrary.getSprite('but_continue_small');        
        _pStartPosContinue = {x: CANVAS_WIDTH_HALF + oSpriteContinue.width/2 + iArrowOffset, y: CANVAS_HEIGHT_HALF};
        _oContinueBut = new CGfxButton(_pStartPosContinue.x, _pStartPosContinue.y, oSpriteContinue, s_oStage);
        _oContinueBut.addEventListener(ON_MOUSE_UP, this._onContinue, this);

        var oSpriteSkip = s_oSpriteLibrary.getSprite('but_skip_small');        
        _pStartPosSkip = {x: CANVAS_WIDTH_HALF, y: CANVAS_HEIGHT_HALF + 190};
        _oSkipBut = new CGfxButton(_pStartPosSkip.x, _pStartPosSkip.y, oSpriteSkip, s_oStage);
        _oSkipBut.addEventListener(ON_MOUSE_UP, this._onExitHelp, this);
  
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, 1000).call(function () {
            _oFade.visible = false;
        });
    };

    this.initHelpPage1 = function() {
        _oTextBack1 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, (CANVAS_HEIGHT_HALF)-110, 500, 36, 
                    18, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP1,
                    true, true, true,
                    false );
                    
        _oTextBack1.setOutline(3);

        _oText1 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, (CANVAS_HEIGHT_HALF)-110, 500, 36, 
                    18, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP1,
                    true, true, true,
                    false );
  
        _oTextBack2 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, (CANVAS_HEIGHT_HALF)-20, 500, 36, 
                    18, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP2,
                    true, true, true,
                    false );

        _oTextBack2.setOutline(3);
        
        _oText2 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, (CANVAS_HEIGHT_HALF)-20, 500, 36, 
                    18, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP2,
                    true, true, true,
                    false );
  
        _oTextBack3 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, (CANVAS_HEIGHT_HALF)+70, 500, 36, 
                    18, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP3,
                    true, true, true,
                    false );
                    
        
        _oTextBack3.setOutline(3);

        _oText3 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250, (CANVAS_HEIGHT_HALF)+70, 500, 36, 
                    18, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP3,
                    true, true, true,
                    false );

    };

    this.initHelpPage2 = function() {
        _oSquareHelp1 = createBitmap(s_oSpriteLibrary.getSprite('square_help1'));
        _oSquareHelp1.x = _iColumn - 65;
        _oSquareHelp1.y = _iRow1 - 15;

        _oPag2TextBack1 = new CTLText(_oGroup, 
                    _iColumn,_iRow1, 400, 36, 
                    18, "left", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_GOOSE,
                    true, true, true,
                    false );
                    
        
        _oPag2TextBack1.setOutline(_iOutline);

        _oPag2Text1 = new CTLText(_oGroup, 
                    _iColumn,_iRow1, 400, 36, 
                    18, "left", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_GOOSE,
                    true, true, true,
                    false );

        _oSquareHelp2 = createBitmap(s_oSpriteLibrary.getSprite('square_help2'));
        _oSquareHelp2.x = _iColumn - 75;
        _oSquareHelp2.y = _iRow2 - 15;

        _oPag2TextBack2 = new CTLText(_oGroup, 
                    _iColumn,_iRow2, 400, 36, 
                    18, "left", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_BRIDGE,
                    true, true, true,
                    false );
                    

        _oPag2TextBack2.setOutline(_iOutline);

        _oPag2Text2 = new CTLText(_oGroup, 
                    _iColumn,_iRow2, 400, 36, 
                    18, "left", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_BRIDGE,
                    true, true, true,
                    false );

        _oSquareHelp3 = createBitmap(s_oSpriteLibrary.getSprite('square_help3'));
        _oSquareHelp3.x = _iColumn - 80;
        _oSquareHelp3.y = _iRow3 - 5;

        _oPag2TextBack3 = new CTLText(_oGroup, 
                    _iColumn,_iRow3, 400, 36, 
                    18, "left", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_HOUSE,
                    true, true, true,
                    false );

        _oPag2TextBack3.setOutline(_iOutline);

        _oPag2Text3 = new CTLText(_oGroup, 
                    _iColumn,_iRow3, 400, 36, 
                    18, "left", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_HOUSE,
                    true, true, true,
                    false );

        _oSquareHelp4 = createBitmap(s_oSpriteLibrary.getSprite('square_help4'));
        _oSquareHelp4.x = _iColumn - 80;
        _oSquareHelp4.y = _iRow4 - 5;

        _oPag2TextBack4 = new CTLText(_oGroup, 
                    _iColumn,_iRow4, 400, 36, 
                    18, "left", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_WELL,
                    true, true, true,
                    false );
                    

        _oPag2TextBack4.setOutline(_iOutline);

        _oPag2Text4 =  new CTLText(_oGroup, 
                    _iColumn,_iRow4, 400, 36, 
                    18, "left", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_WELL,
                    true, true, true,
                    false );

        _oGroup.addChild(
                _oSquareHelp1, _oSquareHelp2, _oSquareHelp3, _oSquareHelp4);
    };

    this.initHelpPage3 = function() {
        _oSquareHelp5 = createBitmap(s_oSpriteLibrary.getSprite('square_help5'));
        _oSquareHelp5.x = _iColumn - 90;
        _oSquareHelp5.y = _iRow1 - 15;

        _oPag2TextBack5 =  new CTLText(_oGroup, 
                    _iColumn,_iRow1, 400, 36, 
                    18, "left", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_PRISON,
                    true, true, true,
                    false );
                    

        _oPag2TextBack5.setOutline(_iOutline);

        _oPag2Text5 = new CTLText(_oGroup, 
                    _iColumn,_iRow1, 400, 36, 
                    18, "left", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_PRISON,
                    true, true, true,
                    false );

        _oSquareHelp6 = createBitmap(s_oSpriteLibrary.getSprite('square_help6'));
        _oSquareHelp6.x = _iColumn - 90;
        _oSquareHelp6.y = _iRow2 - 30;

        _oPag2TextBack6 = new CTLText(_oGroup, 
                    _iColumn,_iRow2, 400, 36, 
                    18, "left", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_MAZE,
                    true, true, true,
                    false );
                    

        _oPag2TextBack6.setOutline(_iOutline);

        _oPag2Text6 = new CTLText(_oGroup, 
                    _iColumn,_iRow2, 400, 36, 
                    18, "left", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_MAZE,
                    true, true, true,
                    false );

        _oSquareHelp7 = createBitmap(s_oSpriteLibrary.getSprite('square_help7'));
        _oSquareHelp7.x = _iColumn - 90;
        _oSquareHelp7.y = _iRow3 - 15;

        _oPag2TextBack7 = new CTLText(_oGroup, 
                    _iColumn,_iRow3, 400, 36, 
                    18, "left", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_SKULL,
                    true, true, true,
                    false );
                    

        _oPag2TextBack7.setOutline(_iOutline);

        _oPag2Text7 = new CTLText(_oGroup, 
                    _iColumn,_iRow3, 400, 36, 
                    18, "left", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_SKULL,
                    true, true, true,
                    false );

        _oSquareHelp8 = createBitmap(s_oSpriteLibrary.getSprite('square_help8'));
        _oSquareHelp8.x = _iColumn - 90;
        _oSquareHelp8.y = _iRow4 - 20;

        _oPag2TextBack8 = new CTLText(_oGroup, 
                    _iColumn,_iRow4, 400, 36, 
                    18, "left", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_SKULL,
                    true, true, true,
                    false );
                    

        _oPag2TextBack8.setOutline(_iOutline);

        _oPag2Text8 = new CTLText(_oGroup, 
                    _iColumn,_iRow4, 400, 36, 
                    18, "left", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_SQUARE_SKULL,
                    true, true, true,
                    false );

        _oGroup.addChild(
                _oSquareHelp5, _oSquareHelp6, _oSquareHelp7, _oSquareHelp8);
    };
    
    this.initHelpPage4 = function() {
        _oPag4TextBack1 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-200,180, 400, 36, 
                    18, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP4,
                    true, true, true,
                    false );
                    

        _oPag4TextBack1.setOutline(_iOutline);

        _oPag4Text1 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-200,180, 400, 36, 
                    18, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP4,
                    true, true, true,
                    false );

        _oPag4TextBack2 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250,250, 500, 60, 
                    18, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP5,
                    true, true, true,
                    false );
                    

        _oPag4TextBack2.setOutline(_iOutline);

        _oPag4Text2 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250,250, 500, 60, 
                    18, "center", PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP5,
                    true, true, true,
                    false );

        _oPag4TextBack3 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250,350, 500, 100, 
                    18, "center", SECONDARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP6,
                    true, true, true,
                    false );
                    

        _oPag4TextBack3.setOutline(_iOutline);

        _oPag4Text3 = new CTLText(_oGroup, 
                    CANVAS_WIDTH_HALF-250,350, 500, 100, 
                    18, "center",PRIMARY_FONT_COLOR, PRIMARY_FONT, 1.1,
                    0, 0,
                    TEXT_HELP6,
                    true, true, true,
                    false );

    };

    // BACK TO FIRST HELP PAGE
    this._onBack = function() {
        if (_iPageN === 2) {
            _iPageN = 1;
            this.removePage2();
            this.initHelpPage1();
        } else if (_iPageN === 3) {
            _iPageN = 2;
            this.removePage3();
            this.initHelpPage2();
        } else if (_iPageN === 4) {
            _iPageN = 3;
            this.removePage4();
            this.initHelpPage3();
        };
    };
    
    this.removePage1 = function() {
        _oText1.unload();
        _oTextBack1.unload();
        _oTextBack2.unload();
        _oText2.unload();
        _oTextBack3.unload();
        _oText3.unload();
        
    };
    
    this.removePage2 = function() {
        _oPag2Text1.unload();
        _oPag2TextBack1.unload();
        _oPag2Text2.unload();
        _oPag2TextBack2.unload();
        _oPag2Text3.unload();
        _oPag2TextBack3.unload();
        _oPag2TextBack4.unload();
        _oPag2Text4.unload();
        _oGroup.removeChild(_oSquareHelp1,
                            _oSquareHelp2, 
                            _oSquareHelp3,
                            _oSquareHelp4);
    };
    
    this.removePage3 = function() {
        _oPag2Text5.unload();
        _oPag2TextBack5.unload();
        _oPag2TextBack6.unload();
        _oPag2Text6.unload();
        _oPag2TextBack7.unload();
        _oPag2Text7.unload();
        _oPag2TextBack8.unload();
        _oPag2Text8.unload();
        _oGroup.removeChild(_oSquareHelp5, 
                            _oSquareHelp6,
                            _oSquareHelp7,
                            _oSquareHelp8);
    };
    
    this.removePage4 = function() {
        _oPag4TextBack1.unload();
        _oPag4TextBack2.unload();
        _oPag4TextBack3.unload();
        _oPag4Text1.unload();
        _oPag4Text2.unload();
        _oPag4Text3.unload();
    };

    // CREATE A SECOND HELP PAGE
    this._onContinue = function() {
        if (_iPageN === 1) {
            _iPageN = 2;
            this.removePage1();            
            this.initHelpPage2();
        } else if (_iPageN === 2) {
            _iPageN = 3;
            this.removePage2();
            this.initHelpPage3();
        } else if (_iPageN === 3) {
            _iPageN = 4;
            this.removePage3();
            this.initHelpPage4();
        };
    };

    this.unload = function(){
        s_oStage.removeChild(_oGroup);
        _oContinueBut.unload();
        _oBackBut.unload();
        _oSkipBut.unload();

        var oParent = this;
        _oFade.off("pressup",_oListener);
    };

    this._onExitHelp = function(){
        this.unload();
        setTimeout( s_oGame._onExitHelp, 200);
    };

    this._init();

}