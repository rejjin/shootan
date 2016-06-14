module CodechanGame.Client {
    export class PlayerStruct {
        public currentID: number;
        public x: number = 0;
        public y: number = 0;
        public anim: string = "idle";
        public xdest: number = -600;
        public ydest: number = -600;
        public hasMove: boolean = false; 
        public onChangeAnimClbk: (anim) => any;
        public isLocal: boolean = true;
        public rotation: number = 0;
        public servID: string = "none";
        public HP: number = 100;
        public name: string = "none";
        public score: number = 0;

        constructor() {
            this.currentID = Defined.playersLength;
            ++Defined.playersLength;
        }

        onChangeAnim(clbk: (anim) => any) {
            this.onChangeAnimClbk = clbk;
        }

        getID(): number {
            return this.currentID
        }

        setAnim(anim: string) {
            this.anim = anim;
            this.onChangeAnimClbk(this.anim);
        }

        getAnim(): string {
            return this.anim;
        }
    }
}