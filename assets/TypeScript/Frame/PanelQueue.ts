// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Panel from "./Panel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PanelQueue extends cc.Component {
    private blockInput:cc.BlockInputEvents = null;        //阻止点击蒙版
    public queue:any[] = [];                 //检查函数队列
    private curPanel:Panel = null;              //正在显示的面板

    constructor(){
        super();
    }

    public pushPanel(panelName, callback=null, isQueueHead = false){
        let makePanelFunc = (succ, fail)=>{
            cc.loader.loadRes(`Panel/${panelName}`, (err, prefab) => {
                var newNode:cc.Node = cc.instantiate(prefab);
                newNode.name = panelName;
                newNode.position = cc.Vec2.ZERO;
                let panel = newNode.getComponent(Panel);
                if(panel){
                    if(callback) callback(panel);
                    succ(panel);
                }else{
                    fail();
                }
            });
        };
        this.pushFunc(makePanelFunc, isQueueHead);
    }
    //插入一个检查函数，可选插入队头或队尾
    public pushFunc(func, isQueueHead = false){
        if(isQueueHead){
            this.queue.unshift(func);
        }else{
            this.queue.push(func);
        }
    }
    
    //关闭当前面板，并检查是否有下一个面板
    public checkNext(){
        //关闭当前面板
        if(this.curPanel){
            if(this.curPanel.closeCallback){
                this.curPanel.closeCallback();
            }
            this.curPanel.node.destroy();
            this.curPanel = null;
        }

        //检查下一面板，
        let checkOne = ()=>{
            if(this.queue.length>0){
                this.node.active = true; 
                let makePanelFunc = this.queue.shift();
                makePanelFunc((panel)=>{
                    panel.panelQueue = this;
                    this.node.addChild(panel.node);
                    panel.openAnim();
                    this.curPanel = panel;
                },()=>{
                    checkOne();
                });
            }else{
                this.node.active = false;
            }
        }
        checkOne();
    }
}
