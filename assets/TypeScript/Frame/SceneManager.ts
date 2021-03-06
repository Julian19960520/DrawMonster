const {ccclass, property} = cc._decorator;
import Scene from "./Scene";
import { DB } from "./DataBind";
import ScreenRect from "./ScreenRect";
import { Util } from "./Util";
import { Key } from "../Game/Key";
import { crossPlatform } from "./CrossPlatform";
import { AD } from "./AD";
@ccclass
export default class SceneManager extends cc.Component {
    stack:string[] = [];
    curScene:Scene = null;
    static ins:SceneManager = null;
    @property
    firstScene:string = "";
    @property
    homeScene:string = "";
    @property(cc.Node)
    content:cc.Node = null;
    @property(cc.BlockInputEvents)
    blockInput:cc.BlockInputEvents = null;

    onLoad(){
        this.blockInput.node.active = false;
        SceneManager.ins = this;
        this.Enter(this.firstScene, ShiftAnima.simpleShift);
        crossPlatform.onShow((data)=>{
            if(AD.videoAding){
                return;
            }
            console.log("onShow",data);
            if(this.curScene){
                this.curScene.onShow(data);
            }
        })
        crossPlatform.onHide(()=>{
            console.log("onHide");
            if(this.curScene){
                this.curScene.onHide();
            }
        })
    }
    //进入新场景
    public Enter(sceneName:string, shiftAnima = ShiftAnima.simpleShift){
        this.blockInput.node.active = true;
        if(sceneName != "LoadingScene"){
            this.stack.push(sceneName);
        }
        return this.shiftScene(sceneName, shiftAnima);
    }
    //回到上个场景
    public Back(shiftAnima = ShiftAnima.simpleShift){
        this.blockInput.node.active = true;
        return new Promise((resolve, reject)=>{
            if(this.stack.length >= 2){
                this.stack.pop();
                this.shiftScene(this.stack[this.stack.length-1], shiftAnima).then(resolve).catch(reject);
            }else{
                console.log("前面没有场景了");
                reject();
                this.blockInput.node.active = false;
            }
        })
    }
    //回到Home场景，并检查返回路径上的场景是否需要销毁
    public BackTo(sceneName:string, shiftAnima = ShiftAnima.simpleShift){
        this.blockInput.node.active = true;
        return new Promise((resolve, reject)=>{
            if(sceneName == this.curScene.node.name){
                resolve(this.curScene)
                this.blockInput.node.active = false;
                return;
            }
            //先弹出当前场景，但不销毁
            this.stack.pop();
            //检查并销毁路径上的场景
            while(this.stack.length > 0 
                    && (sceneName != this.stack[this.stack.length-1])){
                this.stack.pop();
                let sceneNode = this.content.getChildByName(sceneName);
                if(sceneNode){
                    let scene = sceneNode.getComponent(Scene);
                    if(scene && scene.autoDestroy){
                        sceneNode.destroy();
                        // this.content.removeChild(sceneNode);
                    }
                }
            }
            //从当前场景转换到Home场景
            this.shiftScene(sceneName, shiftAnima).then(resolve).catch(reject);
        })
    }
    //回到Home场景，并检查返回路径上的场景是否需要销毁
    public goHome(shiftAnima = ShiftAnima.simpleShift){
        this.blockInput.node.active = true;
        return new Promise((resolve, reject)=>{
            if(this.homeScene == this.curScene.node.name){
                resolve(this.curScene)
                this.blockInput.node.active = false;
                return;
            }
            //先弹出当前场景，但不销毁
            this.stack.pop();
            //检查并销毁路径上的场景
            let sceneName;
            while(this.stack.length > 0 
                    && (sceneName = this.stack[this.stack.length-1]) != this.homeScene){
                this.stack.pop();
                let sceneNode = this.content.getChildByName(sceneName);
                if(sceneNode){
                    let scene = sceneNode.getComponent(Scene);
                    if(scene && scene.autoDestroy){
                        sceneNode.destroy();
                        // this.content.removeChild(sceneNode);
                    }
                }
            }
            //从当前场景转换到Home场景
            this.shiftScene(this.homeScene, shiftAnima).then(resolve).catch(reject);
        })
    }
    //从当前场景转换到目标场景
    private shiftScene(targetSceneName, shiftAnima){
        return new Promise((resolve, reject)=>{
            this.loadScene(targetSceneName).then((newScene:Scene)=>{
                resolve(newScene);
                let oldScene = this.curScene;
                this.curScene = newScene;
                if(oldScene){
                    oldScene.onExitBegin();
                }
                newScene.onEnterBegin();
                DB.Set(Key.curScene, this.curScene);
                shiftAnima(oldScene, newScene, ()=>{
                    if(oldScene && oldScene.autoDestroy){
                        oldScene.onExitEnd();
                        oldScene.node.destroy();
                        // this.content.removeChild(oldScene.node);
                    }
                    newScene.onEnterEnd();
                    this.printState();
                    this.blockInput.node.active = false;
                });
            }).catch((e)=>{
                cc.error(e);
                reject();
                this.blockInput.node.active = false;
            });
        });
    }
    //获取场景对象，如果有缓存直接使用，没有则新建对象。
    private loadScene(sceneName:string){
        return new Promise((reslove, reject)=>{
            let sceneNode = this.content.getChildByName(sceneName);
            if(sceneNode){
                let scene:Scene = sceneNode.getComponent(Scene);
                reslove(scene);
            }else{
                cc.loader.loadRes("Scene/"+sceneName+"/"+sceneName, (err, prefab) => {
                    if(err){
                        cc.error(err);
                        return;
                    }
                    var newNode:cc.Node = cc.instantiate(prefab);
                    newNode.name = sceneName;
                    newNode.position = cc.Vec2.ZERO;
                    newNode.active = false;
                    let scene = newNode.getComponent(Scene);
                    if(scene){
                        this.content.addChild(scene.node, 0);
                        reslove(scene);
                    }else{
                        reject();
                    }
                });
            }
        });
    }
    //在content种找到场景实例，
    public findScene<T extends Scene>(type: {prototype: T}):T{
        return this.content.getComponentInChildren(type);
    }
    //打开面板
    public OpenPanelByName(name, callback = (panel)=>{}){
        this.curScene.OpenPanelByName(name,callback);
    }
    public OpenPanelByPath(path, callback = (panel)=>{}){
        this.curScene.OpenPanelByPath(path, callback);
    }
    //弹出最上层面板
    public popPanel(){
        if(this.curScene && this.curScene.panelStack){
            this.curScene.panelStack.PopCurrent();
        }
    }
    private printState(){
        let str = "\n++++++++++++SceneManager++++++++++++\n+ stack: ";
        for(let i=0; i<this.stack.length; i++){
            str += " >> "+this.stack[i];
        }
        str+="\n+ cache: ";
        for(let i=0;i<this.content.childrenCount;i++){
            str += `${i}:${this.content.children[i].name},`;
        }
        str += "\n++++++++++++++++++++++++++++++++++++\n"
        console.log(str);
    }
}




export namespace ShiftAnima{
    export function simpleShift(curScene:Scene, newScene:Scene, onFinish){
        if(curScene){
            curScene.node.active = false;
        }
        if(newScene){
            newScene.node.active = true;
        }
        onFinish();
    }
    export function moveLeftShift(curScene:Scene, newScene:Scene, finish){
        if(curScene){
            curScene.node.position = cc.v2(0, 0);
            cc.tween(curScene.node).to(0.5, {position: cc.v2(-ScreenRect.width, 0)}, { easing: 'quintOut'}).call(()=>{
                curScene.node.active = false;
            }).start();
        }
        if(newScene){
            newScene.node.position = cc.v2(ScreenRect.width, 0);
            newScene.node.active = true;
            cc.tween(newScene.node).to(0.5, {position: cc.v2(0, 0)}, { easing: 'quintOut'}).call(()=>{
                finish();
            }).start();
        }
    }
    export function moveRightShift(curScene:Scene, newScene:Scene, finish){
        if(curScene){
            curScene.node.position = cc.v2(0, 0);
            cc.tween(curScene.node).to(0.5, {position: cc.v2(ScreenRect.width, 0)}, { easing: 'quintOut'}).call(()=>{
                curScene.node.active = false;
            }).start();
        }
        if(newScene){
            newScene.node.position = cc.v2(-ScreenRect.width, 0);
            newScene.node.active = true;
            cc.tween(newScene.node).to(0.5, {position: cc.v2(0, 0)}, { easing: 'quintOut'}).call(()=>{
                finish();
            }).start();
        }
    }
    export function moveUpShift(curScene:Scene, newScene:Scene, finish){
        if(curScene){
            curScene.node.position = cc.v2(0, 0);
            cc.tween(curScene.node).to(0.5, {position: cc.v2(0, -ScreenRect.height)}, { easing: 'quintOut'}).call(()=>{
                curScene.node.active = false;
            }).start();
        }
        if(newScene){
            newScene.node.position = cc.v2(0, ScreenRect.height);
            newScene.node.active = true;
            cc.tween(newScene.node).to(0.5, {position: cc.v2(0, 0)}, { easing: 'quintOut'}).call(()=>{
                finish();
            }).start();
        }
    }
    export function moveDownShift(curScene:Scene, newScene:Scene, finish){
        if(curScene){
            curScene.node.position = cc.v2(0, 0);
            cc.tween(curScene.node).to(0.5, {position: cc.v2(0, ScreenRect.height)}, { easing: 'quintOut'}).call(()=>{
                curScene.node.active = false;
            }).start();
        }
        if(newScene){
            newScene.node.position = cc.v2(0, -ScreenRect.height);
            newScene.node.active = true;
            cc.tween(newScene.node).to(0.5, {position: cc.v2(0, 0)}, { easing: 'quintOut'}).call(()=>{
                finish();
            }).start();
        }
    }
    export function scaleShift(curScene:Scene, newScene:Scene, finish){
        if(curScene){
            curScene.node.scale = 1;
            cc.tween(curScene.node).to(1,{scale:0}).call(()=>{
                curScene.node.active = false;
            }).start();
        }
        if(newScene){
            curScene.node.scale = 0;
            newScene.node.active = true;
            cc.tween(newScene.node).delay(1).to(1000,{scale:1}).call(()=>{
                finish();
            }).start();
        }
    }
    export function blackShift(curScene:Scene, newScene:Scene, finish){
        let node = new cc.Node();
        node.color = cc.Color.BLACK;
        let sprite = node.addComponent(cc.Sprite);
        Util.loadRes("Atlas/UI/white",cc.SpriteFrame).then((spriteFrame:cc.SpriteFrame)=>{
            sprite.spriteFrame = spriteFrame;
            node.width = curScene.node.width;
            node.height = curScene.node.height;
            node.opacity = 0;
            curScene.node.addChild(node);
            cc.tween(node).to(0.15,{opacity:255}).call(()=>{
                curScene.node.active = false;
                node.removeFromParent();
                newScene.node.addChild(node);
                newScene.node.active = true;
            }).to(0.15,{opacity:0}).call(()=>{
                node.removeFromParent();
                finish();
            }).start();
        });
    }
}