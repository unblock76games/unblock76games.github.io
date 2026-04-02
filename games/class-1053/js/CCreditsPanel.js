function CCreditsPanel(){
    
    var _oBg;
    var _oButExit;
    var _oMsgText;
    
    var _oFade;
    var _oHitArea;
    
    var _oLink;
    
    var _pStartPosExit;
    
    this._init = function(){
        
        _oBgMenu = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBgMenu);

        _oHitArea = createBitmap(s_oSpriteLibrary.getSprite('hit_area'));
        _oHitArea.on("click", this._onLogoButRelease);
        s_oStage.addChild(_oHitArea);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
		_pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10};     
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);
        
        _oMsgText = new createjs.BitmapText(TEXT_CREDITS_DEVELOPED, s_oSpriteSheetBoxing);
        _oMsgText.regX  = _oMsgText.getBounds().width/2;
        _oMsgText.regY  = _oMsgText.getBounds().height/2;
        _oMsgText.x = CANVAS_WIDTH/2 ;
        _oMsgText.y = 510;
        s_oStage.addChild(_oMsgText);
		
        oSprite = s_oSpriteLibrary.getSprite('logo_credits');
        _oLogo = createBitmap(oSprite);
        _oLogo.regX = oSprite.width/2;
        _oLogo.regY = oSprite.height/2;
        _oLogo.x = CANVAS_WIDTH/2;
        _oLogo.y = 540;
        s_oStage.addChild(_oLogo);
        
        _oLink = new createjs.BitmapText("www.codethislab.com", s_oSpriteSheetBoxing);
        _oLink.regX  = _oLink.getBounds().width/2;
        _oLink.regY  = _oLink.getBounds().height/2;
        _oLink.x = CANVAS_WIDTH/2 ;
        _oLink.y = 630;
		_oLink.scaleX = _oLink.scaleY = 0.8;
        s_oStage.addChild(_oLink);
		
		this.refreshButtonPos(s_iOffsetX,s_iOffsetY);      
    };
    
    this.unload = function(){
        _oHitArea.off("click", this._onLogoButRelease);
        
        _oButExit.unload(); 
        _oButExit = null;
		
		s_oStage.removeChild(_oBgMenu);
		s_oStage.removeChild(_oHitArea);
		s_oStage.removeChild(_oMsgText);
		s_oStage.removeChild(_oLogo);
		s_oStage.removeChild(_oLink);
		
		s_oCreditsPanel = null;
    };
	
	this.refreshButtonPos = function(iNewX,iNewY){
        _oButExit.setPosition(_pStartPosExit.x-iNewX,_pStartPosExit.y + iNewY);
    };
    
    this._onLogoButRelease = function(){
        window.open("http://www.codethislab.com/index.php?&l=en");
    };
    
	s_oCreditsPanel = this;
	
    this._init();
};

var s_oCreditsPanel = null;


