import { BlockInfo } from "../blockinfo.js";
import { TxInfo } from "../txinfo.js";
import { BlockStore } from "../store.js";
import { TxDetail } from "../txdetail.js";
import { GWSMain } from "../gwsmain.js";
import { Login } from "../login.js";
import { AccountDetail } from "../accountdetail.js";
import { Dashboard } from "../dashboard.js";
import { Session } from "../models/session.js";
import { Socket } from "../web/socket.js";

interface IPage {
    Run(str: string): boolean;
    Release(): void;
}

type FuncMap = { [key: string]: IPage };

export class WebFactory {
    m_blockStore: BlockStore;
    m_gwsMain: GWSMain;
    m_login: Login;
    m_dashboard: Dashboard;
    m_txDetail: TxDetail;
    m_txInfo: TxInfo;
    m_blockInfo: BlockInfo;
    m_accountDetail: AccountDetail;
    m_socket: Socket;

    public constructor() {
        this.m_blockStore = new BlockStore();
        this.m_socket = new Socket()

        const session = new Session(this.m_blockStore, null, this.m_socket);

        this.m_gwsMain = new GWSMain(this.m_blockStore, this.m_socket);
        this.m_login = new Login(this.m_blockStore, session, this.m_socket);
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
}