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

    }

    init() {
        this.m_maxBlockId = 0;
        this.m_curGetherTx = 0;
        this.m_blockInfos = new Array<BlockInfoParam>();
    }

    drawHtmlAccountList(accounts: AccountParam[]) {
        const bodyTag = document.getElementById('accountlist');
        if (bodyTag == null) return
        bodyTag.innerHTML = '<b>Latest Master Nodes</b>';
        accounts.forEach(account => {
            bodyTag.innerHTML += `
                &nbsp;&nbsp;
                ${account.Nickname}&nbsp;&nbsp;<b>${calcGCoin(account.Coin)}</b>
                &nbsp;&nbsp;
            `;
        });
        bodyTag.innerHTML += ``;
    }

    excuteDrawHtmlLatestEarnMaster(results: LatestTx[]) {
        if(results.length != 5) return;
        const bodyTag = document.getElementById('latesttx');
        if (bodyTag == null) return
        bodyTag.innerHTML = `<div class="container py-0 my-0">`;
        results.forEach((ret, idx) => {
            const line = (idx < 4) ? `<div class="row p-1"> 
            <div class="col"><hr class="py-0 my-0"/></div> </div>` : "";
            bodyTag.innerHTML += `
            <div class="row p-0 m-1">
                <div class="col-1 align-middle"><span class="material-symbols-outlined"> 
                toll </span>
                </div>
                <div class="col maxtext">${ret.TxId}</div>
                <div class="col">
                <span class="text-success font-weight-bold">+ ${calcGCoin(ret.AddCoin)}</span><br>
                    ${calcGCoin(ret.TotalCoin)} GCoin</div>
                <div class="col text-right">${ret.Nickname} master</div>
            </div>${line}
                            `;
        })
    }

    drawHtmlLatestEarnMaster() {
        const results = new Array<LatestTx>();
        this.m_blockInfos.forEach((blockInfo, idx) => {
            const blockId = parseInt(blockInfo.Header.Id);
            this.m_blockStore.RequestBlock(blockId)
                .then(block => {
                    block.Alice.forEach(tx => {
                        this.m_blockStore.RequestAccount(tx.Body.Vout[0].Addr)
                            .then(accountParam => {
                                results.push({Id: blockInfo.Header.Id,
                                    TxId: tx.TxId,
                                    AddCoin: parseInt(tx.Body.Vout[0].Value),
                                    Nickname: accountParam.Nickname,
                                    TotalCoin: accountParam.Coin
                                })
                            }).then(() => this.excuteDrawHtmlLatestEarnMaster(results))
                    })
                })
        })
    }

    blockInfoGether(blockInfoParam: BlockInfoParam) {
        const txCnt = parseInt(blockInfoParam.Header.AliceCount);
        if (this.m_curGetherTx > MaxInfoViewCnt) return;
        this.m_curGetherTx += txCnt;
        this.m_blockInfos.push(blockInfoParam);
    }

    drawHtmlLatestBlock(blockInfoParams: BlockInfoParam[]) {
        const bodyTag = document.getElementById('latestblocks');
        if (bodyTag == null) return
        bodyTag.innerHTML = `<div class="container py-0 my-0">`;
        blockInfoParams.slice(0, 5).forEach((blockInfo, idx) => {
            this.blockInfoGether(blockInfo);
            const blockId = parseInt(blockInfo.Header.Id);
            const line = (idx < 4) ? `<div class="row p-1"> 
            <div class="col"><hr class="py-0 my-0"/></div> </div>` : "";
            this.m_maxBlockId = (blockId > this.m_maxBlockId) ? this.m_maxBlockId = blockId : this.m_maxBlockId;
            bodyTag.innerHTML += `
            <div class="row m-1">
                <div class="col-1 align-middle"><span class="material-symbols-outlined"> stack </span>
                </div>
                 <div class="col">${blockInfo.Header.Id}<br><small>${elapsedTime(Number(blockInfo.Header.TimeStamp) * 1000)}</small>
                </div>
                <div class="col">
                    <span>${blockInfo.Header.TransactionCount} txns</span><br>
                    <span>${blockInfo.Header.AliceCount} masters</span>
                </div>
                <div class="col text-right">
                    <span id="bminer${blockInfo.Header.Id}">unknown</span>
                </div>
            </div>
            ${line}
            `;
            bodyTag.innerHTML += `</div>`;
            const pubKey = blockInfo.Header.BlockSignature.PubKey;
            this.m_blockStore.RequestAccount(pubKey)
                .then((res) => {
                    const tag = document.getElementById('bminer' + blockInfo.Header.Id);
                    if (tag == null) return;
                    tag.innerHTML = res.Nickname;
                });
        });
    }
    drawHtml(blockInfoParam: BlockInfoParam[]) {
        this.drawHtmlLatestBlock(blockInfoParam);
        this.drawHtmlLatestEarnMaster();
    }
    drawHtmlConnectMaster() {
        const bodyTag = document.getElementById('connect');
        if (bodyTag == null) return;
        console.log(window.MasterNode);
        bodyTag.innerHTML = `<b>Connected Master</b> - 
        ${window.MasterNode.User.Nickname}, <b>Online Nodes </b>
        ${window.NodeCount}`;
    }
    drawHtmlNewHons() {
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
    public Run(masterAddr: string): boolean {
        this.init();

        const btn = document.getElementById("ghostchat") as HTMLButtonElement
        btn.onclick = () => this.sendToModel();

        this.drawHtmlConnectMaster();
        this.m_blockStore.RequestAccountList(0, 20)
            .then((param) => this.drawHtmlAccountList(param));
        this.m_blockStore.RequestBlockList(0, 5)
            .then(param => this.drawHtml(param))
        this.drawHtmlNewHons();
        return true;
    }
    public Release(): void { }
}
