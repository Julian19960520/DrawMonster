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
import { DB } from "../../Frame/DataBind";
import { Game } from "../../Game/Game";
import { Sound } from "../../Frame/Sound";
import { Local } from "../../Frame/Local";
import { Key } from "../../Game/Key";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UsingMonsterCell extends cc.Component {
    @property(cc.Sprite)
    monsterSprite:cc.Sprite = null;

    @property(cc.Sprite)
    checkMark:cc.Sprite = null;

    id = null
    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on("click", this.onClick, this);
    }
    setData(id){
        this.id = id;
        this.monsterSprite.node.active = id != 0;
        this.checkMark.node.active = id != 0;
        if(id == 0){
            cc.loader.loadRes("Atlas/UI/plusBtn",(err, texture)=>{
                // this.monsterSprite.spriteFrame.setTexture(texture);
            });
        }else{
            let monster = Game.findMonsterConf(id);
            Game.loadTexture(monster.url, (texture)=>{
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.monsterSprite.spriteFrame = frame;
            });
        }
    }
    onClick(){
        let themeId  = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        let idx = theme.monsterIds.indexOf(this.id);
        theme.monsterIds.splice(idx, 1);
        DB.SetLoacl(Key.ThemeId,themeId);
        DB.Invoke(Key.CustomMonsters);
        Local.setDirty(Key.CustomThemes);
    }
}
