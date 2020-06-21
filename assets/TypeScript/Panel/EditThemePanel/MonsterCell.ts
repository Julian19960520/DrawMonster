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
import { DB } from "../../Frame/DataBind";
import { Game } from "../../Game/Game";
import { Sound } from "../../Frame/Sound";
import Top from "../../Frame/Top";
import { Local } from "../../Frame/Local";
import { Key } from "../../Game/Key";
import PreviewPanel from "../PreviewPanel/PreviewPanel";
import { ThemeData, MonsterConfig } from "../../Frame/dts";
import { Config } from "../../Frame/Config";
import Button from "../../CustomUI/Button";
import MessageBox from "../../Frame/MessageBox";
import { Util } from "../../Frame/Util";
import { TweenUtil } from "../../Frame/TweenUtil";
import PaintScene from "../PaintPanel/PaintScene";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MonsterCell extends DB.DataBindComponent {
    @property(cc.Node)
    normalNode:cc.Node = null;
    @property(cc.Node)
    mark:cc.Node = null;
    @property(cc.Node)
    emptyNode:cc.Node = null;
    @property(cc.Sprite)
    monsterSprite:cc.Sprite = null;
    @property(Button)
    deleteBtn:Button = null;

    data:MonsterConfig = null
    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on("click", this.onClick, this);
        this.deleteBtn.node.on("click", this.onDeleteTap, this);
        this.showDeleteBtn(false);
        this.Bind(Key.editing, (editing)=>{
            let showDelete = editing && this.data && this.data.isCustom;
            this.showDeleteBtn(showDelete);
        });
    }
    showDeleteBtn(b){
        this.deleteBtn.node.active = b;
        if(b){
            TweenUtil.applyFloat(this.normalNode);
        }else{
            this.normalNode.stopAllActions();
            this.normalNode.x = 0;
            this.normalNode.y = 0;
            this.normalNode.angle = 0;
        }
    }
    setData(data:MonsterConfig){
        this.data = data;
        this.normalNode.active = !data["createNew"];
        this.emptyNode.active = data["createNew"];
        this.showDeleteBtn(DB.Get(Key.editing) && data.isCustom);
        if(!data["createNew"]){
            this.monsterSprite.spriteFrame = null;
            Game.loadTexture(data.url,(texture)=>{
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.monsterSprite.spriteFrame = frame;
            });

            let themeId  = DB.Get(Key.ThemeId);
            let theme = Game.findThemeConf(themeId);
            let idx = theme.monsterIds.indexOf(this.data.id);
            this.setUsingState(idx>=0);
        }
    }
    onClick(){
        let themeId  = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        if(this.data["createNew"]){
            this.openPaintPanel(theme);
        }else{
            let idx = theme.monsterIds.indexOf(this.data.id);
            if(idx>=0){
                theme.monsterIds.splice(idx, 1);
                this.setUsingState(false);
                DB.Invoke(Key.ThemeId);
                Local.setDirty(Key.CustomThemes);
            }else{
                if(theme.monsterIds.length<5){
                    theme.monsterIds.push(this.data.id);
                    DB.Invoke(Key.ThemeId);
                    Local.setDirty(Key.CustomThemes);
                    this.setUsingState(true);
                }else{
                    Top.showToast("最多选择5个");
                }
            }
        }
    }

    openPaintPanel(theme:ThemeData){
        DB.Set(Key.guideUnlockPaint, true);
        SceneManager.ins.Enter("PaintScene").then((paintScene:PaintScene)=>{
            paintScene.draMonster((monster)=>{
                if(theme.monsterIds.length<5){
                    theme.monsterIds.push(monster.id);
                }else{
                    Top.showToast("最多选择5个");
                }
                DB.Invoke(Key.ThemeId);
                DB.Invoke(Key.CustomMonsters);
            });
        });
    }
    setUsingState(b){
        this.normalNode.color = b?cc.color(237,245,142):cc.Color.WHITE;
        this.mark.active = b;
    }
    onDeleteTap(){
        SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
            messageBox.label.string = "是否删除该怪物？";
            messageBox.onOk = ()=>{
                let monster = this.data;
                for(let i=0;i<Game.allThemes.length;i++){
                    let theme = Game.allThemes[i];
                    let idx = theme.monsterIds.indexOf(monster.id);
                    if(idx >= 0){
                        theme.monsterIds.splice(idx, 1);
                    }
                }
                DB.Invoke(Key.ThemeId);
                Game.deleteTexture(monster.url);
                Game.deleteMonsterConf(monster.id);
                Top.showToast("怪物已删除");
                
            }
        });
    }
}
