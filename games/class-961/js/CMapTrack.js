function CMapTrack(iX, iY, oParentContainer, iStage){
    
    var _bPlayerFaded;
    var _bOpponentFaded;
    
    var _iStage;
    var _iStartLineMeter;
    var _iMapRatio;
    
    var _oMap;
    var _oPlayerIndicator;
    var _oOpponentIndicator;
    var _oTimeTextStroke;
    var _oTimeText;
    var _oMeterText;
    
    var _pBorder;
    
    this._init = function(iX, iY, oParentContainer, iStage){
        
        _bPlayerFaded = false;
        _bOpponentFaded = false;
        
        _iStage = iStage;
        
        _oMap = new createjs.Container();
        oParentContainer.addChild(_oMap);
        
        var oSprite = s_oSpriteLibrary.getSprite('map_track');        
        var oMap = createBitmap(oSprite);
        oMap.regX = oSprite.width/2;
        oMap.regY = oSprite.height/2;
        _oMap.addChild(oMap);

        _oTimeTextStroke = new createjs.Text("00:00.0"," 30px "+PRIMARY_FONT, "#3e240b");
        _oTimeTextStroke.x = 430;
        _oTimeTextStroke.textAlign = "center";
        _oTimeTextStroke.textBaseline = "middle";
        _oTimeTextStroke.lineWidth = 200;
        _oTimeTextStroke.outline = 3;
        _oMap.addChild(_oTimeTextStroke);

        _oTimeText = new createjs.Text("00:00.0"," 30px "+PRIMARY_FONT, "#ffffff");
        _oTimeText.x = _oTimeTextStroke.x;
        _oTimeText.textAlign = "center";
        _oTimeText.textBaseline = "middle";
        _oTimeText.lineWidth = 200;
        _oMap.addChild(_oTimeText);

        _oMeterText = new createjs.Text(STAGE_METER_LENGTH[iStage] + TEXT_M," 30px "+PRIMARY_FONT, "#ffffff");
        _oMeterText.textAlign = "center";
        _oMeterText.textBaseline = "middle";
        _oMeterText.lineWidth = 200;

        var iStartOffset = 24;
        var iEndOffset = 10;
        _pBorder = {startx: -oSprite.width/2 + iStartOffset, endx:oSprite.width/2 - iEndOffset};

        var oSprite = s_oSpriteLibrary.getSprite('car_track_0'); 
        _oOpponentIndicator = createBitmap(oSprite);
        _oOpponentIndicator.regX = oSprite.width/2;
        _oOpponentIndicator.regY = oSprite.height/2;
        _oOpponentIndicator.x = _pBorder.startx;
        _oOpponentIndicator.y = -15;
        _oMap.addChild(_oOpponentIndicator);

        var oSprite = s_oSpriteLibrary.getSprite('car_track_1'); 
        _oPlayerIndicator = createBitmap(oSprite);
        _oPlayerIndicator.regX = oSprite.width/2;
        _oPlayerIndicator.regY = oSprite.height/2;
        _oPlayerIndicator.x = _pBorder.startx;
        _oPlayerIndicator.y = 15;
        _oMap.addChild(_oPlayerIndicator);

        _iStartLineMeter = pixelsToMeters(START_LINE_X);
        _iMapRatio = (_pBorder.endx - _pBorder.startx)/(STAGE_METER_LENGTH[_iStage] - _iStartLineMeter);
    };
    
    this.setPos = function(iX, iY){
        _oMap.x = iX;
        _oMap.y = iY;
    };
    
    this._fadeOutIndicator = function(oIndicator){
        new createjs.Tween.get(oIndicator).to({alpha:0}, 500);
    };
    
    this.refreshMap = function(iPlayerX, iOpponentX, iTime){
        _oPlayerIndicator.x = (iPlayerX - _iStartLineMeter)*_iMapRatio + _pBorder.startx;
        _oOpponentIndicator.x = (iOpponentX - _iStartLineMeter)*_iMapRatio + _pBorder.startx;
        
        _oTimeText.text = formatTime(iTime);
        _oTimeTextStroke.text = formatTime(iTime);
        
        if(!_bPlayerFaded && _oPlayerIndicator.x > _pBorder.endx){
            _bPlayerFaded = true;
            this._fadeOutIndicator(_oPlayerIndicator);
        }
        if(!_bOpponentFaded && _oOpponentIndicator.x > _pBorder.endx){
            _bOpponentFaded = true;
            this._fadeOutIndicator(_oOpponentIndicator);
        }
        
    };
    
    this._init(iX, iY, oParentContainer, iStage);
}


