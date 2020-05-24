import { crossPlatform, tt } from "../Frame/CrossPlatform";
import { Vibrate } from "../Frame/Vibrate";
import { Sound } from "../Frame/Sound";
import { DB } from "../Frame/DataBind";
import { Key } from "../Game/Key";
const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("自定义UI/Button")
export default class Button extends cc.Button {
    @property
    soundName = "clickBtn";
    onLoad(){
        if(!this.target){
            this.target = this.node;
        }
        if(this.transition == cc.Button.Transition.NONE){
            this.transition = cc.Button.Transition.SCALE;
        }
        this.node.on("click", this.onClick, this);
    }
    onClick(){
        Sound.play(this.soundName);
        Vibrate.short();
        this.reportAnalytics();
    };
    reportAnalytics(){
        if(tt){
            crossPlatform.reportAnalytics('clickBtn', {
                timeStamp: new Date().getTime(),
                btnName: this.node.name,
                sceneName:DB.Get(Key.curScene).name,
            });
        }
    }
}
