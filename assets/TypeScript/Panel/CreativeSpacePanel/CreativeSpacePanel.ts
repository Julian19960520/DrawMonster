import Panel from "../../Frame/Panel";
import ScrollList from "../../CustomUI/ScrollList";
import ToggleGroup from "../../CustomUI/ToggleGroup";
import { Sound } from "../../Frame/Sound";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { HeroConfig, MonsterConfig, ThemeData } from "../../Frame/dts";
import { CreativeSpace } from "../../Game/CreativeSpace";
import Button from "../../CustomUI/Button";
import SceneManager from "../../Frame/SceneManager";
import PaintPanel from "../PaintPanel/PaintPanel";
import { Config } from "../../Frame/Config";
import PreviewPanel from "../PreviewPanel/PreviewPanel";
import { Game } from "../../Game/Game";
import MenuScene from "../../Scene/MenuScene/MenuScene";
import { OperationFlow } from "../../Game/OperationFlow";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/DownloadPanel")
export default class CreativeSpacePanel extends Panel {
    @property(cc.Node)
    toggleGroup:cc.Node = null;  
    @property(ScrollList)
    list:ScrollList = null;

    @property(cc.Node)
    normalEmptyNode:cc.Node = null;

    @property(cc.Node)
    mineEmptyNode:cc.Node = null;

    @property(Button)
    drawBtn:Button = null;  

    curData:HeroConfig|MonsterConfig = null;
    public static sheetIdx = 0;
    
    onLoad () {
        super.onLoad(); 
        CreativeSpacePanel.sheetIdx = 0;
        this.toggleGroup.on(ToggleGroup.TOGGLE_CHANGE, this.onToggleChange, this);
        this.drawBtn.node.on("click", this.onDrawBtnTap, this);
    }

    onToggleChange(idx, click){
        if(click){
            Sound.play("clickBtn");
        }
        CreativeSpacePanel.sheetIdx = idx;
        this.normalEmptyNode.active = false;
        this.mineEmptyNode.active = false;
        this.list.setDataArr([]);
        if(idx == 0){
            CreativeSpace.requestDynamicThemes((dynamicThemes)=>{
                this.list.setDataArr(dynamicThemes);
                this.list.selectItemByIdx(0);
                this.normalEmptyNode.active = (dynamicThemes.length == 0);
                this.normalEmptyNode.getComponentInChildren(cc.Label).string = "暂无";
            });
        }
        else if(idx == 1){
            this.list.setDataArr([]);
            CreativeSpace.requestStarThemes((starThemes:ThemeData[])=>{
                this.list.setDataArr(starThemes);
                this.list.selectItemByIdx(0);
                this.normalEmptyNode.active = (starThemes.length == 0);
                this.normalEmptyNode.getComponentInChildren(cc.Label).string = "暂无收藏";
            });
        }
        else if(idx == 2){
            this.updateMine();
        }
    }
    updateMine(){
        let myTheme = DB.Get(Key.CustomThemes);
        this.list.setDataArr(myTheme);
        this.list.selectItemByIdx(0);
        this.mineEmptyNode.active = (myTheme.length == 0);
    }
    onDrawBtnTap(){
        OperationFlow.drawHeroFlow((hero,theme)=>{
            this.updateMine();
        });
    }
}
