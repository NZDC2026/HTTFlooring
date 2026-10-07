import { BrowserWindow, app, dialog, ipcMain, nativeImage } from "electron";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
//#region electron/main/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var APP_NAME = "HTT Flooring Management System";
var mainWindow = null;
function getProjectPath(...paths) {
	return path.join(__dirname, "..", ...paths);
}
function setMacDockIcon() {
	if (process.platform !== "darwin") return;
	const iconPath = getProjectPath("build", "icon.png");
	const icon = nativeImage.createFromPath(iconPath);
	if (!icon.isEmpty()) app.dock?.setIcon(icon);
}
function registerIpcHandlers() {
	ipcMain.handle("statement:export-pdf", async (event, options) => {
		try {
			const senderWindow = BrowserWindow.fromWebContents(event.sender);
			if (!senderWindow) return {
				success: false,
				error: "Unable to resolve the current application window."
			};
			const safeFileName = sanitizePdfFileName(options.defaultFileName);
			const result = await dialog.showSaveDialog(senderWindow, {
				title: "Export Customer Statement",
				defaultPath: safeFileName,
				filters: [{
					name: "PDF Document",
					extensions: ["pdf"]
				}],
				properties: ["createDirectory", "showOverwriteConfirmation"]
			});
			if (result.canceled || !result.filePath) return {
				success: false,
				canceled: true
			};
			const pdfData = await event.sender.printToPDF({
				pageSize: "A4",
				printBackground: true,
				preferCSSPageSize: true
			});
			await writeFile(result.filePath, pdfData);
			return {
				success: true,
				filePath: result.filePath
			};
		} catch (error) {
			console.error("Failed to export customer statement PDF:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unable to export PDF."
			};
		}
	});
}
function sanitizePdfFileName(value) {
	const fileName = value.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
}
function createMainWindow() {
	mainWindow = new BrowserWindow({
		title: APP_NAME,
		width: 1440,
		height: 900,
		minWidth: 1100,
		minHeight: 700,
		show: false,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: path.join(__dirname, "index.mjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true
		}
	});
	mainWindow.once("ready-to-show", () => {
		mainWindow?.show();
	});
	if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}
app.setName(APP_NAME);
app.whenReady().then(() => {
	setMacDockIcon();
	registerIpcHandlers();
	createMainWindow();
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
	});
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
//#endregion
export {};
