function CSpinnerPanel(iAvailableMoney){
    var _bCalculatingMoney;
    var _iTimeElaps;
    var _iCurPage;
    var _iCurMoney;
    var _iMoneyToSpend;
    var _iOffsetMoney;
    var _aPointsX;
    var _aContainerPage;
    var _aSpinnerSprite;
    var _pStartPosExit;
    
    var _oBlockPanel;
    var _oMoneyText;
    var _oCoinIcon;
    var _oArrowRight = null;
    var _oArrowLeft = null;
    var _oButExit;
    var _oListener;
    var _oListenerBlock;
    var _oBg;
    var _oContainer;
    
    this._init = function(iAvailableMoney){
        _bCalculatingMoney = false;
        _iCurPage = 0;
        _iCurMoney = iAvailableMoney;
        
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
        
        _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_spinner_panel"));
        _oListener = _oBg.on("click",function(){});
        _oContainer.addChild(_oBg);
        
        var oTextOutline = new createjs.Text(TEXT_SELECT_SPINNER," 50px "+PRIMARY_FONT, "#005e0f");
        oTextOutline.x = CANVAS_WIDTH/2;
        oTextOutline.y = 250;
        oTextOutline.textAlign = "center";
        oTextOutline.textBaseline = "alphabetic";
        oTextOutline.outline = 7;
        _oContainer.addChild(oTextOutline);
        
        var oText = new createjs.Text(TEXT_SELECT_SPINNER," 50px "+PRIMARY_FONT, "#ffffff");
        oText.x = CANVAS_WIDTH/2;
        oText.y = 250;
        oText.textAlign = "center";
        oText.textBaseline = "alphabetic";
        _oContainer.addChild(oText);
        
        var oSpriteExit = s_oSpriteLibrary.getSprite("but_exit");
        _pStartPosExit = {x: CANVAS_WIDTH - (oSpriteExit.width/2)- 10, y: (oSpriteExit.height/2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSpriteExit,_oContainer);
        _oButExit.addEventListener(ON_MOUSE_DOWN,this._onExit,this);
        
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
        _aSpinnerSprite = new Array();
        this._createNewLevelPage(iAvailableMoney,0,NUM_SPINNER);
        
        if(_aContainerPage.length > 1){
            //MULTIPLE PAGES
            for(var k=1;k<_aContainerPage.length;k++){
                _aContainerPage[k].visible = false;
            }

            _oArrowRight = new CGfxButton(CANVAS_WIDTH/2 + 250,CANVAS_HEIGHT - 280,s_oSpriteLibrary.getSprite('arrow_right'),_oContainer);
            _oArrowRight.addEventListener(ON_MOUSE_UP, this._onRight, this);
            
            _oArrowLeft = new CGfxButton(CANVAS_WIDTH/2 - 250,CANVAS_HEIGHT - 280,s_oSpriteLibrary.getSprite('arrow_left'),_oContainer);
            _oArrowLeft.addEventListener(ON_MOUSE_UP, this._onLeft, this);
        }
        
        _aSpinnerSprite[s_iLastSelected].setShadow( new createjs.Shadow("#fff", 0, 0, 20));
       
        //ATTACH MONEY GUI
        var oSpriteCoin = s_oSpriteLibrary.getSprite("coin");
        _oCoinIcon = createBitmap(oSpriteCoin);
        _oCoinIcon.x =  CANVAS_WIDTH/2 - oSpriteCoin.width ;
        _oCoinIcon.y = CANVAS_HEIGHT - 280;
        _oCoinIcon.regX = oSpriteCoin.width/2;
        _oCoinIcon.regY = oSpriteCoin.height/2;
        _oContainer.addChild(_oCoinIcon);
            
        _oMoneyText = new createjs.Text( iAvailableMoney," 50px "+PRIMARY_FONT, "#fff");
        _oMoneyText.x = CANVAS_WIDTH/2;
        _oMoneyText.y = CANVAS_HEIGHT - 260;
        _oMoneyText.textAlign = "left";
        _oMoneyText.textBaseline = "alphabetic";
        _oContainer.addChild(_oMoneyText);
       
        var oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oContainer.addChild(oFade);
        
        createjs.Tween.get(oFade).to({alpha:0}, 600).call(function(){oFade.visible = false;});  
        
        _oBlockPanel = new createjs.Shape();
        _oBlockPanel.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oListenerBlock = _oBlockPanel.on("click",function(){});
        _oBlockPanel.visible = false;
        _oContainer.addChild(_oBlockPanel);
        
        this.refreshButtonPos();
    };
    
    this.unload = function(){
        _oBg.off("click",_oListener);
        _oBlockPanel.on("click",_oListenerBlock);
        
        _oArrowLeft.unload();
        _oArrowRight.unload();
        
        for(var i=0;i<_aSpinnerSprite.length;i++){
            _aSpinnerSprite[i].unload();
        }
        
        s_oStage.removeChild(_oContainer);
        
        s_oSpinnerPanel = null;
    };
    
    this.refreshButtonPos = function(){
        _oButExit.setPosition(_pStartPosExit.x - s_iOffsetX,s_iOffsetY + _pStartPosExit.y);
    };
    
    this._createNewLevelPage = function(iAvailableMoney,iStartLevel,iEndLevel){
        var oContainerLevelBut = new createjs.Container();
        _oContainer.addChild(oContainerLevelBut);
        _aContainerPage.push(oContainerLevelBut);

        
        var iCont = 0;
        var iYPos = 0;
        var iNumRow = 1;
        var bNewPage = false;
        

        for(var i=iStartLevel;i<iEndLevel;i++){
            _aSpinnerSprite[i] = new CSpinnerBut(_aPointsX[iCont],iYPos,s_aAvailableSpinners[i],iAvailableMoney < PRICE_SPINNER[i]?false:true,i,oContainerLevelBut);

            iCont++;
            if(iCont === _aPointsX.length){
                iCont = 0;
                iYPos += SPINNER_HEIGHT*_aSpinnerSprite[i].getScale() + 50;
                iNumRow++;

                if(iNumRow > NUM_ROWS_PAGE_LEVEL && _aSpinnerSprite.length < NUM_SPINNER){
                    bNewPage = true;
                    break;
                }
            }
            
        }

        oContainerLevelBut.x = CANVAS_WIDTH/2 ;
        oContainerLevelBut.y = CANVAS_HEIGHT/2;
        oContainerLevelBut.regX = oContainerLevelBut.getBounds().width/2 - (SPINNER_WIDTH/2*_aSpinnerSprite[iStartLevel].getScale());
        oContainerLevelBut.regY = oContainerLevelBut.getBounds().height/2 - (SPINNER_HEIGHT/2*_aSpinnerSprite[iStartLevel].getScale());
        
        if(bNewPage){
            //ADD A PAGE
            this._createNewLevelPage(iAvailableMoney,i+1,iEndLevel);
        }
        
    };
    
    this._checkBoundLimits = function(){
        var iY = 0;
        
        var iHeightBound = CANVAS_HEIGHT - (EDGEBOARD_Y*2);
        var iNumRows = 0;

        while(iY < iHeightBound){
            iY += SPINNER_HEIGHT*0.4;
            iNumRows++;
        }

        if(NUM_ROWS_PAGE_LEVEL > iNumRows){
            NUM_ROWS_PAGE_LEVEL = iNumRows;
        }
        
        
        var iNumCols = 0;
        var iX = 0;
        var iWidthBounds = CANVAS_WIDTH - (EDGEBOARD_X*2);

        while(iX < iWidthBounds){
            iX += (SPINNER_WIDTH*0.4/2) + 5;
            iNumCols++;  
        }
        if(NUM_COLS_PAGE_LEVEL > iNumCols){
            NUM_COLS_PAGE_LEVEL = iNumCols;
        }
    };
    
    this.decreaseMoneyCount = function(){
        _iMoneyToSpend -= _iOffsetMoney;
        _iCurMoney -= _iOffsetMoney;
        _oMoneyText.text = _iCurMoney;

        var pPos = _aSpinnerSprite[s_iLastSelected].getAbsoluteCoinPos();

        var oCoin = new CMovingCoin({x:_oCoinIcon.x,y:_oCoinIcon.y},{x:pPos.x,y:pPos.y},_iMoneyToSpend===0?true:false,TWEEN_TYPE_1,_oContainer);
        oCoin.addEventListener(ON_COIN_ARRIVED,this.decreasePrice,this);
        
        if(_iMoneyToSpend === 0){
            _bCalculatingMoney = false;
        }
    };
    
    this.stopCalculatingMoney = function(){
        //REMOVE PRICE GUI FOR SPINNER PURCHASED
        _aSpinnerSprite[s_iLastSelected].removePrice();

        //DISABLE SPINNER IF CURRENT MONEY IS LOWER THAN PRICE
        for(var i=0;i<_aSpinnerSprite.length;i++){
            if(PRICE_SPINNER[i] > _iCurMoney && _aSpinnerSprite[i].isAvailable() === false){
                _aSpinnerSprite[i].disable();
            }
        }
        
        _oBlockPanel.visible = false;
    };
    
    this.decreasePrice = function(bLast){
        _aSpinnerSprite[s_iLastSelected].decreasePrice(_iOffsetMoney);
        
        if(bLast){
           this.stopCalculatingMoney();
        }
    };
    
    this.onSelectSpinner = function(iIndex,bAvailable){
        _aSpinnerSprite[s_iLastSelected].setShadow(null);
        s_iLastSelected = iIndex;
        _aSpinnerSprite[s_iLastSelected].setShadow( new createjs.Shadow("#fff", 0, 0, 20));
        s_oLocalStorage.saveItem(LOCAL_STORAGE_SELECTED,s_iLastSelected);
        
        if(!bAvailable){
            //DISABLE CLICK ON OTHER SPINNERS
            _oBlockPanel.visible = true;
            s_aAvailableSpinners[iIndex] = true;
            s_oLocalStorage.saveItem(LOCAL_STORAGE_SPINNERS,s_aAvailableSpinners);
            
            _iTimeElaps = 0;
            
            _iMoneyToSpend = PRICE_SPINNER[iIndex];
            _iOffsetMoney = Math.round(_iMoneyToSpend/10);
            _bCalculatingMoney = true;
        }
        
        s_oGame.changeSpinner(iIndex,bAvailable);
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
    
    this._onExit = function(){
        s_oSpinnerPanel.unload();
        PokiSDK.gameplayStart();
    };
    
    this.update = function(){
        if(_bCalculatingMoney){
            if(_iMoneyToSpend > 0){
                _iTimeElaps += s_iTimeElaps;
                if(_iTimeElaps > TIME_MONEY_TWEEN){
                    _iTimeElaps = 0;
                    this.decreaseMoneyCount();
                }
                
            }else{
                _bCalculatingMoney = false;
                this.stopCalculatingMoney();
            }

        }
    };
    
    s_oSpinnerPanel = this;
    this._init(iAvailableMoney);
}

var s_oSpinnerPanel = null;