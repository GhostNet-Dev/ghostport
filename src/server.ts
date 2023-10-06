import http from 'http';
import fs from 'fs';
const mime = require('mime');
const WebSocketServer = require('ws');
import * as ioutil from "./filemanager/ioutills";
import * as gwsprocess from "./common/process";
import { Handler, Msg } from './web/socket.js';
import { GetPublicIp } from "./libs/getpublicip";

let g_ip: string;
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
        const type = mime.getType("."+ url);
        //console.log(type);
        response.setHeader("Content-Type", type); //Solution!
        response.writeHead(200);
        response.end(fs.readFileSync("." + url));
    } catch {
        response.writeHead(404);
        response.end();
    }
});

// 3. listen 함수로 8080 포트를 가진 서버를 실행한다. 서버가 실행된 것을 콘솔창에서 확인하기 위해 'Server is running...' 로그를 출력한다
const httpServer = server.listen(8090);

const wss = new WebSocketServer.Server({ port: 8091 });
const g_handler: Handler = {
    "checkbin": (ws: any, filename: string) => {
        const ret = ioutil.fileExist(`./${filename}`)
        const msg: Msg = {
            types: "reply_checkbin",
            params: [ret],
        }
        console.log(msg);
        ws.send(JSON.stringify(msg));
    },
    "download": (ws: any, url: string, filename: string) => {
        console.log(`url: ${url}, filename: ${filename}`);
        ioutil.filedownload(url, filename, (ret: boolean) => {
            ws.send(JSON.stringify({ types: "reply_download", params: [ret] }));
        });
    },
    "executeProcess": (ws: any, gwsPath: string, id: string, pw: string, port: string) => {
        gwsprocess.ExecuteProcess(gwsPath, id, pw, g_ip, port, (code: number) => {
            ws.send(JSON.stringify({ types: "executeProcessExit", params: [true] }));
        }, (data: any) => {
            ws.send(JSON.stringify({ types: "gwsout", params: [data] }));
        }, (data: any) => {
            ws.send(JSON.stringify({ types: "gwserr", params: [data] }));
        })
    },
    "createProcess": (ws: any, gwsPath: string, id: string, pw: string, port: string) => {
        gwsprocess.CreateAccount(gwsPath, id, pw, g_ip, port, () => {
            ws.send(JSON.stringify({ types: "createProcessExit", params: [true] }));
        })
    },
};

wss.on("connection", (ws: any) => {
    console.log("connect");
    ws.on("message", (data: any) => {
        console.log("receive: " , data);
        const msg: Msg = JSON.parse(data);
        console.log("convert json: " , msg);
        g_handler[msg.types](ws, ...msg.params);
    });
    ws.on("close", () => {
        console.log("disconnect");
    });
    ws.onerror = function() {
        console.log("error occurred");
    }
});
