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
import { Sound } from "../../Frame/Sound";
import Top from "../../Frame/Top";
import { GameRecorder } from "../../Frame/GameRecorder";
import { tt, wx, crossPlatform, VideoAd } from "../../Frame/CrossPlatform";
import Button from "../../CustomUI/Button";
import { AdUnitId, AD } from "../../Frame/AD";
import { Key } from "../../Game/Key";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/GameOverPanel")
export default class GameOverPanel extends Panel {

    @property(Button)
    giveupBtn: Button = null;

    @property(Button)
    rebornBtn: Button = null;

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

        this.Bind(Key.ThemeId, (themeId)=>{
            let theme = Game.findThemeConf(themeId);
            let hero = Game.findHeroConf(theme.heroId);
            if(hero){
                Game.loadTexture(hero.url, (texture)=>{
                    this.heroSprite.spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        });
        if(tt){
            if(Util.getTimeStamp() - GameRecorder.startStamp > 4000){
                //录制视频
                this.setRebornBtnType("video");
            }else{
                //录屏时间太短，转分享或视频
                this.setRebornBtnType(Math.random()>0.2?"ad":"share");
            }
        }
        else if(wx){
            this.setRebornBtnType("share");
        }else{
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
        // let label = this.rebornBtn.getComponentInChildren(cc.Label);
        // if(this.type == "video"){
        //     label.string = "分享录屏";
        // }else{
        //     label.string = "复活";
        // }
    }

    onRebornBtnTap(){
        Sound.play("clickBtn");
        if(this.type == "share"){
            //分享
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
                Top.showToast("播放失败"+err);
            })
        }else if(this.type == "video"){
            //录屏
            GameRecorder.share(()=>{
                SceneManager.ins.popPanel();
                if(this.onRebornCallback){
                    this.onRebornCallback();
                }
            },()=>{
                Top.showToast("分享失败");
            });
        }
    }

    onGiveupBtnTap(){
        if(this.onGiveUpCallback){
            this.onGiveUpCallback();
        }
    }
}
