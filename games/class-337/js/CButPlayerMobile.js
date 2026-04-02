function CButPlayerMobile(iXPos,iYPos,iPlayer,iCar,oParentContainer){
    var _bDisable;
    var _aCbCompleted;
    var _aCbOwner;
    var _aListeners;
    var _aParams = [];
    
    var _oCarSprite;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    this._init =function(iXPos,iYPos,iPlayer,iCar){
        _bDisable = false;
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.x = iXPos;
        _oContainer.y = iYPos; 
        _oParentContainer.addChild(_oContainer);
        
        var oSpriteBg = s_oSpriteLibrary.getSprite("key_"+iPlayer+"_mobile");
        var oBg = createBitmap(oSpriteBg);+
        _oContainer.addChild(oBg);
        
        _oContainer.regX = oSpriteBg.width/2;
        _oContainer.regY = oSpriteBg.height/2;
        
        
        var oSpriteCar = s_oSpriteLibrary.getSprite('cars_big');
        var oData = {   
                        images: [oSpriteCar], 
                        // width, height & registration point of each sprite
                        frames: {width: oSpriteCar.width, height: oSpriteCar.height/NUM_CAR_SPRITE, regX: (oSpriteCar.width)/2, regY: (oSpriteCar.height/NUM_CAR_SPRITE)/2}, 
                        animations: {car_0:0,car_1:1,car_2:2,car_3:3,car_4:4,car_5:5,car_6:6,car_7:7,car_8:8}
                    };
        
        var oSpriteSheetCar = new createjs.SpriteSheet(oData);
        
        _oCarSprite = createSprite( oSpriteSheetCar,"car_"+iCar);
        _oCarSprite.scaleX = _oCarSprite.scaleY = 0.6;
        _oCarSprite.x = 80;
        _oCarSprite.y = 75;
        _oContainer.addChild(_oCarSprite);

        this._initListener();
    };
    
    this.unload = function(){
       _oContainer.off("mousedown", _aListeners[0]);
       _oContainer.off("pressup" , _aListeners[1]); 
       
       _oParentContainer.removeChild(_oContainer);
    };
    
    this.setVisible = function(bVisible){
        _oContainer.visible = bVisible;
    };
    
    this.enable = function(){
        _bDisable = false;
        _oContainer.scaleX = 1;
        _oContainer.scaleY = 1;
    };
    
    this.disable = function(){
        _bDisable = true;
    };
    
    this._initListener = function(){
       _aListeners = new Array();
       
       _aListeners[0] = _oContainer.on("mousedown", this.buttonDown);
       _aListeners[1] = _oContainer.on("pressup" , this.buttonRelease);      
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.addEventListenerWithParams = function(iEvent,cbCompleted, cbOwner,aParams){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        _aParams = aParams;
    };
    
    this.buttonRelease = function(){
        if(_bDisable){
            return;
        }
        
        playSound("click",1,false);
        
        _oContainer.scaleX = 1;
        _oContainer.scaleY = 1;

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_aParams);
        }
    };
    
    this.buttonDown = function(){
        if(_bDisable){
            return;
        }
        
        _oContainer.scaleX = 0.9;
        _oContainer.scaleY = 0.9;

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN],_aParams);
       }
    };
    
    this.setPosition = function(iXPos,iYPos){
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;
    };

    this._init(iXPos,iYPos,iPlayer,iCar);
}