import {
    app,
    BrowserWindow,
    nativeImage,
} from "electron";

import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const APP_NAME =
    "HTT Flooring Management System";

let mainWindow: BrowserWindow | null =
    null;

/**
 * Resolve files from the project root while running
 * through vite-plugin-electron.
 */
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
        process.platform !== "darwin"
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
        app.dock?.setIcon(icon);
    }
}

function createMainWindow() {
    mainWindow =
        new BrowserWindow({
            title: APP_NAME,

            width: 1440,
            height: 900,

            minWidth: 1100,
            minHeight: 700,

            show: false,

            backgroundColor:
                "#f4f1eb",

            webPreferences: {
                preload: path.join(
                    __dirname,
                    "index.mjs",
                ),

                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
            },
        });

    mainWindow.once(
        "ready-to-show",
        () => {
            mainWindow?.show();
        },
    );

    if (
        process.env
            .VITE_DEV_SERVER_URL
    ) {
        mainWindow.loadURL(
            process.env
                .VITE_DEV_SERVER_URL,
        );
    } else {
        mainWindow.loadFile(
            path.join(
                __dirname,
                "../dist/index.html",
            ),
        );
    }

    mainWindow.on(
        "closed",
        () => {
            mainWindow = null;
        },
    );
}

app.setName(APP_NAME);

app.whenReady().then(() => {
    setMacDockIcon();

    createMainWindow();

    app.on(
        "activate",
        () => {
            if (
                BrowserWindow
                    .getAllWindows()
                    .length === 0
            ) {
                createMainWindow();
            }
        },
    );
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