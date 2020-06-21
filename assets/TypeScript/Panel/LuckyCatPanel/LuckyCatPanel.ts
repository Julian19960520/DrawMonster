// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Panel from "../../Frame/Panel";
import Button from "../../CustomUI/Button";
import { Game } from "../../Game/Game";
import { Util } from "../../Frame/Util";
import { Config } from "../../Frame/Config";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { TweenUtil } from "../../Frame/TweenUtil";
import { AD, AdUnitId } from "../../Frame/AD";
import Top from "../../Frame/Top";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LuckyCatPanel extends Panel {

    @property(cc.Label)
    cntLabel: cc.Label = null;

    @property(Button)
    singleBtn: Button = null;

    @property(Button)
    doubleBtn: Button = null;

    public static opening = false;
    onLoad () {
        this.singleBtn.node.on("click", this.onSingleBtnTap, this);
        this.doubleBtn.node.on("click", this.onDoubleBtnTap, this);
        this.cntLabel.string = Game.getLuckyCatCoin().toString();
        let betStr = Util.toChineseNum(Config.luckyCatCoinBet);
        this.doubleBtn.getComponentInChildren(cc.Label).string = `看视频${betStr}倍`;
        LuckyCatPanel.opening = true;
    }
    onDestroy(){
        super.onDestroy();
        LuckyCatPanel.opening = false;
    }
    onSingleBtnTap(){
        let coinCnt = Game.getLuckyCatCoin();
        this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:coinCnt}));
        Game.resetLuckyCat();
        if(this.panelQueue){
            this.panelQueue.checkNext();
        }
    }

    onDoubleBtnTap(){
        AD.showVideoAd(AdUnitId.luckyCatBet, ()=>{
            let coinCnt = Game.getLuckyCatCoin() * Config.luckyCatCoinBet;
            TweenUtil.applyScaleBounce2(this.cntLabel.node,1, 1.5,()=>{
                this.cntLabel.string = `${coinCnt}`;
            },()=>{
                this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:coinCnt}));
                Game.resetLuckyCat();
                if(this.panelQueue){
                    this.panelQueue.checkNext();
                }
            });  
        },(err)=>{
            Top.showToast("播放失败");
        }) 
    }
}
