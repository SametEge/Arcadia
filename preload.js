const { contextBridge, ipcRenderer } = require('electron');

// Secure bridge between the (sandboxed) renderer and the Electron main process.
// The renderer can only call exactly these methods — nothing else from Node.
contextBridge.exposeInMainWorld('arcadia', {
  getState: () => ipcRenderer.invoke('library:get'),
  scan: () => ipcRenderer.invoke('library:scan'),
  launch: (id) => ipcRenderer.invoke('game:launch', id),
  updateGame: (id, patch) => ipcRenderer.invoke('game:update', id, patch),
  removeGame: (id) => ipcRenderer.invoke('game:remove', id),
  addGame: () => ipcRenderer.invoke('game:add'),
  pickCover: (id) => ipcRenderer.invoke('game:pickCover', id),
  getIcon: (id) => ipcRenderer.invoke('icon:get', id),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (patch) => ipcRenderer.invoke('settings:set', patch),
  addFolder: () => ipcRenderer.invoke('folder:add'),
  removeFolder: (p) => ipcRenderer.invoke('folder:remove', p),
  openInstallDir: (id) => ipcRenderer.invoke('game:openDir', id),
  openDiscord: () => ipcRenderer.invoke('app:openDiscord'),
  discordStatus: () => ipcRenderer.invoke('app:discordStatus'),
  closeDiscord: () => ipcRenderer.invoke('app:closeDiscord'),
  runningProcs: (opts) => ipcRenderer.invoke('app:runningProcs', opts),
  closeGame: (id) => ipcRenderer.invoke('game:close', id),
  setAutostart: (on) => ipcRenderer.invoke('app:setAutostart', on),
  setIcon: (dataUrl) => ipcRenderer.invoke('app:setIcon', dataUrl),
  // main -> renderer progress events during a scan
  onScanProgress: (cb) => {
    const handler = (_e, msg) => cb(msg);
    ipcRenderer.on('scan:progress', handler);
    return () => ipcRenderer.removeListener('scan:progress', handler);
  },
  // main -> renderer when a SteamGridDB cover arrives for a game
  onCoversUpdated: (cb) => {
    const handler = (_e, msg) => cb(msg);
    ipcRenderer.on('covers:updated', handler);
    return () => ipcRenderer.removeListener('covers:updated', handler);
  },
});
