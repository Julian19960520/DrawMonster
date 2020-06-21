import { RankData, ThemeData, MonsterConfig, HeroConfig } from "../Frame/dts";
import { DB } from "../Frame/DataBind";
import { Config, DirType, PrefabPath } from "../Frame/Config";
import { crossPlatform } from "../Frame/CrossPlatform";
import { Key } from "./Key";
import { Sound } from "../Frame/Sound";
import SceneManager from "../Frame/SceneManager";
import LoadingScene from "../Scene/LoadingScene/LoadingScene";
import PlayScene from "../Scene/PlayScene/PlayScene";
import { Util } from "../Frame/Util";
import { HTTP, ServerMsg } from "../Frame/HTTP";

export namespace Game{
    export let timeScale = 1;
    export function Init(){
        initHeroAndMonsterConfig();
    }

    //得到一个不重复的ID
    export function newUuid(){
        let uuid = DB.Get("uuid");
        DB.Set("uuid", uuid+1);
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
            if(texture){
                callback(texture);
            }else{
                texture = new cc.RenderTexture();
                let compData:any = compDataCache.get(path);
                let deelCompData = (compData)=>{
                    let pixels:any = decompressionPixels(compData);
                    texture.initWithData(pixels, cc.Texture2D.PixelFormat.RGBA8888, 512, 512);
                    textureCache.set(path, texture);
                    callback(texture);
                }
                if(compData){
                    deelCompData(compData);
                }else{
                    let fm = crossPlatform.getFileSystemManager();
                    fm.readFile({filePath:path, success:(res)=>{
                        console.log(res);
                        compData = new Uint8Array(res.data); 
                        compDataCache.set(path, compData);
                        deelCompData(compData);
                    }, 
                    fail:(res)=>{
                        Util.loadRes("Atlas/Single/PixelError",cc.Texture2D).then((res:cc.Texture2D)=>{
                            callback(res);
                        }).catch((res)=>{
                        })
                    }});
                }
            }
        }
        else{
            cc.loader.loadRes(path, (err, asset) => {
                if (!err) {
                    callback(asset);
                }
            });
        }
    }
    //删除图片
    export function deleteTexture(path){
        if(path.includes("/pixels/")){
            textureCache.delete(path);
            let fm = crossPlatform.getFileSystemManager();
            try {
                fm.unlinkSync(path);
            } catch (e) {
                console.log(e);
            }
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
    }
    /*****************************
     * 操作 Hero 和 Monster 数据
     ****************************/
    let heroConfigMap = new Map<number|string, HeroConfig>();
    let monsterConfigMap = new Map<number|string, MonsterConfig>();
    let themeConfigMap = new Map<number|string, ThemeData>();
    export let allHeros:HeroConfig[] = [];
    export let allMonsters:MonsterConfig[] = [];
    export let allThemes:ThemeData[] = [];
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
        DB.Set(Key.allThemes, allThemes);
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
        DB.Set(Key.CustomHeros, customHeros);
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
            isCustom:true,
            angleSpeedRange:[[-150,-100],[100,150]],
        };
        monsterConfigMap.set(id, monster);

        let customMonsters:any[] = DB.Get(Key.CustomMonsters);
        customMonsters.unshift(monster);
        allMonsters.unshift(monster);
        DB.Set(Key.CustomMonsters, customMonsters);

        return monster;
    }

    export function newThemeConf(heroId){
        let id = newUuid();
        let monsterIds = [];
        monsterIds.push(allMonsters[0].id);
        monsterIds.push(allMonsters[1].id);
        monsterIds.push(allMonsters[2].id);
        let theme:ThemeData = {id:id, heroId:heroId, monsterIds:monsterIds, isCustom:true, cost:{coin:0,diamond:0}};
        themeConfigMap.set(id, theme);

        let customThemes:any[] = DB.Get(Key.CustomThemes);
        customThemes.unshift(theme);
        allThemes.unshift(theme);
        DB.Set(Key.allThemes, allThemes);
        DB.Set(Key.CustomThemes, customThemes);
        return theme;
    }

    //删除用户绘制英雄
    export function deleteMonsterConf(id){
        monsterConfigMap.delete(id);
        let customMonsters:MonsterConfig[] = DB.Get(Key.CustomMonsters);
        let idx = customMonsters.findIndex((conf)=>{
            return conf.id == id
        });
        if(idx>=0){
            customMonsters.splice(idx, 1);
        }
        idx = allMonsters.findIndex((conf)=>{
            return conf.id == id
        });
        if(idx>=0){
            allMonsters.splice(idx, 1);
        }
        DB.Set(Key.CustomMonsters, customMonsters);
    }

    export function deleteHeroConf(id){
        heroConfigMap.delete(id);
        let customHeros:HeroConfig[] = DB.Get(Key.CustomHeros);
        let idx = customHeros.findIndex((conf)=>{
            return conf.id == id
        });
        if(idx>=0){
            customHeros.splice(idx, 1);
        }
        idx = allHeros.findIndex((conf)=>{
            return conf.id == id
        });
        if(idx>=0){
            allHeros.splice(idx, 1);
        }
        DB.Set(Key.CustomHeros, customHeros);
    }

    export function deleteThemeConf(id){
        themeConfigMap.delete(id);
        let customThemes:ThemeData[] = DB.Get(Key.CustomThemes);
        let idx = customThemes.findIndex((conf)=>{
            return conf.id == id
        });
        if(idx>=0){
            customThemes.splice(idx, 1);
        }
        idx = allThemes.findIndex((conf)=>{
            return conf.id == id
        });
        if(idx>=0){
            allThemes.splice(idx, 1);
            DB.Set(Key.allThemes, allThemes);
        }
        DB.Set(Key.CustomThemes, customThemes);
    }

    export function isThemeOpen(id){
        let openIds:number[] = DB.Get(Key.OpenThemeIds);
        return openIds.indexOf(id) >= 0;
    }
    export function openTheme(id){
        let openIds:number[] = DB.Get(Key.OpenThemeIds);
        openIds.push(id);
        DB.Set(Key.OpenThemeIds, openIds);
    }
    /*****************************
     * 排行榜
     ****************************/
    let lastWorldRankStamp = 0;
    export function requestWorldRank(refresh, callback){
        setTimeout(() => {
            callback([
                {rank:465,time:22},
                {rank:466,time:21},
                {rank:467,time:20},
                {rank:468,time:19},
                {rank:468,time:18},
                {rank:470,time:17},
                {rank:471,time:16},
            ])
        }, 100);
        return ;
        let worldRank = DB.Get(Key.WorldRank);
        if(!worldRank || Util.getTimeStamp()-lastWorldRankStamp>60*1000 || refresh){
            HTTP.GET(ServerMsg.worldRank, {}, (res)=>{
                DB.Set(Key.WorldRank, res);
                callback(res);
            });
        }else{
            callback(worldRank);
        }
    }
    /*****************************
     * 个人记录
     ****************************/
    export function addRankData(time){
        let oldHighScore = Game.getHighScroe();
        //插入新数据
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
        //最多保存10个
        if(rankDatas.length>10){
            rankDatas.splice(10, rankDatas.length-10);
        }
        DB.Set(Key.RankDatas, rankDatas);
        //更新开放域最高分数据
        if(time>oldHighScore){
            crossPlatform.setUserCloudStorage({
                KVDataList:[{key:"highScore",value:`${time}`}],
                success:()=>{
                    
                },
                complete:(res)=>{
                    console.log("设置开放域最高分",res);
                }
            });
        }
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

    /*****************************
     * 升级相关数据
     ****************************/
    export function getHeartInitCnt(){
        let conf = Config.heartLvlConf[DB.Get(Key.HeartLvl)-1];
        return conf.initCnt;
    }
    export function getHeartMax(){
        let conf = Config.heartLvlConf[DB.Get(Key.HeartLvl)-1];
        return conf.max;
    }
    export function getShiledDuration(){
        let conf = Config.shieldLvlConf[DB.Get(Key.ShieldLvl)-1];
        return conf.duration;
    }
    export function getShiledSize(){
        let conf = Config.shieldLvlConf[DB.Get(Key.ShieldLvl)-1];
        return conf.size;
    }
    export function getCoinBagCoin(){
        let conf = Config.coinBagLvlConf[DB.Get(Key.CoinBagLvl)-1];
        return conf.coin;
    }
    export function getCoinBagDiamond(){
        let conf = Config.coinBagLvlConf[DB.Get(Key.CoinBagLvl)-1];
        return conf.diamond;
    }
    export function calcuFinishBet(coin, diamond){
        //翻倍数据：倍数为4，5，6时最多，倍数为3和7次之，倍数为2最少
        if(coin>=50 || diamond>=2){
            if(coin > 100 || diamond >=4){
                return Util.randomInt(3, 4);
            }else{
                return Util.randomInt(4, 6);
            }
        }else{
            return Util.randomInt(2, 8);
        }
    }
    //离线收益
    
    export function getLuckyCatCoin(){
        let beginStamp = DB.Get(Key.luckyCatBeginStamp);
        if(beginStamp == 0){
            return 0;
        }else{
            let stamp = Util.getTimeStamp();
            let time = stamp - beginStamp;
            time = Math.min(time, 2*60*60*1000);    //最多4小时
            let step = Math.floor(time/1000/5); //每5秒获得一次
            return step * 1;    //每次1个
        }
    }
    export function resetLuckyCat(){
        DB.Set(Key.luckyCatBeginStamp, Util.getTimeStamp());
    }
    export function isLuckyCatOpen(){
        return DB.Get(Key.luckyCatBeginStamp) != -1;
    }
    export function addCoin(addCnt){
        DB.Set(Key.Coin, DB.Get(Key.Coin) + addCnt);
    }
    export function addDiamond(addCnt){
        DB.Set(Key.Diamond, DB.Get(Key.Diamond) + addCnt);
    }
}