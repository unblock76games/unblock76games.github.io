function CCrowd(){
    
    var _oCrowdSprite = new Array();
    var _iSprite = 0;
    var _iTimeElapsed = 0;
    
    this._init = function(){
        for(var i=0; i< NUM_CROWD; i++){
            _oCrowdSprite.push(createBitmap(s_oSpriteLibrary.getSprite("supporters_"+i)));
            _oCrowdSprite[i].x = 0;
            _oCrowdSprite[i].y = 90;
            _oCrowdSprite[i].visible = false;
            s_oStage.addChild(_oCrowdSprite[i]);
        }
        _oCrowdSprite[0].visible = true;
    };
    
    this.exult = function(){
        _oCrowdSprite[_iSprite].visible = false;
        _iSprite++;        
        _oCrowdSprite[_iSprite].visible = true;
    };
    
    this.showAnim = function(){
        _iTimeElapsed += s_iTimeElaps;
        if(_iTimeElapsed>=30){
            this.exult();
            if(_iSprite === NUM_CROWD-1){
                _oCrowdSprite[_iSprite].visible = false;
                _iSprite = 0;
                _oCrowdSprite[_iSprite].visible = true;
                s_oGame.setCrowdOff();
            }
            _iTimeElapsed = 0;
        }
        
    };
    
    s_oPlayer = this;
    
    this._init();
    
}
s_oPlayer = null;