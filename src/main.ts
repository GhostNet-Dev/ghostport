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

  ipcMain.on('checkbin', (evt) => {
    const ret = ioutil.fileExist("./GhostWebService-windows.exe")
    evt.reply('reply_checkbin', ret);
  })
  
  ipcMain.on('download', (evt, url: string) => {
    ioutil.filedownload(evt, url, "GhostWebService-windows.exe")
  })
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})