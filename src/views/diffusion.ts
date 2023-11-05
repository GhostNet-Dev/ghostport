import { BlockStore } from "../store.js";
import { Channel } from "../models/com.js";

export class Diffusion {
    m_blockStore: BlockStore;
    m_ipc: Channel;
    public constructor(private blockStore: BlockStore, ipc: Channel) {
        this.m_blockStore = blockStore;
        this.m_ipc = ipc;
        ipc.RegisterMsgHandler('reply_generateImage', (filename: string) => {
            const printTag = document.getElementById("printImg") as HTMLDivElement;
            printTag.innerHTML = `
                <img src="./outputs/${filename}">
            `;
        });
    }
    generateImage() {
        const promptTag = document.getElementById("prompt") as HTMLInputElement;
        const prompt = promptTag.value;
        const npromptTag = document.getElementById("nprompt") as HTMLInputElement;
        const nprompt = npromptTag.value;
        const heightTag = document.getElementById("height") as HTMLInputElement;
        const height = heightTag.value;
        const widthTag = document.getElementById("width") as HTMLInputElement;
        const width = widthTag.value;
        const stepTag = document.getElementById("step") as HTMLInputElement;
        const step = stepTag.value;
        const seedTag = document.getElementById("seed") as HTMLInputElement;
        const seed = seedTag.value;
        const printTag = document.getElementById("printImg") as HTMLDivElement;
        printTag.innerHTML = `
            <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        this.m_ipc.SendMsg("generateImage", prompt, nprompt, height, width, step, seed);
    }
    public Run(masterAddr: string): boolean {
        const btn = document.getElementById("generateBtn") as HTMLButtonElement
        btn.onclick = () => this.generateImage();
        return true;
    }

    public Release(): void { }
}