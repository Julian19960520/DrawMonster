import Scene from "../../Frame/Scene";
import { crossPlatform, tt } from "../../Frame/CrossPlatform";
import { Local } from "../../Frame/Local";
import { DB } from "../../Frame/DataBind";
import { Sound } from "../../Frame/Sound";
import Music from "../../Frame/Music";
import { Game } from "../../Game/Game";
import SceneManager from "../../Frame/SceneManager";

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

    login(){
        let version = Local.Get("version") || 0;
        console.log("version", version);
        if(version == 0){
            if(tt){
                tt.clearStorage();
            }
        }
        DB.SetLoacl("version", "0.1.3");
        this.loadValue("uuid", 1000);

        Sound.volume = this.loadValue("option/sound", 0.5);
        Music.volume = this.loadValue("option/music", 0.5);
        this.loadValue("option/sensitivity", 1.5);

        this.loadValue("user/coin", 100);
        this.loadValue("user/dramaId", 9);
        this.loadValue("user/colorIds", [1,2,3,4,5,6,7,8,9,10, 11,12,13,14,15,16,17,18,19,20, 21,22,23,24,25,26,27,28,29,30, 31,32]);
        this.loadValue("user/rankDatas", []);
        this.loadValue("user/customMonsters", []);
        this.loadValue("user/customHeros", []);
        this.loadValue("user/customDramas", []);
        this.loadValue("user/usingHeroId", 1);
        this.loadValue("user/openThemeIds", [9,1,3]);

        Game.Init();
        SceneManager.ins.Enter("MenuScene");
    }
}
