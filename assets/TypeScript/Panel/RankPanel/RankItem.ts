
import ScrollList from "../../CustomUI/ScrollList";
import { Util } from "../../Frame/Util";

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
