// ELECTRON WINDOW
// /Users/matthewsimon/Documents/Github/electron-nextjs/electron/index.ts

import { app, BrowserWindow } from "electron";
import 'dotenv/config';

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,           // initial width
    height: 635,           // initial height
    minWidth: 1080,        // minimum width
    minHeight: 635,        // minimum height
    maxWidth: 1400,        // maximum width
    maxHeight: 850,        // maximum height
    frame: false,          // no OS frame
    titleBarStyle: "hiddenInset"
  });

  // Load your Next.js app
  win.loadURL("http://localhost:3000");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});