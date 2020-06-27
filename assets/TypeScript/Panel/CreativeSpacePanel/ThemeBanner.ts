
import ScrollList from "../../CustomUI/ScrollList";
import { Game } from "../../Game/Game";
import Button from "../../CustomUI/Button";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import Top from "../../Frame/Top";
import { ThemeData } from "../../Frame/dts";
import { CreativeSpace } from "../../Game/CreativeSpace";
import CreativeSpacePanel from "./CreativeSpacePanel";
import { OperationFlow } from "../../Game/OperationFlow";
const {ccclass, property} = cc._decorator;

@ccclass
export default class ThemeBanner extends cc.Component {

    @property(cc.Label)
    authorLabel: cc.Label = null;
    @property(cc.Sprite)
    heroSprite:cc.Sprite = null; 
    @property(cc.Node)
    monsterGroup:cc.Node = null; 


    @property(Button)
    starBtn:Button = null; 
    @property(Button)
    playBtn:Button = null;
    @property(Button)
    uploadBtn:Button = null;  

    data:ThemeData = null;
    onLoad(){
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.starBtn.node.on("click", this.onStarBtnTap, this);
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.uploadBtn.node.on("click", this.onUploadBtnTap, this);
    }
    setData(data:ThemeData){
        this.data = data;
        //作者
        this.authorLabel.string = `作者：${data.author||"匿名"}`;
        //主角
        let hero = Game.findHeroConf(data.heroId);
        this.heroSprite.spriteFrame = null;
        Game.loadTexture(hero.url, "hero", (texture)=>{
            let frame = new cc.SpriteFrame();
            frame.setTexture(texture);
            this.heroSprite.spriteFrame = frame;
        });
        //怪物
        while(this.monsterGroup.childrenCount<data.monsterIds.length){
            let child = cc.instantiate(this.monsterGroup.children[0]);
            this.monsterGroup.addChild(child);
        }
        for(let i=0; i<this.monsterGroup.childrenCount; i++){
            let child = this.monsterGroup.children[i];
            child.active = i<data.monsterIds.length;
            if(child.active){
                let monster = Game.findMonsterConf(data.monsterIds[i]);
                let sprite = child.getComponentInChildren(cc.Sprite);
                sprite.spriteFrame = null;
                Game.loadTexture(monster.url, "monster", (texture)=>{
                    let frame = new cc.SpriteFrame();
                    frame.setTexture(texture);
                    sprite.spriteFrame = frame;
                    if(monster.isCustom){
                        sprite.node.width = 100;
                        sprite.node.height = 100;
                    }else{
                        sprite.node.width = 150;
                        sprite.node.height = 150;
                    }
                });
            }
        }
        //星
        this.updateStar();
        //按钮
        this.updateBtn();
    }

    updateStar(){
        let data = this.data;
        let stared = DB.Get(Key.StarThemeIds).indexOf(data.id) >= 0;
        this.starBtn.getComponentInChildren(cc.Label).string = (data.star || 0).toString();
        this.starBtn.node.getChildByName("icon").color = stared?cc.Color.YELLOW:cc.Color.WHITE; 
    }

    updateBtn(){
        let data = this.data;
        if(CreativeSpacePanel.sheetIdx == 0){
            this.playBtn.node.active = true;
            this.uploadBtn.node.active = false;
        }
        else if(CreativeSpacePanel.sheetIdx == 1){
            this.playBtn.node.active = true;
            this.uploadBtn.node.active = false;
        }
        else if(CreativeSpacePanel.sheetIdx == 2){
            this.uploadBtn.node.active = !data.uploaded;
            this.playBtn.node.active = data.uploaded;
        }
    }

    onStarBtnTap(){
        let data = this.data;
        if(CreativeSpace.hasMyStar(data)){
            CreativeSpace.cancelStarTheme(data);
        }else{
            CreativeSpace.doStarTheme(data);
        }
        this.updateStar();
    }
    onUploadBtnTap(){
        let data = this.data;
        data.uploaded = true;
        this.updateBtn();
        Top.showToast("上传成功");
    }
    onPlayBtnTap(){
        OperationFlow.enterPlayScene(()=>{});
    }
}
