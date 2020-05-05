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
    private block:cc.BlockInputEvents = null;

    onLoad(){
        Top.ins = this;
        this.node.width = ScreenRect.width;
        this.node.height = ScreenRect.height;
        this.block = this.getComponent(cc.BlockInputEvents);
        this.blockInput(false);
    }
    public blockInput(b){
        this.block.enabled = b;
    }
    public showToast(text:string){
        Util.instantPrefab("TopLayer/Toast").then((toast:cc.Node)=>{
            toast.getComponentInChildren(cc.Label).string = text;
            this.node.addChild(toast);
            toast.opacity = 0;
            toast.y = -20;
            cc.tween(toast)
                .to(0.1, {opacity:255,y:0} )
                .delay(1.5)
                .to(0.1, {opacity:0,y:20} )
                .call(()=>{
                    this.node.removeChild(toast);
                }
            ).start();
        });
    }
    public showFloatLabel(string , parent:cc.Node, offset){
        let pos:any = parent.convertToWorldSpaceAR(offset);
        pos = parent.convertToNodeSpaceAR(pos);
        let node = new cc.Node();
        let label = node.addComponent(cc.Label);
        parent.addChild(node);
        node.position = pos;
        label.string = string;
        label.fontSize = 25;
        cc.tween(node)
            .to(0.1, {y:node.y+5} )
            .delay(1.5)
            .to(0.1, {y:node.y+20, opacity:0} )
            .call(()=>{
                node.removeFromParent();
            }
        ).start();
        return label;
    }
    public bezierSprite(data:{url:string, from:cc.Vec2, to:cc.Vec2, callback?, cnt?:number, time?:number}){
        data.cnt = data.cnt || 1;
        data.time = data.time || 1;
        cc.loader.loadRes(data.url, cc.SpriteFrame, (err, sf)=>{
            for(let i=0; i<data.cnt; i++){
                setTimeout(() => {
                    let node = new cc.Node();
                    this.node.addChild(node);
                    let sprite = node.addComponent(cc.Sprite);
                    sprite.spriteFrame = sf;
                    let range = 200;
                    let ctrlPos = data.from.add(cc.v2(Util.randomInt(-range,range), Util.randomInt(-range,range)));
                    node.position = data.from;
                    node.runAction(cc.sequence(cc.bezierTo(data.time, [data.from, ctrlPos, data.to]), cc.callFunc(()=>{
                        node.removeFromParent();
                        if(data.callback){
                            data.callback(i==data.cnt-1)
                        }
                    })));
                }, i*50);                
            }
        });
    }
}
