
import Panel from "../../Frame/Panel";
import Button from "../../CustomUI/Button";
import { AD, AdUnitId } from "../../Frame/AD";
import SceneManager from "../../Frame/SceneManager";
import Top from "../../Frame/Top";
import { TweenUtil } from "../../Frame/TweenUtil";
import { Util } from "../../Frame/Util";
import { wx, crossPlatform, tt } from "../../Frame/CrossPlatform";
import { Game } from "../../Game/Game";
import { Config } from "../../Frame/Config";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/RewardPanel")
export default class RewardPanel extends Panel {

    @property(cc.Label)
    titleLabel: cc.Label = null;

    @property(cc.Node)
    lightNode: cc.Node = null;

    @property(cc.Node)
    rewardPos: cc.Node = null;

    @property(Button)
    gainBtn: Button = null;

    gainCallback = null;
    onLoad () {
        this.gainBtn.node.on("click", this.onGainBtnTap, this);
        this.initLight();
    }

    openAnim(callback = null){
        TweenUtil.applyAppear({node:this.node, callback:callback});
        TweenUtil.applyAppear({node:this.titleLabel.node, delay:0, duration:0.5});
        TweenUtil.applyAppear({node:this.rewardPos, delay:0.1, duration:0.5});
        TweenUtil.applyAppear({node:this.gainBtn.node, delay:0.5, duration:0.5});
    }

    initLight(){
        let cnt = 7;
        while(this.lightNode.childrenCount<cnt){
            let child = cc.instantiate(this.lightNode.children[0]);
            this.lightNode.addChild(child);
        }
        for(let i=0;i<cnt;i++){
            let child = this.lightNode.children[i];
            child.angle = i*360/cnt;
            child.runAction(cc.repeatForever(cc.rotateBy(10, 360)));
        }
    }

    setStyle(style:{title:string, btnText:string}){
        this.titleLabel.string = style.title;
        this.gainBtn.getComponentInChildren(cc.Label).string = style.btnText;
    }

    onGainBtnTap(){
        if(this.gainCallback){
            console.log("gainCallback");
            this.gainCallback();
        }
        if(this.panelQueue){
            this.panelQueue.checkNext();
        }
    }

    //金币奖励
    loadCoinContent(cnt, gainCallback){
        this.gainCallback = gainCallback;
        cc.loader.loadRes(`Prefab/RewardContent/coinContent`, (err, prefab) => {
            var node:cc.Node = cc.instantiate(prefab);
            this.rewardPos.addChild(node);
            node.getComponentInChildren(cc.Label).string = `x${cnt}`;
        });
    }
    //钻石奖励
    loadDiamondContent(cnt, gainCallback){
        this.gainCallback = gainCallback;
        cc.loader.loadRes(`Prefab/RewardContent/diamondContent`, (err, prefab) => {
            var node:cc.Node = cc.instantiate(prefab);
            this.rewardPos.addChild(node);
            node.getComponentInChildren(cc.Label).string = `x${cnt}`;
        });
    }
    //主题奖励
    loadThemeContent(themeId, gainCallback){
        console.log("loadThemeContent");
        this.gainCallback = gainCallback;
        cc.loader.loadRes(`Prefab/RewardContent/themeContent`, (err, prefab) => {
            var node:cc.Node = cc.instantiate(prefab);
            this.rewardPos.addChild(node);
            let theme = Game.findThemeConf(themeId);
            let hero = Game.findHeroConf(theme.heroId);
            Game.loadTexture(hero.url, "hero",(texture)=>{
                Util.searchChild(node,"hero").getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            });
            let hasTheme = Game.isThemeOpen(themeId);
            Util.searchChild(node,"newLabel").active = !hasTheme;
            Util.searchChild(node,"arrow").active = hasTheme;
            Util.searchChild(node,"tipLabel").active = hasTheme;
            Util.searchChild(node,"coin").active = hasTheme;
            if(hasTheme){
                Util.searchChild(node,"coinLabel").getComponent(cc.Label).string = `x${Config.themeToCoinCnt}`;
            }
        });
    }

}
