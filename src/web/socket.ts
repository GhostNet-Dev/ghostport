export type Handler = { [key: string]: any }
export type Msg = { types: string, params: any[] }

export class Socket {
    m_opend: boolean
    m_ws: WebSocket;
    m_handler: Handler;
    
    public constructor() {
        this.m_ws = new WebSocket(`ws://${window.location.hostname}:8091`);
        this.m_opend = false;
        this.m_handler = {};

        this.m_ws.onopen = () => {
            this.m_opend = true;
            this.m_ws.onmessage = (evt) => {
                console.log(evt.data);
                const msg: Msg = JSON.parse(evt.data);
                this.m_handler[msg.types](msg.params);
            }
        };
    }

    public RegisterMsgHandler(eventName: string, callback: any) {
        this.m_handler[eventName] = (params: any[]) => {
            callback(params[0]);
        }
    }

    public SendMsg(eventName: string, ...params: any[]) {
        const msg: Msg = {
            types: eventName,
            params: [...params],
        }
        this.m_ws.send(JSON.stringify(msg))
    }
}