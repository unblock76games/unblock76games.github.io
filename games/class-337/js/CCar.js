function CCar(iIndex,iType,aTrackPoints,oParentContainer){
    var _bDisabled;
    var _bAccellerate;
    var _iIndex;
    var _iTypeSprite;
    var _iCurFrame;
    var _iSpeed;
    var _iCurTrackRail;
    var _iLastRotation;
    var _iCurTime;
    var _iTotTime;
    var _iBestLap;
    var _aTrack;
    var _aHistoryTrack;
    var _vLastPos;
    var _oCarRectangle;
    var _oCarVector;
    var _oTween;

    var _oSprite;
    var _oParentContainer = oParentContainer;
    var _oThis = this;
    
    this._init = function(iIndex,iType,aTrackPoints){
        this.reset();
        
        _iIndex = iIndex;
        _iTypeSprite = iType;
        _iCurTrackRail = iIndex;
        
        _aTrack = aTrackPoints;

        var oSprite = s_oSpriteLibrary.getSprite('cars');
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: oSprite.width, height: oSprite.height/NUM_CAR_SPRITE, regX: (oSprite.width)/2, regY: (oSprite.height/NUM_CAR_SPRITE)/2}, 
                        animations: {car_0:0,car_1:1,car_2:2,car_3:3,car_4:4,car_5:5,car_6:6,car_7:7,car_8:8}
                    };
        
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oSprite = createSprite(oSpriteSheet,"car_"+iType,(oSprite.width)/2,(oSprite.height/NUM_CAR_SPRITE)/2,oSprite.width, oSprite.height/NUM_CAR_SPRITE);
        _oSprite.stop();
        _oSprite.x = _aTrack[_iCurFrame].x;
        _oSprite.y = _aTrack[_iCurFrame].y;
        _oSprite.rotation = _aTrack[_iCurFrame].degrees;
        _oParentContainer.addChild(_oSprite);
        
        var iWidthBox = oSprite.width-10;
        var iHeightBox = (oSprite.height/NUM_CAR_SPRITE)-10;
        _oCarRectangle = new CCollisionRectangle(iWidthBox,iHeightBox, _oSprite.x, _oSprite.y, 
                                                                    iWidthBox/2, iHeightBox/2, _oSprite.rotation,_oParentContainer);
        _oCarVector = _oCarRectangle.prepareVector(_oCarRectangle.getBox());
    };
    
    this.unload = function(){
        _oParentContainer.removeChild(_oSprite);
        _oCarRectangle.unload();
    };
    
    this.reset = function(){
        _bAccellerate =  false;
        _bDisabled = false;
        _iCurFrame = 0;
        _iSpeed = 0;
        _iBestLap = 0;

        _iCurTime = 0;
        _iTotTime = 0;
        _vLastPos = null;
        _aHistoryTrack = new Array();
    };
    
    this.increaseAccelleration = function(){
        if(_bDisabled){
            return;
        }
        
        _iSpeed += ACCELLERATION_STEP;
        _bAccellerate = true;

        if(!isSoundPlaying("engine")){
            playSound("engine",1,false);
        }
    };
    
    this.decreaseAccelleration = function(){
        _bAccellerate = false;
        stopSound("engine");
    };

    this._checkOutOfTrack = function(){
        //CHECK OUT OF TRACK
        _vLastPos = {x:_aTrack[_iCurFrame].x,y:_aTrack[_iCurFrame].y};

        if(_iSpeed > _aTrack[_iCurFrame].max_speed){
            return true;
        }
        
        return false;
    };
    
    this.forecastOutOfTrack = function(iDirtyAIValue){
        var iForecastFrame = _iCurFrame + Math.round(_iSpeed * iDirtyAIValue) + 1;
        if(iForecastFrame > _aTrack.length-1){
            iForecastFrame = iForecastFrame - _aTrack.length; 
        }

        if( (_iSpeed+ACCELLERATION_STEP) > _aTrack[iForecastFrame].max_speed){
            AI_COUNTER_UPDATE = 3 + Math.floor(Math.random() * 3);
            return true;
        }
        
        return false;
    };

    this.resetPos = function(){
        _iCurFrame = 0;
    };

    this.setPos = function(iIndex){
        _iCurFrame = iIndex;

        _oSprite.x = _aTrack[_iCurFrame].x;
        _oSprite.y = _aTrack[_iCurFrame].y;

        if(this._checkOutOfTrack()){
            this.outOfTrack();
        }else{
            _oSprite.rotation = _aTrack[_iCurFrame].degrees;
        }
        
        _oCarRectangle.move(_oSprite.x,_oSprite.y,_oSprite.rotation);
        
        _aHistoryTrack.push({frame:_iCurFrame,track:_iCurTrackRail});
        
    };
    
    this.increasePos = function(){

        if(_bDisabled || _iSpeed === 0){
            return;
        }

        var iIndex = _iCurFrame + Math.round(_iSpeed);
       
        if(iIndex > (_aTrack.length-1) ){
            var oRet = s_oGame.swapTrackRail(_iIndex,_iCurTrackRail);
            
            _aTrack = oRet.track;
            _iCurTrackRail = oRet.rail_index;
            iIndex -= _aTrack.length;
            
            _iCurTime = 0;
        }
        

        if(!_bAccellerate){
            _iSpeed *= DECELLERATION_STEP;
        }

        if (_iSpeed > MAX_SPEED) {
            _iSpeed = MAX_SPEED;
        }
         
        if ( Math.abs(_iSpeed) < 0.1 ) {
                _iSpeed = 0;
        }
        this.setPos(iIndex);
    };
    
    this.decreasePosAfterCollision = function(){
        if(_aHistoryTrack.length === 0){
            return false;
        }
       
        var aTmp = _aHistoryTrack.splice(-10,10);
        var oHistoryInfo = aTmp[0];
        _iCurFrame = oHistoryInfo.frame;
        
        //CHECK IF DECREASING THE CAR CHANGED THE TRACK
        if(_iCurTrackRail !== oHistoryInfo.track){
            s_oGame.decreaseLap(_iIndex);
        }
        
        _iCurTrackRail = oHistoryInfo.track;
        
        _aTrack = s_oGame.getTrack(_iCurTrackRail);

        _vLastPos = {x:_aTrack[_iCurFrame].x,y:_aTrack[_iCurFrame].y};
        _iLastRotation = _aTrack[_iCurFrame].degrees;

        _oCarRectangle.move(_vLastPos.x,_vLastPos.y,_aTrack[_iCurFrame].degrees);  
        
        return true;
    };
    
    this.outOfTrack = function(){
        _bDisabled = true;
        stopSound("engine");

        var iPrevFrame = _iCurFrame-1;
        if(_iCurFrame === 0){
            iPrevFrame = _aTrack.length-1;
            s_oGame.decreaseLap(_iIndex);
        }
        
        //CALCULATE BACKCOUNTRY DIRECTION
        var vDir = new CVector2( -1 *  (_aTrack[iPrevFrame].x  - _aTrack[_iCurFrame].x), - 1 * (_aTrack[iPrevFrame].y - _aTrack[_iCurFrame].y));
	vDir.normalize();

        var iX = vDir.getX() * OUT_OF_TRACK_DIST;
        var iY = vDir.getY() * OUT_OF_TRACK_DIST;

        if(_vLastPos === null){
            _vLastPos = {x:_oSprite.x,y:_oSprite.y};
            _iLastRotation = _oSprite.rotation;
            //trace("LAST POS "+_vLastPos.x+" "+_vLastPos.y)
        }else {
            _iLastRotation = _aTrack[_iCurFrame].degrees;
        }

        _oTween = createjs.Tween.get(_oSprite).to({x:_oSprite.x+iX,y:_oSprite.y+iY,rotation:_oSprite.rotation + 45 } , 1000,createjs.Ease.cubicOut).call(function(){_oThis.restoreCarInTrack();});
    };
    
    this.restoreCarInTrack = function(){
        _iSpeed = 0;
        _oCarRectangle.move(_vLastPos.x,_vLastPos.y,_iLastRotation);
        _oTween = createjs.Tween.get(_oSprite).to({x:_vLastPos.x,y:_vLastPos.y,rotation:_iLastRotation} , 400,createjs.Ease.cubicOut).call(function(){_bDisabled = false;});
    };
    
    this.checkBestTime = function(){
        if(_iBestLap === 0 || _iCurTime < _iBestLap){
            _iBestLap = _iCurTime;
        }

        return _iBestLap;
    };

    this.pause = function(bPause){
        if(_oTween){
            _oTween.paused = bPause;
        }
        
       stopSound("engine");
    };
    
    this.updateTime = function(){
        _iCurTime += s_iTimeElaps;
        _iTotTime += s_iTimeElaps;
    };
    
    this.getFotogram = function(){
        return _iCurFrame;
    };
    
    this.getSprite = function(){
        return _oSprite;
    };
    
    this.getIndex = function(){
        return _iIndex;
    };
    
    this.getX = function(){
        return _oSprite.x;
    };
    
    this.getY = function(){
        return _oSprite.y;
    };
    
    this.getPos = function(){
        return {x:_oSprite.x,y:_oSprite.y};
    };
    
    this.getCurFrame = function(){
        return _iCurFrame;
    };
    
    this.isDisabled = function(){
        return _bDisabled;
    };
    
    this.getSpeed = function(){
        return _iSpeed;
    };
    
    this.getRectCollision = function(){
        return _oCarRectangle;
    };
    
    this.getBox = function(){
        return _oCarRectangle.getBox();
    };

    this.getObstVector = function(){
        return _oCarVector;
    };
    
    this.isAccelerating = function(){
        return _bAccellerate;
    };
    
    this.getTotTime = function(){
        return _iTotTime;
    };
    
    this.getBestLap = function(){
        return _iBestLap;
    };
    
    this.getType = function(){
        return _iTypeSprite;
    };
    
    this.getTrackRail = function(){
        return _iCurTrackRail;
    };
    
    this._init(iIndex,iType,aTrackPoints);
}