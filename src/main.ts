import { app, BrowserWindow } from "electron"; // ES import 
import * as path from "path";

let window;

app.on("ready", () => {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.webContents.openDevTools()
  window.loadFile("index.html");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})