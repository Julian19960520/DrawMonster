import PhyObject from "../Scene/PlayScene/PhyObject";
import { Util } from "../Frame/Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadingHeart extends cc.Component {

    fillList = [];
    lastIdx = 0;

    onLoad(){
        //0透明  1白    2黑    3红
        let grid = [
            [0, 0, 2, 2, 2, 0, 2, 2, 2, 0, 0],
            [0, 2, 3, 3, 3, 2, 3, 3, 3, 2, 0],
            [2, 3, 3, 3, 3, 3, 3, 3, 1, 3, 2],
            [2, 3, 3, 3, 3, 3, 3, 3, 1, 3, 2],
            [2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2],
            [0, 2, 3, 3, 3, 3, 3, 3, 3, 2, 0],
            [0, 0, 2, 3, 3, 3, 3, 3, 2, 0, 0],
            [0, 0, 0, 2, 3, 3, 3, 2, 0, 0, 0],
            [0, 0, 0, 0, 2, 3, 2, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
        ];
        let row = grid.length;
        let col = grid[0].length;

        let prefab = this.node.children[0];
        while(this.node.childrenCount< row*col){
            let child = cc.instantiate(prefab);
            this.node.addChild(child);
        }
        for(let i=row-1; i>=0; i--){
            for(let j=0; j<col; j++){
                let child = this.node.children[i*col+j];
                if(grid[i][j] == 0){
                    child.opacity = 0;
                }
                if(grid[i][j] == 1){
                    this.fillList.push(child);
                    child.opacity = 0;
                    child.color = cc.Color.WHITE;
                }
                if(grid[i][j] == 3){
                    this.fillList.push(child);
                    child.opacity = 0;
                    child.color = cc.Color.RED;
                }
                if(grid[i][j] == 2){
                    child.color = cc.Color.BLACK;
                }
            }
        }
    }

    setProgress(progress){
        let idx = Math.floor(progress * this.fillList.length);
        for(let i=this.lastIdx; i<idx && i<this.fillList.length; i++){
            let img = this.fillList[i];
            img.opacity = 255;
            // cc.tween(img).to(0.3, {opacity:255}).start();
        }
        this.lastIdx = idx;
    }

    boom(){
        this.getComponent(cc.Layout).enabled = false;
        for(let i=0; i<this.node.childrenCount; i++){
            let child = this.node.children[i];
            let phyObject = child.addComponent(PhyObject);
            phyObject.velocity = cc.v2( Util.randomInt(-200, 200), Util.randomInt(300, 500));
            phyObject.g = 2000;
            cc.tween(child).to(0.5, {opacity:0, scale:0}).call(()=>{
                child.destroy();
            }).start();
        }
    }
}
