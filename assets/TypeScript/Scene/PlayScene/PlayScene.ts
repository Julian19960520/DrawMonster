import Scene from "../../Frame/Scene";import Hero, { State } from "./Hero";import MonsterFactory from "./MonsterFactory";import PropFactory from "./PropFactory";import CoinBar from "../../Game/CoinBar";import Music from "../../Frame/Music";import { Sound } from "../../Frame/Sound";import PausePanel from "../../Panel/PausePanel";import SceneManager from "../../Frame/SceneManager";import { Game } from "../../Game/Game";import { Util } from "../../Frame/Util";import GameOverPanel from "../../Panel/GameOverPanel/GameOverPanel";import FinishScene from "../FinishScene/FinishScene";import { GameRecorder } from "../../Frame/GameRecorder";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";
import { crossPlatform } from "../../Frame/CrossPlatform";
import { DB } from "../../Frame/DataBind";


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
    
    @property(CoinBar)
    coinBar:CoinBar = null;
    
    @property(Music)
    music: Music = null;

    private time = 0;
    private playing = false;
    private reborned = false;   //是否已经复活过
    private targetPos:cc.Vec2 = cc.Vec2.ZERO;
    private sensitivity = 1;
    private oriPos:cc.Vec2 = null;
    onLoad () {
        this.oriPos = this.node.position;
        cc.director.getCollisionManager().enabled = true; //开启碰撞检测，默认为关闭
        // cc.director.getCollisionManager().enabledDebugDraw = true; //开启碰撞检测范围的绘制
        // cc.director.getCollisionManager().enabledDrawBoundingBox = true; //开启碰撞组件的包围盒绘制
        this.pauseBtn.node.on("click", this.onPauseBtnTap, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on("shakeScene", this.onShakeScene, this);
        this.node.on("gameOver", this.onGameOver, this);
        this.Bind(Key.Sensitivity, (sensitivity)=>{
            this.sensitivity = sensitivity;
        });
    }
    onDestroy(){
        this.touchNode.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    onPauseBtnTap(){
        if(!this.playing){
            return;
        }
        Sound.play("clickBtn");
        this.pause();
        this.OpenPanelByName("PausePanel",(pausePanel:PausePanel)=>{
            pausePanel.closeCallback = ()=>{
                this.resume();
            }
            pausePanel.backHomeCallback = ()=>{
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
                            this.gameOver(killerName);
                        };
                    });
                }else{
                    //已经重生过了，直接今日结算界面
                    this.gameOver(killerName);
                }
            }
            return current;
        }}).start();
    }

    private onTouchMove(event:cc.Event.EventTouch){
        if(this.playing){
            this.targetPos.addSelf(event.getDelta().mul(this.sensitivity));
        }
    }
    update(dt){
        dt *= Game.timeScale;
        if(this.playing){
            this.time += dt;
            this.timeLabel.string = `${Util.fixedNum(this.time, 2)}秒`;
            if(this.hero){
                let pos = Util.lerpVec2(this.hero.node.position, this.targetPos, 1);
                this.hero.node.position = pos;
            }
        }
    }
    restart(){
        this.music.play();
        this.time = 0;
        this.monsterFactory.clear();
        this.monsterFactory.play();
        this.propFactory.clear();
        this.propFactory.begin();
        this.hero.setState(State.active);
        this.hero.node.position = this.targetPos = cc.Vec2.ZERO;
        this.playing = true;
        this.reborned = false;
        GameRecorder.start();
        crossPlatform.reportAnalytics('play', {
            timeStamp: new Date().getTime(),
            themeId: DB.Get(Key.ThemeId),
        });
    }
    pause(){
        this.music.pause();
        this.playing = false;
        this.monsterFactory.pause();
        this.propFactory.pause();
        this.hero.setState(State.pause);
    }
    resume(){
        this.music.resume();
        this.playing = true;
        this.monsterFactory.resume();
        this.propFactory.resume();
        this.hero.setState(State.active);
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
        this.hero.openShield(3);
        this.hero.node.position = this.targetPos;
        this.resume();
    }
    gameOver(killerName){
        let time = Util.fixedNum(this.time, 2);
        Game.addRankData(time);
        SceneManager.ins.findScene(PlayScene).savelyExit(()=>{
            SceneManager.ins.Enter("FinishScene").then((finish:FinishScene)=>{
                finish.setData({
                    time:time,
                    killerName:killerName,
                })
            });
        });
        crossPlatform.reportAnalytics('play', {
            timeStamp: new Date().getTime(),
            themeId: DB.Get(Key.ThemeId),
            time:time
        });
    }
}
