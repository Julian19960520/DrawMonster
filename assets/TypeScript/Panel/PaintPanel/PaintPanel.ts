import Panel from "../../Frame/Panel";
import Graphics from "../../CustomUI/Graphics";
import ScrollList from "../../CustomUI/ScrollList";
import Slider from "../../CustomUI/Slider";
import SceneManager from "../../Frame/SceneManager";
import MessageBox from "../../Frame/MessageBox";
import { DB } from "../../Frame/DataBind";
import { Config } from "../../Frame/Config";
import { Sound } from "../../Frame/Sound";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";
import { Util } from "../../Frame/Util";
import { TweenUtil } from "../../Frame/TweenUtil";
import { GameRecorder } from "../../Frame/GameRecorder";
import Top from "../../Frame/Top";


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
    @property(Button)
    pencilBtn:Button = null;
    @property(Button)
    eraserBtn:Button = null;
    @property(Button)
    revertBtn:Button = null;
    @property(Button)
    clearBtn:Button = null;
    @property(Button)
    bucketBtn:Button = null;
    @property(Button)
    saveBtn:Button = null;
    @property(Graphics)
    graphics:Graphics = null;
    @property(Slider)
    sizeSlider:Slider = null;

    @property(cc.Node)
    paintGroup:cc.Node = null;

    @property(cc.Node)
    colliderSizePreview:cc.Node = null;

    @property(cc.Node)
    bucketTool:cc.Node = null;

    @property(cc.Node)
    eraserTool:cc.Node = null;

    @property(cc.Graphics)
    colliderSize:cc.Graphics = null;

    @property(cc.Label)
    tipLabel:cc.Label = null;
    @property(Button)
    recordBtn:Button = null;
    @property(cc.Label)
    recodeLabel:cc.Label = null;
    @property(cc.Node)
    shareVideoPos:cc.Node = null;

    state:State = State.Pencil;
    saveCallback = null;
    private pencilColor:cc.Color = null;
    public static hasRecordVideo = false;
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
        this.recordBtn.node.on("click", this.onRecordBtnTap, this);
        this.sizeSlider.node.on(Slider.MOVE, this.onSizeChange, this);

        this.initColorBtns();
        this.highLightBtn(this.pencilBtn);
        this.drawColliderSize();
        this.bucketTool.active = false;
        this.eraserTool.active = false;
        this.state = State.Pencil;
        PaintPanel.hasRecordVideo = false;
    }

    initColorBtns(){
        let colorIds = DB.Get(Key.ColorIds);
        this.colorList.node.on(ScrollList.SELECT_CHILD, this.selectColorChild, this)
        this.colorList.setDataArr(colorIds);
        this.colorList.selectItemByData(Config.getColorDataByID(1));
    }

    selectColorChild(item, data){
        this.pencilColor = Config.getColorDataByID(data).color;
    }
    onPencilTap(){
        this.highLightBtn(this.pencilBtn);
        this.state = State.Pencil;
    }
    onEraserTap(){
        this.highLightBtn(this.eraserBtn);
        this.state = State.Eraser;
    }
    onBucketTap(){
        this.highLightBtn(this.bucketBtn);
        this.state = State.Bucket;
    }
    onRevertTap(){
        this.graphics.revert();
    }
    onClearTap(){
        SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
            messageBox.label.string = "是否清空画布？";
            messageBox.onOk = ()=>{
                this.graphics.clear();
            }
        });
    }
    
    onCloseBtnClick(){
        if(GameRecorder.recordering){
            GameRecorder.stop();
        }
        super.onCloseBtnClick();
    }

    onSaveBtnTap(){
        if(this.graphics.opStack.length<1){
            SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
                messageBox.toOkStyle("多画几笔吧（最少1笔）")
            });
        }else{
            if(GameRecorder.recordering){
                GameRecorder.stop();
                PaintPanel.hasRecordVideo = true;
                DB.Set(Key.screenShotTextures, [Util.screenShot()]);
            }
            if(this.saveCallback){
                this.saveCallback(this.graphics.pixels);
            }
        }
    }
    
    onRecordBtnTap(){
        if(!GameRecorder.recordering){
            GameRecorder.start(300);
        }else{
            if(Util.getTimeStamp() - GameRecorder.startStamp < Config.minRecordTime){
                Top.showToast(`录屏时间太短（最少${Config.minRecordTime/1000}秒）`);
                GameRecorder.stop();
            }else{
                GameRecorder.stop();
                GameRecorder.createGameRecorderShareButton({
                    parentNode:this.shareVideoPos,
                    textures:[Util.screenShot()],
                    onSucc:()=>{
                        Top.showToast("分享成功");
                    },
                    onFail:()=>{
                        Top.showToast("分享失败");
                    },
                });
                Top.blockInput(true);
                this.recordBtn.node.runAction(cc.sequence(
                    cc.moveBy(0.3, -250, 0),
                    cc.callFunc(()=>{
                        Top.blockInput(false);
                    }),
                    cc.delayTime(10),
                    cc.moveBy(0.3, 250, 0),
                ))
                this.shareVideoPos.runAction(cc.sequence(
                    cc.moveBy(0.3, 250, 0),
                    cc.delayTime(10),
                    cc.moveBy(0.3, -250, 0),
                    cc.callFunc(()=>{
                        GameRecorder.clearGameRecorderShareButton();
                    })
                ))
            }
        }
    }
    update(){
        if(GameRecorder.recordering){
            let time = (new Date().getTime() - GameRecorder.startStamp)/1000;
            let m = Math.floor(time/60);
            let s = Math.floor(time%60);
            let res = ("0"+m).substr(-2) + ":" + ("0"+s).substr(-2);
            this.recodeLabel.string = res;
        }else{
            this.recodeLabel.string = "录屏有奖";
        }
    }
    highLightBtn(targetBtn:Button){
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

    drawColliderSize(){
        this.colliderSize.strokeColor = cc.color(91,110,225,50);
        this.colliderSize.lineWidth = 6;
        this.colliderSize.circle(0,0,this.colliderSize.node.width/2);
        this.colliderSize.stroke();
    }

    beginTip(advises:string[]){
        let b = false;
        let advise = advises[Util.randomIdx(advises.length)];
        this.tipLabel.string = `没想好画什么？试试：【${advise}】`;
        let func = ()=>{
            TweenUtil.applyScaleBounce(this.tipLabel.node,1, 0.2, ()=>{
                b = !b;
                if(b){
                    this.tipLabel.string = Config.paintTips[Util.randomIdx(Config.paintTips.length)];
                }else{
                    this.tipLabel.string = `没想好画什么？试试：【${advise}】`;
                }
            })
        }
        this.schedule(func, 10);
        this.tipLabel.node.on(cc.Node.EventType.TOUCH_START, func, this);
    }

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
                this.graphics.lineTo(pos);
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
                this.graphics.lineTo(pos);   
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