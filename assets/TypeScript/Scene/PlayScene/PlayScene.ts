import Scene from "../../Frame/Scene";
import Hero from "./Hero";
import MonsterFactory from "./MonsterFactory";
import PropFactory from "./PropFactory";
import Music from "../../Frame/Music";
import { Sound } from "../../Frame/Sound";
import PausePanel from "../../Panel/PausePanel";
import SceneManager from "../../Frame/SceneManager";
import { Game } from "../../Game/Game";
import { Util } from "../../Frame/Util";
import GameOverPanel from "../../Panel/GameOverPanel/GameOverPanel";
import FinishScene from "../FinishScene/FinishScene";
import { GameRecorder } from "../../Frame/GameRecorder";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";
import { crossPlatform } from "../../Frame/CrossPlatform";
import { DB } from "../../Frame/DataBind";
import ScreenRect from "../../Frame/ScreenRect";
import { OperationFlow } from "../../Game/OperationFlow";

export enum GameState{
    play = "play",
    pause = "pause",
}

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu('场景/PlayScene') 
export default class PlayScene extends Scene {
    @property(Button)
    pauseBtn: Button = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Node)
    touchNode: cc.Node = null;

    @property(Hero)
    hero: Hero = null;

    @property(MonsterFactory)
    monsterFactory: MonsterFactory = null;

    @property(PropFactory)
    propFactory: PropFactory = null;
    
    @property(cc.Node)
    bag:cc.Node = null;
    
    @property(Music)
    music: Music = null;

    @property(cc.Label)
    coinLabel: cc.Label = null;
    @property(cc.Label)
    diamondLabel: cc.Label = null;


    private time = 0;
    private playing = false;
    private reborned = false;   //是否已经复活过
    private targetPos:cc.Vec2 = cc.Vec2.ZERO;
    private sensitivity = 1;
    private oriPos:cc.Vec2 = null;
    
    coin = 0;
    diamond = 0;
    setCoin(coin){
        this.coin = coin;
        this.coinLabel.string = coin;
    }
    setDiamond(diamond){
        this.diamond = diamond;
        this.diamondLabel.string = diamond;
    }

    
    onLoad () {
        this.oriPos = this.node.position;
        cc.director.getCollisionManager().enabled = true; //开启碰撞检测，默认为关闭
        // cc.director.getCollisionManager().enabledDebugDraw = true; //开启碰撞检测范围的绘制
        // cc.director.getCollisionManager().enabledDrawBoundingBox = true; //开启碰撞组件的包围盒绘制
        this.pauseBtn.node.on("click", this.onPauseBtnTap, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on("shakeScene", this.onShakeScene, this);
        this.node.on("gameOver", this.onGameOver, this);
        this.node.on("gainCoin", (evt:cc.Event.EventCustom)=>{
            OperationFlow.flyCoin({
                cnt:evt.detail.cnt,
                fromNode:evt.target,
                toNode:this.bag,
                onArrive:(addCnt)=>{
                    this.setCoin(this.coin+addCnt);
                }
            });
        }, this);
        this.node.on("gainDiamond", (evt:cc.Event.EventCustom)=>{
            OperationFlow.flyDiamond({
                cnt:evt.detail.cnt,
                fromNode:evt.target,
                toNode:this.bag,
                onArrive:(addCnt)=>{
                    this.setDiamond(this.diamond+addCnt);
                }
            });
        }, this);
        this.Bind(Key.Sensitivity, (sensitivity)=>{
            this.sensitivity = sensitivity;
        });
    }
    
    onPauseBtnTap(){
        if(!this.playing){
            return;
        }
        this.pause();
        this.OpenPanelByName("PausePanel",(pausePanel:PausePanel)=>{
            pausePanel.closeCallback = ()=>{
                this.resume();
            }
            pausePanel.backHomeCallback = ()=>{
                if(GameRecorder.recordering){
                    GameRecorder.stop();
                }
                this.savelyExit(()=>{
                    SceneManager.ins.goHome();
                });
            }
        });
    }

    //scene.active = false时，会引起virusFactory的collider禁用，进而引起子节点被回收到对象池,引起报错
    //所以需要安全的退出，先回收进对象池，再延迟一帧退出Scene
    savelyExit(callback){
        this.monsterFactory.clear();
        this.propFactory.clear();
        this.monsterFactory.pause();
        this.propFactory.pause();
        this.scheduleOnce(callback, 0);
    }

    onGameOver(evt:cc.Event.EventCustom){
        this.music.pause();
        if(!this.playing){
            return;
        }
        Sound.play("gameOver");
        //死亡截图
        let textures = [];
        for(let i=0;i<4;i++){
            this.scheduleOnce(() => {
                let texture = Util.screenShot();
                textures.push(texture);
            }, 0.4*i);
        }
        DB.Set(Key.screenShotTextures, textures);
        //时间突然变慢，然后慢慢恢复
        this.playing = false;
        let obj = {
            timeScale:0.2
        }
        let opend = false;
        cc.tween(obj).to(2, {timeScale:1}, {progress:(start, end, current, ratio)=>{
            current = start + (end-start) * cc.easing.quadInOut(ratio);
            Game.timeScale = current;
            if(current>=1){
                if(opend)return;
                    opend = true;
                if(GameRecorder.recordering){
                    GameRecorder.stop();
                }
                let killerName = evt.detail.monsterName;
                if(!this.reborned){
                    //还没重生过，则给一次重生机会
                    this.OpenPanelByName("GameOverPanel",(panel:GameOverPanel)=>{
                        //重试
                        panel.onRebornCallback = ()=>{
                            this.reborn();
                        }
                        //放弃
                        panel.onGiveUpCallback = ()=>{
                            this.enterFinishScene(killerName);
                        };
                    });
                }else{
                    //已经重生过了，直接进入结算界面
                    this.enterFinishScene(killerName);
                }
            }
            return current;
        }}).start();
    }
    
    private onTouchMove(event:cc.Event.EventTouch){
        if(this.playing){
            this.targetPos.addSelf(event.getDelta().mul(this.sensitivity));
            this.targetPos.x = Util.clamp(this.targetPos.x, -ScreenRect.width/2, ScreenRect.width/2);
            this.targetPos.y = Util.clamp(this.targetPos.y, -ScreenRect.height/2, ScreenRect.height/2);
        }
    }
    
    update(dt){
        dt *= Game.timeScale;
        if(this.playing){
            this.time += dt;
            this.timeLabel.string = `${Util.fixedNum(this.time, 2)}秒`;
            if(this.hero){
                let pos = Util.lerpVec2(this.hero.node.position, this.targetPos, 20*dt);
                this.hero.node.position = this.targetPos;
            }
        }
        
    }
    
    restart(){
        this.setCoin(0);
        this.setDiamond(0);
        this.music.play();
        this.time = 0;
        this.monsterFactory.clear();
        this.monsterFactory.play();
        this.propFactory.clear();
        this.propFactory.begin();
        DB.Set(Key.gameState, "play");
        this.hero.node.position = this.targetPos = cc.Vec2.ZERO;
        this.hero.setHp(Game.getHeartInitCnt());
        this.playing = true;
        this.reborned = false;
        let themeId = DB.Get(Key.ThemeId);
        this.scheduleOnce(()=>{
            console.log("开始录屏");
            GameRecorder.start(300);
        }, 1)
        crossPlatform.reportAnalytics('play', {
            timeStamp: new Date().getTime(),
            themeId: themeId>1000? 0 : themeId,
        });
    }
    
    pause(){
        this.music.pause();
        this.playing = false;
        this.monsterFactory.pause();
        this.propFactory.pause();
        DB.Set(Key.gameState, "pause");
    }
    
    resume(){
        this.music.resume();
        this.playing = true;
        this.monsterFactory.resume();
        this.propFactory.resume();
        DB.Set(Key.gameState, "play");
    }
    
    onShakeScene(evt:cc.Event.EventCustom){
        this.shakeScene(evt.detail);
    }
    
    shakeScene(scale = 1){
        let oriPos = this.oriPos;
        cc.tween(this.node)
            .to(0.1,{position:oriPos.add(cc.v2(0, 5*scale))})
            .to(0.1,{position:oriPos.add(cc.v2(-4*scale, -3*scale))})
            .to(0.1,{position:oriPos.add(cc.v2(4*scale, 3*scale))})
            .to(0.1,{position:oriPos.add(cc.v2(-4*scale, 3*scale))})
            .to(0.1,{position:oriPos.add(cc.v2(0, -5*scale))})
            .to(0.1,{position:oriPos.add(cc.v2(4*scale, 3*scale))})
            .to(0.1,{position:oriPos})
            .start();
    }
    
    reborn(){
        Sound.play("gameStartBtn");
        this.reborned = true;
        this.hero.shield.openShield(3);
        this.targetPos = cc.Vec2.ZERO;
        this.hero.node.position = cc.Vec2.ZERO;
        this.resume();
    }
    
    enterFinishScene(killerName){
        let time = Util.fixedNum(this.time, 2);
        Game.addRankData(time);
        //打点
        let themeId = DB.Get(Key.ThemeId);
        crossPlatform.reportAnalytics("gameOver",{
            timeStamp: new Date().getTime(),
            themeId: themeId>1000? 0 : themeId,
            time: time,
            coin:this.coin,
            diamond:this.diamond,
        })
        DB.Set(Key.PlayTimes, DB.Get(Key.PlayTimes)+1);
        SceneManager.ins.findScene(PlayScene).savelyExit(()=>{
            SceneManager.ins.Enter("FinishScene").then((finish:FinishScene)=>{
                finish.setData({
                    time:time,
                    killerName:killerName,
                    coin:this.coin,
                    diamond:this.diamond,
                })
            });
        });
    }
}
