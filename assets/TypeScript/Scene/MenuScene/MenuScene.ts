import Scene from "../../Frame/Scene";
import { Game } from "../../Game/Game";
import { DB } from "../../Frame/DataBind";
import { RankData } from "../../Frame/dts";
import { Util } from "../../Frame/Util";
import { Sound } from "../../Frame/Sound";
import SceneManager from "../../Frame/SceneManager";
import LoadingScene from "../LoadingScene/LoadingScene";
import { PrefabPath, Config } from "../../Frame/Config";
import PlayScene from "../PlayScene/PlayScene";
import MessageBox from "../../Frame/MessageBox";
import PaintPanel from "../../Panel/PaintPanel/PaintPanel";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";
import EditThemePanel from "../../Panel/EditThemePanel/EditThemePanel";
import { crossPlatform } from "../../Frame/CrossPlatform";
import ThemeCell from "./ThemeCell";
import { TweenUtil } from "../../Frame/TweenUtil";
import Top from "../../Frame/Top";
import PreviewPanel from "../../Panel/PreviewPanel/PreviewPanel";
import { OperationFlow } from "../../Game/OperationFlow";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("场景/MenuScene")
export default class MenuScene extends Scene {

    @property(Button)
    playBtn: Button = null;
    @property(Button)
    prepareBtn: Button = null;
    @property(Button)
    buyBtn: Button = null;
    @property(Button)
    drawBtn: Button = null;

    @property(Button)
    downloadBtn: Button = null;
    @property(Button)
    balloonBtn: Button = null;
    @property(Button)
    upgradeBtn: Button = null;

    @property(Button)
    optionBtn: Button = null;

    @property(Button)
    rankBtn: Button = null;

    @property(cc.Label)
    highScoreLabel: cc.Label = null;

    @property(cc.Node)
    themesCell:cc.Node = null;

    @property(cc.Node)
    themesContent:cc.Node = null;

    @property(cc.Node)
    title:cc.Node = null;

    @property(Button)
    leftTriangle:Button = null;

    @property(Button)
    rightTriangle:Button = null;

    onLoad () {
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.prepareBtn.node.on("click", this.onPrepareBtnTap, this);
        this.buyBtn.node.on("click", this.onBuyBtnTap, this);
        this.rankBtn.node.on("click", this.onRankBtnTap, this);

        this.downloadBtn.node.on("click", this.onDownloadBtnTap, this);
        this.balloonBtn.node.on("click", this.onBalloonBtnTap, this);
        this.upgradeBtn.node.on("click", this.onUpgradeBtnTap, this);

        this.optionBtn.node.on("click", this.onOptionBtnTap, this);
        this.drawBtn.node.on("click", this.onDrawBtnTap, this);
        this.leftTriangle.node.on("click", this.moveLeft, this);
        this.rightTriangle.node.on("click", this.moveRight, this);
        this.initHighScoreLabel();

        while(this.themesContent.childrenCount<4){
            let cell = cc.instantiate(this.themesCell);
            this.themesContent.addChild(cell,0);
        }
        this.node.on("updateThemeList", this.updateThemeList, this);
    }

    public updateThemeList(){
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        let centerIdx = Game.allThemes.findIndex((theme)=>{
            return theme.id == themeId;
        });
        let func = (centerOffset)=>{
            let childIdx = centerOffset+1;
            let scale = (centerOffset == 0? 1.2 : 0.5);
            let x = centerOffset * 150;
            let cell = this.themesContent.children[childIdx].getComponent(ThemeCell);
            let idx = (centerIdx+centerOffset+Game.allThemes.length)%Game.allThemes.length;
            let conf = Game.allThemes[idx];
            cell.setData(conf);
            cell.node.scale = scale;
            cell.node.x = x;
        }
        func(-1);
        func(0);
        func(1);
        func(2);
        let open = Game.isThemeOpen(themeId);
        this.playBtn.node.active = open && !theme.isCustom;
        this.buyBtn.node.active = !open && !theme.isCustom;
        this.prepareBtn.node.active = theme.isCustom;
    }
    public moveRight(){
        this.move(1);
    }
    public moveLeft(){
        this.move(-1);
    }
    public move(dir){
        Top.blockInput(true);
        let themeId = DB.Get(Key.ThemeId);
        let idx = Game.allThemes.findIndex((theme)=>{
            return theme.id == themeId;
        });
        //屏幕外移入的cell
        let newIdx = (idx+dir*2+Game.allThemes.length)%Game.allThemes.length;
        let temp = this.themesContent.children[3].getComponent(ThemeCell);
        temp.setData(Game.allThemes[newIdx]);
        temp.node.scale = 0.5;
        temp.node.x = dir*2 * 150;
        //新的选择的cell
        newIdx = (idx+dir+Game.allThemes.length)%Game.allThemes.length;
        themeId = Game.allThemes[newIdx].id;
        DB.SetLoacl(Key.ThemeId, themeId);
        let open = Game.isThemeOpen(themeId);
        let theme = Game.findThemeConf(themeId);
        this.playBtn.node.active = open && !theme.isCustom;
        this.buyBtn.node.active = !open && !theme.isCustom;
        this.prepareBtn.node.active = theme.isCustom;

        for(let i=0; i<this.themesContent.childrenCount; i++){
            let cellNode = this.themesContent.children[i];
            let cell = cellNode.getComponent(ThemeCell);
            let scale = (cell.data.id == themeId? 1.2 : 0.5);
            let tw = cc.tween(cellNode)
                .to(0.1,{x:cellNode.x-150*dir, scale:scale},{easing:cc.easing.cubicOut})
                .call(()=>{
                    //移除的cell
                    if(Math.abs(cellNode.x) > this.themesContent.width/2){
                        Top.blockInput(false);
                        cellNode.setSiblingIndex(3);
                    }
                });
            tw.start();
        }
    }
    onEnterScene(){
        this.updateThemeList();
        let btnAnim = (node:cc.Node, delay, callback = null)=>{
            node.scale = 0;
            node.angle = 20;
            cc.tween(node).delay(delay).to(0.5,{scale:1, angle:0},{easing:cc.easing.backOut}).call(()=>{
                if(callback){
                    callback();
                }
            }).start();
        }
        this.playTitleAnim();
        let playTimes = DB.Get(Key.PlayTimes);
        this.drawBtn.node.active = playTimes >= Config.unlockPaintTimes;  //新玩家，不显示画笔按钮
        btnAnim(this.themesContent, 0.2);
        btnAnim(this.playBtn.node, 0.4, ()=>{
            if(playTimes < 1){
                TweenUtil.applyBreath(this.playBtn.node);
            }
        });
        btnAnim(this.buyBtn.node, 0.4);
        btnAnim(this.prepareBtn.node, 0.4);
        btnAnim(this.rankBtn.node, 0.4);
        btnAnim(this.balloonBtn.node, 0.4);
        btnAnim(this.leftTriangle.node, 0.5);
        btnAnim(this.rightTriangle.node, 0.5);
        btnAnim(this.drawBtn.node, 0.5, ()=>{
            if(playTimes >= Config.unlockPaintTimes && DB.Get(Key.CustomHeros).length < 1){
                TweenUtil.applyBreath(this.drawBtn.node);
            }
        });
        btnAnim(this.downloadBtn.node, 0.5);
        btnAnim(this.upgradeBtn.node, 0.5);
        btnAnim(this.buyBtn.node, 0.4);
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
        this.enterPlayScene();
    }
    private onPrepareBtnTap(){
        this.OpenPanelByName("EditThemePanel",(panel:EditThemePanel)=>{
            panel.playCallback = this.enterPlayScene;
        });
    }
    private enterPlayScene(){
        Sound.play("gameStartBtn");
        SceneManager.ins.Enter("LoadingScene")
            .then((loadingScene:LoadingScene)=>{
                loadingScene.Load([
                    PrefabPath.shield,
                    PrefabPath.heart,
                    PrefabPath.coinBag,
                    // PrefabPath.clock,
                    PrefabPath.monster,
                ]).then(()=>{
                    SceneManager.ins.Enter("PlayScene").then((playScene:PlayScene)=>{
                        playScene.restart();
                    });
                });
            });
    }
    private onBuyBtnTap(){
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
                    crossPlatform.reportAnalytics('buyTheme', {
                        timeStamp: new Date().getTime(),
                        themeId: DB.Get(Key.ThemeId),
                    });
                }
            })
        }
    }
    private onRankBtnTap(){
        this.OpenPanelByName("RankPanel");
    }
    private onOptionBtnTap(){
        this.OpenPanelByName("OptionPanel");
    }
    public onDrawBtnTap(){
        DB.SetLoacl(Key.guideUnlockPaint, true);
        OperationFlow.drawHeroFlow((hero,theme)=>{
            this.updateThemeList();
            this.drawBtn.node.stopAllActions();
            this.drawBtn.node.scale = 1;
        });
    }

    onDownloadBtnTap(){
        this.OpenPanelByName("CreativeSpacePanel");
    }

    onBalloonBtnTap(){
        this.OpenPanelByName("BalloonPanel");
    }

    onUpgradeBtnTap(){
        this.OpenPanelByName("UpgradePanel");
    }
}