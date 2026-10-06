//#region electron/preload/index.ts
require("electron").contextBridge.exposeInMainWorld("desktop", { platform: process.platform });
//#endregion
