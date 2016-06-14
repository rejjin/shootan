module CodechanGame.Client {

    class BulletSprite extends Phaser.Sprite {
        private _isActive = true;
        constructor(game: Phaser.Game, x: number, y: number) {
            super(game, x, y, "bullet_ui");

            this.scale = new Phaser.Point(0.5, 0.5);
            this.fixedToCamera = true;

            game.add.existing(this);
        }
        public isActive(): boolean {
            return this._isActive;
        }
        public setActive(act: boolean) {
            if (act) {
                this._isActive = true;
                this.blendMode = PIXI.blendModes.NORMAL;
                this.alpha = 1;
            } else {
                this._isActive = false;
                this.blendMode = PIXI.blendModes.ADD;
                this.alpha = 0.2;
            }
        }

    }

    export class FreeBullet {
        bullets: any; // fix for old d.ts 
        self: Phaser.Game;
        player: Player;
        freeBulletsCG: Phaser.Physics.P2.CollisionGroup;

        constructor(self: Phaser.Game, player: Player) {
            this.player = player; // not local player!
            this.self = self;
            this.bullets = self.add.group();
            this.bullets.createMultiple(50, 'bullet');
            this.bullets.setAll('scale', new Phaser.Point(0.5, 0.5));

            this.freeBulletsCG = this.self.physics.p2.createCollisionGroup();
            for (let i in this.bullets.children) {
                this.self.physics.p2.enable(this.bullets.children[i]);
                this.bullets.children[i].body.setCollisionGroup(this.freeBulletsCG);
                this.bullets.children[i].body.collides(Defined.wallsCG, this.hitAndDestroy, this);
                this.bullets.children[i].body.collides(Defined.playerCG, this.hitAndDestroy, this);
                this.bullets.children[i].body.collides(Defined.enemyCG, this.hitAndDestroy, this);
            }
        }

        fire(x: number, y: number) {
            let bullet = this.bullets.getFirstDead();
            bullet.reset(this.player.player.x, this.player.player.y);
            this.self.physics.arcade.moveToXY(bullet, x, y, 1500);
        }

        hitAndDestroy(bullet) {
            let newBullet = this.self.add.sprite(bullet.x, bullet.y, "bullet");
            newBullet.scale = new Phaser.Point(0.5, 0.5);
            newBullet.anchor.set(0.5, 0.5);
            let signal = new Phaser.Signal();
            signal.add(() => {
                newBullet.destroy();
            });
            this.self.add.tween(newBullet).to({ angle: 360 }, 800,
                Phaser.Easing.Linear.None, true).onComplete = signal;

            bullet.sprite.kill();
        }

    }

    export class Bullet  {
        bullets: any; // fix for old d.ts 
        self: Phaser.Game;
        player: Player;
        bullet_ui = Array<BulletSprite>();
        sounds: Sounds;
        uniqueID = 0;

        fireRate = 400;
        nextFire = 0;

        constructor(self: Phaser.Game, player: Player, sounds: Sounds) {

            this.sounds = sounds;

            this.player = player;
            this.self = self;
            this.bullets = self.add.group();
            this.bullets.createMultiple(50, 'bullet');

            this.bullets.enableBody = true;

            this.bullets.setAll('scale', new Phaser.Point(0.5, 0.5));

        //    this.bullets.setAll('collideWorldBounds', true);
         //   this.bullets.setAll('checkWorldBounds', true);
          //  this.bullets.setAll('outOfBoundsKill', true);

            this.bullets.setAll('anchor.x', 0.5);
            this.bullets.setAll('anchor.y', 0.5);

            this.initUIBullets();

            Defined.bulletsCG = this.self.physics.p2.createCollisionGroup();
            for (let i in this.bullets.children) {
                this.self.physics.p2.enable(this.bullets.children[i]);
                this.bullets.children[i].body.setCollisionGroup(Defined.bulletsCG);
                this.bullets.children[i].body.collides(Defined.enemyCG, this.hitAndDestroy, this);
                this.bullets.children[i].body.collides(Defined.wallsCG, this.hitAndDestroy, this);
            }
        
        }

        initUIBullets() {
            let temp = this.self.add.sprite(-500, -500, "bullet_ui");
            temp.scale = new Phaser.Point(0.5, 0.5);
            let sp_width = temp.width;
            let sp_height = temp.height;
            temp.destroy();
            let width = this.self.canvas.width;
            let height = this.self.canvas.height;
            let y = height - sp_height - 10;
            let bsize = 10;
            for (let x = width - sp_width - 10; bsize > 0; bsize--) {
                let sprite = new BulletSprite(this.self, x, y);
                this.bullet_ui.push(sprite);
                x -= sp_width + 10;
            }
        }

        hitAndDestroy(bullet) {
            let newBullet = this.self.add.sprite(bullet.x, bullet.y, "bullet");
            newBullet.scale = new Phaser.Point(0.5, 0.5);
            newBullet.anchor.set(0.5, 0.5);
            let signal = new Phaser.Signal();
            signal.add(() => {
                newBullet.destroy();
            });
            this.self.add.tween(newBullet).to({ angle: 360 }, 800,
                Phaser.Easing.Linear.None, true).onComplete = signal;

            bullet.sprite.kill();
        }

        getActivedBullets(): number {
            let result = 0;
            for (let key in this.bullet_ui) {
                if (this.bullet_ui[key].isActive())
                    result++;
            }
            return result;
        }

        disableLastBullet() {
            for (let i = 0; i < this.bullet_ui.length; i++) {
                if (this.bullet_ui[i].isActive()) {
                    this.bullet_ui[i].setActive(false);
                    return;
                }
            }
        }

        setAllToActive() {
            for (let i = 0; i < this.bullet_ui.length; i++) {
                this.bullet_ui[i].setActive(true);
            }
        }

        withoutBodyShoot(x, y) {
            let bullet = this.self.add.sprite(100, 100, "bullet");
            bullet.reset(this.player.player.x, this.player.player.y);
            this.self.physics.arcade.moveToXY(x, y, 1500);
        }

        update() {
          //  if (this.player.isLocal == false) return;
            if (this.self.input.activePointer.leftButton.isDown) {
                if (this.getActivedBullets() > 0) {
                    if (this.self.time.now > this.nextFire && this.bullets.countDead() > 0) {
                        this.nextFire = this.self.time.now + this.fireRate;
                        if (this.getActivedBullets() > 0) {
                            this.disableLastBullet();
                            let bullet = this.bullets.getFirstDead();
                            bullet.reset(this.player.player.x, this.player.player.y);
                            this.self.physics.arcade.moveToPointer(bullet, 1500);
                            this.sounds.playFire();
                            Defined.connection.socket.send({
                                event: 'player_fire', id: this.player.servID,
                                toX: this.self.input.mousePointer.worldX,
                                toY: this.self.input.mousePointer.worldY
                            });
                        }
                    }
                }
            }

            if (this.self.input.activePointer.rightButton.isDown) {
                if (this.getActivedBullets() < 10) {
                    this.nextFire += 600;
                    this.setAllToActive();
                    this.sounds.playReload();
                }
            }
        }
    }
}