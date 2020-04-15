import Scene from "../CocosFrame/Scene";
import SceneManager, { ShiftAnima } from "../CocosFrame/SceneManager";
import LoadingScene from "../LoadingScene/LoadingScene";
import { PrefabPath, Config } from "../CocosFrame/Config";
import { DB } from "../CocosFrame/DataBind";
import { RankData, DramaData } from "../CocosFrame/dts";
import { Util } from "../CocosFrame/Util";
import PlayScene from "../PlayScene/PlayScene";
import { Game } from "../Game";
import { Sound } from "../CocosFrame/Sound";
import ScrollList from "../CustomUI/ScrollList";
import PaintPanel from "../Panel/PaintPanel/PaintPanel";
import EditDramaPanel from "../Panel/EditDramaPanel/EditDramaPanel";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("场景/MenuScene")
export default class MenuScene extends Scene {

    @property(cc.Button)
    playBtn: cc.Button = null;
    @property(cc.Button)
    drawBtn: cc.Button = null;

    @property(cc.Button)
    optionBtn: cc.Button = null;
    @property(cc.Button)
    rankBtn: cc.Button = null;

    @property(cc.Label)
    highScoreLabel: cc.Label = null;

    @property(ScrollList)
    dramaList:ScrollList = null;

    @property(cc.Node)
    title:cc.Node = null;
    onLoad () {
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.rankBtn.node.on("click", this.onRankBtnTap, this);
        this.optionBtn.node.on("click", this.onOptionBtnTap, this);
        this.drawBtn.node.on("click", this.onDrawBtnTap, this);
        this.dramaList.node.on(ScrollList.SELECT_CHILD, this.onSelectChild, this);
        this.initHighScoreLabel();
        this.updateDramaList();
    }
    public updateDramaList(){
        let arr = [null].concat(Game.allDramas).concat([null]);
        this.dramaList.setDataArr(arr);
        let dramaId = DB.Get("user/dramaId");
        let drama = Game.findDramaConf(dramaId);
        this.dramaList.selectItemByData(drama);
        this.dramaList.centerOnData(drama);
    }
    onSelectChild(item, data:DramaData){
        if(data){
            DB.SetLoacl("user/dramaId", data.id);
        }
    }
    onEnterScene(){
        let btnAnim = (node:cc.Node, delay)=>{
            node.scale = 0;
            node.angle = 20;
            cc.tween(node).delay(delay).to(0.5,{scale:1, angle:0},{easing:cc.easing.backOut}).start();
        }
        this.playTitleAnim();
        btnAnim(this.dramaList.node, 0.2);
        btnAnim(this.playBtn.node, 0.4);
        btnAnim(this.drawBtn.node, 0.5);
        btnAnim(this.rankBtn.node, 0);
        btnAnim(this.optionBtn.node, 0);

    }
    public playTitleAnim(){
        let func = (node:cc.Node, delay)=>{
            let scale = node.scale;
            let y = node.y;
            node.scale = 0;
            node.y = y+30;
            node.opacity = 0;
            cc.tween(node).delay(delay).to(0.5, {scale:scale, y:y, opacity:255}, { easing: cc.easing.backOut}).start();
        }
        let nodes = [];
        for(let i=1;i<=this.title.childrenCount;i++){
            let node = this.title.getChildByName(`titleWord${i}`);
            if(node){
                nodes.push(node);
            }
        }
        for(let i=0;i<nodes.length; i++){
            func(nodes[i], i*0.05);
        }
    }

    onDestroy(){
        this.playBtn.node.off("click", this.onPlayBtnTap, this);
        this.rankBtn.node.off("click", this.onRankBtnTap, this);
        this.optionBtn.node.off("click", this.onOptionBtnTap, this);
    }
    private initHighScoreLabel(){
        let rankDatas:RankData[] = DB.Get("user/rankDatas");
        if(rankDatas.length == 0){
            this.highScoreLabel.node.active = false;
        }else{
            this.highScoreLabel.node.active = true;
            let time = Util.fixedNum(rankDatas[0].time, 2);
            this.highScoreLabel.string = `最高纪录：${time}秒！`;
        }
    }
    private onPlayBtnTap(){
        let func = ()=>{
            Sound.play("gameStartBtn");
            SceneManager.ins.Enter("LoadingScene")
            .then((loadingScene:LoadingScene)=>{
                loadingScene.Load([
                    PrefabPath.shield,
                    PrefabPath.heart,
                    PrefabPath.monster,
                ]).then(()=>{
                    SceneManager.ins.Enter("PlayScene").then((playScene:PlayScene)=>{
                        playScene.restart(DB.Get("user/dramaId"));
                    });
                });
            });
        }
        let drama = Game.findDramaConf(DB.Get("user/dramaId"));
        if(drama.isCustom){
            this.OpenPanelByName("EditDramaPanel",(panel:EditDramaPanel)=>{
                panel.playCallback = func;
            });
        }else{
            func();
        }
    }
    private onRankBtnTap(){
        Sound.play("clickBtn");
        this.OpenPanelByName("RankPanel");
    }
    private onOptionBtnTap(){
        Sound.play("clickBtn");
        this.OpenPanelByName("OptionPanel");
    }
    private onDrawBtnTap(){
        Sound.play("clickBtn");
        SceneManager.ins.OpenPanelByName("PaintPanel",(panel:PaintPanel)=>{
            panel.saveCallback = (path)=>{
                let hero = Game.newHeroConf("角色", path);
                let drama = Game.newDramaConf(hero.id);
                DB.SetLoacl("user/dramaId", drama.id);
                this.updateDramaList();
            }
        });
    }
}
