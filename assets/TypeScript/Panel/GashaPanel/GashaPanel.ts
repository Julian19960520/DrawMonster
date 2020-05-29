import Panel from "../../Frame/Panel";
import { Util } from "../../Frame/Util";

import Button from "../../CustomUI/Button";
import Top from "../../Frame/Top";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { Config } from "../../Frame/Config";
import GashaRewardItem, { GashaRewardType } from "./GashaRewardItem";
import { Game } from "../../Game/Game";
import PanelStack from "../../Frame/PanelStack";
import PanelQueue from "../../Frame/PanelQueue";
import RewardPanel from "../RewardPanel/RewardPanel";
import { AD, AdUnitId } from "../../Frame/AD";
import { Sound } from "../../Frame/Sound";


const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/GashaPanel")
export default class GashaPanel extends Panel {

    @property(Button)
    insertCoinBtn: Button = null;
    @property(Button)
    playBtn: Button = null;
    @property(Button)
    refreshBtn: Button = null;

    @property(cc.Node)
    board: cc.Node = null;
    @property(cc.Node)
    spring: cc.Node = null;
    @property(cc.Node)
    ballPrefab: cc.Node = null;
    @property(cc.Node)
    forceArea: cc.Node = null;
    @property(cc.Node)
    gainArea: cc.Node = null;
    @property(cc.Node)
    dots: cc.Node = null;
    @property(cc.Node)
    wheels: cc.Node = null;
    @property(cc.Node)
    balls: cc.Node = null;
    @property(GashaRewardItem)
    gashaRewardItem: GashaRewardItem = null;
    @property(cc.Label)
    tipLabel: cc.Label = null;

    @property(PanelQueue)
    panelQueue: PanelQueue = null;

    cnt:200;
    oriPos:cc.Vec2 = null;
    oriHeight = 30;

    rewards:any[] = null;
    gotRewards = [];
    ballCnt = 0;
    onLoad(){
        super.onLoad();
        cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().debugDrawFlags = 1;
        this.node.on("holeIn",this.onHoleIn, this);
        this.playBtn.node.on(cc.Node.EventType.TOUCH_START, this.ready, this);
        this.playBtn.node.on(cc.Node.EventType.TOUCH_END, this.go, this);
        this.playBtn.node.on(cc.Node.EventType.TOUCH_CANCEL, this.go, this);
        this.insertCoinBtn.node.on("click",this.onInsertCoinTap, this);
        this.refreshBtn.node.on("click",this.onRefreshBtnTap, this);
        this.oriPos = this.board.position;
        this.oriHeight = this.spring.height;
        this.ballPrefab.active = false;
        this.initRewards();
        this.updateRefreshBtn();
        this.randomAngularVelocity();
        this.beginMoveDot();
        this.addInitBall();
        this.initTipLabel();
    }

    //初始化
    initRewards(){
        let rewards = DB.Get(Key.gashaRewards);
        let oldIdx = DB.Get(Key.gashaRefreshIdx);
        let now = Util.getTimeStamp();
        let hour = now/1000/60/60;
        let newIdx = Math.floor(hour/6);
        console.log("oldIdx", oldIdx);
        console.log("newIdx", newIdx);
        if(newIdx != oldIdx || !rewards){
            rewards = [];
            //刷新
            let totalP = 0;
            for(let i=0; i<Config.gashaRewards.length; i++){
                totalP += Config.gashaRewards[i].probability;
            }
            while(rewards.length < 4){
                let random = Math.random()*totalP;
                let p = 0;
                for(let i=0; i<Config.gashaRewards.length; i++){
                    p += Config.gashaRewards[i].probability;
                    if(random < p){
                        let copy = JSON.parse(JSON.stringify(Config.gashaRewards[i]))
                        rewards.push(copy);
                        break;
                    }
                }
            }
            let themeIds = [];
            for(let i=0;i<Config.themes.length;i++){
                if(!Game.isThemeOpen(Config.themes[i].id)){
                    themeIds.push(Config.themes[i].id);
                }
            }
            if(themeIds.length>0){
                let themeId = themeIds[Util.randomIdx(themeIds.length)];
                rewards.push({type:GashaRewardType.theme, id:themeId, probability:0});
            }else{
                rewards.push({type:GashaRewardType.none});
            }
            DB.SetLoacl(Key.gashaRefreshIdx, newIdx);
            DB.SetLoacl(Key.gashaRewards, rewards);   
        }
        this.rewards = rewards;
        let parent = this.gashaRewardItem.node.parent;
        while(parent.childrenCount<rewards.length){
            let child = cc.instantiate(this.gashaRewardItem.node);
            parent.addChild(child);
        }
        for(let i=0; i<parent.childrenCount; i++){
            let child = parent.children[i];
            if(i<rewards.length){
                child.active = true;
                let item = child.getComponent(GashaRewardItem);
                item.setData(rewards[i]);
            }else{
                child.active = false;
            }
        }
    }

    beginMoveDot(){
        let times = -1;
        let func = ()=>{
            times++;
            times = times%4;
            for(let i=0;i<this.dots.childrenCount;i++){
                let line = this.dots.children[i];
                let arr = line.getComponentsInChildren(cc.RigidBody);
                for(let j=0;j<arr.length;j++){
                    let dir = (times == 1 ||times == 2)?1:-1;
                    arr[j].linearVelocity = cc.v2(15*dir*(i%2==0?1:-1), 0);
                }
            }
        }
        func();
        this.schedule(func,0.5);
    }

    randomAngularVelocity(){
        let arr = this.wheels.getComponentsInChildren(cc.RigidBody);
        for(let i=0;i<arr.length;i++){
            arr[i].angularVelocity = (Math.random()>0.5?1:-1)*Util.randomFloat(150, 200);
        }
        arr = this.dots.getComponentsInChildren(cc.RigidBody);
        for(let i=0;i<arr.length;i++){
            arr[i].angularVelocity = (Math.random()>0.5?1:-1)*Util.randomFloat(150, 200);
        }
    }

    addInitBall(){
        let ballCnt = DB.Get(Key.gashaBallCnt);
        for(let i=0; i<ballCnt; i++){
            this.addBall();
        }
    }

    initTipLabel(){
        let last = DB.Get(Key.lastFreeBallStamp);
        if(Util.getTimeStamp() - last > Config.freeGashaTime){
            this.toFreeStyle();
        }else{
            this.beginFreeCountDown();
        }
    }

    toFreeStyle(){
        this.tipLabel.string = "获得免费一弹！";
        Util.searchChild(this.insertCoinBtn.node, "coin").active = false;
        Util.searchChild(this.insertCoinBtn.node, "btnLabel").getComponent(cc.Label).string = "免费";     
    }

    beginFreeCountDown(){
        Util.searchChild(this.insertCoinBtn.node, "coin").active = true;
        Util.searchChild(this.insertCoinBtn.node, "btnLabel").getComponent(cc.Label).string = "投币";        
        let last = DB.Get(Key.lastFreeBallStamp);
        let func = ()=>{
            let time = last + Config.freeGashaTime - Util.getTimeStamp();
            let timeStr = Util.getTimeStr(time);
            this.tipLabel.string = `${timeStr}后免费`;
            if(time<0){
                this.unschedule(func);
                this.toFreeStyle();
            }
        }
        func();
        this.schedule(func, 1);
    }

    onRefreshBtnTap(){
        if(this.canFreeRefresh()){
            this.doRefresh();
        }else{
            AD.showVideoAd(AdUnitId.RefreshGasha, ()=>{
                setTimeout(() => {
                    this.doRefresh();
                }, 500);
            },(err)=>{
                Top.showToast("播放失败");
            })
        }
    }
    doRefresh(){
        Top.showToast("奖品已刷新");
        DB.SetLoacl(Key.gashaRefreshIdx, 0);
        DB.SetLoacl(Key.gashaRewards, null);
        this.initRewards();
    }
    canFreeRefresh(){
        let cnt = 0;
        for(let i=0;i<this.rewards.length;i++){
            if(this.rewards[i].type == GashaRewardType.none){
                cnt++;
            }
        }
        return cnt>=4;
    }
    updateRefreshBtn(){
        Util.searchChild(this.refreshBtn.node, "icon").active = !this.canFreeRefresh();
    }
    //投币
    onInsertCoinTap(){
        if(this.balls.childrenCount<5){
            let last = DB.Get(Key.lastFreeBallStamp);
            if(Util.getTimeStamp() - last > Config.freeGashaTime){
                DB.SetLoacl(Key.lastFreeBallStamp, Util.getTimeStamp());
                this.addBall();
                this.beginFreeCountDown();
                return;
            }
            let coin = DB.Get(Key.Coin);
            if(coin<Config.gashaCostCoin){
                Top.showToast("金币不足");
            }else{
                DB.SetLoacl(Key.Coin, coin-Config.gashaCostCoin);
                Top.showFloatLabel(`金币-${Config.gashaCostCoin}`, this.insertCoinBtn.node, {
                    offset:cc.v2(0, 80),
                    color:cc.color(235,235,70),
                    stroke:2,
                    strokeColor:cc.Color.BLACK,
                    fontSize:40,
                    duration:2,
                });
                this.addBall();   
            }
        }else{
            Top.showToast("已经塞满了！");
        }
    }
    addBall(){
        let ball = cc.instantiate(this.ballPrefab);
        this.balls.addChild(ball);
        ball.position = cc.v2(0,this.balls.childrenCount*20);
        ball.getComponent(cc.RigidBody).linearVelocity = cc.v2(Util.randomFloat(-10,10), Util.randomFloat(-10,10));
        ball.active = true;
        this.forceArea.height = Math.min(this.balls.childrenCount, 5)*20;   
        this.ballCnt++;
        DB.SetLoacl(Key.gashaBallCnt, this.ballCnt);
    }
    t1:cc.Tween = null;
    t2:cc.Tween = null;
    ready(){
        this.board.position = this.oriPos;
        this.t1 = cc.tween(this.board).to(1.5, {position: this.oriPos.sub(cc.v2(0, 30))}, { easing: 'quintOut'}).start();
        this.spring.height = this.oriHeight;
        this.t2 = cc.tween(this.spring).to(1.5, {height: 0}, { easing: 'quintOut'}).start();
    }
    go(){
        Sound.play("spring");
        if(this.balls.childrenCount<=0){
            Top.showToast("请先投币...");
        }
        if(this.t1){
            this.t1.stop();
        }
        if(this.t2){
            this.t2.stop();
        }
        cc.tween(this.board).to(0.1, {position: this.oriPos}, { easing:'backOut'}).start();
        cc.tween(this.spring).to(0.1, {height: this.oriHeight}, { easing:'backOut'}).start();
        for(let i=0; i<this.balls.childrenCount; i++){
            let ball = this.balls.children[i];
            let ballPos:any = ball.convertToWorldSpaceAR(cc.Vec2.ZERO);
            if(this.forceArea.getBoundingBoxToWorld().contains(ballPos)){
                let ratio = 1-this.spring.height/this.oriHeight;
                ball.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,Util.randomFloat(1000,1200)*ratio);
            }
        }
    }
    //当球进洞时
    onHoleIn(e:cc.Event.EventCustom){
        let idx = e.detail.idx;
        let rewardData = this.rewards[idx];
        if(this.gotRewards.indexOf(rewardData)<0){
            this.gotRewards.push(rewardData);
        }
        this.ballCnt--;
        if(this.ballCnt <= 0){
            Top.blockInput(true);
            setTimeout(() => {
                Top.blockInput(false);
                this.openReward();
            }, 1000);
        }
    }
    
    openReward(){
        let gain = false;
        for(let i=0;i<this.gotRewards.length;i++){
            let one = this.gotRewards[i];
            switch(one.type){
                case GashaRewardType.coin:{
                    gain = true;
                    this.panelQueue.pushPanel("RewardPanel",(panel:RewardPanel)=>{
                        panel.setStyle({
                            title:"获得金币",
                            btnText:"领取"
                        })
                        panel.loadCoinContent(one.cnt,()=>{
                            panel.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:one.cnt}));
                        });
                    });
                    break;
                }
                case GashaRewardType.diamond:{
                    gain = true;
                    this.panelQueue.pushPanel("RewardPanel",(panel:RewardPanel)=>{
                        panel.setStyle({
                            title:"获得钻石",
                            btnText:"领取"
                        })
                        panel.loadDiamondContent(one.cnt,()=>{
                            panel.node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:one.cnt}));
                        });
                    });
                    break;
                }
                case GashaRewardType.theme:{
                    gain = true;
                    this.panelQueue.pushPanel("RewardPanel",(panel:RewardPanel)=>{
                        panel.setStyle({
                            title:"获得主题",
                            btnText:"领取"
                        })
                        panel.loadThemeContent(one.id,()=>{
                            let hasTheme = Game.isThemeOpen(one.id);
                            if(!hasTheme){
                                Game.openTheme(one.id);
                                this.node.dispatchEvent(Util.customEvent("updateThemeList",true));
                            }else{
                                panel.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:Config.themeToCoinCnt}));
                            }
                        });
                    });
                    break;
                }
                case GashaRewardType.ball:{
                    gain = true;
                    for(let i=0;i<one.cnt;i++){
                        setTimeout(() => {
                            this.addBall();
                        }, 0.1*i);
                    }
                    break;
                }
                case GashaRewardType.none:{
                    
                    break;
                }
            }
            one.type = GashaRewardType.none;
            let idx = this.rewards.indexOf(one);
            let item = this.gashaRewardItem.node.parent.children[idx].getComponent(GashaRewardItem);
            item.setData(null);
        }
        if(!gain){
            Top.showToast("谢谢惠顾");
        }else{
            this.panelQueue.checkNext();  
        }
        DB.SetLoacl(Key.gashaRewards, this.rewards);
        DB.SetLoacl(Key.gashaBallCnt, 0);
        this.updateRefreshBtn();
        this.gotRewards = [];
        this.balls.removeAllChildren();
    }
}
