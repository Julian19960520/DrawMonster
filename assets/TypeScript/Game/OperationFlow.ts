import { Sound } from "../Frame/Sound";
import SceneManager from "../Frame/SceneManager";
import LoadingScene from "../Scene/LoadingScene/LoadingScene";
import { PrefabPath, Config } from "../Frame/Config";
import PlayScene from "../Scene/PlayScene/PlayScene";
import { DB } from "../Frame/DataBind";
import { Key } from "./Key";
import PreviewPanel from "../Panel/PreviewPanel/PreviewPanel";
import { Game } from "./Game";
import Top from "../Frame/Top";
import { Util } from "../Frame/Util";
import PaintScene from "../Panel/PaintPanel/PaintScene";

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
        SceneManager.ins.Enter("PaintScene").then((paintScene:PaintScene)=>{
            paintScene.drawHero((name, )=>{

            });
        });
    }
    export function flyCoin(cnt, fromNode, toNode, autoAdd = true){
        let coinValue = 5;                       //每个硬币的价值
        let scale = 0.6;
        //如果获得太多，则转换成大硬币
        if(cnt>=800){
            coinValue = 40;
            scale = 1.8;
        }
        else if(cnt>=400){
            coinValue = 20;
            scale = 1.4;
        }
        else if(cnt>=200){
            coinValue = 10;
            scale = 1;
        }
        else{
            coinValue = 5;
            scale = 0.6;
        }
        let coinNum = Math.floor(cnt/coinValue); //硬币个数
        let duration = Math.min(coinNum*0.05, 2);//每两个硬币间隔
        Top.bezierSprite({
            url:"Atlas/UI/coin",
            from:Util.convertPosition(fromNode, Top.node),
            to:Util.convertPosition(toNode, Top.node),
            duration:duration,
            cnt:coinNum,
            scale:scale,
            flyTime:0.8,
            onEnd:(finish)=>{
                Sound.play("gainCoin");
                if(autoAdd){
                    DB.Set(Key.Coin, DB.Get(Key.Coin)+coinValue);
                    if(finish){
                        DB.Set(Key.Coin, DB.Get(Key.Coin) + cnt-coinValue*coinNum);
                    }
                }
            }
        });
    }
    export function flyDiamond(cnt, fromNode, toNode, autoAdd = true){
        Top.bezierSprite({
            url:"Atlas/UI/diamond",
            from:Util.convertPosition(fromNode, Top.node),
            to:Util.convertPosition(toNode, Top.node),
            cnt:cnt,
            flyTime:1.2,
            scale:1,
            onBegin:()=>{
                Sound.play("gainDiamond1");
            },
            onEnd:(finish)=>{
                Sound.play("gainDiamond2");
                if(autoAdd){
                    let diamond = DB.Get(Key.Diamond);
                    DB.SetLoacl(Key.Diamond, diamond+1);
                }
            }
        });
    }
}