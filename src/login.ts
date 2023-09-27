import { BlockStore } from "./store";
import { Session } from "./models/session";

export class Login {
    m_session: Session
    public constructor(private blockStore: BlockStore, sessions: Session) {
        this.m_session = sessions;
    }

    public Run(masterAddr: string): boolean {
        return true;
    }

    public Release(): void { }
}