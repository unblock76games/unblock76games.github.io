function CGearAreaView(iY, oParentContainer){
    
    var _iTriangleH;
    
    var _oGreenCircle;
    var _oGearArea;
    
    var _oBlueCircle;
    var _oEarlyArea; 
    
    var _oRedCircle;
    var _oLateArea;
    
    var _oGearChangeArea;
    
    var _oCurAreaData;
    
    this._init = function(iY, oParentContainer){
        _iTriangleH = 200;
        
        _oGearChangeArea = new createjs.Container();
        _oGearChangeArea.x = 0;
        _oGearChangeArea.y = iY;
        oParentContainer.addChild(_oGearChangeArea);
        
        this._setGreenSpot();
        this._setBlueSpot();
        this._setRedSpot();
        
    };
    
    this._setGreenSpot = function(){
        _oGreenCircle = new createjs.Shape();
        _oGreenCircle.graphics.rf(["rgba(0,255,0,0.01)","rgba(0,255,0,0.4)"], [0, 1], 0, 0, 60, 0, 0, 126).drawCircle(0, 0, 126);
        _oGearChangeArea.addChild(_oGreenCircle);

        _oGearArea = new createjs.Shape();        
        _oGearArea.graphics.beginFill("rgba(255,255,255,0.01)"); 
        _oGearChangeArea.addChild(_oGearArea);
    };
    
    this._setBlueSpot = function(){
        _oBlueCircle = new createjs.Shape();
        _oBlueCircle.graphics.rf(["rgba(0,0,255,0.01)","rgba(0,0,255,0.4)"], [0, 1], 0, 0, 60, 0, 0, 126).drawCircle(0, 0, 126);
        _oGearChangeArea.addChild(_oBlueCircle);

        _oEarlyArea = new createjs.Shape();        
        _oEarlyArea.graphics.beginFill("rgba(255,255,255,0.01)"); 
        _oGearChangeArea.addChild(_oEarlyArea);
    };
    
    this._setRedSpot = function(){
        _oRedCircle = new createjs.Shape();
        _oRedCircle.graphics.rf(["rgba(255,0,0,0.01)","rgba(255,0,0,0.4)"], [0, 1], 0, 0, 60, 0, 0, 126).drawCircle(0, 0, 126);
        _oGearChangeArea.addChild(_oRedCircle);

        _oLateArea = new createjs.Shape();        
        _oLateArea.graphics.beginFill("rgba(255,255,255,0.01)"); 
        _oGearChangeArea.addChild(_oLateArea);
    };
    
    this.setAreas = function(oDegreeInfo){
        _oCurAreaData = {center: 0, greenangle: oDegreeInfo.greenangle, earlyangle: oDegreeInfo.earlyangle, lateangle: oDegreeInfo.lateangle};
        
        var iAngleRad = Math.PI * (oDegreeInfo.greenangle/2) / 180;
        var iHalfTriangleBase = _iTriangleH*Math.tan(iAngleRad);
        _oGearArea.graphics.beginFill("rgba(255,255,255,0.001)"); 
        _oGearArea.graphics.moveTo(0, 0);
        _oGearArea.graphics.lineTo(-iHalfTriangleBase, -_iTriangleH);
        _oGearArea.graphics.lineTo(iHalfTriangleBase, -_iTriangleH);
        _oGearArea.graphics.lineTo(0, 0);
        _oGreenCircle.mask = _oGearArea;

        var iAngleRad = Math.PI * (oDegreeInfo.earlyangle/2) / 180;
        var iHalfTriangleBase = _iTriangleH*Math.tan(iAngleRad);
        _oEarlyArea.graphics.beginFill("rgba(255,255,255,0.001)"); 
        _oEarlyArea.graphics.moveTo(0, 0);
        _oEarlyArea.graphics.lineTo(-iHalfTriangleBase, -_iTriangleH);
        _oEarlyArea.graphics.lineTo(iHalfTriangleBase, -_iTriangleH);
        _oEarlyArea.graphics.lineTo(0, 0);
        _oEarlyArea.rotation = -(oDegreeInfo.earlyangle/2 + oDegreeInfo.greenangle/2);
        _oBlueCircle.mask = _oEarlyArea;
        
        var iAngleRad = Math.PI * (oDegreeInfo.lateangle/2) / 180;
        var iHalfTriangleBase = _iTriangleH*Math.tan(iAngleRad);
        _oLateArea.graphics.beginFill("rgba(255,255,255,0.001)"); 
        _oLateArea.graphics.moveTo(0, 0);
        _oLateArea.graphics.lineTo(-iHalfTriangleBase, -_iTriangleH);
        _oLateArea.graphics.lineTo(iHalfTriangleBase, -_iTriangleH);
        _oLateArea.graphics.lineTo(0, 0);
        _oLateArea.rotation = (oDegreeInfo.lateangle/2 + oDegreeInfo.greenangle/2);
        _oRedCircle.mask = _oLateArea;
    };
    
    this.moveAreas = function(iCenter){
        _oCurAreaData.center = iCenter;
        new createjs.Tween.get(_oGearChangeArea).to({rotation:iCenter}, 1000, createjs.Ease.cubicOut);
    };
    
    this.getIndicatorResult = function(iIndicatorRot){

        if(iIndicatorRot < _oCurAreaData.center + _oCurAreaData.greenangle/2 && iIndicatorRot > _oCurAreaData.center - _oCurAreaData.greenangle/2){
            return GREEN_AREA;
        } else if(iIndicatorRot > _oCurAreaData.center + _oCurAreaData.greenangle/2 && iIndicatorRot < _oCurAreaData.center + _oCurAreaData.greenangle/2 + _oCurAreaData.lateangle){
            return LATE_AREA;
        } else if(iIndicatorRot < _oCurAreaData.center - _oCurAreaData.greenangle/2 && iIndicatorRot > _oCurAreaData.center - _oCurAreaData.greenangle/2 - _oCurAreaData.earlyangle){
            return EARLY_AREA;
        }
        
        return NULL_AREA;
    };
    
    this._init(iY, oParentContainer);
}


