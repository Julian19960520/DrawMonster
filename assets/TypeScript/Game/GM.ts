import { crossPlatform, wx, tt } from "../Frame/CrossPlatform";
import { Util } from "../Frame/Util";
import { ServerMsg, HTTP } from "../Frame/HTTP";
import { DB } from "../Frame/DataBind";
import { Key } from "./Key";
import { Game } from "./Game";
import { HeroConfig, MonsterConfig, ThemeData } from "../Frame/dts";
import MonsterCell from "../Panel/EditThemePanel/MonsterCell";
import Top from "../Frame/Top";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GM extends cc.Component {
    @property(cc.Button)
    openBtn: cc.Button = null;
    @property(cc.Node)
    buttonPrefab: cc.Node = null;
    @property(cc.Node)
    panel: cc.Node = null;
    @property(cc.Node)
    content: cc.Node = null;
    onLoad() {
        this.node.active = crossPlatform.isDebug;
        this.openBtn.node.on("click", () => {
            this.panel.active = !this.panel.active;
        }, this);
        this.buttonPrefab.active = false;
        this.panel.active = false;
        this.addBtn("删除存档！慎重！", () => {
            crossPlatform.clearStorageSync();
            crossPlatform.exitMiniProgram();
            this.panel.active = false;
        });
        this.addBtn("加金币", () => {
            DB.Set(Key.Coin, DB.Get(Key.Coin)+100000);
            this.panel.active = false;
        });
        this.addBtn("加钻石", () => {
            DB.Set(Key.Diamond, DB.Get(Key.Diamond)+100000);
            this.panel.active = false;
        });
        this.addBtn("重置招财猫", () => {
            Game.resetLuckyCat();
            this.panel.active = false;
        });
    }
    addBtn(name, func) {
        let node = cc.instantiate(this.buttonPrefab);
        node.active = true;
        node.on("click", func, this);
        node.getComponentInChildren(cc.Label).string = name;
        this.content.addChild(node);
        return node;
    }
}
