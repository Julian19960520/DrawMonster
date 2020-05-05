import Scene from "../CocosFrame/Scene";
import SceneManager from "../CocosFrame/SceneManager";
import { DB } from "../CocosFrame/DataBind";
import { Util } from "../CocosFrame/Util";
import { crossPlatform, tt } from "../CocosFrame/dts";
import { Local } from "../CocosFrame/Local";
import { Game } from "../Game";
import { Sound } from "../CocosFrame/Sound";
import Music from "../CocosFrame/Music";
const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu('场景/LoginScene') 
export default class LoginScene extends Scene {

    @property(cc.Label)
    label: cc.Label = null;

    loadValue(key, def){
        let value = Local.Get(key) || def;
        DB.Set(key, value);
        return value;
    }
    onLoad () {
        crossPlatform.onHide(()=>{
            Local.Save();
        })
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
        Util.Init();
        SceneManager.ins.Enter("MenuScene");
    }
}
