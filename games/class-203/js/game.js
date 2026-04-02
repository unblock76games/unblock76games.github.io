var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ButtonCumulScoreReset = /** @class */ (function () {
    function ButtonCumulScoreReset(parent, x, y) {
        this.myGroup = SimpleGame.myGame.add.group(parent);
        this.buttonBg = SimpleGame.myGame.add.graphics(x, y, this.myGroup);
        this.buttonBg.beginFill(0x333333);
        this.buttonBg.drawRoundedRect(0, 0, 220, 30, 20);
        this.buttonBg.endFill();
        this.buttonBg.alpha = 1;
        this.buttonBg.inputEnabled = true;
        this.buttonBg.input.useHandCursor = true;
        this.buttonBg.events.onInputDown.add(this.resetCumulativeScore, this);
        if (Language.FRENCH)
            this.myTxt = SimpleGame.myGame.add.text(x, y, "Effacez le Score Cumulatif", { font: "18px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        else
            this.myTxt = SimpleGame.myGame.add.text(x, y, "Reset Cumulative Score", { font: "18px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        this.myTxt.anchor.set(0.5, 0.5);
        this.myTxt.x += this.buttonBg.width / 2;
        this.myTxt.y += this.buttonBg.height / 2;
    }
    ButtonCumulScoreReset.prototype.resetCumulativeScore = function () {
        Util.setStorage("SLTR_scorevegascumul", 0);
        GameContext.gameMode = GameContext.GAME_MODE_VEGAS_CUMUL;
        GameContext.loadGameContext();
        SoundManager.playClick();
        // 
        SettingsPrompt.onScreen = true;
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
        this.myScreen.myGroup.destroy();
        this.myScreen.myBgBlackGroup.destroy();
        BoardManager.startNewGame(GameContext.GAME_MODE_VEGAS_CUMUL);
    };
    return ButtonCumulScoreReset;
}());
var ButtonWithToggle = /** @class */ (function () {
    function ButtonWithToggle() {
    }
    return ButtonWithToggle;
}());
var Consts = /** @class */ (function () {
    function Consts() {
    }
    Consts.DELAY_BETWEEN_EVENTS_TOUCH = 200;
    Consts.DELAY_BETWEEN_EVENTS_DESKTOP = 100;
    Consts.timeToHint = 350;
    Consts.GAMETIME_EASY = 10 * 60;
    Consts.GAMETIME_MEDIUM = 12 * 60;
    Consts.GAMETIME_HARD = 15 * 60;
    Consts.CARD_SCALE_DEFAULT = 2 * 0.67;
    Consts.BACK_CARD_SCALE_DEFAULT = 2 * 0.67;
    Consts.soundFlag = "poki62soun1dflag";
    return Consts;
}());
var WebFontConfig = {
    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function () {
        SimpleGame.myGame.time.events.add(200, function () {
            SimpleGame.fontsLoadedFlag = true;
        }, this);
    },
    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
        families: ["Arimo:700,800"]
    }
};
var mouseIsWithinGame;
var SimpleGame = /** @class */ (function () {
    function SimpleGame() {
        // create our phaser game
        // 800 - width
        // 600 - height
        // Phaser.AUTO - determine the renderer automatically (canvas, webgl)
        // 'content' - the name of the container to add our game to
        // { preload:this.preload, create:this.create} - functions to call for our states
        this.mouseMovedWithinGameTicks = 0;
        this.ticks = 0;
        GameContext.loadGameContext();
        PokiSDK.init().then(
         	() =>
         	{   
                console.log("Poki SDK successfully initialized");
         		// your code to continue to game
         		this.continueToGame();
         	}
         ).catch(
         	() =>
         	{   
                console.log("Poki SDK successfully initialized");
         		// your code to continue to game
         		this.continueToGame();
         	}
         );
        PokiSDK.setDebug(false);
        this.continueToGame();
        window.addEventListener('keydown', function (ev) {
            if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
                ev.preventDefault();
            }
        });
        window.addEventListener('wheel', function (ev) { return ev.preventDefault(); }, { passive: false });
        var config = {
            width: 880,
            height: 600,
            renderer: Phaser.CANVAS,
            parent: 'content',
            disableVisibilityChange: true
        };
        this.game = new Phaser.Game(config);
        SimpleGame.myGame = this.game;
        // this.game.stage.disableVisibilityChange = true;
        // this.game.stage.backgroundColor = 0xffffff;
        // SimpleGame.myGame.stage.visible = false;
        if (SimpleGame.isReleaseVersion) {
        }
        this.boot = new Phaser.State();
        this.game.state.add("Boot", this.boot, true);
        this.gamestate = new Phaser.State();
        this.gamestate.preload = this.preload;
        this.gamestate.create = this.create;
        this.gamestate.update = this.update;
        this.game.state.add("Gamestate", this.gamestate, false);
        var resizeF = function () {
            SimpleGame.myGame.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        };
        this.boot.preload = function () {
            this.game.stage.backgroundColor = 0x000000;
            this.game.add.text(0, 0, "Arial", { font: "1px peace_sans", fill: "#FFFFFF" });
            SimpleGame.myGame.stage.disableVisibilityChange = true;
            // this.game.stage.backgroundColor = 0xffffff;
            // this.game.scale.pageAlignVertically = true;
            // this.game.scale.pageAlignHorizontally = true;
            // SimpleGame.myGame.input.mspointer.stop()
            window.addEventListener("resize", resizeF);
            SimpleGame.myGame.stage.disableVisibilityChange = true;
            resizeF();
            // 
            this.game.time.advancedTiming = true;
            // this.game.scale.setMinMax(0, 0, window.innerWidth, window.innerHeight);
            this.game.scale.refresh();
            // 
            // 
        };
        this.boot.create = function () {
            // SimpleGame.logo = this.game.add.sprite( 0, 0, 'logo' );
            // SimpleGame.logo.visible = false;
            this.game.state.start("Gamestate");
            var deviceWidth = window.outerWidth;
            var deviceHeight = window.outerHeight;
            if (SimpleGame.logo) {
                SimpleGame.logo.setScaleMinMax(1, 1, 10, 10);
                SimpleGame.logo.width = deviceWidth;
                resizeF();
            }
        };
    }
    SimpleGame.prototype.continueToGame = function () {
        // throw new Error("Method not implemented.");
    };
    SimpleGame.prototype.preload = function () {
        PokiSDK.gameLoadingStart();
        this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js');
        // add our logo image to the assets class under the
        // key 'logo'. We're also setting the background colour
        // so it's the same as the background colour in the image
        // SimpleGame.handleOrientation()
        // SimpleGame.logo = this.game.add.sprite( 0, 0, 'logo' );
        var deviceWidth = window.outerWidth;
        var deviceHeight = window.outerHeight;
        if (SimpleGame.logo) {
            SimpleGame.logo.setScaleMinMax(1, 1, 10, 10);
            SimpleGame.logo.width = deviceWidth;
            // resizeF()
        }
        SimpleGame.myGame.stage.backgroundColor = 0x000000;
        this.game.load.image('bg_landscape', "assets/Background/bg_landscape.png");
        this.game.load.image('bg', "assets/Background/bg.png");
        this.game.load.image('bg2_landscape', "assets/Background/bg2_landscape.png");
        this.game.load.image('bg2', "assets/Background/bg2.png");
        this.game.load.image('bg3_landscape', "assets/Background/bg3_landscape.png");
        this.game.load.image('bg3', "assets/Background/bg3.png");
        this.game.load.image('bg4_landscape', "assets/Background/bg4_landscape.png");
        this.game.load.image('bg4', "assets/Background/bg4.png");
        this.game.load.image('button_newgame', 'assets/PROMPTS/button_newgame.png');
        this.game.load.image('button_newgame_over', 'assets/PROMPTS/button_newgame_over.png');
        this.game.load.image('prompt_difficulty', 'assets/PROMPTS/new_game_bg.png');
        this.game.load.image('tutorial_image_1', 'assets/tutorial_image_1.png');
        this.game.load.image('tutorial_image_2', 'assets/tutorial_image_2.png');
        this.game.load.image('tutorial_image_3', 'assets/tutorial_image_3.png');
        this.game.load.image('button_new_game', 'assets/BUTTONS/button_new.png');
        this.game.load.image('button_new_game_over', 'assets/BUTTONS/button_new_over.png');
        this.game.load.image('button_restart', 'assets/BUTTONS/button_restart.png');
        this.game.load.image('button_restart_over', 'assets/BUTTONS/button_restart_over.png');
        this.game.load.image('button_stats', 'assets/BUTTONS/button_stats.png');
        this.game.load.image('button_stats_over', 'assets/BUTTONS/button_stats_over.png');
        this.game.load.image('button_undo', 'assets/BUTTONS/button_undo.png');
        this.game.load.image('button_undo', 'assets/BUTTONS/button_undo.png');
        this.game.load.image('button_hint', 'assets/BUTTONS/button_hint.png');
        this.game.load.image('button_hint_over', 'assets/BUTTONS/button_hint_over.png');
        this.game.load.image('score_selector_cumulative', 'assets/ScoringToggles/score_selector_cumulative.png');
        this.game.load.image('score_selector_standard', 'assets/ScoringToggles/score_selector_standard.png');
        this.game.load.image('score_selector_vegas', 'assets/ScoringToggles/score_selector_vegas.png');
        this.game.load.image('toggle_grey01', 'assets/toggleButton/toggle_grey01.png');
        this.game.load.image('toggle_green', 'assets/toggleButton/toggle_green.png');
        this.game.load.image('toggle_BTN01', 'assets/toggleButton/toggle_BTN01.png');
        this.game.load.image('button_music', 'assets/BUTTONS/button_music.png');
        this.game.load.image('button_music_off', 'assets/BUTTONS/button_music_off.png');
        this.game.load.image('button_music_over', 'assets/BUTTONS/button_music_over.png');
        this.game.load.image('button_music_off_over', 'assets/BUTTONS/button_music_off_over.png');
        this.game.load.image('home_bg', 'assets/home_bg.png');
        this.game.load.image('under_cards', 'assets/under_cards.png');
        this.game.load.image('button_undo_over', 'assets/BUTTONS/button_undo_over.png');
        this.game.load.image('button_undo_no_undo', 'assets/BUTTONS/button_undo_no_undo.png');
        this.game.load.image('button_bookmark_over', 'assets/BUTTONS/button_bookmark_over.png');
        this.game.load.image('button_bookmark', 'assets/BUTTONS/button_bookmark.png');
        this.game.load.image('wand_button', 'assets/icons/wand_button.png');
        this.game.load.image('game_button', 'assets/icons/game_button.png');
        this.game.load.image('hint_button', 'assets/icons/hint_button.png');
        this.game.load.image('ad_icon', 'assets/icons/AdtextIcon.png');
        this.game.load.image('setting_button', 'assets/icons/setting_button.png');
        this.game.load.image('undo_button', 'assets/icons/undo_button.png');
        SimpleGame.myGame.load.image('card_drag', 'assets/CARDS/highlight/card_drag.png', true);
        SimpleGame.myGame.load.image('card_highlight', 'assets/CARDS/highlight/card_highlight.png', true);
        SimpleGame.myGame.load.image('card_highlight_deck', 'assets/CARDS/highlight/card_highlight_deck.png', true);
        this.game.load.image('card_back_12', 'assets/CARDS/backs/card_back_12.png');
        this.game.load.image('card_back_13', 'assets/CARDS/backs/card_back_13.png');
        this.game.load.image('card_back_15', 'assets/CARDS/backs/card_back_15.png');
        this.game.load.image('card_back_18', 'assets/CARDS/backs/card_back_18.png');
        this.game.load.image('card_back_19', 'assets/CARDS/backs/card_back_19.png');
        this.game.load.image('card_back_20', 'assets/CARDS/backs/card_back_20.png');
        this.game.load.image('card_back_23', 'assets/CARDS/backs/card_back_23.png');
        this.game.load.image('card_back_24', 'assets/CARDS/backs/card_back_24.png');
        this.preloadText = SimpleGame.myGame.add.text(0, 0, "New Game", {
            font: "28px Overpass", fill: "#ffffff", fontWeight: "500"
        });
        this.preloadText.anchor.set(0.5, 0.5);
        this.preloadText.text = "";
        this.preloadText.x = window.innerWidth / 2;
        this.preloadText.y = window.innerHeight / 2;
        this.game.load.onFileComplete.add(function (progress, cacheKey, success, totalLoaded, totalFiles) {
            this.preloadText.text = progress + "%";
        }, this);
        Spinner.preload();
        this.game.load.xml('language', 'assets/language1.xml');
        this.game.load.audio('click', ['assets/SOUNDS/Button-02.mp3']);
        this.game.load.audio('CardsMoveEachOthers-01', ['assets/SOUNDS/CardsMoveEachOthers-01.mp3']);
        this.game.load.audio('deal1card', ['assets/SOUNDS/Deal-New-01.mp3']);
        this.game.load.audio('Gong-01', ['assets/SOUNDS/Gong-01.mp3']);
        this.game.load.audio('HintButton-02', ['assets/SOUNDS/HintButton-02.mp3']);
        this.game.load.audio('Pick-New-01', ['assets/SOUNDS/Pick-New-01.mp3']);
        this.game.load.audio('Place-New-01', ['assets/SOUNDS/Place-New-01.mp3']);
        this.game.load.audio('Rotate-New-02', ['assets/SOUNDS/Rotate-New-02.mp3']);
        this.game.load.audio('Shuffling-01', ['assets/SOUNDS/Shuffling-01.mp3']);
        this.game.load.audio('undo', ['assets/SOUNDS/Undo-02.mp3']);
        this.game.load.audio('Wrong-02', ['assets/SOUNDS/Wrong-02.mp3']);
        this.game.load.audio('1', ['assets/SOUNDS/Piano/1.mp3']);
        this.game.load.audio('2', ['assets/SOUNDS/Piano/2.mp3']);
        this.game.load.audio('3', ['assets/SOUNDS/Piano/3.mp3']);
        this.game.load.audio('4', ['assets/SOUNDS/Piano/4.mp3']);
        this.game.load.audio('5', ['assets/SOUNDS/Piano/5.mp3']);
        this.game.load.audio('6', ['assets/SOUNDS/Piano/6.mp3']);
        this.game.load.audio('7', ['assets/SOUNDS/Piano/7.mp3']);
        this.game.load.audio('8', ['assets/SOUNDS/Piano/8.mp3']);
        this.game.load.audio('9', ['assets/SOUNDS/Piano/9.mp3']);
        this.game.load.audio('10', ['assets/SOUNDS/Piano/10.mp3']);
        this.game.load.audio('11', ['assets/SOUNDS/Piano/11.mp3']);
        this.game.load.audio('12', ['assets/SOUNDS/Piano/12.mp3']);
        this.game.load.audio('13', ['assets/SOUNDS/Piano/13.mp3']);
        this.game.load.audio('14', ['assets/SOUNDS/Piano/14.mp3']);
    };
    SimpleGame.prototype.create = function () {
        console.log("create called");
        // add the 'logo' sprite to the game, position it in the
        // center of the screen, and set the anchor to the center of
        // the image so it's centered properly. There's a lot of
        // centering in that last sentence
        SoundManager.click = this.game.add.audio('click');
        SoundManager.valid = this.game.add.audio('CardsMoveEachOthers-01');
        SoundManager.deal1card = this.game.add.audio('deal1card');
        SoundManager.Gong01 = this.game.add.audio('Gong-01');
        SoundManager.hint = this.game.add.audio('HintButton-02');
        SoundManager.grabcard = this.game.add.audio('Pick-New-01');
        SoundManager.PickNew01 = this.game.add.audio('Pick-New-01');
        SoundManager.PlaceNew01 = this.game.add.audio('Place-New-01');
        SoundManager.RotateNew02 = this.game.add.audio('Rotate-New-02');
        SoundManager.Shuffling01 = this.game.add.audio('Shuffling-01');
        SoundManager.undo = this.game.add.audio('undo');
        SoundManager.invalid = this.game.add.audio('Wrong-02');
        SoundManager.melodicArr = [];
        SoundManager.melodicArr[0] = this.game.add.audio('1');
        SoundManager.melodicArr[1] = this.game.add.audio('2');
        SoundManager.melodicArr[2] = this.game.add.audio('3');
        SoundManager.melodicArr[3] = this.game.add.audio('4');
        SoundManager.melodicArr[4] = this.game.add.audio('5');
        SoundManager.melodicArr[5] = this.game.add.audio('6');
        SoundManager.melodicArr[6] = this.game.add.audio('7');
        SoundManager.melodicArr[7] = this.game.add.audio('8');
        SoundManager.melodicArr[8] = this.game.add.audio('9');
        SoundManager.melodicArr[9] = this.game.add.audio('10');
        SoundManager.melodicArr[10] = this.game.add.audio('11');
        SoundManager.melodicArr[11] = this.game.add.audio('12');
        SoundManager.melodicArr[12] = this.game.add.audio('13');
        SoundManager.melodicArr[13] = this.game.add.audio('14');
        SoundManager.init();
        SoundManager.setMuteFlags(!SoundButton.soundFlag);
        this.game.load.image('button_prompt', 'assets/PROMPTS/button_prompt.png');
        this.game.load.image('button_prompt_over', 'assets/PROMPTS/button_prompt_over.png');
        this.game.load.image('won_bg', 'assets/PROMPTS/won_bg.png');
        this.game.load.image('statics_bg', 'assets/PROMPTS/statics_bg.png');
        Card.preload();
        this.game.load.start();
        this.game.load.onFileComplete.add(function (progress, cacheKey, success, totalLoaded, totalFiles) {
            if (totalLoaded == totalFiles) {
                SimpleGame.allCardsPreloaded = true;
                if (SimpleGame.spinnerAnim != null)
                    SimpleGame.spinnerAnim.visible = false;
            }
        }, this);
        // SoundManager.init();
        // SimpleGame.handleOrientation()
        this.ticks = 0;
        var text = this.game.add.text(870, 32, '', { font: "35px Comic Sans MS", fill: "#ff0000" });
        text.text = "super";
        // this.game.physics.enable(logo, Phaser.Physics.ARCADE);
        // this.game.physics.startSystem(Phaser.Physics.ARCADE);
        var key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
        var key2 = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
        var key3 = this.game.input.keyboard.addKey(Phaser.Keyboard.H);
        var key4 = this.game.input.keyboard.addKey(Phaser.Keyboard.J);
        var sBind;
        key4.onDown.add(function () {
            // 
            // BoardManager.TryToHintToEmptyColumn(7)
        });
        key3.onDown.add(function () {
            BoardManager.Hint();
        });
        key1.onDown.add(function () {
            sBind = key2.onDown.add(function () {
                BoardManager.Undo();
            }, this);
            // BoardManager.Undo()
        }, this);
        key1.onUp.add(function () {
            sBind.detach();
        });
        text.visible = false;
        SimpleGame.backgroundLayer = SimpleGame.myGame.add.group();
        SimpleGame.game_bg_landscape = this.game.add.sprite(0, 0, SimpleGame.landscape_backroundNameArray[GameContext.backgroundSelected], '', SimpleGame.backgroundLayer);
        SimpleGame.game_bg_landscape.visible = false;
        SimpleGame.game_bg_portrait = this.game.add.sprite(0, 0, SimpleGame.landscape_backroundNameArray[GameContext.backgroundSelected], '', SimpleGame.backgroundLayer);
        SimpleGame.game_bg_portrait.visible = false;
        // SimpleGame.game_bg.alpha = 0;
        // checkAssetsLoaded();
        SimpleGame.checkAssetsLoaded();
        SimpleGame.myGame.input.onUp.add(SimpleGame.onPointerUp, this);
        SimpleGame.myGame.input.onDown.add(SimpleGame.onPointerDown, this);
        SimpleGame.myGame.input.mspointer.capture = false;
        document.addEventListener('contextmenu', function (event) { return event.preventDefault(); });
        window.onbeforeunload = function () {
            if (GameUI.initialMoveMade) {
                Util.setStoragePerDifficulty("gamesPlayed", Util.getStoragePerDifficulty("gamesPlayed", 0) + 1);
                var cumulativeScore = Util.getStoragePerDifficulty("cumulativeScore", 0);
                cumulativeScore += GameUI.scoreTotal;
                Util.setStoragePerDifficulty("cumulativeScore", cumulativeScore);
                Util.setStoragePerDifficulty("cumulativeTime", (Util.getStoragePerDifficulty("cumulativeTime", 0) + GameUI.time));
                Util.setStoragePerDifficulty("cumulativeMoves", (Util.getStoragePerDifficulty("cumulativeMoves", 0) + GameUI.moves));
            }
        };
    };
    SimpleGame.handleOrientation = function () {
        SimpleGame.myGame.scale.forceOrientation(true, false);
        SimpleGame.myGame.scale.enterIncorrectOrientation.add(function () {
            SimpleGame.myGame.time.events.add(0.1, function () {
                var deviceWidth = window.innerWidth;
                var deviceHeight = window.innerHeight;
                var isIframed = false;
                if (window.self !== window.top) {
                    isIframed = true;
                }
                if (isIframed)
                    return;
                // this.turnImage = SimpleGame.myGame.add.image(SimpleGame.myGame.height/2,SimpleGame.myGame.width/2,'TURN');
                // this.turnImage.anchor.set(0.5,0.5)
                // this.turnImage = SimpleGame.myGame.add.image(0,0,'TURN');
                // this.turnImage.width = 880;
                // this.turnImage.height = 600;
                // this.turnImage.scaleX = this.game.height / this.turnImage.width;
                // this.turnImage.scaleY = this.game.width / this.turnImage.height;
                SimpleGame.myGame.input.enabled = false;
                // this.turnImage.rotation = Math.PI/2;
            }, this);
        }, this);
        SimpleGame.myGame.scale.leaveIncorrectOrientation.add(function () {
            // 
            // SimpleGame.myGame.scale.setGameSize(880, 600)
            var deviceWidth = window.outerWidth;
            var deviceHeight = window.outerHeight;
            SimpleGame.myGame.input.enabled = true;
            // if (this.turnImage)
            // {
            // 	this.turnImage.destroy();
            // }
            if (deviceWidth < deviceHeight) {
            }
            else {
            }
            // this.whitefg.destroy();
        }, this);
    };
    SimpleGame.onPointerDown = function () {
        SimpleGame.pointerDown = true;
    };
    SimpleGame.onPointerUp = function () {
        SimpleGame.pointerDown = false;
    };
    SimpleGame.checkAssetsLoaded = function () {
        if (SimpleGame.fontsLoadedFlag == false) {
            SimpleGame.myGame.time.events.add(50, function () {
                SimpleGame.checkAssetsLoaded();
            }, this);
        }
        else {
            // SimpleGame.myGame.time.events.add(3000, SimpleGame.addInitScreen, this);
            SimpleGame.addInitScreen();
        }
    };
    SimpleGame.addInitScreen = function () {
        // document.getElementById("bg").parentNode.removeChild(document.getElementById("bg"));
        console.log("add init screen");
        PokiSDK.gameLoadingFinished();
        document.body.addEventListener('click', function () {
            SoundManager.context = new AudioContext();
            // Setup all nodes
            SimpleGame.myGame.sound.context.resume();
        });
        // var splash = document.getElementById('splash')
        // if (splash)
        // {
        // 	splash.parentNode.removeChild(splash)	
        // }	
        // 
        // SimpleGame.logo.visible = false;
        Language.initLanguage();
        // document.getElementById("content").style.backgroundColor = "#ffffff";
        SimpleGame.myGame.time.events.add(250, function () {
            // GameUI.preinitialize();
            if(Util.getStorage("hints") == 0){
                Util.setStorage("hints", 1);
                var tutPrompt = new TutorialPrompt();
            }
        }, this);
        SimpleGame.myGame.time.events.add(0.1, function () {
            // var initmenu = new InitMenuPrompt2()
            SimpleGame.startGame();
        }, this);
    };
    SimpleGame.updateBgImg = function () {
        SimpleGame.game_bg_landscape.destroy();
        SimpleGame.game_bg_portrait.destroy();
        SimpleGame.game_bg_landscape = SimpleGame.myGame.add.sprite(0, 0, SimpleGame.landscape_backroundNameArray[GameContext.backgroundSelected], '', SimpleGame.backgroundLayer);
        SimpleGame.game_bg_landscape.visible = false;
        SimpleGame.game_bg_portrait = SimpleGame.myGame.add.sprite(0, 0, SimpleGame.landscape_backroundNameArray[GameContext.backgroundSelected], '', SimpleGame.backgroundLayer);
        SimpleGame.game_bg_portrait.visible = false;
    };
    SimpleGame.startGame = function (firstGame) {
        if (firstGame === void 0) { firstGame = true; }
        console.log("start game called");
        if (firstGame) {
            ResizeManager.update();
            SimpleGame.gameEngineStarted = true;
            SimpleGame.game_bg_landscape.visible = true;
            // SimpleGame.logo.visible = false;
            Card.Init();
            GameUI.initialize();
            // BoardManager.InitializeBoard();
            GameUI.promptLayer.removeAll(true);
            if (SimpleGame.allCardsPreloaded == false) {
                // SimpleGame.spinnerAnim.visible = true
            }
            // SimpleGame.myGame.add.sprite(SimpleGame.)
            // BoardManager.InitializeBoard();
            // var newgame:NewGamePrompt = new NewGamePrompt()
            BoardManager.InitializeBoard();
            if (SimpleGame.myGame.device.safari == false && SimpleGame.myGame.device.firefox == false && SimpleGame.myGame.input.touch && (SimpleGame.myGame.device.android || SimpleGame.myGame.device.iOS)) {
                SimpleGame.myGame.input.mouse.stop();
            }
            else if (SimpleGame.myGame.device.safari == false && SimpleGame.myGame.device.firefox == false && SimpleGame.myGame.device.ie == false && SimpleGame.myGame.input.touch) {
                SimpleGame.myGame.input.mouse.stop();
            }
        }
        else {
            GameUI.resetMenuButton();
            GameUI.reinitData();
            BoardManager.InitializeBoard();
        }
        // if (SimpleGame.myGame.device.firefox)
        // {
        // 	SimpleGame.myGame.input.mouse.start()
        // }
    };
    SimpleGame.prototype.update = function () {
        this.game.time.desiredFps = this.game.time.suggestedFps;
        if (this.game.time.desiredFps < 60) {
            this.game.time.desiredFps = 60;
        }
        this.game.time.desiredFps = 144;
        if (SoundButton.soundFlagChecked) {
            if (SoundButton.soundFlag) {
                Util.setStorage("soundFlag", 1);
            }
            else {
                Util.setStorage("soundFlag", 0);
            }
        }
        if (BoardManager.autoHintFlag) {
            // BoardManager.Hint()
        }
        // 
        if (SoundManager.context) {
            // 
        }
        // 
        if (GameUI.promptLayer != null) {
            // 
            if (GameUI.promptLayer.length > 0) {
                // 
                // document.getElementById("header1").style.color = "#4a340b";
                // GameUI.gameTitleTxt.addColor("#4a340b")
            }
            else {
                // 
                // document.getElementById("header1").style.color = "#f7ad24";
            }
        }
        ResizeManager.update();
        // if (this.whitefg)
        // {
        // 	this.game.world.bringToTop(this.whitefg)
        // }
        if (this.turnImage) {
            // this.turnImage.bringToTop()
        }
        // 
        if (SimpleGame.gameEngineStarted == false)
            return;
        this.ticks++;
        var i = Card.cardArray.length;
        var selectedCardExists = false;
        while (i-- > 0) {
            Card.cardArray[i].update();
            if (Card.cardArray[i].selectedFlag) {
                selectedCardExists = true;
            }
        }
        if (GameUI.promptLayer.countLiving() > 0) {
            //   
            // SimpleGame.myGame.input.mspointer.capture = false;
            if (this.ticks % 120 == 1) {
                // SimpleGame.myGame.input.reset();
                // 
            }
        }
        else {
            // SimpleGame.myGame.input.mspointer.capture = false;
        }
        GameUI.update();
        SimpleGame.myGame.input.update();
        BoardManager.update();
        // 
        // SimpleGame.myGame.input.mouse.enabled = !SimpleGame.myGame.device.mspointer;
        // this.game.debug.text("" + this.game.time.fps, 2, 14, "#00ff00"); 
        //  
        var mouseIsMovedWithinGame;
        if (this.lastMouseCoordX != SimpleGame.myGame.input.x || this.lastMouseCoordY != SimpleGame.myGame.input.y) {
            mouseIsMovedWithinGame = true;
            this.mouseMovedWithinGameTicks++;
        }
        else {
            mouseIsMovedWithinGame = false;
            this.mouseMovedWithinGameTicks = 0;
        }
        this.lastMouseCoordX = SimpleGame.myGame.input.x;
        this.lastMouseCoordY = SimpleGame.myGame.input.y;
        if (SimpleGame.pointerDown == false && this.mouseMovedWithinGameTicks > 5 && SimpleGame.myGame.input.activePointer.withinGame == false) {
            // SimpleGame.unselectAllCards = true;
        }
        else {
            // SimpleGame.unselectAllCards = false;
        }
        // 
        // 
    };
    SimpleGame.fontsLoadedFlag = false;
    SimpleGame.gameEngineStarted = false;
    SimpleGame.allCardsPreloaded = false;
    SimpleGame.unselectAllCards = false;
    SimpleGame.isReleaseVersion = false;
    SimpleGame.pointerDown = false;
    SimpleGame.backroundNameArray = ["bg", "bg2", "bg3", "bg4"];
    SimpleGame.landscape_backroundNameArray = ["bg_landscape", "bg2_landscape", "bg3_landscape", "bg4_landscape"];
    return SimpleGame;
}());
function onLogoClicked() {
    // 
    // var card:Card = new Card(1,2);
    // this.game.scale.startFullScreen();
}
// when the page has finished loading, create our game
window.onload = function () {
    var game = new SimpleGame();
};
var GameContext = /** @class */ (function () {
    function GameContext() {
    }
    GameContext.commercialBreak = function () {
        this.gameplayStopped();
        // SoundManager.music.stop()
        PokiSDK.commercialBreak().then(function () {
            console.log("Commercial break finished, proceeding to game");
            GameContext.gameplayStarted();
        });
    };
    GameContext.magicWand = function () {
        this.gameplayStopped();
        console.log("magic wand called");
        // SoundManager.music.stop()
        PokiSDK.rewardedBreak().then(
        	(success) =>
         	{
         		console.log("rewarded break finished");
         		GameContext.gameplayStarted()
        		if (success)
        		{
         			console.log("do magic wand")
         			// SoundManager.music.loopFull()
         			SimpleGame.myGame.time.events.add(100, function ()
         			{
         				BoardManager.magicWand()
         			}, this)
         		}
         		else
         		{
         			console.log("video not displayed")
         			// SoundManager.music.loopFull()
         			// video not displayed, should probably not give reward
         		}
         	}
         );
    };
    GameContext.shuffleInit = function () {
        this.gameplayStopped();
        BoardManager.ShuffleInit();
        // SoundManager.music.stop()
         PokiSDK.rewardedBreak().then(
         	(success) =>
         	{
         		GameContext.gameplayStarted()
         		if (success)
         		{
         			// SoundManager.music.loopFull()
         			SimpleGame.myGame.time.events.add(100, function ()
         			{
         				BoardManager.ShuffleInit()
         			}, this)
         		}
         		else
         		{
         			// SoundManager.music.loopFull()
         			// video not displayed, should probably not give reward
         		}
         	}
         );
    };
    GameContext.gameplayStopped = function () {
        console.log("gameplay active: " + GameContext.gameplayActive);
        if (GameContext.gameplayActive) {
            GameContext.gameplayActive = false;
            PokiSDK.gameplayStop();
        }
    };
    GameContext.gameplayStarted = function () {
        if (GameContext.gameplayActive == false) {
            GameContext.gameplayActive = true;
            PokiSDK.gameplayStart();
        }
    };
    GameContext.loadGameContext = function () {
        // GameUI.scoreVegasCumulative = Util.getStorage("SLTR_scorevegascumul", 0)
        this.gameMode = Util.getStorage("SLTR_gameMode", 0);
        this.drawCardNum = Util.getStorage("SLTR_drawCardNum", 1);
        BoardManager.isRightHandedGame = Util.getStorage("SLTR_isRightHanded", 0) ? true : false;
        this.showTopTUI = Util.getStorage("SLTR_showtopui", 1) ? true : false;
        this.autoHintsFlag = Util.getStorage("SLTR_autohints", 0) ? true : false;
        this.autoHintsFlag = false;
        SoundButton.soundFlag = Util.getStorage(Consts.soundFlag, 1) ? true : false;
        this.frontDeckSelected = Util.getStorage("SLTR_frontDeckSelected", 0);
        this.backDeckSelected = Util.getStorage("SLTR_backDeckSelected", 0);
        this.backgroundSelected = Util.getStorage("SLTR_backgroundSelected", 0);
        this.hintsLeft = Util.getStorage("SLTR_hintsleft", 5);
        console.log("hints left: " + this.hintsLeft);
        // this.gameMode = this.GAME_MODE_VEGAS
    };
    GameContext.saveGameContext = function () {
        // 
        // Util.setStorage("SLTR_scorevegascumul", GameUI.scoreVegasCumulative)
        Util.setStorage("SLTR_hintsleft", this.hintsLeft);
        Util.setStorage("SLTR_gameMode", this.gameMode);
        Util.setStorage("SLTR_drawCardNum", this.drawCardNum);
        Util.setStorage("SLTR_isRightHanded", BoardManager.isRightHandedGame ? 1 : 0);
        Util.setStorage("SLTR_showtopui", this.showTopTUI ? 1 : 0);
        Util.setStorage("SLTR_autohints", this.autoHintsFlag ? 1 : 0);
        Util.setStorage(Consts.soundFlag, SoundButton.soundFlag ? 1 : 0);
        Util.setStorage("SLTR_frontDeckSelected", this.frontDeckSelected);
        Util.setStorage("SLTR_backDeckSelected", this.backDeckSelected);
        Util.setStorage("SLTR_backgroundSelected", this.backgroundSelected);
    };
    GameContext.changeGameMode = function (modeToStart) {
        this.gameMode = modeToStart;
        this.saveGameContext();
    };
    GameContext.drawCardNum = 1;
    GameContext.gameMode = 0;
    GameContext.GAME_MODE_STANDARD = 0;
    GameContext.GAME_MODE_VEGAS = 1;
    GameContext.GAME_MODE_VEGAS_CUMUL = 2;
    GameContext.gameplayActive = false;
    GameContext.hintsLeft = 5;
    return GameContext;
}());
var GameUI = /** @class */ (function () {
    function GameUI() {
    }
    GameUI.initialize = function () {
        GameUI.gameStarted = false;
        GameUI.uiLayer = SimpleGame.myGame.add.group();
        GameUI.uiLayerButtons = SimpleGame.myGame.add.group();
        GameUI.promptLayer = SimpleGame.myGame.add.group();
        GameUI.promptHolder = SimpleGame.myGame.add.group(GameUI.promptLayer);
        GameUI.topLayer = SimpleGame.myGame.add.group();
        GameUI.uiAreaBackground = SimpleGame.myGame.make.graphics(0, 0);
        GameUI.uiAreaBackground1 = SimpleGame.myGame.make.graphics(0, 0);
        GameUI.initializeBackgroundBar();
        SimpleGame.spinnerAnim = SimpleGame.myGame.add.sprite(0, 0, "spinner");
        SimpleGame.spinnerAnim.anchor.set(0.75, 0.75);
        SimpleGame.spinnerAnim.scale.set(0.8, 0.8);
        SimpleGame.spinnerAnim.animations.add('play', Phaser.Animation.generateFrameNames('frame-', 0, 28, ''), 10, true, false);
        SimpleGame.spinnerAnim.animations.play('play');
        SimpleGame.spinnerAnim.visible = false;
        var i = 8;
        while (i-- > 0) {
            var foundationBottom = SimpleGame.myGame.make.sprite(Math.floor(Card.CARD_FOUND_POS_X_INIT) - Math.floor(Card.CARD_FOUND_POS_X_DELTA) * i, Card.CARD_FOUND_POS_Y_INIT, "home_bg");
            // Card.backgroundLayer.add(foundationBottom)
            // foundationBottom.scale.set(1/0.85)
            foundationBottom.anchor.set(0.5, 0.5);
            // foundationBottom.scale.set(Card.FOUNDATION_SCALE)
            // SimpleGame.myGame.renderer.renderSession.roundPixels = false;
        }
        var i = 10;
        this.tableuBottomArray = [];
        while (i-- > 0) {
            var cardTabPosXInit = Card.LANDSCAPE_CARD_TAB_POS_X_INIT;
            var cardTabPosXDelta = Card.LANDSCAPE_CARD_TAB_POS_X_DELTA;
            if (SimpleGame.myGame.scale.isGamePortrait) {
                var cardTabPosXInit = Card.PORTRAIT_CARD_TAB_POS_X_INIT;
                var cardTabPosXDelta = Card.PORTRAIT_CARD_TAB_POS_X_DELTA;
            }
            var cardTabPosYInit = Card.LANDSCAPE_CARD_TAB_POS_Y_INIT;
            var cardTabPosYDelta = Card.LANDSCAPE_CARD_TAB_POS_Y_DELTA;
            if (SimpleGame.myGame.scale.isGamePortrait) {
                var cardTabPosYInit = Card.PORTRAIT_CARD_TAB_POS_Y_INIT;
                var cardTabPosYDelta = Card.PORTRAIT_CARD_TAB_POS_Y_DELTA;
            }
            var tableuBottom = SimpleGame.myGame.make.sprite(cardTabPosXInit + cardTabPosXDelta * i, cardTabPosYInit, "under_cards");
            Card.backgroundLayer.add(tableuBottom);
            tableuBottom.width = 98;
            tableuBottom.height = 137;
            tableuBottom.anchor.set(0.5, 0.5);
            this.tableuBottomArray.push(tableuBottom);
        }
        GameUI.scoreTxt = SimpleGame.myGame.make.text(440, 31, "0500", { font: "18px Overpass", fill: "#faf5f2", fontWeight: "500", align: "Right" });
        GameUI.stepsText = SimpleGame.myGame.make.text(440, 31, "0500", { font: "18px Overpass", fill: "#faf5f2", fontWeight: "500", align: "Right" });
        GameUI.timeTxt = SimpleGame.myGame.make.text(440, 31, "0500", { font: "18px Overpass", fill: "#faf5f2", fontWeight: "500", align: "Right" });
        GameUI.bestScoreTxt = SimpleGame.myGame.make.text(440, 24, "0500", { font: "22px Arimo", fill: "#ffd1b9", fontWeight: "700", align: "Right" });
        GameUI.gameTitleTxt = SimpleGame.myGame.make.text(440, 24, Language.SPIDER_SOLITAIRE[Language.langIdx], { font: "26px Arimo", fill: "#f7ad24", fontWeight: "700", align: "Right" });
        GameUI.scoreTxt.anchor.set(0.5, 0);
        GameUI.stepsText.anchor.set(0.5, 0);
        GameUI.timeTxt.anchor.set(0.5, 0);
        GameUI.bestScoreTxt.anchor.set(0.5, 0.5);
        GameUI.gameTitleTxt.anchor.set(0.5, 0.5);
        GameUI.gameTitleTxt.y -= 1;
        // GameUI.bestScoreTxt.anchor.set(1,0.5);
        GameUI.microsoft = SimpleGame.myGame.make.graphics(0, 0);
        GameUI.microsoft.beginFill(0xffffff);
        GameUI.microsoft.drawRect(SimpleGame.myGame.width * 0.5 - 150, SimpleGame.myGame.height - 40, 300, 40);
        GameUI.microsoft.endFill();
        GameUI.microsoft.alpha = 0.01;
        GameUI.menuButton = SimpleGame.myGame.make.graphics(0, 0);
        GameUI.menuButton.beginFill(0xffffff);
        GameUI.menuButton.drawRect(0, 2, 60, 40);
        GameUI.menuButton.endFill();
        GameUI.menuButton.inputEnabled = false;
        GameUI.menuButton.events.onInputDown.add(GameUI.onMenuButtonPressed, this);
        GameUI.menuButton.events.onInputOver.add(function () {
            SimpleGame.myGame.canvas.style.cursor = "pointer";
        }, GameUI.menuButton);
        GameUI.menuButton.events.onInputOut.add(function () {
            SimpleGame.myGame.canvas.style.cursor = "default";
        }, GameUI.menuButton);
        GameUI.menuButton.alpha = 0.01;
        // GameUI.menuButton.input.useHandCursor = true;
        // GameUI.menuButton.input.useHandCursor = true;
        // GameUI.uiLayer.add(GameUI.menuButton)
        window.addEventListener("click", onWindowClicked);
        GameUI.hintBigBut = SimpleGame.myGame.make.graphics(0, 0);
        GameUI.hintBigBut.beginFill(0xffffff);
        GameUI.hintBigBut.drawRect(340, 490, 200, 120);
        GameUI.hintBigBut.endFill();
        GameUI.hintBigBut.inputEnabled = true;
        GameUI.hintBigBut.events.onInputDown.add(BoardManager.Hint, this);
        // GameUI.uiLayer.add(GameUI.hintBigBut)
        GameUI.hintBigBut.alpha = 0.01;
        GameUI.hintBigBut.input.useHandCursor = true;
        // var menuButPlus:ButtonWithOverState = new ButtonWithOverState(GameUI.uiLayer, "open_menu2", "open_menu2_over", 15, 600-77, function()
        // {
        //     
        //     var mainmenu = new MainMenu()
        // })
        //     var undoButton:ButtonWithOverState = new ButtonWithOverState(GameUI.uiLayer, 'undo', "undo_over", 880/2-201/2, 600-77, function()
        // {
        //     // 
        //     BoardManager.Undo();
        // }  )
        // undoButton.skipClickSound = true;
        // // undoButton.skipMouseOver = true;
        // GameUI.undobutton = undoButton;
        //     var hintButton:ButtonWithOverState = new ButtonWithOverState(GameUI.uiLayer, "button_hint", "button_hint_mouseover", 370, 524, function()
        // {
        //     // CardUtil.getFirstTurnedCardIdx(1)
        //     // CardUtil.getByTabIdxAndPos(1,  CardUtil.getFirstTurnedCardIdx(1)).invertFrontColors()
        //     BoardManager.Hint()
        // })
        var buttondelta = 330;
        var buttoninitx = -610;
        //     var bookmarkbut:ButtonWithOverState = new ButtonWithOverState(GameUI.uiLayer, "button_bookmark", "button_bookmark_over", 500, 500, function()
        // {
        //     window.Bookmark(document.title)
        // })
        // GameUI.bookmarkbut = bookmarkbut;
        // buttonsample2.disable()
        GameUI.uiAreaBackground = SimpleGame.myGame.make.graphics(0, 0);
        GameUI.uiAreaBackground1 = SimpleGame.myGame.make.graphics(0, 0);
        GameUI.smalluiAreaBackground = SimpleGame.myGame.make.graphics(0, 0);
        GameUI.smalluiAreaBackground1 = SimpleGame.myGame.make.graphics(0, 0);
        GameUI.initializeBackgroundBar();
        // GameUI.uiLayer.add(  GameUI.menuTxt)
        GameUI.uiLayer.add(GameUI.uiAreaBackground);
        GameUI.uiLayer.add(GameUI.uiAreaBackground1);
        GameUI.uiLayer.add(GameUI.scoreTxt);
        GameUI.uiLayer.add(GameUI.timeTxt);
        GameUI.uiLayer.add(GameUI.stepsText);
        GameUI.uiLayer.add(GameUI.bestScoreTxt);
        GameUI.uiLayer.add(GameUI.gameTitleTxt);
        // GameUI.uiLayer.add(GameUI.menuButton)
        GameUI.uiLayer.add(GameUI.microsoft);
        SimpleGame.myGame.time.events.loop(1000, GameUI.onSecondTick, this);
        GameUI.reinitData();
        SimpleGame.myGame.time.events.add(7000, function () {
            // var areyousure = new AreYouSurePrompt(AreYouSurePrompt.TYPE_RESTART_GAME)
            // var gamewonprompt = new GameWonPrompt2(true)
            // var stats = new StatisticsPrompt()
            //   var cannotuncover = new CannotUncoverStock()
            // var newgame2 = new NewGamePrompt2()
        }, this);
        // var gamewon = new GameWonAnim(GameUI.uiLayer,400,500)
        GameUI.scoreTxt.text = "Score: " + GameUI.scoreTotal;
        if (Language.FRENCH)
            GameUI.stepsText.text = "" + GameUI.moves + " Déplacements";
        else
            GameUI.stepsText.text = "" + GameUI.moves + " Moves";
        GameUI.scoreTxt.x = Math.round(GameUI.scoreTxt.x);
        GameUI.stepsText.x = Math.round(GameUI.stepsText.x);
        GameUI.scoreTxt.y = Math.round(GameUI.scoreTxt.y);
        GameUI.stepsText.y = Math.round(GameUI.stepsText.y);
        this.update();
        this.reinitData();
        var gameUIBottom = new GameUIBottom();
        SimpleGame.myGame.time.events.add(3000, function () {
            // var gameover:GameOverPrompt = new GameOverPrompt(10, 10, 10)
            // var gameover: GameOverPrompt = new GameOverPrompt(0, 0, 0)
        });
    };
    GameUI.initializeBackgroundBar = function () {
        // 
        if (GameUI.smalluiAreaBackground == null)
            return;
        GameUI.uiAreaBackground.alpha = 0.99;
        GameUI.smalluiAreaBackground.clear();
        GameUI.smalluiAreaBackground.clear();
        if (ResizeManager.screenType == ResizeManager.SCREEN_TYPE_DESKTOP) {
            var smalluiareaheight = 40;
        }
        else if (ResizeManager.screenType == ResizeManager.SCREEN_TYPE_MOBILE_PORTAIT && SimpleGame.myGame.device.iPhone) {
            var smalluiareaheight = 40;
        }
        // else if (ResizeManager.screenType == ResizeManager.SCREEN_TYPE_MOBILE_PORTAIT && SimpleGame.myGame.device.mobileSafari && SimpleGame.myGame.device.iPhone == false)
        // {
        //     
        //     var smalluiareaheight:number = 96;
        // }
        else {
            var smalluiareaheight = 40;
        }
        smalluiareaheight = ResizeManager.deviceWidth / 15;
        if (GameUI.scoreTxt != null) {
            smalluiareaheight = GameUI.scoreTxt.height;
        }
        // 
        GameUI.smalluiAreaBackground.beginFill(0x000000);
        GameUI.smalluiAreaBackground.drawRect(-ResizeManager.deviceWidth, 0, 2 * ResizeManager.deviceWidth, smalluiareaheight);
        GameUI.smalluiAreaBackground.endFill();
        GameUI.smalluiAreaBackground1.beginFill(0x000000);
        GameUI.smalluiAreaBackground1.drawRect(-ResizeManager.deviceWidth, smalluiareaheight, 2 * ResizeManager.deviceWidth, 1);
        GameUI.smalluiAreaBackground1.endFill();
        GameUI.uiAreaBackground.clear();
        GameUI.uiAreaBackground1.clear();
        GameUI.uiAreaBackground.beginFill(0x000000);
        GameUI.uiAreaBackground.drawRect(-ResizeManager.deviceWidth, 0, 2 * ResizeManager.deviceWidth, smalluiareaheight);
        GameUI.uiAreaBackground.endFill();
        GameUI.uiAreaBackground1.beginFill(0x000000);
        GameUI.uiAreaBackground1.drawRect(-ResizeManager.deviceWidth, smalluiareaheight, 2 * ResizeManager.deviceWidth, 1);
        GameUI.uiAreaBackground1.endFill();
        GameUI.smalluiAreaBackground.alpha = 0.6;
        GameUI.smalluiAreaBackground1.alpha = 0.6;
        GameUI.uiAreaBackground.alpha = 0.6;
        GameUI.uiAreaBackground1.alpha = 0.6;
    };
    GameUI.resetMenuButton = function () {
        GameUI.menuButton.input.reset();
        GameUI.menuButton.inputEnabled = true;
        GameUI.menuButton.events.onInputDown.add(GameUI.onMenuButtonPressed, this);
        GameUI.menuButton.events.onInputOver.add(function () {
            SimpleGame.myGame.canvas.style.cursor = "pointer";
        }, GameUI.menuButton);
        GameUI.menuButton.events.onInputOut.add(function () {
            SimpleGame.myGame.canvas.style.cursor = "default";
        }, GameUI.menuButton);
        GameUI.uiLayer.add(GameUI.menuButton);
    };
    GameUI.resetUI = function () {
        GameUI.reinitData();
    };
    GameUI.onSecondTick = function () {
        // 
        // 
        if (GameUI.gameStarted && GameUI.initialMoveMade && GameUI.promptLayer.children.length <= 0) {
            GameUI.time++;
            var currentTime = GameUI.gameTime - GameUI.time;
            if (currentTime <= 10 && currentTime >= 1) {
                // SoundManager.beep.play()
            }
        }
        if (MainMenu.onscreen == false && SettingsPrompt.onScreen == false && MenuPrompt.onScreen == false) {
            GameUI.secondsWithoutClick++;
        }
        if (GameUI.secondsWithoutClick > 5 && GameContext.autoHintsFlag && BoardManager.magicWandInProgress == false && TutorialPrompt1.onScreen == false) {
            BoardManager.Hint(true);
            GameUI.secondsWithoutClick = 0;
        }
    };
    GameUI.reinitData = function () {
        GameUI.score = 500;
        GameUI.time = 0;
        GameUI.moves = 0;
        GameUI.scoreTotal = GameUI.score;
        GameUI.gameStarted = true;
        GameUI.initialMoveMade = false;
    };
    GameUI.update = function () {

        GameUI.scoreTotal = GameUI.score + 100 * CardUtil.getFreeFoundationIdx();
        if (GameOverPrompt.onScreen == true){
            GameUI.scoreTotal = GameUI.score + 100 * 8;
        }
                    
        var bonus = 750 - GameUI.time;
        if (bonus < 0)
            bonus = 0;
        GameUI.bonus = bonus;
        var currentTime = GameUI.time;
        var cardTabPosXInit = Card.LANDSCAPE_CARD_TAB_POS_X_INIT;
        var cardTabPosXDelta = Card.LANDSCAPE_CARD_TAB_POS_X_DELTA;
        if (SimpleGame.myGame.scale.isGamePortrait) {
            var cardTabPosXInit = Card.PORTRAIT_CARD_TAB_POS_X_INIT;
            var cardTabPosXDelta = Card.PORTRAIT_CARD_TAB_POS_X_DELTA;
        }
        var cardTabPosYInit = Card.LANDSCAPE_CARD_TAB_POS_Y_INIT;
        var cardTabPosYDelta = Card.LANDSCAPE_CARD_TAB_POS_Y_DELTA;
        if (SimpleGame.myGame.scale.isGamePortrait) {
            var cardTabPosYInit = Card.PORTRAIT_CARD_TAB_POS_Y_INIT;
            var cardTabPosYDelta = Card.PORTRAIT_CARD_TAB_POS_Y_DELTA;
        }
        var i = this.tableuBottomArray.length;
        while (i-- > 0) {
            // 
            this.tableuBottomArray[i].x = cardTabPosXInit + cardTabPosXDelta * i;
            this.tableuBottomArray[i].y = cardTabPosYInit;
        }
        var bestScore = Util.getStoragePerDifficulty("bestScore1", 0);
        if (bestScore < GameUI.scoreTotal) {
            // 
            Util.setStoragePerDifficulty("bestScore1", GameUI.scoreTotal);
        }
        
        if (ResizeManager.deviceWidth > 500) {
            GameUI.bestScoreTxt.text = Language.best_score[Language.langIdx] + bestScore;
            GameUI.timeTxt.text = Util.convertToHHMMSS(currentTime);
            GameUI.scoreTxt.text =( Language.SCORE[Language.langIdxx] ?  Language.SCORE[Language.langIdx] : 'Score: ') + GameUI.scoreTotal;
            if (Language.FRENCH)
                GameUI.stepsText.text = "" + GameUI.moves + " Déplacements";
            else
                GameUI.stepsText.text = "" + GameUI.moves + " Moves";
        } else {
            GameUI.bestScoreTxt.text = "" + bestScore;
            GameUI.timeTxt.text = "" + Util.convertToHHMMSS(currentTime);
            GameUI.scoreTxt.text = "" + GameUI.scoreTotal;
            
            if (Language.FRENCH)
                GameUI.stepsText.text = "" + GameUI.moves + " Déplacements";
            else
                GameUI.stepsText.text = "" + GameUI.moves + " Moves";
        }
        if (GameUI.secondsWithoutClick > 5 && BoardManager.autoHintFlag && BoardManager.magicWandInProgress == false && TutorialPrompt1.onScreen == false) {
            BoardManager.Hint(true);
            GameUI.secondsWithoutClick = 0;
        }
        if (BoardManager.undoDisabled) {
            // GameUI.undobut.disable()
            // GameUI.undobut.enable()
        }
        else {
            // GameUI.undobut.enable() 
        }
    };
    GameUI.onMenuButtonPressed = function () {
        if (GameUI.gameStarted == false)
            return;
        var mainmenu = new MainMenu();
        // GameUI.menuButton.input.useHandCursor = false;
        GameUI.menuButton.input.reset();
        SimpleGame.myGame.canvas.style.cursor = "default";
        SoundManager.playClick();
    };
    GameUI.microsoftPressed = false;
    GameUI.gameStarted = false;
    GameUI.initialMoveMade = false;
    GameUI.secondsWithoutClick = 0;
    return GameUI;
}());
function onWindowClicked() {
    if (GameUI.microsoftPressed) {
    }
    // if (InitMenuPrompt.startFullScreen && SimpleGame.myGame.device.desktop == false)
    // {
    //     SimpleGame.myGame.scale.startFullScreen();
    //     SimpleGame.myGame.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL
    // }
    if (SimpleGame.myGame.device.android == true && SimpleGame.myGame.device.desktop == false && SimpleGame.myGame.scale.isFullScreen == false) {
        // SimpleGame.myGame.scale.startFullScreen(true, false)
        // SimpleGame.myGame.scale.fullScreenScaleMode = Phaser.ScaleManager.RESIZE
    }
    // SimpleGame.myGame.input.reset()
    if (SimpleGame.myGame.input.activePointer.isMouse == false)
        SimpleGame.myGame.input.reset();
}
function onmicrosoftDown() {
    GameUI.microsoftPressed = true;
}
function onmicrosoftUp() {
    SimpleGame.myGame.time.events.add(350, function () {
        GameUI.microsoftPressed = false;
    });
}
var GameUIBottom = /** @class */ (function () {
    function GameUIBottom() {
        GameUIBottom.myRef = this;
        window.addEventListener("resize", this.resizeF.bind(this));
        this.myGroup = SimpleGame.myGame.add.group();
        this.sideGroup = SimpleGame.myGame.add.group();
        this.myBgGroup = SimpleGame.myGame.add.group(this.myGroup);
        console.log("added side tooltip");
        var sidett = new SideTooltip('wand_button', 1, this.sideGroup, function () {
            if (BoardManager.gameOverFlag)
                return;
            // if (EndGame.inProgress) return;
            if (BoardManager.magicWandInProgress)
                return;
            // if (BoardManager.shuffleInProgress) return;
            // WatchAdPrompt.display()
            GameContext.magicWand();
        }.bind(this));
        this.sidett = sidett;
        if (SimpleGame.myGame.scale.isGamePortrait) {
            var iconBgWidth = ResizeManager.deviceWidth;
            var iconBgHeight = ResizeManager.deviceHeight * 0.4;
            this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
            this.myIconBg.beginFill(0x000000);
            this.myIconBg.drawRect(0, ResizeManager.deviceHeight * 0.82, iconBgWidth, iconBgHeight);
            this.myIconBg.endFill();
            this.myIconBg.alpha = 0.6;
            var gg1 = new GameUIBottomButton('setting_button', this.myGroup, 0, 0, function () {
                if (GameOverPrompt.onScreen == true)
                    return;
                // if (EndGame.inProgress) return;
                var settings = new SettingsPrompt();
            });
            var gg2 = new GameUIBottomButton('hint_button', this.myGroup, SimpleGame.myGame.width * 0.25, 0, function () {
                if (GameOverPrompt.onScreen == true)
                    return;
                // if (EndGame.inProgress) return;
                BoardManager.Hint();
            }.bind(this));
            var gg3 = new GameUIBottomButton('game_button', this.myGroup, SimpleGame.myGame.width * 0.55, 0, function () {
                if (GameOverPrompt.onScreen == true)
                    return;
                // if (EndGame.inProgress) return;
                SoundManager.playClick();
                var options = new MenuPrompt();
                // add game options
            }.bind(this));
            var gg4 = new GameUIBottomButton('undo_button', this.myGroup, SimpleGame.myGame.width * 0.82, 0, function () {
                if (GameOverPrompt.onScreen == true)
                    return;
                // if (EndGame.inProgress) return;
                BoardManager.Undo();
            }.bind(this));
        }
        else {
            var iconBgWidth = ResizeManager.deviceWidth * 0.15;
            var iconBgHeight = ResizeManager.deviceHeight * 0.3;
            this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
            this.myIconBg.beginFill(0x000000);
            this.myIconBg.drawRoundedRect(ResizeManager.deviceWidth * 0 - iconBgWidth, ResizeManager.deviceHeight * 0.86, 2 * iconBgWidth, iconBgHeight, 10);
            this.myIconBg.drawRoundedRect(ResizeManager.deviceWidth * 0.85, ResizeManager.deviceHeight * 0.86, 2 * iconBgWidth, iconBgHeight, 10);
            this.myIconBg.endFill();
            this.myIconBg.alpha = 0.6;
            var gg1 = new GameUIBottomButton('setting_button', this.myGroup, SimpleGame.myGame.width * 0, 0, function () {
                if (GameOverPrompt.onScreen == true)
                    return;
                // if (EndGame.inProgress) return;
                var settings = new SettingsPrompt();
            });
            var gg2 = new GameUIBottomButton('hint_button', this.myGroup, SimpleGame.myGame.width * 0.08, 20000, function () {
                if (GameOverPrompt.onScreen == true)
                    return;
                // if (EndGame.inProgress) return;
                BoardManager.Hint();
            }.bind(this));
            var gg3 = new GameUIBottomButton('game_button', this.myGroup, SimpleGame.myGame.width * 0.86, 0, function () {
                if (GameOverPrompt.onScreen == true)
                    return;
                // if (EndGame.inProgress) return;
                SoundManager.playClick();
                var options = new MenuPrompt();
            }.bind(this));
            var gg4 = new GameUIBottomButton('undo_button', this.myGroup, SimpleGame.myGame.width * 0.93, 0, function () {
                if (GameOverPrompt.onScreen == true)
                    return;
                // if (EndGame.inProgress) return;
                BoardManager.Undo();
            }.bind(this));
        }
        this.gg1 = gg1;
        this.gg2 = gg2;
        this.gg3 = gg3;
        this.gg4 = gg4;
        this.hintCounter = SimpleGame.myGame.add.text(this.gg2.myIcon.x + this.gg2.myIcon.width * 0.25, this.gg2.myIcon.y, "5", { font: "36px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.gg2.myGroup);
        // SimpleGame.myGame.add.tween(this.myGroup).to({y:'400'}, 2000, Phaser.Easing.Linear.None, true, 4000)
        GameUIBottom.toggleVisibility();
        var existingContainer = document.getElementById("adContainerPoki3");
        if (existingContainer) {
            existingContainer.parentNode.removeChild(existingContainer);
        }
        var adContainer = document.createElement("div");
        adContainer.setAttribute("id", "adContainerPoki3");
        var perc = (window.innerWidth / 320) / 2 * 100;
        perc = 50 - 320 / window.innerWidth / 2 * 100;
        adContainer.style.position = "absolute";
        adContainer.style.left = "" + Math.floor(perc) + "%";
        adContainer.style.bottom = "0%";
        document.body.appendChild(adContainer);
        PokiSDK.displayAd(adContainer, "320x50");
        this.updateloop = SimpleGame.myGame.time.events.loop(100, this.update, this);
    }
    GameUIBottom.toggleVisibility = function () {
        return;
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.myRef.myGroup.visible = true;
        }
        else {
            this.myRef.myGroup.visible = false;
        }
    };
    GameUIBottom.prototype.update = function (arg0, update, arg2) {
        if (BoardManager.magicWandInProgress)
            return;
        this.hintCounter.text = "" + GameContext.hintsLeft;
        //this.hintCounter.visible = false;
        var arr = BoardManager.getMagicWandArray();
        // 
        var i = arr.length;
        while (i-- > 0) {
            if (arr[i] == null) {
                this.sidett.myGroup.visible = false;
                return;
            }
        }
        if (SimpleGame.myGame.input.activePointer.leftButton.isDown == false) {
            if (BoardManager.getMagicWandArray().length < 13) {
                this.sidett.myGroup.visible = false;
            }
            else {
                this.sidett.myGroup.visible = true;
            }
        }
    };
    GameUIBottom.prototype.destroy = function () {
        this.myIconBg.destroy();
        this.myBgGroup.destroy();
        this.myGroup.destroy();
        this.sideGroup.destroy();
        SimpleGame.myGame.time.events.remove(this.updateloop);
    };
    GameUIBottom.prototype.resizeF = function () {
        this.destroy();
        ResizeManager.update();
        GameUIBottom.myRef = null;
        SimpleGame.myGame.time.events.add(500, function () {
            if (GameUIBottom.myRef == null) {
                var gub = new GameUIBottom();
            }
        }, this);
    };
    GameUIBottom.isVisible = true;
    return GameUIBottom;
}());
var GameWonAnim = /** @class */ (function () {
    function GameWonAnim(parent, x, y) {
        this.colornum = 0;
        this.loopEvent1 = SimpleGame.myGame.time.events.loop(10, this.update1, this);
        this.text = SimpleGame.myGame.make.text(x, y, Language.YOUWONGAME[Language.langIdx], {
            font: "61px Arial", fill: "#000000", fontWeight: "600", align: "Right"
        });
        this.text.anchor.set(0.5, 0.5);
        parent.add(this.text);
    }
    GameWonAnim.prototype.update1 = function () {
        var colors = [
            [0, 167, 33],
            [21, 86, 165],
            [143, 29, 165],
            [255, 0, 0],
            [255, 255, 0]
        ];
        var color_speed = 300;
        this.colornum += 2;
        var t = this.colornum % (colors.length * color_speed);
        var next = (Math.ceil(t / color_speed) < colors.length) ? Math.ceil(t / color_speed) : 0;
        var previous = Math.floor(t / color_speed);
        var dr = (colors[next][0] - colors[previous][0]) / color_speed;
        var dg = (colors[next][1] - colors[previous][1]) / color_speed;
        var db = (colors[next][2] - colors[previous][2]) / color_speed;
        var r = Math.floor(colors[previous][0] + dr * (t % color_speed));
        var g = Math.floor(colors[previous][1] + dg * (t % color_speed));
        var b = Math.floor(colors[previous][2] + db * (t % color_speed));
        var color = this.rgb2hex(r, g, b);
        this.colornum = this.colornum % 0xffffff;
        this.text.addColor(color, 0);
    };
    GameWonAnim.prototype.rgb2hex = function (red, green, blue) {
        var rgb = blue | (green << 8) | (red << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1);
    };
    return GameWonAnim;
}());
/**
 * ...
 * @author
 */
var Language = /** @class */ (function () {
    function Language() {
    }
    Language.initLanguage = function () {
        var url = location.href.toString();
        var languageStr = url.split("lang=")[1];
        if (languageStr == null) {
            languageStr = "en";
        }
        languageStr = languageStr.toUpperCase();
        //  trace(GameContext.pack.getFile("language.xml"));
        // var langXml:Xml = Xml.parse( GameContext.pack.getFile("language.xml").toString() );
        var langXml = SimpleGame.myGame.cache.getXML('language');
        Language.LanguageAbbrevations = [];
        Language.hint = [];
        Language.HOW_TO_PLAY_FULL = [];
        Language.NEW_GAME = [];
        Language.EASY = [];
        Language.NORMAL = [];
        Language.HARD = [];
        Language.PLAY = [];
        Language.TIME = [];
        Language.SCORE = [];
        Language.MENU = [];
        Language.RESUME = [];
        Language.RESTART = [];
        Language.YES = [];
        Language.NO = [];
        Language.KEEP_PLAYING = [];
        Language.ARE_YOU_SURE_RESTART = [];
        Language.ARE_YOU_SURE_NEW = [];
        Language.ARE_YOU_SURE_SHORT = [];
        Language.THERE_MUST_BE_AT_LEAST = [];
        Language.MORE_GAMES = [];
        Language.SOUND_ON = [];
        Language.SOUND_OFF = [];
        Language.MOVES = [];
        Language.YOUWONGAME = [];
        Language.DONTSHOWAGAIN = [];
        Language.STATISTICS = [];
        Language.SPIDER_SOLITAIRE = [];
        Language.ALLTIMESTATS = [];
        Language.playedgames = [];
        Language.wongames = [];
        Language.lostgames = [];
        Language.win_percentage = [];
        Language.top_score = [];
        Language.best_time = [];
        Language.ok = [];
        Language.with_a_score_of = [];
        Language.minutes_played = [];
        Language.themovesyoumade = [];
        Language.youralltimehigh = [];
        Language.replay = [];
        Language.clear = [];
        Language.level = [];
        Language.select_level = [];
        Language.congrats = [];
        Language.timebonus = [];
        Language.yourscore = [];
        Language.illegalmove = [];
        Language.best_score = [];
        Language.youlostgame = [];
        Language.totalscore = [];
        Language.difficulty = [];
        Language.restart_this_game = [];
        Language.difficulty_short = [];
        Language.undo = [];
        Language.least_moves = [];
        Language.highest_score = [];
        Language.cumulative_score = [];
        Language.average_score = [];
        Language.cumulative_time = [];
        Language.average_time = [];
        Language.least_moves_used = [];
        Language.cumulative_moves = [];
        Language.average_moves = [];
        Language.close = [];
        Language.reset = [];
        Language.are_you_sure_clear_stats = [];
        for (var i = 0; i < langXml.getElementsByTagName("language").length; i++) {
            Language.LanguageAbbrevations.push(langXml.getElementsByTagName("language")[i].attributes[0].nodeValue);
            //  Language.HOW_TO_PLAY_FULL.push( Language.getCorrectTranslation("howtoplay", langXml.getElementsByTagName("language")[i]) );
            Language.NEW_GAME.push(Language.getCorrectTranslation("new_game", langXml.getElementsByTagName("language")[i]));
            Language.hint.push(Language.getCorrectTranslation("hint", langXml.getElementsByTagName("language")[i]));
            Language.undo.push(Language.getCorrectTranslation("undo", langXml.getElementsByTagName("language")[i]));
            Language.EASY.push(Language.getCorrectTranslation("easy", langXml.getElementsByTagName("language")[i]));
            Language.NORMAL.push(Language.getCorrectTranslation("normal", langXml.getElementsByTagName("language")[i]));
            Language.HARD.push(Language.getCorrectTranslation("hard", langXml.getElementsByTagName("language")[i]));
            // Language.PLAY.push(Language.getCorrectTranslation("play", langXml.getElementsByTagName("language")[i]) )
            Language.TIME.push(Language.getCorrectTranslation("time", langXml.getElementsByTagName("language")[i]));
            Language.SCORE.push(Language.getCorrectTranslation("SCORE", langXml.getElementsByTagName("language")[i]));
            // Language.MENU.push(Language.getCorrectTranslation("menu", langXml.getElementsByTagName("language")[i]) )
            Language.NO.push(Language.getCorrectTranslation("no", langXml.getElementsByTagName("language")[i]));
            Language.RESTART.push(Language.getCorrectTranslation("restart", langXml.getElementsByTagName("language")[i]));
            Language.YES.push(Language.getCorrectTranslation("yes", langXml.getElementsByTagName("language")[i]));
            Language.NO.push(Language.getCorrectTranslation("no", langXml.getElementsByTagName("language")[i]));
            Language.ARE_YOU_SURE_RESTART.push(Language.getCorrectTranslation("are_you_sure_restart", langXml.getElementsByTagName("language")[i]));
            Language.ARE_YOU_SURE_NEW.push(Language.getCorrectTranslation("are_you_sure_new", langXml.getElementsByTagName("language")[i]));
            Language.ARE_YOU_SURE_NEW.push(Language.getCorrectTranslation("are_you_sure_new", langXml.getElementsByTagName("language")[i]));
            // Language.ARE_YOU_SURE_SHORT.push(Language.getCorrectTranslation("warning", langXml.getElementsByTagName("language")[i]) )
            Language.THERE_MUST_BE_AT_LEAST.push(Language.getCorrectTranslation("there_must_be_at_least", langXml.getElementsByTagName("language")[i]));
            // Language.MORE_GAMES.push(Language.getCorrectTranslation("MORE_GAMES", langXml.getElementsByTagName("language")[i]) )
            Language.SOUND_ON.push(Language.getCorrectTranslation("sound_on", langXml.getElementsByTagName("language")[i]));
            Language.SOUND_OFF.push(Language.getCorrectTranslation("sound_off", langXml.getElementsByTagName("language")[i]));
            Language.MOVES.push(Language.getCorrectTranslation("MOVES", langXml.getElementsByTagName("language")[i]));
            Language.YOUWONGAME.push(Language.getCorrectTranslation("youwongame", langXml.getElementsByTagName("language")[i]));
            Language.SPIDER_SOLITAIRE.push(Language.getCorrectTranslation("spider", langXml.getElementsByTagName("language")[i]));
            Language.difficulty.push(Language.getCorrectTranslation("difficulty", langXml.getElementsByTagName("language")[i]));
            Language.difficulty_short.push(Language.getCorrectTranslation("difficulty_short", langXml.getElementsByTagName("language")[i]));
            Language.restart_this_game.push(Language.getCorrectTranslation("restart_this_game", langXml.getElementsByTagName("language")[i]));
            Language.ok.push(Language.getCorrectTranslation("ok", langXml.getElementsByTagName("language")[i]));
            Language.minutes_played.push(Language.getCorrectTranslation("minutes_played", langXml.getElementsByTagName("language")[i]));
            Language.themovesyoumade.push(Language.getCorrectTranslation("themovesyoumade", langXml.getElementsByTagName("language")[i]));
            Language.yourscore.push(Language.getCorrectTranslation("yourscore", langXml.getElementsByTagName("language")[i]));
            Language.best_time.push(Language.getCorrectTranslation("best_time", langXml.getElementsByTagName("language")[i]));
            Language.least_moves.push(Language.getCorrectTranslation("least_moves", langXml.getElementsByTagName("language")[i]));
            Language.best_score.push(Language.getCorrectTranslation("best_score", langXml.getElementsByTagName("language")[i]));
            Language.STATISTICS.push(Language.getCorrectTranslation("statistics", langXml.getElementsByTagName("language")[i]));
            // Language.youlostgame.push(Language.getCorrectTranslation("youlostgame", langXml.getElementsByTagName("language")[i]) )
            // Language.totalscore.push(Language.getCorrectTranslation("totalscore", langXml.getElementsByTagName("language")[i]) )
            Language.playedgames.push(Language.getCorrectTranslation("games_played", langXml.getElementsByTagName("language")[i]));
            Language.wongames.push(Language.getCorrectTranslation("games_won", langXml.getElementsByTagName("language")[i]));
            Language.lostgames.push(Language.getCorrectTranslation("games_lost", langXml.getElementsByTagName("language")[i]));
            Language.highest_score.push(Language.getCorrectTranslation("highest_score", langXml.getElementsByTagName("language")[i]));
            Language.cumulative_score.push(Language.getCorrectTranslation("cumulative_score", langXml.getElementsByTagName("language")[i]));
            Language.average_score.push(Language.getCorrectTranslation("average_score", langXml.getElementsByTagName("language")[i]));
            Language.cumulative_time.push(Language.getCorrectTranslation("cumulative_time", langXml.getElementsByTagName("language")[i]));
            Language.average_time.push(Language.getCorrectTranslation("average_time", langXml.getElementsByTagName("language")[i]));
            Language.least_moves_used.push(Language.getCorrectTranslation("least_moves_used", langXml.getElementsByTagName("language")[i]));
            Language.cumulative_moves.push(Language.getCorrectTranslation("cumulative_moves", langXml.getElementsByTagName("language")[i]));
            Language.average_moves.push(Language.getCorrectTranslation("average_moves", langXml.getElementsByTagName("language")[i]));
            Language.close.push(Language.getCorrectTranslation("close", langXml.getElementsByTagName("language")[i]));
            Language.reset.push(Language.getCorrectTranslation("reset", langXml.getElementsByTagName("language")[i]));
            Language.DONTSHOWAGAIN.push(Language.getCorrectTranslation("DONTSHOWAGAIN", langXml.getElementsByTagName("language")[i]));
            Language.are_you_sure_clear_stats.push(Language.getCorrectTranslation("are_you_sure_clear_stats", langXml.getElementsByTagName("language")[i]));
        }
        Language.langIdx = Language.LanguageAbbrevations.indexOf(languageStr.toLowerCase());
    };
    Language.getCorrectTranslation = function (s, o) {
        return o.getElementsByTagName(s)[0].textContent;
    };
    Language.FRENCH = navigator.language.substring(0, 2) == 'fr';
    Language.LanguageAbbrevations = ["EN", "NL", "FR", "DE", "IT", "PL"];
    Language.PLAY_SHORT = ["Play", "STARTEN", "JOUER", "Spielen", "Jugar", "Jucati"];
    Language.HOW_TO_PLAY_FULL = ["The goal in this Solitaire game is to move all the cards to the four empty stacks in order from ace to king. You can choose to deal 1 card at a time or 3."];
    return Language;
}());
var ResizeManager = /** @class */ (function () {
    function ResizeManager() {
    }
    ResizeManager.update = function () {
        // return;
        var deviceWidth = window.innerWidth;
        var deviceHeight = window.innerHeight;
        if (window.devicePixelRatio >= 1) {
            var multiplier = window.devicePixelRatio * 0.75;
            // SimpleGame.myGame.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
            var multiplier = window.devicePixelRatio * 0.75;
            SimpleGame.myGame.scale.setGameSize(deviceWidth * multiplier, deviceHeight * multiplier);
            SimpleGame.myGame.scale.refresh();
        }
        if (SimpleGame.game_bg_landscape) {
            SimpleGame.game_bg_landscape.width = deviceWidth;
            SimpleGame.game_bg_landscape.height = deviceHeight;
        }
        if (SimpleGame.game_bg_portrait) {
            SimpleGame.game_bg_landscape.width = deviceWidth;
            SimpleGame.game_bg_landscape.height = deviceHeight;
        }
        if (SimpleGame.myGame.scale.isGameLandscape) {
            SimpleGame.game_bg_landscape.visible = true;
            SimpleGame.game_bg_portrait.visible = false;
        }
        else {
            SimpleGame.game_bg_landscape.visible = false;
            SimpleGame.game_bg_portrait.visible = true;
        }
        if (SimpleGame.myGame.device.desktop == false) {
            // deviceWidth = window.innerWidth * window.devicePixelRatio
            // deviceHeight = window.innerHeight * window.devicePixelRatio
            if (SimpleGame.myGame.width <= SimpleGame.myGame.height) {
                deviceWidth = window.screen.width;
                deviceHeight = window.screen.height;
            }
            else {
                deviceWidth = window.screen.height;
                deviceHeight = window.screen.width;
            }
            deviceWidth = SimpleGame.myGame.width;
            deviceHeight = SimpleGame.myGame.height;
        }
        this.deviceHeight = deviceHeight;
        this.deviceWidth = deviceWidth;
        // 
        // 
        // 
        // ako je ekran siroki onda karte stavi na maxscale
        var cardScaleFromWidth = 1;
        var cardScaleFromHeight = 1;
        if (this.deviceWidth > this.GAME_WIDTH_EXACT) {
            cardScaleFromWidth = 1;
            this.cardAreaBorderX = (this.deviceWidth - this.GAME_WIDTH_EXACT) * 0.5;
        }
        else {
            cardScaleFromWidth = this.deviceWidth / this.GAME_WIDTH_EXACT;
            this.cardAreaBorderX = 0;
        }
        if (this.deviceHeight > this.GAME_HEIGHT_EXACT) {
            cardScaleFromHeight = 1;
            this.cardAreaBorderY = (this.deviceHeight - this.GAME_HEIGHT_EXACT) * 0.5;
        }
        else {
            cardScaleFromHeight = this.deviceHeight / this.GAME_HEIGHT_EXACT;
            this.cardAreaBorderY = 0;
        }
        this.cardScaleFromWidthFlag = false;
        if (cardScaleFromWidth < cardScaleFromHeight) {
            this.cardScaleFromWidthFlag = true;
        }
        // 
        this.cardscale = Math.min(cardScaleFromWidth, cardScaleFromHeight);
        this.cardscale = cardScaleFromWidth;
        if (cardScaleFromWidth > cardScaleFromHeight) {
            this.cardscale = cardScaleFromWidth * 0.95 - 0.25 * (cardScaleFromWidth - cardScaleFromHeight);
        }
        else {
        }
        this.cardScaleFinal = this.cardscale * this.cardscaleExact;
        if (this.deviceWidth > this.GAME_WIDTH_EXACT * this.cardscale) {
            this.cardAreaBorderX = (this.deviceWidth - this.GAME_WIDTH_EXACT * this.cardscale) * 0.5;
        }
        else {
            this.cardAreaBorderX = 0;
        }
        if (this.deviceHeight > this.GAME_HEIGHT_EXACT * this.cardscale) {
            this.cardAreaBorderY = (this.deviceHeight - this.GAME_HEIGHT_EXACT * this.cardscale) * 0.5;
        }
        else {
            this.cardAreaBorderY = 0;
        }
        if (cardScaleFromWidth < cardScaleFromHeight) {
            this.cardscale *= 1.2;
            this.cardAreaBorderX = -this.deviceWidth * 0.05;
            this.cardScaleFinal = this.cardscale * this.cardscaleExact;
        }
        // 
        this.manageCardCoordinates();
        this.manageButtonCoordinates();
        this.manageTxtCoordinates();
        this.managePromptCoordinates();
        var cardHeight = this.cardScaleFinal * 135;
        var deviceHeightCardArea = this.deviceHeight * 0.9 - 100;
        var numCards = deviceHeightCardArea / cardHeight;
        this.dynamicCardYDelta = numCards;
        if (GameUI.uiAreaBackground != null) {
            if (deviceWidth * 2 > GameUI.uiAreaBackground.width) {
                GameUI.initializeBackgroundBar();
            }
        }
        this.manageSocialButtons();
    };
    ResizeManager.manageSocialButtons = function () {
        // var initialScale
        // document.getElementById("gplus").style.left = Math.round(this.deviceWidth * 0.5 - 100-33).toString() + "px";
        // document.getElementById("fblike").style.left = Math.round(this.deviceWidth * 0.5-50-33 ).toString() + "px";
        // document.getElementById("bookmarkbut").style.left = Math.round(this.deviceWidth * 0.5+30-33-2).toString() + "px";
        // document.getElementById("gplus").style.display = "block"
        // document.getElementById("fblike").style.display = "block"
        // document.getElementById("bookmarkbut").style.display = "block"
        // document.getElementById("bannerleftsmall").style.display = "block"
        // document.getElementById("bannerrightsmall").style.display = "block"
        // if (Card.items != null)
        // {
        //     
        //     if (Card.items.x < 280)
        //     {
        //         document.getElementById("bannerleftsmall").style.visibility = "hidden"; 
        //         document.getElementById("bannerrightsmall").style.visibility = "hidden"; 
        //         
        //     }
        //     else
        //     {
        //         document.getElementById("bannerleftsmall").style.visibility = "visible"; 
        //         document.getElementById("bannerrightsmall").style.visibility = "visible"; 
        //     }
        // }
        // if (window.outerHeight < 800)
        // {
        //     document.getElementById("bannerleftsmall").style.visibility = "hidden"; 
        //     document.getElementById("bannerrightsmall").style.visibility = "hidden"; 
        // }
    };
    ResizeManager.managePromptCoordinates = function () {
        if (GameUI.promptLayer != null) {
            GameUI.promptLayer.scale.set(this.cardscale + 0.2 * (1 - this.cardscale));
            GameUI.promptLayer.x = this.deviceWidth / 2;
            GameUI.promptLayer.y = this.deviceHeight / 2;
        }
        // 
    };
    ResizeManager.manageCardCoordinates = function () {
        //    this.cardScaleFinal = 1 // SimpleGame.myGame.renderer.renderSession.roundPixels = false;
        var itemDelta = 0;
        if (this.cardScaleFinal < 0.65) {
            itemDelta = (0.65 - this.cardScaleFinal) * 50;
        }
        if (Card.items != null) {
            // 
            // 
            Card.items.scale.set(this.cardScaleFinal);
            Card.items.x = this.cardAreaBorderX;
            Card.items.y = itemDelta;
            Card.backgroundLayer.scale.set(this.cardScaleFinal);
            Card.backgroundLayer.x = this.cardAreaBorderX;
            Card.backgroundLayer.y = Card.items.y;
            //  
        }
        if (GameUI.topLayer != null) {
            GameUI.topLayer.scale.set(this.cardScaleFinal);
            GameUI.topLayer.x = this.cardAreaBorderX;
            GameUI.topLayer.y = Card.items.y;
        }
        ResizeManager.manageDeltaMultiplier();
    };
    ResizeManager.manageDeltaMultiplier = function () {
        if (Card.cardArray != null && Card.cardArray.length > 0) {
        }
        else {
            return;
        }
        var maxTabPos = -1;
        var maxTabPosCard = null;
        var i = Card.cardArray.length;
        while (i-- > 0) {
            var c = Card.cardArray[i];
            if (c.myState != Card.STATE_TABLEU)
                continue;
            if (c.myState == Card.STATE_DRAGGED || c.selectedFlag)
                continue;
            if (c.tableuPosition > maxTabPos) {
                maxTabPos = c.tableuPosition;
                maxTabPosCard = c;
            }
        }
        if (maxTabPosCard == null)
            return;
        if (0.91 * ResizeManager.deviceHeight < (maxTabPosCard.cardImgFront.height / 2 + maxTabPosCard.cardImgFront.y + Card.items.y) * ResizeManager.cardScaleFinal) {
            Card.deltaMultiplier *= 1.05;
            // this.setToTableu(immediately)
            // return;
        }
        else if (0.85 * ResizeManager.deviceHeight >= (maxTabPosCard.cardImgFront.height / 2 + maxTabPosCard.cardImgFront.y + Card.items.y) * ResizeManager.cardScaleFinal) {
            Card.deltaMultiplier *= 0.95;
        }
        if (Card.deltaMultiplier < 1) {
            Card.deltaMultiplier = 1;
        }
        if (Card.deltaMultiplier > 2) {
            Card.deltaMultiplier = 2;
        }
        // 
    };
    ResizeManager.manageButtonCoordinates = function () {
        if (GameUI.uiLayerButtons != null) {
            // 
            GameUI.uiLayerButtons.scale.set(this.cardscale);
            GameUI.uiLayerButtons.x = this.deviceWidth / 2;
            GameUI.uiLayerButtons.y = 0.91 * this.deviceHeight;
            if (this.cardScaleFromWidthFlag == false) {
                // GameUI.uiLayerButtons.scale.set(1)
            }
        }
        var buttondelta = 327;
        var buttoninitx = -684;
        if (this.cardscale < 1) {
            var cardscaledelta = 1 - this.cardscale;
            buttoninitx = -684 + 100 * cardscaledelta;
            buttondelta = 327 - 100 * cardscaledelta;
        }
        buttoninitx += 6;
        if (GameUI.newgamebut != null) {
            if (buttondelta > GameUI.newgamebut.imgNormal.width + 14) {
                var pixelslost = buttondelta - (GameUI.newgamebut.imgNormal.width + 14);
                // pixelslost *= 3;
                // pixelslost /= 3;
                buttoninitx += pixelslost;
                buttondelta = GameUI.newgamebut.imgNormal.width + 14;
            }
            buttoninitx -= 4;
            // GameUI.newgamebut.x = buttoninitx;
            // GameUI.restartbut.x = buttoninitx + buttondelta;
            // GameUI.statbut.x = buttoninitx + 2*buttondelta;
            // GameUI.undobut.x = buttoninitx + 4.12*buttondelta;
            // GameUI.hintbut.x = buttoninitx + 3*buttondelta;
            // GameUI.soundbut.soundOnBut.setXY(buttoninitx + 5.239*buttondelta, GameUI.soundbut.soundOnBut.y);
            // GameUI.soundbut.soundOffBut.setXY(buttoninitx + 5.239*buttondelta, GameUI.soundbut.soundOnBut.y);
        }
        // if (GameUI.topLayer != null)
        // {
        //     GameUI.topLayer.scale.set(this.cardScaleFinal)
        //     GameUI.topLayer.x = this.cardAreaBorderX;
        //       GameUI.topLayer.y = 20
        // }
    };
    ResizeManager.manageTxtCoordinates = function () {
        if (GameUI.stepsText == null)
            return;
        if (GameUI.uiLayer != null) {
            GameUI.uiLayer.scale.set(1);
            GameUI.uiLayer.x = 0;
            GameUI.uiLayer.y = 0;
        }
        var buttondelta = 290;
        var buttoninitx = -580;
        if (this.cardscale < 1) {
            var cardscaledelta = 1 - this.cardscale;
            buttoninitx = -580 + 100 * cardscaledelta;
            buttondelta = 290 - 100 * cardscaledelta;
        }
        if (GameUI.timeTxt != null) {
            GameUI.timeTxt.x = buttoninitx;
            GameUI.stepsText.x = buttoninitx + buttondelta;
            GameUI.gameTitleTxt.x = buttoninitx + 2 * buttondelta;
            GameUI.scoreTxt.x = buttoninitx + 3 * buttondelta;
            GameUI.bestScoreTxt.x = buttoninitx + 4 * buttondelta;
            GameUI.timeTxt.visible = GameUI.stepsText.visible = GameUI.scoreTxt.visible = true;
            GameUI.bestScoreTxt.visible = false;
            // GameUI.gameTitleTxt.visible = true;
            if (this.deviceWidth > 1000) {
                GameUI.timeTxt.fontSize = 30;
                GameUI.stepsText.fontSize = 30;
                GameUI.gameTitleTxt.fontSize = 44;
                GameUI.scoreTxt.fontSize = 30;
                GameUI.bestScoreTxt.fontSize = 30;
                GameUI.gameTitleTxt.visible = true;
                // document.getElementById("header1").style.fontSize = "150%";
                // document.getElementById("header1").style.top = "-10px";
                var deltaXtimescore = (this.deviceWidth - 1024) * 0.33;
                if (deltaXtimescore > 100)
                    deltaXtimescore = 100;
                if (deltaXtimescore < 0)
                    deltaXtimescore = 0;
                GameUI.timeTxt.x = this.deviceWidth / 2 - GameUI.gameTitleTxt.width / 2 - GameUI.timeTxt.width / 2 - 10 - deltaXtimescore;
                GameUI.scoreTxt.x = this.deviceWidth / 2 + GameUI.gameTitleTxt.width / 2 + GameUI.scoreTxt.width / 2 + 10 + deltaXtimescore;
                // GameUI.timeTxt.x = GameUI.scoreTxt.x - GameUI.scoreTxt.width/2 - GameUI.timeTxt.width/2 - 20 - deltaXtimescore;
                if (GameUI.timeTxt.x < GameUI.timeTxt.width / 2 + 10)
                    GameUI.timeTxt.x = GameUI.timeTxt.width / 2 + 10;
                GameUI.gameTitleTxt.x = 0.5 * this.deviceWidth + GameUI.gameTitleTxt.width * 0.005;
                GameUI.bestScoreTxt.x = 0.9 * this.deviceWidth + GameUI.bestScoreTxt.width * 0.005;
                GameUI.gameTitleTxt.y = 31;
            }
            else if (this.deviceWidth > 600) {
                GameUI.timeTxt.fontSize = 32;
                GameUI.stepsText.fontSize = 30;
                GameUI.gameTitleTxt.fontSize = 40;
                GameUI.scoreTxt.fontSize = 32;
                GameUI.bestScoreTxt.fontSize = 30;
                GameUI.bestScoreTxt.visible = false;
                GameUI.gameTitleTxt.visible = true;
                GameUI.timeTxt.x = 0.02 * SimpleGame.myGame.width + GameUI.timeTxt.width / 2;
                GameUI.stepsText.x = 0.7 * this.deviceWidth + GameUI.stepsText.width * 0.005;
                GameUI.gameTitleTxt.x = 0.5 * this.deviceWidth + GameUI.gameTitleTxt.width * 0.005;
                GameUI.scoreTxt.x = 1 * this.deviceWidth - GameUI.scoreTxt.width * (0.66);
                GameUI.scoreTxt.x = 0.9 * SimpleGame.myGame.width - GameUI.scoreTxt.width * (0.01);
                GameUI.scoreTxt.x = 0.98 * SimpleGame.myGame.width - GameUI.scoreTxt.width / 2;
                // GameUI.scoreTxt.x = 1*SimpleGame.myGame.width
                // GameUI.bestScoreTxt.x = 0.9*this.deviceWidth+GameUI.bestScoreTxt.width*0.005;
                GameUI.gameTitleTxt.y = 30;
                GameUI.scoreTxt.y = GameUI.timeTxt.y = 30;
            }
            else {
                GameUI.timeTxt.visible = GameUI.bestScoreTxt.visible = false;
                // 
                // GameUI.gameTitleTxt.visible = false;
                GameUI.timeTxt.x = 0.2 * this.deviceWidth - GameUI.timeTxt.width * 0.005;
                GameUI.stepsText.x = 0.1 * this.deviceWidth + GameUI.stepsText.width * 0.005;
                GameUI.gameTitleTxt.x = 0.5 * this.deviceWidth + GameUI.gameTitleTxt.width * 0.005;
                GameUI.scoreTxt.x = 0.8 * this.deviceWidth + GameUI.scoreTxt.width * 0.005;
                GameUI.bestScoreTxt.x = 0.9 * this.deviceWidth + GameUI.bestScoreTxt.width * 0.005;
                GameUI.gameTitleTxt.y = 24;
                GameUI.gameTitleTxt.visible = false;
                GameUI.timeTxt.visible = true;
                GameUI.gameTitleTxt.y = 30;
                GameUI.scoreTxt.y = GameUI.timeTxt.y = 30;
            }
            if (this.screenType == this.SCREEN_TYPE_MOBILE_LANDSCAPE) {
                GameUI.timeTxt.fontSize = 42;
                GameUI.scoreTxt.fontSize = 42;
                // 
                GameUI.scoreTxt.y = ResizeManager.deviceHeight - 50;
                GameUI.timeTxt.y = GameUI.scoreTxt.y;
                GameUI.scoreTxt.x = ResizeManager.deviceWidth - 60 - GameUI.scoreTxt.width / 2;
                GameUI.timeTxt.x = 60 + GameUI.timeTxt.width / 2;
                if (ResizeManager.screenType == ResizeManager.SCREEN_TYPE_MOBILE_LANDSCAPE && SimpleGame.myGame.device.mobileSafari && SimpleGame.myGame.device.iPhone == false) {
                    // 
                    // GameUI.timeTxt.fontSize = 60;
                    // GameUI.scoreTxt.fontSize = 60;
                }
            }
            else if (this.screenType == this.SCREEN_TYPE_MOBILE_PORTAIT) {
                GameUI.scoreTxt.y = GameUI.timeTxt.y;
            }
            // 
        }
        GameUI.scoreTxt.fontSize = GameUI.timeTxt.fontSize = GameUI.stepsText.fontSize = Math.min(32, this.deviceWidth / 30);
        GameUI.scoreTxt.x = 0.01 * this.deviceWidth;
        GameUI.timeTxt.x = 0.5 * this.deviceWidth;
        GameUI.stepsText.x = 0.99 * this.deviceWidth;
        GameUI.scoreTxt.anchor.set(0, 0);
        GameUI.timeTxt.anchor.set(0.5, 0);
        GameUI.stepsText.anchor.set(1, 0);
        GameUI.scoreTxt.y = GameUI.timeTxt.y = GameUI.stepsText.y = this.deviceWidth / 72;
        GameUI.scoreTxt.y = GameUI.timeTxt.y = GameUI.stepsText.y = 0;
        GameUI.stepsText.visible = true;
        GameUI.gameTitleTxt.visible = false;
        GameUI.initializeBackgroundBar();
        // 
    };
    ResizeManager.getPointerInCardCoordinates = function () {
        var x = (SimpleGame.myGame.input.activePointer.x - this.cardAreaBorderX) / this.cardScaleFinal;
        var y = (SimpleGame.myGame.input.activePointer.y - this.cardAreaBorderY) / this.cardScaleFinal;
        return new Phaser.Point(x, y);
    };
    ResizeManager.cardscale = 1;
    ResizeManager.cardscaleExact = 1;
    ResizeManager.cardScaleFinal = 1;
    ResizeManager.cardAreaBorderX = 0;
    ResizeManager.cardAreaBorderY = 0;
    ResizeManager.GAME_WIDTH_EXACT = 1200;
    ResizeManager.GAME_HEIGHT_EXACT = 940;
    ResizeManager.dynamicCardYDelta = 1;
    ResizeManager.cardScaleFromWidthFlag = false;
    ResizeManager.SCREEN_TYPE_MOBILE_PORTAIT = 0;
    ResizeManager.SCREEN_TYPE_MOBILE_LANDSCAPE = 1;
    ResizeManager.SCREEN_TYPE_DESKTOP = 2;
    return ResizeManager;
}());
var SoundManager = /** @class */ (function () {
    function SoundManager() {
    }
    SoundManager.playClick = function () {
        if (SoundManager.canPlayClick) {
            // SoundManager.click.startTime = 0.1;
            // SoundManager.click.position = SoundManager.click.duration-100;
            // SoundManager.click.update()
            SoundManager.click.play();
            SoundManager.canPlayClick = false;
            // 
            SimpleGame.myGame.time.events.add(100, function () {
                // 
                SoundManager.canPlayClick = true;
            }, this);
        }
    };
    SoundManager.init = function () {
        SoundManager.sManager = new Phaser.SoundManager(SimpleGame.myGame);
        SoundManager.deal1card.allowMultiple = true;
        // SoundManager.hint.volume = 0.27;
        SimpleGame.myGame.sound.volume = 0.7;
    };
    SoundManager.playGrabCard = function () {
        if (SoundManager.canPlayGrab && SoundManager.grabcard.mute == false) {
            //  
            SoundManager.grabcard.play();
            SoundManager.canPlayGrab = false;
            // 
            SimpleGame.myGame.time.events.add(100, function () {
                // 
                SoundManager.canPlayGrab = true;
            }, this);
        }
    };
    SoundManager.setMuteFlags = function (muteFlag) {
        SoundManager.click.mute = muteFlag;
        SoundManager.deal1card.mute = muteFlag;
        SoundManager.Gong01.mute = muteFlag;
        SoundManager.grabcard.mute = muteFlag;
        SoundManager.hint.mute = muteFlag;
        SoundManager.PickNew01.mute = muteFlag;
        SoundManager.PlaceNew01.mute = muteFlag;
        SoundManager.Shuffling01.mute = muteFlag;
        SoundManager.undo.mute = muteFlag;
        SoundManager.RotateNew02.mute = muteFlag;
        SoundManager.valid.mute = muteFlag;
        SoundManager.invalid.mute = muteFlag;
        var i = SoundManager.melodicArr.length;
        while (i-- > 0) {
            SoundManager.melodicArr[i].mute = muteFlag;
        }
    };
    SoundManager.playDealRow = function () {
        SoundManager.timesToPlayDealSound = 10;
        SoundManager.playDealRowSound();
    };
    SoundManager.playDealRowSound = function () {
        // return
        SoundManager.deal1card.position = 200;
        SoundManager.deal1card.update();
        SoundManager.deal1card.play();
        // 
        SoundManager.timesToPlayDealSound--;
        if (SoundManager.timesToPlayDealSound > 0) {
            SimpleGame.myGame.time.events.add(80, function () {
                SoundManager.playDealRowSound();
            });
        }
    };
    SoundManager.timesToPlayDealSound = 10;
    SoundManager.canPlayClick = true;
    SoundManager.canPlayGrab = true;
    return SoundManager;
}());
var Spinner = /** @class */ (function () {
    function Spinner() {
    }
    Spinner.preload = function () {
        // var i = 30;
        // while(i-- > 0)
        // {
        //     SimpleGame.myGame.load.image("spinner" + i, "/assets/spinner/frame-" + i + ".png")
        // }
        SimpleGame.myGame.load.atlasXML("spinner", "assets/spinner/spinner.png", "assets/spinner/spinner.xml");
    };
    return Spinner;
}());
var Trace = /** @class */ (function () {
    function Trace() {
    }
    Trace.TraceCardByIdxAndPos = function (tableIdx, tablePos) {
        var i = Card.cardArray.length;
        while (i-- > 0) {
            var c = Card.cardArray[i];
            if (c.tableuIdx == tableIdx && c.tableuPosition == tablePos) {
                var name = CardUtil.cardNameArray[c.suitIdx * CardUtil.NUM_CARDS_PER_SUIT + c.cardIdx];
            }
        }
    };
    return Trace;
}());
var ButtonMenuPrompt = /** @class */ (function () {
    function ButtonMenuPrompt(parent, x, y, text, onClickFunction) {
        if (onClickFunction === void 0) { onClickFunction = function () {
        }; }
        this.onClickFunction = onClickFunction;
        this.myGroup = SimpleGame.myGame.add.group(parent);
        this.myGroup.x = x;
        this.myGroup.y = y;
        this.buttonBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.buttonBg.beginFill(0x333333);
        this.buttonBg.drawRoundedRect(0, 0, 320, 60, 30);
        this.buttonBg.endFill();
        this.buttonBg.alpha = 1;
        this.buttonBg.inputEnabled = true;
        this.buttonBg.events.onInputDown.add(function () {
            this.onClickFunction();
        }, this);
        this.buttonBg.input.useHandCursor = true;
        this.myTxt = SimpleGame.myGame.add.text(0, 0, text, { font: "32px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        this.myTxt.anchor.set(0.5, 0.5);
        this.myTxt.x += this.buttonBg.width / 2;
        this.myTxt.y += this.buttonBg.height / 2;
        this.myGroup.x -= this.myGroup.width / 2;
        // this.myGroup.y -= this.myGroup.width/2
    }
    return ButtonMenuPrompt;
}());
var ButtonScoringMode = /** @class */ (function () {
    function ButtonScoringMode(parent, x, y) {
        this.STATE_STANDARD = 0;
        this.STATE_VEGAS = 1;
        this.STATE_CUMULATIVE = 2;
        this.myGroup = SimpleGame.myGame.add.group();
        this.myGroup.x = x;
        this.myGroup.y = y;
        parent.add(this.myGroup);
        this.myGroup.scale.set(0.5);
        var standardTxt;
        if(Language.FRENCH)
            standardTxt = SimpleGame.myGame.add.text(0, 0, "Une enseigne", { font: "42px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" });
        else
            standardTxt = SimpleGame.myGame.add.text(0, 0, "One Suit", { font: "54px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" });
        standardTxt.lineSpacing -= 22;
        var vegasTxt;
        if(Language.FRENCH)
            vegasTxt = SimpleGame.myGame.add.text(0, 0, "Deux enseignes", { font: "42px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" });
        else
            vegasTxt = SimpleGame.myGame.add.text(0, 0, "Two Suits", { font: "54px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" });
        vegasTxt.lineSpacing -= 22;
        var cumulativeTxt;
        if(Language.FRENCH)
            cumulativeTxt = SimpleGame.myGame.add.text(0, 0, "Quatre enseignes", { font: "42px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" });
        else
            cumulativeTxt = SimpleGame.myGame.add.text(0, 0, "Four Suits", { font: "42px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" });
        //var cumulativeTxt = SimpleGame.myGame.add.text(0, 0, "Four Suits", { font: "42px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" });
        cumulativeTxt.lineSpacing -= 22;
        this.standardButton = new ButtonWithOverAndText(standardTxt, this.myGroup, 'score_selector_standard', 'score_selector_standard', 200, 100, this.oneSuitClicked.bind(this));
        this.standardButton.text.wordWrap = true;
        this.standardButton.text.wordWrapWidth = 100;
        this.vegasButton = new ButtonWithOverAndText(vegasTxt, this.myGroup, 'score_selector_vegas', 'score_selector_vegas', this.standardButton.imgNormal.x + this.standardButton.imgNormal.width, 100, this.twoSuitClicked.bind(this));
        this.vegasButton.text.wordWrap = true;
        this.vegasButton.text.wordWrapWidth = 100;
        this.vegasCumulButton = new ButtonWithOverAndText(cumulativeTxt, this.myGroup, 'score_selector_cumulative', 'score_selector_cumulative', this.vegasButton.imgNormal.x + this.vegasButton.imgNormal.width, 100, this.fourSuitClicked.bind(this));
        this.vegasCumulButton.text.wordWrap = true;
        this.vegasCumulButton.text.wordWrapWidth = 100;
        this.tintButtons();
    }
    ButtonScoringMode.prototype.tintButtons = function () {
        if (CardUtil.NUM_SUIT_COLORS == 1) {
            this.tintGreen(this.standardButton);
            this.tintGray(this.vegasButton);
            this.tintGray(this.vegasCumulButton);
        }
        else if (CardUtil.NUM_SUIT_COLORS == 2) {
            this.tintGray(this.standardButton);
            this.tintGreen(this.vegasButton);
            this.tintGray(this.vegasCumulButton);
        }
        else {
            this.tintGray(this.standardButton);
            this.tintGray(this.vegasButton);
            this.tintGreen(this.vegasCumulButton);
        }
    };
    ButtonScoringMode.prototype.tintGreen = function (but) {
        but.imgNormal.tint = 0x1b862d;
        but.imgOver.tint = 0x1b862d;
    };
    ButtonScoringMode.prototype.tintGray = function (but) {
        but.imgNormal.tint = 0x333333;
        but.imgOver.tint = 0x333333;
    };
    ButtonScoringMode.prototype.oneSuitClicked = function () {
        CardUtil.NUM_SUIT_COLORS = 1;
        this.tintButtons();
    };
    ButtonScoringMode.prototype.twoSuitClicked = function () {
        CardUtil.NUM_SUIT_COLORS = 2;
        this.tintButtons();
    };
    ButtonScoringMode.prototype.fourSuitClicked = function () {
        CardUtil.NUM_SUIT_COLORS = 4;
        this.tintButtons();
    };
    ButtonScoringMode.myIdx = 0;
    return ButtonScoringMode;
}());
var ButtonTooltop = /** @class */ (function () {
    function ButtonTooltop(x, y, txt, parent) {
        this.framesUntilVisible = 10;
        this.butX = x;
        this.butY = y - 1;
        this.txt = txt;
        this.myGroup = SimpleGame.myGame.add.group(parent);
        this.tooltipTxt = SimpleGame.myGame.make.text(this.butX, this.butY - 41, "" + this.txt, { font: "24px Overpass", fill: "#faf5f2", fontWeight: "700", align: "Right" });
        this.tooltipTxt.x = this.tooltipTxt.x + 20 - this.tooltipTxt.width / 2;
        var tooltipWid = this.tooltipTxt.width + 30;
        if (txt.length > 15) {
            tooltipWid = this.tooltipTxt.width * 1.1;
        }
        this.tooltipBg = SimpleGame.myGame.make.graphics(0, 0);
        this.tooltipBg.beginFill(0x000000);
        if (txt.length > 15) {
            this.tooltipBg.drawRoundedRect(this.butX - this.tooltipTxt.width * 0.05, this.butY - 48, tooltipWid, 40, 4);
        }
        else {
            this.tooltipBg.drawRoundedRect(this.tooltipTxt.x - 15, this.butY - 48, tooltipWid, 40, 4);
        }
        this.tooltipBg.endFill();
        this.tooltipBg.alpha = 0.65;
        this.myGroup.add(this.tooltipBg);
        this.myGroup.add(this.tooltipTxt);
        this.myGroup.update();
        this.tooltipBg.update();
        this.tooltipTxt.update();
        var coordX = parent.x + this.butX + this.tooltipTxt.width;
        if (coordX > SimpleGame.myGame.width + 40) {
            this.myGroup.x -= 10;
        }
        this.myGroup.visible = false;
    }
    ButtonTooltop.update = function () {
        if (this.activeTooltip != null) {
            if (this.activeTooltip.tooltipBg.world.x + this.activeTooltip.butX + this.activeTooltip.tooltipTxt.width > SimpleGame.myGame.width + 40) {
                // 
                this.activeTooltip.myGroup.x -= 10;
            }
            else {
                if (this.activeTooltip.framesUntilVisible-- < 0) {
                    this.activeTooltip.myGroup.visible = true;
                }
            }
        }
    };
    ButtonTooltop.removeTooltip = function () {
        if (this.activeTooltip != null)
            this.activeTooltip.remove();
    };
    ButtonTooltop.prototype.remove = function () {
        this.tooltipBg.destroy();
        this.tooltipTxt.destroy();
        ButtonTooltop.activeTooltip = null;
    };
    ButtonTooltop.showTooltip = function (butX, butY, txt, parent) {
        this.activeTooltip = new ButtonTooltop(butX, butY, txt, parent);
    };
    return ButtonTooltop;
}());
var GameUIBottomButton = /** @class */ (function () {
    function GameUIBottomButton(iconName, parent, x, y, onClickFunction) {
        if (onClickFunction === void 0) { onClickFunction = function () {
        }; }
        this.onClickFunction = onClickFunction;
        this.myGroup = SimpleGame.myGame.add.group(parent);
        this.myGroup.x = x;
        this.myGroup.y = y;
        // 
        var iconBgWidth = 150;
        this.myIcon = SimpleGame.myGame.add.sprite(0, 0, iconName, '', this.myGroup);
        this.myIcon.anchor.set(0.5, 0.5);
        this.myIcon.x = iconBgWidth / 2;
        this.myIcon.y = iconBgWidth / 2;
        this.myIcon.inputEnabled = true;
        this.myIcon.events.onInputDown.add(function () {
            this.onClickFunction();
        }, this);
        this.myIcon.input.useHandCursor = true;
        if (SimpleGame.myGame.scale.isGameLandscape) {
            var myGroupScale = ResizeManager.deviceWidth / 1920;
        }
        else {
            var myGroupScale = ResizeManager.deviceHeight / 1920;
            var myGroupScale = ResizeManager.deviceHeight / 1460;
        }
        this.myGroup.scale.set(myGroupScale, myGroupScale);
        if (SimpleGame.myGame.scale.isGameLandscape) {
            this.myGroup.y = (ResizeManager.deviceHeight * 0.865);
            this.myGroup.y = ResizeManager.deviceHeight - iconBgWidth * myGroupScale * 0.9;
        }
        else {
            this.myGroup.y = (1600) * myGroupScale;
            this.myGroup.y = (1200) * myGroupScale;
        }
    }
    return GameUIBottomButton;
}());
var OpenMenuBut = /** @class */ (function () {
    function OpenMenuBut() {
        SimpleGame.myGame.add.button();
    }
    return OpenMenuBut;
}());
var SideTooltip = /** @class */ (function () {
    function SideTooltip(iconName, yIdx, parent, onClickFunction) {
        if (yIdx === void 0) { yIdx = 0; }
        if (onClickFunction === void 0) { onClickFunction = function () {
        }; }
        this.myGroup = SimpleGame.myGame.add.group(parent);
        this.onClickFunction = onClickFunction;
        this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBg.beginFill(0x000000);
        this.myIconBg.drawRoundedRect(-150, 0, 300, 100, 20);
        this.myIconBg.endFill();
        this.myIconBg.alpha = 0.8;
        this.myIconBg.inputEnabled = true;
        this.myIconBg.events.onInputDown.add(function () {
            this.onClickFunction();
        }, this);
        this.myIconCircle = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconCircle.beginFill(0xffffff);
        this.myIconCircle.drawRoundedRect(120 - 60 / 2, 10 - 60 / 2, 60, 60, 10);
        this.myIconCircle.beginFill(0x000000);
        this.myIconCircle.drawRoundedRect(120 - 55 / 2, 10 - 55 / 2, 55, 55, 10);
        this.myIconCircle.endFill();
        this.myIconCircle.visible = false;
        if (SimpleGame.myGame.scale.isGameLandscape) {
            var myGroupScale = ResizeManager.deviceWidth / 1920;
        }
        else {
            var myGroupScale = ResizeManager.deviceHeight / 1920;
        }
        this.myIcon = SimpleGame.myGame.add.sprite(60, 50, iconName, '', this.myGroup);
        this.myIcon.anchor.set(0.5, 0.5);
        this.myGroup.scale.set(myGroupScale, myGroupScale);
        this.myIcon.scale.set(0.7);
        this.adBg = SimpleGame.myGame.add.graphics(86, -25, this.myGroup);
        this.adBg.beginFill(0x000000);
        this.adBg.lineStyle(2, 0xffffff, 1);
        this.adBg.drawRoundedRect(10, 2, 148, 148);
        this.adBg.endFill();
        this.adBg.scale.set(0.4);
        this.adBg.alpha = 1;
        this.adIcon = SimpleGame.myGame.add.sprite(98, -10, 'ad_icon', '', this.myGroup);
        this.adIcon.scale.set(1);
        if (SimpleGame.myGame.scale.isGameLandscape) {
            this.myGroup.y = (100 + 150 * yIdx) * myGroupScale;
        }
        else {
            this.myGroup.y = (1300 + 150 * yIdx) * myGroupScale;
        }
        this.myQuantityTxt = SimpleGame.myGame.add.text(120, 10, 'AD', { font: "36px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.myQuantityTxt.anchor.set(0.5, 0.5);
        this.myQuantityTxt.visible = false;
    }
    return SideTooltip;
}());
var SoundButton = /** @class */ (function () {
    function SoundButton(parent, imgNormalName, imgNormalNameOff, imgOverName, imgOverNameOff, x, y) {
        var soundontxt = SimpleGame.myGame.make.text(0, 0, "", {
            font: "16px Open Sans", fill: "#252525", fontWeight: "700"
        });
        this.soundOnBut = new ButtonWithOverAndText(soundontxt, parent, imgNormalName, imgOverName, x, y, this.toggleSoundButton.bind(this));
        this.soundOnBut.setXY(x, y);
        if (Util.getStorage("soundFlag", 0) == 0) {
            SoundButton.soundFlag = false;
        }
        else {
            SoundButton.soundFlag = true;
        }
        SoundButton.soundFlagChecked = true;
        var soundofftxt = SimpleGame.myGame.make.text(0, 0, "", {
            font: "16px Open Sans", fill: "#252525", fontWeight: "700"
        });
        this.soundOffBut = new ButtonWithOverAndText(soundofftxt, parent, imgNormalNameOff, imgOverNameOff, x, y, this.toggleSoundButton.bind(this));
        this.soundOffBut.setXY(x, y);
        this.setCorrectButtonVisible(true);
        SoundManager.setMuteFlags(!SoundButton.soundFlag);
        //    SimpleGame.myGame.time.events.add(1, this.toggleSoundButton)
        SoundManager.setMuteFlags(!SoundButton.soundFlag);
    }
    SoundButton.prototype.toggleSoundButton = function () {
        SoundButton.soundFlag = !SoundButton.soundFlag;
        this.setCorrectButtonVisible();
        SoundManager.setMuteFlags(!SoundButton.soundFlag);
    };
    SoundButton.prototype.setCorrectButtonVisible = function (skipButtonOver) {
        if (skipButtonOver === void 0) { skipButtonOver = false; }
        // 
        if (SoundButton.soundFlag) {
            this.soundOnBut.setVisible();
            this.soundOffBut.setInvisible();
            if (!skipButtonOver)
                this.soundOnBut.onButtonOver();
        }
        else {
            this.soundOnBut.setInvisible();
            this.soundOffBut.setVisible();
            if (!skipButtonOver)
                this.soundOffBut.onButtonOver();
        }
    };
    SoundButton.manageTextualSoundButtons = function (sOnBut, sOffBut) {
        if (this.soundFlag) {
            sOffBut.goInvisible();
            sOnBut.goVisible();
        }
        else {
            sOnBut.goInvisible();
            sOffBut.goVisible();
        }
    };
    SoundButton.soundFlag = false;
    SoundButton.soundFlagChecked = false;
    return SoundButton;
}());
var SwitchButton = /** @class */ (function () {
    function SwitchButton(parent, x, y, onFlag, title, parentScreen) {
        this.toggleOnX = 100;
        this.toggleOffX = 20;
        this.onFlag = false;
        this.title = title;
        this.parentScreen = parentScreen;
        this.onFlag = onFlag;
        this.mygroup = SimpleGame.myGame.add.group(parent);
        this.mygroup.x = x;
        this.mygroup.y = y;
        this.mygroup.scale.set(0.75, 0.75);
        this.offbtn = SimpleGame.myGame.add.sprite(0, 0, 'toggle_grey01', '', this.mygroup);
        this.onbtn = SimpleGame.myGame.add.sprite(0, 0, 'toggle_green', '', this.mygroup);
        this.toggle = SimpleGame.myGame.add.sprite(10, 11, 'toggle_BTN01', '', this.mygroup);
        this.myTxt = SimpleGame.myGame.add.text(-200, 10, "" + title, { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.mygroup);
        // this.offbtn.inputEnabled = true;
        this.offbtn.events.onInputDown.add(this.setToOnPositionWithTween, this, 0, [false]);
        // this.onbtn.inputEnabled = true;
        this.onbtn.events.onInputDown.add(this.setToOffPositionWithTween, this, 0, [false]);
        if (this.onFlag) {
            this.setToOnPosition(true);
        }
        else {
            this.setToOffPosition(true);
        }
    }
    SwitchButton.prototype.setToOffPositionWithTween = function (setToOffPositionWithTween, arg1, arg2, arg3) {
        this.setToOffPosition(false);
        this.parentScreen.setFlags();
    };
    SwitchButton.prototype.setToOnPositionWithTween = function (setToOnPositionWithTween, arg1, arg2, arg3) {
        this.setToOnPosition(false);
        this.parentScreen.setFlags();
    };
    SwitchButton.prototype.setToOnPosition = function (immediately) {
        if (immediately === void 0) { immediately = true; }
        this.onFlag = true;
        SoundManager.playClick();
        this.saveFlags();
        // 
        SimpleGame.myGame.time.events.add(150, function () {
            this.onbtn.inputEnabled = true;
            this.offbtn.inputEnabled = false;
            // this.offbtn.input.useHandCursor = true;
            this.onbtn.input.useHandCursor = true;
        }, this);
        if (immediately) {
            this.toggle.x = this.toggleOnX;
        }
        else {
            this.toggle.x = this.toggleOnX;
            // SimpleGame.myGame.add.tween(this.toggle).to({x:this.toggleOnX}, 800, Phaser.Easing.Linear.None, true)
        }
        this.offbtn.visible = false;
        this.onbtn.visible = true;
    };
    SwitchButton.prototype.setToOffPosition = function (immediately) {
        if (immediately === void 0) { immediately = true; }
        this.onFlag = false;
        this.saveFlags();
        SoundManager.playClick();
        SimpleGame.myGame.time.events.add(150, function () {
            this.onbtn.inputEnabled = false;
            this.offbtn.inputEnabled = true;
            this.offbtn.input.useHandCursor = true;
            // this.onbtn.input.useHandCursor = true;
        }, this);
        if (immediately) {
            this.toggle.x = this.toggleOffX;
        }
        else {
            this.toggle.x = this.toggleOffX;
            // SimpleGame.myGame.add.tween(this.toggle).to({x:this.toggleOnX}, 800, Phaser.Easing.Linear.None, true)
        }
        this.offbtn.visible = true;
        this.onbtn.visible = false;
    };
    SwitchButton.prototype.saveFlags = function () {
    };
    return SwitchButton;
}());
var BoardData = /** @class */ (function () {
    function BoardData() {
        this.currentScore = 0;
        //stockPile = new Array();
        //wastePile = new Array();
        this.stockPile = new Array();
        this.foundationPile = new Array();
        this.foundationPile[0] = new Array();
        this.foundationPile[1] = new Array();
        this.foundationPile[2] = new Array();
        this.foundationPile[3] = new Array();
        this.foundationPile[4] = new Array();
        this.foundationPile[5] = new Array();
        this.foundationPile[6] = new Array();
        this.foundationPile[7] = new Array();
        this.tableuPile = new Array();
        this.tableuPile[0] = new Array();
        this.tableuPile[1] = new Array();
        this.tableuPile[2] = new Array();
        this.tableuPile[3] = new Array();
        this.tableuPile[4] = new Array();
        this.tableuPile[5] = new Array();
        this.tableuPile[6] = new Array();
        this.tableuPile[7] = new Array();
        this.tableuPile[8] = new Array();
        this.tableuPile[9] = new Array();
    }
    BoardData.prototype.addToBdata = function (card) {
        var cardData = new CardData(card.suitIdx, card.cardIdx, card.turned, card.deckIdx);
        var stockCards = 0;
        var tabCards = 0;
        if (card.myState == Card.STATE_STOCK) {
            this.stockPile[card.myStockIdx] = cardData;
        }
        else if (card.myState == Card.STATE_TABLEU) {
            this.tableuPile[card.tableuIdx][card.tableuPosition] = cardData;
            // 
        }
        else if (card.myState == Card.STATE_FOUNDATION) {
            this.foundationPile[card.foundationIdx][card.foundationPosition] = cardData;
        }
    };
    BoardData.prototype.fromSnapshotToBoard = function (skiplayerfixes) {
        // 
        this.justUndoedArray = new Array();
        var i = Card.cardArray.length;
        while (i-- > 0) {
            Card.cardArray[i].endgameTweenFlag = false;
            Card.cardArray[i].cardImgFront.alpha = 1;
            // Card.cardArray[i].
            // SimpleGame.myGame.time.events.remove( Card.cardArray[i].endGameTweenTimer )
        }
        // 
        this.manageStockpile();
        //manageStockPile();
        this.manageTableu();
        //manageWaste();
        this.manageFoundation();
        if (!skiplayerfixes) {
            this.fixPostUndoLayering();
        }
        // MainUI.currentScore = currentScore;
    };
    BoardData.prototype.manageFoundation = function () {
        var i = this.foundationPile.length;
        while (i-- > 0) {
            var arr = this.foundationPile[i];
            var j = arr.length;
            while (j-- > 0) {
                var cData = this.foundationPile[i][j];
                if (cData == undefined)
                    continue;
                var card = CardUtil.getByCardAndSuitIdx(cData.suitIdx, cData.cardIdx, cData.deckIdx);
                if (card.myState == Card.STATE_FOUNDATION && card.foundationIdx == i && card.foundationPosition == j && card.turned == cData.turned) {
                }
                else {
                    this.justUndoedArray.push(card);
                }
                // 
                card.myState = Card.STATE_FOUNDATION;
                card.foundationIdx = i;
                card.foundationPosition = j;
                card.turned = cData.turned;
                card.isMoving = false;
                card.selectedFlag = false;
                // GameContext.layerTiles.addChild(card.owner, false);
                // Maybe add on top?
            }
        }
    };
    BoardData.prototype.manageStockpile = function () {
        var i = this.stockPile.length;
        while (i-- > 0) {
            var cdata = this.stockPile[i];
            if (cdata == null)
                continue;
            var card = CardUtil.getByCardAndSuitIdx(cdata.suitIdx, cdata.cardIdx, cdata.deckIdx);
            if (card.myState == Card.STATE_STOCK && card.myStockIdx == i && card.turned == cdata.turned) {
            }
            else {
                this.justUndoedArray.push(card);
            }
            card.myState = Card.STATE_STOCK;
            card.myStockIdx = i;
            card.turned = cdata.turned;
            card.isMoving = false;
            card.selectedFlag = false;
            // GameContext.layerTiles.addChild(card.owner, false);
        }
    };
    BoardData.prototype.manageTableu = function () {
        // 
        var i = this.tableuPile.length;
        while (i-- > 0) {
            var arr = this.tableuPile[i];
            var j = arr.length;
            while (j-- > 0) {
                var cData = this.tableuPile[i][j];
                var card = CardUtil.getByCardAndSuitIdx(cData.suitIdx, cData.cardIdx, cData.deckIdx);
                if (card.myState == Card.STATE_TABLEU && card.tableuIdx == i && card.tableuPosition == j && card.turned == cData.turned) {
                }
                else {
                    this.justUndoedArray.push(card);
                }
                if (card.tableuIdx != i || card.tableuPosition != j) {
                    // 
                }
                else {
                    // 
                }
                card.myState = Card.STATE_TABLEU;
                card.tableuIdx = i;
                card.tableuPosition = j;
                card.turned = cData.turned;
                card.isMoving = false;
                card.selectedFlag = false;
                // GameContext.layerTiles.addChild(card.owner, false);
            }
        }
    };
    BoardData.prototype.fixPostUndoLayering = function () {
        this.justUndoedArray.sort(function (x, y) {
            if (x.foundationPosition > y.foundationPosition) {
                return 1;
            }
            else if (x.foundationPosition == y.foundationPosition) {
                return 0;
            }
            else {
                return -1;
            }
        });
        //justUndoedArray.reverse();
        var i = this.justUndoedArray.length;
        while (i-- > 0) {
            // GameContext.layerTiles.addChild(justUndoedArray[i].owner);
        }
    };
    BoardData.isBdataChanged = function (data1, data2) {
        if (this.isArrayIdentical(data1.foundationPile[0], data2.foundationPile[0]) == false)
            return true;
        if (this.isArrayIdentical(data1.foundationPile[1], data2.foundationPile[1]) == false)
            return true;
        if (this.isArrayIdentical(data1.foundationPile[2], data2.foundationPile[2]) == false)
            return true;
        if (this.isArrayIdentical(data1.foundationPile[3], data2.foundationPile[3]) == false)
            return true;
        if (this.isArrayIdentical(data1.foundationPile[4], data2.foundationPile[4]) == false)
            return true;
        if (this.isArrayIdentical(data1.foundationPile[5], data2.foundationPile[5]) == false)
            return true;
        if (this.isArrayIdentical(data1.foundationPile[6], data2.foundationPile[6]) == false)
            return true;
        if (this.isArrayIdentical(data1.foundationPile[7], data2.foundationPile[7]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[0], data2.tableuPile[0]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[1], data2.tableuPile[1]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[2], data2.tableuPile[2]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[3], data2.tableuPile[3]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[4], data2.tableuPile[4]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[5], data2.tableuPile[5]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[6], data2.tableuPile[6]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[7], data2.tableuPile[7]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[8], data2.tableuPile[8]) == false)
            return true;
        if (this.isArrayIdentical(data1.tableuPile[9], data2.tableuPile[9]) == false)
            return true;
        if (this.isArrayIdentical(data1.stockPile, data2.stockPile) == false) {
            // 
            return true;
        }
        return false;
    };
    BoardData.isFreeCellArrayIdentical = function (arr1, arr2) {
        // trace(arr1.length, arr2.length);
        if (arr1.length != arr2.length)
            return false;
        var retVal = true;
        var i = arr1.length;
        while (i-- > 0) {
            if (arr1[i] == null || arr2[i] == null)
                return false;
            if (arr1[i].cardIdx != arr2[i].cardIdx || arr1[i].suitIdx != arr2[i].suitIdx || arr1[i].turned != arr2[i].turned) {
                return false;
            }
        }
        return true;
    };
    BoardData.isArrayIdentical = function (arr1, arr2) {
        if (arr1.length != arr2.length)
            return false;
        var retVal = true;
        var i = arr1.length;
        while (i-- > 0) {
            if (arr1[i] == null || arr2[i] == null)
                return false;
            if (arr1[i].deckIdx != arr2[i].deckIdx || arr1[i].cardIdx != arr2[i].cardIdx || arr1[i].suitIdx != arr2[i].suitIdx || arr1[i].turned != arr2[i].turned) {
                return false;
            }
        }
        return true;
    };
    BoardData.boardDataIdx = -1;
    return BoardData;
}());
var CardData = /** @class */ (function () {
    function CardData(suitIdx, cardIdx, turned, deckIdx) {
        this.turned = turned;
        this.cardIdx = cardIdx;
        this.suitIdx = suitIdx;
        this.deckIdx = deckIdx;
    }
    return CardData;
}());
var BoardManager = /** @class */ (function () {
    function BoardManager() {
    }
    BoardManager.HintReset = function () {
        BoardManager.hintState = 0;
        BoardManager.currentObservedColumn = -1;
    };
    BoardManager.magicWandSingleCard = function (c, delay, foundationIdx) {
        // SimpleGame.myGame.time.events.add(delay, function()
        // {
        c.myState = Card.STATE_FOUNDATION;
        c.foundationIdx = foundationIdx;
        c.foundationPosition = 11 - c.cardIdx;
        if (c.foundationPosition < 0) {
            c.foundationPosition = 12;
        }
        c.flipcard(false);
        var j = 0;
        while (j++ < 50) {
            var c1 = CardUtil.getByTabIdxAndPos(c.tableuIdx, c.tableuPosition + j);
            if (c1 != null) {
                c1.tableuPosition--;
            }
        }
        // }, this)
    };
    BoardManager.magicWand = function () {
        BoardManager.magicWandInProgress = true;
        var foundationIdx = CardUtil.getFreeFoundationIdx();
        var cardsToRemove = this.getMagicWandArray();
        var i = cardsToRemove.length;
        while (i-- > 0) {
            var c = cardsToRemove[i];
            if (c == null) {
                return;
            }
            // this.magicWandSingleCard(c, i*50, foundationIdx);
        }
        var i = cardsToRemove.length;
        while (i-- > 0) {
            var c = cardsToRemove[i];
            // if (c == null) 
            this.magicWandSingleCard(c, i * 50, foundationIdx);
        }
        SimpleGame.myGame.time.events.add(600, function () {
            var i = 10;
            while (i-- > 0) {
                var c = CardUtil.getCardOnTop(i);
                if (c != null) {
                    c.flipcard(true);
                }
            }
            BoardManager.magicWandInProgress = false;
        }, this);
        BoardManager.generateBoardSnapshot();
    };
    BoardManager.getMagicWandArraySingleSuit = function (suitIdx) {
        var i = 13;
        var cardsToMagicallyRemove = [];
        while (i-- > 0) {
            var idxToFind = i;
            var j = Card.cardArray.length;
            while (j-- > 0) {
                var c = Card.cardArray[j];
                if (c == null || c == undefined)
                    continue;
                if (c.myState == Card.STATE_TABLEU && c.cardIdx == idxToFind && c.suitIdx == suitIdx) {
                    cardsToMagicallyRemove[i] = c;
                    break;
                }
            }
        }
        return cardsToMagicallyRemove;
    };
    BoardManager.getMagicWandArray = function () {
        var foundationIdx = CardUtil.getFreeFoundationIdx();
        var allMagicWandArrays = [];
        // 
        if (CardUtil.getTotalTableuCards() <= 13) {
            return [null];
        }
        allMagicWandArrays = [this.getMagicWandArraySingleSuit(0), this.getMagicWandArraySingleSuit(1), this.getMagicWandArraySingleSuit(2), this.getMagicWandArraySingleSuit(3)];
        var i = allMagicWandArrays.length;
        while (i-- > 0) {
            var arrTemp = allMagicWandArrays[i];
            if (arrTemp.length == 13) {
                var nullFound = false;
                var j = arrTemp.length;
                while (j-- > 0) {
                    if (arrTemp[j] == null) {
                        nullFound = true;
                    }
                }
                if (nullFound == false) {
                    return arrTemp;
                }
            }
        }
        return [null];
        // var suitIdx:number = 
        // 
    };
    BoardManager.Hint = function (autoHint) {
        if (autoHint === void 0) { autoHint = false; }
        if (BoardManager.autoCompleteInProgress || BoardManager.gameOverFlag || GameContext.gameplayActive == false) {
            // SoundManager.no_hints.play()
            return;
        }
         if (GameContext.hintsLeft <= 0)
         {
             let notenoughhints = new NotEnoughHints()
             return;
         }
         else
         {
             GameContext.hintsLeft--;
         }
        GameContext.saveGameContext();
        if (BoardManager.currentObservedColumn == -1) {
            BoardManager.currentObservedColumn = BoardManager.NUM_TABLEU_COLUMNS;
        }
        var isInitialHint = false;
        if (BoardManager.hintState == 0 && BoardManager.currentObservedColumn == BoardManager.NUM_TABLEU_COLUMNS) {
            isInitialHint = true;
        }
        BoardManager.hintSuccess = false;
        BoardManager.currentObservedColumn = BoardManager.NUM_TABLEU_COLUMNS;
        isInitialHint = true;
        var respectSuitIdx = true;
        this.autoHintFlag = false;
        if (BoardManager.hintState == BoardManager.HINT_STATE_TRY_FIRST_CARD_ONLY_HINT) {
            var i = BoardManager.currentObservedColumn;
            BoardManager.hintSuccess = false;
            while (i-- > 0) {
                BoardManager.TryToHintColumn(i, true, true);
                BoardManager.currentObservedColumn = i;
                if (BoardManager.hintSuccess) {
                    SoundManager.hint.play();
                    return;
                }
            }
            BoardManager.hintState++;
            BoardManager.currentObservedColumn = BoardManager.NUM_TABLEU_COLUMNS;
        }
        if (BoardManager.hintState == BoardManager.HINT_STATE_TRY_ANY_CARD_HINT) {
            var i = BoardManager.currentObservedColumn;
            BoardManager.hintSuccess = false;
            while (i-- > 0) {
                BoardManager.TryToHintColumn(i, false, true);
                BoardManager.currentObservedColumn = i;
                if (BoardManager.hintSuccess) {
                    SoundManager.hint.play();
                    return;
                }
            }
            BoardManager.hintState++;
            BoardManager.currentObservedColumn = BoardManager.NUM_TABLEU_COLUMNS;
        }
        if (BoardManager.hintState == BoardManager.HINT_STATE_FIRST_CARD_ONLY_NORESPECT) {
            var i = BoardManager.currentObservedColumn;
            BoardManager.hintSuccess = false;
            while (i-- > 0) {
                BoardManager.TryToHintColumn(i, true);
                BoardManager.currentObservedColumn = i;
                if (BoardManager.hintSuccess) {
                    SoundManager.hint.play();
                    return;
                }
            }
            BoardManager.hintState++;
            BoardManager.currentObservedColumn = BoardManager.NUM_TABLEU_COLUMNS;
        }
        if (BoardManager.hintState == BoardManager.HINT_STATE_ANY_CARD_ONLY_NORESPECT) {
            var i = BoardManager.currentObservedColumn;
            BoardManager.hintSuccess = false;
            while (i-- > 0) {
                BoardManager.TryToHintColumn(i, false);
                BoardManager.currentObservedColumn = i;
                if (BoardManager.hintSuccess) {
                    SoundManager.hint.play();
                    return;
                }
            }
            BoardManager.hintState++;
            BoardManager.currentObservedColumn = BoardManager.NUM_TABLEU_COLUMNS;
        }
        if (BoardManager.hintState == BoardManager.HINT_STATE_TRY_EMPTY_COLUMN) {
            var i = BoardManager.currentObservedColumn;
            BoardManager.hintSuccess = false;
            while (i-- > 0) {
                BoardManager.TryToHintToEmptyColumn(i);
                BoardManager.currentObservedColumn = i;
                if (BoardManager.hintSuccess) {
                    SoundManager.hint.play();
                    return;
                }
            }
            BoardManager.hintState = BoardManager.HINT_STATE_STOCK;
            BoardManager.currentObservedColumn = BoardManager.NUM_TABLEU_COLUMNS;
        }
        if (BoardManager.hintState == BoardManager.HINT_STATE_STOCK) {
            var stockPos = 0;
            var arr = Card.cardArray;
            var i = arr.length;
            while (i-- > 0) {
                var c = arr[i];
                if (c.stockPosition > stockPos && c.myState == Card.STATE_STOCK) {
                    stockPos = c.stockPosition;
                }
            }
            var arr = Card.cardArray;
            var i = arr.length;
            var totalCardsOnStock = 0;
            while (i-- > 0) {
                var c = arr[i];
                if (c.myState == Card.STATE_STOCK)
                    totalCardsOnStock++;
                if (c.myState == Card.STATE_STOCK && stockPos == c.stockPosition) {
                    var myTabIdx = c.myStockIdx % 10;
                    HintCopy.initStock(c, c.cardImgBack.x, c.cardImgBack.y);
                    BoardManager.hintSuccess = true;
                    break;
                }
            }
            BoardManager.hintState = 0;
        }
        if (BoardManager.hintSuccess) {
            SoundManager.hint.play();
        }
        else {
            if (isInitialHint) {
                if (autoHint == false) {
                    SoundManager.invalid.play();
                }
            }
            else {
                BoardManager.hintState = 0;
                BoardManager.currentObservedColumn = BoardManager.NUM_TABLEU_COLUMNS;
                BoardManager.Hint();
            }
        }
    };
    BoardManager.TryToHintToEmptyColumnBackup = function (tabIdx) {
        var i = BoardManager.NUM_TABLEU_COLUMNS;
        var emptyExists = false;
        var emptyIdx = -1;
        while (i-- > 0) {
            var idx = 9 - i;
            if (CardUtil.checkIfTabEmpty(idx)) {
                emptyIdx = idx;
                emptyExists = true;
                break;
            }
        }
        if (!emptyExists)
            return;
        var cardOnTopOfInitialColumn = CardUtil.getCardOnTop(tabIdx);
        if (cardOnTopOfInitialColumn == null)
            return;
        cardOnTopOfInitialColumn.invertFrontColors();
        BoardManager.hintSuccess = true;
        var hintMarker = SimpleGame.myGame.make.graphics(0, 0);
        hintMarker.beginFill(0x000000);
        hintMarker.drawRoundedRect(Card.LANDSCAPE_CARD_TAB_POS_X_INIT + emptyIdx * Card.LANDSCAPE_CARD_TAB_POS_X_DELTA - 81 / 2, Card.LANDSCAPE_CARD_TAB_POS_Y_INIT - 113 / 2, 81, 113, 4);
        hintMarker.alpha = 0.75;
        hintMarker.endFill();
        SimpleGame.myGame.time.events.add(Consts.timeToHint, function () {
            Card.items.add(hintMarker);
        }, this);
        SimpleGame.myGame.time.events.add(1000, function () {
            Card.items.remove(hintMarker, true);
        }, this);
    };
    BoardManager.TryToHintToEmptyColumn = function (tabIdx) {
        var i = BoardManager.NUM_TABLEU_COLUMNS;
        var emptyExists = false;
        var emptyIdx = -1;
        while (i-- > 0) {
            var idx = 9 - i;
            if (CardUtil.checkIfTabEmpty(idx)) {
                emptyIdx = idx;
                emptyExists = true;
                break;
            }
        }
        if (!emptyExists)
            return;
        var cardOnBotOfInitialColumn = CardUtil.getByTabIdxAndPos(tabIdx, 0);
        if (cardOnBotOfInitialColumn == null)
            return;
        if (CardUtil.isValidMoveStack(cardOnBotOfInitialColumn)) {
            return;
        }
        var c2 = null;
        var deltaPos = 0;
        do {
            deltaPos++;
            c2 = CardUtil.getByTabIdxAndPos(tabIdx, deltaPos);
            if (CardUtil.isValidMoveStack(c2)) {
                break;
            }
        } while (c2 != null);
        if (c2 == null)
            return;
        // c2.invertFrontColors()
        if (SimpleGame.myGame.scale.isGameLandscape) {
            HintCopy.init(c2, Card.LANDSCAPE_CARD_TAB_POS_X_INIT + emptyIdx * Card.LANDSCAPE_CARD_TAB_POS_X_DELTA, Card.LANDSCAPE_CARD_TAB_POS_Y_INIT);
        }
        else {
            HintCopy.init(c2, Card.PORTRAIT_CARD_TAB_POS_X_INIT + emptyIdx * Card.PORTRAIT_CARD_TAB_POS_X_DELTA, Card.PORTRAIT_CARD_TAB_POS_Y_INIT);
        }
        BoardManager.hintSuccess = true;
    };
    BoardManager.TryToHintToEmptyColumnOld = function (tabIdx) {
        var i = BoardManager.NUM_TABLEU_COLUMNS;
        var emptyExists = false;
        var emptyIdx = -1;
        while (i-- > 0) {
            var idx = 9 - i;
            if (CardUtil.checkIfTabEmpty(idx)) {
                emptyIdx = idx;
                emptyExists = true;
                break;
            }
        }
        if (!emptyExists)
            return;
        var cardOnTopOfInitialColumn = CardUtil.getCardOnTop(tabIdx);
        if (cardOnTopOfInitialColumn == null)
            return;
        var cardOnTopOfInitialMinusOne = CardUtil.getByTabIdxAndPos(tabIdx, cardOnTopOfInitialColumn.tableuPosition - 1);
        if (cardOnTopOfInitialMinusOne == null)
            return;
        if (cardOnTopOfInitialMinusOne.turned == true) {
            if (CardUtil.isCardIdxFollowing(cardOnTopOfInitialMinusOne, cardOnTopOfInitialColumn))
                return;
        }
        cardOnTopOfInitialColumn.invertFrontColors();
        BoardManager.hintSuccess = true;
        var hintMarker = SimpleGame.myGame.make.graphics(0, 0);
        hintMarker.beginFill(0x000000);
        hintMarker.drawRoundedRect(Card.LANDSCAPE_CARD_TAB_POS_X_INIT + emptyIdx * Card.LANDSCAPE_CARD_TAB_POS_X_DELTA - 81 / 2, Card.LANDSCAPE_CARD_TAB_POS_Y_INIT - 113 / 2, 81, 113, 4);
        hintMarker.alpha = 0.75;
        hintMarker.endFill();
        SimpleGame.myGame.time.events.add(Consts.timeToHint, function () {
            Card.items.add(hintMarker);
        }, this);
        SimpleGame.myGame.time.events.add(2 * Consts.timeToHint, function () {
            Card.items.remove(hintMarker, true);
        }, this);
    };
    BoardManager.TryToHintColumn = function (tabIdx, firstCardOnly, respectSuit) {
        if (respectSuit === void 0) { respectSuit = false; }
        // 
        var initPos = CardUtil.getFirstTurnedCardIdx(tabIdx);
        do {
            var cardPlaced = CardUtil.getByTabIdxAndPos(tabIdx, initPos);
            if (cardPlaced == null) {
                // 
                return;
            }
            if (CardUtil.isValidMoveStack(cardPlaced)) {
                var cardPlacedMinusOne = CardUtil.getByTabIdxAndPos(tabIdx, initPos - 1);
                // 
                // Trace.TraceCardByIdxAndPos(cardPlaced.tableuIdx, cardPlaced.tableuPosition)
                var j = BoardManager.NUM_TABLEU_COLUMNS;
                var tabIdxCurrent = cardPlaced.tableuIdx;
                while (j-- > 0) {
                    tabIdxCurrent++;
                    if (tabIdxCurrent % BoardManager.NUM_TABLEU_COLUMNS == tabIdx)
                        continue;
                    //   
                    var cardTableu = CardUtil.getCardOnTop(tabIdxCurrent % BoardManager.NUM_TABLEU_COLUMNS);
                    if (cardTableu == null) {
                        //    
                        // tabIdxCurrent++;
                        continue;
                    }
                    if (respectSuit) {
                        if (cardTableu.suitIdx != cardPlaced.suitIdx) {
                            continue;
                        }
                    }
                    //    
                    //    Trace.TraceCardByIdxAndPos(cardTableu.tableuIdx, cardTableu.tableuPosition)
                    if (cardTableu.cardIdx != CardUtil.CARD_IDX_A && (cardPlaced.cardIdx == CardUtil.CARD_IDX_A && cardTableu.cardIdx == CardUtil.CARD_IDX_02 || cardPlaced.cardIdx + 1 == cardTableu.cardIdx)) {
                        if (cardPlacedMinusOne != null) {
                            if (cardPlacedMinusOne.turned && cardPlacedMinusOne.cardIdx == cardTableu.cardIdx) {
                                // tabIdxCurrent++;
                                if (cardTableu.suitIdx == cardPlaced.suitIdx && BoardManager.resultsInFullstack(cardTableu) && BoardManager.resultsInFullstackDownwards(cardPlaced)) {
                                    // 
                                    BoardManager.hintSuccess = true;
                                    break;
                                }
                                else {
                                    // 
                                    continue;
                                }
                            }
                            else {
                                BoardManager.hintSuccess = true;
                                break;
                            }
                        }
                        else {
                            BoardManager.hintSuccess = true;
                            break;
                        }
                    }
                    //    tabIdxCurrent++;
                }
            }
            if (BoardManager.hintSuccess) {
                // cardPlaced.invertFrontColors();
                // SimpleGame.myGame.time.events.add(Consts.timeToHint, function()
                // {
                //     cardTableu.invertFrontColors();
                // }, this)
                HintCopy.init(cardPlaced, cardTableu.cardImgFront.x, cardTableu.cardImgFront.y + 40);
                return;
            }
            if (firstCardOnly) {
                return;
            }
            else {
                initPos++;
            }
        } while (cardPlaced != null);
    };
    BoardManager.resultsInFullstackDownwards = function (cardObserved) {
        // 
        Trace.TraceCardByIdxAndPos(cardObserved.tableuIdx, cardObserved.tableuPosition);
        if (cardObserved.cardIdx == CardUtil.CARD_IDX_A) {
            return true;
        }
        var cminusone = CardUtil.getByTabIdxAndPos(cardObserved.tableuIdx, cardObserved.tableuPosition + 1);
        if (cminusone == null) {
            return false;
        }
        if (CardUtil.isCardIdxFollowing(cardObserved, cminusone, true) == false) {
            return false;
        }
        return BoardManager.resultsInFullstackDownwards(cminusone);
    };
    BoardManager.resultsInFullstack = function (cardObserved) {
        // 
        // Trace.TraceCardByIdxAndPos(cardObserved.tableuIdx, cardObserved.tableuPosition)
        if (cardObserved.cardIdx == CardUtil.CARD_IDX_K) {
            return true;
        }
        var cminusone = CardUtil.getByTabIdxAndPos(cardObserved.tableuIdx, cardObserved.tableuPosition - 1);
        if (cminusone == null) {
            // 
            return false;
        }
        // 
        // Trace.TraceCardByIdxAndPos(cminusone.tableuIdx, cminusone.tableuPosition)
        if (CardUtil.isCardIdxFollowing(cminusone, cardObserved, true) == false) {
            // 
            return false;
        }
        return BoardManager.resultsInFullstack(cminusone);
    };
    BoardManager.startNewGame = function () {
        GameContext.commercialBreak()
        GameUI.promptLayer.removeAll(true);
        GameUI.promptHolder.removeAll(true);
        // CardUtil.NUM_SUIT_COLORS = 2;
        BoardManager.InitializeBoard();
    };
    BoardManager.InitializeBoard = function () {
        if (SimpleGame.myGame.load.hasLoaded == false) {
            SimpleGame.spinnerAnim.visible = true;
            // GameUI.promptLayer.add(SimpleGame.spinnerAnim)
            var group = SimpleGame.myGame.add.group();
            // group.add(SimpleGame.spinnerAnim)
            SimpleGame.spinnerAnim.x = SimpleGame.myGame.width * 0.5;
            SimpleGame.spinnerAnim.y = SimpleGame.myGame.height * 0.5;
            SimpleGame.myGame.time.events.add(50, function () {
                BoardManager.InitializeBoard();
            }, this);
            return;
        }
        SimpleGame.spinnerAnim.visible = false;
        BoardManager.removeAllCards();
        BoardData.boardDataArray = new Array();
        BoardManager.GenerateCards();
        BoardManager.GenerateStock();
        BoardManager.GenerateTableu();
        BoardManager.actuallyGenerateSnapshot();
        BoardManager.sortImmediately();
        BoardManager.initialTween();
        GameContext.gameplayStarted();
        if (GameUI.initialMoveMade) {
            var cumulativeScore = Util.getStoragePerDifficulty("cumulativeScore", 0);
            cumulativeScore += GameUI.scoreTotal;
            Util.setStoragePerDifficulty("cumulativeScore", cumulativeScore);
            Util.setStoragePerDifficulty("cumulativeTime", (Util.getStoragePerDifficulty("cumulativeTime", 0) + GameUI.time));
            Util.setStoragePerDifficulty("cumulativeMoves", (Util.getStoragePerDifficulty("cumulativeMoves", 0) + GameUI.moves));
            // var gamesPlayed = Util.getStoragePerDifficulty("gamesPlayed");
            // gamesPlayed++;
            // Util.setStoragePerDifficulty("gamesPlayed", gamesPlayed)
        }
        GameUI.reinitData();
        // SimpleGame.myGame.time.events.add(500, function()
        // {
        //     
        //     var i = 3;
        //     while(i-- > 0)
        //     {
        //         var c:Card = Card.cardArray[ Math.floor(Math.random() * Card.cardArray.length) ];
        //         c.myState = Card.STATE_FOUNDATION;
        //         c.foundationIdx = i;
        //         c.foundationPosition = 0;
        //         c.updateFoundation2()
        //     }
        // }, this)
        // SimpleGame.myGame.time.events.add(2500, this.showTutorial1, this)
    };
    BoardManager.showTutorial1 = function () {
        var tut1 = new TutorialPrompt1();
    };
    BoardManager.initialTween = function () {
        // SimpleGame.myGame.time.events.add(200, function()
        // {
        //     
        //     SoundManager.beginAnimation.play()
        // }, this);
        SimpleGame.myGame.time.events.add(Phaser.Timer.SECOND * 0.5, SoundManager.playDealRow);
        var arr = Card.cardArray;
        var i = arr.length;
        var initTweenIdx = 0;
        var _loop_1 = function () {
            var c = arr[i];
            if (c.myState == Card.STATE_TABLEU && c.turned) {
                c.cardImgFront.y = -1000;
                // c.setToTableu(true)
                c.skipSetToTableu = true;
                SimpleGame.myGame.time.events.add(350 + 80 * c.tableuIdx, function () {
                    c.skipSetToTableu = false;
                    c.setToTableu(false);
                }.bind(this_1), this_1);
                // SoundManager.deal1card.play()
            }
        };
        var this_1 = this;
        while (i-- > 0) {
            _loop_1();
        }
    };
    BoardManager.removeAllCards = function () {
        var cArr = Card.cardArray;
        var i = cArr.length;
        while (i-- > 0) {
            var c = Card.cardArray[i];
            c.markForKill = true;
            c.remove();
        }
        while (Card.cardArray.pop())
            ;
        Card.cardArray = new Array();
        // 
    };
    BoardManager.increaseGameCount = function () {
        var gamesPlayed = Util.getStoragePerDifficulty("gamesPlayed");
        gamesPlayed++;
        Util.setStoragePerDifficulty("gamesPlayed", gamesPlayed);
    };
    BoardManager.resetBoard = function () {
        if (GameUI.initialMoveMade) {
            var cumulativeScore = Util.getStoragePerDifficulty("cumulativeScore", 0);
            cumulativeScore += GameUI.scoreTotal;
            Util.setStoragePerDifficulty("cumulativeScore", cumulativeScore);
            Util.setStoragePerDifficulty("cumulativeTime", (Util.getStoragePerDifficulty("cumulativeTime", 0) + GameUI.time));
            Util.setStoragePerDifficulty("cumulativeMoves", (Util.getStoragePerDifficulty("cumulativeMoves", 0) + GameUI.moves));
        }
        GameContext.gameplayStarted();
        this.HintReset();
        GameUI.resetUI();
        BoardManager.fromSnapshotToBoard(BoardData.boardDataArray[0]);
        BoardData.boardDataArray = new Array();
        BoardManager.actuallyGenerateSnapshot();
    };
    BoardManager.update = function () {
        // if (BoardManager.sortCounter++ % 60 == 1)
        // {
        //      BoardManager.sort();
        // }
        BoardManager.sort();
        if (BoardManager.checkForGameOver() && GameUI.gameStarted && GameOverPrompt.onScreen == false && EndGame.inProgress == false) {
            // var gamewon = new GameOverPrompt()
            EndGame.start();
        }
    };
    BoardManager.checkForGameOver = function () {
        var arr = Card.cardArray;
        var i = arr.length;
        if (arr.length <= 0)
            return false;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState != Card.STATE_FOUNDATION) {
                return false;
            }
        }
        return true;
    };
    BoardManager.sort = function () {
        SimpleGame.myGame.time.events.add(50, function () {
            BoardManager.sortImmediately();
        });
    };
    BoardManager.sortImmediately = function () {
        // var arr = Card.cardArray
        //   
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.selectedFlag || c.myState == Card.STATE_DRAGGED) {
                //  c.cardImgFront.z = 3000 + c.tableuPosition;
                c.myGroup.z = 3000 + c.tableuPosition;
                //  Trace.TraceCardByIdxAndPos(c.tableuIdx, c.tableuPosition)
            }
            else if (c.isMoving) {
                //  c.cardImgFront.z = 2000 + c.tableuPosition;
                c.myGroup.z = 2000 + c.tableuPosition;
                var j = 50;
                while (j-- > 1) {
                    var c1 = CardUtil.getByTabIdxAndPos(c.tableuIdx, c.tableuPosition + j);
                    if (c1 != null) {
                        //   c1.cardImgFront.z =  2000 + c1.tableuPosition; 
                        c1.myGroup.z = 2000 + c1.tableuPosition;
                    }
                }
            }
            else if (c.myState == Card.STATE_TABLEU) {
                // Trace.TraceCardByIdxAndPos(c.tableuIdx, c.tableuPosition)
                //    c.cardImgBack.z = c.cardImgFront.z = 1000 + c.tableuPosition;
                //    
            }
            else if (c.myState == Card.STATE_STOCK) {
                //  c.cardImgBack.z = c.myStockIdx;
                c.myGroup.z = c.myStockIdx;
                //  
            }
        }
        if (BoardManager.areAllCardsStatic()) {
            var arr = Card.cardArray;
            var i = arr.length;
            var totalStockCards = 0;
            while (i-- > 0) {
                var c = arr[i];
                if (c.myState == Card.STATE_TABLEU) {
                    //  c.cardImgBack.z = c.cardImgFront.z = c.tableuPosition;
                    c.myGroup.z = c.tableuPosition;
                }
                if (c.myState == Card.STATE_STOCK) {
                    //  c.cardImgBack.z = c.myStockIdx;
                    c.myGroup.z = c.myStockIdx;
                    totalStockCards++;
                }
                if (c.myState == Card.STATE_FOUNDATION) {
                    c.foundationPosition = 11 - c.cardIdx;
                    c.foundationPosition = 11 - c.cardIdx;
                    if (c.foundationPosition < 0) {
                        c.foundationPosition = 12;
                    }
                    //  c.cardImgFront.z = 10000 + c.foundationPosition+13*c.foundationIdx
                    c.myGroup.z = 10000 + c.foundationPosition + 13 * c.foundationIdx;
                }
            }
        }
        Card.items.sort();
        Card.stock.sort();
        GameUI.topLayer.sort();
    };
    BoardManager.areAllCardsStatic = function () {
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.isMoving == true || c.myState == Card.STATE_DRAGGED || c.selectedFlag) {
                //   
                return false;
            }
        }
        return true;
    };
    BoardManager.generateBoardSnapshot = function (skipundoenable) {
        // EntityHelper.delayedCall(0.1, actuallyGenerateSnapshot);
        if (skipundoenable === void 0) { skipundoenable = false; }
        SimpleGame.myGame.time.events.add(1000, function () {
            BoardManager.actuallyGenerateSnapshot();
        });
        // BoardManager.actuallyGenerateSnapshot();
        if (skipundoenable == false) {
            // UndoButton.isAvailable = true;
        }
    };
    BoardManager.actuallyGenerateSnapshot = function () {
        if (CardUtil.getCompletedStack() != null)
            return;
        if (BoardData.boardDataArray == null) {
            BoardData.boardDataArray = new Array();
            BoardData.boardDataIdx = 0;
        }
        var bData = new BoardData();
        var i = Card.cardArray.length;
        while (i-- > 0) {
            bData.addToBdata(Card.cardArray[i]);
        }
        // bData.currentScore = MainUI.currentScore;
        //  
        if (BoardData.boardDataArray.length >= 2) {
            if (BoardManager.isBdataChanged(bData, BoardData.boardDataArray[BoardData.boardDataArray.length - 1])) {
                BoardData.boardDataArray.push(bData);
                BoardData.boardDataIdx = BoardData.boardDataArray.length - 1;
                // MainUI.totalMoves++;
                // 
            }
        }
        else {
            BoardData.boardDataArray.push(bData);
            //BoardData.boardDataArray.push(bData);
            BoardData.boardDataIdx = BoardData.boardDataArray.length - 1;
            // MainUI.totalMoves++;
            // 
        }
        // if ( ValidMoveUtil.isBoardPlayable() == false)
        // {
        // 	trace("SHOW UNDO MOVE DIALOGUE");
        // 	var nomoremoves:NoMoreMovesPrompt = new NoMoreMovesPrompt();
        // }
        // 
        var i = BoardData.boardDataArray.length;
        while (i-- > 0) {
        }
    };
    BoardManager.isBdataChanged = function (bData, boardData) {
        return BoardData.isBdataChanged(bData, boardData);
    };
    BoardManager.Undo = function () {
        GameUI.secondsWithoutClick = 0;
        // if (MainUI.gameInProgress==false) return;
        //UndoButton.isAvailable = false;
        if (BoardData.boardDataIdx == -1)
            return;
        //BoardData.boardDataIdx--;
        if (this.undoDisabled)
            return;
        SoundManager.playClick();
        if (BoardData.boardDataArray.length > 1) {
            var bData = BoardData.boardDataArray.pop();
            // 
            BoardManager.fromSnapshotToBoard(BoardData.boardDataArray[BoardData.boardDataArray.length - 1]);
            // BoardManager.fromSnapshotToBoard(BoardData.boardDataArray[BoardData.boardDataArray.length-1]);
            GameUI.score--;
            GameUI.moves++;
        }
        else {
            BoardManager.fromSnapshotToBoard(BoardData.boardDataArray[0]);
        }
        BoardManager.sort();
        var i = Card.cardArray.length;
        while (i-- > 0) {
            Card.cardArray[i].update();
        }
        BoardManager.sortImmediately();
        this.undoDisabled = true;
    };
    BoardManager.fromSnapshotToBoard = function (bData, skiplayerfixes) {
        if (skiplayerfixes === void 0) { skiplayerfixes = false; }
        bData.fromSnapshotToBoard(skiplayerfixes);
    };
    BoardManager.GenerateCards = function () {
        Card.cardArray = new Array();
        var i = CardUtil.NUM_SUITS;
        while (i-- > 0) {
            var j = CardUtil.NUM_CARDS_PER_SUIT;
            while (j-- > 0) {
                var card = new Card((i % CardUtil.NUM_SUIT_COLORS), j, i);
            }
        }
        Phaser.ArrayUtils.shuffle(Card.cardArray);
    };
    BoardManager.GenerateTableu = function () {
        var totalCards = CardUtil.NUM_SUITS * CardUtil.NUM_CARDS_PER_SUIT;
        var i = totalCards - 50;
        while (i-- > 0) {
            var tableuIdx = i % 10;
            var tableuPosition = Math.floor(i / 10);
            var card = Card.cardArray[i];
            card.tableuIdx = tableuIdx;
            card.tableuPosition = tableuPosition;
            card.setToTableu(true);
            card.setTableuZCoords();
            if (CardUtil.isOnTableuTop(card)) {
                card.cardImgBack.visible = false;
                card.cardImgFront.visible = true;
                card.turned = true;
            }
            else {
                card.cardImgBack.visible = true;
                card.cardImgFront.visible = false;
                card.turned = false;
            }
        }
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState == Card.STATE_TABLEU) {
                c.setToTableu(true);
            }
        }
        // Card.items.sort();
    };
    BoardManager.GenerateStock = function () {
        var totalCards = CardUtil.NUM_SUITS * CardUtil.NUM_CARDS_PER_SUIT;
        var i = totalCards;
        var stockIdx = 0;
        while (i-- > totalCards - 50) {
            var card = Card.cardArray[i];
            card.setToStock(stockIdx++);
        }
        // Card.items.sort();
    };
    BoardManager.NUM_TABLEU_COLUMNS = 10;
    BoardManager.undoDisabled = true;
    BoardManager.sortCounter = 0;
    BoardManager.hintSuccess = false;
    BoardManager.hintState = 0;
    BoardManager.HINT_STATE_TRY_FIRST_CARD_ONLY_HINT = 0;
    BoardManager.HINT_STATE_TRY_ANY_CARD_HINT = 1;
    BoardManager.HINT_STATE_FIRST_CARD_ONLY_NORESPECT = 2;
    BoardManager.HINT_STATE_ANY_CARD_ONLY_NORESPECT = 3;
    BoardManager.HINT_STATE_TRY_EMPTY_COLUMN = 4;
    BoardManager.HINT_STATE_TRY_EMPTY_BACKUP = 5;
    BoardManager.HINT_STATE_STOCK = 6;
    BoardManager.currentObservedColumn = -1;
    BoardManager.autoHintFlag = true;
    BoardManager.magicWandInProgress = false;
    return BoardManager;
}());
var Card = /** @class */ (function () {
    function Card(suitIdx, cardIdx, deckIdx) {
        this.STOCK_SCALE = 0.76;
        this.initTweenFlag = false;
        this.completedStackCheckedFlag = false;
        this.selectedFlag = false;
        this.turned = false;
        this.isMoving = false;
        this.stockPosition = -1;
        this.lastFrameWasOutsideOfScreen = false;
        this.banInputDown = false;
        this.colorInvertedFlag = false;
        this.initFoundationTweenFlag = false;
        this.markForKill = false;
        this.flipCardAnimActive = false;
        this.skipSetToTableu = false;
        this.endgameTweenFlag = false;
        this.suitIdx = suitIdx;
        this.cardIdx = cardIdx;
        this.deckIdx = deckIdx;
        this.myGroup = SimpleGame.myGame.add.group(Card.items);
        SimpleGame.myGame.stage.smoothed = true;
        SimpleGame.myGame.antialias = false;
        // 
        this.cardImgFrontArray = [];
        var i = 3;
        while (i-- > 0) {
            this.cardImgFrontArray[i] = SimpleGame.myGame.make.sprite(-500, -500, CardUtil.getCardImgName(suitIdx, cardIdx, i));
            this.cardImgFrontArray[i].inputEnabled = true;
            var spr = this.cardImgFrontArray[i];
            spr.texture.baseTexture.mipmap = true;
            this.cardImgFrontArray[i].events.onInputDown.add(this.onCardImgFrontDown, this, 200);
            if (i == 1 || i == 2) {
                this.cardImgFrontArray[i].width = this.cardImgFrontArray[i].width * 0.9;
                this.cardImgFrontArray[i].height = this.cardImgFrontArray[i].height * 0.9;
            }
            this.cardImgFront = this.cardImgFrontArray[i];
            this.cardImgFront.anchor.set(0.5, 0.5);
            this.cardImgFrontArray[i].events.onInputUp.add(function () {
                this.banInputDown = true;
                this.cardImgFront.game.time.events.add(Consts.DELAY_BETWEEN_EVENTS_TOUCH, function () {
                    this.banInputDown = false;
                }, this);
            }.bind(this), this, 100);
            this.cardimgfrontupsignal = this.cardImgFrontArray[i].events.onInputUp.add(this.onCardImgFrontUp, this);
            this.myGroup.add(this.cardImgFrontArray[i]);
            this.cardImgFrontArray[i].visible = false;
        }
        this.cardImgFront = this.cardImgFrontArray[Card.selectedDeckIdx];
        this.cardImgFront.visible = true;
        this.cardImgFront.inputEnabled = true;
        this.cardImgFront.events.onInputDown.add(this.onCardImgFrontDown, this, 200);
        this.cardImgFront.events.onInputUp.add(function () {
            this.banInputDown = true;
            this.cardImgFront.game.time.events.add(Consts.DELAY_BETWEEN_EVENTS_TOUCH, function () {
                this.banInputDown = false;
            }, this);
        }, this, 100);
        this.cardimgfrontupsignal = this.cardImgFront.events.onInputUp.add(this.onCardImgFrontUp, this);
        this.cardImgFront.events.onInputOver.add(function () {
        }, this);
        // this.cardImgFront.events.onOutOfBounds.add(this.onCardImgFrontUp, this)
        // this.cardImgFront.bringToTop();
        this.cardImgBackArr = new Array();
        var i = CardUtil.backNameArray.length;
        ;
        while (i-- > 0) {
            // this.cardImgBackArr[i] = SimpleGame.myGame.make.sprite(-100, -100, CardUtil.deckNameArray[i] + "_face_down" );
            this.cardImgBackArr[i] = SimpleGame.myGame.make.sprite(-100, -100, CardUtil.backNameArray[i]);
            this.cardImgBackArr[i].inputEnabled = true;
            this.cardImgBackArr[i].events.onInputDown.add(this.onCardImgBackDown, this);
            this.cardImgBackArr[i].anchor.set(0.5, 0.5);
            this.myGroup.add(this.cardImgBackArr[i]);
            this.cardImgBackArr[i].visible = false;
            // this.cardImgBackArr[i].smoothed = false;
        }
        this.cardImgBack = this.cardImgBackArr[GameContext.backDeckSelected];
        this.cardImgBack.visible = true;
        // this.cardImgBack = SimpleGame.myGame.make.sprite(-100, -100, 'backside' );
        // this.cardImgBack.inputEnabled = true;
        // this.cardImgBack.width = this.cardImgFront.width
        // this.cardImgBack.height = this.cardImgFront.height
        this.cardImgBack.events.onInputDown.add(this.onCardImgBackDown, this);
        this.cardImgBack.scale.set(Consts.BACK_CARD_SCALE_DEFAULT);
        this.myGroup.add(this.cardImgFront);
        this.myGroup.add(this.cardImgBack);
        this.cardImgHighlight = SimpleGame.myGame.add.sprite(-100, -100, 'card_drag');
        this.myGroup.add(this.cardImgHighlight);
        this.cardImgHighlight.anchor.set(0.5, 0.5);
        this.cardImgHighlight.visible = false;
        this.cardImgFront.anchor.set(0.5, 0.5);
        this.cardImgBack.anchor.set(0.5, 0.5);
        SimpleGame.myGame.renderer.renderSession.roundPixels = true;
        // this.invertFrontColors();
        Card.cardArray.push(this);
        SimpleGame.myGame.time.events.add(3000, function () {
            // this.myState = Card.STATE_FOUNDATION
        }, this);
        this.cannotmovemarker = SimpleGame.myGame.make.graphics(0, 0);
        this.cannotmovemarker.beginFill(0x000000);
        this.cannotmovemarker.drawRoundedRect(3.5, 8, this.cardImgFront.width, this.cardImgFront.height, 6);
        this.cannotmovemarker.alpha = 0.55;
        this.cannotmovemarker.endFill();
        this.cannotmovemarker.x = this.cardImgFront.x;
        this.cannotmovemarker.y = this.cardImgFront.y;
        this.cannotmovemarker.scale.set(Consts.CARD_SCALE_DEFAULT * 0.925, Consts.CARD_SCALE_DEFAULT * 0.89);
        this.myGroup.add(this.cannotmovemarker);
    }
    Card.prototype.updateFrontImg = function () {
        var i = this.cardImgFrontArray.length;
        while (i-- > 0) {
            if (GameContext.frontDeckSelected == i)
                continue;
            this.cardImgFrontArray[i].visible = false;
            this.cardImgFrontArray[i].x = this.cardImgFront.x;
            this.cardImgFrontArray[i].y = this.cardImgFront.y;
        }
        this.cardImgFront = this.cardImgFrontArray[GameContext.frontDeckSelected];
    };
    Card.prototype.updateBackImg = function () {
        var i = this.cardImgBackArr.length;
        while (i-- > 0) {
            if (GameContext.backDeckSelected == i)
                continue;
            this.cardImgBackArr[i].visible = false;
            this.cardImgBackArr[i].x = this.cardImgBack.x;
            this.cardImgBackArr[i].y = this.cardImgBack.y;
        }
        this.cardImgBack = this.cardImgBackArr[GameContext.backDeckSelected];
        this.cardImgBack.scale.set(Consts.BACK_CARD_SCALE_DEFAULT);
    };
    Card.prototype.onCardImgBackDown = function () {
        GameUI.secondsWithoutClick = 0;
        if (Card.disableSelect == true)
            return;
        if (this.myState != Card.STATE_STOCK)
            return;
        if (CardUtil.canUncoverStock()) {
            CardUtil.uncoverStock(this.stockPosition);
            GameUI.gameStarted = true;
            GameUI.initialMoveMade = true;
        }
        else {
            // var cannotuncoverstock = new CannotUncoverStock();
        }
        SoundManager.playClick();
    };
    Card.prototype.tweenInvalidMove = function () {
        var tweenDuration = 30;
        SimpleGame.myGame.add.tween(this.cardImgFront).to({ x: '-10' }, tweenDuration, Phaser.Easing.Linear.None, true, 0, 0, true);
        SimpleGame.myGame.add.tween(this.cardImgFront).to({ x: '10' }, tweenDuration, Phaser.Easing.Linear.None, true, 2 * tweenDuration, 0, true);
        SimpleGame.myGame.add.tween(this.cardImgFront).to({ x: '-10' }, tweenDuration, Phaser.Easing.Linear.None, true, 4 * tweenDuration, 0, true);
        SimpleGame.myGame.add.tween(this.cardImgFront).to({ x: '10' }, tweenDuration, Phaser.Easing.Linear.None, true, 6 * tweenDuration, 0, true);
        if (this.myState == Card.STATE_TABLEU || this.myState == Card.STATE_DRAGGED) {
            var cnext = CardUtil.getByTabIdxAndPosCopy(this.tableuIdx, this.tableuPosition + 1);
            if (cnext != null) {
                if (cnext.myState == Card.STATE_TABLEU || cnext.myState == Card.STATE_DRAGGED) {
                    // cnext.tweenInvalidMove()
                }
            }
        }
    };
    Card.prototype.update = function () {
        // 
        // 
        // this.cardImgBack.position.set(this.cardImgFront.position.x, this.cardImgFront.position.y);
        this.cannotmovemarker.x = this.cardImgFront.x - this.cardImgFront.width / 2;
        this.cannotmovemarker.y = this.cardImgFront.y - this.cardImgFront.height / 2;
        if (CardUtil.isValidMoveStack(this) == true || this.myState != Card.STATE_TABLEU || this.cardImgBack.visible) {
            this.cannotmovemarker.visible = false;
        }
        else {
            this.cannotmovemarker.visible = true;
        }
        if (this.markForKill) {
            this.remove();
            return;
        }
        if (this.cardImgHighlight) {
            this.cardImgHighlight.x = this.cardImgFront.x;
            this.cardImgHighlight.y = this.cardImgFront.y;
            this.cardImgHighlight.scale.x = this.cardImgFront.scale.x * 1.02 / 2;
            this.cardImgHighlight.scale.y = this.cardImgFront.scale.y * 1.02 / 2;
            if (this.selectedFlag) {
                this.cardImgHighlight.visible = true;
            }
            else {
                this.cardImgHighlight.visible = false;
            }
        }
        if (this.selectedFlag) {
            if (Math.abs(this.lastSelectedPosX - this.cardImgFront.x) > 10) {
                this.autoclickEnabled = false;
            }
            // this.cardImgFront.scale.set(ResizeManager.cardScaleFinal)
            this.cardImgFront.x = SimpleGame.myGame.input.activePointer.x - this.dragDeltaX;
            this.cardImgFront.x = ResizeManager.getPointerInCardCoordinates().x - this.dragDeltaX;
            // this.cardImgFront.x = SimpleGame.myGame.input.activePointer.x / ResizeManager.cardScaleFinal - this.dragDeltaX / ResizeManager.cardScaleFinal;
            // this.cardImgFront.x = SimpleGame.myGame.input.activePointer.x;
            this.cardImgFront.y = SimpleGame.myGame.input.activePointer.y - this.dragDeltaY;
            this.cardImgFront.y = ResizeManager.getPointerInCardCoordinates().y - this.dragDeltaY;
            // if (SimpleGame.myGame.device.tridentVersion > 0 || window.navigator.userAgent.indexOf("Edge") > -1)
            // {
            //     if (this.cardImgFront.x + this.cardImgFront.width/2 > SimpleGame.myGame.width)
            //     {
            //         this.cardImgFront.x = SimpleGame.myGame.width - this.cardImgFront.width/2;
            //     }
            //     if (this.cardImgFront.x < this.cardImgFront.width / 2)
            //     {
            //         this.cardImgFront.x = this.cardImgFront.width / 2;
            //     }
            // }
            var i = Card.cardArray.length;
            while (i-- > 0) {
                var c = Card.cardArray[i];
                if (c.myState == Card.STATE_DRAGGED) {
                    c.update();
                }
            }
            this.lastSelectedPosX = this.cardImgFront.x;
            this.lastSelectedPosY = this.cardImgFront.y;
        }
        this.cardImgFront.alpha = 1;
        if (SimpleGame.myGame.input.activePointer.withinGame == false && (this.selectedFlag)) {
            this.lastFrameWasOutsideOfScreen = true;
            // this.cardImgFront.alpha = 0.0001;
        }
        if (this.selectedFlag) {
            // 
            // 
            // 
        }
        // if (Math.random() < 0.01 && this.selectedFlag)
        // {
        //     
        //     
        // }
        if (this.selectedFlag && SimpleGame.pointerDown == false && (((SimpleGame.myGame.device.tridentVersion != 0 || window.navigator.userAgent.indexOf("Edge") > -1) && SimpleGame.myGame.input.activePointer.targetObject != null) || SimpleGame.myGame.input.activePointer.withinGame || SimpleGame.myGame.input.mousePointer.withinGame) && SimpleGame.myGame.input.activePointer.isUp) 
        // if ( SimpleGame.myGame.device.desktop && this.selectedFlag  && ( ((SimpleGame.myGame.device.tridentVersion != 0 || window.navigator.userAgent.indexOf("Edge") > -1) && SimpleGame.myGame.input.activePointer.targetObject!=null) || SimpleGame.myGame.input.activePointer.withinGame ||  SimpleGame.myGame.input.mousePointer.withinGame) && (SimpleGame.myGame.input.mousePointer.isUp || SimpleGame.myGame.input.activePointer.isUp))
        {
            // 
            if (this.cardImgFront.parent) {
                this.cardImgFront.parent.removeChild(this.myGroup);
                this.cardImgFront = SimpleGame.myGame.make.sprite(-500, -500, CardUtil.getCardImgName(this.suitIdx, this.cardIdx));
                this.cardImgFront.inputEnabled = true;
                this.cardImgFront.events.onInputDown.add(this.onCardImgFrontDown, this, 101);
                this.cardImgFront.events.onInputDown.add(function () {
                    this.banInputDown = true;
                    this.cardImgFront.game.time.events.add(Consts.DELAY_BETWEEN_EVENTS_TOUCH, function () {
                        this.banInputDown = false;
                    }, this);
                }, this, 100);
                this.cardimgfrontupsignal = this.cardImgFront.events.onInputUp.add(this.onCardImgFrontUp, this);
                this.setToTableu(true);
                Card.items.add(this.myGroup);
                var arr = Card.cardArray;
                var i = arr.length;
                while (i-- > 0) {
                    var c = arr[i];
                    if (c.myState == Card.STATE_DRAGGED) {
                        Card.items.add(c.myGroup);
                        c.setToTableu(true);
                    }
                }
                this.cardImgFront.anchor.set(0.5, 0.5);
            }
            this.onCardImgFrontUp();
        }
        if (this.flipCardAnimActive == false && this.myState != Card.STATE_STOCK && this.myState != Card.STATE_FOUNDATION && this.cardImgFront.scale.x < Consts.CARD_SCALE_DEFAULT) {
            this.cardImgFront.scale.x += 0.02;
            this.cardImgFront.scale.y += 0.02;
        }
        else {
            if (this.myState != Card.STATE_FOUNDATION && this.flipCardAnimActive == false) {
                this.cardImgFront.scale.x = Consts.CARD_SCALE_DEFAULT;
                this.cardImgFront.scale.y = Consts.CARD_SCALE_DEFAULT;
            }
        }
        if (this.initTweenFlag) {
            // GameUI.topLayer.add(this.cardImgFront);
            // GameUI.topLayer.add(this.cardImgBack);
            // 
            return;
        }
        if (this.myState == Card.STATE_STOCK) {
            this.updateStock();
        }
        if (this.myState == Card.STATE_TABLEU) {
            this.updateTableu();
            this.initFoundationTweenFlag = false;
            // this.cardImgFront.x = Math.round(this.cardImgFront.x)
            // this.cardImgFront.y = Math.round(this.cardImgFront.y)
            // this.cardImgBack.x = Math.floor(this.cardImgBack.x)
            // this.cardImgBack.y = Math.floor(this.cardImgBack.y)           
        }
        if (this.myState == Card.STATE_DRAGGED) {
            this.updateDragged();
        }
        if (this.myState == Card.STATE_STOCK_TO_TAB) {
            return;
        }
        if (this.turned == false) {
            this.cardImgBack.visible = true;
            this.cardImgFront.visible = false;
        }
        else {
            this.cardImgBack.visible = false;
            this.cardImgFront.visible = true;
            if (this.invertedSprite != null) {
                if (this.colorInvertedFlag) {
                    this.cardImgFront.visible = false;
                    this.invertedSprite.position.set(this.cardImgFront.x, this.cardImgFront.y);
                    this.invertedSprite.anchor.set(0.5, 0.5);
                    this.invertedSprite.z = this.cardImgFront.z;
                    this.invertedSprite.visible = true;
                }
                else {
                    this.invertedSprite.visible = false;
                }
            }
        }
        if (this.selectedFlag) {
            this.cardImgFront.x = Math.floor(this.cardImgFront.x);
            this.cardImgFront.y = Math.floor(this.cardImgFront.y);
        }
        if (this.myState == Card.STATE_FOUNDATION) {
            this.updateFoundation2();
        }
        this.setIsMovingFlag();
    };
    Card.prototype.getFoundationXInit = function () {
        if (SimpleGame.myGame.scale.isGameLandscape) {
            if (BoardManager.isRightHandedGame) {
                return Card.LANDSCAPE_CARD_FOUND_POS_X_INIT;
            }
            else {
                return Card.LEFTHAND_LANDSCAPE_CARD_FOUND_POS_X_INIT;
            }
        }
        else {
            if (BoardManager.isRightHandedGame) {
                return Card.CARD_FOUND_POS_X_INIT;
            }
            else {
                return Card.LEFTHAND_CARD_FOUND_POS_X_INIT;
            }
        }
    };
    Card.prototype.getFoundationXDelta = function () {
        if (SimpleGame.myGame.scale.isGameLandscape) {
            if (BoardManager.isRightHandedGame) {
                return Card.LANDSCAPE_CARD_FOUND_POS_X_DELTA;
            }
            else {
                return Card.LEFTHAND_LANDSCAPE_CARD_FOUND_POS_X_DELTA;
            }
        }
        else {
            if (BoardManager.isRightHandedGame) {
                return Card.CARD_FOUND_POS_X_DELTA;
            }
            else {
                return Card.LEFTHAND_CARD_FOUND_POS_X_DELTA;
            }
        }
    };
    Card.prototype.updateFoundation2 = function () {
        var cPosY = Card.CARD_FOUND_POS_Y_INIT + this.foundationIdx * Card.CARD_FOUND_POS_Y_DELTA;
        var cPosX = Math.floor(this.getFoundationXInit()) - Math.floor(this.getFoundationXDelta()) * (7 - this.foundationIdx);
        if (SimpleGame.myGame.scale.isGameLandscape) {
            cPosX = Math.floor(this.getFoundationXInit()) - Math.floor(this.getFoundationXDelta()) * (7 - this.foundationIdx);
            cPosY = Card.LANDSCAPE_CARD_FOUND_POS_Y_INIT + this.foundationIdx * Card.LANDSCAPE_CARD_FOUND_POS_Y_DELTA;
        }
        else {
        }
        var cPosXDelta = (cPosX - this.cardImgFront.x) * 0.3;
        var cPosYDelta = (cPosY - this.cardImgFront.y) * 0.3;
        this.cardImgFront.x += cPosXDelta;
        this.cardImgFront.y += cPosYDelta;
        this.cardImgBack.x = this.cardImgFront.x;
        this.cardImgBack.y = this.cardImgFront.y;
    };
    Card.prototype.updateFoundation = function () {
        if (this.initFoundationTweenFlag == false) {
            this.initFoundationTweenFlag = true;
            this.myGroup.z += 10000;
            if (this.cardIdx == CardUtil.CARD_IDX_K) {
                this.cardImgFront.z += 100000;
            }
        }
        else {
            this.cardImgBack.position.set(this.cardImgFront.x, this.cardImgFront.y);
            return;
        }
        var cPosY = Card.CARD_FOUND_POS_Y_INIT + this.foundationIdx * Card.CARD_FOUND_POS_Y_DELTA;
        var cPosX = Math.floor(this.getFoundationXInit()) - Math.floor(this.getFoundationXDelta()) * (7 - this.foundationIdx);
        if (SimpleGame.myGame.scale.isGameLandscape) {
            cPosX = Math.floor(this.getFoundationXInit()) - Math.floor(this.getFoundationXDelta()) * (7 - this.foundationIdx);
            cPosY = Card.LANDSCAPE_CARD_FOUND_POS_Y_INIT + this.foundationIdx * Card.LANDSCAPE_CARD_FOUND_POS_Y_DELTA;
        }
        else {
        }
        var tween1 = SimpleGame.myGame.add.tween(this.cardImgFront).to({ y: cPosY }, 200, Phaser.Easing.Default, true);
        var tween2 = SimpleGame.myGame.add.tween(this.cardImgFront).to({ x: cPosX }, 200, Phaser.Easing.Default, true);
        tween2.onComplete.add(function () {
            if (this.cardIdx != CardUtil.CARD_IDX_K) {
                // this.cardImgFront.y = 4000;
            }
        }, this);
    };
    Card.prototype.updateDragged = function () {
        var c = CardUtil.getSelectedCard();
        if (c != null) {
            this.cardImgFront.x = Math.round(c.cardImgFront.x - this.draggedDeltaX);
            this.cardImgFront.y = Math.round(c.cardImgFront.y - this.draggedDeltaY);
        }
    };
    Card.prototype.updateTableu = function () {
        //   
        // this.cardImgFront.position.set(200,300);
        this.cardImgBack.position.set(this.cardImgFront.x, this.cardImgFront.y);
        if (this.selectedFlag == false) {
            this.setToTableu();
        }
    };
    Card.getStockXInit = function () {
        if (SimpleGame.myGame.scale.isGameLandscape) {
            if (BoardManager.isRightHandedGame) {
                return Card.LANDSCAPE_CARD_STOCK_POSITION_X_INIT;
            }
            else {
                return Card.LEFTHAND_LANDSCAPE_CARD_STOCK_POSITION_X_INIT;
            }
        }
        else {
            if (BoardManager.isRightHandedGame) {
                return Card.CARD_STOCK_POSITION_X_INIT;
            }
            else {
                return Card.LEFTHAND_CARD_STOCK_POSITION_X_INIT;
            }
        }
    };
    Card.getStockXDelta = function () {
        if (SimpleGame.myGame.scale.isGameLandscape) {
            if (BoardManager.isRightHandedGame) {
                return Card.LANDSCAPE_CARD_STOCK_POSITION_X_DELTA;
            }
            else {
                return Card.LEFTHAND_LANDSCAPE_CARD_STOCK_POSITION_X_DELTA;
            }
        }
        else {
            if (BoardManager.isRightHandedGame) {
                return Card.CARD_STOCK_POSITION_X_DELTA;
            }
            else {
                return Card.LEFTHAND_CARD_STOCK_POSITION_X_DELTA;
            }
        }
    };
    Card.prototype.updateStock = function () {
        // 
        var deltaIdx = Math.floor(this.myStockIdx / 10);
        if (SimpleGame.myGame.scale.isGameLandscape) {
            // 
            this.cardImgBack.position.set(Card.getStockXInit() + deltaIdx * Card.getStockXDelta(), Card.LANDSCAPE_CARD_STOCK_POSITION_Y_INIT + deltaIdx * Card.LANDSCAPE_CARD_STOCK_POSITION_Y_DELTA);
        }
        else {
            this.cardImgBack.position.set(Card.getStockXInit() + deltaIdx * Card.getStockXDelta(), Card.CARD_STOCK_POSITION_Y_INIT + deltaIdx * Card.CARD_STOCK_POSITION_Y_DELTA);
        }
        this.cardImgFront.position.set(this.cardImgBack.x, this.cardImgBack.y);
    };
    Card.prototype.manageInvalidMovingStackSelection = function () {
        this.peekedFlag = true;
    };
    Card.prototype.onCardImgFrontDown = function () {
        GameUI.secondsWithoutClick = 0;
        //  
        BoardManager.HintReset();
        if (CardUtil.checkIfSelectedCardExists())
            return;
        if (Card.disableSelect == true)
            return;
        if (this.myState == Card.STATE_FOUNDATION)
            return;
        // if (this.selectedFlag) return;
        if (this.banInputDown) {
            return;
        }
        if (CardUtil.isValidMoveStack(this) == false) {
            this.manageInvalidMovingStackSelection();
            return;
        }
        Trace.TraceCardByIdxAndPos(this.tableuIdx, this.tableuPosition);
        this.banInputDown = true;
        this.cardImgFront.game.time.events.add(Consts.DELAY_BETWEEN_EVENTS_TOUCH, function () {
            this.banInputDown = false;
        }, this);
        SoundManager.playGrabCard();
        GameUI.gameStarted = true;
        // this.cardImgFront.input.enableDrag()
        // this.cardImgFront.z = 1000;
        this.myGroup.z = 1000;
        var deltaY = 3;
        this.cardImgFront.y -= deltaY;
        var deltax = 0;
        this.cardImgFront.x -= deltax;
        this.cardImgFront.worldPosition.x;
        this.dragDeltaX = SimpleGame.myGame.input.activePointer.x - this.cardImgFront.x;
        this.dragDeltaX = ResizeManager.getPointerInCardCoordinates().x - this.cardImgFront.x;
        // this.dragDeltaX = (SimpleGame.myGame.input.activePointer.x)  - this.cardImgFront.x;
        // 
        this.dragDeltaY = SimpleGame.myGame.input.activePointer.y - this.cardImgFront.y;
        this.dragDeltaY = ResizeManager.getPointerInCardCoordinates().y - this.cardImgFront.y;
        this.autoclickEnabled = true;
        //  
        // 
        this.selectedFlag = true;
        this.lastSelectedPosX = this.cardImgFront.x;
        this.lastSelectedPosY = this.cardImgFront.y;
        SimpleGame.myGame.time.events.add(250, function () {
            this.autoclickEnabled = false;
            // 
        }, this);
        GameUI.topLayer.add(this.myGroup);
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState == Card.STATE_TABLEU) {
                if (c.tableuIdx == this.tableuIdx) {
                    if (c.tableuPosition > this.tableuPosition) {
                        c.myState = Card.STATE_DRAGGED;
                        c.draggedDeltaX = 0;
                        c.draggedDeltaY = -Card.LANDSCAPE_CARD_TAB_POS_Y_DELTA * (c.tableuPosition - this.tableuPosition);
                        // c.cardImgFront.z = c.tableuPosition-this.tableuPosition+this.cardImgFront.z; 
                        c.myGroup.z = c.tableuPosition - this.tableuPosition + this.myGroup.z;
                        GameUI.topLayer.add(c.myGroup);
                    }
                }
            }
        }
        BoardManager.sort();
        BoardManager.sortImmediately();
    };
    Card.prototype.onCardImgFrontUp = function () {
        GameUI.secondsWithoutClick = 0;
        if (this.peekedFlag == true) {
            this.peekedFlag = false;
        }
        this.lastFrameWasOutsideOfScreen = false;
        if (this.selectedFlag == false)
            return;
        //  
        // 
        this.cardImgFront.input.disableDrag();
        // this.setToTableu(true)
        CardUtil.cardDeselected(this);
        if (this.autoclickEnabled == true && CardUtil.droppedOnTableuSuccess == false) {
            CardUtil.tryToAutoclick(this);
            this.selectedFlag = false;
        }
        else {
            // CardUtil.cardDeselected(this)
        }
        CardUtil.returnUnplacedTabCards();
        CardUtil.tryToPlaceCardsOnFoundation();
        BoardManager.generateBoardSnapshot();
        BoardManager.sort();
        BoardManager.sortImmediately();
    };
    Card.prototype.setIsMovingFlag = function () {
        if (this.myState == Card.STATE_TABLEU) {
            var newX = Card.LANDSCAPE_CARD_TAB_POS_X_INIT + this.tableuIdx * Card.LANDSCAPE_CARD_TAB_POS_X_DELTA;
            if (Math.abs(newX - this.cardImgFront.x) > 3 || Math.abs(this.newY - this.cardImgFront.y) > 3) {
                this.isMoving = true;
            }
            else {
                this.isMoving = false;
            }
        }
        else if (this.myState == Card.STATE_STOCK || this.myState == Card.STATE_FOUNDATION) {
            this.isMoving = false;
        }
    };
    Card.prototype.setToTableu = function (immediately) {
        if (immediately === void 0) { immediately = false; }
        if (this.skipSetToTableu) {
            return;
        }
        var cardTabPosXInit = Card.LANDSCAPE_CARD_TAB_POS_X_INIT;
        var cardTabPosXDelta = Card.LANDSCAPE_CARD_TAB_POS_X_DELTA;
        if (SimpleGame.myGame.scale.isGamePortrait) {
            var cardTabPosXInit = Card.PORTRAIT_CARD_TAB_POS_X_INIT;
            var cardTabPosXDelta = Card.PORTRAIT_CARD_TAB_POS_X_DELTA;
        }
        var cardTabPosYInit = Card.LANDSCAPE_CARD_TAB_POS_Y_INIT;
        var cardTabPosYDelta = Card.LANDSCAPE_CARD_TAB_POS_Y_DELTA;
        if (SimpleGame.myGame.scale.isGamePortrait) {
            var cardTabPosYInit = Card.PORTRAIT_CARD_TAB_POS_Y_INIT;
            var cardTabPosYDelta = Card.PORTRAIT_CARD_TAB_POS_Y_DELTA;
        }
        // 
        //    var closedCardsDelta = 16 - 5*ResizeManager.dynamicCardYDelta;
        cardTabPosYDelta = 9 * ResizeManager.dynamicCardYDelta;
        // if (Math.random() < 0.01)  
        if (cardTabPosYDelta > 26) {
            cardTabPosYDelta = 26;
        }
        var closedCardsDelta = Math.floor(cardTabPosYDelta * 0.45);
        var firstTurnedCardIdx = CardUtil.getFirstTurnedCardIdx(this.tableuIdx);
        var newX = cardTabPosXInit + this.tableuIdx * cardTabPosXDelta;
        this.newX = newX;
        if (firstTurnedCardIdx <= this.tableuPosition) {
            var newY = Math.floor(cardTabPosYInit) + firstTurnedCardIdx * Math.floor(cardTabPosYDelta - closedCardsDelta) + (this.tableuPosition - firstTurnedCardIdx) * Math.floor(cardTabPosYDelta);
        }
        else {
            var newY = Math.floor(cardTabPosYInit) + this.tableuPosition * Math.floor(cardTabPosYDelta - closedCardsDelta);
        }
        //   var newY = Card.CARD_TAB_POS_Y_INIT + this.tableuPosition * (Card.CARD_TAB_POS_Y_DELTA-3);
        if (this.tableuIdx == 0) {
            // 
        }
        if (Math.abs(newX - this.cardImgFront.x) > 5) {
            // 
            this.isMoving = true;
            var cMinusOne = CardUtil.getByTabIdxAndPos(this.tableuIdx, this.tableuPosition - 1);
            if (cMinusOne != null) {
                if (cMinusOne.isMoving) {
                    this.isMoving = false;
                }
            }
            // BoardManager.sort()
        }
        else {
            if (this.isMoving == true) {
            }
            this.isMoving = false;
        }
        var peekedPosition = CardUtil.getPeekedPosition(this.tableuIdx);
        var peekDelta = this.tableuPosition - peekedPosition;
        if (peekedPosition < 0) {
            peekDelta = -1;
        }
        // var deltaMultiplier = this.deltaMultiplier
        var deltaMultiplier = Card.deltaMultiplier;
        var deltaReducer = 0.965;
        var cardsUntilReducing = 1.05 * ResizeManager.dynamicCardYDelta * 2 + 0.2 * ResizeManager.dynamicCardYDelta * ResizeManager.dynamicCardYDelta + 0.02 * ResizeManager.dynamicCardYDelta * ResizeManager.dynamicCardYDelta * ResizeManager.dynamicCardYDelta;
        var maxIdx = CardUtil.getMaxTableuPosition(this.tableuIdx);
        if (maxIdx > cardsUntilReducing) {
            var delta = maxIdx - cardsUntilReducing;
            if (firstTurnedCardIdx <= this.tableuPosition) {
                if (peekDelta > 0) {
                    var newY = cardTabPosYInit + firstTurnedCardIdx * (cardTabPosYDelta - closedCardsDelta) + (deltaMultiplier * delta * (Math.pow(deltaReducer, delta))) + (this.tableuPosition - firstTurnedCardIdx) * (cardTabPosYDelta - deltaMultiplier * delta * (Math.pow(deltaReducer, delta)));
                }
                else {
                    var newY = cardTabPosYInit + firstTurnedCardIdx * (cardTabPosYDelta - closedCardsDelta) + (this.tableuPosition - firstTurnedCardIdx) * (cardTabPosYDelta - deltaMultiplier * delta * (Math.pow(deltaReducer, delta)));
                }
            }
            else {
                var newY = cardTabPosYInit + this.tableuPosition * (cardTabPosYDelta - closedCardsDelta);
            }
        }
        if (this.selectedFlag || this.myState == Card.STATE_DRAGGED) {
            var newY = cardTabPosYInit + this.tableuPosition * (cardTabPosYDelta - closedCardsDelta);
        }
        newY = Math.floor(newY);
        if (immediately) {
            this.cardImgFront.x = newX;
            this.cardImgFront.y = newY;
        }
        else {
            var deltaX = (newX - this.cardImgFront.x) * 0.25;
            var deltaY = (newY - this.cardImgFront.y) * 0.25;
            if (Math.abs(deltaX) < 0) {
                this.cardImgFront.x = newX;
            }
            else {
                this.cardImgFront.x += deltaX;
            }
            if (Math.abs(deltaY) < 0) {
                this.cardImgFront.y = newY;
            }
            else {
                this.cardImgFront.y += deltaY;
            }
            // this.cardImgFront.x += deltaX
            // this.cardImgFront.y += deltaY
        }
        if (Math.abs(newX - this.cardImgFront.x) < 0.3 && Math.abs(newX - this.cardImgFront.x) >= 0) {
            this.cardImgFront.x = Math.round(this.cardImgFront.x);
        }
        if (Math.abs(newY - this.cardImgFront.y) < 0.3 && Math.abs(newY - this.cardImgFront.y) >= 0) {
            this.cardImgFront.y = Math.round(this.cardImgFront.y);
        }
        if (this.turned) {
            this.cardImgBack.visible = false;
            this.cardImgFront.visible = true;
        }
        this.myState = Card.STATE_TABLEU;
    };
    Card.prototype.setFromStockToTabStart = function (myTabIdx) {
        // 
        this.myTabIdx = myTabIdx;
        this.cardImgBack.visible = false;
        // this.cardImgFront.visible = true;
        this.myState = Card.STATE_STOCK_TO_TAB;
        SimpleGame.myGame.time.events.add(myTabIdx * 80, this.setFromStockToTab, this);
        // this.flipcard()
        this.updateStock();
        // this.cardImgFront.z = 10000 - myTabIdx;
        this.myGroup.z = 10000 - myTabIdx;
    };
    Card.prototype.setFromStockToTab = function () {
        this.tableuPosition = 1 + CardUtil.getMaxTableuPosition(this.myTabIdx);
        this.myState = Card.STATE_TABLEU;
        this.tableuIdx = this.myTabIdx;
        SimpleGame.myGame.time.events.add(100, function () {
            this.setToTableu();
            this.flipcard(true);
        }, this);
        this.cardImgFront.z = 1000;
        this.myGroup.z = 1000;
        Card.items.add(this.myGroup);
    };
    Card.prototype.flipcard = function (withAnim) {
        // withAnim = false;
        if (withAnim === void 0) { withAnim = false; }
        if (this.turned)
            return;
        // withAnim = false;
        if (withAnim) {
            this.flipCardAnimActive = true;
            this.cardImgFront.scale.x = 0;
            var t1 = SimpleGame.myGame.add.tween(this.cardImgBack.scale).to({ x: 0 }, 300, Phaser.Easing.Linear.None, true, 100, 0, false);
            SimpleGame.myGame.time.events.add(300, function () {
                this.turned = true;
                SimpleGame.myGame.add.tween(this.cardImgFront.scale).to({ x: Consts.CARD_SCALE_DEFAULT }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
            }, this);
            SimpleGame.myGame.time.events.add(500, function () {
                this.flipCardAnimActive = false;
                this.cardImgBack.scale.x = Consts.BACK_CARD_SCALE_DEFAULT;
                // this.cardImgFront.scale.x = 0.5
            }, this);
        }
        else {
            this.turned = true;
        }
        // this.turned = true;
    };
    Card.prototype.setTableuZCoords = function () {
        // this.cardImgBack.z = this.tableuPosition;
        // this.cardImgFront.z = this.tableuPosition;
        this.myGroup.z = this.tableuPosition;
    };
    Card.prototype.setToStock = function (stockIdx) {
        this.myState = Card.STATE_STOCK;
        this.cardImgFront.visible = false;
        this.cardImgBack.visible = true;
        this.myStockIdx = stockIdx;
        this.stockPosition = Math.floor(stockIdx / 10);
        // Card.items.sort("myStockIdx", Phaser.Group.SORT_ASCENDING)
        // Card.items.sort()
        // Card.items.add(this.cardImgBack);
        // Card.items.add(this.cardImgFront);
        Card.items.add(this.myGroup);
        // this.cardImgFront.z = stockIdx;
        // this.cardImgBack.z = stockIdx;
        this.myGroup.z = stockIdx;
        // 
        this.updateStock();
    };
    Card.prototype.initTween = function (idx) {
        this.initTweenFlag = true;
        this.tweenIdx = idx;
        Card.initTweenFlag = true;
        idx = this.tableuIdx * 6 + this.tableuPosition;
        idx = this.tableuPosition * 10 + this.tableuIdx;
        idx = this.tableuIdx;
        this.cardImgBack.x = this.cardImgFront.x;
        this.cardImgBack.y = this.cardImgFront.y;
        this.cardImgBackXOld = this.cardImgFront.x;
        this.cardImgFront.y += ResizeManager.deviceHeight * 1.2;
        this.cardImgBack.y += ResizeManager.deviceHeight * 1.2;
        this.cardImgBack.x = this.cardImgFront.x = 880;
        //   SimpleGame.myGame.time.advancedTiming = true;
        //   SimpleGame.myGame.time.slowMotion = 10;
        SimpleGame.myGame.time.events.add(160 + 80 * idx, function () {
            this.isMoving = true;
            SimpleGame.myGame.time.events.add(0, function () {
                if (this.tweenIdx % 2 == 0 || true) {
                    //    SoundManager.dealcards.position = 200;
                    //    SoundManager.dealcards.volume = 0.8;
                    //    SoundManager.dealcards.update()
                    //    SoundManager.dealcards.play()
                }
            }, this);
            //    var tween = SimpleGame.myGame.add.tween(this.cardImgFront).to({y:this.cardImgFront.y-650, onComplete:this.tweenComplete.bind(this)},200,Phaser.Easing.Cubic.Out, true, 0)
            //    tween.onComplete.add(this.tweenComplete, this)
            this.tweenComplete();
            //    var tween1 = SimpleGame.myGame.add.tween(this.cardImgBack).to({y:this.cardImgBack.y-700},200,Phaser.Easing.Cubic.Out, true, idx*20)
            //    var tween2 = SimpleGame.myGame.add.tween(this.cardImgFront).to({x:this.cardImgBackXOld},200,Phaser.Easing.Cubic.Out, true,0)
            //    var tween3 = SimpleGame.myGame.add.tween(this.cardImgBack).to({x:this.cardImgBackXOld},200,Phaser.Easing.Cubic.Out, true, idx*20)
        }, this);
        //    this.updateTableu()
        if (CardUtil.isOnTableuTop(this) == false) {
            this.cardImgBack.visible = true;
        }
    };
    Card.prototype.tweenComplete = function () {
        // this.myState = Card.STATE_TABLEU;
        // 
        if (this.tweenIdx == 9) {
            SimpleGame.myGame.time.events.add(500, function () {
                Card.initTweenFlag = false;
            });
        }
        this.initTweenFlag = false;
        this.isMoving = false;
        // Card.items.add(this.cardImgFront);
        // Card.items.add(this.cardImgBack);
        Card.items.add(this.myGroup);
    };
    Card.prototype.remove = function () {
        if (this.cardImgFront.parent) {
            this.cardImgFront.parent.removeChild(this.cardImgFront);
        }
        if (this.cardImgBack.parent) {
            this.cardImgBack.parent.removeChild(this.cardImgBack);
        }
        if (this.myGroup.parent) {
            this.myGroup.parent.removeChild(this.cardImgBack);
        }
        // Card.items.remove(this.cardImgFront);
        // Card.items.remove(this.cardImgBack);
        Card.items.remove(this.myGroup);
        Card.cardArray.slice(Card.cardArray.indexOf(this, 0), 1);
        this.cardImgFront.destroy();
        this.cardImgBack.destroy();
    };
    Card.Init = function () {
        Card.cardArray = new Array();
        Card.backgroundLayer = SimpleGame.myGame.add.group();
        Card.stock = SimpleGame.myGame.add.group();
        Card.items = SimpleGame.myGame.add.group();
        // Card.items.visible = false;
        // var c1:Card = new Card(1,1);
    };
    Card.preload = function (myIdx) {
        if (myIdx === void 0) { myIdx = -1; }
        if (SimpleGame.myGame.cache.checkImageKey('card_back') == false && (myIdx == -1 || myIdx == 0)) {
            SimpleGame.myGame.load.image('backside', 'assets/CARDS/deck_1/card_back.png', true);
        }
        // SimpleGame.myGame.load.image('deck_1_face_down', 'assets/CARDS/deck_1/deck_1_face_down.png', true);
        // SimpleGame.myGame.load.image('deck_2_face_down', 'assets/CARDS/deck_2/deck_2_face_down.png', true);
        // SimpleGame.myGame.load.image('deck_3_face_down', 'assets/CARDS/deck_3/deck_3_face_down.png', true);
        var i = CardUtil.NUM_CARDS_PER_SUIT * 4;
        while (i-- > 0) {
            if (SimpleGame.myGame.cache.checkImageKey(CardUtil.deckNameArray[0] + "_" + CardUtil.cardNameArray[i]) == false && (myIdx == -1 || myIdx == 0)) {
                SimpleGame.myGame.load.image(CardUtil.deckNameArray[0] + "_" + CardUtil.cardNameArray[i], CardUtil.getCardNameURLs(0)[i], true);
                // var rendTex:Phaser.RenderTexture = SimpleGame.myGame.cache.(CardUtil.deckNameArray[0] + "_" + CardUtil.cardNameArray[i])
                // rendTex.width = rendTex.height = 64
            }
            if (SimpleGame.myGame.cache.checkImageKey(CardUtil.deckNameArray[1] + "_" + CardUtil.cardNameArray[i]) == false && (myIdx == -1 || myIdx == 1)) {
                SimpleGame.myGame.load.image(CardUtil.deckNameArray[1] + "_" + CardUtil.cardNameArray[i], CardUtil.getCardNameURLs(1)[i], true);
            }
            if (SimpleGame.myGame.cache.checkImageKey(CardUtil.deckNameArray[2] + "_" + CardUtil.cardNameArray[i]) == false && (myIdx == -1 || myIdx == 2)) {
                SimpleGame.myGame.load.image(CardUtil.deckNameArray[2] + "_" + CardUtil.cardNameArray[i], CardUtil.getCardNameURLs(2)[i], true);
            }
        }
    };
    Card.FOUNDATION_SCALE = 0.76;
    Card.LEFTHAND_CARD_STOCK_POSITION_X_INIT = 115;
    Card.CARD_STOCK_POSITION_X_INIT = 1060;
    Card.LANDSCAPE_CARD_STOCK_POSITION_X_INIT = 1180;
    Card.LEFTHAND_LANDSCAPE_CARD_STOCK_POSITION_X_INIT = -10;
    Card.CARD_STOCK_POSITION_X_DELTA = -25 * 0.6;
    Card.LANDSCAPE_CARD_STOCK_POSITION_X_DELTA = 0;
    Card.LEFTHAND_CARD_STOCK_POSITION_X_DELTA = 25 * 0.6;
    Card.LEFTHAND_LANDSCAPE_CARD_STOCK_POSITION_X_DELTA = 0;
    Card.CARD_STOCK_POSITION_Y_INIT = 150;
    Card.LANDSCAPE_CARD_STOCK_POSITION_Y_INIT = 450;
    Card.CARD_STOCK_POSITION_Y_DELTA = 0;
    Card.LANDSCAPE_CARD_STOCK_POSITION_Y_DELTA = 25 * 0.6;
    Card.CARD_FOUND_POS_X_INIT = 320;
    Card.LANDSCAPE_CARD_FOUND_POS_X_INIT = -10;
    Card.LEFTHAND_CARD_FOUND_POS_X_INIT = 850;
    Card.LEFTHAND_LANDSCAPE_CARD_FOUND_POS_X_INIT = 1200;
    Card.CARD_FOUND_POS_X_DELTA = 30;
    Card.LANDSCAPE_CARD_FOUND_POS_X_DELTA = 0;
    Card.LEFTHAND_CARD_FOUND_POS_X_DELTA = -30;
    Card.LEFTHAND_LANDSCAPE_CARD_FOUND_POS_X_DELTA = 0;
    Card.CARD_FOUND_POS_Y_INIT = 150;
    Card.LANDSCAPE_CARD_FOUND_POS_Y_INIT = 450;
    Card.CARD_FOUND_POS_Y_DELTA = 0;
    Card.LANDSCAPE_CARD_FOUND_POS_Y_DELTA = 15;
    Card.LANDSCAPE_CARD_TAB_POS_X_INIT = 102 * 0.6 + 50;
    Card.PORTRAIT_CARD_TAB_POS_X_INIT = 102 * 0.6 + 50;
    Card.LANDSCAPE_CARD_TAB_POS_X_DELTA = 106;
    Card.PORTRAIT_CARD_TAB_POS_X_DELTA = 98;
    Card.LANDSCAPE_CARD_TAB_POS_Y_INIT = 285 * 0.6 - 16;
    Card.PORTRAIT_CARD_TAB_POS_Y_INIT = 535 * 0.6;
    Card.LANDSCAPE_CARD_TAB_POS_Y_DELTA = 26;
    Card.PORTRAIT_CARD_TAB_POS_Y_DELTA = 26;
    Card.STATE_INIT_TWEEN = -1;
    Card.STATE_TABLEU = 0;
    Card.STATE_STOCK = 1;
    Card.STATE_FOUNDATION = 2;
    Card.STATE_DRAGGED = 3;
    Card.STATE_STOCK_TO_TAB = 4;
    Card.initTweenFlag = false;
    Card.disableSelect = false;
    Card.deltaMultiplier = 1;
    Card.selectedDeckIdx = 0;
    return Card;
}());
var CardUtil = /** @class */ (function () {
    function CardUtil() {
    }
    // static deckNameArray: any;
    //svašta dodati ovd
    CardUtil.getByCardAndSuitIdx = function (suitidx, cardidx, deckidx) {
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.suitIdx == suitidx && c.cardIdx == cardidx && c.deckIdx == deckidx) {
                return c;
            }
        }
        return null;
    };
    CardUtil.getTotalTableuCards = function () {
        var c = 0;
        var i = Card.cardArray.length;
        while (i-- > 0) {
            if (Card.cardArray[i].myState == Card.STATE_TABLEU) {
                c++;
            }
        }
        return c;
    };
    CardUtil.getFirstTurnedCardIdx = function (tabIdx) {
        var i = -1;
        do {
            i++;
            var c = CardUtil.getByTabIdxAndPos(tabIdx, i);
            if (c == null) {
                break;
            }
        } while (c.turned == false);
        return i;
    };
    CardUtil.cardDeselected = function (card) {
        CardUtil.returnToTableuLayer();
        CardUtil.playInvalidSound = false;
        //  
        CardUtil.droppedOnTableuSuccess = false;
        CardUtil.checkIfDroppedOnTableu(card);
        // 
        if (CardUtil.droppedOnTableuSuccess == false) {
            CardUtil.checkIfDroppedOnEmptyTableu(card);
        }
        if (CardUtil.droppedOnTableuSuccess) {
            GameUI.initialMoveMade = true;
            GameUI.moves++;
            BoardManager.undoDisabled = false;
            SimpleGame.myGame.time.events.add(150, function () {
                GameUI.score--;
            });
            SoundManager.valid.play();
        }
        else {
            if (CardUtil.playInvalidSound) {
                // SoundManager.fail.play();
            }
            // 
        }
        // CardUtil.returnUnplacedTabCards();
        // CardUtil.tryToPlaceCardsOnFoundation();
        // BoardManager.generateBoardSnapshot()
        //
        // BoardManager.sort()
    };
    CardUtil.returnToTableuLayer = function () {
        // Card.items.add(card.cardImgFront) 
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            if (arr[i].myState == Card.STATE_DRAGGED || arr[i].selectedFlag) {
                // 
                Card.items.add(arr[i].myGroup);
            }
        }
    };
    CardUtil.getCardOnTop = function (tabIdx) {
        // 
        var i = -1;
        do {
            i++;
            var c = CardUtil.getByTabIdxAndPos(tabIdx, i);
            if (c == null) {
                // 
                return null;
            }
            else {
                // 
            }
            // Trace.TraceCardByIdxAndPos(c.tableuIdx, c.tableuPosition)
            if (c.myState != Card.STATE_TABLEU) {
                // 
                continue;
            }
            if (CardUtil.isOnTableuTop(c)) {
                return c;
            }
        } while (c != null);
        return null;
    };
    CardUtil.tryToAutoclick = function (card) {
        CardUtil.returnToTableuLayer();
        CardUtil.autoclickMode = true;
        var j = 10;
        CardUtil.tabIdxCurrent = card.tableuIdx;
        while (j-- > 0) {
            CardUtil.tabIdxCurrent++;
            if (CardUtil.tabIdxCurrent >= 10) {
                CardUtil.tabIdxCurrent = 0;
            }
            CardUtil.droppedOnTableuSuccess = false;
            var arr = Card.cardArray;
            var i = arr.length;
            while (i-- > 0) {
                var c = arr[i];
                if (CardUtil.isOnTableuTop(c) && c.tableuIdx == CardUtil.tabIdxCurrent && c.suitIdx == card.suitIdx) {
                    if (c.tableuIdx != card.tableuIdx) {
                        CardUtil.droppedOnTableu(card, c);
                    }
                    if (CardUtil.droppedOnTableuSuccess) {
                        break;
                    }
                }
            }
            if (CardUtil.droppedOnTableuSuccess) {
                break;
            }
        }
        if (CardUtil.droppedOnTableuSuccess == false) {
            var j = 10;
            CardUtil.tabIdxCurrent = card.tableuIdx;
            while (j-- > 0) {
                CardUtil.tabIdxCurrent++;
                if (CardUtil.tabIdxCurrent >= 10) {
                    CardUtil.tabIdxCurrent = 0;
                }
                CardUtil.droppedOnTableuSuccess = false;
                var arr = Card.cardArray;
                var i = arr.length;
                while (i-- > 0) {
                    var c = arr[i];
                    if (CardUtil.isOnTableuTop(c) && c.tableuIdx == CardUtil.tabIdxCurrent) {
                        if (c.tableuIdx != card.tableuIdx) {
                            CardUtil.droppedOnTableu(card, c);
                        }
                        if (CardUtil.droppedOnTableuSuccess) {
                            break;
                        }
                    }
                }
                if (CardUtil.droppedOnTableuSuccess) {
                    break;
                }
            }
        }
        if (CardUtil.droppedOnTableuSuccess == false) {
            //if didn't manage to place on non empty tab, place on empty tab
            var i = BoardManager.NUM_TABLEU_COLUMNS;
            while (i-- > 0) {
                var idx = 9 - i;
                if (CardUtil.checkIfTabEmpty(idx) && idx != card.tableuIdx) {
                    CardUtil.dropOnEmptyTableu(card, idx);
                    CardUtil.droppedOnTableuSuccess = true;
                    break;
                }
            }
        }
        if (CardUtil.droppedOnTableuSuccess) {
            GameUI.initialMoveMade = true;
            GameUI.moves++;
            BoardManager.undoDisabled = false;
            SimpleGame.myGame.time.events.add(150, function () {
                GameUI.score--;
            });
            SoundManager.valid.play();
        }
        else {
            card.tweenInvalidMove();
        }
        CardUtil.autoclickMode = false;
        card.selectedFlag = false;
    };
    CardUtil.returnUnplacedTabCards = function () {
        // 
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState == Card.STATE_DRAGGED) {
                c.myState = Card.STATE_TABLEU;
                // c.setToTableu(true)
            }
        }
    };
    CardUtil.getFreeFoundationIdx = function () {
        var freeFoundPos = 0;
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState == Card.STATE_FOUNDATION) {
                if (c.foundationIdx >= freeFoundPos) {
                    freeFoundPos = c.foundationIdx + 1;
                }
            }
        }
        return freeFoundPos;
    };
    CardUtil.tryToPlaceCardsOnFoundation = function () {
        SimpleGame.myGame.time.events.add(250, function () {
            var stack = CardUtil.getCompletedStack();
            if (stack == null)
                return;
            GameUI.score++;
            //    
            var freeFoundPos = CardUtil.getFreeFoundationIdx();
            // 
            // 
            // 
            var i = stack.length;
            while (i-- > 0) {
                var c = stack[i];
                // 
                c.myState = Card.STATE_FOUNDATION;
                c.foundationIdx = freeFoundPos;
                c.foundationPosition = 11 - c.cardIdx;
                if (c.foundationPosition < 0) {
                    c.foundationPosition = 12;
                }
                //  Trace.TraceCardByIdxAndPos(c.tableuIdx, c.tableuPosition)
                //   
            }
            CardUtil.uncoverTableu(c);
            // SoundManager.clearrow.play()
            BoardManager.generateBoardSnapshot();
            BoardManager.undoDisabled = true;
            BoardManager.sort();
        });
    };
    CardUtil.getCompletedStack = function () {
        // 
        var arr = Card.cardArray;
        var i = arr.length;
        // 
        var retArr = [];
        while (i-- > 0) {
            var c = arr[i];
            // 
            if (c.cardIdx == CardUtil.CARD_IDX_K && c.turned && c.myState == Card.STATE_TABLEU) {
                // 
                var j = CardUtil.NUM_CARDS_PER_SUIT;
                retArr = [];
                retArr.push(c);
                do {
                    // 
                    var c1 = CardUtil.getByTabIdxAndPos(c.tableuIdx, c.tableuPosition + 1);
                    if (c1 == null || CardUtil.isCardIdxFollowing(c, c1, true) == false) {
                        // 
                        break;
                    }
                    // 
                    retArr.push(c1);
                    // Trace.TraceCardByIdxAndPos(c1.tableuIdx, c1.tableuPosition)
                    c = c1;
                } while (j-- > 1);
                if (retArr.length == CardUtil.NUM_CARDS_PER_SUIT) {
                    // 
                    return retArr;
                }
            }
        }
        return null;
    };
    CardUtil.isValidMoveStack = function (card) {
        var c = CardUtil.getByTabIdxAndPos(card.tableuIdx, card.tableuPosition + 1);
        if (c != null) {
            if (c.suitIdx != card.suitIdx) {
                // 
                return false;
            }
            else if (CardUtil.isCardIdxFollowing(card, c) == false) {
                // 
                return false;
            }
            else {
                return CardUtil.isValidMoveStack(c);
            }
        }
        else {
            return true;
        }
    };
    CardUtil.getPeekedPosition = function (tabidx) {
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.tableuIdx == tabidx && c.peekedFlag) {
                return c.tableuPosition;
            }
        }
        return -1;
    };
    CardUtil.isCardIdxFollowing = function (card1, card2, respectSuit) {
        if (respectSuit === void 0) { respectSuit = false; }
        if (respectSuit) {
            if (card1.suitIdx != card2.suitIdx)
                return false;
        }
        // 
        if (card2.cardIdx <= CardUtil.CARD_IDX_Q && card1.cardIdx == card2.cardIdx + 1) {
            // 
            return true;
        }
        else if (card2.cardIdx == CardUtil.CARD_IDX_A && card1.cardIdx == CardUtil.CARD_IDX_02) {
            return true;
        }
        return false;
    };
    CardUtil.getByTabIdxAndPos = function (tabIdx, tabPos) {
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState == Card.STATE_TABLEU && c.tableuIdx == tabIdx && c.tableuPosition == tabPos) {
                return c;
            }
        }
        return null;
    };
    CardUtil.getStockX = function (idx) {
        return Card.getStockXInit() + idx * Card.getStockXDelta();
    };
    CardUtil.getStockY = function (idx) {
        if (SimpleGame.myGame.scale.isGamePortrait) {
            return Card.CARD_STOCK_POSITION_Y_INIT + idx * Card.CARD_STOCK_POSITION_Y_DELTA;
        }
        else {
            return Card.LANDSCAPE_CARD_STOCK_POSITION_Y_INIT + idx * Card.LANDSCAPE_CARD_STOCK_POSITION_Y_DELTA;
        }
    };
    CardUtil.getCardWithMaxFoundationPosition = function (foundationIdx) {
        var arr = Card.cardArray;
        var i = arr.length;
        var foundationPositionMax = 0;
        var cardWithMaxFoundPos = null;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState == Card.STATE_FOUNDATION && c.foundationIdx == foundationIdx) {
                if (c.foundationPosition >= foundationPositionMax) {
                    foundationPositionMax = c.foundationPosition;
                    cardWithMaxFoundPos = c;
                }
            }
        }
        return cardWithMaxFoundPos;
    };
    CardUtil.uncoverStock = function (stockPos) {
        SoundManager.playDealRow();
        // GameUI.moves++;
        GameUI.score--;
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.stockPosition > stockPos && c.myState == Card.STATE_STOCK) {
                stockPos = c.stockPosition;
            }
        }
        var arr = Card.cardArray;
        var i = arr.length;
        var totalCardsOnStock = 0;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState == Card.STATE_STOCK)
                totalCardsOnStock++;
            if (c.myState == Card.STATE_STOCK && stockPos == c.stockPosition) {
                var myTabIdx = c.myStockIdx % 10;
                // c.cardImgFront.y = 60;
                // c.cardImgFront.x = 30;
                c.setFromStockToTabStart(myTabIdx);
            }
        }
        // 
        // Card.items.sort()
        SimpleGame.myGame.time.events.add(1000, BoardManager.generateBoardSnapshot, this);
        CardUtil.getMaxTableuPosition(0);
        BoardManager.undoDisabled = true;
        Card.disableSelect = true;
        SimpleGame.myGame.time.events.add(750, function () {
            // BoardManager.undoDisabled = false;
            Card.disableSelect = false;
            CardUtil.tryToPlaceCardsOnFoundation();
        });
    };
    CardUtil.getMaxTableuPosition = function (idx) {
        //get max tableu postition
        var arr = Card.cardArray;
        var size = -1;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            //  
            if (c.myState == Card.STATE_TABLEU && c.tableuIdx == idx && c.tableuPosition > size) {
                size = c.tableuPosition;
            }
        }
        return size;
    };
    CardUtil.checkIfDroppedOnEmptyTableu = function (card) {
        var cardimgfrontX = card.cardImgFront.x;
        CardUtil.checkIfDroppedOnEmptyTableuCoords(card);
        if (CardUtil.droppedOnTableuSuccess == false) {
            card.cardImgFront.x += 70;
            CardUtil.checkIfDroppedOnEmptyTableuCoords(card);
        }
        card.cardImgFront.x = cardimgfrontX;
    };
    CardUtil.getByTabIdxAndPosCopy = function (tabIdx, tabPos) {
        if (Card.cardArray == null)
            return null;
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myTabIdx == tabIdx && c.tableuPosition == tabPos) {
                return c;
            }
        }
        return null;
    };
    CardUtil.checkIfDroppedOnEmptyTableuCoords = function (card) {
        var img = card.cardImgFront;
        var cardTabPosXInit = Card.LANDSCAPE_CARD_TAB_POS_X_INIT;
        var cardTabPosXDelta = Card.LANDSCAPE_CARD_TAB_POS_X_DELTA;
        if (SimpleGame.myGame.scale.isGamePortrait) {
            var cardTabPosXInit = Card.PORTRAIT_CARD_TAB_POS_X_INIT;
            var cardTabPosXDelta = Card.PORTRAIT_CARD_TAB_POS_X_DELTA;
        }
        var myTableuoIdx = Math.ceil((card.cardImgFront.x - card.cardImgFront.width - cardTabPosXInit) / cardTabPosXDelta);
        if (myTableuoIdx < 0 || myTableuoIdx > 9)
            return;
        if (CardUtil.checkIfTabEmpty(myTableuoIdx)) {
            CardUtil.dropOnEmptyTableu(card, myTableuoIdx);
            CardUtil.droppedOnTableuSuccess = true;
            card.isMoving = true;
            BoardManager.sortImmediately();
        }
    };
    CardUtil.dropOnEmptyTableu = function (card, myTableuoIdx) {
        // 
        CardUtil.uncoverTableu(card);
        card.tableuIdx = myTableuoIdx;
        card.tableuPosition = 0;
        card.myState = Card.STATE_TABLEU;
        CardUtil.manageDragged(card);
    };
    CardUtil.checkIfTabEmpty = function (idx) {
        var tabEmpty = true;
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.tableuIdx == idx && c.myState == Card.STATE_TABLEU) {
                tabEmpty = false;
            }
        }
        return tabEmpty;
    };
    CardUtil.checkIfDroppedOnTableu = function (card) {
        var arr = Card.cardArray;
        if (card.newX > card.cardImgFront.x) {
            // 
            arr.sort(function (a, b) {
                if (a.tableuIdx > b.tableuIdx) {
                    return -1;
                }
                else if (a.tableuIdx < b.tableuIdx) {
                    return 1;
                }
                return 0;
            });
        }
        else {
            // 
            arr.sort(function (a, b) {
                if (a.tableuIdx > b.tableuIdx) {
                    return 1;
                }
                else if (a.tableuIdx < b.tableuIdx) {
                    return -1;
                }
                return 0;
            });
        }
        CardUtil.manageMultipleOverlaps(card);
        var multipleOverlaps = false;
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (CardUtil.overlapping(c.cardImgFront, card.cardImgFront)) {
                // 
                if (c.myState == Card.STATE_TABLEU) {
                }
            }
        }
    };
    CardUtil.manageMultipleOverlaps = function (card) {
        //  
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            // 
            if (CardUtil.overlapping(c.cardImgFront, card.cardImgFront)) {
                // 
                if (arr[i].myState == Card.STATE_TABLEU) {
                    // 
                    if (CardUtil.droppedOnTableuSuccess == false) {
                        // 
                        CardUtil.droppedOnTableu(card, c);
                    }
                }
            }
            if (CardUtil.droppedOnTableuSuccess) {
                break;
            }
        }
        card.selectedFlag = false;
    };
    CardUtil.overlapsMouse = function (card) {
        if (card.getBounds().contains(SimpleGame.myGame.input.x, SimpleGame.myGame.input.y)) {
            return true;
        }
        return false;
    };
    CardUtil.getSelectedCard = function () {
        var i = Card.cardArray.length;
        while (i-- > 0) {
            if (Card.cardArray[i].selectedFlag) {
                return Card.cardArray[i];
            }
        }
        return null;
    };
    CardUtil.droppedOnTableu = function (cardPlaced, cardTableu) {
        // Trace.TraceCardByIdxAndPos(cardTableu.tableuIdx, cardTableu.tableuPosition)
        if (CardUtil.isOnTableuTop(cardTableu)) {
            //    
            return CardUtil.tryToPlaceonTableu(cardPlaced, cardTableu);
        }
        else {
            //    
        }
    };
    CardUtil.tryToPlaceonTableu = function (cardPlaced, cardTableu) {
        if (cardTableu.cardIdx != CardUtil.CARD_IDX_A && (cardPlaced.cardIdx == CardUtil.CARD_IDX_A && cardTableu.cardIdx == CardUtil.CARD_IDX_02 || cardPlaced.cardIdx + 1 == cardTableu.cardIdx)) {
            return CardUtil.placeOnTableu(cardPlaced, cardTableu);
        }
        else {
            if (CardUtil.droppedOnTableuSuccess == false && CardUtil.autoclickMode == false) {
                CardUtil.playInvalidSound = true;
            }
        }
        return null;
    };
    CardUtil.placeOnTableu = function (cardPlaced, cardTableu) {
        CardUtil.droppedOnTableuSuccess = true;
        CardUtil.uncoverTableu(cardPlaced);
        cardPlaced.myState = Card.STATE_TABLEU;
        cardPlaced.tableuIdx = cardTableu.tableuIdx;
        cardPlaced.tableuPosition = cardTableu.tableuPosition + 1;
        cardPlaced.selectedFlag = false;
        // 
        cardPlaced.setToTableu(false);
        Card.items.add(cardPlaced.myGroup);
        // Card.items.sort();
        CardUtil.manageDragged(cardPlaced);
        BoardManager.sort();
    };
    CardUtil.manageDragged = function (cardTableu) {
        var arr = Card.cardArray;
        var i = arr.length;
        var minPos = 999;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState == Card.STATE_DRAGGED) {
                if (c.tableuPosition < minPos) {
                    minPos = c.tableuPosition;
                }
            }
        }
        // 
        i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c.myState == Card.STATE_DRAGGED) {
                if (minPos == c.tableuPosition) {
                    CardUtil.placeOnTableu(c, cardTableu);
                }
            }
        }
    };
    CardUtil.uncoverTableu = function (cardPlaced) {
        // 
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            if (arr[i].myState == Card.STATE_TABLEU) {
                if (arr[i].tableuIdx == cardPlaced.tableuIdx) {
                    //trace("same idx, " + arr[i].tableouPosition, cardPlaced.tableouPosition);
                    if (arr[i].tableuPosition + 1 == cardPlaced.tableuPosition) {
                        //trace("turned");
                        if (arr[i].flipcard(true)) {
                        }
                    }
                }
            }
        }
    };
    CardUtil.overlapping = function (rect1, rect2) {
        if (rect1 == rect2)
            return false;
        if (rect1.x < rect2.x + rect2.width + 1 && rect1.x + rect1.width + 1 > rect2.x && rect1.y < rect2.y + rect2.height + 1 && rect1.height + 1 + rect1.y > rect2.y) {
            return true;
        }
        return false;
    };
    CardUtil.getCardImgName = function (suitidx, cardidx, deckIdx) {
        if (deckIdx === void 0) { deckIdx = 0; }
        return CardUtil.deckNameArray[deckIdx] + "_" + CardUtil.cardNameArray[suitidx * CardUtil.NUM_CARDS_PER_SUIT + cardidx];
    };
    CardUtil.getCardNameURLs = function (idx) {
        CardUtil.cardNameArrayUrl = new Array();
        var i = CardUtil.cardNameArray.length;
        while (i-- > 0) {
            var str = CardUtil.cardNameArray[i];
            var strURL = "assets/CARDS/" + CardUtil.deckNameArray[idx] + "/" + str + ".png";
            CardUtil.cardNameArrayUrl[i] = strURL;
        }
        return CardUtil.cardNameArrayUrl;
    };
    CardUtil.isOnTableuTop = function (card) {
        if (card.myState != Card.STATE_TABLEU) {
            // 
            return false;
        }
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c == card)
                continue;
            if (c.myState == Card.STATE_TABLEU) {
                if (c.tableuIdx == card.tableuIdx) {
                    if (c.tableuPosition > card.tableuPosition) {
                        // 
                        return false;
                    }
                }
            }
        }
        return true;
    };
    CardUtil.canUncoverStock = function () {
        return true;
        var i = 10;
        while (i-- > 0) {
            if (CardUtil.checkIfTabEmpty(i)) {
                return false;
            }
        }
        return true;
    };
    CardUtil.checkIfSelectedCardExists = function () {
        var i = Card.cardArray.length;
        while (i-- > 0) {
            var c = Card.cardArray[i];
            if (c.selectedFlag) {
                return true;
            }
        }
        return false;
    };
    CardUtil.isMovingCardWithSmallestZ = function (card) {
        var arr = Card.cardArray;
        var i = arr.length;
        while (i-- > 0) {
            var c = arr[i];
            if (c != card && c.isMoving) {
                // 
                // Trace.TraceCardByIdxAndPos(c.tableuIdx, c.tableuPosition)
                if (c.tableuPosition < card.tableuPosition) {
                    return false;
                }
            }
        }
        return true;
    };
    CardUtil.cardNameArray = ["2_spade", "3_spade", "4_spade", "5_spade", "6_spade", "7_spade", "8_spade", "9_spade", "10_spade", "j_spade", "q_spade", "k_spade", "a_spade", "2_heart", "3_heart", "4_heart", "5_heart", "6_heart", "7_heart", "8_heart", "9_heart", "10_heart", "j_heart", "q_heart", "k_heart", "a_heart", "2_diamond", "3_diamond", "4_diamond", "5_diamond", "6_diamond", "7_diamond", "8_diamond", "9_diamond", "10_diamond", "j_diamond", "q_diamond", "k_diamond", "a_diamond", "2_club", "3_club", "4_club", "5_club", "6_club", "7_club", "8_club", "9_club", "10_club", "j_club", "q_club", "k_club", "a_club"];
    // static cardNameArray:Array<string> = ["2_club", "3_club", "4_club", "5_club", "6_club", "7_club", "8_club", "9_club", "10_club", "j_club", "q_club", "k_club", "a_club", "2_diamond", "3_diamond", "4_diamond", "5_diamond", "6_diamond", "7_diamond", "8_diamond", "9_diamond", "10_diamond", "j_diamond", "q_diamond", "k_diamond", "a_diamond","2_heart", "3_heart", "4_heart", "5_heart", "6_heart", "7_heart", "8_heart", "9_heart", "10_heart", "j_heart", "q_heart", "k_heart", "a_heart","2_spade", "3_spade", "4_spade", "5_spade", "6_spade", "7_spade", "8_spade", "9_spade", "10_spade", "j_spade", "q_spade", "k_spade", "a_spade"]
    CardUtil.deckNameArray = ["deck_1", "deck_2", "deck_3"];
    CardUtil.backNameArray = ["card_back_12", "card_back_13", "card_back_15", "card_back_18", "card_back_19", "card_back_20", "card_back_23", "card_back_24"];
    CardUtil.NUM_CARDS_PER_SUIT = 13;
    CardUtil.NUM_SUITS = 8;
    CardUtil.NUM_SUIT_COLORS = 1;
    CardUtil.CARD_IDX_02 = 0;
    CardUtil.CARD_IDX_03 = 1;
    CardUtil.CARD_IDX_04 = 2;
    CardUtil.CARD_IDX_05 = 3;
    CardUtil.CARD_IDX_06 = 4;
    CardUtil.CARD_IDX_07 = 5;
    CardUtil.CARD_IDX_08 = 6;
    CardUtil.CARD_IDX_09 = 7;
    CardUtil.CARD_IDX_10 = 8;
    CardUtil.CARD_IDX_J = 9;
    CardUtil.CARD_IDX_Q = 10;
    CardUtil.CARD_IDX_K = 11;
    CardUtil.CARD_IDX_A = 12;
    CardUtil.tabIdxCurrent = -1;
    CardUtil.autoclickMode = false;
    CardUtil.playInvalidSound = false;
    return CardUtil;
}());
var EndGame = /** @class */ (function () {
    function EndGame(c) {
        this.maxVx = 6;
        this.aY = 1;
        this.vx = 0;
        this.vy = -2;
        this.letFallFlag = false;
        this.c = c;
        c.endgameTweenFlag = true;
        // this.myloop1 = SimpleGame.myGame.time.events.loop(10, this.update, this)
        // this.myloop2 = SimpleGame.myGame.time.events.loop(10, this.stickImage, this)
        this.vx = (Math.random() - 0.75) * this.maxVx;
        if (this.vx < 0) {
            this.vx -= this.maxVx * 0.5;
        }
        else {
            this.vx += this.maxVx * 0.5;
        }
        // Card.items.add( c.myGroup );
        var tweenTimer = 300;
        SimpleGame.myGame.add.tween(c.cardImgFront).to({ x: CardUtil.getStockX(0), y: CardUtil.getStockY(0) }, tweenTimer, Phaser.Easing.Linear.None, true, 0);
        SimpleGame.myGame.add.tween(c.cardImgFront).to({ rotation: Math.PI * 2 }, tweenTimer * 0.8, Phaser.Easing.Linear.None, true, 0);
        SimpleGame.myGame.add.tween(c.cardImgBack).to({ x: CardUtil.getStockX(0), y: CardUtil.getStockY(0) }, tweenTimer, Phaser.Easing.Linear.None, true, 0);
        SimpleGame.myGame.time.events.add(tweenTimer, function () {
            c.cardImgFront.visible = false;
            c.cardImgBack.visible = true;
        }, this);
        SimpleGame.myGame.time.events.add(10, function () {
            EndGame.startNextCard();
        });
    }
    EndGame.prototype.update = function () {
        // this.vy += this.aY;
        // this.c.cardImgFront.x += this.vx;
        // this.c.cardImgFront.y += this.vy;
        // if (this.c.cardImgFront.y + this.c.cardImgFront.height/2 > ResizeManager.deviceHeight/ResizeManager.cardScaleFinal)
        // {
        //     if (this.letFallFlag == false)
        //     {
        //         this.vy*=-0.55;
        //         this.c.cardImgFront.y += this.vy;
        //     }
        // }
        // var myWidth:number = this.c.cardImgFront.width*ResizeManager.cardScaleFinal/2;
        // if (this.c.cardImgFront.x < 0.2*ResizeManager.GAME_WIDTH_EXACT || this.c.cardImgFront.x > 0.85*ResizeManager.GAME_WIDTH_EXACT)
        // {
        //     this.letFallFlag = true;
        // }
        // if (this.letFallFlag && this.c.cardImgFront.y + this.c.cardImgFront.height/2 > ResizeManager.deviceHeight/ResizeManager.cardScaleFinal + 500)
        // {
        //     this.stop()
        // }
    };
    EndGame.prototype.stop = function (startNextCard) {
        if (startNextCard === void 0) { startNextCard = true; }
        SimpleGame.myGame.time.events.remove(this.myloop1);
        SimpleGame.myGame.time.events.remove(this.myloop2);
        if (startNextCard) {
            EndGame.startNextCard();
        }
    };
    EndGame.start = function () {
        EndGame.inProgress = true;
        this.currentFoundIdx = 0;
        this.currentFoundPos = 0;
        this.startNextCard();
        this.allImages = [];
    };
    EndGame.startNextCard = function () {
        var c = CardUtil.getCardWithMaxFoundationPosition(this.currentFoundIdx++ % 8);
        if (c == null) {
            EndGame.inProgress = false;
            this.stopEndGameAnim();
            var gameover = new GameOverPrompt(0, 0, 0);
            return;
        }
        c.myState = -1;
        // Card.movedcards.add(c.myGroup)
        var endgame = new EndGame(c);
        if (EndGame.endgameHolder == null) {
            EndGame.endgameHolder = [];
        }
        EndGame.endgameHolder.push(endgame);
    };
    EndGame.stopEndGameAnim = function () {
        var i = EndGame.endgameHolder.length;
        while (i-- > 0) {
            EndGame.endgameHolder[i].stop(false);
        }
        i = EndGame.allImages.length;
        while (EndGame.allImages.length > 0) {
            EndGame.allImages.shift().destroy();
        }
    };
    EndGame.currentFoundIdx = 0;
    EndGame.currentFoundPos = 0;
    EndGame.inProgress = false;
    return EndGame;
}());
var HintCopy = /** @class */ (function () {
    function HintCopy() {
    }
    HintCopy.initStock = function (cardPlaced, x, y) {
        var hintCopyGroup = SimpleGame.myGame.add.group();
        hintCopyGroup.scale.set(Card.items.scale.x, Card.items.scale.y);
        hintCopyGroup.x = Card.items.x;
        hintCopyGroup.y = Card.items.y;
        var spr1 = SimpleGame.myGame.add.sprite(cardPlaced.cardImgHighlight.x, cardPlaced.cardImgHighlight.y, 'card_highlight', '', hintCopyGroup);
        spr1.anchor.set(cardPlaced.cardImgHighlight.anchor.x, cardPlaced.cardImgHighlight.anchor.y);
        spr1.scale.set(cardPlaced.cardImgHighlight.scale.x, cardPlaced.cardImgHighlight.scale.y);
        HintCopy.holderArr.push(spr1);
        SimpleGame.myGame.time.events.add(1200, function () {
            spr1.destroy();
        }, this);
    };
    HintCopy.init = function (cardPlaced, x, y) {
        if (HintCopy.holderArr == null) {
            HintCopy.holderArr = [];
        }
        var hintCopyGroup = SimpleGame.myGame.add.group();
        hintCopyGroup.scale.set(Card.items.scale.x, Card.items.scale.y);
        hintCopyGroup.x = Card.items.x;
        hintCopyGroup.y = Card.items.y;
        var spr = SimpleGame.myGame.add.sprite(cardPlaced.cardImgFront.x, cardPlaced.cardImgFront.y, cardPlaced.cardImgFront.generateTexture(), '', hintCopyGroup);
        spr.anchor.set(cardPlaced.cardImgFront.anchor.x, cardPlaced.cardImgFront.anchor.y);
        spr.scale.set(cardPlaced.cardImgFront.scale.x, cardPlaced.cardImgFront.scale.y);
        var spr1 = SimpleGame.myGame.add.sprite(cardPlaced.cardImgHighlight.x, cardPlaced.cardImgHighlight.y, 'card_highlight', '', hintCopyGroup);
        spr1.anchor.set(cardPlaced.cardImgHighlight.anchor.x, cardPlaced.cardImgHighlight.anchor.y);
        spr1.scale.set(cardPlaced.cardImgHighlight.scale.x, cardPlaced.cardImgHighlight.scale.y);
        HintCopy.holderArr.push(spr);
        HintCopy.holderArr.push(spr1);
        spr1.visible = true;
        SimpleGame.myGame.add.tween(spr).to({ x: x, y: y }, 800, Phaser.Easing.Linear.None, true, 0, 0, false);
        SimpleGame.myGame.time.events.add(1200, function () {
            spr.destroy();
        }, this);
        SimpleGame.myGame.add.tween(spr1).to({ x: x, y: y }, 800, Phaser.Easing.Linear.None, true, 0, 0, false);
        SimpleGame.myGame.time.events.add(1200, function () {
            spr1.destroy();
        }, this);
        var cNext = CardUtil.getByTabIdxAndPos(cardPlaced.tableuIdx, cardPlaced.tableuPosition + 1);
        if (cNext != null) {
            var deltaY = cNext.cardImgFront.y - cardPlaced.cardImgFront.y;
            HintCopy.init(cNext, x, y + deltaY);
        }
        SimpleGame.myGame.time.events.add(100, function () {
            SimpleGame.myGame.input.onDown.addOnce(HintCopy.hideAll, this);
        }, this);
    };
    HintCopy.hideAll = function () {
        if (this.holderArr == null)
            return;
        var i = this.holderArr.length;
        while (i-- > 0) {
            this.holderArr[i].visible = false;
        }
    };
    return HintCopy;
}());
var AreYouSurePrompt = /** @class */ (function () {
    function AreYouSurePrompt(type) {
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(-2048, -2048, 4096, 4096);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.7;
        this.blackbg.inputEnabled = true;
        GameUI.promptLayer.add(this.blackbg);
        this.menuBG = SimpleGame.myGame.add.sprite(0, 0, 'prompt_difficulty');
        this.menuBG.x = 0;
        this.menuBG.y = -0.1 * ResizeManager.deviceHeight;
        GameUI.promptLayer.add(this.menuBG);
        this.menuBG.anchor.set(0.5, 0.5);
        var yesText = SimpleGame.myGame.make.text(0, 0, "" + Language.YES[Language.langIdx].toUpperCase(), {
            font: "22px Arimo", fill: "#ffffff", fontWeight: "700"
        });
        var noText = SimpleGame.myGame.make.text(0, 0, "" + Language.NO[Language.langIdx].toUpperCase(), {
            font: "22px Arimo", fill: "#ffffff", fontWeight: "700"
        });
        var areyousurfull = Language.ARE_YOU_SURE_NEW[Language.langIdx];
        var fullText = SimpleGame.myGame.make.text(0, 0, "" + areyousurfull, {
            font: "22px Arimo", fill: "#694014", fontWeight: "700", align: "Center"
        });
        fullText.y = this.menuBG.y - 70;
        fullText.wordWrap = true;
        fullText.wordWrapWidth = 450;
        fullText.x = 0;
        fullText.anchor.set(0.5, 0.5);
        GameUI.promptLayer.add(fullText);
        if (type == AreYouSurePrompt.TYPE_NEW_GAME) {
            var yesBut = new ButtonWithOverAndText(yesText, GameUI.promptLayer, "button_prompt", "button_prompt_over", 0, 0, function () {
                GameUI.promptLayer.removeAll(true);
                BoardManager.removeAllCards();
                //  BoardManager.InitializeBoard()
                // BoardManager.
                BoardManager.increaseGameCount();
                var newgame = new NewGamePrompt();
            });
        }
        else if (type == AreYouSurePrompt.TYPE_CLEAR_STATS) {
            var yesBut = new ButtonWithOverAndText(yesText, GameUI.promptLayer, "button_prompt", "button_prompt_over", 0, 0, function () {
                //window.localStorage.clear()
                Util.clearStoragePerDifficulty();
                GameUI.promptLayer.removeAll(true);
                var stats = new StatisticsPrompt(true);
            });
            fullText.text = Language.are_you_sure_clear_stats[Language.langIdx] + " for " + CardUtil.NUM_SUIT_COLORS + " suit game?";
        }
        else {
            var yesBut = new ButtonWithOverAndText(yesText, GameUI.promptLayer, "button_prompt", "button_prompt_over", 0, 0, function () {
                GameUI.promptLayer.removeAll(true);
                BoardManager.increaseGameCount();
                BoardManager.resetBoard();
            });
            fullText.text = Language.ARE_YOU_SURE_RESTART[Language.langIdx];
        }
        //        var  areyousurestr = Language.ARE_YOU_SURE_SHORT[Language.langIdx]
        //         this.menuText = SimpleGame.myGame.make.text(0,0,""+areyousurestr, {
        //             font:"28px Open Sans", fill: "#ffffff", fontWeight:"700", align:"Center" 
        //         });
        //         this.menuText.y = this.menuBG.y + 10;
        //         GameUI.promptLayer.add(this.menuText)
        //         this.menuText.wordWrap = true;
        //         this.menuText.wordWrapWidth = 350;
        //         this.menuText.x = this.menuBG.x + (this.menuBG.width)*0.5 - this.menuText.width*0.5
        //         fullText.y = this.menuBG.y + 110;
        //         fullText.wordWrap = true;
        //         fullText.wordWrapWidth = 440;
        //         fullText.anchor.set(0.5,0)
        //         fullText.x = this.menuBG.x + (this.menuBG.width)*0.5; 
        //         GameUI.promptLayer.add(fullText)        
        //         var yesText = SimpleGame.myGame.make.text(0,0, Language.YES[Language.langIdx],{
        //             font:"20px Open Sans", fill:"#ffffff", fontWeight:"700"
        //         } )
        //     // yesBut.setXY(this.menuBG.x + (this.menuBG.width - yesBut.imgNormal.width)*0.21, this.menuBG.y + 290)
        //     var keepPlayText = SimpleGame.myGame.make.text(0,0, ""+Language.NO[Language.langIdx].toUpperCase(),{
        //         font:"20px Open Sans", fill:"#ffffff", fontWeight:"700"
        //     } )
        var keepPlayBut = new ButtonWithOverAndText(noText, GameUI.promptLayer, "button_prompt", "button_prompt_over", 0, 0, function () {
            GameUI.promptLayer.removeAll(true);
        });
        keepPlayBut.setXY(this.menuBG.x * 0.5 - keepPlayBut.imgNormal.width * 0.5 - 130, this.menuBG.y + 75);
        yesBut.setXY(this.menuBG.x * 0.5 - yesBut.imgNormal.width * 0.5 + 131, this.menuBG.y + 75);
        fullText.text = fullText.text.toUpperCase();
    }
    AreYouSurePrompt.TYPE_NEW_GAME = 0;
    AreYouSurePrompt.TYPE_RESTART_GAME = 1;
    AreYouSurePrompt.TYPE_CLEAR_STATS = 2;
    return AreYouSurePrompt;
}());
var GameOverPrompt = /** @class */ (function () {
    function GameOverPrompt(timePlayed, movesMade, yourScore) {
        if (timePlayed === void 0) { timePlayed = 0; }
        if (movesMade === void 0) { movesMade = 0; }
        if (yourScore === void 0) { yourScore = 0; }
        GameOverPrompt.onScreen = true;
        GameOverPrompt.congratsArray = ["Congratulations!"];
        GameUI.promptHolder.removeAll();
        GameOverPrompt.onScreen = true;
        this.initblackbg = SimpleGame.myGame.add.group(GameUI.promptLayer);
        this.initgamebg = SimpleGame.myGame.add.group(GameUI.promptHolder);
        this.initmenugroup = SimpleGame.myGame.add.group(GameUI.promptLayer);
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(-SimpleGame.myGame.width / 2, -SimpleGame.myGame.height / 2, SimpleGame.myGame.width, SimpleGame.myGame.height);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.7;
        this.blackbg.inputEnabled = true;
        this.initblackbg.add(this.blackbg);
        var newgame1txt = SimpleGame.myGame.make.text(0, 0, "New Game", {
            font: "28px Overpass", fill: "#ffffff", fontWeight: "700"
        });
        var congrats = SimpleGame.myGame.make.text(0, -100, "CONGRATULATIONS!", {
            font: "64px Overpass", fill: "#ffffff", fontWeight: "700"
        });
        this.initmenugroup.add(congrats);
        congrats.anchor.set(0.5, 0.5);
        // var key1 = SimpleGame.myGame.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        // key1.onDown.addOnce(function () {
        //     this.newgame1Clicked()
        // }, this)
        var newgame1Button = new ButtonWithOverAndText(newgame1txt, this.initmenugroup, 'toggle_grey01', 'toggle_grey01', 0, 190 - 7, this.newgame1Clicked.bind(this));
        newgame1Button.textYDelta = -2;
        newgame1Button.x = -newgame1Button.imgNormal.width / 2;
        // var resetgameButton:ButtonWithOverAndText = new ButtonWithOverAndText(resetgametxt, this.initmenugroup, 'button_red', 'button_red',  265, 445, this.resetGameclicked.bind(this))
    }
    GameOverPrompt.prototype.newgame1Clicked = function () {
        // EndGame.stopEndGameAnim()
        this.removeAndContinueGame();
        SimpleGame.myGame.tweens.removeAll();
        // BoardManager.removeAllCardsFromBoard()
        BoardManager.startNewGame();
    };
    GameOverPrompt.prototype.resetGameclicked = function () {
        this.removeAndContinueGame();
        SimpleGame.myGame.tweens.removeAll();
        // BoardManager.RestartBoard()
        GameUI.resetUI();
        GameOverPrompt.onScreen = false;
    };
    GameOverPrompt.prototype.removeAndContinueGame = function () {
        GameOverPrompt.onScreen = false;
        this.initmenugroup.destroy();
        this.initblackbg.destroy();
    };
    GameOverPrompt.onScreen = false;
    GameOverPrompt.deltaMissed = 0;
    GameOverPrompt.oldStarIdx = -1;
    GameOverPrompt.onScren = false;
    return GameOverPrompt;
}());
var GameWonPrompt2 = /** @class */ (function () {
    function GameWonPrompt2(gameWon) {
        if (gameWon === void 0) { gameWon = true; }
        var cumulativeScore = Util.getStoragePerDifficulty("cumulativeScore", 0);
        cumulativeScore += GameUI.scoreTotal;
        Util.setStoragePerDifficulty("cumulativeScore", cumulativeScore);
        Util.setStoragePerDifficulty("cumulativeTime", (Util.getStoragePerDifficulty("cumulativeTime", 0) + GameUI.time));
        Util.setStoragePerDifficulty("cumulativeMoves", (Util.getStoragePerDifficulty("cumulativeMoves", 0) + GameUI.moves));
        var gameswon = Util.getStoragePerDifficulty("gamesWon");
        if (gameWon) {
            SoundManager.won.play();
            gameswon++;
            Util.setStoragePerDifficulty("gamesWon", gameswon);
        }
        else {
            // SoundManager.lost.play();
        }
        var curBestScore = Util.getStoragePerDifficulty("bestScore", 0);
        if (curBestScore < GameUI.scoreTotal) {
            curBestScore = GameUI.scoreTotal;
            Util.setStoragePerDifficulty("bestScore", curBestScore);
        }
        var bestTime = Util.getStoragePerDifficulty("bestTime", 999999999999999999);
        if (bestTime == 0)
            bestTime = 99999999999999999;
        if (bestTime > GameUI.time) {
            bestTime = GameUI.time;
            Util.setStoragePerDifficulty("bestTime", bestTime);
        }
        var leastMoves = Util.getStoragePerDifficulty("leastMoves", 999999999999999);
        if (leastMoves == 0)
            leastMoves = 9999999999999;
        if (leastMoves > GameUI.moves) {
            leastMoves = GameUI.moves;
            Util.setStoragePerDifficulty("leastMoves", leastMoves);
        }
        else {
        }
        GameUI.gameStarted = false;
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(-2048, -2048, 4096, 4096);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.7;
        this.blackbg.inputEnabled = true;
        GameUI.promptLayer.add(this.blackbg);
        this.menuBG = SimpleGame.myGame.add.sprite(0, 0, 'won_bg');
        this.menuBG.x = 0;
        this.menuBG.y = -0.1 * ResizeManager.deviceHeight;
        GameUI.promptLayer.add(this.menuBG);
        this.menuBG.anchor.set(0.5, 0.5);
        this.mainText = SimpleGame.myGame.make.text(0, 0, "" + Language.YOUWONGAME[Language.langIdx], {
            font: "26px Arimo", fill: "#694014", fontWeight: "700", align: "Center"
        });
        this.mainText.y = this.menuBG.y - 151;
        this.mainText.wordWrap = true;
        this.mainText.wordWrapWidth = 650;
        this.mainText.x = 0;
        this.mainText.anchor.set(0.5, 0.5);
        GameUI.promptLayer.add(this.mainText);
        this.timescoreTxt = SimpleGame.myGame.make.text(0, 0, "", {
            font: "20px Arimo", fill: "#694014", fontWeight: "700", align: "Left"
        });
        this.timescoreTxt.y = this.menuBG.y - 20;
        this.timescoreTxt.wordWrap = true;
        this.timescoreTxt.wordWrapWidth = 650;
        this.timescoreTxt.x = 60 - this.menuBG.width * 0.5 + 20;
        this.timescoreTxt.anchor.set(0, 0.5);
        GameUI.promptLayer.add(this.timescoreTxt);
        this.timescoreTxt.text = "" + Language.yourscore[Language.langIdx] + "\n" + Language.minutes_played[Language.langIdx] + "\n" + Language.themovesyoumade[Language.langIdx] + "\n\n" + Language.best_score[Language.langIdx] + "\n" + Language.best_time[Language.langIdx] + "\n" + Language.least_moves[Language.langIdx];
        this.timescoreTxtRight = SimpleGame.myGame.make.text(0, 0, "", {
            font: "20px Arimo", fill: "#694014", fontWeight: "700", align: "Right"
        });
        this.timescoreTxtRight.y = this.menuBG.y - 20;
        this.timescoreTxtRight.wordWrap = true;
        this.timescoreTxtRight.wordWrapWidth = 650;
        this.timescoreTxtRight.x = this.menuBG.width * 0.5 - 80;
        this.timescoreTxtRight.anchor.set(1, 0.5);
        GameUI.promptLayer.add(this.timescoreTxtRight);
        // 
        this.timescoreTxtRight.text = "" + GameUI.scoreTotal + "\n" + Util.convertToHHMMSS(GameUI.time) + "\n" + GameUI.moves + "\n\n" + curBestScore + "\n" + Util.convertToHHMMSS(bestTime) + "\n" + leastMoves;
        GameUI.initialMoveMade = false;
        var newGameText = SimpleGame.myGame.make.text(0, 0, Language.NEW_GAME[Language.langIdx].toUpperCase(), {
            font: "22px Arimo", fill: "#ffffff", fontWeight: "700"
        });
        var newGameBut = new ButtonWithOverAndText(newGameText, GameUI.promptLayer, "button_prompt", "button_prompt_over", 0, 0, function () {
            GameUI.promptLayer.removeAll(true);
            GameUI.promptLayer.removeAll(true);
            // CardUtil.NUM_SUIT_COLORS = 1;
            GameUI.initialMoveMade = false;
            //    BoardManager.increaseGameCount();
            // BoardManager.InitializeBoard();
            var newgameprompt = new NewGamePrompt();
        });
        var restartText = SimpleGame.myGame.make.text(0, 0, "" + Language.RESTART[Language.langIdx].toUpperCase(), {
            font: "22px Arimo", fill: "#ffffff", fontWeight: "700"
        });
        var restartBut = new ButtonWithOverAndText(restartText, GameUI.promptLayer, "button_prompt", "button_prompt_over", 0, 0, function () {
            GameUI.promptLayer.removeAll(true);
            GameUI.initialMoveMade = false;
            BoardManager.resetBoard();
        });
        BoardManager.increaseGameCount();
        restartBut.setXY(this.menuBG.x * 0.5 - restartBut.imgNormal.width * 0.5 - 130, this.menuBG.y + 111);
        newGameBut.setXY(this.menuBG.x * 0.5 - restartBut.imgNormal.width * 0.5 + 131, this.menuBG.y + 111);
    }
    return GameWonPrompt2;
}());
var InitMenuPrompt = /** @class */ (function () {
    function InitMenuPrompt(firstGame) {
        if (firstGame === void 0) { firstGame = true; }
        var initmenugroup = SimpleGame.myGame.add.group();
        if (firstGame) {
            SimpleGame.myGame.input.reset();
        }
        // this.gamebg = SimpleGame.myGame.add.sprite(0,0,'game_bg') 
        // initmenugroup.add(this.gamebg)      
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, 880, 700);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.7;
        this.blackbg.inputEnabled = true;
        SimpleGame.myGame.time.events.add(250, function () {
            this.blackbg.events.onInputUp.add(function () {
                SimpleGame.myGame.input.mspointer.capture = false;
                if (GameUI.promptLayer != null) {
                    GameUI.promptLayer.removeAll(true);
                }
                // SimpleGame.myGame.time.events.remove(timerEvent)     
            });
        }, this);
        initmenugroup.add(this.blackbg);
        this.menuBG = SimpleGame.myGame.add.sprite(0, 0, 'prompt_bg_levels_empty_slots');
        this.menuBG.x = (SimpleGame.myGame.width - this.menuBG.width) * 0.5;
        this.menuBG.y = 120;
        initmenugroup.add(this.menuBG);
        // this.menuBG.visible = false
        var leveltxt = SimpleGame.myGame.make.text(0, 0, "" + Language.NEW_GAME[Language.langIdx].toUpperCase(), {
            font: "24px Open Sans", fill: "#6993d1", fontWeight: "800"
        });
        initmenugroup.add(leveltxt);
        leveltxt.anchor.set(0.5);
        leveltxt.x = 440;
        leveltxt.y = 144;
        var selleveltxt = SimpleGame.myGame.make.text(0, 0, "", {
            font: "21px Open Sans", fill: "#263b5b", fontWeight: "600"
        });
        initmenugroup.add(selleveltxt);
        selleveltxt.anchor.set(0.5);
        selleveltxt.x = 440;
        selleveltxt.y = 200;
        var easyText = SimpleGame.myGame.make.text(0, 0, "" + Language.EASY[Language.langIdx], {
            font: "20px Open Sans", fill: "#ffffff", fontWeight: "700"
        });
        var easyButton = new ButtonWithOverAndText(easyText, initmenugroup, 'prompt_button', 'prompt_button_over', 0, 500, function () {
            // SimpleGame.gameEngineStarted = false;
            GameUI.gameStarted = false;
            CardUtil.NUM_SUIT_COLORS = 1;
            initmenugroup.removeAll(true);
            SimpleGame.startGame(firstGame);
            InitMenuPrompt.startFullScreen = true;
            SimpleGame.myGame.time.events.add(350, function () {
                InitMenuPrompt.startFullScreen = false;
            }, this);
            // BoardManager.InitializeBoard()
        });
        easyButton.setXY(440 - easyButton.imgNormal.width * 0.5, 230 - 3);
        var normalText = SimpleGame.myGame.make.text(0, 0, "" + Language.NORMAL[Language.langIdx], {
            font: "20px Open Sans", fill: "#ffffff", fontWeight: "700"
        });
        var normalButton = new ButtonWithOverAndText(normalText, initmenugroup, 'prompt_button', 'prompt_button_over', 0, 500, function () {
            // SimpleGame.gameEngineStarted = false;
            GameUI.gameStarted = false;
            CardUtil.NUM_SUIT_COLORS = 2;
            initmenugroup.removeAll(true);
            SimpleGame.startGame(false);
            InitMenuPrompt.startFullScreen = true;
            SimpleGame.myGame.time.events.add(350, function () {
                InitMenuPrompt.startFullScreen = false;
            }, this);
        });
        normalButton.setXY(440 - normalButton.imgNormal.width * 0.5, 305 - 3 + 1);
        var hardText = SimpleGame.myGame.make.text(0, 0, "" + Language.HARD[Language.langIdx], {
            font: "20px Open Sans", fill: "#ffffff", fontWeight: "700"
        });
        var hardButton = new ButtonWithOverAndText(hardText, initmenugroup, 'prompt_button', 'prompt_button_over', 0, 500, function () {
            // SimpleGame.gameEngineStarted = false;
            GameUI.gameStarted = false;
            CardUtil.NUM_SUIT_COLORS = 4;
            initmenugroup.removeAll(true);
            SimpleGame.startGame(firstGame);
            InitMenuPrompt.startFullScreen = true;
            SimpleGame.myGame.time.events.add(350, function () {
                InitMenuPrompt.startFullScreen = false;
            }, this);
        });
        hardButton.setXY(440 - hardButton.imgNormal.width * 0.5, 380 - 3 + 2);
        // this.gamebg.
        // easyButton.y += 300;
        // normalButton.y += 300;
        // hardButton.y += 300;
        // normalButton.y -= 8;
        // hardButton.y -= 16;
        // easyButton.imgNormal.alpha = 0;
        // normalButton.imgNormal.alpha = 0;
        //    easyButton.update()
        //    normalButton.update()
        //    hardButton.update()
        //    var tweenE = SimpleGame.myGame.add.tween(easyButton).to(
        //     { y:easyButton.y-300 }, 300, Phaser.Easing.Circular.Out, true, 500 );
        //  var tweenN = SimpleGame.myGame.add.tween(normalButton).to(
        //     { y:normalButton.y-300 }, 300, Phaser.Easing.Circular.Out, true, 500 );
        // var tweenH = SimpleGame.myGame.add.tween(hardButton).to(
        //     { y:hardButton.y-300 }, 300, Phaser.Easing.Circular.Out, true, 500 );
        //     tweenE.onComplete.add(this.onTweenComplete, this)
        SimpleGame.myGame.renderer.renderSession.roundPixels = true;
    }
    ;
    InitMenuPrompt.prototype.onTweenComplete = function () {
    };
    return InitMenuPrompt;
}());
var InitMenuPrompt2 = /** @class */ (function () {
    function InitMenuPrompt2(firstGame) {
        if (firstGame === void 0) { firstGame = true; }
        var initmenugroup = SimpleGame.myGame.add.group();
        SimpleGame.myGame.input.reset();
        this.menuBG = SimpleGame.myGame.make.sprite(0, 0, 'menu_bg');
        this.menuBG.x = this.menuBG.y = 0;
        initmenugroup.add(this.menuBG);
        this.menuText = SimpleGame.myGame.make.text(0, 0, Language.HOW_TO_PLAY_FULL[Language.langIdx], {
            font: "23px Open Sans", fill: "#e3e8f6", fontWeight: "400"
        });
        this.menuText.y = this.menuBG.y + 270;
        this.menuText.wordWrap = true;
        this.menuText.wordWrapWidth = 450;
        this.menuText.align = "CENTER";
        initmenugroup.add(this.menuText);
        this.menuText.x = this.menuBG.x + (this.menuBG.width - this.menuText.width) * 0.5;
        this.menuText.x = Math.round(this.menuText.x);
        this.menuText.y = Math.round(this.menuText.y);
        this.menuText.smoothed = true;
        if (this.menuText.text.length % 2 == 1) {
            this.menuText.text += " ";
        }
        var microsoft;
        microsoft = SimpleGame.myGame.make.graphics(0, 0);
        microsoft.beginFill(0xffffff);
        microsoft.drawRect(SimpleGame.myGame.width * 0.5 - 190, SimpleGame.myGame.height - 40, 330, 40);
        // GameUI.microsoft.x = SimpleGame.myGame.width * 0.5 - GameUI.microsoft.width;
        microsoft.endFill();
        microsoft.inputEnabled = true;
        microsoft.events.onInputDown.add(onmicrosoftDown, this);
        microsoft.events.onInputUp.add(onmicrosoftUp);
        microsoft.alpha = 0.01;
        initmenugroup.add(microsoft);
        microsoft.input.useHandCursor = true;
        window.addEventListener("click", onWindowClicked);
        var easyText = SimpleGame.myGame.make.text(0, 0, "" + Language.EASY[Language.langIdx], {
            font: "19px Open Sans", fill: "#ffffff", fontWeight: "500"
        });
        var easyButton = new ButtonWithOverAndText(easyText, initmenugroup, 'menu1', 'menu1_over', 0, 500, function () {
            CardUtil.NUM_SUIT_COLORS = 1;
            initmenugroup.removeAll(true);
            SimpleGame.startGame(firstGame);
            GameUI.gameTime = Consts.GAMETIME_EASY;
            // GameUI.gameTime = 15;
            InitMenuPrompt.startFullScreen = true;
            SimpleGame.myGame.time.events.add(350, function () {
                InitMenuPrompt.startFullScreen = false;
            }, this);
        });
        easyButton.setXY(240 - easyButton.imgNormal.width * 0.5, 370);
        easyButton.textYDelta += 31;
        var normalText = SimpleGame.myGame.make.text(0, 0, "" + Language.NORMAL[Language.langIdx], {
            font: "19px Open Sans", fill: "#ffffff", fontWeight: "500"
        });
        var normalButton = new ButtonWithOverAndText(normalText, initmenugroup, 'menu2', 'menu2_over', 0, 500, function () {
            CardUtil.NUM_SUIT_COLORS = 2;
            initmenugroup.removeAll(true);
            SimpleGame.startGame(firstGame);
            GameUI.gameTime = Consts.GAMETIME_MEDIUM;
            InitMenuPrompt.startFullScreen = true;
            SimpleGame.myGame.time.events.add(350, function () {
                InitMenuPrompt.startFullScreen = false;
            }, this);
        });
        normalButton.setXY(440 - normalButton.imgNormal.width * 0.5, 370);
        normalButton.textYDelta += 31;
        var hardText = SimpleGame.myGame.make.text(0, 0, "" + Language.HARD[Language.langIdx], {
            font: "19px Open Sans", fill: "#ffffff", fontWeight: "500"
        });
        var hardButton = new ButtonWithOverAndText(hardText, initmenugroup, 'menu3', 'menu3_over', 0, 500, function () {
            CardUtil.NUM_SUIT_COLORS = 4;
            initmenugroup.removeAll(true);
            SimpleGame.startGame(firstGame);
            GameUI.gameTime = Consts.GAMETIME_HARD;
            InitMenuPrompt.startFullScreen = true;
            SimpleGame.myGame.time.events.add(350, function () {
                InitMenuPrompt.startFullScreen = false;
            }, this);
        });
        hardButton.setXY(640 - hardButton.imgNormal.width * 0.5, 370);
        hardButton.textYDelta += 31;
        // var spiderLogo:Phaser.Sprite = SimpleGame.myGame.add.sprite(440, 150, 'logo_spider')
        // spiderLogo.anchor.set(0.5)
        // initmenugroup.add(spiderLogo)
        // spiderLogo.x = 440;
        // var solitaireLogo:Phaser.Sprite = SimpleGame.myGame.add.sprite(440, 250, 'logo_solitaire')
        // solitaireLogo.anchor.set(0.5)
        // initmenugroup.add(solitaireLogo)
        // solitaireLogo.x = 440;
        // spiderLogo.y -= 600;
        // solitaireLogo.y -= 600;
        // easyButton.y += 300;
        // normalButton.y += 300;
        // hardButton.y += 300;
        // normalButton.y -= 8;
        // hardButton.y -= 16;
        // easyButton.imgNormal.alpha = 0;
        // normalButton.imgNormal.alpha = 0;
        // var tween1 = SimpleGame.myGame.add.tween(spiderLogo).to(
        //    { y:spiderLogo.y+600 }, 300, Phaser.Easing.Circular.Out, true );
        // var tween2 = SimpleGame.myGame.add.tween(solitaireLogo).to(
        //    { y:solitaireLogo.y+600 },300, Phaser.Easing.Circular.Out, true );
        //    easyButton.update()
        //    normalButton.update()
        //    hardButton.update()
        //    var tweenE = SimpleGame.myGame.add.tween(easyButton).to(
        //     { y:easyButton.y-300 }, 300, Phaser.Easing.Circular.Out, true, 500 );
        //  var tweenN = SimpleGame.myGame.add.tween(normalButton).to(
        //     { y:normalButton.y-300 }, 300, Phaser.Easing.Circular.Out, true, 500 );
        // var tweenH = SimpleGame.myGame.add.tween(hardButton).to(
        //     { y:hardButton.y-300 }, 300, Phaser.Easing.Circular.Out, true, 500 );
        //     tweenE.onComplete.add(this.onTweenComplete, this)
        SimpleGame.myGame.renderer.renderSession.roundPixels = true;
    }
    ;
    InitMenuPrompt2.prototype.onTweenComplete = function () {
    };
    return InitMenuPrompt2;
}());
var MainMenu = /** @class */ (function () {
    function MainMenu(firstGame) {
        if (firstGame === void 0) { firstGame = true; }
        MainMenu.onscreen = true;
        MainMenu.myref = this;
        this.initgamebg = SimpleGame.myGame.add.group();
        this.initblackbg = SimpleGame.myGame.add.group();
        this.initmenugroup = SimpleGame.myGame.add.group();
        if (firstGame) {
            SimpleGame.myGame.input.reset();
        }
        // this.gamebg = SimpleGame.myGame.add.sprite(0,0,'game_bg') 
        // this.initgamebg.add(this.gamebg)         
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, 880, 600);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.67;
        this.blackbg.inputEnabled = true;
        SimpleGame.myGame.time.events.add(250, function () {
            this.blackbg.events.onInputUp.add(function () {
                //  SimpleGame.myGame.input.mspointer.capture = false;	
                MainMenu.myref.removeAndContinueGame();
                // SimpleGame.myGame.time.events.remove(timerEvent)     
            });
        }, this);
        this.initblackbg.add(this.blackbg);
        this.menuBG = SimpleGame.myGame.add.sprite(215, 75, 'prompt_bg_menu');
        this.menuBG.anchor.set(0, 0);
        this.initmenugroup.add(this.menuBG);
        this.menuBGover = SimpleGame.myGame.add.sprite(SimpleGame.myGame.width / 2, SimpleGame.myGame.height / 2, 'prompt_bg_menu_mouseover');
        this.menuBGover.anchor.set(0, 0);
        this.initmenugroup.add(this.menuBGover);
        this.menuBGover.visible = false;
        this.menuBGover.x = this.menuBG.x;
        this.menuBGover.y = this.menuBG.y;
        this.menuBG.inputEnabled = true;
        this.titleTxt = SimpleGame.myGame.make.text(0, 0, Language.menu[Language.langIdx], {
            font: "30px Overpass", fill: "#ffffff", fontWeight: "600"
        });
        this.titleTxt.wordWrap = true;
        this.titleTxt.wordWrapWidth = 450;
        this.titleTxt.align = "CENTER";
        this.initmenugroup.add(this.titleTxt);
        this.titleTxt.x = SimpleGame.myGame.width / 2 - this.titleTxt.width / 2;
        this.titleTxt.y = 100;
        this.titleTxt.x = Math.round(this.titleTxt.x);
        this.titleTxt.y = Math.round(this.titleTxt.y);
        var resumeTxt = SimpleGame.myGame.make.text(0, 0, Language.resume[Language.langIdx], {
            font: "25px Overpass", fill: "#000000", fontWeight: "600"
        });
        var newgame1txt = SimpleGame.myGame.make.text(0, 0, Language.newgame1[Language.langIdx], {
            font: "25px Overpass", fill: "#000000", fontWeight: "600"
        });
        var newgame3txt = SimpleGame.myGame.make.text(0, 0, Language.newgame3[Language.langIdx], {
            font: "25px Overpass", fill: "#000000", fontWeight: "600"
        });
        var resetgametxt = SimpleGame.myGame.make.text(0, 0, Language.resetthisgame[Language.langIdx], {
            font: "25px Overpass", fill: "#000000", fontWeight: "600"
        });
        var stattxt = SimpleGame.myGame.make.text(0, 0, Language.statistics[Language.langIdx], {
            font: "25px Overpass", fill: "#000000", fontWeight: "600"
        });
        var moregamestxt = SimpleGame.myGame.make.text(0, 0, Language.more_games[Language.langIdx], {
            font: "25px Overpass", fill: "#000000", fontWeight: "600"
        });
        var butYDelta = 53;
        var butYInit = 97;
        this.mask1 = SimpleGame.myGame.add.graphics(0, 0);
        this.mask1.beginFill(0x000000);
        this.mask1.drawRect(220, butYInit + butYDelta * 1 - 1, 400, 53);
        this.mask1.endFill();
        this.mask1.alpha = 0.00001;
        this.mask2 = SimpleGame.myGame.add.graphics(0, 0);
        this.mask2.beginFill(0x000000);
        this.mask2.drawRect(220, butYInit + butYDelta * 2 - 1, 400, 53);
        this.mask2.endFill();
        this.mask2.alpha = 0.00001;
        this.mask3 = SimpleGame.myGame.add.graphics(0, 0);
        this.mask3.beginFill(0x000000);
        this.mask3.drawRect(220, butYInit + butYDelta * 3 - 1, 400, 53);
        this.mask3.endFill();
        this.mask3.alpha = 0.00001;
        this.mask4 = SimpleGame.myGame.add.graphics(0, 0);
        this.mask4.beginFill(0x000000);
        this.mask4.drawRect(220, butYInit + butYDelta * 4 - 1, 400, 53);
        this.mask4.endFill();
        this.mask4.alpha = 0.00001;
        this.mask5 = SimpleGame.myGame.add.graphics(0, 0);
        this.mask5.beginFill(0x000000);
        this.mask5.drawRect(220, butYInit + butYDelta * 5 - 1, 400, 53);
        this.mask5.endFill();
        this.mask5.alpha = 0.00001;
        this.mask6 = SimpleGame.myGame.add.graphics(0, 0);
        this.mask6.beginFill(0x000000);
        this.mask6.drawRect(220, butYInit + butYDelta * 6 - 1, 400, 53);
        this.mask6.endFill();
        this.mask6.alpha = 0.00001;
        this.mask7 = SimpleGame.myGame.add.graphics(0, 0);
        this.mask7.beginFill(0x000000);
        this.mask7.drawRect(220, butYInit + butYDelta * 7 - 1, 400, 53);
        this.mask7.endFill();
        this.mask7.alpha = 0.00001;
        this.menuBGover.mask = this.mask2;
        var resumeButton = new ButtonWithOverAndText(resumeTxt, this.initmenugroup, 'prompt_menu_button', 'prompt_menu_button', 230, butYInit + butYDelta * 1, this.removeAndContinueGame.bind(this));
        var newgame1Button = new ButtonWithOverAndText(newgame1txt, this.initmenugroup, 'prompt_menu_button', 'prompt_menu_button', 230, butYInit + butYDelta * 2, this.newgame1Clicked.bind(this));
        var newgame3Button = new ButtonWithOverAndText(newgame3txt, this.initmenugroup, 'prompt_menu_button', 'prompt_menu_button', 230, butYInit + butYDelta * 3, this.newgame3Clicked.bind(this));
        var resetgameButton = new ButtonWithOverAndText(resetgametxt, this.initmenugroup, 'prompt_menu_button', 'prompt_menu_button', 230, butYInit + butYDelta * 4, this.resetGameclicked.bind(this));
        var soundButton = new SoundButton(this.initmenugroup, 'prompt_menu_button', 'prompt_menu_button', 230, butYInit + butYDelta * 5);
        var statsButton = new ButtonWithOverAndText(stattxt, this.initmenugroup, 'prompt_menu_button', 'prompt_menu_button', 230, butYInit + butYDelta * 6, this.statsClicked.bind(this));
        var moregamesButton = new ButtonWithOverAndText(moregamestxt, this.initmenugroup, 'prompt_menu_button', 'prompt_menu_button', 230, butYInit + butYDelta * 7, this.moregamesClicked.bind(this));
        this.fixButton(resumeButton);
        this.fixButton(newgame1Button);
        this.fixButton(newgame3Button);
        this.fixButton(resetgameButton);
        this.fixButton(soundButton.soundOffBut);
        this.fixButton(soundButton.soundOnBut);
        this.fixButton(statsButton);
        this.fixButton(moregamesButton);
        resumeButton.onButtonOverExtra = this.resumeButOverExtra.bind(this);
        resumeButton.onButtonOutExtra = function () {
            this.menuBGover.visible = false;
        }.bind(this);
        newgame1Button.onButtonOverExtra = function () {
            this.menuBGover.mask = this.mask2;
            this.menuBGover.visible = true;
        }.bind(this);
        newgame1Button.onButtonOutExtra = function () {
            this.menuBGover.visible = false;
        }.bind(this);
        newgame3Button.onButtonOverExtra = function () {
            this.menuBGover.mask = this.mask3;
            this.menuBGover.visible = true;
        }.bind(this);
        newgame3Button.onButtonOutExtra = function () {
            this.menuBGover.visible = false;
        }.bind(this);
        resetgameButton.onButtonOverExtra = function () {
            this.menuBGover.mask = this.mask4;
            this.menuBGover.visible = true;
        }.bind(this);
        resetgameButton.onButtonOutExtra = function () {
            this.menuBGover.visible = false;
        }.bind(this);
        soundButton.soundOnBut.onButtonOverExtra = function () {
            this.menuBGover.mask = this.mask5;
            this.menuBGover.visible = true;
        }.bind(this);
        soundButton.soundOnBut.onButtonOutExtra = function () {
            this.menuBGover.visible = false;
        }.bind(this);
        soundButton.soundOffBut.onButtonOverExtra = function () {
            this.menuBGover.mask = this.mask5;
            this.menuBGover.visible = true;
        }.bind(this);
        soundButton.soundOffBut.onButtonOutExtra = function () {
            this.menuBGover.visible = false;
        }.bind(this);
        statsButton.onButtonOverExtra = function () {
            this.menuBGover.mask = this.mask6;
            this.menuBGover.visible = true;
        }.bind(this);
        statsButton.onButtonOutExtra = function () {
            this.menuBGover.visible = false;
        }.bind(this);
        moregamesButton.onButtonOverExtra = function () {
            this.menuBGover.mask = this.mask7;
            this.menuBGover.visible = true;
        }.bind(this);
        moregamesButton.onButtonOutExtra = function () {
            this.menuBGover.visible = false;
        }.bind(this);
        Card.removeAllHints();
    }
    MainMenu.prototype.resumeButOverExtra = function () {
        this.menuBGover.mask = this.mask1;
        this.menuBGover.visible = true;
    };
    MainMenu.prototype.fixButton = function (b) {
        b.skipAlphaChanges = true;
        b.imgNormal.alpha = 0.00001;
        b.imgOver.alpha = 0.00001;
    };
    MainMenu.prototype.statsClicked = function () {
        this.removeAndContinueGame();
        var stats = new StatisticsPrompt();
    };
    MainMenu.prototype.moregamesClicked = function () {
    };
    MainMenu.prototype.resetGameclicked = function () {
        this.removeAndContinueGame();
        // GameContext.drawCardNum = 3;
        BoardManager.RestartBoard();
        GameUI.resetUI();
    };
    MainMenu.prototype.newgame1Clicked = function () {
        this.removeAndContinueGame();
        GameContext.drawCardNum = 1;
        Card.removeAllHints();
        BoardManager.removeAllCardsFromBoard();
        BoardManager.InitializeBoard(true);
    };
    MainMenu.prototype.newgame3Clicked = function () {
        this.removeAndContinueGame();
        GameContext.drawCardNum = 3;
        Card.removeAllHints();
        BoardManager.removeAllCardsFromBoard();
        BoardManager.InitializeBoard(true);
    };
    MainMenu.prototype.removeAndContinueGame = function () {
        MainMenu.onscreen = false;
        this.initmenugroup.destroy();
        this.initblackbg.destroy();
        this.initgamebg.destroy();
    };
    MainMenu.onscreen = false;
    return MainMenu;
}());
var MenuPrompt = /** @class */ (function () {
    function MenuPrompt() {
        MenuPrompt.onScreen = true;
        this.myBgBlackGroup = SimpleGame.myGame.add.group();
        this.myGroup = SimpleGame.myGame.add.group();
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, SimpleGame.myGame.width, SimpleGame.myGame.height);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.4;
        this.blackbg.inputEnabled = true;
        this.myBgBlackGroup.add(this.blackbg);
        GameContext.gameplayStopped();
        this.myIconBgZero = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBgZero.beginFill(0x000000);
        this.myIconBgZero.drawRect(-10 * SettingsPrompt.WIDTH_FIXED / 2, -10 * SettingsPrompt.HEIGHT_FIXED / 2, 20 * SettingsPrompt.WIDTH_FIXED, 20 * SettingsPrompt.HEIGHT_FIXED);
        this.myIconBgZero.endFill();
        this.myIconBgZero.alpha = 0.1;
        this.myIconBgZero.inputEnabled = true;
        this.myIconBgZero.events.onInputDown.add(this.closeScreen, this);
        this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBg.beginFill(0x000000);
        this.myIconBg.drawRoundedRect(-SettingsPrompt.WIDTH_FIXED / 2, -SettingsPrompt.HEIGHT_FIXED / 2, SettingsPrompt.WIDTH_FIXED, SettingsPrompt.HEIGHT_FIXED, 40);
        this.myIconBg.endFill();
        this.myIconBg.alpha = 1;
        var scale = Math.min(0.9 * SettingsPrompt.WIDTH_FIXED / ResizeManager.deviceWidth, 0.9 * SettingsPrompt.HEIGHT_FIXED / ResizeManager.deviceHeight);
        var scale = Math.min(0.8 * ResizeManager.deviceWidth / SettingsPrompt.WIDTH_FIXED, 0.8 * ResizeManager.deviceHeight / SettingsPrompt.HEIGHT_FIXED);
        this.myGroup.scale.set(scale, scale);
        this.myGroup.x = ResizeManager.deviceWidth / 2;
        this.myGroup.y = ResizeManager.deviceHeight * 0.45;
        var delta = 90;
        var initY = 130;
        var buttonNewGame;
        if (Language.FRENCH)
            buttonNewGame = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY, "Nouveau Jeu", this.newGameClicked.bind(this));
        else
            buttonNewGame = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY, "New Game", this.newGameClicked.bind(this));
        var buttonReplay;
        if (Language.FRENCH)
            buttonReplay = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + delta, "Rejouez", this.replayClicked.bind(this));
        else
            buttonReplay = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + delta, "Replay", this.replayClicked.bind(this));
        var buttonStandard;
        if (Language.FRENCH)
            buttonStandard = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 2 * delta, "Standard", this.standardClicked.bind(this));
        else
            buttonStandard = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 2 * delta, "Standard", this.standardClicked.bind(this));
        var buttonVegas;
        if (Language.FRENCH)
            buttonVegas = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 3 * delta, "Vegas", this.vegasClicked.bind(this));
        else
            buttonVegas = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 3 * delta, "Vegas", this.vegasClicked.bind(this));
        var buttonVegasCumulative;
        if (Language.FRENCH)
            buttonVegasCumulative = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 4 * delta, "Vegas Cumulative", this.vegasCumulativeClicked.bind(this));
        else
            buttonVegasCumulative = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 5 * delta, "Vegas Cumulative", this.themesClicked.bind(this));
        var buttonThemes;
        if (Language.FRENCH)
            buttonThemes = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 5 * delta, "Thème", this.themesClicked.bind(this));
        else
            buttonThemes = new ButtonMenuPrompt(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 5 * delta, "Themes", this.themesClicked.bind(this));
        this.closeButton = SimpleGame.myGame.add.graphics(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, this.myGroup);
        this.closeButton.beginFill(0x333333);
        this.closeButton.drawCircle(0, 0, 50);
        this.closeButton.endFill();
        this.closeButton.alpha = 1;
        this.xTxt = SimpleGame.myGame.add.text(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, "X", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.xTxt.anchor.set(0.5, 0.5);
        this.closeButton.inputEnabled = true;
        this.closeButton.events.onInputDown.add(this.closeScreen, this);
        this.closeButton.input.useHandCursor = true;
        SimpleGame.myGame.scale.onSizeChange.add(this.recreate, this);
        SimpleGame.myGame.scale.onOrientationChange.add(this.recreate, this);
    }
    MenuPrompt.prototype.recreate = function (arg0, recreate, arg2) {
        this.remove();
        SimpleGame.myGame.time.events.add(500, function () {
            if (MenuPrompt.onScreen == false) {
                var utomPrialPrompt = new MenuPrompt();
            }
        });
    };
    MenuPrompt.prototype.closeScreen = function () {
        SoundManager.playClick();
        this.remove();
        GameContext.gameplayStarted();
    };
    MenuPrompt.prototype.themesClicked = function () {
        SoundManager.playClick();
        // BoardManager.startNewGame(GameContext.GAME_MODE_VEGAS_CUMUL)
        this.remove();
        var themes = new ThemePrompt();
    };
    MenuPrompt.prototype.vegasCumulativeClicked = function () {
        SoundManager.playClick();
        BoardManager.startNewGame(GameContext.GAME_MODE_VEGAS_CUMUL);
    };
    MenuPrompt.prototype.vegasClicked = function () {
        SoundManager.playClick();
        BoardManager.startNewGame(GameContext.GAME_MODE_VEGAS);
    };
    MenuPrompt.prototype.standardClicked = function () {
        SoundManager.playClick();
        BoardManager.startNewGame(GameContext.GAME_MODE_STANDARD);
    };
    MenuPrompt.prototype.onesuitclicked = function () {
        CardUtil.NUM_SUIT_COLORS = 1;
        BoardManager.startNewGame();
        this.remove();
    };
    MenuPrompt.prototype.twosuitsclicked = function () {
        CardUtil.NUM_SUIT_COLORS = 2;
        BoardManager.startNewGame();
        this.remove();
    };
    MenuPrompt.prototype.foursuitsclicked = function () {
        CardUtil.NUM_SUIT_COLORS = 4;
        BoardManager.startNewGame();
        this.remove();
    };
    MenuPrompt.prototype.replayClicked = function () {
        SoundManager.playClick();
        BoardManager.resetBoard();
        this.remove();
    };
    MenuPrompt.prototype.newGameClicked = function () {
        SoundManager.playClick();
        BoardManager.startNewGame();
        this.remove();
    };
    MenuPrompt.prototype.remove = function () {
        this.myGroup.destroy();
        this.myBgBlackGroup.destroy();
        MenuPrompt.onScreen = false;
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
    };
    MenuPrompt.onScreen = false;
    return MenuPrompt;
}());
var NewGamePrompt = /** @class */ (function () {
    function NewGamePrompt(showXBut) {
        if (showXBut === void 0) { showXBut = false; }
        GameUI.promptHolder.removeAll();
        SimpleGame.myGame.renderer.renderSession.roundPixels = true;
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(-2048, -2048, 4096, 4096);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.7;
        this.blackbg.inputEnabled = true;
        GameUI.promptLayer.add(this.blackbg);
        this.menuBG = SimpleGame.myGame.add.sprite(0, 0, 'prompt_difficulty');
        this.menuBG.x = 0;
        this.menuBG.y = -0.1 * ResizeManager.deviceHeight;
        this.menuBG.anchor.set(0.5, 0.5);
        GameUI.promptHolder.add(this.menuBG);
        var spidersol = Language.difficulty[Language.langIdx];
        this.menuText = SimpleGame.myGame.make.text(0, 0, "" + spidersol, {
            font: "22px Arimo", fill: "#694014", fontWeight: "700", align: "Center"
        });
        this.menuText.y =
            GameUI.promptHolder.add(this.menuText);
        this.menuText.wordWrap = true;
        this.menuText.wordWrapWidth = 380;
        this.menuText.x = 0;
        this.menuText.anchor.set(0.5, 0.5);
        this.menuText.y = -120 + this.menuBG.y;
        this.menuText = SimpleGame.myGame.make.text(0, 0, Language.difficulty[Language.langIdx], {
            font: "14px Arial", fill: "#000000", fontWeight: "400"
        });
        this.menuText.x = this.menuBG.x + (this.menuBG.width - this.menuText.width) * 0.5;
        this.menuText.y = this.menuBG.y + 380;
        // GameUI.promptLayer.add(this.menuText)
        // if (showXBut)
        // {
        //     var removeButton:ButtonWithOverState = new ButtonWithOverState(GameUI.promptLayer, "prompt_close", "prompt_close_over", 576, 219, function()
        //     {
        //         GameUI.promptLayer.removeAll(true)
        //     })
        // }
        GameUI.promptLayer.add(GameUI.promptHolder);
        this.addButtons(GameUI.promptHolder);
        GameUI.promptHolder.scale.set(0.8);
        var tweenE = SimpleGame.myGame.add.tween(GameUI.promptHolder.scale).to({ x: 1, y: 1 }, 200, Phaser.Easing.Quadratic.Out, true, 0);
        SimpleGame.myGame.time.events.add(200, function () {
            this.addButtons(GameUI.promptLayer);
        }, this);
    }
    NewGamePrompt.prototype.addButtons = function (parent) {
        var easyText = SimpleGame.myGame.make.text(0, 0, Language.NEW_GAME[Language.langIdx].toUpperCase() + " (" + Language.EASY[Language.langIdx].toUpperCase() + ")", {
            font: "22px Arimo", fill: "#ffffff", fontWeight: "700"
        });
        var easyBut = new ButtonWithOverAndText(easyText, parent, "button_newgame", "button_newgame_over", this.menuBG.x + (this.menuBG.width - 80) * 0.5, this.menuBG.y + 313, function () {
            GameUI.promptLayer.removeAll(true);
            GameUI.promptHolder.removeAll(true);
            CardUtil.NUM_SUIT_COLORS = 1;
            BoardManager.InitializeBoard();
            // SoundManager.context = new AudioContext();
        });
        // easyBut.setXY(this.menuBG.x + (this.menuBG.width - easyBut.imgNormal.width)*0.5, this.menuBG.y + 60)
        var normalText = SimpleGame.myGame.make.text(0, 0, Language.NEW_GAME[Language.langIdx].toUpperCase() + " (" + Language.NORMAL[Language.langIdx].toUpperCase() + ")", {
            font: "22px Arimo", fill: "#ffffff", fontWeight: "700"
        });
        var normalBut = new ButtonWithOverAndText(normalText, parent, "button_newgame", "button_newgame_over", this.menuBG.x + (this.menuBG.width - 80) * 0.5, this.menuBG.y + 303, function () {
            GameUI.promptLayer.removeAll(true);
            GameUI.promptHolder.removeAll(true);
            CardUtil.NUM_SUIT_COLORS = 2;
            BoardManager.InitializeBoard();
        });
        // normalBut.setXY(this.menuBG.x + (this.menuBG.width - normalBut.imgNormal.width)*0.5, this.menuBG.y + 130)
        var hardText = SimpleGame.myGame.make.text(0, 0, Language.NEW_GAME[Language.langIdx].toUpperCase() + " (" + Language.HARD[Language.langIdx].toUpperCase() + ")", {
            font: "22px Arimo", fill: "#ffffff", fontWeight: "700"
        });
        var hardBut = new ButtonWithOverAndText(hardText, parent, "button_newgame", "button_newgame_over", this.menuBG.x + (this.menuBG.width - 80) * 0.5, this.menuBG.y + 303, function () {
            GameUI.promptLayer.removeAll(true);
            GameUI.promptHolder.removeAll(true);
            CardUtil.NUM_SUIT_COLORS = 4;
            BoardManager.InitializeBoard();
        });
        // hardBut.setXY(this.menuBG.x + (this.menuBG.width - hardBut.imgNormal.width)*0.5, this.menuBG.y + 200)
        easyBut.setXY(-easyBut.imgNormal.width / 2, -180 + 90 + this.menuBG.y);
        normalBut.setXY(-easyBut.imgNormal.width / 2, -100 + 90 + this.menuBG.y);
        hardBut.setXY(-easyBut.imgNormal.width / 2, -20 + 90 + this.menuBG.y);
    };
    return NewGamePrompt;
}());
var NewGamePrompt2 = /** @class */ (function () {
    function NewGamePrompt2() {
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, 880, 600);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.001;
        this.blackbg.inputEnabled = true;
        GameUI.promptLayer.add(this.blackbg);
        this.menuBG = SimpleGame.myGame.add.sprite(0, 0, 'prompt_rest');
        this.menuBG.x = (SimpleGame.myGame.width - this.menuBG.width) * 0.5;
        this.menuBG.y = 0;
        GameUI.promptHolder.add(this.menuBG);
        this.mainText = SimpleGame.myGame.make.text(0, 0, "" + Language.NEW_GAME[Language.langIdx], {
            font: "16px Arial", fill: "#ffffff", fontWeight: "600", align: "Center"
        });
        this.mainText.y = this.menuBG.y + 220;
        GameUI.promptLayer.add(this.mainText);
        this.mainText.wordWrap = true;
        this.mainText.wordWrapWidth = 650;
        this.mainText.x = 290;
        // this.mainText.visible = false;
        var wongameTxt = Language.YOUWONGAME[Language.langIdx];
        // if (gameWon == false)
        // {
        //     wongameTxt = Language.youlostgame[Language.langIdx];
        // }
        this.menuText = SimpleGame.myGame.make.text(0, 0, "" + Language.ARE_YOU_SURE_NEW[Language.langIdx], {
            font: "15px Open Sans", fill: "#000000", fontWeight: "500", align: "Center"
        });
        this.menuText.y = this.menuBG.y + 270;
        GameUI.promptHolder.add(this.menuText);
        this.menuText.wordWrap = true;
        this.menuText.wordWrapWidth = 250;
        this.menuText.x = this.menuBG.x + (this.menuBG.width) * 0.5 - this.menuText.width * 0.5;
        this.addButtons(GameUI.promptHolder);
        GameUI.promptHolder.scale.set(0.8);
        var tweenE = SimpleGame.myGame.add.tween(GameUI.promptHolder.scale).to({ x: 1, y: 1 }, 600, Phaser.Easing.Elastic.Out, true, 0);
        tweenE.onComplete.add(function () {
            // this.addButtons(GameUI.promptLayer)
        }, this);
    }
    NewGamePrompt2.prototype.addButtons = function (parent) {
        var newGameText = SimpleGame.myGame.make.text(0, 0, Language.YES[Language.langIdx], {
            font: "15px Arial", fill: "#000000", fontWeight: "500"
        });
        var newGameBut = new ButtonWithOverAndText(newGameText, parent, "prompt_button", "prompt_button_over", 0, 0, function () {
            GameUI.promptLayer.removeAll(true);
            GameUI.promptLayer.removeAll(true);
            // CardUtil.NUM_SUIT_COLORS = 1;
            BoardManager.InitializeBoard();
        });
        newGameBut.setXY(this.menuBG.x + (this.menuBG.width - newGameBut.imgNormal.width) * 0.50 - 50, this.menuBG.y + 340);
        var restartText = SimpleGame.myGame.make.text(0, 0, "" + Language.NO[Language.langIdx], {
            font: "15px Arial", fill: "#000000", fontWeight: "500"
        });
        var restartBut = new ButtonWithOverAndText(restartText, parent, "prompt_button", "prompt_button_over", 0, 0, function () {
            GameUI.promptLayer.removeAll(true);
            // BoardManager.resetBoard()
        });
        restartBut.setXY(this.menuBG.x + (this.menuBG.width - restartBut.imgNormal.width) * 0.5 + 50, this.menuBG.y + 340);
        var removeButton = new ButtonWithOverState(GameUI.promptLayer, "prompt_close", "prompt_close_over", 576, 219, function () {
            GameUI.promptLayer.removeAll(true);
        });
    };
    return NewGamePrompt2;
}());
var NotEnoughHints = /** @class */ (function () {
    function NotEnoughHints() {
        var _this = this;
        SettingsPrompt.onScreen = true;
        this.myBgBlackGroup = SimpleGame.myGame.add.group();
        this.myGroup = SimpleGame.myGame.add.group();
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, SimpleGame.myGame.width, SimpleGame.myGame.height);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.4;
        this.blackbg.inputEnabled = true;
        this.myBgBlackGroup.add(this.blackbg);
        this.myIconBgZero = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBgZero.beginFill(0x000000);
        this.myIconBgZero.drawRect(-10 * SettingsPrompt.WIDTH_FIXED / 2, -10 * SettingsPrompt.HEIGHT_FIXED / 2, 20 * SettingsPrompt.WIDTH_FIXED, 20 * SettingsPrompt.HEIGHT_FIXED);
        this.myIconBgZero.endFill();
        this.myIconBgZero.alpha = 0.1;
        this.myIconBgZero.inputEnabled = true;
        this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBg.beginFill(0x000000);
        this.myIconBg.drawRoundedRect(-SettingsPrompt.WIDTH_FIXED / 2, -SettingsPrompt.HEIGHT_FIXED / 2 + 50, SettingsPrompt.WIDTH_FIXED, SettingsPrompt.HEIGHT_FIXED - 240, 40);
        this.myIconBg.endFill();
        this.myIconBg.alpha = 1;
        var scale = Math.min(0.9 * SettingsPrompt.WIDTH_FIXED / ResizeManager.deviceWidth, 0.9 * SettingsPrompt.HEIGHT_FIXED / ResizeManager.deviceHeight);
        var scale = Math.min(0.95 * ResizeManager.deviceWidth / SettingsPrompt.WIDTH_FIXED, 0.95 * ResizeManager.deviceHeight / SettingsPrompt.HEIGHT_FIXED);
        this.myGroup.scale.set(scale, scale);
        this.myGroup.x = ResizeManager.deviceWidth / 2;
        this.myGroup.y = ResizeManager.deviceHeight / 2;
        var scoringMode = SimpleGame.myGame.add.text(0, -SettingsPrompt.HEIGHT_FIXED / 4, "Not enough hints left. \n\nWatch a short ad to get more hints?", { font: "30px Overpass", fill: "#ffffff", fontWeight: "600", align: "Center" }, this.myGroup);
        scoringMode.anchor.set(0.5, 0.5);
        var butW = 180;
        var butH = 50;
        this.nextButton = SimpleGame.myGame.add.graphics(0, WatchAdPrompt.HEIGHT_FIXED / 2 - 182, this.myGroup);
        this.nextButton.beginFill(0x333333);
        this.nextButton.drawRoundedRect(-butW * 0.5, -butH * 0.5, butW, butH, 5);
        this.nextButton.endFill();
        this.nextButton.alpha = 1;
        if (Language.FRENCH)
            this.nextTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 360, "Oui", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        else
            this.nextTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 360, "Yes", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.nextTxt.anchor.set(0.5, 0.5);
        this.nextButton.inputEnabled = true;
        this.nextButton.events.onInputUp.add(this.yesClicked, this);
        this.nextButton.events.onInputDown.add(function () {
            GameContext.gameplayStopped();
            console.log("magic wand called");
            // SoundManager.music.stop()
            PokiSDK.rewardedBreak().then(function (success) {
                console.log("rewarded break finished");
                if (success) {
                    GameContext.gameplayStarted();
                    console.log("do magic wand");
                    // SoundManager.music.loopFull()
                    SimpleGame.myGame.time.events.add(10, function () {
                        GameContext.hintsLeft = 5;
                        GameContext.saveGameContext();
                    }, _this);
                }
                else {
                    console.log("video not displayed");
                    // SoundManager.music.loopFull()
                    // video not displayed, should probably not give reward
                }
            });
            _this.remove();
        });
        this.nextButton.input.useHandCursor = true;
        this.nextButton.visible = false;
        this.nextTxt.visible = false;
        var butW = 180;
        var butH = 50;
        this.noButton = SimpleGame.myGame.add.graphics(0, WatchAdPrompt.HEIGHT_FIXED / 2 - 92, this.myGroup);
        this.noButton.beginFill(0x333333);
        this.noButton.drawRoundedRect(-butW * 0.5, -butH * 0.5, butW, butH, 5);
        this.noButton.endFill();
        this.noButton.alpha = 1;
        this.noTxt = SimpleGame.myGame.add.text(0, WatchAdPrompt.HEIGHT_FIXED / 2 - 90, "No", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.noTxt.anchor.set(0.5, 0.5);
        this.noButton.inputEnabled = true;
        this.noButton.events.onInputDown.add(this.noClicked, this);
        this.noButton.input.useHandCursor = true;
        this.noButton.visible = false;
        this.noTxt.visible = false;
        SimpleGame.myGame.time.events.add(500, function () {
            this.nextButton.visible = true;
            this.nextTxt.visible = true;
            this.noButton.visible = true;
            this.noTxt.visible = true;
        }, this);
        SimpleGame.myGame.scale.onSizeChange.add(this.recreate, this);
        SimpleGame.myGame.scale.onOrientationChange.add(this.recreate, this);
        var delta = 75;
        var initY = 240;
        GameContext.gameplayStopped();
    }
    NotEnoughHints.prototype.yesClicked = function (yesClicked, arg1) {
        return;
    };
    NotEnoughHints.prototype.noClicked = function (noClicked, arg1) {
        SoundManager.playClick();
        this.remove();
        GameContext.gameplayStarted();
    };
    NotEnoughHints.prototype.recreate = function (arg0, recreate, arg2) {
        this.remove();
        SimpleGame.myGame.time.events.add(500, function () {
            if (SettingsPrompt.onScreen == false) {
                var utorialPrompt = new SettingsPrompt();
            }
        });
    };
    NotEnoughHints.prototype.setFlags = function () {
        // if (this.draw3Switch.onFlag)
        // {
        //     GameContext.drawCardNum = 3;
        // }
        // else
        // {
        //     GameContext.drawCardNum = 1;
        // }
        BoardManager.isRightHandedGame = !this.lefthandSwitch.onFlag;
        // GameContext.showTopTUI = this.scoremovesSwitch.onFlag;
        GameContext.autoHintsFlag = this.autohintsSwitch.onFlag;
        SoundButton.soundFlag = this.sound3Switch.onFlag;
        SoundManager.setMuteFlags(!SoundButton.soundFlag);
        GameContext.saveGameContext();
    };
    NotEnoughHints.prototype.closeScreen = function () {
        SettingsPrompt.onScreen = false;
        if (SettingsPrompt.NUM_SUIT_COLORS_INIT != CardUtil.NUM_SUIT_COLORS) {
            // GameContext.gameMode = ButtonScoringMode.myIdx;
            BoardManager.startNewGame();
        }
        SoundManager.playClick();
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
        this.myBgBlackGroup.destroy();
        this.myGroup.destroy();
        GameContext.gameplayStarted();
    };
    NotEnoughHints.prototype.remove = function () {
        SettingsPrompt.onScreen = false;
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
        this.myBgBlackGroup.destroy();
        this.myGroup.destroy();
        // GameContext.gameplayStarted();
    };
    NotEnoughHints.init = function () {
    };
    NotEnoughHints.onScreen = false;
    NotEnoughHints.WIDTH_FIXED = 540;
    NotEnoughHints.HEIGHT_FIXED = 720;
    return NotEnoughHints;
}());
var RestartGamePrompt = /** @class */ (function () {
    function RestartGamePrompt() {
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, 880, 600);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.001;
        this.blackbg.inputEnabled = true;
        GameUI.promptLayer.add(this.blackbg);
        this.menuBG = SimpleGame.myGame.add.sprite(0, 0, 'prompt_rest');
        this.menuBG.x = (SimpleGame.myGame.width - this.menuBG.width) * 0.5;
        this.menuBG.y = 0;
        GameUI.promptLayer.add(this.menuBG);
        this.mainText = SimpleGame.myGame.make.text(0, 0, "" + Language.restart_this_game[Language.langIdx], {
            font: "16px Arial", fill: "#ffffff", fontWeight: "600", align: "Left"
        });
        this.mainText.y = this.menuBG.y + 220;
        GameUI.promptLayer.add(this.mainText);
        this.mainText.wordWrap = true;
        this.mainText.wordWrapWidth = 650;
        this.mainText.x = 290;
        // this.mainText.visible = false;
        var wongameTxt = Language.YOUWONGAME[Language.langIdx];
        // if (gameWon == false)
        // {
        //     wongameTxt = Language.youlostgame[Language.langIdx];
        // }
        this.menuText = SimpleGame.myGame.make.text(0, 0, "" + Language.ARE_YOU_SURE_RESTART[Language.langIdx], {
            font: "15px Open Sans", fill: "#000000", fontWeight: "500", align: "Center"
        });
        this.menuText.y = this.menuBG.y + 270;
        GameUI.promptLayer.add(this.menuText);
        this.menuText.wordWrap = true;
        this.menuText.wordWrapWidth = 250;
        this.menuText.x = this.menuBG.x + (this.menuBG.width) * 0.5 - this.menuText.width * 0.5;
        var newGameText = SimpleGame.myGame.make.text(0, 0, Language.YES[Language.langIdx], {
            font: "15px Arial", fill: "#000000", fontWeight: "500"
        });
        var newGameBut = new ButtonWithOverAndText(newGameText, GameUI.promptLayer, "prompt_button", "prompt_button_over", 0, 0, function () {
            GameUI.promptLayer.removeAll(true);
            GameUI.promptLayer.removeAll(true);
            // CardUtil.NUM_SUIT_COLORS = 1;
            BoardManager.resetBoard();
        });
        newGameBut.setXY(this.menuBG.x + (this.menuBG.width - newGameBut.imgNormal.width) * 0.50 - 50, this.menuBG.y + 340);
        var restartText = SimpleGame.myGame.make.text(0, 0, "" + Language.NO[Language.langIdx], {
            font: "15px Arial", fill: "#000000", fontWeight: "500"
        });
        var restartBut = new ButtonWithOverAndText(restartText, GameUI.promptLayer, "prompt_button", "prompt_button_over", 0, 0, function () {
            GameUI.promptLayer.removeAll(true);
            // BoardManager.resetBoard()
        });
        restartBut.setXY(this.menuBG.x + (this.menuBG.width - restartBut.imgNormal.width) * 0.5 + 50, this.menuBG.y + 340);
        var removeButton = new ButtonWithOverState(GameUI.promptLayer, "prompt_close", "prompt_close_over", 576, 219, function () {
            GameUI.promptLayer.removeAll(true);
        });
    }
    return RestartGamePrompt;
}());
var SettingsPrompt = /** @class */ (function () {
    function SettingsPrompt() {
        SettingsPrompt.NUM_SUIT_COLORS_INIT = CardUtil.NUM_SUIT_COLORS;
        SettingsPrompt.onScreen = true;
        this.myBgBlackGroup = SimpleGame.myGame.add.group();
        this.myGroup = SimpleGame.myGame.add.group();
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, SimpleGame.myGame.width, SimpleGame.myGame.height);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.4;
        this.blackbg.inputEnabled = true;
        this.myBgBlackGroup.add(this.blackbg);
        this.myIconBgZero = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBgZero.beginFill(0x000000);
        this.myIconBgZero.drawRect(-10 * SettingsPrompt.WIDTH_FIXED / 2, -10 * SettingsPrompt.HEIGHT_FIXED / 2, 20 * SettingsPrompt.WIDTH_FIXED, 20 * SettingsPrompt.HEIGHT_FIXED);
        this.myIconBgZero.endFill();
        this.myIconBgZero.alpha = 0.1;
        this.myIconBgZero.inputEnabled = true;
        this.myIconBgZero.events.onInputDown.add(this.closeScreen, this);
        this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBg.beginFill(0x000000);
        this.myIconBg.drawRoundedRect(-SettingsPrompt.WIDTH_FIXED / 2, -SettingsPrompt.HEIGHT_FIXED / 2, SettingsPrompt.WIDTH_FIXED, SettingsPrompt.HEIGHT_FIXED - 120, 40);
        this.myIconBg.endFill();
        this.myIconBg.alpha = 1;
        var scale = Math.min(0.9 * SettingsPrompt.WIDTH_FIXED / ResizeManager.deviceWidth, 0.9 * SettingsPrompt.HEIGHT_FIXED / ResizeManager.deviceHeight);
        var scale = Math.min(0.95 * ResizeManager.deviceWidth / SettingsPrompt.WIDTH_FIXED, 0.95 * ResizeManager.deviceHeight / SettingsPrompt.HEIGHT_FIXED);
        this.myGroup.scale.set(scale, scale);
        this.myGroup.x = ResizeManager.deviceWidth / 2;
        this.myGroup.y = ResizeManager.deviceHeight / 2;
        var settingsIcon = SimpleGame.myGame.add.sprite(-SettingsPrompt.WIDTH_FIXED / 2 + 20, -SettingsPrompt.HEIGHT_FIXED / 2 + 20, 'setting_button', '', this.myGroup);
        settingsIcon.scale.set(0.5, 0.5);
        var settingsTxt;
        if (Language.FRENCH)
            settingsTxt = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 80, -SettingsPrompt.HEIGHT_FIXED / 2 + 20, "Paramètres", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        else
            settingsTxt = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 80, -SettingsPrompt.HEIGHT_FIXED / 2 + 20, "Settings", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.closeButton = SimpleGame.myGame.add.graphics(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, this.myGroup);
        this.closeButton.beginFill(0x333333);
        this.closeButton.drawCircle(0, 0, 50);
        this.closeButton.endFill();
        this.closeButton.alpha = 1;
        this.xTxt = SimpleGame.myGame.add.text(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, "X", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.xTxt.anchor.set(0.5, 0.5);
        this.closeButton.inputEnabled = true;
        this.closeButton.events.onInputDown.add(this.closeScreen, this);
        this.closeButton.input.useHandCursor = true;
        var scoringMode;
        if (Language.FRENCH)
            scoringMode = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 80, -SettingsPrompt.HEIGHT_FIXED / 2 + 100, "Mode de pointage", { font: "30px Overpass", fill: "#ffffff", fontWeight: "600", align: "Right" }, this.myGroup);
        else
            scoringMode = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 80, -SettingsPrompt.HEIGHT_FIXED / 2 + 100, "Scoring Mode", { font: "30px Overpass", fill: "#ffffff", fontWeight: "600", align: "Right" }, this.myGroup);
        var scoringModeControl = new ButtonScoringMode(this.myGroup, -SettingsPrompt.WIDTH_FIXED / 2, -SettingsPrompt.HEIGHT_FIXED / 2 + 120);
        this.scoringModeControl = scoringModeControl;
        ButtonScoringMode.myIdx = GameContext.gameMode;
        this.scoringModeControl.tintButtons();
        var delta = 75;
        var initY = 240;
        var lefthandSwitch;
        if (Language.FRENCH)
            lefthandSwitch = new SwitchButton(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + delta, true, "Main Gauche", this);
        else
            lefthandSwitch = new SwitchButton(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + delta, true, "Left Hand", this);
        // var scoremovesSwitch:SwitchButton = new SwitchButton(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + 300+2*delta, true, "Score/Moves", this )
        // var autohintsSwitch: SwitchButton = new SwitchButton(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 2 * delta, true, "Auto Hints", this)
        var sound3Switch;
        if (Language.FRENCH)
            sound3Switch = new SwitchButton(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 3 * delta, true, "Sons", this);
        else
            sound3Switch = new SwitchButton(this.myGroup, 0, -SettingsPrompt.HEIGHT_FIXED / 2 + initY + 3 * delta, true, "Sounds", this);
        // this.draw3Switch = draw3Switch
        this.lefthandSwitch = lefthandSwitch;
        // this.scoremovesSwitch = scoremovesSwitch
        // this.autohintsSwitch = autohintsSwitch
        this.sound3Switch = sound3Switch;
        this.getFlags();
        GameContext.gameplayStopped();
    }
    SettingsPrompt.prototype.getFlags = function () {
        // if (GameContext.drawCardNum == 3)
        // {
        //     this.draw3Switch.setToOnPosition(true)
        // }
        // else
        // {
        //     this.draw3Switch.setToOffPosition(true)
        // }
        if (BoardManager.isRightHandedGame) {
            this.lefthandSwitch.setToOffPosition(true);
        }
        else {
            this.lefthandSwitch.setToOnPosition(true);
        }
        // if (GameContext.showTopTUI)
        // {
        //     this.scoremovesSwitch.setToOnPosition(true)
        // }
        // else
        // {
        //     this.scoremovesSwitch.setToOffPosition(true)
        // }
        if (GameContext.autoHintsFlag) {
            this.autohintsSwitch.setToOnPosition(true);
        }
        else {
            this.autohintsSwitch.setToOffPosition(true);
        }
        if (SoundButton.soundFlag) {
            this.sound3Switch.setToOnPosition(true);
        }
        else {
            this.sound3Switch.setToOffPosition(true);
        }
        SimpleGame.myGame.scale.onSizeChange.add(this.recreate, this);
        SimpleGame.myGame.scale.onOrientationChange.add(this.recreate, this);
    };
    SettingsPrompt.prototype.recreate = function (arg0, recreate, arg2) {
        this.remove();
        SimpleGame.myGame.time.events.add(500, function () {
            if (SettingsPrompt.onScreen == false) {
                var utorialPrompt = new SettingsPrompt();
            }
        });
    };
    SettingsPrompt.prototype.setFlags = function () {
        // if (this.draw3Switch.onFlag)
        // {
        //     GameContext.drawCardNum = 3;
        // }
        // else
        // {
        //     GameContext.drawCardNum = 1;
        // }
        BoardManager.isRightHandedGame = !this.lefthandSwitch.onFlag;
        // GameContext.showTopTUI = this.scoremovesSwitch.onFlag;
        GameContext.autoHintsFlag = this.autohintsSwitch.onFlag;
        SoundButton.soundFlag = this.sound3Switch.onFlag;
        SoundManager.setMuteFlags(!SoundButton.soundFlag);
        GameContext.saveGameContext();
    };
    SettingsPrompt.prototype.closeScreen = function () {
        SettingsPrompt.onScreen = false;
        if (SettingsPrompt.NUM_SUIT_COLORS_INIT != CardUtil.NUM_SUIT_COLORS) {
            // GameContext.gameMode = ButtonScoringMode.myIdx;
            BoardManager.startNewGame();
        }
        SoundManager.playClick();
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
        this.myBgBlackGroup.destroy();
        this.myGroup.destroy();
        GameContext.gameplayStarted();
    };
    SettingsPrompt.prototype.remove = function () {
        SettingsPrompt.onScreen = false;
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
        this.myBgBlackGroup.destroy();
        this.myGroup.destroy();
        GameContext.gameplayStarted();
    };
    SettingsPrompt.init = function () {
    };
    SettingsPrompt.onScreen = false;
    SettingsPrompt.WIDTH_FIXED = 540;
    SettingsPrompt.HEIGHT_FIXED = 720;
    return SettingsPrompt;
}());
var StatisticsPrompt = /** @class */ (function () {
    function StatisticsPrompt(skipTween) {
        if (skipTween === void 0) { skipTween = false; }
        this.yDelta = 35;
        GameUI.promptHolder.removeAll();
        var gamesPlayedC = Util.getStoragePerDifficulty("gamesPlayed");
        if (gamesPlayedC < 0) {
            gamesPlayedC = 0;
        }
        var difficultyStr;
        if (CardUtil.NUM_SUIT_COLORS == 4) {
            difficultyStr = Language.HARD[Language.langIdx];
        }
        else if (CardUtil.NUM_SUIT_COLORS == 2) {
            difficultyStr = Language.NORMAL[Language.langIdx];
        }
        else {
            difficultyStr = Language.EASY[Language.langIdx];
        }
        difficultyStr = difficultyStr.toUpperCase();
        var gamesWonC = Util.getStoragePerDifficulty("gamesWon");
        var gamesLostC = gamesPlayedC - gamesWonC;
        if (gamesLostC < 0) {
            gamesLostC = 0;
        }
        var gamesPlayedCount1 = gamesPlayedC;
        if (gamesPlayedCount1 == 0) {
            gamesPlayedCount1 = 1;
        }
        var winPerc = Math.round(gamesWonC / gamesPlayedC * 100);
        if (isNaN(winPerc)) {
            winPerc = 0;
        }
        var topScore = Util.getStoragePerDifficulty("bestScore");
        var cumulativeScore = Util.getStoragePerDifficulty("cumulativeScore");
        if (gamesPlayedCount1 == 1 && cumulativeScore > topScore)
            cumulativeScore = topScore;
        var averageScore = cumulativeScore / gamesPlayedCount1;
        if (isNaN(averageScore)) {
            averageScore = 0;
        }
        var bestTime = Util.convertToHHMMSS(Util.getStoragePerDifficulty("bestTime"));
        var cumulativeTime = Util.convertToHHMMSS(Util.getStoragePerDifficulty("cumulativeTime"));
        var averageTime = Util.convertToHHMMSS(Math.floor(Util.getStoragePerDifficulty("cumulativeTime") / gamesPlayedCount1));
        // if (cumulativeTime > bestTime) cumulativeTime = bestTime;
        if (isNaN(Math.floor(Util.getStoragePerDifficulty("cumulativeTime") / gamesPlayedC))) {
            averageTime = Util.convertToHHMMSS(0);
        }
        var leastMoves = Util.getStoragePerDifficulty("leastMoves", 0);
        var cumulativeMoves = Util.getStoragePerDifficulty("cumulativeMoves");
        var averageMoves = cumulativeMoves / (gamesPlayedCount1);
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(-2048, -2048, 4096, 4096);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.7;
        this.blackbg.inputEnabled = true;
        GameUI.promptLayer.add(this.blackbg);
        this.menuBG = SimpleGame.myGame.add.sprite(0, 0, 'statics_bg');
        this.menuBG.x = 0;
        this.menuBG.y = 0;
        GameUI.promptHolder.add(this.menuBG);
        this.menuBG.anchor.set(0.5, 0.5);
        this.menuText = SimpleGame.myGame.make.text(0, 0, Language.STATISTICS[Language.langIdx].toUpperCase() + " " + difficultyStr, {
            font: "26px Arimo", fill: "#694014", fontWeight: "700"
        });
        this.menuText.y = GameUI.promptHolder.add(this.menuText);
        this.menuText.wordWrap = true;
        this.menuText.wordWrapWidth = 380;
        this.menuText.x = 0;
        this.menuText.anchor.set(0.5, 0.5);
        this.menuText.y = -230 + this.menuBG.y + 5;
        this.timescoreTxt = SimpleGame.myGame.make.text(0, 0, "", {
            font: "20px Arimo", fill: "#694014", fontWeight: "700", align: "Left"
        });
        this.timescoreTxt.y = this.menuBG.y - 20;
        this.timescoreTxt.wordWrap = true;
        this.timescoreTxt.wordWrapWidth = 650;
        this.timescoreTxt.x = 60 - this.menuBG.width * 0.5 + 20;
        this.timescoreTxt.anchor.set(0, 0.5);
        GameUI.promptHolder.add(this.timescoreTxt);
        this.timescoreTxt.text = "" + Language.playedgames[Language.langIdx] + "\n" + Language.wongames[Language.langIdx] + "\n" + Language.lostgames[Language.langIdx] + "\n" + Language.highest_score[Language.langIdx] + "\n" + Language.cumulative_score[Language.langIdx] + "\n" + Language.average_score[Language.langIdx] + "\n" + Language.best_time[Language.langIdx] + "\n" + Language.cumulative_time[Language.langIdx] + "\n" + Language.average_time[Language.langIdx] + "\n" + Language.least_moves_used[Language.langIdx] + "\n" + Language.cumulative_moves[Language.langIdx] + "\n" + Language.average_moves[Language.langIdx];
        this.timescoreTxtRight = SimpleGame.myGame.make.text(0, 0, "", {
            font: "20px Arimo", fill: "#694014", fontWeight: "700", align: "Right"
        });
        this.timescoreTxtRight.y = this.menuBG.y - 20;
        this.timescoreTxtRight.wordWrap = true;
        this.timescoreTxtRight.wordWrapWidth = 650;
        this.timescoreTxtRight.x = this.menuBG.width * 0.5 - 80;
        this.timescoreTxtRight.anchor.set(1, 0.5);
        GameUI.promptHolder.add(this.timescoreTxtRight);
        this.timescoreTxtRight.text = "" + gamesPlayedC + "\n" + gamesWonC + "\n" + gamesLostC + "\n" + topScore + "\n" + cumulativeScore + "\n" + Math.ceil(averageScore) + "\n" + bestTime + "\n" + cumulativeTime + "\n" + averageTime + "\n" + leastMoves + "\n" + cumulativeMoves + "\n" + Math.ceil(averageMoves);
        //     this.playedgamesText = SimpleGame.myGame.make.text(0,0, Language.playedgames[Language.langIdx], {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"500" 
        //     });
        //     this.playedgamesText.x = this.menuBG.x + (this.menuBG.width - this.playedgamesText.width-30) * 0.5;
        //     this.playedgamesText.y = this.menuBG.y + 90;
        //     GameUI.promptLayer.add(this.playedgamesText)
        //     this.playedgamesCount = SimpleGame.myGame.make.text(0,0, ""+gamesPlayedC, {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"800" 
        //     });
        //     this.playedgamesCount.x = this.playedgamesText.x + this.playedgamesText.width + 3;
        //     this.playedgamesCount.y = this.playedgamesText.y;
        //     GameUI.promptLayer.add(this.playedgamesCount)
        //     this.wongamesText = SimpleGame.myGame.make.text(0,0, Language.wongames[Language.langIdx], {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"500" 
        //     });
        //     this.wongamesText.x = this.menuBG.x + (this.menuBG.width - this.wongamesText.width-10) * 0.5;
        //     this.wongamesText.y = this.menuBG.y + 90 + 1*this.yDelta;
        //     GameUI.promptLayer.add(this.wongamesText)
        //     this.wongamesCount = SimpleGame.myGame.make.text(0,0, ""+gamesWonC, {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"700" 
        //     });
        //     this.wongamesCount.x = this.wongamesText.x + this.wongamesText.width + 3;
        //     this.wongamesCount.y = this.wongamesText.y;
        //     GameUI.promptLayer.add(this.wongamesCount)
        //     this.lostgamesText = SimpleGame.myGame.make.text(0,0, Language.lostgames[Language.langIdx], {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"500" 
        //     });
        //     this.lostgamesText.x = this.menuBG.x + (this.menuBG.width - this.lostgamesText.width-20) * 0.5;
        //     this.lostgamesText.y = this.menuBG.y + 90+2*this.yDelta;
        //     GameUI.promptLayer.add(this.lostgamesText)
        //     this.lostgamesCount = SimpleGame.myGame.make.text(0,0, ""+gamesLostC, {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"700" 
        //     });
        //     this.lostgamesCount.x = this.lostgamesText.x + this.lostgamesText.width + 3;
        //     this.lostgamesCount.y = this.lostgamesText.y;
        //     GameUI.promptLayer.add(this.lostgamesCount)
        //     this.winpercText = SimpleGame.myGame.make.text(0,0, Language.win_percentage[Language.langIdx], {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"500" 
        //     });
        //     this.winpercText.x = this.menuBG.x + (this.menuBG.width - this.winpercText.width-40) * 0.5;
        //     this.winpercText.y = this.menuBG.y + 90+3*this.yDelta;
        //     GameUI.promptLayer.add(this.winpercText)
        //     this.winpercCount = SimpleGame.myGame.make.text(0,0, ""+winPerc+"%", {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"700" 
        //     });
        //     this.winpercCount.x = this.winpercText.x + this.winpercText.width + 3;
        //     this.winpercCount.y = this.winpercText.y;
        //     GameUI.promptLayer.add(this.winpercCount)
        //     this.topscoreText = SimpleGame.myGame.make.text(0,0, Language.top_score[Language.langIdx], {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"500" 
        //     });
        //     this.topscoreText.x = this.menuBG.x + (this.menuBG.width - this.topscoreText.width-66) * 0.5 + 6;
        //     this.topscoreText.y = this.menuBG.y + 90+4*this.yDelta;
        //     GameUI.promptLayer.add(this.topscoreText)
        //     this.topscoreCount = SimpleGame.myGame.make.text(0,0, ""+topScore, {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"700" 
        //     });
        //     this.topscoreCount.x = this.topscoreText.x + this.topscoreText.width + 3;
        //     this.topscoreCount.y = this.topscoreText.y;
        //     GameUI.promptLayer.add(this.topscoreCount)
        //     this.besttimeText = SimpleGame.myGame.make.text(0,0, Language.best_time[Language.langIdx], {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"500" 
        //     });
        //     this.besttimeText.x = this.menuBG.x + (this.menuBG.width - this.besttimeText.width-70) * 0.5 - 10;
        //     this.besttimeText.y = this.menuBG.y + 90+5*this.yDelta;
        //     GameUI.promptLayer.add(this.besttimeText)
        //     this.besttimeCount = SimpleGame.myGame.make.text(0,0, ""+Util.convertToHHMMSS(Util.getStorage("bestTime")), {
        //         font:"20px Open Sans", fill: "#464646", fontWeight:"700" 
        //     });
        //     this.besttimeCount.x = this.besttimeText.x + this.besttimeText.width + 3;
        //     this.besttimeCount.y = this.besttimeText.y;
        //     GameUI.promptLayer.add(this.besttimeCount)
        //     var yesText = SimpleGame.myGame.make.text(0,0, Language.ok[Language.langIdx],{
        //         font:"20px Open Sans", fill:"#ffffff", fontWeight:"700"
        //     } )
        //    var yesBut:ButtonWithOverAndText = new ButtonWithOverAndText(yesText, GameUI.promptLayer, "button", "button_over", 0, 0, function()
        // {
        //     
        //     GameUI.promptLayer.removeAll(true);
        // } )
        // yesBut.setXY(this.menuBG.x + (this.menuBG.width - yesBut.imgNormal.width)*0.2, this.menuBG.y + 325)     
        GameUI.promptLayer.add(GameUI.promptHolder);
        if (skipTween) {
            this.addButtons(GameUI.promptLayer);
            return;
        }
        this.addButtons(GameUI.promptHolder);
        GameUI.promptHolder.scale.set(0.8);
        var tweenE = SimpleGame.myGame.add.tween(GameUI.promptHolder.scale).to({ x: 1, y: 1 }, 200, Phaser.Easing.Quadratic.Out, true, 0);
        SimpleGame.myGame.time.events.add(200, function () {
            this.addButtons(GameUI.promptLayer);
        }, this);
    }
    StatisticsPrompt.prototype.addButtons = function (parent) {
        var clearText = SimpleGame.myGame.make.text(0, 0, Language.close[Language.langIdx].toUpperCase(), {
            font: "22px Arimo", fill: "#ffffff", fontWeight: "700"
        });
        var clearBut = new ButtonWithOverAndText(clearText, parent, "button_prompt", "button_prompt_over", 0, 0, function () {
            GameUI.promptLayer.removeAll(true);
            GameUI.promptHolder.removeAll(true);
            //   window.localStorage.clear()
            // var stats = new StatisticsPrompt();
        });
        clearBut.setXY(this.menuBG.x * 0.5 - clearBut.imgNormal.width * 0.5 - 130, this.menuBG.y + 170 + 12);
        var resetText = SimpleGame.myGame.make.text(0, 0, Language.reset[Language.langIdx].toUpperCase(), {
            font: "22px Arimo", fill: "#ffffff", fontWeight: "700"
        });
        var resetBut = new ButtonWithOverAndText(resetText, parent, "button_prompt", "button_prompt_over", 0, 0, function () {
            GameUI.promptLayer.removeAll(true);
            var areyousure = new AreYouSurePrompt(AreYouSurePrompt.TYPE_CLEAR_STATS);
        });
        resetBut.setXY(this.menuBG.x * 0.5 - resetBut.imgNormal.width * 0.5 + 131, this.menuBG.y + 170 + 12);
    };
    return StatisticsPrompt;
}());
var ThemeIcon = /** @class */ (function () {
    function ThemeIcon(myIdx, myX, myY, parent) {
        this.parent = parent;
        this.myX = myX;
        this.myY = myY;
        this.myGroup = SimpleGame.myGame.add.group(this.parent);
        this.myGroup.x = myX;
        this.myGroup.y = myY;
        // this.myGroup.scale.set(0.7)
        this.myIdx = myIdx;
        var c1Name = "k_club";
        var c2Name = "q_heart";
        var c3Name = "j_club";
        var deckName = CardUtil.deckNameArray[myIdx];
        this.myGroup.scale.set(0.36);
        var cardScale = 2;
        var card1Clone = SimpleGame.myGame.add.sprite(0, 0, '' + deckName + "_" + c1Name, '', this.myGroup);
        card1Clone.scale.set(cardScale * 1.03, cardScale * 1.03);
        card1Clone.anchor.set(0.5, 0.5);
        card1Clone.tint = 0x00ffff;
        var card2Clone = SimpleGame.myGame.add.sprite(60, 0, '' + deckName + "_" + c1Name, '', this.myGroup);
        card2Clone.scale.set(cardScale * 1.03, cardScale * 1.03);
        card2Clone.anchor.set(0.5, 0.5);
        card2Clone.tint = 0x00ffff;
        var card3Clone = SimpleGame.myGame.add.sprite(120, 0, '' + deckName + "_" + c1Name, '', this.myGroup);
        card3Clone.scale.set(cardScale * 1.03, cardScale * 1.03);
        card3Clone.anchor.set(0.5, 0.5);
        card3Clone.tint = 0x00ffff;
        this.card1Clone = card1Clone;
        this.card2Clone = card2Clone;
        this.card3Clone = card3Clone;
        this.blurInactive();
        if (GameContext.frontDeckSelected == this.myIdx) {
            this.blurActive();
        }
        var card1 = SimpleGame.myGame.add.sprite(0, 0, '' + deckName + "_" + c1Name, '', this.myGroup);
        card1.anchor.set(0.5, 0.5);
        card1.scale.set(cardScale, cardScale);
        var card2 = SimpleGame.myGame.add.sprite(60, 0, '' + deckName + "_" + c2Name, '', this.myGroup);
        card2.anchor.set(0.5, 0.5);
        card2.scale.set(cardScale, cardScale);
        var card3 = SimpleGame.myGame.add.sprite(120, 0, '' + deckName + "_" + c3Name, '', this.myGroup);
        card3.anchor.set(0.5, 0.5);
        card3.scale.set(cardScale, cardScale);
        card1.inputEnabled = card2.inputEnabled = card3.inputEnabled = true;
        card1.events.onInputUp.add(this.select, this);
        card2.events.onInputUp.add(this.select, this);
        card3.events.onInputUp.add(this.select, this);
    }
    ThemeIcon.prototype.select = function () {
        var i = ThemeIcon.themeIconArr.length;
        while (i-- > 0) {
            ThemeIcon.themeIconArr[i].blurInactive();
        }
        this.blurActive();
        GameContext.frontDeckSelected = this.myIdx;
        // Card.selectedDeckIdx = this.myIdx;
        var i = Card.cardArray.length;
        while (i-- > 0) {
            Card.cardArray[i].updateFrontImg();
        }
    };
    ThemeIcon.prototype.blurActive = function () {
        this.card1Clone.visible = this.card2Clone.visible = this.card3Clone.visible = true;
    };
    ThemeIcon.prototype.blurInactive = function () {
        this.card1Clone.visible = this.card2Clone.visible = this.card3Clone.visible = false;
    };
    return ThemeIcon;
}());
var ThemeIconBack = /** @class */ (function () {
    function ThemeIconBack(myIdx, x, y, parent) {
        this.parent = parent;
        this.myX = x;
        this.myY = y;
        this.myGroup = SimpleGame.myGame.add.group(this.parent);
        this.myGroup.x = x;
        this.myGroup.y = y;
        this.myIdx = myIdx;
        var imgName = CardUtil.backNameArray[myIdx];
        this.myGroup.scale.set(0.35);
        var card1Clone = SimpleGame.myGame.add.sprite(0, 0, '' + imgName, '', this.myGroup);
        card1Clone.scale.set(2.04, 2.04);
        card1Clone.anchor.set(0.5, 0.5);
        card1Clone.tint = 0x00ffff;
        this.card1Clone = card1Clone;
        this.blurInactive();
        if (GameContext.backDeckSelected == this.myIdx) {
            this.blurActive();
        }
        var card1 = SimpleGame.myGame.add.sprite(0, 0, '' + imgName, '', this.myGroup);
        card1.anchor.set(0.5, 0.5);
        card1.scale.set(2, 2);
        card1.inputEnabled = true;
        card1.events.onInputUp.add(this.select, this);
    }
    ThemeIconBack.prototype.select = function () {
        var i = ThemeIconBack.themeIconBack.length;
        while (i-- > 0) {
            ThemeIconBack.themeIconBack[i].blurInactive();
        }
        this.blurActive();
        GameContext.backDeckSelected = this.myIdx;
        // Card.selectedDeckIdx = this.myIdx;
        var i = Card.cardArray.length;
        while (i-- > 0) {
            Card.cardArray[i].updateBackImg();
        }
    };
    ThemeIconBack.prototype.blurActive = function () {
        this.card1Clone.visible = true;
    };
    ThemeIconBack.prototype.blurInactive = function () {
        this.card1Clone.visible = false;
    };
    return ThemeIconBack;
}());
var ThemeIconBackground = /** @class */ (function () {
    function ThemeIconBackground(myIdx, x, y, parent) {
        this.myIdx = myIdx;
        this.parent = parent;
        this.myX = x;
        this.myY = y;
        this.myGroup = SimpleGame.myGame.add.group(this.parent);
        this.myGroup.x = x;
        this.myGroup.y = y;
        this.myIdx = myIdx;
        var imgName = SimpleGame.landscape_backroundNameArray[myIdx];
        this.myGroup.scale.set(0.1);
        if (ThemeIconBackground.themeIconBack == null)
            ThemeIconBackground.themeIconBack = [];
        var bg1Clone = SimpleGame.myGame.add.sprite(0, 0, '' + imgName, '', this.myGroup);
        bg1Clone.scale.set(1.03, 1.03);
        bg1Clone.anchor.set(0.5, 0.5);
        bg1Clone.tint = 0x00ffff;
        this.bg1Clone = bg1Clone;
        this.blurInactive();
        if (GameContext.backDeckSelected == this.myIdx) {
            this.blurActive();
        }
        var card1 = SimpleGame.myGame.add.sprite(0, 0, '' + imgName, '', this.myGroup);
        card1.anchor.set(0.5, 0.5);
        card1.inputEnabled = true;
        card1.events.onInputUp.add(this.select, this);
    }
    ThemeIconBackground.prototype.select = function () {
        var i = ThemeIconBackground.themeIconBack.length;
        while (i-- > 0) {
            ThemeIconBackground.themeIconBack[i].blurInactive();
        }
        this.blurActive();
        GameContext.backgroundSelected = this.myIdx;
        // Card.selectedDeckIdx = this.myIdx;
        SimpleGame.updateBgImg();
    };
    ThemeIconBackground.prototype.blurActive = function () {
        this.bg1Clone.visible = true;
    };
    ThemeIconBackground.prototype.blurInactive = function () {
        this.bg1Clone.visible = false;
    };
    return ThemeIconBackground;
}());
var ThemePrompt = /** @class */ (function () {
    function ThemePrompt() {
        ThemePrompt.onScreen = true;
        this.myBgBlackGroup = SimpleGame.myGame.add.group();
        this.myGroup = SimpleGame.myGame.add.group();
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, SimpleGame.myGame.width, SimpleGame.myGame.height);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.4;
        this.blackbg.inputEnabled = true;
        this.myBgBlackGroup.add(this.blackbg);
        GameContext.gameplayStopped();
        this.myIconBgZero = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBgZero.beginFill(0x000000);
        this.myIconBgZero.drawRect(-10 * SettingsPrompt.WIDTH_FIXED / 2, -10 * SettingsPrompt.HEIGHT_FIXED / 2, 20 * SettingsPrompt.WIDTH_FIXED, 20 * SettingsPrompt.HEIGHT_FIXED);
        this.myIconBgZero.endFill();
        this.myIconBgZero.alpha = 0.1;
        this.myIconBgZero.inputEnabled = true;
        this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBg.beginFill(0x000000);
        this.myIconBg.drawRoundedRect(-SettingsPrompt.WIDTH_FIXED / 2, -SettingsPrompt.HEIGHT_FIXED / 2, SettingsPrompt.WIDTH_FIXED, SettingsPrompt.HEIGHT_FIXED, 40);
        this.myIconBg.endFill();
        this.myIconBg.alpha = 1;
        var scale = Math.min(0.9 * SettingsPrompt.WIDTH_FIXED / ResizeManager.deviceWidth, 0.9 * SettingsPrompt.HEIGHT_FIXED / ResizeManager.deviceHeight);
        var scale = Math.min(0.95 * ResizeManager.deviceWidth / SettingsPrompt.WIDTH_FIXED, 0.95 * ResizeManager.deviceHeight / SettingsPrompt.HEIGHT_FIXED);
        this.myGroup.scale.set(scale, scale);
        this.myGroup.x = ResizeManager.deviceWidth / 2;
        this.myGroup.y = ResizeManager.deviceHeight / 2;
        this.closeButton = SimpleGame.myGame.add.graphics(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, this.myGroup);
        this.closeButton.beginFill(0x333333);
        this.closeButton.drawCircle(0, 0, 50);
        this.closeButton.endFill();
        this.closeButton.alpha = 1;
        this.xTxt = SimpleGame.myGame.add.text(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, "X", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.xTxt.anchor.set(0.5, 0.5);
        this.closeButton.inputEnabled = true;
        this.closeButton.events.onInputDown.add(this.closeScreen, this);
        this.closeButton.input.useHandCursor = true;
        if(Language.FRENCH)
            this.themePromptTxt = SimpleGame.myGame.add.text(0, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, "Thème", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        else
            this.themePromptTxt = SimpleGame.myGame.add.text(0, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, "Themes", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.themePromptTxt.anchor.set(0.5, 0.5);
        SimpleGame.myGame.scale.onSizeChange.add(this.recreate, this);
        SimpleGame.myGame.scale.onOrientationChange.add(this.recreate, this);
        var themeIcon1 = new ThemeIcon(0, -190, -220, this.myGroup);
        var themeIcon2 = new ThemeIcon(1, -30, -220, this.myGroup);
        var themeIcon3 = new ThemeIcon(2, 130, -220, this.myGroup);
        ThemeIcon.themeIconArr = [themeIcon1, themeIcon2, themeIcon3];
        var themeBackIcon1 = new ThemeIconBack(0, -200, -50, this.myGroup);
        var themeBackIcon2 = new ThemeIconBack(1, -140, -50, this.myGroup);
        var themeBackIcon3 = new ThemeIconBack(2, -80, -50, this.myGroup);
        var themeBackIcon4 = new ThemeIconBack(3, -20, -50, this.myGroup);
        var themeBackIcon5 = new ThemeIconBack(4, 40, -50, this.myGroup);
        var themeBackIcon6 = new ThemeIconBack(5, 100, -50, this.myGroup);
        var themeBackIcon7 = new ThemeIconBack(6, 160, -50, this.myGroup);
        var themeBackIcon8 = new ThemeIconBack(7, 220, -50, this.myGroup);
        var themeBackIconBackground1 = new ThemeIconBackground(0, -110, 110, this.myGroup);
        var themeBackIconBackground2 = new ThemeIconBackground(1, 110, 110, this.myGroup);
        var themeBackIconBackground3 = new ThemeIconBackground(2, -110, 240, this.myGroup);
        var themeBackIconBackground4 = new ThemeIconBackground(3, 110, 240, this.myGroup);
        ThemeIconBack.themeIconBack = [themeBackIcon1, themeBackIcon2, themeBackIcon3, themeBackIcon4, themeBackIcon5, themeBackIcon6, themeBackIcon7, themeBackIcon8];
        ThemeIconBackground.themeIconBack = [themeBackIconBackground1, themeBackIconBackground2, themeBackIconBackground3, themeBackIconBackground4];
    }
    ThemePrompt.prototype.recreate = function (arg0, recreate, arg2) {
        this.remove();
        SimpleGame.myGame.time.events.add(500, function () {
            if (ThemePrompt.onScreen == false) {
                var utomPrialPrompt = new ThemePrompt();
            }
        });
    };
    ThemePrompt.prototype.closeScreen = function () {
        SoundManager.playClick();
        this.remove();
        GameContext.gameplayStarted();
    };
    ThemePrompt.prototype.remove = function () {
        this.myGroup.destroy();
        this.myBgBlackGroup.destroy();
        ThemePrompt.onScreen = false;
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
    };
    ThemePrompt.onScreen = false;
    return ThemePrompt;
}());
var TutorialPrompt = /** @class */ (function () {
    function TutorialPrompt() {
        TutorialPrompt.onScreen = true;
        this.myBgBlackGroup = SimpleGame.myGame.add.group();
        this.myGroup = SimpleGame.myGame.add.group();
        this.myGroup.y;
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, SimpleGame.myGame.width, SimpleGame.myGame.height);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.4;
        this.blackbg.inputEnabled = true;
        this.myBgBlackGroup.add(this.blackbg);
        this.myIconBgZero = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBgZero.beginFill(0x000000);
        this.myIconBgZero.drawRect(-10 * SettingsPrompt.WIDTH_FIXED / 2, -10 * SettingsPrompt.HEIGHT_FIXED / 2, 20 * SettingsPrompt.WIDTH_FIXED, 20 * SettingsPrompt.HEIGHT_FIXED);
        this.myIconBgZero.endFill();
        this.myIconBgZero.alpha = 0.1;
        this.myIconBgZero.inputEnabled = true;
        this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBg.beginFill(0x000000);
        this.myIconBg.drawRoundedRect(-SettingsPrompt.WIDTH_FIXED / 2, -SettingsPrompt.HEIGHT_FIXED / 2, SettingsPrompt.WIDTH_FIXED, SettingsPrompt.HEIGHT_FIXED, 40);
        this.myIconBg.endFill();
        this.myIconBg.alpha = 1;
        var scale = Math.min(0.9 * SettingsPrompt.WIDTH_FIXED / ResizeManager.deviceWidth, 0.9 * SettingsPrompt.HEIGHT_FIXED / ResizeManager.deviceHeight);
        var scale = Math.min(0.8 * ResizeManager.deviceWidth / SettingsPrompt.WIDTH_FIXED, 0.8 * ResizeManager.deviceHeight / SettingsPrompt.HEIGHT_FIXED);
        this.myGroup.scale.set(scale, scale);
        this.myGroup.x = ResizeManager.deviceWidth / 2;
        this.myGroup.y = ResizeManager.deviceHeight * 0.45;
        this.closeButton = SimpleGame.myGame.add.graphics(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, this.myGroup);
        this.closeButton.beginFill(0x333333);
        this.closeButton.drawCircle(0, 0, 50);
        this.closeButton.endFill();
        this.closeButton.alpha = 1;
        this.xTxt = SimpleGame.myGame.add.text(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 44, "X", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.xTxt.anchor.set(0.5, 0.5);
        this.closeButton.inputEnabled = true;
        this.closeButton.events.onInputDown.add(this.closeScreen, this);
        this.closeButton.input.useHandCursor = true;
        this.questionMarkTxt = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 60, -SettingsPrompt.HEIGHT_FIXED / 2 + 30, "?", { font: "42px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        if (Language.FRENCH)
            this.howToPlayTxt = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 100, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, "Comment jouer", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        else
            this.howToPlayTxt = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 100, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, "How to play", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        if (Language.FRENCH)
            this.tutorialTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 200, "Résolvez le puzzle. Vous pouvez déplacer les cartes sur des couleurs opposées.", { font: "24px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        else
            this.tutorialTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 200, "Solve the puzzle. You can move the red cards to the black ones and vice versa.", { font: "24px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        this.tutorialTxt.anchor.set(0.5, 0.5);
        this.tutorialTxt.wordWrap = true;
        this.tutorialTxt.wordWrapWidth = 500;
        var tutIMg = SimpleGame.myGame.add.sprite(0, -100, 'tutorial_image_1', '', this.myGroup);
        tutIMg.anchor.set(0.5, 0.5);
        tutIMg.scale.set(0.6, 0.6);
        var butW = 120;
        var butH = 50;
        this.nextButton = SimpleGame.myGame.add.graphics(0, SettingsPrompt.HEIGHT_FIXED / 2 - 82, this.myGroup);
        this.nextButton.beginFill(0x333333);
        this.nextButton.drawRoundedRect(-butW * 0.5, -butH * 0.5, butW, butH, 30);
        this.nextButton.endFill();
        this.nextButton.alpha = 1;
        if (Language.FRENCH)
            this.nextTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 80, "Suivant", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        else
            this.nextTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 80, "Next", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.nextTxt.anchor.set(0.5, 0.5);
        this.nextButton.inputEnabled = true;
        this.nextButton.events.onInputDown.add(this.closeScreen, this);
        this.nextButton.input.useHandCursor = true;
        this.nextButton.visible = false;
        this.nextTxt.visible = false;
        SimpleGame.myGame.time.events.add(500, function () {
            this.nextButton.visible = true;
            this.nextTxt.visible = true;
        }, this);
        SimpleGame.myGame.scale.onSizeChange.add(this.recreate, this);
        SimpleGame.myGame.scale.onOrientationChange.add(this.recreate, this);
    }
    TutorialPrompt.prototype.recreate = function (arg0, recreate, arg2) {
        this.remove();
        SimpleGame.myGame.time.events.add(500, function () {
            if (TutorialPrompt.onScreen == false) {
                var utorialPrompt = new TutorialPrompt();
            }
        });
    };
    TutorialPrompt.prototype.remove = function () {
        this.myGroup.destroy();
        this.myBgBlackGroup.destroy();
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
        TutorialPrompt.onScreen = false;
    };
    TutorialPrompt.prototype.closeScreen = function (closeScreen, arg1) {
        SoundManager.playClick();
        this.remove();
        GameContext.commercialBreak()
        // var initmenuprompt:InitMenuPrompt = new InitMenuPrompt()
        SimpleGame.myGame.time.events.add(500, BoardManager.showTutorial1, this);
    };
    TutorialPrompt.onScreen = false;
    return TutorialPrompt;
}());
var TutorialPrompt1 = /** @class */ (function () {
    function TutorialPrompt1() {
        if (TutorialPrompt1.tutorialShown)
            return;
        TutorialPrompt1.onScreen = true;
        TutorialPrompt1.tutorialShown = true;
        this.myBgBlackGroup = SimpleGame.myGame.add.group();
        this.myGroup = SimpleGame.myGame.add.group();
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, SimpleGame.myGame.width, SimpleGame.myGame.height);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.4;
        this.blackbg.inputEnabled = true;
        this.myBgBlackGroup.add(this.blackbg);
        this.myIconBgZero = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBgZero.beginFill(0x000000);
        this.myIconBgZero.drawRect(-10 * SettingsPrompt.WIDTH_FIXED / 2, -10 * SettingsPrompt.HEIGHT_FIXED / 2, 20 * SettingsPrompt.WIDTH_FIXED, 20 * SettingsPrompt.HEIGHT_FIXED);
        this.myIconBgZero.endFill();
        this.myIconBgZero.alpha = 0.1;
        this.myIconBgZero.inputEnabled = true;
        this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBg.beginFill(0x000000);
        this.myIconBg.drawRoundedRect(-SettingsPrompt.WIDTH_FIXED / 2, -SettingsPrompt.HEIGHT_FIXED / 2, SettingsPrompt.WIDTH_FIXED, SettingsPrompt.HEIGHT_FIXED - 200, 40);
        this.myIconBg.endFill();
        this.myIconBg.alpha = 1;
        var scale = Math.min(0.9 * SettingsPrompt.WIDTH_FIXED / ResizeManager.deviceWidth, 0.9 * SettingsPrompt.HEIGHT_FIXED / ResizeManager.deviceHeight);
        var scale = Math.min(0.95 * ResizeManager.deviceWidth / SettingsPrompt.WIDTH_FIXED, 0.95 * ResizeManager.deviceHeight / SettingsPrompt.HEIGHT_FIXED);
        this.myGroup.scale.set(scale, scale);
        this.myGroup.x = ResizeManager.deviceWidth / 2;
        this.myGroup.y = ResizeManager.deviceHeight / 2;
        this.closeButton = SimpleGame.myGame.add.graphics(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, this.myGroup);
        this.closeButton.beginFill(0x333333);
        this.closeButton.drawCircle(0, 0, 50);
        this.closeButton.endFill();
        this.closeButton.alpha = 1;
        this.xTxt = SimpleGame.myGame.add.text(220, -SettingsPrompt.HEIGHT_FIXED / 2 + 44, "X", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.xTxt.anchor.set(0.5, 0.5);
        this.closeButton.inputEnabled = true;
        this.closeButton.events.onInputDown.add(this.closeScreen, this);
        this.closeButton.input.useHandCursor = true;
        this.shuffleIcon = SimpleGame.myGame.add.sprite(0, -SettingsPrompt.HEIGHT_FIXED / 2 + 150, 'shuffle_button', '', this.myGroup);
        this.shuffleIcon.visible = false;
        this.magicIcon = SimpleGame.myGame.add.sprite(0, -SettingsPrompt.HEIGHT_FIXED / 2 + 150, 'wand_button', '', this.myGroup);
        this.shuffleIcon.anchor.set(0.5, 0.5);
        this.magicIcon.anchor.set(0.5, 0.5);
        this.shuffleIcon.scale.set(0.8, 0.8);
        this.magicIcon.scale.set(0.8, 0.8);
        this.questionMarkTxt = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 60, -SettingsPrompt.HEIGHT_FIXED / 2 + 30, "?", { font: "42px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        if (Language.FRENCH)
            this.howToPlayTxt = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 100, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, "Comment jouer", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        else
            this.howToPlayTxt = SimpleGame.myGame.add.text(-SettingsPrompt.WIDTH_FIXED / 2 + 100, -SettingsPrompt.HEIGHT_FIXED / 2 + 40, "How to play", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        if (Language.FRENCH)
            this.tutorialTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 460, "Résolvez le puzzle. Vous pouvez déplacer les cartes sur des couleurs opposées.", { font: "24px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        else
            this.tutorialTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 460, "Solve the puzzle. You can move the red cards to the black ones and vice versa.", { font: "24px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        this.tutorialTxt.anchor.set(0.5, 0.5);
        this.tutorialTxt.wordWrap = true;
        this.tutorialTxt.wordWrapWidth = 400;
        if(Language.FRENCH)
            this.tutorialTxt1 = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 460, "Battage Magique prend toutes les cartes fermées et les battage!", { font: "24px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        else
            this.tutorialTxt1 = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 460, "Shuffle powerup takes all closed cards and shuffles them!", { font: "24px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        this.tutorialTxt1.anchor.set(0.5, 0.5);
        this.tutorialTxt1.wordWrap = true;
        this.tutorialTxt1.wordWrapWidth = 400;
        this.tutorialTxt1.visible = false;
        var butW = 120;
        var butH = 50;
        this.nextButton = SimpleGame.myGame.add.graphics(0, SettingsPrompt.HEIGHT_FIXED / 2 - 282, this.myGroup);
        this.nextButton.beginFill(0x333333);
        this.nextButton.drawRoundedRect(-butW * 0.5, -butH * 0.5, butW, butH, 30);
        this.nextButton.endFill();
        this.nextButton.alpha = 1;
        if (Language.FRENCH)
            this.nextTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 280, "Suivant", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        else
            this.nextTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 280, "Next", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.nextTxt.anchor.set(0.5, 0.5);
        this.nextButton.inputEnabled = true;
        this.nextButton.events.onInputDown.add(this.closeScreen, this);
        this.nextButton.input.useHandCursor = true;
        SimpleGame.myGame.scale.onSizeChange.add(this.recreate, this);
        SimpleGame.myGame.scale.onOrientationChange.add(this.recreate, this);
    }
    TutorialPrompt1.prototype.recreate = function (arg0, recreate, arg2) {
        this.remove();
        SimpleGame.myGame.time.events.add(500, function () {
            if (TutorialPrompt1.onScreen == false) {
                var utorialPrompt = new TutorialPrompt1();
            }
        });
    };
    TutorialPrompt1.prototype.remove = function () {
        this.myGroup.destroy();
        this.myBgBlackGroup.destroy();
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
        TutorialPrompt1.onScreen = false;
    };
    TutorialPrompt1.prototype.closeScreen = function (closeScreen, arg1) {
        SoundManager.playClick();
        this.remove();
        GameContext.commercialBreak()
    };
    TutorialPrompt1.onScreen = false;
    TutorialPrompt1.tutorialShown = false;
    return TutorialPrompt1;
}());
var WatchAdPrompt = /** @class */ (function () {
    function WatchAdPrompt() {
        var _this = this;
        console.log("watch ad prompt: " + WatchAdPrompt.onScreen);
        if (WatchAdPrompt.onScreen)
            return;
        WatchAdPrompt.onScreen = true;
        console.log("construct watch ad prompt");
        this.myBgBlackGroup = SimpleGame.myGame.add.group();
        this.myGroup = SimpleGame.myGame.add.group();
        this.myGroup.y;
        this.blackbg = SimpleGame.myGame.make.graphics(0, 0);
        this.blackbg.beginFill(0x000000);
        this.blackbg.drawRect(0, 0, SimpleGame.myGame.width, SimpleGame.myGame.height);
        this.blackbg.endFill();
        this.blackbg.alpha = 0.4;
        this.blackbg.inputEnabled = true;
        this.myBgBlackGroup.add(this.blackbg);
        this.myIconBgZero = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBgZero.beginFill(0x000000);
        this.myIconBgZero.drawRect(-10 * WatchAdPrompt.WIDTH_FIXED / 2, -10 * WatchAdPrompt.HEIGHT_FIXED / 2, 20 * WatchAdPrompt.WIDTH_FIXED, 20 * WatchAdPrompt.HEIGHT_FIXED);
        this.myIconBgZero.endFill();
        this.myIconBgZero.alpha = 0.1;
        this.myIconBgZero.inputEnabled = true;
        this.myIconBg = SimpleGame.myGame.add.graphics(0, 0, this.myGroup);
        this.myIconBg.beginFill(0x000000);
        this.myIconBg.drawRoundedRect(-WatchAdPrompt.WIDTH_FIXED / 2, -WatchAdPrompt.HEIGHT_FIXED / 2, WatchAdPrompt.WIDTH_FIXED, WatchAdPrompt.HEIGHT_FIXED, 10);
        this.myIconBg.endFill();
        this.myIconBg.alpha = 1;
        var scale = Math.min(0.9 * WatchAdPrompt.WIDTH_FIXED / ResizeManager.deviceWidth, 0.9 * WatchAdPrompt.HEIGHT_FIXED / ResizeManager.deviceHeight);
        var scale = Math.min(0.5 * ResizeManager.deviceWidth / WatchAdPrompt.WIDTH_FIXED, 0.5 * ResizeManager.deviceHeight / WatchAdPrompt.HEIGHT_FIXED);
        this.myGroup.scale.set(scale, scale);
        this.myGroup.x = ResizeManager.deviceWidth / 2;
        this.myGroup.y = ResizeManager.deviceHeight * 0.45;
        if(Language.FRENCH)
            this.tutorialTxt = SimpleGame.myGame.add.text(0, WatchAdPrompt.HEIGHT_FIXED / 2 - 260, "Regarder l'annonce pour obtenir la baguette magique?", { font: "24px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        else
            this.tutorialTxt = SimpleGame.myGame.add.text(0, WatchAdPrompt.HEIGHT_FIXED / 2 - 260, "Watch Ad to get Magic Wand powerup?", { font: "24px Overpass", fill: "#ffffff", fontWeight: "500", align: "Center" }, this.myGroup);
        this.tutorialTxt.anchor.set(0.5, 0.5);
        this.tutorialTxt.wordWrap = true;
        this.tutorialTxt.wordWrapWidth = 300;
        var butW = 120;
        var butH = 50;
        this.nextButton = SimpleGame.myGame.add.graphics(0, WatchAdPrompt.HEIGHT_FIXED / 2 - 162, this.myGroup);
        this.nextButton.beginFill(0x333333);
        this.nextButton.drawRoundedRect(-butW * 0.5, -butH * 0.5, butW, butH, 5);
        this.nextButton.endFill();
        this.nextButton.alpha = 1;
        if (Language.FRENCH)
            this.nextTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 160, "Oui", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        else
            this.nextTxt = SimpleGame.myGame.add.text(0, SettingsPrompt.HEIGHT_FIXED / 2 - 160, "Yes", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.nextTxt.anchor.set(0.5, 0.5);
        this.nextButton.inputEnabled = true;
        this.nextButton.events.onInputUp.add(this.yesClicked, this);
        this.nextButton.events.onInputDown.add(function () {
            GameContext.gameplayStopped();
            console.log("magic wand called");
            // SoundManager.music.stop()
            PokiSDK.rewardedBreak().then(function (success) {
                console.log("rewarded break finished");
                GameContext.gameplayStarted();
                if (success) {
                    console.log("do magic wand");
                    // SoundManager.music.loopFull()
                    SimpleGame.myGame.time.events.add(100, function () {
                        BoardManager.magicWand();
                    }, _this);
                }
                else {
                    console.log("video not displayed");
                    // SoundManager.music.loopFull()
                    // video not displayed, should probably not give reward
                }
            });
            _this.remove();
        });
        this.nextButton.input.useHandCursor = true;
        this.nextButton.visible = false;
        this.nextTxt.visible = false;
        var butW = 120;
        var butH = 50;
        this.noButton = SimpleGame.myGame.add.graphics(0, WatchAdPrompt.HEIGHT_FIXED / 2 - 82, this.myGroup);
        this.noButton.beginFill(0x333333);
        this.noButton.drawRoundedRect(-butW * 0.5, -butH * 0.5, butW, butH, 5);
        this.noButton.endFill();
        this.noButton.alpha = 1;
        if(Language.FRENCH)
            this.noTxt = SimpleGame.myGame.add.text(0, WatchAdPrompt.HEIGHT_FIXED / 2 - 80, "Non", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        else
            this.noTxt = SimpleGame.myGame.add.text(0, WatchAdPrompt.HEIGHT_FIXED / 2 - 80, "No", { font: "30px Overpass", fill: "#ffffff", fontWeight: "500", align: "Right" }, this.myGroup);
        this.noTxt.anchor.set(0.5, 0.5);
        this.noButton.inputEnabled = true;
        this.noButton.events.onInputDown.add(this.noClicked, this);
        this.noButton.input.useHandCursor = true;
        this.noButton.visible = false;
        this.noTxt.visible = false;
        SimpleGame.myGame.time.events.add(500, function () {
            this.nextButton.visible = true;
            this.nextTxt.visible = true;
            this.noButton.visible = true;
            this.noTxt.visible = true;
        }, this);
        SimpleGame.myGame.scale.onSizeChange.add(this.recreate, this);
        SimpleGame.myGame.scale.onOrientationChange.add(this.recreate, this);
    }
    WatchAdPrompt.display = function () {
        console.log("display ad");
        var wad = new WatchAdPrompt();
    };
    WatchAdPrompt.prototype.yesClicked = function () {
        console.log("yes clicked");
         SimpleGame.myGame.time.events.add(1000, () => {
             GameContext.magicWand()
         })
         SoundManager.playClick()
         SimpleGame.myGame.time.events.add(500, () => {
             this.remove()
         })
         GameContext.commercialBreak()
    };
    WatchAdPrompt.prototype.noClicked = function () {
         GameContext.magicWand()
        SoundManager.playClick();
        this.remove();
         GameContext.commercialBreak()
    };
    WatchAdPrompt.prototype.recreate = function (arg0, recreate, arg2) {
        console.log("recreate called");
        this.remove();
        SimpleGame.myGame.time.events.add(500, function () {
            if (WatchAdPrompt.onScreen == false) {
                var utorialPrompt = new WatchAdPrompt();
            }
        });
    };
    WatchAdPrompt.prototype.remove = function () {
        console.log("remove called");
        this.myGroup.destroy();
        this.myBgBlackGroup.destroy();
        SimpleGame.myGame.scale.onSizeChange.removeAll();
        SimpleGame.myGame.scale.onOrientationChange.removeAll();
        WatchAdPrompt.onScreen = false;
    };
    WatchAdPrompt.prototype.closeScreen = function (closeScreen, arg1) {
        SoundManager.playClick();
        this.remove();
        GameContext.commercialBreak()
        SimpleGame.myGame.time.events.add(500, BoardManager.showTutorial1, this);
    };
    WatchAdPrompt.WIDTH_FIXED = 720 / 2;
    WatchAdPrompt.HEIGHT_FIXED = 720 / 2;
    WatchAdPrompt.onScreen = false;
    return WatchAdPrompt;
}());
var ButtonTextOnly = /** @class */ (function () {
    function ButtonTextOnly(parent, x, y, width, height, text, onClickFunction) {
        if (onClickFunction === void 0) { onClickFunction = function () {
        }; }
        this.disabled = false;
        this.isVisible = true;
        this.parent = parent;
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.onClickFunction = onClickFunction;
        this.buttonText = SimpleGame.myGame.make.text(x, y, this.text, {
            font: "14px Arial", fill: "#000000", fontWeight: "400", align: "Right"
        });
        this.buttonText.inputEnabled = true;
        this.buttonText.anchor.set(0, 0.5);
        this.underline = SimpleGame.myGame.make.graphics(this.buttonText.left, this.buttonText.bottom - 5);
        // Specify the line (size, color)
        this.underline.lineStyle(2, 0x000000);
        // Location to start drawing the line (x, y)
        this.underline.moveTo(0, 0);
        // Draw a line the width of objectText's string
        this.underline.lineTo(this.buttonText.width, 0);
        this.buttonText.events.onInputDown.add(this.executeOnClickFunction, this);
        this.buttonText.events.onInputOver.add(this.addUnderline, this);
        this.buttonText.events.onInputOut.add(this.removeUnderline, this);
        this.buttonText.input.useHandCursor = true;
        this.underline.visible = false;
        parent.add(this.underline);
        parent.add(this.buttonText);
    }
    ButtonTextOnly.prototype.executeOnClickFunction = function () {
        if (this.disabled)
            return;
        if (this.isVisible == false)
            return;
        this.onClickFunction();
        SimpleGame.myGame.input.reset();
        // this.buttonText.inputEnabled = true;
        //     SimpleGame.myGame.time.events.add(10, function()
        // {
        //     if (this.buttonText==null) return ;
        //     this.buttonText.events.onInputDown.add(this.executeOnClickFunction, this)
        //     this.buttonText.events.onInputOver.add(this.addUnderline,this)
        //     this.buttonText.events.onInputOut.add(this.removeUnderline,this)
        //     this.buttonText.input.useHandCursor  = true; 
        // })
    };
    ButtonTextOnly.prototype.addUnderline = function () {
        if (this.disabled)
            return;
        if (SimpleGame.myGame.device.touch)
            return;
        this.underline.visible = true;
    };
    ButtonTextOnly.prototype.removeUnderline = function () {
        this.underline.visible = false;
    };
    ButtonTextOnly.prototype.disable = function () {
        this.disabled = true;
        this.removeUnderline();
        this.buttonText.addColor("#87888b", 0);
    };
    ButtonTextOnly.prototype.enable = function () {
        this.disabled = false;
        this.buttonText.addColor("#000000", 0);
    };
    ButtonTextOnly.prototype.goInvisible = function () {
        this.parent.remove(this.underline);
        this.parent.remove(this.buttonText);
        this.isVisible = false;
        // this.underline.y = -1000;
        // this.buttonText.y = -1000;
        // this.parent.removeAll()
        // this.underline.visible = false;
        // this.buttonText.visible = false;
    };
    ButtonTextOnly.prototype.goVisible = function () {
        this.parent.add(this.underline);
        this.parent.add(this.buttonText);
        // this.underline.y = this.y;
        SimpleGame.myGame.time.events.add(50, function () {
            this.isVisible = true;
        }, this);
        // this.buttonText.y = this.buttonText.bottom - 5
        // this.underline.visible = true;
        // this.buttonText.visible = true;
    };
    return ButtonTextOnly;
}());
var ButtonWithOverState = /** @class */ (function () {
    function ButtonWithOverState(parent, imgNormalName, imgOverName, x, y, onClickFunction) {
        if (onClickFunction === void 0) { onClickFunction = function () {
        }; }
        this.onClickExecuted = false;
        this.skipClickSound = false;
        this.skipMouseOver = false;
        this.imgnormalnamestr = imgNormalName;
        this.parent = parent;
        this.imgNormalName = imgNormalName;
        this.imgOverName = imgOverName;
        this.x = x;
        this.y = y;
        this.imgNormal = SimpleGame.myGame.make.sprite(this.x, this.y, imgNormalName);
        this.imgOver = SimpleGame.myGame.make.sprite(this.x, this.y, imgOverName);
        parent.add(this.imgNormal);
        parent.add(this.imgOver);
        this.imgNormal.inputEnabled = this.imgOver.inputEnabled = false;
        this.imgOver.inputEnabled = false;
        this.imgNormal.events.onInputOver.add(this.onButtonOver, this, 0);
        // this.imgOver.events.onInputOver.add(this.onButtonOver, this, 0)
        this.imgNormal.events.onInputUp.add(this.banInput, this, 100);
        this.imgNormal.events.onInputDown.add(this.onButtonClicked, this, 2);
        this.imgNormal.events.onInputOut.add(this.onButtonOut, this, 1);
        this.imgOver.events.onInputOut.add(this.onButtonOut, this, 1);
        // this.imgOver.events.onInputDown.add(this.onButtonClicked, this,3)
        this.imgOver.events.onInputUp.add(this.onButtonOut, this, 4);
        this.imgNormal.events.onInputDown.add(function () {
        }, this);
        this.imgOver.events.onInputDown.add(function () {
        }, this);
        this.onClickFunction = onClickFunction;
        this.imgOver.visible = false;
        this.loopEvent = SimpleGame.myGame.time.events.loop(100, this.update, this);
        this.loopEvent1 = SimpleGame.myGame.time.events.loop(10, this.update1, this);
        SimpleGame.myGame.time.events.add(150, function () {
            this.imgNormal.inputEnabled = true;
            if (GameUI.promptLayer != null) {
                if (GameUI.promptLayer.countLiving() <= 0) {
                    this.imgNormal.input.useHandCursor = true;
                }
                else {
                    this.imgNormal.input.useHandCursor = true;
                }
            }
            else {
                this.imgNormal.input.useHandCursor = true;
            }
        }, this);
        SimpleGame.myGame.input.onTap.add(function () {
            // 
        });
        this.imgNormal.events.onInputUp.add(function () {
            // 
        });
    }
    ButtonWithOverState.prototype.update = function () {
        //   
        if (this.imgNormal.input != null) {
            if (this.skipMouseOver) {
                // this.imgNormal.input.useHandCursor = false;
                this.imgOver.visible = false;
            }
            else {
                // this.imgNormal.input.useHandCursor = true;
            }
        }
        if (this.imgOver.parent) {
            if (!this.imgOver.getBounds().contains(SimpleGame.myGame.input.x, SimpleGame.myGame.input.y)) {
                // this.onButtonOut();
                // this.imgNormal.input.useHandCursor = false;
            }
            else {
                //very dirty hack
                // if (this.imgnormalnamestr == "open_menu2")
                // {
                //     this.imgNormal.input.useHandCursor = true;
                //     this.onButtonOver();
                // }
            }
        }
        else {
            SimpleGame.myGame.time.events.remove(this.loopEvent);
        }
        this.setXY(this.x, this.y);
    };
    ButtonWithOverState.prototype.update1 = function () {
        //   
        this.setXY(this.x, this.y);
    };
    ButtonWithOverState.prototype.banInput = function () {
        this.onClickExecuted = true;
        // 
        SimpleGame.myGame.time.events.add(50, function () {
            // 
            this.onClickExecuted = false;
        }, this);
    };
    ButtonWithOverState.prototype.onButtonOver = function () {
        this.imgNormal.input.useHandCursor = true;
        if (this.skipMouseOver) {
            // this.imgNormal.input.useHandCursor = false;
            return;
        }
        this.imgOver.visible = true;
        this.imgNormal.alpha = 0.00001;
        SimpleGame.myGame.canvas.style.cursor = "pointer";
        if (SimpleGame.myGame.device.touch) {
            // this.imgOver.visible = false;
        }
    };
    ButtonWithOverState.prototype.onButtonOut = function () {
        if (this.imgnormalnamestr == "open_menu2") {
            // 
        }
        this.imgOver.visible = false;
        this.imgNormal.alpha = 1;
        // this.imgNormal.input.useHandCursor = false;
    };
    ButtonWithOverState.prototype.onButtonClicked = function (evt) {
        //   
        //  var delay = Consts.DELAY_BETWEEN_EVENTS_DESKTOP;
        //  if (SimpleGame.myGame.device.touch)
        //  {
        //     delay = Consts.DELAY_BETWEEN_EVENTS_TOUCH;
        //  }
        // this.imgNormal.input.useHandCursor = false;
        if (this.onClickExecuted == false) {
            this.onClickExecuted = true;
            // 
            SimpleGame.myGame.time.events.add(60, function () {
                // 
                this.onClickExecuted = false;
            }, this);
            this.onClickFunction();
            //  if (this.skipClickSound == false)
            SoundManager.playClick();
        }
        else {
            //  
        }
        SimpleGame.myGame.input.enabled = false;
        SimpleGame.myGame.time.events.add(60, function () {
            SimpleGame.myGame.input.enabled = true;
            SimpleGame.myGame.input.reset();
        });
    };
    ButtonWithOverState.prototype.setXY = function (x, y) {
        this.imgNormal.x = x;
        this.imgOver.x = x;
        this.x = x;
        this.imgNormal.y = y;
        this.imgOver.y = y;
        this.y = y;
    };
    return ButtonWithOverState;
}());
var ButtonWithOverAndText = /** @class */ (function (_super) {
    __extends(ButtonWithOverAndText, _super);
    function ButtonWithOverAndText(text, parent, imgNormalName, imgOverName, x, y, onClickFunction) {
        if (onClickFunction === void 0) { onClickFunction = function () {
        }; }
        var _this = _super.call(this, parent, imgNormalName, imgOverName, x, y, onClickFunction) || this;
        _this.fixedTxtCoords = false;
        _this.fixedTxtX = 0;
        _this.fixedTxtY = 0;
        _this.textY = 0;
        _this.textX = 0;
        _this.textYDelta = 0;
        _this.text = text;
        // this.text.inputEnabled = false;
        // this.text.interactive = false;
        // this.text.input.useHandCursor = true;
        parent.add(text);
        return _this;
    }
    ButtonWithOverAndText.prototype.changeParent = function (parent) {
        this.parent = parent;
        parent.add(this.imgNormal);
        parent.add(this.imgOver);
        parent.add(this.text);
    };
    ButtonWithOverAndText.prototype.setXY = function (x, y) {
        _super.prototype.setXY.call(this, x, y);
        if (this.fixedTxtCoords) {
            this.text.x = this.imgNormal.x + this.fixedTxtX;
            this.text.y = this.imgNormal.y + this.fixedTxtY;
        }
        else {
            this.text.x = this.imgNormal.x + 0.5 * (this.imgNormal.width - this.text.width);
            this.text.y = this.imgNormal.y + 0.5 * (this.imgNormal.height - 0.85 * this.text.height) + 1;
        }
        this.textX = this.text.x;
        this.textY = this.text.y + this.textYDelta;
        if (this.imgOver.visible) {
            this.text.y = this.textY;
        }
        else {
            this.text.y = this.textY;
        }
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
            this.text.y = this.textY - 2;
            // this.text.visible = false;
        }
    };
    ButtonWithOverAndText.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this.imgOver.visible) {
            this.text.y = this.textY;
            if (SimpleGame.myGame.device.macOS) {
                this.text.y = this.textY - 2;
            }
        }
        else {
            this.text.y = this.textY;
            if (SimpleGame.myGame.device.macOS) {
                this.text.y = this.textY - 2;
            }
        }
    };
    ButtonWithOverAndText.prototype.setVisible = function () {
        this.parent.add(this.imgNormal);
        this.parent.add(this.imgOver);
        this.parent.add(this.text);
    };
    ButtonWithOverAndText.prototype.setInvisible = function () {
        this.parent.remove(this.imgNormal);
        this.parent.remove(this.imgOver);
        this.parent.remove(this.text);
    };
    return ButtonWithOverAndText;
}(ButtonWithOverState));
var UndoBut = /** @class */ (function (_super) {
    __extends(UndoBut, _super);
    function UndoBut(text, parent, imgNormalName, imgOverName, x, y, onClickFunction, secondaryTextColor, imdDisabledName) {
        if (onClickFunction === void 0) { onClickFunction = function () {
        }; }
        if (secondaryTextColor === void 0) { secondaryTextColor = "#d15d10"; }
        if (imdDisabledName === void 0) { imdDisabledName = "button_undo_no_undo"; }
        var _this = _super.call(this, text, parent, imgNormalName, imgOverName, x, y, onClickFunction) || this;
        _this.primaryTextColor = _this.text.colors[0];
        _this.secondaryTextColor = secondaryTextColor;
        _this.imgDisabled = SimpleGame.myGame.make.sprite(_this.x, _this.y, imdDisabledName);
        // this.imgDisabled.anchor.set(0.5)
        parent.add(_this.imgDisabled);
        _this.imgDisabled.inputEnabled = false;
        parent.add(text);
        return _this;
        // this.disable();
        // this.enable()
    }
    UndoBut.prototype.disable = function () {
        this.parent.remove(this.imgNormal);
        this.parent.remove(this.imgOver);
        this.text.addColor(this.secondaryTextColor, 0);
        this.parent.add(this.imgDisabled);
        this.parent.addChild(this.text);
    };
    UndoBut.prototype.enable = function () {
        this.parent.add(this.imgNormal);
        this.parent.add(this.imgOver);
        this.text.addColor(this.primaryTextColor, 0);
        this.parent.remove(this.imgDisabled);
        this.parent.addChild(this.text);
    };
    UndoBut.prototype.setVisible = function () {
        this.parent.add(this.imgNormal);
        this.parent.add(this.imgOver);
        this.parent.add(this.imgDisabled);
        this.parent.add(this.text);
    };
    UndoBut.prototype.setInvisible = function () {
        this.parent.remove(this.imgNormal);
        this.parent.remove(this.imgOver);
        this.parent.remove(this.imgDisabled);
        this.parent.remove(this.text);
    };
    UndoBut.prototype.changeParent = function (parent) {
        this.parent = parent;
        parent.add(this.imgNormal);
        parent.add(this.imgOver);
        parent.add(this.imgDisabled);
        parent.add(this.text);
    };
    UndoBut.prototype.setXY = function (x, y) {
        _super.prototype.setXY.call(this, x, y);
        this.imgDisabled.x = this.imgNormal.x;
        this.imgDisabled.y = this.imgNormal.y;
    };
    return UndoBut;
}(ButtonWithOverAndText));
var CheckboxControl = /** @class */ (function () {
    function CheckboxControl(parent, uncheckedImageName, checkedImageName, x, y) {
        this.isChecked = false;
        this.x = x;
        this.y = y;
        var uncheckedImage = SimpleGame.myGame.make.sprite(x, y, uncheckedImageName);
        parent.add(uncheckedImage);
        uncheckedImage.inputEnabled = true;
        uncheckedImage.events.onInputDown.add(this.switchState, this);
        var checkedImage = SimpleGame.myGame.make.sprite(x, y, checkedImageName);
        parent.add(checkedImage);
        checkedImage.inputEnabled = true;
        checkedImage.events.onInputDown.add(this.switchState, this);
        this.uncheckedImage = uncheckedImage;
        this.checkedImage = checkedImage;
        this.update();
    }
    CheckboxControl.prototype.update = function () {
        if (this.isChecked) {
            this.uncheckedImage.visible = false;
            this.checkedImage.visible = true;
        }
        else {
            this.uncheckedImage.visible = true;
            this.checkedImage.visible = false;
        }
    };
    CheckboxControl.prototype.switchState = function () {
        this.isChecked = !this.isChecked;
        this.update();
    };
    return CheckboxControl;
}());
var FrameSequence = /** @class */ (function () {
    function FrameSequence(frameNameArr, x, y, frameRate, atlasName, parent) {
        if (atlasName === void 0) { atlasName = null; }
        if (parent === void 0) { parent = null; }
        this.playonceflag = false;
        this.paused = false;
        this.curIdx = 0;
        this.angle = 0;
        this.visible = true;
        this.frameArr = new Array();
        this.x = x;
        this.y = y;
        this.scale = new Phaser.Point(1, 1);
        var i = frameNameArr.length;
        while (i-- > 0) {
            if (atlasName == null) {
                this.frameArr[i] = SimpleGame.myGame.add.sprite(x, y, frameNameArr[i]);
            }
            else {
                this.frameArr[i] = SimpleGame.myGame.add.sprite(x, y, atlasName, frameNameArr[i]);
            }
            this.frameArr[i].anchor.set(0.5, 0.5);
            SimpleGame.myGame.physics.enable(this.frameArr[i]);
            if (parent != null) {
                parent.add(this.frameArr[i]);
            }
        }
        this.frameArr[0].visible = true;
        this.curSpr = this.frameArr[0];
        SimpleGame.myGame.time.events.loop(Math.ceil(1000 / frameRate), this.update, this);
        SimpleGame.myGame.time.events.loop(10, this.updateFast, this);
    }
    FrameSequence.prototype.playonceonly = function () {
        this.playonceflag = true;
    };
    FrameSequence.prototype.updateFast = function () {
        if (this.curSpr != null) {
            this.curSpr.x = this.x;
            this.curSpr.y = this.y;
            // this.curSpr.angle = this.angle;
            this.curSpr.angle = this.angle;
            this.curSpr.scale.x = this.scale.x;
            this.curSpr.scale.y = this.scale.y;
        }
    };
    FrameSequence.prototype.putOnTop = function () {
        var i = this.frameArr.length;
        while (i-- > 0) {
            this.frameArr[i].bringToTop();
        }
    };
    FrameSequence.prototype.update = function () {
        // 
        var i = this.frameArr.length;
        while (i-- > 0) {
            this.frameArr[i].x = this.x;
            this.frameArr[i].y = this.y;
        }
        if (this.paused)
            return;
        var i = this.frameArr.length;
        while (i-- > 0) {
            this.frameArr[i].visible = false;
        }
        var realidx = this.curIdx++ % this.frameArr.length;
        if (this.visible) {
            this.frameArr[realidx].visible = true;
        }
        this.frameArr[realidx].x = this.x;
        this.frameArr[realidx].y = this.y;
        this.curSpr = this.frameArr[realidx];
        if (this.curIdx > 0 && this.curIdx % this.frameArr.length == 0 && this.loopFunction != null) {
            this.loopFunction();
        }
        this.updateFast();
        if (this.playonceflag) {
            if (this.curIdx >= this.frameArr.length) {
                this.remove();
            }
        }
        if (this.visible == false) {
            // 
            var i = this.frameArr.length;
            while (i-- > 0) {
                this.frameArr[i].visible = false;
            }
        }
    };
    FrameSequence.prototype.pause = function () {
        this.paused = true;
    };
    FrameSequence.prototype.start = function () {
        this.paused = false;
    };
    FrameSequence.prototype.remove = function () {
        var i = this.frameArr.length;
        while (i-- > 0) {
            var spr = this.frameArr[i];
            spr.destroy();
        }
    };
    return FrameSequence;
}());
var Util = /** @class */ (function () {
    function Util() {
    }
    Util.convertToHHMMSS = function (seconds) {
        var s = seconds % 60;
        var m = Math.floor((seconds % 3600) / 60);
        var h = Math.floor(seconds / (60 * 60));
        //var hourStr:String = (h == 0) ? "" : doubleDigitFormat(h) + ":";
        var hourStr = (false) ? "" : Util.doubleDigitFormat(h) + ":";
        var minuteStr = Util.doubleDigitFormat(m) + ":";
        var secondsStr = Util.doubleDigitFormat(s);
        return hourStr + minuteStr + secondsStr;
    };
    Util.convertToMMSS = function (seconds) {
        var s = seconds % 60;
        var m = Math.floor((seconds) / 60);
        var h = Math.floor(seconds / (60 * 60));
        //var hourStr:String = (h == 0) ? "" : doubleDigitFormat(h) + ":";
        var hourStr = (false) ? "" : Util.doubleDigitFormat(h) + ":";
        var minuteStr = Util.doubleDigitFormat(m) + ":";
        var secondsStr = Util.doubleDigitFormat(s);
        return minuteStr + secondsStr;
    };
    Util.doubleDigitFormat = function (num) {
        if (num < 10) {
            return ("0" + num);
        }
        return "" + num;
    };
    Util.getStorage = function (s, defaultRetValue) {
        if (defaultRetValue === void 0) { defaultRetValue = 0; }
        var storageData = 0;
        try {
            storageData = parseInt(window.localStorage.getItem(s));
        }
        catch (error) {
            return 0;
        }
        if (isNaN(storageData)) {
            storageData = 0;
            try {
                window.localStorage.setItem(s, defaultRetValue.toString());
            }
            catch (error) {
                return 0;
            }
        }
        return storageData;
    };
    Util.getStoragePerDifficulty = function (s, defaultRetValue) {
        if (defaultRetValue === void 0) { defaultRetValue = 0; }
        var totalString = "121" + s + CardUtil.NUM_SUIT_COLORS;
        return this.getStorage(totalString, defaultRetValue);
    };
    Util.setStorage = function (s, val) {
        try {
            window.localStorage.setItem(s, val.toString());
        }
        catch (error) {
        }
    };
    Util.setStoragePerDifficulty = function (s, val) {
        var totalString = "121" + s + CardUtil.NUM_SUIT_COLORS;
        this.setStorage(totalString, val);
    };
    Util.clearStorage = function (s, defaultVal) {
        if (defaultVal === void 0) { defaultVal = 0; }
    };
    Util.clearStoragePerDifficulty = function () {
        Util.setStoragePerDifficulty("cumulativeScore", 0);
        Util.setStoragePerDifficulty("cumulativeTime", 0);
        Util.setStoragePerDifficulty("cumulativeMoves", 0);
        Util.setStoragePerDifficulty("gamesPlayed", 0);
        Util.setStoragePerDifficulty("bestScore1", 0);
        Util.setStoragePerDifficulty("gamesWon", 0);
        Util.setStoragePerDifficulty("bestTime", 0);
        Util.setStoragePerDifficulty("leastMoves", 0);
    };
    Util.fixedDigitCount = function (digits, number) {
        var digitCount = number.toString().length;
        var deltaCount = digits - digitCount;
        var retStr = "";
        while (deltaCount-- > 0) {
            retStr += "0";
        }
        retStr += number.toString();
        return retStr;
    };
    return Util;
}());
var Utils;
(function (Utils) {
    var ScreenMetrics = /** @class */ (function () {
        function ScreenMetrics() {
        }
        return ScreenMetrics;
    }());
    Utils.ScreenMetrics = ScreenMetrics;
    var Orientation;
    (function (Orientation) {
        Orientation[Orientation["PORTRAIT"] = 0] = "PORTRAIT";
        Orientation[Orientation["LANDSCAPE"] = 1] = "LANDSCAPE";
    })(Orientation = Utils.Orientation || (Utils.Orientation = {}));
    ;
    var ScreenUtils = /** @class */ (function () {
        function ScreenUtils() {
        }
        // -------------------------------------------------------------------------
        ScreenUtils.calculateScreenMetrics = function (aDefaultWidth, aDefaultHeight, aOrientation, aMaxGameWidth, aMaxGameHeight) {
            if (aOrientation === void 0) { aOrientation = Orientation.LANDSCAPE; }
            // get dimension of window
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            // swap if window dimensions do not match orientation
            if ((windowWidth < windowHeight && aOrientation === Orientation.LANDSCAPE) ||
                (windowHeight < windowWidth && aOrientation === Orientation.PORTRAIT)) {
                var tmp = windowWidth;
                windowWidth = windowHeight;
                windowHeight = tmp;
            }
            // calculate max game dimension. The bounds are iPad and iPhone 
            if (typeof aMaxGameWidth === "undefined" || typeof aMaxGameHeight === "undefined") {
                if (aOrientation === Orientation.LANDSCAPE) {
                    aMaxGameWidth = Math.round(aDefaultWidth * 1420 / 1280);
                    aMaxGameHeight = Math.round(aDefaultHeight * 960 / 800);
                }
                else {
                    aMaxGameWidth = Math.round(aDefaultWidth * 960 / 800);
                    aMaxGameHeight = Math.round(aDefaultHeight * 1420 / 1280);
                }
            }
            // default aspect and current window aspect
            var defaultAspect = (aOrientation === Orientation.LANDSCAPE) ? 1280 / 800 : 800 / 1280;
            var windowAspect = windowWidth / windowHeight;
            var offsetX = 0;
            var offsetY = 0;
            var gameWidth = 0;
            var gameHeight = 0;
            // if (aOrientation === Orientation.LANDSCAPE) {
            // "iPhone" landscape ... and "iPad" portrait
            if (windowAspect > defaultAspect) {
                gameHeight = aDefaultHeight;
                gameWidth = Math.ceil((gameHeight * windowAspect) / 2.0) * 2;
                gameWidth = Math.min(gameWidth, aMaxGameWidth);
                offsetX = (gameWidth - aDefaultWidth) / 2;
                offsetY = 0;
            }
            else { // "iPad" landscpae ... and "iPhone" portrait
                gameWidth = aDefaultWidth;
                gameHeight = Math.ceil((gameWidth / windowAspect) / 2.0) * 2;
                gameHeight = Math.min(gameHeight, aMaxGameHeight);
                offsetX = 0;
                offsetY = (gameHeight - aDefaultHeight) / 2;
            }
            /* } else {    // "iPhone" portrait
                if (windowAspect < defaultAspect) {
                    gameWidth = aDefaultWidth;
                    gameHeight = gameWidth / windowAspect;
                    gameHeight = Math.min(gameHeight, aMaxGameHeight);
                    offsetX = 0;
                    offsetY = (gameHeight - aDefaultHeight) / 2;
                } else {    // "iPad" portrait
                    gameHeight = aDefaultHeight;
                    gameWidth = gameHeight = windowAspect;
                    gameWidth = Math.min(gameWidth, aMaxGameWidth);
                    offsetX = (gameWidth - aDefaultWidth) / 2;
                    offsetY = 0;
                }
            }
            */
            // calculate scale
            var scaleX = windowWidth / gameWidth;
            var scaleY = windowHeight / gameHeight;
            // store values
            this.screenMetrics = new ScreenMetrics();
            this.screenMetrics.windowWidth = windowWidth;
            this.screenMetrics.windowHeight = windowHeight;
            this.screenMetrics.defaultGameWidth = aDefaultWidth;
            this.screenMetrics.defaultGameHeight = aDefaultHeight;
            this.screenMetrics.maxGameWidth = aMaxGameWidth;
            this.screenMetrics.maxGameHeight = aMaxGameHeight;
            this.screenMetrics.gameWidth = gameWidth;
            this.screenMetrics.gameHeight = gameHeight;
            this.screenMetrics.scaleX = scaleX;
            this.screenMetrics.scaleY = scaleY;
            this.screenMetrics.offsetX = offsetX;
            this.screenMetrics.offsetY = offsetY;
            return this.screenMetrics;
        };
        return ScreenUtils;
    }());
    Utils.ScreenUtils = ScreenUtils;
})(Utils || (Utils = {}));
