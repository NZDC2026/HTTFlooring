import type { ReactNode } from 'react';
import type { RowData } from '@tanstack/react-table';
import type { Permission } from '../../features/security/rbac';
import type { ExportCell } from './tableExport';
declare module '@tanstack/react-table' {interface ColumnMeta<TData extends RowData,TValue>{exportable?:boolean;exportLabel?:string;exportValue?:(row:TData)=>ExportCell;valueType?:TValue;}}
export interface DataTableSearchConfig<TData>{placeholder?:string;filterFn?:(row:TData,query:string)=>boolean;}
export interface DataTablePaginationConfig{pageSize?:number;}
export interface DataTableCapabilities<TData>{id:string;scope:'complete'|'summary';permission:Permission;rowId:(row:TData)=>string;selectionActions?:(rows:TData[])=>ReactNode;}
