const { ccclass, property } = cc._decorator;

export enum ServerMsg {
    wxLogin = "catchyou/catchyou-wxlogin",
    ttLogin = "catchyou/catchyou-ttlogin",
    login = "catchyou/catchyou-login",
    save = "catchyou/catchyou-save",
    saveImg = "catchyou/save-img",              //uid:string img:string
    myImg = "catchyou/my-img",
    readOneImg = "catchyou/read-one-img", 
}
export namespace HTTP {
    
    export let server = "http://182.92.190.246:8080/";

    export function POST(url, data: Object, onSucc, onErr) {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    let response = xhr.responseText;
                    try {
                        let data = JSON.parse(response);
                        cc.log("response",data);
                        cc.log("++++++++++++++++++++++++++++\n");
                        if (data.errcode == null || data.errcode == 0) {
                            if (onSucc) onSucc(data.data);
                        } else {
                            if (onErr) onErr(data);
                        }
                    } catch (e) {
                        if (onErr) onErr(onErr);
                    }
                } else {
                    onErr(xhr.status);
                }
            }
        };
        xhr.ontimeout = (e)=>{
            onErr(e);
        };
        xhr.onerror = (e)=> {
            onErr(e);
        };
        xhr.open("POST", server + url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        let dataStr = "";
        for (let key in data) {
            dataStr += `${key}=${data[key]}&`;
        }
        if (dataStr.endsWith("&")) {
            dataStr = dataStr.slice(0, dataStr.length - 1);
        }
        xhr.send(dataStr);
        console.log("dataStr", dataStr);
        cc.log("\n+++++++++++ HTTP +++++++++++\n");
        cc.log("HTTP.Post:" + server + url + "?" + dataStr);
    }

    export function GET(url, callBack = null) {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
                var response = xhr.responseText;
                if (callBack) callBack(response);
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    }
}
