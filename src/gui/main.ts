import { BrowserWindow, app, ipcMain } from "electron";

import { start } from "../scrapper/search";

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static app: Electron.App;

    public static main() {
        this.app = app;

        this.app.on("window-all-closed", this.onWindowAllClosed);
        this.app.on("ready", this.onReady);
    }

    private static onWindowAllClosed() {
        if (process.platform !== "darwin") this.app.quit();
    }

    private static onClose() { this.mainWindow = null; }

    private static onReady() {
        this.mainWindow = new BrowserWindow({
            width: 1600,
            height: 900,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            titleBarStyle: 'hidden',
            frame: false,
            autoHideMenuBar: true,
        });
        this.mainWindow.loadFile(__dirname + "/index.html");
        this.mainWindow.on("closed", Main.onClose);

        // this.mainWindow.webContents.openDevTools();

        ipcMain.on("form-submission", async (event, { term, pages }) => {
            const lst = await start(term, pages);
            this.mainWindow.webContents.send("torrent-list", lst);
        });
    }
}