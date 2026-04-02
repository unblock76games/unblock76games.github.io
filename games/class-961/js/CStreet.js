function CStreet(iY, oParentContainer, oFgContainer){
    
    var _bPlayerHighlight;
    var _bOpponentHighlight;
    
    var _iNumPieces;
    var _iPieceWidth;
    var _iCurBgPosX;
    var _iCurStreetPosX;
    var _iCurFgPosX;
    var _iLastBgPiecePos;
    var _iLastStreetPiecePos;
    var _iLastFgPiecePos;
    var _iCurBgNumSwap;
    var _iCurStreetNumSwap;
    var _iCurFgNumSwap;

    var _aBgPiece;
    var _aStreetPiece;
    var _aFgPiece;
    
    var _oArrive;
    var _oLamp;
    var _oBg;
    var _oStreet;
    var _oFg;
    var _oFgLamp;
    
    
    this._init = function(iY, oParentContainer, oFgContainer){
        _bPlayerHighlight = false;
        _bOpponentHighlight = false;
        
        _iCurBgPosX = 0;
        _iCurStreetPosX = 0;
        _iCurFgPosX = 0;
        _iCurBgNumSwap = 1;
        _iCurStreetNumSwap = 1;
        _iCurFgNumSwap = 1;
        
        _oBg = new createjs.Container();
        _oBg.y = 110;
        oParentContainer.addChild(_oBg);
        
        _oStreet = new createjs.Container();
        _oStreet.y = 290;
        oParentContainer.addChild(_oStreet);
        
        _oFg = new createjs.Container();
        _oFg.y = CANVAS_HEIGHT;
        oFgContainer.addChild(_oFg);
        
        _iNumPieces = 2;
        
        _iLastBgPiecePos = 0;
        _aBgPiece = new Array();
        var oSprite = s_oSpriteLibrary.getSprite('parallaxe_1');
        _iPieceWidth = oSprite.width;
        for(var i=0; i<_iNumPieces; i++){
            _aBgPiece[i] = createBitmap(oSprite);
            _aBgPiece[i].x = i*_iPieceWidth;
            _oBg.addChild(_aBgPiece[i]);
            _iLastBgPiecePos += _iPieceWidth;
        }


        _iLastStreetPiecePos = 0;
        _aStreetPiece = new Array();
        var oSprite = s_oSpriteLibrary.getSprite('street_piece');
        _iPieceWidth = oSprite.width;
        for(var i=0; i<_iNumPieces; i++){
            _aStreetPiece[i] = createBitmap(oSprite);
            _aStreetPiece[i].x = i*_iPieceWidth;
            _oStreet.addChild(_aStreetPiece[i]);
            _iLastStreetPiecePos += _iPieceWidth;
        }

        var oSprite = s_oSpriteLibrary.getSprite('arrive');
        _oArrive = createBitmap(oSprite);
        _oArrive.y = 62;
        _oStreet.addChild(_oArrive);
        
        var oSprite = s_oSpriteLibrary.getSprite('lamp');
        _oLamp = createBitmap(oSprite);
        LAMP_WIDTH = oSprite.width;
        _oLamp.x = 880;
        _oLamp.y = -180;
        _oStreet.addChild(_oLamp);
        

        var oSprite = s_oSpriteLibrary.getSprite('lamp');
        _oFgLamp = createBitmap(oSprite);
        _oFgLamp.x = 1200//LAMP_OFFSET;
        _oFgLamp.y = -540;
        _oFgLamp.scaleX = _oFgLamp.scaleY = 1.5;
        _oFg.addChild(_oFgLamp);

        _iLastFgPiecePos = 0;
        _aFgPiece = new Array();
        var oSprite = s_oSpriteLibrary.getSprite('parallaxe_2');
        for(var i=0; i<_iNumPieces; i++){
            _aFgPiece[i] = createBitmap(oSprite);
            _aFgPiece[i].x = i*_iPieceWidth;
            _aFgPiece[i].regY = oSprite.height;
            _oFg.addChild(_aFgPiece[i]);
            _iLastFgPiecePos += _iPieceWidth;
        }
       
    };
   
    this.setArrive = function(iMeterDistance){
        var iPixel = (iMeterDistance * METER_TO_PIXEL_RATIO);
        _oArrive.x = iPixel;
    };
    
    this._swapBgPiece = function(){
        _iCurBgNumSwap++;

        _aBgPiece[_iCurBgNumSwap%_iNumPieces].x = _iLastBgPiecePos;
        _iLastBgPiecePos += _iPieceWidth;

    };
    
    this._swapRoadPiece = function(){
        _iCurStreetNumSwap++;

        _aStreetPiece[_iCurStreetNumSwap%_iNumPieces].x = _iLastStreetPiecePos;
        
        if(_iCurStreetNumSwap%8 === 0){
            _oLamp.x = _iLastStreetPiecePos + LAMP_OFFSET;
            _bOpponentHighlight = false;
        }

        _iLastStreetPiecePos += _iPieceWidth;

    };
    
    this._swapFgPiece = function(){
        _iCurFgNumSwap++;

        _aFgPiece[_iCurFgNumSwap%_iNumPieces].x = _iLastFgPiecePos;
        if(_iCurFgNumSwap%5 === 0){
            _oFgLamp.x = _iLastFgPiecePos + LAMP_OFFSET;
            _bPlayerHighlight = false;
        }
        
        _iLastFgPiecePos += _iPieceWidth;
    };
    
    this.move = function(iSpeed, iPlayerXPos, iOpponentXPos){
        //////////MOVE BG
        _iCurBgPosX += iSpeed*PARALLAX_1_RATIO;
        _oBg.x = -_iCurBgPosX;
        
        if(_iCurBgPosX >= _iPieceWidth*_iCurBgNumSwap){
            this._swapBgPiece();
        }
        
        //////////MOVE STREET
        _iCurStreetPosX += iSpeed;
        _oStreet.x = -_iCurStreetPosX;
        
        if(_iCurStreetPosX >= _iPieceWidth*_iCurStreetNumSwap){
            this._swapRoadPiece();
        }
        
        /////////MOVE FG
        _iCurFgPosX += iSpeed*PARALLAX_2_RATIO;
        _oFg.x = -_iCurFgPosX;
        
        if(_iCurFgPosX >= _iPieceWidth*_iCurFgNumSwap){
            this._swapFgPiece();
        }
        
        this._checkHighlighting(iPlayerXPos, iOpponentXPos);
        
    };
    
    this.menuMovement = function(iSpeed){
        _iCurBgPosX += iSpeed*PARALLAX_1_RATIO;
        _oBg.x = -_iCurBgPosX;
        
        if(_iCurBgPosX >= _iPieceWidth*_iCurBgNumSwap){
            this._swapBgPiece();
        }
        
        //////////MOVE STREET
        _iCurStreetPosX += iSpeed;
        _oStreet.x = -_iCurStreetPosX;
        
        if(_iCurStreetPosX >= _iPieceWidth*_iCurStreetNumSwap){
            this._swapRoadPiece();
        }
        
        /////////MOVE FG
        _iCurFgPosX += iSpeed*PARALLAX_2_RATIO;
        _oFg.x = -_iCurFgPosX;
        
        if(_iCurFgPosX >= _iPieceWidth*_iCurFgNumSwap){
            this._swapFgPiece();
        }
    }
    
    this._checkHighlighting = function(iPlayerXPos, iOpponentXPos){
        if(_oFg.x + _oFgLamp.x < START_LINE_X && !_bPlayerHighlight){
            _bPlayerHighlight = true;
            s_oGame.playerHighlight();
        }
        
        if(_oLamp.x<iOpponentXPos && !_bOpponentHighlight){
            _bOpponentHighlight = true;
            s_oGame.opponentHighlight();
        }
        
    };
    
    this.getMeterCovered = function(){
        return pixelsToMeters(_iCurStreetPosX);
    };
    
    this._init(iY, oParentContainer, oFgContainer);
}


