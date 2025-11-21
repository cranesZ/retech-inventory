const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

import type { BrowserWindow as BrowserWindowType } from 'electron';

let mainWindow: BrowserWindowType | null = null;

const createWindow = () => {
  const preloadPath = path.join(__dirname, 'preload.cjs');

  console.log('=== Electron Main Process ===');
  console.log('__dirname:', __dirname);
  console.log('Preload path:', preloadPath);
  console.log('Preload exists:', fs.existsSync(preloadPath));

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In production, load the index.html.
  // In dev, load the localhost URL.
  const isDev = !app.isPackaged; // Simple check, can be more robust

  if (isDev) {
    mainWindow!.loadURL('http://localhost:5173');
    mainWindow!.webContents.openDevTools();
  } else {
    mainWindow!.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Log when preload is loaded
  mainWindow!.webContents.on('did-finish-load', () => {
    console.log('Renderer finished loading');
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --- IPC Handlers for Storage ---

const DATA_DIR = path.join(app.getPath('userData'), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

ipcMain.handle('storage:read', async (_: any, key: string) => {
  try {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    throw error;
  }
});

ipcMain.handle('storage:write', async (_: any, key: string, data: any) => {
  try {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    throw error;
  }
});

ipcMain.handle('storage:delete', async (_: any, key: string) => {
  try {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
    throw error;
  }
});

ipcMain.handle('dialog:openFile', async (_: any, options: any) => {
  const result = await dialog.showOpenDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('system:getAppPath', () => {
  return app.getAppPath();
});
