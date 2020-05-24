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

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu('场景/LoginScene') 
export default class LoginScene extends Scene {

    @property(cc.Label)
    label: cc.Label = null;

    onLoad () {
        crossPlatform.onHide(()=>{
            Local.Save();
        })
        setTimeout(() => {
            this.login();
        }, 50);
    }
    
    loadValue(key, def){
        let value = Local.Get(key) || def;
        DB.Set(key, value);
        return value;
    }
    loadBoolValue(key, def){
        let value = Local.Get(key);
        if(value === undefined){
            value = def;
        }
        DB.Set(key, value);
        return value;
    }
    login(){
        
        HTTP.POST(ServerMsg.login, { openId: "Julian" }, (data) => {
            console.log("onSucc", data);
        }, (data) => {
            console.log("onErr", data);
        });
        
        let version = Local.Get(Key.Version) || 0;
        //
        DB.SetLoacl(Key.Version, "0.1.6");
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
        console.log("ThemeId", DB.Get(Key.ThemeId));
        console.log("CustomThemes", DB.Get(Key.CustomThemes));
        console.log("CustomHeros",DB.Get(Key.CustomHeros));
        //设置
        Sound.volume = this.loadValue(Key.Sound, 0.5);
        Music.volume = this.loadValue(Key.Music, 0.5);
        Vibrate.enable = this.loadBoolValue(Key.Vibrate, true);
        this.loadValue(Key.Sensitivity, 1.5);

        //引导变量
        this.loadBoolValue(Key.guideUnlockPaint, false);
        this.loadBoolValue(Key.guideDrawFish, false);

        Game.Init();
        SceneManager.ins.Enter("MenuScene");
    }
}
