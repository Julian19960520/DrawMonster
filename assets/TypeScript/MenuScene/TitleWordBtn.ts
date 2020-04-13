// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import PhyObject from "../PlayScene/PhyObject";
import { Util } from "../CocosFrame/Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TitleWordBtn extends cc.Component {
    @property
    private hp = 2;
    onLoad(){
        this.node.on("click", this.onClick, this)
    }
    onClick(){
        this.hp--;
        if(this.hp<=0){
            this.node.off("click", this.onClick, this)
            let phyObject = this.node.addComponent(PhyObject);
            phyObject.velocity = cc.v2( Util.randomInt(-100, 100), Util.randomInt(300, 500));
            phyObject.g = 1200;
            setTimeout(() => {
                this.node.removeFromParent();
            }, 3000);
        }
    }
}
