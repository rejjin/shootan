/// <reference path="../../tsdefinitions/socket.io-client.d.ts" />

module CodechanGame.Client {
    export class Connection {
        socket: SocketIOClient.Socket;
        onNewPlayerClbk: (otherPlayer) => any;

        constructor() {
            this.socket = null;
        }

        onNewPlayer(clbk: (otherPlayer) => any) {
            this.onNewPlayerClbk = clbk;
        }

        connect() {
            this.socket = io.connect(Defined.URL_CONNECTION);
        }

        setData(servID: string, data: any, self: Phaser.Game) {
            let idx = Defined.getPlayerByServID(servID);
            if (idx == -1) {
                let con_player = new Player(self, false);
                con_player.isLocal = false;
                con_player.servID = data.servID;
                con_player.x = -300;
                con_player.y = -300;
                this.onNewPlayerClbk(con_player);
                Defined.playerList.push(con_player);
                idx = Defined.getPlayerByServID(data.servID);
            }

            Defined.playerList[idx].x = data.x;
            Defined.playerList[idx].y = data.y;
            Defined.playerList[idx].anim = data.anim;
            Defined.playerList[idx].rotation = data.rotation;
            Defined.playerList[idx].HP = data.hp;
            Defined.playerList[idx].name = data.name;
            Defined.playerList[idx].score = data.score;
        }

        initSocketCallbacks(self: Phaser.Game, curPlayer: Player) {
            Defined.connection.socket.on("message", (msg) => {
                if (msg.event == "other_connected") {

                    let con_player = new Player(self, false);
                    con_player.isLocal = false;
                    con_player.servID = msg.id;
                    con_player.x = -300;
                    con_player.y = -300;
                    this.onNewPlayerClbk(con_player);
                    Defined.playerList.push(con_player);
                }

                if (msg.event == "new_data") {
                    Defined.connection.setData(msg.data.servID, msg.data, self);
                }

                if (msg.event == "data_of_all_players") {
                    let _data = JSON.parse(msg.data);
                    for (let data of _data) {
                        if (data.servID == curPlayer.servID) continue;
                        Defined.connection.setData(data.servID, data, self);
                    }
                }

                if (msg.event == "user_disconnect") {
                    let servID = msg.id;
                    let idx = Defined.getPlayerByServID(servID);
                    if (idx >= 0) {
                        Defined.playerList[idx].destroy();
                    }
                }

                if (msg.event == "down_hp") {
                    let servID = msg.id;
                    let killerID = msg.sid;
                    if (curPlayer.servID == servID) {
                        curPlayer.HP -= 8;
                        if (curPlayer.HP <= 0) {
                            Defined.connection.socket.send({ event: 'i_killed', id: curPlayer.servID, sid: killerID });
                            curPlayer.live = false;

                            let flash = self.add.graphics(0, 0);
                            flash.beginFill(0x000000, 0.5);
                            flash.drawRect(0, 0, self.canvas.width, self.canvas.height);
                            flash.fixedToCamera = true;
                            flash.endFill();

                            let killerName = Defined.playerList[Defined.getPlayerByServID(killerID)].name;
                            let style = { font: "78px Arial", fontStyle: "bold", fill: "#d80000" };
                            let text = self.add.text(0, 0, "YOU KILLED BY " + killerName, style);
                            text.anchor.set(0.5, 0.5);
                            text.position = new Phaser.Point(self.canvas.width / 2, self.canvas.height / 2);
                            text.fixedToCamera = true;

                            Defined.connection.socket.disconnect();
                        }
                    }
                }

                if (msg.event == "dropped") {
                    if (msg.id == curPlayer.servID) {
                        curPlayer.live = false;

                        let flash = self.add.graphics(0, 0);
                        flash.beginFill(0x000000, 0.5);
                        flash.drawRect(0, 0, self.canvas.width, self.canvas.height);
                        flash.fixedToCamera = true;
                        flash.endFill();

                        let killerName = "SERVER";
                        let style = { font: "78px Arial", fontStyle: "bold", fill: "#d80000" };
                        let text = self.add.text(0, 0, "YOU KILLED BY " + killerName, style);
                        text.anchor.set(0.5, 0.5);
                        text.position = new Phaser.Point(self.canvas.width / 2, self.canvas.height / 2);
                        text.fixedToCamera = true;

                        Defined.connection.socket.disconnect();
                    }
                }

                if (msg.event == "player_killed") {
                    let servID = msg.id;
                    let killerID = msg.sid;

                    let idx = Defined.getPlayerByServID(servID);
                    if (idx >= 0) {
                        Defined.playerList[idx].destroy();
                        Defined.playerList.splice(idx, idx);
                    }
                }

                if (msg.event == "player_fire") {
                    // msg.toX msg.toY, msg.id
                    if (curPlayer.servID == msg.id) return;
                    let idx = Defined.getPlayerByServID(msg.id);
                    if (idx >= 0) {
                        Defined.playerList[idx].freeBullet.fire(msg.toX, msg.toY);
                        Defined.playerList[idx].sounds.playFire();
                    }
                }

                if (msg.event == "incr_score") {
                    if (curPlayer.servID == msg.id) {
                        curPlayer.score++;
                    }
                }
                

            });

            Defined.connection.socket.send({ event: 'get_data_of_all_players' });
        }
    }
}