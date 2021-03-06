import { DirType } from "./Config";

export enum Ease{
    quintOut = 'quintOut',
    quintIn = 'quintIn',
    cubicOut = 'cubicOut',
    cubicIn = 'cubicIn',

}

export declare class LvlConf{
    virusList:VirusInitData[];
}
export declare class VirusInitData{
    t:number;
    v:number;
    x:number;
    y:number;
    vx:number;
    vy:number
};

export class RankData{
    rank:number;
    time:number;
};
export class ThemeData{
    id:number|string;
    star?:number;
    uploaded?:boolean;
    author?:string;
    heroId:number|string;
    monsterIds:(number|string)[];
    bgId?:number|string;
    heartId?:number|string;
    shieldId?:number|string;
    cost:{coin:number, diamond:number};
    isCustom?:boolean;
    isDynamic?:boolean;
}
export class HeroConfig {
    id:number|string;
    url:string;
    name:string;
}
export class MonsterConfig{
    id:number|string;
    url:string;
    name:string;
    dirType:DirType;
    box?:{offset?:cc.Vec2, size?:cc.Size};
    circle?:{offset?:cc.Vec2, radius?:number};
    angleSpeedRange?:number[][];
    isCustom?:boolean
}
export class ColorData{
    id:number|string;
    name:string;
    color:cc.Color;
}
export class HeartData{
    id:number|string;
    name:string;
    url:string;
    isCustom?:boolean;
}

export class ShieldData{
    id:number|string;
    name:string;
    url:string;
    isCustom?:boolean;
}

export class BgData{
    id:number|string;
    name:string;
    url:string;
    color?:cc.Color;
    isCustom?:boolean;
}