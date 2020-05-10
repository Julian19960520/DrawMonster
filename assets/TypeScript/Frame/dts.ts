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
    id:number;
    heroId:number;
    monsterIds:number[];
    isCustom?:boolean;
    cost:number;
}
export class HeroConfig {
    id:number;
    url:string;
    name:string;
}
export class MonsterConfig{
    id:number;
    url:string;
    name:string;
    dirType:DirType;
    box?:{offset?:cc.Vec2, size?:cc.Size};
    circle?:{offset?:cc.Vec2, radius?:number};
    angleSpeedRange?:number[][];
    isUserPainting?:boolean
}
export class ColorData{
    id:number;
    name:string;
    color:cc.Color;
}