import { VideoAd, tt, crossPlatform, systemInfo, AppName } from "./CrossPlatform";
import { Util } from "./Util";

export enum AdUnitId{
    OpenAllChest = "1f2a4ppm2abh4bgeal",
    Reborn = "15k0a126hpl1k4178l",
    RewardBet = "2sf1naepapa1haaf9j",
    FinishBottom = "faa789b9d3d8nf7alm",
    GetCoin = "ba2t2qdmnlf92i1mae",
    luckyCatBet = "1i61gd3jf73hd6h8fc",
    GetDiamond = "3kr08cvt49p1rcualq",
    RefreshGasha = "1lh22pmpo6b1kl35d5",
}
export enum VideoError{
    UserCancel,
    NoAd,
}
export namespace AD{
    export let videoAding = false;      //

    crossPlatform.onShow((data)=>{
        if(AD.videoAding){
            setTimeout(() => {
                AD.videoAding = false;
            }, 100);
        }
    })
    
    export function showVideoAd(id:AdUnitId, succ, fail){
        videoAding = true;
        crossPlatform.reportAnalytics("rewardedVideoAd",{
            id:id,
            step:"click",
        });
        if(crossPlatform.isDebug){
            succ();
        }
        if(tt){
            //创建视频组件（单例）
            let videoAd = crossPlatform.createRewardedVideoAd({adUnitId:id});        
            //点击关闭视频组件时回调
            let closeCall = (res)=>{
                if(res.isEnded){
                    succ();
                    crossPlatform.reportAnalytics("ad",{
                        id:id,
                        step:"complete",
                    });
                }else{
                    console.log(res);
                    fail(VideoError.UserCancel);
                }
                videoAd.offClose(closeCall);
            }
            //尝试播放
            videoAd.show().then(() => {
                    //播放成功，则增加关闭回调
                    videoAd.onClose(closeCall);
                })
                .catch(() => {
                    //播放失败，则尝试手动拉取一次
                    videoAd.load()
                        .then(() => {
                            //手动拉取成功，再尝试播放
                            videoAd.show().then(()=>{
                                //二次尝试成功
                                videoAd.onClose(closeCall);
                            })
                            .catch((err)=>{
                                //二次尝试失败
                                console.log(err);
                                fail(VideoError.NoAd);
                            });
                        })
                        .catch((err)=>{
                            //手动拉取成功，则按照没有广告可看失败处理
                            console.log(err);
                            fail(VideoError.NoAd);
                        });
                });
        }
        
    }
    export function showBanner(id:AdUnitId, style, succ, fail){
        if(tt){
            if(systemInfo.appName == AppName.Douyin){
                return;
            }
            let bannerAd = crossPlatform.createBannerAd({
                adUnitId: id,
                adIntervals:30,
                style: style
            });
            bannerAd.onResize(size => {
                // good
                console.log(size.width, size.height);
                bannerAd.style.top = systemInfo.windowHeight - size.height;
                bannerAd.style.left = (systemInfo.windowWidth - size.width) / 2;
            });
            let loadedCall = () => {
                bannerAd.show()
                    .then(() => {
                        console.log("广告显示成功");
                    })
                    .catch(err => {
                        console.log("广告组件出现问题", err);
                    });
                bannerAd.offLoad(loadedCall);
            }
            bannerAd.onLoad(loadedCall);
            return bannerAd;
        }else{
            return null;
        }
    }
}