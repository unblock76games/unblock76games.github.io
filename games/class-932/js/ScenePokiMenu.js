class ScenePokiMenu extends Phaser.Scene {
    constructor() {
      super({ key: "ScenePokiMenu" });
    }



    preload() {
      //start Poki...
      startCommercialFirst();
      //gameStart();   --> moved to difficulty menu
      //end Poki

      this.load.image('loadedMenu','content/loadedMenu.png');
      this.load.image('loadingMenu','content/loadingMenu.png');
      this.load.image('buttonStart1', 'content/buttonStart1.png');
      this.load.image('buttonStart2', 'content/buttonStart2.png');

      this.counter = 0;
    }
    create() {
        this.loadingScreen = this.add.image(0,0,'loadingMenu');
        this.loadingScreen.setOrigin(0.0,0.0);

        this.loadedScreen = this.add.image(0,0,'loadedMenu');
        this.loadedScreen.setOrigin(0,0);

        this.loadedScreen.visible = false;


        this.buttonStart = this.add.sprite(422,350,"buttonStart1");
        this.buttonStart.setOrigin(0.5,0);
          this.buttonStart.setInteractive();
          this.buttonStart.on("pointerover", function() {
            this.buttonStart.setTexture("buttonStart2"); // set the button texture to sprbuttonStartHover
            //this.sfx.btnOver.play(); // play the button over sound
          }, this);
          this.buttonStart.on("pointerout", function() {
            this.setTexture("buttonStart1");
          });
          this.buttonStart.on("pointerdown", function() {
            this.buttonStart.setTexture("buttonStart2");
            //this.sfx.btnDown.play();
          }, this);
          this.buttonStart.on("pointerup", function() {
            this.buttonStart.setTexture("buttonStart1");
            
            //below is here in case commercial fails...
            this.scene.start("SceneMainMenu");
            this.sound.play('soundButton');
          }, this);

          this.buttonStart.visible = false;

    }


    update(){
      this.counter += 1;
      if(this.counter > 200){
          this.buttonStart.visible = true;
          this.loadedScreen.visible = true;
          //this.buttonStart.setAlpha(this.counter - 100);
      }
      //Poki... I added muting for commercial breaks
      if(!sound){
        this.sound.mute = true;
      }else{
        this.sound.mute = false;
      }
      //end poki mute for commercials
        
    }




  }
