// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Panel from "../Frame/Panel";
import SceneManager, { ShiftAnima } from "../Frame/SceneManager";
import { Sound } from "../Frame/Sound";
import Button from "../CustomUI/Button";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/PausePanel")
export default class PausePanel extends Panel {

    @property(Button)
    backBtn: Button = null;

    @property(Button)
    resumeBtn: Button = null;

    backHomeCallback = null;
    onLoad () {
        super.onLoad();
        this.backBtn.node.on("click", this.onBackBtnTap, this);
        this.resumeBtn.node.on("click", this.onResumeBtnTap, this);
    }
    onBackBtnTap(){
        Sound.play("clickBtn");
        if(this.backHomeCallback){
            this.backHomeCallback();
        }
    }
    onResumeBtnTap(){
        Sound.play("clickBtn");
        SceneManager.ins.popPanel();
    }
}
