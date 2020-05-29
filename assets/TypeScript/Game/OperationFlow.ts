import { Sound } from "../Frame/Sound";
import SceneManager from "../Frame/SceneManager";
import LoadingScene from "../Scene/LoadingScene/LoadingScene";
import { PrefabPath, Config } from "../Frame/Config";
import PlayScene from "../Scene/PlayScene/PlayScene";
import { DB } from "../Frame/DataBind";
import { Key } from "./Key";
import PaintPanel from "../Panel/PaintPanel/PaintPanel";
import PreviewPanel from "../Panel/PreviewPanel/PreviewPanel";
import { Game } from "./Game";

export namespace OperationFlow{
    export function enterPlayScene(callback){
        Sound.play("gameStartBtn");
        SceneManager.ins.Enter("LoadingScene")
            .then((loadingScene:LoadingScene)=>{
                loadingScene.Load([
                    PrefabPath.shield,
                    PrefabPath.heart,
                    PrefabPath.coinBag,
                    PrefabPath.diamond,
                    PrefabPath.monster,
                ]).then(()=>{
                    SceneManager.ins.Enter("PlayScene").then((playScene:PlayScene)=>{
                        playScene.restart();
                        callback(playScene);
                    });
                });
            });
    }

    export function drawHeroFlow(callback:(hero, theme)=>void){
        DB.SetLoacl(Key.guideUnlockPaint, true);
        SceneManager.ins.OpenPanelByName("PaintPanel",(paintPanel:PaintPanel)=>{
            paintPanel.beginTip(Config.heroAdvises);
            paintPanel.saveCallback = (pixels:Uint8Array)=>{
                //点击画图面板的保存按钮时
                SceneManager.ins.OpenPanelByName("PreviewPanel",(previewPanel:PreviewPanel)=>{
                    previewPanel.initHero(pixels);
                    //点击取名面板的确定按钮时
                    previewPanel.okCallback = (name)=>{
                        DB.SetLoacl(Key.guideDrawFish, true);
                        let path = Game.savePixels(pixels);
                        let hero = Game.newHeroConf(name||"我的画作", path);
                        let theme = Game.newThemeConf(hero.id);
                        DB.SetLoacl(Key.ThemeId, theme.id);
                        //连续关闭两个面板
                        SceneManager.ins.popPanel();
                        SceneManager.ins.popPanel();
                        callback(hero, theme);
                    };
                }); 
                      
            }
        });
    }
}