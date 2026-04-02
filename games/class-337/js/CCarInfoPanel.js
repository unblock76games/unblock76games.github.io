function CCarInfoPanel(iX,iY,iType,oParentContainer){
    var _oTextLap;
    var _oTextBest;
    var _oTextTot;
    var _oSprite;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    this._init = function(iX,iY,iType){
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite("car_info_bg"));
        _oContainer.addChild(oBg);
        
        var oSprite = s_oSpriteLibrary.getSprite('cars');
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: oSprite.width, height: oSprite.height/NUM_CAR_SPRITE}, 
                        animations: {car_0:0,car_1:1,car_2:2,car_3:3,car_4:4,car_5:5,car_6:6,car_7:7,car_8:8}
                    };
        
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oSprite = createSprite(oSpriteSheet,"car_"+iType,0,0,oSprite.width, oSprite.height/NUM_CAR_SPRITE);
        _oSprite.x = 20;
        _oSprite.y = 10;
        _oSprite.rotation = 90;
        _oSprite.scaleX = _oSprite.scaleY = 0.7;
        _oContainer.addChild(_oSprite);
        
        var oSpriteIconTrack = s_oSpriteLibrary.getSprite("icon_track");
        var oIconLaps = createBitmap(oSpriteIconTrack);
        oIconLaps.x = 24;
        oIconLaps.y = 4;
        _oContainer.addChild(oIconLaps);
        
        _oTextLap = new createjs.Text("0/" + NUM_LAPS,"12px "+FONT_GAME, "#fff");
        _oTextLap.x = oIconLaps.x + oSpriteIconTrack.width + 4;
        _oTextLap.y = oIconLaps.y + 12;
        _oTextLap.textAlign = "left";
        _oTextLap.textBaseline = "alphabetic";
        _oContainer.addChild(_oTextLap);
        
        var oSpriteIcon = s_oSpriteLibrary.getSprite("icon_best");
        var oIconBest = createBitmap(oSpriteIcon);
        oIconBest.x = 28;
        oIconBest.y = 24;
        _oContainer.addChild(oIconBest);
        
        _oTextBest = new createjs.Text("00:00" ,"8px "+FONT_GAME, "#fff");
        _oTextBest.x = oIconBest.x + oSpriteIcon.width + 4;
        _oTextBest.y = oIconBest.y + 12;
        _oTextBest.textAlign = "left";
        _oTextBest.textBaseline = "alphabetic";
        _oContainer.addChild(_oTextBest);
        
        var oSpriteIconTime = s_oSpriteLibrary.getSprite("icon_time");
        var oIconTime = createBitmap(oSpriteIconTime);
        oIconTime.x = 31;
        oIconTime.y = 44;
        _oContainer.addChild(oIconTime);

        
        _oTextTot = new createjs.Text("00:00" ,"8px "+FONT_GAME, "#fff");
        _oTextTot.x = oIconTime.x + oSpriteIconTime.width + 4;
        _oTextTot.y = oIconTime.y + 12;
        _oTextTot.textAlign = "left";
        _oTextTot.textBaseline = "alphabetic";
        _oContainer.addChild(_oTextTot);
    };
    
    this.reset = function(){
        _oTextLap.text = "0/" + NUM_LAPS;
        _oTextBest.text = "00:00";
        _oTextTot.text = "00:00";
    };
    
    this.refreshLap = function(iLap){
        _oTextLap.text = +iLap+"/" + NUM_LAPS;
    };
    
    this.refreshBest = function(szBest){
        _oTextBest.text = szBest;
    };
    
    this.refreshTotTime = function(szTime){
        _oTextTot.text = szTime;
    };
    
    this.setCarType = function(iType){
        _oSprite.gotoAndStop("car_"+iType);
    };
    
    this._init(iX,iY,iType);
}