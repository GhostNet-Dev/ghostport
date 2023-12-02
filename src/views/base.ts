import { BlockStore } from "../store.js";
import { FuncMap } from "../models/type.js";
import { Session } from "../models/session.js";
import { GhostWebUser } from "../models/param.js";
type UrlMap = { [key: string]: string; }

export class Base {
    m_basePath: string
    menuList: Map<string, string[]>
    urlToFileMap: UrlMap
    beforPage: string
    funcMap: FuncMap
    m_blockStore: BlockStore
    m_session: Session

    constructor(basePath: string, funcMap: FuncMap, blockStore: BlockStore, session: Session) {
        this.m_basePath = basePath
        this.menuList = new Map([
            ["dashboard", ["main", "login", "dashboard"]],
            ["nft", ["nft"]],
            ["gscript", ["gscript"]],
            ["diffusion", ["diffusion"]],
            ["chat", ["chat"]],
            ["blockscan", ["blockscan", "blockdetail", "txdetail", "accountdetail"]],
            ["chat", [""]],
            ["account", [""]]])
        this.urlToFileMap = {
            "main": basePath + "layouts/main.html",
            "login": basePath + "layouts/login.html",
            "dashboard": basePath + "layouts/dashboard.html",
            "diffusion": basePath + "layouts/diffusion.html",
            "chat": basePath + "layouts/llama.html",
            "gscript": basePath + "layouts/gscript.html",
            "nft": basePath + "layouts/nft.html",
            "prompt": "http://ghostwebservice.com/ghostnetservice/warning.html",
            "download": "http://ghostwebservice.com/ghostnetservice/download.html",
            "txdetail": "http://ghostwebservice.com/ghostnetservice/txdetail.html",
            "blockdetail": "http://ghostwebservice.com/ghostnetservice/blockdetail.html",
            "blockscan": "http://ghostwebservice.com/ghostnetservice/blocklist.html",
            "accountdetail": "http://ghostwebservice.com/ghostnetservice/accountdetail.html",
        };
        this.beforPage = ""
        this.funcMap = funcMap
        this.m_blockStore = blockStore
        this.m_session = session
    }
    getPageIdParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageid = urlParams.get("pageid");
        const key = (pageid == null) ? "main" : pageid;
        if (this.beforPage == "") this.beforPage = key;
        return key;
    }
    public updateMenu(key: string) {
        this.menuList.forEach((v, k) => {
            const tag = document.getElementById("nav-" + k)
            const active = v.findIndex((e) => e == key) >= 0 ? "active " : " ";
            tag?.setAttribute('class', 'nav-link ' + active + 'py-3 handcursor');
        })
    }
    public ClickLoadPage(key: string, fromEvent: boolean, ...args: string[]) {
        //if (getPageIdParam() == key) return;
        this.updateMenu(key);

        const url = this.urlToFileMap[key];
        const state = {
            'url': window.location.href,
            'key': key,
            'fromEvent': fromEvent,
            'args': args
        };
        console.log(`page change : ${this.beforPage} ==> ${key}`)
        const backUpBeforPage = this.beforPage;
        this.beforPage = key;

        history.pushState(state, "login", "./?pageid=" + key + args);
        fetch(url)
            .then(response => { return response.text(); })
            .then(data => { (document.querySelector("contents") as HTMLDivElement).innerHTML = data; })
            .then(() => {
                const beforePageObj = this.funcMap[backUpBeforPage];
                if (beforePageObj != undefined) {
                    beforePageObj.Release();
                }

                const pageObj = this.funcMap[key];
                if (pageObj != undefined) {
                    pageObj.Run(window.MasterAddr);
                }
            });
    };

    public parseResponse(nodes: GhostWebUser[]) {
        let randIdx = Math.floor(Math.random() * nodes.length);
        this.m_blockStore.AddMasters(nodes);
        window.NodeCount = nodes.length;
        console.log(nodes);
        return nodes[randIdx];
    };

    public loadNodesHtml(node: GhostWebUser) {
        window.MasterNode = node;
        window.MasterAddr = `http://${node.User.ip.Ip}:${node.User.ip.Port}`;
        this.m_blockStore.MasterAddr = window.MasterAddr
        return window.MasterAddr;
    };
    public includeHTML(id: string, filename: string) {
        window.addEventListener('load', () => fetch(filename)
            .then(response => { return response.text(); })
            .then(data => { (document.querySelector(id) as HTMLDivElement).innerHTML = data; }));
    }

    public includeContentHTML(master: string) {
        const key = this.getPageIdParam();
        this.updateMenu(key);
        const filename = this.urlToFileMap[key];
        const backUpBeforPage = this.beforPage;
        this.beforPage = key;
        fetch(filename)
            .then(response => { return response.text(); })
            .then(data => { (document.querySelector("contents") as HTMLDivElement).innerHTML = data; })
            .then(() => {
                const beforePageObj = this.funcMap[backUpBeforPage];
                if (beforePageObj != undefined) {
                    beforePageObj.Release();
                }

                const pageObj = this.funcMap[key];
                if (pageObj != undefined) {
                    pageObj.Run(master);
                }
            });
    }
    public InitIncludeHTML() {
        this.includeHTML("header", "navbar.html");
        this.includeHTML("footer", "foot.html");
    }
}