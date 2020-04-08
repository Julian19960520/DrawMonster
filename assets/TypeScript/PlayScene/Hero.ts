// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { DB } from "../CocosFrame/DataBind";
import Monster from "./Monster";
import { Util } from "../CocosFrame/Util";
import PhyObject from "./PhyObject";
import { Game } from "../Game";
import { TweenUtil } from "../CocosFrame/TweenUtil";
import SceneManager from "../CocosFrame/SceneManager";
import PlayScene from "./PlayScene";

const {ccclass, property} = cc._decorator;

export enum State{
    active,
    drop,
    pause,
}
@ccclass
export default class Hero extends DB.DataBindComponent {
    @property(cc.Sprite)
    sprite:cc.Sprite = null;
    @property(cc.Node)
    flipGroup:cc.Node = null;

    anim:cc.Animation = null;

    @property(cc.Node)
    heartGroup:cc.Node = null;
    @property(cc.Node)
    shield:cc.Node = null;
    @property(cc.Label)
    shieldLabel:cc.Label = null;
    shieldTime = 0;
    hpMax = 1;
    dropV = cc.Vec2.ZERO;
    g = 1200;
    angleSpeed = 180;
    state:State = State.active;
    onLoad(){
        this.anim = this.getComponent(cc.Animation);
        this.anim.play("idle");
        this.Bind("user/hpMax",(hpMax)=>{
            this.hpMax = hpMax;
        })
        this.initHeart();
        this.shieldTime = 0;
        this.shield.active = false;
        this.Bind("user/usingHeroId",(usingHeroId)=>{
            let hero = Game.findHeroConf(usingHeroId);
            Game.loadTexture(hero.url, (texture)=>{
                this.setTexture(texture);
            });
        });
    }
    setState(state:State){
        this.state = state;
        if(state == State.active){
            this.node.angle = 0;
        }
    }
    update(dt){
        dt *= Game.timeScale; 
        if(this.state != State.pause){
            if(this.shieldTime>=0){
                this.shieldTime -= dt;
                this.shieldLabel.string = `${Util.fixedNum(this.shieldTime,1)}`;
                if(this.shieldTime<0 && this.shield.active){
                    this.shield.active = false;
                    this.playDropSprite(this.shield.getComponent(cc.Sprite).spriteFrame);
                }
            }
        }
        switch(this.state){
            case State.pause:

            case State.active:
                
                break;
            case State.drop:
                this.dropV.y -= this.g*dt;
                this.node.angle += dt*this.angleSpeed;
                this.node.position = this.node.position.add(this.dropV.mul(dt));
                break;
        }
    }
    initHeart(){
        let prefab = this.heartGroup.children[0];
        prefab.active = false;
        for(let i=0;i<5;i++){
            let child = cc.instantiate(prefab);
            this.heartGroup.addChild(child);
        }
    }

    setTexture(texture){
        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        this.sprite.spriteFrame = spriteFrame;
    }
    flipX(scaleX){
        this.flipGroup.scaleX = scaleX;
    }
    onCollisionEnter(other:cc.Collider, self){
        if(this.state!= State.active){
            return;
        }
        //碰到怪物，处理丢失道具 或 游戏结束
        if(other.node.group == "Monster"){
            let monster = other.node.getComponent(Monster);
            if(monster && monster.active){
                if(this.shield.active){
                    monster.active = false;
                    monster.beginDrop();
                    return;
                }
                let find = false;
                for(let i=0;i<this.heartGroup.childrenCount; i++){
                    let child = this.heartGroup.children[i];
                    if(child.active){
                        child.active = false;
                        find = true;
                        monster.active = false;
                        monster.beginDrop();
                        this.playDropSprite(child.getComponent(cc.Sprite).spriteFrame, 0.5);
                        this.node.dispatchEvent(Util.customEvent("shakeScene", true));
                        break;
                    }
                }
                if(!find){
                    this.node.dispatchEvent(Util.customEvent("gameOver", true));
                    let dir = this.node.x - other.node.x;
                    this.beginDrop(dir);
                    this.node.dispatchEvent(Util.customEvent("shakeScene", true));
                }
            }
        }
        //碰到道具，处理获得道具
        if(other.node.group == "Prop"){
            if(other.node.name == "Heart"){
                for(let i=0;i<this.heartGroup.childrenCount; i++){
                    let child = this.heartGroup.children[i];
                    if(!child.active){
                        child.active = true;
                        other.node.dispatchEvent(Util.customEvent("returnPool"));
                        break;
                    }
                }
            }
            if(other.node.name == "Shield"){
                this.shieldTime = 5;
                this.shield.active = true;
                other.node.dispatchEvent(Util.customEvent("returnPool"));
            }
        }
    }
    public playDropSprite(spriteFrame, scale = 1){
        let node = new cc.Node();
        node.scale = scale;
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        this.node.parent.addChild(node);
        node.position = this.node.position;
        let phyObject = node.addComponent(PhyObject);
        phyObject.velocity = cc.v2( Util.randomInt(-100, 100), Util.randomInt(300, 500));
        phyObject.g = 1200;
        setTimeout(() => {
            node.removeFromParent();
        }, 3000);
    }
    beginDrop(dir){
        dir = Util.sign(dir);
        this.state = State.drop;
        this.dropV = cc.v2( Util.randomInt(50, 100)*dir, Util.randomInt(200, 250));
    }
}
