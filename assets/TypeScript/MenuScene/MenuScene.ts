import Scene from "../CocosFrame/Scene";
import SceneManager, { ShiftAnima } from "../CocosFrame/SceneManager";
import LoadingScene from "../LoadingScene/LoadingScene";
import { PrefabPath, Config } from "../CocosFrame/Config";
import { DB } from "../CocosFrame/DataBind";
import StagePoint, { State } from "./StagePoint";
import { RankData } from "../CocosFrame/dts";
import { Util } from "../CocosFrame/Util";
import PlayScene from "../PlayScene/PlayScene";
import { Game } from "../Game";
import { AudioManager } from "../CocosFrame/AudioManager";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("场景/MenuScene")
export default class MenuScene extends Scene {

    @property(cc.Button)
    playBtn: cc.Button = null;

    @property(cc.Button)
    optionBtn: cc.Button = null;
    @property(cc.Button)
    rankBtn: cc.Button = null;
    @property(cc.Button)
    heroBtn: cc.Button = null;
    @property(cc.Button)
    monsterBtn: cc.Button = null;
    @property(cc.Button)
    downloadBtn: cc.Button = null;

    @property(StagePoint)
    stagePoint: StagePoint = null;
    @property(cc.Label)
    stageLabel: cc.Label = null;

    @property(cc.Label)
    highScoreLabel: cc.Label = null;

    @property(cc.Sprite)
    heroSprite:cc.Sprite = null;
    onLoad () {
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.heroBtn.node.on("click", this.onHeroBtnTap, this);
        this.monsterBtn.node.on("click", this.onMonsterBtnTap, this);
        this.rankBtn.node.on("click", this.onRankBtnTap, this);
        this.optionBtn.node.on("click", this.onOptionBtnTap, this);
        this.downloadBtn.node.on("click", this.onDownloadBtnTap, this);
        this.initStageProgress();
        this.initHighScoreLabel();
        this.Bind("user/usingHeroId", (id)=>{
            let arr = Config.heros.concat(DB.Get("user/customHeros"));
            let hero = arr.find((data)=>{
                return data.id == id;
            });
            if(hero){
                Game.loadTexture(hero.url, (texture)=>{
                    this.heroSprite.spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        });
    }
    onEnterScene(){
        let btnAnim = (node:cc.Node, delay)=>{
            node.scale = 0;
            node.angle = 50;
            cc.tween(node).delay(delay).to(0.5,{scale:1, angle:0},{easing:cc.easing.backOut}).start();
        }
        btnAnim(this.heroBtn.node, 0);
        btnAnim(this.monsterBtn.node, 0.1);
        btnAnim(this.downloadBtn.node, 0.2);
        btnAnim(this.playBtn.node, 0.4);

        btnAnim(this.rankBtn.node, 0);
        btnAnim(this.optionBtn.node, 0);
    }
    onDestroy(){
        this.playBtn.node.off("click", this.onPlayBtnTap, this);
        this.monsterBtn.node.off("click", this.onCreateBtnTap, this);
        this.rankBtn.node.off("click", this.onRankBtnTap, this);
        this.optionBtn.node.off("click", this.onOptionBtnTap, this);
        this.downloadBtn.node.off("click", this.onDownloadBtnTap, this);
    }
    private initStageProgress(){
        let stage = DB.Get("user/stage");
        this.stageLabel.string = `第${stage}关`;
        let parent = this.stagePoint.node.parent;
        let max = 5;
        for(let i=parent.childrenCount; i<max; i++){
            let node = cc.instantiate(this.stagePoint.node);
            parent.addChild(node);
        }

        let idx = (stage-1) % max;
        for(let i=0; i<parent.childrenCount; i++){
            let point = parent.children[i].getComponent(StagePoint);
            if(i<idx){
                point.setState(State.Passed);
            }else if(i>idx){
                point.setState(State.Lock);
            }else{
                point.setState(State.Current);
            }
        }
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
    private onRankBtnTap(){
        AudioManager.playSound("clickBtn");
        this.OpenPanelByName("RankPanel");
    }
    private onOptionBtnTap(){
        AudioManager.playSound("clickBtn");
        this.OpenPanelByName("OptionPanel");
    }
    private onDownloadBtnTap(){
        AudioManager.playSound("clickBtn");
        // this.OpenPanelByName("DownloadPanel");
    }
    private onCreateBtnTap(){
        AudioManager.playSound("clickBtn");
        this.OpenPanelByName("CreationPanel");
    }
    private onMonsterBtnTap(){
        AudioManager.playSound("clickBtn");
        this.OpenPanelByName("MonsterPanel");
    }
    private onHeroBtnTap(){
        AudioManager.playSound("clickBtn");
        this.OpenPanelByName("HeroPanel");
    }
}
