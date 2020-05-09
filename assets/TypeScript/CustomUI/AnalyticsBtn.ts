// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { crossPlatform } from "../Frame/CrossPlatform";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("自定义UI/AnalyticsBtn")
export default class AnalyticsBtn extends cc.Component {
    onLoad(){
        this.node.on("click", this.onClick, this);
    }
    onClick(){
        console.log("clickBtn", this.node.name);
        crossPlatform.reportAnalytics('clickBtn', {
            timeStamp: new Date().getTime(),
            btnName: this.node.name,
        });
    };
}
