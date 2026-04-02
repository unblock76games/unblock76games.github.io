function CHelpPanel(aCarTypes){
    var _bHandState;
    var _aKeys;
    var _iIntervalId;
    var _oListener;
    
    var _oFade;
    var _oHand;
    var _oButStart;
    var _oContainer;
    
    var _oThis = this;
    
    this._init = function(aCarTypes){
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        s_oStage.addChild(_oContainer);
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oListener = _oFade.on("click",function(){});
        _oContainer.addChild(_oFade);
        
        var oSprite = s_oSpriteLibrary.getSprite("msg_box_big");
        var oBg = createBitmap(oSprite);
        oBg.regX = oSprite.width/2;
        oBg.regY = oSprite.height/2;
        oBg.x = CANVAS_WIDTH/2;
        oBg.y = CANVAS_HEIGHT/2; 
        _oContainer.addChild(oBg);
        
        _aKeys = new Array();
        if(s_bSingleMode){
            if(s_bMobile){
                var oSprite = s_oSpriteLibrary.getSprite("key_0_mobile");
            }else{
                var oSprite = s_oSpriteLibrary.getSprite("key_0");
                
            }
            var oKey0 = createBitmap(oSprite);
            oKey0.regX = oSprite.width/2;
            oKey0.regY = oSprite.height/2;
            oKey0.x = CANVAS_WIDTH/2 - 100;
            oKey0.y = CANVAS_HEIGHT/2 - 40;
            _oContainer.addChild(oKey0);
            
            _aKeys.push(oKey0);

           var oSprite = s_oSpriteLibrary.getSprite('cars_big');
           var oData = {   
                            images: [oSprite], 
                            // width, height & registration point of each sprite
                            frames: {width: oSprite.width, height: oSprite.height/NUM_CAR_SPRITE, regX: (oSprite.width)/2, regY: (oSprite.height/NUM_CAR_SPRITE)/2}, 
                            animations: {car_0:0,car_1:1,car_2:2,car_3:3,car_4:4,car_5:5,car_6:6,car_7:7,car_8:8}
                        };

            var oSpriteSheet = new createjs.SpriteSheet(oData);
            var oCar = createSprite(oSpriteSheet,"car_"+aCarTypes[0],(oSprite.width)/2,(oSprite.height/NUM_CAR_SPRITE)/2,oSprite.width, oSprite.height/NUM_CAR_SPRITE);
            oCar.x = CANVAS_WIDTH/2 + 100;
            oCar.y = oKey0.y;
            _oContainer.addChild(oCar);
        }else{
            var oSpriteKey0;
            var oSpriteKey1;
            if(s_bMobile){
                oSpriteKey0 = s_oSpriteLibrary.getSprite("key_0_mobile");
                oSpriteKey1 = s_oSpriteLibrary.getSprite("key_1_mobile");
            }else{
                oSpriteKey0 = s_oSpriteLibrary.getSprite("key_0");
                oSpriteKey1 = s_oSpriteLibrary.getSprite("key_1");
            }
            
            var oKey0 = createBitmap(oSpriteKey0);
            oKey0.regX = oSpriteKey0.width/2;
            oKey0.regY = oSpriteKey0.height/2;
            oKey0.x = CANVAS_WIDTH/2 - 90;
            oKey0.y = CANVAS_HEIGHT/2 - 100;
            _oContainer.addChild(oKey0);
            
            _aKeys.push(oKey0);

            var oSprite = s_oSpriteLibrary.getSprite('cars_big');
            var oData = {   
                            images: [oSprite], 
                            // width, height & registration point of each sprite
                            frames: {width: oSprite.width, height: oSprite.height/NUM_CAR_SPRITE, regX: (oSprite.width)/2, regY: (oSprite.height/NUM_CAR_SPRITE)/2}, 
                            animations: {car_0:0,car_1:1,car_2:2,car_3:3,car_4:4,car_5:5,car_6:6,car_7:7,car_8:8}
                        };

            var oSpriteSheetCar = new createjs.SpriteSheet(oData);
            var oCar = createSprite(oSpriteSheetCar,"car_"+aCarTypes[0],(oSprite.width)/2,(oSprite.height/NUM_CAR_SPRITE)/2,oSprite.width, oSprite.height/NUM_CAR_SPRITE);
            oCar.x = CANVAS_WIDTH/2 + 90;
            oCar.y = oKey0.y;
            _oContainer.addChild(oCar);
            
            var oKey1 = createBitmap(oSpriteKey1);
            oKey1.regX = oSpriteKey1.width/2;
            oKey1.regY = oSpriteKey1.height/2;
            oKey1.x = CANVAS_WIDTH/2 - 90;
            oKey1.y = CANVAS_HEIGHT/2 + 10;
            _oContainer.addChild(oKey1);
            _aKeys.push(oKey1);

            

            var oCar = createSprite(oSpriteSheetCar,"car_"+aCarTypes[1],(oSprite.width)/2,(oSprite.height/NUM_CAR_SPRITE)/2,oSprite.width, oSprite.height/NUM_CAR_SPRITE);
            oCar.x = CANVAS_WIDTH/2 + 90;
            oCar.y = oKey1.y;
            _oContainer.addChild(oCar);
        }
        
        _oButStart = new CGfxButton(CANVAS_WIDTH/2+ 180,CANVAS_HEIGHT/2 + 130,s_oSpriteLibrary.getSprite("but_go"),_oContainer);
        _oButStart.addEventListener(ON_MOUSE_UP,this._onStart,this);
    };
    
    this.unload = function(){
        _oFade.off("click",_oListener);
    };
    
    this.show = function(){
        var oParent = this;
        _bHandState = true;
        //_iIntervalId = setInterval(function(){oParent.playHandAnim();},1000);
        
        _oContainer.alpha = 0;
        _oContainer.visible = true;
        createjs.Tween.get(_oContainer).to({alpha:1},500);
    };
    
    this.hide = function(){
        createjs.Tween.get(_oContainer).to({alpha:0} , 500,createjs.Ease.cubicOut).call(function(){
                                                                                    clearInterval(_iIntervalId);
                                                                                    _oContainer.visible = false;
                                                                                });
    };
    
    this.playHandAnim = function(){
        _oHand.gotoAndStop("state_"+_bHandState);
        
        for(var i=0;i<_aKeys.length;i++){
            _aKeys[i].scaleX = _aKeys[i].scaleY = _bHandState?0.9:1;
        }
        
        _bHandState = !_bHandState;
    };
    
    this._onStart = function(){
        _oThis.hide();
        s_oGame.onExitFromHelp();
    };
    
    this._init(aCarTypes);
}