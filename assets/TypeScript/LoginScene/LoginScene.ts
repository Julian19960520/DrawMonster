import Scene from "../CocosFrame/Scene";
import SceneManager from "../CocosFrame/SceneManager";
import { DB } from "../CocosFrame/DataBind";
import { Util } from "../CocosFrame/Util";
import { crossPlatform } from "../CocosFrame/dts";
import { Local } from "../CocosFrame/Local";
import { PrefabPath, Config } from "../CocosFrame/Config";
import { Game } from "../Game";
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
        let sensitivity = Local.Get("user/sensitivity") || 1;
        let colorIds = Local.Get("user/colorIds") || [1,2,3,4,5,6,7,8,9,10, 11,12,13,14,15,16,17,18,19,20, 21,22,23,24,25,26,27,28,29,30, 31,32];
        let rankDatas = Local.Get("user/rankDatas") || [];

        let customMonsters = Local.Get("user/customMonsters") || [];
        let customHeros = Local.Get("user/customHeros") || [];
        let usingHeroId = Local.Get("user/usingHeroId") || 1;
        let usingMonsterIds = Local.Get("user/usingMonsterIds") || [1,2,3,4,5,6];
        
        let uuid = Local.Get("uuid") || 1000;
        DB.Set("user/stage", stage);
        DB.Set("user/energy", energy);
        DB.Set("option/sensitivity", sensitivity);
        DB.Set("user/colorIds", colorIds);
        DB.Set("user/rankDatas", rankDatas);
        DB.Set("user/customMonsters", customMonsters);
        DB.Set("user/customHeros", customHeros);

        DB.Set("user/usingHeroId", usingHeroId);
        DB.Set("user/usingMonsterIds", usingMonsterIds);

        DB.Set("uuid", uuid);

        Game.Init();
        Util.Init();
        SceneManager.ins.Enter("MenuScene");
    }
}
