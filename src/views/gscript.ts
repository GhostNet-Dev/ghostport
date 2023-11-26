import { BlockStore } from "../store";
import { Session } from "../models/session";
import { PrevOutputParam, TxOutputType, TxOutputTypeStr } from "../models/tx.js";

export class GScript {
    m_session: Session
    m_blockStore:BlockStore;
    public constructor(private blockStore: BlockStore, sessions: Session) {
        this.m_session = sessions;
        this.m_blockStore = blockStore;
    }

    drawHtmlScriptList(params: PrevOutputParam[]) {
        const tag = document.getElementById("scriptlist") as HTMLDivElement;
        tag.innerHTML = ``
        params.forEach(param => {
        tag.innerHTML += `
                    <div class="row m-3">
                        <div class="col">
                            <a id="${param.VOutPoint.TxId}_link" class="handcursor">
                            ${param.VOutPoint.TxId}
                            </a></div>
                        <div class="col maxtext handcursor" id="${param.VOutPoint.TxId}"></div>
                    </div>
                    `
            const dataTx = encodeURIComponent(param.Vout.ScriptEx)
            this.m_blockStore.RequestScript(dataTx)
                .then((res) => {
                    const tag = document.getElementById(param.VOutPoint.TxId) as HTMLDivElement
                    tag.innerHTML = res
                    const loadCode =  () => {
                        Function(" editAreaLoader.setValue('gscript_editor', `" + res + "`) ")()
                    }
                    tag.onclick = loadCode
                    const linkTag = document.getElementById(param.VOutPoint.TxId + "_link")
                    if (linkTag != null) linkTag.onclick = loadCode
                });
        })
    }
    registerScript() {
        const tag = document.getElementById("blackbox") as HTMLDivElement
        fetch(`${this.m_blockStore.MasterAddr}/newscript`, {
            method: "POST",
            body: tag.innerHTML,
        }).then(res => {
            console.log(res)
            return res.json()})
            .then(txId => {
                const tag = document.getElementById("result") as HTMLDivElement
                tag.innerHTML = txId
            })
    }

    public Run(masterAddr: string): boolean {
        const tag = document.getElementById("scriptlist") as HTMLDivElement;
        if (this.m_session.CheckLogin() == false) {
            tag.innerHTML = `
                    <div class="row mb-3 text-center"> login을 해야합니다.  </div>
            `
            return false
        }
        const btn = document.getElementById("registerBtn") as HTMLButtonElement
        btn.addEventListener("click", this.registerScript.bind(this))

        this.m_blockStore.RequestOutputList(TxOutputType.TxTypeScript
            , encodeURIComponent(this.m_session.GetPubKey()), 0, 50)
            .then(param => this.drawHtmlScriptList(param))

        Function(`
            editAreaLoader.init({
                id: "gscript_editor", 
                start_highlight: true,
                allow_toggle: false,
                word_wrap: true,
                language: "en",
                syntax: "gscript",
                toolbar: "search, go_to_line, |, undo, redo, |, select_font, |, syntax_selection, |, change_smooth_selection, highlight, reset_highlight, |, help",
                show_line_color: true,
                allow_resize: "y",
            })
            `)()
        
        return true;
    }

    public Release(): void { }
}