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