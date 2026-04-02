function CSpinnerBut(iXPos,iYPos,bAvailable,bCanBuy,iIndex,oParentContainer){
    var _bAvailable;
    var _iScale;
    var _iPrice;
    var _oListener = null;
    
    var _oPriceText;
    var _oCoinIcon;
    var _oSpriteSpinner;
    var _oSpinnerContainer;
    var _oContainerPrice;
    var _oParentContainer;
    
    this._init = function(iXPos,iYPos,bAvailable,bCanBuy,iIndex){
        _bAvailable = bAvailable;
        _iScale = 0.4;
        _iPrice = PRICE_SPINNER[iIndex];
        
        var oSpriteCoin = s_oSpriteLibrary.getSprite("coin");
        var oSpriteBgPrice = s_oSpriteLibrary.getSprite("buy_spinner_bg");
        var oSprite = s_oSpriteLibrary.getSprite("spinner");
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: SPINNER_WIDTH, height: SPINNER_HEIGHT, regX: SPINNER_WIDTH/2, regY: SPINNER_HEIGHT/2}, 
                        animations: {spinner_0:0,spinner_1:1,spinner_2:2,spinner_3:3,spinner_4:4,spinner_5:5,spinner_6:6,spinner_7:7,spinner_8:8,spinner_9:9,spinner_10:10,spinner_11:11}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        
        _oSpinnerContainer = new createjs.Container();
        _oSpinnerContainer.x = iXPos;
        _oSpinnerContainer.y = iYPos;
        _oParentContainer.addChild(_oSpinnerContainer);

        _oSpriteSpinner = createSprite(oSpriteSheet,"spinner_"+iIndex,SPINNER_WIDTH/2,SPINNER_HEIGHT/2,SPINNER_WIDTH,SPINNER_HEIGHT);
        _oSpriteSpinner.scaleX = _oSpriteSpinner.scaleY = _iScale;
        _oSpinnerContainer.addChild(_oSpriteSpinner);
        
        var oSprite = s_oSpriteLibrary.getSprite("spinner_center");
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: SPINNER_CENTER_WIDTH, height: SPINNER_CENTER_HEIGHT, regX: SPINNER_CENTER_WIDTH/2, regY: SPINNER_CENTER_HEIGHT/2}, 
                        animations: {spinner_0:0,spinner_1:1,spinner_2:2,spinner_3:3,spinner_4:4,spinner_5:5,spinner_6:6,spinner_7:7,spinner_8:8,spinner_9:9,spinner_10:10,spinner_11:11}
                   };
                   
        oSpriteSheet = new createjs.SpriteSheet(oData);

        var oSpriteCenter = createSprite(oSpriteSheet,"spinner_"+iIndex,SPINNER_CENTER_WIDTH/2,SPINNER_CENTER_HEIGHT/2,SPINNER_CENTER_WIDTH,SPINNER_CENTER_HEIGHT);
        oSpriteCenter.scaleX = oSpriteCenter.scaleY = _iScale;
        _oSpinnerContainer.addChild(oSpriteCenter);
        
        if(bAvailable === false){
            //ATTACH PRICE
            _oContainerPrice = new createjs.Container();
            _oContainerPrice.regY = oSpriteBgPrice.height;
            _oContainerPrice.y = SPINNER_HEIGHT*_oSpriteSpinner.scaleY/2 - 5;
            _oSpinnerContainer.addChild(_oContainerPrice);

            var oBg = createBitmap(oSpriteBgPrice);
            oBg.regX = oSpriteBgPrice.width/2;
            _oContainerPrice.addChild(oBg);

            _oCoinIcon = createBitmap(oSpriteCoin);
            _oCoinIcon.scaleX = _oCoinIcon.scaleY = 0.8;
            _oCoinIcon.x =  -(oSpriteCoin.width*_oCoinIcon.scaleX)/2 - 35;
            _oCoinIcon.y = (oSpriteCoin.height*_oCoinIcon.scaleY)/2;
            _oCoinIcon.regX = (oSpriteCoin.width*_oCoinIcon.scaleX)/2;
            _oCoinIcon.regY = (oSpriteCoin.height*_oCoinIcon.scaleY)/2;
            _oContainerPrice.addChild(_oCoinIcon);
            
            _oPriceText = new createjs.Text( _iPrice," 30px "+PRIMARY_FONT, "#005e0f");
            _oPriceText.x = -20;
            _oPriceText.y = 40;
            _oPriceText.textAlign = "left";
            _oPriceText.textBaseline = "alphabetic";
            _oContainerPrice.addChild(_oPriceText);

            if(!bCanBuy){
                var matrix = new createjs.ColorMatrix().adjustSaturation(-100);
                _oSpinnerContainer.filters = [
                         new createjs.ColorMatrixFilter(matrix)
                ];

                var oBounds = _oSpinnerContainer.getBounds();
                _oSpinnerContainer.cache(-oBounds.width/2,-oBounds.height/2,oBounds.width,oBounds.height);
            }else{
                _oListener = _oSpinnerContainer.on("click",this._onSelectSpinner,null,false,iIndex);
            }
        }else{
                _oListener = _oSpinnerContainer.on("click",this._onSelectSpinner,null,false,iIndex);
            }
    };
    
    this.unload = function(){
        _oSpinnerContainer.off("click",_oListener);
    };
    
    this.setShadow = function(oShadow){
        _oSpriteSpinner.shadow = oShadow;
    };
    
    this.disable = function(){
        if(_oListener !== null){
            var matrix = new createjs.ColorMatrix().adjustSaturation(-100);
                _oSpinnerContainer.filters = [
                         new createjs.ColorMatrixFilter(matrix)
                ];

                var oBounds = _oSpinnerContainer.getBounds();
                _oSpinnerContainer.cache(-oBounds.width/2,-oBounds.height/2,oBounds.width,oBounds.height);
                
            _oSpinnerContainer.off("click",_oListener);
            _oListener = null;
        }
    };
    
    this.decreasePrice = function(iOffset){
        _iPrice -= iOffset;

        _oPriceText.text = _iPrice;
    };
    
    this.removePrice = function(){
        _bAvailable = true;

        createjs.Tween.get(_oContainerPrice).to({alpha: 0}, 2000,createjs.Ease.cubicOut);
    };
    
    this._onSelectSpinner = function(evt,iIndex){
        playSound("click",1,false);
        
        if(!_bAvailable){
            createjs.Tween.get(_oSpriteSpinner).to({rotation: 1440}, TIME_MONEY_TWEEN*20,createjs.Ease.cubicOut);
        }

        s_oSpinnerPanel.onSelectSpinner(iIndex,_bAvailable);
    };
    
    this.getScale = function(){
        return _iScale;
    };
    
    this.getAbsoluteCoinPos = function(){
        return _oCoinIcon.localToLocal(Math.abs(_oCoinIcon.x),_oCoinIcon.y,s_oStage);
    };
    
    this.getPrice = function(){
        return _iPrice;
    };
    
    this.isAvailable = function(){
        return _bAvailable;
    };
    
    _oParentContainer = oParentContainer;
    this._init(iXPos,iYPos,bAvailable,bCanBuy,iIndex);
}