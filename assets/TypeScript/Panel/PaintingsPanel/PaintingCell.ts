
import ScrollList from "../../CustomUI/ScrollList";
import { HeroConfig, MonsterConfig } from "../../Frame/dts";
import { Game } from "../../Game/Game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PaintingCell extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;
    @property(cc.Node)
    select:cc.Node = null; 

    onLoad(){
        this.node.on(ScrollList.SET_DATA, this.setData, this);
        this.node.on(ScrollList.STATE_CHANGE, this.onStateChange, this)
    }
    setData(data:HeroConfig|MonsterConfig){ 
        this.sprite.spriteFrame = null;
        Game.loadTexture(data.url,(texture)=>{
            let frame = new cc.SpriteFrame();
            frame.setTexture(texture);
            this.sprite.spriteFrame = frame;
        });
    }
    onStateChange(select){
        this.select.active = select;
    }
}
