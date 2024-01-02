import { BlockStore } from "../store.js";
import { Session } from "../models/session.js";
import { Channel } from "../models/com.js";
import { AccountParam } from "../models/param.js";
import { calcGCoin } from "./utils.js";

export class Dashboard {
    public constructor(private blockStore: BlockStore, private session: Session, private ipc: Channel) {
        ipc.RegisterMsgHandler('reply_getSpace', (ret: any) => {
            const diskTag = document.getElementById('diskspace') as HTMLDivElement
            diskTag.innerHTML = `${Math.floor((1 - ret.free / ret.size) * 100)}%`
        })
    }

    htmlUpdateInfo() {
        const nickTag = document.getElementById('nickname') as HTMLDivElement
        nickTag.innerHTML = this.session.GetId()
        const pubTag = document.getElementById('pubkey') as HTMLDivElement
        pubTag.innerHTML = this.session.GetPubAddress()
        this.ipc.SendMsg("getSpace")
        const addr = this.session.GetPubKey()
        this.blockStore.RequestAccount(addr)
            .then((param: AccountParam) => { 
                console.log(param)
                const tag = document.getElementById('totalcoin') as HTMLDivElement
                tag.innerHTML = `${calcGCoin(param.Coin)} Ghost Coin`
            })
    }

    public Run(masterAddr: string): boolean {
        if (!this.session.CheckLogin()) {
            window.ClickLoadPage("main", false);
        }
        this.session.SessionCheck()
        this.htmlUpdateInfo()
        return true;
    }

    public Release(): void { }
}