import { Util } from "../../Frame/Util";import { Game } from "../../Game/Game";import { PoolManager } from "../../Frame/PoolManager";import { PrefabPath } from "../../Frame/Config";import Prop from "./Prop";import ScreenRect from "../../Frame/ScreenRect";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PropFactory extends cc.Component {

    private playing = false;
    private timer = 0;
    private interval = 4;

    public begin(){
        this.timer = 0;
        this.playing = true;
    }
    public pause(){
        this.playing = false;
    }
    public resume(){
        this.playing = true;
    }
    public clear(){
        for(let i=this.node.childrenCount-1;i>=0;i--){
            this.node.children[i].dispatchEvent(Util.customEvent("returnPool",false));
        }
    }

    update(dt){
        dt *= Game.timeScale;
        if(!this.playing){
            return;
        }
        this.timer += dt;
        if(this.timer > this.interval){
            this.timer = 0;
            this.generateProp(Util.randomInt(1, 3));
        }
    }
    generateProp(type){
        let node:cc.Node = null;
        type = 1;
        switch(type){
            case 1:{
                node = PoolManager.getInstance(PrefabPath.shield);
                break;
            }
            case 2:{
                node = PoolManager.getInstance(PrefabPath.heart);
                break;
            }
            case 3:{
                node = PoolManager.getInstance(PrefabPath.coinBag);
                break;
            }
            // case 4:{
            //     node = PoolManager.getInstance(PrefabPath.clock);
            //     break;
            // }
        }
        this.node.addChild(node);
        let prop = node.getComponent(Prop);
        prop.node.x = Util.randomInt(-ScreenRect.width/2, ScreenRect.width/2);
        prop.node.y = -ScreenRect.height/2;
        let vx = Util.randomInt(50, 80) * (prop.node.x>0 ? -1:1);
        let vy = Util.randomInt(800, 1200);
        prop.velocity = cc.v2(vx, vy);
    }
    onCollisionExit(other:cc.Collider, self){
        if(other.node.group == "Prop"){
            other.node.dispatchEvent(Util.customEvent("returnPool",false));
        }
    }
}
