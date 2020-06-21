
import { DB } from "../Frame/DataBind";
import { Key } from "./Key";
import Button from "../CustomUI/Button";
import SceneManager from "../Frame/SceneManager";
import { Util } from "../Frame/Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DiamondBar extends DB.DataBindComponent {
    @property(cc.Label)
    label: cc.Label = null;
    @property(Button)
    addBtn: Button = null;
    @property(cc.Node)
    public iconPos: cc.Node = null;
    onLoad () {
        this.Bind(Key.Diamond,(diamond)=>{
            this.label.string = Util.toMagnitudeNum(diamond).toString();;
        });
        this.addBtn.node.on("click", ()=>{
            SceneManager.ins.OpenPanelByName("AddDiamondPanel");
        }, this)
    }
}
