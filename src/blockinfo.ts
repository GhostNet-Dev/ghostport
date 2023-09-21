import { elapsedTime, calcGCoin} from "./utils.js";
import { BlockStore } from "./store.js";
import { BlockInfoParam } from "./models/param.js";

const PageViewCount = 20;
const MaxUnsignedInt = ((1 << 31) >>> 0); // unsigned int max


export class BlockInfo {
    m_minBlockId: number;
    m_masterAddr: string;
    throttleWait: boolean;
    m_blockStore:BlockStore;

    public constructor(private blockStore: BlockStore) {
        this.m_minBlockId = MaxUnsignedInt;
        this.m_masterAddr = "";
        this.throttleWait = false;
        this.m_blockStore = blockStore;
    }

    insertHtmlBlockInfo(blockInfoParam: BlockInfoParam, t: HTMLTableElement) {
        const blockInfo = blockInfoParam;
        const newRow = t.insertRow();
        const newCell1 = newRow.insertCell(0);
        const newCell2 = newRow.insertCell(1);
        const newCell3 = newRow.insertCell(2);
        const newCell4 = newRow.insertCell(3);
        const newCell5 = newRow.insertCell(4);
        const linkText = `ClickLoadPage("blockdetail", false, "&blockid=${blockInfo.Header.Id}")`;
        newCell1.setAttribute('onclick', linkText);
        newCell1.setAttribute('class', 'handcursor');
        newCell1.innerHTML = `${blockInfo.Header.Id}`;
        newCell2.setAttribute('onclick', linkText);
        newCell2.setAttribute('class', 'handcursor');
        newCell2.innerText = `${elapsedTime(Number(blockInfo.Header.TimeStamp) * 1000)}`;
        newCell3.setAttribute('onclick', linkText);
        newCell3.setAttribute('class', 'handcursor');
        newCell3.innerText = `${blockInfo.Header.TransactionCount + blockInfo.Header.AliceCount}`;
        newCell4.setAttribute('onclick', linkText);
        newCell4.setAttribute('class', 'handcursor');
        newCell4.innerText = `${calcGCoin(blockInfo.IssuedCoin)}`;
        newCell5.setAttribute('onclick', linkText);
        newCell5.setAttribute('class', 'handcursor');
        newCell5.setAttribute('id', 'bminer' + blockInfo.Header.Id);
        const pubKey = blockInfo.Header.BlockSignature.PubKey;
        this.m_blockStore.RequestAccount(pubKey)
            .then((res) => {
                const tag = document.getElementById('bminer' + blockInfo.Header.Id);
                if (tag == null) return;
                tag.innerHTML = `
                        <a onclick='ClickLoadPage("accountdetail", false, "&nick=${res.Nickname}")'>${res.Nickname}</a>`;
            });
        if (this.m_minBlockId > Number(blockInfo.Header.Id))
            this.m_minBlockId = Number(blockInfo.Header.Id)

    }

    reloadBlockInfo(blockInfoParams: BlockInfoParam[]) { 
        console.log("reload");
        const t = document.querySelector('#blockinfo') as HTMLTableElement;
        if (t == null) return;
        this.blockStore.InsertBlockInfos(blockInfoParams);

        this.blockStore.GetBlockInfos().forEach(param=>this.insertHtmlBlockInfo(param, t));
    }

    insertBlockInfo(blockInfoParams: BlockInfoParam[]){
        console.log("insert");
        const t = document.querySelector('#blockinfo') as HTMLTableElement;
        if (t == null) return;
        this.blockStore.InsertBlockInfos(blockInfoParams);

        blockInfoParams.forEach(param=>this.insertHtmlBlockInfo(param, t));
    }

    public HandleScroll(): void {
        const scrollLocation = document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const fullheight = document.body.scrollHeight;
        if (scrollLocation + windowHeight >= fullheight) {
            // execute Loading
            this.fetchBlockInfo();
        }
    }
    throttle(evt: Event): void {
        if (this.throttleWait) return;
        this.throttleWait = true;
        setTimeout(() => {
            this.HandleScroll();
            this.throttleWait = false;
        }, 250);
    }

    Range(): number {
        return this.m_minBlockId - 1;
    }

    fetchBlockInfo(): Promise<void> {
        const range = (this.m_minBlockId == MaxUnsignedInt) ? 0:this.Range();
        return this.m_blockStore.RequestBlockList(range, PageViewCount)
            .then((list) => {
                if (range == null) {
                    this.reloadBlockInfo(list);
                } else {
                    this.insertBlockInfo(list);
                }
            });
    }

    public Run(target: string): boolean {
        console.log("blockinfo run");
        this.m_masterAddr = target;
        this.fetchBlockInfo()
            //.then((evt)=> handleScroll())
            .then(() => window.addEventListener("scroll", (ev:Event)=>{this.throttle(ev)}));

        console.log(this.m_minBlockId);
        return true;
    }

    public Release(): void {
        console.log("blockinfo release");
        this.m_minBlockId = MaxUnsignedInt;
        window.removeEventListener("scroll", (ev:Event)=>{this.throttle(ev)});
    }
}