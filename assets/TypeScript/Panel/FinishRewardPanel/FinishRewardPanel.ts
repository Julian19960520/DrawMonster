
import Panel from "../../Frame/Panel";
import Button from "../../CustomUI/Button";
import { AD, AdUnitId } from "../../Frame/AD";
import SceneManager from "../../Frame/SceneManager";
import Top from "../../Frame/Top";
import { TweenUtil } from "../../Frame/TweenUtil";
import { Util } from "../../Frame/Util";
import { wx, crossPlatform, tt } from "../../Frame/CrossPlatform";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/RewardPanel")
export default class FinishRewardPanel extends Panel {

    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(cc.Node)
    rewardGroup: cc.Node = null;

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
    private type:"share"|"video"|"ad" = "share";
    onLoad () {
        this.doubleBtn.node.on("click", this.onDoubleBtnTap, this);
        this.continueBtn.node.on("click", this.onSingleBtnTap, this);
        this.initLight();
        this.initDoubleBtn();
    }
    openAnim(callback = null){
        TweenUtil.applyAppear({node:this.node, callback:callback});
        TweenUtil.applyAppear({node:this.titleLabel.node, delay:0, duration:0.5});
        TweenUtil.applyAppear({node:this.rewardGroup, delay:0.1, duration:0.5});
        TweenUtil.applyAppear({node:this.doubleBtn.node, delay:0.2, duration:0.5});
        TweenUtil.applyAppear({node:this.continueBtn.node, delay:2, duration:0.5});
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
    
    initDoubleBtn(){
        if(tt){
            this.setDoubleBtnType("ad");
        }
        else if(wx){
            this.setDoubleBtnType("share");
        }else{
            this.setDoubleBtnType("share");
        }
    }

    setDoubleBtnType(type){
        this.type = type;
        Util.loadRes("Atlas/UI/"+type,cc.SpriteFrame).then((spriteFrame:cc.SpriteFrame)=>{
            let sprite = Util.searchChild(this.doubleBtn.node, "icon").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
    }

    setData(data:{coin:number,diamond:number,bet:number}){
        this.data = data;
        this.coinLabel.node.parent.active = data.coin>0;
        this.diamondLabel.node.parent.active = data.diamond>0;
        this.coinLabel.string = `x${data.coin}`;
        this.diamondLabel.string = `x${data.diamond}`;
        let label = this.doubleBtn.getComponentInChildren(cc.Label);
        label.string = `${Util.toChineseNum(data.bet)}倍战利品`;
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
        this.scheduleOnce(() => {
            Top.blockInput(false);
            SceneManager.ins.popPanel();
        }, 0.5);
    }

    onDoubleBtnTap(){
        if(this.type == "share"){
            //分享
            console.log(Util.rawUrl('resources/Atlas/Single/1.png'));
            crossPlatform.share({
                imageUrl:Util.rawUrl('resources/Atlas/Single/1.png'),
                templateId:"6deh5ubi85226of3co",
                success:()=>{
                    this.gainBetReward();
                },
                fail:()=>{
                    Top.showToast("分享失败");
                }
            });
        }else if(this.type == "ad"){
            //广告
            crossPlatform.reportAnalytics("finishRewardBet", this.data);
            AD.showVideoAd(AdUnitId.RewardBet, ()=>{
                this.gainBetReward();
            },(err)=>{
                Top.showToast("播放失败");
            })
        }
    }

    gainBetReward(){
        Top.blockInput(true);
        let data = this.data;
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
                this.scheduleOnce(()=>{
                    Top.blockInput(false);
                    SceneManager.ins.popPanel();
                }, 0.5);
            });
        })
    }
}
