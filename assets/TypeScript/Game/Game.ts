import { RankData, ThemeData, MonsterConfig, HeroConfig } from "../Frame/dts";
import { DB } from "../Frame/DataBind";
import { Config, DirType } from "../Frame/Config";
import { crossPlatform } from "../Frame/CrossPlatform";
import { Key } from "./Key";

export namespace Game{
    export let timeScale = 1;
    export function Init(){
        initHeroAndMonsterConfig();
    }

    //得到一个不重复的ID
    export function newUuid(){
        let uuid = DB.Get("uuid");
        DB.SetLoacl("uuid", uuid+1);
        return uuid;
    }

    /*****************************
     * 图片存取
     ****************************/
    let compDataCache = new Map<string, Uint8Array>();
    let textureCache = new Map<string, cc.RenderTexture>();
    //保存像素数据到本地，返回保存路径
    export function savePixels(pixels:Uint8Array){    
        let rootPath = crossPlatform.env.USER_DATA_PATH+"/pixels/";
        let uuid = Game.newUuid();
        let fm = crossPlatform.getFileSystemManager();
        try {
            fm.accessSync(rootPath)
        } catch (e) {
            fm.mkdirSync(rootPath, true);
        }
        let path = rootPath+uuid;  
        let compData = compressPixels(pixels);
        fm.writeFileSync(path, compData.buffer);
        compDataCache.set(path, compData);
        return path;
    }

    //读取texture，可以传入资源名、或者像素文件路径
    export function loadTexture(path, callback){
        if(path.includes("/pixels/")){
            let texture = textureCache.get(path);
            if(!texture){
                texture = new cc.RenderTexture();
                let compData:any = compDataCache.get(path);
                if(!compData){
                    let fm = crossPlatform.getFileSystemManager();
                    let arrayBuffer:any = fm.readFileSync(path);
                    compData = new Uint8Array(arrayBuffer); 
                    compDataCache.set(path, compData);
                }
                let pixels:any = decompressionPixels(compData);
                texture.initWithData(pixels, cc.Texture2D.PixelFormat.RGBA8888, 512, 512);
                textureCache.set(path, texture);
            }
            callback(texture);
        }
        else{
            cc.loader.loadRes(path, (err, asset) => {
                if (!err) {
                    callback(asset);
                }
            });
        }
    }
    let compressVersion = 1;
    export function compressPixels(pixels:Uint8Array){
        let colors = [];        //四个一组，分别为rgba，颜色下标即为在此数组出现的顺序
        let sections = [];        //每两个一组，分别为 相同颜色像素连续个数，颜色下标

        let cIdx = -1;          //上个像素的颜色下标
        let idx = 0;
        let pixelsLen = pixels.length;
        let r,g,b,a, cnt=0;
        while(idx<pixelsLen){
            r = pixels[idx];
            g = pixels[idx+1];
            b = pixels[idx+2];
            a = pixels[idx+3];
            //初始化第一个颜色
            if(colors.length == 0){
                colors.push(r,g,b,a);
                cIdx = 0;
            }
            //判断当前像素颜色是否与上个像素相同
            if(r == colors[cIdx*4]
                && g == colors[cIdx*4+1]
                && b == colors[cIdx*4+2]
                && a == colors[cIdx*4+3]){
                    //相同，计数+1
                    cnt++;
                    //Uint8Array中最大能存255，
                    if(cnt==255){
                        sections.push(cnt, cIdx);
                        cnt=0;
                    }
            }else{
                //不同，则将连续像素存入数组
                sections.push(cnt, cIdx);
                let newcIdx = -1;
                for(let i=0; i<colors.length; i+=4){
                    if(colors[i] == r && colors[i+1] == g &&colors[i+2] == b &&colors[i+3] == a){
                        newcIdx = i/4;
                        break;
                    }
                }
                if(newcIdx == -1){
                    newcIdx = colors.length/4;
                    colors.push(r,g,b,a);
                }
                cnt = 1;
                cIdx = newcIdx;
            }
            idx += 4;
        }
        //最后一个连续像素没有触发“颜色不同”分支，结束时直接存入最后一个连续像素
        sections.push(cnt, cIdx);
        let func = (num)=>{
            return [
                num>>>24,
                (num&0x00ff0000)>>16,
                (num&0x0000ff00)>>8,
                (num&0x000000ff)
            ]
        }
        let head = func(compressVersion)
                        .concat(func(pixelsLen))
                        .concat(func(colors.length))
                        .concat(func(sections.length));
        let array = func(head.length).concat(head).concat(colors).concat(sections);
        console.log("原大小："+pixels.length+",压缩后大小："+array.length+",压缩比："+(array.length/pixels.length));
        return new Uint8Array(array);
    }
    export function decompressionPixels(compData:Uint8Array){
        let func = (arr:number[])=>{
            return (arr[0]<<24) + (arr[1]<<16) + (arr[2]<<8) + arr[3];
        }
        let array = Array.from(compData);
        let headLen = func(array.slice(0, 4));
        let head = array.slice(4, 4+headLen);
        let compressVersion = func(head.slice(0, 4));
        if(compressVersion == 1){
            let pixelsLen = func(head.slice(4,8));
            let colorsLen = func(head.slice(8,12));
            let sectionsLen = func(head.slice(12,16));
            let pixels = new Uint8Array(pixelsLen);
            let begin = 4+headLen;
            let colors = array.slice(begin, begin+colorsLen);
            let sections = array.slice(begin+colorsLen, begin+colorsLen+sectionsLen);
            let idx = 0;
            let sIdx = 0;
            while(sIdx<sectionsLen){
                let cnt = sections[sIdx];
                let cIdx = sections[sIdx+1];
                
                let colorR = colors[cIdx*4];
                let colorG = colors[cIdx*4+1];
                let colorB = colors[cIdx*4+2];
                let colorA = colors[cIdx*4+3];

                for(let i=0;i<cnt;i++){
                    pixels[idx] = colorR;
                    pixels[idx+1] = colorG;
                    pixels[idx+2] = colorB;
                    pixels[idx+3] = colorA;
                    idx+=4;
                }
                sIdx+=2;
            }
            return pixels;
        }else{
            return new Uint8Array();
        }

        // let nr = color>>>24;
        // let ng = (color&0x00ff0000)>>16;
        // let nb = (color&0x0000ff00)>>8;
        // let na = (color&0x000000ff);
    }
    /*****************************
     * 操作 Hero 和 Monster 数据
     ****************************/
    let heroConfigMap = new Map<number, HeroConfig>();
    let monsterConfigMap = new Map<number, MonsterConfig>();
    let themeConfigMap = new Map<number, ThemeData>();
    export let allHeros = [];
    export let allMonsters = [];
    export let allThemes = [];
    //初始化
    function initHeroAndMonsterConfig(){
        allHeros = DB.Get(Key.CustomHeros).concat(Config.heros);
        for(let i=0; i<allHeros.length; i++){
            let hero = allHeros[i];
            heroConfigMap.set(hero.id, hero);
        }
        allMonsters = DB.Get(Key.CustomMonsters).concat(Config.monsters);
        for(let i=0; i<allMonsters.length; i++){
            let monster = allMonsters[i];
            monsterConfigMap.set(monster.id, monster);
        }
        allThemes = DB.Get(Key.CustomThemes).concat(Config.themes);
        for(let i=0; i<allThemes.length; i++){
            let theme = allThemes[i];
            themeConfigMap.set(theme.id, theme);
        }
    }
    //找到配置
    export function findHeroConf(id){
        return heroConfigMap.get(id);
    }
    export function findMonsterConf(id){
        return monsterConfigMap.get(id);
    }
    export function findThemeConf(id){
        return themeConfigMap.get(id);
    }
    //新建配置
    export function newHeroConf(name, url){
        let id = newUuid();
        let hero = {id:id, name:name, url:url};
        heroConfigMap.set(id, hero);

        let customHeros:any[] = DB.Get(Key.CustomHeros);
        customHeros.unshift(hero);
        allHeros.unshift(hero);
        DB.SetLoacl(Key.CustomHeros, customHeros);
        return hero;
    }
    export function newMonsterConf(name, url, dirType){
        let id = newUuid();
        let monster:MonsterConfig = {
            id:id, 
            name:name,
            url:url,
            dirType:dirType,
            circle:{radius:50},
            isUserPainting:true,
        };
        monsterConfigMap.set(id, monster);

        let customMonsters:any[] = DB.Get(Key.CustomMonsters);
        customMonsters.unshift(monster);
        allMonsters.unshift(monster);
        DB.SetLoacl(Key.CustomMonsters, customMonsters);

        return monster;
    }

    export function newThemeConf(heroId){
        let id = newUuid();
        let monsterIds = [];
        monsterIds.push(allMonsters[0].id);
        monsterIds.push(allMonsters[1].id);
        monsterIds.push(allMonsters[2].id);
        let theme:ThemeData = {id:id, heroId:heroId, monsterIds:monsterIds, isCustom:true, cost:0};
        themeConfigMap.set(id, theme);

        let customThemes:any[] = DB.Get(Key.CustomThemes);
        customThemes.unshift(theme);
        allThemes.unshift(theme);
        DB.SetLoacl(Key.CustomThemes, customThemes);
        let openThemeIds = DB.Get(Key.OpenThemeIds);
        openThemeIds.push(id);
        DB.SetLoacl(Key.OpenThemeIds, openThemeIds);
        return theme;
    }
    export function isThemeOpen(id){
        let openIds:number[] = DB.Get(Key.OpenThemeIds);
        return openIds.indexOf(id) >= 0;
    }
    export function openTheme(id){
        let openIds:number[] = DB.Get(Key.OpenThemeIds);
        openIds.push(id);
        DB.SetLoacl(Key.OpenThemeIds, openIds);
    }
    /*****************************
     * 排行榜
     ****************************/
    export function addRankData(time){
        let newData = {
            rank:1,
            time:time
        }
        let rankDatas:RankData[] = DB.Get(Key.RankDatas);
        for(let i=0; i<rankDatas.length; i++){
            let p = rankDatas[i];
            if(p.time > newData.time){
                newData.rank = p.rank+1;
            }else{
                p.rank++;
            }
        }
        rankDatas.splice(newData.rank-1, 0, newData);
        DB.SetLoacl(Key.RankDatas, rankDatas);
        let themeId = DB.Get(Key.ThemeId);
        crossPlatform.reportAnalytics("gameOver",{
            timeStamp: new Date().getTime(),
            themeId: themeId>1000? 0 : themeId,
            time: time,
        })
    }
    export function getHighScroe(){
        let rankDatas:RankData[] = DB.Get(Key.RankDatas);
        let max = 0;
        for(let i=0;i<rankDatas.length;i++){
            if(max < rankDatas[i].time){
                max = rankDatas[i].time;
            }
        }
        return max;
    }
    /*****************************
     * 结束奖励
     ****************************/
    export function randomFinishRewards(){
        let rewards = Config.finishRewards.concat();
        let res = [];
        while(res.length < 3){
            let totalPR = 0;
            for(let i=0;i<rewards.length;i++){
                totalPR += rewards[i].pr;
            }
            let value = Math.random()*totalPR;
            for(let i=0;i<rewards.length;i++){
                value -= rewards[i].pr;
                if(value<0){
                    res.push(rewards[i]);
                    rewards.splice(i, 1);
                    break;
                }
            }
        }
        return res;
    }

}