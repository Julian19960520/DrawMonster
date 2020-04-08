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
import { AudioManager } from "../../CocosFrame/AudioManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MonsterCell extends cc.Component {
    @property(cc.Node)
    normalNode:cc.Node = null;
    @property(cc.Node)
    emptyNode:cc.Node = null;
    @property(cc.Sprite)
    monsterSprite:cc.Sprite = null;
    @property(cc.Label)
    nameLabel:cc.Label = null;

    @property(Toggle)
    toggle:Toggle = null;

    data = null
    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on("click", this.onClick, this);
        this.toggle.node.on(Toggle.STATE_CHANGE, this.onStateChange, this);
    }
    setData(data){
        this.data = data;
        this.normalNode.active = !data.createNew;
        this.emptyNode.active = data.createNew;
        if(data.createNew){
            this.node.color = cc.color(171,226,175);
        }else{
            this.node.color = cc.Color.WHITE;
            Game.loadTexture(data.url,(texture)=>{
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.monsterSprite.spriteFrame = frame;
            });
            this.nameLabel.string = data.name;
            let ids:number[] = DB.Get("user/usingMonsterIds");
            this.toggle.isChecked = ids.indexOf(this.data.id)>=0;
        }
    }
    onClick(){
        AudioManager.playSound("clickBtn");
        if(this.data.createNew){
            SceneManager.ins.OpenPanelByName("PaintPanel",(panel:PaintPanel)=>{
                panel.saveCallback = (path)=>{
                    let monster = Game.newMonsterConf("角色", path);
                    let usingMonster:number[] = DB.Get("user/usingMonsterIds");
                    usingMonster.push(monster.id);
                    DB.SetLoacl("user/usingMonsterIds", usingMonster);
                }
            });
        }
    }
    onStateChange(b, click){
        if(click){
            let usingMonster:number[] = DB.Get("user/usingMonsterIds");
            if(b && usingMonster.indexOf(this.data.id) <0){
                usingMonster.push(this.data.id);
            }
            if(!b && usingMonster.indexOf(this.data.id)>=0){
                let idx = usingMonster.indexOf(this.data.id);
                usingMonster.splice(idx, 1);
            }
            DB.SetLoacl("user/usingMonsterIds", usingMonster);
        }
    }
}
