function CUpgradeButton(iXPos,iYPos,oSprite, oParentContainer, aUpgradeCost){
    
    var _bDisabled;
    
    var _iCurElementUpgraded;
    var _iScaleFactor;
    var _iSegmentWidth;
    
    var _aCbCompleted;
    var _aCbOwner;
    var _aUpgradeSegment;
    
    var _oBgButton;
    var _oButton;
    var _oPriceStroke;
    var _oPrice;
    var _oTween;
    var _oParent;
    var _oContainer;
    var _oSegmentContainer;
    
    this._init =function(iXPos,iYPos,oSprite, oParentContainer, aUpgradeCost){
        _bDisabled = false;
        
        _iScaleFactor = 1;
        _iCurElementUpgraded = 0;
        
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;
        oParentContainer.addChild(_oContainer);        
        
        _oButton = new createjs.Container();
        _oContainer.addChild(_oButton);
        
        var iWidth = oSprite.width/2;
        var iHeight = oSprite.height;
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight/2}, 
                        animations: {on:[0], off:[1]}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
	_oBgButton = createSprite(oSpriteSheet, "on",iWidth/2,iHeight/2,iWidth,iHeight); 
        _oButton.addChild(_oBgButton);
     
        
        _oPriceStroke = new createjs.Text(TEXT_CURRENCY + aUpgradeCost[0]," 26px "+PRIMARY_FONT, "#3e240b");
        _oPriceStroke.y = iHeight/2 - 18;
        _oPriceStroke.textAlign = "center";
        _oPriceStroke.textBaseline = "middle";
        _oPriceStroke.lineWidth = 200;
        _oPriceStroke.outline = 4;
        _oButton.addChild(_oPriceStroke);

        _oPrice = new createjs.Text(TEXT_CURRENCY + aUpgradeCost[0]," 26px "+PRIMARY_FONT, "#ffffff");
        _oPrice.y = _oPriceStroke.y;
        _oPrice.textAlign = "center";
        _oPrice.textBaseline = "middle";
        _oPrice.lineWidth = 200;
        _oButton.addChild(_oPrice);
     
        _oSegmentContainer = new createjs.Container();
        _oButton.addChild(_oSegmentContainer);
        
        _iSegmentWidth = oSprite.width/aUpgradeCost.length/2;
        var iOffset = 5;
        _aUpgradeSegment = new Array();
        var aFrame = new Array();
        for(var i=0; i<aUpgradeCost.length; i++){
            _aUpgradeSegment[i] = new createjs.Shape();
            _aUpgradeSegment[i].graphics.beginFill("rgba(0,0,0,1)").drawRect(0, 0, _iSegmentWidth, oSprite.height/8);
            _aUpgradeSegment[i].x = -( (_iSegmentWidth+iOffset)*aUpgradeCost.length/2 ) + i*(_iSegmentWidth+iOffset);
            _aUpgradeSegment[i].y = oSprite.height/2 + 5;
            _oSegmentContainer.addChild(_aUpgradeSegment[i]);
            
            aFrame[i] = new createjs.Shape();
            aFrame[i].graphics.beginStroke("rgba(255,224,0,1)").drawRect(0, 0, _iSegmentWidth, oSprite.height/8);
            aFrame[i].x = -( (_iSegmentWidth+iOffset)*aUpgradeCost.length/2 ) + i*(_iSegmentWidth+iOffset);
            aFrame[i].y = oSprite.height/2 + 5;
            _oSegmentContainer.addChild(aFrame[i]);
            
        }

        this._initListener();
    };
    
    this.unload = function(){
       this.removeListener(); 
        
       oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this.disable = function(bVal){
        _bDisabled = bVal;
        if(_bDisabled){
            _oBgButton.gotoAndStop("off");
        } else {
            _oBgButton.gotoAndStop("on");
        }
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
    
    this.removeListener = function(){
        if(s_bMobile){
            _oButton.off("mousedown", this.buttonDown);
            _oButton.off("pressup" , this.buttonRelease);
        } else {
            _oButton.off("mousedown", this.buttonDown);
            _oButton.off("mouseover", this.buttonOver);
            _oButton.off("pressup" , this.buttonRelease);
        }
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.increaseUpgrade = function(){
        _aUpgradeSegment[_iCurElementUpgraded].graphics.beginFill("rgba(255,255,255,1)").drawRect(0, 0, _iSegmentWidth, oSprite.height/8);
        _iCurElementUpgraded++;
        if(_iCurElementUpgraded === aUpgradeCost.length){
            this.disable(true);
            _iCurElementUpgraded--;
            
            _oPriceStroke.text = "";
            _oPrice.text = "";
        } else {
            this.setPrice(aUpgradeCost[_iCurElementUpgraded]);
        }
    };
    
    this.setUpgrade = function(iIndex){        
        for(var i=0; i<iIndex; i++){
            this.increaseUpgrade();
        }
    };
    
    this.setPrice = function(iPrice){
        _oPriceStroke.text = TEXT_CURRENCY + iPrice;
        _oPrice.text = TEXT_CURRENCY + iPrice;
    };
    
    this.getPrice = function(){
        return aUpgradeCost[_iCurElementUpgraded];
    };
    
    this.buttonRelease = function(){
        if(_bDisabled){
            return;
        }
        _oButton.scaleX = _iScaleFactor;
        _oButton.scaleY = _iScaleFactor;

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP]);
        }
    };
    
    this.buttonDown = function(){
        if(_bDisabled){
            return;
        }
        _oButton.scaleX = _iScaleFactor*0.9;
        _oButton.scaleY = _iScaleFactor*0.9;

        playSound('upgrade_car', 1, false);

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
    
    this.setTextPos = function(iXPos, iYPos){
        if(iXPos){
            _oPriceStroke.x = iXPos;
            _oPrice.x = iXPos;
        }
        
        if(iYPos){
            _oPriceStroke.y = iYPos;
            _oPrice.y = iYPos;
        }
    };
    
    this.setSegmentPos = function(iXPos, iYPos){
        if(iXPos){
            _oSegmentContainer.x = iXPos;
        }
        
        if(iYPos){
            _oSegmentContainer.y = iYPos;
        }
    }
    
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

    _oParent = this;
    this._init(iXPos,iYPos,oSprite, oParentContainer, aUpgradeCost);
    
    return this;
}


