function CCar(iX, iY, oParentContainer, iType, bPlayerCar, oCarData, iStage){    
    var _bNitro;
    var _bPlayerCar;
    
    var _iCurPosX;
    var _iCurSpeed;
    var _iNumFrames;
    
    var _aWheels;
    
    var _oCar;
    var _oChassis;
    var _oEngine;
    var _oFireWheel;
    var _oFireWheel2;
    var _oFireLine;
    var _oSmoke;
    
    this._init = function(iX, iY, oParentContainer, iType, bPlayerCar, oCarData, iStage){
        _bNitro = false;
        _bPlayerCar = bPlayerCar;
        
        _iCurSpeed = 0;
        
        _oCar = new createjs.Container();
        _iCurPosX = iX;
        _oCar.x = iX;
        _oCar.y = iY;
        oParentContainer.addChild(_oCar);


        var oSprite = s_oSpriteLibrary.getSprite('fireline');
        var iWidth = oSprite.width/2;
        var iHeight = oSprite.height/30;
        var oData = {   
                        images: [oSprite],
                        framerate:30,
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth, regY: iHeight}, 
                        animations: {play:[0,59, "stop"], stop:[60,60]}
                   };
                   
         var oSpriteSheet = new createjs.SpriteSheet(oData);
	_oFireLine = createSprite(oSpriteSheet, "stop",iWidth/2,iHeight/2,iWidth,iHeight); 
        _oFireLine.x = WHEEL_POS[iType][1].x;
        _oFireLine.y = WHEEL_POS[iType][1].y+36;
        _oCar.addChild(_oFireLine);
        
        var iCarType = iType;
        var oSprite = s_oSpriteLibrary.getSprite('car_'+iCarType);
        _iNumFrames = 8;
        var iWidth = oSprite.width/4;
        var iHeight = oSprite.height/2;
        var oData = {   
                        images: [oSprite],
                        framerate:30,
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight}, 
                        animations: {static:[0], highlight:[1,7, "static"]}
                   };
                   
         var oSpriteSheet = new createjs.SpriteSheet(oData);
	_oChassis = createSprite(oSpriteSheet, "static",iWidth/2,iHeight/2,iWidth,iHeight); 
        _oCar.addChild(_oChassis);


        var oSprite = s_oSpriteLibrary.getSprite('shadow_'+iType);
        var oShadow = createBitmap(oSprite);
        oShadow.regY = oSprite.height/2 + SHADOW_POS[iType];
        oShadow.regX = iWidth/2,
        _oCar.addChild(oShadow);        


        var iWheelType = iType;
        _aWheels = new Array();
        var oSprite = s_oSpriteLibrary.getSprite('wheel_'+iWheelType);
        _aWheels[0] = createBitmap(oSprite);
        _aWheels[0].regX = oSprite.width/2;
        _aWheels[0].regY = oSprite.height/2;
        _aWheels[0].x = WHEEL_POS[iWheelType][0].x;
        _aWheels[0].y = WHEEL_POS[iWheelType][0].y;
        _aWheels[0].rotation = Math.random()*360;
        _oCar.addChild(_aWheels[0]);

        _aWheels[1] = createBitmap(oSprite);
        _aWheels[1].regX = oSprite.width/2;
        _aWheels[1].regY = oSprite.height/2;
        _aWheels[1].x = WHEEL_POS[iWheelType][1].x;
        _aWheels[1].y = WHEEL_POS[iWheelType][1].y;
        _aWheels[1].rotation = Math.random()*360;
        _oCar.addChild(_aWheels[1]);


        var oSprite = s_oSpriteLibrary.getSprite('firewheel');
        var iWidth = oSprite.width/7;
        var iHeight = oSprite.height/2;
        var oData = {   
                        images: [oSprite],
                        framerate:60,
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight/2}, 
                        animations: {play:[0,12, "play"], stop:[13,13]}
                   };
                   
         var oSpriteSheet = new createjs.SpriteSheet(oData);
	_oFireWheel = createSprite(oSpriteSheet, "stop",iWidth/2,iHeight/2,iWidth,iHeight); 
        _oFireWheel.x = WHEEL_POS[iWheelType][1].x;
        _oFireWheel.y = WHEEL_POS[iWheelType][1].y -3;
        _oCar.addChild(_oFireWheel);

        _oFireWheel2 = createSprite(oSpriteSheet, "stop",iWidth/2,iHeight/2,iWidth,iHeight); 
        _oFireWheel2.x = WHEEL_POS[iWheelType][0].x;
        _oFireWheel2.y = WHEEL_POS[iWheelType][0].y -3;
        _oCar.addChild(_oFireWheel2);


        var oSprite = s_oSpriteLibrary.getSprite('smoke');
        var iWidth = oSprite.width/5;
        var iHeight = oSprite.height/10;
        var oData = {   
                        images: [oSprite],
                        framerate:30,
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight/2}, 
                        animations: {play:[0,49, "stop"], stop:[50]}
                   };
                   
         var oSpriteSheet = new createjs.SpriteSheet(oData);
	_oSmoke = createSprite(oSpriteSheet, "stop",iWidth/2,iHeight/2,iWidth,iHeight); 
        _oSmoke.x = WHEEL_POS[iWheelType][1].x - 90;
        _oSmoke.y = WHEEL_POS[iWheelType][1].y - 30;
        _oCar.addChild(_oSmoke);

        _oEngine = new CEngine(this, oCarData);
    };
    
    this.unload = function(){
        oParentContainer.removeChild(_oCar);
    };
    
    this.getCar = function(){
        return _oCar;
    };
    
    this.getWheels = function(){
        return {right: _aWheels[0], left: _aWheels[1]};
    };
    
    this.getType = function(){
        return iType;
    };
    
    this.setScale = function(iScale){
        _oCar.scaleX = _oCar.scaleY = iScale;
    };
    
    this.setSpeed = function(iSpeed){
        _iCurSpeed = iSpeed;
    };
    
    this.getSpeed = function(){
        return _iCurSpeed;
    };
    
    this.getMeterSpeed = function(){
        return _oEngine.getMeterSpeed();
    };
    
    this.getMaxSpeedPerGearReached = function(){
        return _oEngine.getMaxSpeedPerGearReached();
    };
    
    this.getMeterPos = function(){
        return pixelsToMeters(_iCurPosX);
    };
    
    this.getPixelPos = function(){
        return _iCurPosX;
    };
    
    this.getGear = function(){
        return _oEngine.getGear();
    };
    
    this.ignition = function(){
        _oSmoke.gotoAndPlay("play");
        
        _oEngine.start();
        this.changeGear();
    };
    
    this.stopSound = function(){
        _oEngine.stopSound();
    };
    
    this.highlight = function(){
        var iSeconds = (LAMP_WIDTH/_iCurSpeed)/FPS;
        _oChassis.framerate=_iNumFrames/iSeconds;
        
        _oChassis.gotoAndPlay("highlight");
    };
    
    this.pitchStartAnim = function(){
        playSound('acceleration', 1, false);
        new createjs.Tween.get(_oChassis, {override: true}).to({rotation:0.5}, 100).to({rotation:0}, 750);
        new createjs.Tween.get(_oCar, {override: true}).to({x:iX+1}, 100).to({x:iX}, 750);
    };
    
    this.changeGear = function(){
        if(_oEngine.getGear() !== 0 && _oEngine.getGear() < oCarData.length-1 && !_bNitro){
            new createjs.Tween.get(_oChassis, {override: true}).to({rotation:0.5}, 100, createjs.Ease.cubicOut).to({rotation:0}, 750, createjs.Ease.cubicIn);
        }
        _oEngine.changeGear();
    };
    
    this.delayEngine = function(iTime){
        _oEngine.delayAcceleration(iTime);
    };
    
    this.activateNitro = function(iDuration){
        if(iDuration>0){
            _oFireWheel.gotoAndPlay("play");
            _oFireWheel2.gotoAndPlay("play");
            _oFireLine.gotoAndPlay("play");
            new createjs.Tween.get(_oFireWheel).wait(iDuration/2).to({alpha:0}, iDuration/2, createjs.Ease.cubicIn);
            new createjs.Tween.get(_oFireWheel2).wait(iDuration/2).to({alpha:0}, iDuration/2, createjs.Ease.cubicIn);

            _bNitro = true;
            _oEngine.activateNitro(true);
        }

        setTimeout(function(){
            _oEngine.fadeNitroSound(iDuration/2);
        }, iDuration/2 - 400);

        new createjs.Tween.get(_oChassis).to({rotation:-2}, 400, createjs.Ease.cubicOut).wait(iDuration/2 - 400).to({rotation:0}, iDuration/2, createjs.Ease.cubicIn).call(function(){
            _bNitro = false;
            _oEngine.activateNitro(false);

        });
    };
    
    this.break = function(){
        _oEngine.break();
    };
    
    this.move = function(iPlayerSpeed){
        
        _iCurPosX += _iCurSpeed;
        
        _oEngine.update();
        
        for(var i=0; i<2; i++){
            if(_iCurSpeed < 1){
                _aWheels[i].rotation += 20 - _iCurSpeed*20;
            } else {
                _aWheels[i].rotation += _iCurSpeed;
            }
        }
        
        if(!_bPlayerCar){
            var iRelativeSpeed = _iCurSpeed - iPlayerSpeed; 
            _oCar.x += iRelativeSpeed;
        }
    };

    this._init(iX, iY, oParentContainer, iType, bPlayerCar, oCarData, iStage);
}


