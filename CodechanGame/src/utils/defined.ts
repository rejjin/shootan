/// <reference path="../client/connection.ts" />

module CodechanGame.Client {
    export class Defined {
        public static get WINDOW_WIDTH(): number {
            return window.innerWidth ||
                document.documentElement.clientWidth ||
                document.getElementsByTagName('body')[0].clientWidth;
        }

        public static get WINDOW_HEIGHT(): number {
            return window.innerHeight ||
                document.documentElement.clientHeight ||
                document.getElementsByTagName('body')[0].clientHeight;
        }
        public static get URL_CONNECTION(): string {
            return "http://localhost:8080";
        }
        public static connection: Connection = null;

        public static bgMusic: Phaser.Sound;

        public static playersLength = 1;
        public static localID = 1;
        public static myServID = "";

        public static playerList = new Array<Player>();

        public static playerMoveSpeed: number = 400;
        public static playMusic: boolean = true;

        public static bulletsCG: Phaser.Physics.P2.CollisionGroup;
        public static playerCG: Phaser.Physics.P2.CollisionGroup; // local player collision group
        public static enemyCG: Phaser.Physics.P2.CollisionGroup;
        public static wallsCG: Phaser.Physics.P2.CollisionGroup;

        public static getPlayerByServID(servID: string): number {
            for (let i = 0; i < this.playerList.length; i++) {
                if (this.playerList[i].servID == servID)
                    return i;
            }
            return -1;
        }

        public static getPlayerData(): any {

        }

        public static getRandomName(): string {
            let names = ['Yoba', 'Bitard', 'Peka', 'Lolka',
                'Kek', 'Hipster', 'Obama', 'Nyash',
                'coder', 'balabol', 'elita'];
            return names[Math.floor(Math.random() * names.length)];
        }
    }
}
