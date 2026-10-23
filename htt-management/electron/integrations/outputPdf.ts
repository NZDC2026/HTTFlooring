import {statementSchema} from '../../src/features/external-services/contract';
import {renderStatement} from '../../src/features/external-services/statementHtml';
import {BrowserWindow} from 'electron';
import {randomUUID} from 'node:crypto';
import {renderOutputHtml} from '../../src/features/document-output/outputHtml';
import {renderPurchaseOutput} from '../../src/features/document-output/purchaseOutputHtml';
import type {PreparedOutput} from '../../src/features/document-output/outputRepository';
import type {PreparedPurchaseOutput} from '../../src/features/document-output/purchaseOutputRepository';
export async function renderDeliveryPdf(family:'sales'|'purchase',raw:unknown){
 const statement=statementSchema.safeParse(raw);const a=raw as PreparedOutput|PreparedPurchaseOutput,html=statement.success?renderStatement(statement.data):family==='sales'?renderOutputHtml(a as PreparedOutput):renderPurchaseOutput(a as PreparedPurchaseOutput);
 const window=new BrowserWindow({show:false,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false,javascript:false,webSecurity:true,partition:'delivery-pdf-'+randomUUID()}});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 window.webContents.session.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!details.url.startsWith('data:')&&details.url!=='about:blank'}));
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([(async()=>{await window.loadURL('data:text/html;base64,'+Buffer.from(html).toString('base64'));return window.webContents.printToPDF({pageSize:a.template.paper,printBackground:true,preferCSSPageSize:true});})(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('PDF rendering timed out.')),20000);})]);}
 catch{throw new Error('PDF rendering failed. No delivery was queued.');}
 finally{clearTimeout(timer);if(!window.isDestroyed())window.destroy();}
}
