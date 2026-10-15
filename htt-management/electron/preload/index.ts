import {
    contextBridge,
    ipcRenderer,
} from "electron";

contextBridge.exposeInMainWorld(
    "desktop",
    {
        platform:
            process.platform,

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
