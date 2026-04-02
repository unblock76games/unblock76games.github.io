function CFoamParticle(){
    
    var _oBottomFoam;
    var _oBackFoam;
    
    this._init = function(){

    };
    
    this.addBottom = function(iX, iY, oParentContainer){
        var oSprite0 = s_oSpriteLibrary.getSprite('foam_bottom_0');
        var oSprite1 = s_oSpriteLibrary.getSprite('foam_bottom_1');
        var iWidth = oSprite1.width/4;
        var iHeight = oSprite1.height;
        var oData = {   
                        images: [oSprite0, oSprite1], 
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight/2}, 
                        animations: {idle:[0,27]}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
	_oBottomFoam = createSprite(oSpriteSheet, "idle",iWidth/2,iHeight/2,iWidth,iHeight);
        _oBottomFoam.x = iX;
        _oBottomFoam.y = iY;
        oParentContainer.addChild(_oBottomFoam);
    };
    
    this.addBack = function(iX, iY, oParentContainer){
        var aSprites = new Array();
        for(var i=0; i<29; i++){
            aSprites.push(s_oSpriteLibrary.getSprite('foam_back_'+i));
        }
        
        var iWidth = aSprites[0].width;
        var iHeight = aSprites[0].height;
        var oData = {   
                        images: aSprites, 
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: /*iHeight/2*/iHeight-18}, 
                        animations: {idle:[0,28]}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
	_oBackFoam = createSprite(oSpriteSheet, "idle",iWidth/2,iHeight/2,iWidth,iHeight);
        _oBackFoam.x = iX;
        _oBackFoam.y = iY;
        oParentContainer.addChild(_oBackFoam);
    };
    
    this.setSpeed = function(iFramerate){
        _oBottomFoam.framerate = iFramerate;
        _oBackFoam.framerate = iFramerate;
    };
    
    this.setVisible = function(bVal){
        _oBottomFoam.visible = bVal;
        _oBackFoam.visible = bVal;
    };
    
    this.setAlpha = function(iAlpha){
        _oBottomFoam.alpha = iAlpha;
        _oBackFoam.alpha = iAlpha;
    };
    
    this.setBottomAlpha = function(iAlpha){
        _oBottomFoam.alpha = iAlpha;
    };
    
    this.setBottomVisible = function(bVal){
        _oBottomFoam.visible = bVal;
    };
    
    this.setBackAlpha = function(iAlpha){
        _oBackFoam.alpha = iAlpha;
    };
    
    this.setBackVisible = function(bVal){
        _oBackFoam.visible = bVal;
    };
    
    this.setBackScale = function(iVal){
        _oBackFoam.scaleX = _oBackFoam.scaleY = iVal;
    };
    
    this.setBackRotation = function(iRot){
        _oBackFoam.rotation = iRot;
    };
    
    this._init();    
}


