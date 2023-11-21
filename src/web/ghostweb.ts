import { WebFactory } from "../factory/webfactory.js";
import { GhostWebUser } from "../models/param.js";

export const factory = new WebFactory();
const blockStore = factory.GetBlockStore();

type UrlMap = { [key: string]: string; };
declare global {
    interface Window {
        ClickLoadPage: (key: string, from: boolean, ...arg: string[]) => void;
        MasterAddr: string;
        MasterNode: GhostWebUser;
        NodeCount: number;
    }
}

const funcMap = factory.Build();

const urlToFileMap: UrlMap = {
    "main": "../layouts/main.html",
    "login": "../layouts/login.html",
    "dashboard": "../layouts/dashboard.html",
    "diffusion": "../layouts/diffusion.html",
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

const menuList = new Map([
    ["dashboard", ["main", "login", "dashboard"]], 
    ["nft", ["nft"]], 
    ["diffusion", ["diffusion"]], 
    ["chat", ["chat"]], 
    ["blockscan", ["blockscan", "blockdetail", "txdetail", "accountdetail"]], 
    ["chat", [""]], 
    ["account", [""]] ]);

const updateMenu = (key: string) => {
    menuList.forEach((v, k) => {
        const tag = document.getElementById("nav-" + k)
        const active = v.findIndex((e) => e == key) >= 0 ? "active " : " ";
        tag?.setAttribute('class', 'nav-link ' + active + 'py-3 handcursor');
    })
}

let beforPage: string;
window.ClickLoadPage = (key: string, fromEvent: boolean, ...args: string[]) => {
    //if (getPageIdParam() == key) return;
    updateMenu(key);

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
    updateMenu(key);
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