// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
import { crossPlatform } from "../Frame/CrossPlatform";
import { Vibrate } from "../Frame/Vibrate";
const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("自定义UI/Button")
export default class Button extends cc.Button {
    onLoad(){
        this.node.on("click", this.onClick, this);
    }
    onClick(){
        Vibrate.short();
        this.reportAnalytics();
    };
    reportAnalytics(){
        crossPlatform.reportAnalytics('clickBtn', {
            timeStamp: new Date().getTime(),
            btnName: this.node.name,
        });
    }
}
