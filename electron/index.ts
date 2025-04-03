import { app, BrowserWindow } from 'electron';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });

  // By default, Next.js dev server runs on port 3000
  // We'll load that URL in our Electron BrowserWindow
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// On macOS it is common for applications to stay open until the user explicitly quits
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});