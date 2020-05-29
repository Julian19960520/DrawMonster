import Panel from "../../Frame/Panel";
import Button from "../../CustomUI/Button";
import { AD, AdUnitId } from "../../Frame/AD";
import Top from "../../Frame/Top";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { Util } from "../../Frame/Util";
const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/AddCoinPanel")
export default class AddCoinPanel extends Panel {
    @property(Button)
    gainCoinBtn:Button = null;
    @property(Button)
    gainDiamondBtn:Button = null;
    @property(Button)
    exchangeDiamondBtn:Button = null;
    
    onLoad(){
        super.onLoad();
        this.gainCoinBtn.node.on("click",this.onGainCoinBtnClick ,this)
        this.gainDiamondBtn.node.on("click",this.onGainDiamondBtnClick ,this)
        this.exchangeDiamondBtn.node.on("click",this.onExchageCoinBtnClick ,this)
    }
    onGainCoinBtnClick(){
        AD.showVideoAd(AdUnitId.Reborn, ()=>{
            this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:500}));
        },(err)=>{
            Top.showToast("播放失败");
        })
    }
    onGainDiamondBtnClick(){
        AD.showVideoAd(AdUnitId.Reborn, ()=>{
            this.node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:5}));
        },(err)=>{
            Top.showToast("播放失败");
        })
    }
    onExchageCoinBtnClick(){
        let diamond = DB.Get(Key.Diamond);
        if(diamond>0){
            DB.Set(Key.Diamond, diamond-1);
            this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:100}));
        }
    }
}
