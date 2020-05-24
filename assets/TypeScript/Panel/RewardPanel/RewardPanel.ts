
import Panel from "../../Frame/Panel";
import Button from "../../CustomUI/Button";
import { AD, AdUnitId } from "../../Frame/AD";
import SceneManager from "../../Frame/SceneManager";
import Top from "../../Frame/Top";
import { TweenUtil } from "../../Frame/TweenUtil";
import { Util } from "../../Frame/Util";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/RewardPanel")
export default class RewardPanel extends Panel {

    @property(cc.Node)
    lightNode: cc.Node = null;
    @property(cc.Label)
    coinLabel: cc.Label = null;
    @property(cc.Label)
    diamondLabel: cc.Label = null;

    @property(Button)
    doubleBtn: Button = null;

    @property(Button)
    continueBtn: Button = null;
    
    data:{coin:number,diamond:number,bet:number} = null;
    onLoad () {
        this.doubleBtn.node.on("click", this.onDoubleBtnTap, this);
        this.continueBtn.node.on("click", this.onSingleBtnTap, this);
        this.initLight();
    }
    initLight(){
        let cnt = 7;
        while(this.lightNode.childrenCount<cnt){
            let child = cc.instantiate(this.lightNode.children[0]);
            this.lightNode.addChild(child);
        }
        for(let i=0;i<cnt;i++){
            let child = this.lightNode.children[i];
            child.angle = i*360/cnt;
            child.runAction(cc.repeatForever(cc.rotateBy(10, 360)));
        }
    }
    setData(data:{coin:number,diamond:number,bet:number}){
        this.data = data;
        this.coinLabel.node.parent.active = data.coin>0;
        this.diamondLabel.node.parent.active = data.diamond>0;
        this.coinLabel.string = `x${data.coin}`;
        this.diamondLabel.string = `x${data.diamond}`;
    }
    onDoubleBtnTap(){
        let data = this.data;
        Top.blockInput(true);
        AD.showVideoAd(AdUnitId.RewardBet, ()=>{
            data.coin *= data.bet;
            data.diamond *= data.bet;
            let coinAmin = (callback)=>{
                if(this.coinLabel.node.parent.active){
                    TweenUtil.applyScaleBounce2(this.coinLabel.node.parent,1, 1.5,()=>{
                        this.coinLabel.string = `x${data.coin}`;
                    },()=>{
                        callback();
                    })
                }else{
                    callback();
                }
            }
            let diamondAmin = (callback)=>{
                if(this.diamondLabel.node.parent.active){
                    TweenUtil.applyScaleBounce2(this.diamondLabel.node.parent,1, 1.5,()=>{
                        this.diamondLabel.string = `x${data.diamond}`;
                    },()=>{
                        callback();
                    })
                }else{
                    callback();
                }
            }
            coinAmin(()=>{
                diamondAmin(()=>{
                    if(data.coin>0){
                        this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:data.coin}));
                    }
                    if(data.diamond>0){
                        this.node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:data.diamond}));
                    }
                    setTimeout(() => {
                        SceneManager.ins.popPanel();
                        Top.blockInput(false);
                    }, 500);
                });
            })
        },(err)=>{
            Top.blockInput(false);
            Top.showToast("播放失败");
        })
    }
    onSingleBtnTap(){
        let data = this.data;
        Top.blockInput(true);
        if(data.coin>0){
            this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:data.coin}));
        }
        if(data.diamond>0){
            this.node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:data.diamond}));
        }
        setTimeout(() => {
            SceneManager.ins.popPanel();
            Top.blockInput(false);
        }, 500);
    }
}
