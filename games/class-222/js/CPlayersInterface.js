function CPlayersInterface(aPlayersColor) {
    var _aPlayersColor = aPlayersColor;
    var _oPlayersContainer;
    var _oTurnPanel;
    var _oPlayer0;
    var _oPlayer1;
    var _oPlayer2;
    var _oPlayer3;
    var _oPlayer4;
    var _oPlayer5;
    var _pStartPosPlayers;
    var _aPlayers; // Array containing the players

    this._init = function() {
        _aPlayers = [ _oPlayer0, _oPlayer1, _oPlayer2, _oPlayer3, _oPlayer4, _oPlayer5 ];
        
        _oPlayersContainer = new createjs.Container();
        s_oStage.addChild(_oPlayersContainer);

        _pStartPosPlayers = {x: 20, y: 10};

        _oPlayersContainer.x = _pStartPosPlayers.x;
        _oPlayersContainer.y = _pStartPosPlayers.y;

        _oTurnPanel = createBitmap(s_oSpriteLibrary.getSprite("turn_panel"));
        _oPlayersContainer.addChild(_oTurnPanel);

        var iPlayersXOffset = 53;
        var iPlayersYOffset = -10;

        // CREATE THE PLAYERS' INDICATORS
        for (var i = 0; i < _aPlayersColor.length; i++) {
            
            var oSpriteName = "turns";
            var oData = {
                    images: [s_oSpriteLibrary.getSprite(oSpriteName)],
                    framerate: 0,
                    frames: {width: 58, height: 66, regX: 0, regY: 0},
                };
            var oSpriteSheet = new createjs.SpriteSheet(oData);
            _aPlayers[i] = createSprite(oSpriteSheet, 0, 0, 0, 58, 66);
            _aPlayers[i].x = iPlayersXOffset/2 + iPlayersXOffset*i;
            _aPlayers[i].y = iPlayersYOffset;
            _aPlayers[i].scaleX = _aPlayers[i].scaleY = 0.9;
            _aPlayers[i].gotoAndStop(_aPlayersColor[i]);
            _aPlayers[i].visible = true;
            _oPlayersContainer.addChild(_aPlayers[i]);
        };
    };

    this.setTurn = function(iTurn) {
        _aPlayers[iTurn].gotoAndStop(_aPlayersColor[iTurn]+6);

        for (var i = 0; i < _aPlayersColor.length; i++) {
            if (i !== iTurn) {
                _aPlayers[i].gotoAndStop(_aPlayersColor[i]);
            };
        };
    }; 

    this.refreshPosition = function(iNewX) {
        _oPlayersContainer.x = _pStartPosPlayers.x + iNewX;
        _oPlayersContainer.y = _pStartPosPlayers.y;
    };

    s_oPlayersInterface = this;

    this._init();

    return this;
};

var s_oPlayersInterface = null;