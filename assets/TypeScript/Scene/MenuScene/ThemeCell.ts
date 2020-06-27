import ScrollList from "../../CustomUI/ScrollList";
import { ThemeData } from "../../Frame/dts";
import { Game } from "../../Game/Game";
import { Util } from "../../Frame/Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ThemeCell extends cc.Component {

    @property(cc.Node)
    scaleNode:cc.Node = null;
    @property(cc.Sprite)
    sprite:cc.Sprite = null;
    @property(cc.Label)
    nameLabel:cc.Label = null;
    @property(cc.Node)
    lockNode:cc.Node = null;
    @property(cc.Label)
    costLabel:cc.Label = null;

    data:ThemeData = null

    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on(ScrollList.SCROLL_MOVE, this.onScrollMove, this);
        this.node.on("click", this.onClick, this);
    }

    onClick(){

    }

    onScrollMove(list:ScrollList){
        let x = this.node.x + list.getScrollOffset().x;
        let half = list.node.width/2;
        let dx = Math.abs(x-half);
        let scale = 1 - 0.7*cc.easing.quartInOut(dx/half);
        this.scaleNode.scale = scale;
    }
    
    setData(data:ThemeData){
        this.data = data;
        let open = Game.isThemeOpen(data.id) || data.isCustom;
        Util.grayfiyNode(this.scaleNode, !open);
        this.lockNode.active = !open;
        this.costLabel.string = data.cost.toString();
        this.scaleNode.active = true;
        let hero = Game.findHeroConf(data.heroId);
        this.nameLabel.string = hero.name;
        this.sprite.node.active = false;
        Game.loadTexture(hero.url,"hero",(texture)=>{
            this.sprite.node.active = true;
            let frame = new cc.SpriteFrame();
            frame.setTexture(texture);
            this.sprite.spriteFrame = frame;
        });
    }
}
