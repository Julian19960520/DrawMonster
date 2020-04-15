// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Panel from "../../CocosFrame/Panel";
import SceneManager from "../../CocosFrame/SceneManager";
import PlayScene from "../../PlayScene/PlayScene";
import { Util } from "../../CocosFrame/Util";
import { Game } from "../../Game";
import { Sound } from "../../CocosFrame/Sound";
import { GameRecorder } from "../../GameRecorder";
import { crossPlatform, wx, tt, Ease } from "../../CocosFrame/dts";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/GameOverPanel")
export default class GameOverPanel extends Panel {

    @property(cc.Button)
    homeBtn: cc.Button = null;

    @property(cc.Button)
    retryBtn: cc.Button = null;

    @property(cc.Button)
    shareBtn: cc.Button = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;
    @property(cc.Node)
    titleNode: cc.Node = null;

    @property(cc.Label)
    monsterNameLabel: cc.Label = null;

    @property(cc.Sprite)
    heroSprite:cc.Sprite = null;

    @property(cc.Animation)
    starAnim:cc.Animation = null;

    private wxShareBtn = null;
    private shareLabel = null;
    onLoad(){
        super.onLoad();
        this.homeBtn.node.on("click", this.onHomeBtnTap, this);
        this.retryBtn.node.on("click", this.onRetryBtnTap, this);
        this.shareBtn.node.on("click", this.onShareBtnTap, this);
        this.Bind("user/dramaId", (dramaId)=>{
            let drama = Game.findDramaConf(dramaId);
            let hero = Game.findHeroConf(drama.heroId);
            if(hero){
                Game.loadTexture(hero.url, (texture)=>{
                    this.heroSprite.spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        });
        GameRecorder.stop();
        this.shareLabel = this.shareBtn.getComponentInChildren(cc.Label);
        if(tt){
            if(Util.getTimeStamp() - GameRecorder.startStamp < 4000){
                //录屏时间太短，转分享
                this.shareLabel.string = "分享";
            }else{
                this.shareLabel.string = "分享录频";
            }
        }
        if(wx){
            this.shareLabel.string = "分享";
        }
        // if(wx){
        //     crossPlatform.getGameRecorder().stop();
        //     let box = Util.convertToWindowSpace(this.shareBtn.node);
        //     this.wxShareBtn = crossPlatform.createGameRecorderShareButton({
        //         text:"分享录频",
        //         style:{
        //             left:box.left,
        //             top:box.top,
        //             height:box.height,
        //         },
        //         share:{
        //             query:"foo=bar",
        //             bgm:"",
        //             timeRange:[[0, 2300]]
        //         }
        //     });
        //     this.shareBtn.node.active = false;
        //     this.wxShareBtn.show();
        // }
        // if(tt){
        //     let recorder = crossPlatform.getGameRecorderManager();
        //     this.videoPath = recorder.stop();
        // }
    }
    closeAnim(callback){
        if(this.wxShareBtn){
            this.wxShareBtn.hide();
        }
        super.closeAnim(callback);
    }
    setData(data){
        this.monsterNameLabel.string = data.monsterName;
        this.playTitleAnim(data.time, data.killerName);
    }
    playTitleAnim(time, killerName:string){
        let obj = {progress:0};
        let labels = this.titleNode.getComponentsInChildren(cc.Label); 
        for(let i=0;i<labels.length;i++){
            labels[i].node.active = false;
        }
        cc.tween(obj)
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
            .to(0.5, {progress:1},{progress:(start, end, current, ratio)=>{
                current = cc.easing.quadOut(ratio);
                labels[1].string = (current*time).toFixed(2);
                return current;
            }})
            .delay(0.3)
            .call(()=>{
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
                labels[3].string = killerName;
                labels[3].node.opacity = 0;
                labels[3].node.scale = 2;
                cc.tween(labels[3].node).to(0.2,{scale:1.1,opacity:255}, {easing:cc.easing.backOut}).start();
            })
            .start();
    }
    onHomeBtnTap(){
        Sound.play("clickBtn");
        let  playScene = SceneManager.ins.findScene(PlayScene);
        if(playScene){
            playScene.savelyExit();
        }
    }
    onRetryBtnTap(){
        Sound.play("gameStartBtn");
        SceneManager.ins.popPanel();
        let  playScene = SceneManager.ins.findScene(PlayScene);
        if(playScene){
            playScene.restart();
        }
    }
    onShareBtnTap(){
        Sound.play("clickBtn");
        if(this.shareLabel.string == "分享录频"){
            GameRecorder.share();
        }else{
            crossPlatform.shareAppMessage({
                templateId:"6deh5ubi85226of3co",
            });
        }
    }
}
