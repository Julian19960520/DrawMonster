import { crossPlatform } from "../Frame/CrossPlatform";
import { Util } from "../Frame/Util";
import { ServerMsg, HTTP } from "../Frame/HTTP";
import { DB } from "../Frame/DataBind";
import { Key } from "./Key";

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
        this.openBtn.node.on("click", () => {
            this.panel.active = !this.panel.active;
        }, this);
        this.buttonPrefab.active = false;
        this.panel.active = false;
        this.addBtn("设置用户分组", () => {
            crossPlatform.setUserGroup({
                groupId: "test_group",
                complete: (res) => { console.log(res) }
            });
        });
        this.addBtn("设置分数", () => {
            const data = {
                ttgame: {
                    score: 16,
                    update_time: 1513080573
                },
                cost_ms: 36500
            };

            crossPlatform.setUserCloudStorage({
                KVDataList: [
                    // key 需要在开发者后台配置，且配置为排行榜标识后，data 结构必须符合要求，否则会 set 失败
                    { key: "score", value: JSON.stringify(data) }
                ],
                complete: (res) => { console.log(res) }
            });
        });
        this.addBtn("post", () => {
            crossPlatform.getOpenDataContext().postMessage("adsfa");
        });

        this.addBtn("登录", () => {
            HTTP.POST(ServerMsg.login, { openId: "Julian" }, (data) => {
                
            }, (data) => {
                
            });
        });
        this.addBtn("save", () => {
            HTTP.POST(ServerMsg.save, {uid:"1",json:"asdfasdfa"},(res)=>{

            },()=>{

            })
        });
        this.addBtn("saveImg", () => {
            HTTP.POST(ServerMsg.saveImg, {uid:"1",img:"image"},(res)=>{
                
            },()=>{})
        });
        this.addBtn("readOneImg", () => {
            HTTP.POST(ServerMsg.readOneImg, {id:"9s"},(res)=>{
                
            },()=>{})
        });
        this.addBtn("加金币", () => {
            DB.Set(Key.Coin, 100000);
        });
        this.addBtn("加钻石", () => {
            DB.Set(Key.Diamond, 100000);
        });
        this.addBtn("大退", () => {
            crossPlatform.exitMiniProgram();
        });
        this.addBtn("清空缓存大退", () => {
            crossPlatform.clearStorageSync();
            crossPlatform.exitMiniProgram();
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
