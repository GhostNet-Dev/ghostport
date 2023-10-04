import { BlockStore } from "./store.js";
import { Session } from "./models/session.js";
import { Channel } from "./models/com.js";

export class Login {
    m_session: Session
    m_blockStore:BlockStore;
    m_id: string;
    m_pw: string
    m_ipc: Channel;

    public constructor(private blockStore: BlockStore, sessions: Session, ipc: Channel) {
        this.m_session = sessions;
        this.m_blockStore = blockStore;
        this.m_id = this.m_pw = "";
        this.m_ipc = ipc;
            
        ipc.RegisterMsgHandler('createProcessExit', () => {
            const btn = document.getElementById("createBtn") as HTMLButtonElement
            btn.disabled = false;
            this.drawHtmlLoading(false);
        });
    }

    //https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
    createAccount() {
        if (!this.checkInputData()) return;
        const btn = document.getElementById("createBtn") as HTMLButtonElement
        btn.disabled = true;
        this.drawHtmlLoading(true);
        this.m_ipc.SendMsg('createProcess', './' + this.m_blockStore.GetGWSPath(),
            this.m_id, this.m_pw, '50129');
    }
    login() {
        if (!this.checkInputData()) return;
        this.m_session.SignIn(this.m_id, this.m_pw);
        window.ClickLoadPage("dashboard", false);
    }
    drawHtmlLoading(disable: boolean) {
        const bodyTag = document.getElementById('checkfile');
        if (bodyTag == null) return;
        
        if (disable) { 
            bodyTag.innerHTML = `<div class="spinner-grow" role="status">
                <span class="sr-only"></span> </div> `;
        } else {
            bodyTag.innerHTML = "";
        }
    }
    warningMsg(msg: string) {

    }
    checkInputData(): boolean {
        const inputId = document.getElementById("inputId") as HTMLInputElement;
        if (inputId.value == "") {
            this.warningMsg("Please. Enter your ID");
            return false;
        }
        this.m_id = inputId.value;
        const inputPw = document.getElementById("inputPw") as HTMLInputElement;
        if (inputPw.value == "") {
            this.warningMsg("Please. Enter your Password");
            return false;
        }
        this.m_pw = inputPw.value;
        return true;
    }

    public Run(masterAddr: string): boolean {
        const btn = document.getElementById("createBtn") as HTMLButtonElement
        btn.onclick = () => this.createAccount();

        const signinBtn = document.getElementById("signinBtn") as HTMLButtonElement
        signinBtn.onclick = () => this.login();
        return true;
    }

    public Release(): void { }
}