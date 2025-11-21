const { app, BrowserWindow, ipcMain, dialog, autoUpdater: nativeAutoUpdater } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

import type { BrowserWindow as BrowserWindowType } from 'electron';

let mainWindow: BrowserWindowType | null = null;

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

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
      devTools: false, // Disable DevTools completely
    },
  });

  // Disable right-click context menu (prevents "Inspect Element")
  mainWindow!.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // Block keyboard shortcuts for opening DevTools
  mainWindow!.webContents.on('before-input-event', (event, input) => {
    // Block F12, Cmd+Option+I (Mac), Ctrl+Shift+I (Windows/Linux)
    if (
      input.key === 'F12' ||
      (input.control && input.shift && input.key === 'I') ||
      (input.meta && input.alt && input.key === 'I') ||
      (input.control && input.shift && input.key === 'J') || // Console
      (input.meta && input.alt && input.key === 'J') // Console on Mac
    ) {
      event.preventDefault();
    }
  });

  // In production, load the index.html.
  // In dev, load the localhost URL.
  const isDev = !app.isPackaged; // Simple check, can be more robust

  if (isDev) {
    mainWindow!.loadURL('http://localhost:5173');
    // DevTools disabled - removed openDevTools() for security
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

// ============================================
// AUTO-UPDATE FUNCTIONALITY
// ============================================

// Check for updates on app start (only in production)
app.on('ready', () => {
  if (!app.isPackaged) {
    console.log('Dev mode: Skipping auto-update check');
    return;
  }

  // Check for updates after 3 seconds
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 3000);

  // Check for updates every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 4 * 60 * 60 * 1000);
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info: any) => {
  console.log('Update available:', info.version);

  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'Update Available',
    message: `A new version (${info.version}) is available!`,
    detail: 'The update will be downloaded in the background. You will be notified when it\'s ready to install.',
    buttons: ['OK']
  });

  // Start downloading
  autoUpdater.downloadUpdate();
});

autoUpdater.on('update-not-available', () => {
  console.log('No updates available');
});

autoUpdater.on('error', (err: Error) => {
  console.error('Auto-updater error:', err);
});

autoUpdater.on('download-progress', (progress: any) => {
  console.log(`Download progress: ${progress.percent.toFixed(2)}%`);
});

autoUpdater.on('update-downloaded', (info: any) => {
  console.log('Update downloaded:', info.version);

  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'Update Ready',
    message: `Version ${info.version} has been downloaded.`,
    detail: 'The application will restart to install the update.',
    buttons: ['Restart Now', 'Later']
  }).then((result: { response: number }) => {
    if (result.response === 0) {
      // Quit and install immediately
      autoUpdater.quitAndInstall(false, true);
    }
  });
});
