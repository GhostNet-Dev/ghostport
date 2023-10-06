import { app, BrowserWindow, ipcMain, nativeTheme } from "electron"; // ES import 
import * as ioutil from "./filemanager/ioutills";
import * as gwsprocess from "./common/process";
import * as path from "path";
import { GetPublicIp } from "./libs/getpublicip";

let window: BrowserWindow;
let g_ip: string;
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
    const ret = ioutil.fileExist(`./${filename}`)
    evt.reply('reply_checkbin', ret);
  })
  
  ipcMain.on('download', (evt, url: string, filename: string) => {
    ioutil.filedownload(url, filename, (ret: boolean)=> {
      evt.reply('reply_download', ret);
    })
  })

  ipcMain.on('executeProcess', (evt, gwsPath: string, id: string, pw: string, port: string) => {
    gwsprocess.ExecuteProcess(gwsPath, id, pw, g_ip, port, (code: number) => {
      window.webContents.send('executeProcessExit', true);
    },(data: any) => {
      window.webContents.send('gwsout', data);
    },(data: any) => {
      window.webContents.send('gwserr', data);
    })
  });

  ipcMain.on('createProcess', (evt, gwsPath: string, id: string, pw: string, port: string) => {
    gwsprocess.CreateAccount(gwsPath, id, pw, g_ip, port, () => {
      evt.reply('createProcessExit', true);
    })
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})