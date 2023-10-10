export class LocalSession {
    m_id: string;
    m_pw: string;

    public constructor() {
        this.m_id = this.m_pw = "";
    }
    public Clear() {
        this.m_id = this.m_pw = "";
    }
    public SetSession(id: string, pw: string) {
        this.m_id = id;
        this.m_pw = pw;
    }
    public CheckSession(id: string, pw: string): boolean {
        if (this.m_id == id && this.m_pw == pw) {
            return true;
        }
        return false;
    }
}