function CInterface(oSpriteSheet){
    var NEXT1_POS = {x:CANVAS_WIDTH - 100,y:260+(GRID_SIZE*2)};
    var NEXT2_POS = {x:CANVAS_WIDTH - 100,y:260+GRID_SIZE};
    var NEXT3_POS = {x:CANVAS_WIDTH - 100,y:260};
    
    
    var _pStartPosLeft  = {x:EDGEBOARD_X + 60,y:CANVAS_HEIGHT-60};
    var _pStartPosRight = {x:EDGEBOARD_X + 700,y:CANVAS_HEIGHT-60};
    var _pStartPosDown  = {x:EDGEBOARD_X + 580,y:CANVAS_HEIGHT-60};
    var _pStartPosUp    = {x:EDGEBOARD_X + 180,y:CANVAS_HEIGHT-60};
    
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosScore;
    var _pStartPosNext;
    
    var _oNext1;
    var _oNext2;
    var _oNext3;
    
    var _oButExit;
    var _oButLeft;
    var _oButRight;
    var _oButUp;
    var _oButDown;
    var _oAudioToggle;
    var _oScoreTextBack;
    var _oScoreText;
    var _oNextText;
    var _oNextBackText;
    var _oEndPanel;
    
    this._init = function(oSpriteSheet){
        _oNext1 = createSprite(oSpriteSheet, "invisible",0,0,GRID_SIZE,GRID_SIZE);
        _oNext1.stop();
        _oNext1.x = NEXT1_POS.x;
        _oNext1.y = NEXT1_POS.y;
        
        _oNext2 = createSprite(oSpriteSheet, "invisible",0,0,GRID_SIZE,GRID_SIZE);
        _oNext2.stop();
        _oNext2.x = NEXT2_POS.x;
        _oNext2.y = NEXT2_POS.y;
        
        _oNext3 = createSprite(oSpriteSheet, "invisible",0,0,GRID_SIZE,GRID_SIZE);
        _oNext3.stop();
        _oNext3.x = NEXT3_POS.x;
        _oNext3.y = NEXT3_POS.y;
        
        s_oStage.addChild(_oNext1);
        s_oStage.addChild(_oNext2);
        s_oStage.addChild(_oNext3);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_left');
        _oButLeft = new CGfxButton(_pStartPosLeft.x,_pStartPosLeft.y,oSprite,true);
        _oButLeft.addEventListener(ON_MOUSE_DOWN, this._onReleaseLeft, this);
        
        oSprite = s_oSpriteLibrary.getSprite('but_right');
        _oButRight = new CGfxButton(_pStartPosRight.x,_pStartPosRight.y,oSprite,true);
        _oButRight.addEventListener(ON_MOUSE_DOWN, this._onReleaseRight, this);
        
        oSprite = s_oSpriteLibrary.getSprite('but_down');
        _oButDown = new CGfxButton(_pStartPosDown.x,_pStartPosDown.y,oSprite,true);
        _oButDown.addEventListener(ON_MOUSE_DOWN, this._onReleaseButDown, this);
        
        oSprite = s_oSpriteLibrary.getSprite('but_up');
        _oButUp = new CGfxButton(_pStartPosUp.x,_pStartPosUp.y,oSprite,true);
        _oButUp.addEventListener(ON_MOUSE_DOWN, this._onReleaseButUp, this);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x:CANVAS_WIDTH - (oSprite.width/2) - 10,y:10+ (oSprite.height/2)};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y,oSprite,true);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: 180}; 
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
        
        _pStartPosScore = {x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT - 72};
	_oScoreTextBack = new createjs.Text("0 PT","40px "+PRIMARY_FONT, "#000000");
        _oScoreTextBack.textAlign = "center";
        _oScoreTextBack.x =  _pStartPosScore.x + 2;
        _oScoreTextBack.y = _pStartPosScore.y +2;
        s_oStage.addChild(_oScoreTextBack);
		
        _oScoreText = new createjs.Text("0 PT","40px "+PRIMARY_FONT, "#ffffff");
        _oScoreText.textAlign = "center";
        _oScoreText.x = _pStartPosScore.x;
        _oScoreText.y = _pStartPosScore.y;
        s_oStage.addChild(_oScoreText);
        
        _pStartPosNext = {x:CANVAS_WIDTH - 110,y:470};
        _oNextBackText = new createjs.Text(TEXT_NEXT,"32px "+PRIMARY_FONT, "#000000");
        _oNextBackText.x = _pStartPosNext.x + 2;
        _oNextBackText.y = _pStartPosNext.y + 2;
        s_oStage.addChild(_oNextBackText);
        
        _oNextText = new createjs.Text(TEXT_NEXT,"32px "+PRIMARY_FONT, "#ffffff");
        _oNextText.x = _pStartPosNext.x;
        _oNextText.y = _pStartPosNext.y;
        s_oStage.addChild(_oNextText);
        
        _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButExit.setPosition(_pStartPosExit.x - iNewX,_pStartPosExit.y + iNewY);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        
        _oButLeft.setPosition(_pStartPosLeft.x,_pStartPosLeft.y - iNewY);
        _oButRight.setPosition(_pStartPosRight.x,_pStartPosRight.y- iNewY);
        _oButDown.setPosition(_pStartPosDown.x,_pStartPosDown.y- iNewY);
        _oButUp.setPosition(_pStartPosUp.x,_pStartPosUp.y- iNewY);
        
        _oNext1.x = NEXT1_POS.x - iNewX;
        _oNext1.y = NEXT1_POS.y + iNewY;
        _oNext2.x = NEXT2_POS.x - iNewX;
        _oNext2.y = NEXT2_POS.y + iNewY;
        _oNext3.x = NEXT3_POS.x - iNewX;
        _oNext3.y = NEXT3_POS.y + iNewY;
        
        _oNextText.x = _pStartPosNext.x - iNewX;
        _oNextText.y = _pStartPosNext.y + iNewY;
        _oNextBackText.x = _pStartPosNext.x - iNewX;
        _oNextBackText.y = _pStartPosNext.y + iNewY + 2;
        
        _oScoreText.y = _pStartPosScore.y - iNewY;
        _oScoreTextBack.y = _pStartPosScore.y - iNewY;
    };
    
    this.unload = function(){
        _oButExit.unload();
        _oButExit = null;
        
        _oButLeft.unload();
        _oButLeft = null;
        
        _oButRight.unload();
        _oButRight = null;
		
        _oButDown.unload();
        _oButDown = null;

        _oButUp.unload();
        _oButUp = null;
        
        if(_oAudioToggle){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        s_oStage.removeChild(_oScoreText);
        s_oStage.removeChild(_oScoreTextBack);
        s_oStage.removeChild(_oNextBackText);
        s_oStage.removeChild(_oNextText);

        s_oStage.removeChild(_oNext1);
        s_oStage.removeChild(_oNext2);
        s_oStage.removeChild(_oNext3);
    };
    
    this.setNextBlock = function(iNext1,iNext2,iNext3){
        _oNext1.gotoAndStop("block_"+iNext1);
        _oNext2.gotoAndStop("block_"+iNext2);
        _oNext3.gotoAndStop("block_"+iNext3);
    };
    
    this.refreshScore = function(iScore){
      _oScoreText.text = iScore+ " PT";  
	  _oScoreTextBack.text = iScore+ " PT";
    };
    
    this.gameOver = function(iScore){
        _oEndPanel.show(iScore);
    };
    
    this._onReleaseLeft = function(){
        s_oGame.shiftLeft();
    };
    
    this._onReleaseRight = function(){
        s_oGame.shiftRight();
    };
    
    this._onReleaseButDown = function(){ 
       s_oGame.pressButDown(); 
    };
    
    this._onReleaseButUp = function(){
       s_oGame.releaseButUp();  
        
    };
    
    this._onAudioToggle = function(){
        createjs.Sound.setMute(!s_bAudioActive);
    };
    
    this._onExit = function(){
      s_oGame.onExit();  
    };
    
    s_oInterface = this;
    
    this._init(oSpriteSheet);
    
    return this;
}

var s_oInterface = null;