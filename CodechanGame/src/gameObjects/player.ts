/// <reference path="sounds.ts" />
/// <reference path="playerstruct.ts" />
/// <reference path="bullet.ts" />

module CodechanGame.Client {

    class BulletFree extends Phaser.Sprite {
        public id: number;
        public is_free: boolean = true;
        constructor(game: Phaser.Game) {
            super(game, -100, -100, "bullet");
            this.visible = false;
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
        }
    }

    export class Player extends PlayerStruct {
        player: Phaser.Sprite;
        self: Phaser.Game;
        marker: Phaser.Sprite;
        marker_green: Phaser.Sprite;
        live: boolean = true;
        name_text: Phaser.Text;
        bullets: Bullet;
        sounds: Sounds;
        players_text: Phaser.Text;
        score_text: Phaser.Text;
        blood: Phaser.Sprite;
        blooding: boolean = false;
        freeBullet: FreeBullet;
        currPlayerCG: Phaser.Physics.P2.CollisionGroup;

        constructor(self: Phaser.Game, isLocal: boolean) {
            super();

            this.self = self;

            this.marker = this.self.add.sprite(640, 640, 'player-marker');
            this.marker_green = this.self.add.sprite(640, 640, 'player-marker-green');

            this.marker.anchor.setTo(0.5);
            this.marker.scale = new Phaser.Point(0.4, 0.4);
            this.marker_green.anchor.setTo(0.5);
            this.marker_green.scale = new Phaser.Point(0.4, 0.4);

            this.player = this.self.add.sprite(640, 640, 'player');
            this.player.anchor.setTo(0.5);
            this.player.scale = new Phaser.Point(0.4, 0.4);

            this.blood = this.self.add.sprite(-100, -100, 'blood');
            this.blood.animations.add('blooding');
            this.blood.anchor.set(0.5, 0.5);
            this.blood.scale = new Phaser.Point(0.15, 0.15);
            this.blood.alpha = 0.8;

            this.sounds = new Sounds(this.self);

            if (isLocal) {
                let flash = this.self.add.graphics(0, 0);
                flash.beginFill(0x000000, 0.5);
                flash.drawRect(0, this.self.canvas.height - 80, 500, 80); // left-bottom
                flash.drawRect(this.self.canvas.width - 500, this.self.canvas.height - 80, 500, 80); // right-bottom
                flash.drawRect(this.self.canvas.width - 100, 0, 100, 300); // up-right
                flash.fixedToCamera = true;
                flash.endFill();

                let style = { font: "18px Arial", fontStyle: "bold", fill: "#ffffff" };
                this.players_text = this.self.add.text(this.self.canvas.width-95, 0, "", style);
                this.players_text.fixedToCamera = true;

                style = { font: "18px Arial", fontStyle: "bold", fill: "#b95506" };
                this.score_text = this.self.add.text(this.self.canvas.width - 20, 0, "", style);
                this.score_text.fixedToCamera = true;

                this.bullets = new Bullet(this.self, this, this.sounds);
            }

            this.freeBullet = new FreeBullet(this.self, this);

            let style = { font: "34px Arial", fontStyle: "bold", fill: "#e61b1b" };
            this.name = Defined.getRandomName();
            this.name_text = this.self.add.text(-100, -100, this.name, style);
            this.name_text.anchor.setTo(0.5);

            this.player.animations.add('idle', Phaser.Animation.generateFrameNames('survivor-idle_handgun_', 0, 19), 25, true);
            this.player.animations.add('move', Phaser.Animation.generateFrameNames('survivor-move_handgun_', 0, 19), 25, true);
            this.player.animations.add('reload', Phaser.Animation.generateFrameNames('survivor-reload_handgun_', 0, 14), 25, true);
            this.player.animations.add('shoot', Phaser.Animation.generateFrameNames('survivor-shoot_handgun_', 0, 2), 25, true);

            this.onChangeAnim((s) => this.player.animations.play(s));

            this.self.physics.p2.enable(this.player); // second arg is debug
            // this.player.body.setZeroDamping();
            this.player.body.setCircle(26);

            if (this.getID() == Defined.localID) {
                this.isLocal = true;
            } else {
                this.isLocal = false;
            }

            this.servID = Defined.myServID;

            this.currPlayerCG = this.self.physics.p2.createCollisionGroup();
            this.player.body.setCollisionGroup(this.currPlayerCG);

            this.setAnim("idle");
        }

        update() {
            if (!this.live) return;
            if (this.isLocal == true) {     // local player
                let x = this.self.input.mousePointer.x + this.self.camera.x; // mouse world position
                let y = this.self.input.mousePointer.y + this.self.camera.y;
                let inPointer = Phaser.Rectangle.contains(this.player.body, x, y);
                let inDestXY = Phaser.Rectangle.contains(this.player.body,
                    this.xdest + this.self.camera.x,
                    this.ydest + this.self.camera.y);

                if (this.hasMove) {
                    this.setAnim("move");
                } else {
                    this.setAnim("idle");
                }
       
                if (!inPointer) {
                    this.player.body.rotation = this.self.physics.arcade.angleBetween(this.player, {
                        x: this.self.input.mousePointer.worldX,
                        y: this.self.input.mousePointer.worldY
                    });
                    
                }

                this.player.body.setZeroVelocity();

                let speed = Defined.playerMoveSpeed;

                if (this.self.input.keyboard.isDown(Phaser.Keyboard.W) ||
                 this.self.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                    this.player.body.moveUp(speed);
                }

                if (this.self.input.keyboard.isDown(Phaser.Keyboard.S) ||
                    this.self.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                    this.player.body.moveDown(speed);
                }

                if (this.self.input.keyboard.isDown(Phaser.Keyboard.A) ||
                    this.self.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                    this.player.body.moveLeft(speed);
                }

                if (this.self.input.keyboard.isDown(Phaser.Keyboard.D) ||
                    this.self.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                    this.player.body.moveRight(speed);
                }

                this.marker_green.visible = true;
                this.marker_green.x = this.player.x;
                this.marker_green.y = this.player.y;
                this.marker_green.angle += 2;

                this.marker.visible = false;

                this.name_text.anchor.set(0, 0);
                let text = this.name + ": " + Math.max(0, this.HP) + "%";
                let style = { font: "60px Arial", fontStyle: "bold", fill: "#004dff" };

                if (this.HP < 50) { style.fill = "#ff0000" }
                if (this.HP >= 50) { style.fill = "#004dff" }

                let pos = new Phaser.Point(5, this.self.canvas.height - this.name_text.height);

                this.name_text.position = pos;
                this.name_text.setStyle(style, true);

                this.name_text.text = text;
                this.name_text.fixedToCamera = true;

                let names = ""
                for (let player in Defined.playerList) {
                    names += Defined.playerList[player].name + "\n";
                }
                this.players_text.text = names;

                let scores = ""
                for (let player in Defined.playerList) {
                    scores += Defined.playerList[player].score + "\n";
                }
                this.score_text.text = scores;

                this.bullets.update();
            }
            else {  // not local player
                this.player.body.x = this.x;
                this.player.body.y = this.y
                this.player.body.rotation = this.rotation;
                this.setAnim(this.anim);

                this.marker.visible = true;
                this.marker.x = this.player.x;
                this.marker.y = this.player.y;
                this.marker.angle += 2;
                this.marker_green.visible = false;

                let pos = new Phaser.Point(this.player.x, this.player.y - this.player.height / 2 - 10);
                this.name_text.text = this.name;
                this.name_text.position = pos;
            }

            if (this.blooding) {
                this.blooding = false;
                this.blood.visible = true;
                this.blood.position = this.player.position;
                this.blood.animations.play('blooding', 30, true);
                this.sounds.playAargh();
                setTimeout(() => {
                    this.blood.animations.stop();
                    this.blood.visible = false;
                }, 400);
            }
        }

        destroy() {
            this.live = false;
            this.player.destroy();
            this.name_text.destroy();
            this.marker_green.destroy();
            this.marker.destroy()
        }
    }
}