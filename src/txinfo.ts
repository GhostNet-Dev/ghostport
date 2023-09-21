import { elapsedTime } from "./utils.js";
import { GhostNetBlock } from "./models/block.js";
import { GhostTransaction } from "./models/tx.js";
import { BlockStore } from "./store.js";
type DataContext = { Title: string, Content: string };

export class TxInfo {
    m_masterAddr:string;
    m_blockStore:BlockStore;

    public constructor(private blockStore: BlockStore) { 
        this.m_masterAddr = "";
        this.m_blockStore = blockStore;
    }
    makeInfos(block: GhostNetBlock): DataContext[] {
        return [
            { Title: "Block Id", Content: block.Header.Id },
            { Title: "Version", Content: block.Header.Version },
            { Title: "Prev Block Hash", Content: block.Header.PreviousBlockHeaderHash },
            { Title: "Merkle Root", Content: block.Header.MerkleRoot },
            { Title: "Data Block Hash", Content: block.Header.DataBlockHeaderHash },
            { Title: "Date", Content: elapsedTime(Number(block.Header.TimeStamp) * 1000) },
            { Title: "Base Coin Tx Number", Content: block.Header.AliceCount },
            { Title: "Tx Number", Content: block.Header.AliceCount },
            { Title: "Block Miner", Content: 
                `<b id='miner'>${block.Header.BlockSignature.PubKey}</b>`
            },
        ];
    }
    drawHtml(txinfos: DataContext[]): void {
        const blockDetailTag = document.getElementById('blockdetail');
        if (blockDetailTag == null) return;
        blockDetailTag.innerHTML += `
            <h5>Block Header Information</h5>
            <div class="row division-line">
                <div class="col"></div>
            </div>

            `;
        txinfos.forEach((data) => {
            blockDetailTag.innerHTML += `
            <div class="row division-line">
                <div class="col-4">${data.Title}</div>
                <div class="col-8 maxtext">${data.Content}</div>
            </div>
            `;
        })
        blockDetailTag.innerHTML += `
            <br>
            <h5>Transaction List</h5>
            `;

    }
    drawHtmlTxInfo(tx: GhostTransaction, type: string): HTMLDivElement {
        const rows = document.createElement('div');
        rows.setAttribute('class', 'row');
        rows.innerHTML = `
        <div class="col-1">${type}</div>
        <div class="col-7 handcursor maxtext">
            <a onclick='ClickLoadPage("txdetail", false, "&txid=${encodeURIComponent(tx.TxId)}")'>
            ${tx.TxId}
            </a>
        </div>
        <div class="col-2">${tx.Body.InputCounter}</div>
        <div class="col-2">${tx.Body.OutputCounter}</div>
        `;
        return rows;
    }
    drawHtmlLine(): HTMLDivElement {
        const rows = document.createElement('div');
        rows.setAttribute('class', 'row');
        rows.innerHTML = `<div class='col division-line'></div>`;
        return rows;
    }
    drawHtmlTxHeader(): HTMLDivElement {
        const rows = document.createElement('div');
        rows.setAttribute('class', 'row');
        rows.innerHTML = `
            <div class='col-1'>Tx Type</div>
            <div class='col-7'>Tx ID</div>
            <div class='col-2'>Input Counter</div>
            <div class='col-2'>Output Counter</div>
            `;
        return rows;
    }

    drawHtmlTxList(block: GhostNetBlock) {
        const txListTag = document.getElementById('txlist');
        txListTag?.appendChild(this.drawHtmlLine());
        txListTag?.appendChild(this.drawHtmlTxHeader());
        txListTag?.appendChild(this.drawHtmlLine());
        block.Alice.forEach((tx)=> {
            txListTag?.appendChild(this.drawHtmlTxInfo(tx, "A"));
            txListTag?.appendChild(this.drawHtmlLine());
        });
        block.Transaction.forEach((tx)=> {
            txListTag?.appendChild(this.drawHtmlTxInfo(tx, "N"));
            txListTag?.appendChild(this.drawHtmlLine());
        });
    }
    getBlockIdParam(): number | null {
        const urlParams = new URLSearchParams(window.location.search);
        const blockId = urlParams.get("blockid");
        if (blockId == null) return null;
        return Number(blockId);
    }
    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        const blockId = this.getBlockIdParam();
        if (blockId == null || blockId < 1) return false;

        this.m_blockStore.RequestBlock(blockId)
            .then((block) => {
                this.drawHtml(this.makeInfos(block));
                this.drawHtmlTxList(block);
                const pubKey = block.Header.BlockSignature.PubKey;
                const addr = encodeURIComponent(pubKey)
                this.m_blockStore.RequestAccount(pubKey)
                    .then((res) => {
                        const tag = document.getElementById('miner');
                        if (tag == null) return;
                        tag.innerHTML = `
                        <a class="handcursor" onclick='ClickLoadPage("accountdetail", false, "&pubkey=${addr}")'>${res.Nickname}</a>`;
                    });
            });
        return true;
    }
    public Release(): void { }
}