import Scene from "../../Frame/Scene";
import ScrollList from "../../CustomUI/ScrollList";
import { Game } from "../../Game/Game";
import { DB } from "../../Frame/DataBind";
import { ThemeData, RankData } from "../../Frame/dts";
import { Util } from "../../Frame/Util";
import { Sound } from "../../Frame/Sound";
import SceneManager from "../../Frame/SceneManager";
import LoadingScene from "../LoadingScene/LoadingScene";
import { PrefabPath } from "../../Frame/Config";
import PlayScene from "../PlayScene/PlayScene";
import MessageBox from "../../Frame/MessageBox";
import PaintPanel from "../../Panel/PaintPanel/PaintPanel";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";
import EditThemePanel from "../../Panel/EditThemePanel/EditThemePanel";


const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("场景/MenuScene")
export default class MenuScene extends Scene {

    @property(Button)
    playBtn: Button = null;
    @property(Button)
    buyBtn: Button = null;
    @property(Button)
    drawBtn: Button = null;

    @property(Button)
    optionBtn: Button = null;
    @property(Button)
    rankBtn: Button = null;

    @property(cc.Label)
    highScoreLabel: cc.Label = null;

    @property(ScrollList)
    themeList:ScrollList = null;

    @property(cc.Node)
    title:cc.Node = null;
    onLoad () {
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.buyBtn.node.on("click", this.onBuyBtnTap, this);
        this.rankBtn.node.on("click", this.onRankBtnTap, this);
        this.optionBtn.node.on("click", this.onOptionBtnTap, this);
        this.drawBtn.node.on("click", this.onDrawBtnTap, this);
        this.themeList.node.on(ScrollList.SELECT_CHILD, this.onSelectChild, this);
        this.initHighScoreLabel();
        this.updateThemeList();
    }
    public updateThemeList(){
        let arr = [null].concat(Game.allThemes).concat([null]);
        this.themeList.setDataArr(arr);
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        this.themeList.centerOnData(theme);
        this.themeList.selectItemByData(theme);
    }
    onSelectChild(item, data:ThemeData){
        if(data){
            DB.SetLoacl(Key.ThemeId, data.id);
            let open = Game.isThemeOpen(data.id);
            this.playBtn.node.active = open;
            this.buyBtn.node.active = !open;
        }
    }
    onEnterScene(){
        let btnAnim = (node:cc.Node, delay)=>{
            node.scale = 0;
            node.angle = 20;
            cc.tween(node).delay(delay).to(0.5,{scale:1, angle:0},{easing:cc.easing.backOut}).start();
        }
        this.playTitleAnim();
        btnAnim(this.themeList.node, 0.2);
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
        this.buyBtn.node.off("click", this.onBuyBtnTap, this);
        this.rankBtn.node.off("click", this.onRankBtnTap, this);
        this.optionBtn.node.off("click", this.onOptionBtnTap, this);
    }
    private initHighScoreLabel(){
        let rankDatas:RankData[] = DB.Get(Key.RankDatas);
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
                    PrefabPath.coinBag,
                    PrefabPath.clock,
                    PrefabPath.monster,
                ]).then(()=>{
                    SceneManager.ins.Enter("PlayScene").then((playScene:PlayScene)=>{
                        playScene.restart();
                    });
                });
            });
        }
        let theme = Game.findThemeConf(DB.Get(Key.ThemeId));
        if(theme.isCustom){
            this.OpenPanelByName("EditThemePanel",(panel:EditThemePanel)=>{
                panel.playCallback = func;
            });
        }else{
            func();
        }
    }
    private onBuyBtnTap(){
        Sound.play("clickBtn");
        let coin = DB.Get(Key.Coin);
        let themeId = DB.Get(Key.ThemeId);
        let conf = Game.findThemeConf(themeId);
        if(coin < conf.cost){
            SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
                messageBox.label.string = "金币不足";
            })
        }else{
            SceneManager.ins.OpenPanelByName("MessageBox",(messageBox:MessageBox)=>{
                messageBox.label.string = "是否购买主题？";
                messageBox.onOk = ()=>{
                    DB.SetLoacl(Key.Coin, coin-conf.cost);
                    Game.openTheme(conf.id);
                    this.updateThemeList();
                }
            })
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
        // var bezier = [cc.v2(0, 0), cc.v2(200, 300), cc.v2(0, 500)];
        // this.drawBtn.node.runAction(cc.sequence(cc.bezierTo(2, bezier), cc.callFunc(()=>{
        //     Top.showToast("asdf");
        // })));
        // Top.bezierSprite({
        //     url:"Atlas/UI/coin",
        //     from:Util.convertPosition(this.drawBtn.node, Top.node),
        //     to:Util.convertPosition(Top.coinBar.iconPos, Top.node),
        // });
        // return;
        Sound.play("clickBtn");
        SceneManager.ins.OpenPanelByName("PaintPanel",(panel:PaintPanel)=>{
            panel.saveCallback = (path)=>{
                let hero = Game.newHeroConf("角色", path);
                let theme = Game.newThemeConf(hero.id);
                DB.SetLoacl(Key.ThemeId, theme.id);
                this.updateThemeList();
            }
        });
    }
}
