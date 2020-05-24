import { crossPlatform } from "../Frame/CrossPlatform";
import { Util } from "../Frame/Util";
import { ServerMsg, HTTP } from "../Frame/HTTP";

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
    this.addBtn("登录", () => {
      HTTP.POST(ServerMsg.login, { name: "asda" }, (data) => {
        console.log("onSucc", data);
      }, (data) => {
        console.log("onErr", data);
      });
      // crossPlatform.login({
      //     success(res) {
      //       console.log(`login调用成功${res.code} ${res.anonymousCode}`);
      //       HTTP.POST(ServerMsg.login, {name:"asda"}, (data)=>{
      //         console.log("onSucc", data);
      //       },(data)=>{
      //         console.log("onErr", data);
      //       });
      //     },
      //     fail(res) {
      //       console.log(`login调用失败`);
      //     }
      //   });
    });
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

    this.addBtn("截屏 ", () => {
        Util.shot();
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
