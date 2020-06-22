import Scene from "../../Frame/Scene";
import { Game } from "../../Game/Game";
import { DB } from "../../Frame/DataBind";
import { RankData, ThemeData } from "../../Frame/dts";
import { Util } from "../../Frame/Util";
import SceneManager, { ShiftAnima } from "../../Frame/SceneManager";
import {Config } from "../../Frame/Config";
import MessageBox from "../../Frame/MessageBox";
import Button from "../../CustomUI/Button";
import { Key } from "../../Game/Key";
import EditThemePanel from "../../Panel/EditThemePanel/EditThemePanel";
import { crossPlatform, AppName, systemInfo } from "../../Frame/CrossPlatform";
import ThemeCell from "./ThemeCell";
import { TweenUtil } from "../../Frame/TweenUtil";
import Top from "../../Frame/Top";
import { OperationFlow } from "../../Game/OperationFlow";
import PaintScene from "../../Panel/PaintPanel/PaintScene";
import PanelStack from "../../Frame/PanelStack";
import PanelQueue from "../../Frame/PanelQueue";
import RewardPanel from "../../Panel/RewardPanel/RewardPanel";
import LuckyCatPanel from "../../Panel/LuckyCatPanel/LuckyCatPanel";
import LuckyCatBtn from "./LuckyCatBtn";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("场景/MenuScene")
export default class MenuScene extends Scene {
    @property(Button)
    playBtn: Button = null;
    @property(Button)
    drawBtn: Button = null;

    @property(Button)
    shopBtn: Button = null;
    @property(Button)
    spaceBtn: Button = null;
    @property(Button)
    collectGameBtn: Button = null;

    @property(Button)
    gashaBtn: Button = null;
    @property(Button)
    upgradeBtn: Button = null;

    @property(Button)
    optionBtn: Button = null;

    @property(Button)
    rankBtn: Button = null;

    @property(LuckyCatBtn)
    luckyCatBtn: LuckyCatBtn = null;

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

    @property(cc.Node)
    coinPos: cc.Node = null;

    @property(cc.Node)
    diamondPos: cc.Node = null;

    @property(PanelQueue)
    panelQueue: PanelQueue = null;

    onLoad () {
        this.playBtn.node.on("click", this.onPlayBtnTap, this);
        this.rankBtn.node.on("click", this.onRankBtnTap, this);

        this.shopBtn.node.on("click", this.onShopBtnTap, this);
        this.spaceBtn.node.on("click", this.onSpaceBtnTap, this);
        this.collectGameBtn.node.on("click", this.onCollectGameBtnTap, this);

        
        this.gashaBtn.node.on("click", this.onGashaBtnTap, this);
        this.upgradeBtn.node.on("click", this.onUpgradeBtnTap, this);

        this.optionBtn.node.on("click", this.onOptionBtnTap, this);
        this.drawBtn.node.on("click", this.onDrawBtnTap, this);
        this.leftTriangle.node.on("click", this.moveLeft, this);
        this.rightTriangle.node.on("click", this.moveRight, this);
        this.Bind(Key.RankDatas,this.initHighScoreLabel);
        while(this.themesContent.childrenCount<4){
            let cell = cc.instantiate(this.themesCell);
            this.themesContent.addChild(cell,0);
        }
        this.node.on("updateThemeList", this.updateThemeList, this);
        this.node.on("gainCoin", (evt:cc.Event.EventCustom)=>{
            OperationFlow.flyCoin({
                cnt:evt.detail.cnt,
                fromNode:evt.target,
                toNode:this.coinPos,
                onArrive:(addCnt)=>{
                    Game.addCoin(addCnt);
                }
            });
        }, this);
        this.node.on("gainDiamond", (evt:cc.Event.EventCustom)=>{
            OperationFlow.flyDiamond({
                cnt:evt.detail.cnt,
                fromNode:evt.target,
                toNode:this.diamondPos,
                onArrive:(addCnt)=>{
                    Game.addDiamond(addCnt);
                }
            });
        }, this);
        this.updateThemeList();
        this.Bind(Key.guideCollectGameBegin, (state)=>{
            this.collectGameBtn.node.active = (state!=2) && AppName.Douyin == systemInfo.appName;
        });
    }

    public updateThemeList(){
        let themes:ThemeData[] = DB.Get(Key.CustomThemes);
        themes = themes.concat();
        for(let i=0; i<Config.themes.length; i++){
            let theme = Config.themes[i];
            if(Game.isThemeOpen(theme.id)){
                themes.push(theme);
            }
        }
        let themeId = DB.Get(Key.ThemeId);
        let theme = Game.findThemeConf(themeId);
        let centerIdx = themes.findIndex((theme)=>{
            return theme.id == themeId;
        });
        let func = (centerOffset)=>{
            let childIdx = centerOffset+1;
            let scale = (centerOffset == 0? 1.2 : 0.5);
            let x = centerOffset * 150;
            let cell = this.themesContent.children[childIdx].getComponent(ThemeCell);
            let idx = (centerIdx+centerOffset+themes.length)%themes.length;
            let conf = themes[idx];
            cell.setData(conf);
            cell.node.scale = scale;
            cell.node.x = x;
        }
        func(-1);
        func(0);
        func(1);
        func(2);
        let open = Game.isThemeOpen(themeId);
        this.playBtn.node.active = open || theme.isCustom;
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
        let themes:ThemeData[] = DB.Get(Key.CustomThemes);
        themes = themes.concat();
        for(let i=0; i<Config.themes.length; i++){
            let theme = Config.themes[i];
            if(Game.isThemeOpen(theme.id)){
                themes.push(theme);
            }
        }
        let idx = themes.findIndex((theme)=>{
            return theme.id == themeId;
        });
        //屏幕外移入的cell
        let newIdx = (idx+dir*2+themes.length)%themes.length;
        let temp = this.themesContent.children[3].getComponent(ThemeCell);
        temp.setData(themes[newIdx]);
        temp.node.scale = 0.5;
        temp.node.x = dir*2 * 150;
        //新的选择的cell
        newIdx = (idx+dir+themes.length)%themes.length;
        themeId = themes[newIdx].id;
        DB.Set(Key.ThemeId, themeId);
        let open = Game.isThemeOpen(themeId);
        let theme = Game.findThemeConf(themeId);
        this.playBtn.node.active = open || theme.isCustom;

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
    onShow(data){
        //从我的-小程序进入奖励
        if(data && data.scene == "021001" && DB.Get(Key.guideCollectGameBegin) == 1){
            this.panelQueue.pushPanel("RewardPanel",(panel:RewardPanel)=>{
                panel.setStyle({
                    title:"收藏游戏奖励",
                    btnText:"领取"
                })
                panel.loadDiamondContent(Config.collectGameDiamodCnt,()=>{
                    panel.node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:Config.collectGameDiamodCnt}));
                    DB.Set(Key.guideCollectGameBegin, 2);
                });
            });
        }
        //离线收益
        if(Game.isLuckyCatOpen() && !LuckyCatPanel.opening){
            let coin = Game.getLuckyCatCoin();
            if(coin >= 100){
                this.panelQueue.pushPanel("LuckyCatPanel");
            }
        }
        this.panelQueue.checkNext();
    }
    onEnterBegin(){
        // this.updateThemeList();
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

        btnAnim(this.highScoreLabel.node, 0.2);
        btnAnim(this.themesContent, 0.2);

        btnAnim(this.leftTriangle.node, 0.5);
        btnAnim(this.rightTriangle.node, 0.5);
        //顶部按钮
        btnAnim(this.optionBtn.node, 0);
        btnAnim(this.rankBtn.node, 0.1);
        btnAnim(this.collectGameBtn.node, 0.2);

        //第一层
        btnAnim(this.shopBtn.node, 0.4);
        btnAnim(this.playBtn.node, 0.4);
        btnAnim(this.gashaBtn.node, 0.4);

        //第二层
        btnAnim(this.drawBtn.node, 0.5);  
        btnAnim(this.upgradeBtn.node, 0.5);
        btnAnim(this.spaceBtn.node, 0.5);


        let isLuckyCatOpen = Game.isLuckyCatOpen();
        if(isLuckyCatOpen){
            this.luckyCatBtn.node.active = true;
        }else{
            if(DB.Get(Key.PlayTimes) > 2){
                Game.resetLuckyCat();
                this.luckyCatBtn.node.active = true;
            }else{
                this.luckyCatBtn.node.active = false;
            }
        }
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

    private initHighScoreLabel(rankDatas:RankData[]){
        // let rankDatas:RankData[] = DB.Get(Key.RankDatas);
        if(rankDatas.length == 0){
            this.highScoreLabel.node.active = false;
        }else{
            this.highScoreLabel.node.active = true;
            let time = Util.fixedNum(rankDatas[0].time, 2);
            this.highScoreLabel.string = `最高纪录：${time}秒！`;
        }
    }
    private onPlayBtnTap(){
        let themeId = DB.Get(Key.ThemeId); 
        let conf = Game.findThemeConf(themeId);
        if(conf.isCustom){
            this.OpenPanelByName("EditThemePanel",(panel:EditThemePanel)=>{
                panel.playCallback = ()=>{
                    this.enterPlayScene();
                };
            });
        }else{
            this.enterPlayScene();
        }
    }
    private enterPlayScene(){
        OperationFlow.enterPlayScene(()=>{});
    }

    private onRankBtnTap(){
        this.OpenPanelByName("RankPanel");
    }
    private onOptionBtnTap(){
        this.OpenPanelByName("OptionPanel");
    }
    public onDrawBtnTap(){
        DB.Set(Key.guideUnlockPaint, true);
        SceneManager.ins.Enter("PaintScene").then((paintScene:PaintScene)=>{
            paintScene.drawHero(()=>{
                this.updateThemeList();
                this.drawBtn.node.stopAllActions();
                this.drawBtn.node.scale = 1;
            });
        });
    }

    onSpaceBtnTap(){
        Top.showToast("【创意空间】紧急开发中");
    }
    onShopBtnTap(){
        SceneManager.ins.Enter("ShopScene",ShiftAnima.moveRightShift);
    }
    onGashaBtnTap(){
        SceneManager.ins.Enter("GashaScene",ShiftAnima.moveLeftShift);
    }

    onCollectGameBtnTap(){
        this.OpenPanelByName("CollectGamePanel");
    }
    onUpgradeBtnTap(){
        this.OpenPanelByName("UpgradePanel");
    }
}