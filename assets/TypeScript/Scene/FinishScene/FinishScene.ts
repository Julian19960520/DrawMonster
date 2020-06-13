// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Scene from "../../Frame/Scene";
import { Sound } from "../../Frame/Sound";
import { Util } from "../../Frame/Util";
import Top from "../../Frame/Top";
import SceneManager from "../../Frame/SceneManager";
import { Game } from "../../Game/Game";
import { DB } from "../../Frame/DataBind";
import { Config } from "../../Frame/Config";
import { tt, wx, BannerAd, crossPlatform } from "../../Frame/CrossPlatform";
import { AD, AdUnitId } from "../../Frame/AD";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";
import { TweenUtil } from "../../Frame/TweenUtil";
import RewardPanel from "../../Panel/FinishRewardPanel/FinishRewardPanel";
import { GameRecorder } from "../../Frame/GameRecorder";
import ScrollList from "../../CustomUI/ScrollList";
import FinishRewardPanel from "../../Panel/FinishRewardPanel/FinishRewardPanel";
import { OperationFlow } from "../../Game/OperationFlow";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("场景/FinishScene")
export default class FinishScene extends Scene {
    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Label)
    monsterNameLabel: cc.Label = null;

    @property(Button)
    homeBtn: Button = null;

    @property(Button)
    upgradeBtn: Button = null;
    
    @property(ScrollList)
    rankList: ScrollList = null;

    @property(cc.Node)
    coinPos: cc.Node = null;

    @property(cc.Node)
    diamondPos: cc.Node = null;

    @property(cc.Label)
    highScoreLabel:cc.Label = null;

    @property(cc.Node)
    bannerPos:cc.Node = null;

    @property(cc.Node)
    shareVideoBtnParent:cc.Node = null;

    // private gainKeyCosts = [10, 20, 40];
    private bannerAd:BannerAd = null;
    onLoad(){
        this.homeBtn.node.on("click",this.onHomeBtnTap, this);
        this.upgradeBtn.node.on("click",this.onUpgradeBtnTap, this);
        this.node.on("gainCoin", (evt:cc.Event.EventCustom)=>{
            OperationFlow.flyCoin(evt.detail.cnt, evt.target, this.coinPos);
        }, this);
        this.node.on("gainDiamond", (evt:cc.Event.EventCustom)=>{
            OperationFlow.flyDiamond(evt.detail.cnt, evt.target, this.diamondPos);
        }, this);
        if(tt){
            // this.setBtnType(Math.random()>0.2?"ad":"share");
        }else if(wx){
            this.setBtnType("share");
        }
        let style = Util.convertToWindowSpace(this.bannerPos);
        this.bannerAd = AD.showBanner(AdUnitId.FinishBottom,style, ()=>{}, ()=>{});

        if(GameRecorder.videoDuration>Config.minRecordTime){
            crossPlatform.reportAnalytics("GameRecorder",{
                location:"FinishScene",
                step:"show",
            })
            GameRecorder.createGameRecorderShareButton({
                parentNode:this.shareVideoBtnParent,
                textures:DB.Get(Key.screenShotTextures),
                onSucc:()=>{
                    Top.showToast("分享成功");
                    crossPlatform.reportAnalytics("GameRecorder",{
                        location:"FinishScene",
                        step:"succ",
                    })
                },
                onFail:()=>{
                    Top.showToast("分享失败");
                },
            });
        }
    }
    onExitScene(){
        if(this.bannerAd){
            this.bannerAd.hide();
            this.bannerAd.destroy();
        }
        GameRecorder.clearGameRecorderShareButton();
    }
    
    
    onHomeBtnTap(){
        SceneManager.ins.goHome();
    }
    onUpgradeBtnTap(){
        this.OpenPanelByName("UpgradePanel");
    }
    onDestroy(){
        super.onDestroy();
        if(this.titleTw){
            this.titleTw.stop();
        }
    }
    
    setBtnType(type){

        Util.loadRes("Atlas/UI/"+type,cc.SpriteFrame).then((spriteFrame:cc.SpriteFrame)=>{
            let sprite = Util.searchChild(this.homeBtn.node, "icon").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
    }

    showHomeBtn(){
        this.homeBtn.node.active = true;
        if( DB.Get(Key.PlayTimes) >= Config.unlockPaintTimes && !DB.Get(Key.guideUnlockPaint)){
            Util.instantPrefab("Prefab/Guide/unlockPaint").then((node:cc.Node)=>{
                this.homeBtn.node.addChild(node);
                node.y = 30;
                TweenUtil.applyBreath(node);
            });
            
        }
    }

    private titleTw = null;
    setData(data){
        if(data.coin>0 || data.diamond>0){
            SceneManager.ins.OpenPanelByName("FinishRewardPanel",(rewardPanel:FinishRewardPanel)=>{
                rewardPanel.setData({coin:data.coin, diamond:data.diamond, bet:Game.calcuFinishBet(data.coin, data.diamond)});
            })
        }
        let highScroe = Game.getHighScroe();
        this.highScoreLabel.string = ` 最高分：${highScroe}秒！`;
        this.timeLabel.string = data.time;
        this.monsterNameLabel.string = data.killerName;
        // Game.requestWorldRank(false, (worldRanks)=>{
        //     this.rankList.setDataArr(worldRanks);
        // })
        this.rankList.setDataArr(DB.Get(Key.RankDatas));
    }
}
