import ScrollList from "../../CustomUI/ScrollList";
import SceneManager from "../../Frame/SceneManager";
import { DB } from "../../Frame/DataBind";
import { Game } from "../../Game/Game";
import Top from "../../Frame/Top";
import { Local } from "../../Frame/Local";
import { Key } from "../../Game/Key";
import { ThemeData, MonsterConfig } from "../../Frame/dts";
import Button from "../../CustomUI/Button";
import MessageBox from "../../Frame/MessageBox";
import { TweenUtil } from "../../Frame/TweenUtil";
import PaintScene from "../PaintPanel/PaintScene";
import { Util } from "../../Frame/Util";

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
            Game.loadTexture(data.url,"monster",(texture)=>{
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
                DB.Set(Key.CustomMonsters, DB.Get(Key.CustomMonsters));
                this.node.dispatchEvent(Util.customEvent("updateMonster", true));
            }else{
                if(theme.monsterIds.length<5){
                    theme.monsterIds.push(this.data.id);
                    this.setUsingState(true);
                    DB.Set(Key.CustomMonsters, DB.Get(Key.CustomMonsters));
                    this.node.dispatchEvent(Util.customEvent("updateMonster", true));
                }else{
                    Top.showToast("最多选择5个");
                }
            }
        }
    }

    openPaintPanel(theme:ThemeData){
        DB.Set(Key.guideUnlockPaint, true);
        SceneManager.ins.Enter("PaintScene").then((paintScene:PaintScene)=>{
            paintScene.drawMonster((monster)=>{
                if(theme.monsterIds.length<5){
                    theme.monsterIds.push(monster.id);
                }else{
                    Top.showToast("最多选择5个");
                }
                DB.Set(Key.CustomMonsters, DB.Get(Key.CustomMonsters));
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
                Game.deleteTexture(monster.url);
                Game.deleteMonsterConf(monster.id);
                this.node.dispatchEvent(Util.customEvent("updateMonster", true));
                Top.showToast("怪物已删除"); 
            }
        });
    }
}
