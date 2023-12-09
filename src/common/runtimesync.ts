import { BlockStore } from "../store";
import { UserAccount } from "../models/type"
import * as gwsprocess from "./process";
import * as config from "../models/config.js";
import { FileInfo } from "../models/param.js";
import * as ioutil from "./ioutills";

export class RunTimeSync {
    m_gwsPath: string
    m_os: string
    m_buildVersion: string
    m_interval: number
    m_libsList: FileInfo[];
    m_binsList: FileInfo[];
    m_assetList: FileInfo[];
    m_monitoring: boolean
    m_timer: NodeJS.Timer | null

    public constructor(interval: number) {
        this.m_os = this.m_buildVersion = this.m_gwsPath = ""
        this.m_interval = interval
        this.m_libsList = new Array<FileInfo>();
        this.m_binsList = new Array<FileInfo>();
        this.m_assetList = new Array<FileInfo>();
        this.m_os = process.platform
        this.m_monitoring = false
        this.m_timer = null
    }

    public MonitoringStart() {
        if(this.m_monitoring == false) {
            setTimeout(() => { this.CheckNewRelease() }, this.m_interval)
            this.m_monitoring = true
        }
    }

    public CheckNewRelease() {
        fetch(config.RootAddress + "/info?os=" + this.m_os)
            .then((response) => response.json())
            .then((info)=> {
                console.log(info)
                const filename = (this.m_os == "win32") ? "GhostWebService-windows-" + info.BuildDate + ".exe" :
                    `GhostWebService-${this.m_os}-${info.BuildDate}`;
                this.m_gwsPath = filename
                this.m_interval = info.Interval
                if (this.m_buildVersion == "") {
                    this.m_buildVersion = info.BuildDate
                }
                if (this.m_buildVersion != info.BuildDate) {
                    console.log(this.m_buildVersion, " != ", info.BuildDate)
                    this.GetDownloadList()
                }
            })
            .catch((err) => console.log(err))
        setTimeout(() => { this.CheckNewRelease() }, this.m_interval)
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
                const totalDownload = this.m_assetList.length + this.m_binsList.length +
                    this.m_libsList.length;
                let downloaded = 0
                ioutil.downloads(config.RootAddress, this.m_assetList, 
                    this.m_binsList, this.m_libsList, (filename: string) => {
                        //console.log("[", downloaded, "]download: ", filename)
                        downloaded++
                        if (downloaded == totalDownload) {
                            this.switchProcess()
                        }
                })})
        }
        catch (err) {
            console.warn(err);
        }
    }

    switchProcess() {
        if (gwsprocess.CheckRunning()) {
            gwsprocess.AbortService()
        }
        setTimeout(() => {
            gwsprocess.RestartProcess("./bins/" + this.m_gwsPath)
        }, 2000)
    }
}