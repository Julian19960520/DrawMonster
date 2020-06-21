// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Panel from "../Frame/Panel";
import Slider from "../CustomUI/Slider";
import { DB } from "../Frame/DataBind";
import SceneManager from "../Frame/SceneManager";
import { Sound } from "../Frame/Sound";
import Music from "../Frame/Music";
import Button from "../CustomUI/Button";
import Top from "../Frame/Top";
import { Key } from "../Game/Key";
import Toggle from "../CustomUI/Toggle";
import { Vibrate } from "../Frame/Vibrate";

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("面板/OptionPanel")
export default class OptionPanel extends Panel {

    @property(Button)
    resetBtn: Button = null;

    @property(Button)
    saveBtn: Button = null;

    @property(Slider)
    soundSlider: Slider = null;

    @property(Slider)
    musicSlider: Slider = null;

    @property(Slider)
    sensitivitySlider: Slider = null;
    @property(Toggle)
    vibrateToggle: Toggle = null;

    onLoad () {
        super.onLoad();
        this.sensitivitySlider.min = 0.5;
        this.sensitivitySlider.max = 2.5;
        this.resetBtn.node.on("click", this.onResetBtnTap, this);
        this.saveBtn.node.on("click", this.onSaveBtnTap, this);
        this.soundSlider.node.on(Slider.MOVE, this.onSoundSliderMove, this);
        this.musicSlider.node.on(Slider.MOVE, this.onMusicSliderMove, this);
        this.sensitivitySlider.node.on(Slider.MOVE, this.onSensitivitySliderMove, this);
        this.vibrateToggle.node.on(Toggle.STATE_CHANGE, this.onVibrateToggleChange, this);
        this.soundSlider.value = DB.Get(Key.Sound);
        this.musicSlider.value = DB.Get(Key.Music);
        this.sensitivitySlider.value = DB.Get(Key.Sensitivity);
        console.log(DB.Get(Key.Vibrate));
        this.vibrateToggle.isChecked = DB.Get(Key.Vibrate);
    }
    onResetBtnTap(){
        this.musicSlider.value = 0.5;
        this.soundSlider.value = 0.5;
        this.sensitivitySlider.value = 1.5;
        this.vibrateToggle.isChecked = true;
        Top.showToast("已重置");
    }
    onSaveBtnTap(){
        SceneManager.ins.popPanel();
    }
    onSoundSliderMove(value){
        Sound.volume = value;
        DB.Set(Key.Sound, value);
    }
    onMusicSliderMove(value){
        Music.volume = value;
        DB.Set(Key.Music, value);
    }
    onSensitivitySliderMove(value){
        DB.Set(Key.Sensitivity, value);
    }
    onVibrateToggleChange(b, click){
        if(click){
            DB.Set(Key.Vibrate, b);
            Vibrate.enable = b;
        }
    }
}
