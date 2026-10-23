import type { Table } from '@tanstack/react-table';
export type ExportCell=string|number|boolean|null|undefined;
export function tableCsv(headers:string[],rows:ExportCell[][]){
 const cell=(v:ExportCell)=>{if(typeof v==='number'&&!Number.isFinite(v))throw new Error('Cannot export a non-finite table value.');if(v!==null&&v!==undefined&&!['string','number','boolean'].includes(typeof v))throw new Error('A table column requires an explicit scalar export value.');let s=v==null?'':typeof v==='boolean'?(v?'Yes':'No'):String(v);if(typeof v==='string'&&/^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 return '\uFEFF'+[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n');
}
export function downloadTableCsv(name:string,csv:string){const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name.replace(/[^\p{L}\p{N}._-]/gu,'-').slice(0,120)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}
export function exportTable<T>(table:Table<T>,selected=false){
 const columns=table.getVisibleLeafColumns().filter(c=>c.accessorFn&&c.columnDef.meta?.exportable!==false);
 if(!columns.length)throw new Error('Select at least one data column to export.');
 // Pre-pagination row model includes every filtered/sorted page, never just the viewport.
 const rows=table.getPrePaginationRowModel().rows.filter(r=>!selected||table.getState().rowSelection[r.id]);
 return {count:rows.length,csv:tableCsv(columns.map(c=>c.columnDef.meta?.exportLabel??(typeof c.columnDef.header==='string'?c.columnDef.header:c.id)),rows.map(r=>columns.map(c=>c.columnDef.meta?.exportValue?c.columnDef.meta.exportValue(r.original):r.getValue(c.id) as ExportCell)))};
}
export type CompleteTableDataset={id:string;scope:'all-filtered';permission:import('../../features/security/rbac').Permission;rows:{id:string;cells:ExportCell[]}[]};
export function validateCompleteDataset(headers:string[],dataset:CompleteTableDataset){if(dataset.scope!=='all-filtered'||dataset.rows.some(r=>!r.id||r.cells.length!==headers.length)||new Set(dataset.rows.map(r=>r.id)).size!==dataset.rows.length)throw new Error('Complete export requires unique row IDs and an explicit cell for every declared column.');}
export function exportCompleteDataset(headers:string[],dataset:CompleteTableDataset,hidden:Set<number>,selected?:Set<string>){validateCompleteDataset(headers,dataset);const indices=headers.map((_,i)=>i).filter(i=>!hidden.has(i)&&!!headers[i].trim()&&!/^\s*(Select|Actions?|Quick view|Manage)(?:\s*\/.*)?\s*$/i.test(headers[i]));if(!indices.length)throw new Error('Select at least one data column to export.');const rows=dataset.rows.filter(r=>!selected||selected.has(r.id));return {count:rows.length,csv:tableCsv(indices.map(i=>headers[i]),rows.map(r=>indices.map(i=>r.cells[i])))};}
