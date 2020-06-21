import Panel from "../../Frame/Panel";
import Button from "../../CustomUI/Button";
import { AD, AdUnitId } from "../../Frame/AD";
import Top from "../../Frame/Top";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { Util } from "../../Frame/Util";
const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/AddDiamondPanel")
export default class AddDiamondPanel extends Panel {
    @property(Button)
    gainDiamondBtn:Button = null;
    @property(Button)
    exchangeBtn:Button = null;
    
    onLoad(){
        super.onLoad();
        this.gainDiamondBtn.node.on("click",this.onGainDiamondBtnClick ,this)
        this.exchangeBtn.node.on("click",this.onExchangeBtnClick ,this)
    }
    onGainDiamondBtnClick(){
        AD.showVideoAd(AdUnitId.GetDiamond, ()=>{
            this.node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:5}));
        },(err)=>{
            Top.showToast("播放失败");
        })
    }
    onExchangeBtnClick(){
        let coin = DB.Get(Key.Coin);
        if(coin>=150){
            Top.showFloatLabel("金币-150", this.exchangeBtn.node, {
                offset:cc.v2(0, 80),
                color:cc.color(235,235,70),
                stroke:2,
                strokeColor:cc.Color.BLACK,
                fontSize:40,
                duration:2,
            });
            DB.Set(Key.Coin, coin-150);
            this.node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:1}));
        }else{
            Top.showToast("金币不足");
        }
    }
}
