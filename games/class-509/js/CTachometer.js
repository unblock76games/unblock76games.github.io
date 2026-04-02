function CTachometer(iX, iY){
    
    var _oTachometer;
    var _oSpeed;
    
    var _pStartPos;
    
    this._init = function(iX, iY){
        _pStartPos = {x: iX, y: iY};
        
        _oTachometer = new createjs.Container();
        _oTachometer.x = _pStartPos.x;
        _oTachometer.y = _pStartPos.y;
        s_oStage.addChild(_oTachometer);
        
        var oSprite = s_oSpriteLibrary.getSprite('tachometer');
        var oTachometer = createBitmap(oSprite);
        oTachometer.regX = oSprite.width/2;
        oTachometer.regY = oSprite.height;
        _oTachometer.addChild(oTachometer);
        
        var oSpeedTextStroke = new createjs.Text(TEXT_SPEED_INDICATOR," 40px "+PRIMARY_FONT, "#ffcc00");
        oSpeedTextStroke.textAlign = "center";
        oSpeedTextStroke.textBaseline = "alphabetic";
        oSpeedTextStroke.lineWidth = 300;
        oSpeedTextStroke.y = -90;
        _oTachometer.addChild(oSpeedTextStroke);
        
        var oSpeedText = new createjs.Text(TEXT_SPEED_INDICATOR," 40px "+PRIMARY_FONT, "#ffcc00");
        oSpeedText.textAlign = "center";
        oSpeedText.textBaseline = "alphabetic";
        oSpeedText.lineWidth = 300;
        oSpeedText.y = oSpeedTextStroke.y;
        _oTachometer.addChild(oSpeedText);

        var oBackSpeed = new createjs.Text("888"," 58px "+SECONDARY_FONT, "#222222");
        oBackSpeed.textAlign = "right";
        oBackSpeed.textBaseline = "alphabetic";
        oBackSpeed.lineWidth = 300;
        oBackSpeed.x = 40;
        oBackSpeed.y = -26;
        _oTachometer.addChild(oBackSpeed);

        _oSpeed = new createjs.Text(TEXT_SPEED_INDICATOR," 58px "+SECONDARY_FONT, "#ffffff");
        _oSpeed.textAlign = oBackSpeed.textAlign;
        _oSpeed.textBaseline = oBackSpeed.textBaseline;
        _oSpeed.lineWidth = oBackSpeed.lineWidth;
        _oSpeed.x = oBackSpeed.x;
        _oSpeed.y = oBackSpeed.y;
        _oTachometer.addChild(_oSpeed);
        
    };
    
    this.setSpeedIndicator = function(iValue){
        _oSpeed.text = Math.floor(iValue);
    };
    
    this.updateOffset = function(iXPos, iYPos){
        _oTachometer.x = _pStartPos.x + iXPos;
        _oTachometer.y = _pStartPos.y - iYPos;
    };
    
    this._init(iX, iY);
}


