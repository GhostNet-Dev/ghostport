import { ipcRenderer } from "electron"; // ES import 
import { AccountParam, BlockInfoParam, GhostWebUser } from "./models/param.js";
import { BlockStore } from "./store.js";

const MaxInfoViewCnt = 5;

type LatestTx = { Id: string, TxId: string, AddCoin: number, Nickname: string, TotalCoin: number };

export class GWSMain {
    m_blockInfos: BlockInfoParam[];
    m_blockStore: BlockStore;
    m_maxBlockId: number;
    m_curGetherTx: number;

    public constructor(private blockStore: BlockStore) {
        this.m_blockStore = blockStore;
        this.m_maxBlockId = 0;
        this.m_curGetherTx = 0;
        this.m_blockInfos = new Array<BlockInfoParam>();

        ipcRenderer.on('reply_checkbin', (evt, payload: boolean) => {
            const bodyTag = document.getElementById('checkfile');
            if (bodyTag == null) return;

            if (payload == false) {
                bodyTag.innerHTML = "The GhostNet Deamon does not exist."
                console.log("request file to server");
                return;
            } 
            bodyTag.innerHTML = "Ready to get started"
            this.drawHtmlStart();
        });
        ipcRenderer.on('reply_download', (evt, ret: boolean) => {
            const bodyTag = document.getElementById('checkfile');
            if (bodyTag == null) return;
            bodyTag.innerHTML = (ret) ? "Complete" : "Connection failed.";
            
            const btn = document.getElementById("downloadBtn") as HTMLButtonElement
            btn.disabled = false;
            this.drawHtmlStart();
        });
    }
    drawHtmlStart() {
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
        ipcRenderer.send('checkbin');
    }

    downloadProgram() {
        const bodyTag = document.getElementById('checkfile');
        if (bodyTag == null) return;
        const btn = document.getElementById("downloadBtn") as HTMLButtonElement
        btn.disabled = true;

        const url = window.MasterAddr + "/download";
        console.log(url)
        ipcRenderer.send('download', url);
        bodyTag.innerHTML = `<div class="spinner-grow" role="status">
            <span class="sr-only">Loading...</span> </div> `
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
    }

    updateMasterNodeList() {
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
        const tag = document.getElementById("selectMaster")
        if (tag == null) return false;
        tag.innerHTML = window.MasterNode.User.Nickname;


        const btn = document.getElementById("downloadBtn") as HTMLButtonElement
        btn.onclick = () => this.downloadProgram();

        const coBtn = document.getElementById("connectBtn") as HTMLButtonElement
        coBtn.onclick = () => this.connectServer();

        this.updateMasterNodeList();
        return true;
    }
    public Release(): void { }
}
