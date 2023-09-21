import { GhostNetBlock } from "./models/block.js";
import { TxInfoParam, BlockInfoParam, AccountParam } from "./models/param";
import { PrevOutputParam, TxOutputType } from "./models/tx.js";

const MaxUnsignedInt = ((1 << 31) >>> 0); // unsigned int max

export class BlockStore {
    blockInfos: BlockInfoParam[];
    m_minBlockId: number;
    m_accountMap: Map<string, AccountParam>;

    public constructor() {
        this.m_minBlockId = MaxUnsignedInt;
        this.blockInfos = new Array<BlockInfoParam>();
        this.m_accountMap = new Map<string, AccountParam>();
    }

    public GetAccount(nick:string): AccountParam|undefined {
        return this.m_accountMap.get(nick);
    }

    public InsertBlockInfos(blockHeaders: BlockInfoParam[]) {
        blockHeaders.forEach(blockInfo=>{
            const idx = this.blockInfos.findIndex(x=>x.Header.Id == blockInfo.Header.Id);
            if (idx == -1) { this.blockInfos.push(blockInfo); }
        });
        //this.blockInfos.push.apply(this.blockInfos, blockHeaders);
    }
    public GetBlockInfo(blockId: number): any {
        return this.blockInfos.filter(x => Number(x.Header.Id) == blockId);
    }
    public GetBlockInfos():BlockInfoParam[] {
        return this.blockInfos;
    }
    public RequestAccount(addr: string): Promise<AccountParam> {
        const encodeAddr = encodeURIComponent(addr);
        if (encodeAddr == null) return Promise.reject();
        const account = this.m_accountMap.get(encodeAddr);
        if (account != undefined) {
            return new Promise<AccountParam>(account=>account);
        }
        return fetch(window.MasterAddr + `/account?addr=${encodeAddr}`)
            .then((response) => response.json())
            .then((account:AccountParam)=>{
                this.m_accountMap.set(account.Nickname, account);
                return account;
            });
    }
    public RequestAccountList(start: number, count: number): Promise<AccountParam[]> {
        if (count == null) return Promise.reject();
        return fetch(window.MasterAddr + `/accountlist?start=${start}&cnt=${count}`)
            .then((response) => {
                return response.json();
            });
    }
    public RequestScript(txId: string): Promise<string> {
        if (txId == null) return Promise.reject();
        return fetch(window.MasterAddr + `/script?txid=${txId}`)
            .then((response) => response.json());
    }

    public RequestTx(txId: string): Promise<TxInfoParam> {
        return fetch(window.MasterAddr + `/tx?txid=${txId}`)
            .then((response) => response.json())
    }
    public RequestOutputList(txtype: TxOutputType, addr: string, start:number, cnt:number): Promise<PrevOutputParam[]> {
        const encodeAddr = encodeURIComponent(addr);
        return fetch(window.MasterAddr + `/outputlist?addr=${encodeAddr}&types=${txtype}&start=${start}&cnt=${cnt}`)
            .then((response) => response.json())
    }
    public RequestBlock(blockId: number): Promise<GhostNetBlock> {
        return fetch(window.MasterAddr + `/blockdetail?blockid=${blockId}`)
            .then((response) => response.json())
    }
    public RequestBlockList(start: number, count: number): Promise<BlockInfoParam[]> {
        const promise = 
            fetch(window.MasterAddr + 
                "/blocks?start=" + start + "&count=" + count);
        return promise.then((response) => response.json())
    }

}