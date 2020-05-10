import { crossPlatform } from "./CrossPlatform";

export namespace Vibrate{
    export let enable = true;
    export function short(){
        if(enable){
            crossPlatform.vibrateShort();
        }
    }
    export function long(){
        if(enable){
            crossPlatform.vibrateLong();
        }
    }
}