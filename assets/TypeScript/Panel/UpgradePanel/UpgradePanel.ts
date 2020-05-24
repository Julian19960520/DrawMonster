
import Panel from "../../Frame/Panel";
import Button from "../../CustomUI/Button";
import { Config } from "../../Frame/Config";
import { DB } from "../../Frame/DataBind";
import { Key } from "../../Game/Key";
import { Util } from "../../Frame/Util";
import SceneManager from "../../Frame/SceneManager";
import MessageBox from "../../Frame/MessageBox";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/UpgradePanel")
export default class UpgradePanel extends Panel {
    @property(cc.Label)
    detailLabel: cc.Label = null;

    @property(Button)
    buyBtn: Button = null;

    @property(cc.Node)
    boughtLabel: cc.Node = null;

    @property(cc.Node)
    costCoin: cc.Node = null;

    @property(cc.Node)
    costDiamond: cc.Node = null;

    @property(cc.Node)
    column: cc.Node = null;

    @property(cc.Node)
    item: cc.Node = null;

    private curItem:cc.Node = null;
    onLoad () {
        super.onLoad();
        this.buyBtn.node.on("click", this.onBuyBtnClick, this);
        this.initPanel();
    }
    initPanel(){
        this.item.getChildByName("select").active = false;
        //补充列到3个
        let grid = this.column.parent;
        while(grid.childrenCount<3){
            let child = cc.instantiate(this.column);
            grid.addChild(child);
        }
        //补充item
        let heardCol = grid.children[0];
        let shieldCol = grid.children[1];
        let coinBagCol = grid.children[2];
        let heartLvlConf = Config.heartLvlConf;
        let shieldLvlConf = Config.shieldLvlConf;
        let coinBagLvlConf = Config.coinBagLvlConf;

        while(heardCol.childrenCount < heartLvlConf.length-1){
            let newItem = cc.instantiate(this.item);
            heardCol.addChild(newItem);
        }
        while(shieldCol.childrenCount < shieldLvlConf.length-1){
            let newItem = cc.instantiate(this.item);
            shieldCol.addChild(newItem);
        }
        while(coinBagCol.childrenCount < coinBagLvlConf.length-1){
            let newItem = cc.instantiate(this.item);
            coinBagCol.addChild(newItem);
        }

        //初始化heart
        let curLvl = DB.Get(Key.HeartLvl);
        for(let i=0; i<heardCol.childrenCount; i++){
            let lvl = i+1;
            let item = heardCol.children[i];
            if(lvl <= DB.Get(Key.HeartLvl)){
                this.initHeartItem(item);
                if(lvl == curLvl){      //预览
                    item.color = cc.Color.GRAY;
                }else{                  //已解锁
                    item.color = cc.Color.WHITE;
                }
            }
        }
        if(!this.curItem && curLvl < heartLvlConf.length-1){
            this.select(heardCol.children[Math.min(curLvl-1, heardCol.children.length-1)]);
        }
        //初始化护盾
        curLvl = DB.Get(Key.ShieldLvl);
        for(let i=0; i<shieldCol.childrenCount; i++){
            let lvl = i+1;
            let item = shieldCol.children[i];
            if(lvl <= DB.Get(Key.ShieldLvl)){
                this.initShieldItem(item);
                if(lvl == curLvl){      //预览
                    item.color = cc.Color.GRAY;
                }else{                  //已解锁
                    item.color = cc.Color.WHITE;
                }
            }
        }
        if(!this.curItem && curLvl < shieldLvlConf.length-1){
            this.select(shieldCol.children[curLvl-1]);
        }
        //初始化钱袋
        curLvl = DB.Get(Key.CoinBagLvl);
        for(let i=0; i<coinBagCol.childrenCount; i++){
            let lvl = i+1;
            let item = coinBagCol.children[i];
            if(lvl <= DB.Get(Key.CoinBagLvl)){
                this.initCoinbagItem(item);
                if(lvl == curLvl){      //预览
                    item.color = cc.Color.GRAY;
                }else{                  //已解锁
                    item.color = cc.Color.WHITE;
                }
            }
        }
        if(!this.curItem && curLvl < coinBagLvlConf.length-1){
            this.select(coinBagCol.children[Math.min(curLvl-1, coinBagCol.children.length-1)]);
        }
    }

    initHeartItem(item:cc.Node){
        let idx = item.getSiblingIndex();
        let heartLvlConf = Config.heartLvlConf;
        item.on("click", this.onClickItem, this);
        item.getChildByName("lock").active = false;
        let layoutNode = new cc.Node();
        let layout = layoutNode.addComponent(cc.Layout);
        layout.spacingX = -10;
        layout.type = cc.Layout.Type.HORIZONTAL;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        item.addChild(layoutNode);
        let conf = heartLvlConf[idx+1];
        for(let i=0;i<conf.initCnt;i++){
            let sprite = Util.newSprite("Atlas/Prop/heart");
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.node.width = 40;
            sprite.node.height = 35;
            layoutNode.addChild(sprite.node);
        }
        for(let i=conf.initCnt;i<conf.max;i++){
            let sprite = Util.newSprite("Atlas/UpgradeIcon/emptyHeard");
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.node.width = 40;
            sprite.node.height = 35;
            layoutNode.addChild(sprite.node);
        }
    }

    initShieldItem(item:cc.Node){
        let idx = item.getSiblingIndex();
        let shieldLvlConf = Config.shieldLvlConf;
        item.on("click", this.onClickItem, this);
        item.getChildByName("lock").active = false;
        let conf = shieldLvlConf[idx+1];
        let sprite = Util.newSprite("Atlas/Prop/shield");
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.node.width = 40;
        sprite.node.height = 35;
        item.addChild(sprite.node);
    }

    initCoinbagItem(item:cc.Node){
        let idx = item.getSiblingIndex();
        let shieldLvlConf = Config.shieldLvlConf;
        item.on("click", this.onClickItem, this);
        item.getChildByName("lock").active = false;
        let conf = shieldLvlConf[idx+1];
        let sprite = Util.newSprite("Atlas/Prop/coinBag");
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.node.width = 40;
        sprite.node.height = 35;
        item.addChild(sprite.node);
    }

    onClickItem(e:cc.Event.EventTouch){
        let item = e.target;
        if(!item.getChildByName("lock").active){
            this.select(e.target);
        }
    }
    private curCost = null; 
    private curColumnIdx = 0;
    public select(item:cc.Node){
        if(this.curItem){
            this.curItem.getChildByName("select").active = false;
        }
        this.curItem = item;
        item.getChildByName("select").active = true;
        let idx = item.getSiblingIndex();
        let bought = false;
        let conf = null;
        this.curColumnIdx = item.parent.getSiblingIndex();
        if(this.curColumnIdx == 0){
            bought = idx+1 < DB.Get(Key.HeartLvl);
            conf = Config.heartLvlConf[idx+1];
        }
        else if(this.curColumnIdx == 1){
            bought = idx+1 < DB.Get(Key.ShieldLvl);
            conf = Config.shieldLvlConf[idx+1];
        }
        else if(this.curColumnIdx == 2){
            bought = idx+1 < DB.Get(Key.CoinBagLvl);
            conf = Config.coinBagLvlConf[idx+1];
        }
        this.curCost = conf.cost;
        console.log(conf);
        this.detailLabel.string = conf.detail;
        if(bought){
            this.boughtLabel.active = true;
            this.buyBtn.node.active = false; 
            this.costCoin.active = false;
            this.costDiamond.active = false;
        }else{
            this.boughtLabel.active = false;
            this.buyBtn.node.active = true;
            this.costCoin.active = conf.cost.coin>0;
            this.costDiamond.active = conf.cost.diamond>0;
            this.costCoin.getComponentInChildren(cc.Label).string = conf.cost.coin;
            this.costDiamond.getComponentInChildren(cc.Label).string = conf.cost.diamond;
        }
    }
    onBuyBtnClick(){
        if(this.curCost){
            let coin =  DB.Get(Key.Coin);
            let diamond =  DB.Get(Key.Diamond);

            if(this.curCost.diamond > diamond){
                SceneManager.ins.OpenPanelByName("MessageBox", (panel:MessageBox)=>{
                    panel.label.string = "钻石不足";
                });
            }
            else if(this.curCost.coin > coin){
                SceneManager.ins.OpenPanelByName("MessageBox", (panel:MessageBox)=>{
                    panel.label.string = "金币不足";
                });
            }
            else{
                SceneManager.ins.OpenPanelByName("MessageBox", (panel:MessageBox)=>{
                    panel.label.string = "确定购买？";
                    panel.onOk = ()=>{
                        DB.Set(Key.Coin, coin - this.curCost.coin);
                        DB.Set(Key.Diamond, diamond - this.curCost.diamond);
                        if(this.curColumnIdx == 0){
                            let curLvl = DB.Get(Key.HeartLvl);
                            let heardCol = this.column.parent.children[0];
                            let curItem = heardCol.children[curLvl-1];
                            curItem.color = cc.Color.WHITE;
                            
                            curLvl++;
                            DB.Set(Key.HeartLvl, curLvl);
                            let newItem = heardCol.children[curLvl-1];
                            if(newItem){
                                this.initHeartItem(newItem);
                                newItem.color = cc.Color.GRAY;
                                this.select(newItem);
                            }else{
                                //已经升满
                                this.boughtLabel.active = true;
                                this.buyBtn.node.active = false; 
                                this.costCoin.active = false;
                                this.costDiamond.active = false;
                            }
                        }
                        else if(this.curColumnIdx == 1){
                            let curLvl = DB.Get(Key.ShieldLvl);
                            let shieldCol = this.column.parent.children[1];
                            let curItem = shieldCol.children[curLvl-1];
                            curItem.color = cc.Color.WHITE;
                            
                            curLvl++;
                            DB.Set(Key.ShieldLvl, curLvl);
                            let newItem = shieldCol.children[curLvl-1];
                            if(newItem){
                                this.initShieldItem(newItem);
                                newItem.color = cc.Color.GRAY;
                                this.select(newItem);
                            }else{
                                //已经升满
                                this.boughtLabel.active = true;
                                this.buyBtn.node.active = false; 
                                this.costCoin.active = false;
                                this.costDiamond.active = false;
                            }
                        }
                        else if(this.curColumnIdx == 2){
                            let curLvl = DB.Get(Key.CoinBagLvl);
                            let coinbagCol = this.column.parent.children[2];
                            let curItem = coinbagCol.children[curLvl-1];
                            curItem.color = cc.Color.WHITE;
                            
                            curLvl++;
                            DB.Set(Key.CoinBagLvl, curLvl);
                            let newItem = coinbagCol.children[curLvl-1];
                            if(newItem){
                                this.initCoinbagItem(newItem);
                                newItem.color = cc.Color.GRAY;
                                this.select(newItem);
                            }else{
                                //已经升满
                                this.boughtLabel.active = true;
                                this.buyBtn.node.active = false; 
                                this.costCoin.active = false;
                                this.costDiamond.active = false;
                            }
                        }
                    }
                });
            }
        }
    }
}
