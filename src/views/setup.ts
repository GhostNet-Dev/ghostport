import { BlockStore } from "../store";
import { Session } from "../models/session.js";
import { Channel } from "../models/com";
type LogMapType = { [type: number]: boolean; }

export class Setup {
    adminAddr: string
    constructor(private blockStore: BlockStore, private session: Session,
        private ipc: Channel) {
        this.adminAddr = window.AdminAddr
        ipc.RegisterMsgHandler('reply_getLog_stdout', (ret: any) => {
            const outTag = document.getElementById('outview') as HTMLDivElement
            outTag.innerHTML = "<pre>"
            ret.forEach((str: string) => {
                outTag.innerHTML += `${str.replace("\n", "<br>")}`
            })
            outTag.innerHTML += "</pre>"
        })
        ipc.RegisterMsgHandler('reply_getLog_stderr', (ret: any) => {
            const errTag = document.getElementById('errview') as HTMLDivElement
            errTag.innerHTML = "<pre>"
            ret.forEach((str: string) => {
                errTag.innerHTML += `${str.replace("\n", "<br>")}`
            })
            errTag.innerHTML += "</pre>"
        })
    }

    CheckEvent() {
        const defaultTag = document.getElementById('logdefault') as HTMLInputElement
        const blockConTag = document.getElementById('logblockconsensus') as HTMLInputElement
        const masterListTag = document.getElementById('logmasterlist') as HTMLInputElement
        const forwardingTraceTag = document.getElementById('logforwardingtrace') as HTMLInputElement
        const logPacketLogTag = document.getElementById('logpacketlog') as HTMLInputElement
        const fileserviceTag = document.getElementById('logfileservice') as HTMLInputElement

        const logmap0 = (defaultTag.checked) ? "true" : ""
        const logmap1 = (blockConTag.checked) ? "true" : ""
        const logmap2 = (masterListTag.checked) ? "true" : ""
        const logmap3 = (forwardingTraceTag.checked) ? "true" : ""
        const logmap4 = (logPacketLogTag.checked) ? "true" : ""
        const logmap5 = (fileserviceTag.checked) ? "true" : ""
        
        fetch(this.adminAddr + `/setlogger?default=${logmap0}&blockconsensus=${logmap1}&masterlist=${logmap2}&forwarding=${logmap3}&packetlog=${logmap4}&fileservice=${logmap5}`) }

    RequestLog() {
        this.ipc.SendMsg("getLog", "stdout")
        this.ipc.SendMsg("getLog", "stderr")
    }

    RequestLogMap() {
        fetch(this.adminAddr + "/getlogger")
            .then((res) => res.json())
            .then((ret: LogMapType) => {
                const defaultTag = document.getElementById('logdefault') as HTMLInputElement
                defaultTag.checked = ret[0];
                defaultTag.onchange = () => this.CheckEvent()

                const blockConTag = document.getElementById('logblockconsensus') as HTMLInputElement
                blockConTag.checked = ret[1];
                blockConTag.onchange = () => this.CheckEvent()

                const masterListTag = document.getElementById('logmasterlist') as HTMLInputElement
                masterListTag.checked = ret[2];
                masterListTag.onchange = () => this.CheckEvent()

                const forwardingTraceTag = document.getElementById('logforwardingtrace') as HTMLInputElement
                forwardingTraceTag.checked = ret[3];
                forwardingTraceTag.onchange = () => this.CheckEvent()

                const logPacketLogTag = document.getElementById('logpacketlog') as HTMLInputElement
                logPacketLogTag.checked = ret[4];
                logPacketLogTag.onchange = () => this.CheckEvent()

                const fileserviceTag = document.getElementById('logfileservice') as HTMLInputElement
                fileserviceTag.checked = ret[5];
                fileserviceTag.onchange = () => this.CheckEvent()
            })

    }

    public Run(masterAddr: string): boolean {
        if (!this.session.CheckLogin()) {
            window.ClickLoadPage("main", false);
        }
        this.adminAddr = window.AdminAddr
        this.RequestLog()
        this.RequestLogMap()
        return true;
    }

    public Release(): void { }

}