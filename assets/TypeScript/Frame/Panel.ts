import PanelStack from "./PanelStack";
import { DB } from "./DataBind";
import SceneManager from "./SceneManager";
import Button from "../CustomUI/Button";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Panel extends DB.DataBindComponent {

    @property
    public autoHidePrePanel = true;        //当打开此面板时，是否自动隐藏前一个面板（隐藏不会引起关闭）
    @property(Button)
    public closeBtn:Button = null;
    
    public panelStack:PanelStack = null;
    public closeCallback = null;

    onLoad(){
        if(this.closeBtn){
            this.closeBtn.node.on("click", this.onCloseBtnClick, this);
        }
    }
    onDestroy(){
        super.onDestroy();
        this.closeCallback = null;
    }
    public closeAnim(callback = null){
        this.node.scale = 1;
        cc.tween(this.node).to(0.1,{scale:0}).hide().call(callback).start();
    }
    public openAnim(callback = null){
        this.node.scale = 0;
        cc.tween(this.node).show().to(0.1,{scale:1}).call(callback).start();
    }
    protected onCloseBtnClick(){
        if(this.closeCallback){
            this.closeCallback();
        }
        SceneManager.ins.popPanel();
    }
}
