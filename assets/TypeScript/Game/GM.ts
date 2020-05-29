import { crossPlatform, wx } from "../Frame/CrossPlatform";
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
        this.addBtn("test1", () => {
            crossPlatform.setUserCloudStorage({
                KVDataList:[{key:"highScore",value:"1"}],
                success:()=>{
                    
                },
                complete:(res)=>{
                    console.log("设置开放域最高分",res);
                }
            });
        });
        this.addBtn("test1", () => {
            setTimeout(() => {
                crossPlatform.setUserCloudStorage({
                    KVDataList:[{key:"highScore",value:"1"}],
                    success:()=>{
                        
                    },
                    complete:(res)=>{
                        console.log("设置开放域最高分",res);
                    }
                });
            }, 100);
        });
        this.addBtn("按钮", () => {
            console.log(Util.rawUrl('resources/Atlas/Single/transparent.png'));
            wx.createGameRecorderShareButton({
                // text:"",
                // icon:Util.rawUrl('resources/Atlas/Single/transparent.png'),
                style:{left:0,top:0,height:70},
                share:{
                    query:"",
                    title:{
                        template:"default.score",
                        data:{score:1},
                    },
                    bgm:"",
                    timeRange:[[0,3000]],
                }
            });
        });

        this.addBtn("start", () => {
            wx.getGameRecorder().start({duration:15,hookBgm:false});
        });

        this.addBtn("stop", () => {
            wx.getGameRecorder().stop();
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
