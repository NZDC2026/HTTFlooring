let electron = require("electron");
//#region electron/preload/index.ts
electron.contextBridge.exposeInMainWorld("desktop", {
	platform: process.platform,
	exportStatementPdf: (options) => electron.ipcRenderer.invoke("statement:export-pdf", options)
});
electron.contextBridge.exposeInMainWorld("securityBridge", { request: (action, input) => electron.ipcRenderer.sendSync("security:request", action, input) });
//#endregion
