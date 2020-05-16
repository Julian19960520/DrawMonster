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


const {ccclass, property} = cc._decorator;

@ccclass
export default class Shield extends DB.DataBindComponent {
    state:GameState = GameState.play;
    shieldTime = 0;
    @property(cc.Label)
    label:cc.Label = null;
    @property(cc.Sprite)
    sprite:cc.Sprite = null;

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
                //加5金币
                let playScene = SceneManager.ins.findScene(PlayScene);
                Top.bezierSprite({
                    url:"Atlas/UI/coin",
                    from:Util.convertPosition(this.node, Top.node),
                    to:Util.convertPosition(playScene.coinBar.iconPos, Top.node),
                    cnt:1,
                    time:0.8,
                    scale:0.6,
                    onEnd:(finish)=>{
                        Sound.play("gainCoin");
                        let coin = DB.Get(Key.Coin);
                        DB.SetLoacl(Key.Coin, coin+5);
                    }
                });
            }
        }
    }
}
