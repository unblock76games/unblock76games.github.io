class SceneDifficultyMenu extends Phaser.Scene {
    constructor() {
      super({ key: "SceneDifficultyMenu" });
    }
    preload() {
        //this.load.image('button', 'content/button.png');
        this.load.image('button1', 'content/playbookButton1.png');
        this.load.image('button2', 'content/playbookButton2.png');
        this.load.image('menuTeams','content/menuTeams.png');
        this.load.image('menuDifficulty', 'content/menuDifficulty.png');
        this.load.image('buttonGmLink1','content/buttonGmLink1.png');
        this.load.image('buttonGmLink2','content/buttonGmLink2.png');

        this.load.audio('soundCrowdCheer', 'content/crowd_cheer.mp3');
        this.load.audio('soundButton', 'content/beep.mp3');
    }
    create() {
        this.bg = this.add.image(0,0,'menuTeams');
        this.bg.setOrigin(0.0,0.0);
        this.bg2 = this.add.image(0,0,'menuDifficulty');
        this.bg2.setOrigin(0.0,0.0);

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

        this.buttonDifficulty1 = this.add.sprite(10,50,"button1");
        this.buttonDifficulty1.setOrigin(0,0);
          this.buttonDifficulty1.setInteractive();
          this.buttonDifficulty1.on("pointerover", function() {
            this.buttonDifficulty1.setTexture("button2"); // set the button texture to sprbuttonDifficulty1Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonDifficulty1.on("pointerout", function() {
            this.setTexture("button1");
          });
          this.buttonDifficulty1.on("pointerdown", function() {
            this.buttonDifficulty1.setTexture("button2");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonDifficulty1.on("pointerup", function() {
            this.buttonDifficulty1.setTexture("button1");
            difficulty = 0;
            fumbleChance = 0.75;
            fieldGoalAimSpeed = 5.0;
            this.sound.play('soundButton');
            //this.sound.play('soundCrowdCheer');
            this.scene.start("SceneStadium");
            this.scene.start("ScenePlaybook");
            //start Poki...
            gameStart();
            //end Poki
          }, this);

          this.buttonDifficulty2 = this.add.sprite(10,200,"button1");
        this.buttonDifficulty2.setOrigin(0,0);
          this.buttonDifficulty2.setInteractive();
          this.buttonDifficulty2.on("pointerover", function() {
            this.buttonDifficulty2.setTexture("button2"); // set the button texture to sprbuttonDifficulty1Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonDifficulty2.on("pointerout", function() {
            this.setTexture("button1");
          });
          this.buttonDifficulty2.on("pointerdown", function() {
            this.buttonDifficulty2.setTexture("button2");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonDifficulty2.on("pointerup", function() {
            this.buttonDifficulty2.setTexture("button1");
            difficulty = 1;
            fumbleChance = 0.8;
            fieldGoalAimSpeed = 8.0;
            this.sound.play('soundButton');
            //this.sound.play('soundCrowdCheer');
            this.scene.start("SceneStadium");
            this.scene.start("ScenePlaybook");
            //start Poki...
            gameStart();
            //end Poki
          }, this);

          this.buttonDifficulty3 = this.add.sprite(10,350,"button1");
        this.buttonDifficulty3.setOrigin(0,0);
          this.buttonDifficulty3.setInteractive();
          this.buttonDifficulty3.on("pointerover", function() {
            this.buttonDifficulty3.setTexture("button2"); // set the button texture to sprbuttonDifficulty1Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonDifficulty3.on("pointerout", function() {
            this.setTexture("button1");
          });
          this.buttonDifficulty3.on("pointerdown", function() {
            this.buttonDifficulty3.setTexture("button2");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonDifficulty3.on("pointerup", function() {
            this.buttonDifficulty3.setTexture("button1");
            difficulty = 2;
            fumbleChance = 0.9;
            fieldGoalAimSpeed = 10.0;
            this.sound.play('soundButton');
            //this.sound.play('soundCrowdCheer');
            this.scene.start("SceneStadium");
            this.scene.start("ScenePlaybook");
            //start Poki...
            gameStart();
            //end Poki
          }, this);

    }


    update(){

    }



  }
