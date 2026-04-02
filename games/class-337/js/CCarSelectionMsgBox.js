function CCarSelectionMsgBox(iX,iY,szText,szLabel,oParentContainer){
    var _bMovingCar;
    var _iStartCarX;
    var _iEndCarX;
    var _aCbCompleted;
    var _aCbOwner;

    
    var _oArrowLeft;
    var _oArrowRight;
    var _oSpriteCar;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    this._init = function(iX,iY,szText,szLabel){
        _bMovingCar = false;
        _aCbCompleted = new Array();
        _aCbOwner = new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);
        
        
        var oSpriteCar = s_oSpriteLibrary.getSprite('cars_big');
        var oData = {   
                        images: [oSpriteCar], 
                        // width, height & registration point of each sprite
                        frames: {width: oSpriteCar.width, height: oSpriteCar.height/NUM_CAR_SPRITE, regX: (oSpriteCar.width)/2, regY: (oSpriteCar.height/NUM_CAR_SPRITE)/2}, 
                        animations: {car_0:0,car_1:1,car_2:2,car_3:3,car_4:4,car_5:5,car_6:6,car_7:7,car_8:8}
                    };
        
        var oSpriteSheetCar = new createjs.SpriteSheet(oData);

        
        var oSpriteBg = s_oSpriteLibrary.getSprite("select_car_bg");
        var oBg = createBitmap(oSpriteBg);
        _oContainer.addChild(oBg);
        
        var oText = new createjs.Text(szText ,"24px "+FONT_GAME, "#fff");
        oText.x = oSpriteBg.width/2;
        oText.y = 22;
        oText.textAlign = "center";
        oText.textBaseline = "alphabetic";
        _oContainer.addChild(oText);
        
        _oArrowLeft = new CGfxButton(-10,oSpriteBg.height/2+10,s_oSpriteLibrary.getSprite("arrow_left"),_oContainer);
        _oArrowLeft.addEventListener(ON_MOUSE_UP,this._onLeft,this);
        
        _oArrowRight = new CGfxButton(oSpriteBg.width+10,oSpriteBg.height/2+10,s_oSpriteLibrary.getSprite("arrow_right"),_oContainer);
        _oArrowRight.addEventListener(ON_MOUSE_UP,this._onRight,this);
        
        _oSpriteCar = createSprite(oSpriteSheetCar,szLabel,(oSpriteCar.width)/2,(oSpriteCar.height/NUM_CAR_SPRITE)/2,oSpriteCar.width, oSpriteCar.height/NUM_CAR_SPRITE);
        _oSpriteCar.x = _iStartCarX = oSpriteBg.width/2;
        _oSpriteCar.y = oSpriteBg.height/2+10;
        _oContainer.addChild(_oSpriteCar);
        
        var oMask  = new createjs.Shape();
        oMask.graphics.beginFill("red").drawRect(10, 0, oSpriteBg.width-20, oSpriteBg.height);
        oMask.alpha = 0.01;
        _oContainer.addChild(oMask);
        
        _oSpriteCar.mask = oMask;
        
        _oContainer.regX = _oContainer.getBounds().width/2;
        _oContainer.regY = _oContainer.getBounds().height/2;
        
        _iEndCarX = oSpriteBg.width*1.5;
    };
    
    this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };
    
    this.changeState = function(szState){
        _oSpriteCar.gotoAndStop(szState);
        
        createjs.Tween.get(_oSpriteCar).to({x: _iStartCarX}, 600, createjs.Ease.cubicOut).call(function(){
                                                                                                _bMovingCar = false;
                                                                                            });
    };
    
    this.setPos = function(iX,iY){
        _oContainer.x = iX;
        _oContainer.y = iY;
    };
    
    this._onLeft = function(){
        if(_bMovingCar){
            return;
        }
        
        _bMovingCar = true;
        
        createjs.Tween.get(_oSpriteCar).to({x: _iEndCarX}, 600, createjs.Ease.cubicIn).call(function(){
                                                                                            _oSpriteCar.x = -_iStartCarX;
                                                                                            if (_aCbCompleted[ON_CAR_SELECTION_LEFT]) {
                                                                                                _aCbCompleted[ON_CAR_SELECTION_LEFT].call(_aCbOwner[ON_CAR_SELECTION_LEFT]);
                                                                                            }
                                                                                        });
        
        
    };
    
    this._onRight = function(){
        if(_bMovingCar){
            return;
        }
        
         _bMovingCar = true;
        
        createjs.Tween.get(_oSpriteCar).to({x: _iEndCarX}, 600, createjs.Ease.cubicIn).call(function(){
                                                                                            _oSpriteCar.x = -_iStartCarX;
                                                                                            if (_aCbCompleted[ON_CAR_SELECTION_RIGHT]) {
                                                                                                _aCbCompleted[ON_CAR_SELECTION_RIGHT].call(_aCbOwner[ON_CAR_SELECTION_RIGHT]);
                                                                                            }
                                                                                        });
        
    };
    
    this._init(iX,iY,szText,szLabel);
}