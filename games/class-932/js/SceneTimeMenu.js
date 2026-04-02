class SceneTimeMenu extends Phaser.Scene {
    constructor() {
      super({ key: "SceneTimeMenu" });
    }
    preload() {
        //this.load.image('button', 'content/button.png');
        this.load.image('button1', 'content/playbookButton1.png');
        this.load.image('button2', 'content/playbookButton2.png');
        this.load.image('menuTeams','content/menuTeams.png');
        this.load.image('menuTime', 'content/menuTime.png');
        this.load.image('buttonGmLink1','content/buttonGmLink1.png');
        this.load.image('buttonGmLink2','content/buttonGmLink2.png');

        this.load.audio('soundButton', 'content/beep.mp3');
    }
    create() {
        this.bg = this.add.image(0,0,'menuTeams');
        this.bg.setOrigin(0.0,0.0);
        this.bgTime = this.add.image(0,0, 'menuTime');
        this.bgTime.setOrigin(0,0);

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

        this.buttonTime1 = this.add.sprite(10,50,"button1");
        this.buttonTime1.setOrigin(0,0);
          this.buttonTime1.setInteractive();
          this.buttonTime1.on("pointerover", function() {
            this.buttonTime1.setTexture("button2"); // set the button texture to sprbuttonTime1Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonTime1.on("pointerout", function() {
            this.setTexture("button1");
          });
          this.buttonTime1.on("pointerdown", function() {
            this.buttonTime1.setTexture("button2");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonTime1.on("pointerup", function() {
            this.sound.play('soundButton');
            this.buttonTime1.setTexture("button1");
            time = 300;
            //time = 3;
            this.scene.start("SceneDifficultyMenu");
          }, this);

          this.buttonTime2 = this.add.sprite(10,200,"button1");
        this.buttonTime2.setOrigin(0,0);
          this.buttonTime2.setInteractive();
          this.buttonTime2.on("pointerover", function() {
            this.buttonTime2.setTexture("button2"); // set the button texture to sprbuttonTime2Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonTime2.on("pointerout", function() {
            this.setTexture("button1");
          });
          this.buttonTime2.on("pointerdown", function() {
            this.buttonTime2.setTexture("button2");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonTime2.on("pointerup", function() {
            this.sound.play('soundButton');
            this.buttonTime2.setTexture("button1");
            time = 600;
            this.scene.start("SceneDifficultyMenu");
          }, this);

          this.buttonTime3 = this.add.sprite(10,350,"button1");
        this.buttonTime3.setOrigin(0,0);
          this.buttonTime3.setInteractive();
          this.buttonTime3.on("pointerover", function() {
            this.buttonTime3.setTexture("button2"); // set the button texture to sprbuttonTime3Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonTime3.on("pointerout", function() {
            this.setTexture("button1");
          });
          this.buttonTime3.on("pointerdown", function() {
            this.buttonTime3.setTexture("button2");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonTime3.on("pointerup", function() {
            this.sound.play('soundButton');
            this.buttonTime3.setTexture("button1");
            time = 900;
            this.scene.start("SceneDifficultyMenu");
          }, this);

    }


    update(){

    }



  }
