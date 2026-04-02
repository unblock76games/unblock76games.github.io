function CDebugRectangle(oContainer){

    var _iPrevX;
    var _iPrevY;
    var _iPrevAngle;
    var oDots; 
    var oLine;
    var _oContainer = oContainer;
        
    this.init = function(){
        _iPrevAngle = 0;
        oDots = new Array();
    };
    /*
     * 
     * If you don't want to set graphic things comments overy row like
     * "_oContainer.addChild(var);"
     * 
     */
    
    this.prepareBox = function(aCenter) {
        oDots.push(new createjs.Shape());
        oDots[0].graphics.beginFill("#ff0000").drawCircle(0, 0, 10);
        oDots[0].x = aCenter[0].x;
        oDots[0].y = aCenter[0].y;
        _iPrevX = aCenter[0].x;
        _iPrevY = aCenter[0].y;
        _oContainer.addChild(oDots[0]);
        
        for(var i=1; i < aCenter.length; i++){
            oDots.push(new createjs.Shape());
            oDots[i].graphics.beginFill("#ff0000").drawCircle(0, 0, 5);
            oDots[i].x = aCenter[0].x+aCenter[i].x;
            oDots[i].y = aCenter[0].y+aCenter[i].y;
            _oContainer.addChild(oDots[i]);
        }
        
        /*
        * Use the following point spawn method instead the one in for to see 
        * every point in different color.
        */
       
        
        oDots.push(new createjs.Shape());
        oDots[1].graphics.beginFill("#ff0000").drawCircle(0, 0, 5);
        oDots[1].x = aCenter[0].x+aCenter[1].x;
        oDots[1].y = aCenter[0].y+aCenter[1].y;
        _oContainer.addChild(oDots[1]);
        
        oDots.push(new createjs.Shape());
        oDots[2].graphics.beginFill("#00ffff").drawCircle(0, 0, 5);
        oDots[2].x = aCenter[0].x+aCenter[2].x;
        oDots[2].y = aCenter[0].y+aCenter[2].y;
        _oContainer.addChild(oDots[2]);
        
        oDots.push(new createjs.Shape());
        oDots[3].graphics.beginFill("#ffffff").drawCircle(0, 0, 5);
        oDots[3].x = aCenter[0].x+aCenter[3].x;
        oDots[3].y = aCenter[0].y+aCenter[3].y;
        _oContainer.addChild(oDots[3]);
        
        oDots.push(new createjs.Shape());
        oDots[4].graphics.beginFill("#00ff00").drawCircle(0, 0, 5);
        oDots[4].x = aCenter[0].x+aCenter[4].x;
        oDots[4].y = aCenter[0].y+aCenter[4].y;
        _oContainer.addChild(oDots[4]);
        
    };
    
    /*
     * Adds a certain angle to points.
     */
    this.addAngle = function(iCurAngle){
        var iAngle = iCurAngle-_iPrevAngle;

        var iCosValue = Math.cos(iAngle* Math.PI / 180);
        var iSinValue = Math.sin(iAngle* Math.PI / 180);
        for (var i = 1; i < oDots.length; i++){
            var iXLength = oDots[i].x - oDots[0].x;
	    var iYLength = oDots[i].y - oDots[0].y;        
                      
            oDots[i].x = iXLength * iCosValue - iYLength * iSinValue;
            oDots[i].y = iXLength * iSinValue + iYLength * iCosValue;
            oDots[i].x += oDots[0].x;
            oDots[i].y += oDots[0].y;
        }
        this.drawBox();
        
        _iPrevAngle = iCurAngle;
    };

    this.move = function(iX, iY,iRot){
        var iXSpeed = iX - _iPrevX;
        var iYSpeed = iY - _iPrevY;
        for(var i=0; i < oDots.length; i++){
            oDots[i].x += iXSpeed;
            oDots[i].y += iYSpeed;
        }
        
        _iPrevX = oDots[0].x;
        _iPrevY = oDots[0].y;
        
        
        this.addAngle(iRot);
    };
    
    this.getDot = function(value) {
        return {x: oDots[value].x, y: oDots[value].y};
    };
                
    this.drawBox = function() {
        //POINTS
        for (var i = 0; i < oDots.length; i++) {
            oDots[i].alpha = 0.5;
            oDots[i].fillColor = 0;
        }
        //LINES
        _oContainer.removeChild(oLine);
        oLine = new createjs.Shape();
        oLine.graphics.moveTo(oDots[1].x, oDots[1].y).setStrokeStyle(1).beginStroke("#00ff00").lineTo(oDots[1].x, oDots[1].y)
                      .lineTo(oDots[2].x, oDots[2].y).lineTo(oDots[3].x, oDots[3].y).lineTo(oDots[4].x, oDots[4].y).lineTo(oDots[1].x, oDots[1].y);
        _oContainer.addChild(oLine);
    };

    this.getNorm = function(){
        var aNormals = new Array();
        for (var i = 1; i < oDots.length-1; i++){
            var oCurrentNormal = new CVector2(
                oDots[i + 1].x - oDots[i].x, 
                oDots[i + 1].y - oDots[i].y
            );        
            aNormals.push(oCurrentNormal);
        }
        var oNormal = new CVector2(
            oDots[1].x - oDots[oDots.length-1].x, 
            oDots[1].y - oDots[oDots.length-1].y
        );
            
        aNormals.push(oNormal);
        return aNormals;
    };
    this.init();
}