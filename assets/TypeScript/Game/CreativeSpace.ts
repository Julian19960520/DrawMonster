import { DB } from "../Frame/DataBind";
import { Key } from "./Key";
import { Util } from "../Frame/Util";
import { ThemeData } from "../Frame/dts";
import { Game } from "./Game";

/*****************************
 * 创意空间
 ****************************/
export namespace CreativeSpace{

    //获取动态主题
    export let refreshTime = 60*60*1000;
    let _dynamicThemesStamp = 0;
    export function requestDynamicThemes(callback){
        let dynamicThemes:ThemeData[] = DB.Get(Key.dynamicThemes);
        if(dynamicThemes && Util.getTimeStamp() - _dynamicThemesStamp < refreshTime){
            //有数据 并且 在刷新时间内，直接返回
            DB.Invoke(Key.dynamicThemes);
            callback(dynamicThemes);
        }else{
            setTimeout(() => {
                _dynamicThemesStamp = Util.getTimeStamp();
                dynamicThemes = [
                    {id:1, heroId:1, cost:{coin:0,diamond:0}, monsterIds:[11,12,13,14]},
                    {id:2, heroId:2, cost:{coin:0,diamond:0}, monsterIds:[21,22,23]},
                    {id:3, heroId:3, cost:{coin:0,diamond:0}, monsterIds:[31,32,33]},
                    {id:4, heroId:4, cost:{coin:0,diamond:0}, monsterIds:[41]},
                    {id:5, heroId:5, cost:{coin:0,diamond:0}, monsterIds:[51,52]},
                    {id:6, heroId:6, cost:{coin:0,diamond:0}, monsterIds:[61,62,63]},
                    {id:7, heroId:7, cost:{coin:0,diamond:0}, monsterIds:[71,72]},
                    {id:8, heroId:8, cost:{coin:0,diamond:0}, monsterIds:[81,82]},
                ];
                DB.Set(Key.dynamicThemes, dynamicThemes);
                callback(dynamicThemes);
            }, 100);
        }
    }
    
    //获取标星的主题详细数据
    export function requestStarThemes(callback){
        let starThemes:ThemeData[] = DB.Get(Key.starThemes);
        if(starThemes){
            //有数据，直接返回
            DB.Invoke(Key.starThemes);
            callback(starThemes);
        }else{
            //没数据，网络请求数据
            setTimeout(() => {
                starThemes = [];
                let starThemeIds = DB.Get(Key.StarThemeIds);
                for(let i=0; i<starThemeIds.length; i++){
                    let id = starThemeIds[i];
                    let theme = Game.allThemes.find((theme)=>{
                        return theme.id == id;
                    });
                    if(theme){
                        starThemes.push(theme);
                    }
                }
                DB.Set(Key.starThemes, starThemes);
                callback(starThemes);
            }, 100);
        }
    }

    //我是否点过星？
    export function hasMyStar(theme:ThemeData){
        let starThemeIdsIDs:any[] = DB.Get(Key.StarThemeIds);
        let idx = starThemeIdsIDs.indexOf(theme.id);
        return idx >= 0;
    }

    //给主题标星
    export function doStarTheme(theme:ThemeData){
        let starIds = DB.Get(Key.StarThemeIds) || [];
        starIds.push(theme.id);
        let starThemes:ThemeData[] = DB.Get(Key.starThemes);
        if(starThemes){
            starThemes.push(theme);
        }
        theme.star = theme.star || 0;
        theme.star++;
    }

    //取消星星
    export function cancelStarTheme(theme:ThemeData){
        let starIds:any[] = DB.Get(Key.StarThemeIds) || [];
        let idx = starIds.indexOf(theme.id);
        if(idx>=0){
            starIds.splice(idx,1);
        }
        let starThemes:ThemeData[] = DB.Get(Key.starThemes);
        if(starThemes){
            idx = starThemes.findIndex((temp)=>{
                return temp.id == theme.id;
            })
            if(idx>=0){
                starThemes.splice(idx,1);
            }
        }
        theme.star = theme.star || 0;
        theme.star--;
    }
}