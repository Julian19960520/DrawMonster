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
import { crossPlatform } from "../../CocosFrame/dts";

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

    @property(cc.Sprite)
    heroSprite:cc.Sprite = null;

    @property(cc.Animation)
    starAnim:cc.Animation = null;

    private wxShareBtn = null;
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
        console.log("Util.getTimeStamp()", Util.getTimeStamp());
        console.log("GameRecorder.startStamp", GameRecorder.startStamp);
        if(Util.getTimeStamp() - GameRecorder.startStamp < 4000){
            //录屏时间太短，转分享
            this.shareBtn.getComponentInChildren(cc.Label).string = "分享";
        }else{
            this.shareBtn.getComponentInChildren(cc.Label).string = "分享视频";
        }
        // if(wx){
        //     crossPlatform.getGameRecorder().stop();
        //     let box = Util.convertToWindowSpace(this.shareBtn.node);
        //     this.wxShareBtn = crossPlatform.createGameRecorderShareButton({
        //         text:"分享视频",
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
        this.timeLabel.string = `时间：${data.time}秒`;
        this.playTimeAnim(data.time);
    }
    playTimeAnim(time){
        let tw = cc.tween(this.timeLabel.node.parent);
        let cnt = Math.ceil(time/5);
        for(let i=0; i<cnt; i++){
            tw.call(()=>{
                this.timeLabel.node.parent.scale = 1.2;
                this.timeLabel.string = Util.fixedNum(time*(i+1)/cnt, 2).toString();
            }).to(0.1,{scale:1});
        }
        tw.start();
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
        if(this.shareBtn.getComponentInChildren(cc.Label).string == "分享视频"){
            GameRecorder.share();
        }else{
            crossPlatform.shareAppMessage({
                templateId:"6deh5ubi85226of3co",
            });
        }
    }
}
