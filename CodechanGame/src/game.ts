
module CodechanGame.Client {
    export class GameEngine extends Phaser.Game {
        constructor() {
            super('100%', '100%', Phaser.AUTO, 'content', null);

            this.state.add('Boot', Boot, false);
            this.state.add('Preloader', Preloader, false);
            this.state.add('MainMenu', MainMenu, false);
            this.state.add('Level', Level, false);
        }

        init() {
            this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // disable right mouse btn context menu on canvas
    document.getElementById('content').addEventListener('contextmenu',
        (e) => e.preventDefault()
    ); 

    let game = new CodechanGame.Client.GameEngine();
    game.state.start('Boot');
});