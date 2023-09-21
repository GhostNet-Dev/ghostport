import { TxInfoParam } from "./models/param.js";
import { calcGCoin} from "./utils.js";
import { GhostTransaction, TxInput, TxOutput, TxOutputType, TxOutputTypeStr } from "./models/tx.js";
import { BlockStore } from "./store.js";

export class TxDetail {
    m_masterAddr:string;
    m_blockStore:BlockStore;

    public constructor(private blockStore: BlockStore) { 
        this.m_masterAddr = "";
        this.m_blockStore = blockStore;
    }

    drawHtmlTxBody(tx: GhostTransaction): void {
        const bodyTag = document.getElementById('txbody');
        if (bodyTag == null) return;
        bodyTag.innerHTML = `
            <li class="maxtext">TxId: ${tx.TxId}</li>
            <li>Nonce: ${tx.Body.Nonce}</li>
            <li>LockTime: ${tx.Body.LockTime}</li>
        `;
    }

    drawHtmlInput(inputs: TxInput[]): void {
        const bodyTag = document.getElementById('txinput');
        if (bodyTag == null) return;
        inputs.forEach((input, idx) => {
            bodyTag.innerHTML += `
            <div class="row">
                <div class="col">
                    <b>Index: ${idx}</b>
                    <li class="maxtext">Previous TxId: <a class="handcursor" onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(input.PrevOut.TxId)}")'>
                    ${input.PrevOut.TxId}</a></li>
                    <li>Output Index: ${input.PrevOut.TxOutIndex}</li>
                    <li>Script Size: ${input.ScriptSize}</li>
                </div>
            </div>
            `;
        })
    }

    drawHtmlOutput(outputs: TxOutput[]): void {
        const bodyTag = document.getElementById('txoutput');
        if(bodyTag == null) return ;
        outputs.forEach(async (output, idx) => {
            let script: string = "";
            
            bodyTag.innerHTML += `
            <div class="row" id="output${idx}">
                <div class="col">
                    <b>Index: ${idx}</b>
                    <li style="maxtext">Destination: <b id="nick${idx}"></b> (${output.Addr}) </li>
                    <li style="maxtext">Broker: <b id="broker${idx}"></b> (${output.BrokerAddr})</li>
                    <li>Output Type: ${TxOutputTypeStr[output.Type]}</li>
                    <li>Value: ${calcGCoin(parseInt(output.Value))}</li>
                </div>
                ${script}
            </div>
            `;
            const addr = encodeURIComponent(output.Addr)
            this.m_blockStore.RequestAccount(output.Addr)
                    .then((res) => {
                        const tag = document.getElementById('nick'+idx);
                        if (tag == null) return;
                        tag.innerHTML = `
                        <a class="handcursor" onclick='ClickLoadPage("accountdetail", false, "&pubkey=${addr}")'>
                        ${res.Nickname}</a>`;});
            const brokerAddr = encodeURIComponent(output.BrokerAddr);
            this.m_blockStore.RequestAccount(output.BrokerAddr)
                    .then((res) => {
                        const tag = document.getElementById('broker'+idx);
                        if (tag == null) return;
                        tag.innerHTML = `
                        <a class="handcursor" onclick='ClickLoadPage("accountdetail", false, "&pubkey=${brokerAddr}")'>
                        ${res.Nickname}</a>`;});
            if (output.Type == TxOutputType.TxTypeScript) {
                const dataTx = encodeURIComponent(output.ScriptEx)
                this.m_blockStore.RequestScript(dataTx)
                    .then((res) => {
                        const tag = document.getElementById('output'+idx);
                        if (tag == null) return;
                        tag.innerHTML += `<div class="col">
                        <b>Script</b><br>
                        <code><pre>${res}</pre></code>
                        </div>`;
                });
            }
        })
    }

    drawHtml(param: TxInfoParam): void {
        this.drawHtmlTxBody(param.Tx);
        this.drawHtmlInput(param.Tx.Body.Vin);
        this.drawHtmlOutput(param.Tx.Body.Vout);
    }

    getTxIdParam(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const txId = encodeURIComponent(urlParams.get("txid")??"");
        if (txId == null) return null;
        return txId;
    }

    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const txId = this.getTxIdParam();
        if (txId == null) return false;
        this.m_blockStore.RequestTx(txId)
            .then((param)=>this.drawHtml(param));
        return true;
    }

    public Release(): void { }
}