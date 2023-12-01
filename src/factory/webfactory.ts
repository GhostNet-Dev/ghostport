import { BlockInfo } from "../views/blockinfo.js";
import { TxInfo } from "../views/txinfo.js";
import { BlockStore } from "../store.js";
import { TxDetail } from "../views/txdetail.js";
import { GWSMain } from "../views/gwsmain.js";
import { Login } from "../views/login.js";
import { AccountDetail } from "../views/accountdetail.js";
import { Dashboard } from "../views/dashboard.js";
import { Diffusion } from "../views/diffusion.js";
import { Session } from "../models/session.js";
import { FuncMap } from "../models/type.js";
import { Socket } from "../web/socket.js";
import { GScript } from "../views/gscript.js";
import { Llama } from "../views/llama.js";

export class WebFactory {
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
    m_socket: Socket;

    public constructor() {
        this.m_blockStore = new BlockStore();
        this.m_socket = new Socket()

        const session = new Session(this.m_blockStore, null, this.m_socket);

        this.m_gwsMain = new GWSMain(this.m_blockStore, this.m_socket);
        this.m_login = new Login(this.m_blockStore, session, this.m_socket);
        this.m_dashboard = new Dashboard(this.m_blockStore, session);
        this.m_diffusion = new Diffusion(this.m_blockStore, this.m_socket)
        this.m_txDetail = new TxDetail(this.m_blockStore);
        this.m_txInfo = new TxInfo(this.m_blockStore);
        this.m_blockInfo = new BlockInfo(this.m_blockStore);
        this.m_accountDetail = new AccountDetail(this.m_blockStore);
        this.m_llama = new Llama(this.m_blockStore, this.m_socket)
        this.m_gscript = new GScript(this.m_blockStore, session)
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
}