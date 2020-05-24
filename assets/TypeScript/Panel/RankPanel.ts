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
import { DB } from "../Frame/DataBind";
import { Sound } from "../Frame/Sound";
import { Key } from "../Game/Key";
import ToggleGroup from "../CustomUI/ToggleGroup";
import { crossPlatform } from "../Frame/CrossPlatform";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/RankPanel")
export default class RankPanel extends Panel {

    @property(ScrollList)
    scrollList: ScrollList = null;

    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.Node)

    @property(cc.Node)
    toggleGroup:cc.Node = null;  
    @property(cc.Node)
    myRank: cc.Node = null;
    @property(cc.Node)
    friendRank: cc.Node = null;


    onLoad () {
        super.onLoad(); 
        this.toggleGroup.on(ToggleGroup.TOGGLE_CHANGE, this.onToggleChange, this);
    }
    onToggleChange(idx, click){
        if(idx == 0){
            this.shiftLeft();
        }else{
            this.shiftRight();
        }
    }
    shiftLeft(){
        this.hideFriendRank();
        this.showMyRank();
    }
    shiftRight(){
        this.hideMyRank();
        this.showFriendRank();
    }
    //显示我的排行
    myRankInited = false;
    showMyRank(){
        this.myRank.active = true;
        if(this.myRankInited){
            return;
        }
        this.myRankInited = true;
        let rankDatas:RankData[] = DB.Get(Key.RankDatas);
        this.emptyNode.active = (rankDatas.length == 0);
        this.scrollList.setDataArr(rankDatas);
    }
    //隐藏我的排行
    hideMyRank(){
        this.myRank.active = false;
    }
    //显示开放域排行
    friendRankInited = false;
    showFriendRank(){
        // this.friendRank.x = 0;
        if(this.friendRankInited){
            return;
        }
        this.friendRankInited = true;
        crossPlatform.getOpenDataContext().postMessage({
            name:"FriendRank",
            w:this.friendRank.width,
            h:this.friendRank.height,
        });
    }
    //隐藏开放域排行
    hideFriendRank(){
        // this.friendRank.x = -10000;
    }
    
    // onClearBtnTap(){
    //     SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
    //         messageBox.label.string = "是否清空排行榜";
    //         messageBox.onOk = ()=>{
    //             DB.SetLoacl(Key.RankDatas, []);
    //             this.scrollList.setDataArr([]);
    //             this.scrollList.selectItemByData(null);
    //         };
    //     })
    // }
}
