const { contextBridge, ipcRenderer } = require('electron');

console.log('=== Preload Script Starting ===');
console.log('[Preload] contextBridge available:', typeof contextBridge);
console.log('[Preload] ipcRenderer available:', typeof ipcRenderer);

try {
  const api = {
    storage: {
      read: (key: string) => {
        console.log('[Preload] storage.read called with key:', key);
        return ipcRenderer.invoke('storage:read', key);
      },
      write: (key: string, data: any) => {
        console.log('[Preload] storage.write called with key:', key);
        return ipcRenderer.invoke('storage:write', key, data);
      },
      delete: (key: string) => {
        console.log('[Preload] storage.delete called with key:', key);
        return ipcRenderer.invoke('storage:delete', key);
      },
    },
    dialog: {
      openFile: (options: any) => {
        console.log('[Preload] dialog.openFile called');
        return ipcRenderer.invoke('dialog:openFile', options);
      },
    },
    system: {
      getAppPath: () => {
        console.log('[Preload] system.getAppPath called');
        return ipcRenderer.invoke('system:getAppPath');
      },
    }
  };

  contextBridge.exposeInMainWorld('api', api);
  console.log('[Preload] ✅ API successfully exposed to main world');
  console.log('[Preload] API object:', Object.keys(api));
} catch (error) {
  console.error('[Preload] ❌ Failed to expose API:', error);
}
