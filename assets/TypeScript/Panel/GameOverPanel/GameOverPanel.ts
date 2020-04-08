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
import ScrollList from "../../CustomUI/ScrollList";
import SceneManager from "../../CocosFrame/SceneManager";
import PlayScene from "../../PlayScene/PlayScene";
import { DB } from "../../CocosFrame/DataBind";
import { RankData, wx, tt, crossPlatform } from "../../CocosFrame/dts";
import { Util } from "../../CocosFrame/Util";
import { Config } from "../../CocosFrame/Config";
import PaintPanel from "../PaintPanel/PaintPanel";
import { Game } from "../../Game";
import { AudioManager } from "../../CocosFrame/AudioManager";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/GameOverPanel")
export default class GameOverPanel extends Panel {

    @property(cc.Button)
    homeBtn: cc.Button = null;

    @property(cc.Button)
    retryBtn: cc.Button = null;


    @property(cc.Button)
    drawBtn: cc.Button = null;

    @property(cc.Button)
    shareBtn: cc.Button = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Sprite)
    heroSprite:cc.Sprite = null;

    @property(cc.Animation)
    starAnim:cc.Animation = null;


    private videoPath = null;
    private wxShareBtn = null;
    onLoad(){
        super.onLoad();
        this.homeBtn.node.on("click", this.onHomeBtnTap, this);
        this.retryBtn.node.on("click", this.onRetryBtnTap, this);
        this.drawBtn.node.on("click", this.onDrawBtnTap, this);
        this.shareBtn.node.on("click", this.onShareBtnTap, this);
        this.Bind("user/usingHeroId", (id)=>{
            let arr = Config.heros.concat(DB.Get("user/customHeros"));
            let hero = arr.find((data)=>{
                return data.id == id;
            });
            if(hero){
                Game.loadTexture(hero.url, (texture)=>{
                    this.heroSprite.spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        });
        if(wx){
            crossPlatform.getGameRecorderManager().stop();
            let box = Util.convertToWindowSpace(this.shareBtn.node);
            this.wxShareBtn = crossPlatform.createGameRecorderShareButton({
                text:"分享视频",
                style:{
                    left:box.left,
                    top:box.top,
                    height:box.height,
                },
                share:{
                    query:"foo=bar",
                    bgm:"",
                    timeRange:[[0, 2300]]
                }
            });
            this.shareBtn.node.active = false;
            this.wxShareBtn.show();
        }
        if(tt){
            this.videoPath = crossPlatform.getGameRecorderManager().stop();
        }
    }
    closeAnim(callback){
        console.log("asfd");
        console.log(this.wxShareBtn);
        if(this.wxShareBtn){
            this.wxShareBtn.hide();
        }
        super.closeAnim(callback);
    }
    setData(data){
        this.timeLabel.string = `时间：${data.time}秒`;
    }
    onHomeBtnTap(){
        AudioManager.playSound("clickBtn");
        let  playScene = SceneManager.ins.findScene(PlayScene);
        if(playScene){
            playScene.savelyExit();
        }
    }
    onRetryBtnTap(){
        AudioManager.playSound("gameStartBtn");
        SceneManager.ins.popPanel();
        let  playScene = SceneManager.ins.findScene(PlayScene);
        if(playScene){
            playScene.restart();
        }
    }
    onDrawBtnTap(){
        AudioManager.playSound("clickBtn");
        SceneManager.ins.OpenPanelByName("PaintPanel",(panel:PaintPanel)=>{
            panel.saveCallback = (path)=>{
                let hero = Game.newHeroConf("角色", path);
                DB.SetLoacl("user/usingHeroId", hero.id);
                this.starAnim.node.active = false;
            }
        });
    }
    onShareBtnTap(){
        AudioManager.playSound("clickBtn");
        if(tt){
            crossPlatform.shareAppMessage({
                title:"我画的怎么样！求赞求花花", 
                channel:"video",
                extra:{
                    videoPath:this.videoPath,
                    videoTopics:["画怪物"]
                }
            });
        }
    }
}
