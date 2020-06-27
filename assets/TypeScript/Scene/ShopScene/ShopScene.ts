// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Scene from "../../Frame/Scene";
import Button from "../../CustomUI/Button";
import SceneManager, { ShiftAnima } from "../../Frame/SceneManager";
import MenuScene from "../MenuScene/MenuScene";
import GoodsCell from "./GoodsCell";
import { Key } from "../../Game/Key";
import { DB } from "../../Frame/DataBind";
import { Config } from "../../Frame/Config";
import { Game } from "../../Game/Game";
import { ThemeData } from "../../Frame/dts";
import { OperationFlow } from "../../Game/OperationFlow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShopScene extends Scene {

    @property(Button)
    backBtn: Button = null;

    @property(Button)
    leftBtn: Button = null;

    @property(Button)
    rightBtn: Button = null;

    @property(cc.Node)
    page: cc.Node = null;

    @property(cc.Label)
    pageNameLabel: cc.Label = null;
    
    @property(GoodsCell)
    goodsCellPrefab: GoodsCell = null;
    
    @property(cc.Node)
    obtainedNode:cc.Node = null;

    @property(Button)
    buyBtn:Button = null;

    @property(cc.Sprite)
    sprite:cc.Sprite = null;

    @property(cc.Node)
    coinNode: cc.Node = null;

    @property(cc.Node)
    diamondNode: cc.Node = null;


    @property(cc.Node)
    coinPos: cc.Node = null;


    @property(cc.Node)
    diamondPos: cc.Node = null;

    pageIdx = 0;
    pageSize = 6;
    lastCell:GoodsCell = null;
    lastTheme:ThemeData = null;
    onLoad(){
        this.backBtn.node.on("click", this.onBackBtnTap, this);
        this.leftBtn.node.on("click", this.onLeftBtnTap, this);
        this.rightBtn.node.on("click", this.onRightBtnTap, this);
        this.buyBtn.node.on("click", this.onBuyBtnTap, this);
        this.node.on("clickGoodsCell", this.onClickGoodsCell, this);
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
        this.updatePage();   
    }

    updatePage(){
        this.lastCell = null;
        this.lastTheme = null;

        this.leftBtn.interactable = this.pageIdx > 0;
        this.rightBtn.interactable = this.pageIdx < Config.shopPages.length-1;
        
        let pageData = Config.shopPages[this.pageIdx];
        this.pageNameLabel.string = pageData.name;
        while(this.page.childrenCount < this.pageSize){
            let node = cc.instantiate(this.goodsCellPrefab.node);
            this.page.addChild(node);
        }
        let first = true;
        for(let i=0; i<this.pageSize; i++){
            let cell = this.page.children[i].getComponent(GoodsCell);
            if(i<pageData.themeIds.length){
                cell.node.active = true;
                let themeData = Game.findThemeConf(pageData.themeIds[i]);
                cell.setData(themeData);
                cell.setSelect(false);
                if(first && !Game.isThemeOpen(themeData.id)){
                    first = false;
                    this.selectCell(cell, themeData);
                }
            }else{
                cell.node.active = false;
            }
        }
    }
    onLeftBtnTap(){
        this.pageIdx--;
        this.updatePage();
    }

    onRightBtnTap(){
        this.pageIdx++;
        this.updatePage();
    }
    
    onBuyBtnTap(){
        if(this.lastTheme){
            let cost = this.lastTheme.cost;
            let coin = DB.Get(Key.Coin);
            let diamond = DB.Get(Key.Diamond);
            if(coin < cost.coin){
                SceneManager.ins.OpenPanelByName("AddCoinPanel");
                return;
            }else if(diamond < cost.diamond){
                SceneManager.ins.OpenPanelByName("AddDiamondPanel");
                return;
            }else{
                Game.openTheme(this.lastTheme.id);
                DB.Set(Key.Coin, coin - cost.coin);
                DB.Set(Key.Diamond, diamond - cost.diamond);
                DB.Set(Key.ThemeId, this.lastTheme.id);
                this.obtainedNode.active = true;
                this.buyBtn.node.active = false;
                this.lastCell.setData(this.lastTheme);
            }
        }
    }

    onClickGoodsCell(e:cc.Event.EventCustom){
        let theme:ThemeData = e.detail.theme;
        let cell:GoodsCell = e.detail.cell;
        this.selectCell(cell, theme);
    }
    selectCell(cell:GoodsCell, theme:ThemeData){
        if(this.lastCell != cell){
            if(this.lastCell){
                this.lastCell.setSelect(false);
            }
            this.lastCell = cell;
            this.lastTheme = theme;
            cell.setSelect(true);
            let have = Game.isThemeOpen(theme.id);
            this.obtainedNode.active = have;
            this.buyBtn.node.active = !have;
            let hero = Game.findHeroConf(theme.heroId);
            Game.loadTexture(hero.url, "hero", (texture)=>{
                let spriteFrame = new cc.SpriteFrame();
                spriteFrame.setTexture(texture);
                this.sprite.spriteFrame = spriteFrame;
            });
            if(theme.cost.coin > 0){
                this.coinNode.active = true;
                this.coinNode.getComponentInChildren(cc.Label).string = theme.cost.coin.toString();
            }else{
                this.coinNode.active = false;
            }
            if(theme.cost.diamond > 0){
                this.diamondNode.active = true;
                this.diamondNode.getComponentInChildren(cc.Label).string = theme.cost.diamond.toString();
            }else{
                this.diamondNode.active = false;
            }
        }
    }
    onBackBtnTap(){
        SceneManager.ins.Back(ShiftAnima.moveLeftShift).then((menuScene:MenuScene)=>{
            menuScene.updateThemeList();
        });
    }

}
