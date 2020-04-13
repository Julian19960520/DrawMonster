// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import ScrollList from "../CustomUI/ScrollList";
import { Game } from "../Game";
import { DramaData } from "../CocosFrame/dts";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DramaCell extends cc.Component {
    // @property(cc.Node)
    // normalNode:cc.Node = null;
    // @property(cc.Node)
    // emptyNode:cc.Node = null;
    @property(cc.Node)
    scaleNode:cc.Node = null;
    @property(cc.Sprite)
    sprite:cc.Sprite = null;
    @property(cc.Sprite)
    selectBox:cc.Sprite = null;

    // @property(cc.Node)
    // youMark:cc.Node = null;

    data = null

    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on(ScrollList.SCROLL_MOVE, this.onScrollMove, this);
        this.node.on(ScrollList.STATE_CHANGE, this.onStateChange, this);
        this.node.on("click", this.onClick, this);
    }
    onStateChange(b) {
        this.selectBox.node.active = b;
    }
    onClick(){

    }
    onScrollMove(list:ScrollList){
        let x = this.node.x + list.getScrollOffset().x;
        let half = list.node.width/2;
        let dx = Math.abs(x-half);
        let scale = 1 - 0.7*cc.easing.quartInOut(dx/half);
        this.scaleNode.scale = scale;
    }
    setData(data:DramaData){
        if(!data){
            this.scaleNode.active = false;
            return;
        }
        this.scaleNode.active = true;
        let hero = Game.findHeroConf(data.heroId);
        this.sprite.node.active = false;
        Game.loadTexture(hero.url,(texture)=>{
            this.sprite.node.active = true;
            let frame = new cc.SpriteFrame();
            frame.setTexture(texture);
            this.sprite.spriteFrame = frame;
        });
    }
}
