
import { crossPlatform, wx, tt } from "./CrossPlatform";
import { Util } from "./Util";

export namespace GameRecorder {
    let impl = crossPlatform.getGameRecorderManager();
    
    let videoPath = "";
    let onStartListenrs = [];
    let onStopListenrs = [];
    let _inited = false;
    export let recordering = false;
    export let startStamp = 0;
    export function Init(){
        if(_inited){
            return;
        }
        _inited = true;
        if(wx){
            impl = crossPlatform.getGameRecorder();
        }
        if(tt){
            impl = crossPlatform.getGameRecorderManager();
            impl.onStart(onStart);
            impl.onStop(onStop);
        }
    }
    //录屏开始时触发
    function onStart(){
        videoPath = "";
        onStartListenrs.forEach((func)=>{
            func();
        })
    }
    //录屏结束时触发
    function onStop(res){
        console.log("onStop", res);
        videoPath = res.videoPath;
        onStopListenrs.forEach((func)=>{
            func(res);
        })
    }
    
    //开始录屏
    export function start(){
        Init();
        startStamp = Util.getTimeStamp();
        if(wx){
            //impl.start({duration:3000});  
        }
        if(tt){
            impl.start({duration:15});  
            recordering = true;
        }
    }
    //结束录屏
    export function stop(){
        Init();
        if(wx){
            //impl.stop();  
        }
        if(tt){
            impl.stop();  
            recordering = false;
            console.log("stop");
        }
    }
    //分享视频
    export function share(success = null, fail = null){
        Init();
        crossPlatform.shareAppMessage({
            title: "抓到你就完蛋了", 
            channel:"video",

            extra:{
                videoPath:videoPath,
                videoTopics:["抓到你就完蛋了"]
            },
            success:success,
            fail:fail,
        });
    }
}
