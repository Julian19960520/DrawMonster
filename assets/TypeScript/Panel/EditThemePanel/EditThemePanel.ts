
import Panel from "../../Frame/Panel";
import ScrollList from "../../CustomUI/ScrollList";
import { Game } from "../../Game/Game";
import { DB } from "../../Frame/DataBind";
import Top from "../../Frame/Top";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";
import UsingMonsterCell from "./UsingMonsterCell";
import HeroCell from "./HeroCell";
import SceneManager from "../../Frame/SceneManager";
import ToggleGroup from "../../CustomUI/ToggleGroup";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/EditThemePanel")
export default class EditThemePanel extends Panel {
    @property(cc.Node)
    usingMonsterGroup:cc.Node = null;

    @property(cc.Sprite)
    bg:cc.Sprite = null;

    @property(cc.Sprite)
    heart:cc.Sprite = null;

    @property(cc.Sprite)
    shield:cc.Sprite = null;

    @property(cc.Label)
    emptyLabel:cc.Label = null;

    @property(ScrollList)
    allMonsterList:ScrollList = null;

    @property(ScrollList)
    allHeartList:ScrollList = null;

    @property(ScrollList)
    allShiledList:ScrollList = null;

    @property(ScrollList)
    allBgList:ScrollList = null;

    @property(Button)
    playBtn:Button = null;

    @property(Button)
    editBtn:Button = null;

    @property(HeroCell)
    heroCell:HeroCell = null;

    @property(ToggleGroup)
    toggleGroup:ToggleGroup = null;

    playCallback = null;
    onLoad(){
        super.onLoad();
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.editBtn.node.on("click", this.onEditBtnTap, this);
        this.toggleGroup.node.on(ToggleGroup.TOGGLE_CHANGE,this.onToggleChange, this)

        this.node.on("updateMonster",()=>{
            this.updateMonsterList();
            this.updateUsingMonster();
        }, this);

        this.node.on("updateHeart",()=>{
            this.updateHeartList();
            this.updateUsingHeart();
        }, this);

        this.node.on("updateShield",()=>{
            this.updateShieldList();
            this.updateUsingShield();
        }, this);

        this.node.on("updateBg",()=>{
            this.updateBgList();
            this.updateUsingBg();
        }, this);

        this.initHero();
        this.updateUsingMonster();
        this.updateUsingBg();
        this.updateUsingHeart();
        this.updateUsingShield();

        DB.Set(Key.editing, false);
    }
    
    initHero(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        let hero = Game.findHeroConf(theme.heroId);
        this.heroCell.setData(hero);
    }

    onToggleChange(idx, click){
        this.allMonsterList.node.active = false;
        this.allHeartList.node.active = false;
        this.allShiledList.node.active = false;
        this.allBgList.node.active = false;
        if(idx == 0){
            //怪物
            this.allMonsterList.node.active = true;
            this.updateMonsterList();
        }
        else if(idx == 1){
            //桃心
            this.allHeartList.node.active = true;
            this.updateHeartList();
        }
        else if(idx == 2){
            //护盾
            this.allShiledList.node.active = true;
            this.updateShieldList();
        }
        else if(idx == 3){
            //背景
            this.allBgList.node.active = true;
            this.updateBgList();
        }
    }

    onPlayBtnTap(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        if(theme.monsterIds.length>0){
            if(this.playCallback){
                SceneManager.ins.popPanel();
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
    //更新所有怪物列表
    updateMonsterList(){
        
        let arr:any[] = [{createNew:true}];
        let customMonsters:any[] = DB.Get(Key.CustomMonsters);
        arr = arr.concat(customMonsters);
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
    }
    //更新所有背景列表
    updateBgList(){
        let arr:any[] = [{createNew:true}];
        arr = arr.concat(Game.allBgs);
        this.allBgList.setDataArr(arr); 
    }
    //更新所有桃心列表
    updateHeartList(){
        let arr:any[] = [{createNew:true}];
        arr = arr.concat(Game.allHearts);
        this.allHeartList.setDataArr(arr); 
    }
    //更新所有护盾列表
    updateShieldList(){
        let arr:any[] = [{createNew:true}];
        arr = arr.concat(Game.allShields);
        this.allShiledList.setDataArr(arr); 
    }

    //更新当前正在使用的怪物
    updateUsingMonster(){
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

    //更新使用中的背景
    updateUsingBg(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        if(theme.bgId){
            let bgData = Game.findBgConf(theme.bgId);
            Game.loadTexture(bgData.url, "bg",(texture)=>{
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.bg.spriteFrame = frame;
                this.bg.node.color = bgData.color || cc.Color.WHITE;;
            });
        }
    }

    //更新使用中的桃心
    updateUsingHeart(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        if(theme.heartId){
            let heartData = Game.findHeartConf(theme.heartId);
            Game.loadTexture(heartData.url, "heart",(texture)=>{
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.heart.spriteFrame = frame;
            });
        }
    }

    //更新使用中的护盾
    
    updateUsingShield(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        if(theme.shieldId){
            let shieldData = Game.findShieldConf(theme.shieldId);
            Game.loadTexture(shieldData.url, "shield",(texture)=>{
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.shield.spriteFrame = frame;
            });
        }
    }
}
