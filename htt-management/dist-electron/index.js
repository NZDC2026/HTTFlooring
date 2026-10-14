import { BrowserWindow as e, app as t, dialog as n, ipcMain as r, nativeImage as i } from "electron";
import a from "node:path";
import { writeFile as o } from "node:fs/promises";
import { fileURLToPath as s } from "node:url";
//#region electron/main/index.ts
var c = s(import.meta.url), l = a.dirname(c), u = "HTT Flooring Management System", d = null;
function f(...e) {
	return a.join(l, "..", ...e);
}
function p() {
	if (process.platform !== "darwin") return;
	let e = f("build", "icon.png"), n = i.createFromPath(e);
	n.isEmpty() || t.dock?.setIcon(n);
}
function m() {
	r.handle("statement:export-pdf", async (t, r) => {
		try {
			let i = e.fromWebContents(t.sender);
			if (!i) return {
				success: !1,
				error: "Unable to resolve the current application window."
			};
			let a = h(r.defaultFileName), s = await n.showSaveDialog(i, {
				title: "Export Customer Statement",
				defaultPath: a,
				filters: [{
					name: "PDF Document",
					extensions: ["pdf"]
				}],
				properties: ["createDirectory", "showOverwriteConfirmation"]
			});
			if (s.canceled || !s.filePath) return {
				success: !1,
				canceled: !0
			};
			let c = await t.sender.printToPDF({
				pageSize: "A4",
				printBackground: !0,
				preferCSSPageSize: !0
			});
			return await o(s.filePath, c), {
				success: !0,
				filePath: s.filePath
			};
		} catch (e) {
			return console.error("Failed to export customer statement PDF:", e), {
				success: !1,
				error: e instanceof Error ? e.message : "Unable to export PDF."
			};
		}
	});
}
function h(e) {
	let t = e.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return t.toLowerCase().endsWith(".pdf") ? t : `${t}.pdf`;
}
function g() {
	d = new e({
		title: u,
		width: 1440,
		height: 900,
		minWidth: 1100,
		minHeight: 700,
		show: !1,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: a.join(l, "index.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), d.once("ready-to-show", () => {
		d?.show();
	}), process.env.VITE_DEV_SERVER_URL ? d.loadURL(process.env.VITE_DEV_SERVER_URL) : d.loadFile(a.join(l, "../dist/index.html")), d.on("closed", () => {
		d = null;
	});
}
t.setName(u), t.whenReady().then(() => {
	p(), m(), g(), t.on("activate", () => {
		e.getAllWindows().length === 0 && g();
	});
}), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
});
//#endregion
export {};
