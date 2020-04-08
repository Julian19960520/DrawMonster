import { crossPlatform, RankData } from "./CocosFrame/dts";
import { Util } from "./CocosFrame/Util";
import { DB } from "./CocosFrame/DataBind";
import { Config } from "./CocosFrame/Config";

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
    let pixlesCache = new Map<string, Uint8Array>();
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
        fm.writeFileSync(path, pixels.buffer);
        pixlesCache.set(path, pixels);
        return path;
    }

    //读取texture，可以传入资源名、或者像素文件路径
    export function loadTexture(path, callback){
        if(path.includes("/pixels/")){
            let texture = textureCache.get(path);
            if(!texture){
                texture = new cc.RenderTexture();
                let pixels:any = pixlesCache.get(path);
                if(!pixels){
                    let fm = crossPlatform.getFileSystemManager();
                    let arrayBuffer:any = fm.readFileSync(path);
                    pixels = new Uint8Array(arrayBuffer); 
                    pixlesCache.set(path, pixels);
                }
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



    /*****************************
     * 操作 Hero 和 Monster 数据
     ****************************/
    let heroConfigMap = new Map<number, any>();
    let monsterConfigMap = new Map<number, any>();
    let allHeros = [];
    let allMonsters = [];
    //初始化
    function initHeroAndMonsterConfig(){
        allHeros = DB.Get("user/customHeros").concat(Config.heros);
        for(let i=0; i<allHeros.length; i++){
            let hero = allHeros[i];
            heroConfigMap.set(hero.id, hero);
        }
        allMonsters = DB.Get("user/customMonsters").concat(Config.monsters);
        for(let i=0; i<allMonsters.length; i++){
            let monster = allMonsters[i];
            monsterConfigMap.set(monster.id, monster);
        }
    }
    //找到配置
    export function findHeroConf(id){
        return heroConfigMap.get(id);
    }
    export function findMonsterConf(id){
        return monsterConfigMap.get(id);
    }
    //新建配置
    export function newHeroConf(name, url){
        let id = newUuid();
        let hero = {id:id, name:name, url:url};
        heroConfigMap.set(id, hero);

        let customHeros:any[] = DB.Get("user/customHeros");
        customHeros.unshift(hero);
        allHeros.unshift(hero);
        DB.SetLoacl("user/customHeros", customHeros);

        return hero;
    }
    export function newMonsterConf(name, url){
        let id = newUuid();
        let monster = {id:id, name:name, url:url};
        monsterConfigMap.set(id, monster);

        let customMonsters:any[] = DB.Get("user/customMonsters");
        customMonsters.unshift(monster);
        allMonsters.unshift(monster);
        DB.SetLoacl("user/customMonsters", customMonsters);

        return monster;
    }

    /*****************************
     * 排行榜
     ****************************/
    export function addRankData(time){
        let newData = {
            rank:1,
            time:time
        }
        let rankDatas:RankData[] = DB.Get("user/rankDatas");
        for(let i=0; i<rankDatas.length; i++){
            let p = rankDatas[i];
            if(p.time > newData.time){
                newData.rank = p.rank+1;
            }else{
                p.rank++;
            }
        }
        rankDatas.splice(newData.rank-1, 0, newData);
        DB.SetLoacl("user/rankDatas", rankDatas);
    }
}