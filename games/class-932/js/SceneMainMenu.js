class SceneMainMenu extends Phaser.Scene {
    constructor() {
      super({ key: "SceneMainMenu" });
    }
/*
    //crazygames...
    init() {
      const { CrazySDK } = window.CrazyGames;
      this.crazysdk = CrazySDK.getInstance();
      this.crazysdk.init();
      this.adRequested = false;
      this.installListeners();
    }

    //end crazygames
    */

    preload() {
      /*
      //crazygames...
      //this.requestAd();
      //end crazygames
      */
        //this.load.image('button', 'content/button.png');
        this.load.image('button1', 'content/playbookButton1.png');
        this.load.image('button2', 'content/playbookButton2.png');
        this.load.image('instructions','content/instructions.png');
        this.load.image('instructionsButton','content/instructionsMainMenu.png');
        this.load.image('menuTeams','content/menuTeams.png');
        this.load.image('mainMenuBG', 'content/mainMenuBg.png');
        this.load.image('shield', 'content/shield2020.png');
        this.load.image('buttonGmLink1','content/buttonGmLink1.png');
        this.load.image('buttonGmLink2','content/buttonGmLink2.png');

        this.load.audio('soundCrowdCheer', 'content/crowd_cheer.mp3');
        this.load.audio('soundButton', 'content/beep.mp3');
        this.load.audio('metalSlam','content/metal_slam.mp3');

        this.soundPlayed = false;

    }
    create() {
        this.bg = this.add.image(0,0,'menuTeams');
        this.bg.setOrigin(0.0,0.0);
        this.bg2 = this.add.image(0,0,'mainMenuBG');
        this.bg2.setOrigin(0.0,0.0);
        this.shieldScale = 20;
        this.shield = this.add.image(-1000,-2400, 'shield');
        this.shield.setScale(20,20);
        this.instructions = this.add.image(0,0, 'instructions');
        this.instructions.setOrigin(0,0);
        this.instructions.visible = false;

        //button instructions
        this.buttonInstructions = this.add.sprite(0,350,"instructionsButton");
        this.buttonInstructions.setOrigin(0,0);
        this.buttonInstructions.setInteractive();
        //this.buttonInstructions.on("pointerover", function() { this.buttonInstructions.setTexture("buttonInstructions2");}, this);
        //this.buttonInstructions.on("pointerout", function() {  this.buttonInstructions.setTexture("buttonInstructions1");}, this);
        //this.buttonInstructions.on("pointerdown", function() {  this.buttonInstructions.setTexture("buttonInstructions2"); }, this);
        this.buttonInstructions.on("pointerup", function() {
          if(!openInstructions){
              openInstructions = true;
              this.instructions.visible = true;
          }else{
              openInstructions = false;
              this.instructions.visible = false;
          }
        }, this);

        /*
        this.buttonGm = this.add.sprite(853,0,"buttonGmLink1");
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

        this.btnPlay = this.add.sprite(10,200,"button1");
        this.btnPlay.setOrigin(0,0);
          this.btnPlay.setInteractive();
          this.btnPlay.on("pointerover", function() {
            this.btnPlay.setTexture("button2"); // set the button texture to sprBtnPlayHover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.btnPlay.on("pointerout", function() {
            this.setTexture("button1");
          });
          this.btnPlay.on("pointerdown", function() {
            this.btnPlay.setTexture("button2");
            //this.sfx.btnDown.play();
          }, this);
          this.btnPlay.on("pointerup", function() {
            this.btnPlay.setTexture("button1");
            this.scene.start("SceneGameModeMenu");
            this.sound.play('soundButton');
            openInstructions = false;
            /*
            //crazyGames...
            this.removeListeners();
            //end crazygames
            */
          }, this);

          this.crowdCheer = this.sound.play('soundCrowdCheer');

    }


    update(){
      
        if(this.shieldScale > 1){
            this.shieldScale -= 1;
            this.shield.x += 81;
            this.shield.y += 140;
        }
        if(this.shieldScale <= 1){
          if(!this.soundPlayed && this.crowdCheer != null){
            this.sound.play('metalSlam');
            this.sound.play('soundCrowdCheer');
            this.soundPlayed = true;
          }
        }
        this.shield.setScale(this.shieldScale, this.shieldScale);
    }

    /*
    //crazygames...
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
  
    adStarted = () => {
      this.sound.mute = true;
    }
  
    adError = () => {
      this.sound.mute = false;
      this.adRequested = false;
    }
  
    adFinished = () => {
      this.sound.mute = false;
      this.adRequested = false;
    }
    //end crazygames
*/


  }
