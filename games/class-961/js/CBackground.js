function CBackground(oParentContainer){
    
    var _iNumPieces;
    var _iPieceWidth;
    var _iLastPiecePos;
    var _iCurPosX;
    var _iFirstPieceIndex;
    var _iCurNumSwap;
    
    var _aBgPiece;
    
    var _oBg;
    
    this._init = function(oParentContainer){
        _iCurPosX = 0;
        _iFirstPieceIndex = 0;
        _iCurNumSwap = 1;
        
        _oBg = new createjs.Container();
        _oBg.y = -150;
        oParentContainer.addChild(_oBg);
        
        _iLastPiecePos = 0;
        _iNumPieces = 2;
        _aBgPiece = new Array();
        var oSprite = s_oSpriteLibrary.getSprite('bg_game');
        _iPieceWidth = oSprite.width;
        for(var i=0; i<_iNumPieces; i++){
            _aBgPiece[i] = createBitmap(oSprite);
            _aBgPiece[i].x = i*_iPieceWidth;
            _oBg.addChild(_aBgPiece[i]);
            _iLastPiecePos += _iPieceWidth;
        }
    };
    
    this._swapBgPiece = function(){
        _iCurNumSwap++;

        _aBgPiece[_iFirstPieceIndex].x = _iLastPiecePos;
        _iLastPiecePos += _iPieceWidth;
        _iFirstPieceIndex++;
        if(_iFirstPieceIndex === _iNumPieces){
            _iFirstPieceIndex = 0;
        }
    };
    
    this.move = function(iSpeed){
        _iCurPosX += iSpeed;
        
        _oBg.x = -_iCurPosX;
        
        if(_iCurPosX >= _iPieceWidth*_iCurNumSwap){
            this._swapBgPiece();
        }
    };
    
    this._init(oParentContainer);
    
}


