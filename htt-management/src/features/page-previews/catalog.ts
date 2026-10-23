// Current local management routes. Legacy field examples live in legacyCatalog.ts and are not production configuration.
import type {Permission} from '../security/rbac';
export const previewModules = [
  {
    "id": "products",
    "title": "Products & services",
    "group": "Inventory & pricing",
    "path": "/inventory/products",
    "permission": "inventory.read",
    "description": "Local product catalogue, units, prices and stock policies."
  },
  {
    "id": "promotions",
    "title": "Scheduled promotions",
    "group": "Inventory & pricing",
    "path": "/inventory/promotions",
    "permission": "inventory.read",
    "description": "Plan customer and product specials with explicit start and end times."
  },
  {
    "id": "tax-codes",
    "title": "Tax codes",
    "group": "Accounting",
    "path": "/accounting/tax-codes",
    "permission": "accounting.read",
    "description": "Review GST codes, inclusive/exclusive calculation and reporting mappings."
  },
  {
    "id": "linked-accounts",
    "title": "Linked accounts",
    "group": "Accounting",
    "path": "/accounting/linked-accounts",
    "permission": "accounting.read",
    "description": "Maintain protected posting-account mappings used by the local accounting engine."
  },
  {
    "id": "jobs",
    "title": "Jobs & projects",
    "group": "Accounting",
    "path": "/accounting/jobs",
    "permission": "accounting.read",
    "description": "Track project budgets, allocate posted revenue and costs, and compare actual profitability."
  },
  {
    "id": "bank-accounts",
    "title": "Bank account setup",
    "group": "Banking",
    "path": "/banking/setup/accounts",
    "permission": "banking.read",
    "description": "Maintain local bank accounts and ledger links; bank feeds are external and not connected."
  },
  {
    "id": "bank-rules",
    "title": "Bank rules",
    "group": "Banking",
    "path": "/banking/rules",
    "permission": "banking.read",
    "description": "Compound rules, priority/conflict review and local import classification; posting is separate."
  },
  {
    "id": "payment-batches",
    "title": "Electronic payment batches",
    "group": "Banking",
    "path": "/banking/payment-batches",
    "permission": "banking.read",
    "description": "Reviewed local supplier payment batches; CommBiz ABA instruction files use their separate approval register."
  },
  {
    "id": "pay-items",
    "title": "Pay items",
    "group": "Payroll",
    "path": "/payroll/pay-items",
    "permission": "payroll.read",
    "description": "Australian local payroll earnings, deductions, leave and employer contributions."
  },
  {
    "id": "filing",
    "title": "Payroll filing",
    "group": "Payroll",
    "path": "/payroll/filing",
    "permission": "payroll.read",
    "description": "Australian payroll filing preparation and local validation; no ATO/STP transmission."
  },
  {
    "id": "recurring",
    "title": "Recurring transactions",
    "group": "Automation & tasks",
    "path": "/automation/recurring",
    "permission": "inventory.read",
    "description": "Local due-date scanning and error recovery; generates drafts for normal approval."
  },
  {
    "id": "tasks",
    "title": "Tasks & action centre",
    "group": "Automation & tasks",
    "path": "/tasks",
    "permission": "sales.read",
    "description": "Maintain local tasks, owners and due dates with audited completion and reopening."
  },
  {
    "id": "visits",
    "title": "Sales visits & activity",
    "group": "Automation & tasks",
    "path": "/sales/activity",
    "permission": "sales.read",
    "description": "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks."
  },
  {
    "id": "draft-review",
    "title": "Customer & contact review",
    "group": "Automation & tasks",
    "path": "/contacts/review",
    "permission": "sales.read",
    "description": "Review local customer, branch and contact drafts, compare duplicates and approve or link real records."
  },
  {
    "id": "templates",
    "title": "PDF & email templates",
    "group": "Documents & imports",
    "path": "/documents/templates",
    "permission": "accounting.read",
    "description": "Plain-text document templates used by versioned local sales and purchase output."
  },
  {
    "id": "custom-reports",
    "title": "Saved & favourite reports",
    "group": "Reports",
    "path": "/reports/saved",
    "permission": "accounting.read",
    "description": "Save explicit filters and ordered columns, run local data and export complete results."
  },
  {
    "id": "report-packs",
    "title": "Report packs",
    "group": "Reports",
    "path": "/reports/packs",
    "permission": "accounting.read",
    "description": "Generate combined financial reports from current local books, with ordered sections and printable exports."
  }
] as const;
export const previewGroups=[...new Set(previewModules.map(m=>m.group)), 'Sales & purchases','Settings'];
export const settingsForms:Record<string,{title:string;path:string;permission:Permission;description:string}>={
 business:{title:'Financial year, GST & branding',path:'/settings/financial',permission:'accounting.read',description:'Local business, tax, numbering and immutable PNG branding.'},
 sales:{title:'Sales settings',path:'/settings/sales',permission:'accounting.read',description:'Local sales numbering and defaults; external email and online payment are not connected.'},
 purchases:{title:'Purchase settings',path:'/settings/purchases',permission:'purchases.read',description:'Local purchase terms and payment preferences for new documents.'},
 payroll:{title:'Payroll settings',path:'/settings/payroll',permission:'payroll.read',description:'Australian local payroll settings; no electronic tax filing.'},
 reports:{title:'Report settings',path:'/settings/reports',permission:'accounting.read',description:'Supported report defaults and frozen output presentation.'},
};
export const flowPages = [
 ['sales-order', '/sales/drafts/orders/new', 'New sales order', 'Sales & purchases', 'sales.read'],
 ['sales-order-edit', '/sales/drafts/orders/:previewId/edit', 'Edit sales order draft', 'Sales & purchases', 'sales.read'],
 ['invoice', '/sales/drafts/invoices/new', 'New invoice draft', 'Sales & purchases', 'sales.read'],
 ['invoice-edit', '/sales/drafts/invoices/:previewId/edit', 'Edit invoice draft', 'Sales & purchases', 'sales.read'],
 ['bill', '/purchases/expense-bills/new', 'New expense / service bill', 'Sales & purchases', 'purchases.read'],
 ['bill-edit', '/purchases/expense-bills/:previewId/edit', 'Edit expense bill draft', 'Sales & purchases', 'purchases.read'],
 ['receipts', '/sales/receipts', 'Customer receipts', 'Sales & purchases', 'sales.read'],
 ['receipt-new', '/sales/receipts/new', 'Allocate customer receipt', 'Sales & purchases', 'sales.read'],
 ['receipt-detail', '/sales/receipts/:previewId', 'Customer receipt detail', 'Sales & purchases', 'sales.read'],
 ['customer-refunds', '/sales/refunds', 'Customer refunds', 'Sales & purchases', 'sales.read'],
 ['customer-refund-new', '/sales/refunds/new', 'New customer refund', 'Sales & purchases', 'sales.read'],
 ['customer-refund-detail', '/sales/refunds/:previewId', 'Customer refund detail', 'Sales & purchases', 'sales.read'],
 ['supplier-refunds', '/purchases/refunds', 'Supplier refunds', 'Sales & purchases', 'purchases.read'],
 ['supplier-refund-new', '/purchases/refunds/new', 'New supplier refund', 'Sales & purchases', 'purchases.read'],
 ['supplier-refund-detail', '/purchases/refunds/:previewId', 'Supplier refund detail', 'Sales & purchases', 'purchases.read'],
 ['recycle-bin', '/sales/recycle-bin', 'Document recycle bin', 'Sales & purchases', 'inventory.read'],
 ['bank-import', '/banking/import', 'Import bank statement', 'Banking', 'banking.read'],
 ['bank-instructions', '/banking/instruction-files', 'Bank instruction files', 'Banking', 'banking.read'],
 ['bank-workbench', '/banking/workbench', 'Categorise, match & split', 'Banking', 'banking.read'],
 ['opening-balances', '/accounting/opening-balances', 'Opening balances', 'Accounting', 'accounting.read'],
 ['cash-flow', '/reports/cash-flow', 'Cash flow', 'Reports', 'accounting.read'],
 ['sales-report', '/reports/sales-analysis', 'Sales analysis', 'Reports', 'sales.read'],
 ['purchases-report', '/reports/purchase-analysis', 'Purchase analysis', 'Reports', 'purchases.read'],
 ['payroll-report', '/reports/payroll-summary', 'Payroll summary', 'Reports', 'payroll.read'],
 ['banking-report', '/reports/banking-summary', 'Banking summary', 'Reports', 'banking.read'],
 ['import-export', '/tools/import-export', 'Data import & export', 'Documents & imports', 'inventory.read'],
 ['delivery', '/documents/delivery', 'Sales document preparation', 'Documents & imports', 'sales.read'],
 ['attachments', '/documents/attachments', 'Business attachments', 'Documents & imports', 'inventory.read'],
 ['ocr', '/documents/capture', 'Supplier document capture & review', 'Documents & imports', 'purchases.read'],
 ['entity-search', '/search/records', 'Business record search', 'Automation & tasks', 'inventory.read'],
] as const;
