
import { crossPlatform, wx, tt, GameRecorderShareButton } from "./CrossPlatform";
import { Util } from "./Util";
import { TweenUtil } from "./TweenUtil";
import { Config } from "./Config";

export namespace GameRecorder {    
    let videoPath = "";
    export let recordering = false;
    export let startStamp = 0;
    export let videoDuration = 0;
    let inited = false;
    function Init(){
        if(inited)return;
        inited = true;

        if(wx){
            
        }
        if(tt){
            tt.getGameRecorderManager().onStop(res => {
                videoPath = res.videoPath;
            });
            tt.getGameRecorderManager().onStart(res => {
                
            });
        }
    }
    //开始录屏
    export function start(duration = 15){
        Init();
        if(wx){
            wx.getGameRecorder().start({duration:duration,hookBgm:false}); 
        }
        if(tt){
            tt.getGameRecorderManager().start({duration:duration});  
        }
        videoDuration = 0;
        startStamp = Util.getTimeStamp(); 
        console.log(GameRecorder.startStamp);
        recordering = true;
    }
    //结束录屏
    export function stop(){
        if(wx){
            wx.getGameRecorder().stop();
        }
        if(tt){
            tt.getGameRecorderManager().stop();  
        }
        recordering = false;  
        videoDuration = Util.getTimeStamp() - startStamp;
    }

    //创建分享按钮
    let wxShareBtn:GameRecorderShareButton = null;
    let myShareBtnNode:cc.Node = null;
    export function createGameRecorderShareButton(obj:{parentNode:cc.Node,textures:any[],onSucc?,onFail?}){
        if(wx){
            setTimeout(() => {
                let style = Util.convertToWindowSpace(obj.parentNode);
                let center = {
                    x:style.left+style.width/2,
                    y:style.top+style.height/2,
                }
                let w = 164;
                let h = 64;
                wxShareBtn = wx.createGameRecorderShareButton({
                    text:"                ",
                    icon:Util.rawUrl('resources/Atlas/Single/transparent.png'),
                    image:Util.rawUrl('resources/Atlas/Single/shareVideoBtn.png'),
                    style:{left:center.x-w/2, top:center.y-h/2, height:h},
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
                wxShareBtn.show();
            }, 500);
        }else{
            Util.instantPrefab("Prefab/GameRecorderShareButton").then((node:cc.Node)=>{
                node.on("click", ()=>{
                    crossPlatform.shareAppMessage({
                        title: "抓到你就完蛋了", 
                        channel:"video",
                        extra:{
                            videoPath:videoPath,
                            videoTopics:["抓到你就完蛋了"]
                        },
                        success:()=>{
                            let rewardTip = Util.searchChild(node, "rewardTip");
                            if(rewardTip.active){
                                node.dispatchEvent(Util.customEvent("gainDiamond",true,{cnt:2}));
                                rewardTip.active = false;
                            }
                            if(obj.onSucc)obj.onSucc();
                        },
                        fail:obj.onFail,
                    });
                }, node);
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
                myShareBtnNode = node;
            });
        }
    }
    //隐藏分享视频按钮
    export function clearGameRecorderShareButton(){
        if(wxShareBtn){
            wxShareBtn.hide();
        }
        if(myShareBtnNode){
            myShareBtnNode.destroy();
        }
    }
}
