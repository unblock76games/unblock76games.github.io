function CTideController(){
        
    var _iTimeGeneration;
    
    var _aTideInfo;
    
    this._init = function(){
        
        _iTimeGeneration = 0;
        
        _aTideInfo = new Array();
    };
    
    this.flattenTide = function(iIndex){       
        for(var i=_aTideInfo.length-1; i>=0; i--){
            s_oRoad.setTide(_aTideInfo[i].pos, _aTideInfo[i].dim, 0);
            _aTideInfo.splice(i,1);
        };    
        
    };  
    
    this._generateTide = function(){
        var iMaxHeight = randomFloatBetween(TIDE_VARIABLE_HEIGHT[0],TIDE_VARIABLE_HEIGHT[1]);
        _aTideInfo.push({pos: s_oGame.getPlayer().getPosition().z + 50000, dim: 16, maxheight: iMaxHeight, curheight: 0, speed: TIDE_SPEED});
    };
    
    this.moveTide = function(iIndex){
        _aTideInfo[iIndex].pos -= _aTideInfo[iIndex].speed;

        s_oRoad.setTide(_aTideInfo[iIndex].pos, _aTideInfo[iIndex].dim, _aTideInfo[iIndex].curheight);
        
        _aTideInfo[iIndex].curheight += TIDE_RAISE_HEIGHT_SPEED;
        if(_aTideInfo[iIndex].curheight > _aTideInfo[iIndex].maxheight){
            _aTideInfo[iIndex].curheight = _aTideInfo[iIndex].maxheight;
        }
    };
    
    this.update = function(){
        
        _iTimeGeneration += s_iTimeElaps;
        var iLimit = TIDE_BASE_FREQUENCY -1000*s_oGame.getPlayer().getSpeedRatio() + randomFloatBetween(TIDE_VARIABLE_FREQUENCY[0],TIDE_VARIABLE_FREQUENCY[1]);

        if(_iTimeGeneration > iLimit){
            _iTimeGeneration = 0;
            this._generateTide();
        }
        
        for(var i=0; i<_aTideInfo.length; i++){
            this.moveTide(i);
        };
        
        
        for(var i=_aTideInfo.length-1; i>=0; i--){

            if(_aTideInfo[i].pos < s_oGame.getPlayer().getPosition().z - _aTideInfo[i].dim*SEGMENT_LENGTH){
                s_oRoad.setTide(_aTideInfo[i].pos, _aTideInfo[i].dim, 0);
                _aTideInfo.splice(i,1);
            }
        };        
    };

    this._init();
    
}


