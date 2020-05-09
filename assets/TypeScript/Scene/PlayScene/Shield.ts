// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Monster from "./Monster";
import { Util } from "../../Frame/Util";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Shield extends cc.Component {
    beginAnim(){
        this.getComponent(cc.Animation).play("shield");
    }
    endAnim(){
        this.getComponent(cc.Animation).stop();
    }
    onCollisionEnter(other:cc.Collider, self){
        if(other.node.group == "Monster"){
            let monster = other.node.getComponent(Monster);
            if(monster && monster.active){
                monster.active = false;
                monster.beginDrop();
                this.node.dispatchEvent(Util.customEvent("shakeScene", true, 0.5));
            }
        }
    }
}
