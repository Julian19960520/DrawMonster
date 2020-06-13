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
import { Game } from "../../Game/Game";
import { DB } from "../../Frame/DataBind";
import Top from "../../Frame/Top";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";
import UsingMonsterCell from "./UsingMonsterCell";
import HeroCell from "./HeroCell";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/EditThemePanel")
export default class EditThemePanel extends Panel {
    @property(cc.Node)
    usingMonsterGroup:cc.Node = null;
    @property(cc.Label)
    emptyLabel:cc.Label = null;

    @property(ScrollList)
    allMonsterList:ScrollList = null;

    @property(Button)
    playBtn:Button = null;

    @property(Button)
    editBtn:Button = null;

    @property(HeroCell)
    heroCell:HeroCell = null;

    playCallback = null;
    onLoad(){
        super.onLoad();
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.editBtn.node.on("click", this.onEditBtnTap, this);
        this.Bind(Key.CustomMonsters,()=>{
            let arr:any[] = [{createNew:true}];
            let openThemeIds:any[] = DB.Get(Key.OpenThemeIds);
            for(let i=0;i<openThemeIds.length;i++){
                let id = openThemeIds[i];
                let theme = Game.findThemeConf(id);
                for(let j=0;j<theme.monsterIds.length;j++){
                    let monster = Game.findMonsterConf(theme.monsterIds[j]);
                    if(arr.indexOf(monster)<=0){
                        arr.push(monster);
                    }
                }
            }
            this.allMonsterList.setDataArr(arr);
        });
        this.updateThemeHero();
        this.Bind(Key.ThemeId, (themeId)=>{
            this.updateUsingMonsterGooup();
        })
        DB.Set(Key.editing, false);
    }

    updateThemeHero(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        let hero = Game.findHeroConf(theme.heroId);
        this.heroCell.setData(hero);
    }

    updateUsingMonsterGooup(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        while(this.usingMonsterGroup.childrenCount < theme.monsterIds.length){
            let node = cc.instantiate(this.usingMonsterGroup.children[0]);
            this.usingMonsterGroup.addChild(node);
        }
        for(let i=0;i<this.usingMonsterGroup.childrenCount;i++){
            let child = this.usingMonsterGroup.children[i];
            if(i<theme.monsterIds.length){
                child.active = true;
                let usingMonsterCell = child.getComponent(UsingMonsterCell);
                usingMonsterCell.setData(theme.monsterIds[i]);
            }else{
                child.active = false;
            }
        }
        this.emptyLabel.node.active = (theme.monsterIds.length == 0);
    }
    onPlayBtnTap(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        if(theme.monsterIds.length>0){
            if(this.playCallback){
                this.playCallback();
            }
        }else{
            Top.showToast("最少选择1个");
        }
    }
    onEditBtnTap(){
        let editing = DB.Get(Key.editing);
        editing = !editing;
        DB.Set(Key.editing, editing);
        this.editBtn.getComponentInChildren(cc.Label).string = editing?"管理中..":"管理";
    }
}
