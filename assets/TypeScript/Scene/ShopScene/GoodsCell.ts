// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { ThemeData } from "../../Frame/dts";
import { Game } from "../../Game/Game";
import { Util } from "../../Frame/Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GoodsCell extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;
    
    @property(cc.Node)
    obtainedNode:cc.Node = null;

    theme:ThemeData = null;

    onLoad(){
        this.node.on("click", this.onClick, this);
    }
    onClick(){
        this.node.dispatchEvent(Util.customEvent("clickGoodsCell",true, {
            theme:this.theme,
            cell:this,
        }));
    }
    setData(theme:ThemeData){
        this.theme = theme;
        let hero = Game.findHeroConf(theme.heroId);
        Game.loadTexture(hero.url, (texture)=>{
            this.setTexture(texture);
        });
        this.obtainedNode.active = Game.isThemeOpen(theme.id);
    }

    setTexture(texture){
        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        this.sprite.spriteFrame = spriteFrame;
    }
    setSelect(b){
        if(b){
            this.node.color = cc.color(242,255,168);
        }else{
            if(Game.isThemeOpen(this.theme.id)){
                this.node.color = cc.color(158,247,255);
            }else{
                this.node.color = cc.color(171,171,171);
            }
        }
    }
}
