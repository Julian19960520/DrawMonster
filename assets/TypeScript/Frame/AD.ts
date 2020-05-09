import { VideoAd, tt, crossPlatform } from "./CrossPlatform";

export enum AdUnitId{
    OpenAllChest = "1f2a4ppm2abh4bgeal"
}
export enum VideoError{
    UserCancel,
    NoAd,
}
export namespace AD{
    export function showVideoAd(id:AdUnitId, succ, fail){
        console.log("createRewardedVideoAd", crossPlatform.createRewardedVideoAd);
        //创建视频组件（单例）
        let videoAd = crossPlatform.createRewardedVideoAd({adUnitId:id});
        console.log("videoAd", videoAd);
        console.log("id", id);
        
        //点击关闭视频组件时回调
        let closeCall = (res)=>{
            if(res.isEnded){
                succ();
            }else{
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
                        .catch(()=>{
                            //二次尝试失败
                            fail(VideoError.NoAd);
                        });
                    })
                    .catch((err)=>{
                        //手动拉取成功，则按照没有广告可看失败处理
                        fail(VideoError.NoAd);
                    });
            });
    }
}