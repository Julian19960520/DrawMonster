// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { DB } from "../../Frame/DataBind";
import Button from "../../CustomUI/Button";
import { TweenUtil } from "../../Frame/TweenUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BaseEditCell extends DB.DataBindComponent {
    @property(cc.Node)
    normalNode:cc.Node = null;
    @property(cc.Node)
    mark:cc.Node = null;
    @property(cc.Node)
    emptyNode:cc.Node = null;
    @property(cc.Sprite)
    sprite:cc.Sprite = null;
    @property(Button)
    deleteBtn:Button = null;

    onLoad(){
        
    }
    
    showDeleteBtn(b){
        this.deleteBtn.node.active = b;
        if(b){
            TweenUtil.applyFloat(this.normalNode);
        }else{
            this.normalNode.stopAllActions();
            this.normalNode.x = 0;
            this.normalNode.y = 0;
            this.normalNode.angle = 0;
        }
    }

    setUsingState(b){
        this.normalNode.color = b?cc.color(237,245,142):cc.Color.WHITE;
        this.mark.active = b;
    }
}
