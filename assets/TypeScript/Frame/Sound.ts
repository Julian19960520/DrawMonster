export namespace Sound  {
    let soundMap = new Map<string,cc.AudioClip>();
    export let volume = 1;
    export function play(name:string, loop = false){
        let clip = soundMap.get(name);
        if(clip){
            cc.audioEngine.play(clip, loop, volume);
        }else{
            cc.loader.loadRes("Sound/"+name, cc.AudioClip, (err, clip)=>{
                if(!err){
                    soundMap.set(name, clip);
                    cc.audioEngine.play(clip, false, 1);
                }else{
                    console.error("未找到Sound:" + name);
                }
            });
        }
    }
}
