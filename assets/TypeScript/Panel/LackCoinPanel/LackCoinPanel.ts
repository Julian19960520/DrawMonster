import Panel from "../../Frame/Panel";
import SceneManager from "../../Frame/SceneManager";
import { Util } from "../../Frame/Util";
import { Game } from "../../Game/Game";
import Top from "../../Frame/Top";
import { tt, wx, crossPlatform, VideoAd } from "../../Frame/CrossPlatform";
import Button from "../../CustomUI/Button";
import { AdUnitId, AD } from "../../Frame/AD";
import { Key } from "../../Game/Key";
import { DB } from "../../Frame/DataBind";
import { Config } from "../../Frame/Config";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/LackCoinPanel")
export default class LackCoinPanel extends Panel {

    @property(Button)
    adBtn: Button = null;

    cnt:200;
    onLoad(){
        super.onLoad();
        this.adBtn.node.on("click", this.onADBtnTap, this);
        // this.adBtn.getComponentInChildren(cc.Label).string = "";
    }
    onADBtnTap(){
        AD.showVideoAd(AdUnitId.GetCoin, ()=>{
            SceneManager.ins.popPanel();
            this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:this.cnt}));
        },(err)=>{
            Top.showToast("播放失败");
        })
    }
}
