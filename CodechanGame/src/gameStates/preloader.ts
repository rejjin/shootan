module CodechanGame.Client {

    export class Preloader extends Phaser.State {
        loaderText: Phaser.Text;
        logo: Phaser.Sprite;
        music: Phaser.Sound;

        preload() {
            this.loaderText = this.game.add.text(this.world.centerX, this.world.centerY, "Loading...",
                { font: "36px Tahoma", fontStyle: "bold", fill: "#F9FFF7", align: "center" });
            this.loaderText.anchor.setTo(0.5);

            this.logo = this.add.sprite(this.world.centerX, -400, 'logo');
            this.logo.anchor.setTo(0.5);

            this.music = this.add.audio('load_stage_loop');
            let clbk = new Phaser.Signal();
            clbk.add(() => {
                if (this.game.state.current == "Preloader")
                    this.music.play()
            }, this);
            this.music.onStop = clbk;

            this.load.image('debug-grid', './assets/sprites/debug-grid.png');

            this.load.image('bg-loader', './assets/ui/bg-loader.png');
            this.load.image('player-marker', './assets/sprites/player_marker.png');  
            this.load.image('player-marker-green', './assets/sprites/player_marker_green.png');
            this.load.image('bullet', './assets/sprites/bullet.png');  
            this.load.image('fire1', './assets/sprites/fire1.png');  
            this.load.image('bullet_ui', './assets/sprites/bullet_ui.png');
            this.load.spritesheet('blood', 'assets/sprites/blood.png', 500, 500);


            this.load.audio('click', './assets/sounds/click.ogg', true); 
            this.load.audio('gun1', './assets/sounds/gun1.mp3', true); 
            this.load.audio('gun2', './assets/sounds/gun2.mp3', true); 
            this.load.audio('gun3', './assets/sounds/gun3.mp3', true); 
            this.load.audio('gun4', './assets/sounds/gun4.mp3', true); 
            this.load.audio('gun5', './assets/sounds/gun5.mp3', true); 
            this.load.audio('reload', './assets/sounds/reload.mp3', true); 
            this.load.audio('aargh', './assets/sounds/aargh.mp3', true);


            let mclbk = new Phaser.Signal();
            mclbk.add(() => {
                Defined.bgMusic = this.add.audio('bg-music');
                let decClbk = new Phaser.Signal();
                decClbk.add(() => {
                    if (Defined.playMusic) {
                        Defined.bgMusic.loop = true;
                        Defined.bgMusic.volume = 0.2;
                        Defined.bgMusic.play();
                    }
                }, this);
                Defined.bgMusic.onDecoded = decClbk;
            }, this);
            let bgmusic = this.load.audio('bg-music', './assets/sounds/bg-music.ogg', true);
            bgmusic.onLoadComplete = mclbk; 
                
            this.load.atlas('player', './assets/sprites/player.png', './assets/sprites/player.json');

            this.load.tilemap('TILEDMap', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.image('TILEDcollider', 'assets/map/collider.png');
            this.load.image('TILEDbackground', 'assets/map/map.png');
        }

        create() {
            
            this.music.play();
            this.add.tween(this.logo).to( // logo tween to center
                { y: this.world.centerY },
                2000,
                Phaser.Easing.Elastic.Out,
                true,
                500)
                .onComplete.add(() => { // loader text fade out
                    this.add.tween(this.loaderText).to(
                        { alpha: 0 },
                        2000,
                        Phaser.Easing.Linear.None,
                        true)
                        .onComplete.add(() => { // logo tween to bottom
                            this.add.tween(this.logo).to(
                                { y: this.world.height + 200 },
                                1500,
                                Phaser.Easing.Elastic.Out,
                                true,
                                600)
                                .onComplete.add(this.nextGameState, this);
                        }, this);
                }, this);
        }

        nextGameState() {
            this.music.pause();
            
            this.game.state.start('MainMenu', true, false);
        }
    }

}