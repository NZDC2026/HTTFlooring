import env from '../../config/environment.cjs';
import { OperationalLog } from "./operationalLog";
import { registerSecurityIpc } from "../security/registerSecurityIpc";
import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    nativeImage,
    Menu,
    shell,
    type WebContents,
} from "electron";

import path from "node:path";

import {
    writeFile,
} from "node:fs/promises";

import {
    fileURLToPath,
} from "node:url";

const __filename =
    fileURLToPath(
        import.meta.url,
    );

const __dirname =
    path.dirname(
        __filename,
    );

const APP_NAME =
    "HTT Flooring Management System";

let diagnostics: OperationalLog | undefined;
let lockSecurity = () => {};
let mainWindow:
    | BrowserWindow
    | null = null;

function getProjectPath(
    ...paths: string[]
) {
    return path.join(
        __dirname,
        "..",
        ...paths,
    );
}

function setMacDockIcon() {
    if (
        process.platform !==
        "darwin"
    ) {
        return;
    }

    const iconPath =
        getProjectPath(
            "build",
            "icon.png",
        );

    const icon =
        nativeImage.createFromPath(
            iconPath,
        );

    if (!icon.isEmpty()) {
        app.dock?.setIcon(
            icon,
        );
    }
}

function registerIpcHandlers() {
    ipcMain.handle(
        "statement:export-pdf",

        async (
            event,
            options: {
                defaultFileName:
                string;
            },
        ) => {
            try {
                const senderWindow =
                    BrowserWindow.fromWebContents(
                        event.sender,
                    );

                if (
                    !senderWindow
                ) {
                    return {
                        success:
                            false,

                        error:
                            "Unable to resolve the current application window.",
                    };
                }

                const safeFileName =
                    sanitizePdfFileName(
                        options
                            .defaultFileName,
                    );

                const result =
                    await dialog.showSaveDialog(
                        senderWindow,
                        {
                            title:
                                "Export Customer Statement",

                            defaultPath:
                                safeFileName,

                            filters: [
                                {
                                    name:
                                        "PDF Document",

                                    extensions:
                                        [
                                            "pdf",
                                        ],
                                },
                            ],

                            properties: [
                                "createDirectory",
                                "showOverwriteConfirmation",
                            ],
                        },
                    );

                if (
                    result.canceled ||
                    !result.filePath
                ) {
                    return {
                        success:
                            false,

                        canceled:
                            true,
                    };
                }

                const pdfData =
                    await event.sender.printToPDF({
                        pageSize: "A4",

                        printBackground: true,

                        preferCSSPageSize: true,
                    });

                await writeFile(
                    result.filePath,
                    pdfData,
                );

                return {
                    success: true,

                    filePath:
                        result.filePath,
                };
            } catch (error) {
                diagnostics?.event("pdf-export-failed");

                return {
                    success:
                        false,

                    error:
                        error instanceof
                            Error
                            ? error.message
                            : "Unable to export PDF.",
                };
            }
        },
    );
}

function sanitizePdfFileName(
    value: string,
) {
    const sanitized =
        value
            .replace(
                /[<>:"/\\|?*\u0000-\u001F]/g,
                "-",
            )
            .replace(
                /\s+/g,
                " ",
            )
            .trim();

    const fileName =
        sanitized ||
        "Customer Statement";

    return fileName
        .toLowerCase()
        .endsWith(".pdf")
        ? fileName
        : `${fileName}.pdf`;
}

const desktopWindows = new Map<BrowserWindow, string>();

function trustedWindow(sender: WebContents) {
    const window = BrowserWindow.fromWebContents(sender);
    return window && desktopWindows.has(window) ? window : null;
}

function focusWindow(window: BrowserWindow) {
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
}

function createMainWindow(route = "/") {
    // Explicit alternate profile + compact window for repeatable minimum-desktop acceptance.
    const compact=app.commandLine.hasSwitch("user-data-dir")&&app.commandLine.getSwitchValue("acceptance-window")==="compact";
    const window =
        new BrowserWindow({
            title:
                APP_NAME,

            width: compact?1100:1440,
            height: compact?700:900,

            minWidth: 1100,
            minHeight: 700,

            show: false,

            backgroundColor:
                "#f4f1eb",

            webPreferences: {
                preload:
                    path.join(
                        __dirname,
                        "index.mjs",
                    ),

                contextIsolation:
                    true,

                nodeIntegration:
                    false,

                sandbox: true,
            },
        });

    desktopWindows.set(window, route);
    mainWindow ??= window;
    window.once(
        "ready-to-show",
        () => {
            window.show();
        },
    );

    if (
        env.VITE_DEV_SERVER_URL
    ) {
        window.loadURL(
            env.VITE_DEV_SERVER_URL,
        );
    } else {
        window.loadFile(
            path.join(
                __dirname,
                "../dist/index.html",
            ),
            { hash: route },
        );
    }

    let loaded = false;
    window.webContents.once("did-finish-load", () => { loaded = true; });
    window.webContents.on("did-start-navigation", (_event, _url, inPlace, isMainFrame) => {
        if (loaded && isMainFrame && !inPlace) lockSecurity();
    });
    window.webContents.on("render-process-gone", () => { lockSecurity(); diagnostics?.event("renderer-gone"); });
    window.on("unresponsive", () => { lockSecurity(); diagnostics?.event("renderer-unresponsive"); });
    window.on("responsive", () => diagnostics?.event("renderer-responsive"));
    window.webContents.on("did-fail-load", (_event, code, _description, _url, mainFrame) => { if (mainFrame && code !== -3) diagnostics?.event("load-failed"); });
    window.webContents.on("did-navigate-in-page", (_event, url, isMainFrame) => {
        if (isMainFrame) desktopWindows.set(window, new URL(url).hash.slice(1) || "/");
    });
    window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    window.webContents.on("will-navigate", (event, url) => {
        const target = new URL(url);
        const current = new URL(window.webContents.getURL());
        if (target.protocol !== current.protocol || target.host !== current.host || target.pathname !== current.pathname) event.preventDefault();
    });
    window.on(
        "closed",
        () => {
            desktopWindows.delete(window);
            if (mainWindow === window) mainWindow = desktopWindows.keys().next().value ?? null;
            if (desktopWindows.size === 0) lockSecurity();
        },
    );
}

const customUserData = app.commandLine.getSwitchValue("user-data-dir");
if (customUserData) app.setPath("userData", path.resolve(customUserData));
if (!app.requestSingleInstanceLock()) { app.quit(); }
else {
 diagnostics = new OperationalLog(app.getPath("userData"), app.getVersion());
 process.on("uncaughtException", () => { diagnostics?.event("main-exception"); lockSecurity(); app.exit(1); });
 process.on("unhandledRejection", () => { diagnostics?.event("main-rejection"); lockSecurity(); app.exit(1); });
 app.on("will-quit", () => diagnostics?.finish());
}
app.on("second-instance", () => { mainWindow?.show(); mainWindow?.focus(); });

app.setName(
    APP_NAME,
);

const desktopDownloadUrl = "https://htt-flooring-management.nzdc.co.uk/downloads/index.html";

async function updateAvailable(): Promise<boolean> {
    // Temporary response until the desktop update endpoint is available.
    return true;
}

async function promptForUpdate(window: BrowserWindow) {
    try {
        if (!(await updateAvailable()) || window.isDestroyed()) return;

        const { response } = await dialog.showMessageBox(window, {
            type: "info",
            title: "Desktop update available",
            message: "A new version of HTT Flooring Management is available.",
            detail: "Open the download page in your browser to get the installer.",
            buttons: ["Download update", "Later"],
            defaultId: 0,
            cancelId: 1,
        });

        if (response === 0) await shell.openExternal(desktopDownloadUrl);
    } catch {
        console.warn("Desktop update prompt could not complete.");
    }
}

app.whenReady().then(
    () => {
        setMacDockIcon();

        registerIpcHandlers();
        ipcMain.handle("desktop:open-page", (event, route: unknown) => {
            const owner = trustedWindow(event.sender);
            if (!owner || event.senderFrame !== owner.webContents.mainFrame) return;
            if (typeof route !== "string" || !/^\/(?!\/)[^\u0000-\u001f]*$/.test(route) || route.length > 4096) return;

            const existing = [...desktopWindows].find(([, page]) => page === route)?.[0];
            if (existing) focusWindow(existing);
            else createMainWindow(route);
        });
        const notifySessionChanged = (restart: boolean) => {
            for (const window of desktopWindows.keys()) {
                if (!window.webContents.isDestroyed()) window.webContents.send("desktop:session-changed", restart);
            }
        };
        const security = registerSecurityIpc(path.join(app.getPath("userData"), "local-security"), trustedWindow, () => diagnostics?.event("recurring-stopped"), notifySessionChanged);
        lockSecurity = () => {
            security.lock();
            notifySessionChanged(false);
        };

        Menu.setApplicationMenu(Menu.buildFromTemplate([
            ...(process.platform === "darwin" ? [{ role: "appMenu" as const }] : []),
            { role: "fileMenu" }, { role: "editMenu" }, { role: "viewMenu" }, { role: "windowMenu" },
            { role: "help", submenu: [{ label: "Local diagnostics…", click: async () => {
                const status=diagnostics?.status();
                const result=await dialog.showMessageBox({type:"info",title:"Local diagnostics",message:`HTT Flooring ${app.getVersion()}`,detail:`Local diagnostics: ${status?.available?"available":"unavailable"}\nSession alerts: ${status?.alerts.join(", ")||"none"}\n\nNo business records, passwords, error text or document contents are logged. No telemetry is sent. Business audit remains in Security settings.`,buttons:["Close","Open log folder"]});
                if(result.response===1&&diagnostics)await shell.openPath(diagnostics.directory);
            } }] },
        ]));
        createMainWindow();
        const startupWindow = mainWindow;
        if (app.isPackaged && startupWindow) {
            startupWindow.once("ready-to-show", () => {
                void promptForUpdate(startupWindow);
            });
        }
        diagnostics?.event("ready");

        app.on(
            "activate",
            () => {
                if (
                    BrowserWindow
                        .getAllWindows()
                        .length ===
                    0
                ) {
                    createMainWindow();
                }
            },
        );
    },
).catch(() => {
    diagnostics?.event("startup-failed");
    dialog.showErrorBox("HTT Flooring could not start", "Restart the application. If the problem continues, inspect the local diagnostics folder in the application profile. Business files have not been reset.");
    app.exit(1);
});

app.on(
    "window-all-closed",
    () => {
        if (
            process.platform !==
            "darwin"
        ) {
            app.quit();
        }
    },
);