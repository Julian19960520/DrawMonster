
import { crossPlatform, wx, tt, GameRecorderShareButton } from "./CrossPlatform";
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
        if(_inited){ return; }
        _inited = true;
        if(wx){
            impl = crossPlatform.getGameRecorder();
            initWxShareBtn();
        }
        if(tt){
            impl = crossPlatform.getGameRecorderManager();
            impl.onStart(onStart);
            impl.onStop(onStop);
        }
    }

    let wxShareBtn:GameRecorderShareButton = null;
    let wxShareSuccess = null;
    let wxShareFail = null;
    let wxShareing = false;
    function initWxShareBtn(){
        let hideTime = 0;
        wx.onHide(()=>{
            hideTime = new Date().getTime();
        });
        wx.onShow(()=>{
            if(wxShareing){
                if(hideTime != null){
                    let dt = new Date().getTime() - hideTime;
                    if(dt > 4000){
                        if(wxShareSuccess) wxShareSuccess();
                    }else{
                        if(wxShareFail) wxShareFail();
                    }
                }
                wxShareing = false;
                wxShareSuccess = null;
                wxShareFail = null;
            }
        });
        wxShareBtn = wx.createGameRecorderShareButton({
            text:"",
            icon:Util.rawUrl('resources/Atlas/Single/transparent.png'),
            style:{left:0,top:0,height:113},
            share:{
                query:"",
                title:{
                    template:"default.score",
                    data:{score:1},
                },
                bgm:"",
                timeRange:[[0,60*1000]],
            }
        });
        wxShareBtn.onTap(()=>{
            wxShareing = true;
        })
        wxShareBtn.hide();
    }
    //创建分享视频按钮
    export function hideGameRecorderShareButton(){
        if(wxShareBtn){
            wxShareBtn.hide();
        }
    }
    export function createGameRecorderShareButton(obj:{
                    parentNode:cc.Node,
                    textures:any[],
                    onSucc?,
                    onFail?,
                }){
        Util.instantPrefab("Prefab/GameRecorderShareButton").then((node:cc.Node)=>{
            if(wx){
                //微信的点击触发放在微信单例按钮上，node上不用注册点击。
                console.log(Util.convertToWindowSpace(obj.parentNode));
                let btn = wx.createGameRecorderShareButton({
                    text:"",
                    icon:Util.rawUrl('resources/Atlas/Single/transparent.png'),
                    style:Util.convertToWindowSpace(obj.parentNode),
                    share:{
                        query:"",
                        title:{
                            template:"default.score",
                            data:{score:1},
                        },
                        bgm:"",
                        timeRange:[[0,60*1000]],
                    }
                });
                btn.show();
                console.log(btn);
                wxShareSuccess = obj.onSucc;
                wxShareFail = obj.onFail;
            }else{
                //抖音上点击放在node上
                node.on("click", ()=>{
                    crossPlatform.shareAppMessage({
                        title: "抓到你就完蛋了", 
                        channel:"video",
                        extra:{
                            videoPath:videoPath,
                            videoTopics:["抓到你就完蛋了"]
                        },
                        success:obj.onSucc,
                        fail:obj.onFail,
                    });
                }, node);
            }
            if(obj.textures && obj.textures.length>0){
                let i = 0;
                let screenImg = Util.searchChild(node, "screenImg").getComponent(cc.Sprite);
                node.runAction(cc.repeatForever(
                    cc.sequence(
                        cc.callFunc(()=>{
                            i++;
                            screenImg.spriteFrame = new cc.SpriteFrame(obj.textures[i%obj.textures.length]);
                        }),
                        cc.delayTime(0.5)
                    )
                ));
                node.runAction(cc.repeatForever(
                    cc.sequence(
                        cc.scaleTo(0.5, 1.05, 1.05),
                        cc.scaleTo(0.5, 1, 1),
                    )
                ));
            }
            obj.parentNode.addChild(node);
        });
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
            impl.start({duration:15});  
        }
        if(tt){
            impl.start({duration:15});  
        }
        recordering = true;
    }
    //结束录屏
    export function stop(){
        Init();
        if(wx){
            impl.stop();
            
        }
        if(tt){
            impl.stop();  
        }
        recordering = false;  
    }
}
