function CSpinner(iX,iY,iIndex,oParentContainer){
    
    var _oSpriteSpinner;
    var _oSpriteCenter;
    var _oContainer;
    var _oParentContainer;
    
    var _oThis = this;
    
    this._init = function(iX,iY,iIndex){
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite("spinner");
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: SPINNER_WIDTH, height: SPINNER_HEIGHT, regX: SPINNER_WIDTH/2, regY: SPINNER_HEIGHT/2}, 
                        animations: {spinner_0:0,spinner_1:1,spinner_2:2,spinner_3:3,spinner_4:4,spinner_5:5,spinner_6:6,spinner_7:7,spinner_8:8,spinner_9:9,spinner_10:10,spinner_11:11}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);

        _oSpriteSpinner = createSprite(oSpriteSheet,"spinner_"+iIndex,SPINNER_WIDTH/2,SPINNER_HEIGHT/2,SPINNER_WIDTH,SPINNER_HEIGHT);
        _oContainer.addChild(_oSpriteSpinner);
        
        
        
        var oSprite = s_oSpriteLibrary.getSprite("spinner_center");
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: SPINNER_CENTER_WIDTH, height: SPINNER_CENTER_HEIGHT, regX: SPINNER_CENTER_WIDTH/2, regY: SPINNER_CENTER_HEIGHT/2}, 
                        animations: {spinner_0:0,spinner_1:1,spinner_2:2,spinner_3:3,spinner_4:4,spinner_5:5,spinner_6:6,spinner_7:7,spinner_8:8,spinner_9:9,spinner_10:10,spinner_11:11}
                   };
                   
        oSpriteSheet = new createjs.SpriteSheet(oData);

        _oSpriteCenter = createSprite(oSpriteSheet,"spinner_"+iIndex,SPINNER_CENTER_WIDTH/2,SPINNER_CENTER_HEIGHT/2,SPINNER_CENTER_WIDTH,SPINNER_CENTER_HEIGHT);
        _oContainer.addChild(_oSpriteCenter);
    };
    
    this.changeSkin = function(iIndex){
        _oSpriteSpinner.gotoAndStop("spinner_"+iIndex);
        _oSpriteCenter.gotoAndStop("spinner_"+iIndex);
    };
    
    this.rotate = function(iRot){
        _oSpriteSpinner.rotation = iRot;
    };

    _oParentContainer = oParentContainer;
    this._init(iX,iY,iIndex);
}