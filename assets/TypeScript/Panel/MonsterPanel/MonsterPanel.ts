// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Panel from "../../CocosFrame/Panel";
import ScrollList from "../../CustomUI/ScrollList";
import SceneManager from "../../CocosFrame/SceneManager";
import { PrefabPath, Config } from "../../CocosFrame/Config";
import LoadingScene from "../../LoadingScene/LoadingScene";
import PlayScene from "../../PlayScene/PlayScene";
import { AudioManager } from "../../CocosFrame/AudioManager";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/MonsterPanel")
export default class MonsterPanel extends Panel {

    @property(ScrollList)
    scrollList: ScrollList = null;
    @property(cc.Button)
    playBtn: cc.Button = null;
    onLoad(){
        super.onLoad();
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.Bind("user/customMonsters",(customMonsters:any[])=>{
            let arr:any[] = [{createNew:true}].concat(customMonsters).concat(Config.monsters);
            this.scrollList.setDataArr(arr);
        });
    }
    onPlayBtnTap(){
        AudioManager.playSound("gameStartBtn");
        SceneManager.ins.Enter("LoadingScene")
            .then((loadingScene:LoadingScene)=>{
                loadingScene.Load([
                    PrefabPath.shield,
                    PrefabPath.heart,
                    PrefabPath.monster,
                ]).then(()=>{
                    SceneManager.ins.Enter("PlayScene").then((playScene:PlayScene)=>{
                        playScene.restart();
                    });
                });
            });
    }
}
