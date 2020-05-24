// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import ScrollList from "../../CustomUI/ScrollList";
import { Util } from "../../Frame/Util";
import ToggleGroup from "../../CustomUI/ToggleGroup";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RankItem extends cc.Component {

    @property(cc.Label)
    rankLabel: cc.Label = null;
    @property(cc.Label)
    timeLabel: cc.Label = null;

    onLoad () {
        this.node.on(ScrollList.SET_DATA, this.setData, this);
    }

    setData (data) {
        this.rankLabel.string = "#"+data.rank;
        this.timeLabel.string =  `${Util.fixedNum(data.time, 2)}秒`;
    }
}
