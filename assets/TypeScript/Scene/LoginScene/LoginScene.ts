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
        let version = Local.Get(Key.Version) || 0;
        if(version == 0){
            if(tt){
                tt.clearStorage();
            }
        }
        DB.SetLoacl(Key.Version, "0.1.3");
        this.loadValue("uuid", 1000);

        Sound.volume = this.loadValue(Key.Sound, 0.5);
        Music.volume = this.loadValue(Key.Music, 0.5);
        Vibrate.enable = this.loadBoolValue(Key.Vibrate, true);
        this.loadValue(Key.Sensitivity, 1.5);

        this.loadValue(Key.Coin, 100);
        this.loadValue(Key.ThemeId, 9);
        this.loadValue(Key.ColorIds, [1,2,3,4,5,6,7,8,9,10, 11,12,13,14,15,16,17,18,19,20, 21,22,23,24,25,26,27,28,29,30, 31,32]);
        this.loadValue(Key.RankDatas, []);
        this.loadValue(Key.CustomMonsters, []);
        this.loadValue(Key.CustomHeros, []);
        this.loadValue(Key.CustomThemes, []);
        this.loadValue(Key.OpenThemeIds, [9,1,3]);

        Game.Init();
        SceneManager.ins.Enter("MenuScene");
    }
}
