import { BlockStore } from "../store";
import { Channel } from "./com.js";

export class Session {
    m_signinFlag: boolean;
    m_blockStore:BlockStore;
    m_id: string;
    m_pw: string
    m_term: any;
    m_ipc: Channel;

    public constructor(private blockStore: BlockStore, term: any, ipc: Channel) {
        this.m_signinFlag = false;
        this.m_blockStore = blockStore;
        this.m_id = this.m_pw = "";
        this.m_term = term;
        this.m_ipc = ipc;
  
        ipc.RegisterMsgHandler('executeProcessExit', (code:number) => {
        });
        ipc.RegisterMsgHandler('gwsout', (data: any) => {
            if (this.m_term == null) return;
            this.m_term.write(data);
        });
        ipc.RegisterMsgHandler('gwserr', (data: any) => {
            if (this.m_term == null) return;
            this.m_term.write(data);
        });
    }

    public SignIn(id: string, pw: string) {
        this.m_id = id;
        this.m_pw = pw;
        this.m_signinFlag = true;
        
        this.m_ipc.SendMsg('executeProcess', './' + this.m_blockStore.GetGWSPath(),
            this.m_id, this.m_pw, '50129');
            /*
        const session = this;
        this.m_gws = spawn('./' + this.m_blockStore.GetGWSPath(),
            ['-u', this.m_id, '-p', this.m_pw,
                '--ip', this.m_blockStore.GetPublicIp(),
                '--port', '50129'])

        this.m_gws.on('exit', function (code, signal) {
            console.log('child process exited with ' +
                `code ${code} and signal ${signal}`)
        })

        this.m_gws.stdout.on('data', data => {
            if (session.m_term == null) return;
            session.m_term.write(data);
            //console.log(`child stdout: ${data}`);
        })
        this.m_gws.stderr.on('data', data => {
            if (session.m_term == null) return;
            session.m_term.write(data);
            //console.log(`child stderr: ${data}`);
        })*/
    }

    public CheckLogin(): boolean {
        return this.m_signinFlag;
    } 
}