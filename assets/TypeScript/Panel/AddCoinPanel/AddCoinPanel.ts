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
    exchangeBtn:Button = null;
    
    onLoad(){
        super.onLoad();
        this.gainCoinBtn.node.on("click",this.onGainCoinBtnClick ,this)
        this.exchangeBtn.node.on("click",this.onExchageCoinBtnClick ,this)
    }
    onGainCoinBtnClick(){
        AD.showVideoAd(AdUnitId.GetCoin, ()=>{
            this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:500}));
        },(err)=>{
            Top.showToast("播放失败");
        })
    }

    onExchageCoinBtnClick(){
        let diamond = DB.Get(Key.Diamond);
        if(diamond>=1){
            Top.showFloatLabel("钻石-1", this.exchangeBtn.node, {
                offset:cc.v2(0, 80),
                color:cc.color(235,235,70),
                stroke:2,
                strokeColor:cc.Color.BLACK,
                fontSize:40,
                duration:2,
            });
            DB.Set(Key.Diamond, diamond-1);
            this.node.dispatchEvent(Util.customEvent("gainCoin",true,{cnt:100}));
        }else{
            Top.showToast("钻石不足");
        }
    }
}
