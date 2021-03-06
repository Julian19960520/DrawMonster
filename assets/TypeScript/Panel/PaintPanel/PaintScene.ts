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
import Scene from "../../Frame/Scene";
import PreviewPanel from "../PreviewPanel/PreviewPanel";
import { Game } from "../../Game/Game";


const {ccclass, menu, property} = cc._decorator;

enum State{
    Pencil,
    Eraser,
    Bucket,
}
@ccclass
@menu("面板/PaintPanel")
export default class PaintScene extends Scene {
    @property(Button)
    backBtn:Button = null;

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

    @property(cc.Node)
    shareVideoPos:cc.Node = null;

    state:State = State.Pencil;

    private pencilColor:cc.Color = null;
    callback = null;
    type:"hero"|"monster"|"heart"|"shield"|"bg" = "hero";
    onLoad () {
        super.onLoad();
        this.backBtn.node.on("click",this.onBackBtnTap, this);
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

        this.initColorBtns();
        this.highLightBtn(this.pencilBtn);
        this.drawColliderSize();
        this.beginTip();
        this.bucketTool.active = false;
        this.eraserTool.active = false;
        this.state = State.Pencil;
    }

    initColorBtns(){
        let colorIds = DB.Get(Key.ColorIds);
        this.colorList.node.on(ScrollList.SELECT_CHILD, this.selectColorChild, this);
        // this.colorList.node.width = Math.ceil(colorIds.length/2)*50;
        this.colorList.setDataArr(colorIds);
        this.colorList.selectItemByData(Config.getColorDataByID(1));
    }

    selectColorChild(item, data){
        this.pencilColor = Config.getColorDataByID(data).color;
    }
    onBackBtnTap(){
        SceneManager.ins.Back();
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
    
    onExitBegin(){
        if(GameRecorder.recordering){
            GameRecorder.stop();
        }
    }

    onSaveBtnTap(){
        if(this.graphics.opStack.length<1){
            SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
                messageBox.toOkStyle("多画几笔吧（最少1笔）")
            });
        }else{
            this.openPreviewPanel();
        }
    }
    
    openPreviewPanel(){
        if(GameRecorder.recordering){
            GameRecorder.stop();
            DB.Set(Key.screenShotTextures, [Util.screenShot()]);
        }
        //点击画图面板的保存按钮时
        SceneManager.ins.OpenPanelByName("PreviewPanel",(previewPanel:PreviewPanel)=>{
            let pixels = this.graphics.pixels;
            switch(this.type){
                case "hero":{
                    previewPanel.initHero(pixels);
                    previewPanel.okCallback = (name)=>{
                        DB.Set(Key.guideDrawFish, true);
                        let path = Game.savePixels(pixels);
                        let hero = Game.newHeroConf(name||"我的角色", path);
                        let theme = Game.newThemeConf(hero.id);
                        DB.Set(Key.ThemeId, theme.id);
                        SceneManager.ins.Back();
                        if(this.callback)
                            this.callback();
                    };
                    break;
                }
                case "monster":{
                    previewPanel.initMonster(pixels);
                    previewPanel.okCallback = (name, dirType)=>{
                        DB.Set(Key.guideDrawFish, true);
                        let path = Game.savePixels(pixels);
                        let monster = Game.newMonsterConf(name||"我的怪物", path, dirType);
                        DB.Invoke(Key.CustomMonsters);
                        SceneManager.ins.Back();
                        if(this.callback)
                            this.callback(monster);
                    };
                    break;
                }
                case "heart":{
                    previewPanel.initProp(pixels);
                    previewPanel.okCallback = (name)=>{
                        let path = Game.savePixels(pixels);
                        let heart = Game.newHeartConf(name||"我的道具", path);
                        SceneManager.ins.Back();
                        if(this.callback)
                            this.callback(heart);
                    };
                    break;
                }
                case "shield":{
                    previewPanel.initProp(pixels);
                    previewPanel.okCallback = (name)=>{
                        let path = Game.savePixels(pixels);
                        let shield = Game.newShieldConf(name||"我的道具", path);
                        SceneManager.ins.Back();
                        if(this.callback)
                            this.callback(shield);
                    };
                    break;
                }
                case "bg":{
                    previewPanel.initBg(pixels);
                    previewPanel.okCallback = (name)=>{
                        let path = Game.savePixels(pixels);
                        let bg = Game.newBgConf(name||"我的道具", path);
                        SceneManager.ins.Back();
                        if(this.callback)
                            this.callback(bg);
                    };
                    break;
                }

            }
        });
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

    beginTip(){
        let func = ()=>{
            TweenUtil.applyScaleBounce(this.tipLabel.node,1, 0.2, ()=>{
                this.tipLabel.string = Config.paintTips[Util.randomIdx(Config.paintTips.length)];
            })
        }
        this.schedule(func, 10);
        this.tipLabel.node.on(cc.Node.EventType.TOUCH_START, func, this);
    }

    private onTouchStart(event:cc.Event.EventTouch){
        if(!GameRecorder.recordering){
            GameRecorder.start(300);
        }
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
    drawHero(callback){
        this.graphics.init(512, 512);
        this.type = "hero";
        this.callback = callback;
    }
    drawMonster(callback){
        this.graphics.init(512, 512);
        this.type = "monster";
        this.callback = callback;
    }
    drawBg(callback){
        this.graphics.init(288, 512);
        this.type = "bg";
        this.beginTip();
        this.callback = callback;
    }
    drawShield(callback){
        this.graphics.init(128, 128);
        this.type = "shield";
        this.callback = callback;
    }
    drawHeart(callback){
        this.graphics.init(128, 128);
        this.type = "heart";
        this.callback = callback;
    }
}