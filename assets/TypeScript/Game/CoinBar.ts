// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { DB } from "../Frame/DataBind";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CoinBar extends DB.DataBindComponent {
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    public iconPos: cc.Node = null;
    onLoad () {
        this.Bind("user/coin",(coin)=>{
            this.label.string = coin;
        });
    }
}
