function CLevelMenu(){
    var _iCurPage;
    var _iHeightToggle;
    var _aLevelButs;
    var _aPointsX;
    var _aContainerPage;
    var _pStartPosSelect;
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    
    var _oButExit;
    var _oAudioToggle;
    var _oArrowRight = null;
    var _oArrowLeft = null;
    var _oTextLevel;
    var _oContainer;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    this._init = function(){
        if(s_bStorageAvailable){
            var szFlag = getItem("slotcar_level_diff_"+s_iDifficulty);
            if(szFlag !== null && szFlag !== undefined){
                s_iLastLevel = parseInt(getItem("slotcar_level_diff_"+s_iDifficulty));
            }else{
                saveItem("slotcar_level_diff_"+s_iDifficulty, 1);
                s_iLastLevel = 1;
            }
        }
        
            
        _iCurPage = 0;
        
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu_level'));
	_oContainer.addChild(oBg);
        
        _pStartPosSelect = {x:CANVAS_WIDTH/2,y:100};
        _oTextLevel = new createjs.Text(TEXT_SELECT_LEVEL ,"40px "+FONT_GAME, "#fff");
        _oTextLevel.x = _pStartPosSelect.x;
        _oTextLevel.y = _pStartPosSelect.y;
        _oTextLevel.textAlign = "center";
        s_oStage.addChild(_oTextLevel);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
	_pStartPosExit = {x:CANVAS_WIDTH - (oSprite.width/2)-10,y:(oSprite.height/2)+10};
        _oButExit = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        _iHeightToggle = oSprite.height;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x:_pStartPosExit.x - oSprite.width/2 - 10,y:_pStartPosExit.y }
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x: oSprite.width/4 + 10,y:_pStartPosExit.y};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        this._checkBoundLimits();
        
        //FIND X COORDINATES FOR LEVEL BUTS
        _aPointsX = new Array();
        var iWidth = CANVAS_WIDTH - (EDGEBOARD_X*2) ;
        var iOffsetX = Math.floor(iWidth/NUM_COLS_PAGE_LEVEL)/2;
        var iXPos = 0;
        for(var i=0;i<NUM_COLS_PAGE_LEVEL;i++){
            _aPointsX.push(iXPos);
            iXPos += iOffsetX*2;
        }
        
        _aContainerPage = new Array();
        this._createNewLevelPage(0,NUM_LEVELS);
        
        if(_aContainerPage.length > 1){
            //MULTIPLE PAGES
            for(var k=1;k<_aContainerPage.length;k++){
                _aContainerPage[k].visible = false;
            }

            _oArrowRight = new CGfxButton(CANVAS_WIDTH/2 + 280,CANVAS_HEIGHT - 80,s_oSpriteLibrary.getSprite('arrow_right'),s_oStage);
            _oArrowRight.addEventListener(ON_MOUSE_UP, this._onRight, this);
            
            _oArrowLeft = new CGfxButton(CANVAS_WIDTH/2 - 280,CANVAS_HEIGHT - 80,s_oSpriteLibrary.getSprite('arrow_left'),s_oStage);
            _oArrowLeft.addEventListener(ON_MOUSE_UP, this._onLeft, this);
        }
        
        this.refreshButtonPos();	
    };
    
    this.unload = function(){
        for(var i=0;i<_aLevelButs.length;i++){
            _aLevelButs[i].unload();
        }  
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        
        if(_oArrowLeft !== null){
            _oArrowLeft.unload();
            _oArrowRight.unload();
        }
        
        s_oStage.removeAllChildren();
        s_oLevelMenu = null;
    };
    
    this.refreshButtonPos = function(){
        //_oTextLevel.y = _pStartPosSelect.y + s_iOffsetY;
        _oButExit.setPosition(_pStartPosExit.x - s_iOffsetX,_pStartPosExit.y + s_iOffsetY);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
    };
    
    this._checkBoundLimits = function(){
        var oSprite = s_oSpriteLibrary.getSprite('but_track_1');
        var iY = 0;
        
        var iHeightBound = CANVAS_HEIGHT - (EDGEBOARD_Y*2) - (_iHeightToggle * 2);
        var iNumRows = 0;

        while(iY < iHeightBound){
            iY += oSprite.height + 20;
            iNumRows++;
        }

        if(NUM_ROWS_PAGE_LEVEL > iNumRows){
            NUM_ROWS_PAGE_LEVEL = iNumRows;
        }
        
        
        var iNumCols = 0;
        var iX = 0;
        var iWidthBounds = CANVAS_WIDTH - (EDGEBOARD_X*2);
        var oSprite = s_oSpriteLibrary.getSprite('but_track_1'); 

        while(iX < iWidthBounds){
            iX += (oSprite.width/2) + 5;
            iNumCols++;  
        }
        if(NUM_COLS_PAGE_LEVEL > iNumCols){
            NUM_COLS_PAGE_LEVEL = iNumCols;
        }
    };
    
    this._createNewLevelPage = function(iStartLevel,iEndLevel){
        var oContainerLevelBut = new createjs.Container();
        _oContainer.addChild(oContainerLevelBut);
        _aContainerPage.push(oContainerLevelBut);
        
        _aLevelButs = new Array();
        var iCont = 0;
        var iY = 0;
        var iNumRow = 1;
        var bNewPage = false;

        for(var i=iStartLevel;i<iEndLevel;i++){
            var bActive = true;
            if(!s_bQuickRace && s_bSingleMode){
                bActive = (i+1)>s_iLastLevel?false:true;
            }
            
            var oSprite = s_oSpriteLibrary.getSprite('but_track_'+(i+1));
            var szTime = "00:00";
            if(getItem("slotcar_time_level_" + (i+1)) !== null){
                szTime = formatTime(getItem("slotcar_time_level_" + (i+1)) );
            }
            
            var oBut = new CLevelBut(_aPointsX[iCont] + oSprite.width/4, iY + oSprite.height/2,szTime,oSprite, bActive,oContainerLevelBut);
            oBut.addEventListenerWithParams(ON_MOUSE_UP, this._onButLevelRelease, this,i);
            _aLevelButs.push(oBut);
            
            iCont++;
            if(iCont === _aPointsX.length){
                iCont = 0;
                iY += oSprite.height + 20;
                iNumRow++;
                if(iNumRow > NUM_ROWS_PAGE_LEVEL && i<iEndLevel-1){
                    bNewPage = true;
                    break;
                }
            }
        }
        
        oContainerLevelBut.x = CANVAS_WIDTH/2 ;
        oContainerLevelBut.y = CANVAS_HEIGHT/2 + 60;
        oContainerLevelBut.regX = oContainerLevelBut.getBounds().width/2;
        oContainerLevelBut.regY = oContainerLevelBut.getBounds().height/2;
        
        if(bNewPage){
            //ADD A PAGE
            this._createNewLevelPage(i+1,iEndLevel);
        }
        
    };
    
    this._onRight = function(){
        _aContainerPage[_iCurPage].visible = false;
        
        _iCurPage++;
        if(_iCurPage >=  _aContainerPage.length){
            _iCurPage = 0;
        }
        
        _aContainerPage[_iCurPage].visible = true;
    };
    
    this._onLeft = function(){
        _aContainerPage[_iCurPage].visible = false;
        
        _iCurPage--;
        if(_iCurPage <  0){
            _iCurPage =_aContainerPage.length-1;
        }
        
        _aContainerPage[_iCurPage].visible = true;
    };
    
    this._onButLevelRelease = function(iLevel){
        s_oMain.levelSelected(iLevel+1);
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
	s_bAudioActive = !s_bAudioActive;
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.enabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    this._onExit = function(){
        s_oLevelMenu.unload();
        s_oMain.gotoMenu();
    };

    s_oLevelMenu = this;
    this._init();
}

var s_oLevelMenu = null;