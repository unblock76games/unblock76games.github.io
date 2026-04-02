function CRaceOverPanel(){
    var _aTrack;
    var _aMiddleText;
    var _aMiddleTextOutline;
    var _oListener;
    
    var _oButHome;
    var _oButTrack;
    var _oButRestart;
    var _oButContinue;
    var _oTextTitle;
    var _oFade;
    var _oContainer;
    
    var _oThis = this;
    
    this._init = function(){
        _aMiddleText = new Array();
        _aMiddleTextOutline = new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        _oContainer.x = CANVAS_WIDTH/2;
        _oContainer.y = CANVAS_HEIGHT/2;  
        s_oStage.addChild(_oContainer);
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(-CANVAS_WIDTH/2,-CANVAS_HEIGHT/2,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oListener = _oFade.on("click",function(){});
        _oContainer.addChild(_oFade);
        
        var oSprite = s_oSpriteLibrary.getSprite("msg_box_big");
        var oBg = createBitmap(oSprite);
        oBg.regX = oSprite.width/2;
        oBg.regY = oSprite.height/2;
        _oContainer.addChild(oBg);
        
        _aTrack = new Array();
        for(var i=0;i<NUM_LEVELS;i++){
            var oSprite = s_oSpriteLibrary.getSprite("track_shape_"+(i+1));
            var oTrack = createBitmap(oSprite);
            oTrack.visible = false;
            oTrack.regX = oSprite.width/2;
            oTrack.regY = oSprite.height/2;
            _oContainer.addChild(oTrack);
            
            _aTrack[i] = oTrack;
        }
        
        _oButHome = new CGfxButton( -180,130,s_oSpriteLibrary.getSprite("but_home"),_oContainer);
        _oButHome.addEventListener(ON_MOUSE_UP,this._onHome,this);
        
        _oButTrack = new CGfxButton(0,130,s_oSpriteLibrary.getSprite("but_track"),_oContainer);
        _oButTrack.addEventListener(ON_MOUSE_UP,this._onTrack,this);
        
        _oButRestart = new CGfxButton(180,130,s_oSpriteLibrary.getSprite("but_restart"),_oContainer);
        _oButRestart.addEventListener(ON_MOUSE_UP,this._onRestart,this);
        
        _oButContinue = new CGfxButton(180,130,s_oSpriteLibrary.getSprite("but_continue"),_oContainer);
        _oButContinue.addEventListener(ON_MOUSE_UP,this._onContinue,this);
        
        _oTextTitle = new createjs.Text("","40px "+FONT_GAME, "#fff");
        _oTextTitle.x = 0;
        _oTextTitle.y = -136;
        _oTextTitle.textAlign = "center";
        _oTextTitle.textBaseline = "alphabetic";
        _oContainer.addChild(_oTextTitle);
        
        
    };
    
    this.unload = function(){
        _oButHome.unload();
        _oButRestart.unload();
        _oButTrack.unload();
        _oFade.off("click",_oListener);
    };
    
    this.show = function(szTitle,iTrack,aButs,oParams){
        for(var i=0;i<_aMiddleText.length;i++){
            _oContainer.removeChild(_aMiddleText[i]);
        }
        
        for(var i=0;i<_aMiddleTextOutline.length;i++){
            _oContainer.removeChild(_aMiddleTextOutline[i]);
        }
        
        _oTextTitle.text = szTitle;
        _aTrack[iTrack-1].visible = true;
        
        _oButHome.setVisible(aButs[0]);
        _oButTrack.setVisible(aButs[1]);
        _oButRestart.setVisible(aButs[2]);
        _oButContinue.setVisible(false);
        _oButRestart.setPosition(180,130);
        
        this._setMiddleText(oParams);
        
        _oContainer.alpha = 0;
        _oContainer.visible = true;
        createjs.Tween.get(_oContainer).to({alpha:1},500);
    };
    
    this.hide = function(){
        createjs.Tween.get(_oContainer).to({alpha:0} , 500,createjs.Ease.cubicOut).call(function(){
                                                                                            _oThis.reset();
                                                                                            _oContainer.visible = false;});
    };
    
    this.reset = function(){
        for(var i=0;i<_aTrack.length;i++){
            _aTrack[i].visible = false;
        }
        
        for(var j=0;j<_aMiddleText.length;j++){
            _oContainer.removeChild(_aMiddleText[i]);
        }
        
        for(var j=0;j<_aMiddleTextOutline.length;j++){
            _oContainer.removeChild(_aMiddleTextOutline[i]);
        }
    };
    
    this._setMiddleText = function(oParams){
        _aMiddleText = new Array();
        _aMiddleTextOutline = new Array();
        
        _oTextTitle.font = "40px "+FONT_GAME;
        if(s_bSingleMode && s_bQuickRace === false){
            if(_oTextTitle.text === TEXT_CONGRATS){
                _oTextTitle.font = "30px "+FONT_GAME;
                this._setTextRow(TEXT_FINAL_SCORE+"\n"+oParams.score,30,"#fff",{x:0,y:0},"center");
            }else{
                this._setTextRow(TEXT_BEST_TIME+" "+formatTime(oParams.best),20,"#fff",{x:0,y:-50},"center");
                this._setTextRow(TEXT_TIME+" "+formatTime(oParams.time),20,"#fff",{x:0,y:0},"center");
                this._setTextRow(TEXT_SCORE+" "+oParams.score,20,"#fff",{x:0,y:50},"center");
                
                if(_oTextTitle.text !== TEXT_YOU_LOSE){
                    _oButTrack.setVisible(false);
                    _oButRestart.setPosition(0,130);
                    _oButContinue.setVisible(true);
                }
            } 

            $(s_oMain).trigger("save_score",oParams.score);
        }else{
            this._setTextRow(TEXT_BEST_TIME+" "+formatTime(oParams.best),20,"#fff",{x:0,y:-25},"center");
            this._setTextRow(TEXT_TIME+" "+formatTime(oParams.time),20,"#fff",{x:0,y:25},"center");
        }
    };
    
    this._setTextRow = function(szText,iSize,szColor,pPos,szAlign){
        var oTextOutline = new createjs.Text(szText,iSize+"px "+FONT_GAME, "#000");
        oTextOutline.x = pPos.x;
        oTextOutline.y = pPos.y;
        oTextOutline.textAlign = szAlign;
        oTextOutline.textBaseline = "alphabetic";
        oTextOutline.outline = 4;
        _oContainer.addChild(oTextOutline);
        
        _aMiddleTextOutline.push(oTextOutline);
        
        var oText = new createjs.Text(szText,iSize+"px "+FONT_GAME, szColor);
        oText.x = pPos.x;
        oText.y = pPos.y;
        oText.textAlign = szAlign;
        oText.textBaseline = "alphabetic";
        _oContainer.addChild(oText);
        
        _aMiddleText.push(oText);
    };
    
    this._onHome = function(){
        s_oGame.onExit();
    };
    
    this._onTrack = function(){
        s_oGame.unload();
        s_oMain.gotoLevelMenu();
        
        $(s_oMain).trigger("show_interlevel_ad");
    };
    
    this._onRestart = function(){
        _oThis.hide();
        s_oGame.restart();
        
        $(s_oMain).trigger("show_interlevel_ad");
    };
    
    this._onContinue = function(){
        _oThis.hide();
        s_oGame.nextLevel();
        
        $(s_oMain).trigger("show_interlevel_ad");
    };
    
    this._init();
}