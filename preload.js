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
  listDownloads: () => ipcRenderer.invoke('downloads:list'),
  installGame: (id) => ipcRenderer.invoke('downloads:install', id),
  forgetDownload: (id) => ipcRenderer.invoke('downloads:forget', id),
  cancelDownload: (id) => ipcRenderer.invoke('downloads:cancel', id),
  clearDownloads: () => ipcRenderer.invoke('downloads:clear'),
  openStoreClient: (source) => ipcRenderer.invoke('downloads:openClient', source),
  requestRatings: (appids, front) => ipcRenderer.invoke('ratings:request', appids, front),
  allRatings: () => ipcRenderer.invoke('ratings:all'),
  ratingStats: () => ipcRenderer.invoke('ratings:stats'),
  syncCollections: () => ipcRenderer.invoke('collections:sync'),
  pendingSteamDeletes: () => ipcRenderer.invoke('collections:pending'),
  applySteamDeletesNow: () => ipcRenderer.invoke('collections:applyNow'),
  getLists: () => ipcRenderer.invoke('lists:get'),
  createList: (name) => ipcRenderer.invoke('lists:create', name),
  renameList: (id, name) => ipcRenderer.invoke('lists:rename', id, name),
  deleteList: (id) => ipcRenderer.invoke('lists:delete', id),
  setListGame: (listId, gameId, member) => ipcRenderer.invoke('lists:setGame', listId, gameId, member),
  reorderLists: (ids) => ipcRenderer.invoke('lists:reorder', ids),
  listAccounts: () => ipcRenderer.invoke('accounts:list'),
  loginAccount: (id) => ipcRenderer.invoke('accounts:login', id),
  logoutAccount: (id) => ipcRenderer.invoke('accounts:logout', id),
  syncAccounts: () => ipcRenderer.invoke('accounts:sync'),
  getVersion: () => ipcRenderer.invoke('app:version'),
  isStore: () => ipcRenderer.invoke('app:isStore'),
  checkUpdate: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
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
  // main -> renderer whenever an install's progress changes
  onDownloads: (cb) => {
    const handler = (_e, msg) => cb(msg);
    ipcRenderer.on('downloads:update', handler);
    return () => ipcRenderer.removeListener('downloads:update', handler);
  },
  // main -> renderer after a post-install rescan refreshed the library
  onLibraryUpdated: (cb) => {
    const handler = (_e, msg) => cb(msg);
    ipcRenderer.on('library:updated', handler);
    return () => ipcRenderer.removeListener('library:updated', handler);
  },
  // main -> renderer when queued Steam collection deletions reached Steam
  onSteamCollectionsDeleted: (cb) => {
    const handler = (_e, msg) => cb(msg);
    ipcRenderer.on('collections:steamDeleted', handler);
    return () => ipcRenderer.removeListener('collections:steamDeleted', handler);
  },
  // main -> renderer as Metacritic scores are resolved
  onRatings: (cb) => {
    const handler = (_e, msg) => cb(msg);
    ipcRenderer.on('ratings:update', handler);
    return () => ipcRenderer.removeListener('ratings:update', handler);
  },
  // main -> renderer update lifecycle (checking / available / downloading / downloaded)
  onUpdateStatus: (cb) => {
    const handler = (_e, msg) => cb(msg);
    ipcRenderer.on('update:status', handler);
    return () => ipcRenderer.removeListener('update:status', handler);
  },
});
