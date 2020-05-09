import Scene from "../../Frame/Scene";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("场景/LoadingScene")
export default class LoadingScene extends Scene {

    @property(cc.Label)
    label: cc.Label = null;
    Load(urls){
        return new Promise((resolve, reject)=>{
            cc.loader.loadResArray(urls, (completedCount, totalCount, item)=>{
                this.label.string = `加载配置(${completedCount}/${totalCount})`;
            }, (err, res)=>{
                resolve();
            });
        });
    }
}
