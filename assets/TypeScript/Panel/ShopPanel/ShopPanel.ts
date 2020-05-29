import Panel from "../../Frame/Panel";
import { Util } from "../../Frame/Util";

import Button from "../../CustomUI/Button";
import Top from "../../Frame/Top";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { Config } from "../../Frame/Config";
import GashaponRewardItem, { GashaponRewardType } from "./GashaponRewardItem";
import { Game } from "../../Game/Game";


const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/ShopPanel")
export default class ShopPanel extends Panel {

    @property(Button)
    insertCoinBtn: Button = null;
    @property(Button)
    playBtn: Button = null;

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
    @property(GashaponRewardItem)
    gashaponRewardItem: GashaponRewardItem = null;

    
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
        this.insertCoinBtn.node.on("click",this.insertCoin, this);
        this.oriPos = this.board.position;
        this.oriHeight = this.spring.height;
        this.ballPrefab.active = false;
        this.randomAngularVelocity();
        this.beginMove();
        this.initRewards(Config.gashaponRewards);
    }

    onHoleIn(e:cc.Event.EventCustom){
        let idx = e.detail.idx;
        let ball = e.detail.ballNode;

        let rewardData = this.rewards[idx];
        this.gotRewards.push(rewardData);
        this.ballCnt--;
        if(this.ballCnt <= 0){
            //TODO
            //panelQueue
            
        }
        return;
        rewardData.type = "none";
        let item = this.gashaponRewardItem.node.parent.children[idx].getComponent(GashaponRewardItem);
        item.setData(rewardData);

        switch(rewardData.type){
            case GashaponRewardType.coin:{
                ball.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:rewardData.cnt}));
                break;
            }
            case GashaponRewardType.diamond:{
                ball.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:rewardData.cnt}));
                break;
            }
            case GashaponRewardType.theme:{
                ball.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:rewardData.cnt}));
                break;
            }
            case GashaponRewardType.none:{
                ball.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:rewardData.cnt}));
                break;
            }
            case GashaponRewardType.ball:{
                for(let i=0;i<rewardData.cnt;i++){
                    setTimeout(() => {
                        this.addBall();
                    }, 0.1*i);
                }
                break;
            }
        }
    }
    initRewards(rewards:any[]){
        this.rewards = rewards;
        let parent = this.gashaponRewardItem.node.parent;
        while(parent.childrenCount<rewards.length){
            let child = cc.instantiate(this.gashaponRewardItem.node);
            parent.addChild(child);
        }
        for(let i=0; i<parent.childrenCount; i++){
            let child = parent.children[i];
            if(i<rewards.length){
                child.active = true;
                let item = child.getComponent(GashaponRewardItem);
                item.setData(rewards[i]);
            }else{
                child.active = false;
            }
        }
    }
    beginMove(){
        let times = -1;
        let func = ()=>{
            times++;
            times = times%4;
            for(let i=0;i<this.dots.childrenCount;i++){
                let line = this.dots.children[i];
                let arr = line.getComponentsInChildren(cc.RigidBody);
                for(let j=0;j<arr.length;j++){
                    let dir = (times == 1 ||times == 2)?1:-1;
                    arr[j].linearVelocity = cc.v2(20*dir*(i%2==0?1:-1), 0);
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

    insertCoin(){
        if(this.balls.childrenCount<5){
            let coin = DB.Get(Key.Coin);
            if(coin<Config.gashaponCostCoin){
                Top.showToast("金币不足");
            }else{
                DB.SetLoacl(Key.Coin, coin-Config.gashaponCostCoin);
                Top.showFloatLabel(`金币-${Config.gashaponCostCoin}`, this.insertCoinBtn.node, {
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
        ball.position = cc.Vec2.ZERO;
        ball.getComponent(cc.RigidBody).linearVelocity = cc.v2(Util.randomFloat(-10,10), Util.randomFloat(-10,10));
        ball.active = true;
        this.forceArea.height = Math.min(this.balls.childrenCount, 5)*20;   
        this.ballCnt++;
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
                ball.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,Util.randomFloat(700,800)*ratio);
            }
        }
        
    }
}
