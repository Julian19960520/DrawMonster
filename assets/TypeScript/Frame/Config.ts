import { ColorData, ThemeData, MonsterConfig, BgData, HeartData, ShieldData } from "./dts";
import { GashaRewardType } from "../Scene/GashaScene/GashaRewardItem";
export enum PrefabPath{
    heart = "Prefab/Prop/Heart",
    shield = "Prefab/Prop/Shield",
    clock = "Prefab/Prop/Clock",
    coinBag = "Prefab/Prop/CoinBag",
    diamond = "Prefab/Prop/Diamond",
    monster = "Prefab/Monster/Monster",   
}
export enum DirType{
    Upward,     //向上
    HorFlip,    //水平方向翻转
    Forwards,   //朝向前方
    Rotate,     //旋转
}
export namespace Config{
    export let gashaRewards = [
        {type:GashaRewardType.coin, cnt:100, probability:10},
        {type:GashaRewardType.coin, cnt:200, probability:5},
        {type:GashaRewardType.coin, cnt:500, probability:2},
        {type:GashaRewardType.coin, cnt:800, probability:1},
        {type:GashaRewardType.diamond, cnt:1, probability:10},
        {type:GashaRewardType.diamond, cnt:2, probability:5},
        {type:GashaRewardType.diamond, cnt:5, probability:2},
        {type:GashaRewardType.diamond, cnt:8, probability:1},
        // {type:GashaRewardType.theme, id:1, probability:0},
        // {type:GashaRewardType.ball, cnt:1, probability:5},
        // {type:GashaRewardType.ball, cnt:2, probability:2},
        {type:GashaRewardType.ball, cnt:3, probability:1},

        // {type:GashaRewardType.none, probability:10},
    ]
    export let rebornCostCoin = 150;
    export let gashaCostCoin = 300;
    export let freeGashaTime = 4*60*60*1000;
    export let unlockPaintTimes = 0;
    export let collectGameDiamodCnt = 5;
    export let luckyCatCoinBet = 3;
    export let themeToCoinCnt = 50;
    export let minRecordTime = 4*1000;

    export let paintTips = [
        "【颜料桶】要施放在封闭的区域内哦！",
        "使用【颜料桶】，快速填充色彩！",
        "【蓝圈】即为碰撞区",
        "画箭？请箭头指向右边，并选C",
        "画完怪物后，别忘了选择方向哦！",
        "蘸水棉签 + 保鲜膜 = 自制触控笔！",
        "巧用橡皮擦，精准修图～",
        "分享录屏！上热门不是梦！",
        "没想好画什么？试试你喜欢的游戏动漫！",
        "画出你喜欢的动漫、游戏！",
        "分享录屏时选择加速，更魔性！",
        "分享录屏时更换配乐，更容易火🔥",
    ];
    export let dailyTask = [
        {
            detail:"领取每日签到奖励",
        },
        {
            detail:"复活一次",
        },
        {
            detail:"完成2局游戏",
        },
        {
            detail:"达成20秒",
        },
        {
            detail:"达成30秒",
        },
        {
            detail:"达成40秒",
        },
        {
            detail:"花费500金币",
        },
        {
            detail:"启动扭蛋3次",
        },
        {
            detail:"累计看广告5次",
        },
    ];
    export let heartLvlConf = [
        {max:1, initCnt:0},
        {max:1, initCnt:1, detail:"开局桃心+1", cost:{coin:300,diamond:0}},
        {max:2, initCnt:1, detail:"最大桃心+1", cost:{coin:800,diamond:5}},
        {max:2, initCnt:2, detail:"开局桃心+1", cost:{coin:2000,diamond:15}},
        {max:3, initCnt:2, detail:"最大桃心+1", cost:{coin:5000,diamond:50}},
        {max:3, initCnt:3, detail:"开局桃心+1", cost:{coin:12000,diamond:200}},
    ]
    export let shieldLvlConf = [
        {duration:2, size:50},
        {duration:2, size:60, detail:"尺寸+10", cost:{coin:300,diamond:0}},
        {duration:2.5, size:60, detail:"时长+0.5秒", cost:{coin:800,diamond:5}},
        {duration:2.5, size:70, detail:"尺寸+10", cost:{coin:2000,diamond:15}},
        {duration:3, size:70, detail:"时长+0.5秒", cost:{coin:5000,diamond:50}},
        {duration:3.5, size:80, detail:"尺寸+10，时间+0.5", cost:{coin:12000,diamond:200}},
    ]
    export let coinBagLvlConf = [
        {coin:25, diamond:0},
        {coin:50, diamond:0, detail:"袋内金币+25", cost:{coin:300,diamond:0}},
        {coin:50, diamond:1, detail:"袋内钻石+1", cost:{coin:800,diamond:5}},
        {coin:75, diamond:1, detail:"袋内金币+25", cost:{coin:2000,diamond:15}},
        {coin:75, diamond:2, detail:"袋内钻石+1", cost:{coin:5000,diamond:50}},
        {coin:100, diamond:3, detail:"金币+25，钻石+1", cost:{coin:12000,diamond:200}},
    ]
    export let themes:ThemeData[]=[
        {id:1, heroId:1, cost:{coin:500,diamond:5}, bgId:1, monsterIds:[11,12,13,14]},//咸鱼
        {id:2, heroId:2, cost:{coin:1000,diamond:5}, bgId:2, monsterIds:[21,22,23]},   //孤独小人
        {id:3, heroId:3, cost:{coin:1000,diamond:0}, bgId:1, monsterIds:[31,32,33]},   //飞机
        {id:4, heroId:4, cost:{coin:1000,diamond:5}, bgId:1, monsterIds:[41]},         //雪人
        {id:5, heroId:5, cost:{coin:2000,diamond:5}, bgId:3, monsterIds:[51,52]},      //忍者
        {id:6, heroId:6, cost:{coin:2000,diamond:5}, bgId:1, monsterIds:[61,62,63]},   //胖女孩
        {id:7, heroId:7, cost:{coin:1500,diamond:5}, bgId:1, monsterIds:[71,72]},      //地球
        {id:8, heroId:8, cost:{coin:1500,diamond:5}, bgId:1, monsterIds:[81,82]},      //树

        {id:9, heroId:9, cost:{coin:500,diamond:0}, bgId:1, monsterIds:[91]},         //奶牛
        {id:10, heroId:10, cost:{coin:1500,diamond:5}, bgId:1, monsterIds:[101,102]},  //马桶
        {id:11, heroId:11, cost:{coin:1500,diamond:5}, bgId:1, monsterIds:[111,112,113]},//纸牌
        {id:12, heroId:12, cost:{coin:1500,diamond:5}, bgId:1, monsterIds:[121,122]},  //城堡
        {id:13, heroId:13, cost:{coin:3000,diamond:5}, bgId:3, monsterIds:[131,132]},  //吸血鬼

        {id:14, heroId:14, cost:{coin:1000,diamond:5}, bgId:1, monsterIds:[141]},      //猫
        {id:15, heroId:15, cost:{coin:2000,diamond:5}, bgId:1, monsterIds:[151]},      //狗
        {id:16, heroId:16, cost:{coin:3000,diamond:5}, bgId:1, monsterIds:[161]},      //兔子
        {id:17, heroId:17, cost:{coin:4000,diamond:5}, bgId:1, monsterIds:[171]},      //熊猫

        {id:18, heroId:18, cost:{coin:4000,diamond:5}, monsterIds:[181,182,183,184,185]},  //果冻男孩
    ]
    export let shopPages = [
        {name:"可爱小动物", themeIds:[1,9,14,15,16,17]},
        {name:"角色扮演", themeIds:[2,4,5,6,13,18]},
        {name:"新奇", themeIds:[3,7,8,10,11,12]},
    ]
    export let heros:any[] = [
        {id:1, name:"", url:"Atlas/Hero/fish" },
        {id:2, name:"", url:"Atlas/Hero/aloneMan" },
        {id:3, name:"", url:"Atlas/Hero/airplane" },
        {id:4, name:"", url:"Atlas/Hero/snowMan" },
        {id:5, name:"", url:"Atlas/Hero/ninja" },
        {id:6, name:"", url:"Atlas/Hero/fatGirl" },
        {id:7, name:"", url:"Atlas/Hero/earth" },
        {id:8, name:"", url:"Atlas/Hero/tree" },
        {id:9, name:"", url:"Atlas/Hero/cow" },
        {id:10, name:"", url:"Atlas/Hero/flushToilet" },
        {id:11, name:"", url:"Atlas/Hero/card3" },
        {id:12, name:"", url:"Atlas/Hero/castle" },
        {id:13, name:"", url:"Atlas/Hero/vampires" },

        {id:14, name:"", url:"Atlas/Hero/cat" },
        {id:15, name:"", url:"Atlas/Hero/dog" },
        {id:16, name:"", url:"Atlas/Hero/rabbit" },
        {id:17, name:"", url:"Atlas/Hero/panda" },

        {id:18, name:"", url:"Atlas/Hero/boy" },
    ] 
    export let monsters:MonsterConfig[] = [
        {id:11, url:"Atlas/Monster/punk", name:"鲨鱼", dirType:DirType.Forwards, box:{size:cc.size(115,65)} },
        {id:12, url:"Atlas/Monster/lanternFish", name:"灯笼鱼", dirType:DirType.Forwards, box:{size:cc.size(115,80)} },
        {id:13, url:"Atlas/Monster/jellyFish", name:"水母", dirType:DirType.HorFlip, box:{size:cc.size(100,100)} },
        {id:14, url:"Atlas/Monster/fishBone", name:"鱼骨头", dirType:DirType.Forwards, box:{size:cc.size(100,50)} },


        {id:21, url:"Atlas/Monster/lonely1", name:"孤独", dirType:DirType.Upward, box:{size:cc.size(110,60)} },
        {id:22, url:"Atlas/Monster/lonely2", name:"寂寞", dirType:DirType.Upward, box:{size:cc.size(110,60)}  },
        {id:23, url:"Atlas/Monster/lonely3", name:"冷", dirType:DirType.Upward, box:{size:cc.size(110,60)} },
        
        {id:31, url:"Atlas/Monster/bullet", name:"子弹", dirType:DirType.Forwards, box:{size:cc.size(100,30)} },
        {id:32, url:"Atlas/Monster/missile1", name:"导弹", dirType:DirType.Forwards, box:{size:cc.size(115,45)} },
        {id:33, url:"Atlas/Monster/missile2", name:"导弹", dirType:DirType.Forwards, box:{size:cc.size(115,45)} },

        {id:41, url:"Atlas/Monster/fireBall", name:"火球", dirType:DirType.Forwards, box:{size:cc.size(90,45)} },

        {id:51, url:"Atlas/Monster/shuriken1", name:"手里剑", dirType:DirType.Rotate, circle:{radius:50}, angleSpeedRange:[[-360,-150],[150,300]] },
        {id:52, url:"Atlas/Monster/shuriken2", name:"苦无", dirType:DirType.Forwards, box:{size:cc.size(130,30)} },

        {id:61, url:"Atlas/Monster/hamberger", name:"汉堡", dirType:DirType.HorFlip, circle:{radius:55} },
        {id:62, url:"Atlas/Monster/teaMilk", name:"奶茶", dirType:DirType.HorFlip, box:{size:cc.size(60,100), offset:cc.v2(0,-8)} },
        {id:63, url:"Atlas/Monster/drumsticks", name:"鸡腿", dirType:DirType.Rotate, circle:{radius:40, offset:cc.v2(7,16)} },


        {id:71, url:"Atlas/Monster/moon", name:"小行星", dirType:DirType.Rotate, circle:{radius:60}, angleSpeedRange:[[-30,30]] },
        {id:72, url:"Atlas/Monster/meteorite", name:"陨石", dirType:DirType.Rotate, circle:{radius:50}, angleSpeedRange:[[-90,90]] },
        
        {id:81, url:"Atlas/Monster/axe", name:"斧头", dirType:DirType.Rotate, box:{size:cc.size(70,90)}, angleSpeedRange:[[-300,-200]] },
        {id:82, url:"Atlas/Monster/saw", name:"锯子", dirType:DirType.Forwards, box:{size:cc.size(120,45)} },
        
        {id:91, url:"Atlas/Monster/aline", name:"外星人", dirType:DirType.Upward, circle:{radius:50} },
        
        {id:101, url:"Atlas/Monster/shit", name:"便便", dirType:DirType.Upward, box:{size:cc.size(60,60)} },
        {id:102, url:"Atlas/Monster/toiletPaper", name:"厕纸", dirType:DirType.Rotate, box:{size:cc.size(60,60)}, angleSpeedRange:[[-150,-100],[100,150]]},
        
        {id:111, url:"Atlas/Monster/cardK", name:"K", dirType:DirType.Rotate, box:{size:cc.size(70,90)}, angleSpeedRange:[[-150,-100],[100,150]] },
        {id:112, url:"Atlas/Monster/cardA", name:"A", dirType:DirType.Rotate, box:{size:cc.size(70,90)}, angleSpeedRange:[[-150,-100],[100,150]] },
        {id:113, url:"Atlas/Monster/cardJoker", name:"JOKER", dirType:DirType.Rotate, box:{size:cc.size(70,90)}, angleSpeedRange:[[-150,-100],[100,150]] },

        {id:121, url:"Atlas/Monster/bomb1", name:"炸弹", dirType:DirType.Rotate, box:{size:cc.size(70,90)}, angleSpeedRange:[[-150,-100],[100,150]] },
        {id:122, url:"Atlas/Monster/bomb2", name:"炸弹", dirType:DirType.Rotate, box:{size:cc.size(60,110)}, angleSpeedRange:[[-150,-100],[100,150]] },

        {id:131, url:"Atlas/Monster/cross", name:"十字架", dirType:DirType.Upward, circle:{radius:50} },
        {id:132, url:"Atlas/Monster/rip", name:"墓碑", dirType:DirType.Upward, circle:{radius:50} },

        {id:141, url:"Atlas/Monster/driedFish", name:"小鱼干", dirType:DirType.Forwards, box:{size:cc.size(90,20)} },
        {id:151, url:"Atlas/Monster/bone", name:"骨头", dirType:DirType.Rotate, box:{size:cc.size(50,80)}, angleSpeedRange:[[-150,-100],[100,150]] },
        {id:161, url:"Atlas/Monster/carrot", name:"胡萝卜", dirType:DirType.Rotate, box:{size:cc.size(70,100)}, angleSpeedRange:[[-150,-100],[100,150]] },
        {id:171, url:"Atlas/Monster/bamboo", name:"竹子", dirType:DirType.Rotate, circle:{radius:45}, angleSpeedRange:[[-150,-100],[100,150]] },

        {id:181, url:"Atlas/Monster/girl", name:"可爱女孩", dirType:DirType.Upward, box:{size:cc.size(50,80)} },
        {id:182, url:"Atlas/Monster/pulsation", name:"迈冻", dirType:DirType.Rotate, box:{size:cc.size(50,80)}, angleSpeedRange:[[-150,-100],[100,150]] },
        {id:183, url:"Atlas/Monster/greenJelly", name:"绿色果冻", dirType:DirType.Rotate, circle:{radius:50}, angleSpeedRange:[[-150,-100],[100,150]] },
        {id:184, url:"Atlas/Monster/redJelly", name:"红色果冻", dirType:DirType.Rotate, circle:{radius:50}, angleSpeedRange:[[-150,-100],[100,150]] },
        {id:185, url:"Atlas/Monster/blueJelly", name:"蓝色果冻", dirType:DirType.Rotate, circle:{radius:50}, angleSpeedRange:[[-150,-100],[100,150]] },
    ]
    export let bgs:BgData[] = [
        {id:1, name:'浅蓝', url:"Atlas/UI/white", color:cc.color(190,237,241)},
        {id:2, name:'偏蓝银白', url:"Atlas/UI/white", color:cc.color(203,219,252)},
        {id:3, name:'黑夜', url:"Atlas/UI/white", color:cc.color(34,32,52)},
        {id:4, name:'黑色', url:"Atlas/UI/white", color:cc.color(102,57,49)},
        {id:5, name:'黑色', url:"Atlas/UI/white", color:cc.color(143,86,59)},
        {id:6, name:'黑色', url:"Atlas/UI/white", color:cc.color(223,113,38)},
    ]
    export let hearts:HeartData[] = [
        {id:1, name:'桃心', url:"Atlas/Prop/heart"},
    ]
    export let shields:ShieldData[] = [
        {id:1, name:'护盾', url:"Atlas/Prop/shield"},
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
    export let finishRewards = [
        {type:"coin", cnt: 50, pr:10},
        {type:"coin", cnt: 100, pr:8},
        {type:"coin", cnt: 200, pr:5},
        {type:"coin", cnt: 300, pr:2},
        {type:"coin", cnt: 500, pr:1},
    ];
    export let gainKeyCosts = [10, 20, 40];
    export function getlvlConf(lvl:number){
        let conf = cc.loader.getRes("Conf/Level");
        return conf.json[lvl];
    }
    export function getColorDataByID(id){
        return colors.find((data)=>{return data.id == id});
    }
}


//绿色：#B2EEC7
//黄色：#FFFFB3
//蓝色：#AAD6FF
// CDN：http://154.8.223.76:8832/