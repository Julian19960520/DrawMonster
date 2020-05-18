// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { MonsterConfig } from "../../Frame/dts";
import PiecewiseFunc from "../../Frame/PiecewiseFunc";
import { DB } from "../../Frame/DataBind";
import { Game } from "../../Game/Game";
import Monster from "./Monster";
import { Util } from "../../Frame/Util";
import ScreenRect from "../../Frame/ScreenRect";
import SceneManager from "../../Frame/SceneManager";
import PlayScene from "./PlayScene";
import { PoolManager } from "../../Frame/PoolManager";
import { PrefabPath } from "../../Frame/Config";
import { Key } from "../../Game/Key";



const {ccclass, property} = cc._decorator;

@ccclass
export default class FormationFactory extends cc.Component {

    private playing = false;
    private timer = 0;
    private formation:Formation = null;
    public play(){
        this.playing = true;
    }
    public pause(){
        this.playing = false;
        let viruses = this.node.getComponentsInChildren(Monster);
        for(let i=0; i<viruses.length; i++){
            viruses[i].pause();
        }
    }
    public resume(){
        this.playing = true;
        let viruses = this.node.getComponentsInChildren(Monster);
        for(let i=0; i<viruses.length; i++){
            viruses[i].resume();
        }
    }
    public clear(){
        for(let i=this.node.childrenCount-1;i>=0;i--){
            this.node.children[i].dispatchEvent(Util.customEvent("returnPool"));
        }
    }

    update(dt){ 
        dt *= Game.timeScale;
        this.timer += dt;
        if(this.timer > 5){
            this.timer = 0;
            this.formation = new Formation1();
        }
        if(this.formation){
            this.formation.update(dt);
        }
    }
    onCollisionExit(other:cc.Collider, self){
        if(other.node.group == "Monster"){
            other.node.dispatchEvent(Util.customEvent("returnPool"));
        }
    }
}


interface Formation{
    update(dt);
}

class Formation1 implements Formation{
    private monsterId = 0;
    private pos:cc.Vec2 = cc.Vec2.ZERO;
    private timer = 0;
    formationFactory:FormationFactory = null;

    update(dt){
        this.timer += dt;
        if(this.timer > 0.5){
            this.timer = 0;
            let monsterConf = Game.findMonsterConf(this.monsterId);
            let func = (vec)=>{
                let monsterNode:cc.Node = PoolManager.getInstance(PrefabPath.monster);
                this.formationFactory.node.addChild(monsterNode);
                monsterNode.position = this.pos;
                let monster = monsterNode.getComponent(Monster);
                monster.setData(monsterConf, vec, 1);
            }
            func(cc.Vec2.UP);
            func(cc.Vec2.RIGHT);
            func(-cc.Vec2.UP);
            func(-cc.Vec2.RIGHT);
        }
    }
}