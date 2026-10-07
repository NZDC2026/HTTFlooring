let electron = require("electron");
//#region electron/preload/index.ts
electron.contextBridge.exposeInMainWorld("desktop", {
	platform: process.platform,
	exportStatementPdf: (options) => electron.ipcRenderer.invoke("statement:export-pdf", options)
});
//#endregion
