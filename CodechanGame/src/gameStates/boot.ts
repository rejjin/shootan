module CodechanGame.Client {

    export class Boot extends Phaser.State {
        preload() {
            this.load.image('logo', './assets/ui/logo.png');
            this.load.audio('load_stage_loop', 'assets/sounds/logo_loop.ogg');
        }

        create() {
            this.stage.setBackgroundColor(0x304040);

            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            
            this.game.state.start('Preloader', true, false);
        }
    }

}