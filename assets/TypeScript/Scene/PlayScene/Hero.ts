// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import { GameState } from "./PlayScene";
import { DB } from "../../Frame/DataBind";
import Shield from "./Shield";
import { Game } from "../../Game/Game";
import { Util } from "../../Frame/Util";
import { Sound } from "../../Frame/Sound";
import Monster from "./Monster";
import PhyObject from "./PhyObject";
import { Key } from "../../Game/Key";
import { Vibrate } from "../../Frame/Vibrate";

const {ccclass, property} = cc._decorator;

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

    hpMax = 1;
    dropV = cc.Vec2.ZERO;
    g = 1200;
    angleSpeed = 180;
    state:GameState = GameState.play;
    collider:cc.Collider = null;
    droping = false;
    onLoad(){
        this.anim = this.getComponent(cc.Animation);
        this.collider = this.getComponent(cc.CircleCollider);
        this.anim.play("idle");
        this.initHeart();
        this.shield.closeShield();
        this.shield.hero = this;
        this.Bind(Key.gameState,(state)=>{
            this.state = state;
            if(state == GameState.play){
                this.node.angle = 0;
                this.droping = false;
            }
        })
        this.Bind(Key.ThemeId,(themeId)=>{
            let theme = Game.findThemeConf(themeId);
            let hero = Game.findHeroConf(theme.heroId);
            Game.loadTexture(hero.url, (texture)=>{
                this.setTexture(texture);
                if(hero.id >= 1000){
                    this.sprite.node.scale = 0.6;
                }else{
                    this.sprite.node.scale = 1;
                }
            });
        });
    }
    update(dt){
        dt *= Game.timeScale; 
        switch(this.state){
            case GameState.play:
                if(this.droping){
                    this.dropV.y -= this.g*dt;
                    this.node.angle += dt*this.angleSpeed;
                    this.node.position = this.node.position.add(this.dropV.mul(dt));
                }
                break;
            case GameState.pause:
                break;
        }
    }
    initHeart(){
        let prefab = this.heartGroup.children[0];
        prefab.active = false;
        while(this.heartGroup.childrenCount<3){
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
        if(this.state!= GameState.play){
            return;
        }
        if(this.droping){
            return;
        }
        if(self != this.collider){
            return;
        }
        //碰到怪物，处理丢失道具 或 游戏结束
        if(other.node.group == "Monster"){
            let monster = other.node.getComponent(Monster);
            if(monster && monster.active && !this.shield.isInvincible()){
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
                        Vibrate.short();
                        break;
                    }
                }
                if(!find){
                    this.node.dispatchEvent(Util.customEvent("gameOver", true, {monsterName:monster.conf.name}));
                    let dir = this.node.x - other.node.x;
                    this.beginDrop(dir);
                    this.node.dispatchEvent(Util.customEvent("shakeScene", true, 1));
                    Vibrate.short();
                }
            }
        }
        //碰到道具，处理获得道具
        if(other.node.group == "Prop"){
            Vibrate.short();
            if(other.node.name == "Heart"){
                other.node.dispatchEvent(Util.customEvent("returnPool"));
                let find = false;
                for(let i=0;i<Game.getHeartMax(); i++){
                    let child = this.heartGroup.children[i];
                    if(!child.active){
                        find = true;
                        child.active = true;
                        Sound.play("gainProp");
                        break;
                    }
                }
                if(!find){
                    Sound.play("gainProp");
                    this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:5}));
                }
            }
            if(other.node.name == "Shield"){
                this.shield.openShield(Game.getShiledDuration());
                other.node.dispatchEvent(Util.customEvent("returnPool"));
                Sound.play("gainProp");
            }
            if(other.node.name == "CoinBag"){
                Sound.play("gainProp");
                let coin = Game.getCoinBagCoin();
                if(coin>0){
                    this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:coin}));
                }
                let diamond = Game.getCoinBagDiamond();
                if(diamond>0){
                    this.node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:diamond}));
                }
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
        this.droping = true;
        this.dropV = cc.v2( Util.randomInt(50, 100)*dir, Util.randomInt(200, 250));
    }
    public setHp(hp){
        for(let i=0;i<this.heartGroup.childrenCount; i++){
            let child = this.heartGroup.children[i];
            child.active = i<hp;
        }
    }
}
