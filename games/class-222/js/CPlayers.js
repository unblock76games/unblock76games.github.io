function CPlayers(i, oPlayersContainer, oPlayersShadowsContainer, oPlayersArrowContainer, iColor) {
    var _iIndex = i;
    var _iColor = iColor;
    var _oPlayersContainer = oPlayersContainer;
    var _oPlayersShadowsContainer = oPlayersShadowsContainer;
    var _oPlayersArrowContainer = oPlayersArrowContainer;
    var _oPlayerShadow;
    var _oPlayer;
    var _oArrow;
    
    var _iPosition;
    var _iPenality;

    this._init = function() {
        var sSpriteName = "player_shadow";
        _oPlayerShadow = createBitmap(s_oSpriteLibrary.getSprite(sSpriteName));
        _oPlayerShadow.regX = 16;
        _oPlayerShadow.regY = -5;
        _oPlayerShadow.x = ZERO_SQUARE_POSITIONS[_iIndex][0];
        _oPlayerShadow.y = ZERO_SQUARE_POSITIONS[_iIndex][1];
        
        _oPlayersShadowsContainer.addChild(_oPlayerShadow);

        var sSpriteName = "player_" + _iColor;
        _oPlayer = createBitmap(s_oSpriteLibrary.getSprite(sSpriteName));
        _oPlayer.regX = 20;
        _oPlayer.regY = 60;
        _oPlayer.x = _oPlayerShadow.x;
        _oPlayer.y = _oPlayerShadow.y;
        _iPosition = 0;
        _iPenality = 0;  
        _oPlayersContainer.addChild(_oPlayer);
                
        // AN ARROW WILL BE USED FOR THE HUMAN PLAYER'S POSITION
        _oArrow = createBitmap(s_oSpriteLibrary.getSprite('arrow'));
        _oArrow.regX = 12;
        _oArrow.regY = 100;
        _oArrow.visible = false;
        _oPlayersArrowContainer.addChild(_oArrow);
        
        new createjs.Tween.get(_oArrow, {loop: true})
                .to({ scaleY: 1.2}, 500, createjs.Ease.quadIn)
                .to({ scaleY: 1}, 500, createjs.Ease.quadIn);
    };

    this.getArrow = function(){
        return _oArrow; };

    this.setArrowVisible = function(value){
        _oArrow.visible = value; };
    
    this.isArrowVisible = function(){
        return _oArrow.visible; };

    this.setArrowX = function(value){
        _oArrow.x = value; };

    this.setArrowY = function(value){
        _oArrow.y = value; };

    this.setVisible = function(value) {
        _oPlayer.visible = value;
        _oPlayerShadow.visible = value;
    };
    
    this.getSprite = function(){
       return _oPlayer; };
    
    this.getShadow = function(){
       return _oPlayerShadow; };
    
    this.getColor = function(){
        return _iColor;
    };
    
    this.getPosition = function () {
        return _iPosition; };

    this.getPenality= function () {
        return _iPenality; };
    
    this.setPenality = function(value) {
        _iPenality = value; };
    
    this.decreasePenality = function() {
        _iPenality -= 1; };
    
    this.decreasePosition = function() {
        _iPosition -= 1; };
    
    this.increasePosition = function() {
        _iPosition += 1; };

    this.unload = function () {
        s_oPlayers = null;        
    };
    
    this.reset = function(){
        _iPenality = 0;
        _iPosition = 0;
        
        _oPlayer.x = ZERO_SQUARE_POSITIONS[_iIndex][0];
        _oPlayer.y = ZERO_SQUARE_POSITIONS[_iIndex][1];
        _oPlayerShadow.x = _oPlayer.x;
        _oPlayerShadow.y = _oPlayer.y;
        _oPlayer.scaleX = 1;
        _oPlayer.alpha = 1;
        
        this.setVisible(true);
    };
    
    s_oPlayers = this;
    
    this._init();
}

var s_oPlayers;