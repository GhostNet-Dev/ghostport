import { app, BrowserWindow, ipcMain, nativeTheme } from "electron"; // ES import 
import * as ioutil from "./filemanager/ioutills";
import * as path from "path";

let window;

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
      if (ret) {
            evt.reply('reply_download', true);
      } else {
        evt.reply('reply_download', false);
      }
    })
  })
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})