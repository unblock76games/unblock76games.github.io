function CScoreText (iScore,x,y, oParentContainer){
    
    var _oScoreHit;
    
    
    this._init = function(iScore,x,y){

        _oScoreHit = new createjs.Text("00000","bold 30px "+PRIMARY_FONT, "#ffffff");
        _oScoreHit.textAlign="center";
        _oScoreHit.textBaseline = "middle";
        _oScoreHit.text = iScore;
        _oScoreHit.x=x;
        _oScoreHit.y=y;
        _oScoreHit.alpha = 0;
        _oScoreHit.shadow = new createjs.Shadow("#3e240b", 2, 2, 2);
        oParentContainer.addChild(_oScoreHit);
        
        var oParent = this;
        createjs.Tween.get(_oScoreHit).to({alpha:1}, 400, createjs.Ease.quadIn).call(function(){oParent.moveUp();});  
    };
	
    this.moveUp = function(){
        var iNewY = _oScoreHit.y-100;
        var oParent = this;
        createjs.Tween.get(_oScoreHit).to({alpha:0}, 1000);
        createjs.Tween.get(_oScoreHit).to({y:iNewY}, 1000, createjs.Ease.sineIn).call(function(){oParent.unload()});
        
    };
	
	this.unload = function(){
		oParentContainer.removeChild(_oScoreHit);
    };
	
    this._init(iScore,x,y);
    
}