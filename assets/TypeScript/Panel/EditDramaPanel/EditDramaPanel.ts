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
import { Game } from "../../Game";
import { DB } from "../../CocosFrame/DataBind";
import SceneManager from "../../CocosFrame/SceneManager";
import { Sound } from "../../CocosFrame/Sound";
import Top from "../../CocosFrame/Top";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/EditDramaPanel")
export default class EditDramaPanel extends Panel {
    @property(ScrollList)
    usingMonsterList:ScrollList = null;
    @property(ScrollList)
    allMonsterList:ScrollList = null;

    @property(cc.Button)
    playBtn:cc.Button = null;
    playCallback = null;
    onLoad(){
        super.onLoad();
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.Bind("user/customMonsters",()=>{
            let arr:any[] = [{createNew:true}].concat(Game.allMonsters);
            this.allMonsterList.setDataArr(arr);
        });
        this.Bind("user/dramaId", (dramaId)=>{
            let drama = Game.findDramaConf(dramaId);
            let monsterIds = drama.monsterIds.concat();
            let arr = [];
            for(let i=0; i<monsterIds.length; i++){
                arr.push({id:monsterIds[i]});
            }
            this.usingMonsterList.setDataArr(arr);
        })
    }
    onPlayBtnTap(){
        Sound.play("clickBtn");
        let dramaId = DB.Get("user/dramaId");
        let drama = Game.findDramaConf(dramaId);
        if(drama.monsterIds.length>0){
            if(this.playCallback){
                this.playCallback();
            }
        }else{
            Top.ins.showToast("最少选择1个");
        }
    }

}
