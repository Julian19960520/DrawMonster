import { Util } from "./Util";
import ScreenRect from "./ScreenRect";
import { DB } from "./DataBind";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
@ccclass
export default class Top extends DB.DataBindComponent {
    static ins:Top = null;
    static node:cc.Node = null;
    private block:cc.BlockInputEvents = null;

    onLoad(){
        Top.ins = this;
        Top.node = this.node;
        this.node.width = ScreenRect.width;
        this.node.height = ScreenRect.height;
        this.block = this.getComponent(cc.BlockInputEvents);
        Top.blockInput(false);
    }
    public static blockInput(b){
        Top.ins.block.enabled = b;
    }
    public static showToast(text:string){
        Util.instantPrefab("TopLayer/Toast").then((toast:cc.Node)=>{
            toast.getComponentInChildren(cc.Label).string = text;
            Top.ins.node.addChild(toast);
            toast.opacity = 0;
            toast.y = -20;
            cc.tween(toast)
                .to(0.1, {opacity:255,y:0} )
                .delay(1.5)
                .to(0.1, {opacity:0,y:20} )
                .call(()=>{
                    Top.ins.node.removeChild(toast);
                }
            ).start();
        });
    }
    public static showFloatLabel(string , parent:cc.Node, style:{
            offset?, 
            color?,
            stroke?,
            strokeColor?,
            fontSize?,
            duration?,
        }){
        let pos:any = parent.convertToWorldSpaceAR(style.offset || cc.Vec2.ZERO);
        pos = parent.convertToNodeSpaceAR(pos);
        let node = new cc.Node();
        let label = node.addComponent(cc.Label);
        parent.addChild(node);
        node.position = pos;
        label.string = string;
        label.fontSize = style.fontSize || 25;
        label.node.color = style.color || cc.Color.BLACK;
        if(style.stroke){
            let outLine = node.addComponent(cc.LabelOutline);
            outLine.color = style.strokeColor || cc.Color.BLACK;
            outLine.width = style.stroke;
        }
        cc.tween(node)
            .to(0.1, {y:node.y+5} )
            .delay(style.duration || 1.5)
            .to(0.1, {y:node.y+20, opacity:0} )
            .call(()=>{
                node.removeFromParent();
            }
        ).start();
        return label;
    }
    public static bezierSprite(data:{url:string, from:cc.Vec2, to:cc.Vec2, onBegin?, onEnd?, cnt?:number, time?:number, scale?:number}){
        data.cnt = data.cnt || 1;
        data.time = data.time || 1;
        data.scale = data.scale || 1;
        cc.loader.loadRes(data.url, cc.SpriteFrame, (err, sf)=>{
            for(let i=0; i<data.cnt; i++){
                setTimeout(() => {
                    let node = new cc.Node();
                    node.scale = data.scale;
                    Top.ins.node.addChild(node);
                    let sprite = node.addComponent(cc.Sprite);
                    sprite.spriteFrame = sf;
                    let range = 200;
                    let ctrlPos = data.from.add(cc.v2(Util.randomInt(-range,range), Util.randomInt(-range,range)));
                    node.position = data.from;
                    if(data.onBegin){
                        data.onBegin(i==data.cnt-1)
                    }
                    node.runAction(cc.sequence(cc.bezierTo(data.time, [data.from, ctrlPos, data.to]), cc.callFunc(()=>{
                        node.removeFromParent();
                        if(data.onEnd){
                            data.onEnd(i==data.cnt-1)
                        }
                    })));
                }, i*50);                
            }
        });
    }
}
