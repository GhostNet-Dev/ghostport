import { BlockStore } from "../store";
import { Session } from "../models/session";

export class Nft {
    m_session: Session
    m_blockStore:BlockStore;
    public constructor(private blockStore: BlockStore, sessions: Session) {
        this.m_session = sessions;
        this.m_blockStore = blockStore;
    }

    htmlUpdateInfo() {
        const nickTag = document.getElementById('nickname');
        if (nickTag == null) return false;
        nickTag.innerHTML = this.m_session.GetId()
        const pubTag = document.getElementById('pubkey');
        if (pubTag == null) return false;
        pubTag.innerHTML = this.m_session.GetPubKey()
    }

    public Run(masterAddr: string): boolean {
        if (!this.m_session.CheckLogin()) {
            window.ClickLoadPage("main", false);
        }
        return true;
    }

    public Release(): void { }
}