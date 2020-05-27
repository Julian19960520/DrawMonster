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
import SceneManager from "../../Frame/SceneManager";
import { Util } from "../../Frame/Util";
import { Game } from "../../Game/Game";
import Top from "../../Frame/Top";
import { GameRecorder } from "../../Frame/GameRecorder";
import { tt, wx, crossPlatform, VideoAd } from "../../Frame/CrossPlatform";
import Button from "../../CustomUI/Button";
import { AdUnitId, AD } from "../../Frame/AD";
import { Key } from "../../Game/Key";
import { DB } from "../../Frame/DataBind";
import { Config } from "../../Frame/Config";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/GameOverPanel")
export default class GameOverPanel extends Panel {

    @property(Button)
    giveupBtn: Button = null;

    @property(Button)
    coinRebornBtn: Button = null;

    @property(Button)
    freeRebornBtn: Button = null;

    @property(cc.Node)
    shareVideoBtnParent:cc.Node = null;

    @property(cc.Node)
    titleNode: cc.Node = null;

    @property(cc.Sprite)
    heroSprite:cc.Sprite = null;

    @property(cc.Sprite)
    screenImg:cc.Sprite = null;

    @property(cc.Animation)
    starAnim:cc.Animation = null;

    public onGiveUpCallback = null;
    public onRebornCallback = null;

    private type:"share"|"video"|"ad" = "share";

    onLoad(){
        super.onLoad();
        this.coinRebornBtn.node.on("click", this.onCoinRebornBtnTap, this);
        this.freeRebornBtn.node.on("click", this.onFreeRebornBtnTap, this);
        // this.shareVideoBtn.node.on("click", this.onShareVideoBtnTap, this);
        this.giveupBtn.node.on("click", this.onGiveupBtnTap, this);
        this.initHeroSprite();
        this.initRebornBtn();
        this.giveupBtn.node.active = false;
        setTimeout(() => {
            this.giveupBtn.node.active = true;
        }, crossPlatform.isDebug? 200:1000);
        this.coinRebornBtn.getComponentInChildren(cc.Label).string = `x${Config.rebornCostCoin}复活`;
        if(GameRecorder.recordering){
            GameRecorder.stop();
        }
        GameRecorder.createGameRecorderShareButton({
            parentNode:this.shareVideoBtnParent,
            textures:DB.Get(Key.screenShotTextures),
            onSucc:()=>{},
            onFail:()=>{},
        });
    }
    initHeroSprite(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        let hero = Game.findHeroConf(theme.heroId);
        if(hero){
            Game.loadTexture(hero.url, (texture)=>{
                this.heroSprite.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    }
    initRebornBtn(){
        if(tt){
            this.setFreeRebornBtnType("ad");
        }
        else if(wx){
            this.setFreeRebornBtnType("share");
        }else{
            this.setFreeRebornBtnType("share");
        }
    }
    onDestroy(){
        super.onDestroy();
        this.onRebornCallback = null;
        this.onGiveUpCallback = null;
        GameRecorder.hideGameRecorderShareButton();
    }

    setFreeRebornBtnType(type){
        this.type = type;
        Util.loadRes("Atlas/UI/"+type,cc.SpriteFrame).then((spriteFrame:cc.SpriteFrame)=>{
            let sprite = Util.searchChild(this.freeRebornBtn.node, "icon").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
    }
    onCoinRebornBtnTap(){
        let coin = DB.Get(Key.Coin);
        if(coin<Config.rebornCostCoin){
            Top.showToast("金币不足");
        }else{
            Top.showFloatLabel(`金币-${Config.rebornCostCoin}`, this.coinRebornBtn.node, {
                offset:cc.v2(0, 80),
                color:cc.color(235,235,70),
                stroke:1,
                strokeColor:cc.Color.BLACK,
                fontSize:30,
                duration:2,
            });
            setTimeout(() => {
                DB.Set(Key.Coin ,coin-Config.rebornCostCoin);
                this.onRebornCallback();
                SceneManager.ins.popPanel();
            }, 1000);
            
        }
    }
    onFreeRebornBtnTap(){
        if(this.type == "share"){
            //分享
            console.log(Util.rawUrl('resources/Atlas/Single/1.png'));
            crossPlatform.share({
                imageUrl:Util.rawUrl('resources/Atlas/Single/1.png'),
                templateId:"6deh5ubi85226of3co",
                success:()=>{
                    SceneManager.ins.popPanel();
                    if(this.onRebornCallback){
                        this.onRebornCallback();
                    }
                },
                fail:()=>{
                    Top.showToast("分享失败");
                }
            });
        }else if(this.type == "ad"){
            //广告
            AD.showVideoAd(AdUnitId.Reborn, ()=>{
                SceneManager.ins.popPanel();
                if(this.onRebornCallback){
                    this.onRebornCallback();
                }
            },(err)=>{
                Top.showToast("播放失败");
            })
        }
    }
    // onShareVideoBtnTap(){
    //     let rewardTip = this.shareVideoBtn.node.getChildByName("rewardTip");
    //     if(Util.getTimeStamp() - GameRecorder.startStamp > 4000){
    //         //录制视频
    //         GameRecorder.share(()=>{
    //             //如果显示rewardTip则获得2钻石，成功过一次后就隐藏rewardTip
    //             if(rewardTip.active){
    //                 this.shareVideoBtn.node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:2}));
    //             }
    //             this.shareVideoBtn.node.stopAllActions();
    //             rewardTip.active = false;
    //         },(e)=>{
    //             Top.showToast("分享录屏失败");
    //         });
    //     }else{
    //         //录屏时间太短，转分享或视频
    //         Top.showToast("录屏时间太短");
    //     }
    // }
    onGiveupBtnTap(){
        if(this.onGiveUpCallback){
            this.onGiveUpCallback();
        }
    }
}
