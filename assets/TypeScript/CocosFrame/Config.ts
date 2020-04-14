import { ColorData, DramaData, MonsterConfig } from "./dts";
export enum PrefabPath{
    heart = "Prefab/Prop/Heart",
    shield = "Prefab/Prop/Shield",
    monster = "Prefab/Monster/Monster",
}
export enum DirType{
    Upward,     //向上
    HorFlip,    //水平方向翻转
    Forwards,   //朝向前方
    Rotate,     //旋转
}
export namespace Config{
    export function getColorDataByID(id){
        return colors.find((data)=>{return data.id == id});
    }
    export let dramas:DramaData[]=[

        {id:1, heroId:1, monsterIds:[11,12,13]},
        {id:2, heroId:2, monsterIds:[21,22,23]},
        {id:3, heroId:3, monsterIds:[31,32,33]},
        {id:4, heroId:4, monsterIds:[41,42,43]},
        {id:5, heroId:5, monsterIds:[51]},
        {id:6, heroId:6, monsterIds:[61,62,63]},
        {id:7, heroId:7, monsterIds:[71,72,73]},
        {id:8, heroId:8, monsterIds:[81,82]},
        {id:9, heroId:9, monsterIds:[91,92,93]},
        {id:10, heroId:10, monsterIds:[101,102,103]},
    ]
    export let heros:any[] = [
        {id:1, name:"", url:"Atlas/Hero/hero1" },
        {id:2, name:"", url:"Atlas/Hero/hero2" },
        {id:3, name:"", url:"Atlas/Hero/hero3" },
        {id:4, name:"", url:"Atlas/Hero/hero4" },
        {id:5, name:"", url:"Atlas/Hero/hero5" },
        {id:6, name:"", url:"Atlas/Hero/hero6" },
        {id:7, name:"", url:"Atlas/Hero/hero7" },
        {id:8, name:"", url:"Atlas/Hero/hero8" },
        {id:9, name:"", url:"Atlas/Hero/hero9" },
        {id:10, name:"", url:"Atlas/Hero/hero10" },
    ] 
    export let monsters:MonsterConfig[] = [
        {id:11, url:"Atlas/Monster/monster11", dirType:DirType.Forwards},
        {id:12, url:"Atlas/Monster/monster12", dirType:DirType.Forwards},
        {id:13, url:"Atlas/Monster/monster13", dirType:DirType.Forwards},

        {id:21, url:"Atlas/Monster/monster21", dirType:DirType.Rotate},
        {id:22, url:"Atlas/Monster/monster22", dirType:DirType.Upward},
        {id:23, url:"Atlas/Monster/monster23", dirType:DirType.Rotate},

        {id:31, url:"Atlas/Monster/monster31", dirType:DirType.HorFlip},
        {id:32, url:"Atlas/Monster/monster32", dirType:DirType.HorFlip},
        {id:33, url:"Atlas/Monster/monster33", dirType:DirType.HorFlip},

        {id:41, url:"Atlas/Monster/monster41", dirType:DirType.Rotate},
        {id:42, url:"Atlas/Monster/monster42", dirType:DirType.Forwards},
        {id:43, url:"Atlas/Monster/monster43", dirType:DirType.Rotate},

        {id:51, url:"Atlas/Monster/monster51", dirType:DirType.Upward},


        {id:61, url:"Atlas/Monster/monster61", dirType:DirType.Rotate},
        {id:62, url:"Atlas/Monster/monster62", dirType:DirType.Rotate},
        {id:63, url:"Atlas/Monster/monster63", dirType:DirType.Rotate},

        {id:71, url:"Atlas/Monster/monster71", dirType:DirType.Rotate},
        {id:72, url:"Atlas/Monster/monster72", dirType:DirType.Forwards},
        {id:73, url:"Atlas/Monster/monster73", dirType:DirType.Forwards},

        {id:81, url:"Atlas/Monster/monster81", dirType:DirType.HorFlip},
        {id:82, url:"Atlas/Monster/monster82", dirType:DirType.HorFlip},

        {id:91, url:"Atlas/Monster/monster91", dirType:DirType.Upward},
        {id:92, url:"Atlas/Monster/monster92", dirType:DirType.Upward},
        {id:93, url:"Atlas/Monster/monster93", dirType:DirType.Upward},

        {id:101, url:"Atlas/Monster/monster101", dirType:DirType.Upward},
        {id:102, url:"Atlas/Monster/monster102", dirType:DirType.Upward},
        {id:103, url:"Atlas/Monster/monster103", dirType:DirType.Upward},
    ]

    export let colors:ColorData[] = [
        {id:1, name:'黑色', color:cc.color(0,0,0)},
        {id:2, name:'黑色', color:cc.color(34,32,52)},
        {id:3, name:'黑色', color:cc.color(69,40,60)},
        {id:4, name:'黑色', color:cc.color(102,57,49)},
        {id:5, name:'黑色', color:cc.color(143,86,59)},
        {id:6, name:'黑色', color:cc.color(223,113,38)},
        {id:7, name:'黑色', color:cc.color(217,160,102)},
        {id:8, name:'黑色', color:cc.color(238,195,154)},
        {id:9, name:'黑色', color:cc.color(251,242,54)},
        {id:10, name:'黑色', color:cc.color(153,229,80)},
        {id:11, name:'黑色', color:cc.color(106,190,48)},
        {id:12, name:'黑色', color:cc.color(55,148,110)},
        {id:13, name:'黑色', color:cc.color(75,105,47)},
        {id:14, name:'黑色', color:cc.color(82,75,36)},
        {id:15, name:'黑色', color:cc.color(50,60,57)},
        {id:16, name:'黑色', color:cc.color(63,63,116)},
        {id:17, name:'黑色', color:cc.color(48,96,130)},
        {id:18, name:'黑色', color:cc.color(91,110,225)},
        {id:19, name:'黑色', color:cc.color(99,155,255)},
        {id:20, name:'黑色', color:cc.color(95,205,228)},
        {id:21, name:'黑色', color:cc.color(203,219,252)},
        {id:22, name:'黑色', color:cc.color(255,255,255)},
        {id:23, name:'黑色', color:cc.color(155,173,183)},
        {id:24, name:'黑色', color:cc.color(132,126,135)},
        {id:25, name:'黑色', color:cc.color(105,106,106)},
        {id:26, name:'黑色', color:cc.color(89,86,82)},
        {id:27, name:'黑色', color:cc.color(118,66,138)},
        {id:28, name:'黑色', color:cc.color(172,50,50)},
        {id:29, name:'黑色', color:cc.color(217,87,99)},
        {id:30, name:'黑色', color:cc.color(215,123,186)},
        {id:31, name:'黑色', color:cc.color(143,151,74)},
        {id:32, name:'黑色', color:cc.color(138,111,48)},
    ]
    
    export function getlvlConf(lvl:number){
        let conf = cc.loader.getRes("Conf/Level");
        return conf.json[lvl];
    }
}