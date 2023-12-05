// use babel-node : https://cocoder16.tistory.com/5
import http from 'http';
import fs from 'fs';
import * as ioutil from "./common/ioutills";
import * as gwsprocess from "./common/process";
import * as account from "./common/account";
import * as utils from "./common/utils";
import { Handler, C2SMsg } from './web/socket';
import { GetPublicIp } from "./libs/getpublicip";
import { LocalSession } from "./web/session";
import { FileInfo } from "./models/param.js";
import { RunTimeSync } from './common/runtimesync';

const mime = require('mime');
const WebSocketServer = require('ws');
let g_ip: string;

const g_session = new LocalSession();
const g_sync = new RunTimeSync(1000 * 60)

GetPublicIp((ip: string) => {
    console.log(ip);
    g_ip = ip;
});


const server = http.createServer(function (request: any, response: any) {
    var url = request.url;
    if (request.url == '/' || request.url.startsWith("/?")) {
        url = '/index_web.html';	// 실행할 url
    }
    //console.log("." + request.url);
    try {
        const type = mime.getType("." + url);
        //console.log(type);
        response.setHeader("Content-Type", type); //Solution!
        const file = fs.readFileSync("." + url)
        response.writeHead(200);
        response.end(file);
    } catch (err){
        console.log(err)
        response.writeHead(404);
        response.end();
    }
});

// 3. listen 함수로 8080 포트를 가진 서버를 실행한다. 서버가 실행된 것을 콘솔창에서 확인하기 위해 'Server is running...' 로그를 출력한다
server.listen(8090);

const wss = new WebSocketServer.Server({ port: 8091 });
const g_handler: Handler = {
    "checkbin": (ws: any, filename: string) => {
        const ret = ioutil.fileExist("./bins", filename)
        ws.send(JSON.stringify({ types: "reply_checkbin", params: ret }));
    },
    "download": (ws: any, url: string, filename: string) => {
        ioutil.filedownload(url, filename, (ret: boolean) => {
            ws.send(JSON.stringify({ types: "reply_download", params: ret }));
        });
    },
    "executeProcess": (ws: any, gwsPath: string, id: string, pw: string, port: string) => {
        console.log(id, pw)
        if (gwsprocess.CheckRunning() == true && !g_session.CheckSession(id, pw)) {
            ws.send(JSON.stringify({ types: "executeProcessExit", params: true }));
            return;
        }
        g_session.SetSession(id, pw);
        gwsprocess.ExecuteProcess(gwsPath, id, pw, g_ip, port, "58080", (code: number) => {
            g_session.Clear();
            ws.send(JSON.stringify({ types: "executeProcessExit", params: true }));
        }, (data: any) => {
            console.log(`child stdout: ${data}`);
            ws.send(JSON.stringify({ types: "gwsout", params: data }));
        }, (data: any) => {
            console.log(`child stderr: ${data}`);
            ws.send(JSON.stringify({ types: "gwserr", params: data }));
        })
        g_sync.MonitoringStart()
    },
    "createProcess": (ws: any, gwsPath: string, id: string, pw: string, port: string) => {
        gwsprocess.CreateAccount(gwsPath, id, pw, g_ip, port, () => {
            ws.send(JSON.stringify({ types: "createProcessExit", params: true }));
        })
    },
    "getDeviceInfo": (ws: any) => {
        ws.send(JSON.stringify({
            types: "reply_getDeviceInfo", params: { 
            Ip: g_ip, 
            Os: process.platform,
            Run: gwsprocess.CheckRunning(),
        }
        }));
    },
    "getSpace": (ws: any) => {
        ioutil.getDiskSpace(__dirname, (diskSpace: any) => {
            console.log(diskSpace)
            ws.send(JSON.stringify({ types: "reply_getSpace", params: diskSpace }));
        });
    },
    "getOs": (ws: any) => {
        ws.send(JSON.stringify({ types: "reply_getOs", params: process.platform }));
    },
    "getAccountList": (ws: any) => {
        ws.send(JSON.stringify({ types: "reply_GetAccountList",
            params: account.GetAccountFileList()
        }));
    },
    "importAccount": (ws: any, filename: string, dataString: string) => {
        const buf = new Uint8Array(JSON.parse(dataString)).buffer;
        ioutil.fileWrite(`./${filename}`, buf)
        ws.send(JSON.stringify({
            types: "reply_importAccount",
            params: true
        }));
        ws.send(JSON.stringify({
            types: "reply_GetAccountList",
            params: account.GetAccountFileList()
        }));
    },
    "downloadfiles": (ws: any, url: string, assetList: FileInfo[], binsList: FileInfo[], libsList: FileInfo[]) => {
        let index = 0;
        ioutil.downloads(url, assetList, binsList, libsList, (filename: string) => {
            ws.send(JSON.stringify({
                types: "reply_downloadfiles",
                params: {
                    Index: ++index, Filename: filename
                }
            }));
        })
    },
    "generateImage": (ws: any, prompt: string, nprompt: string, height: string, 
        width: string, step: string, seed: string) => {
        const filename = utils.getUnixTick() + ".png";
        const initFilename = "";
        gwsprocess.DiffusionProcess(prompt, nprompt, height, width,
            step, seed, filename, initFilename,
            (code: number) => {
                ws.send(JSON.stringify({ types: "reply_generateImage", params: filename }));
            }, (data: any) => {
                console.log(`child stdout: ${data}`);
                ws.send(JSON.stringify({ types: "gwsout", params: data }));
            }, (data: any) => {
                console.log(`child stderr: ${data}`);
                ws.send(JSON.stringify({ types: "gwserr", params: data }));
            });
    },
};

wss.on("connection", (ws: any) => {
    console.log("connect");
    ws.on("message", (data: any) => {
        const msg: C2SMsg = JSON.parse(data);
        g_handler[msg.types](ws, ...msg.params);
    });
    ws.on("close", () => {
        console.log("disconnect");
    });
    ws.onerror = function () {
        console.log("error occurred");
    }
});
