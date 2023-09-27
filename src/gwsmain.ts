import { ipcRenderer } from "electron"; // ES import 
import { elapsedTime, calcGCoin } from "./utils.js";
import { AccountParam, BlockInfoParam } from "./models/param.js";
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
                bodyTag.innerHTML = "실행파일이 존재하지 않습니다 ."
                console.log("request file to server");
            }
        });
    }

    init() {
        this.m_maxBlockId = 0;
        this.m_curGetherTx = 0;
        this.m_blockInfos = new Array<BlockInfoParam>();
        ipcRenderer.send('checkbin');
    }

    sendToModel() {
        const btn = document.getElementById("ghostchat") as HTMLButtonElement
        if (btn == null) return;
        const result = document.getElementById("gptresult")
        if (result == null) return;
        const input = document.getElementById("prompt") as HTMLInputElement
        const prompt = input?.value;
        result.innerHTML = `<div class="spinner-grow" role="status">
            <span class="sr-only">Loading...</span> </div> `
        btn.disabled = true;
        return fetch(`http://220.149.235.237:8001/prompt/${prompt}`)
            .then((response) => response.json())
            .then((text)=>{
                console.log(text);
                if ("message" in text){
                    result.innerHTML = text.message;
                } else {
                    result.innerHTML = text.detail+" - 개발자가 뭔가 하고 있나봅니다...";
                }
                btn.disabled = false;
            })
            .catch(()=>{
                result.innerHTML = "개발자가 뭔가 하고 있나봅니다...";
            });
    }
    downloadProgram(url: string) {
        const bodyTag = document.getElementById('checkfile');
        if (bodyTag == null) return;

        return fetch(url + "/download")
            .then((response) =>{
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.blob();
            } )
            .then(blob => {
                const file = window.URL.createObjectURL(blob);
                console.log(file);
                window.location.assign(file);
            })
            .catch((err) => {
                bodyTag.innerHTML = `Connection failed. - ${err}`;
            });
    }
    connectServer() {
        const result = document.getElementById("connectResult")
        if (result == null) return;
        const input = document.getElementById("inputIp") as HTMLInputElement
        const addr = input?.value;
        return fetch(addr + "/check")
            .then((response) => response.json())
            .catch(()=>{
                result.innerHTML = "Connection failed.";
            });
    }
    public Run(masterAddr: string): boolean {
        this.init();


        const btn = document.getElementById("downloadBtn") as HTMLButtonElement
        btn.onclick = () => this.downloadProgram(masterAddr);

        const coBtn = document.getElementById("connectBtn") as HTMLButtonElement
        coBtn.onclick = () => this.connectServer();

        return true;
    }
    public Release(): void { }
}
