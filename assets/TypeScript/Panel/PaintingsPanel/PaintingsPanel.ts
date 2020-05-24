// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Panel from "../../Frame/Panel";
import ScrollList from "../../CustomUI/ScrollList";
import ToggleGroup from "../../CustomUI/ToggleGroup";
import { Sound } from "../../Frame/Sound";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import Button from "../../CustomUI/Button";
import SceneManager from "../../Frame/SceneManager";
import MessageBox from "../../Frame/MessageBox";
import { Game } from "../../Game/Game";
import { crossPlatform } from "../../Frame/CrossPlatform";
import { HeroConfig, MonsterConfig } from "../../Frame/dts";
import { Util } from "../../Frame/Util";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/PaintingsPanel")
export default class PaintingsPanel extends Panel {
    @property(cc.Node)
    toggleGroup:cc.Node = null;  
    @property(Button)
    deleteBtn:Button = null;  
    @property(Button)
    editBtn:Button = null;  
    @property(ScrollList)
    list:ScrollList = null;

    curData:HeroConfig|MonsterConfig = null;
    curIdx = 0;
    onLoad () {
        super.onLoad(); 
        this.toggleGroup.on(ToggleGroup.TOGGLE_CHANGE, this.onToggleChange, this);
        this.list.node.on(ScrollList.SELECT_CHILD, this.onSelectChange, this);
        this.deleteBtn.node.on("click", this.onDeleteBtnTap, this);
        this.editBtn.node.on("click", this.onEditBtnTap, this);
        
    }

    onSelectChange(item, data){
        this.curData = data;
    }
    onToggleChange(idx, click){
        if(click){
            Sound.play("clickBtn");
        }
        this.curIdx = idx;
        if(idx == 0){
            this.list.setDataArr(DB.Get(Key.CustomHeros));
            this.list.selectItemByIdx(0);
        }else{
            this.list.setDataArr(DB.Get(Key.CustomMonsters));
            this.list.selectItemByIdx(0);
        }
    }
    onDeleteBtnTap(){
        SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
            messageBox.label.string = "确认删除？";
            messageBox.onOk = ()=>{
                if(this.curIdx == 0){
                    //hero
                    let hero = this.curData;
                    console.log("hero",hero);
                    let theme = Game.allThemes.find((theme)=>{
                        return theme.heroId == hero.id; 
                    })
                    console.log("theme",theme);
                    if(theme){
                        Game.deleteThemeConf(theme.id);
                        if(DB.Get(Key.ThemeId) == theme.id){
                            DB.SetLoacl(Key.ThemeId, 1);
                        }
                        this.node.dispatchEvent(Util.customEvent("updateThemeList",true))
                    }
                    Game.deleteTexture(hero.url);
                    Game.deleteHeroConf(hero.id);
                    this.list.setDataArr(DB.Get(Key.CustomHeros));
                }else{
                    //monster
                    let monster = this.curData;
                    let theme = Game.allThemes.find((theme)=>{
                        return theme.monsterIds.indexOf(monster.id) >= 0;
                    })
                    if(theme){
                        let idx = theme.monsterIds.indexOf(monster.id);
                        theme.monsterIds.splice(idx, 1);
                    }
                    Game.deleteTexture(monster.url);
                    Game.deleteMonsterConf(monster.id);
                    this.list.setDataArr(DB.Get(Key.CustomMonsters));
                }
            }
        })
    }
    onEditBtnTap(){

    }

}
