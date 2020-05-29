// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { Util } from "../../Frame/Util";
import { type } from "os";
import { Game } from "../../Game/Game";

const {ccclass, property} = cc._decorator;
export enum GashaRewardType{
    coin,
    diamond,
    theme,
    ball,
    none,
}
@ccclass
export default class GashaRewardItem extends cc.Component {
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    label: cc.Label = null;
    setData(data){
        if(!data){
            this.icon.node.active = false;
            this.label.node.active = false;
            return;
        }
        this.icon.node.scale = 0.5;
        this.icon.node.active = true;
        this.label.node.active = false;
        switch(data.type){
            case GashaRewardType.coin:{
                this.loadIcon("Atlas/UI/coin");
                this.label.node.active = true;
                this.label.string = data.cnt;
                break;
            }
            case GashaRewardType.diamond:{
                this.loadIcon("Atlas/UI/diamond");
                this.label.node.active = true;
                this.label.string = data.cnt;
                break;
            }
            case GashaRewardType.theme:{
                let theme = Game.findThemeConf(data.id);
                let hero = Game.findHeroConf(theme.heroId);
                this.icon.node.scale = 0.35;
                Game.loadTexture(hero.url, (texture)=>{
                    this.icon.spriteFrame = new cc.SpriteFrame(texture);
                });
                break;
            }
            case GashaRewardType.none:{
                this.icon.spriteFrame = null;
                break;
            }
            case GashaRewardType.ball:{
                this.loadIcon("Atlas/Gasha/ball");
                this.label.node.active = true;
                this.label.string = data.cnt;
                break;
            }
        }
    }
    loadIcon(url){
        Util.loadRes(url, cc.SpriteFrame).then((spriteFrame:cc.SpriteFrame)=>{
            this.icon.spriteFrame = spriteFrame;
        });
    }
}
