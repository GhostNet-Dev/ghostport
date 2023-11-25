import { BlockStore } from "../store";
import { Session } from "../models/session";

export class Dashboard {
    m_session: Session
    m_blockStore:BlockStore;
    public constructor(private blockStore: BlockStore, sessions: Session) {
        this.m_session = sessions;
        this.m_blockStore = blockStore;
    }

    htmlUpdateInfo() {
        const nickTag = document.getElementById('nickname') as HTMLDivElement
        nickTag.innerHTML = this.m_session.GetId()
        const pubTag = document.getElementById('pubkey') as HTMLDivElement
        pubTag.innerHTML = this.m_session.GetPubAddress()
    }

    public Run(masterAddr: string): boolean {
        if (!this.m_session.CheckLogin()) {
            window.ClickLoadPage("main", false);
        }
        this.htmlUpdateInfo()
        return true;
    }

    public Release(): void { }
}