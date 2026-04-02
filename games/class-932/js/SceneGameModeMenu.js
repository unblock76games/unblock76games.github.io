class SceneGameModeMenu extends Phaser.Scene {
    constructor() {
      super({ key: "SceneGameModeMenu" });
    }
    preload() {
        //this.load.image('button', 'content/button.png');
        this.load.image('buttonSelect1', 'content/buttonSelect1.png');
        this.load.image('buttonSelect2', 'content/buttonSelect2.png');
        this.load.image('menuTeams','content/menuTeams.png');
        this.load.image('buttonGmLink1','content/buttonGmLink1.png');
        this.load.image('buttonGmLink2','content/buttonGmLink2.png');

        this.load.audio('soundButton', 'content/beep.mp3');
    }
    create() {
        this.bg = this.add.image(0,0,'menuTeams');
        this.bg.setOrigin(0.0,0.0);

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

        this.btnPlay = this.add.sprite(280,300,"buttonSelect1");
        this.btnPlay.setOrigin(0,0);
          this.btnPlay.setInteractive();
          this.btnPlay.on("pointerover", function() {
            this.btnPlay.setTexture("buttonSelect2"); // set the button texture to sprBtnPlayHover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.btnPlay.on("pointerout", function() {
            this.setTexture("buttonSelect1");
          });
          this.btnPlay.on("pointerdown", function() {
            this.btnPlay.setTexture("buttonSelect2");
            //this.sfx.btnDown.play();
          }, this);
          this.btnPlay.on("pointerup", function() {
            this.sound.play('soundButton');
            this.btnPlay.setTexture("buttonSelect1");
            playerGraphics = ['content/playerPackers.png','content/playerRaiders.png'];
            this.scene.start("SceneTimeMenu");
          }, this);

          this.btnSelect2 = this.add.sprite(600,300,"buttonSelect1");
        this.btnSelect2.setOrigin(0,0);
          this.btnSelect2.setInteractive();
          this.btnSelect2.on("pointerover", function() {
            this.btnSelect2.setTexture("buttonSelect2"); // set the button texture to sprbtnSelect2Hover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.btnSelect2.on("pointerout", function() {
            this.setTexture("buttonSelect1");
          });
          this.btnSelect2.on("pointerdown", function() {
            this.btnSelect2.setTexture("buttonSelect2");
            //this.sfx.btnDown.play();
          }, this);
          this.btnSelect2.on("pointerup", function() {
            this.sound.play('soundButton');
            this.btnSelect2.setTexture("buttonSelect1");
            playerGraphics = ['content/playerRaiders.png', 'content/playerPackers.png'];
            this.scene.start("SceneTimeMenu");
          }, this);

    }


    update(){

    }



  }
