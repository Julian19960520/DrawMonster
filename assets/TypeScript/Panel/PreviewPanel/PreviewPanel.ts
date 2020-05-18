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
import Button from "../../CustomUI/Button";
import ToggleGroup from "../../CustomUI/ToggleGroup";
import Monster from "../../Scene/PlayScene/Monster";
import { Sound } from "../../Frame/Sound";
import { TweenUtil } from "../../Frame/TweenUtil";
import PreviewMonsterFactory from "./PreviewMonsterFactory";
import { DirType } from "../../Frame/Config";


const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/PreviewPanel")
export default class PreviewPanel extends Panel {

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    @property(Button)
    cancelBtn: Button = null;
    @property(Button)
    okBtn: Button = null;
    okCallback = null;

    @property(ToggleGroup)
    dirToggle:ToggleGroup = null;

    @property(PreviewMonsterFactory)
    monsterFac:PreviewMonsterFactory = null;

    @property(cc.Sprite)
    heroSprite:cc.Sprite = null;
    monsters:Monster[] = [];
    
    dirType:DirType = DirType.Upward;
    onLoad () {
        super.onLoad();
        this.okBtn.node.on("click", this.onOkBtnTap, this);
        this.cancelBtn.node.on("click", this.onCloseBtnClick, this);
        this.dirToggle.node.on(ToggleGroup.TOGGLE_CHANGE, this.onToggleChange, this);
    }

    onOkBtnTap(){
        Sound.play("clickBtn");
        if(this.okCallback){
            this.okCallback(this.editBox.string, this.dirType);
        }
    }

    initHero(pixels){
        this.dirToggle.node.active = false;
        let sf = new cc.SpriteFrame();
        let rt = new cc.RenderTexture();
        let dataView = pixels as any;
        rt.initWithData(dataView, cc.Texture2D.PixelFormat.RGBA8888, 512, 512);
        sf.setTexture(rt);  
        this.heroSprite.spriteFrame = sf;
        TweenUtil.applyBubble(this.heroSprite.node);
    }

    onToggleChange(idx, click){
        if(click){
            Sound.play("clickBtn");
        }
        this.dirType = idx;
        this.monsterFac.setDirType(this.dirType);
    }

    initMonster(pixels){
        this.monsterFac.init(pixels, this.dirType);
    }
}