import { BlockStore } from "../store.js";
import { Session } from "../models/session.js";
import { Channel } from "../models/com.js";
import { access } from "original-fs";

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
        
        ipc.RegisterMsgHandler('reply_GetAccountList', (files: string[]) => {
            this.drawHtmlAccountList(files);
        });
        ipc.RegisterMsgHandler('reply_importAccount', (result: boolean) => {
            const tag = document.getElementById("importResult");
            if (tag == null) return;
            tag.innerHTML = (result == true) ? "Complete" : "Error";
        });
    }

    //https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
    createAccount() {
        if (!this.checkInputData()) return;
        const btn = document.getElementById("createBtn") as HTMLButtonElement
        btn.disabled = true;
        this.drawHtmlLoading(true);
        this.m_ipc.SendMsg('createProcess', './' + this.m_blockStore.GetGWSPath(),
            this.m_id, this.m_pw, '50135');
    }
    login() {
        const tag = document.getElementById("accountList") as HTMLSelectElement;
        this.m_id = tag.options[tag.selectedIndex].value;
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
    drawHtmlAccountList(accountList: string[]) {
        const tag = document.getElementById("accountList") as HTMLSelectElement;
        if (tag == null) return;
        const length = tag.options.length - 1;
        for (var i = length; i >= 0; i--) {
            tag.remove(i);
        }

        accountList.forEach(account => {
            const option = document.createElement('option');
            option.text = account;
            option.value = account.split('@')[0];
            tag.appendChild(option);
        })
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

    requestAccountList() {
        this.m_ipc.SendMsg('getAccountList');
    }

    importAccount() {
        const inputFile = document.getElementById("accountFilePath") as HTMLInputElement;
        if (inputFile.files == null ) return;

        const file = inputFile.files[0];
        const reader = new FileReader();

        var rawData = new ArrayBuffer(file.size);
        reader.onloadend = () => {}
        reader.onload = (e)=> {
            rawData = e.target?.result as ArrayBuffer;
            const dataString = JSON.stringify(Array.from(new Uint8Array(rawData)))
            this.m_ipc.SendMsg("importAccount", file.name, dataString)
        }
        reader.readAsArrayBuffer(file);
    }

    public Run(masterAddr: string): boolean {
        this.requestAccountList();
        const btn = document.getElementById("createBtn") as HTMLButtonElement
        btn.onclick = () => this.createAccount();

        const signinBtn = document.getElementById("signinBtn") as HTMLButtonElement
        signinBtn.onclick = () => this.login();

        const importBtn = document.getElementById("importBtn") as HTMLButtonElement
        importBtn.onclick = () => this.importAccount();
        return true;
    }

    public Release(): void { }
}