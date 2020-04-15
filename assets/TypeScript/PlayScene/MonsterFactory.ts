// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { PoolManager } from "../CocosFrame/PoolManager";
import { Util } from "../CocosFrame/Util";
import ScreenRect from "../CocosFrame/ScreenRect";
import SceneManager from "../CocosFrame/SceneManager";
import PlayScene from "./PlayScene";
import { PrefabPath, Config } from "../CocosFrame/Config";
import Monster from "./Monster";
import { DB } from "../CocosFrame/DataBind";
import { Game } from "../Game";
import PiecewiseFunc from "../CocosFrame/PiecewiseFunc";
import { MonsterConfig } from "../CocosFrame/dts";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MonsterFactory extends cc.Component {

    private playing = false;
    private timer = 0;
    private ROF = 2;
    usingMonsters:MonsterConfig[] = [];

    private time = 0;
    rofFunc:PiecewiseFunc = null;
    sizeFunc:PiecewiseFunc = null;
    constructor(){
        super();
        this.rofFunc = new PiecewiseFunc([
            cc.v2(0, 2), 
            cc.v2(10,2.4),
            cc.v2(20,2.7),
            cc.v2(30,3),
            cc.v2(40,3.2),
            cc.v2(50,3.3),
            cc.v2(60,3.4),
            cc.v2(70,3.5),
            cc.v2(80,3.6),
        ]);
        this.sizeFunc = new PiecewiseFunc([
            cc.v2(0,  0.5), 
            cc.v2(0.5,0.8),
            cc.v2(0.8,1),
            cc.v2(1,  1.5),
        ]);
    }
    public play(){
        this.timer = 0;
        this.time = 0;
        this.playing = true;
        let dramaId  = DB.Get("user/dramaId");
        let drama = Game.findDramaConf(dramaId);
        let usingMonstersIds:number[] = drama.monsterIds;
        this.usingMonsters = [];
        usingMonstersIds.forEach((id)=>{
            let monster = Game.findMonsterConf(id);
            this.usingMonsters.push(monster);
        })
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
        if(!this.playing){
            return;
        }
        this.timer += dt;
        this.time += dt;
        this.ROF = this.rofFunc.getY(this.time);
        if(this.timer > 1/this.ROF){
            this.timer = 0;
            let idx = Util.randomIdx(this.usingMonsters.length);
            let monsterConf = this.usingMonsters[idx];
            //出生点坐标
            let x ,y;   
            let boxW = ScreenRect.width + 200;
            let boxH = ScreenRect.height + 200;
            if(Math.random() < boxW/(boxH+boxW)){
                x = Util.randomInt(-boxW/2, boxW/2);
                y = boxH/2 * (Math.random()>0.5?1:-1);
            }else{
                y = Util.randomInt(-boxH/2, boxH/2);
                x = boxW/2 * (Math.random()>0.5?1:-1);
            }
            //飞的方向
            let vec:cc.Vec2 = null;
            if(Math.random() > 0.7){
                let playScene = SceneManager.ins.findScene(PlayScene);
                vec = playScene.hero.node.position.sub(cc.v2(x,y));     //追主角
            }else{
                vec = cc.v2(Util.randomInt(-200,200), Util.randomInt(-200,200)).sub(cc.v2(x,y));        //追随机点
            }
            //缩放
            let scale = this.sizeFunc.getY(Math.random());
            //速度与缩放反比
            let speed = Util.randomInt(150,200);
            let velocity = vec.normalizeSelf().mulSelf(speed);
            velocity.mulSelf(1/scale);
            //创建Monster
            let monsterNode:cc.Node = PoolManager.getInstance(PrefabPath.monster);
            this.node.addChild(monsterNode);
            monsterNode.x = x;
            monsterNode.y = y;
            let monster = monsterNode.getComponent(Monster);
            monster.setData(monsterConf, velocity, scale);
        }
    }
    onCollisionExit(other:cc.Collider, self){
        if(other.node.group == "Monster"){
            other.node.dispatchEvent(Util.customEvent("returnPool"));
        }
    }
}
