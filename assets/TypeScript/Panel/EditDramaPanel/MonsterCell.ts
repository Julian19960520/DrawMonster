// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import ScrollList from "../../CustomUI/ScrollList";
import SceneManager from "../../Frame/SceneManager";
import PaintPanel from "../PaintPanel/PaintPanel";
import { DB } from "../../Frame/DataBind";
import { Game } from "../../Game/Game";
import { Sound } from "../../Frame/Sound";
import Top from "../../Frame/Top";
import { Local } from "../../Frame/Local";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MonsterCell extends cc.Component {
    @property(cc.Node)
    normalNode:cc.Node = null;
    @property(cc.Node)
    emptyNode:cc.Node = null;
    @property(cc.Sprite)
    monsterSprite:cc.Sprite = null;

    data = null
    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on("click", this.onClick, this);
    }
    setData(data){
        this.data = data;
        this.normalNode.active = !data.createNew;
        this.emptyNode.active = data.createNew;
        if(data.createNew){
            this.node.color = cc.color(171,226,175);
        }else{
            this.monsterSprite.node.active = false;
            Game.loadTexture(data.url,(texture)=>{
                this.monsterSprite.node.active = true;
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.monsterSprite.spriteFrame = frame;
            });

            let dramaId  = DB.Get("user/dramaId");
            let drama = Game.findDramaConf(dramaId);
            let idx = drama.monsterIds.indexOf(this.data.id);
            this.setUsingState(idx>=0);
        }
    }
    onClick(){
        Sound.play("clickBtn");
        let dramaId  = DB.Get("user/dramaId");
        let drama = Game.findDramaConf(dramaId);
        if(this.data.createNew){
            SceneManager.ins.OpenPanelByName("PaintPanel",(panel:PaintPanel)=>{
                panel.saveCallback = (path)=>{
                    let monster = Game.newMonsterConf(path);
                    drama.monsterIds.push(monster.id);
                    DB.Invoke("user/dramaId");
                    DB.Invoke("user/customMonsters");
                    Local.setDirty("user/customDramas");
                }
            });
        }else{
            let idx = drama.monsterIds.indexOf(this.data.id);
            if(idx>=0){
                drama.monsterIds.splice(idx, 1);
                this.setUsingState(false);
                DB.Invoke("user/dramaId");
                Local.setDirty("user/customDramas");
            }else{
                if(drama.monsterIds.length<5){
                    drama.monsterIds.push(this.data.id);
                    DB.Invoke("user/dramaId");
                    Local.setDirty("user/customDramas");
                    this.setUsingState(true);
                }else{
                    Top.showToast("最多选择5个");
                }
            }
        }
    }
    setUsingState(b){
        this.node.color = b?cc.color(237,245,142):cc.Color.WHITE;
    }
}
