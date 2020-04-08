// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { Util } from "../CocosFrame/Util";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("自定义UI/Toggle")
export default class Toggle extends cc.Toggle {
    public static STATE_CHANGE:"STATE_CHANGE";
    onLoad(){
        let evtHandler = new cc.Component.EventHandler();
        evtHandler.target = this.node;
        evtHandler.handler = "_stateChange"
        evtHandler.component = "Toggle";
        this.checkEvents = [evtHandler];
        this.node.emit(Toggle.STATE_CHANGE, this.isChecked, false);
    }
    _stateChange(toggle){
        this.node.emit(Toggle.STATE_CHANGE, this.isChecked, true);
    }
}
