module CodechanGame.Client {

    export class MainMenu extends Phaser.State {
        
        background: Phaser.Sprite;
        logo: Phaser.Sprite;
        bg: Phaser.Sprite;

        preload() {
            Defined.connection = new Connection();
            Defined.connection.connect();
            Defined.connection.socket.on('connect', this.connected.bind(this));
            Defined.connection.socket.on('connect_error', this.connect_error.bind(this));
            Defined.connection.socket.on('connect_timeout', this.connect_timeout.bind(this));
        }

        connected() {
            Defined.connection.socket.on('message', (msg) => {
                if (msg.event == "you_connected") {
                    if (this.game.state.current == "MainMenu") {
                        let text_con = this.game.add.text(5, 10,
                            "Ok. Connected to server\nYou'r ID is: " + msg.id + "\nClick any button to start",
                            { font: "30px Tahoma", fontStyle: "bold", fill: "#2bd509", align: "left" });
                        text_con.fixedToCamera = true;
                    }
                    Defined.myServID = msg.id;
                    Defined.connection.socket.send("num_players");
                }
                if (msg.event == "num_players") {
                    let text = this.game.add.text(0, 0, "Players: " + msg.data,
                        { font: "30px Tahoma", fontStyle: "bold", fill: "#2bd509", align: "left" });
                    text.position = new Phaser.Point(5, this.game.canvas.height - text.height - 10);
                    text.fixedToCamera = true;
                }
            });
        }

        connect_error(err:any) {
            let text = this.game.add.text(5, 10, "Connecting to server failed\n" + err,
                { font: "36px Tahoma", fontStyle: "bold", fill: "#f00000", align: "left" });
            text.fixedToCamera = true;
        }

        connect_timeout() {
            let text = this.game.add.text(5, 10, "Connection timeout!\n",
                { font: "36px Tahoma", fontStyle: "bold", fill: "#f00000", align: "left" });
            text.fixedToCamera = true;
        }

        create() {
            this.bg = this.add.sprite(0, 0, 'bg-loader');
            this.bg.width = this.world.width;
            this.bg.height = this.world.height;
            this.bg.anchor.setTo(0);
            this.bg.alpha = 0;

            this.input.onDown.addOnce(this.fadeOut, this);
            this.add.tween(this.bg).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
        }

        fadeOut() {
            this.add.audio('click', 1, false).play();
            this.add.tween(this.bg).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.add(this.nextState, this);
           
        }

        nextState() {
            this.game.state.start('Level', true, false);
        }

    }

}