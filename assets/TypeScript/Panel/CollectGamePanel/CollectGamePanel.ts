// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Button from "../../CustomUI/Button";
import SceneManager from "../../Frame/SceneManager";
import Panel from "../../Frame/Panel";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { crossPlatform } from "../../Frame/CrossPlatform";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CollectGamePanel extends Panel {

    @property(Button)
    okBtn: Button = null;
    onLoad () {
        super.onLoad();
        this.okBtn.node.on("click",this.onOkBtnTap, this);
        crossPlatform.onHide(this.onHide);
        DB.Set(Key.guideCollectGameBegin, 1);
    }
    onDestroy(){
        crossPlatform.offHide(this.onHide);
        super.onDestroy();
    }
    onOkBtnTap () {
        SceneManager.ins.popPanel();
    }
    onHide(){
        SceneManager.ins.popPanel();
    }
}
