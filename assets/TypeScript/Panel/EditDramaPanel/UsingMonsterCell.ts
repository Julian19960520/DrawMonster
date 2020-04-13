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
import { Util } from "../../CocosFrame/Util";
import Toggle from "../../CustomUI/Toggle";
import SceneManager from "../../CocosFrame/SceneManager";
import PaintPanel from "../PaintPanel/PaintPanel";
import { DB } from "../../CocosFrame/DataBind";
import { Game } from "../../Game";
import { Sound } from "../../CocosFrame/Sound";
import { Local } from "../../CocosFrame/Local";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UsingMonsterCell extends cc.Component {
    @property(cc.Sprite)
    monsterSprite:cc.Sprite = null;

    @property(cc.Sprite)
    checkMark:cc.Sprite = null;

    @property(cc.Label)
    emptyLabel:cc.Label = null;

    data = null
    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on("click", this.onClick, this);
    }
    setData(data){
        this.data = data;
        let monsterId = data.id;
        this.monsterSprite.node.active = monsterId != 0;
        this.checkMark.node.active = monsterId != 0;
        this.emptyLabel.node.active = monsterId == 0;
        
        if(data.id == 0){
            cc.loader.loadRes("Atlas/UI/plusBtn",(err, texture)=>{
                // this.monsterSprite.spriteFrame.setTexture(texture);
            });
        }else{
            let monster = Game.findMonsterConf(monsterId);
            Game.loadTexture(monster.url, (texture)=>{
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.monsterSprite.spriteFrame = frame;
            });
        }
    }
    onClick(){
        Sound.play("clickBtn");
        let dramaId  = DB.Get("user/dramaId");
        let drama = Game.findDramaConf(dramaId);
        let idx = drama.monsterIds.indexOf(this.data.id);
        drama.monsterIds.splice(idx, 1);
        DB.SetLoacl("user/dramaId",dramaId);
        DB.Invoke("user/customMonsters");
        Local.setDirty("user/customDramas");
    }
}
