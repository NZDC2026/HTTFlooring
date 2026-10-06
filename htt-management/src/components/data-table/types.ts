export interface DataTableSearchConfig<TData> {
    placeholder?: string;
    filterFn?: (row: TData, query: string) => boolean;
}

export interface DataTablePaginationConfig {
    pageSize?: number;
}