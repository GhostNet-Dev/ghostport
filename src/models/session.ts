import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { BlockStore } from "../store";

export class Session {
    m_signinFlag: boolean;
    m_blockStore:BlockStore;
    m_id: string;
    m_pw: string
    m_gws!: ChildProcessWithoutNullStreams;
    m_term: any;

    public constructor(private blockStore: BlockStore, term: any) {
        this.m_signinFlag = false;
        this.m_blockStore = blockStore;
        this.m_id = this.m_pw = "";
        this.m_term = term;
    }
    

    public SignIn(id: string, pw: string) {
        this.m_id = id;
        this.m_pw = pw;
        this.m_signinFlag = true;
        
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
        })
    }

    public CheckLogin(): boolean {
        return this.m_signinFlag;
    } 
}