import { BlockStore } from "../store.js";
import { Channel } from "../models/com.js";
import * as config from "../models/config.js";
import { FileInfo } from "../models/param.js";

const DownloadList :string [] = []
type ReportFunc = (totalStep: number, currentStep: number, message: string) => void;

export class SyncVersion {
    m_ipc: Channel;
    m_report: ReportFunc;
    m_totalDownload: number;
    m_blockStore: BlockStore;
    m_os: string;
    m_libsList: FileInfo[];
    m_binsList: FileInfo[];
    m_assetList: FileInfo[];
    m_index: number;


    public constructor(private blockStore: BlockStore, ipc: Channel,
        report: ReportFunc, complete: Function) {
        this.m_blockStore = blockStore;
        this.m_ipc = ipc;
        this.m_report = report;
        this.m_totalDownload = this.m_index = 0;
        this.m_os = "";
        this.m_libsList = new Array<FileInfo>();
        this.m_binsList = new Array<FileInfo>();
        this.m_assetList = new Array<FileInfo>();

        ipc.RegisterMsgHandler('reply_checkbin', (payload: boolean) => {
            const bodyTag = document.getElementById('checkfile');
            if (bodyTag == null) return;

            if (payload == false) {
                bodyTag.innerHTML = "The GhostNet Deamon does not exist."
                console.log("request file to server");
                return;
            }
            complete();
        });
        ipc.RegisterMsgHandler('reply_download', (ret: boolean) => {
            const bodyTag = document.getElementById('checkfile');
            if (bodyTag == null) return;
            bodyTag.innerHTML = (ret) ? "Complete" : "Connection failed.";

            const btn = document.getElementById("downloadBtn") as HTMLButtonElement
            btn.disabled = false;
            complete();
        });
        ipc.RegisterMsgHandler('reply_downloadfiles', (ret: any) => {
            report(this.m_totalDownload, ret.Index, "download: " + ret.Filename);
            this.m_index++;
            if (this.m_totalDownload == this.m_index) {
                complete();
            }
        });
    }
    // report download process
    // get download list

    public CheckVersion(os: string) {
        this.m_os = os;
        fetch(config.RootAddress + "/info?os=" + os)
            .then((response) => response.json())
            .then((info) => {
                console.log(info);
                const filename = (os == "win32") ? "GhostWebService-windows-" + info.BuildDate + ".exe" :
                    `GhostWebService-${os}-${info.BuildDate}`;
                this.m_blockStore.SetGWSPath(filename);
                this.m_ipc.SendMsg('checkbin', filename);
            })
    }

    public async GetDownloadList() {
        try {
            await Promise.all([
                fetch(config.RootAddress + "/download/binslist?os=" + this.m_os)
                    .then((response) => response.json())
                    .then((list: FileInfo[]) => {
                        this.m_binsList = list;
                    }),
                fetch(config.RootAddress + "/download/libslist?os=" + this.m_os)
                    .then((response) => response.json())
                    .then((list: FileInfo[]) => {
                        this.m_libsList = list;
                    }),
                fetch(config.RootAddress + "/download/assetlist?os=" + this.m_os)
                    .then((response) => response.json())
                    .then((list: FileInfo[]) => {
                        this.m_assetList = list;
                    }),
            ]).then(() => {
                this.m_totalDownload = this.m_assetList.length + this.m_binsList.length +
                    this.m_libsList.length;
                this.m_report(this.m_totalDownload, 0, "get download list");
                this.m_ipc.SendMsg('downloadfiles', config.RootAddress, this.m_assetList, this.m_binsList,
                    this.m_libsList);
            })
        }
        catch (err) {
            console.warn(err);
        }
    }

    public StartDownload() {

    }
}