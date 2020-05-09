// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { Util } from "./Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PiecewiseFunc {
    constructor(public points:cc.Vec2[]){
        points.sort((a, b) => {
            return a.x - b.x;
        })
    }
    getY(x){
        let len = this.points.length;
        if(len <= 0){
            return 0;
        }
        if(x<=this.points[0].x){
            return this.points[0].y;
        }
        if(x>=this.points[len-1].x){
            return this.points[len-1].y;
        }
        for(let i=1;i<len;i++){
            if(x<=this.points[i].x){
                let x1 = this.points[i-1].x;
                let x2 = this.points[i].x;
                let y1 = this.points[i-1].y;
                let y2 = this.points[i].y;
                return Util.lerp(y1, y2, (x-x1)/(x2-x1) );
            }
        }
    }
}
