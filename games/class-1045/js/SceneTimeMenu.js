class SceneTimeMenu extends Phaser.Scene {
    constructor() {
      super({ key: "SceneTimeMenu" });
    }
    preload() {
        //this.load.image('button', 'content/button.png');
        this.load.image('button1', 'content/playbookButton1.png');
        this.load.image('button2', 'content/playbookButton2.png');
        this.load.image('button1a', 'content/buttonDifficulty1.png');
        this.load.image('button2a', 'content/buttonDifficulty2.png');

        //this.load.image('menuTeams','content/menuTeams.png');
        //this.load.image('menuTime', 'content/menuTime.png');
        this.load.image('menuTime', 'content/scoreboardMask.png');
        this.load.image('shield', 'content/shield2020.png');
        //this.load.image('buttonGmLink1','content/buttonGmLink1.png');
        //this.load.image('buttonGmLink2','content/buttonGmLink2.png');
        this.load.image('buttonSound1', 'content/buttonSound1.png');
        this.load.image('buttonSound2', 'content/buttonSound2.png');

        this.load.audio('soundButton', 'content/beep.mp3');

        //graphics
        this.gradientLineX = 0;
        this.alpha = 0;
        this.alphaBounce = 1;
        this.graphics;
    }
    create() {
       // this.bg = this.add.image(0,0,'menuTeams');
        //this.bg.setOrigin(0.0,0.0);
        //graphics
        this.graphics = this.add.graphics();
        this.graphics.lineGradientStyle(200, 0xff0000, 0xff0000, 0x0000ff, 0x0000ff, this.alpha)
        this.graphics.lineBetween(200, this.gradientLineX, 800, 0);

        this.shield = this.add.image(426,240, 'shield');
        this.shield.setAlpha(0.2);

        this.bgTime = this.add.image(0,0, 'menuTime');
        this.bgTime.setOrigin(0,0);

        this.textTime = this.add.text(533, 200, "SET TIME", { fontFamily: 'Arial', fontSize: 48, color: '#ffffff' });
        this.textTime.setOrigin(0.5, 0.5);
        this.textTime.setStroke('#000000', 4);
        this.textTime.setShadow(-4, 4, '#333333', 4, true, true);

        this.textFive = this.add.text(100, 400, "5:00", { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
        this.textFive.setOrigin(0.0, 0.5);
        this.textFive.setStroke('#000000', 4);
        this.textFive.setShadow(-4, 4, '#333333', 4, true, true);

        this.textTen = this.add.text(390, 400, "10:00", { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
        this.textTen.setOrigin(0.0, 0.5);
        this.textTen.setStroke('#000000', 4);
        this.textTen.setShadow(-4, 4, '#333333', 4, true, true);

        this.textFifteen = this.add.text(700, 400, "15:00", { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
        this.textFifteen.setOrigin(0.0, 0.5);
        this.textFifteen.setStroke('#000000', 4);
        this.textFifteen.setShadow(-4, 4, '#333333', 4, true, true);


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

        this.buttonTime1 = this.add.sprite(30,400,"button1a");
        this.buttonTime1.setOrigin(0,0.5);
          this.buttonTime1.setInteractive();
          this.buttonTime1.on("pointerover", function() {
            this.buttonTime1.setTexture("button2a"); // set the button texture to sprbuttonTime1Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonTime1.on("pointerout", function() {
            this.setTexture("button1a");
          });
          this.buttonTime1.on("pointerdown", function() {
            this.buttonTime1.setTexture("button2a");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonTime1.on("pointerup", function() {
            this.sound.play('soundButton');
            this.buttonTime1.setTexture("button1a");
            time = 300;
            //time = 3;
            this.scene.start("SceneDifficultyMenu");
          }, this);

          this.buttonTime2 = this.add.sprite(330,400,"button1a");
        this.buttonTime2.setOrigin(0,0.5);
          this.buttonTime2.setInteractive();
          this.buttonTime2.on("pointerover", function() {
            this.buttonTime2.setTexture("button2a"); // set the button texture to sprbuttonTime2Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonTime2.on("pointerout", function() {
            this.setTexture("button1a");
          });
          this.buttonTime2.on("pointerdown", function() {
            this.buttonTime2.setTexture("button2a");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonTime2.on("pointerup", function() {
            this.sound.play('soundButton');
            this.buttonTime2.setTexture("button1a");
            time = 600;
            this.scene.start("SceneDifficultyMenu");
          }, this);

          this.buttonTime3 = this.add.sprite(630,400,"button1a");
        this.buttonTime3.setOrigin(0,0.5);
          this.buttonTime3.setInteractive();
          this.buttonTime3.on("pointerover", function() {
            this.buttonTime3.setTexture("button2a"); // set the button texture to sprbuttonTime3Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonTime3.on("pointerout", function() {
            this.setTexture("button1a");
          });
          this.buttonTime3.on("pointerdown", function() {
            this.buttonTime3.setTexture("button2a");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonTime3.on("pointerup", function() {
            this.sound.play('soundButton');
            this.buttonTime3.setTexture("button1a");
            time = 900;
            this.scene.start("SceneDifficultyMenu");
          }, this);

    }


    update(){
      if(sound){
        this.btnSound.setTexture("buttonSound1");
      }else{
        this.btnSound.setTexture("buttonSound2");
      }

      this.shield.x -= 1;
          if(this.shield.x < 0){
            this.shield.x = 800;
          }

      //graphics
      this.alpha += 0.001*this.alphaBounce;
      this.gradientLineX += 10;
      this.graphics.lineGradientStyle(200, 0xff0000, 0xff0000, 0x0000ff, 0x0000ff, this.alpha);
      this.graphics.lineBetween(200, this.gradientLineX, 800, 0);
      if(this.gradientLineX > 3000){
        this.graphics.clear();
        this.gradientLineX = 0;
        this.alpha = 0;
      }
    }



  }
