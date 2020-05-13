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
import CoinBar from "../../Game/CoinBar";
import { Config } from "../../Frame/Config";
import { crossPlatform, tt, wx, BannerAd } from "../../Frame/CrossPlatform";
import { AD, AdUnitId } from "../../Frame/AD";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("场景/FinishScene")
export default class FinishScene extends Scene {
    @property(cc.Node)
    titleNode: cc.Node = null;

    @property(cc.ProgressBar)
    timeProgress: cc.ProgressBar = null;

    @property(Button)
    openAllBtn: Button = null;

    @property(Button)
    freeOpenAllBtn: Button = null;

    @property(Button)
    backBtn: Button = null;

    @property(cc.Node)
    buttonLayout: cc.Node = null;

    @property(cc.Node)
    keyNode: cc.Node = null;

    @property(Button)
    chestBtn: Button = null;
    
    @property(CoinBar)
    coinBar:CoinBar = null;

    @property(cc.Label)
    highScoreLabel:cc.Label = null;

    @property(cc.Node)
    bannerPos:cc.Node = null;

    private type:"share"|"video"|"ad" = "share";
    // private gainKeyCosts = [10, 20, 40];
    private keyCnt = 0;
    private openCnt = 0;
    private rewards = null;
    private bannerAd:BannerAd = null;
    onLoad(){
        this.backBtn.node.on("click",this.onBackBtnTap, this);
        this.openAllBtn.node.on("click",this.onOpenAllBtnTap, this);
        this.freeOpenAllBtn.node.on("click",this.onFreeOpenAllBtnTap, this);
        if(tt){
            this.setBtnType(Math.random()>0.2?"ad":"share");
        }else if(wx){
            this.setBtnType("share");
        }
        this.initChestBtn();
        this.rewards = Game.randomFinishRewards();
        let style = Util.convertToWindowSpace(this.bannerPos);
        console.log(style);
        this.bannerAd = AD.showBanner(AdUnitId.FinishBottom,style, ()=>{}, ()=>{});
    }
    onExitScene(){
        if(this.bannerAd){
            this.bannerAd.hide();
            this.bannerAd.destroy();
        }
    }
    initChestBtn(){
        let chestParent = this.chestBtn.node.parent;
        while(chestParent.childrenCount < 3){
            let newChest = cc.instantiate(this.chestBtn.node);
            chestParent.addChild(newChest);
        }
        for(let i=0; i<chestParent.childrenCount; i++){
            let chestBtn = chestParent.children[i];
            chestBtn.name = "chest"+i;
            chestBtn.on("click", this.onChestBtnTap, this);
        }
    }
    onChestBtnTap(e:cc.Event.EventTouch){
        let chestNode:cc.Node = e.target;
        if(!chestNode["isOpen"] && this.openCnt<3){
            if(this.keyCnt > 0){
                chestNode["isOpen"] = true;
                let idx = this.keyCnt-1;
                let key = this.keyNode.parent.children[idx];
                let icon = key.getChildByName("icon"); 
                let pos = Util.convertPosition(chestNode, key);
                let dis = pos.sub(icon.position).mag();
                let coinCnt = this.rewards[this.openCnt].cnt;
                cc.tween(icon).to(dis*0.001, {
                    x:pos.x,
                    y:pos.y,
                    scale:0.5,
                })
                .call(()=>{
                    Sound.play("openChest");
                    icon.active = false;
                    chestNode.getComponent(Button).enabled = false;
                    chestNode.getComponent(cc.Animation).play("openChest");
                    Top.bezierSprite({
                        url:"Atlas/UI/coin",
                        from:Util.convertPosition(chestNode, Top.node),
                        to:Util.convertPosition(this.coinBar.iconPos, Top.node),
                        cnt:Math.floor(coinCnt/50),
                        onEnd:(finish)=>{
                            Sound.play("gainCoin");
                            let coin = DB.Get(Key.Coin);
                            DB.SetLoacl(Key.Coin, coin+50);
                        }
                    });
                }).start();
                this.keyCnt--;
                this.openCnt++;
                if(this.keyCnt <= 0){
                    if(this.openCnt < 3){
                        this.openAllBtn.node.active = true;
                        this.freeOpenAllBtn.node.active = false;
                        this.backBtn.node.active = true;
                    }else{
                        this.openAllBtn.node.active = false;
                        this.freeOpenAllBtn.node.active = false;
                        this.backBtn.node.active = true;
                    }
                }
            }else{
                Top.showToast("没有钥匙了");
            }
        }
    }
    onOpenAllBtnTap(){
        Sound.play("clickBtn");
        if(this.type == "share"){
            crossPlatform.share({
                imageUrl:Util.rawUrl('resources/Atlas/ShareImg/1.png'),
                templateId:"6deh5ubi85226of3co",
                success:()=>{
                    this.openAllChest();
                    this.openAllBtn.node.active = false;
                },
                fail:()=>{
                    Top.showToast("分享失败");
                }
            });
        }else if(this.type == "ad"){
            AD.showVideoAd(AdUnitId.OpenAllChest, ()=>{
                Top.showToast("播放成功");
                this.openAllChest();
                this.openAllBtn.node.active = false;
            },(err)=>{
                Top.showToast("播放失败"+err);
            })
        }
    }

    onFreeOpenAllBtnTap(){
        this.openAllChest();
        this.freeOpenAllBtn.node.active = false;
        this.backBtn.node.active = true;
    }
    openAllChest(){
        let chestParent = this.chestBtn.node.parent;
        for(let i=0; i<chestParent.childrenCount; i++){
            let chestNode = chestParent.children[i];
            let coinCnt = this.rewards[this.openCnt].cnt;
            if(!chestNode["isOpen"]){
                chestNode.getComponent(cc.Animation).play("openChest");
                Top.bezierSprite({
                    url:"Atlas/UI/coin",
                    from:Util.convertPosition(chestNode, Top.node),
                    to:Util.convertPosition(this.coinBar.iconPos, Top.node),
                    cnt:Math.floor(coinCnt/50),
                    onEnd:(finish)=>{
                        Sound.play("gainCoin");
                        let coin = DB.Get(Key.Coin);
                        DB.SetLoacl(Key.Coin, coin+50);
                    }
                });
                this.openCnt++;
            }
        }
    }
    onBackBtnTap(){
        SceneManager.ins.BackTo("MenuScene");
    }

    onDestroy(){
        if(this.titleTw){
            this.titleTw.stop();
        }
    }
    
    setBtnType(type){
        this.type = type;
        Util.loadRes("Atlas/UI/"+type,cc.SpriteFrame).then((spriteFrame:cc.SpriteFrame)=>{
            let sprite = Util.searchChild(this.openAllBtn.node, "icon").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
    }

    private titleTw = null;
    setData(data){
        let oldHighScroe = Game.getHighScroe();
        this.highScoreLabel.string = `最高分：${oldHighScroe}秒！`;
        Game.addRankData(data.time);
        let time = data.time;
        Top.blockInput(true);
        //隐藏标题字
        let labels = this.titleNode.getComponentsInChildren(cc.Label); 
        for(let i=0;i<labels.length;i++){
            labels[i].node.active = false;
        }
        //布置🔑并置灰
        let keyParent = this.keyNode.parent;
        let maxTime = Config.gainKeyCosts[Config.gainKeyCosts.length-1];
        let keyIdx = 0;
        while(keyParent.childrenCount < Config.gainKeyCosts.length){
            let newKeyNode = cc.instantiate(this.keyNode);
            keyParent.addChild(newKeyNode);
        }
        for(let i=0; i<keyParent.childrenCount; i++){
            let child = keyParent.children[i];
            child.x = keyParent.width * (Config.gainKeyCosts[i] / maxTime);
            child.getComponentInChildren(cc.Label).string = `${Config.gainKeyCosts[i]}秒`;
            Util.grayfiyNode(child, true);
            child["canUse"] = false;
        }
        //隐藏按钮
        this.buttonLayout.active = false;
        this.openAllBtn.node.active = false;
        this.freeOpenAllBtn.node.active = false;
        this.backBtn.node.active = false;
        
        let obj = {progress:0};
        //开始动画
        this.titleTw = cc.tween(obj)
            .delay(0.2)
            .call(()=>{
                Sound.play("word");
                labels[0].node.active = true;
                labels[0].string = "享";
            })
            .delay(0.2)
            .call(()=>{
                Sound.play("word");
                labels[0].string = "享年";
            })
            .delay(0.5)
            .call(()=>{
                labels[1].node.active = true;
            })
            .to(1, {progress:1},{progress:(start, end, current, ratio)=>{
                current = cc.easing.quadOut(ratio);
                let curTime = current*time;
                //时间文字
                labels[1].string = curTime.toFixed(2);
                //时间进度条
                this.timeProgress.progress = curTime/maxTime;
                //获得钥匙
                if(keyIdx < Config.gainKeyCosts.length && curTime > Config.gainKeyCosts[keyIdx] ){
                    let key = keyParent.children[keyIdx];
                    Util.grayfiyNode(key, false);
                    key["canUse"] = true;
                    Sound.play("gainKey");
                    cc.tween(key).to(0.2, {scale:1.5}).to(0.2, {scale:1}).start();
                    keyIdx++;
                    this.keyCnt = keyIdx;
                }
                return current;
            }})
            .call(()=>{
                if(time>oldHighScroe){
                    this.highScoreLabel.string = `最高分：${time}秒！`;
                    cc.tween(this.highScoreLabel.node).to(0.2, {scale:1.5}).to(0.2, {scale:1}).start();
                }
            })
            .delay(0.3)
            .call(()=>{
                Top.blockInput(false);
                this.buttonLayout.active = true;
                if(this.keyCnt>=3){
                    this.freeOpenAllBtn.node.active = true;
                }else if(this.keyCnt == 0){
                    this.openAllBtn.node.active = true; 
                    this.backBtn.node.active = true;
                }
                Sound.play("word");
                labels[2].node.active = true;
                labels[2].string = "秒，";
            })
            .delay(0.6)
            .call(()=>{
                Sound.play("word");
                labels[2].string = "秒，卒";
            })
            .delay(0.2)
            .call(()=>{
                Sound.play("word");
                labels[2].string = "秒，卒于";
                obj.progress = 0;
            })
            .delay(0.6)
            .call(()=>{
                Sound.play("word");
                labels[3].node.active = true;
                labels[3].string = data.killerName;
                labels[3].node.opacity = 0;
                labels[3].node.scale = 2;
                cc.tween(labels[3].node).to(0.2,{scale:1.1,opacity:255}, {easing:cc.easing.backOut}).start();
            })
            .start();
    }
}
