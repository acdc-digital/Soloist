// ELECTRON WINDOW
// /Users/matthewsimon/Documents/Github/electron-nextjs/electron/index.ts

import { app, BrowserWindow } from 'electron';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // Removes the default OS window frame (including the top row)
    titleBarStyle: 'hiddenInset'
  });

  // Load your Next.js app (default: localhost:3000)
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});