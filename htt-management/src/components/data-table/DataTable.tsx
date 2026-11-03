import { isWeb } from "../../features/security/webBridge";
import { nativeRequest } from "../../features/security/repositoryHost";
import { GripVertical } from "lucide-react";
import { filterTableRows } from './tableSearch';
import { useEffect, useMemo, useState } from 'react';
import { flexRender,getCoreRowModel,getPaginationRowModel,getSortedRowModel,type ColumnDef,type ColumnOrderState,type SortingState,type VisibilityState,type RowSelectionState,useReactTable } from '@tanstack/react-table';
import { cn } from '../../lib/cn';
import { Input } from '../ui/Input';
import { TableEmptyRow } from '../ui/DemoTable';
import { DataTablePagination } from './DataTablePagination';
import { ColumnControls } from './ColumnControls';
import { downloadTableCsv,exportTable } from './tableExport';
import { useSecurity } from '../../features/security/securityClient';
import { usePermission } from '../../features/security/usePermission';
import type { DataTableCapabilities,DataTablePaginationConfig,DataTableSearchConfig } from './types';
interface DataTableProps<TData>{defaultColumnVisibility?:VisibilityState;data:TData[];columns:ColumnDef<TData,unknown>[];search?:DataTableSearchConfig<TData>;pagination?:DataTablePaginationConfig;capabilities?:DataTableCapabilities<TData>;emptyTitle?:string;emptyDescription?:string;onRowClick?:(row:TData)=>void;}
export function DataTable<TData>({data,columns,defaultColumnVisibility,search,pagination,capabilities,emptyTitle='No results found',emptyDescription='Try adjusting your search or filters.',onRowClick}:DataTableProps<TData>){
 const [sorting,setSorting]=useState<SortingState>([]),[query,setQuery]=useState(''),[columnVisibility,setColumnVisibility]=useState<VisibilityState>(defaultColumnVisibility ?? {}),[rowSelection,setRowSelection]=useState<RowSelectionState>({}),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const { session } = useSecurity();
 const route = window.location.hash.split("?")[0] || window.location.pathname;
 const tableId = capabilities?.id ?? JSON.stringify(columns.map(column =>
  column.id ?? ("accessorKey" in column ? column.accessorKey : typeof column.header === "string" ? column.header : ""),
 ));
 const accountTable = JSON.stringify([route, tableId]);
 const orderKey = session ? `htt:table-column-order:v1:${JSON.stringify([session.user.id, route, tableId])}` : "";
 const savedOrder = useMemo<ColumnOrderState>(() => {
  if (!orderKey) return [];
  try {
   const value: unknown = JSON.parse(window.localStorage.getItem(orderKey) ?? "[]");
   return Array.isArray(value) && value.every(item => typeof item === "string") ? [...new Set(value)] : [];
  } catch {
   return [];
  }
 }, [orderKey]);
 const [editedOrder, setEditedOrder] = useState<{ key: string; columns: ColumnOrderState }>();
 const columnOrder = editedOrder?.key === orderKey ? editedOrder.columns : savedOrder;

 useEffect(() => {
  if (!isWeb || !orderKey) return;
  try {
   const remoteOrder = nativeRequest<ColumnOrderState | null>("preferences.columnOrder.get", { table: accountTable });
   if (remoteOrder !== null) {
    setEditedOrder({ key: orderKey, columns: remoteOrder });
   } else if (savedOrder.length) {
    nativeRequest("preferences.columnOrder.set", { table: accountTable, order: savedOrder });
   }
  } catch {
   setError("Could not load your account's column order.");
  }
 }, [accountTable, orderKey, savedOrder]);

 function setColumnOrder(order: ColumnOrderState) {
  setEditedOrder({ key: orderKey, columns: order });
  if (!orderKey) return;
  if (isWeb) {
   try {
    nativeRequest("preferences.columnOrder.set", { table: accountTable, order });
    setError("");
   } catch {
    setError("Column order changed, but could not be saved to your account.");
   }
  }
  try {
   if (order.length) window.localStorage.setItem(orderKey, JSON.stringify(order));
   else window.localStorage.removeItem(orderKey);
  } catch {
   setError("Column order changed, but this device could not save it.");
  }
 }
 const canRead=usePermission(capabilities?.permission??'inventory.read');
 const validIds=useMemo(()=>{if(!capabilities)return false;const ids=data.map(capabilities.rowId);return ids.every(id=>typeof id==='string'&&!!id)&&new Set(ids).size===ids.length;},[data,capabilities]);
 const complete=capabilities?.scope==='complete'&&canRead&&validIds;
 const filteredData=useMemo(()=>filterTableRows(data,columns,query,search?.filterFn),[data,query,search,columns]);
 const table=useReactTable({data:filteredData,columns,state:{sorting,columnVisibility,columnOrder,rowSelection},onSortingChange:setSorting,onColumnVisibilityChange:setColumnVisibility,onRowSelectionChange:setRowSelection,getRowId:(r,i)=>validIds?capabilities!.rowId(r):String(i),enableRowSelection:complete,getCoreRowModel:getCoreRowModel(),getSortedRowModel:getSortedRowModel(),getPaginationRowModel:pagination?getPaginationRowModel():undefined,initialState:{columnVisibility:defaultColumnVisibility,pagination:{pageSize:Math.max(1,Math.min(500,pagination?.pageSize??10))}}});
 function moveColumn(source: string, target: string) {
  const order = table.getAllLeafColumns().map(column => column.id);
  const from = order.indexOf(source);
  const to = order.indexOf(target);
  if (from < 0 || to < 0 || from === to) return;
  order.splice(from, 1);
  order.splice(to, 0, source);
  setColumnOrder(order);
 }
 const allRows=table.getPrePaginationRowModel().rows,selectedRows=allRows.filter(r=>rowSelection[r.id]),visible=table.getVisibleLeafColumns(),selectedIds=new Set(selectedRows.map(r=>r.id));
 const exportRows=(selected:boolean)=>{try{const output=exportTable(table,selected);downloadTableCsv(capabilities!.id+(selected?'-selected':'-all-filtered'),output.csv);setNotice(`Exported ${output.count} rows across all matching pages; visible data columns only.`);setError('');}catch(e){setError((e as Error).message);}};
 if(capabilities&&!canRead)return <p role="alert">Your role cannot read this table.</p>;
 return <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 print:hidden">{search?<Input aria-label={search.placeholder??'Search table'} value={query} onChange={e=>{setQuery(e.target.value);setRowSelection({});table.setPageIndex(0);setNotice('');}} placeholder={search.placeholder??'Search…'} className="h-9 w-full max-w-xs"/>:<span/>}<div className="flex flex-wrap items-center gap-2">{complete&&<button type="button" className="rounded-lg border px-3 py-2 text-sm" disabled={!allRows.length} onClick={()=>exportRows(false)}>Export all filtered rows ({allRows.length})</button>}<ColumnControls columns={table.getAllLeafColumns().filter(c=>c.getCanHide()).map(c=>({id:c.id,label:typeof c.columnDef.header==='string'?c.columnDef.header:c.id,visible:c.getIsVisible()}))} onChange={(id,value)=>table.getColumn(id)?.toggleVisibility(value)} onMove={moveColumn} onReset={()=>{table.resetColumnVisibility();setColumnOrder([]);}}/></div></div>
 {error&&<p role="alert" className="p-3 text-red-700">{error}</p>}{notice&&<p role="status" className="p-3 text-sm">{notice}</p>}
 {capabilities?.scope==='complete'&&!validIds&&<p role="alert" className="p-3 text-red-700">Stable unique row IDs are required. Selection and export are unavailable.</p>}
 {complete&&<div className="flex flex-wrap items-center gap-3 border-b p-3 text-sm print:hidden"><label className="flex gap-2"><input aria-label="Select all filtered rows" type="checkbox" checked={!!allRows.length&&selectedRows.length===allRows.length} disabled={!allRows.length} onChange={e=>setRowSelection(e.target.checked?Object.fromEntries(allRows.map(r=>[r.id,true])):{})}/>Select all {allRows.length} filtered rows across pages</label><span>{selectedRows.length} selected</span><button type="button" className="underline" disabled={!selectedRows.length} onClick={()=>setRowSelection({})}>Clear selection</button><button type="button" className="rounded border px-3 py-2" disabled={!selectedRows.length} onClick={()=>exportRows(true)}>Export selected rows</button>{selectedRows.length>0&&capabilities.selectionActions?.(selectedRows.map(r=>r.original))}</div>}
 <div className="overflow-x-auto"><table className="w-full border-collapse"><thead className="bg-[var(--color-background-subtle)]">{table.getHeaderGroups().map(hg=><tr key={hg.id}>{complete&&<th className="px-3 text-left print:hidden">Select</th>}{hg.headers.map(h=><th key={h.id} onDragOver={event=>{
  if(event.dataTransfer.types.includes('application/x-htt-column')){event.preventDefault();event.dataTransfer.dropEffect='move';}
 }} onDrop={event=>{event.preventDefault();moveColumn(event.dataTransfer.getData('application/x-htt-column'),h.column.id);}} className={cn('h-10 border-b px-4 text-xs font-semibold',h.column.columnDef.meta?.align==='center'?'text-center':'text-left')}>{!h.isPlaceholder && !h.column.columns.length && <span draggable title="Drag to reorder column" className="mr-1 inline-flex cursor-grab align-middle text-[var(--color-text-muted)] print:hidden" onDragStart={event=>{event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('application/x-htt-column',h.column.id);}}><GripVertical size={12} aria-hidden="true"/></span>}<button type="button" disabled={!h.column.getCanSort()} onClick={h.column.getToggleSortingHandler()} aria-label={'Sort '+(typeof h.column.columnDef.header==='string'?h.column.columnDef.header:h.column.id)}>{h.isPlaceholder?null:flexRender(h.column.columnDef.header,h.getContext())}{h.column.getCanSort()&&(h.column.getIsSorted()==='asc'?' ↑':h.column.getIsSorted()==='desc'?' ↓':' ↕')}</button></th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.length?table.getRowModel().rows.map(r=><tr key={r.id} onClick={()=>onRowClick?.(r.original)} className={cn('border-b last:border-b-0',onRowClick&&'cursor-pointer hover:bg-[var(--color-surface-hover)]')}>{complete&&<td className="px-3 print:hidden" onClick={e=>e.stopPropagation()}><input type="checkbox" aria-label={'Select row '+r.id} checked={selectedIds.has(r.id)} onChange={e=>setRowSelection(s=>({...s,[r.id]:e.target.checked}))}/></td>}{r.getVisibleCells().map(c=><td key={c.id} className={cn('h-[52px] px-4 text-[13px]',c.column.columnDef.meta?.align==='center'&&'text-center')}>{flexRender(c.column.columnDef.cell,c.getContext())}</td>)}</tr>):<TableEmptyRow colSpan={visible.length+(complete?1:0)} title={emptyTitle} description={emptyDescription}/>}</tbody></table></div>{pagination&&<DataTablePagination table={table}/>}
 </div>;
}
