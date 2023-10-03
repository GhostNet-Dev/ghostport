import { BlockStore } from "./store";
import { Session } from "./models/session";
import { spawn } from "child_process";

export class Login {
    m_session: Session
    m_blockStore:BlockStore;
    m_id: string;
    m_pw: string
    public constructor(private blockStore: BlockStore, sessions: Session) {
        this.m_session = sessions;
        this.m_blockStore = blockStore;
        this.m_id = this.m_pw = "";
    }

    //https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
    createAccount() {
        if (!this.checkInputData()) return;
        const btn = document.getElementById("createBtn") as HTMLButtonElement
        btn.disabled = true;
        this.drawHtmlLoading(true);

        const gws = spawn('./' + this.m_blockStore.GetGWSPath(), 
            ['create', '-u', this.m_id, '-p', this.m_pw, 
            '--ip', this.m_blockStore.GetPublicIp(), 
            '--port', '50129'])

        const thisObj = this;
        gws.on('exit', function(code, signal) {
            console.log('child process exited with ' +
              `code ${code} and signal ${signal}`)
            btn.disabled = false;
            thisObj.drawHtmlLoading(false);
        })

        gws.stdout.on('data', data => {
            console.log(`child stdout: ${data}`);
        })
        gws.stderr.on('data', data => {
            console.log(`child stderr: ${data}`);
        })
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