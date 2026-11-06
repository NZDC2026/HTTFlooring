export const supplierListFilters = ["all", "active", "outstanding", "overdue"] as const;
export type SupplierListFilter = typeof supplierListFilters[number];
export function parseSupplierListFilter(value: string | null): SupplierListFilter {
    return supplierListFilters.find(filter => filter === value) ?? "all";
}
export const supplierFilterLabels: Record<SupplierListFilter,string> = {
    all:"All suppliers", active:"Active suppliers", outstanding:"Outstanding balance", overdue:"Overdue balance",
};
export function filterSupplierRows<T extends {status:string;currentBalance:number;overdueBalance:number}>(rows: readonly T[], filter: SupplierListFilter): T[] {
    return rows.filter(row => filter === "active" ? row.status === "ACTIVE" : filter === "outstanding" ? row.currentBalance > 0 : filter === "overdue" ? row.overdueBalance > 0 : true);
}
