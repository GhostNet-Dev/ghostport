import { AccountParam } from "./models/param.js";
import { calcGCoin } from "./utils.js";
import { PrevOutputParam, TxOutputType, TxOutputTypeStr } from "./models/tx.js";
import { BlockStore } from "./store.js";

export class AccountDetail {
    m_masterAddr:string;
    m_blockStore: BlockStore;
    m_accountParam: AccountParam;

    public constructor(private blockStore: BlockStore) {
        this.m_masterAddr = "";
        this.m_blockStore = blockStore;
        this.m_accountParam = {Coin: 0, Nickname: "", PubKey: ""};
    }

    getAccountParam(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const pubkey = urlParams.get("pubkey")??"";
        return pubkey;
    }

    drawHtmlCoinList(type:TxOutputType, params:PrevOutputParam[]){
        const bodyTag = document.getElementById('outputlist');
        if (bodyTag == null) return;
        bodyTag.innerHTML += `
            <h5>${TxOutputTypeStr[type]} List</h5>
            <div class="row">
                <div class="col-6 font-weight-bold">TxId</div>
                <div class="col-2 font-weight-bold">Coin</div>
                <div class="col-2 font-weight-bold">Master</div>
            </div>
            <div class="row">
                <div class="col division-line"></div>
            </div>
            `;
        params.forEach((param)=>{
            bodyTag.innerHTML += `
            <div class="row">
                <div class="col-6 maxtext"> 
                    <a class="handcursor maxtext" onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(param.VOutPoint.TxId)}")'>
                        ${param.VOutPoint.TxId} 
                    </a>
                </div>
                <div class="col-2">${calcGCoin(parseInt(param.Vout.Value))}</div>
                <div class="col-2 maxtext" id="${param.VOutPoint.TxId}">${param.Vout.BrokerAddr}</div>
            </div>
            <div class="row">
                <div class="col division-line"></div>
            </div>
            `;
            this.m_blockStore.RequestAccount(param.Vout.BrokerAddr)
                    .then((res) => {
                        const tag = document.getElementById(param.VOutPoint.TxId);
                        if (tag == null) return;
                        tag.innerHTML = res.Nickname;
                    });
        });
    }

    drawHtml(param:AccountParam) {
        const bodyTag = document.getElementById('accountdetail');
        if (bodyTag == null) return;
        bodyTag.innerHTML = `
            <h5>${param.Nickname}</h5>
            <li>${param.PubKey}</li>
            <li>${calcGCoin(param.Coin)}</li>
        `;
        this.m_accountParam = param;
    }

    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const pubkey = this.getAccountParam();
        if (pubkey == null) return false;
        this.m_blockStore.RequestAccount(pubkey)
            .then((param) => this.drawHtml(param))
            .then(() => {
                this.m_blockStore.RequestOutputList(TxOutputType.TxTypeCoinTransfer
                    , this.m_accountParam.PubKey, 0, 50)
                    .then(param => this.drawHtmlCoinList(TxOutputType.TxTypeCoinTransfer, param))
            });

        return true;
    }
    public Release(): void { 
        const bodyTag = document.getElementById('outputlist');
        if (bodyTag == null) return;
        bodyTag.innerHTML = '';
    }
}