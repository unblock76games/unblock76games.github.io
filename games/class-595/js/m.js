var MainGame = {
    Config: {
        ORIENTATION: "portrait",
        DEFAULT_WIDTH: 0,
        DEFAULT_HEIGHT: 0,
        MAX_WIDTH: 0,
        MAX_HEIGHT: 0
    },
    version: "v1.04",
    isDebug: false,
    showDebugCircle: false,
    isAPI: true,
    isApiBreakTime: false,
    isApiGameplayStop: false,
    isDesktop: true,
    title: "mergecuber_v1.0",
    languages: ["EN", "IT", "ES", "PT", "TR", "BR", "RU", "FR", "DE", "AR"],
    languagesN: ["00", "01", "02", "03", "04", "06", "07", "08", "05", "10"],
    language: 0,
    GAME_TEXT: null,
    TEXT_FILE: null,
    showFPS: false,
    firstLoad: true,
    firstGo: true,
    isNoSave: false,
    isFromFireMode: false,
    isFromTutorial: false,
    reward_wheel: null,
    amount_diamonds: null,
    amount_coins: null,
    exp: null,
    nextCarLevel: null,
    currentLevel: null,
    LIMIT_parking: null,
    LIMIT_pilots: null,
    box_have: null,
    arDeltaCarLevel: null,
    lastSession: null,
    selectedGun: 1,
    selectedHat: 0,
    fireLevel: 1,
    freeTimeWheel: 0,
    cdNextFree: 0,
    maxTimeWheel: 3,
    TIME_BANNER: 10,
    lastDataBanner: null,
    debug_isFreeUpgrade: false,
    debug_typeGun: 1,
    initSettings: function() {
        MainGame.Config.DEFAULT_WIDTH = config.scale.width;
        MainGame.Config.DEFAULT_HEIGHT = config.scale.height;
        MainGame.Config.MAX_WIDTH = config.scale.max.width;
        MainGame.Config.MAX_HEIGHT = config.scale.max.height;
        MainGame.isDesktop = game.device.os.desktop;
        if (!MainGame.isDesktop) {
            MainGame.Config.DEFAULT_WIDTH = 640;
            MainGame.Config.DEFAULT_HEIGHT = 960;
            MainGame.Config.MAX_WIDTH = 1e3;
            MainGame.Config.MAX_HEIGHT = 1400
        }
        MainGame.loadSaves();
        if (game.device.os.desktop) {
            game.canvas.oncontextmenu = function(e) {
                e.preventDefault()
            };
            window.addEventListener("keydown", (function(e) {
                if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                    e.preventDefault()
                }
            }), false);
            window.addEventListener("wheel", e => e.preventDefault(), {
                passive: false
            })
        }
        if (MainGame.isAPI) {
            MainGame.API_POKI = game.plugins.get("PokiApiPlugin");
            if (!MainGame.isDebug) MainGame.api_check();
            MainGame.API_POKI.initAPI(MainGame.api_GamePause, MainGame.api_GameContinue)
        }
    },
    api_google: function(vValue, vLevel) {
        if (vLevel) {
            console.log("api_google", vValue, vLevel)
        } else {
            console.log("api_google", vValue)
        }
        return;
        switch (vValue) {
            case "MaxLevelCar":
                gtag("event", "GameEvent", {
                    event_category: "SendStats",
                    event_label: "MaxLevelCar_" + vLevel,
                    value: vLevel
                });
                break
        }
    },
    api_GamePause: function() {
        MainGame.isApiBreakTime = true;
        game.sound.mute = true
    },
    api_GameContinue: function(withReward) {
        MainGame.isApiBreakTime = false;
        game.sound.mute = false;
        if (withReward && (MainGame.selectedReward == "freeCar" || MainGame.selectedReward == "reward_wheel")) {} else {
            if (MainGame.isApiGameplayStop) {
                MainGame.API_POKI.gameplayStart();
                MainGame.isApiGameplayStop = false
            }
        }
    },
    setReward: function() {
        MainGame.selectedReward = 1
    },
    getReward: function(withReward) {
        if (withReward) {
            MainGame.state.getRewards(MainGame.selectedReward)
        } else {
            MainGame.state.showSystemMessage("Ads no ready, try later!")
        }
    },
    clickReward: function(vReward) {
        MainGame.selectedReward = vReward;
        if (MainGame.isAPI) {
            MainGame.API_POKI.rewardedBreak()
        } else {
            if (MainGame.isDebug) MainGame.getReward(true)
        }
    },
    api_check: function() {
      /*  var _0x1918 = ["top", "indexOf", "aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw==", "hostname", "length", "location", "LnBva2ktZ2RuLmNvbQ==", "href"];
        (function(_0x4a02b5, _0x5c0c3d) {
            var _0x56a85d = function(_0x375c0e) {
                while (--_0x375c0e) {
                    _0x4a02b5["push"](_0x4a02b5["shift"]())
                }
            };
            _0x56a85d(++_0x5c0c3d)
        })(_0x1918, 430);
        var _0xcdc9 = function(_0x4a02b5, _0x5c0c3d) {
            _0x4a02b5 = _0x4a02b5 - 0;
            var _0x56a85d = _0x1918[_0x4a02b5];
            return _0x56a85d
        };
        (function checkInit() {
            var _0x151adb = ["bG9jYWxob3N0", "LnBva2kuY29t", _0xcdc9("0x0")];
            var _0x219654 = ![];
            var _0x558823 = window[_0xcdc9("0x7")][_0xcdc9("0x5")];
            for (var _0x220888 = 0; _0x220888 < _0x151adb[_0xcdc9("0x6")]; _0x220888++) {
                var _0x4a2f49 = atob(_0x151adb[_0x220888]);
                if (_0x558823[_0xcdc9("0x3")](_0x4a2f49, _0x558823["length"] - _0x4a2f49["length"]) !== -1) {
                    _0x219654 = !![];
                    break
                }
            }
            if (!_0x219654) {
                var _0xcff8e8 = _0xcdc9("0x4");
                var _0x3296f7 = atob(_0xcff8e8);
                window["location"][_0xcdc9("0x1")] = _0x3296f7;
                this[_0xcdc9("0x2")][_0xcdc9("0x7")] !== this[_0xcdc9("0x7")] && (this[_0xcdc9("0x2")][_0xcdc9("0x7")] = this[_0xcdc9("0x7")])
            }
        })()

        */
    },
    addText: function(vLink, vLayer, vX, vY, vText, vSize, vIsUpperCase) {
        if (vText && vIsUpperCase) vText = vText.toUpperCase();
        var txt = vLink.add.bitmapText(vX, vY, "NEXTART", vText);
        txt.setFontSize(vSize);
        txt.setOrigin(.5);
        if (vLayer) vLayer.add(txt);
        return txt
    },
    updateTextWidth: function(vText, vMaxWidth) {
        var scale = 1;
        vText.setScale(scale);
        var txtWidth = vText.width;
        if (txtWidth > vMaxWidth) {
            scale = vMaxWidth / txtWidth;
            vText.setScale(scale)
        }
        return scale
    },
    replaceText: function(vText, vValue) {
        return vText.replace("#", vValue.toString())
    },
    convertNumberFormat: function(number) {
        var temp = number;
        var tabUnits = ["K", "M", "B", "T", "aa", "bb", "cc", "dd", "ee", "ff", "gg", "hh", "ii", "jj", "kk", "ll", "mm", "nn", "oo", "pp", "qq", "rr", "ss", "tt", "uu", "vv", "ww", "xx", "yy", "zz"];
        var highnumber = false;
        var bignumber = 1e3;
        var tabposition = -1;
        var p_atomepersecond = true;
        var unit;
        if (number >= bignumber) {
            highnumber = true;
            while (number >= bignumber) {
                bignumber *= 1e3;
                tabposition++
            }
            number /= bignumber / 1e3;
            unit = tabUnits[tabposition]
        } else unit = "";
        if (unit == undefined) return temp.toExponential(2);
        var toround = highnumber == true ? p_atomepersecond == true ? 100 : 100 : 10;
        var res = Math.round(number * toround) / toround;
        return [res.toLocaleString().replace(",", ".") + "" + unit]
    },
    loadSaves: function() {
        MainGame.amount_coins = MainGame.Storage.get(MainGame.title + "-" + "amount_coins");
        MainGame.amount_diamonds = MainGame.Storage.get(MainGame.title + "-" + "amount_diamonds");
        MainGame.exp = MainGame.Storage.get(MainGame.title + "-" + "exp");
        MainGame.nextCarLevel = MainGame.Storage.get(MainGame.title + "-" + "nextCarLevel");
        MainGame.currentLevel = MainGame.Storage.get(MainGame.title + "-" + "currentLevel");
        MainGame.LIMIT_parking = MainGame.Storage.get(MainGame.title + "-" + "LIMIT_parking");
        MainGame.LIMIT_pilots = MainGame.Storage.get(MainGame.title + "-" + "LIMIT_pilots");
        MainGame.box_have = MainGame.Storage.get(MainGame.title + "-" + "box_have");
        MainGame.arDeltaCarLevel = MainGame.Storage.get(MainGame.title + "-" + "arDeltaCarLevel");
        MainGame.lastSession = MainGame.Storage.get(MainGame.title + "-" + "lastSession");
        MainGame.cdBonusCoins = MainGame.Storage.get(MainGame.title + "-" + "cdBonusCoins");
        MainGame.cdBonusSpeed = MainGame.Storage.get(MainGame.title + "-" + "cdBonusSpeed");
        MainGame.buffer_boxes = MainGame.Storage.get(MainGame.title + "-" + "buffer_boxes");
        MainGame.freeTimeWheel = MainGame.Storage.get(MainGame.title + "-" + "freeTimeWheel");
        MainGame.cdNextFree = MainGame.Storage.get(MainGame.title + "-" + "cdNextFree");
        var language = MainGame.Storage.get(MainGame.title + "-" + "language");
        if (language != null) MainGame.language = language
    },
    saveSaves: function() {
        if (MainGame.isNoSave) return;
        MainGame.Storage.set(MainGame.title + "-" + "amount_coins", MainGame.amount_coins);
        MainGame.Storage.set(MainGame.title + "-" + "amount_diamonds", MainGame.amount_diamonds);
        MainGame.Storage.set(MainGame.title + "-" + "exp", MainGame.exp);
        MainGame.Storage.set(MainGame.title + "-" + "nextCarLevel", MainGame.nextCarLevel);
        MainGame.Storage.set(MainGame.title + "-" + "currentLevel", MainGame.currentLevel);
        MainGame.Storage.set(MainGame.title + "-" + "LIMIT_parking", MainGame.LIMIT_parking);
        MainGame.Storage.set(MainGame.title + "-" + "LIMIT_pilots", MainGame.LIMIT_pilots);
        MainGame.Storage.set(MainGame.title + "-" + "box_have", MainGame.box_have);
        MainGame.Storage.set(MainGame.title + "-" + "arDeltaCarLevel", MainGame.arDeltaCarLevel);
        MainGame.Storage.set(MainGame.title + "-" + "lastSession", MainGame.lastSession);
        MainGame.Storage.set(MainGame.title + "-" + "language", MainGame.language);
        MainGame.Storage.set(MainGame.title + "-" + "cdBonusCoins", MainGame.cdBonusCoins);
        MainGame.Storage.set(MainGame.title + "-" + "cdBonusSpeed", MainGame.cdBonusSpeed);
        MainGame.Storage.set(MainGame.title + "-" + "buffer_boxes", MainGame.buffer_boxes);
        MainGame.Storage.set(MainGame.title + "-" + "freeTimeWheel", MainGame.freeTimeWheel);
        MainGame.Storage.set(MainGame.title + "-" + "cdNextFree", MainGame.cdNextFree)
    },
    clearSaves: function() {
        MainGame.Storage.remove(MainGame.title + "-" + "amount_coins");
        MainGame.Storage.remove(MainGame.title + "-" + "amount_diamonds");
        MainGame.Storage.remove(MainGame.title + "-" + "exp");
        MainGame.Storage.remove(MainGame.title + "-" + "nextCarLevel");
        MainGame.Storage.remove(MainGame.title + "-" + "currentLevel");
        MainGame.Storage.remove(MainGame.title + "-" + "LIMIT_parking");
        MainGame.Storage.remove(MainGame.title + "-" + "LIMIT_pilots");
        MainGame.Storage.remove(MainGame.title + "-" + "box_have");
        MainGame.Storage.remove(MainGame.title + "-" + "arDeltaCarLevel");
        MainGame.Storage.remove(MainGame.title + "-" + "lastSession");
        MainGame.Storage.remove(MainGame.title + "-" + "language");
        MainGame.Storage.remove(MainGame.title + "-" + "cdBonusCoins");
        MainGame.Storage.remove(MainGame.title + "-" + "cdBonusSpeed");
        MainGame.Storage.remove(MainGame.title + "-" + "buffer_boxes");
        MainGame.Storage.remove(MainGame.title + "-" + "freeTimeWheel");
        MainGame.Storage.remove(MainGame.title + "-" + "cdNextFree");
        MainGame.isNoSave = true
    }
};
MainGame.Sfx = {
    manage: function(type, mode, game, button, label) {
        switch (mode) {
            case "init": {
                MainGame.Storage.initUnset(MainGame.title + "-" + type, true);
                MainGame.Sfx.status = MainGame.Sfx.status || [];
                MainGame.Sfx.status[type] = MainGame.Storage.get(MainGame.title + "-" + type);
                if (type == "sound") {
                    MainGame.Sfx.sounds = [];
                    MainGame.Sfx.sounds["click"] = game.sound.add("click");
                    MainGame.Sfx.sounds["fortune"] = game.sound.add("fortune2");
                    MainGame.Sfx.sounds["unlocked"] = game.sound.add("unlocked");
                    MainGame.Sfx.sounds["show_box"] = game.sound.add("show_box");
                    MainGame.Sfx.sounds["merge"] = game.sound.add("merge2");
                    MainGame.Sfx.sounds["open_box"] = game.sound.add("open_box");
                    MainGame.Sfx.sounds["buy"] = game.sound.add("buy2");
                    MainGame.Sfx.sounds["deleted"] = game.sound.add("remove_car2");
                    MainGame.Sfx.sounds["finish"] = game.sound.add("finish2");
                    MainGame.Sfx.sounds["level_up"] = game.sound.add("level_up");
                    MainGame.Sfx.sounds["offline_earning"] = game.sound.add("offline_earning");
                    MainGame.Sfx.sounds["boost"] = game.sound.add("boost");
                    MainGame.Sfx.sounds["place_car"] = game.sound.add("place_car2");
                    MainGame.Sfx.sounds["click"].volume = 1;
                    MainGame.Sfx.sounds["fortune"].volume = 2.5;
                    MainGame.Sfx.sounds["unlocked"].volume = 2.8;
                    MainGame.Sfx.sounds["show_box"].volume = 3;
                    MainGame.Sfx.sounds["merge"].volume = 2.5;
                    MainGame.Sfx.sounds["open_box"].volume = 3;
                    MainGame.Sfx.sounds["buy"].volume = 1.6;
                    MainGame.Sfx.sounds["deleted"].volume = 2.8;
                    MainGame.Sfx.sounds["finish"].volume = 3;
                    MainGame.Sfx.sounds["level_up"].volume = 1.6;
                    MainGame.Sfx.sounds["offline_earning"].volume = 3;
                    MainGame.Sfx.sounds["boost"].volume = 2;
                    MainGame.Sfx.sounds["place_car"].volume = 2
                } else {
                    MainGame.Sfx.nameMusicPlaying = -1;
                    MainGame.Sfx.musics = [];
                    MainGame.Sfx.musics["main"] = game.sound.add("music-main");
                    MainGame.Sfx.musics["turbo"] = game.sound.add("music-turbo");
                    MainGame.Sfx.musics["main"].volume = 1;
                    MainGame.Sfx.musics["turbo"].volume = 1
                }
                break
            }
            case "on": {
                MainGame.Sfx.status[type] = true;
                break
            }
            case "off": {
                MainGame.Sfx.status[type] = false;
                break
            }
            case "switch": {
                MainGame.Sfx.status[type] = !MainGame.Sfx.status[type];
                break
            }
            default: {}
        }
        MainGame.Sfx.update(type, button, label);
        if (MainGame.Sfx.sounds) {
            var statusSound = !MainGame.Sfx.status["sound"];
            for (var id in MainGame.Sfx.sounds) {
                MainGame.Sfx.sounds[id].setMute(statusSound)
            }
        }
        if (MainGame.Sfx.musics) {
            var statuMusic = !MainGame.Sfx.status["music"];
            if (MainGame.Sfx.musics["main"]) MainGame.Sfx.musics["main"].setMute(statuMusic);
            if (MainGame.Sfx.musics["turbo"]) MainGame.Sfx.musics["turbo"].setMute(statuMusic)
        }
        if (MainGame.Sfx.status) {
            MainGame.Storage.set(MainGame.title + "-" + type, MainGame.Sfx.status[type])
        }
    },
    play: function(type, audio) {
        if (type == "music") {
            if (MainGame.Sfx.nameMusicPlaying == audio) return;
            if (MainGame.Sfx.musics) {
                if (MainGame.Sfx.musics[MainGame.Sfx.nameMusicPlaying]) MainGame.Sfx.musics[MainGame.Sfx.nameMusicPlaying].stop();
                if (MainGame.Sfx.musics && MainGame.Sfx.musics[audio]) {
                    MainGame.Sfx.musics[audio].play({
                        loop: true
                    });
                    MainGame.Sfx.nameMusicPlaying = audio
                }
            }
        } else {
            if (MainGame.Sfx.sounds && MainGame.Sfx.sounds[audio]) {
                MainGame.Sfx.sounds[audio].play()
            }
        }
    },
    update: function(type, button, label) {
        if (MainGame.Sfx.status == undefined) return;
        if (button) {
            if (MainGame.Sfx.status[type]) {
                button.setFrame("btn_" + type + "_0000")
            } else {
                button.setFrame("btn_" + type + "_0001")
            }
        }
        if (label) {
            if (MainGame.Sfx.status[type]) {
                label.setText(MainGame.GAME_TEXT[type + "_on"].toUpperCase())
            } else {
                label.setText(MainGame.GAME_TEXT[type + "_off"].toUpperCase())
            }
        }
    }
};
MainGame.fadeOutIn = function(passedCallback, context) {
    context.cameras.main.fadeOut(200);
    context.time.addEvent({
        delay: 200,
        callback: function() {
            context.cameras.main.fadeIn(200);
            passedCallback(context)
        },
        callbackScope: context
    })
};
MainGame.fadeOutScene = function(sceneName, context) {
    context.cameras.main.fadeOut(200);
    context.time.addEvent({
        delay: 200,
        callback: function() {
            context.scene.start(sceneName)
        },
        callbackScope: context
    })
};
MainGame.Storage = {
    availability: function() {
        try {
            var ls = window.localStorage
        } catch (e) {
            return
        }
        if (!!(typeof window.localStorage === "undefined")) {
            console.log("localStorage not available");
            return null
        }
    },
    get: function(key) {
        try {
            var ls = window.localStorage
        } catch (e) {
            return
        }
        this.availability();
        try {
            return JSON.parse(localStorage.getItem(key))
        } catch (e) {
            return window.localStorage.getItem(key)
        }
    },
    set: function(key, value) {
        try {
            var ls = window.localStorage
        } catch (e) {
            return
        }
        this.availability();
        try {
            window.localStorage.setItem(key, JSON.stringify(value))
        } catch (e) {
            if (e == QUOTA_EXCEEDED_ERR) {
                console.log("localStorage quota exceeded")
            }
        }
    },
    initUnset: function(key, value) {
        if (this.get(key) === null) {
            this.set(key, value)
        }
    },
    getFloat: function(key) {
        return parseFloat(this.get(key))
    },
    setHighscore: function(key, value) {
        if (value > this.getFloat(key)) {
            this.set(key, value)
        }
    },
    remove: function(key) {
        this.availability();
        window.localStorage.removeItem(key)
    },
    clear: function() {
        this.availability()
    }
};
class Boot extends Phaser.Scene {
    constructor() {
        super("Boot");
        this.wasIncorrectOrientation = false
    }
    preload() {
        this.load.plugin("PokiApiPlugin", PokiApiPlugin, true);
        this.load.image("preloader_bar", "assets/preloader_bar.png?r=2");
        this.load.image("preloader_back", "assets/preloader_back.png?r=2");
        this.load.image("bg_loading", "assets/background/bg_loading.png");
        this.load.bitmapFont("NEXTART", "assets/fonts/NEXTART.png", "assets/fonts/NEXTART.fnt")
    }
    create() {
        MainGame.world = {
            width: this.cameras.main.width,
            height: this.cameras.main.height,
            centerX: this.cameras.main.centerX,
            centerY: this.cameras.main.centerY
        };
        MainGame.initSettings();
        this.scaleForMobile();
        this.scene.start("Preloader")
    }
    scaleForMobile() {
        this.wasIncorrectOrientation = true;
        window.addEventListener("resize", this.onWindowResize.bind(this));
        this.onWindowResize()
    }
    onWindowResize() {
        if (game.device.os.desktop) {} else {
            if (window.innerWidth > window.innerHeight) {
                this.checkOriention("landscape")
            } else {
                this.checkOriention("portrait")
            }
        }
        if (MainGame.state && MainGame.state.updateResize) MainGame.state.updateResize();
        this.handleScroll()
    }
    checkOriention(orientation) {
        if (orientation === MainGame.Config.ORIENTATION) {
            this.leaveIncorrectOrientation()
        } else {
            this.enterIncorrectOrientation()
        }
    }
    enterIncorrectOrientation() {
        document.getElementById("orientation").style.display = "block"
    }
    leaveIncorrectOrientation() {
        document.getElementById("orientation").style.display = "none"
    }
    isLandscape() {
        return window.innerWidth > window.innerHeight
    }
    isPortrait() {
        return window.innerHeight > window.innerWidth
    }
    handleScroll() {
        if (typeof this.scrollTimeout !== "undefined") {
            clearTimeout(this.scrollTimeout)
        }
        this.scrollTimeout = setTimeout(() => {
            window.scrollTo(0, -window.innerHeight);
            if (MainGame.state && MainGame.state.updateResize) MainGame.state.updateResize()
        }, 500)
    }
}
class Preloader extends Phaser.Scene {
    constructor() {
        super("Preloader")
    }
    preload() {
        MainGame.state = this;
        this.initResize();
        this.midX = this.GAME_WIDTH / 2;
        this.midY = this.GAME_HEIGHT / 2;
        const midX = MainGame.Config.DEFAULT_WIDTH * .5;
        var back = this.add.sprite(midX, 0, "bg_loading");
        back.setOrigin(.5, 0);
        this.back = back;
        this.preloader_back = this.add.image(midX, 590, "preloader_back");
        this.preloader_bar = this.add.image(midX, 590, "preloader_bar");
        this.preloader_crop = new Phaser.Geom.Rectangle(0, 0, 0, this.preloader_bar.height);
        this.preloader_bar.setCrop(this.preloader_crop);
        this.load.on(Phaser.Loader.Events.START, this.onLoadStart, this);
        this.load.on(Phaser.Loader.Events.PROGRESS, this.onLoadProgress, this);
        this.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
        var background_url = "bg_cybermerge.png";
        if (!MainGame.isDesktop) background_url = "bg_cybermerge2.png";
        var resources = {
            image: [
                ["bg_game", "assets/background/" + background_url]
            ],
            atlas: [
                ["ss_cars", "assets/spritesheets/ss_cars.png?r=1", "assets/spritesheets/ss_cars.json?r=" + MyMath.getRandomInt(0, 99)],
                ["ss_main", "assets/spritesheets/ss_main.png?r=1", "assets/spritesheets/ss_main.json?r=" + MyMath.getRandomInt(0, 99)]
            ],
            audio: [
                ["music-main", ["assets/audio/game.mp3"]],
                ["music-turbo", ["assets/audio/turbo.mp3"]],
                ["click", ["assets/audio/click.mp3"]],
                ["fortune2", ["assets/audio/fortune2.mp3"]],
                ["unlocked", ["assets/audio/merge_unlocked.mp3"]],
                ["show_box", ["assets/audio/show_box.mp3"]],
                ["merge2", ["assets/audio/merge_car2.mp3"]],
                ["open_box", ["assets/audio/open_box.mp3"]],
                ["buy2", ["assets/audio/buy_car2.mp3"]],
                ["remove_car2", ["assets/audio/remove_car2.mp3"]],
                ["finish2", ["assets/audio/coin_finish2.mp3"]],
                ["level_up", ["assets/audio/lvl_up.mp3"]],
                ["offline_earning", ["assets/audio/offline_earning.mp3"]],
                ["boost", ["assets/audio/boost.mp3"]],
                ["place_car2", ["assets/audio/place_car2.mp3"]]
            ],
            json: [
                ["alltext", "assets/text/text.json?r=" + MyMath.getRandomInt(0, 99)]
            ]
        };
        for (var method in resources) {
            resources[method].forEach((function(args) {
                var loader = this.load[method];
                loader && loader.apply(this.load, args)
            }), this)
        }
        this.updateResize()
    }
    onLoadProgress() {
        this.updateLogoCrop(this.load.progress)
    }
    updateLogoCrop(loadProgress) {
        var originalWidth = this.preloader_bar.width;
        var width = originalWidth * loadProgress;
        this.tweens.killTweensOf(this.preloader_crop);
        if (loadProgress == 1) {
            this.preloader_bar.isCropped = false
        } else {
            this.tweens.add({
                targets: this.preloader_crop,
                width: width,
                ease: Phaser.Math.Easing.Linear,
                duration: 200,
                onUpdate: () => {
                    this.preloader_bar.setCrop(this.preloader_crop)
                }
            })
        }
        if (MainGame.isAPI) MainGame.API_POKI.gameLoadingProgress(loadProgress)
    }
    onLoadStart() {
        if (MainGame.isAPI) MainGame.API_POKI.gameLoadingStart()
    }
    onLoadComplete() {
        this.tweens.killTweensOf(this.preloader_crop);
        this.load.off(Phaser.Loader.Events.PROGRESS, this.onLoadProgress);
        this.preloader_bar.isCropped = false;
        if (MainGame.isAPI) MainGame.API_POKI.gameLoadingFinished()
    }
    initResize() {
        this.GAME_WIDTH = MainGame.Config.DEFAULT_WIDTH;
        this.GAME_HEIGHT = MainGame.Config.DEFAULT_HEIGHT;
        var gameSize = this.scale.gameSize;
        var width = gameSize.width;
        var height = gameSize.height;
        if (window.innerHeight < MainGame.Config.MAX_HEIGHT) {
            height = window.innerHeight
        }
        this.parent = new Phaser.Structs.Size(width, height);
        this.sizer = new Phaser.Structs.Size(this.GAME_WIDTH, this.GAME_HEIGHT, Phaser.Structs.Size.FIT, this.parent);
        this.parent.setSize(width, height);
        this.sizer.setSize(width, height);
        this.scale.on("resize", this.updateResize, this)
    }
    updateResize() {
        var gameSize = this.scale.gameSize;
        var width = gameSize.width;
        var height = gameSize.height;
        if (MainGame.isDesktop && window.innerHeight < MainGame.Config.MAX_HEIGHT) {
            height = window.innerHeight
        }
        this.parent.setSize(width, height);
        this.sizer.setSize(width, height);
        this.updateCamera()
    }
    updateCamera() {
        const camera = this.cameras.main;
        var deltaX = Math.ceil(this.parent.width - this.sizer.width) * .5;
        var deltaY = Math.ceil(this.parent.height - this.sizer.height) * .5;
        var sdvigY = 0;
        if (MainGame.isDesktop && window.innerHeight < MainGame.Config.MAX_HEIGHT) {
            deltaY = Math.ceil(window.innerHeight - this.sizer.height) * .5;
            sdvigY = this.scale.gameSize.height - window.innerHeight
        }
        const scaleX = this.sizer.width / this.GAME_WIDTH;
        const scaleY = this.sizer.height / this.GAME_HEIGHT;
        const zoom = Math.max(scaleX, scaleY);
        const offsetX = deltaX / zoom;
        const offsetY = deltaY / zoom;
        camera.setZoom(zoom);
        if (MainGame.isDesktop) {
            camera.centerOn(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + offsetY + sdvigY)
        } else {
            camera.centerOn(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);
            this.back.y = -offsetY;
            this.preloader_back.y = 590 - offsetY;
            this.preloader_bar.y = 590 - offsetY
        }
    }
    create() {
        MainGame.TEXT_FILE = this.cache.json.get("alltext");
        MainGame.Sfx.manage("music", "init", this);
        MainGame.Sfx.manage("sound", "init", this);
        this.scale.off("resize", this.updateResize, this);
        MainGame.fadeOutScene("Game", this)
    }
}
class Game extends Phaser.Scene {
    constructor() {
        super("Game")
    }
    create() {
        MainGame.isFromTutorial = false;
        MainGame.state = this;
        MainGame.stateName = "Game";
        MainGame.GAME_TEXT = MainGame.TEXT_FILE[MainGame.languages[MainGame.language]];
        this.initResize();
        this.midX = this.GAME_WIDTH / 2;
        this.midY = this.GAME_HEIGHT / 2;
        var back = this.add.image(this.midX, 0, "bg_game");
        back.setOrigin(.5, 0);
        if (!MainGame.isDesktop) back.y = -220;
        if (MainGame.firstGo) {
            this.input.once("pointerdown", this.playOnce, this)
        } else {
            MainGame.Sfx.play("music", "main")
        }
        this.initSettingsGame();
        this.initTrackPath();
        this.initIndcatorPilots();
        this.layerButtons = this.add.container();
        this.layerButtons.setDepth(this.DEPTH_layerMainButtons);
        this.initEffects();
        this.gameGUI = new GameGUI(this);
        this.gameGUI.init();
        this.initShop();
        this.initInputScrolling();
        this.icon_trash = this.gameGUI.icon_trash;
        this.initArmHelp();
        this.initParkings();
        this.updateParking();
        this.updatePilots();
        this.cursor_car = this.add.image(200, 200, "ss_cars", "icon_f1_0000");
        this.cursor_car.depth = this.DEPTH_cursorcar;
        this.cursor_car.visible = false;
        this.cursor_car.setScale(this.getScaleCar(1));
        this.input.on("pointerdown", this.onInputDown, this);
        this.input.on("pointerup", this.onInputUp, this);
        this.input.on("pointermove", this.onInputMove, this);
        var obj = null;
        for (var i = 0; i < this.MAX_PARKING; i++) {
            obj = this.box_have[i];
            if (obj && obj.t > 0) {
                this.addObject({
                    lvl: obj.t,
                    alreadyRacing: obj.r,
                    parkingId: obj.id
                })
            }
        }
        if (MainGame.isAPI) MainGame.API_POKI.commercialBreak();
        var earning_sec = this.total_speed;
        if (MainGame.lastSession && earning_sec > 0) {
            var currentSession = new Date;
            var dif = currentSession.getTime() - MainGame.lastSession;
            var secondsFromLastSession = Math.abs(dif / 1e3);
            var countAddFree = Math.floor(secondsFromLastSession / this.TIME_NEXT_FREE);
            var secondsDiff = Math.floor(secondsFromLastSession) % this.TIME_NEXT_FREE;
            if (countAddFree > 0) {
                this.freeTimeWheel += countAddFree;
                if (this.freeTimeWheel > MainGame.maxTimeWheel) {
                    this.freeTimeWheel = MainGame.maxTimeWheel
                }
            }
            if (this.freeTimeWheel < MainGame.maxTimeWheel) {
                if (MainGame.cdNextFree) {
                    if (MainGame.cdNextFree < 0) MainGame.cdNextFree = 0;
                    this.countDownNextFree = MainGame.cdNextFree - secondsDiff;
                    if (this.countDownNextFree < 0) {
                        this.freeTimeWheel += 1;
                        if (this.freeTimeWheel > MainGame.maxTimeWheel) {
                            this.freeTimeWheel = MainGame.maxTimeWheel
                        }
                        this.countDownNextFree = this.TIME_NEXT_FREE - Math.abs(this.countDownNextFree)
                    }
                } else {
                    this.countDownNextFree = this.TIME_NEXT_FREE
                }
            }
            if (secondsFromLastSession > this.MAX_OFFLINE_EARNING_SEC) {
                secondsFromLastSession = this.MAX_OFFLINE_EARNING_SEC
            }
            var add_money = Math.round(earning_sec * secondsFromLastSession * this.OFFLINE_EARNING);
            this.value_offline_earning = add_money;
            this.gameGUI.showOfflineEarningWindow(add_money);
            this.amount_coins += add_money
        } else {
            MainGame.isApiGameplayStop = true;
            if (this.currentLevel == 1 && this.exp == 0) {
                this.freeTimeWheel = MainGame.maxTimeWheel;
                MainGame.freeTimeWheel = this.freeTimeWheel;
                this.initTutorial()
            }
        }
        this.updateValuesFromLoad();
        this.gameStarted = true;
        this.cameras.main.fadeIn(200);
        this.updateResize();
        this.offerFreeUpgrade = 3;
        if (this.nextCarLevel >= 5) this.gameGUI.showBanner()
    }
    playOnce() {
        MainGame.firstGo = false;
        if (this.countDownBonusSpeed > 0) {
            MainGame.Sfx.play("music", "turbo")
        } else {
            MainGame.Sfx.play("music", "main")
        }
    }
    updateCoinsText() {
        var text_coins_warm = this.convertNumberFormat(this.amount_coins);
        this.gameGUI.updateCoins(text_coins_warm)
    }
    updateValuesFromLoad() {
        var text_coins_warm = this.convertNumberFormat(this.amount_coins);
        this.gameGUI.updateCoins(text_coins_warm);
        this.gameGUI.updateLevel(this.exp / this.exp_max);
        if (this.nextCarLevel > this.MAX_TYPES_CAR) {
            this.gameGUI.layerProgressCar.visible = false
        }
        this.updateShop(text_coins_warm);
        if (MainGame.cdBonusCoins && MainGame.cdBonusCoins > 0) {
            this.activateBoost(MainGame.cdBonusCoins)
        }
        if (MainGame.cdBonusSpeed && MainGame.cdBonusSpeed > 0) {
            this.activateTurbo(true, MainGame.cdBonusSpeed, true)
        }
        this.updatePrivilegiesFactors();
        this.updateSpeedValue();
        this.updateCarPrices();
        this.updateIndcatorPilots();
        this.gameGUI.updateFastBuy();
        if (this.currentLevel < 4) {
            this.gameGUI.icon_free_fortune.visible = false;
            this.gameGUI.buttonFortuna.visible = false
        } else {
            if (this.freeTimeWheel > 0) {
                this.gameGUI.icon_free_fortune.visible = true;
                this.gameGUI.buttonFortuna.visible = true
            }
        }
    }
    initArmHelp() {
        this.arm_help = this.add.image(this.midX, this.midY, "ss_main", "tutor_cursor_0000");
        this.arm_help.visible = false;
        this.arm_help.setDepth(this.DEPTH_cursorcar);
        this.timerCheckHelp = 0
    }
    getMaxValuePair(ar) {
        var max_value = 0;
        var max_count = 0;
        var indexes_of_max = [];
        ar.sort((function(a, b) {
            return b.type - a.type
        }));
        max_value = ar[0].type;
        max_count = 1;
        indexes_of_max = [ar[0].id];
        for (var i = 1; i < ar.length; i++) {
            if (ar[i].type == max_value) {
                max_count++;
                indexes_of_max.push(ar[i].id);
                if (max_count == 2) {
                    break
                }
            } else {
                max_count = 1;
                max_value = ar[i].type;
                indexes_of_max = [ar[i].id]
            }
        }
        return indexes_of_max
    }
    hideArmHelp() {
        this.tweens.killTweensOf(this.arm_help);
        this.arm_help.visible = false;
        this.timerCheckHelp = 0
    }
    updateArmHelp() {
        if (this.isGoTutorial || this.arm_help.visible) return;
        this.hideArmHelp();
        var valuesTypes = [];
        var parking;
        for (var i = 0; i < this.LIMIT_parking; i++) {
            parking = this.arParking[i];
            if (parking.type > 0 && parking.type < this.MAX_TYPES_CAR) {
                if (parking.obj && parking.obj.count_box_tween != null && parking.obj.count_box_tween <= 0) {
                    valuesTypes.push({
                        id: parking.id,
                        type: parking.type
                    })
                }
            }
        }
        if (valuesTypes.length < 1) return;
        var pairIds = this.getMaxValuePair(valuesTypes);
        if (pairIds.length > 1) {
            this.arm_help.visible = true;
            var parkingA = this.arParking[pairIds[1]];
            var parkingB = this.arParking[pairIds[0]];
            var offsetY = 15;
            this.arm_help.x = parkingA.x;
            this.arm_help.y = parkingA.y + offsetY;
            this.tweens.add({
                targets: this.arm_help,
                x: parkingB.x,
                y: parkingB.y + offsetY,
                ease: "Cubic.easeOut",
                duration: 700,
                hold: 300
            });
            this.time.delayedCall(1500, this.hideArmHelp, [], this)
        }
    }
    initTutorial() {
        this.gameGUI.buttonTurbo.visible = false;
        this.gameGUI.buttonShop.visible = false;
        this.gameGUI.icon_trash.visible = false;
        this.gameGUI.buttonFortuna.visible = false;
        this.isGoTutorial = true;
        this.tutorialStep = 0;
        var effect = this.add.sprite(this.midX, this.midY, "ss_main");
        effect.play("effect_tutor");
        effect.visible = false;
        this.effect_tutor = effect;
        this.tutor_arm = this.add.image(this.midX, this.midY, "ss_main", "tutor_cursor_0000");
        this.tutor_arm.visible = false;
        this.effect_tutor.setDepth(this.DEPTH_cursorcar);
        this.tutor_arm.setDepth(this.DEPTH_cursorcar);
        this.time.delayedCall(500, this.tutorialScenario, [], this);
        var posY = 500;
        if (!MainGame.isDesktop) posY = 530;
        var txt = this.add.bitmapText(this.midX, posY, "NEXTART", "");
        txt.setDropShadow(3, 3, 0, 1);
        txt.setMaxWidth(500);
        txt.setCenterAlign();
        txt.setFontSize(34);
        txt.setOrigin(.5);
        txt.lineSpacing = -8;
        txt.visible = false;
        txt.setTint(16773120);
        this.textTutorial = txt
    }
    tutorialScenario() {
        this.tutorialStep++;
        if (this.tutorialStep == 1) {
            this.tutor_arm.visible = true;
            this.effect_tutor.visible = true;
            this.tutor_arm.x = this.midX + 50;
            this.tutor_arm.y = 455;
            if (!MainGame.isDesktop) {
                this.tutor_arm.x = this.midX + 60;
                this.tutor_arm.y = 680
            }
            this.effect_tutor.x = this.tutor_arm.x - 10;
            this.effect_tutor.y = this.tutor_arm.y - 35;
            this.tweens.add({
                targets: this.tutor_arm,
                scaleX: .9,
                scaleY: .9,
                ease: "Linear",
                duration: 500,
                yoyo: true,
                repeat: -1
            })
        } else if (this.tutorialStep == 3) {
            this.gameGUI.buttonAddCar.disableInput();
            var obj = this.arParking[1].obj;
            this.tutor_arm.x = obj.x + 5;
            this.tutor_arm.y = obj.y + 40;
            this.effect_tutor.x = this.tutor_arm.x - 10;
            this.effect_tutor.y = this.tutor_arm.y - 35;
            this.textTutorial.visible = true;
            this.textTutorial.setText(MainGame.GAME_TEXT.text_merge);
            this.tweens.killTweensOf(this.tutor_arm);
            this.tutor_arm.setScale(1);
            this.tweens.add({
                targets: this.tutor_arm,
                x: this.tutor_arm.x - 120,
                ease: "Linear",
                duration: 900,
                repeat: -1,
                hold: 400
            })
        } else if (this.tutorialStep == 4) {
            var obj = this.arParking[0].obj;
            this.tutor_arm.x = obj.x + 5;
            this.tutor_arm.y = obj.y + 40;
            this.effect_tutor.x = this.tutor_arm.x - 10;
            this.effect_tutor.y = this.tutor_arm.y - 35;
            this.textTutorial.setText(MainGame.GAME_TEXT.text_drag);
            this.tweens.killTweensOf(this.tutor_arm);
            var posAnim = {
                x: this.tutor_arm.x + 80,
                y: this.tutor_arm.y - 160
            };
            if (!MainGame.isDesktop) {
                posAnim.x = this.tutor_arm.x - 150;
                posAnim.y = this.tutor_arm.y + 30
            }
            this.tweens.add({
                targets: this.tutor_arm,
                x: posAnim.x,
                y: posAnim.y,
                ease: "Linear",
                duration: 900,
                repeat: -1,
                hold: 400
            })
        } else if (this.tutorialStep == 5) {
            this.textTutorial.setText("");
            this.textTutorial.visible = false;
            this.tweens.killTweensOf(this.tutor_arm);
            this.addObject({
                lvl: 1,
                skinBox: true,
                parkingId: 3
            }, true);
            var obj = this.arParking[3].obj;
            this.tutor_arm.x = obj.x + 5;
            this.tutor_arm.y = obj.y + 40;
            this.effect_tutor.x = this.tutor_arm.x - 10;
            this.effect_tutor.y = this.tutor_arm.y - 35;
            this.tutor_arm.setScale(1);
            this.tweens.add({
                targets: this.tutor_arm,
                scaleX: .9,
                scaleY: .9,
                ease: "Linear",
                duration: 500,
                yoyo: true,
                repeat: -1
            })
        } else if (this.tutorialStep == 6) {
            this.tweens.killTweensOf(this.tutor_arm);
            this.tutor_arm.destroy();
            this.effect_tutor.destroy();
            this.textTutorial.destroy();
            this.isGoTutorial = false;
            this.gameGUI.buttonTurbo.visible = true;
            this.gameGUI.buttonShop.visible = true;
            this.gameGUI.icon_trash.visible = true;
            this.gameGUI.buttonFortuna.visible = false;
            this.gameGUI.buttonAddCar.enableInput()
        }
    }
    initResize() {
        this.GAME_WIDTH = MainGame.Config.DEFAULT_WIDTH;
        this.GAME_HEIGHT = MainGame.Config.DEFAULT_HEIGHT;
        var gameSize = this.scale.gameSize;
        var width = gameSize.width;
        var height = gameSize.height;
        if (window.innerHeight < MainGame.Config.MAX_HEIGHT) {
            height = window.innerHeight
        }
        this.parent = new Phaser.Structs.Size(width, height);
        this.sizer = new Phaser.Structs.Size(this.GAME_WIDTH, this.GAME_HEIGHT, Phaser.Structs.Size.FIT, this.parent);
        this.parent.setSize(width, height);
        this.sizer.setSize(width, height);
        this.scale.on("resize", this.updateResize, this)
    }
    updateResize() {
        var gameSize = this.scale.gameSize;
        var width = gameSize.width;
        var height = gameSize.height;
        if (MainGame.isDesktop && window.innerHeight < MainGame.Config.MAX_HEIGHT) {
            height = window.innerHeight
        }
        this.parent.setSize(width, height);
        this.sizer.setSize(width, height);
        this.updateCamera()
    }
    updateCamera() {
        const camera = this.cameras.main;
        var deltaX = Math.ceil(this.parent.width - this.sizer.width) * .5;
        var deltaY = Math.ceil(this.parent.height - this.sizer.height) * .5;
        var sdvigY = 0;
        if (MainGame.isDesktop && window.innerHeight < MainGame.Config.MAX_HEIGHT) {
            deltaY = Math.ceil(window.innerHeight - this.sizer.height) * .5;
            sdvigY = this.scale.gameSize.height - window.innerHeight
        }
        const scaleX = this.sizer.width / this.GAME_WIDTH;
        const scaleY = this.sizer.height / this.GAME_HEIGHT;
        const zoom = Math.max(scaleX, scaleY);
        const offsetY = deltaY / zoom;
        const offsetX = deltaX / zoom;
        camera.setZoom(zoom);
        if (MainGame.isDesktop) {
            camera.centerOn(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + offsetY + sdvigY)
        } else {
            camera.centerOn(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2)
        }
        this.gameGUI.updateCamera(offsetX, offsetY)
    }
    getCarCoins(vNum) {
        var carInfo = this.getCarInfo(vNum);
        var speed = carInfo.speed;
        var coins = carInfo.coins;
        var timeLoop = 1 / (60 * speed);
        return Math.round(coins / timeLoop)
    }
    initParkings() {
        this.arParking = [];
        this.arParking.push({
            id: 0,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 1,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 2,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 3,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 4,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 5,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 6,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 7,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 8,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 9,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 10,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.arParking.push({
            id: 11,
            x: 150,
            y: 150,
            busy: false,
            racing: false,
            obj: null,
            lemming: null,
            btn_return: null,
            type: 0
        });
        this.addParking(this.arParking[0]);
        this.addParking(this.arParking[1]);
        this.addParking(this.arParking[2]);
        this.addParking(this.arParking[3]);
        this.addParking(this.arParking[4]);
        this.addParking(this.arParking[5]);
        this.addParking(this.arParking[6]);
        this.addParking(this.arParking[7]);
        this.addParking(this.arParking[8]);
        this.addParking(this.arParking[9]);
        this.addParking(this.arParking[10]);
        this.addParking(this.arParking[11])
    }
    showSystemMessage(vText) {
        this.gameGUI.showSystemMessage(vText)
    }
    clickBuyShopItem(value) {
        if (this.ALLOW_ADS_CAR && this.num_ads_car == value) {
            if (this.getFreeParking() < 0) {
                this.gameGUI.showSystemMessage(MainGame.GAME_TEXT.no_parking);
                return
            }
            this.showAdsForCar()
        } else {
            this.buyCar(value, true)
        }
    }
    buyFastCar() {
        var typeFastCar = this.getTypeBetterPrice();
        this.buyCar(typeFastCar, false);
        if (this.isGoTutorial && this.tutorialStep < 3) {
            this.tutorialScenario()
        }
    }
    buyCar(vNum, vFromShop) {
        if (this.getFreeParking() < 0) {
            this.gameGUI.showSystemMessage(MainGame.GAME_TEXT.no_parking);
            return
        }
        var priceCar = this.getPriceCar(vNum);
        priceCar = Math.round(priceCar * this.factorDiscount);
        if (this.amount_coins < priceCar) {
            this.gameGUI.showSystemMessage(MainGame.GAME_TEXT.no_money);
            return
        }
        this.addObject({
            lvl: vNum,
            fromShop: vFromShop
        }, true);
        this.amount_coins -= priceCar;
        var text_coins_warm = this.convertNumberFormat(this.amount_coins);
        this.gameGUI.updateCoins(text_coins_warm);
        this.updateShop(text_coins_warm);
        this.updatePriceCar(vNum);
        this.gameGUI.updateFastBuy();
        this.updateShopItem();
        this.updateBoxHave();
        this.saveDeltaCarLevel();
        MainGame.Sfx.play("sound", "buy")
    }
    testGetPrices(vValue) {
        var info;
        var price;
        var price2;
        var needPriceAr = [0, 100, 1500, 4800, 14880, 46130, 143e3, 443300, 1418560, 4539392, 14526054, 46483372, 148746792, 475989737, 1523167159, 4874134911, 15597231715, 49911141488, 159715652763, 511090088843, 1635488284299, 5233562509759, 0xf3b4ed46bfd, 53591680099934, 0x9bf8e9c6e12e, 548778804223328];
        for (var i = 1; i <= vValue; i++) {
            info = this.getCarInfo(i);
            price = this.convertNumberFormat(info.price);
            price2 = this.convertNumberFormat(needPriceAr[i]);
            console.log(i + "\t : " + price + "\t | " + price2)
        }
    }
    testGetCoins() {
        var info;
        for (var i = 1; i <= 10; i++) {
            info = this.getCarCoins(i);
            console.log(i + "\t : " + info)
        }
    }
    getCarInfo(type) {
        var _price = 100;
        if (type > 1) {
            _price = Math.floor(1e3 * Math.pow(2.28, type - 2))
        }
        var _speed = .002 + 15e-5 * type;
        var _coins = Math.pow(2, type) * 20;
        return {
            speed: _speed,
            coins: _coins,
            price: _price
        }
    }
    updateCarPrices() {
        var price = 0;
        for (var i = 0; i < this.MAX_TYPES_CAR; i++) {
            price = this.getCarInfo(i + 1).price;
            for (var j = 0; j < this.arDeltaCarLevel[i]; j++) {
                price = Math.round(price * this.DELTA_PRICE)
            }
            this.arCurrentPricesCar[i] = price
        }
    }
    getPriceCar(vType) {
        return this.arCurrentPricesCar[vType - 1]
    }
    updatePriceCar(vType) {
        var type_car = vType;
        this.arDeltaCarLevel[type_car - 1]++;
        var new_value = this.arCurrentPricesCar[type_car - 1] * this.DELTA_PRICE;
        this.arCurrentPricesCar[type_car - 1] = Math.round(new_value)
    }
    convertNumberFormat(number) {
        var temp = number;
        var tabUnits = ["K", "M", "B", "T", "aa", "bb", "cc", "dd", "ee", "ff", "gg", "hh", "ii", "jj", "kk", "ll", "mm", "nn", "oo", "pp", "qq", "rr", "ss", "tt", "uu", "vv", "ww", "xx", "yy", "zz"];
        var highnumber = false;
        var bignumber = 1e3;
        var tabposition = -1;
        var p_atomepersecond = true;
        var unit;
        if (number >= bignumber) {
            highnumber = true;
            while (number >= bignumber) {
                bignumber *= 1e3;
                tabposition++
            }
            number /= bignumber / 1e3;
            unit = tabUnits[tabposition]
        } else unit = "";
        if (unit == undefined) return temp.toExponential(2);
        var toround = highnumber == true ? p_atomepersecond == true ? 100 : 100 : 10;
        var res = Math.round(number * toround) / toround;
        return [res.toLocaleString().replace(",", ".") + "" + unit]
    }
    initSettingsGame() {
        this.isShopAdded = false;
        this.MAX_TYPES_CAR = 50;
        this.MIN_LVL_UPGRADE = 4;
        this.ALLOW_UPGRADE = 12;
        this.DISTANCE_DRAG = 2e3;
        this.value_offline_earning = 0;
        this.isGoTutorial = false;
        this.tutorialStep = 0;
        this.gameStarted = false;
        this.isDoubleSpeed = false;
        this.isBoostTimer = false;
        this.total_speed = 0;
        this.helicopterBonus = "coins";
        this.stickManAnim = "";
        this.showAfterMerge = false;
        this.isShowHelicopter = false;
        this.countHelicopterFly = 0;
        this.flagHelicopter = true;
        this.isDownOnParking = false;
        this.isDrag = false;
        this.selectedCar = null;
        this.linkToOldParking = null;
        this.DEPTH_text_pilots = .015;
        this.DEPTH_icon_pilots = .016;
        this.DEPTH_racing_car = .017;
        this.DEPTH_platform = .018;
        this.DEPTH_hightlight = .019;
        this.DEPTH_cars = .02;
        this.DEPTH_iconreturn = .021;
        this.DEPTH_effect_unboxing = .022;
        this.DEPTH_GUI = .1;
        this.DEPTH_text_coins = .2;
        this.DEPTH_text_field = .21;
        this.DEPTH_helicopter = .22;
        this.DEPTH_layerMainButtons = .24;
        this.DEPTH_layerLevelBar = .25;
        this.DEPTH_cursorcar = .26;
        this.DEPTH_layerMerge = .3;
        this.DEPTH_layerUnlock = .31;
        this.DEPTH_layerShop = .5;
        this.DEPTH_systemtext = .6;
        this.countDownRebootBonusSpeed = 0;
        this.countDownBonusSpeed = 0;
        this.countDownBonusCoins = 0;
        this.countDownNextFree = 0;
        this.VALUE_SELL = .25;
        this.DELTA_PRICE = 1.15;
        this.OFFLINE_EARNING = .2;
        this.MAX_OFFLINE_EARNING_SEC = 60 * 60 * 48;
        this.MAX_PARKING = 12;
        this.MAX_PILOTS = 10;
        this.value_boost = 5;
        this.FACTOR_TURBO = 2;
        this.ALLOW_ADS_CAR = false;
        this.num_ads_car = 0;
        this.offerFreeUpgrade = 0;
        this.parking_upgrade_id = null;
        this.parking_upgrade_type = 0;
        this.TIME_BOOST = 150;
        this.TIME_COOLDOWN_BOOST = 60 * 5;
        this.TIME_COINS = 60;
        this.TIME_ADD_FREE_BOX = 20;
        this.TIME_ADD_HELICOPTER = 90;
        this.TIME_ADD_ADS_CAR = 120;
        this.TIME_BTN_FIRE_EFFECT = 25;
        this.TIME_HELP_ARM = 2 * 60;
        this.TIME_CHECK_BUFFER = 200;
        this.TIME_NEXT_FREE = 30 * 60;
        this.ICON_RETURN_OFFSET = {
            x: 52,
            y: -27
        };
        this.PANEL_NUMBER_OFFSET = {
            x: 36,
            y: 7
        };
        this.HIGHLIGHTER_OFFSET = {
            x: 5,
            y: -26
        };
        this.CARS_OFFSET = {
            x: -3,
            y: -19
        };
        this.amount_coins = MainGame.amount_coins || 1e3;
        this.exp = MainGame.exp || 0;
        this.nextCarLevel = MainGame.nextCarLevel || 2;
        this.currentLevel = MainGame.currentLevel || 1;
        this.LIMIT_parking = MainGame.LIMIT_parking || 4;
        this.LIMIT_pilots = MainGame.LIMIT_pilots || 2;
        this.levelEarning = MainGame.levelEarning || 1;
        this.levelDiscount = MainGame.levelDiscount || 1;
        this.freeTimeWheel = MainGame.freeTimeWheel || 0;
        MainGame.amount_diamonds = MainGame.amount_diamonds || 0;
        MainGame.selectedGun = MainGame.selectedGun || 1;
        MainGame.selectedHat = MainGame.selectedHat || 0;
        MainGame.arHatsHave = MainGame.arHatsHave || [];
        MainGame.fireLevel = MainGame.fireLevel || 1;
        this.box_have = [];
        this.arDeltaCarLevel = [];
        this.buffer_boxes = [];
        if (MainGame.box_have) {
            for (var i = 0; i < this.MAX_PARKING; i++) {
                this.box_have[i] = MainGame.box_have[i]
            }
        } else {
            for (var i = 0; i < this.MAX_PARKING; i++) {
                this.box_have[i] = null
            }
        }
        if (MainGame.buffer_boxes) {
            for (var i = 0; i < MainGame.buffer_boxes.length; i++) {
                this.buffer_boxes[i] = MainGame.buffer_boxes[i]
            }
        }
        if (MainGame.arDeltaCarLevel) {
            for (var i = 0; i < this.MAX_TYPES_CAR; i++) {
                this.arDeltaCarLevel[i] = MainGame.arDeltaCarLevel[i]
            }
        } else {
            for (var i = 0; i < this.MAX_TYPES_CAR; i++) {
                this.arDeltaCarLevel[i] = 0
            }
        }
        var kfShopPriv = 1e4;
        this.arLevelEarning = [{
            price: kfShopPriv * 1,
            value: 5
        }, {
            price: kfShopPriv * 50,
            value: 10
        }, {
            price: kfShopPriv * 500,
            value: 20
        }, {
            price: kfShopPriv * 1e5,
            value: 40
        }, {
            price: kfShopPriv * 15e3 * 1e3,
            value: 60
        }, {
            price: kfShopPriv * 1e3 * 1e6,
            value: 80
        }, {
            price: kfShopPriv * 2e4 * 1e6,
            value: 100
        }, {
            price: kfShopPriv * 25e4 * 1e6,
            value: 150
        }, {
            price: kfShopPriv * 3e4 * 1e9,
            value: 225
        }, {
            price: kfShopPriv * 12e4 * 1e12,
            value: 500
        }];
        this.arLevelDiscount = [{
            price: kfShopPriv * 8,
            value: 5
        }, {
            price: kfShopPriv * 5e3,
            value: 15
        }, {
            price: kfShopPriv * 1e3 * 1e3,
            value: 25
        }, {
            price: kfShopPriv * 85e3 * 1e3,
            value: 35
        }, {
            price: kfShopPriv * 3e4 * 1e6,
            value: 50
        }, {
            price: kfShopPriv * 45e4 * 1e6,
            value: 55
        }, {
            price: kfShopPriv * 2e4 * 1e9,
            value: 60
        }, {
            price: kfShopPriv * 2e5 * 1e9,
            value: 65
        }, {
            price: kfShopPriv * 25e3 * 1e12,
            value: 75
        }, {
            price: kfShopPriv * 25e4 * 1e12,
            value: 85
        }];
        this.factorEarning = 1;
        this.factorDiscount = 1;
        this.exp_max = this.getExpMax(this.currentLevel);
        this.arCurrentPricesCar = [];
        this.time.addEvent({
            delay: 1e3,
            callback: this.updateTimerEverySec,
            callbackScope: this,
            loop: true
        });
        this.time.addEvent({
            delay: this.TIME_CHECK_BUFFER,
            callback: this.checkBuffer,
            callbackScope: this,
            loop: true
        });
        this.timer_freeBox = 0;
        this.timer_helicopter = this.TIME_ADD_HELICOPTER - 30;
        this.timer_carAds = this.TIME_ADD_ADS_CAR - 35;
        this.timer_btn_fire = 0
    }
    midPoint(p1, p2) {
        var pointX = (p1.x + p2.x) * .5;
        var pointY = (p1.y + p2.y) * .5;
        return {
            x: pointX,
            y: pointY
        }
    }
    initTrackPath() {
        var centerX = this.midX;
        var centerY = 275;
        var leftPoint = {
            x: centerX - 378,
            y: centerY
        };
        var rightPoint = {
            x: centerX + 378,
            y: centerY
        };
        var upPoint = {
            x: centerX,
            y: centerY - 226
        };
        var downPoint = {
            x: centerX,
            y: centerY + 226
        };
        var offset = {
            x: 160,
            y: 160
        };
        var delta = 2;
        if (!MainGame.isDesktop) {
            centerY = this.midY - 42;
            leftPoint = {
                x: centerX - 227,
                y: centerY
            };
            rightPoint = {
                x: centerX + 227,
                y: centerY
            };
            upPoint = {
                x: centerX,
                y: centerY - 377
            };
            downPoint = {
                x: centerX,
                y: centerY + 377
            };
            offset = {
                x: 160,
                y: 160
            };
            delta = 2
        }
        var pointA = {
            x: leftPoint.x,
            y: upPoint.y
        };
        var pointB = {
            x: rightPoint.x,
            y: upPoint.y
        };
        var pointC = {
            x: rightPoint.x,
            y: downPoint.y
        };
        var pointD = {
            x: leftPoint.x,
            y: downPoint.y
        };
        var pointAb = {
            x: pointA.x + offset.x,
            y: pointA.y
        };
        var pointAd = {
            x: pointA.x,
            y: pointA.y + offset.y
        };
        var pointBa = {
            x: pointB.x - offset.x,
            y: pointB.y
        };
        var pointBc = {
            x: pointB.x,
            y: pointB.y + offset.y
        };
        var pointCb = {
            x: pointC.x,
            y: pointC.y - offset.y
        };
        var pointCd = {
            x: pointC.x - offset.x,
            y: pointC.y
        };
        var pointDc = {
            x: pointD.x + offset.x,
            y: pointD.y
        };
        var pointDa = {
            x: pointD.x,
            y: pointD.y - offset.y
        };
        var pointAmb = this.midPoint(pointA, pointAb);
        var pointAmd = this.midPoint(pointA, pointAd);
        var pointBma = this.midPoint(pointB, pointBa);
        var pointBmc = this.midPoint(pointB, pointBc);
        var pointCmb = this.midPoint(pointC, pointCb);
        var pointCmd = this.midPoint(pointC, pointCd);
        var pointDmc = this.midPoint(pointD, pointDc);
        var pointDma = this.midPoint(pointD, pointDa);
        var path;
        if (MainGame.isDesktop) {
            path = new Phaser.Curves.Path(upPoint.x, upPoint.y);
            path.lineTo(pointBa.x, pointBa.y);
            path.cubicBezierTo(pointBc.x, pointBc.y, pointBma.x, pointBma.y + delta, pointBmc.x - delta, pointBmc.y);
            path.lineTo(pointCb.x, pointCb.y);
            path.cubicBezierTo(pointCd.x, pointCd.y, pointCmb.x - delta, pointCmb.y, pointCmd.x, pointCmd.y - delta);
            path.lineTo(pointDc.x, pointDc.y);
            path.cubicBezierTo(pointDa.x, pointDa.y, pointDmc.x, pointDmc.y - delta, pointDma.x + delta, pointDma.y);
            path.lineTo(pointAd.x, pointAd.y);
            path.cubicBezierTo(pointAb.x, pointAb.y, pointAmd.x + delta, pointAmd.y, pointAmb.x, pointAmb.y + delta);
            path.lineTo(upPoint.x, upPoint.y);
            this.startPoint = upPoint;
            this.finishPoint = downPoint
        } else {
            path = new Phaser.Curves.Path(leftPoint.x, leftPoint.y);
            path.lineTo(pointAd.x, pointAd.y);
            path.cubicBezierTo(pointAb.x, pointAb.y, pointAmd.x + delta, pointAmd.y, pointAmb.x, pointAmb.y + delta);
            path.lineTo(pointBa.x, pointBa.y);
            path.cubicBezierTo(pointBc.x, pointBc.y, pointBma.x, pointBma.y + delta, pointBmc.x - delta, pointBmc.y);
            path.lineTo(pointCb.x, pointCb.y);
            path.cubicBezierTo(pointCd.x, pointCd.y, pointCmb.x - delta, pointCmb.y, pointCmd.x, pointCmd.y - delta);
            path.lineTo(pointDc.x, pointDc.y);
            path.cubicBezierTo(pointDa.x, pointDa.y, pointDmc.x, pointDmc.y - delta, pointDma.x + delta, pointDma.y);
            path.lineTo(leftPoint.x, leftPoint.y);
            this.startPoint = leftPoint;
            this.finishPoint = rightPoint
        }
        this.path = path
    }
    updateTimerEverySec() {
        if (this.isGoTutorial) return;
        this.timer_freeBox++;
        if (this.timer_freeBox >= this.TIME_ADD_FREE_BOX) {
            this.timeToAddFreeBox();
            this.timer_freeBox = 0
        }
        this.timer_helicopter++;
        if (this.timer_helicopter >= this.TIME_ADD_HELICOPTER) {
            this.timeToHelicopter();
            this.timer_helicopter = 0
        }
        if (this.num_ads_car == 0) {
            this.timer_carAds++;
            if (this.timer_carAds >= this.TIME_ADD_ADS_CAR) {
                this.goAllowAdsCar();
                this.timer_carAds = 0
            }
        }
        if (this.freeTimeWheel < MainGame.maxTimeWheel) {
            if (this.countDownNextFree > 0) {
                this.countDownNextFree--;
                MainGame.cdNextFree = this.countDownNextFree;
                if (this.countDownNextFree == 0) {
                    this.freeTimeWheel++;
                    MainGame.freeTimeWheel = this.freeTimeWheel;
                    if (this.freeTimeWheel < MainGame.maxTimeWheel) {
                        this.countDownNextFree = this.TIME_NEXT_FREE
                    }
                    this.gameGUI.icon_free_fortune.visible = true
                }
                this.gameGUI.updateFortunaWheelWindow(this.countDownNextFree)
            }
        }
        MainGame.amount_coins = this.amount_coins;
        MainGame.saveSaves()
    }
    getCoinsLevelUp(vPlayerLevel) {
        return 1e3 * Math.pow(2, vPlayerLevel)
    }
    getExpMerge(vCarLevel) {
        return 15 * Math.pow(2, vCarLevel)
    }
    getExpMax(vPlayerLevel) {
        return 100 * Math.pow(2, vPlayerLevel)
    }
    saveBoxHave() {
        if (this.isGoTutorial) return;
        MainGame.box_have = [];
        for (var i = 0; i < this.box_have.length; i++) {
            MainGame.box_have.push(this.box_have[i])
        }
        MainGame.saveSaves()
    }
    saveBoxBuffer() {
        if (this.isGoTutorial) return;
        MainGame.buffer_boxes = [];
        for (var i = 0; i < this.buffer_boxes.length; i++) {
            MainGame.buffer_boxes.push(this.buffer_boxes[i])
        }
        MainGame.saveSaves()
    }
    saveDeltaCarLevel() {
        if (this.isGoTutorial) return;
        MainGame.arDeltaCarLevel = [];
        for (var i = 0; i < this.arDeltaCarLevel.length; i++) {
            MainGame.arDeltaCarLevel.push(this.arDeltaCarLevel[i])
        }
        MainGame.saveSaves()
    }
    saveGameValues() {
        if (this.isGoTutorial) return;
        MainGame.amount_coins = this.amount_coins;
        MainGame.exp = this.exp;
        MainGame.nextCarLevel = this.nextCarLevel;
        MainGame.currentLevel = this.currentLevel;
        MainGame.LIMIT_parking = this.LIMIT_parking;
        MainGame.LIMIT_pilots = this.LIMIT_pilots;
        MainGame.lastSession = (new Date).getTime();
        MainGame.saveSaves()
    }
    updateBoxHave() {
        if (this.isGoTutorial) return;
        var parking;
        for (var i = 0; i < this.LIMIT_parking; i++) {
            parking = this.arParking[i];
            if (parking.type > 0) {
                this.box_have[i] = {
                    id: parking.id,
                    t: parking.type,
                    r: parking.racing
                }
            } else {
                this.box_have[i] = null
            }
        }
        this.saveBoxHave();
        this.saveGameValues()
    }
    updateParking() {
        if (MainGame.isDesktop) {
            this.updateParkingLascape()
        } else {
            this.updateParkingPortrait()
        }
    }
    updateParkingPortrait() {
        var countParking = this.LIMIT_parking;
        var parking = null;
        var arPos = null;
        var posParking = {
            x: this.midX,
            y: 280
        };
        var offsetX = 65;
        var offsetY = 90;
        var arPos4 = [{
            x: posParking.x - offsetX,
            y: posParking.y + 0 * offsetY + 80
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 0 * offsetY + 80
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY + 80
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY + 80
        }];
        var arPos5 = [{
            x: posParking.x - offsetX,
            y: posParking.y + 0 * offsetY + 40
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 0 * offsetY + 40
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY + 40
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY + 40
        }, {
            x: posParking.x,
            y: posParking.y + 2 * offsetY + 40
        }];
        var arPos6 = [{
            x: posParking.x - offsetX,
            y: posParking.y + 0 * offsetY + 40
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 0 * offsetY + 40
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY + 40
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY + 40
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 2 * offsetY + 40
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 2 * offsetY + 40
        }];
        var arPos7 = [{
            x: posParking.x - offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 3 * offsetY
        }];
        var arPos8 = [{
            x: posParking.x - offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 3 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 3 * offsetY
        }];
        var arPos9 = [{
            x: posParking.x - offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 3 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 3 * offsetY
        }];
        var arPos10 = [{
            x: posParking.x - offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 3 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 3 * offsetY
        }];
        var arPos11 = [{
            x: posParking.x - offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 3 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 3 * offsetY
        }];
        var arPos12 = [{
            x: posParking.x - offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 3 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 3 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 3 * offsetY
        }];
        switch (countParking) {
            case 4:
                arPos = arPos4;
                break;
            case 5:
                arPos = arPos5;
                break;
            case 6:
                arPos = arPos6;
                break;
            case 7:
                arPos = arPos7;
                break;
            case 8:
                arPos = arPos8;
                break;
            case 9:
                arPos = arPos9;
                break;
            case 10:
                arPos = arPos10;
                break;
            case 11:
                arPos = arPos11;
                break;
            default:
                arPos = arPos12;
                break
        }
        for (var i = 0; i < countParking; i++) {
            parking = this.arParking[i];
            parking.x = arPos[i].x;
            parking.y = arPos[i].y;
            parking.icon_parking.visible = true;
            parking.icon_parking.x = parking.x;
            parking.icon_parking.y = parking.y;
            parking.effect_collect.x = parking.x;
            parking.effect_collect.y = parking.y - 55;
            parking.highlighter.x = parking.x + this.HIGHLIGHTER_OFFSET.x;
            parking.highlighter.y = parking.y + this.HIGHLIGHTER_OFFSET.y;
            parking.btn_return.x = parking.x + this.ICON_RETURN_OFFSET.x;
            parking.btn_return.y = parking.y + this.ICON_RETURN_OFFSET.y;
            parking.icon_panel_number.x = parking.x + this.PANEL_NUMBER_OFFSET.x;
            parking.icon_panel_number.y = parking.y + this.PANEL_NUMBER_OFFSET.y;
            parking.textNumberType.x = parking.x + this.PANEL_NUMBER_OFFSET.x - 3;
            parking.textNumberType.y = parking.y + this.PANEL_NUMBER_OFFSET.y - 3;
            if (parking.obj) {
                parking.obj.x = parking.x + this.CARS_OFFSET.x;
                parking.obj.y = parking.y + this.CARS_OFFSET.y
            }
        }
        this.hideArmHelp()
    }
    updateParkingLascape() {
        var countParking = this.LIMIT_parking;
        var parking = null;
        var arPos = null;
        var posParking = {
            x: this.midX,
            y: 180
        };
        var offsetX = 68;
        var offsetY = 80;
        var arPos4 = [{
            x: posParking.x - offsetX,
            y: posParking.y + 0 * offsetY + 40
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 0 * offsetY + 40
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY + 40
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY + 40
        }];
        var arPos5 = [{
            x: posParking.x - offsetX * 2,
            y: posParking.y + 0 * offsetY + 40
        }, {
            x: posParking.x,
            y: posParking.y + 0 * offsetY + 40
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 0 * offsetY + 40
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY + 40
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY + 40
        }];
        var arPos6 = [{
            x: posParking.x - offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 2 * offsetY
        }];
        var arPos7 = [{
            x: posParking.x - offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 2 * offsetY
        }];
        var arPos8 = [{
            x: posParking.x - offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 2 * offsetY
        }];
        var arPos9 = [{
            x: posParking.x - offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 2 * offsetY
        }];
        var arPos10 = [{
            x: posParking.x - offsetX * 3,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 3,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 2 * offsetY
        }];
        var arPos11 = [{
            x: posParking.x - offsetX * 3,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 3,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX * 3,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX * 3,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX * 2,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX * 2,
            y: posParking.y + 2 * offsetY
        }];
        var arPos12 = [{
            x: posParking.x - offsetX * 3,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x + offsetX * 3,
            y: posParking.y + 0 * offsetY
        }, {
            x: posParking.x - offsetX * 3,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x + offsetX * 3,
            y: posParking.y + 1 * offsetY
        }, {
            x: posParking.x - offsetX * 3,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x - offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX,
            y: posParking.y + 2 * offsetY
        }, {
            x: posParking.x + offsetX * 3,
            y: posParking.y + 2 * offsetY
        }];
        switch (countParking) {
            case 4:
                arPos = arPos4;
                break;
            case 5:
                arPos = arPos5;
                break;
            case 6:
                arPos = arPos6;
                break;
            case 7:
                arPos = arPos7;
                break;
            case 8:
                arPos = arPos8;
                break;
            case 9:
                arPos = arPos9;
                break;
            case 10:
                arPos = arPos10;
                break;
            case 11:
                arPos = arPos11;
                break;
            default:
                arPos = arPos12;
                break
        }
        for (var i = 0; i < countParking; i++) {
            parking = this.arParking[i];
            parking.x = arPos[i].x;
            parking.y = arPos[i].y;
            parking.icon_parking.visible = true;
            parking.icon_parking.x = parking.x;
            parking.icon_parking.y = parking.y;
            parking.effect_collect.x = parking.x;
            parking.effect_collect.y = parking.y - 55;
            parking.highlighter.x = parking.x + this.HIGHLIGHTER_OFFSET.x;
            parking.highlighter.y = parking.y + this.HIGHLIGHTER_OFFSET.y;
            parking.btn_return.x = parking.x + this.ICON_RETURN_OFFSET.x;
            parking.btn_return.y = parking.y + this.ICON_RETURN_OFFSET.y;
            parking.icon_panel_number.x = parking.x + this.PANEL_NUMBER_OFFSET.x;
            parking.icon_panel_number.y = parking.y + this.PANEL_NUMBER_OFFSET.y;
            parking.textNumberType.x = parking.x + this.PANEL_NUMBER_OFFSET.x - 3;
            parking.textNumberType.y = parking.y + this.PANEL_NUMBER_OFFSET.y - 3;
            if (parking.obj) {
                parking.obj.x = parking.x + this.CARS_OFFSET.x;
                parking.obj.y = parking.y + this.CARS_OFFSET.y
            }
        }
        this.hideArmHelp()
    }
    timeToAddFreeBox() {
        if (this.isGoTutorial) return;
        if (MainGame.isApiBreakTime) return;
        var free_park_num = this.getFreeParking();
        if (free_park_num >= 0) {
            this.addObject({
                skinBox: true
            }, true);
            this.updateBoxHave()
        }
    }
    timeToHelicopter() {
        if (this.currentLevel < 4) return;
        if (!this.isShowHelicopter && !this.gameGUI.layerBoosterWindow.visible && !this.isBoostTimer) {
            this.showHelicopter()
        }
    }
    activateBoost(vTime) {
        if (this.isBoostTimer) return;
        vTime = vTime || this.TIME_COINS;
        this.isBoostTimer = true;
        this.updateSpeedValue();
        this.countDownBonusCoins = vTime;
        this.gameGUI.updateIndcatorBoostCoins(this.secToHHMMSS(this.countDownBonusCoins));
        this.gameGUI.enableIndcatorBoostCoins(true);
        this.timerBonusCoins = this.time.addEvent({
            delay: 1e3,
            callback: this.updateTimerBonusCoins,
            callbackScope: this,
            loop: true
        });
        MainGame.Sfx.play("sound", "boost")
    }
    updateTimerBonusCoins() {
        this.countDownBonusCoins--;
        this.gameGUI.updateIndcatorBoostCoins(this.secToHHMMSS(this.countDownBonusCoins));
        if (this.countDownBonusCoins == 0) {
            this.deactivateBoost();
            this.timerBonusCoins.remove();
            this.gameGUI.enableIndcatorBoostCoins(false)
        }
        MainGame.cdBonusCoins = this.countDownBonusCoins
    }
    deactivateBoost() {
        this.isBoostTimer = false;
        this.updateSpeedValue()
    }
    increaseLevel(vValue, vShowLater) {
        this.exp += vValue;
        var delta = this.exp_max - this.exp;
        if (this.exp >= this.exp_max) {
            this.exp = -delta;
            this.currentLevel++;
            this.exp_max = this.getExpMax(this.currentLevel);
            this.gameGUI.textLevel.setText(this.currentLevel);
            this.gameGUI.updateLevel(1);
            this.gameGUI.updateLevel(this.exp / this.exp_max, 250);
            if (vShowLater) {
                this.showAfterMerge = true
            } else {
                this.time.delayedCall(500, this.gameGUI.showLevelUpWindow, [], this.gameGUI)
            }
            if (this.LIMIT_parking < 12) this.LIMIT_parking++;
            if (this.LIMIT_pilots < 10) this.LIMIT_pilots++;
            this.updateParking();
            this.updatePilots();
            if (this.currentLevel >= 5 && this.freeTimeWheel > 0) {
                this.gameGUI.icon_free_fortune.visible = true;
                this.gameGUI.buttonFortuna.visible = true
            }
        } else {
            this.gameGUI.updateLevel(this.exp / this.exp_max)
        }
    }
    checkNextCar() {
        var countParking = this.LIMIT_parking;
        var parking;
        var progress = 0;
        var type = 0;
        var cost_current = 0;
        var cost_need = Math.pow(2, this.nextCarLevel - 1);
        for (var i = 0; i < countParking; i++) {
            parking = this.arParking[i];
            type = parking.type;
            if (type > 0) {
                cost_current += Math.pow(2, type - 1)
            }
        }
        progress = cost_current / cost_need;
        if (progress > 1) {
            progress = 1
        }
        this.gameGUI.updateProgress(progress)
    }
    initIndcatorPilots() {
        this.textPilots = this.add.bitmapText(this.midX, 46, "NEXTART", "", 24);
        this.textPilots.setOrigin(.5, .5);
        this.textPilots.setTint(10092543);
        this.textPilots.setDepth(this.DEPTH_text_pilots);
        this.list_iconPilots = [];
        const midX = this.midX;
        for (var i = 0; i < this.MAX_PILOTS; i++) {
            var obj = this.add.image(this.midX, 48, "ss_cars", "icon_pilot2_0000");
            obj.setDepth(this.DEPTH_icon_pilots);
            obj.visible = false;
            this.list_iconPilots.push(obj)
        }
    }
    secToHHMMSS(vSec) {
        var seconds = parseInt(vSec, 10);
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds - hours * 3600) / 60);
        var seconds = seconds - hours * 3600 - minutes * 60;
        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;
        var time = minutes + ":" + seconds;
        return time
    }
    getRacingCars() {
        var countRacers = 0;
        var countParking = this.LIMIT_parking;
        for (var i = 0; i < countParking; i++) {
            var parking = this.arParking[i];
            if (parking.racing) {
                countRacers++
            }
        }
        return countRacers
    }
    updateIndcatorPilots() {
        var countRacers = this.getRacingCars();
        for (var i = 0; i < this.LIMIT_pilots; i++) {
            var icon_pilot = this.list_iconPilots[i];
            if (i < countRacers) {
                icon_pilot.setFrame("icon_pilot1_0000")
            } else {
                icon_pilot.setFrame("icon_pilot2_0000")
            }
        }
        var text = countRacers + "/" + this.LIMIT_pilots;
        this.textPilots.setText(text);
        this.updateSpeedValue()
    }
    updatePilots() {
        var countPilots = this.LIMIT_pilots;
        var obj;
        var posX;
        var posY;
        if (MainGame.isDesktop) {
            posX = this.midX + countPilots * 15;
            posY = 48;
            for (var i = 0; i < countPilots; i++) {
                obj = this.list_iconPilots[i];
                obj.visible = true;
                obj.x = posX - 20 - i * 30;
                obj.y = posY;
                obj.angle = 0
            }
            this.updateIndcatorPilots();
            this.textPilots.x = posX + 30;
            this.textPilots.y = 46
        } else {
            posX = this.midX - 228;
            posY = 260 - countPilots * 10;
            for (var i = 0; i < countPilots; i++) {
                obj = this.list_iconPilots[i];
                obj.visible = true;
                obj.x = posX;
                obj.y = posY + 120 + i * 32;
                obj.angle = -90
            }
            this.updateIndcatorPilots();
            this.textPilots.x = posX;
            this.textPilots.y = posY + 75
        }
    }
    addCoins(vType, vNumCar, vX, vY) {
        var coins = this.getCarInfo(vType).coins;
        coins = Math.floor(coins * this.factorEarning);
        if (this.isBoostTimer) coins *= this.value_boost;
        this.amount_coins += coins;
        var text_coins_warm = this.convertNumberFormat(this.amount_coins);
        this.gameGUI.updateCoins(text_coins_warm);
        this.updateShop(text_coins_warm);
        this.gameGUI.showCoinText(vNumCar, coins, vX, vY);
        var effect = this.add.sprite(this.gameGUI.icons_coin.x - 1, this.gameGUI.icons_coin.y + 1, "ss_main");
        effect.play("money_collect");
        effect.setDepth(this.DEPTH_effect_unboxing);
        var effect = this.add.sprite(vX, vY, "ss_main");
        effect.play("effect_finishcoin");
        effect.setDepth(this.DEPTH_effect_unboxing);
        MainGame.Sfx.play("sound", "finish")
    }
    updateSpeedValue(isForRewardCoins) {
        var total_speed = 0;
        var countParking = this.LIMIT_parking;
        var speed = 0;
        var coins = 0;
        var carInfo = null;
        for (var i = 0; i < countParking; i++) {
            var parking = this.arParking[i];
            if (parking.racing) {
                carInfo = this.getCarInfo(parking.type);
                speed = carInfo.speed;
                coins = carInfo.coins;
                var timeLoop = 1 / (60 * speed);
                total_speed += Math.round(coins / timeLoop)
            }
        }
        if (isForRewardCoins) return total_speed;
        this.total_speed = total_speed;
        total_speed *= this.factorEarning;
        if (this.isBoostTimer) total_speed *= this.value_boost;
        if (this.isDoubleSpeed) total_speed *= 2;
        var converted_value = this.convertNumberFormat(Math.round(total_speed));
        this.gameGUI.updateSpeedValue(converted_value + "/" + MainGame.GAME_TEXT.sec.toUpperCase());
        return total_speed
    }
    initEffects() {
        this.anims.create({
            key: "effect_connect",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "effect_connect1_",
                end: 14,
                zeroPad: 4
            }),
            hideOnComplete: true
        });
        this.anims.create({
            key: "delete_dust",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "delete_dust_",
                end: 13,
                zeroPad: 4
            }),
            hideOnComplete: true
        });
        this.anims.create({
            key: "money_collect",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "money_collect_",
                end: 10,
                zeroPad: 4
            }),
            hideOnComplete: true
        });
        this.anims.create({
            key: "effect_finishcoin",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "effect_finishcoin_",
                end: 18,
                zeroPad: 4
            }),
            hideOnComplete: true,
            frameRate: 30
        });
        this.anims.create({
            key: "effect_connect2",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "effect_connect2_",
                end: 28,
                zeroPad: 4
            }),
            hideOnComplete: true
        });
        this.anims.create({
            key: "magic_1",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "magic_1_",
                end: 28,
                zeroPad: 4
            }),
            hideOnComplete: false,
            repeat: -1
        });
        this.anims.create({
            key: "arrow",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "arrow_",
                end: 29,
                zeroPad: 4
            }),
            hideOnComplete: false,
            repeat: -1
        });
        this.anims.create({
            key: "propeller1",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "propeller1_",
                end: 5,
                zeroPad: 4
            }),
            hideOnComplete: false,
            repeat: -1
        });
        this.anims.create({
            key: "effect_unboxing",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "effect_unboxing_",
                end: 8,
                zeroPad: 4
            }),
            hideOnComplete: true
        });
        this.anims.create({
            key: "effect_tutor",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "effect_tutor_",
                end: 24,
                zeroPad: 4
            }),
            hideOnComplete: false,
            repeat: -1
        });
        this.anims.create({
            key: "delete_flash",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "delete_flash_",
                end: 24,
                zeroPad: 4
            }),
            hideOnComplete: false,
            repeat: -1
        });
        this.anims.create({
            key: "nextcar3",
            frames: this.anims.generateFrameNames("ss_main", {
                prefix: "nextcar3_",
                end: 33,
                zeroPad: 4
            }),
            hideOnComplete: false,
            repeat: -1
        })
    }
    update() {
        var pointer = this.input.activePointer;
        var pos = this.getInputPosition(pointer);
        if (this.gameStarted) {
            if (this.isDrag) {
                this.cursor_car.x = pos.x;
                this.cursor_car.y = pos.y
            }
            for (var i = 0; i < this.LIMIT_parking; i++) {
                this.updateLemming(this.arParking[i])
            }
            this.gameGUI.updateHelicopter();
            if (!this.arm_help.visible) {
                this.timerCheckHelp++;
                if (this.timerCheckHelp > 120) {
                    this.updateArmHelp();
                    this.timerCheckHelp = 0
                }
            }
        }
        if (this.isShopAdded) this.updateScrollMap()
    }
    updateLemming(vCar) {
        if (vCar.type <= 0 || !vCar.racing) return;
        var lemming = vCar.lemming;
        var type = vCar.type;
        lemming.prevPos.set(lemming.x, lemming.y);
        var pos = this.path.getPoint(lemming.pathDelta);
        var speedX = pos.x - lemming.prevPos.x;
        var speedY = pos.y - lemming.prevPos.y;
        lemming.setPosition(pos.x, pos.y);
        lemming.angle = 90 + Phaser.Math.RadToDeg(Math.atan2(speedY, speedX));
        lemming.pathDelta = Phaser.Math.Wrap(lemming.pathDelta + lemming.speed, 0, 1);
        var progress = lemming.pathDelta;
        if (!lemming.canEarn && progress < .25) {
            lemming.canEarn = true
        }
        if (lemming.canEarn && progress > .5) {
            this.addCoins(type, vCar.id, lemming.x, lemming.y);
            lemming.canEarn = false
        }
    }
    actionChangeParking(toParking, fromParking) {
        if (fromParking.obj == null) return;
        fromParking.obj.x = toParking.x + this.CARS_OFFSET.x;
        fromParking.obj.y = toParking.y + this.CARS_OFFSET.y;
        fromParking.obj.alpha = 1;
        if (fromParking.racing) {
            fromParking.obj.alpha = .5;
            toParking.btn_return.visible = true
        }
        toParking.busy = true;
        toParking.obj = fromParking.obj;
        toParking.type = fromParking.type;
        toParking.racing = fromParking.racing;
        toParking.icon_panel_number.visible = true;
        toParking.textNumberType.visible = true;
        this.setSpriteText(toParking.textNumberType, fromParking.type);
        var save_lemming = toParking.lemming;
        toParking.lemming = fromParking.lemming;
        fromParking.lemming = save_lemming;
        if (toParking.id != fromParking.id) {
            fromParking.type = 0;
            fromParking.busy = false;
            fromParking.racing = false;
            fromParking.obj = null;
            fromParking.btn_return.visible = false;
            fromParking.icon_panel_number.visible = false;
            fromParking.textNumberType.visible = false
        }
        this.updateSpeedValue();
        this.updateIndcatorPilots()
    }
    actionMerge(toParking, fromParking, vType) {
        if (toParking.obj == undefined || fromParking.obj == undefined) return;
        var currentType = toParking.type;
        var nextType = currentType + 1;
        var exp = this.getExpMerge(currentType);
        var isUnlockedNew = false;
        this.increaseLevel(exp, this.nextCarLevel == nextType);
        if (this.nextCarLevel == nextType) {
            if (MainGame.isAPI) MainGame.API_POKI.happyTime(.5);
            MainGame.api_google("MaxLevelCar", this.nextCarLevel);
            this.gameGUI.showMergeAnimation(this.nextCarLevel);
            this.nextCarLevel++;
            this.gameGUI.textLevelNextCar.setText(this.nextCarLevel);
            if (this.nextCarLevel > this.MAX_TYPES_CAR) {
                this.gameGUI.layerProgressCar.visible = false
            }
            this.gameGUI.updateFastBuy();
            if (this.nextCarLevel == 6) {
                this.timer_carAds = this.TIME_ADD_ADS_CAR;
                this.num_ads_car = 0
            }
            this.updateAdsCar();
            isUnlockedNew = true
        } else {
            if (MainGame.debug_isFreeUpgrade) {
                this.parking_upgrade_id = toParking.id;
                this.parking_upgrade_type = nextType + 2;
                this.gameGUI.showUpgradeWindow(nextType);
                this.offerFreeUpgrade = 0
            } else {
                if (nextType < this.nextCarLevel - this.MIN_LVL_UPGRADE) {
                    this.offerFreeUpgrade++;
                    if (this.offerFreeUpgrade >= this.ALLOW_UPGRADE) {
                        this.parking_upgrade_id = toParking.id;
                        this.parking_upgrade_type = nextType + 2;
                        this.gameGUI.showUpgradeWindow(nextType);
                        this.offerFreeUpgrade = 0
                    }
                }
            }
        }
        if (toParking.obj) toParking.obj.setFrame("icon_f" + nextType + "_0000");
        toParking.type = nextType;
        if (fromParking.obj) fromParking.obj.destroy();
        fromParking.busy = false;
        fromParking.obj = null;
        fromParking.type = 0;
        fromParking.icon_panel_number.visible = false;
        fromParking.textNumberType.visible = false;
        if (fromParking.racing) {
            fromParking.lemming.visible = false;
            fromParking.racing = false;
            fromParking.btn_return.visible = false
        }
        if (toParking.racing) {
            toParking.lemming.visible = false;
            toParking.racing = false;
            toParking.btn_return.visible = false;
            toParking.obj.alpha = 1
        }
        fromParking.lemming.progress = 0;
        toParking.lemming.progress = 0;
        this.setSpriteText(toParking.textNumberType, nextType);
        this.showAnimationMerge(toParking.obj, nextType);
        this.updateSpeedValue();
        this.updateIndcatorPilots();
        this.checkNextCar();
        MainGame.Sfx.play("sound", "merge")
    }
    actionSwap(toParking, fromParking, vX, vY) {
        if (toParking.obj == undefined || fromParking.obj == undefined) return;
        var swapType = toParking.type;
        var swapRacing = toParking.racing;
        this.setSpriteText(toParking.textNumberType, fromParking.type);
        this.setSpriteText(fromParking.textNumberType, toParking.type);
        var save_type = toParking.type;
        toParking.type = fromParking.type;
        fromParking.type = save_type;
        var save_lemming = toParking.lemming;
        toParking.lemming = fromParking.lemming;
        fromParking.lemming = save_lemming;
        var save_racing = toParking.racing;
        toParking.racing = fromParking.racing;
        fromParking.racing = save_racing;
        fromParking.busy = true;
        toParking.busy = true;
        if (fromParking.obj) {
            fromParking.obj.alpha = 1;
            fromParking.obj.setFrame("icon_f" + fromParking.type + "_0000");
            if (fromParking.racing) {
                fromParking.obj.alpha = .5;
                fromParking.btn_return.visible = true
            } else {
                fromParking.obj.alpha = 1;
                fromParking.btn_return.visible = false
            }
        }
        if (toParking.obj) {
            toParking.obj.setFrame("icon_f" + toParking.type + "_0000")
        }
        if (toParking.racing) {
            toParking.obj.alpha = .5;
            toParking.btn_return.visible = true
        } else {
            toParking.obj.alpha = 1;
            toParking.btn_return.visible = false
        }
        if (toParking.obj && fromParking.obj) this.showAnimationSwap(toParking.obj, fromParking.obj, {
            x: vX,
            y: vY
        });
        this.updateSpeedValue();
        this.updateIndcatorPilots()
    }
    actionPlaceOnTrack(selectedParking, vDelta, vPlaySound) {
        selectedParking.busy = true;
        selectedParking.racing = true;
        selectedParking.obj.alpha = .5;
        selectedParking.btn_return.visible = true;
        selectedParking.lemming.visible = true;
        selectedParking.lemming.setFrame("f" + selectedParking.type + "_0000");
        var speed = this.getCarInfo(selectedParking.type).speed;
        if (this.isDoubleSpeed) speed *= 2;
        selectedParking.lemming.speed = speed;
        selectedParking.lemming.x = this.startPoint.x;
        selectedParking.lemming.y = this.startPoint.y;
        selectedParking.lemming.pathDelta = 0;
        if (vDelta) {
            selectedParking.lemming.pathDelta = vDelta * .05
        }
        this.updateIndcatorPilots();
        if (vPlaySound) MainGame.Sfx.play("sound", "place_car")
    }
    actionBackFromRace(parking) {
        parking.btn_return.visible = false;
        parking.racing = false;
        parking.lemming.visible = false;
        this.showAnimationBackFromTrack(parking.obj, {
            x: parking.lemming.x,
            y: parking.lemming.y
        });
        this.updateIndcatorPilots()
    }
    actionTrash(selectedParking) {
        var priceCar = this.getPriceCar(selectedParking.type);
        this.amount_coins += Math.round(priceCar * this.VALUE_SELL);
        var text_coins_warm = this.convertNumberFormat(this.amount_coins);
        this.gameGUI.updateCoins(text_coins_warm);
        this.updateShop(text_coins_warm);
        selectedParking.obj.destroy();
        selectedParking.busy = false;
        selectedParking.racing = false;
        selectedParking.obj = null;
        selectedParking.type = 0;
        selectedParking.btn_return.visible = false;
        selectedParking.lemming.visible = false;
        selectedParking.icon_panel_number.visible = false;
        selectedParking.textNumberType.visible = false;
        this.updateSpeedValue();
        this.updateIndcatorPilots();
        this.checkNextCar();
        MainGame.Sfx.play("sound", "deleted");
        selectedParking.lemming.progress = 0
    }
    onInputUp(pointer) {
        this.onInputUpShop(pointer);
        if (!this.gameGUI.buttonEnabled) return;
        this.hideArmHelp();
        var action_detected = false;
        var pos = this.getInputPosition(pointer);
        var parking = null;
        var dist = 0;
        if (this.isDrag) {
            this.cursor_car.visible = false;
            var isPlacedToParking = false;
            var isPlacedToTrack = false;
            var isTrashTime = false;
            for (var i = 0; i < this.LIMIT_parking; i++) {
                parking = this.arParking[i];
                dist = MyMath.distanceTwoPoints(pos.x, parking.x, pos.y, parking.y - 20);
                if (dist < this.DISTANCE_DRAG) {
                    if (parking.busy && this.selectedCar.id != parking.id) {
                        if (this.selectedCar.type == parking.type && parking.type < this.MAX_TYPES_CAR) {
                            this.actionMerge(parking, this.arParking[this.selectedCar.id]);
                            this.openBox(parking, false);
                            action_detected = true;
                            if (this.isGoTutorial && this.tutorialStep == 3) {
                                this.tutorialScenario()
                            }
                        } else {
                            this.openBox(parking, false);
                            this.actionSwap(parking, this.arParking[this.selectedCar.id], pos.x, pos.y);
                            action_detected = true
                        }
                        isPlacedToParking = true
                    } else {
                        var isAllowChange = true;
                        if (this.isGoTutorial) {
                            isAllowChange = false
                        }
                        if (isAllowChange) {
                            this.actionChangeParking(parking, this.arParking[this.selectedCar.id]);
                            isPlacedToParking = true;
                            action_detected = true
                        }
                    }
                }
            }
            if (!isPlacedToParking) {
                dist = MyMath.distanceTwoPoints(pos.x, this.icon_trash.x, pos.y, this.icon_trash.y);
                if (dist < 2e3 && !this.isGoTutorial) {
                    isTrashTime = true;
                    this.actionTrash(this.arParking[this.selectedCar.id]);
                    var effect = this.add.sprite(this.icon_trash.x, this.icon_trash.y, "ss_main");
                    effect.play("delete_dust");
                    effect.setDepth(this.DEPTH_GUI);
                    action_detected = true
                }
                var oldParking = this.arParking[this.selectedCar.id];
                if (!oldParking.racing) {
                    var midX = this.midX;
                    var midY = this.midY;
                    if (this.isOnTrackPosition(pos, midX, midY)) {
                        var count_racing = this.getRacingCars();
                        if (count_racing >= this.LIMIT_pilots) {
                            this.showSystemMessage(MainGame.GAME_TEXT.no_racing)
                        } else {
                            var isAllowPlace = true;
                            if (this.isGoTutorial && this.tutorialStep == 3) {
                                isAllowPlace = false
                            }
                            if (isAllowPlace) {
                                isPlacedToTrack = true;
                                this.actionPlaceOnTrack(oldParking, null, true);
                                action_detected = true;
                                if (this.isGoTutorial && this.tutorialStep == 4) {
                                    this.tutorialScenario()
                                }
                            }
                        }
                    }
                }
                if (!isTrashTime && !isPlacedToTrack) {
                    oldParking.busy = true;
                    oldParking.obj = this.selectedCar.obj;
                    oldParking.type = this.selectedCar.type;
                    if (oldParking.racing) {
                        this.cursor_car.visible = false;
                        this.linkToOldParking = null
                    } else {
                        this.cursor_car.visible = true;
                        this.linkToOldParking = oldParking;
                        var posX = oldParking.obj.x;
                        var posY = oldParking.obj.y;
                        this.tweens.add({
                            targets: this.cursor_car,
                            x: posX,
                            y: posY,
                            ease: Phaser.Math.Easing.Cubic.Out,
                            duration: 100,
                            onComplete: this.finishCursorTween
                        })
                    }
                }
            }
            this.selectedCar = null;
            this.isDrag = false;
            this.hideHighlight()
        } else {
            for (var i = 0; i < this.LIMIT_parking; i++) {
                parking = this.arParking[i];
                dist = MyMath.distanceTwoPoints(pos.x, parking.x + 20, pos.y, parking.y - 20);
                if (dist < this.DISTANCE_DRAG && parking.racing) {
                    this.actionBackFromRace(parking);
                    action_detected = true
                }
            }
        }
        this.isDownOnParking = false;
        this.gameGUI.delete_flash.visible = false;
        if (action_detected) {
            this.updateBoxHave()
        }
    }
    isOnTrackPosition(pos, midX, midY) {
        if (MainGame.isDesktop) {
            return pos.x > midX - 200 && pos.x < midX + 220 && pos.y < 90
        } else {
            return pos.x < midX - 190 && pos.y > midY - 220 && pos.y < midY + 220
        }
    }
    finishCursorTween() {
        MainGame.state.cursor_car.visible = false;
        if (MainGame.state.linkToOldParking && MainGame.state.linkToOldParking.obj) MainGame.state.linkToOldParking.obj.alpha = 1;
        MainGame.state.linkToOldParking = null
    }
    showAnimationMerge(vObj, vType) {
        var oldType = vType - 1;
        var posX = vObj.x;
        var posY = vObj.y;
        this.cursor_car.visible = true;
        this.cursor_car.setFrame("icon_f" + oldType + "_0000");
        vObj.setFrame("icon_f" + oldType + "_0000");
        this.cursor_car.x = posX;
        this.cursor_car.y = posY;
        vObj.x = posX;
        vObj.y = posY;
        this.tweens.add({
            targets: this.cursor_car,
            x: posX + 50,
            ease: Phaser.Math.Easing.Cubic.Out,
            duration: 100,
            yoyo: true
        });
        this.tweens.add({
            targets: vObj,
            x: posX - 50,
            ease: Phaser.Math.Easing.Cubic.Out,
            duration: 100,
            yoyo: true
        });
        this.time.delayedCall(200, this.onMergePart, [vObj, vType], this);
        var effect = this.add.sprite(vObj.x, vObj.y, "ss_main");
        effect.setDepth(this.DEPTH_effect_unboxing);
        effect.play("effect_connect")
    }
    onMergePart(vObj, vType) {
        vObj.setFrame("icon_f" + vType + "_0000");
        this.cursor_car.setFrame("icon_f" + vType + "_0000");
        if (this.isDrag) return;
        this.cursor_car.visible = false;
        vObj.setScale(this.getScaleCar(1));
        this.tweens.add({
            targets: vObj,
            scale: this.getScaleCar(1.4),
            ease: Phaser.Math.Easing.Linear,
            duration: 100,
            yoyo: true
        })
    }
    showAnimationSwap(obj1, obj2, vPosition) {
        var to_x1 = obj1.x;
        var to_y1 = obj1.y;
        var to_x2 = obj2.x;
        var to_y2 = obj2.y;
        obj2.x = obj1.x;
        obj2.y = obj1.y;
        obj1.x = vPosition.x;
        obj1.y = vPosition.y;
        this.tweens.add({
            targets: obj1,
            x: to_x1,
            y: to_y1,
            ease: Phaser.Math.Easing.Linear,
            duration: 200
        });
        this.tweens.add({
            targets: obj2,
            x: to_x2,
            y: to_y2,
            ease: Phaser.Math.Easing.Linear,
            duration: 200
        });
        obj1.setScale(this.getScaleCar(1));
        obj2.setScale(this.getScaleCar(1));
        this.tweens.add({
            targets: obj1,
            scale: this.getScaleCar(1.4),
            ease: Phaser.Math.Easing.Linear,
            duration: 100,
            yoyo: true
        });
        this.tweens.add({
            targets: obj2,
            scale: this.getScaleCar(1.4),
            ease: Phaser.Math.Easing.Linear,
            duration: 100,
            yoyo: true
        })
    }
    showAnimationBackFromTrack(vObj, vPosition) {
        if (vObj == null) return;
        var to_x = vObj.x;
        var to_y = vObj.y;
        this.cursor_car.setFrame(vObj.frame.name);
        this.cursor_car.visible = true;
        this.cursor_car.x = vPosition.x;
        this.cursor_car.y = vPosition.y;
        this.tweens.add({
            targets: this.cursor_car,
            x: to_x,
            y: to_y,
            ease: Phaser.Math.Easing.Linear,
            duration: 150
        });
        this.time.delayedCall(150, this.onBackPart, [vObj], this)
    }
    onBackPart(vObj) {
        vObj.alpha = 1;
        this.cursor_car.visible = false
    }
    showHighlight() {
        var parking = null;
        var typeSelected = this.selectedCar.type;
        var idSelected = this.selectedCar.id;
        for (var i = 0; i < this.LIMIT_parking; i++) {
            parking = this.arParking[i];
            if (parking.id != idSelected) {
                if (typeSelected == parking.type && parking.type < this.MAX_TYPES_CAR) {
                    parking.highlighter.visible = true
                }
            }
        }
    }
    hideHighlight() {
        var parking = null;
        for (var i = 0; i < this.LIMIT_parking; i++) {
            parking = this.arParking[i];
            parking.highlighter.visible = false
        }
    }
    getInputPosition(pointer) {
        const deltaX = Math.ceil(this.parent.width - this.sizer.width) * .5;
        const deltaY = Math.ceil(this.parent.height - this.sizer.height) * .5;
        const scaleX = this.sizer.width / this.GAME_WIDTH;
        const scaleY = this.sizer.height / this.GAME_HEIGHT;
        const zoom = Math.max(scaleX, scaleY);
        const offset = deltaY / zoom;
        var pX = (pointer.x - deltaX) / zoom;
        var pY = (pointer.y - deltaY) / zoom + offset;
        if (!MainGame.isDesktop) pY = pointer.y / zoom - offset;
        return {
            x: pX,
            y: pY
        }
    }
    onInputMove(pointer) {
        this.onInputMoveShop(pointer);
        if (!this.gameGUI.buttonEnabled) return;
        if (this.isDownOnParking) {
            this.isDrag = true;
            var parking = this.arParking[this.selectedCar.id];
            if (parking.obj && pointer.distance > 3) {
                this.cursor_car.setFrame(parking.obj.frame.name);
                this.cursor_car.visible = true;
                if (!this.isGoTutorial) {
                    this.gameGUI.delete_flash.visible = true
                }
                parking.obj.alpha = .5;
                parking.busy = false;
                this.isDownOnParking = false;
                this.showHighlight();
                parking.obj.setScale(this.getScaleCar(1));
                this.tweens.killTweensOf(parking.obj);
                parking.obj.x = parking.x + this.CARS_OFFSET.x;
                parking.obj.y = parking.y + this.CARS_OFFSET.y
            }
        }
    }
    onInputDown(pointer) {
        this.onInputDownShop(pointer);
        if (!this.gameGUI.buttonEnabled) return;
        if (this.isGoTutorial && this.tutorialStep < 3) return;
        this.hideArmHelp();
        var pos = this.getInputPosition(pointer);
        var parking = null;
        var dist = 0;
        for (var i = 0; i < this.LIMIT_parking; i++) {
            parking = this.arParking[i];
            dist = MyMath.distanceTwoPoints(pos.x, parking.x, pos.y, parking.y - 20);
            if (this.isGoTutorial && this.tutorialStep == 3 && parking.id == 0) {
                continue
            }
            if (dist < this.DISTANCE_DRAG && parking.busy) {
                this.isDownOnParking = true;
                this.selectedCar = {
                    id: parking.id,
                    obj: parking.obj,
                    type: parking.type,
                    racing: parking.racing
                };
                if (parking.obj && parking.obj.count_box_tween > 0) {
                    this.openBox(parking, true)
                }
            }
        }
    }
    openBox(vParking, vIsAnimScale) {
        var vObj = vParking.obj;
        if (vObj == null) return;
        if (this.isGoTutorial && this.tutorialStep == 5) {
            this.tutorialScenario()
        }
        if (vObj.timedEvent) vObj.timedEvent.remove();
        vObj.count_box_tween = 0;
        vObj.setFrame(vObj.car_frame);
        this.tweens.killTweensOf(vObj);
        vObj.angle = 0;
        vObj.x = vParking.x + this.CARS_OFFSET.x;
        vObj.y = vParking.y + this.CARS_OFFSET.y;
        vParking.icon_panel_number.visible = true;
        vParking.textNumberType.visible = true;
        if (vIsAnimScale) {
            var effect = this.add.sprite(vObj.x - 2, vObj.y - 2, "ss_main");
            effect.play("effect_unboxing");
            effect.setDepth(this.DEPTH_effect_unboxing);
            vObj.setScale(this.getScaleCar(.3));
            vObj.setAlpha(.5);
            this.tweens.add({
                targets: vObj,
                scale: this.getScaleCar(1),
                ease: Phaser.Math.Easing.Back.Out,
                duration: 200
            });
            this.tweens.add({
                targets: vObj,
                alpha: 1,
                ease: Phaser.Math.Easing.Linear,
                duration: 150
            });
            MainGame.Sfx.play("sound", "open_box")
        }
    }
    goShake(vParking) {
        var vObj = vParking.obj;
        if (vObj) {
            vObj.count_box_tween--;
            if (vObj.count_box_tween <= 0) {
                this.openBox(vParking, true)
            } else {
                this.tweens.add({
                    targets: vObj,
                    angle: -10,
                    ease: Phaser.Math.Easing.Sine.InOut,
                    duration: 150,
                    repeat: 1,
                    yoyo: true
                })
            }
        }
    }
    shakeBox(vParking) {
        var vObj = vParking.obj;
        vObj.count_box_tween = 5;
        if (this.isGoTutorial) return;
        vObj.timedEvent = this.time.addEvent({
            args: [vParking],
            delay: 1500,
            callback: this.goShake,
            callbackScope: this,
            repeat: vObj.count_box_tween
        })
    }
    getScaleCar(value, bool) {
        if (bool) {
            var atlas_scale = 2;
            var scale = value / atlas_scale;
            return Math.round(scale * 100) / 100
        } else {
            return value
        }
    }
    addBoxToBuffer(vTypeCar) {
        this.buffer_boxes.push({
            type: vTypeCar
        })
    }
    checkBuffer() {
        if (this.buffer_boxes.length > 0) {
            var free_park_num = this.getFreeParking();
            if (free_park_num >= 0) {
                var obj = this.buffer_boxes.shift();
                this.addObject({
                    lvl: obj.type,
                    skinBox: true
                });
                this.updateBoxHave();
                this.saveBoxBuffer()
            }
        }
    }
    addObject(data, vIsSound) {
        data = data || {};
        var num = data.lvl || this.getTypeRandomBox();
        var free_park_num = data.parkingId || this.getFreeParking();
        data.alreadyRacing = false || data.alreadyRacing;
        if (free_park_num >= 0) {
            var park_place = this.arParking[free_park_num];
            park_place.busy = true;
            var car = this.add.image(park_place.x + this.CARS_OFFSET.x, park_place.y + this.CARS_OFFSET.y, "ss_cars", "icon_f" + num + "_0000");
            car.setDepth(this.DEPTH_cars);
            car.car_frame = "icon_f" + num + "_0000";
            park_place.icon_panel_number.visible = true;
            park_place.textNumberType.visible = true;
            this.setSpriteText(park_place.textNumberType, num);
            car.count_box_tween = 0;
            park_place.obj = car;
            park_place.type = num;
            park_place.lemming.progress = 0;
            if (!data.alreadyRacing && (data.parkingId == null || data.skinBox)) {
                if (data.skinBox || data.fromShop) {
                    if (data.fromShop) {
                        car.setFrame("box2_0000")
                    } else {
                        car.setFrame("box1_0000")
                    }
                    car.y -= 1;
                    this.shakeBox(park_place);
                    park_place.icon_panel_number.visible = false;
                    park_place.textNumberType.visible = false;
                    if (!data.fromShop) MainGame.Sfx.play("sound", "show_box")
                }
                car.setScale(this.getScaleCar(.3));
                car.setAlpha(.5);
                this.tweens.add({
                    targets: car,
                    scale: this.getScaleCar(1),
                    ease: Phaser.Math.Easing.Back.Out,
                    duration: 200
                });
                this.tweens.add({
                    targets: car,
                    alpha: 1,
                    ease: Phaser.Math.Easing.Linear,
                    duration: 150
                })
            }
            if (data.alreadyRacing) {
                this.actionPlaceOnTrack(park_place, data.parkingId, false)
            }
        } else {
            this.gameGUI.showSystemMessage(MainGame.GAME_TEXT.no_parking)
        }
        this.checkNextCar()
    }
    getTypeFastCar() {
        var vLvl = this.nextCarLevel - 1;
        switch (vLvl) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                return 1;
                break;
            case 6:
                return 2;
                break;
            case 7:
                return 3;
                break;
            case 8:
                return 3;
                break;
            case 9:
                return 4;
                break;
            case 10:
                return 4;
                break;
            case 11:
                return 5;
                break;
            default:
                return vLvl - 7;
                break
        }
    }
    getTypeBetterPrice() {
        var vLvl = this.nextCarLevel - 1;
        switch (vLvl) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                return 1;
                break;
            case 6:
            case 7:
            case 8:
                var price1 = this.getPriceCar(vLvl - 5);
                var price2 = this.getPriceCar(vLvl - 4);
                var type = vLvl - 5;
                if (price1 > price2 * .5) type = vLvl - 4;
                return type;
                break;
            default:
                var price1 = this.getPriceCar(vLvl - 6);
                var price2 = this.getPriceCar(vLvl - 5);
                var price3 = this.getPriceCar(vLvl - 4);
                var type = vLvl - 6;
                if (price1 > price2 * .5) type = vLvl - 5;
                if (price2 > price3 * .5) type = vLvl - 4;
                return type;
                break
        }
    }
    getTypeRandomBox() {
        var vLvl = this.getTypeFastCar() - 1;
        if (vLvl < 1) vLvl = 1;
        return vLvl
    }
    getFreeParking() {
        var placeNum = -1;
        for (var i = 0; i < this.LIMIT_parking; i++) {
            if (this.selectedCar) {
                if (this.selectedCar.id == i) {
                    continue
                }
            }
            if (!this.arParking[i].busy) {
                placeNum = i;
                break
            }
        }
        return placeNum
    }
    setSpriteText(vLayer, vNum) {
        vLayer.removeAll();
        var stringNum = vNum.toString();
        var arrayOfNum = stringNum.split("");
        var length = 0;
        var symb = null;
        var symsAr = [];
        for (var n in arrayOfNum) {
            symb = this.add.image(length, 2, "ss_cars", "num_" + arrayOfNum[n] + "_0000");
            symb.setScale(.9);
            symb.setOrigin(0, .5);
            vLayer.add(symb);
            symsAr.push(symb);
            length += symb.displayWidth - 4
        }
        var offsetX = 0;
        var totalLength = Math.floor(length * .5);
        for (var s in symsAr) {
            symsAr[s].x -= totalLength
        }
    }
    addDebugCircle() {
        var obj = this.add.graphics();
        obj.setDepth(this.DEPTH_GUI);
        return obj
    }
    updateDebugCircle(obj, vX, vY, progress) {
        progress *= 100;
        this.debugCircles.beginPath();
        this.debugCircles.arc(vX, vY + 25, 12, Phaser.Math.DegToRad(270.01), Phaser.Math.DegToRad((270 + progress * 3.6) % 360), false);
        this.debugCircles.strokePath()
    }
    clearDebugCicle() {
        this.debugCircles.clear();
        this.debugCircles.lineStyle(6, 3407616)
    }
    addParking(vData) {
        var icon_parking = this.add.image(vData.x, vData.y, "ss_cars", "icon_parking_0000");
        var highlighter = this.add.image(vData.x + this.HIGHLIGHTER_OFFSET.x, vData.y + this.HIGHLIGHTER_OFFSET.y, "ss_cars", "highlighted_car_0000");
        var icon_panel_number = this.add.image(vData.x, vData.y, "ss_cars", "panel_number_0000");
        var icon_return = this.add.image(vData.x + this.ICON_RETURN_OFFSET.x, vData.y + this.ICON_RETURN_OFFSET.y, "ss_cars", "btn_return_0000");
        var lemming = this.add.image(this.startPoint.x, this.startPoint.y, "ss_cars", "f1_0000");
        var effect_collect = this.add.sprite(vData.x, vData.y, "ss_main");
        effect_collect.play("money_collect");
        lemming.setDepth(this.DEPTH_racing_car);
        icon_parking.setDepth(this.DEPTH_platform);
        highlighter.setDepth(this.DEPTH_hightlight);
        effect_collect.setDepth(this.DEPTH_iconreturn);
        icon_return.setDepth(this.DEPTH_iconreturn);
        icon_panel_number.setDepth(this.DEPTH_iconreturn);
        var textNumberType = this.add.container();
        textNumberType.setDepth(this.DEPTH_iconreturn);
        lemming.progress = 0;
        lemming.speed = 0;
        lemming.pathDelta = 0;
        lemming.canEarn = true;
        lemming.prevPos = new Phaser.Math.Vector2;
        if (MainGame.isDebug && MainGame.showDebugCircle) {
            this.debugCircles = this.addDebugCircle()
        }
        icon_parking.visible = false;
        lemming.visible = false;
        icon_return.visible = false;
        highlighter.visible = false;
        icon_panel_number.visible = false;
        textNumberType.visible = false;
        effect_collect.visible = false;
        vData.btn_return = icon_return;
        vData.icon_parking = icon_parking;
        vData.highlighter = highlighter;
        vData.icon_panel_number = icon_panel_number;
        vData.textNumberType = textNumberType;
        vData.effect_collect = effect_collect;
        vData.lemming = lemming
    }
    updateTimerBonusSpeed() {
        this.countDownBonusSpeed--;
        this.gameGUI.updateIndcatorBoostSpeed(this.secToHHMMSS(this.countDownBonusSpeed));
        if (this.countDownBonusSpeed == 0) {
            this.activateTurbo(false)
        } else {
            this.updateIconFactorTurbo()
        }
        MainGame.cdBonusSpeed = this.countDownBonusSpeed;
        this.gameGUI.updateTurboBar(true)
    }
    updateIconFactorTurbo() {
        var update_factor = 2;
        if (this.countDownBonusSpeed > this.TIME_BOOST * 6) {
            update_factor = 3
        }
        if (this.FACTOR_TURBO != update_factor) {
            this.FACTOR_TURBO = update_factor;
            this.updateSpeedCars(true);
            this.gameGUI.textTurboFactor.setText("X" + this.FACTOR_TURBO)
        }
        if (this.countDownBonusSpeed > this.TIME_BOOST * 11) {
            this.gameGUI.buttonActivateTurbo.setEnable(false)
        } else {
            this.gameGUI.buttonActivateTurbo.setEnable(true)
        }
    }
    isTurboMax() {
        return this.countDownBonusSpeed > this.TIME_BOOST * 11
    }
    updateSpeedCars(bool) {
        this.isDoubleSpeed = bool || false;
        var countParking = this.LIMIT_parking;
        var parking;
        var speed;
        var prev_progress;
        for (var i = 0; i < countParking; i++) {
            parking = this.arParking[i];
            if (parking.racing) {
                var speed = this.getCarInfo(parking.type).speed;
                if (this.isDoubleSpeed) {
                    parking.lemming.speed = speed * this.FACTOR_TURBO
                } else {
                    parking.lemming.speed = speed
                }
            }
        }
        this.updateSpeedValue()
    }
    activateTurbo(bool, vTime, fromLoad) {
        vTime = vTime || this.TIME_BOOST;
        if (!fromLoad && bool && this.countDownBonusSpeed > 0) {
            this.countDownBonusSpeed += vTime;
            if (this.countDownBonusSpeed > this.TIME_BOOST * 12) {
                this.countDownBonusSpeed = this.TIME_BOOST * 12
            }
            this.gameGUI.updateIndcatorBoostSpeed(this.secToHHMMSS(this.countDownBonusSpeed));
            this.gameGUI.updateTurboBar();
            return
        }
        if (bool) {
            this.countDownBonusSpeed = vTime;
            this.gameGUI.updateIndcatorBoostSpeed(this.secToHHMMSS(this.countDownBonusSpeed));
            this.gameGUI.updateTurboBar();
            this.gameGUI.enableIndcatorBoostSpeed(true);
            this.timerBonusSpeed = this.time.addEvent({
                delay: 1e3,
                callback: this.updateTimerBonusSpeed,
                callbackScope: this,
                loop: true
            });
            this.updateIconFactorTurbo();
            MainGame.Sfx.play("sound", "boost");
            if (!MainGame.firstGo) MainGame.Sfx.play("music", "turbo")
        } else {
            this.gameGUI.enableIndcatorBoostSpeed(false);
            if (this.timerBonusSpeed) this.timerBonusSpeed.remove();
            if (!MainGame.firstGo) MainGame.Sfx.play("music", "main")
        }
        this.updateSpeedCars(bool)
    }
    initInputScrolling() {
        this.dragging = false;
        this.fling_enabled = true;
        this.isReadingMode = false;
        this.readingNode = -1;
        this.current_pos = {
            x: 0,
            y: 0
        };
        this.pressed_pos = {
            x: 0,
            y: 0
        };
        this.released_pos = {
            x: 0,
            y: 0
        };
        this.fling = {
            x: 0,
            y: 0
        };
        this.contentMaxY = this.contentHeight;
        this.timeConstant = 325
    }
    onInputDownShop(pointer) {
        if (!this.isShopAdded) return;
        if (!this.layerShop.visible) return;
        if (this.shopTabSelected != 1) return;
        var pos = this.getInputPosition(pointer);
        if (MainGame.isDesktop) {
            if (pos.y < 80) return;
            if (pos.x > 710 || pos.x < 260) return
        } else {
            if (pos.y < 230 || pos.y > 780) return;
            if (pos.x > 320 + 190 || pos.x < 320 - 230) return
        }
        this.dragging = true;
        this.pressed_pos.y = pos.y;
        this.pressed_time = Date.now();
        this.fling.y = 0
    }
    onInputUpShop(pointer) {
        if (!this.isShopAdded) return;
        if (!this.layerShop.visible) return;
        if (this.shopTabSelected != 1) return;
        var pos = this.getInputPosition(pointer);
        if (!this.dragging) return;
        this.dragging = false;
        this.current_pos.y = this.limit(this.current_pos.y + this.pressed_pos.y - pos.y);
        if (this.fling_enabled) {
            this.released_pos.y = pos.y;
            var delta_time = Date.now() - this.pressed_time;
            var distance = this.released_pos.y - this.pressed_pos.y;
            var delta = distance * Math.exp(-delta_time / this.timeConstant) * .2;
            if (Math.abs(delta) >= 30) this.fling.y = delta
        }
    }
    limit(posY) {
        posY = Math.min(posY, this.contentMaxY);
        posY = Math.max(posY, 0);
        return posY
    }
    onInputMoveShop(pointer) {
        if (!this.isShopAdded) return;
        if (!this.layerShop.visible) return;
        if (this.shopTabSelected != 1) return;
        var pos = this.getInputPosition(pointer);
        if (this.dragging) {
            var posY = this.current_pos.y + this.pressed_pos.y - pos.y;
            this.updatePositions(this.limit(posY))
        }
    }
    updatePositions(posY, isSkipUpdateSlider) {
        if (!isSkipUpdateSlider) {
            var percent = posY / this.contentMaxY * 100;
            this.slider.setSliderByValueForce(percent, 0)
        }
        this.layerShopContent.y = -posY;
        var itemIndex = Math.floor(posY / this.itemShop_WIDTH);
        if (this.arShopCars.length <= 0) return;
        var item;
        for (var i = 0; i < this.MAX_TYPES_CAR; i++) {
            item = this.arShopCars[i].item;
            if (item) {
                if (i < itemIndex || i > itemIndex + 6) {
                    item.visible = false
                } else {
                    item.visible = true
                }
            }
        }
    }
    getBarPosition(vPositionContent) {
        return Math.abs(vPositionContent / this.contentMaxY * 100)
    }
    updateScrollMap() {
        if (!this.dragging && this.fling_enabled && Math.abs(this.fling.y) > 0) {
            var posY = this.current_pos.y - this.fling.y;
            this.current_pos.y = this.limit(posY);
            this.updatePositions(this.current_pos.y);
            this.fling.y = MyMath.lerp(this.fling.y, 0, .04);
            if (Math.abs(this.fling.y) < .5) {
                this.fling.y = 0
            }
        }
    }
    initShop() {
        this.layerShop = this.add.container();
        this.layerShopContent = this.add.container();
        this.layerShopContent2 = this.add.container();
        this.layerShop.setDepth(this.DEPTH_layerShop);
        this.offset_shopY = 40;
        this.shopTabSelected = 1;
        this.layerShop.x = this.midX;
        this.layerShop.y = this.midY - this.offset_shopY;
        var fon_merge = this.add.image(0, 0 - 40, "ss_main", "bg_connect_0000");
        fon_merge.setScale(2);
        if (!MainGame.isDesktop) fon_merge.angle = 90;
        this.layerShop.add(fon_merge);
        var offsetX = 0;
        var fon_shop = this.add.image(offsetX, 0, "ss_cars", "popup_shop_0000");
        fon_shop.setScale(2);
        this.layerShop.add(fon_shop);
        var coin = this.add.image(-90 + offsetX, -246, "ss_cars", "money_0000");
        this.layerShop.add(coin);
        this.iconCoinShop = coin;
        var buttonClose = new Button(205 + offsetX, -246, "ss_cars", "btn_close_0000", this.closeShop, this);
        this.layerShop.add(buttonClose);
        fon_shop.setInteractive();
        fon_merge.setInteractive();
        fon_merge.on("pointerdown", this.inputOverShopDown, this);
        fon_merge.on("pointerup", this.inputOverShopUp, this);
        this.isInputOverShopDown = false;
        this.layerShop.add(this.layerShopContent);
        this.contentHeight = 0;
        this.itemShop_WIDTH = 120;
        this.arShopCars = [];
        var car;
        for (var i = 1; i <= this.MAX_TYPES_CAR; i++) {
            car = this.addShopItemMain(-20 + offsetX, this.itemShop_WIDTH * i - 270, i);
            this.arShopCars.push(car)
        }
        for (var i = 1; i <= this.MAX_TYPES_CAR; i++) {
            car = this.addShopItemText(offsetX, this.itemShop_WIDTH * i - 270, i)
        }
        this.contentHeight -= this.itemShop_WIDTH * 4;
        var text_shop = MainGame.addText(this, this.layerShop, -170 + offsetX, -249, MainGame.GAME_TEXT.shop, 27, true);
        MainGame.updateTextWidth(text_shop, 380);
        text_shop.setTint(10092543);
        this.textCoinsShop = MainGame.addText(this, this.layerShop, 20 + offsetX, -249, "192.640K", 29, true);
        this.textCoinsShop.setTint(16739941);
        var posMaskY = 110;
        if (!MainGame.isDesktop) posMaskY = 270;
        var graphicsMask = this.make.graphics();
        var color = 65535;
        graphicsMask.fillStyle(color);
        graphicsMask.fillRect(100 + offsetX, posMaskY - this.offset_shopY, 700, 475);
        this.layerShopContent.mask = new Phaser.Display.Masks.BitmapMask(this, graphicsMask);
        this.layerShop.visible = false;
        this.contentMaxY = this.contentHeight;
        this.isShopAdded = true;
        const slider = new HorizontalSlider({
            scene: this,
            x: 195 + offsetX,
            y: 25,
            current: 0,
            texture: "ss_cars",
            track: {
                frame: "scroll_bar1_0000",
                y: -4
            },
            slider: "scroll_bar2_0000"
        });
        slider.setAngle(90);
        this.layerShop.add(slider);
        slider.on("update", (slider, value, percent) => {
            var scrollPercent = Math.round(percent * 100);
            var newContentY = (slider.height - this.contentHeight) / 100 * scrollPercent;
            this.current_pos.y = -newContentY;
            this.updatePositions(-newContentY, true)
        }, this);
        this.slider = slider;
        this.input.on("wheel", (function(pointer, gameObjects, deltaX, deltaY, deltaZ) {
            if (MainGame.state.shopTabSelected != 1) return;
            MainGame.state.current_pos.y = MainGame.state.limit(MainGame.state.current_pos.y + deltaY * .5);
            var posY = MainGame.state.current_pos.y;
            MainGame.state.updatePositions(posY)
        }));
        this.updatePositions(0)
    }
    inputOverShopDown() {
        this.isInputOverShopDown = true
    }
    inputOverShopUp() {
        if (!this.isInputOverShopDown) return;
        this.closeShop();
        this.isInputOverShopDown = false
    }
    updatePrivilegiesFactors() {
        var lvlEarning = this.levelEarning;
        if (lvlEarning > 1) {
            var itemInfo1 = this.arLevelEarning[lvlEarning - 2];
            var num1 = 1 + itemInfo1.value * .01;
            this.factorEarning = Math.round((num1 + Number.EPSILON) * 100) / 100;
            this.gameGUI.updateEarning(this.factorEarning)
        }
        var lvlDiscount = this.levelDiscount;
        if (lvlDiscount > 1) {
            var itemInfo2 = this.arLevelDiscount[lvlDiscount - 2];
            var num2 = 1 - itemInfo2.value * .01;
            this.factorDiscount = Math.round((num2 + Number.EPSILON) * 100) / 100;
            this.text_discount.setText("-" + itemInfo2.value + "%");
            this.text_discount.visible = true;
            this.icon_discount.visible = true
        }
    }
    updatePrivilegiesItems() {
        return;
        var text_level = this.levelEarning;
        var itemInfo = null;
        var text_value = null;
        var number_warm = null;
        if (text_level <= 10) {
            itemInfo = this.arLevelEarning[this.levelEarning - 1];
            number_warm = this.convertNumberFormat(itemInfo.price)
        } else {
            text_level = 10;
            itemInfo = this.arLevelEarning[text_level - 1];
            this.itemPrivilege1.btn_text.x = 0;
            number_warm = MainGame.GAME_TEXT.max.toUpperCase();
            this.itemPrivilege1.btn.setEnable(false);
            this.itemPrivilege1.btn.back.visible = false
        }
        text_value = MainGame.replaceText(MainGame.GAME_TEXT.increase_proc, itemInfo.value).toUpperCase();
        this.itemPrivilege1.text_num.setText(text_level);
        this.itemPrivilege1.text_value.setText(text_value);
        this.itemPrivilege1.btn_text.setText(number_warm);
        text_level = this.levelDiscount;
        itemInfo = null;
        text_value = null;
        number_warm = null;
        if (text_level <= 10) {
            itemInfo = this.arLevelDiscount[this.levelDiscount - 1];
            number_warm = this.convertNumberFormat(itemInfo.price)
        } else {
            text_level = 10;
            itemInfo = this.arLevelDiscount[text_level - 1];
            this.itemPrivilege2.btn_text.x = 0;
            number_warm = MainGame.GAME_TEXT.max.toUpperCase();
            this.itemPrivilege2.btn.setEnable(false);
            this.itemPrivilege2.btn.back.visible = false
        }
        text_value = MainGame.replaceText(MainGame.GAME_TEXT.off_proc, itemInfo.value).toUpperCase();
        this.itemPrivilege2.text_num.setText(text_level);
        this.itemPrivilege2.text_value.setText(text_value);
        this.itemPrivilege2.btn_text.setText(number_warm)
    }
    addShopItemMain(vX, vY, vNum) {
        var item = this.add.container();
        this.layerShopContent.add(item);
        var plaha = this.add.image(vX, vY, "ss_cars", "window_car_0000");
        item.add(plaha);
        var car = this.add.image(vX - 100, vY, "ss_cars", "icon_f" + vNum + "_0000");
        item.add(car);
        var icon_coin = this.add.image(vX + 5, vY - 18, "ss_cars", "money_0000");
        icon_coin.setScale(.45);
        item.add(icon_coin);
        var buttonBuy = new ButtonText(vX + 95, vY + 25, "ss_cars", "btn_buy_shop_0000", this.clickBuyShopItem, this, "", vNum);
        item.add(buttonBuy);
        buttonBuy.text.setFontSize(24);
        buttonBuy.text.y = -7;
        buttonBuy.text.x = 25;
        buttonBuy.text.setOrigin(.5, .5);
        this.contentHeight += this.itemShop_WIDTH;
        return {
            item: item,
            car: car,
            btn: buttonBuy,
            btn_back: buttonBuy.back,
            btn_text: buttonBuy.text,
            icon_coin_earning: icon_coin
        }
    }
    addShopItemText(vX, vY, vNum) {
        var car = this.arShopCars[vNum - 1];
        var item = car.item;
        var text_num = MainGame.addText(this, item, vX - 185, vY - 45, vNum, 27);
        text_num.setTint(10092543);
        var textField_earning = MainGame.addText(this, item, vX + 12, vY - 40, MainGame.GAME_TEXT.earning, 16, true);
        MainGame.updateTextWidth(textField_earning, 180);
        textField_earning.setTint(10092543);
        var value_speed_coins = this.getCarCoins(vNum);
        var number_warm = this.convertNumberFormat(value_speed_coins);
        var value_earning = number_warm + "/" + MainGame.GAME_TEXT.sec + " ";
        var text_earning = MainGame.addText(this, item, vX + 2, vY - 19, value_earning, 16);
        MainGame.updateTextWidth(text_earning, 180);
        text_earning.setOrigin(0, .5);
        text_earning.setTint(10092543);
        car.textField_earning1 = textField_earning;
        car.textField_earning2 = text_earning
    }
    clickShopTab1() {
        this.shopTabSelected = 1;
        this.layerShopContent.visible = true;
        this.slider.visible = true;
        this.layerShopContent2.visible = false;
        this.buttonShopTab1.back.setFrame("btn_shop1_0000");
        this.buttonShopTab2.back.setFrame("btn_shop2_0000");
        this.updateShopItem()
    }
    clickShopTab2() {
        this.shopTabSelected = 2;
        this.layerShopContent.visible = false;
        this.slider.visible = false;
        this.layerShopContent2.visible = true;
        this.buttonShopTab1.back.setFrame("btn_shop2_0000");
        this.buttonShopTab2.back.setFrame("btn_shop1_0000")
    }
    clickBuyPrivilege1() {
        var itemInfo = this.arLevelEarning[this.levelEarning - 1];
        var priceUpdate = itemInfo.price;
        if (this.amount_coins < priceUpdate) {
            this.gameGUI.showSystemMessage(MainGame.GAME_TEXT.no_money);
            return
        }
        if (this.levelEarning > 10) return;
        this.levelEarning++;
        MainGame.levelEarning = this.levelEarning;
        this.amount_coins -= priceUpdate;
        var text_coins_warm = this.convertNumberFormat(this.amount_coins);
        this.gameGUI.updateCoins(text_coins_warm);
        this.updateShop(text_coins_warm);
        this.updatePrivilegiesFactors();
        this.updateSpeedValue();
        MainGame.saveSaves()
    }
    clickBuyPrivilege2() {
        var itemInfo = this.arLevelDiscount[this.levelDiscount - 1];
        var priceUpdate = itemInfo.price;
        if (this.amount_coins < priceUpdate) {
            this.gameGUI.showSystemMessage(MainGame.GAME_TEXT.no_money);
            return
        }
        if (this.levelDiscount > 10) return;
        this.levelDiscount++;
        MainGame.levelDiscount = this.levelDiscount;
        this.amount_coins -= priceUpdate;
        var text_coins_warm = this.convertNumberFormat(this.amount_coins);
        this.gameGUI.updateCoins(text_coins_warm);
        this.updateShop(text_coins_warm);
        this.updatePrivilegiesFactors();
        this.updateCarPrices();
        this.gameGUI.updateFastBuy();
        MainGame.saveSaves()
    }
    closeShop() {
        if (MainGame.isAPI) MainGame.API_POKI.commercialBreak();
        this.layerShop.visible = false;
        this.gameGUI.enableMainButtons()
    }
    updateShop(value) {
        if (!this.isShopAdded) return;
        this.textCoinsShop.setText(value);
        this.iconCoinShop.x = this.textCoinsShop.x - this.textCoinsShop.width * .5 - 35
    }
    updateShopItem() {
        if (!this.isShopAdded) return;
        var item;
        for (var i = 0; i < this.MAX_TYPES_CAR; i++) {
            item = this.arShopCars[i];
            if (i + 2 > this.nextCarLevel) {
                item.car.setTintFill(1513239);
                item.btn_back.setFrame("btn_buy_gray_0000");
                item.btn_text.setText("???");
                item.btn_text.setTint(16777215);
                MainGame.updateTextWidth(item.btn_text, 140);
                item.btn.disableInput();
                item.icon_coin_earning.visible = false;
                item.textField_earning1.visible = false;
                item.textField_earning2.visible = false
            } else {
                item.car.clearTint();
                item.icon_coin_earning.visible = true;
                item.textField_earning1.visible = true;
                item.textField_earning2.visible = true;
                if (i > 0 && this.nextCarLevel < i + 6) {
                    if (i == this.nextCarLevel - 5) {
                        if (this.ALLOW_ADS_CAR) {
                            item.btn_back.setFrame("btn_buy2_shop_0000");
                            item.btn_text.setText(" " + MainGame.GAME_TEXT.free.toUpperCase() + " ");
                            item.btn_text.setTint(16739941);
                            MainGame.updateTextWidth(item.btn_text, 100);
                            item.btn.enableInput();
                            if (MainGame.isAPI) {
                                if (MainGame.API_POKI && MainGame.API_POKI.api_isAdblock) item.btn.setEnable(false)
                            } else {
                                if (!MainGame.isDebug) item.btn.setEnable(false)
                            }
                        } else {
                            item.btn_back.setFrame("btn_buy_gray_0000");
                            item.btn_text.setText(MainGame.GAME_TEXT.unlock_car + " " + (i + 5));
                            item.btn_text.setTint(16777215);
                            MainGame.updateTextWidth(item.btn_text, 120);
                            item.btn.disableInput()
                        }
                    } else {
                        item.btn_back.setFrame("btn_buy_gray_0000");
                        item.btn_text.setText(MainGame.GAME_TEXT.unlock_car + " " + (i + 5));
                        item.btn_text.setTint(16777215);
                        MainGame.updateTextWidth(item.btn_text, 100);
                        item.btn.disableInput()
                    }
                } else {
                    item.btn_back.setFrame("btn_buy_shop_0000");
                    var price = Math.round(this.arCurrentPricesCar[i] * this.factorDiscount);
                    var number_warm = this.convertNumberFormat(price);
                    item.btn_text.setText(number_warm);
                    item.btn_text.setTint(16739941);
                    MainGame.updateTextWidth(item.btn_text, 100);
                    item.btn.enableInput()
                }
            }
        }
    }
    getWheelPrize(slices, degrees, backDegrees) {
        return slices - 1 - Math.floor((degrees - backDegrees) / (360 / slices))
    }
    initWheelOptions() {
        this.wheelOptions = {
            slices: 8,
            slicePrizes: ["reward_box4", "reward_turbo", "reward_boost", "reward_coin2", "reward_box8", "reward_turbo2", "reward_box6", "reward_coin1"],
            sliceProbability: [.2, .2, .2, .03, .08, .12, .12, .05],
            rotationTime: 3e3,
            rotationTimeRange: {
                min: 3e3,
                max: 4500
            },
            wheelRounds: {
                min: 2,
                max: 6
            },
            backSpin: {
                min: 2,
                max: 8
            }
        }
    }
    checkProbability(probs) {
        var summ = 0;
        for (var v in probs) {
            summ += probs[v]
        }
        return summ == 1
    }
    getTypeRewardBox() {
        var boxRandom = this.getTypeRandomBox();
        if (this.nextCarLevel < 6) {
            boxRandom = 1
        } else {
            boxRandom++
        }
        return boxRandom
    }
    getRewardCoinsHours(vCount) {
        var total_speed = this.updateSpeedValue(true);
        var coins = vCount * 3600 * total_speed;
        this.amount_coins += coins;
        var text_coins_warm = this.convertNumberFormat(this.amount_coins);
        this.gameGUI.updateCoins(text_coins_warm)
    }
    getRewards(vReward) {
        switch (vReward) {
            case "reward_diamonds1":
                MainGame.amount_diamonds += 10;
                this.gameGUI.updateDiamonds(MainGame.amount_diamonds);
                break;
            case "reward_diamonds2":
                MainGame.amount_diamonds += 25;
                this.gameGUI.updateDiamonds(MainGame.amount_diamonds);
                break;
            case "reward_diamonds3":
                MainGame.amount_diamonds += 50;
                this.gameGUI.updateDiamonds(MainGame.amount_diamonds);
                break;
            case "reward_diamonds4":
                MainGame.amount_diamonds += 100;
                this.gameGUI.updateDiamonds(MainGame.amount_diamonds);
                break;
            case "reward_coin1":
                this.getRewardCoinsHours(1);
                break;
            case "reward_coin2":
                this.getRewardCoinsHours(2);
                break;
            case "reward_coin3":
                this.getRewardCoinsHours(3);
                break;
            case "reward_boost":
            case "helicopter_coins":
                this.countDownBonusCoins += this.TIME_COINS;
                this.activateBoost(this.countDownBonusCoins);
                break;
            case "helicopter_boxes":
            case "reward_box4":
                var boxType = this.getTypeRewardBox();
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.saveBoxBuffer();
                break;
            case "reward_box6":
                var boxType = this.getTypeRewardBox();
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.saveBoxBuffer();
                break;
            case "reward_box8":
                var boxType = this.getTypeRewardBox();
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.addBoxToBuffer(boxType);
                this.saveBoxBuffer();
                break;
            case "reward_wheel":
                var item = MyMath.weightedRandom(this.wheelOptions.sliceProbability);
                if (item == 2 && this.isTurboMax()) item = 1;
                MainGame.reward_wheel = this.wheelOptions.slicePrizes[item];
                var rounds = Phaser.Math.Between(this.wheelOptions.wheelRounds.min, this.wheelOptions.wheelRounds.max);
                var backDegrees = Phaser.Math.Between(this.wheelOptions.backSpin.min, this.wheelOptions.backSpin.max);
                var degrees = 360 / this.wheelOptions.slices * item + Phaser.Math.Between(0, 29) + backDegrees;
                var duration1 = this.wheelOptions.rotationTime;
                var duration2 = 1500;
                MainGame.Sfx.play("sound", "fortune");
                this.gameGUI.tweenWheelFortune(rounds, degrees, backDegrees, duration1, duration2);
                if (this.freeTimeWheel > 0) {
                    this.freeTimeWheel--;
                    MainGame.freeTimeWheel = this.freeTimeWheel;
                    MainGame.saveSaves()
                }
                if (this.freeTimeWheel < MainGame.maxTimeWheel && this.countDownNextFree <= 0) {
                    this.countDownNextFree = this.TIME_NEXT_FREE
                }
                if (this.freeTimeWheel > 0) {
                    this.gameGUI.icon_free_fortune.visible = true
                } else {
                    this.gameGUI.icon_free_fortune.visible = false
                }
                this.gameGUI.updateFortunaWheelWindow(this.countDownNextFree);
                break;
            case "turbo":
            case "reward_turbo":
                this.activateTurbo(true);
                break;
            case "reward_turbo2":
                this.activateTurbo(true, this.TIME_BOOST * 2);
                break;
            case "coinsX2":
                this.amount_coins += this.value_offline_earning;
                var text_coins_warm = this.convertNumberFormat(this.amount_coins);
                this.gameGUI.updateCoins(text_coins_warm);
                this.updateShop(text_coins_warm);
                this.gameGUI.closeOfflineEarningWindow(true);
                break;
            case "freeCar":
                this.ALLOW_ADS_CAR = false;
                this.gameGUI.icon_adv.visible = false;
                if (this.num_ads_car > 0) {
                    this.addBoxToBuffer(this.num_ads_car);
                    this.updateShopItem();
                    MainGame.Sfx.play("sound", "buy")
                }
                this.num_ads_car = 0;
                break;
            case "freeUpgrade":
                if (this.parking_upgrade_id != null && this.parking_upgrade_type > 0) {
                    var parking = this.arParking[this.parking_upgrade_id];
                    parking.type = this.parking_upgrade_type;
                    this.setSpriteText(parking.textNumberType, parking.type);
                    parking.obj.setFrame("icon_f" + parking.type + "_0000");
                    var effect = this.add.sprite(parking.obj.x - 5, parking.obj.y + 2, "ss_main");
                    effect.setDepth(this.DEPTH_effect_unboxing);
                    effect.play("effect_connect");
                    this.checkNextCar();
                    MainGame.Sfx.play("sound", "boost")
                }
                this.parking_upgrade_id = null;
                this.parking_upgrade_type = 0;
                this.gameGUI.closeUpgadeWindow();
                break
        }
    }
    showAdsForFortunaWheel() {
        MainGame.isApiGameplayStop = true;
        MainGame.clickReward("reward_wheel");
        this.gameGUI.buttonFortunaWheel.setEnable(false)
    }
    showAdsForHelicopter(vTypeBonusDron) {
        MainGame.isApiGameplayStop = true;
        MainGame.clickReward("helicopter_" + vTypeBonusDron);
        this.gameGUI.boostBtnAds.setEnable(false)
    }
    showAdsForFreeUpgrade() {
        MainGame.isApiGameplayStop = true;
        MainGame.clickReward("freeUpgrade");
        this.gameGUI.buttonFreeUpgrade.setEnable(false)
    }
    showAdsForTurbo() {
        MainGame.isApiGameplayStop = false;
        MainGame.clickReward("turbo");
        this.gameGUI.buttonActivateTurbo.setEnable(false)
    }
    showAdsForCoinsX2() {
        MainGame.isApiGameplayStop = true;
        MainGame.clickReward("coinsX2");
        this.gameGUI.offlineEarningBtnAds.setEnable(false)
    }
    showAdsForCar() {
        MainGame.clickReward("freeCar")
    }
    goAllowAdsCar() {
        if (this.nextCarLevel < 6) return;
        if (this.ALLOW_ADS_CAR) return;
        this.ALLOW_ADS_CAR = true;
        this.num_ads_car = this.nextCarLevel - 4;
        this.updateShopItem();
        this.gameGUI.icon_adv.visible = true
    }
    updateAdsCar() {
        if (this.ALLOW_ADS_CAR) {
            this.num_ads_car = this.nextCarLevel - 4;
            this.updateShopItem()
        }
    }
    showHelicopter() {
        this.gameGUI.showHelicopter()
    }
    testAddBoxes() {
        this.addBoxToBuffer(2);
        this.addBoxToBuffer(2);
        this.addBoxToBuffer(2);
        this.addBoxToBuffer(2);
        this.saveBoxBuffer()
    }
    testLevelUp() {
        this.increaseLevel(this.exp_max)
    }
    testAddGun() {
        this.addBoxToBuffer(MainGame.debug_typeGun)
    }
    testCoinsHours(vCount) {
        if (!MainGame.isDebug) return;
        var total_speed = this.updateSpeedValue();
        var coins = vCount * 3600 * total_speed;
        var converted_value = this.convertNumberFormat(total_speed);
        this.amount_coins += coins;
        var text_coins_warm = this.convertNumberFormat(this.amount_coins);
        this.gameGUI.updateCoins(text_coins_warm);
        return "coins for " + vCount + "h : " + this.convertNumberFormat(coins)
    }
    testCarAds() {
        if (!MainGame.isDebug) return;
        var typeCar = this.nextCarLevel - 4;
        this.addObject({
            lvl: typeCar,
            fromShop: true
        }, true)
    }
}
GameGUI = function(link) {
    this.gameScreen = link;
    this.layerButtons = this.gameScreen.layerButtons
};
GameGUI.prototype.init = function() {
    _this = this.gameScreen;
    this.midX = _this.midX;
    this.midY = _this.midY;
    this.TIME_OPEN_POPUP = 200;
    this.isOnInputDown = false;
    this.isPopupOpened = false;
    this.buttonEnabled = true;
    this.typeDronBonus = "";
    this.scaleWindow1 = .7;
    this.scaleWindow2 = .85;
    this.posWindowY = -40;
    this.selectedGun = MainGame.selectedGun;
    this.isTweeningWheel = false;
    this.isTweeningHat = false;
    this.offsetCameraX = 0;
    this.offsetCameraY = 0;
    if (!MainGame.isDesktop) {
        this.scaleWindow1 = .7;
        this.scaleWindow2 = 1
    }
    this.initMainButtons();
    this.initBasketTrash();
    this.initCoinsPanel();
    this.initProgressBar();
    this.initLevelBar();
    this.initIndcatorBoostCoins();
    this.initIndcatorBoostSpeed();
    this.initCoinsText();
    this.initSystemMessage();
    this.initMergeAnimation();
    this.initTurboWindow();
    this.initBoosterWindow();
    this.initSettingsWindow();
    this.initUpgradeWindow();
    this.initOfflineEarningWindow();
    this.initLevelUpWindow();
    this.initFortunaWheelWindow();
    this.initRewardWindow();
    this.initHelicopter()
};
GameGUI.prototype.updateCamera = function(offsetX, offsetY) {
    _this = this.gameScreen;
    if (!MainGame.isDesktop) {
        this.offsetCameraX = offsetX;
        this.offsetCameraY = offsetY;
        this.buttonSettings.y = 55 - offsetY;
        this.buttonFortuna.y = 55 - offsetY + 85;
        this.layerPanelLevel.y = -offsetY;
        if (this.layerPanelLevel.y < -100) this.layerPanelLevel.y = -100;
        if (this.buttonSettings.y < -50) this.buttonSettings.y = -50;
        if (this.buttonFortuna.y < -50 + 85) this.buttonFortuna.y = -50 + 85;
        this.layerIndicatorCoins.y = 120 - offsetY;
        if (this.layerIndicatorCoins.y < 20) this.layerIndicatorCoins.y = 20;
        if (_this.countDownBonusCoins == 0) {
            this.layerIndicatorBoost.y = 120 - offsetY;
            if (this.layerIndicatorBoost.y < 20) this.layerIndicatorBoost.y = 20
        } else {
            this.layerIndicatorBoost.y = 120 + 115 - offsetY;
            if (this.layerIndicatorBoost.y < 20 + 115) this.layerIndicatorBoost.y = 20 + 115
        }
        this.layerPanelLevel.x = -offsetX;
        if (this.layerPanelLevel.x < -65 - 55) this.layerPanelLevel.x = -65 - 55;
        this.buttonSettings.x = 640 - 55 + offsetX;
        if (this.buttonSettings.x > 700) this.buttonSettings.x = 700;
        this.buttonFortuna.x = 640 - 55 + offsetX;
        if (this.buttonFortuna.x > 700) this.buttonFortuna.x = 700;
        this.layerIndicatorCoins.x = 55 - offsetX;
        if (this.layerIndicatorCoins.x < -65) this.layerIndicatorCoins.x = -65;
        this.layerIndicatorBoost.x = 55 - offsetX;
        if (this.layerIndicatorBoost.x < -65) this.layerIndicatorBoost.x = -65;
        this.icon_free_fortune.x = this.buttonFortuna.x - 35;
        this.icon_free_fortune.y = this.buttonFortuna.y - 24
    }
};
GameGUI.prototype.clickTest1 = function() {
    MainGame.state.activateTurbo(true)
};
GameGUI.prototype.clickTest2 = function() {
    MainGame.state.activateBoost()
};
GameGUI.prototype.clickTest3 = function() {
    MainGame.state.countDownBonusSpeed = 1
};
GameGUI.prototype.clickTest4 = function() {
    MainGame.state.countDownBonusCoins = 1
};
GameGUI.prototype.initMainButtons = function() {
    _this = this.gameScreen;
    var posX = 970;
    var posY = 420;
    if (!MainGame.isDesktop) {
        posX = 640 - 55;
        posY = 645
    }
    this.buttonSettings = new Button(posX, 55, "ss_main", "btn_settings_0000", this.openSettings, _this, this);
    this.buttonSettings.setDepth(_this.DEPTH_GUI);
    this.buttonFortuna = new Button(posX, 55 + 90, "ss_main", "btn_fortune_0000", this.openFortunaWheelWindow, _this, this);
    this.buttonFortuna.setDepth(_this.DEPTH_GUI);
    if (!MainGame.isDesktop) this.buttonFortuna.y = 55 + 85;
    var buttonAddCar = new ButtonText(this.midX, posY, "ss_main", "btn_big_0000", _this.buyFastCar, _this, "123.456");
    this.layerButtons.add(buttonAddCar);
    this.buttonAddCar = buttonAddCar;
    var icon_fast_car = _this.add.image(0, -32, "ss_cars", "icon_f1_0000");
    icon_fast_car.setScale(_this.getScaleCar(.8));
    buttonAddCar.add(icon_fast_car);
    var icon_fast_coin = _this.add.image(-35, 16, "ss_main", "money_0000");
    icon_fast_coin.setScale(.6);
    buttonAddCar.add(icon_fast_coin);
    buttonAddCar.text.setFontSize(26);
    this.buttonAddCar = buttonAddCar;
    this.icon_fast_car = icon_fast_car;
    this.icon_fast_coin = icon_fast_coin;
    var deltaX = 165;
    if (!MainGame.isDesktop) deltaX = 147;
    var buttonTurbo = new ButtonText(this.midX - deltaX, posY, "ss_main", "btn_turbo_0000", this.clickTurbo, _this, MainGame.GAME_TEXT.turbo, null, this);
    buttonTurbo.text.setFontSize(20);
    buttonTurbo.text.y = 19;
    MainGame.updateTextWidth(buttonTurbo.text, 85);
    this.layerButtons.add(buttonTurbo);
    this.buttonTurbo = buttonTurbo;
    var buttonShop = new ButtonText(this.midX + deltaX, posY, "ss_main", "btn_shop_0000", this.clickShop, _this, MainGame.GAME_TEXT.shop, null, this);
    buttonShop.text.setFontSize(20);
    buttonShop.text.y = 19;
    MainGame.updateTextWidth(buttonShop.text, 85);
    this.layerButtons.add(buttonShop);
    this.buttonShop = buttonShop;
    var icon_adv = _this.add.image(55, -15, "ss_main", "icon_adv_0000");
    buttonShop.add(icon_adv);
    this.icon_adv = icon_adv;
    icon_adv.angle = -4;
    if (!MainGame.isDesktop) {
        this.buttonAddCar.setOriginalScale(.9);
        this.buttonSettings.setOriginalScale(.9);
        this.buttonFortuna.setOriginalScale(.9);
        this.buttonShop.setOriginalScale(.9);
        this.buttonTurbo.setOriginalScale(.9)
    }
    _this.tweens.add({
        targets: icon_adv,
        scaleX: 1.15,
        scaleY: 1.15,
        ease: "Linear",
        duration: 400,
        yoyo: true,
        repeat: -1
    });
    _this.tweens.add({
        targets: icon_adv,
        angle: 4,
        ease: "Linear",
        duration: 400,
        yoyo: true,
        repeat: -1
    });
    this.icon_adv.visible = false;
    var icon_free_fortune = _this.add.image(this.buttonFortuna.x - 45, this.buttonFortuna.y - 17, "ss_main", "icon_adv_0000");
    icon_free_fortune.setDepth(_this.DEPTH_GUI);
    this.icon_free_fortune = icon_free_fortune;
    icon_adv.angle = -4;
    _this.tweens.add({
        targets: icon_free_fortune,
        scaleX: 1.15,
        scaleY: 1.15,
        ease: "Linear",
        duration: 400,
        yoyo: true,
        repeat: -1
    });
    _this.tweens.add({
        targets: icon_free_fortune,
        angle: 4,
        ease: "Linear",
        duration: 400,
        yoyo: true,
        repeat: -1
    });
    this.icon_free_fortune.visible = false
};
GameGUI.prototype.enableMainButtons = function() {
    this.buttonEnabled = true;
    this.buttonFortuna.enableInput();
    this.buttonShop.enableInput();
    this.buttonTurbo.enableInput();
    this.buttonSettings.enableInput();
    _this = this.gameScreen;
    if (_this.isGoTutorial && (_this.tutorialStep >= 3 && _this.tutorialStep <= 5)) return;
    this.buttonAddCar.enableInput()
};
GameGUI.prototype.disableMainButtons = function(vSkipApiEvent) {
    this.buttonEnabled = false;
    this.isOnInputDown = false;
    this.isPopupOpened = false;
    this.buttonFortuna.disableInput();
    this.buttonAddCar.disableInput();
    this.buttonTurbo.disableInput();
    this.buttonShop.disableInput();
    this.buttonSettings.disableInput();
    if (MainGame.isAPI && !vSkipApiEvent) {
        MainGame.isApiGameplayStop = true;
        MainGame.API_POKI.gameplayStop()
    }
};
GameGUI.prototype.initCoinsPanel = function() {
    _this = this.gameScreen;
    var posX = 170;
    var posY = 38;
    if (!MainGame.isDesktop) {
        posX = this.midX + 40;
        posY = 125
    }
    var coin = _this.add.image(posX - 110, posY, "ss_main", "money_0000");
    this.textCoins = _this.add.bitmapText(posX - 80, posY - 3, "NEXTART", "192.640K", 34);
    this.textCoins.setOrigin(0, .5);
    this.textCoins.setTint(16739941);
    this.textSpeed = _this.add.bitmapText(posX - 80, posY + 29, "NEXTART", "8.177/SEC", 22);
    this.textSpeed.setOrigin(0, .5);
    this.textSpeed.setTint(10092543);
    this.icons_coin = coin;
    this.icons_coin.setDepth(_this.DEPTH_GUI);
    this.textCoins.setDepth(_this.DEPTH_text_field);
    this.textSpeed.setDepth(_this.DEPTH_text_field)
};
GameGUI.prototype.updateEarning = function(vValue) {
    this.text_value_earning.setText("X" + vValue);
    this.icon_earnings.visible = true;
    this.text_value_earning.visible = true;
    this.text_earning.visible = true
};
GameGUI.prototype.updateCoins = function(vValue) {
    this.textCoins.setText(vValue)
};
GameGUI.prototype.updateSpeedValue = function(vValue) {
    this.textSpeed.setText(vValue)
};
GameGUI.prototype.initProgressBar = function() {
    _this = this.gameScreen;
    var midX = this.midX;
    var offsetX = -10;
    var posY = 105;
    if (!MainGame.isDesktop) {
        offsetX = -30;
        posY = 192
    }
    this.layerProgressCar = _this.add.container();
    var effect_readyMerge = _this.add.sprite(midX + offsetX, posY, "ss_main");
    effect_readyMerge.play("nextcar3");
    effect_readyMerge.visible = false;
    this.effect_readyMerge = effect_readyMerge;
    this.nextcarBarB = _this.add.image(midX + offsetX, posY, "ss_main", "nextcar1_0000");
    this.nextcarBarT = _this.add.image(midX + offsetX, posY, "ss_main", "nextcar2_0000");
    this.iconCircleNextCar = _this.add.image(midX + offsetX + 195, posY, "ss_main", "icon_nextcar_0000");
    this.nextcarBarT_crop = new Phaser.Geom.Rectangle(0, 0, 0, this.nextcarBarT.height);
    this.nextcarBarT.setCrop(this.nextcarBarT_crop);
    this.textProgressNextCar = _this.add.bitmapText(midX + 5 + offsetX, posY - 10, "NEXTART", "0%", 18);
    this.textProgressNextCar.setOrigin(.5, .5);
    this.textProgressNextCar.setTint(10092543);
    this.textLevelNextCar = _this.add.bitmapText(this.iconCircleNextCar.x - 37, this.iconCircleNextCar.y - 3, "NEXTART", _this.nextCarLevel, 24);
    this.textLevelNextCar.setOrigin(.5, .5);
    this.textLevelNextCar.setTint(16777215);
    this.layerProgressCar.add(this.nextcarBarB);
    this.layerProgressCar.add(this.nextcarBarT);
    this.layerProgressCar.add(this.effect_readyMerge);
    this.layerProgressCar.add(this.iconCircleNextCar);
    this.layerProgressCar.add(this.textProgressNextCar);
    this.layerProgressCar.add(this.textLevelNextCar);
    this.layerProgressCar.setDepth(_this.DEPTH_text_field)
};
GameGUI.prototype.updateProgress = function(progress) {
    var originalWidth = this.nextcarBarT.width;
    var width = originalWidth * progress;
    this.nextcarBarT_crop.width = width;
    this.nextcarBarT.setCrop(this.nextcarBarT_crop);
    this.textProgressNextCar.setText(Math.floor(progress * 100) + "%");
    if (progress == 1) {
        this.effect_readyMerge.visible = true
    } else {
        this.effect_readyMerge.visible = false
    }
};
GameGUI.prototype.initLevelBar = function() {
    _this = this.gameScreen;
    this.layerPanelLevel = _this.add.container();
    var pos = {
        x: 75,
        y: 115
    };
    if (!MainGame.isDesktop) {
        pos.x = 55;
        pos.y = 35
    }
    this.levelBarB = _this.add.image(pos.x + 55, pos.y + 12, "ss_main", "exp1_0000");
    this.levelBarT = _this.add.image(pos.x + 55, pos.y + 12, "ss_main", "exp2_0000");
    this.levelBarT_crop = new Phaser.Geom.Rectangle(0, 0, 0, this.levelBarT.height);
    this.levelBarT.setCrop(this.levelBarT_crop);
    this.textLevel = _this.add.bitmapText(pos.x + 3, pos.y, "NEXTART", _this.currentLevel, 40);
    this.textLevel.setOrigin(1, .5);
    this.textLevel.setTint(3080068);
    var text_level = MainGame.addText(_this, this.layerPanelLevel, pos.x + 12, pos.y - 9, MainGame.GAME_TEXT.level, 18, true);
    text_level.setOrigin(0, .5);
    text_level.setTint(3080068);
    MainGame.updateTextWidth(text_level, 400);
    this.layerPanelLevel.add(this.levelBarB);
    this.layerPanelLevel.add(this.levelBarT);
    this.layerPanelLevel.add(this.textLevel);
    this.layerPanelLevel.setDepth(_this.DEPTH_layerLevelBar)
};
GameGUI.prototype.updateLevel = function(progress, delay) {
    _this = this.gameScreen;
    var originalWidth = this.levelBarT.width;
    var width = originalWidth * progress;
    delay = delay || 0;
    _this.tweens.killTweensOf(this.levelBarT_crop);
    _this.tweens.add({
        targets: this.levelBarT_crop,
        width: width,
        ease: Phaser.Math.Easing.Linear,
        duration: 200,
        delay: delay,
        onUpdate: () => {
            this.levelBarT.setCrop(this.levelBarT_crop)
        }
    })
};
GameGUI.prototype.initIndcatorBoostCoins = function() {
    _this = this.gameScreen;
    this.layerIndicatorCoins = _this.add.container();
    this.layerIndicatorCoins.setDepth(_this.DEPTH_text_field);
    this.layerIndicatorCoins.x = 80;
    this.layerIndicatorCoins.y = 200;
    if (!MainGame.isDesktop) {
        this.layerIndicatorCoins.x = 55;
        this.layerIndicatorCoins.y = 120
    }
    var icon = _this.add.image(0, 0, "ss_main", "indicator_money_0000");
    var star_bonus = _this.add.image(40, 15, "ss_main", "star_bonus_0000");
    this.layerIndicatorCoins.add(icon);
    this.layerIndicatorCoins.add(star_bonus);
    var txt_x = MainGame.addText(_this, this.layerIndicatorCoins, star_bonus.x - 2, star_bonus.y - 5, "X5", 22);
    txt_x.setTint(0);
    var txt = MainGame.addText(_this, this.layerIndicatorCoins, 0, 52, "", 18);
    txt.setText(_this.secToHHMMSS(105));
    txt.setTint(10092543);
    this.layerIndicatorCoins.visible = false;
    this.textFieldIndicatorCoins = txt
};
GameGUI.prototype.enableIndcatorBoostCoins = function(bool) {
    _this = this.gameScreen;
    this.layerIndicatorCoins.visible = bool;
    this.updateIndicatorsBonus("coins_x5", bool)
};
GameGUI.prototype.updateIndcatorBoostCoins = function(vValue) {
    this.textFieldIndicatorCoins.setText(vValue)
};
GameGUI.prototype.initIndcatorBoostSpeed = function() {
    _this = this.gameScreen;
    this.layerIndicatorBoost = _this.add.container();
    this.layerIndicatorBoost.setDepth(_this.DEPTH_text_field);
    this.layerIndicatorBoost.x = 80;
    this.layerIndicatorBoost.y = 200 + 115;
    if (!MainGame.isDesktop) {
        this.layerIndicatorBoost.x = 55;
        this.layerIndicatorBoost.y = 120 + 115
    }
    var icon = _this.add.image(0, 0, "ss_main", "indicator_boost_0000");
    var star_bonus = _this.add.image(40, 15, "ss_main", "star_bonus_0000");
    this.layerIndicatorBoost.add(icon);
    this.layerIndicatorBoost.add(star_bonus);
    var txt_x = MainGame.addText(_this, this.layerIndicatorBoost, star_bonus.x - 2, star_bonus.y - 5, "X2", 22);
    txt_x.setTint(0);
    this.textTurboFactor = txt_x;
    var txt = MainGame.addText(_this, this.layerIndicatorBoost, 0, 52, "", 18);
    txt.setText(_this.secToHHMMSS(59));
    txt.setTint(10092543);
    this.layerIndicatorBoost.visible = false;
    this.textFieldIndicatorBoost = txt
};
GameGUI.prototype.enableIndcatorBoostSpeed = function(bool) {
    _this = this.gameScreen;
    this.layerIndicatorBoost.visible = bool;
    this.updateIndicatorsBonus("speed_x2", bool)
};
GameGUI.prototype.updateIndcatorBoostSpeed = function(vValue) {
    this.textFieldIndicatorBoost.setText(vValue)
};
GameGUI.prototype.updateIndicatorsBonus = function(type, bool) {
    _this = this.gameScreen;
    var posY = 200;
    if (!MainGame.isDesktop) {
        posY = 120
    }
    if (type == "speed_x2") {
        if (bool) {
            if (_this.countDownBonusCoins == 0) {
                this.layerIndicatorBoost.y = posY
            } else {
                this.layerIndicatorBoost.y = posY + 115
            }
        } else {
            if (_this.countDownBonusSpeed == 0) {
                this.layerIndicatorCoins.y = posY
            }
        }
    } else if (type == "coins_x5") {
        if (bool) {
            if (_this.countDownBonusSpeed == 0) {
                this.layerIndicatorCoins.y = posY
            } else {
                this.layerIndicatorCoins.y = posY + 115
            }
        } else {
            if (_this.countDownBonusCoins == 0) {
                this.layerIndicatorBoost.y = posY
            }
        }
    }
    this.updateCamera(this.offsetCameraX, this.offsetCameraY)
};
GameGUI.prototype.initBasketTrash = function() {
    _this = this.gameScreen;
    var posX = 970;
    var posY = 507;
    if (!MainGame.isDesktop) {
        posX = this.midX;
        posY = 730
    }
    this.icon_trash = _this.add.image(posX, posY, "ss_main", "btn_delete_0000");
    var effect = _this.add.sprite(this.icon_trash.x - 1, this.icon_trash.y - 6, "ss_main");
    effect.play("delete_flash");
    effect.visible = false;
    this.delete_flash = effect;
    this.icon_trash.setDepth(_this.DEPTH_GUI);
    this.delete_flash.setDepth(_this.DEPTH_GUI);
    if (!MainGame.isDesktop) {
        this.icon_trash.setScale(.9);
        this.delete_flash.setScale(.9)
    }
};
GameGUI.prototype.initCoinsText = function() {
    _this = this.gameScreen;
    this.list_textCoins = [];
    for (var i = 0; i < _this.MAX_PARKING; i++) {
        var obj = this.addTextCoin(0, 0);
        this.list_textCoins.push(obj)
    }
};
GameGUI.prototype.addTextCoin = function(vX, vY) {
    _this = this.gameScreen;
    var txt = _this.add.bitmapText(vX, vY, "NEXTART", "");
    txt.setFontSize(26);
    txt.setOrigin(.5, 1);
    txt.setDepth(_this.DEPTH_text_coins);
    txt.visible = false;
    return txt
};
GameGUI.prototype.showCoinText = function(vNum, vValue, vX, vY) {
    _this = this.gameScreen;
    var obj = this.list_textCoins[vNum];
    obj.x = vX;
    obj.y = vY + 10;
    var text_coins_warm = MainGame.convertNumberFormat(vValue);
    obj.setText("+" + text_coins_warm);
    obj.visible = true;
    obj.setAlpha(.2);
    obj.setScale(.8);
    _this.tweens.killTweensOf(obj);
    _this.tweens.add({
        targets: obj,
        alpha: 1,
        ease: "Linear",
        duration: 150
    });
    _this.tweens.add({
        targets: obj,
        scaleX: 1,
        scaleY: 1,
        ease: "Linear",
        duration: 150
    });
    _this.tweens.add({
        targets: obj,
        alpha: 0,
        ease: "Linear",
        delay: 300,
        duration: 300,
        onComplete: function() {
            obj.visible = false
        }
    });
    _this.tweens.add({
        targets: obj,
        y: obj.y - 30,
        ease: "Linear",
        duration: 600
    })
};
GameGUI.prototype.initSystemMessage = function() {
    _this = this.gameScreen;
    this.textSystemContainer = _this.add.container();
    this.textSystemContainer.x = this.midX;
    this.textSystemContainer.y = MainGame.world.centerY - 100;
    var txt = _this.add.bitmapText(0, 0, "NEXTART", "");
    txt.setDropShadow(3, 3, 0, 1);
    txt.setOrigin(.5);
    txt.setMaxWidth(550);
    txt.setCenterAlign();
    txt.setFontSize(34);
    txt.setTint(16773120);
    this.textSystemContainer.add(txt);
    this.textSystemContainer.setDepth(_this.DEPTH_systemtext);
    this.textSystemContainer.visible = false;
    this.textSystem = txt
};
GameGUI.prototype.showSystemMessage = function(vText) {
    _this = this.gameScreen;
    this.textSystemContainer.visible = true;
    this.textSystem.setText(vText);
    this.textSystemContainer.alpha = .2;
    this.textSystemContainer.y = this.midY - 20;
    this.textSystemContainer.setScale(.8);
    _this.tweens.killTweensOf(this.textSystemContainer);
    _this.tweens.add({
        targets: this.textSystemContainer,
        alpha: 1,
        ease: "Linear",
        duration: 150
    });
    _this.tweens.add({
        targets: this.textSystemContainer,
        scaleX: 1,
        scaleY: 1,
        ease: "Linear",
        duration: 150
    });
    _this.tweens.add({
        targets: this.textSystemContainer,
        alpha: 0,
        ease: "Linear",
        delay: 1500,
        duration: 200,
        onComplete: this.finishSystemTextTween
    });
    _this.tweens.add({
        targets: this.textSystemContainer,
        y: this.textSystemContainer.y - 20,
        ease: "Linear",
        delay: 150,
        duration: 1200
    })
};
GameGUI.prototype.finishSystemTextTween = function() {
    MainGame.state.gameGUI.textSystemContainer.visible = false
};
GameGUI.prototype.updateFastBuy = function() {
    _this = this.gameScreen;
    var typeFastCar = _this.getTypeBetterPrice();
    var price = _this.getPriceCar(typeFastCar);
    price = Math.round(price * _this.factorDiscount);
    var text_coins_warm = MainGame.convertNumberFormat(price);
    this.buttonAddCar.text.setText(text_coins_warm);
    this.buttonAddCar.text.x = 10;
    this.buttonAddCar.text.y = 15;
    this.icon_fast_coin.x = this.buttonAddCar.text.x - this.buttonAddCar.text.width * .5 - 20;
    this.icon_fast_car.setFrame("icon_f" + typeFastCar + "_0000")
};
GameGUI.prototype.initHelicopter = function() {
    _this = this.gameScreen;
    this.helicopter = _this.add.container();
    this.heli_shadow = _this.add.container();
    this.heli_body = _this.add.container();
    this.helicopter.add(this.heli_shadow);
    this.helicopter.add(this.heli_body);
    this.helicopter.setInteractive(new Phaser.Geom.Circle(0, 0, 80), Phaser.Geom.Circle.Contains);
    this.helicopter.on("pointerup", this.onClickHelicopter, this);
    this.helicopter.setDepth(_this.DEPTH_helicopter);
    this.helicopter.x = 900;
    this.helicopter.y = 300;
    var shadow = _this.add.image(0, 100, "ss_main", "booster_shadow_0000");
    var dron_body = _this.add.image(0, 0, "ss_main", "booster_0000");
    var propeller1 = _this.add.sprite(0, dron_body.y + 43, "ss_main");
    propeller1.play("propeller1");
    this.heli_shadow.add(shadow);
    this.heli_body.add(propeller1);
    this.heli_body.add(dron_body);
    this.dron_body = dron_body;
    this.dron_propeller = propeller1;
    this.helicopter.visible = false
};
GameGUI.prototype.showHelicopter = function() {
    this.isShowHelicopter = true;
    this.helicopter.visible = true;
    this.countHelicopterFly = 3;
    this.flagHelicopter = Math.random() >= .5;
    if (this.flagHelicopter) {
        this.helicopter.x = this.midX + 500
    } else {
        this.helicopter.x = this.midX - 500
    }
    this.waveCount = 0;
    this.waveStart = 2 * Math.random()
};
GameGUI.prototype.updateHelicopter = function() {
    if (!this.isShowHelicopter) return;
    this.waveCount += .02;
    this.helicopter.y = 250 + Math.sin(this.waveStart + this.waveCount) * 50;
    if (this.flagHelicopter) {
        this.dron_body.angle = Phaser.Math.RadToDeg(Math.sin(this.waveCount) * .07) - 5
    } else {
        this.dron_body.angle = Phaser.Math.RadToDeg(Math.sin(this.waveCount) * .07) + 5
    }
    this.dron_propeller.angle = this.dron_body.angle;
    if (this.flagHelicopter) {
        this.helicopter.x -= 1;
        if (this.helicopter.x < this.midX - 500) {
            this.flagHelicopter = false;
            this.countHelicopterFly--;
            if (this.countHelicopterFly == 0) {
                this.isShowHelicopter = false;
                this.helicopter.visible = false
            }
        }
    } else {
        this.helicopter.x += 1;
        if (this.helicopter.x > this.midX + 500) {
            this.flagHelicopter = true;
            this.countHelicopterFly--;
            if (this.countHelicopterFly == 0) {
                this.isShowHelicopter = false;
                this.helicopter.visible = false
            }
        }
    }
};
GameGUI.prototype.onClickHelicopter = function() {
    if (!this.buttonEnabled) return;
    _this = this.gameScreen;
    this.showBoosterWindow(_this.helicopterBonus);
    if (_this.helicopterBonus == "coins") {
        _this.helicopterBonus = "boxes"
    } else {
        _this.helicopterBonus = "coins"
    }
};
GameGUI.prototype.onFonInputDown = function() {
    this.isOnInputDown = true
};
GameGUI.prototype.onPopupOpen = function() {
    this.isPopupOpened = true
};
GameGUI.prototype.onFonInputUp = function() {
    if (!this.isOnInputDown) return;
    if (!this.isPopupOpened) return;
    this.eventFonImputUp()
};
GameGUI.prototype.initUpgradeWindow = function() {
    _this = this.gameScreen;
    this.layerUpgradeWindowMain = _this.add.container();
    this.layerUpgradeWindow = _this.add.container();
    this.layerUpgradeWindowMain.setDepth(_this.DEPTH_layerMerge);
    this.layerUpgradeWindow.setDepth(_this.DEPTH_layerUnlock);
    this.layerUpgradeWindow.x = this.midX;
    this.layerUpgradeWindow.y = this.midY + this.posWindowY;
    var fon_merge = _this.add.image(this.midX, this.midY - 40, "ss_main", "bg_connect_0000");
    fon_merge.setScale(2);
    if (!MainGame.isDesktop) fon_merge.angle = 90;
    this.layerUpgradeWindowMain.add(fon_merge);
    var fon_unlock = _this.add.image(0, 0, "ss_main", "popup_unlocked_0000");
    fon_unlock.setScale(2);
    this.layerUpgradeWindow.add(fon_unlock);
    var posX = 0;
    var posY = -10;
    var effect = _this.add.sprite(140, posY, "ss_main");
    effect.play("magic_1");
    effect.setScale(2);
    this.layerUpgradeWindow.add(effect);
    var arrow_icon = _this.add.sprite(posX + 0, posY + 0, "ss_main");
    arrow_icon.play("arrow");
    this.layerUpgradeWindow.add(arrow_icon);
    var panel_number1 = _this.add.image(posX - 135 - 50, posY - 100, "ss_main", "panel_number_0000");
    this.layerUpgradeWindow.add(panel_number1);
    var panel_number2 = _this.add.image(posX + 135 - 50, posY - 100, "ss_main", "panel_number_0000");
    this.layerUpgradeWindow.add(panel_number2);
    var buttonClose = new Button(226, -224, "ss_main", "btn_close_0000", this.closeUpgadeWindow, _this, this);
    this.layerUpgradeWindow.add(buttonClose);
    var buttonContinue = new ButtonText(0, 200, "ss_main", "btn_buy2_0000", _this.showAdsForFreeUpgrade, _this, MainGame.GAME_TEXT.free);
    buttonContinue.text.setFontSize(28);
    buttonContinue.text.x = -20;
    buttonContinue.text.y = -5;
    this.layerUpgradeWindow.add(buttonContinue);
    MainGame.updateTextWidth(buttonContinue.text, 200);
    this.buttonFreeUpgrade = buttonContinue;
    var icon_reward = _this.add.image(75, -2, "ss_main", "icon_reward_0000");
    buttonContinue.add(icon_reward);
    var text_title = MainGame.addText(_this, this.layerUpgradeWindow, 0, -227, MainGame.GAME_TEXT.free_upgrade, 34, true);
    MainGame.updateTextWidth(text_title, 400);
    text_title.setTint(10092543);
    var text_level1 = MainGame.addText(_this, this.layerUpgradeWindow, panel_number1.x + 70, panel_number1.y - 2, MainGame.GAME_TEXT.level, 24, true);
    MainGame.updateTextWidth(text_level1, 400);
    text_level1.setTint(10092543);
    var text_level2 = MainGame.addText(_this, this.layerUpgradeWindow, panel_number2.x + 70, panel_number1.y - 2, MainGame.GAME_TEXT.level, 24, true);
    MainGame.updateTextWidth(text_level2, 400);
    text_level2.setTint(10092543);
    var text_levelGun1 = MainGame.addText(_this, this.layerUpgradeWindow, panel_number1.x - 1, panel_number1.y - 2, "12", 24);
    text_levelGun1.setTint(0);
    var text_levelGun2 = MainGame.addText(_this, this.layerUpgradeWindow, panel_number2.x - 1, panel_number2.y - 2, "34", 24);
    text_levelGun2.setTint(0);
    this.text_levelGun1 = text_levelGun1;
    this.text_levelGun2 = text_levelGun2;
    this.layerUpgradeWindow.setScale(this.scaleWindow2);
    this.layerUpgradeWindowMain.visible = false;
    this.layerUpgradeWindow.visible = false;
    var gun1 = _this.add.image(-140 + 10, posY, "ss_cars", "icon_f1_0000");
    gun1.setScale(1.2);
    this.layerUpgradeWindow.add(gun1);
    var gun2 = _this.add.image(140, posY, "ss_cars", "icon_f1_0000");
    gun2.setScale(1.2);
    this.layerUpgradeWindow.add(gun2);
    this.gun1 = gun1;
    this.gun2 = gun2;
    fon_unlock.setInteractive();
    fon_merge.setInteractive();
    fon_merge.on("pointerdown", this.onFonInputDown, this);
    fon_merge.on("pointerup", this.onFonInputUp, this)
};
GameGUI.prototype.showUpgradeWindow = function(vLevelGun) {
    _this = this.gameScreen;
    this.layerUpgradeWindowMain.visible = true;
    this.layerUpgradeWindow.visible = true;
    this.layerUpgradeWindow.setScale(this.scaleWindow1);
    _this.tweens.add({
        targets: this.layerUpgradeWindow,
        scaleX: this.scaleWindow2,
        scaleY: this.scaleWindow2,
        ease: Phaser.Math.Easing.Back.Out,
        duration: 400
    });
    var lvl_left = vLevelGun;
    var lvl_right = vLevelGun + 2;
    this.text_levelGun1.setText(lvl_left);
    this.text_levelGun2.setText(lvl_right);
    this.gun1.setFrame("icon_f" + lvl_left + "_0000");
    this.gun2.setFrame("icon_f" + lvl_right + "_0000");
    this.buttonFreeUpgrade.setEnable(true);
    this.disableMainButtons();
    this.eventFonImputUp = this.closeUpgadeWindow;
    _this.time.delayedCall(this.TIME_OPEN_POPUP, this.onPopupOpen, [], this)
};
GameGUI.prototype.closeUpgadeWindow = function() {
    if (MainGame.isAPI) MainGame.API_POKI.commercialBreak();
    this.layerUpgradeWindowMain.visible = false;
    this.layerUpgradeWindow.visible = false;
    this.enableMainButtons()
};
GameGUI.prototype.initTurboWindow = function() {
    _this = this.gameScreen;
    this.layerTurboWindowMain = _this.add.container();
    this.layerTurboWindow = _this.add.container();
    this.layerTurboWindowMain.setDepth(_this.DEPTH_layerMerge);
    this.layerTurboWindow.setDepth(_this.DEPTH_layerUnlock);
    this.layerTurboWindow.x = this.midX;
    this.layerTurboWindow.y = this.midY + this.posWindowY;
    var fon_merge = _this.add.image(this.midX, this.midY - 40, "ss_main", "bg_connect_0000");
    fon_merge.setScale(2);
    if (!MainGame.isDesktop) fon_merge.angle = 90;
    this.layerTurboWindowMain.add(fon_merge);
    var fon_unlock = _this.add.image(0, 0, "ss_main", "popup_unlocked_0000");
    fon_unlock.setScale(2);
    this.layerTurboWindow.add(fon_unlock);
    var posX = 0;
    var posY = -75;
    var effect = _this.add.sprite(posX + 5, posY + 5 + 10, "ss_main");
    effect.play("magic_1");
    effect.setScale(2);
    this.layerTurboWindow.add(effect);
    var window_icon = _this.add.image(posX + 20, posY + 10, "ss_main", "indicator_big_boost_0000");
    this.layerTurboWindow.add(window_icon);
    this.turboBarB = _this.add.image(0, 75, "ss_main", "bar_turbo1_0000");
    this.turboBarT = _this.add.image(0, 75, "ss_main", "bar_turbo2_0000");
    this.turboBarT_crop = new Phaser.Geom.Rectangle(0, 0, 0, this.turboBarT.height);
    this.turboBarT.setCrop(this.turboBarT_crop);
    this.layerTurboWindow.add(this.turboBarB);
    this.layerTurboWindow.add(this.turboBarT);
    var buttonClose = new Button(226, -224, "ss_main", "btn_close_0000", this.closeTurbo, _this, this);
    this.layerTurboWindow.add(buttonClose);
    var buttonContinue = new ButtonText(0, 195, "ss_main", "btn_buy2_0000", _this.showAdsForTurbo, _this, MainGame.GAME_TEXT.free);
    buttonContinue.text.setFontSize(28);
    buttonContinue.text.x = -20;
    buttonContinue.text.y = -5;
    this.layerTurboWindow.add(buttonContinue);
    MainGame.updateTextWidth(buttonContinue.text, 200);
    this.buttonActivateTurbo = buttonContinue;
    var icon_reward = _this.add.image(80, -2, "ss_main", "icon_reward_0000");
    buttonContinue.add(icon_reward);
    var txt_X2 = MainGame.addText(_this, this.layerTurboWindow, -100, 40, "X2", 30, true);
    var txt_X3 = MainGame.addText(_this, this.layerTurboWindow, 100, 40, "X3", 30, true);
    txt_X2.setTint(3080068);
    txt_X3.setTint(16773120);
    var text_add_turbo_seconds = MainGame.addText(_this, this.layerTurboWindow, 0, 125, MainGame.GAME_TEXT.add_turbo_seconds, 22, true);
    MainGame.updateTextWidth(text_add_turbo_seconds, 400);
    text_add_turbo_seconds.setTint(10092543);
    var text_title = MainGame.addText(_this, this.layerTurboWindow, 0, -227, MainGame.GAME_TEXT.turbo, 34, true);
    MainGame.updateTextWidth(text_title, 400);
    text_title.setTint(10092543);
    this.layerTurboWindowMain.visible = false;
    this.layerTurboWindow.visible = false;
    fon_unlock.setInteractive();
    fon_merge.setInteractive();
    fon_merge.on("pointerdown", this.onFonInputDown, this);
    fon_merge.on("pointerup", this.onFonInputUp, this);
    this.layerTurboWindow.setScale(this.scaleWindow2)
};
GameGUI.prototype.updateTurboBar = function(vForce) {
    _this = this.gameScreen;
    var max_value = 12 * _this.TIME_BOOST;
    var progress = _this.countDownBonusSpeed / max_value;
    var originalWidth = this.turboBarT.width;
    var width = originalWidth * progress;
    _this.tweens.killTweensOf(this.turboBarT_crop);
    if (vForce) {
        this.turboBarT_crop.width = width;
        this.turboBarT.setCrop(this.turboBarT_crop);
        return
    }
    _this.tweens.add({
        targets: this.turboBarT_crop,
        width: width,
        ease: Phaser.Math.Easing.Linear,
        duration: 200,
        delay: 0,
        onUpdate: () => {
            this.turboBarT.setCrop(this.turboBarT_crop)
        }
    })
};
GameGUI.prototype.clickTurbo = function() {
    this.layerTurboWindowMain.visible = true;
    this.layerTurboWindow.visible = true;
    this.disableMainButtons();
    if (MainGame.isAPI) {
        if (MainGame.API_POKI && MainGame.API_POKI.api_isAdblock) this.buttonActivateTurbo.setEnable(false)
    } else {
        if (!MainGame.isDebug) this.buttonActivateTurbo.setEnable(false)
    }
    this.showBanner();
    this.eventFonImputUp = this.closeTurbo;
    _this.time.delayedCall(this.TIME_OPEN_POPUP, this.onPopupOpen, [], this)
};
GameGUI.prototype.closeTurbo = function() {
    MainGame.isApiGameplayStop = true;
    if (MainGame.isAPI) MainGame.API_POKI.commercialBreak();
    this.layerTurboWindowMain.visible = false;
    this.layerTurboWindow.visible = false;
    this.enableMainButtons()
};
GameGUI.prototype.initBoosterWindow = function() {
    _this = this.gameScreen;
    this.layerBoosterWindowMain = _this.add.container();
    this.layerBoosterWindow = _this.add.container();
    this.layerBoosterWindowMain.setDepth(_this.DEPTH_layerMerge);
    this.layerBoosterWindow.setDepth(_this.DEPTH_layerUnlock);
    this.layerBoosterWindow.x = this.midX;
    this.layerBoosterWindow.y = this.midY + this.posWindowY;
    var fon_merge = _this.add.image(this.midX, this.midY - 40, "ss_main", "bg_connect_0000");
    fon_merge.setScale(2);
    if (!MainGame.isDesktop) fon_merge.angle = 90;
    this.layerBoosterWindowMain.add(fon_merge);
    var popup_drop = _this.add.sprite(0, 0, "ss_main", "popup_drop_0000");
    popup_drop.setScale(2);
    this.layerBoosterWindow.add(popup_drop);
    var effect = _this.add.sprite(0 + 5, -20, "ss_main");
    effect.play("magic_1");
    effect.setScale(2);
    this.layerBoosterWindow.add(effect);
    var few_coins = _this.add.image(100, 5, "ss_main", "few_coins_0000");
    this.layerBoosterWindow.add(few_coins);
    var box2 = _this.add.image(85, 10, "ss_main", "box2_0000");
    this.layerBoosterWindow.add(box2);
    var helicopter_icon = _this.add.image(-64, -45, "ss_main", "helicopter_icon_0000");
    this.layerBoosterWindow.add(helicopter_icon);
    var buttonClose = new Button(226, -187, "ss_main", "btn_close_0000", this.closeBoost, _this, this);
    this.layerBoosterWindow.add(buttonClose);
    var buttonContinue = new ButtonText(0, 152, "ss_main", "btn_buy2_0000", this.clickBoost, _this, MainGame.GAME_TEXT.activate, null, this);
    buttonContinue.text.setFontSize(28);
    buttonContinue.text.x = -23;
    buttonContinue.text.y = -5;
    this.layerBoosterWindow.add(buttonContinue);
    MainGame.updateTextWidth(buttonContinue.text, 200);
    var icon_reward = _this.add.image(80, -2, "ss_main", "icon_reward_0000");
    buttonContinue.add(icon_reward);
    this.boostBtnAds = buttonContinue;
    var text1 = MainGame.addText(_this, this.layerBoosterWindow, 0, -190, MainGame.GAME_TEXT.boost_message, 30, true);
    MainGame.updateTextWidth(text1, 380);
    text1.setTint(10092543);
    var text2 = MainGame.addText(_this, this.layerBoosterWindow, 0, 85, MainGame.GAME_TEXT.better_drop, 24, true);
    MainGame.updateTextWidth(text2, 480);
    text2.setTint(10092543);
    var text3 = MainGame.addText(_this, this.layerBoosterWindow, few_coins.x + 33, few_coins.y + 12, "X" + _this.value_boost, 30);
    text3.setTint(0);
    var text4 = MainGame.addText(_this, this.layerBoosterWindow, 0, 85, MainGame.GAME_TEXT.cars_4, 24, true);
    MainGame.updateTextWidth(text4, 480);
    text4.setTint(10092543);
    this.boosterWindowIconCoins = few_coins;
    this.boosterWindowTextCoins1 = text2;
    this.boosterWindowTextCoins2 = text3;
    this.boosterWindowIconBox = box2;
    this.boosterWindowTextBox = text4;
    this.layerBoosterWindowMain.visible = false;
    this.layerBoosterWindow.visible = false;
    popup_drop.setInteractive();
    fon_merge.setInteractive();
    fon_merge.on("pointerdown", this.onFonInputDown, this);
    fon_merge.on("pointerup", this.onFonInputUp, this)
};
GameGUI.prototype.showBoosterWindow = function(vBonus) {
    _this = this.gameScreen;
    this.typeDronBonus = vBonus;
    this.boosterWindowIconCoins.visible = false;
    this.boosterWindowTextCoins1.visible = false;
    this.boosterWindowTextCoins2.visible = false;
    this.boosterWindowIconBox.visible = false;
    this.boosterWindowTextBox.visible = false;
    if (this.typeDronBonus == "coins") {
        this.boosterWindowIconCoins.visible = true;
        this.boosterWindowTextCoins1.visible = true;
        this.boosterWindowTextCoins2.visible = true
    } else {
        this.boosterWindowIconBox.visible = true;
        this.boosterWindowTextBox.visible = true
    }
    this.isShowHelicopter = false;
    this.helicopter.visible = false;
    this.layerBoosterWindow.visible = true;
    this.layerBoosterWindowMain.visible = true;
    this.layerBoosterWindow.setScale(this.scaleWindow1);
    _this.tweens.add({
        targets: this.layerBoosterWindow,
        scaleX: this.scaleWindow2,
        scaleY: this.scaleWindow2,
        ease: Phaser.Math.Easing.Back.Out,
        duration: 400
    });
    this.disableMainButtons();
    this.boostBtnAds.setEnable(true);
    if (MainGame.isAPI) {
        if (MainGame.API_POKI && MainGame.API_POKI.api_isAdblock) this.boostBtnAds.setEnable(false)
    } else {
        if (!MainGame.isDebug) this.boostBtnAds.setEnable(false)
    }
    this.showBanner();
    this.eventFonImputUp = this.closeBoost;
    _this.time.delayedCall(this.TIME_OPEN_POPUP, this.onPopupOpen, [], this)
};
GameGUI.prototype.clickBoost = function() {
    _this = this.gameScreen;
    this.layerBoosterWindow.visible = false;
    this.layerBoosterWindowMain.visible = false;
    _this.showAdsForHelicopter(this.typeDronBonus);
    this.enableMainButtons()
};
GameGUI.prototype.closeBoost = function() {
    if (MainGame.isAPI) MainGame.API_POKI.commercialBreak();
    this.layerBoosterWindow.visible = false;
    this.layerBoosterWindowMain.visible = false;
    this.enableMainButtons()
};
GameGUI.prototype.initSettingsWindow = function() {
    _this = this.gameScreen;
    this.layerSettingsWindowMain = _this.add.container();
    this.layerSettingsWindow = _this.add.container();
    this.layerSettingsWindowMain.setDepth(_this.DEPTH_layerMerge);
    this.layerSettingsWindow.setDepth(_this.DEPTH_layerUnlock);
    this.layerSettingsWindow.x = this.midX;
    this.layerSettingsWindow.y = this.midY + this.posWindowY;
    var fon_merge = _this.add.image(this.midX, this.midY - 40, "ss_main", "bg_connect_0000");
    fon_merge.setScale(2);
    if (!MainGame.isDesktop) fon_merge.angle = 90;
    this.layerSettingsWindowMain.add(fon_merge);
    var popup_drop = _this.add.image(0, 0, "ss_main", "popup_unlocked_0000");
    popup_drop.setScale(2);
    this.layerSettingsWindow.add(popup_drop);
    var logo_tbs = _this.add.image(0, 85, "ss_main", "logo_tbs_0000");
    this.layerSettingsWindow.add(logo_tbs);
    var buttonMuteMusic = new ButtonText(0, -130, "ss_main", "btn_buy_0000", this.clickMuteMusic, _this, MainGame.GAME_TEXT.music_on, null, this);
    buttonMuteMusic.text.setFontSize(26);
    buttonMuteMusic.text.x = 20;
    buttonMuteMusic.text.y = -6;
    this.layerSettingsWindow.add(buttonMuteMusic);
    MainGame.updateTextWidth(buttonMuteMusic.text, 140);
    var icon_music = _this.add.image(-85, -5, "ss_main", "btn_music_0000");
    buttonMuteMusic.add(icon_music);
    this.buttonMuteMusic = buttonMuteMusic;
    this.buttonMuteMusic.icon = icon_music;
    var buttonMuteSound = new ButtonText(0, buttonMuteMusic.y + 80, "ss_main", "btn_buy_0000", this.clickMuteSound, _this, MainGame.GAME_TEXT.sound_on, null, this);
    buttonMuteSound.text.setFontSize(26);
    buttonMuteSound.text.x = 20;
    buttonMuteSound.text.y = -6;
    this.layerSettingsWindow.add(buttonMuteSound);
    MainGame.updateTextWidth(buttonMuteSound.text, 140);
    var icon_sound = _this.add.image(-85, -5, "ss_main", "btn_sound_0000");
    buttonMuteSound.add(icon_sound);
    this.buttonMuteSound = buttonMuteSound;
    this.buttonMuteSound.icon = icon_sound;
    var buttonClose = new Button(226, -224, "ss_main", "btn_close_0000", this.closeSettings, _this, this);
    this.layerSettingsWindow.add(buttonClose);
    var text_title = MainGame.addText(_this, this.layerSettingsWindow, 0, -227, MainGame.GAME_TEXT.settings, 30, true);
    MainGame.updateTextWidth(text_title, 380);
    text_title.setTint(10092543);
    var textDevs = MainGame.addText(_this, this.layerSettingsWindow, 0, logo_tbs.y - 70, MainGame.GAME_TEXT.developed_by, 24, true);
    MainGame.updateTextWidth(textDevs, 380);
    textDevs.setTint(10092543);
    var textMusic = MainGame.addText(_this, this.layerSettingsWindow, 0, 170, MainGame.GAME_TEXT.music_by, 24, true);
    MainGame.updateTextWidth(textMusic, 380);
    textMusic.setTint(10092543);
    var text_musian = MainGame.addText(_this, this.layerSettingsWindow, 0, textMusic.y + 35, "GRIN DANILOV", 24, true);
    text_musian.setTint(10092543);
    this.layerSettingsWindow.setScale(this.scaleWindow2);
    this.layerSettingsWindowMain.visible = false;
    this.layerSettingsWindow.visible = false;
    var text_v = MainGame.addText(_this, this.layerSettingsWindow, 210, 235, MainGame.version, 18);
    text_v.setTint(10092543);
    popup_drop.setInteractive();
    fon_merge.setInteractive();
    fon_merge.on("pointerdown", this.onFonInputDown, this);
    fon_merge.on("pointerup", this.onFonInputUp, this)
};
GameGUI.prototype.openSettings = function() {
    _this = this.gameScreen;
    this.layerSettingsWindowMain.visible = true;
    this.layerSettingsWindow.visible = true;
    this.layerSettingsWindow.setScale(this.scaleWindow1);
    _this.tweens.add({
        targets: this.layerSettingsWindow,
        scaleX: this.scaleWindow2,
        scaleY: this.scaleWindow2,
        ease: Phaser.Math.Easing.Back.Out,
        duration: 400
    });
    this.disableMainButtons();
    MainGame.Sfx.update("music", this.buttonMuteMusic.icon, this.buttonMuteMusic.text);
    MainGame.Sfx.update("sound", this.buttonMuteSound.icon, this.buttonMuteSound.text);
    this.eventFonImputUp = this.closeSettings;
    _this.time.delayedCall(this.TIME_OPEN_POPUP, this.onPopupOpen, [], this)
};
GameGUI.prototype.closeSettings = function() {
    if (MainGame.isAPI) MainGame.API_POKI.gameplayStart();
    this.layerSettingsWindowMain.visible = false;
    this.layerSettingsWindow.visible = false;
    this.enableMainButtons()
};
GameGUI.prototype.initOfflineEarningWindow = function() {
    _this = this.gameScreen;
    this.layerOfflineEarningWindowMain = _this.add.container();
    this.layerOfflineEarningWindow = _this.add.container();
    this.layerOfflineEarningWindowMain.setDepth(_this.DEPTH_layerMerge);
    this.layerOfflineEarningWindow.setDepth(_this.DEPTH_layerUnlock);
    this.layerOfflineEarningWindow.x = this.midX;
    this.layerOfflineEarningWindow.y = this.midY + this.posWindowY;
    var fon_merge = _this.add.image(this.midX, this.midY - 40, "ss_main", "bg_connect_0000");
    fon_merge.setScale(2);
    if (!MainGame.isDesktop) fon_merge.angle = 90;
    this.layerOfflineEarningWindowMain.add(fon_merge);
    var fon_unlock = _this.add.image(0, 0, "ss_main", "popup_unlocked_0000");
    fon_unlock.setScale(2);
    this.layerOfflineEarningWindow.add(fon_unlock);
    var posX = 0;
    var posY = -65;
    var effect = _this.add.sprite(posX + 5, posY + 5, "ss_main");
    effect.play("magic_1");
    effect.setScale(2);
    this.layerOfflineEarningWindow.add(effect);
    var lvlup_icon = _this.add.image(posX - 5, posY + 5, "ss_main", "offline_coins_0000");
    this.layerOfflineEarningWindow.add(lvlup_icon);
    var text_title = MainGame.addText(_this, this.layerOfflineEarningWindow, 0, -227, MainGame.GAME_TEXT.offline_earn, 34, true);
    MainGame.updateTextWidth(text_title, 400);
    text_title.setTint(10092543);
    var offline_earning_text = MainGame.addText(_this, this.layerOfflineEarningWindow, 0, 70, "+458K", 40, true);
    offline_earning_text.setTint(16739941);
    this.offline_earning_text = offline_earning_text;
    var buttonClose = new ButtonText(0, 220, "ss_main", "btn_buy2_0000", this.closeOfflineEarningWindow, _this, MainGame.GAME_TEXT.tap_continue, null, this);
    buttonClose.text.setFontSize(20);
    this.layerOfflineEarningWindow.add(buttonClose);
    MainGame.updateTextWidth(buttonClose.text, 320);
    buttonClose.text.y = -4;
    buttonClose.back.alpha = .01;
    buttonClose.text.setTint(10092543);
    var buttonContinue = new ButtonText(0, 150, "ss_main", "btn_buy2_0000", _this.showAdsForCoinsX2, _this, MainGame.GAME_TEXT.coins_x2);
    buttonContinue.text.setFontSize(28);
    this.layerOfflineEarningWindow.add(buttonContinue);
    MainGame.updateTextWidth(buttonContinue.text, 200);
    buttonContinue.text.x = -20;
    buttonContinue.text.y = -5;
    var icon_reward = _this.add.image(80, -2, "ss_main", "icon_reward_0000");
    buttonContinue.add(icon_reward);
    this.offlineEarningBtnAds = buttonContinue;
    this.layerOfflineEarningWindow.setScale(this.scaleWindow2);
    this.layerOfflineEarningWindowMain.visible = false;
    this.layerOfflineEarningWindow.visible = false;
    fon_unlock.setInteractive();
    fon_merge.setInteractive();
    fon_merge.on("pointerdown", this.onFonInputDown, this);
    fon_merge.on("pointerup", this.onFonInputUp, this)
};
GameGUI.prototype.showOfflineEarningWindow = function(vValueCoins) {
    _this = this.gameScreen;
    this.layerOfflineEarningWindow.visible = true;
    this.layerOfflineEarningWindowMain.visible = true;
    this.layerOfflineEarningWindow.setScale(this.scaleWindow1);
    _this.tweens.add({
        targets: this.layerOfflineEarningWindow,
        scaleX: this.scaleWindow2,
        scaleY: this.scaleWindow2,
        ease: Phaser.Math.Easing.Back.Out,
        duration: 400
    });
    this.disableMainButtons(true);
    var coins = vValueCoins;
    var text_coins_warm = MainGame.convertNumberFormat(coins);
    this.offline_earning_text.setText("+" + text_coins_warm);
    MainGame.Sfx.play("sound", "offline_earning");
    if (MainGame.isAPI) {
        if (MainGame.API_POKI && MainGame.API_POKI.api_isAdblock) this.offlineEarningBtnAds.setEnable(false)
    } else {
        if (!MainGame.isDebug) this.offlineEarningBtnAds.setEnable(false)
    }
    this.eventFonImputUp = this.closeOfflineEarningWindowOutAir;
    _this.time.delayedCall(this.TIME_OPEN_POPUP, this.onPopupOpen, [], this)
};
GameGUI.prototype.closeOfflineEarningWindowOutAir = function() {
    MainGame.isApiGameplayStop = true;
    if (MainGame.isAPI) MainGame.API_POKI.commercialBreak();
    this.layerOfflineEarningWindowMain.visible = false;
    this.layerOfflineEarningWindow.visible = false;
    this.enableMainButtons()
};
GameGUI.prototype.closeOfflineEarningWindow = function(isSkipCallAds) {
    MainGame.isApiGameplayStop = true;
    if (!isSkipCallAds && MainGame.isAPI) MainGame.API_POKI.commercialBreak();
    this.layerOfflineEarningWindowMain.visible = false;
    this.layerOfflineEarningWindow.visible = false;
    this.enableMainButtons()
};
GameGUI.prototype.initLevelUpWindow = function() {
    _this = this.gameScreen;
    this.layerLevelUpWindowMain = _this.add.container();
    this.layerLevelUpWindow = _this.add.container();
    this.layerLevelUpWindowMain.setDepth(_this.DEPTH_layerMerge);
    this.layerLevelUpWindow.setDepth(_this.DEPTH_layerUnlock);
    this.layerLevelUpWindow.x = this.midX;
    this.layerLevelUpWindow.y = this.midY + this.posWindowY;
    var fon_merge = _this.add.image(this.midX, this.midY - 40, "ss_main", "bg_connect_0000");
    fon_merge.setScale(2);
    if (!MainGame.isDesktop) fon_merge.angle = 90;
    this.layerLevelUpWindowMain.add(fon_merge);
    var fon_unlock = _this.add.image(0, 0, "ss_main", "popup_unlocked_0000");
    fon_unlock.setScale(2);
    this.layerLevelUpWindow.add(fon_unlock);
    var posX = 0;
    var posY = -85;
    var effect = _this.add.sprite(posX + 5 + 5, posY, "ss_main");
    effect.play("magic_1");
    effect.setScale(2);
    this.layerLevelUpWindow.add(effect);
    var lvlup_icon = _this.add.image(posX + 5, posY, "ss_main", "lvlup_0000");
    this.layerLevelUpWindow.add(lvlup_icon);
    var icon_newparking = _this.add.image(-75, 100, "ss_main", "icon_newparking_0000");
    this.layerLevelUpWindow.add(icon_newparking);
    var icon_newmoney = _this.add.image(75, 100, "ss_main", "icon_newmoney_0000");
    this.layerLevelUpWindow.add(icon_newmoney);
    var buttonContinue = new ButtonText(0, 200, "ss_main", "btn_buy_0000", this.closeLevelUpWindow, _this, MainGame.GAME_TEXT.continue, null, this);
    buttonContinue.text.setFontSize(28);
    this.layerLevelUpWindow.add(buttonContinue);
    MainGame.updateTextWidth(buttonContinue.text, 200);
    buttonContinue.text.y = -7;
    var text_title = MainGame.addText(_this, this.layerLevelUpWindow, 0, -227, MainGame.GAME_TEXT.level_up, 34, true);
    MainGame.updateTextWidth(text_title, 400);
    text_title.setTint(10092543);
    var text_getnew = MainGame.addText(_this, this.layerLevelUpWindow, 0, 15, MainGame.GAME_TEXT.get_new, 30, true);
    MainGame.updateTextWidth(text_getnew, 400);
    text_getnew.setTint(16773120);
    this.levelup_text_level = MainGame.addText(_this, this.layerLevelUpWindow, posX, posY - 10, "48", 56, true);
    this.levelup_text_level.setTint(0);
    var levelup_text_parking = MainGame.addText(_this, this.layerLevelUpWindow, icon_newparking.x, icon_newparking.y + 25, "+1", 26, true);
    levelup_text_parking.setTint(0);
    var levelup_text_money = MainGame.addText(_this, this.layerLevelUpWindow, icon_newmoney.x, icon_newmoney.y + 20, "148k", 26, true);
    levelup_text_money.setTint(0);
    this.icon_newparking = icon_newparking;
    this.icon_newmoney = icon_newmoney;
    this.levelup_text_parking = levelup_text_parking;
    this.levelup_text_money = levelup_text_money;
    this.layerLevelUpWindow.setScale(this.scaleWindow2);
    this.layerLevelUpWindow.visible = false;
    this.layerLevelUpWindowMain.visible = false;
    fon_unlock.setInteractive();
    fon_merge.setInteractive();
    fon_merge.on("pointerdown", this.onFonInputDown, this);
    fon_merge.on("pointerup", this.onFonInputUp, this)
};
GameGUI.prototype.showLevelUpRewards1 = function() {
    this.icon_newparking.x = 0;
    this.levelup_text_parking.x = this.icon_newparking.x - 5;
    this.icon_newparking.visible = true;
    this.levelup_text_parking.visible = true
};
GameGUI.prototype.showLevelUpRewards2 = function() {
    _this = this.gameScreen;
    this.levelup_text_money.visible = true;
    this.icon_newmoney.visible = true;
    this.icon_newmoney.x = 0;
    this.levelup_text_money.x = 0;
    var coins = _this.getCoinsLevelUp(_this.currentLevel);
    var text_coins_warm = MainGame.convertNumberFormat(coins);
    this.levelup_text_money.setText(text_coins_warm);
    _this.amount_coins += coins;
    text_coins_warm = MainGame.convertNumberFormat(_this.amount_coins);
    this.updateCoins(text_coins_warm);
    _this.updateShop(text_coins_warm)
};
GameGUI.prototype.showLevelUpWindow = function() {
    _this = this.gameScreen;
    this.layerLevelUpWindow.visible = true;
    this.layerLevelUpWindowMain.visible = true;
    this.layerLevelUpWindow.setScale(this.scaleWindow1);
    _this.tweens.add({
        targets: this.layerLevelUpWindow,
        scaleX: this.scaleWindow2,
        scaleY: this.scaleWindow2,
        ease: Phaser.Math.Easing.Back.Out,
        duration: 400
    });
    this.disableMainButtons();
    this.icon_newparking.visible = false;
    this.icon_newmoney.visible = false;
    this.levelup_text_parking.visible = false;
    this.levelup_text_money.visible = false;
    if (_this.currentLevel < 10) {
        this.showLevelUpRewards1()
    } else {
        this.showLevelUpRewards2()
    }
    this.levelup_text_level.setText(" " + _this.currentLevel + " ");
    MainGame.Sfx.play("sound", "level_up");
    this.showBanner();
    this.eventFonImputUp = this.closeLevelUpWindow;
    _this.time.delayedCall(this.TIME_OPEN_POPUP, this.onPopupOpen, [], this)
};
GameGUI.prototype.closeLevelUpWindow = function() {
    if (MainGame.isAPI) MainGame.API_POKI.commercialBreak();
    this.layerLevelUpWindow.visible = false;
    this.layerLevelUpWindowMain.visible = false;
    this.enableMainButtons()
};
GameGUI.prototype.initMergeAnimation = function() {
    _this = this.gameScreen;
    this.layerMerge = _this.add.container();
    this.layerUnlocked = _this.add.container();
    this.layerMerge.setDepth(_this.DEPTH_layerMerge);
    this.layerUnlocked.setDepth(_this.DEPTH_layerUnlock);
    this.layerUnlocked.x = this.midX;
    this.layerUnlocked.y = this.midY + this.posWindowY;
    var fon_merge = _this.add.image(this.midX, this.midY - 40, "ss_main", "bg_connect_0000");
    fon_merge.setScale(2);
    if (!MainGame.isDesktop) fon_merge.angle = 90;
    this.layerMerge.add(fon_merge);
    var fon_unlock = _this.add.image(0, 0, "ss_main", "popup_unlocked_0000");
    fon_unlock.setScale(2);
    this.layerUnlocked.add(fon_unlock);
    var effect = _this.add.sprite(0 + 5, 0 - 30, "ss_main");
    effect.play("magic_1");
    effect.setScale(2);
    this.layerUnlocked.add(effect);
    var unlocked_car = _this.add.image(0, 0 - 30, "ss_cars", "icon_f35_0000");
    unlocked_car.setScale(1.5);
    this.layerUnlocked.add(unlocked_car);
    this.unlocked_car = unlocked_car;
    var car1_merge = _this.add.image(this.midX - 160, this.midY - 40, "ss_cars", "icon_f1_0000");
    car1_merge.setScale(1.2);
    this.car1_merge = car1_merge;
    var car2_merge = _this.add.image(this.midX + 160, this.midY - 40, "ss_cars", "icon_f1_0000");
    car2_merge.setScale(1.2);
    this.car2_merge = car2_merge;
    this.layerMerge.add(car1_merge);
    this.layerMerge.add(car2_merge);
    var star_flash1 = _this.add.image(0, 0, "ss_main", "star_flash_0000");
    this.layerUnlocked.add(star_flash1);
    this.star_flash1 = star_flash1;
    var star_flash2 = _this.add.image(0, 0, "ss_main", "star_flash_0000");
    this.layerUnlocked.add(star_flash2);
    this.star_flash2 = star_flash2;
    var star_flash3 = _this.add.image(0, 0, "ss_main", "star_flash_0000");
    this.layerUnlocked.add(star_flash3);
    this.star_flash3 = star_flash3;
    _this.tweens.add({
        targets: star_flash1,
        scaleX: .1,
        scaleY: .1,
        ease: "Linear",
        duration: 500,
        yoyo: true,
        repeat: -1
    });
    _this.tweens.add({
        targets: star_flash2,
        scaleX: .1,
        scaleY: .1,
        ease: "Linear",
        duration: 500,
        yoyo: true,
        repeat: -1
    });
    _this.tweens.add({
        targets: star_flash3,
        scaleX: .1,
        scaleY: .1,
        ease: "Linear",
        duration: 500,
        yoyo: true,
        repeat: -1
    });
    var coin = _this.add.image(-70, 118, "ss_main", "money_0000");
    coin.setScale(.5);
    this.layerUnlocked.add(coin);
    this.coin_merge_window = coin;
    var back_car = _this.add.image(150, 50, "ss_cars", "icon_f2_0000");
    this.layerUnlocked.add(back_car);
    back_car.setScale(_this.getScaleCar(.8));
    back_car.setTintFill(16739941);
    this.back_car = back_car;
    var buttonContinue = new ButtonText(0, 200, "ss_main", "btn_buy_0000", this.clickContinueUnlocked, _this, MainGame.GAME_TEXT.continue, null, this);
    buttonContinue.text.setFontSize(28);
    buttonContinue.text.y = -7;
    this.layerUnlocked.add(buttonContinue);
    MainGame.updateTextWidth(buttonContinue.text, 200);
    var text_unlocked = MainGame.addText(_this, this.layerUnlocked, 0, 0 - 227, MainGame.GAME_TEXT.unlocked, 34, true);
    MainGame.updateTextWidth(text_unlocked, 400);
    text_unlocked.setTint(10092543);
    var text_next = this.mergeCars_textNext = MainGame.addText(_this, this.layerUnlocked, back_car.x, back_car.y - 60, MainGame.GAME_TEXT.next, 22, true);
    MainGame.updateTextWidth(text_next, 120);
    this.mergeCars_textQuestion = MainGame.addText(_this, this.layerUnlocked, back_car.x, back_car.y - 10, "?", 26);
    var text_earning = MainGame.addText(_this, this.layerUnlocked, 0, 85, MainGame.GAME_TEXT.earning, 22, true);
    MainGame.updateTextWidth(text_earning, 300);
    this.textEarning = MainGame.addText(_this, this.layerUnlocked, 0, 85 + 30, "4/" + MainGame.GAME_TEXT.sec, 22);
    text_earning.setTint(10092543);
    this.textEarning.setTint(10092543);
    text_next.setTint(16739941);
    this.mergeCars_textQuestion.setTint(0);
    this.coin_merge_window.x = this.textEarning.x - this.textEarning.width * .5 - 17;
    this.layerUnlocked.visible = false;
    this.layerMerge.visible = false;
    fon_unlock.setInteractive();
    fon_merge.setInteractive();
    fon_merge.on("pointerdown", this.onFonInputDown, this);
    fon_merge.on("pointerup", this.onFonInputUp, this)
};
GameGUI.prototype.clickContinueUnlocked = function() {
    if (!this.layerUnlocked.visible) return;
    _this = this.gameScreen;
    if (_this.nextCarLevel > 3) {
        if (MainGame.isAPI) MainGame.API_POKI.commercialBreak()
    } else {
        if (MainGame.isApiGameplayStop) {
            if (MainGame.isAPI) MainGame.API_POKI.gameplayStart();
            MainGame.isApiGameplayStop = false
        }
    }
    this.layerUnlocked.visible = false;
    this.layerMerge.visible = false;
    if (_this.showAfterMerge) {
        _this.time.delayedCall(150, this.showLevelUpWindow, [], this);
        _this.showAfterMerge = false
    }
    this.enableMainButtons()
};
GameGUI.prototype.showMergeAnimation = function(vType) {
    _this = this.gameScreen;
    this.layerMerge.visible = true;
    _this.tweens.killTweensOf(this.car1_merge);
    _this.tweens.killTweensOf(this.car2_merge);
    this.car1_merge.visible = true;
    this.car2_merge.visible = true;
    this.car1_merge.x = this.midX - 160;
    this.car2_merge.x = this.midX + 160;
    this.car1_merge.angle = -5;
    this.car2_merge.angle = -5;
    var prevType = vType - 1;
    var nextType = vType + 1;
    if (nextType > this.MAX_TYPES_CAR) {
        this.back_car.visible = false;
        this.mergeCars_textNext.visible = false;
        this.mergeCars_textQuestion.visible = false
    } else {
        this.back_car.setFrame("icon_f" + nextType + "_0000")
    }
    this.car1_merge.setFrame("icon_f" + prevType + "_0000");
    this.car2_merge.setFrame("icon_f" + prevType + "_0000");
    this.unlocked_car.setFrame("icon_f" + vType + "_0000");
    var value_speed_coins = _this.getCarCoins(vType);
    var number_warm = MainGame.convertNumberFormat(value_speed_coins);
    this.textEarning.setText(number_warm + "/" + MainGame.GAME_TEXT.sec);
    this.coin_merge_window.x = this.textEarning.x - this.textEarning.width * .5 - 17;
    this.star_flash1.x = -180 + Phaser.Math.Between(-5, 5) * 2;
    this.star_flash1.y = -160;
    this.star_flash2.x = 180 + Phaser.Math.Between(-5, 5) * 2;
    this.star_flash2.y = -150;
    this.star_flash3.x = Phaser.Math.Between(-10, 10) * 10;
    this.star_flash3.y = 150;
    _this.tweens.add({
        targets: this.car1_merge,
        angle: 5,
        ease: "Linear",
        duration: 100,
        yoyo: true,
        repeat: 1
    });
    _this.tweens.add({
        targets: this.car1_merge,
        x: this.midX,
        ease: Phaser.Math.Easing.Back.In,
        duration: 500,
        delay: 200
    });
    _this.tweens.add({
        targets: this.car2_merge,
        angle: 5,
        ease: "Linear",
        duration: 100,
        yoyo: true,
        repeat: 1
    });
    _this.tweens.add({
        targets: this.car2_merge,
        x: this.midX,
        ease: Phaser.Math.Easing.Back.In,
        duration: 500,
        delay: 200
    });
    _this.time.delayedCall(700, this.addEffectMerge, [], this);
    _this.time.delayedCall(1800, this.showUnlockContent, [], this);
    MainGame.Sfx.play("sound", "unlocked");
    this.disableMainButtons()
};
GameGUI.prototype.addEffectMerge = function() {
    _this = this.gameScreen;
    var effect = _this.add.sprite(this.midX - 10, this.midY - 35, "ss_main");
    effect.play("effect_connect2");
    effect.setScale(2);
    this.layerMerge.add(effect);
    this.car1_merge.visible = false;
    this.car2_merge.visible = false
};
GameGUI.prototype.showUnlockContent = function() {
    _this = this.gameScreen;
    this.layerUnlocked.visible = true;
    this.layerUnlocked.setScale(this.scaleWindow1);
    _this.tweens.add({
        targets: this.layerUnlocked,
        scaleX: this.scaleWindow2,
        scaleY: this.scaleWindow2,
        ease: Phaser.Math.Easing.Back.Out,
        duration: 400
    });
    this.showBanner();
    this.eventFonImputUp = this.clickContinueUnlocked;
    _this.time.delayedCall(this.TIME_OPEN_POPUP, this.onPopupOpen, [], this)
};
GameGUI.prototype.initFortunaWheelWindow = function() {
    _this = this.gameScreen;
    this.layerFortunaWheelWindowMain = _this.add.container();
    this.layerFortunaWheelWindow = _this.add.container();
    this.layerFortunaWheelWindowMain.setDepth(_this.DEPTH_layerMerge);
    this.layerFortunaWheelWindow.setDepth(_this.DEPTH_layerUnlock);
    this.layerFortunaWheelWindow.x = this.midX;
    this.layerFortunaWheelWindow.y = this.midY + this.posWindowY;
    var fon_merge = _this.add.image(this.midX, this.midY - 40, "ss_main", "bg_connect_0000");
    fon_merge.setScale(2);
    if (!MainGame.isDesktop) fon_merge.angle = 90;
    this.layerFortunaWheelWindowMain.add(fon_merge);
    var fon_unlock = _this.add.image(0, 0, "ss_main", "popup_unlocked_0000");
    fon_unlock.setScale(2);
    this.layerFortunaWheelWindow.add(fon_unlock);
    var posX = 0;
    var posY = -10;
    var wheel_fortune = _this.add.image(posX, posY, "ss_main", "wheel_fortune_0000");
    this.layerFortunaWheelWindow.add(wheel_fortune);
    this.wheel_fortune = wheel_fortune;
    var ramka_fortune = _this.add.image(posX, posY, "ss_main", "ramka_fortune_0000");
    this.layerFortunaWheelWindow.add(ramka_fortune);
    var arrow_fortune = _this.add.image(posX + 2, posY - 152, "ss_main", "arrow_fortune_0000");
    this.layerFortunaWheelWindow.add(arrow_fortune);
    this.arrow_fortune = arrow_fortune;
    var buttonClose = new Button(226, -224, "ss_main", "btn_close_0000", this.closeFortunaWheelWindow, _this, this);
    this.layerFortunaWheelWindow.add(buttonClose);
    this.buttonCloseFortunaWheelWindow = buttonClose;
    var buttonContinue = new ButtonText(0, 205, "ss_main", "btn_buy2_0000", _this.showAdsForFortunaWheel, _this, MainGame.GAME_TEXT.free);
    buttonContinue.text.setFontSize(28);
    buttonContinue.text.x = -20;
    buttonContinue.text.y = -5;
    this.layerFortunaWheelWindow.add(buttonContinue);
    MainGame.updateTextWidth(buttonContinue.text, 200);
    var icon_reward = _this.add.image(75, -2, "ss_main", "icon_reward_0000");
    buttonContinue.add(icon_reward);
    this.buttonFortunaWheel = buttonContinue;
    var text_title = MainGame.addText(_this, this.layerFortunaWheelWindow, 0, -227, MainGame.GAME_TEXT.lucky_wheel, 34, true);
    MainGame.updateTextWidth(text_title, 400);
    text_title.setTint(10092543);
    var text_free_time = MainGame.addText(_this, this.layerFortunaWheelWindow, -150, 270, "", 20, true);
    MainGame.updateTextWidth(text_free_time, 300);
    text_free_time.setTint(10092543);
    var text_nextfreein = MainGame.addText(_this, this.layerFortunaWheelWindow, 140, 270, "", 20, true);
    MainGame.updateTextWidth(text_nextfreein, 300);
    text_nextfreein.setTint(10092543);
    this.text_free_time = text_free_time;
    this.text_nextfreein = text_nextfreein;
    this.layerFortunaWheelWindow.setScale(this.scaleWindow2);
    this.layerFortunaWheelWindowMain.visible = false;
    this.layerFortunaWheelWindow.visible = false;
    this.layerFortunaWheelWindow.setScale(this.scaleWindow2);
    _this.initWheelOptions();
    fon_unlock.setInteractive();
    fon_merge.setInteractive();
    fon_merge.on("pointerdown", this.onFonInputDown, this);
    fon_merge.on("pointerup", this.onFonInputUp, this)
};
GameGUI.prototype.checkFortunaWheelWindow = function() {
    if (this.gameScreen.freeTimeWheel > 0) {
        this.buttonFortunaWheel.setEnable(true)
    } else {
        this.buttonFortunaWheel.setEnable(false)
    }
};
GameGUI.prototype.updateFortunaWheelWindow = function(countDownNextFree) {
    var str1 = MainGame.GAME_TEXT.free_time + " " + this.gameScreen.freeTimeWheel + "/" + MainGame.maxTimeWheel;
    this.text_free_time.setText(str1.toUpperCase());
    var timeNextIn = _this.secToHHMMSS(countDownNextFree);
    var str2 = MainGame.GAME_TEXT.next_free_in + " " + timeNextIn;
    this.text_nextfreein.setText(str2.toUpperCase());
    if (this.gameScreen.freeTimeWheel == MainGame.maxTimeWheel) {
        this.text_nextfreein.visible = false
    } else {
        this.text_nextfreein.visible = true
    }
    if (!this.isTweeningWheel) this.checkFortunaWheelWindow()
};
GameGUI.prototype.openFortunaWheelWindow = function() {
    _this = this.gameScreen;
    this.layerFortunaWheelWindowMain.visible = true;
    this.layerFortunaWheelWindow.visible = true;
    this.layerFortunaWheelWindow.setScale(this.scaleWindow2);
    this.disableMainButtons();
    this.updateFortunaWheelWindow(_this.countDownNextFree);
    this.eventFonImputUp = this.closeFortunaWheelWindow;
    _this.time.delayedCall(this.TIME_OPEN_POPUP, this.onPopupOpen, [], this)
};
GameGUI.prototype.closeFortunaWheelWindow = function() {
    if (this.isTweeningWheel) return;
    if (MainGame.isAPI) MainGame.API_POKI.commercialBreak();
    this.layerFortunaWheelWindowMain.visible = false;
    this.layerFortunaWheelWindow.visible = false;
    this.enableMainButtons()
};
GameGUI.prototype.tweenWheelFortune = function(rounds, degrees, backDegrees, duration1, duration2) {
    _this = this.gameScreen;
    this.buttonCloseFortunaWheelWindow.setEnable(false);
    this.isTweeningWheel = true;
    _this.tweens.add({
        targets: [this.wheel_fortune],
        angle: 360 * rounds + degrees,
        duration: duration1,
        ease: "Cubic.easeOut",
        callbackScope: this,
        onComplete: function(tween) {
            _this.tweens.add({
                targets: [this.wheel_fortune],
                angle: this.wheel_fortune.angle - backDegrees,
                duration: duration2,
                ease: "Cubic.easeIn",
                callbackScope: this,
                onComplete: function(tween) {
                    this.showRewardWindow(MainGame.reward_wheel);
                    this.buttonCloseFortunaWheelWindow.setEnable(true);
                    this.checkFortunaWheelWindow();
                    this.isTweeningWheel = false
                }
            })
        }
    })
};
GameGUI.prototype.initRewardWindow = function() {
    _this = this.gameScreen;
    this.layerRewardWindowMain = _this.add.container();
    this.layerRewardWindow = _this.add.container();
    this.layerRewardWindowMain.setDepth(_this.DEPTH_layerUnlock);
    this.layerRewardWindow.setDepth(_this.DEPTH_layerUnlock);
    this.layerRewardWindow.x = this.midX;
    this.layerRewardWindow.y = this.midY + this.posWindowY;
    var fon_merge = _this.add.image(this.midX, this.midY - 40, "ss_main", "bg_connect_0000");
    fon_merge.setScale(2);
    if (!MainGame.isDesktop) fon_merge.angle = 90;
    this.layerRewardWindowMain.add(fon_merge);
    var popup_drop = _this.add.image(0, 0, "ss_main", "popup_drop_0000");
    popup_drop.setScale(2);
    this.layerRewardWindow.add(popup_drop);
    var posX = 0;
    var posY = -5;
    var effect = _this.add.sprite(posX + 5, posY, "ss_main");
    effect.play("magic_1");
    effect.setScale(2);
    this.layerRewardWindow.add(effect);
    var iconRewardWindow = _this.add.image(posX, posY, "ss_main", "reward_box6_0000");
    this.layerRewardWindow.add(iconRewardWindow);
    this.iconRewardWindow = iconRewardWindow;
    var buttonContinue = new ButtonText(0, 150, "ss_main", "btn_buy_0000", this.clickGetReward, _this, MainGame.GAME_TEXT.get, null, this);
    buttonContinue.text.setFontSize(28);
    this.layerRewardWindow.add(buttonContinue);
    MainGame.updateTextWidth(buttonContinue.text, 200);
    buttonContinue.text.y = -5;
    var buttonClose = new Button(226, -187, "ss_main", "btn_close_0000", this.closeRewardWindow, _this, this);
    this.layerRewardWindow.add(buttonClose);
    var text_title = MainGame.addText(_this, this.layerRewardWindow, 0, -190, MainGame.GAME_TEXT.reward, 34, true);
    MainGame.updateTextWidth(text_title, 380);
    text_title.setTint(10092543);
    this.layerRewardWindowMain.visible = false;
    this.layerRewardWindow.visible = false;
    this.layerRewardWindow.setScale(this.scaleWindow2);
    popup_drop.setInteractive();
    fon_merge.setInteractive();
    fon_merge.on("pointerdown", this.onFonInputDown, this);
    fon_merge.on("pointerup", this.onFonInputUp, this)
};
GameGUI.prototype.showRewardWindow = function(vTypeReward) {
    _this = this.gameScreen;
    this.layerRewardWindow.visible = true;
    this.layerRewardWindowMain.visible = true;
    this.layerRewardWindow.setScale(this.scaleWindow1);
    _this.tweens.add({
        targets: this.layerRewardWindow,
        scaleX: this.scaleWindow2,
        scaleY: this.scaleWindow2,
        ease: Phaser.Math.Easing.Back.Out,
        duration: 400
    });
    this.iconRewardWindow.setFrame(vTypeReward + "_0000");
    this.eventFonImputUp = this.closeRewardWindow;
    _this.time.delayedCall(this.TIME_OPEN_POPUP, this.onPopupOpen, [], this);
    MainGame.Sfx.play("sound", "boost")
};
GameGUI.prototype.clickGetReward = function() {
    this.closeRewardWindow()
};
GameGUI.prototype.closeRewardWindow = function() {
    _this = this.gameScreen;
    this.layerRewardWindowMain.visible = false;
    this.layerRewardWindow.visible = false;
    this.updateFortunaWheelWindow(_this.countDownNextFree);
    this.eventFonImputUp = this.closeFortunaWheelWindow;
    if (MainGame.reward_wheel) this.gameScreen.getRewards(MainGame.reward_wheel);
    MainGame.reward_wheel = null
};
GameGUI.prototype.clickShop = function() {
    _this = this.gameScreen;
    _this.isInputOverShopDown = false;
    _this.layerShop.visible = true;
    this.disableMainButtons();
    _this.updateShopItem()
};
GameGUI.prototype.showBanner = function() {
    if (MainGame.lastDataBanner == null) {
        MainGame.lastDataBanner = (new Date).getTime();
        if (MainGame.isAPI) {
            MainGame.API_POKI.displayAd()
        }
    } else {
        var currentDate = new Date;
        var dif = currentDate.getTime() - MainGame.lastDataBanner;
        var secondsFromLastCalling = Math.abs(dif / 1e3);
        if (secondsFromLastCalling > MainGame.TIME_BANNER) {
            if (MainGame.isAPI) {
                MainGame.API_POKI.destroyAd();
                MainGame.API_POKI.displayAd()
            }
            MainGame.lastDataBanner = (new Date).getTime()
        } else {}
    }
};
GameGUI.prototype.clickMuteSound = function() {
    MainGame.Sfx.manage("sound", "switch", this, this.buttonMuteSound.icon, this.buttonMuteSound.text)
};
GameGUI.prototype.clickMuteMusic = function() {
    MainGame.Sfx.manage("music", "switch", this, this.buttonMuteMusic.icon, this.buttonMuteMusic.text)
};
var MyMath = {
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },
    getRandomBool: function() {
        return Math.random() < .5 ? true : false
    },
    randomChance: function(vValue) {
        return Math.random() < vValue
    },
    shuffleArr: function(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o
    },
    distanceTwoPoints: function(x1, x2, y1, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        return dx * dx + dy * dy
    },
    parseQuery: function(qstr) {
        var query = {};
        var a = qstr.substr(1).split("&");
        for (var i = 0; i < a.length; i++) {
            var b = a[i].split("=");
            query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || "")
        }
        return query
    },
    weightedRandom: function(prob) {
        let i, sum = 0,
            r = Math.random();
        for (i in prob) {
            sum += prob[i];
            if (r <= sum) return i
        }
    },
    lerp: function(in_Src, in_Dst, in_Ratio) {
        return in_Src * (1 - in_Ratio) + in_Dst * in_Ratio
    }
};
var config = {
    type: Phaser.AUTO,
    backgroundColor: 1380152,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        parent: "game-container",
        width: 1024,
        height: 640,
        max: {
            width: 1400,
            height: 1024
        }
    },
    scene: [Boot, Preloader, Game]
};
const game = new Phaser.Game(config);
window.focus();