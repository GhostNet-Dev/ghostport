import { app, BrowserWindow, ipcMain, nativeTheme } from "electron"; // ES import 
import * as ioutil from "./common/ioutills";
import * as gwsprocess from "./common/process";
import * as account from "./common/account";
import * as utils from "./common/utils";
import * as path from "path";
import { GetPublicIp } from "./libs/getpublicip";
import { FileInfo } from "./models/param.js";
import { RunTimeSync } from './common/runtimesync';

let window: BrowserWindow;
let g_ip: string;

const g_sync = new RunTimeSync(1000 * 60)
GetPublicIp((ip: string) => {
  console.log(ip);
  g_ip = ip;
});

app.on("ready", () => {
  window = new BrowserWindow({
    width: 1200,
    height: 800,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  nativeTheme.themeSource = 'dark';
  window.webContents.openDevTools()
  window.loadFile("index.html");

  ipcMain.on('checkbin', (evt, filename: string) => {
    const ret = ioutil.fileExist("./bins", filename)
    evt.reply('reply_checkbin', ret);
  })

  ipcMain.on('download', (evt, url: string, filename: string) => {
    ioutil.filedownload(url, filename, (ret: boolean) => {
      evt.reply('reply_download', ret);
    })
  })

  ipcMain.on('executeProcess', (evt, gwsPath: string, id: string, pw: string, port: string) => {
    if (gwsprocess.CheckRunning() == true) {
      return;
    }
    gwsprocess.ExecuteProcess(gwsPath, id, pw, g_ip, port, "58080", (code: number) => {
      window.webContents.send('executeProcessExit', true);
    }, (data: any) => {
      window.webContents.send('gwsout', data);
    }, (data: any) => {
      window.webContents.send('gwserr', data);
    })
    g_sync.MonitoringStart()
  });

  ipcMain.on('createProcess', (evt, gwsPath: string, id: string, pw: string, port: string) => {
    gwsprocess.CreateAccount(gwsPath, id, pw, g_ip, port, () => {
      evt.reply('createProcessExit', true);
    })
  });
  ipcMain.on('getDeviceInfo', (evt) => {
    evt.reply('reply_getDeviceInfo', { 
      Ip: g_ip, 
      Os: process.platform,
      Run: gwsprocess.CheckRunning(),
    });
  });
  ipcMain.on('getIp', (evt) => {
    evt.reply('reply_getIp', g_ip);
  });
  ipcMain.on('getSpace', (evt) => {
    ioutil.getDiskSpace(__dirname, (diskSpace: any) => {
      console.log(diskSpace)
      evt.reply('reply_getSpace', diskSpace);
    });
  });
  ipcMain.on('getOs', (evt) => {
    evt.reply('reply_getOs', process.platform);
  });
  ipcMain.on('getAccountList', (evt) => {
    evt.reply('reply_GetAccontList', account.GetAccountFileList());
  });
  ipcMain.on('importAccount', (evt, filename: string, dataString: string) => {
    const buf = new Uint8Array(JSON.parse(dataString)).buffer;
    ioutil.fileWrite(`./${filename}`, buf)
    evt.reply('reply_importAccount', true);
    evt.reply('reply_GetAccontList', account.GetAccountFileList());
  });
  ipcMain.on("downloadfiles", (evt, url: string, assetList: FileInfo[], binsList: FileInfo[], libsList: FileInfo[]) => {
    let index = 0;
    ioutil.downloads(url, assetList, binsList, libsList, (filename: string) => {
      evt.reply("reply_downloadfiles", {
        Index: ++index, Filename: filename
      });
    })
  });
  ipcMain.on("generateImage", (evt, prompt: string, nprompt: string, height: string,
    width: string, step: string, seed: string) => {
    const filename = utils.getUnixTick() + ".png";
    const initFilename = "";
    gwsprocess.DiffusionProcess(prompt, nprompt, height, width,
      step, seed, filename, initFilename,
      (code: number) => {
        window.webContents.send("reply_generateImage", filename);
      }, (data: any) => {
        console.log(`child stdout: ${data}`);
        window.webContents.send('gwsout', data);
      }, (data: any) => {
        console.log(`child stderr: ${data}`);
        window.webContents.send('gwserr', data);
      });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})