import {
    contextBridge,
    ipcRenderer,
    type IpcRendererEvent,
} from "electron";

contextBridge.exposeInMainWorld(
    "desktop",
    {
        platform:
            process.platform,

        onSessionChanged: (callback: (restart: boolean) => void) => {
            const listener = (_event: IpcRendererEvent, restart: boolean) => callback(restart);
            ipcRenderer.on("desktop:session-changed", listener);
            return () => ipcRenderer.removeListener("desktop:session-changed", listener);
        },

        openPage: (route: string) => ipcRenderer.invoke("desktop:open-page", route),

        exportStatementPdf: (
            options: {
                defaultFileName:
                string;
            },
        ) =>
            ipcRenderer.invoke(
                "statement:export-pdf",
                options,
            ),
    },
);
contextBridge.exposeInMainWorld("securityBridge", {
    request: (action: string, input?: unknown) => ipcRenderer.sendSync("security:request", action, input),
});
