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

const {ccclass} = cc._decorator;

@ccclass
export default class GainArea extends cc.Component {
    onBeginContact(contact, selfCollider:cc.PhysicsCollider, otherCollider:cc.PhysicsCollider){
        let pos = Util.convertPosition(otherCollider.node, this.node);   
        let idx = Math.floor(pos.x/(this.node.width/5));
        cc.log(pos,idx);
        this.node.dispatchEvent(Util.customEvent("holeIn",true,{idx:idx,ballNode:otherCollider.node}),);
    }
}
