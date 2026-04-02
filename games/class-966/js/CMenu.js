function CMenu() {
    var _oBg;
    var _oButPlay;
    var _oButContinue = null;
    var _oFade;
    var _oAudioToggle;
    var _oCreditsBut;
    var _oResetPanel = null;
    var _oContainerReset;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    var _pStartPosCredits;
    var _pStartPosAudio;
    var _pStartPosPlay;
    var _pStartPosContinue;
    var _pStartPosFullscreen;

    this._init = function () {
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);

        var oSprite = s_oSpriteLibrary.getSprite('but_play');

        _pStartPosPlay = {x: (CANVAS_WIDTH / 2), y: CANVAS_HEIGHT - 200};
        _oButPlay = new CGfxButton(_pStartPosPlay.x, _pStartPosPlay.y, oSprite, s_oStage);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);

        if (getItem("tennis_levelreached") !== null) {
            s_iLevelReached = getItem("tennis_levelreached");
            s_aScores = JSON.parse(getItem("tennis_scores"));
            s_iBestScore = getItem("tennis_best_score");

            _pStartPosPlay = {x: CANVAS_WIDTH / 2 - 200, y: CANVAS_HEIGHT - 200};
            _oButPlay.setPosition(_pStartPosPlay.x, _pStartPosPlay.y);

            _pStartPosContinue = {x: CANVAS_WIDTH / 2 + 200, y: CANVAS_HEIGHT - 200};

            var oSpriteContiune = s_oSpriteLibrary.getSprite('but_continue_big');
            _oButContinue = new CGfxButton(_pStartPosContinue.x, _pStartPosContinue.y, oSpriteContiune, s_oStage);
            _oButContinue.addEventListener(ON_MOUSE_UP, this._onButContinueRelease, this);
            _oButContinue.pulseAnimation();
        } else {
            _oButPlay.pulseAnimation();
            this.resetArrays();
            s_iBestScore = 0;
        }

        var oSprite = s_oSpriteLibrary.getSprite('but_info');
        _pStartPosCredits = {x: (oSprite.height / 2) + 10, y: (oSprite.height / 2) + 10};
        _oCreditsBut = new CGfxButton((CANVAS_WIDTH / 2), CANVAS_HEIGHT - 240, oSprite, s_oStage);
        _oCreditsBut.addEventListener(ON_MOUSE_UP, this._onCreditsBut, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height / 2) - 10, y: (oSprite.height / 2) + 10};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
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
            _pStartPosFullscreen = {x:_pStartPosCredits.x + oSprite.width/2 + 10,y:_pStartPosCredits.y};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        _oContainerReset = new createjs.Container();
        s_oStage.addChild(_oContainerReset);

        createjs.Tween.get(_oFade).to({alpha: 0}, MS_FADE_ANIM * 2).call(function () {
            _oFade.visible = false;
        });
        
        if(!s_bStorageAvailable){
            new CMsgBox(TEXT_ERR_LS,s_oStage);
        }
        
        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.unload = function () {
        _oButPlay.unload();
        _oButPlay = null;

        if (_oButContinue !== null) {
            _oButContinue.unload();
            _oButContinue = null;
        }

        _oFade.visible = false;

        _oCreditsBut.unload();

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        s_oStage.removeChild(_oBg);
        _oBg = null;
        s_oMenu = null;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oCreditsBut.setPosition(_pStartPosCredits.x + iNewX, iNewY + _pStartPosCredits.y);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
    };

    this._onButPlayRelease = function () {
        s_oMain.pokiShowCommercial(()=>{
            if (isIOS() && s_oSoundTrack === null) {
                s_oSoundTrack = playSound("soundtrack", 1,true);
            }

            if (getItem("tennis_levelreached") === null) {
                s_oMenu.fadeAnim();
            } else {
                if (_oResetPanel === null) {
                    _oResetPanel = new CConfirmPanel(TEXT_RESET, _oContainerReset);
                    _oResetPanel.addEventListener(ON_BUT_NO_DOWN, this._onButNo, this);
                    _oResetPanel.addEventListener(ON_BUT_YES_DOWN, this._onButYes, this);
                }
            }
        });
    };

    this._onButNo = function () {
        _oResetPanel.unload();
        _oResetPanel = null;
    };

    this._onButYes = function () {
        _oResetPanel.unload();
        _oResetPanel = null;
        clearAllItem();
        s_iLevelReached = 1;
        this.resetArrays();
        this.fadeAnim();
    };

    this._onButContinueRelease = function () {
        if (isIOS() && s_oSoundTrack === null) {
            s_oSoundTrack = playSound("soundtrack", 1,true);
        }
        
        this.fadeAnim();
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onCreditsBut = function () {
        new CCreditsPanel();
    };
    
    this._onFullscreenRelease = function(){
	if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
};

    this.resetArrays = function () {
        s_aScores = new Array();

        for (var i = 0; i < OPPONENT_SPEED.length; i++) {
            s_aScores[i] = 0;
        }
    };

    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.enabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    this.fadeAnim = function () {
        _oFade.visible = true;
        createjs.Tween.get(_oFade, {override: true}).to({alpha: 1}, MS_FADE_ANIM, createjs.Ease.cubicIn).call(function () {
            this.unload();
            s_oMain.gotoLevelMenu();
        }, null, this);

    };

    s_oMenu = this;

    this._init();
}

var s_oMenu = null;