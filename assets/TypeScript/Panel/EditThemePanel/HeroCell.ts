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
import { ThemeData, HeroConfig } from "../../Frame/dts";
import { Config } from "../../Frame/Config";
import Button from "../../CustomUI/Button";
import MessageBox from "../../Frame/MessageBox";
import { Util } from "../../Frame/Util";
import { TweenUtil } from "../../Frame/TweenUtil";
import PaintScene from "../PaintPanel/PaintScene";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HeroCell extends DB.DataBindComponent {
    @property(cc.Node)
    animNode:cc.Node = null;
    @property(cc.Sprite)
    sprite:cc.Sprite = null;
    @property(Button)
    deleteBtn:Button = null;

    data:HeroConfig = null
    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.deleteBtn.node.on("click", this.onDeleteTap, this);
        this.showDeleteBtn(false);
        this.Bind(Key.editing, (editing)=>{
            let showDelete = editing && this.data && this.data.id>=1000;
            this.showDeleteBtn(showDelete);
        });
    }

    showDeleteBtn(b){
        this.deleteBtn.node.active = b;
        if(b){
            TweenUtil.applyFloat(this.animNode);
        }else{
            this.animNode.stopAllActions();
            this.animNode.x = 0;
            this.animNode.y = 0;
            this.animNode.angle = 0;
        }
    }
    
    setData(data:HeroConfig){
        this.data = data;
        this.sprite.spriteFrame = null;
        Game.loadTexture(data.url,(texture)=>{
            let frame = new cc.SpriteFrame();
            frame.setTexture(texture);
            this.sprite.spriteFrame = frame;
        });
    }

    openPaintPanel(theme:ThemeData){
        SceneManager.ins.Enter("PaintScene").then((paintPanel:PaintScene)=>{
            paintPanel.beginTip(Config.monsterAdvises);
            paintPanel.saveCallback = (pixels)=>{
                //点击画图面板的保存按钮时
                SceneManager.ins.OpenPanelByName("PreviewPanel",(previewPanel:PreviewPanel)=>{
                    previewPanel.initMonster(pixels);
                    //点击取名面板的确定按钮时
                    previewPanel.okCallback = (name, dirType)=>{
                        let path = Game.savePixels(pixels);
                        let monster = Game.newMonsterConf(name||"我的画作", path, dirType);
                        if(theme.monsterIds.length<5){
                            theme.monsterIds.push(monster.id);
                        }else{
                            Top.showToast("最多选择5个");
                        }
                        DB.Invoke(Key.ThemeId);
                        DB.Invoke(Key.CustomMonsters);
                        Local.setDirty(Key.CustomThemes);
                        //连续关闭两个面板
                        SceneManager.ins.popPanel();    
                        SceneManager.ins.popPanel();
                    };
                }); 
                      
            }
        });
    }
    onDeleteTap(){
        SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
            messageBox.label.string = "是否删除该角色？";
            messageBox.onOk = ()=>{
                let themeId = DB.Get(Key.ThemeId);
                let theme = Game.findThemeConf(themeId);
                let hero = Game.findHeroConf(theme.heroId);
                if(theme){
                    Game.deleteThemeConf(theme.id);
                    if(DB.Get(Key.ThemeId) == theme.id){
                        DB.SetLoacl(Key.ThemeId, 1);
                    }
                    this.node.dispatchEvent(Util.customEvent("updateThemeList",true))
                }
                Game.deleteTexture(hero.url);
                Game.deleteHeroConf(hero.id);
                SceneManager.ins.popPanel();
                Top.showToast("角色已删除");
            }
        });
    }
}
