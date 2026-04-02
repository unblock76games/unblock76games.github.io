function CEndPanel(oSpriteBg){
    var _bClicked;
    
    var _oBg;
    var _oGroup;
    
    var _oMsgTextBack;
    var _oMsgText;
    var _oScoreTextBack;
    var _oScoreText;
    var _oFade;
    var _oParent;
    
    this._init = function(oSpriteBg){
        playSound('arrive_win', 1,false);
        
        _bClicked = false;
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oFade.on("mousedown",this._onExit);
        s_oStage.addChild(_oFade);
        
        new createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
        _oBg = createBitmap(oSpriteBg);
        _oBg.x = 0;
        _oBg.y = 0;
        
	_oMsgTextBack = new createjs.Text(""," 60px "+PRIMARY_FONT, "#3e240b");
        _oMsgTextBack.x = CANVAS_WIDTH/2;
        _oMsgTextBack.y = (CANVAS_HEIGHT/2);
        _oMsgTextBack.textAlign = "center";
        _oMsgTextBack.textBaseline = "alphabetic";
        _oMsgTextBack.outline = 8;
        _oMsgTextBack.lineWidth = 500;

        _oMsgText = new createjs.Text(""," 60px "+PRIMARY_FONT, "#ffffff");
        _oMsgText.x = CANVAS_WIDTH/2;
        _oMsgText.y = (CANVAS_HEIGHT/2);
        _oMsgText.textAlign = "center";
        _oMsgText.textBaseline = "alphabetic";
        _oMsgText.lineWidth = 500;
        
        _oScoreTextBack = new createjs.Text(""," 40px "+PRIMARY_FONT, "#000");
        _oScoreTextBack.x = CANVAS_WIDTH/2 +1;
        _oScoreTextBack.y = (CANVAS_HEIGHT/2) + 50;
        _oScoreTextBack.textAlign = "center";
        _oScoreTextBack.textBaseline = "alphabetic";
        _oScoreTextBack.lineWidth = 500;
        
        _oScoreText = new createjs.Text(""," 40px "+PRIMARY_FONT, "#ffffff");
        _oScoreText.x = CANVAS_WIDTH/2;
        _oScoreText.y = (CANVAS_HEIGHT/2) + 52;
        _oScoreText.textAlign = "center";
        _oScoreText.textBaseline = "alphabetic";
        _oScoreText.lineWidth = 500;

        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        
        _oGroup.addChild(_oScoreTextBack,_oScoreText,_oMsgTextBack,_oMsgText);

        s_oStage.addChild(_oGroup);
    };
    
    this.unload = function(){
        _oFade.off("mousedown",this._onExit);
        _oGroup.off("mousedown",this._onExit);
    };
    
    this._initListener = function(){
        _oGroup.on("mousedown",this._onExit);
    };

    
    this.show = function(iLevel, iTime){
	
	playSound("game_over",1,false);
	        
        
        _oMsgTextBack.text = TEXT_GAMEOVER;
        _oMsgText.text = TEXT_GAMEOVER;
        
        _oGroup.visible = true;
        
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {oParent._initListener();});        

    };
    
    this._onExit = function(){
        if(_bClicked){
            return;
        }
        _bClicked = true;
        
        new createjs.Tween.get(_oFade).to({alpha:0},500);
        
        _oParent.unload();
        s_oStage.removeChild(_oGroup);
        s_oGame.onExit();
    };
    
    _oParent = this;
    this._init(oSpriteBg);
    
    return this;
}
