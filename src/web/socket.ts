export class Socket {
    
    public constructor() {
        const ws = new WebSocket(`ws://${window.location.host}`);
    }
    public RegisterMsgHandler(eventName: string, params: any) {
    }

    public SendMsg(eventName: string, ...params: any[]) {
    }
}