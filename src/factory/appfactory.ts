import { BlockInfo } from "../blockinfo";
import { TxInfo } from "../txinfo";
import { BlockStore } from "../store";
import { TxDetail } from "../txdetail";
import { GWSMain } from "../gwsmain";
import { Login } from "../login";
import { AccountDetail } from "../accountdetail";
import { Dashboard } from "../dashboard";
import { Session } from "../models/session";
import { Ipc } from "../app/ipc";
import { Terminal } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

interface IPage {
    Run(str: string): boolean;
    Release(): void;
}

type FuncMap = { [key: string]: IPage };

export class AppFactory {
    m_term: Terminal;
    m_blockStore: BlockStore;
    m_gwsMain: GWSMain;
    m_login: Login;
    m_dashboard: Dashboard;
    m_txDetail: TxDetail;
    m_txInfo: TxInfo;
    m_blockInfo: BlockInfo;
    m_accountDetail: AccountDetail;
    m_ipc: Ipc;

    public constructor() {
        this.m_term = new Terminal({
            convertEol: true,
            cursorBlink: false,
            rows: 7
        });
        this.m_blockStore = new BlockStore();
        this.m_ipc = new Ipc();
        const session = new Session(this.m_blockStore, this.m_term, this.m_ipc);

        this.m_gwsMain = new GWSMain(this.m_blockStore, this.m_ipc);
        this.m_login = new Login(this.m_blockStore, session, this.m_ipc);
        this.m_dashboard = new Dashboard(this.m_blockStore, session);
        this.m_txDetail = new TxDetail(this.m_blockStore);
        this.m_txInfo = new TxInfo(this.m_blockStore);
        this.m_blockInfo = new BlockInfo(this.m_blockStore);
        this.m_accountDetail = new AccountDetail(this.m_blockStore);
    }

    public Build(): FuncMap {

        const funcMap: FuncMap = {
            "main": this.m_gwsMain,
            "login": this.m_login,
            "dashboard": this.m_dashboard,
            "txdetail": this.m_txDetail,
            "blockdetail": this.m_txInfo,
            "blockscan": this.m_blockInfo,
            "accountdetail": this.m_accountDetail,
        };
        return funcMap;
    }

    public GetBlockStore(): BlockStore { return this.m_blockStore; }

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