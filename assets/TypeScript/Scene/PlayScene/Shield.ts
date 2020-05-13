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
import PlayScene from "./PlayScene";
import { Sound } from "../../Frame/Sound";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Shield extends cc.Component {
    beginAnim(){
        this.getComponent(cc.Animation).play("shield");
    }
    endAnim(){
        this.getComponent(cc.Animation).stop();
    }
    onCollisionEnter(other:cc.Collider, self){
        if(other.node.group == "Monster"){
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
