import { BlockInfoParam, GhostWebUser } from "../models/param.js";
import { BlockStore } from "../store.js";
import { Channel } from "../models/com.js";
import * as config from "../models/config.js";
import { SyncVersion } from "../common/syncversion.js";

const MaxInfoViewCnt = 5;

type LatestTx = { Id: string, TxId: string, AddCoin: number, Nickname: string, TotalCoin: number };

export class GWSMain {
    m_blockInfos: BlockInfoParam[];
    m_blockStore: BlockStore;
    m_maxBlockId: number;
    m_curGetherTx: number;
    m_filename: string;
    m_publicIp: string;
    m_ipc: Channel;
    m_syncVersion: SyncVersion;

    public constructor(private blockStore: BlockStore, ipc: Channel) {
        this.m_blockStore = blockStore;
        this.m_maxBlockId = 0;
        this.m_curGetherTx = 0;
        this.m_publicIp = this.m_filename = "";
        this.m_blockInfos = new Array<BlockInfoParam>();
        this.m_ipc = ipc;
            
        this.m_syncVersion = new SyncVersion(blockStore, ipc,
            (total: number, curr: number, msg: string) => {
                const bodyTag = document.getElementById('checkfile');
                if (bodyTag == null) return;
                bodyTag.innerHTML = `${msg} (${curr}/${total})`;
            }, () => this.drawHtmlStart());

        ipc.RegisterMsgHandler('reply_getDeviceInfo', (ret: any) => {
            console.log(ret);
            this.m_blockStore.SetDeviceInfo(ret.Ip, ret.Os);
            this.m_syncVersion.CheckVersion(ret.Os);
        });
    }
    drawHtmlStart() {
        const bodyTag = document.getElementById('checkfile');
        if (bodyTag == null) return;
        bodyTag.innerHTML = "Ready to get started";

        const startTag = document.getElementById('startbtn');
        if (startTag == null) return;
        startTag.innerHTML = `
                    <button type="submit" class="btn  btn-primary" 
                    onclick="ClickLoadPage('login', false)">Start</button>
                `;
    }

    init() {
        this.m_maxBlockId = 0;
        this.m_curGetherTx = 0;
        this.m_blockInfos = new Array<BlockInfoParam>();
        this.m_ipc.SendMsg('getDeviceInfo');
    }

    downloadProgram() {
        const btn = document.getElementById("downloadBtn") as HTMLButtonElement
        btn.disabled = true;
        this.m_syncVersion.GetDownloadList()
    }
    connectServer() {
        const result = document.getElementById("connectResult")
        if (result == null) return;
        const input = document.getElementById("inputIp") as HTMLInputElement
        const addr = input?.value;
        return fetch(addr + "/check")
            .then((response) => response.json())
            .catch(() => {
                result.innerHTML = "Connection failed.";
            });
    }
    selectMasterNode(node: GhostWebUser) {
        const tag = document.getElementById("selectMaster")
        if (tag == null) return false;
        window.MasterNode = node;
        window.MasterAddr = `http://${node.User.ip.Ip}:${node.User.ip.Port}`;
        console.log(window.MasterNode);
        tag.innerHTML = window.MasterNode.User.Nickname;
        this.m_syncVersion.CheckVersion(this.blockStore.GetDeviceOs());
    }

    drawHtmlUpdateMasterNodeList() {
        const tag = document.getElementById("masterlist")
        if (tag == null) return;
        tag.innerHTML = "";
        const nodes = this.blockStore.GetMasters();
        nodes.forEach(node => {
            const button = document.createElement('button');
            button.setAttribute('class', 'dropdown-item');
            button.onclick = () => this.selectMasterNode(node);
            button.innerText = node.User.Nickname;
            tag.appendChild(button);
        })
    }

    public Run(masterAddr: string): boolean {
        this.init();
        const btn = document.getElementById("downloadBtn") as HTMLButtonElement
        btn.onclick = () => this.downloadProgram();

        const tag = document.getElementById("selectMaster")
        if (tag == null) return false;
        tag.innerHTML = window.MasterNode.User.Nickname;


        /*
        const coBtn = document.getElementById("connectBtn") as HTMLButtonElement
        coBtn.onclick = () => this.connectServer();

        const remoteTag = document.getElementById("remoteLayer")
        if (remoteTag == null) return false;
        const reBtn = document.getElementById("remoteBtn") as HTMLButtonElement
        reBtn.onclick = ()=> {
            remoteTag.style.visibility = (remoteTag.style.visibility == "visible") ? "hidden" : "visible";
        }
        remoteTag.style.visibility = "hidden";
        */
        this.drawHtmlUpdateMasterNodeList();
        return true;
    }
    public Release(): void { }
}
