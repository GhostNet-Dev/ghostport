import { BlockStore } from "../store";
import { Session } from "../models/session";

export class Dashboard {
    m_session: Session
    m_blockStore:BlockStore;
    public constructor(private blockStore: BlockStore, sessions: Session) {
        this.m_session = sessions;
        this.m_blockStore = blockStore;
    }

    public Run(masterAddr: string): boolean {
        if (!this.m_session.CheckLogin()) {
            window.ClickLoadPage("main", false);
        }

        return true;
    }

    public Release(): void { }
}