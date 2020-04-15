import Scene from "../CocosFrame/Scene";
import SceneManager from "../CocosFrame/SceneManager";
import { DB } from "../CocosFrame/DataBind";
import { Util } from "../CocosFrame/Util";
import { crossPlatform } from "../CocosFrame/dts";
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
    onLoad () {
        crossPlatform.onHide(()=>{
            Local.Save();
        })
        let stage = Local.Get("user/stage") || 1;
        let energy = Local.Get("user/energy") || 5;
        let dramaId = Local.Get("user/dramaId") || 2;
        let sensitivity = Local.Get("option/sensitivity") || 1.5;
        Sound.volume = Local.Get("option/sound") || 0.5;
        Music.volume = Local.Get("option/music") || 0.5;
        let colorIds = Local.Get("user/colorIds") || [1,2,3,4,5,6,7,8,9,10, 11,12,13,14,15,16,17,18,19,20, 21,22,23,24,25,26,27,28,29,30, 31,32];
        let rankDatas = Local.Get("user/rankDatas") || [];

        let customMonsters = Local.Get("user/customMonsters") || [];
        let customHeros = Local.Get("user/customHeros") || [];
        let customDramas = Local.Get("user/customDramas") || [];
        let usingHeroId = Local.Get("user/usingHeroId") || 1;
        let uuid = Local.Get("uuid") || 1000;
        
        DB.Set("user/stage", stage);
        DB.Set("user/energy", energy);
        DB.Set("user/dramaId", dramaId);
        DB.Set("option/sensitivity", sensitivity);
        DB.Set("option/sound", Sound.volume);
        DB.Set("option/music", Music.volume);
        DB.Set("user/colorIds", colorIds);
        DB.Set("user/rankDatas", rankDatas);
        DB.Set("user/customMonsters", customMonsters);
        DB.Set("user/customHeros", customHeros);
        DB.Set("user/customDramas", customDramas);

        DB.Set("user/usingHeroId", usingHeroId);

        DB.Set("uuid", uuid);

        Game.Init();
        Util.Init();
        SceneManager.ins.Enter("MenuScene");
        // let arr = [128,128,128,0, 128,128,128,0, 255,255,255,0, 255,255,255,0, 255,255,255,0, 128,128,128,0, 128,128,128,0];
        // let pixels = new Uint8Array(arr);
        // console.log(pixels);
        // let compData = Game.compressPixels(pixels);
        // console.log(compData);
        // let out = Game.decompression(compData);
        // console.log(out);
    }
}
