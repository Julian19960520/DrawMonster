
import { crossPlatform } from "./CrossPlatform";
import { DB } from "./DataBind";
import Scene from "./Scene";
import { Key } from "../Game/Key";

export namespace Analytics{
    DB.Bind(Key.curScene,(scene:Scene)=>{
        if(scene){
            crossPlatform.reportAnalytics('shiftScene', {
                timeStamp: new Date().getTime(),
                sceneName: scene.node.name,
            });
        }
    });
}