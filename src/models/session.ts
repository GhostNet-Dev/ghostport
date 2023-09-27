
export class Session {
    m_signinFlag: boolean;

    public constructor() {
        this.m_signinFlag = false;
    }
    

    public SignIn() {
        this.m_signinFlag = true;
    }

    public CheckLogin(): boolean {
        return this.m_signinFlag;
    } 
}