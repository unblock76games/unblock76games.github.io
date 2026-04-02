function CGearButton(iXPos,iYPos,oSprite, oParentContainer){
    
    var _bDisabled;
    
    var _iScaleFactor;
    var _iCurNumber;
    
    var _aCbCompleted;
    var _aCbOwner;
    var _aNumber;
    
    var _oButton;
    var _oTween;
    var _oParent;
    var _oGearHandle;
    
    this._init =function(iXPos,iYPos,oSprite, oParentContainer){
        _bDisabled = false;
        
        _iScaleFactor = 1;
        
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oButton = new createjs.Container();
        _oButton.x = iXPos;
        _oButton.y = iYPos; 
        _oButton.scaleX =   _oButton.scaleY = _iScaleFactor; 
        oParentContainer.addChild(_oButton);
        
        var oButtonSprite = createBitmap( oSprite);             
        oButtonSprite.regX = oSprite.width/2;
        oButtonSprite.regY = oSprite.height/2;
        _oButton.addChild(oButtonSprite);        
        
        _iCurNumber = 0;
        _aNumber = new Array();
        var iStartX = -20;
        for(var i=1; i<PLAYER_ENGINE_GEAR.length; i++){
            _aNumber[i] = new createjs.Text(i," 18px "+PRIMARY_FONT, "#000000");
            _aNumber[i].x = iStartX;
            if(i%2 === 0){
                _aNumber[i].y = 32;
                iStartX += 20;
            } else {
                _aNumber[i].y = -32;
            }
            _aNumber[i].textAlign = "center";
            _aNumber[i].textBaseline = "middle";
            _aNumber[i].lineWidth = 200;
            _oButton.addChild(_aNumber[i]);
        }
        
        
        
        var oSprite = s_oSpriteLibrary.getSprite('gear_handle');
        _oGearHandle = createBitmap( oSprite);                        
        _oGearHandle.regX = oSprite.width/2;
        _oGearHandle.regY = oSprite.height/2;
        _oButton.addChild(_oGearHandle); 
        
        this._initListener();
    };
    
    this.unload = function(){
        if(s_bMobile){
            _oButton.off("mousedown", this.buttonDown);
            _oButton.off("pressup" , this.buttonRelease);
        } else {
            _oButton.off("mousedown", this.buttonDown);
            _oButton.off("mouseover", this.buttonOver);
            _oButton.off("pressup" , this.buttonRelease);
        }
        
       oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this.setClickable = function(bVal){
        _bDisabled = !bVal;
    };
    
    this._initListener = function(){
        if(s_bMobile){
            _oButton.on("mousedown", this.buttonDown);
            _oButton.on("pressup" , this.buttonRelease);
        } else {
            _oButton.on("mousedown", this.buttonDown);
            _oButton.on("mouseover", this.buttonOver);
            _oButton.on("pressup" , this.buttonRelease);
        }     
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.buttonRelease = function(){
        if(_bDisabled){
            return;
        }

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP]);
        }
    };
    
    this.buttonDown = function(){
        if(_bDisabled){
            return;
        }

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN]);
       }
    };
    
    this.buttonOver = function(evt){
        if(!s_bMobile){
            if(_bDisabled){
                return;
            }
            evt.target.cursor = "pointer";
        }  
    };
    
    this.pulseAnimation = function () {
        _oTween = createjs.Tween.get(_oButton).to({scaleX: _iScaleFactor*0.9, scaleY: _iScaleFactor*0.9}, 850, createjs.Ease.quadOut).to({scaleX: _iScaleFactor, scaleY: _iScaleFactor}, 650, createjs.Ease.quadIn).call(function () {
            _oParent.pulseAnimation();
        });
    };

    this.trembleAnimation = function () {
        _oTween = createjs.Tween.get(_oButton).to({rotation: 5}, 75, createjs.Ease.quadOut).to({rotation: -5}, 140, createjs.Ease.quadIn).to({rotation: 0}, 75, createjs.Ease.quadIn).wait(750).call(function () {
            _oParent.trebleAnimation();
        });
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.setX = function(iXPos){
         _oButton.x = iXPos;
    };
    
    this.setY = function(iYPos){
         _oButton.y = iYPos;
    };
    
    this.getButtonImage = function(){
        return _oButton;
    };

    this.getX = function(){
        return _oButton.x;
    };
    
    this.getY = function(){
        return _oButton.y;
    };

    this.scaleGear = function(){
        _iCurNumber++;
        if(_iCurNumber >= PLAYER_ENGINE_GEAR.length){
            _iCurNumber = PLAYER_ENGINE_GEAR.length-1;
        }
        
        for(var i=1; i<PLAYER_ENGINE_GEAR.length; i++){
            _aNumber[i].color = "#000000";
        }
        
        new createjs.Tween.get(_oButton).to({scaleX: 0.9, scaleY: 0.9}, 200, createjs.Ease.cubicOut).to({scaleX: 1, scaleY: 1}, 200, createjs.Ease.cubicIn);
        playSound('change_gear', 1,false);
        
        switch(_iCurNumber){
            case 1:{
                    new createjs.Tween.get(_oGearHandle, {override: true}).to({x: -20}, 200, createjs.Ease.cubicOut).wait(100).to({y:-18}, 200, createjs.Ease.cubicOut).call(function(){
                        _aNumber[_iCurNumber].color = "#ffffff";
                    });
                    break;
            }
            case 3:{
                    new createjs.Tween.get(_oGearHandle, {override: true}).to({y: 0}, 100, createjs.Ease.cubicOut).wait(100).to({x:0}, 100, createjs.Ease.cubicOut).wait(100).to({y:-18}, 100, createjs.Ease.cubicOut).call(function(){
                        _aNumber[_iCurNumber].color = "#ffffff";
                    });
                    break;
            }
            case 5:{
                    new createjs.Tween.get(_oGearHandle, {override: true}).to({y: 0}, 100, createjs.Ease.cubicOut).wait(100).to({x:20}, 100, createjs.Ease.cubicOut).wait(100).to({y:-18}, 100, createjs.Ease.cubicOut).call(function(){
                        _aNumber[_iCurNumber].color = "#ffffff";
                    });
                    break;
            }
            default:{
                    new createjs.Tween.get(_oGearHandle, {override: true}).to({y: 0}, 200, createjs.Ease.cubicOut).wait(100).to({y:16}, 200, createjs.Ease.cubicOut).call(function(){
                        _aNumber[_iCurNumber].color = "#ffffff";
                    });
                    break;
            }
        }
    };

    _oParent = this;
    this._init(iXPos,iYPos,oSprite, oParentContainer);
    
    return this;
}

