// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { Util } from "../CocosFrame/Util";
import { Game } from "../Game";
import { Sound } from "../CocosFrame/Sound";
import { MonsterConfig } from "../CocosFrame/dts";
import { PoolManager } from "../CocosFrame/PoolManager";
import { DirType } from "../CocosFrame/Config";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Monster extends cc.Component {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;
    conf:MonsterConfig = null;
    velocity:cc.Vec2 = null;
    anima:cc.Animation = null;
    angleSpeed = 180;
    g = 0;
    droping = false;
    active = true;
    playing = false;

    circleCollider:cc.CircleCollider = null;
    boxCollider:cc.BoxCollider =  null;
    onLoad(){
        this.anima = this.getComponent(cc.Animation);
        this.node.on("outPool", this.onOutPool, this);
        this.node.on("returnPool", this.onReturnPool, this);
        this.onOutPool();
        this.circleCollider = this.node.getComponent(cc.CircleCollider);
        this.boxCollider = this.node.getComponent(cc.BoxCollider);
    }
    onOutPool(){
        this.droping = false;
        this.g = 0;
        this.active = true;
        this.playing = true;
    };
    onReturnPool(){}

    public pause(){
        this.playing = false;
    }
    public resume(){
        this.playing = true;
    }
    update (dt) {
        dt *= Game.timeScale; 
        if(!this.playing){
            return;
        }
        if(this.droping){
            this.updateDrop(dt);
            return;
        }
        if(this.velocity){
            this.node.position = this.node.position.add(this.velocity.mul(dt));
        }
        if(this.conf){
            let conf = this.conf;
            switch(conf.dirType){
                case DirType.Rotate:{
                    this.node.angle += dt*this.angleSpeed;
                    break;
                }
            }
        }
    }
    beginDrop(){
        this.droping = true;
        this.velocity = cc.v2( Util.randomInt(-100, 100), Util.randomInt(300, 500));
        this.g = 1200;
        this.active = false;
        Sound.play("hit");
    }
    updateDrop(dt){
        if(this.velocity){
            this.velocity.y -= this.g*dt;
            this.node.angle += dt*180;
            this.node.position = this.node.position.add(this.velocity.mul(dt));
        }
    }

    setTexture(texture){
        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        this.sprite.spriteFrame = spriteFrame;
    }
    playAnima(name){
        if(this.anima){
            this.anima.play(name);
        }
    }
    setData(conf:MonsterConfig, velocity:cc.Vec2, scale:number){
        this.conf = conf;
        if(conf.isUserPainting){
            this.sprite.node.scale = 0.45;
        }else{
            this.sprite.node.scale = 1;
        }
        Game.loadTexture(conf.url, (texture)=>{
            this.setTexture(texture);
        });  
        this.velocity = velocity;
        if(conf.angleSpeedRange){
            let idx = Util.randomIdx(conf.angleSpeedRange.length);
            let range = conf.angleSpeedRange[idx];
            this.angleSpeed = Util.randomInt(range[0], range[1]);
        }else{
            this.angleSpeed = 0;
        }
        
        this.playAnima("action2");
        //碰撞器大小
        this.boxCollider.enabled = (conf.box!=null);
        this.circleCollider.enabled = (conf.circle!=null);
        if(conf.box){
            this.boxCollider.offset = conf.box.offset || cc.Vec2.ZERO;
            this.boxCollider.size = conf.box.size || cc.Size.ZERO;
        }
        if(conf.circle){
            this.circleCollider.offset = conf.circle.offset || cc.Vec2.ZERO;
            this.circleCollider.radius = conf.circle.radius || 0;
        }
        //缩放与角度
        this.node.angle = 0;
        switch(conf.dirType){
            case DirType.Forwards:{
                this.node.scaleX = scale;
                let angle = Util.angle(velocity);
                if(angle>90 && angle <270){
                    this.node.scaleY = -scale;
                }else{
                    this.node.scaleY = scale;
                }
                this.node.angle = angle;
                break;
            }
            case DirType.HorFlip:{
                this.node.scaleX = this.node.x>0 ? -scale : scale;
                this.node.scaleY = scale;
                break;
            }
            case DirType.Rotate:{
                this.node.scale = scale;
                break;
            }
            case DirType.Upward:{
                this.node.scale = scale;
            }
        }
    }
}
