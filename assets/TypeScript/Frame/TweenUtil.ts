import { Util } from "./Util";

export namespace TweenUtil{
    export function applyBreath(node:cc.Node){
        if(!node){
            return;
        }
        return node.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(1, 1.1, 1.1),
                    cc.scaleTo(1, 1, 1)
                )
            )
        );
    }
    export function applyBubble(node:cc.Node){
        if(!node){
            return;
        }
        return node.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.5, 1.05, 0.95),
                    cc.scaleTo(1, 0.95, 1.05),
                    cc.scaleTo(0.5, 1, 1),
                )
            )
        );
    }
    export function applyScaleBounce(node:cc.Node, oriScale, tarScale, onCenter = null, onEnd = null){
        if(!node){
            return;
        }
        node.scale = oriScale
        cc.tween(node)
            .to(0.1, {scale: tarScale}, { easing: 'backIn'})
            .call(()=>{
                if(onCenter)onCenter();
            })
            .to(0.2, {scale: oriScale}, { easing: 'backOut'})
            .call(()=>{
                if(onEnd)onEnd();
            })
            .start();
    }
    export function applyScaleBounce2(node:cc.Node, oriScale, tarScale, onCenter = null, onEnd = null){
        if(!node){
            return;
        }
        node.scale = oriScale
        cc.tween(node)
            .to(0.3, {scale: tarScale}, { easing: 'quadOut'})
            .call(()=>{
                if(onCenter)onCenter();
            })
            .to(0.3, {scale: oriScale}, { easing: 'quadIn'})
            .call(()=>{
                if(onEnd)onEnd();
            })
            .start();
    }
    export function applyAppear(data:{node:cc.Node, delay?:number, duration?:number, fromScale?:number, toScale?:number, callback?}){
        if(data.fromScale===undefined) data.fromScale = 0;
        if(data.toScale===undefined) data.toScale = 1;
        if(data.delay===undefined) data.delay = 0;
        if(data.duration===undefined) data.duration = 0.3;

        data.node.scale = data.fromScale;
        cc.tween(data.node)
            .delay(data.delay)
            .to(data.duration, {scale: data.toScale}, { easing: cc.easing.backOut})
            .call(()=>{
                if(data.callback) data.callback();
            })
            .start();
    }
    export function applyDisappear(node:cc.Node, time, callback = null){
        cc.tween(node)
            .to(time, {scale: 0}, { easing: 'backIn'})
            .call(()=>{
                if(callback)callback();
            })
            .start();
    }
    export function applyShake(node:cc.Node){
        let speed = 200;
        let range = 4;
        let tw = cc.tween(node);
        let oriPos = node.position;
        let lastPos = node.position;
        for(let i=0;i<2;i++){
            let pos = cc.v2(Util.randomInt(-range,range), Util.randomInt(-range,range));
            let mag = lastPos.sub(pos).mag();
            tw.to(mag/speed, {position: pos});
            lastPos = pos;
        }
        let mag = lastPos.sub(oriPos).mag();
        tw.to(mag/speed, {position: oriPos});
        tw.start();
    }
    export function applyFloat(node:cc.Node){
        let time = 0.5;
        let scale = 0.3;
        node.runAction(cc.repeatForever(
            cc.spawn(
                cc.sequence(
                    cc.moveBy(time/4, 0, 4*scale),
                    cc.moveBy(time/2, 0, -8*scale),
                    cc.moveBy(time/4, 0, 4*scale),
                ),
                //angle
                cc.sequence(
                    cc.rotateBy(time/4, 5*scale),
                    cc.rotateBy(time/2, -10*scale),
                    cc.rotateBy(time/4, 5*scale),
                ),
            )
        ))
    }
}