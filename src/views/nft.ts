import { BlockStore } from "../store";
import { Session } from "../models/session";

export class Nft {
    m_session: Session
    m_blockStore:BlockStore;
    public constructor(private blockStore: BlockStore, sessions: Session) {
        this.m_session = sessions;
        this.m_blockStore = blockStore;
    }

    public Run(masterAddr: string): boolean {
        return true;
    }

    public Release(): void { }
}