import Scene from "../../Frame/Scene";
import { crossPlatform, tt } from "../../Frame/CrossPlatform";
import { Local } from "../../Frame/Local";
import { DB } from "../../Frame/DataBind";
import { Sound } from "../../Frame/Sound";
import Music from "../../Frame/Music";
import { Game } from "../../Game/Game";
import SceneManager from "../../Frame/SceneManager";
import { Key } from "../../Game/Key";
import { Vibrate } from "../../Frame/Vibrate";
import { HTTP, ServerMsg } from "../../Frame/HTTP";
import { MonsterConfig, ThemeData } from "../../Frame/dts";
import LoadingHeart from "../../Game/LoadingHeart";
import { TweenUtil } from "../../Frame/TweenUtil";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu('场景/LoginScene') 
export default class LoginScene extends Scene {
    @property(cc.Node)
    logo: cc.Node = null;
    @property(LoadingHeart)
    loadingHeart: LoadingHeart = null;
    progress1 = 0;
    progress2 = 0;
    onLoad () {
        this.logo.active = false;
        crossPlatform.onHide(()=>{
            Local.Save();
        })
        if(crossPlatform.isDebug && false){
            this.login();
            SceneManager.ins.Enter("MenuScene");
        }else{
            cc.tween(this).to(1, {progress1:1}, {progress:(start, end, current, ratio)=>{
                current = start + (end-start) * cc.easing.quadInOut(ratio);
                this.loadingHeart.setProgress(current);
                return ratio;
            }}).delay(0.5).call(()=>{
                this.logo.active = true;
                this.loadingHeart.boom();
            })
            .delay(0.2).call(()=>{
                this.login();
            })
            .delay(0.7).call(()=>{
                SceneManager.ins.Enter("MenuScene");
            }).start();
        }
    }
    
    login(){
        // crossPlatform.login({success:(res1)=>{
        //     console.log("res1",res1);
        //     // HTTP.POST(ServerMsg.wxLogin,{code:res1.code},(res2)=>{
        //     //     console.log("res2",res2);
        //     //     HTTP.POST(ServerMsg.login,{openId:res2.openId},(res3)=>{
        //     //         console.log("res3",res3);
        //     //     },()=>{
    
        //     //     })
        //     // },()=>{

        //     // })
        // }});
        let version = Local.Get(Key.Version) || 0;
        // if(version != "0.2.0"){
        //     crossPlatform.clearStorageSync();
        // }
        //
        DB.SetLoacl(Key.Version, "0.2.4");
        this.loadValue("uuid", 1000);

        //用户属性
        this.loadValue(Key.Coin, 300);
        this.loadValue(Key.Diamond, 10);
        this.loadValue(Key.Energy, 0);
        this.loadValue(Key.ThemeId, 1);
        this.loadValue(Key.ColorIds, [1,2,3,4,5,6,7,8,9,10, 11,12,13,14,15,16,17,18,19,20, 21,22,23,24,25,26,27,28,29,30, 31,32]);
        this.loadValue(Key.RankDatas, []);
        this.loadValue(Key.CustomMonsters, []);
        this.loadValue(Key.CustomHeros, []);
        this.loadValue(Key.CustomThemes, []);
        this.loadValue(Key.OpenThemeIds, [1,2,3]);
        this.loadValue(Key.PlayTimes, 0);
        this.loadValue(Key.HeartLvl, 1);
        this.loadValue(Key.ShieldLvl, 1);
        this.loadValue(Key.CoinBagLvl, 1);
        this.loadValue(Key.StarThemeIds, []);
        this.loadValue(Key.lastFreeBallStamp, 0);
        this.loadValue(Key.gashaBallCnt, 0);
        this.loadValue(Key.gashaRewards, null);
        this.loadValue(Key.gashaRefreshIdx, 0);

        //设置
        Sound.volume = this.loadValue(Key.Sound, 0.5);
        Music.volume = this.loadValue(Key.Music, 0.5);
        Vibrate.enable = this.loadBoolValue(Key.Vibrate, true);
        this.loadValue(Key.Sensitivity, 1.5);

        //引导变量
        this.loadBoolValue(Key.guideUnlockPaint, false);
        this.loadBoolValue(Key.guideDrawFish, false);

        this.updateVersion();
        Game.Init();
    }
    loadValue(key, def){
        let value = Local.Get(key) || def;
        DB.Set(key, value);
        return value;
    }
    loadBoolValue(key, def){
        let value = Local.Get(key);
        if(value === undefined || value === ""){
            value = def;
        }
        DB.Set(key, value);
        return value;
    }
    updateVersion(){
        let monsters:MonsterConfig[] = DB.Get(Key.CustomMonsters);
        for(let i=0; i<monsters.length; i++){
            if(monsters[i]["isUserPainting"]){
                monsters[i].isCustom = true;
            }
        }
    }
}
