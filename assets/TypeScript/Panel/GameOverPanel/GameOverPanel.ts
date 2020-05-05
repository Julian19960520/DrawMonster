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
import Top from "../../CocosFrame/Top";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/GameOverPanel")
export default class GameOverPanel extends Panel {

    @property(cc.Button)
    giveupBtn: cc.Button = null;

    @property(cc.Button)
    rebornBtn: cc.Button = null;

    @property(cc.Button)
    videoBtn: cc.Button = null;

    @property(cc.Node)
    titleNode: cc.Node = null;

    @property(cc.Sprite)
    heroSprite:cc.Sprite = null;

    @property(cc.Animation)
    starAnim:cc.Animation = null;

    public onGiveUpCallback = null;
    public onRebornCallback = null;

    private type:"share"|"video"|"ad" = "share";

    onLoad(){
        super.onLoad();
        this.rebornBtn.node.on("click", this.onRebornBtnTap, this);
        this.giveupBtn.node.on("click", this.onGiveupBtnTap, this);
        this.videoBtn.node.on("click", this.onVideoBtnTap, this);
        
        this.Bind("user/dramaId", (dramaId)=>{
            let drama = Game.findDramaConf(dramaId);
            let hero = Game.findHeroConf(drama.heroId);
            if(hero){
                Game.loadTexture(hero.url, (texture)=>{
                    this.heroSprite.spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        });
        if(tt){
            this.rebornBtn.node.active = false;
            if(Util.getTimeStamp() - GameRecorder.startStamp < 4000){
                //录屏时间太短，转分享
                this.setVideoBtnType("share");
            }else{
                this.setVideoBtnType("video");
            }
        }
        else if(wx){
            this.videoBtn.node.active = false;
            this.setRebornBtnType("share");
        }else{
            this.videoBtn.node.active = false;
            this.setRebornBtnType("share");
        }
        GameRecorder.stop();
    }
    onDestroy(){
        this.onRebornCallback = null;
        this.onGiveUpCallback = null;
    }

    setRebornBtnType(type){
        this.type = type;
        Util.loadRes("Atlas/UI/"+type,cc.SpriteFrame).then((spriteFrame:cc.SpriteFrame)=>{
            let sprite = Util.searchChild(this.rebornBtn.node, "icon").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
    }
    setVideoBtnType(type){
        this.type = type;
        Util.loadRes("Atlas/UI/"+type,cc.SpriteFrame).then((spriteFrame:cc.SpriteFrame)=>{
            let sprite = Util.searchChild(this.videoBtn.node, "icon").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
        let label = this.videoBtn.getComponentInChildren(cc.Label);
        if(this.type == "video"){
            label.string = "分享录屏";
        }else if(this.type == "share"){
            label.string = "分享";
        }
    }

    onRebornBtnTap(){
        Sound.play("clickBtn");
        if(this.type == "share"){
            crossPlatform.share({
                imageUrl:Util.rawUrl('resources/Atlas/ShareImg/1.png'),
                templateId:"6deh5ubi85226of3co",
                success:()=>{
                    SceneManager.ins.popPanel();
                    if(this.onRebornCallback){
                        this.onRebornCallback();
                    }
                },
                fail:()=>{
                    Top.ins.showToast("分享失败");
                }
            });
        }else if(this.type == "ad"){

        }
    }
    onVideoBtnTap(){
        Sound.play("clickBtn");
        if(this.type == "share"){
            crossPlatform.share({
                imageUrl:Util.rawUrl('resources/Atlas/ShareImg/1.png'),
                templateId:"6deh5ubi85226of3co",
                success:()=>{
                    SceneManager.ins.popPanel();
                    if(this.onRebornCallback){
                        this.onRebornCallback();
                    }
                },
                fail:()=>{
                    Top.ins.showToast("分享失败");
                }
            });
        }else if(this.type == "video"){
            GameRecorder.share(()=>{
                Top.ins.showToast("分享成功");
                if(this.onGiveUpCallback){
                    this.onGiveUpCallback();
                }
            },()=>{
                Top.ins.showToast("分享失败");
            });
        }
    }
    onGiveupBtnTap(){
        if(this.onGiveUpCallback){
            this.onGiveUpCallback();
        }
    }
}
