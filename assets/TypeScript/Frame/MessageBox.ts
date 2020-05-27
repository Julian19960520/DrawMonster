import Panel from "../Frame/Panel";
import SceneManager from "./SceneManager";
import { Sound } from "./Sound";
import Button from "../CustomUI/Button";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/MessageBox")
export default class MessageBox extends Panel {
    @property(cc.Label)
    public label:cc.Label = null;
    @property(Button)
    public okBtn:Button = null;
    @property(Button)
    public cancelBtn:Button = null;

    public onOk = null;
    public onCancel = null;

    onLoad(){
        super.onLoad();
        this.okBtn.node.on("click", this.onOkBtnClick, this);
        this.cancelBtn.node.on("click", this.onCancelBtnClick, this);
    }
    onDestroy(){
        super.onDestroy();
        this.onOk = null;
        this.onCancel = null;
    }
    private onOkBtnClick(){
        if(this.onOk){
            this.onOk();
        }
        SceneManager.ins.popPanel();
    }
    private onCancelBtnClick(){
        if(this.onCancel){
            this.onCancel();
        }
        SceneManager.ins.popPanel();
    }
    toOkStyle(text, onOk = null){
        this.label.string = text;
        this.onOk = onOk;
        this.okBtn.node.active = true;
        this.cancelBtn.node.active = false;
    }
    toOkCancelStyle(text, onOk=null, onCancel=null){
        this.label.string = text;
        this.onOk = onOk;
        this.onCancel = onCancel;
        this.okBtn.node.active = true;
        this.cancelBtn.node.active = true;
    }
}
