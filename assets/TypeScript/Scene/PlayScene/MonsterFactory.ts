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
            cc.v2(0,2.4), 
            cc.v2(5,2.4),
            cc.v2(7,2),

            cc.v2(10,2.8),
            cc.v2(12,2.4),

            cc.v2(15,3.2),
            cc.v2(17,2.8),

            cc.v2(20,3.6),
            cc.v2(22,3.2),

            cc.v2(25,4.0),
            cc.v2(27,3.6),

            cc.v2(30,4.4),
            cc.v2(32,4.0),

            cc.v2(35,4.8),
            cc.v2(37,4.4),

            cc.v2(40,5.2),
            cc.v2(42,4.8),

            cc.v2(45,5.6),
            cc.v2(47,4.2),

            cc.v2(50,6.0),
            cc.v2(52,5.6),

            cc.v2(55,6.4),
            cc.v2(57,6.0),

            cc.v2(60, 8),
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
        let themeId  = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        let usingMonstersIds:any[] = theme.monsterIds;
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
