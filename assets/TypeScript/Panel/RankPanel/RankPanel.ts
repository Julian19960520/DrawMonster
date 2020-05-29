import Panel from "../../Frame/Panel";
import ScrollList from "../../CustomUI/ScrollList";
import ToggleGroup from "../../CustomUI/ToggleGroup";
import { RankData } from "../../Frame/dts";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { crossPlatform } from "../../Frame/CrossPlatform";
import { Game } from "../../Game/Game";

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
    friendRank: cc.Node = null;

    onLoad () {
        super.onLoad(); 
        this.toggleGroup.on(ToggleGroup.TOGGLE_CHANGE, this.onToggleChange, this);
    }

    onToggleChange(idx, click){
        if(idx == 0){
            //世界
            this.scrollList.node.active = true;
            Game.requestWorldRank(false, (worldRanks)=>{
                this.emptyNode.active = (worldRanks.length == 0);
                this.scrollList.setDataArr(worldRanks);
            })
        }else if(idx == 1){
            //好友
            this.scrollList.node.active = false;
            this.showFriendRank();
        }else if(idx == 2){
            //个人
            this.scrollList.node.active = true;
            let rankDatas:RankData[] = DB.Get(Key.RankDatas);
            this.emptyNode.active = (rankDatas.length == 0);
            this.scrollList.setDataArr(rankDatas);
        }
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
}
