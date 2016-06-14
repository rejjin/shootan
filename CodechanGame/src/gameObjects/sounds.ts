module CodechanGame.Client {
    export class Sounds {
        sounds = ['gun1', 'gun2', 'gun3', 'gun4', 'gun5'];
        self: Phaser.Game;

        aarghSound: Phaser.Sound = null;

        public firePlay = true;
        public reloadPlay = true;

        constructor(self: Phaser.Game) {
            this.self = self;
        }

        getRandomShoot(): string {
            return this.sounds[Math.floor(Math.random() * this.sounds.length)];
        }

        public playFire() {
            this.self.sound.play(this.getRandomShoot());
        }

        public playReload() {
            this.self.sound.play("reload");
        }

        public playAargh() {
            if (this.aarghSound != null) {
                this.aarghSound.pause();
            }
            this.aarghSound = this.self.sound.play("aargh");
        }
    }
}