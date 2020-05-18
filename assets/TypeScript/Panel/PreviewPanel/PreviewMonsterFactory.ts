import { Util } from "../../Frame/Util";
import Monster from "../../Scene/PlayScene/Monster";
import { DirType } from "../../Frame/Config";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PreviewMonsterFactory extends cc.Component {
    private timer = 0;
    private ROF = 1;
    spriteFrame:cc.SpriteFrame = null;

    dirType:DirType = DirType.Upward;
    pool:cc.Node[] = [];
    getNode(){
        let node = null;
        if(this.pool.length>0){
            node = this.pool.pop();
            console.log("pool");
        }else{
            node = new cc.Node();
            let sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = this.spriteFrame;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            node.width = node.height = 200;
            node.addComponent(MoveComp);
            node.addComponent(RotateComp);
        }
        this.node.addChild(node);
        return node;
    }
    init(pixels, dirType:DirType){
        this.setPixels(pixels);
        this.setDirType(dirType);
        for(let i=0;i<3;i++){
            this.addMonster();
        }
    }
    setPixels(pixels){
        let sf = new cc.SpriteFrame();
        let rt = new cc.RenderTexture();
        let dataView = pixels as any;
        rt.initWithData(dataView, cc.Texture2D.PixelFormat.RGBA8888, 512, 512);
        sf.setTexture(rt);  
        this.spriteFrame = sf;
    }
    setDirType(dirType:DirType){
        this.dirType = dirType; 
        for(let i=0;i<this.node.childrenCount;i++){
            let node = this.node.children[i];
            let move = node.getComponent(MoveComp);
            let rotate = node.getComponent(RotateComp);
            rotate.angleSpeed = 0;
            let scale = 1;
            node.scale = 1;
            node.angle = 0;
            switch(this.dirType){
                case DirType.Forwards:{
                    node.scaleX = scale;
                    let angle = Util.angle(move.velocity);
                    if(angle>90 && angle <270){
                        node.scaleY = -scale;
                    }else{
                        node.scaleY = scale;
                    }
                    node.angle = angle;
                    break;
                }
                case DirType.HorFlip:{
                    node.scaleX = node.x>0 ? -scale : scale;
                    node.scaleY = scale;
                    break;
                }
                case DirType.Upward:{
                    node.scale = scale;
                    break;
                }
                case DirType.Rotate:{
                    node.scale = scale;
                    rotate.angleSpeed = (Math.random()>0.5?1:-1) * Util.randomInt(100, 150);
                    break;
                }
            }
        }
    }
    update(dt){ 
        this.timer += dt;
        if(this.timer > 1/this.ROF){
            this.timer = 0;            
            this.addMonster();
        }
        let box = this.node.getBoundingBox();
        let arr:cc.Node[] = [];
        for(let i=0;i<this.node.childrenCount;i++){
            let node = this.node.children[i];
            if(!box.intersects(node.getBoundingBox())){
                arr.push(node);
            }
        }
        for(let i=0;i<arr.length;i++){
            let node =arr[i];
            node.removeFromParent();
            this.pool.push(node);
            console.log("asdf");
        }
    }
    addMonster(){
        //出生点坐标
        let x ,y;   
        let boxW = this.node.width;
        let boxH = this.node.height;
        if(Math.random() < boxW/(boxH+boxW)){
            x = Util.randomInt(-boxW/2, boxW/2);
            y = boxH/2 * (Math.random()>0.5?1:-1);
        }else{
            y = Util.randomInt(-boxH/2, boxH/2);
            x = boxW/2 * (Math.random()>0.5?1:-1);
        }
        //飞的方向
        let vec = cc.v2(Util.randomInt(-50,50), Util.randomInt(-50,50)).sub(cc.v2(x,y));        //追随机点
        
        //缩放
        let scale = 1;
        //速度与缩放反比
        let speed = Util.randomInt(50,100);
        let velocity = vec.normalizeSelf().mulSelf(speed);
        velocity.mulSelf(1/scale);
        //创建Monster
        let node = this.getNode();
        node.position = cc.v2(x,y);
        node.getComponent(MoveComp).velocity = velocity;
        switch(this.dirType){
            case DirType.Forwards:{
                node.scaleX = scale;
                let angle = Util.angle(velocity);
                if(angle>90 && angle <270){
                    node.scaleY = -scale;
                }else{
                    node.scaleY = scale;
                }
                node.angle = angle;
                break;
            }
            case DirType.HorFlip:{
                node.scaleX = node.x>0 ? -scale : scale;
                node.scaleY = scale;
                break;
            }
            case DirType.Upward:{
                node.scale = scale;
                break;
            }
            case DirType.Rotate:{
                node.scale = scale;
                node.getComponent(RotateComp).angleSpeed = (Math.random()>0.5?1:-1) * Util.randomInt(100, 150);
                break;
            }
        }
    }
}

class MoveComp extends cc.Component{
    velocity:cc.Vec2 = null;
    update(dt){
        if(this.velocity){
            this.node.position = this.node.position.add(this.velocity.mul(dt));
        }
    }
}
class RotateComp extends cc.Component{
    angleSpeed = 0;
    update(dt){
        this.node.angle += dt*this.angleSpeed;
    }
}