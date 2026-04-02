class SceneMainMenu extends Phaser.Scene {
    constructor() {
      super({ key: "SceneMainMenu" });
    }

    //crazygames...
    /*init() {
      const { CrazySDK } = window.CrazyGames;
      this.crazysdk = CrazySDK.getInstance();
      this.crazysdk.init();
      this.adRequested = false;
      this.installListeners();
    }
    */

    //end crazygames

    preload() {
      //start Poki...
      
      StartLoading();
      this.load.on('progress', function (value) {
      //console.log(value);
      });
      this.load.on('complete', function () {
        //console.log('complete');
        LoadingComplete();
      });
      
      //end Poki
      //crazygames...
      /*
      this.requestAd();
      */
      //end crazygames
        //this.load.image('button', 'content/button.png');
        this.load.image('buttonPlay1', 'content/buttonQuickGame.png');
        this.load.image('buttonPlay2', 'content/buttonQuickGame2.png');
        this.load.image('buttonPickField1', 'content/buttonPickField.png');
        this.load.image('buttonPickField2', 'content/buttonPickField2.png');
        this.load.image('buttonPickTeams1', 'content/buttonPickTeams1.png');
        this.load.image('buttonPickTeams2', 'content/buttonPickTeams2.png');
        this.load.image('buttonPlayoffSeason1', 'content/buttonPlayoffSeason1.png');
        this.load.image('buttonPlayoffSeason2', 'content/buttonPlayoffSeason2.png');
        this.load.image('buttonInstructions1a','content/buttonInstructions1a.png');
        this.load.image('buttonInstructions1b','content/buttonInstructions1b.png');
        this.load.image('instructions2','content/instructions2.png');
        //this.load.image('menuTeams','content/menuTeams.png');
        this.load.image('mainMenuBG', 'content/mainMenuBg.png');
        //this.load.image('menuPlayer1','content/menuPlayer1.png');
        //this.load.image('menuPlayer2','content/menuPlayer2.png');
        //this.load.image('shield', 'content/shield2020.png');
        //this.load.image('buttonGmLink1','content/buttonGmLink1.png');
        //this.load.image('buttonGmLink2','content/buttonGmLink2.png');
        this.load.image('buttonSound1', 'content/buttonSound1.png');
        this.load.image('buttonSound2', 'content/buttonSound2.png');

        this.load.audio('soundCrowdCheer', 'content/crowd_cheer.mp3');
        this.load.audio('soundButton', 'content/beep.mp3');
        this.load.audio('metalSlam','content/metal_slam.mp3');

        this.load.image('field',fieldFile);
        this.load.image('buttonField1','content/buttonField1.png');
        this.load.image('buttonFieldBlackWhite','content/buttonFieldBlackWhite.png');
        this.load.image('buttonFieldBlue','content/buttonFieldBlue.png');
        this.load.image('buttonFieldCamo','content/buttonFieldCamo.png');
        this.load.image('buttonFieldDarkmode','content/buttonFieldDarkmode.png');
        this.load.image('buttonFieldUsa','content/buttonFieldUsa.png');
        this.load.image('buttonFieldSelected','content/buttonFieldSelected.png');
        this.load.image('buttonClose','content/button3.png');
        this.load.image('buttonPokiAd','content/buttonPokiAd.png');
        this.load.image('buttonPokiAd2','content/buttonPokiAd2.png');
        this.load.image('storeBg','content/storeBg.png');

        this.soundPlayed = false;

    }
    create() {
      if (this.sys.game.device.os.desktop){
        mobile = false;
        //mobile = true;
        console.log("not mobile");
      }
      else{
       mobile = true;
      }
      //2022 from Poki...
      const isIpad = () => {
        return ((navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) && !window.MSStream) || navigator.userAgent.match(/(iPad)/);
        }
        const isMobile = /Mobi|Android/i.test(navigator.userAgent) || isIpad();
        if(isMobile){
        //... we are on mobile
        //by me...
          mobile = true;
        }
        //this.bg = this.add.image(0,0,'menuTeams');
        //this.bg.setOrigin(0.0,0.0);
        this.bg2 = this.add.image(0,0,'mainMenuBG');
        this.bg2.setOrigin(0.0,0.0);
        //this.shieldScale = 20;
        //this.shield = this.add.image(425,-2400, 'shield');
        //this.shield.setScale(20,20);
        //this.menuPlayer1 = this.add.image(-1000,0,'menuPlayer1');
        //this.menuPlayer1 = this.add.image(0,0,'menuPlayer1');
        //this.menuPlayer1.setOrigin(0.0,0,0);
        //this.menuPlayer2 = this.add.image(1000,0,'menuPlayer2');
        //this.menuPlayer2 = this.add.image(0,0,'menuPlayer2');
        //this.menuPlayer2.setOrigin(0.0,0,0);
        /*this.menuPlayer3 = this.add.image(-1100,0,'menuPlayer1');
        this.menuPlayer3.setOrigin(0.0,0,0);
        this.menuPlayer4 = this.add.image(1100,0,'menuPlayer2');
        this.menuPlayer4.setOrigin(0.0,0,0);
        this.menuPlayer5 = this.add.image(-1200,0,'menuPlayer1');
        this.menuPlayer5.setOrigin(0.0,0,0);
        this.menuPlayer6 = this.add.image(1200,0,'menuPlayer2');
        this.menuPlayer6.setOrigin(0.0,0,0);
        this.menuPlayer7 = this.add.image(-1300,0,'menuPlayer1');
        this.menuPlayer7.setOrigin(0.0,0,0);
        this.menuPlayer8 = this.add.image(1300,0,'menuPlayer2');
        this.menuPlayer8.setOrigin(0.0,0,0);

        this.menuPlayer3.setAlpha(0.75);
        this.menuPlayer5.setAlpha(0.5);
        this.menuPlayer7.setAlpha(0.25);
        this.menuPlayer2.setAlpha(0.75);
        this.menuPlayer4.setAlpha(0.5);
        this.menuPlayer6.setAlpha(0.25);*/


        /*this.buttonGm = this.add.sprite(853,0,"buttonGmLink1");
        this.buttonGm.setOrigin(1,0);
          this.buttonGm.setInteractive();
          this.buttonGm.on("pointerover", function() {
            this.buttonGm.setTexture("buttonGmLink2"); // set the button texture to sprbuttonGmHover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonGm.on("pointerout", function() {
            this.setTexture("buttonGmLink1");
          });
          this.buttonGm.on("pointerdown", function() {
            this.buttonGm.setTexture("buttonGmLink2");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonGm.on("pointerup", function() {
            this.sound.play('soundButton');
            this.buttonGm.setTexture("buttonGmLink1");
            window.open("https://www.glowmonkey.com");
          }, this);
          */

        //this.btnPlay = this.add.sprite(426,235,"buttonPlay1");
        this.btnPlay = this.add.sprite(10,10,"buttonPlay1");
        this.btnPlay.setOrigin(0,0);
          this.btnPlay.setInteractive();
          this.btnPlay.on("pointerover", function() {
            this.btnPlay.setTexture("buttonPlay2"); // set the buttonPlay texture to sprBtnPlayHover
            //this.sfx.btnOver.play(); // play the buttonPlay over sound
          }, this);
          this.btnPlay.on("pointerout", function() {
            this.setTexture("buttonPlay1");
          });
          this.btnPlay.on("pointerdown", function() {
            this.btnPlay.setTexture("buttonPlay2");
            //this.sfx.btnDown.play();
          }, this);
          this.btnPlay.on("pointerup", function() {
            this.btnPlay.setTexture("buttonPlay1");
            //this.scene.start("SceneTeamSelect");
            this.sound.play('soundButton');
            //right to game...
            time = 300;
            difficulty = 0;
            fumbleChance = 0.75;
            fieldGoalAimSpeed = 5.0;
            playoffs = false;
            this.scene.start("SceneStadium");
            this.scene.start("ScenePlaybook");
            //start Poki...
            //gameStart();
            startCommercialFirst();
            //crazygames...
            /*
            this.removeListeners();
            */
            //end crazygames
          }, this);

          
          this.btnPickTeams = this.add.sprite(10,60,"buttonPickTeams1");
        this.btnPickTeams.setOrigin(0,0);
          this.btnPickTeams.setInteractive();
          this.btnPickTeams.on("pointerover", function() {
            this.btnPickTeams.setTexture("buttonPickTeams2"); // set the buttonPickTeams texture to sprbtnPickTeamsHover
            //this.sfx.btnOver.play(); // play the buttonPickTeams over sound
          }, this);
          this.btnPickTeams.on("pointerout", function() {
            this.setTexture("buttonPickTeams1");
          });
          this.btnPickTeams.on("pointerdown", function() {
            this.btnPickTeams.setTexture("buttonPickTeams2");
            //this.sfx.btnDown.play();
          }, this);
          this.btnPickTeams.on("pointerup", function() {
            this.btnPickTeams.setTexture("buttonPickTeams1");
            playoffs = false;
            this.scene.start("SceneTeamSelect");
            this.sound.play('soundButton');
          }, this);
          

         this.btnPlayoffSeason = this.add.sprite(10,110,"buttonPlayoffSeason1");
         this.btnPlayoffSeason.setOrigin(0,0);
           this.btnPlayoffSeason.setInteractive();
           this.btnPlayoffSeason.on("pointerover", function() {
             this.btnPlayoffSeason.setTexture("buttonPlayoffSeason2"); // set the buttonPlayoffSeason texture to sprbtnPlayoffSeasonHover
             //this.sfx.btnOver.play(); // play the buttonPlayoffSeason over sound
           }, this);
           this.btnPlayoffSeason.on("pointerout", function() {
             this.setTexture("buttonPlayoffSeason1");
           });
           this.btnPlayoffSeason.on("pointerdown", function() {
             this.btnPlayoffSeason.setTexture("buttonPlayoffSeason2");
             //this.sfx.btnDown.play();
           }, this);
           this.btnPlayoffSeason.on("pointerup", function() {
             this.btnPlayoffSeason.setTexture("buttonPlayoffSeason1");
             playoffs = true;
             this.scene.start("ScenePlayoffTeamSelect");
             this.sound.play('soundButton');
           }, this);
          



          this.btnInstructions = this.add.sprite(10,160,"buttonInstructions1a");
        this.btnInstructions.setOrigin(0,0);
          this.btnInstructions.setInteractive();
          this.btnInstructions.on("pointerover", function() {
            this.btnInstructions.setTexture("buttonInstructions1b"); // set the buttonInstructions1a texture to sprbtnInstructionsHover
            //this.sfx.btnOver.play(); // play the buttonInstructions1a over sound
          }, this);
          this.btnInstructions.on("pointerout", function() {
            this.setTexture("buttonInstructions1a");
          });
          this.btnInstructions.on("pointerdown", function() {
            this.btnInstructions.setTexture("buttonInstructions1b");
            //this.sfx.btnDown.play();
          }, this);
          this.btnInstructions.on("pointerup", function() {
            this.btnInstructions.setTexture("buttonInstructions1a");
            this.instructions2.visible = true;
            this.sound.play('soundButton');
            //crazygames...
            /*
            this.removeListeners();
            */
            //end crazygames
          }, this);

          this.btnSound = this.add.sprite(825,5,"buttonSound1");
          this.btnSound.setOrigin(0,0);
          this.btnSound.setInteractive();
          this.btnSound.on("pointerover", function() {
            this.btnSound.setTexture("buttonSound2"); // set the button texture to sprbtnSoundHover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.btnSound.on("pointerout", function() {
            this.setTexture("buttonSound1");
          });
          this.btnSound.on("pointerdown", function() {
            this.btnSound.setTexture("buttonSound1");
            //this.sfx.btnDown.play();
          }, this);
          this.btnSound.on("pointerup", function() {
            this.btnSound.setTexture("buttonSound2");
            if(sound){
              sound = false;
              this.sound.mute = true;
            }else{
              sound = true;
              this.sound.mute = false;
            }
          }, this);

          this.instructions2 = this.add.sprite(0,0, 'instructions2');
          this.instructions2.setOrigin(0,0);
          this.instructions2.setInteractive();
          this.instructions2.on("pointerup", function() {
            this.instructions2.visible = false;
          }, this);

          var closeInstructions = function(){
            this.instructions2.visible = true;
          }

          this.instructions2.visible = false;
          //this.instructions = this.add.image(0,0, 'instructions');
        //this.instructions.setOrigin(0,0);
        //this.instructions.visible = false;

          this.crowdCheer = this.sound.play('soundCrowdCheer');

          this.btnStore = this.add.sprite(630,300,"buttonPickField1");
          this.btnStore.setScale(1.4);
          this.btnStore.setOrigin(0,0);
            this.btnStore.setInteractive();
            this.btnStore.on("pointerover", function() {
              this.btnStore.setTexture("buttonPickField2"); // set the buttonPickField texture to sprbtnInstructionsHover
              //this.sfx.btnOver.play(); // play the buttonPickField over sound
            }, this);
            this.btnStore.on("pointerout", function() {
              this.setTexture("buttonPickField1");
            });
            this.btnStore.on("pointerdown", function() {
              this.btnStore.setTexture("buttonPickField2");
              //this.sfx.btnDown.play();
            }, this);
            this.btnStore.on("pointerup", function() {
              this.btnStore.setTexture("buttonPickField1");
              this.PokiStore.visible = true;
              this.sound.play('soundButton');
            }, this);


            this.btnCloseStore = this.add.sprite(650,50,"buttonClose");
            this.btnCloseStore.setOrigin(0,0);
              this.btnCloseStore.setInteractive();
              this.btnCloseStore.on("pointerover", function() {
                this.btnCloseStore.setTexture("buttonClose"); // set the buttonClose texture to sprbtnInstructionsHover
                //this.sfx.btnOver.play(); // play the buttonClose over sound
              }, this);
              this.btnCloseStore.on("pointerout", function() {
                this.setTexture("buttonClose");
              });
              this.btnCloseStore.on("pointerdown", function() {
                this.btnCloseStore.setTexture("buttonClose");
                //this.sfx.btnDown.play();
              }, this);
              this.btnCloseStore.on("pointerup", function() {
                this.btnCloseStore.setTexture("buttonClose");
                this.PokiStore.visible = false;
                this.sound.play('soundButton');
              }, this);

          this.field = this.add.sprite(100,0,'field');
          this.field.setOrigin(0,0);
          this.storeBg = this.add.sprite(0,0,'storeBg');
          this.storeBg.setOrigin(0,0);
          this.storeBg.setInteractive();
          this.buttonFieldSelected = this.add.sprite(200,150,'buttonFieldSelected');
          this.buttonField1 = this.add.sprite(200,150,'buttonField1');
          this.buttonField1.setInteractive();
          this.buttonField1.on("pointerover", function() { this.buttonField1.setTexture("buttonField1");}, this);
          this.buttonField1.on("pointerout", function() {  this.buttonField1.setTexture("buttonField1");}, this);
          this.buttonField1.on("pointerdown", function() {  this.buttonField1.setTexture("buttonField1"); }, this);
          this.buttonField1.on("pointerup", function() {
            this.buttonFieldSelected.x = this.buttonField1.x;
            this.buttonFieldSelected.y = this.buttonField1.y;
            fieldKey = 'field';
            fieldFile = 'content/field.png';
            /*this.load.setPath();
            this.load.on('filecomplete', this.addNextFile, this);
            this.load.image('field', 'content/field.png');
            this.load.start();*/
            if(this.textures.exists(fieldKey)){
              this.field.setTexture(fieldKey);
            }else{
              //console.log("nopoe");
            }
            this.field.setTexture(fieldKey);
          }, this);

          this.buttonFieldBlackWhite = this.add.sprite(375,150,'buttonFieldBlackWhite');
          this.buttonFieldBlackWhite.setInteractive();
          this.buttonFieldBlackWhite.on("pointerover", function() { this.buttonFieldBlackWhite.setTexture("buttonFieldBlackWhite");}, this);
          this.buttonFieldBlackWhite.on("pointerout", function() {  this.buttonFieldBlackWhite.setTexture("buttonFieldBlackWhite");}, this);
          this.buttonFieldBlackWhite.on("pointerdown", function() {  this.buttonFieldBlackWhite.setTexture("buttonFieldBlackWhite"); }, this);
          this.buttonFieldBlackWhite.on("pointerup", function() {
            this.buttonFieldSelected.x = this.buttonFieldBlackWhite.x;
            this.buttonFieldSelected.y = this.buttonFieldBlackWhite.y;
            fieldKey = 'fieldBlackWhite';
            fieldFile = 'content/fieldBlackWhite.png';
            this.load.setPath();
            this.load.on('filecomplete', this.addNextFile, this);
            this.load.image('fieldBlackWhite', 'content/fieldBlackWhite.png');
            this.load.start();
            if(this.textures.exists(fieldKey)){
              this.field.setTexture(fieldKey);
            }else{
              //console.log("nopoe");
            }
            //this.field.setTexture(fieldKey);
          }, this);


          this.buttonFieldBlue = this.add.sprite(550,150,'buttonFieldBlue');
          this.buttonFieldBlue.setInteractive();
          this.buttonFieldBlue.on("pointerover", function() { this.buttonFieldBlue.setTexture("buttonFieldBlue");}, this);
          this.buttonFieldBlue.on("pointerout", function() {  this.buttonFieldBlue.setTexture("buttonFieldBlue");}, this);
          this.buttonFieldBlue.on("pointerdown", function() {  this.buttonFieldBlue.setTexture("buttonFieldBlue"); }, this);
          this.buttonFieldBlue.on("pointerup", function() {
            this.buttonFieldSelected.x = this.buttonFieldBlue.x;
            this.buttonFieldSelected.y = this.buttonFieldBlue.y;
            fieldKey = 'fieldBlue';
            fieldFile = 'content/fieldBlue.png';
            this.load.setPath();
            this.load.on('filecomplete', this.addNextFile, this);
            this.load.image('fieldBlue', 'content/fieldBlue.png');
            this.load.start();
            if(this.textures.exists(fieldKey)){
              this.field.setTexture(fieldKey);
            }else{
              //console.log("nopoe");
            }
            //this.field.setTexture(fieldKey);
          }, this);

          this.buttonFieldCamo = this.add.sprite(200,325,'buttonFieldCamo');
          this.buttonFieldCamo.setInteractive();
          this.buttonFieldCamo.on("pointerover", function() { this.buttonFieldCamo.setTexture("buttonFieldCamo");}, this);
          this.buttonFieldCamo.on("pointerout", function() {  this.buttonFieldCamo.setTexture("buttonFieldCamo");}, this);
          this.buttonFieldCamo.on("pointerdown", function() {  this.buttonFieldCamo.setTexture("buttonFieldCamo"); }, this);
          this.buttonFieldCamo.on("pointerup", function() {
            this.buttonFieldSelected.x = this.buttonFieldCamo.x;
            this.buttonFieldSelected.y = this.buttonFieldCamo.y;
            fieldKey = 'fieldCamo';
            fieldFile = 'content/fieldCamo.png';
            this.load.setPath();
            this.load.on('filecomplete', this.addNextFile, this);
            this.load.image('fieldCamo', 'content/fieldCamo.png');
            this.load.start();
            if(this.textures.exists(fieldKey)){
              this.field.setTexture(fieldKey);
            }else{
              //console.log("nopoe");
            }
            //this.field.setTexture(fieldKey);
          }, this);

          this.buttonFieldDarkmode = this.add.sprite(375,325,'buttonFieldDarkmode');
          this.buttonFieldDarkmode.setInteractive();
          this.buttonFieldDarkmode.on("pointerover", function() { this.buttonFieldDarkmode.setTexture("buttonFieldDarkmode");}, this);
          this.buttonFieldDarkmode.on("pointerout", function() {  this.buttonFieldDarkmode.setTexture("buttonFieldDarkmode");}, this);
          this.buttonFieldDarkmode.on("pointerdown", function() {  this.buttonFieldDarkmode.setTexture("buttonFieldDarkmode"); }, this);
          this.buttonFieldDarkmode.on("pointerup", function() {
            this.buttonFieldSelected.x = this.buttonFieldDarkmode.x;
            this.buttonFieldSelected.y = this.buttonFieldDarkmode.y;
            fieldKey = 'fieldDarkmode';
            fieldFile = 'content/fieldDarkmode.png';
            this.load.setPath();
            this.load.on('filecomplete', this.addNextFile, this);
            this.load.image('fieldDarkmode', 'content/fieldDarkmode.png');
            this.load.start();
            if(this.textures.exists(fieldKey)){
              this.field.setTexture(fieldKey);
            }else{
              //console.log("nopoe");
            }
            //this.field.setTexture(fieldKey);
          }, this);

          this.buttonFieldUsa = this.add.sprite(550,325,'buttonFieldUsa');
          this.buttonFieldUsa.setInteractive();
          this.buttonFieldUsa.on("pointerover", function() { this.buttonFieldUsa.setTexture("buttonFieldUsa");}, this);
          this.buttonFieldUsa.on("pointerout", function() {  this.buttonFieldUsa.setTexture("buttonFieldUsa");}, this);
          this.buttonFieldUsa.on("pointerdown", function() {  this.buttonFieldUsa.setTexture("buttonFieldUsa"); }, this);
          this.buttonFieldUsa.on("pointerup", function() {
            this.buttonFieldSelected.x = this.buttonFieldUsa.x;
            this.buttonFieldSelected.y = this.buttonFieldUsa.y;
            fieldKey = 'fieldUsa';
            fieldFile = 'content/fieldUsa.png';
            this.load.setPath();
            this.load.on('filecomplete', this.addNextFile, this);
            this.load.image('fieldUsa', 'content/fieldUsa.png');
            this.load.start();
            if(this.textures.exists(fieldKey)){
              this.field.setTexture(fieldKey);
            }else{
              //console.log("nopoe");
            }
            //this.field.setTexture(fieldKey);
          }, this);

          this.buttonPokiAdBlackWhite = this.add.sprite(this.buttonFieldBlackWhite.x,this.buttonFieldBlackWhite.y, 'buttonPokiAd');
          this.buttonPokiAdBlackWhite.setInteractive();
          this.buttonPokiAdBlackWhite.on("pointerover", function() { this.buttonPokiAdBlackWhite.setTexture("buttonPokiAd2");}, this);
          this.buttonPokiAdBlackWhite.on("pointerout", function() {  this.buttonPokiAdBlackWhite.setTexture("buttonPokiAd");}, this);
          this.buttonPokiAdBlackWhite.on("pointerdown", function() {  this.buttonPokiAdBlackWhite.setTexture("buttonPokiAd2"); }, this);
          this.buttonPokiAdBlackWhite.on("pointerup", function() {
            // pause your game here if it isn't already
          PokiSDK.rewardedBreak(() => {
            // you can pause any background music or other audio here
          }).then((success) => {
              if(success) {
                  // video was displayed, give reward
                  unlockedFieldBlackWhite = true;
              } else {
                  // video not displayed, should not give reward
              }
              // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
              console.log("Rewarded break finished, proceeding to game");
              // continue your game here
          });
            //unlockedFieldBlackWhite = true;
          }, this);

          this.buttonPokiAdBlue = this.add.sprite(this.buttonFieldBlue.x,this.buttonFieldBlue.y, 'buttonPokiAd');
          this.buttonPokiAdBlue.setInteractive();
          this.buttonPokiAdBlue.on("pointerover", function() { this.buttonPokiAdBlue.setTexture("buttonPokiAd2");}, this);
          this.buttonPokiAdBlue.on("pointerout", function() {  this.buttonPokiAdBlue.setTexture("buttonPokiAd");}, this);
          this.buttonPokiAdBlue.on("pointerdown", function() {  this.buttonPokiAdBlue.setTexture("buttonPokiAd2"); }, this);
          this.buttonPokiAdBlue.on("pointerup", function() {
            // pause your game here if it isn't already
            PokiSDK.rewardedBreak(() => {
              // you can pause any background music or other audio here
            }).then((success) => {
                if(success) {
                    // video was displayed, give reward
                    unlockedFieldBlue = true;
                } else {
                    // video not displayed, should not give reward
                }
                // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
                console.log("Rewarded break finished, proceeding to game");
                // continue your game here
            });
            //unlockedFieldBlue = true;
          }, this);

          this.buttonPokiAdCamo = this.add.sprite(this.buttonFieldCamo.x,this.buttonFieldCamo.y, 'buttonPokiAd');
          this.buttonPokiAdCamo.setInteractive();
          this.buttonPokiAdCamo.on("pointerover", function() { this.buttonPokiAdCamo.setTexture("buttonPokiAd2");}, this);
          this.buttonPokiAdCamo.on("pointerout", function() {  this.buttonPokiAdCamo.setTexture("buttonPokiAd");}, this);
          this.buttonPokiAdCamo.on("pointerdown", function() {  this.buttonPokiAdCamo.setTexture("buttonPokiAd2"); }, this);
          this.buttonPokiAdCamo.on("pointerup", function() {
            // pause your game here if it isn't already
            PokiSDK.rewardedBreak(() => {
              // you can pause any background music or other audio here
            }).then((success) => {
                if(success) {
                    // video was displayed, give reward
                    unlockedFieldCamo = true;
                } else {
                    // video not displayed, should not give reward
                }
                // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
                console.log("Rewarded break finished, proceeding to game");
                // continue your game here
            });
            //unlockedFieldCamo = true;
          }, this);

          this.buttonPokiAdDarkmode = this.add.sprite(this.buttonFieldDarkmode.x,this.buttonFieldDarkmode.y, 'buttonPokiAd');
          this.buttonPokiAdDarkmode.setInteractive();
          this.buttonPokiAdDarkmode.on("pointerover", function() { this.buttonPokiAdDarkmode.setTexture("buttonPokiAd2");}, this);
          this.buttonPokiAdDarkmode.on("pointerout", function() {  this.buttonPokiAdDarkmode.setTexture("buttonPokiAd");}, this);
          this.buttonPokiAdDarkmode.on("pointerdown", function() {  this.buttonPokiAdDarkmode.setTexture("buttonPokiAd2"); }, this);
          this.buttonPokiAdDarkmode.on("pointerup", function() {
            // pause your game here if it isn't already
            PokiSDK.rewardedBreak(() => {
              // you can pause any background music or other audio here
            }).then((success) => {
                if(success) {
                    // video was displayed, give reward
                    unlockedFieldDarkmode = true;
                } else {
                    // video not displayed, should not give reward
                }
                // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
                console.log("Rewarded break finished, proceeding to game");
                // continue your game here
            });
            //unlockedFieldDarkmode = true;
          }, this);

          this.buttonPokiAdUsa = this.add.sprite(this.buttonFieldUsa.x,this.buttonFieldUsa.y, 'buttonPokiAd');
          this.buttonPokiAdUsa.setInteractive();
          this.buttonPokiAdUsa.on("pointerover", function() { this.buttonPokiAdUsa.setTexture("buttonPokiAd2");}, this);
          this.buttonPokiAdUsa.on("pointerout", function() {  this.buttonPokiAdUsa.setTexture("buttonPokiAd");}, this);
          this.buttonPokiAdUsa.on("pointerdown", function() {  this.buttonPokiAdUsa.setTexture("buttonPokiAd2"); }, this);
          this.buttonPokiAdUsa.on("pointerup", function() {
            // pause your game here if it isn't already
            PokiSDK.rewardedBreak(() => {
              // you can pause any background music or other audio here
            }).then((success) => {
                if(success) {
                    // video was displayed, give reward
                    unlockedFieldUsa = true;
                } else {
                    // video not displayed, should not give reward
                }
                // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
                console.log("Rewarded break finished, proceeding to game");
                // continue your game here
            });
            //unlockedFieldUsa = true;
          }, this);


          this.PokiStore = this.add.container(0, 0);
          this.PokiStore.add([this.field,this.storeBg,this.buttonFieldSelected,this.buttonField1,this.buttonFieldBlackWhite,this.buttonFieldBlue,this.buttonFieldCamo
            ,this.buttonFieldDarkmode,this.buttonFieldUsa,this.btnCloseStore,
            this.buttonPokiAdBlackWhite,this.buttonPokiAdBlue,this.buttonPokiAdCamo,this.buttonPokiAdDarkmode,this.buttonPokiAdUsa]);
          this.PokiStore.visible = false;

          this.addNextFile = function()
          {
              this.field.setTexture(fieldKey);
          }

    }


    update(){
      if(sound){
        this.btnSound.setTexture("buttonSound1");
      }else{
        this.btnSound.setTexture("buttonSound2");
      }

      //2024
      if(unlockedFieldBlackWhite){ this.buttonPokiAdBlackWhite.visible = false};
      if(unlockedFieldBlue){ this.buttonPokiAdBlue.visible = false};
      if(unlockedFieldCamo){ this.buttonPokiAdCamo.visible = false};
      if(unlockedFieldDarkmode){ this.buttonPokiAdDarkmode.visible = false};
      if(unlockedFieldUsa){ this.buttonPokiAdUsa.visible = false};
      
        /*if(this.shieldScale > 1){
            this.shieldScale -= 1;
            //this.shield.x += 81;
            this.shield.y += 140;
        }*/
        //if(this.shieldScale <= 1){
          //if(!this.soundPlayed && this.crowdCheer != null){
            //this.sound.play('metalSlam');
           // this.sound.play('soundCrowdCheer');
            //this.soundPlayed = true;
            //this.shield.y = 240;
          //}
          /*if(this.menuPlayer2.x > 0){
            this.menuPlayer2.x -= 50;
            this.menuPlayer1.x += 50;
          }
          if(this.menuPlayer2.x < 0){*/
            //this.menuPlayer2.x = 0;
            //this.menuPlayer1.x = 0;
          /*}
          if(this.menuPlayer4.x > 0){
            this.menuPlayer4.x -= 50;
            this.menuPlayer3.x += 50;
          }
          if(this.menuPlayer4.x < 0){
            this.menuPlayer4.x = 0;
            this.menuPlayer3.x = 0;
          }
          if(this.menuPlayer6.x > 0){
            this.menuPlayer6.x -= 50;
            this.menuPlayer5.x += 50;
          }
          if(this.menuPlayer6.x < 0){
            this.menuPlayer6.x = 0;
            this.menuPlayer5.x = 0;
          }
          if(this.menuPlayer8.x > 0){
            this.menuPlayer8.x -= 50;
            this.menuPlayer7.x += 50;
          }
          if(this.menuPlayer8.x < 0){
            this.menuPlayer8.x = 0;
            this.menuPlayer7.x = 0;
          }*/
        //}
       // this.shield.setScale(this.shieldScale, this.shieldScale);
    }

    //crazygames...
    /*
    installListeners() {
      this.crazysdk.addEventListener('adStarted', this.adStarted);
      this.crazysdk.addEventListener('adError', this.adError);
      this.crazysdk.addEventListener('adFinished', this.adFinished);
    }

    removeListeners() {
      this.crazysdk.removeEventListener('adStarted', this.adStarted);
      this.crazysdk.removeEventListener('adFinished', this.adFinished);
      this.crazysdk.removeEventListener('adError', this.adError);
    }

    requestAd() {
      this.adRequested = true;
      this.crazysdk.requestAd();
    }
    */
    //end crazygames



  }
