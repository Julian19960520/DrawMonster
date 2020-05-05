import { DirType } from "./Config";
import { fail } from "assert";

export enum Ease{
    quintOut = 'quintOut',
    quintIn = 'quintIn',
    cubicOut = 'cubicOut',
    cubicIn = 'cubicIn',

}

export declare class LvlConf{
    virusList:VirusInitData[];
}
export declare class VirusInitData{
    t:number;
    v:number;
    x:number;
    y:number;
    vx:number;
    vy:number
};

export class RankData{
    rank:number;
    time:number;
};
export class DramaData{
    id:number;
    heroId:number;
    monsterIds:number[];
    isCustom?:boolean;
    cost:number;
}
export class HeroConfig {
    id:number;
    url:string;
    name:string;
}
export class MonsterConfig{
    id:number;
    url:string;
    name:string;
    dirType:DirType;
    box?:{offset?:cc.Vec2, size?:cc.Size};
    circle?:{offset?:cc.Vec2, radius?:number};
    angleSpeedRange?:number[][];
    isUserPainting?:boolean
}
export class ColorData{
    id:number;
    name:string;
    color:cc.Color;
}
export class CrossPlatform{
    isDebug:boolean = true;
    env = {
        USER_DATA_PATH:"Root:",
    }
    onShow(callback){

    }
    onHide(callback){}
    share(obj:{
        title?: string, 
        imageUrl?:string, 
        query?:string, 
        imageUrlId?:string,

        channel?: "token"|"video",
        extra?: {
            videoPath: string, // 可替换成录屏得到的视频地址
            videoTopics: string[] //话题
        },
        templateId?:string,
        success?:()=>void,
        fail?:()=>void,
    }){
        if(obj.success) obj.success();
        console.log("分享", obj);
    }
    shareAppMessage(obj:{
        title?: string, 
        imageUrl?:string, 
        query?:string, 
        imageUrlId?:string,

        channel?: "token"|"video",
        extra?: {
            videoPath: string, // 可替换成录屏得到的视频地址
            videoTopics: string[] //话题
        },
        templateId?:string,
        success?:()=>void,
        fail?:()=>void,
    }){
        if(obj.success) obj.success();
        console.log("分享", obj);
    }
    setStorage(obj:{key:string, data:string}){}
    setStorageSync(key:string, value:string){}
    getStorage(key:string, succ:(res)=>void){}
    getStorageSync(key:string):any{}
    getFileSystemManager(){
        return {
            saveFile(data:{tempFilePath:string, filePath:string, success, fail}){
                data.success(data.filePath);
            },
            saveFileSync(tempFilePath:string, filePath:string){
                return filePath+":"+tempFilePath;
            },
            accessSync(path:string){},
            mkdirSync(dirPath:string, recursive:boolean){},
            writeFileSync(filePath:string, data:string|ArrayBuffer, encoding:string="binary"){},
            readFileSync(filePath:string, encoding?:string, position?:string, length?:string):string|ArrayBuffer{return "";},
        }
    }
    createGameRecorderShareButton(obj:{
        style:{
            left:number,
            top:number,
            height:number,
        },
        share:{
            query:string,
            bgm:string,
            timeRange:Array<Array<number>>,
        },
        icon?:string,
        image?:string,
        text?:string,
    }){
    }
    getGameRecorder(){
        return {
            start(obj:{duration:number}){
                console.log("开始录屏");
            },
            pause(){},
            recordClip(obj:{timeRange?:number[], success?:(res:{index:number})=>{void}, fail?, complete?}){},
            clipVideo(obj:{path:string, timeRange?:number[], clipRange?:number[], success?, fail?}){},
            resume(){},
            stop(){
                console.log("结束录屏");
                return "视频地址";
            },
            onStart(callback){},
            onResume(callback){},
            onPause(callback){},
            onStop(callback:(obj:{videoPath:string})=>void){},
            onError(callback:(obj:{errMsg:string})=>void){},
            onInterruptionBegin(callback){},
            onInterruptionEnd(callback){},
        }
    }
    //抖音专用API
    getGameRecorderManager(){
        return {
            start(obj:{duration:number}){
                console.log("开始录屏");
            },
            pause(){},
            recordClip(obj:{timeRange?:number[], success?:(res:{index:number})=>{void}, fail?, complete?}){},
            clipVideo(obj:{path:string, timeRange?:number[], clipRange?:number[], success?, fail?}){},
            resume(){},
            stop(){
                console.log("结束录屏");
                return "视频地址";
            },
            onStart(callback){},
            onResume(callback){},
            onPause(callback){},
            onStop(callback:(obj:{videoPath:string})=>void){},
            onError(callback:(obj:{errMsg:string})=>void){},
            onInterruptionBegin(callback){},
            onInterruptionEnd(callback){},
        }
    }
    createCanvas(){
        return {
            width:0,
            height:0,
            getContext(type:string){
                return {
                    createImageData(w,h){
                        return {
                            data:[]
                        };
                    }
                    ,
                    putImageData(imageData:{data:number[]},x,y){

                    }
                }
            },
            toTempFilePath(obj:{
                x?: number,
                y?: number,
                width?: number,
                height?: number,
                destWidth?: number,
                destHeight?: number,
                fileType?:string,
                success: (res:{tempFilePath:string}) => void
            }){},
            toTempFilePathSync(obj:{
                x?: number,
                y?: number,
                width?: number,
                height?: number,
                destWidth?: number,
                destHeight?: number
            }){
                return "#tempFilePath#";
            }

        };
    }
    createImage(){
        return null;
    }
    getOpenDataContext(){
        return {
            postMessage(message){}
        };
    }
    getSystemInfoSync(){
        return {};
    }
}
export let crossPlatform:CrossPlatform = new CrossPlatform();

export let wx = window["wx"];
export let tt = window["tt"];

if(tt){
    crossPlatform = tt;
    wx = null;
}if(wx){
    crossPlatform = wx;
    crossPlatform.getGameRecorderManager = wx.getGameRecorder;
}
if(wx){
    let hideTime = 0;
    let shareing = false;
    let shareSuccess = null;
    let shareFail = null;
    crossPlatform.onHide(()=>{
        hideTime = new Date().getTime();
    });
    crossPlatform.onShow(()=>{
        if(shareing){
            if(hideTime != null){
                let dt = new Date().getTime() - hideTime;
                if(dt > 1000){
                    if(shareSuccess) shareSuccess();
                }else{
                    if(shareFail) shareFail();
                }
            }
            shareing = false;
            shareSuccess = null;
            shareFail = null;
        }
    });

    crossPlatform.share = (obj)=>{
        shareing = true;
        shareSuccess = obj.success;
        shareFail = obj.fail;
        crossPlatform.shareAppMessage(obj);
    }
}
if(tt){
    crossPlatform.share = crossPlatform.shareAppMessage;
}