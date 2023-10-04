import { ipcRenderer } from "electron"; // ES import 

export class Ipc {
    public RegisterMsgHandler(eventName: string, params: any) {
        ipcRenderer.on(eventName, (evt, args) => {
            params(args)
        });
    }

    public SendMsg(eventName: string, ...params: any[]) {
        ipcRenderer.send(eventName, ...params);
    }
}