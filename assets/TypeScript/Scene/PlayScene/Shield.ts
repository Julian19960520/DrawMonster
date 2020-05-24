// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Monster from "./Monster";
import { Util } from "../../Frame/Util";
import { crossPlatform } from "../../Frame/CrossPlatform";
import { Vibrate } from "../../Frame/Vibrate";
import Top from "../../Frame/Top";
import SceneManager from "../../Frame/SceneManager";
import PlayScene, { GameState } from "./PlayScene";
import { Sound } from "../../Frame/Sound";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { Game } from "../../Game/Game";
import PhyObject from "./PhyObject";
import Hero from "./Hero";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Shield extends DB.DataBindComponent {
    state:GameState = GameState.play;
    shieldTime = 0;
    @property(cc.Label)
    label:cc.Label = null;
    @property(cc.Sprite)
    sprite:cc.Sprite = null;
    
    hero:Hero = null;
    _isInvincible = false;
    onLoad(){
        this.shieldTime = 0;
        this.Bind(Key.gameState,(state)=>{
            this.state = state;
        })
    }
    update(dt){
        dt *= Game.timeScale; 
        switch(this.state){
            case GameState.play:
                if(this.shieldTime>=0){
                    this.shieldTime -= dt;
                    this.label.string = `${Util.fixedNum(this.shieldTime,1)}`;
                    let show;
                    if(this.shieldTime > 1){
                        show = true;
                    }else{  
                        show = Math.floor(this.shieldTime * 10) % 2 == 0;
                    }
                    this.sprite.node.active = show;
                    if(this.shieldTime<0 && this._isInvincible){
                        this.closeShield();
                        Sound.play("dorpShield");
                        this.hero.playDropSprite(this.sprite.spriteFrame, 0.5);
                    }
                }
        }
    }
    
    openShield(time){
        this.shieldTime = time;
        this._isInvincible = true;
        this.sprite.node.active = true;
        this.label.node.active = true;
        this.getComponent(cc.Animation).play("shield");
        let size = Game.getShiledSize();
        this.sprite.node.width = this.sprite.node.height = size*2;
        this.getComponent(cc.CircleCollider).radius = size;
    }

    closeShield(){
        this._isInvincible = false;
        this.getComponent(cc.Animation).stop();
        this.sprite.node.active = false;
        this.label.node.active = false;
    }
    public isInvincible(){
        return this._isInvincible;
    }
    onCollisionEnter(other:cc.Collider){
        if(other.node.group == "Monster" && this.shieldTime > 0){
            let monster = other.node.getComponent(Monster);
            if(monster && monster.active){
                monster.active = false;
                monster.beginDrop();
                this.node.dispatchEvent(Util.customEvent("shakeScene", true, 0.5));
                Vibrate.short();
            }
        }
    }
}
