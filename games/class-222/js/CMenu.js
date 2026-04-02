function CMenu() {
    var _pStartPosAudio;
    var _pStartPosPlay;
    var _pStartPosCredits;
    var _pStartPosFullscreen;
    var _oBg;
    var _pStartPosPlayers;
    var _oPlayersContainer;
    var _oPlayer;
    var _oPlayerShadow;
    var iPlayerIndex = 0;
    var _oMenuLogo;
    var _oButPlay;
    var _oButPlay;
    var _oButInfo;
    var _oFade;
    var _oAudioToggle;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function () {
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        _oBg.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        s_oStage.addChild(_oBg);

        _oMenuLogo = createBitmap(s_oSpriteLibrary.getSprite('logo_menu'));
        _oMenuLogo.regX = 204;
        _oMenuLogo.regY = 88;
        _oMenuLogo.x = CANVAS_WIDTH_HALF;
        _oMenuLogo.y = -200;
        s_oStage.addChild(_oMenuLogo);

        new createjs.Tween.get(_oMenuLogo)
                .to({ y: CANVAS_HEIGHT_HALF - 200 }, 500);
        new createjs.Tween.get(_oMenuLogo, {loop: true})
                .to({ scaleX: 1.1, scaleY: 1.1 }, 500)
                .to({ scaleX: 1, scaleY: 1 }, 500);

        _oPlayersContainer = new createjs.Container();
        s_oStage.addChild(_oPlayersContainer);

        this.createPlayer();

        var oSprite = s_oSpriteLibrary.getSprite('but_play');
        _pStartPosPlay = {x: CANVAS_WIDTH_HALF, y: CANVAS_HEIGHT - 120};
        _oButPlay = new CGfxButton(_pStartPosPlay.x, _pStartPosPlay.y, oSprite, s_oStage);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
        _oButPlay.pulseAnimation();

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height / 2) - 20, y: (oSprite.height / 2) + 20};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        var oSpriteInfo = s_oSpriteLibrary.getSprite("but_info");
        _pStartPosCredits = {x: (oSprite.height / 2) + 20, y: (oSprite.height / 2) + 20};
        _oButInfo = new CGfxButton(_pStartPosCredits.x, _pStartPosCredits.y, oSpriteInfo, s_oStage);
        _oButInfo.addEventListener(ON_MOUSE_UP, this._onButInfoRelease, this);

        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosCredits.x + oSprite.width/2 + 10,y:_pStartPosCredits.y};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, 1000).call(function () {
            _oFade.visible = false;
        });

        if(!s_bStorageAvailable){
            new CErrorMsgBox(TEXT_ERR_LS, s_oStage);
        }else{
            var aGamesWon = getItem("goosegame_gameswon");
            if(aGamesWon !== null ){
                s_aGamesWon = aGamesWon;
            }
            var aGamesPlayed = getItem("goosegame_gamesplayed");
            if(aGamesPlayed !== null ){
                s_aGamesPlayed = aGamesPlayed;
            }
        }

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };
    
    this.createPlayer = function() {
        _pStartPosPlayers = {x: -50, y: CANVAS_HEIGHT_HALF};

        _oPlayerShadow = createBitmap(s_oSpriteLibrary.getSprite('player_shadow'));
        _oPlayerShadow.regX = 20;
        _oPlayerShadow.regY = -15;
        _oPlayerShadow.scaleX = _oPlayerShadow.scaleY = 1.5;
        _oPlayerShadow.x = _pStartPosPlayers.x;
        _oPlayerShadow.y = _pStartPosPlayers.y;
        _oPlayersContainer.addChild(_oPlayerShadow);

        _oPlayer = createBitmap(s_oSpriteLibrary.getSprite('goose_' + iPlayerIndex));
        _oPlayer.regX = 45;
        _oPlayer.regY = 110;
        _oPlayer.x = _pStartPosPlayers.x;
        _oPlayer.y = _pStartPosPlayers.y;
        _oPlayersContainer.addChild(_oPlayer);
        
        // PLAYER'S SHADOW MOVEMENT
        new createjs.Tween.get(_oPlayerShadow, {loop: true})
                .to({alpha: 0.5}, 150)
                .to({alpha: 1}, 150);
        new createjs.Tween.get(_oPlayerShadow)
                .to({x: CANVAS_WIDTH + 50}, 5000);
        
        // PLAYER MOVEMENT
        new createjs.Tween.get(_oPlayer, {loop: true})
            .to({ y: _pStartPosPlayers.y - 20},150, createjs.Ease.quadIn)
            .to({ y: _pStartPosPlayers.y },150, createjs.Ease.quadIn);
        new createjs.Tween.get(_oPlayer)
            .to({x: CANVAS_WIDTH + 50}, 5000).call(function() {
                _oPlayersContainer.removeChild(_oPlayer);
                _oPlayersContainer.removeChild(_oPlayerShadow);
                iPlayerIndex++;
                if (iPlayerIndex > 5) {
                    iPlayerIndex = 0; };
                s_oMenu.createPlayer();
            });
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButPlay.setPosition(_pStartPosPlay.x, _pStartPosPlay.y - iNewY);
        _oButInfo.setPosition(_pStartPosCredits.x + iNewX, _pStartPosCredits.y);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y);
        }
    };

    this.unload = function () {
        _oButPlay.unload();
        _oButPlay = null;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        s_oStage.removeAllChildren();
        createjs.Tween.removeAllTweens();
        s_oMenu = null;
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onButInfoRelease = function () {
        var oCreditsPanel= new CCreditsPanel();
    };

    this._onButPlayRelease = function () {
        s_oMain.pokiShowCommercial(()=>{
            s_oMenu.unload();
            s_oMain.gotoModeSelection();
        });
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.isEnabled){
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

    s_oMenu = this;

    this._init();
}

var s_oMenu = null;