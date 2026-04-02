function CEdgeViewer (iX1,iY1,iX2,iY2,iLength,iHeight){
    var _oRect;
    
    
    this.init = function(iX1,iY1,iX2,iY2,iLength,iHeight){
        var graphics;
        if (iX1>iX2||iY1>iY2){
            if (iY1===iY2){
                graphics = new createjs.Graphics().beginFill("#FFF").drawRect(iX2, iY2, iLength, iHeight);
            }else{
                graphics = new createjs.Graphics().beginFill("#FFF").drawRect(iX2, iY2, iHeight, iLength);
            }
        }else{
            if (iY1===iY2){
                graphics = new createjs.Graphics().beginFill("#FFF").drawRect(iX1, iY1, iLength, iHeight);
            }else{
                graphics = new createjs.Graphics().beginFill("#FFF").drawRect(iX1, iY1, iHeight, iLength);
            }
        }
        _oRect = new createjs.Shape(graphics);
        _oRect.y = -iHeight/2;
        _oRect.alpha = 0.3;
        s_oStage.addChild(_oRect);
    };
    
    this.moveY = function(iY){
        _oRect.y += iY;
    };
    
     this.moveX = function(iX){
        _oRect.x += iX;
    };
    
    this.unload = function(){
       s_oStage.removeChild(_oRect); 
    };
    
    this.init(iX1,iY1,iX2,iY2,iLength,iHeight);
    
};