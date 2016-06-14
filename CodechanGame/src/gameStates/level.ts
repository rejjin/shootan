module CodechanGame.Client {

    export class Level extends Phaser.State {
        player: Player;
        blockedLayer: Phaser.TilemapLayer;
        map: Phaser.Tilemap;
        mapObjs: Phaser.Physics.P2.Body[];

        create() {
            //this.add.tileSprite(0, 0, 1920, 1920, 'debug-grid');
            //this.world.setBounds(0, 0, 1920, 1920);

            this.game.physics.startSystem(Phaser.Physics.P2JS);
            this.game.physics.p2.restitution = 0; // ex default restitution
            this.game.physics.p2.setImpactEvents(true);

            this.map = this.add.tilemap("TILEDMap");
            this.map.addTilesetImage("collider", "TILEDcollider");

            this.add.tileSprite(0, 0, 2240, 2240, 'TILEDbackground');

            let layer = this.map.createLayer('tiles');
            layer.visible = false;

            // enemy and walls CG
            Defined.enemyCG = this.game.physics.p2.createCollisionGroup();
            Defined.wallsCG = this.game.physics.p2.createCollisionGroup();
            Defined.playerCG = this.game.physics.p2.createCollisionGroup();

            this.player = new Player(this.game, true);
            this.player.player.body.setCollisionGroup(Defined.playerCG);
            this.game.camera.follow(this.player.player);
            Defined.playerList.push(this.player);

            this.map.setCollisionBetween(1, 1500, true, "tiles");

            this.mapObjs = this.game.physics.p2.convertTilemap(this.map, "tiles");
            for (let idx in this.mapObjs) {
                this.game.physics.p2.enable(this.mapObjs[idx]);
                this.mapObjs[idx].setCollisionGroup(Defined.wallsCG);
                this.mapObjs[idx].collides(Defined.playerCG);
                this.mapObjs[idx].collides(Defined.bulletsCG);
            }

            Defined.connection.initSocketCallbacks(this.game, this.player);
            Defined.connection.onNewPlayer((otherPlayer: Player) => {
                this.game.physics.p2.enable(otherPlayer.player);
                otherPlayer.player.body.setCollisionGroup(Defined.enemyCG);
                otherPlayer.player.body.collides(Defined.enemyCG);
                otherPlayer.player.body.collides(Defined.playerCG);
                otherPlayer.player.body.collides(Defined.wallsCG);
                otherPlayer.player.body.collides(Defined.bulletsCG, () => {
                    Defined.connection.socket.send({
                        event: 'decrease_hp', id: otherPlayer.servID, sPlayer: this.player.servID
                    });
                    otherPlayer.blooding = true;
                }, this);

                for (let i in otherPlayer.freeBullet.bullets.children) {
                    otherPlayer.freeBullet.bullets.children[i].body.collides(Defined.playerCG);
                    otherPlayer.freeBullet.bullets.children[i].body.collides(Defined.wallsCG);
                }
                this.player.player.body.collides(otherPlayer.freeBullet.freeBulletsCG);

                for (let idx in this.mapObjs) {
                    this.mapObjs[idx].collides(otherPlayer.freeBullet.freeBulletsCG);
                }

                for (let i in Defined.playerList) {
                    if (Defined.playerList[i].servID == otherPlayer.servID)
                        continue;
                    Defined.playerList[i].player.body.collides(otherPlayer.freeBullet.freeBulletsCG);
                    for (let x in otherPlayer.freeBullet.bullets.children) {
                        otherPlayer.freeBullet.bullets.children[i].body.collides(Defined.playerList[i].currPlayerCG)
                    }
                }
            });

            this.player.player.body.collides(Defined.enemyCG);
            this.player.player.body.collides(Defined.wallsCG);

            this.world.setBounds(0, 0, 2240, 2240); // world size, dont layer
            this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);
            this.game.physics.p2.updateBoundsCollisionGroup();
        }

        enemyHit(player) {
            console.log(player);
        }

        update() {
            for (let key in Defined.playerList) {
                Defined.playerList[key].update();
            }

            this.game.physics.arcade.collide(this.player.player, this.blockedLayer);

            Defined.connection.socket.send({
                event: 'my_data', data: {
                    x: this.player.player.x,
                    y: this.player.player.y,
                    anim: this.player.anim,
                    rotation: this.player.player.rotation,
                    servID: this.player.servID,
                    hp: this.player.HP,
                    name: this.player.name,
                    score: this.player.score
                }
            });

        }
    }

}