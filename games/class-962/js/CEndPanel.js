function CEndPanel(oSpriteBg, oSpriteText){
    
    var _oBg;
    var _oGroup;
    var _oButRestart;
    var _oButRestartPos;
    
    var _oSprite;
    var _oScoreText;
    var _oScoreTextStroke;
    
    this._init = function(oSpriteBg, oSpriteText){
        
        _oBg = createBitmap(oSpriteBg);
        
        _oSprite = createBitmap(oSpriteText);
        _oSprite.x = CANVAS_WIDTH/2-400;
        _oSprite.y = CANVAS_HEIGHT/2-200;
        
        _oScoreTextStroke = new createjs.Text(""," 50px "+FONT_GAME, "#000000");
        _oScoreTextStroke.x = CANVAS_WIDTH/2;
        _oScoreTextStroke.y = (CANVAS_HEIGHT/2);
        _oScoreTextStroke.textAlign = "center";
        _oScoreTextStroke.textBaseline = "alphabetic";
        _oScoreTextStroke.lineWidth = 650;
        _oScoreTextStroke.outline = 3;
        
        _oScoreText = new createjs.Text(""," 50px "+FONT_GAME, "#ffe51f");
        _oScoreText.x = CANVAS_WIDTH/2;
        _oScoreText.y = (CANVAS_HEIGHT/2);
        _oScoreText.textAlign = "center";
        _oScoreText.textBaseline = "alphabetic";
        _oScoreText.lineWidth = 500;
        
        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        
        _oGroup.addChild(_oBg, _oScoreTextStroke, _oScoreText, _oSprite);
        
        s_oStage.addChild(_oGroup);
        var oSprite = s_oSpriteLibrary.getSprite('but_restart');
        _oButRestartPos = {x: (CANVAS_WIDTH/2+300), y: CANVAS_HEIGHT-130};
        _oButRestart = new CGfxButton(_oButRestartPos.x, _oButRestartPos.y, oSprite);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
        
    this.show = function(iScore){
	
	playSound("game_over",1,false);
	
        
        _oScoreTextStroke.text = TEXT_SCORE + iScore;
        _oScoreText.text = TEXT_SCORE + iScore;
        
        _oGroup.visible = true;
        
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {});
        
        $(s_oMain).trigger("share_event",iScore);
        $(s_oMain).trigger("save_score",[iScore]);
    };
    
    this.win = function(iScore){
	playSound("applause",1,false);
        
        _oScoreTextStroke.text = TEXT_SCORE + iScore;
        _oScoreTextStroke.x = CANVAS_WIDTH/2-150;
        _oScoreTextStroke.y = (CANVAS_HEIGHT/2)+120;
        _oScoreTextStroke.rotation = 17;
        _oScoreText.text = TEXT_SCORE + iScore;
        _oScoreText.x = CANVAS_WIDTH/2-150;
        _oScoreText.y = (CANVAS_HEIGHT/2)+120;
        _oScoreText.rotation = 17;
        
        _oGroup.visible = true;
        
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {});
        
        
        $(s_oMain).trigger("share_event",iScore);
        $(s_oMain).trigger("save_score",[iScore]);
    };
    
    this._onExit = function(){
        s_oStage.removeChild(_oGroup);
        _oButRestart.unload();
        
        s_oGame.onExit();
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButRestart.setPosition(_oButRestartPos.x,_oButRestartPos.y - iNewY);
    };
    
    this._init(oSpriteBg, oSpriteText);
    
    return this;
}
