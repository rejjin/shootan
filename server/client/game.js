var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var BulletSprite = (function (_super) {
            __extends(BulletSprite, _super);
            function BulletSprite(game, x, y) {
                _super.call(this, game, x, y, "bullet_ui");
                this._isActive = true;
                this.scale = new Phaser.Point(0.5, 0.5);
                this.fixedToCamera = true;
                game.add.existing(this);
            }
            BulletSprite.prototype.isActive = function () {
                return this._isActive;
            };
            BulletSprite.prototype.setActive = function (act) {
                if (act) {
                    this._isActive = true;
                    this.blendMode = PIXI.blendModes.NORMAL;
                    this.alpha = 1;
                }
                else {
                    this._isActive = false;
                    this.blendMode = PIXI.blendModes.ADD;
                    this.alpha = 0.2;
                }
            };
            return BulletSprite;
        }(Phaser.Sprite));
        var FreeBullet = (function () {
            function FreeBullet(self, player) {
                this.player = player;
                this.self = self;
                this.bullets = self.add.group();
                this.bullets.createMultiple(50, 'bullet');
                this.freeBulletsCG = this.self.physics.p2.createCollisionGroup();
                for (var i in this.bullets.children) {
                    this.self.physics.p2.enable(this.bullets.children[i]);
                    this.bullets.children[i].body.setCollisionGroup(this.freeBulletsCG);
                    this.bullets.children[i].body.collides(Client.Defined.enemyCG, this.hitAndDestroy, this);
                    this.bullets.children[i].body.collides(Client.Defined.wallsCG, this.hitAndDestroy, this);
                }
            }
            FreeBullet.prototype.fire = function (x, y) {
                var bullet = this.bullets.getFirstDead();
                bullet.reset(this.player.player.x, this.player.player.y);
                this.self.physics.arcade.moveToXY(bullet, x, y, 1500);
            };
            FreeBullet.prototype.hitAndDestroy = function (bullet) {
                var newBullet = this.self.add.sprite(bullet.x, bullet.y, "bullet");
                newBullet.anchor.set(0.5, 0.5);
                var signal = new Phaser.Signal();
                signal.add(function () {
                    newBullet.destroy();
                });
                this.self.add.tween(newBullet).to({ angle: 360 }, 800, Phaser.Easing.Linear.None, true).onComplete = signal;
                bullet.sprite.kill();
            };
            return FreeBullet;
        }());
        Client.FreeBullet = FreeBullet;
        var Bullet = (function () {
            function Bullet(self, player, sounds) {
                this.bullet_ui = Array();
                this.uniqueID = 0;
                this.fireRate = 400;
                this.nextFire = 0;
                this.sounds = sounds;
                this.player = player;
                this.self = self;
                this.bullets = self.add.group();
                this.bullets.createMultiple(50, 'bullet');
                this.bullets.enableBody = true;
                this.bullets.setAll('anchor.x', 0.5);
                this.bullets.setAll('anchor.y', 0.5);
                this.initUIBullets();
                Client.Defined.bulletsCG = this.self.physics.p2.createCollisionGroup();
                for (var i in this.bullets.children) {
                    this.self.physics.p2.enable(this.bullets.children[i]);
                    this.bullets.children[i].body.setCollisionGroup(Client.Defined.bulletsCG);
                    this.bullets.children[i].body.collides(Client.Defined.enemyCG, this.hitAndDestroy, this);
                    this.bullets.children[i].body.collides(Client.Defined.wallsCG, this.hitAndDestroy, this);
                }
            }
            Bullet.prototype.initUIBullets = function () {
                var temp = this.self.add.sprite(-500, -500, "bullet_ui");
                temp.scale = new Phaser.Point(0.5, 0.5);
                var sp_width = temp.width;
                var sp_height = temp.height;
                temp.destroy();
                var width = this.self.canvas.width;
                var height = this.self.canvas.height;
                var y = height - sp_height - 10;
                var bsize = 10;
                for (var x = width - sp_width - 10; bsize > 0; bsize--) {
                    var sprite = new BulletSprite(this.self, x, y);
                    this.bullet_ui.push(sprite);
                    x -= sp_width + 10;
                }
            };
            Bullet.prototype.hitAndDestroy = function (bullet) {
                var newBullet = this.self.add.sprite(bullet.x, bullet.y, "bullet");
                newBullet.anchor.set(0.5, 0.5);
                var signal = new Phaser.Signal();
                signal.add(function () {
                    newBullet.destroy();
                });
                this.self.add.tween(newBullet).to({ angle: 360 }, 800, Phaser.Easing.Linear.None, true).onComplete = signal;
                bullet.sprite.kill();
            };
            Bullet.prototype.getActivedBullets = function () {
                var result = 0;
                for (var key in this.bullet_ui) {
                    if (this.bullet_ui[key].isActive())
                        result++;
                }
                return result;
            };
            Bullet.prototype.disableLastBullet = function () {
                for (var i = 0; i < this.bullet_ui.length; i++) {
                    if (this.bullet_ui[i].isActive()) {
                        this.bullet_ui[i].setActive(false);
                        return;
                    }
                }
            };
            Bullet.prototype.setAllToActive = function () {
                for (var i = 0; i < this.bullet_ui.length; i++) {
                    this.bullet_ui[i].setActive(true);
                }
            };
            Bullet.prototype.withoutBodyShoot = function (x, y) {
                var bullet = this.self.add.sprite(100, 100, "bullet");
                bullet.reset(this.player.player.x, this.player.player.y);
                this.self.physics.arcade.moveToXY(x, y, 1500);
            };
            Bullet.prototype.update = function () {
                if (this.self.input.activePointer.leftButton.isDown) {
                    if (this.getActivedBullets() > 0) {
                        if (this.self.time.now > this.nextFire && this.bullets.countDead() > 0) {
                            this.nextFire = this.self.time.now + this.fireRate;
                            if (this.getActivedBullets() > 0) {
                                this.disableLastBullet();
                                var bullet = this.bullets.getFirstDead();
                                bullet.reset(this.player.player.x, this.player.player.y);
                                this.self.physics.arcade.moveToPointer(bullet, 1500);
                                this.sounds.playFire();
                                Client.Defined.connection.socket.send({
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
            };
            return Bullet;
        }());
        Client.Bullet = Bullet;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var PlayerStruct = (function () {
            function PlayerStruct() {
                this.x = 0;
                this.y = 0;
                this.anim = "idle";
                this.xdest = -600;
                this.ydest = -600;
                this.hasMove = false;
                this.isLocal = true;
                this.rotation = 0;
                this.HP = 100;
                this.score = 0;
                this.currentID = Client.Defined.playersLength;
                ++Client.Defined.playersLength;
            }
            PlayerStruct.prototype.onChangeAnim = function (clbk) {
                this.onChangeAnimClbk = clbk;
            };
            PlayerStruct.prototype.getID = function () {
                return this.currentID;
            };
            PlayerStruct.prototype.setAnim = function (anim) {
                this.anim = anim;
                this.onChangeAnimClbk(this.anim);
            };
            PlayerStruct.prototype.getAnim = function () {
                return this.anim;
            };
            return PlayerStruct;
        }());
        Client.PlayerStruct = PlayerStruct;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var Sounds = (function () {
            function Sounds(self) {
                this.sounds = ['gun1', 'gun2', 'gun3', 'gun4', 'gun5'];
                this.aarghSound = null;
                this.firePlay = true;
                this.reloadPlay = true;
                this.self = self;
            }
            Sounds.prototype.getRandomShoot = function () {
                return this.sounds[Math.floor(Math.random() * this.sounds.length)];
            };
            Sounds.prototype.playFire = function () {
                this.self.sound.play(this.getRandomShoot());
            };
            Sounds.prototype.playReload = function () {
                this.self.sound.play("reload");
            };
            Sounds.prototype.playAargh = function () {
                if (this.aarghSound != null) {
                    this.aarghSound.pause();
                }
                this.aarghSound = this.self.sound.play("aargh");
            };
            return Sounds;
        }());
        Client.Sounds = Sounds;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var Connection = (function () {
            function Connection() {
                this.socket = null;
            }
            Connection.prototype.onNewPlayer = function (clbk) {
                this.onNewPlayerClbk = clbk;
            };
            Connection.prototype.connect = function () {
                this.socket = io.connect(Client.Defined.URL_CONNECTION);
            };
            Connection.prototype.setData = function (servID, data, self) {
                var idx = Client.Defined.getPlayerByServID(servID);
                if (idx == -1) {
                    var con_player = new Client.Player(self, false);
                    con_player.isLocal = false;
                    con_player.servID = data.servID;
                    con_player.x = -300;
                    con_player.y = -300;
                    this.onNewPlayerClbk(con_player);
                    Client.Defined.playerList.push(con_player);
                    idx = Client.Defined.getPlayerByServID(data.servID);
                }
                Client.Defined.playerList[idx].x = data.x;
                Client.Defined.playerList[idx].y = data.y;
                Client.Defined.playerList[idx].anim = data.anim;
                Client.Defined.playerList[idx].rotation = data.rotation;
                Client.Defined.playerList[idx].HP = data.hp;
                Client.Defined.playerList[idx].name = data.name;
                Client.Defined.playerList[idx].score = data.score;
            };
            Connection.prototype.initSocketCallbacks = function (self, curPlayer) {
                var _this = this;
                Client.Defined.connection.socket.on("message", function (msg) {
                    if (msg.event == "other_connected") {
                        var con_player = new Client.Player(self, false);
                        con_player.isLocal = false;
                        con_player.servID = msg.id;
                        con_player.x = -300;
                        con_player.y = -300;
                        _this.onNewPlayerClbk(con_player);
                        Client.Defined.playerList.push(con_player);
                    }
                    if (msg.event == "new_data") {
                        Client.Defined.connection.setData(msg.data.servID, msg.data, self);
                    }
                    if (msg.event == "data_of_all_players") {
                        var _data = JSON.parse(msg.data);
                        for (var _i = 0, _data_1 = _data; _i < _data_1.length; _i++) {
                            var data = _data_1[_i];
                            if (data.servID == curPlayer.servID)
                                continue;
                            Client.Defined.connection.setData(data.servID, data, self);
                        }
                    }
                    if (msg.event == "user_disconnect") {
                        var servID = msg.id;
                        var idx = Client.Defined.getPlayerByServID(servID);
                        if (idx >= 0) {
                            Client.Defined.playerList[idx].destroy();
                        }
                    }
                    if (msg.event == "down_hp") {
                        var servID = msg.id;
                        var killerID = msg.sid;
                        if (curPlayer.servID == servID) {
                            curPlayer.HP -= 8;
                            if (curPlayer.HP <= 0) {
                                Client.Defined.connection.socket.send({ event: 'i_killed', id: curPlayer.servID, sid: killerID });
                                curPlayer.live = false;
                                var flash = self.add.graphics(0, 0);
                                flash.beginFill(0x000000, 0.5);
                                flash.drawRect(0, 0, self.canvas.width, self.canvas.height);
                                flash.fixedToCamera = true;
                                flash.endFill();
                                var killerName = Client.Defined.playerList[Client.Defined.getPlayerByServID(killerID)].name;
                                var style = { font: "78px Arial", fontStyle: "bold", fill: "#d80000" };
                                var text = self.add.text(0, 0, "YOU KILLED BY " + killerName, style);
                                text.anchor.set(0.5, 0.5);
                                text.position = new Phaser.Point(self.canvas.width / 2, self.canvas.height / 2);
                                text.fixedToCamera = true;
                                Client.Defined.connection.socket.disconnect();
                            }
                        }
                    }
                    if (msg.event == "player_killed") {
                        var servID = msg.id;
                        var killerID = msg.sid;
                        var idx = Client.Defined.getPlayerByServID(servID);
                        if (idx >= 0) {
                            Client.Defined.playerList[idx].destroy();
                            Client.Defined.playerList.splice(idx, idx);
                        }
                    }
                    if (msg.event == "player_fire") {
                        if (curPlayer.servID == msg.id)
                            return;
                        var idx = Client.Defined.getPlayerByServID(msg.id);
                        if (idx >= 0) {
                            Client.Defined.playerList[idx].freeBullet.fire(msg.toX, msg.toY);
                            Client.Defined.playerList[idx].sounds.playFire();
                        }
                    }
                    if (msg.event == "incr_score") {
                        if (curPlayer.servID == msg.id) {
                            curPlayer.score++;
                        }
                    }
                });
                Client.Defined.connection.socket.send({ event: 'get_data_of_all_players' });
            };
            return Connection;
        }());
        Client.Connection = Connection;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var GameEngine = (function (_super) {
            __extends(GameEngine, _super);
            function GameEngine() {
                _super.call(this, '100%', '100%', Phaser.AUTO, 'content', null);
                this.state.add('Boot', Client.Boot, false);
                this.state.add('Preloader', Client.Preloader, false);
                this.state.add('MainMenu', Client.MainMenu, false);
                this.state.add('Level', Client.Level, false);
            }
            GameEngine.prototype.init = function () {
                this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
            };
            return GameEngine;
        }(Phaser.Game));
        Client.GameEngine = GameEngine;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('content').addEventListener('contextmenu', function (e) { return e.preventDefault(); });
    var game = new CodechanGame.Client.GameEngine();
    game.state.start('Boot');
});
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var BulletFree = (function (_super) {
            __extends(BulletFree, _super);
            function BulletFree(game) {
                _super.call(this, game, -100, -100, "bullet");
                this.is_free = true;
                this.visible = false;
                this.anchor.x = 0.5;
                this.anchor.y = 0.5;
            }
            return BulletFree;
        }(Phaser.Sprite));
        var Player = (function (_super) {
            __extends(Player, _super);
            function Player(self, isLocal) {
                var _this = this;
                _super.call(this);
                this.live = true;
                this.blooding = false;
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
                this.sounds = new Client.Sounds(this.self);
                if (isLocal) {
                    var flash = this.self.add.graphics(0, 0);
                    flash.beginFill(0x000000, 0.5);
                    flash.drawRect(0, this.self.canvas.height - 80, 500, 80);
                    flash.drawRect(this.self.canvas.width - 500, this.self.canvas.height - 80, 500, 80);
                    flash.drawRect(this.self.canvas.width - 100, 0, 100, 300);
                    flash.fixedToCamera = true;
                    flash.endFill();
                    var style_1 = { font: "18px Arial", fontStyle: "bold", fill: "#ffffff" };
                    this.players_text = this.self.add.text(this.self.canvas.width - 95, 0, "", style_1);
                    this.players_text.fixedToCamera = true;
                    style_1 = { font: "18px Arial", fontStyle: "bold", fill: "#b95506" };
                    this.score_text = this.self.add.text(this.self.canvas.width - 20, 0, "", style_1);
                    this.score_text.fixedToCamera = true;
                    this.bullets = new Client.Bullet(this.self, this, this.sounds);
                }
                this.freeBullet = new Client.FreeBullet(this.self, this);
                var style = { font: "34px Arial", fontStyle: "bold", fill: "#e61b1b" };
                this.name = Client.Defined.getRandomName();
                this.name_text = this.self.add.text(-100, -100, this.name, style);
                this.name_text.anchor.setTo(0.5);
                this.player.animations.add('idle', Phaser.Animation.generateFrameNames('survivor-idle_handgun_', 0, 19), 25, true);
                this.player.animations.add('move', Phaser.Animation.generateFrameNames('survivor-move_handgun_', 0, 19), 25, true);
                this.player.animations.add('reload', Phaser.Animation.generateFrameNames('survivor-reload_handgun_', 0, 14), 25, true);
                this.player.animations.add('shoot', Phaser.Animation.generateFrameNames('survivor-shoot_handgun_', 0, 2), 25, true);
                this.onChangeAnim(function (s) { return _this.player.animations.play(s); });
                this.self.physics.p2.enable(this.player);
                this.player.body.setZeroDamping();
                this.player.body.setCircle(26);
                if (this.getID() == Client.Defined.localID) {
                    this.isLocal = true;
                }
                else {
                    this.isLocal = false;
                }
                this.servID = Client.Defined.myServID;
                this.setAnim("idle");
            }
            Player.prototype.update = function () {
                var _this = this;
                if (!this.live)
                    return;
                if (this.isLocal == true) {
                    var x = this.self.input.mousePointer.x + this.self.camera.x;
                    var y = this.self.input.mousePointer.y + this.self.camera.y;
                    var inPointer = Phaser.Rectangle.contains(this.player.body, x, y);
                    var inDestXY = Phaser.Rectangle.contains(this.player.body, this.xdest + this.self.camera.x, this.ydest + this.self.camera.y);
                    if (this.hasMove) {
                        this.setAnim("move");
                    }
                    else {
                        this.setAnim("idle");
                    }
                    if (!inPointer) {
                        this.player.body.rotation = this.self.physics.arcade.angleBetween(this.player, {
                            x: this.self.input.mousePointer.worldX,
                            y: this.self.input.mousePointer.worldY
                        });
                    }
                    this.player.body.setZeroVelocity();
                    var speed = Client.Defined.playerMoveSpeed;
                    if (this.self.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
                        speed = Client.Defined.playerMoveSpeed * 2;
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
                    var text = this.name + ": " + Math.max(0, this.HP) + "%";
                    var style = { font: "60px Arial", fontStyle: "bold", fill: "#004dff" };
                    if (this.HP < 50) {
                        style.fill = "#ff0000";
                    }
                    if (this.HP >= 50) {
                        style.fill = "#004dff";
                    }
                    var pos = new Phaser.Point(5, this.self.canvas.height - this.name_text.height);
                    this.name_text.position = pos;
                    this.name_text.setStyle(style, true);
                    this.name_text.text = text;
                    this.name_text.fixedToCamera = true;
                    var names = "";
                    for (var player in Client.Defined.playerList) {
                        names += Client.Defined.playerList[player].name + "\n";
                    }
                    this.players_text.text = names;
                    var scores = "";
                    for (var player in Client.Defined.playerList) {
                        scores += Client.Defined.playerList[player].score + "\n";
                    }
                    this.score_text.text = scores;
                    this.bullets.update();
                }
                else {
                    this.player.body.x = this.x;
                    this.player.body.y = this.y;
                    this.player.body.rotation = this.rotation;
                    this.setAnim(this.anim);
                    this.marker.visible = true;
                    this.marker.x = this.player.x;
                    this.marker.y = this.player.y;
                    this.marker.angle += 2;
                    this.marker_green.visible = false;
                    var pos = new Phaser.Point(this.player.x, this.player.y - this.player.height / 2 - 10);
                    this.name_text.text = this.name;
                    this.name_text.position = pos;
                }
                if (this.blooding) {
                    this.blooding = false;
                    this.blood.visible = true;
                    this.blood.position = this.player.position;
                    this.blood.animations.play('blooding', 30, true);
                    this.sounds.playAargh();
                    setTimeout(function () {
                        _this.blood.animations.stop();
                        _this.blood.visible = false;
                    }, 400);
                }
            };
            Player.prototype.destroy = function () {
                this.live = false;
                this.player.destroy();
                this.name_text.destroy();
                this.marker_green.destroy();
                this.marker.destroy();
            };
            return Player;
        }(Client.PlayerStruct));
        Client.Player = Player;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var Boot = (function (_super) {
            __extends(Boot, _super);
            function Boot() {
                _super.apply(this, arguments);
            }
            Boot.prototype.preload = function () {
                this.load.image('logo', './assets/ui/logo.png');
                this.load.audio('load_stage_loop', 'assets/sounds/logo_loop.ogg');
            };
            Boot.prototype.create = function () {
                this.stage.setBackgroundColor(0x304040);
                this.input.maxPointers = 1;
                this.stage.disableVisibilityChange = true;
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.game.state.start('Preloader', true, false);
            };
            return Boot;
        }(Phaser.State));
        Client.Boot = Boot;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var Level = (function (_super) {
            __extends(Level, _super);
            function Level() {
                _super.apply(this, arguments);
            }
            Level.prototype.create = function () {
                var _this = this;
                this.game.physics.startSystem(Phaser.Physics.P2JS);
                this.game.physics.p2.restitution = 0;
                this.game.physics.p2.setImpactEvents(true);
                this.map = this.add.tilemap("TILEDMap");
                this.map.addTilesetImage("collider", "TILEDcollider");
                this.add.tileSprite(0, 0, 2240, 2240, 'TILEDbackground');
                var layer = this.map.createLayer('tiles');
                layer.visible = false;
                Client.Defined.enemyCG = this.game.physics.p2.createCollisionGroup();
                Client.Defined.wallsCG = this.game.physics.p2.createCollisionGroup();
                Client.Defined.playerCG = this.game.physics.p2.createCollisionGroup();
                this.player = new Client.Player(this.game, true);
                this.player.player.body.setCollisionGroup(Client.Defined.playerCG);
                this.game.camera.follow(this.player.player);
                Client.Defined.playerList.push(this.player);
                Client.Defined.connection.initSocketCallbacks(this.game, this.player);
                Client.Defined.connection.onNewPlayer(function (otherPlayer) {
                    otherPlayer.player.body.setCollisionGroup(Client.Defined.enemyCG);
                    otherPlayer.player.body.collides(Client.Defined.enemyCG);
                    otherPlayer.player.body.collides(Client.Defined.playerCG);
                    otherPlayer.player.body.collides(Client.Defined.wallsCG);
                    otherPlayer.player.body.collides(_this.player.freeBullet.freeBulletsCG);
                    otherPlayer.player.body.collides(Client.Defined.bulletsCG, function () {
                        Client.Defined.connection.socket.send({
                            event: 'decrease_hp', id: otherPlayer.servID, sPlayer: _this.player.servID
                        });
                        otherPlayer.blooding = true;
                    }, _this);
                    for (var i in otherPlayer.freeBullet.bullets.children) {
                        otherPlayer.freeBullet.bullets.children[i].body.collides(Client.Defined.enemyCG, function (bullet) { bullet.sprite.kill(); }, _this);
                        otherPlayer.freeBullet.bullets.children[i].body.collides(Client.Defined.wallsCG, function (bullet) { bullet.sprite.kill(); }, _this);
                        otherPlayer.freeBullet.bullets.children[i].body.collides(Client.Defined.playerCG, function (bullet) { bullet.sprite.kill(); }, _this);
                    }
                });
                this.player.player.body.collides(Client.Defined.enemyCG);
                this.player.player.body.collides(Client.Defined.wallsCG);
                for (var playerIDX in Client.Defined.playerList) {
                    if (Client.Defined.playerList[playerIDX].servID == this.player.servID)
                        continue;
                    this.player.player.body.collides(Client.Defined.playerList[playerIDX].freeBullet.freeBulletsCG);
                }
                this.map.setCollisionBetween(1, 1500, true, "tiles");
                var objs = this.game.physics.p2.convertTilemap(this.map, "tiles");
                for (var idx in objs) {
                    this.game.physics.p2.enable(objs[idx]);
                    objs[idx].setCollisionGroup(Client.Defined.wallsCG);
                    objs[idx].collides(Client.Defined.playerCG);
                    objs[idx].collides(Client.Defined.bulletsCG);
                    objs[idx].collides(this.player.freeBullet.freeBulletsCG);
                    for (var playerIDX in Client.Defined.playerList) {
                        if (Client.Defined.playerList[playerIDX].servID == this.player.servID)
                            continue;
                        objs[idx].collides(Client.Defined.playerList[playerIDX].freeBullet.freeBulletsCG);
                    }
                }
                this.world.setBounds(0, 0, 2240, 2240);
                this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);
                this.game.physics.p2.updateBoundsCollisionGroup();
            };
            Level.prototype.enemyHit = function (player) {
                console.log(player);
            };
            Level.prototype.update = function () {
                for (var key in Client.Defined.playerList) {
                    Client.Defined.playerList[key].update();
                }
                this.game.physics.arcade.collide(this.player.player, this.blockedLayer);
                Client.Defined.connection.socket.send({
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
            };
            return Level;
        }(Phaser.State));
        Client.Level = Level;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var MainMenu = (function (_super) {
            __extends(MainMenu, _super);
            function MainMenu() {
                _super.apply(this, arguments);
            }
            MainMenu.prototype.preload = function () {
                Client.Defined.connection = new Client.Connection();
                Client.Defined.connection.connect();
                Client.Defined.connection.socket.on('connect', this.connected.bind(this));
                Client.Defined.connection.socket.on('connect_error', this.connect_error.bind(this));
                Client.Defined.connection.socket.on('connect_timeout', this.connect_timeout.bind(this));
            };
            MainMenu.prototype.connected = function () {
                var _this = this;
                Client.Defined.connection.socket.on('message', function (msg) {
                    if (msg.event == "you_connected") {
                        if (_this.game.state.current == "MainMenu") {
                            var text_con = _this.game.add.text(5, 10, "Ok. Connected to server\nYou'r ID is: " + msg.id + "\nClick any button to start", { font: "30px Tahoma", fontStyle: "bold", fill: "#2bd509", align: "left" });
                            text_con.fixedToCamera = true;
                        }
                        Client.Defined.myServID = msg.id;
                        Client.Defined.connection.socket.send("num_players");
                    }
                    if (msg.event == "num_players") {
                        var text = _this.game.add.text(0, 0, "Players: " + msg.data, { font: "30px Tahoma", fontStyle: "bold", fill: "#2bd509", align: "left" });
                        text.position = new Phaser.Point(5, _this.game.canvas.height - text.height - 10);
                        text.fixedToCamera = true;
                    }
                });
            };
            MainMenu.prototype.connect_error = function (err) {
                var text = this.game.add.text(5, 10, "Connecting to server failed\n" + err, { font: "36px Tahoma", fontStyle: "bold", fill: "#f00000", align: "left" });
                text.fixedToCamera = true;
            };
            MainMenu.prototype.connect_timeout = function () {
                var text = this.game.add.text(5, 10, "Connection timeout!\n", { font: "36px Tahoma", fontStyle: "bold", fill: "#f00000", align: "left" });
                text.fixedToCamera = true;
            };
            MainMenu.prototype.create = function () {
                this.bg = this.add.sprite(0, 0, 'bg-loader');
                this.bg.width = this.world.width;
                this.bg.height = this.world.height;
                this.bg.anchor.setTo(0);
                this.bg.alpha = 0;
                this.input.onDown.addOnce(this.fadeOut, this);
                this.add.tween(this.bg).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
            };
            MainMenu.prototype.fadeOut = function () {
                this.add.audio('click', 1, false).play();
                this.add.tween(this.bg).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.add(this.nextState, this);
            };
            MainMenu.prototype.nextState = function () {
                this.game.state.start('Level', true, false);
            };
            return MainMenu;
        }(Phaser.State));
        Client.MainMenu = MainMenu;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var Preloader = (function (_super) {
            __extends(Preloader, _super);
            function Preloader() {
                _super.apply(this, arguments);
            }
            Preloader.prototype.preload = function () {
                var _this = this;
                this.loaderText = this.game.add.text(this.world.centerX, this.world.centerY, "Loading...", { font: "36px Tahoma", fontStyle: "bold", fill: "#F9FFF7", align: "center" });
                this.loaderText.anchor.setTo(0.5);
                this.logo = this.add.sprite(this.world.centerX, -400, 'logo');
                this.logo.anchor.setTo(0.5);
                this.music = this.add.audio('load_stage_loop');
                var clbk = new Phaser.Signal();
                clbk.add(function () {
                    if (_this.game.state.current == "Preloader")
                        _this.music.play();
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
                var mclbk = new Phaser.Signal();
                mclbk.add(function () {
                    Client.Defined.bgMusic = _this.add.audio('bg-music');
                    var decClbk = new Phaser.Signal();
                    decClbk.add(function () {
                        if (Client.Defined.playMusic) {
                            Client.Defined.bgMusic.loop = true;
                            Client.Defined.bgMusic.volume = 0.2;
                            Client.Defined.bgMusic.play();
                        }
                    }, _this);
                    Client.Defined.bgMusic.onDecoded = decClbk;
                }, this);
                var bgmusic = this.load.audio('bg-music', './assets/sounds/bg-music.ogg', true);
                bgmusic.onLoadComplete = mclbk;
                this.load.atlas('player', './assets/sprites/player.png', './assets/sprites/player.json');
                this.load.tilemap('TILEDMap', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
                this.load.image('TILEDcollider', 'assets/map/collider.png');
                this.load.image('TILEDbackground', 'assets/map/map.png');
            };
            Preloader.prototype.create = function () {
                var _this = this;
                this.music.play();
                this.add.tween(this.logo).to({ y: this.world.centerY }, 2000, Phaser.Easing.Elastic.Out, true, 500)
                    .onComplete.add(function () {
                    _this.add.tween(_this.loaderText).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true)
                        .onComplete.add(function () {
                        _this.add.tween(_this.logo).to({ y: _this.world.height + 200 }, 1500, Phaser.Easing.Elastic.Out, true, 600)
                            .onComplete.add(_this.nextGameState, _this);
                    }, _this);
                }, this);
            };
            Preloader.prototype.nextGameState = function () {
                this.music.pause();
                this.game.state.start('MainMenu', true, false);
            };
            return Preloader;
        }(Phaser.State));
        Client.Preloader = Preloader;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
var CodechanGame;
(function (CodechanGame) {
    var Client;
    (function (Client) {
        var Defined = (function () {
            function Defined() {
            }
            Object.defineProperty(Defined, "WINDOW_WIDTH", {
                get: function () {
                    return window.innerWidth ||
                        document.documentElement.clientWidth ||
                        document.getElementsByTagName('body')[0].clientWidth;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Defined, "WINDOW_HEIGHT", {
                get: function () {
                    return window.innerHeight ||
                        document.documentElement.clientHeight ||
                        document.getElementsByTagName('body')[0].clientHeight;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Defined, "URL_CONNECTION", {
                get: function () {
                    return "shootan-rejjin.rhcloud.com";
                },
                enumerable: true,
                configurable: true
            });
            Defined.getPlayerByServID = function (servID) {
                for (var i = 0; i < this.playerList.length; i++) {
                    if (this.playerList[i].servID == servID)
                        return i;
                }
                return -1;
            };
            Defined.getPlayerData = function () {
            };
            Defined.getRandomName = function () {
                var names = ['Yoba', 'Bitard', 'Peka', 'Lolka',
                    'Kek', 'Hipster', 'Obama', 'Nyash',
                    'coder', 'balabol', 'elita'];
                return names[Math.floor(Math.random() * names.length)];
            };
            Defined.connection = null;
            Defined.playersLength = 1;
            Defined.localID = 1;
            Defined.myServID = "";
            Defined.playerList = new Array();
            Defined.playerMoveSpeed = 400;
            Defined.playMusic = true;
            return Defined;
        }());
        Client.Defined = Defined;
    })(Client = CodechanGame.Client || (CodechanGame.Client = {}));
})(CodechanGame || (CodechanGame = {}));
//# sourceMappingURL=game.js.map