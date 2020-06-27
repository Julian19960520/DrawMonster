import Panel from "../../Frame/Panel";
import SceneManager from "../../Frame/SceneManager";
import { Util } from "../../Frame/Util";
import { Game } from "../../Game/Game";
import Top from "../../Frame/Top";
import { tt, wx, crossPlatform } from "../../Frame/CrossPlatform";
import Button from "../../CustomUI/Button";
import { AdUnitId, AD } from "../../Frame/AD";
import { Key } from "../../Game/Key";
import { DB } from "../../Frame/DataBind";
import { Config } from "../../Frame/Config";
import { GameRecorder } from "../../Frame/GameRecorder";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/GameOverPanel")
export default class GameOverPanel extends Panel {

    @property(Button)
    giveupBtn: Button = null;

    @property(Button)
    coinRebornBtn: Button = null;

    @property(Button)
    freeRebornBtn: Button = null;

    @property(cc.Node)
    shareVideoBtnParent:cc.Node = null;

    @property(cc.Node)
    titleNode: cc.Node = null;

    @property(cc.Sprite)
    heroSprite:cc.Sprite = null;
 
    @property(cc.Animation)
    starAnim:cc.Animation = null;

    public onGiveUpCallback = null;
    public onRebornCallback = null;

    private type:"share"|"video"|"ad" = "share";

    shareVideoSucc = false;
    onLoad(){
        super.onLoad();
        this.coinRebornBtn.node.on("click", this.onCoinRebornBtnTap, this);
        this.freeRebornBtn.node.on("click", this.onFreeRebornBtnTap, this);
        // this.shareVideoBtn.node.on("click", this.onShareVideoBtnTap, this);
        this.giveupBtn.node.on("click", this.onGiveupBtnTap, this);
        this.initHeroSprite();
        this.initRebornBtn();
        this.giveupBtn.node.active = false;
        this.scheduleOnce(() => {
            this.giveupBtn.node.active = true;
        }, crossPlatform.isDebug? 0.2:2);
        this.coinRebornBtn.getComponentInChildren(cc.Label).string = `x${Config.rebornCostCoin}复活`;
        if(GameRecorder.videoDuration>Config.minRecordTime){
            crossPlatform.reportAnalytics("GameRecorder",{
                location:"GameOverPanel",
                step:"show",
            })
            GameRecorder.createGameRecorderShareButton({
                parentNode:this.shareVideoBtnParent,
                textures:DB.Get(Key.screenShotTextures),
                onSucc:()=>{
                    crossPlatform.reportAnalytics("GameRecorder",{
                        location:"GameOverPanel",
                        step:"succ",
                    })
                    Top.showToast("分享成功");
                    this.shareVideoSucc = true;
                    // GameRecorder.clearVideo();
                },
                onFail:()=>{
                    Top.showToast("分享失败");
                },
            });
        }
    }
    initHeroSprite(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        let hero = Game.findHeroConf(theme.heroId);
        if(hero){
            Game.loadTexture(hero.url, "hero", (texture)=>{
                this.heroSprite.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    }
    initRebornBtn(){
        if(tt){
            if(Math.random()>0.5 && GameRecorder.videoDuration>Config.minRecordTime){
                this.setFreeRebornBtnType("ad");
            }else{
                this.setFreeRebornBtnType("video");
            }
        }
        else if(wx){
            this.setFreeRebornBtnType("share");
        }else{
            this.setFreeRebornBtnType("share");
        }
    }
    setFreeRebornBtnType(type){
        this.type = type;
        Util.loadRes("Atlas/UI/"+type,cc.SpriteFrame).then((spriteFrame:cc.SpriteFrame)=>{
            let sprite = Util.searchChild(this.freeRebornBtn.node, "icon").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        });
    }
    onCoinRebornBtnTap(){
        let coin = DB.Get(Key.Coin);
        if(coin<Config.rebornCostCoin){
            Top.showToast("金币不足");
        }else{
            Top.showFloatLabel(`复活\n金币-${Config.rebornCostCoin}`, this.coinRebornBtn.node, {
                offset:cc.v2(0, 80),
                color:cc.color(235,235,70),
                stroke:2,
                strokeColor:cc.Color.BLACK,
                fontSize:40,
                duration:2,
            });
            this.scheduleOnce(() => {
                DB.Set(Key.Coin ,coin-Config.rebornCostCoin);
                this.onRebornCallback();
                SceneManager.ins.popPanel();
            }, 1);
            
        }
    }
    onFreeRebornBtnTap(){
        if(this.type == "share"){
            //分享
            console.log(Util.rawUrl('resources/Atlas/Single/1.png'));
            crossPlatform.share({
                imageUrl:Util.rawUrl('resources/Atlas/Single/1.png'),
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
                Top.showToast("播放失败");
            })
        }else if(this.type == "video"){
            GameRecorder.share(()=>{
                Top.showToast("分享成功");
                this.shareVideoSucc = true;
                // GameRecorder.clearVideo();
                SceneManager.ins.popPanel();
                if(this.onRebornCallback){
                    this.onRebornCallback();
                }
            },()=>{
                Top.showToast("分享失败");
            })
        }
    }
    onGiveupBtnTap(){
        if(this.onGiveUpCallback){
            this.onGiveUpCallback();
        }
        if(this.shareVideoSucc){
            GameRecorder.clearVideo();
        }
        super.onCloseBtnClick();
    }
}
