// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import PlayScene from "./PlayScene";
import { DB } from "../../Frame/DataBind";
import Shield from "./Shield";
import { Game } from "../../Game/Game";
import { Util } from "../../Frame/Util";
import { Sound } from "../../Frame/Sound";
import Monster from "./Monster";
import SceneManager from "../../Frame/SceneManager";
import Top from "../../Frame/Top";
import PhyObject from "./PhyObject";
import { crossPlatform } from "../../Frame/CrossPlatform";

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
    @property(Shield)
    shield:Shield = null;
    @property(cc.Label)
    shieldLabel:cc.Label = null;
    
    isInvincible = false;
    shieldTime = 0;
    hpMax = 1;
    dropV = cc.Vec2.ZERO;
    g = 1200;
    angleSpeed = 180;
    state:State = State.active;
    collider:cc.Collider = null;
    onLoad(){
        this.anim = this.getComponent(cc.Animation);
        this.collider = this.getComponent(cc.CircleCollider);
        this.anim.play("idle");
        this.Bind("user/hpMax",(hpMax)=>{
            this.hpMax = hpMax;
        })
        this.initHeart();
        this.closeShield();
        this.shieldTime = 0;
        this.Bind("user/dramaId",(dramaId)=>{
            let drama = Game.findDramaConf(dramaId);
            let hero = Game.findHeroConf(drama.heroId);
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
                if(this.shieldTime<0 && this.shield.node.active){
                    this.closeShield();
                    this.playDropSprite(this.shield.getComponent(cc.Sprite).spriteFrame);
                    Sound.play("dorpShield");
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
        for(let i=0;i<2;i++){
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
        if(self != this.collider){
            return;
        }
        //碰到怪物，处理丢失道具 或 游戏结束
        if(other.node.group == "Monster"){
            let monster = other.node.getComponent(Monster);
            if(monster && monster.active && !this.isInvincible){
                let find = false;
                for(let i=0;i<this.heartGroup.childrenCount; i++){
                    let child = this.heartGroup.children[i];
                    if(child.active){
                        child.active = false;
                        find = true;
                        monster.active = false;
                        monster.beginDrop();
                        this.playDropSprite(child.getComponent(cc.Sprite).spriteFrame, 0.5);
                        this.node.dispatchEvent(Util.customEvent("shakeScene", true, 1));
                        Sound.play("dorpHeart");
                        crossPlatform.vibrateShort();
                        break;
                    }
                }
                if(!find){
                    this.node.dispatchEvent(Util.customEvent("gameOver", true, {monsterName:monster.conf.name}));
                    let dir = this.node.x - other.node.x;
                    this.beginDrop(dir);
                    this.node.dispatchEvent(Util.customEvent("shakeScene", true, 1));
                    crossPlatform.vibrateLong();
                }
            }
        }
        //碰到道具，处理获得道具
        if(other.node.group == "Prop"){
            crossPlatform.vibrateShort();
            if(other.node.name == "Heart"){
                let find = false;
                for(let i=0;i<this.heartGroup.childrenCount; i++){
                    let child = this.heartGroup.children[i];
                    if(!child.active){
                        find = true;
                        child.active = true;
                        other.node.dispatchEvent(Util.customEvent("returnPool"));
                        Sound.play("gainProp");
                        break;
                    }
                }
                if(!find){
                    
                }
            }
            if(other.node.name == "Shield"){
                this.openShield(3);
                other.node.dispatchEvent(Util.customEvent("returnPool"));
                Sound.play("gainProp");
            }
            if(other.node.name == "CoinBag"){
                Sound.play("gainProp");
                let playScene = SceneManager.ins.findScene(PlayScene);
                Top.bezierSprite({
                    url:"Atlas/UI/coin",
                    from:Util.convertPosition(this.node, Top.node),
                    to:Util.convertPosition(playScene.coinBar.iconPos, Top.node),
                    cnt:5,
                    time:0.8,
                    onEnd:(finish)=>{
                        Sound.play("gainCoin");
                        let coin = DB.Get("user/coin");
                        DB.SetLoacl("user/coin", coin+50);
                    }
                });
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
    public openShield(time){
        // this.collider.enabled = false;
        this.isInvincible = true;
        this.shieldTime = time;
        this.shield.node.active = true;
        this.shield.beginAnim();
    }
    public closeShield(){
        this.shield.endAnim();
        // this.collider.enabled = true;
        this.isInvincible = false;
        this.shield.node.active = false;
    }
}
