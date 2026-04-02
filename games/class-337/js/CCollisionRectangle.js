/*
 * Use this class with the CRectangle, Cvector2, Cmath classes.
 */

function CCollisionRectangle(iWidth,iHeight, iStartX, iStartY, iRegX, iRegY, iRotation,oContainer){
    var _oBox;
    var _iWidth = iWidth;
    var _iHeight = iHeight;
    
    var _iStartX = iStartX;
    var _iStartY = iStartY;
    var _iRegX = iRegX;
    var _iRegY = iRegY;
    var _iRotation = iRotation;

    this.init = function(oContainer) {    
        if(!DEBUG_DRAW){
            _oBox = new CRectangle(oContainer); 
        }else{
            _oBox = new CDebugRectangle(oContainer); 
        }
        
        
        var _aPoints = new Array();
        //inner tollerance, if you do not want this set the following variables to 0
        var iToleranceX = 2;
        var iToleranceY = 3;
        
        //defining points
        _aPoints.push(new createjs.Point( _iStartX, _iStartY));                                           //center
        _aPoints.push(new createjs.Point( -_iRegX + iToleranceX, -_iRegY+ iToleranceY));                  //top left
        _aPoints.push(new createjs.Point( _iWidth-_iRegX- iToleranceX, -_iRegY+ iToleranceY));            //top right
        _aPoints.push(new createjs.Point( _iWidth-_iRegX- iToleranceX, _iHeight-_iRegY- iToleranceY));    //bottom right
        _aPoints.push(new createjs.Point( -_iRegX+ iToleranceX, _iHeight-_iRegY- iToleranceY));           //bottom left
        
       
        _oBox.prepareBox(_aPoints);
        _oBox.addAngle(_iRotation);
    };
    
    this.move = function(iX, iY,iRot) {
        _oBox.move(iX, iY,iRot);
    };
    
    this.applySteering = function(angle){
        _oBox.addAngle(angle);
    };
    
    this.getBox = function(){
        return _oBox;
    };
    
    this.refresh = function(oOtherBox) {
        //prepare the normals
        var aNormals_box1 = _oBox.getNorm();     //vector2d
        var aNormals_box2 = oOtherBox.getNorm();
        
        var aVecs_box1 = this.prepareVector(_oBox);
        var aVecs_box2 = this.prepareVector(oOtherBox);               //use this if your objects is not static

        //results of P, Q
        var oResult_P1 = this.getMinMax(aVecs_box1, aNormals_box1[1]);
        var oResult_P2 = this.getMinMax(aVecs_box2, aNormals_box1[1]);
        var oResult_Q1 = this.getMinMax(aVecs_box1, aNormals_box1[0]);
        var oResult_Q2 = this.getMinMax(aVecs_box2, aNormals_box1[0]);
  
        //results of R, S
        var oResult_R1 = this.getMinMax(aVecs_box1, aNormals_box2[1]);
        var oResult_R2 = this.getMinMax(aVecs_box2, aNormals_box2[1]);
        var oResult_S1 = this.getMinMax(aVecs_box1, aNormals_box2[0]);
        var oResult_S2 = this.getMinMax(aVecs_box2, aNormals_box2[0]);
        
        var bSeparate_p = oResult_P1.max_proj < oResult_P2.min_proj || oResult_P2.max_proj < oResult_P1.min_proj;
        var bSeparate_Q = oResult_Q1.max_proj < oResult_Q2.min_proj || oResult_Q2.max_proj < oResult_Q1.min_proj;
        var bSeparate_R = oResult_R1.max_proj < oResult_R2.min_proj || oResult_R2.max_proj < oResult_R1.min_proj;
        var bSeparate_S = oResult_S1.max_proj < oResult_S2.min_proj || oResult_S2.max_proj < oResult_S1.min_proj;
        
        var bIsSeparated = false;
       
        bIsSeparated = bSeparate_p || bSeparate_Q || bSeparate_R || bSeparate_S;

        return bIsSeparated;
    };

    /**
     * Prepares the coordinates to vector data
     * @param	current_box	box object
     * @return	array of vectors
     */
    this.prepareVector = function(oCurrent_box) {    //current_box = CRectangle
        var aVecs_box = new Array();

        for (var i = 0; i < 5; i++) {
            var pCorner_box = oCurrent_box.getDot(i);
            aVecs_box.push(new CVector2(pCorner_box.x, pCorner_box.y));
        }
        return aVecs_box;
    };

    /**
     * Calculates the min-max projections 
     * @param	aVecs_box	vectors to box coordinate
     * @param	iAxis		axis currently evaluating
     * @return	object array of [min, min_index, max, max_index]
     */
    this.getMinMax = function(aVecs_box, iAxis){
        var iMin_proj_box = aVecs_box[1].dotProduct(iAxis); 
        var iMax_proj_box = aVecs_box[1].dotProduct(iAxis); 
        
        for (var j = 2; j < aVecs_box.length; j++){
            var iCurr_proj = aVecs_box[j].dotProduct(iAxis);
            //select the maximum projection on axis to corresponding box corners
            if (iMin_proj_box > iCurr_proj) {
                iMin_proj_box = iCurr_proj;
            }
            //select the minimum projection on axis to corresponding box corners
            if (iCurr_proj> iMax_proj_box) {
                iMax_proj_box = iCurr_proj;
            }
        }
        return { 
            min_proj:iMin_proj_box,
            max_proj:iMax_proj_box
        };
    };
    
    this.init(oContainer);
}