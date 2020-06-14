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
        this.addBtn("桌面", () => {
            let t:any = tt;
            t.addShortcut({
                success: function (res) {
                    console.log(res);
                },
                fail: function (res) {
                    console.log(res);
                }
            })
        });
        this.addBtn("关注", () => {
            let t:any = tt;
            console.log(t);
            t.followOfficialAccount({
                success: function (res) {
                    console.log(res);
                },
                fail: function (res) {
                    console.log(res);
                }
            })
        });

        
        this.addBtn("加金币", () => {
            DB.SetLoacl(Key.Coin,100000);
        });
        this.addBtn("修复", () => {
            DB.SetLoacl(Key.ThemeId, 1);
            DB.SetLoacl(Key.CustomMonsters,[]);
            DB.SetLoacl(Key.CustomHeros,[]);
            DB.SetLoacl(Key.CustomThemes,[]);
            DB.SetLoacl(Key.OpenThemeIds,[1,2,3]);
            crossPlatform.exitMiniProgram();
        });
        this.addBtn("log", () => {
            let arr1:MonsterConfig[] = DB.Get(Key.CustomMonsters);
            let arr2:HeroConfig[] = DB.Get(Key.CustomHeros);
            let arr3:ThemeData[]= DB.Get(Key.CustomThemes);
            console.log("=========玩家数据==========");
            for(let i=0;i<arr1.length;i++){
                console.log(arr1[i].id, arr1[i].url);
            }
            for(let i=0;i<arr2.length;i++){
                console.log(arr2[i].id, arr2[i].url);
            }
            for(let i=0;i<arr3.length;i++){
                console.log(arr3[i].id, arr3[i].heroId,JSON.stringify(arr3[i].monsterIds));
            }
            console.log("===========文件数据===========");
            let rootPath = crossPlatform.env.USER_DATA_PATH+"/pixels/";
            let fm = crossPlatform.getFileSystemManager();

            for(let i=0;i<arr2.length;i++){
                let hero = arr2[i];
                let path = rootPath+hero.id;  
                fm.access({
                    path:path,
                    success:(res)=>{console.log("ok:", path, res);},
                    fail:(res)=>{console.log("ok:", path, res);},
                })
            }
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
