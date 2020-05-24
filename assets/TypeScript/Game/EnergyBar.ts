
import { DB } from "../Frame/DataBind";
import { Key } from "./Key";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EnergyBar extends DB.DataBindComponent {
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    public iconPos: cc.Node = null;
    onLoad () {
        this.Bind(Key.Coin,(coin)=>{
            this.label.string = coin;
        });
    }
}
