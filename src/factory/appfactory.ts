import { BlockInfo } from "../views/blockinfo";
import { TxInfo } from "../views/txinfo";
import { BlockStore } from "../store";
import { TxDetail } from "../views/txdetail";
import { GWSMain } from "../views/gwsmain";
import { Login } from "../views/login";
import { AccountDetail } from "../views/accountdetail";
import { Dashboard } from "../views/dashboard";
import { Diffusion } from "../views/diffusion.js";
import { Session } from "../models/session";
import { FuncMap } from "../models/type.js";
import { Ipc } from "../app/ipc";
import { GScript } from "../views/gscript.js";
import { Llama } from "../views/llama.js";
import { Terminal } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';


export class AppFactory {
    m_term: Terminal;
    m_blockStore: BlockStore;
    m_gwsMain: GWSMain;
    m_login: Login;
    m_dashboard: Dashboard;
    m_diffusion: Diffusion;
    m_llama: Llama;
    m_gscript: GScript;
    m_txDetail: TxDetail;
    m_txInfo: TxInfo;
    m_blockInfo: BlockInfo;
    m_accountDetail: AccountDetail;
    m_ipc: Ipc;
    m_session: Session

    public constructor() {
        this.m_term = new Terminal({
            convertEol: true,
            cursorBlink: false,
            rows: 7
        });
        this.m_blockStore = new BlockStore();
        this.m_ipc = new Ipc();
        this.m_session = new Session(this.m_blockStore, this.m_term, this.m_ipc);

        this.m_gwsMain = new GWSMain(this.m_blockStore, this.m_ipc);
        this.m_login = new Login(this.m_blockStore, this.m_session, this.m_ipc);
        this.m_dashboard = new Dashboard(this.m_blockStore, this.m_session);
        this.m_diffusion = new Diffusion(this.m_blockStore, this.m_ipc)
        this.m_txDetail = new TxDetail(this.m_blockStore);
        this.m_txInfo = new TxInfo(this.m_blockStore);
        this.m_blockInfo = new BlockInfo(this.m_blockStore);
        this.m_accountDetail = new AccountDetail(this.m_blockStore);
        this.m_llama = new Llama(this.m_blockStore, this.m_ipc)
        this.m_gscript = new GScript(this.m_blockStore, this.m_session)
    }

    public Build(): FuncMap {

        const funcMap: FuncMap = {
            "main": this.m_gwsMain,
            "login": this.m_login,
            "dashboard": this.m_dashboard,
            "diffusion": this.m_diffusion,
            "gscript": this.m_gscript,
            "chat": this.m_llama,
            "txdetail": this.m_txDetail,
            "blockdetail": this.m_txInfo,
            "blockscan": this.m_blockInfo,
            "accountdetail": this.m_accountDetail,
        };
        return funcMap;
    }

    public GetBlockStore(): BlockStore { return this.m_blockStore; }
    public GetSession(): Session { return this.m_session; }

    public OpenTerminal() {
        const _fitAddon = new FitAddon()
        const _webLinksAddon = new WebLinksAddon()
        const termDiv = document.getElementById('terminal');
        if (termDiv != null) this.m_term.open(termDiv);
        this.m_term.loadAddon(_fitAddon);
        this.m_term.loadAddon(_webLinksAddon);
        //_fitAddon.fit();
        window.onresize = (evt) => {
            _fitAddon.fit()
        }
    }
}