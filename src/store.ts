import { GhostNetBlock } from "./models/block.js";
import { TxInfoParam, BlockInfoParam, AccountParam, GhostWebUser } from "./models/param";
import { PrevOutputParam, TxOutputType } from "./models/tx.js";

const MaxUnsignedInt = ((1 << 31) >>> 0); // unsigned int max


export class BlockStore {
    blockInfos: BlockInfoParam[];
    m_minBlockId: number;
    m_accountMap: Map<string, AccountParam>;
    m_masterNodes: GhostWebUser[];
    m_gwsFilename: string;
    m_ip: string;
    m_os: string;
    m_masterAddr: string

    public constructor() {
        this.m_minBlockId = MaxUnsignedInt
        this.blockInfos = new Array<BlockInfoParam>()
        this.m_accountMap = new Map<string, AccountParam>()
        this.m_masterNodes = new Array<GhostWebUser>()
        this.m_os = this.m_ip = this.m_gwsFilename = ""
        this.m_masterAddr = window.MasterAddr
    }

    public SetDeviceInfo(ip: string, os: string) { 
        this.m_ip = ip; 
        this.m_os = os; 
    }

    public GetDeviceOs(): string { return this.m_os; }
    public GetDeviceIp(): string { return this.m_ip; }

    public SetGWSPath(filename: string) {
        this.m_gwsFilename = filename;
    }

    public GetGWSPath(): string {
        return this.m_gwsFilename;
    }

    public AddMasters(nodes: GhostWebUser[]) {
        this.m_masterNodes = nodes;
    }
    public GetMasters() :GhostWebUser[] {
        return this.m_masterNodes;
    } 
    public set MasterAddr(addr: string) {
        this.m_masterAddr = addr
    }
    public get MasterAddr() {
        return this.m_masterAddr
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
        return fetch(this.m_masterAddr + `/account?addr=${encodeAddr}`)
            .then((response) => response.json())
            .then((account:AccountParam)=>{
                this.m_accountMap.set(account.Nickname, account);
                return account;
            });
    }
    public RequestAccountbyNick(nickname: string): Promise<string> {
        return fetch(this.m_masterAddr + `/getpubkey?nickname=${nickname}`)
            .then((response) => {
                console.log(response)
                return response.json()
            });
    }
    public RequestAccountList(start: number, count: number): Promise<AccountParam[]> {
        if (count == null) return Promise.reject();
        return fetch(this.m_masterAddr + `/accountlist?start=${start}&cnt=${count}`)
            .then((response) => {
                return response.json();
            });
    }
    public RequestScript(txId: string): Promise<string> {
        if (txId == null) return Promise.reject();
        return fetch(this.m_masterAddr + `/script?txid=${txId}`)
            .then((response) => response.json());
    }

    public RequestTx(txId: string): Promise<TxInfoParam> {
        return fetch(this.m_masterAddr + `/tx?txid=${txId}`)
            .then((response) => response.json())
    }
    public RequestOutputList(txtype: TxOutputType, addr: string, start:number, cnt:number): Promise<PrevOutputParam[]> {
        const encodeAddr = addr;
        return fetch(this.m_masterAddr + `/outputlist?addr=${encodeAddr}&types=${txtype}&start=${start}&cnt=${cnt}`)
            .then((response) => {
                console.log(this.m_masterAddr + `/outputlist?addr=${encodeAddr}&types=${txtype}&start=${start}&cnt=${cnt}`)
                console.log(response)
                return response.json()
            })
    }
    public RequestBlock(blockId: number): Promise<GhostNetBlock> {
        return fetch(this.m_masterAddr + `/blockdetail?blockid=${blockId}`)
            .then((response) => response.json())
    }
    public RequestBlockList(start: number, count: number): Promise<BlockInfoParam[]> {
        const promise = 
            fetch(this.m_masterAddr + 
                "/blocks?start=" + start + "&count=" + count);
        return promise.then((response) => response.json())
    }

}