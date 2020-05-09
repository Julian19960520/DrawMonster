import Panel from "../../Frame/Panel";
import Graphics from "../../CustomUI/Graphics";
import ScrollList from "../../CustomUI/ScrollList";
import Slider from "../../CustomUI/Slider";
import SceneManager from "../../Frame/SceneManager";
import MessageBox from "../../Frame/MessageBox";
import ToggleGroup from "../../CustomUI/ToggleGroup";
import { DB } from "../../Frame/DataBind";
import { Config } from "../../Frame/Config";
import { Game } from "../../Game/Game";
import { Sound } from "../../Frame/Sound";
import { crossPlatform } from "../../Frame/CrossPlatform";
import Monster from "../../Scene/PlayScene/Monster";


const {ccclass, menu, property} = cc._decorator;

enum State{
    Pencil,
    Eraser,
    Bucket,
}
@ccclass
@menu("面板/PaintPanel")
export default class PaintPanel extends Panel {

    @property(ScrollList)
    colorList:ScrollList = null;

    //绘画
    @property(cc.Button)
    pencilBtn:cc.Button = null;
    @property(cc.Button)
    eraserBtn:cc.Button = null;
    @property(cc.Button)
    revertBtn:cc.Button = null;
    @property(cc.Button)
    clearBtn:cc.Button = null;
    @property(cc.Button)
    bucketBtn:cc.Button = null;
    @property(cc.Button)
    saveBtn:cc.Button = null;
    @property(Graphics)
    graphics:Graphics = null;
    @property(Slider)
    sizeSlider:Slider = null;
    //动画
    @property(ToggleGroup)
    actionToggle:ToggleGroup = null;
    @property(Monster)
    monster: Monster = null;

    //
    @property(ToggleGroup)
    mainToggle:ToggleGroup = null;
    @property(cc.Node)
    paintGroup:cc.Node = null;
    @property(cc.Node)
    animGroup:cc.Node = null;
    @property(cc.Node)
    colliderSizePreview:cc.Node = null;

    @property(cc.Node)
    bucketTool:cc.Node = null;

    @property(cc.Node)
    eraserTool:cc.Node = null;

    state:State = State.Pencil;

    onLoad () {
        super.onLoad();
        this.graphics.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.graphics.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.graphics.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.graphics.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.pencilBtn.node.on("click", this.onPencilTap, this);
        this.eraserBtn.node.on("click", this.onEraserTap, this);
        this.revertBtn.node.on("click", this.onRevertTap, this);
        this.clearBtn.node.on("click", this.onClearTap, this);
        this.bucketBtn.node.on("click", this.onBucketTap, this);
        this.saveBtn.node.on("click", this.onSaveBtnTap, this);
        this.sizeSlider.node.on(Slider.MOVE, this.onSizeChange, this);

        this.actionToggle.node.on(ToggleGroup.TOGGLE_CHANGE, this.onActionToggleChange, this);
        this.mainToggle.node.on(ToggleGroup.TOGGLE_CHANGE, this.onMainToggleChange, this);
        this.initColorBtns();
        this.highLightBtn(this.pencilBtn);
        this.bucketTool.active = false;
        this.eraserTool.active = false;
        this.state = State.Pencil;
    }

    onDestroy(){
        super.onDestroy();
        this.graphics.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.graphics.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.graphics.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.graphics.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.pencilBtn.node.off("click", this.onPencilTap, this);
        this.eraserBtn.node.off("click", this.onEraserTap, this);
        this.revertBtn.node.off("click", this.onRevertTap, this);
        this.clearBtn.node.off("click", this.onClearTap, this);
        this.bucketBtn.node.off("click", this.onBucketTap, this);
        this.saveBtn.node.off("click", this.onSaveBtnTap, this);
        this.sizeSlider.node.off(Slider.MOVE, this.onSizeChange, this);
        this.colorList.node.off(ScrollList.SELECT_CHILD, this.selectColorChild, this)
    }
    initColorBtns(){
        let colorIds = DB.Get("user/colorIds");
        this.colorList.node.on(ScrollList.SELECT_CHILD, this.selectColorChild, this)
        this.colorList.setDataArr(colorIds);
        this.colorList.selectItemByData(Config.getColorDataByID(1));
    }
    onMainToggleChange(idx, click){
        if(click){
            Sound.play("clickBtn");
        }
        this.paintGroup.active = idx==0;
        this.animGroup.active = idx==1;
        if(idx == 1){
            this.monster.setTexture(this.graphics.renderTexture);
            this.onActionToggleChange(this.actionToggle.idx, false);
        }
    }
    onActionToggleChange(idx,click){
        if(click){
            Sound.play("clickBtn");
        }
        this.monster.playAnima(`action${idx+1}`);
    }

    selectColorChild(item, data){
        // Sound.play("clickBtn");
        this.pencilColor = Config.getColorDataByID(data).color;
    }
    onPencilTap(){
        Sound.play("clickBtn");
        this.highLightBtn(this.pencilBtn);
        this.state = State.Pencil;
    }
    onEraserTap(){
        Sound.play("clickBtn");
        this.highLightBtn(this.eraserBtn);
        this.state = State.Eraser;
    }
    onBucketTap(){
        Sound.play("clickBtn");
        this.highLightBtn(this.bucketBtn);
        this.state = State.Bucket;
    }
    onRevertTap(){
        Sound.play("clickBtn");
        this.graphics.revert();
    }
    onClearTap(){
        Sound.play("clickBtn");
        SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
            messageBox.label.string = "是否清空画布？";
            messageBox.onOk = ()=>{
                this.graphics.clear();
            }
        });
    }
    private oriPath = "";
    setBaseTexture(oriPath){
        this.oriPath =  oriPath;
        //TODO
    }
    saveCallback = null;
    onSaveBtnTap(){
        if(this.graphics.opStack.length<1){
            SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
                messageBox.toOkStyle("多画几笔吧（最少1笔）")
            });
            return;
        }
        Sound.play("clickBtn");
        crossPlatform.getOpenDataContext().postMessage({
            type:"hello"
        });
        let path = Game.savePixels(this.graphics.pixels);
        if(this.saveCallback){
            this.saveCallback(path);
        }
        SceneManager.ins.popPanel();
    }
    highLightBtn(targetBtn:cc.Button){
        let btns = [this.pencilBtn, this.eraserBtn, this.bucketBtn];
        for(let i=0; i<btns.length; i++){
            let btn = btns[i];
            let node = btn.getComponentInChildren(cc.Sprite).node;
            if(btn == targetBtn){
                node.color = cc.color(116, 255, 255);
            }else{
                node.color = cc.Color.WHITE;
            }
        }
    }
    onSizeChange(size){
        Sound.play("clickBtn");
        this.graphics.lineWidth = size;
    }
    private pencilColor:cc.Color = null;

    private onTouchStart(event:cc.Event.EventTouch){
        let pos = event.getLocation();
        this.graphics.node.convertToNodeSpaceAR(pos, pos);
        switch(this.state){
            case State.Bucket:{
                this.bucketTool.active = true;
                this.bucketTool.position = pos;
                this.bucketTool.children[0].color = this.pencilColor;
                break;
            }
            case State.Pencil: {
                this.graphics.color = this.pencilColor;
                this.graphics.beginLine(pos); 
                break;
            }
            
            case State.Eraser:{
                let tool:cc.Node = this.eraserTool;
                let gra = this.eraserTool.getComponentInChildren(cc.Graphics);
                gra.clear();
                gra.fillColor = gra.strokeColor = cc.Color.WHITE;
                gra.circle(0,0, this.graphics.lineWidth);
                gra.stroke();
                tool.active = true;
                tool.position = pos;
                this.graphics.color = cc.Color.TRANSPARENT;
                pos.addSelf(cc.v2(-tool.width, tool.height));
                this.graphics.beginLine(pos);     
                break;
            } 
        }
    }
    private onTouchMove(event:cc.Event.EventTouch){
        let pos = event.getLocation();
        this.graphics.node.convertToNodeSpaceAR(pos, pos);
        switch(this.state){
            case State.Bucket:{
                this.bucketTool.position = pos;
                break;
            }
            case State.Pencil: {
                this.graphics.lineTo(pos);     
                break;
            }
            case State.Eraser:{
                let tool:cc.Node = this.eraserTool;
                tool.position = pos;
                pos.addSelf(cc.v2(-tool.width, tool.height));
                this.graphics.lineTo(pos);     
                break;
            } 
        }
    }
    private onTouchEnd(event:cc.Event.EventTouch){
        let pos = event.getLocation();
        this.graphics.node.convertToNodeSpaceAR(pos, pos);
        switch(this.state){
            case State.Bucket:{
                this.bucketTool.active = false;
                let sight = this.bucketTool.children[0];
                pos.addSelf(sight.position);
                this.graphics.bucketFill(pos, this.pencilColor);
                break;
            }
            case State.Pencil: case State.Eraser:{
                this.eraserTool.active = false;
                this.graphics.endLine();   
                break;
            } 
        }
    } 
}