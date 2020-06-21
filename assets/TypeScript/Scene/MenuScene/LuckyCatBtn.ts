// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { DB } from "../../Frame/DataBind";
import { Util } from "../../Frame/Util";
import { Key } from "../../Game/Key";
import { Config } from "../../Frame/Config";
import Top from "../../Frame/Top";
import { Game } from "../../Game/Game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LuckyCatBtn extends DB.DataBindComponent {

    @property(cc.Label)
    cntLabel: cc.Label = null;

    beginStamp = 0;
    lastCnt = 0;
    onLoad () {
        console.log("onLoad");
        this.Bind(Key.luckyCatBeginStamp,(beginStamp)=>{
            this.beginStamp = beginStamp;
        });
        this.node.on("click", this.onClick, this)
        this.lastCnt = Game.getLuckyCatCoin();
        this.setCntLabel(this.lastCnt);
    }
    onClick(){
        if(this.lastCnt > 0){
            this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:this.lastCnt}));
            DB.Set(Key.luckyCatBeginStamp, Util.getTimeStamp());
            this.lastCnt = 0;
            this.setCntLabel(0);
        }
    }

    update () {
        let parent = this.cntLabel.node.parent;
        if(this.beginStamp == 0){
            parent.active = false;
        }else{
            let cnt = Game.getLuckyCatCoin();
            if(cnt != this.lastCnt){
                this.lastCnt = cnt;
                this.getComponent(cc.Animation).play();
                this.scheduleOnce(() => {
                    cnt = Game.getLuckyCatCoin();   //延时期间玩家可能收走金币，所以重新算一下
                    this.setCntLabel(cnt);
                }, 0.8);
            }
        }
    }
    setCntLabel(cnt){
        this.cntLabel.node.parent.active = cnt>0;
        this.cntLabel.string = (cnt).toString();
    }
}
