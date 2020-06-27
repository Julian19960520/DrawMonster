// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { ThemeData, HeartData } from "../../Frame/dts";
import ScrollList from "../../CustomUI/ScrollList";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { Game } from "../../Game/Game";
import BaseEditCell from "./BaseEditCell";
import { Util } from "../../Frame/Util";
import SceneManager from "../../Frame/SceneManager";
import PaintScene from "../PaintPanel/PaintScene";
import Top from "../../Frame/Top";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HeartEditCell extends BaseEditCell {
    data:HeartData = null;

    onLoad () {
        super.onLoad();
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on("click", this.onClick, this)
    }

    setData(data:HeartData) {
        this.data = data;
        this.normalNode.active = !data["createNew"];
        this.emptyNode.active = data["createNew"];
        this.showDeleteBtn(DB.Get(Key.editing) && data.isCustom);
        if(!data["createNew"]){
            Game.loadTexture(data.url, "heart",(texture)=>{
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.sprite.spriteFrame = frame;
                this.sprite.node.scale = data.isCustom ? 1:0.5;
            });
            let themeId  = DB.Get(Key.ThemeId);
            let theme = Game.findThemeConf(themeId);
            this.setUsingState(theme.heartId == data.id);
        }
    }

    onClick(){
        let themeId  = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        if(this.data["createNew"]){
            this.openPaintPanel(theme);
        }else{
            theme.heartId = this.data.id;
            DB.Save(Key.CustomThemes);
            this.node.dispatchEvent(Util.customEvent("updateHeart", true));
        }
    }
    openPaintPanel(theme:ThemeData){
        DB.Set(Key.guideUnlockPaint, true);
        SceneManager.ins.Enter("PaintScene").then((paintScene:PaintScene)=>{
            paintScene.drawHeart(()=>{
                
            });
        });
    }
}
