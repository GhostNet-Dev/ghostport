import { app, BrowserWindow, ipcMain } from "electron"; // ES import 
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

  window.webContents.openDevTools()
  window.loadFile("index.html");

  ipcMain.on('checkbin', (evt) => {
    const ret = ioutil.fileExist("./gws-linux")
    // replyInputValue 송신 또는 응답
    evt.reply('reply_checkbin', ret);
  })
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})