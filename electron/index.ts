// ELECTRON WINDOW
// /Users/matthewsimon/Documents/Github/electron-nextjs/electron/index.ts

import { app, BrowserWindow, dialog } from "electron";
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
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load your Next.js app
  win.loadURL("http://localhost:3000")
    .catch(err => {
      console.error('Failed to load renderer URL:', err);
      dialog.showErrorBox(
        'Error Loading App', 
        'Could not connect to the renderer app. Make sure it is running at http://localhost:3000'
      );
    });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  // Handle window loading errors
  win.webContents.on('did-fail-load', () => {
    console.error('Failed to load renderer URL');
    dialog.showErrorBox(
      'Error Loading App', 
      'Could not connect to the renderer app. Make sure it is running at http://localhost:3000'
    );
  });
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