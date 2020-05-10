// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Panel from "../Frame/Panel";
import ScrollList from "../CustomUI/ScrollList";
import { RankData } from "../Frame/dts";
import SceneManager from "../Frame/SceneManager";
import MessageBox from "../Frame/MessageBox";
import { DB } from "../Frame/DataBind";
import { Sound } from "../Frame/Sound";
import Button from "../CustomUI/Button";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/RankPanel")
export default class RankPanel extends Panel {

    @property(Button)
    clearBtn: Button = null;

    @property(Button)
    okBtn: Button = null;

    @property(ScrollList)
    scrollList: ScrollList = null;

    @property(cc.Node)
    emptyNode: cc.Node = null;

    onLoad () {
        super.onLoad();
        this.clearBtn.node.on("click", this.onClearBtnTap, this);
        this.okBtn.node.on("click", this.onOkBtnTap, this);
        let rankDatas:RankData[] = DB.Get("user/rankDatas");
        this.emptyNode.active = (rankDatas.length == 0);
        this.scrollList.setDataArr(rankDatas);
        this.scrollList.selectItemByData(null);
    }
    onClearBtnTap(){
        Sound.play("clickBtn");
        SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
            messageBox.label.string = "是否清空排行榜";
            messageBox.onOk = ()=>{
                DB.SetLoacl("user/rankDatas", []);
                this.scrollList.setDataArr([]);
                this.scrollList.selectItemByData(null);
            };
        })
    }
    onOkBtnTap(){
        Sound.play("clickBtn");
        SceneManager.ins.popPanel();
    }
}
