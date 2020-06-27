
import Scene from "../../Frame/Scene";
import { tt } from "../../Frame/CrossPlatform";
import Button from "../../CustomUI/Button";
import SceneManager from "../../Frame/SceneManager";
import Top from "../../Frame/Top";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraGameScene extends Scene { 
    private video: any = null;
    private detector: any = null;
    private frame: number = 0;
    @property(Button)
    private backBtn: Button = null;

    @property(cc.Sprite)
    private videoSprite: cc.Sprite = null;
    private videoTexture: cc.Texture2D = null;

    onLoad() {
        this.backBtn.node.on("click", ()=>{
            SceneManager.ins.Back();
        }, this);
        tt.setKeepScreenOn();   // 保持屏幕常亮
        this.initCamera();
        this.initDetector();  //动作触发处理
    }

    initCamera() {
        let camera = tt.createCamera();
        camera.start('front', true).then(video => {
            this.video = video;
            this.videoTexture = new cc.Texture2D();
            this.videoTexture.initWithElement(this.video);
            this.videoTexture.handleLoadedTexture();
            this.videoSprite.spriteFrame = new cc.SpriteFrame(this.videoTexture);
            let width = cc.view.getVisibleSize().width;
            this.video.width = width;
            this.video.height =  this.video.videoHeight / this.video.videoWidth  * width;//固定宽度进行视频缩放
            this.videoSprite.node.width = this.video.width;     //设置在游戏界面画的视频宽度
            this.videoSprite.node.height = this.video.height;   //设置在游戏界面画的视频高度
        }).catch(err => {
            Top.showToast("摄像机需要授权");
            console.log(err);
        });
        camera.setBeautifyParam(1, 1, 1, 1);
    }

    initDetector() {  
        let actions = {
            blink: '眨眼',
            blink_left: '左眨眼',
            blink_right: '右眨眼',
            mouth_ah: '嘴巴大张',
            head_yaw: '摇头',
            head_yaw_indian: '印度式摇头',
            head_pitch: '点头',
            brow_jump: '眉毛挑动',
            mouth_pout: '嘟嘴'
          };
        this.detector = tt.createFaceDetector();
        this.detector.onActions(detectData => {
            let arr = [];
            for (let act of detectData.actions) {
              console.log(`检测到 ${actions[act]} 动作`);
              arr.push(actions[act]);
            }
            Top.showToast(arr.join('、'));
        });
      
    }

    startDetector() {
        if (this.detector && this.video) {
            this.detector.detectFaces(this.video).then(res => {
                console.log(res); // 对应最下方的人脸信息（检测数据）内容说明
            })
        }
    }

    update (dt) {
        this.frame++;
        if (this.frame >= 5) {
            this.startDetector();   //每五帧进行一次人脸检测
            this.frame = 0
        }

       if (this.videoTexture && this.video) {
            let data:any = {
                image: this.video,
                flipY: false
            }	
            this.videoTexture.update(data);
       }
    }
}
