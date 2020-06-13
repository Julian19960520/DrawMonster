// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import ScreenRect from "../Frame/ScreenRect";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BgAnima extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    onLoad () {
        this.sprite.node.width = ScreenRect.width*2;
        this.sprite.node.height = ScreenRect.height*2;
    }

    update(dt = 0){
        this.sprite.node.y -= dt*50;
        if(this.sprite.node.y < -160){
            this.sprite.node.y += 160;
        }
    }
}
