import "module-alias/register"
import { BlockInfo } from "@src/blockinfo";
import { TxInfo } from "@src/txinfo";
import { BlockStore } from "@src/store";
import { TxDetail } from "@src/txdetail";
import { GWSMain } from "@src/gwsmain";
import { Login } from "@src/login";
import { AccountDetail } from "@src/accountdetail";
import { GhostWebUser } from "@src/models/param";
import { Session } from "@src/models/session";

const blockStore = new BlockStore();
const session = new Session();

interface IPage {
    Run(str: string): boolean; 
    Release(): void;
}

type FuncMap = { [key: string]: IPage };
type UrlMap = { [key: string]: string; };
declare global {
    interface Window {
        ClickLoadPage: (key: string, from: boolean, ...arg: string[]) => void;
        NavExpended: () => void;
        MasterAddr: string;
        MasterNode: GhostWebUser;
        NodeCount: number;
    }
}

const funcMap: FuncMap = {
    "main": new GWSMain(blockStore),
    "login": new Login(blockStore, session),
    "txdetail": new TxDetail(blockStore),
    "blockdetail": new TxInfo(blockStore),
    "blockscan": new BlockInfo(blockStore),
    "accountdetail": new AccountDetail(blockStore),
};

const urlToFileMap: UrlMap = {
    "main": "./layouts/main.html",
    "login": "./layouts/login.html",
    "nft": "http://ghostwebservice.com/ghostnetservice/warning.html",
    "prompt": "http://ghostwebservice.com/ghostnetservice/warning.html",
    "download": "http://ghostwebservice.com/ghostnetservice/download.html",
    "txdetail": "http://ghostwebservice.com/ghostnetservice/txdetail.html",
    "blockdetail": "http://ghostwebservice.com/ghostnetservice/blockdetail.html",
    "blockscan": "http://ghostwebservice.com/ghostnetservice/blocklist.html",
    "accountdetail":"http://ghostwebservice.com/ghostnetservice/accountdetail.html",
};

const getPageIdParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageid = urlParams.get("pageid");
    const key = (pageid == null) ? "main" : pageid;
    if (beforPage == undefined) beforPage = key;
    return key;
}

let beforPage: string;
window.ClickLoadPage = (key: string, fromEvent: boolean, ...args: string[]) => {
    //if (getPageIdParam() == key) return;

    const url = urlToFileMap[key];
    const state = { 
        'url': window.location.href,
        'key': key,
        'fromEvent': fromEvent,
        'args': args
    };
    console.log(`page change : ${beforPage} ==> ${key}`)
    const backUpBeforPage = beforPage;
    beforPage = key;

    history.pushState(state, "login", "./?pageid=" + key + args);
    fetch(url)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector("contents") as HTMLDivElement).innerHTML = data; })
        .then(() => {
            const beforePageObj = funcMap[backUpBeforPage];
            if (beforePageObj != undefined) {
                beforePageObj.Release();
            }

            const pageObj = funcMap[key];
            if (pageObj != undefined) {
                pageObj.Run(window.MasterAddr);
            }
        });
    if (fromEvent) {
        window.NavExpended();
    }
    console.log(fromEvent)
};
let expendFlag = false;
window.NavExpended = () => {
    let view = (expendFlag == false) ? "block" : "none";
    (document.querySelector("#navbarNav") as HTMLDivElement).style.display = view;
    (document.querySelector("#navbarNavRight") as HTMLDivElement).style.display = view;
    expendFlag = !expendFlag;
};

window.onpopstate = (event) => {
    //window.ClickLoadPage(event.state['key'], event.state['fromEvent'], event.state['args'])
    includeContentHTML(window.MasterAddr);
};

const parseResponse = (nodes: GhostWebUser[]) => {
    let randIdx = Math.floor(Math.random() * nodes.length);
    blockStore.AddMasters(nodes);
    window.NodeCount = nodes.length;
    console.log(nodes);
    return nodes[randIdx];
};

const loadNodesHtml = (node: GhostWebUser) => {
    window.MasterNode = node;
    window.MasterAddr = `http://${node.User.ip.Ip}:${node.User.ip.Port}`;
    return window.MasterAddr;
};
const includeHTML = (id: string, filename: string) => {
    window.addEventListener('load', () => fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector(id) as HTMLDivElement).innerHTML = data; }));
}

const includeContentHTML = (master: string) => {
    const key = getPageIdParam();
    const filename = urlToFileMap[key];
    const backUpBeforPage = beforPage;
    beforPage = key;
    fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector("contents") as HTMLDivElement).innerHTML = data; })
        .then(() => {
            const beforePageObj = funcMap[backUpBeforPage];
            if (beforePageObj != undefined) {
                beforePageObj.Release();
            }

            const pageObj = funcMap[key];
            if (pageObj != undefined) {
                pageObj.Run(master);
            }
        });
}

export { includeContentHTML, includeHTML, loadNodesHtml, parseResponse }