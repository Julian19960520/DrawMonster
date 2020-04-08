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
export default class HeroCell extends cc.Component {
    @property(cc.Node)
    normalNode:cc.Node = null;
    @property(cc.Node)
    emptyNode:cc.Node = null;
    @property(cc.Sprite)
    monsterSprite:cc.Sprite = null;
    @property(cc.Label)
    nameLabel:cc.Label = null;

    @property(cc.Node)
    youMark:cc.Node = null;


    data = null
    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on(ScrollList.STATE_CHANGE, this.onSelect, this);
        this.node.on("click", this.onClick, this);
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
        }
    }
    onClick(){
        AudioManager.playSound("clickBtn");
        if(this.data.createNew){
            SceneManager.ins.OpenPanelByName("PaintPanel",(panel:PaintPanel)=>{
                panel.saveCallback = (path)=>{
                    let hero = Game.newHeroConf("角色", path);
                    DB.SetLoacl("user/usingHeroId", hero.id);
                }
            });
        }
    }
    onSelect(b){
        this.youMark.active = b;
    }
    canSelect(){
        if(this.data && this.data.createNew){
            return false;
        }else{
            return true;
        }
    }
}
