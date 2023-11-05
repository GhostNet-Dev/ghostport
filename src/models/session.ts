import { BlockStore } from "../store";
import { Channel } from "./com.js";

export class Session {
    m_signinFlag: boolean;
    m_blockStore:BlockStore;
    m_id: string;
    m_pw: string
    m_pubKey: string
    m_term: any;
    m_ipc: Channel;

    public constructor(private blockStore: BlockStore, term: any, ipc: Channel) {
        this.m_signinFlag = false;
        this.m_blockStore = blockStore;
        this.m_id = this.m_pw = this.m_pubKey = "";
        this.m_term = term;
        this.m_ipc = ipc;
  
        ipc.RegisterMsgHandler('executeProcessExit', (code:number) => {
            this.m_signinFlag = false;
            window.ClickLoadPage("main", false);
        });
        ipc.RegisterMsgHandler('gwsout', (data: any) => {
            if (this.m_term == null) { return; }
            this.m_term.write(data);
        });
        ipc.RegisterMsgHandler('gwserr', (data: any) => {
            if (this.m_term == null) { return; }
            this.m_term.write(data);
        });
    }

    public SignIn(id: string, pw: string, pubkey: string) {
        this.m_id = id;
        this.m_pw = pw;
        this.m_pubKey = pubkey;
        this.m_signinFlag = true;
        
        this.m_ipc.SendMsg('executeProcess', './bins/' + this.m_blockStore.GetGWSPath(),
            this.m_id, this.m_pw, '50135');
    }
    
    public GetId(): string { return this.m_id; }
    public GetPubKey(): string { return this.m_pubKey; }

    public CheckLogin(): boolean {
        return this.m_signinFlag;
    } 
}