
import { crossPlatform } from "./CrossPlatform";
import { DB } from "./DataBind";
import Scene from "./Scene";

export namespace Analytics{
    DB.Bind("temp/curScene",(scene:Scene)=>{
        if(scene){
            crossPlatform.reportAnalytics('shiftScene', {
                timeStamp: new Date().getTime(),
                sceneName: scene.node.name,
            });
        }
    });
}