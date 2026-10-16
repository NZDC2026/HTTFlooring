import { WorkspaceSearchPage, HelpPage, NotificationsPage } from '../layouts/WorkspaceUtilityPages';
import { EmployeesPage, EmployeeDetailPage, EmployeeFormPage, PayRunsPage, PayRunFormPage, PayRunDetailPage, PayslipPage, TimesheetsPage, LeavePage } from '../features/payroll/pages/PayrollWorkspacePages';
import { DocumentUploadPage, DocumentDetailPage } from '../features/documents/pages/DocumentWorkspacePages';
import { ReportsLibraryPage } from '../features/reports/pages/ReportsLibraryPage';
import { NotFoundPage } from '../layouts/NotFoundPage';
import { AccountingPeriodsPage } from '../features/accounting/pages/AccountingPeriodsPage';
import { SecurityAdministrationPage } from "../features/security/pages/SecurityAdministrationPage";
import { createHashRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { CustomerDemoPage } from "../features/demo/pages/CustomerDemoPage";
import { SalesOverviewPage } from "../features/sales/pages/SalesOverviewPage";
import { CustomersPage } from "../features/contacts/pages/CustomersPage";
import { CustomerDetailPage } from "../features/contacts/pages/CustomerDetailPage";
import { CustomerFormPage } from "../features/contacts/pages/CustomerFormPage";
import { SuppliersPage } from "../features/contacts/pages/SuppliersPage";
import { SupplierDetailPage } from "../features/contacts/pages/SupplierDetailPage";
import { SupplierFormPage } from "../features/contacts/pages/SupplierFormPage";
import { QuoteDetailPage } from "../features/sales/pages/QuoteDetailPage";
import { SalesOrderDetailPage } from "../features/sales/pages/SalesOrderDetailPage";
import { InvoiceDetailPage } from "../features/sales/pages/InvoiceDetailPage";
import { CustomerStatementPage } from "../features/sales/pages/CustomerStatementPage";
import { CreditNoteDetailPage } from "../features/sales/pages/CreditNoteDetailPage";
import { AgedReceivablesPage } from "../features/reports/pages/AgedReceivablesPage";
import { PurchaseAccountingReconciliationPage } from "../features/purchases/pages/PurchaseAccountingReconciliationPage";
import { PurchasePostingAuditPage } from "../features/purchases/pages/PurchasePostingAuditPage";
import { GrniOutstandingReportPage } from "../features/purchases/pages/GrniOutstandingReportPage";
import { AgedPayablesPage } from "../features/reports/pages/AgedPayablesPage";
import { PurchaseOrdersPage } from "../features/purchases/pages/PurchaseOrdersPage";
import { PurchaseOrderFormPage } from "../features/purchases/pages/PurchaseOrderFormPage";
import { PurchaseOrderDetailPage } from "../features/purchases/pages/PurchaseOrderDetailPage";
import { ReceiveGoodsPage } from "../features/purchases/pages/ReceiveGoodsPage";
import { GoodsReceiptDetailPage } from "../features/purchases/pages/GoodsReceiptDetailPage";
import { CreateSupplierBillPage } from "../features/purchases/pages/CreateSupplierBillPage";
import { SupplierBillDetailPage } from "../features/purchases/pages/SupplierBillDetailPage";
import { AccountsPayablePage } from "../features/purchases/pages/AccountsPayablePage";
import { CreateSupplierPaymentPage } from "../features/purchases/pages/CreateSupplierPaymentPage";
import { SupplierPaymentDetailPage } from "../features/purchases/pages/SupplierPaymentDetailPage";
import { SupplierStatementPage } from "../features/purchases/pages/SupplierStatementPage";
import { AccountsPayableReconciliationPage } from "../features/purchases/pages/AccountsPayableReconciliationPage";
import { CreateSupplierCreditPage } from "../features/purchases/pages/CreateSupplierCreditPage";
import { SupplierCreditDetailPage } from "../features/purchases/pages/SupplierCreditDetailPage";
import { InventoryPage } from "../features/inventory/pages/InventoryPage";
import { InventoryValuationPage } from "../features/inventory/pages/InventoryValuationPage";
import { InventoryGlReconciliationPage } from "../features/inventory/pages/InventoryGlReconciliationPage";
import { ChartOfAccountsPage } from "../features/accounting/pages/ChartOfAccountsPage";
import { AccountFormPage } from "../features/accounting/pages/AccountFormPage";
import { JournalRegisterPage } from "../features/accounting/pages/JournalRegisterPage";
import { JournalEntryDetailPage } from "../features/accounting/pages/JournalEntryDetailPage";
import { CreateManualJournalPage } from "../features/accounting/pages/CreateManualJournalPage";
import { TrialBalancePage } from "../features/accounting/pages/TrialBalancePage";
import { GeneralLedgerReportPage } from "../features/accounting/pages/GeneralLedgerReportPage";
import { ProfitAndLossPage } from "../features/accounting/pages/ProfitAndLossPage";
import { BalanceSheetPage } from "../features/accounting/pages/BalanceSheetPage";
import { FinanceControlsPage } from "../features/accounting/pages/FinanceControlsPage";
import { FinancialRecoveryReviewPage } from "../features/accounting/pages/FinancialRecoveryReviewPage";
import { AccountsReceivableGlReconciliationPage } from "../features/accounting/pages/AccountsReceivableGlReconciliationPage";
import { AccountsPayableGlReconciliationPage } from "../features/accounting/pages/AccountsPayableGlReconciliationPage";
import { BankingPage } from "../features/banking/pages/BankingPage";
import { BankAccountDetailPage } from "../features/banking/pages/BankAccountDetailPage";
import { CreateBankTransactionPage } from "../features/banking/pages/CreateBankTransactionPage";
import { CreateBankTransferPage } from "../features/banking/pages/CreateBankTransferPage";
import { BankReconciliationPage } from "../features/banking/pages/BankReconciliationPage";
import { PayrollOverviewPage } from "../features/payroll/pages/PayrollOverviewPage";
import { DocumentsOverviewPage } from "../features/documents/pages/DocumentsOverviewPage";
import { SettingsOverviewPage } from "../features/settings/pages/SettingsOverviewPage";

export const router = createHashRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { path: 'search', element: <WorkspaceSearchPage /> },
            { path: 'help', element: <HelpPage /> },
            { path: 'notifications', element: <NotificationsPage /> },
            { path: 'payroll/employees', element: <EmployeesPage /> },
            { path: 'payroll/employees/new', element: <EmployeeFormPage /> },
            { path: 'payroll/employees/:employeeId', element: <EmployeeDetailPage /> },
            { path: 'payroll/employees/:employeeId/edit', element: <EmployeeFormPage /> },
            { path: 'payroll/pay-runs', element: <PayRunsPage /> },
            { path: 'payroll/pay-runs/new', element: <PayRunFormPage /> },
            { path: 'payroll/pay-runs/:runId', element: <PayRunDetailPage /> },
            { path: 'payroll/pay-runs/:runId/payslips/:employeeId', element: <PayslipPage /> },
            { path: 'payroll/timesheets', element: <TimesheetsPage /> },
            { path: 'payroll/leave', element: <LeavePage /> },
            { path: 'documents/upload', element: <DocumentUploadPage /> },
            { path: 'documents/:documentId', element: <DocumentDetailPage /> },
            { path: 'settings/preferences', element: <SettingsOverviewPage key="preferences" /> },
            { path: 'settings/roles', element: <SettingsOverviewPage key="roles" /> },
            { path: 'settings/integrations', element: <SettingsOverviewPage key="integrations" /> },
            { path: 'settings/integrations/:integrationId', element: <SettingsOverviewPage key="integration-detail" /> },
            { path: 'reports/library', element: <ReportsLibraryPage /> },
            { path: '*', element: <NotFoundPage /> },
            { path: "settings/security", element: <SecurityAdministrationPage /> },
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: "dashboard",
                element: <DashboardPage />,
            },
            {
                path: "demo",
                element: <CustomerDemoPage />,
            },
            {
                path: "sales",
                element: <SalesOverviewPage />,
            },
            {
                path: "sales/quotes/:quoteId",
                element: <QuoteDetailPage />,
            },
            {
                path: "sales/orders/:orderId",
                element: <SalesOrderDetailPage />,
            },
            {
                path: "sales/invoices/:invoiceId",
                element: <InvoiceDetailPage />,
            },
            {
                path: "sales/credit-notes/:creditNoteId",
                element: <CreditNoteDetailPage />,
            },
            {
                path: "sales/statements/:customerId",
                element: <CustomerStatementPage />,
            },
            {
                path: "purchases",
                element: <PurchaseOrdersPage />,
            },
            {
                path: "purchases/new",
                element: (
                    <PurchaseOrderFormPage mode="create" />
                ),
            },
            {
                path: "purchases/bills/:supplierBillId",
                element: (
                    <SupplierBillDetailPage />
                ),
            },
            {
                path: "purchases/credits/new",
                element: (
                    <CreateSupplierCreditPage />
                ),
            },
            {
                path: "purchases/credits/:supplierCreditId",
                element: (
                    <SupplierCreditDetailPage />
                ),
            },
            {
                path: "purchases/goods-receipts/:goodsReceiptId",
                element: <GoodsReceiptDetailPage />,
            },
            {
                path: "purchases/:purchaseOrderId/receive",
                element: <ReceiveGoodsPage />,
            },
            {
                path: "purchases/:purchaseOrderId/bill",
                element: (
                    <CreateSupplierBillPage />
                ),
            },
            {
                path: "purchases/:purchaseOrderId/edit",
                element: (
                    <PurchaseOrderFormPage mode="edit" />
                ),
            },
            {
                path: "purchases/payments/new",
                element: (
                    <CreateSupplierPaymentPage />
                ),
            },
            {
                path: "purchases/payments/:supplierPaymentId",
                element: (
                    <SupplierPaymentDetailPage />
                ),
            },
            {
                path: "purchases/statements/:supplierId",
                element: (
                    <SupplierStatementPage />
                ),
            },
            {
                path: "purchases/payables/reconciliation",
                element: (
                    <AccountsPayableReconciliationPage />
                ),
            },
            {
                path: "purchases/payables",
                element: (
                    <AccountsPayablePage />
                ),
            },
            {
                path: "purchases/:purchaseOrderId",
                element: <PurchaseOrderDetailPage />,
            },
            {
                path: "inventory",
                element: <InventoryPage />,
            },
            {
                path: "inventory/valuation",
                element: (
                    <InventoryValuationPage />
                ),
            },
            {
                path: "inventory/reconciliation",
                element: (
                    <InventoryGlReconciliationPage />
                ),
            },
            {
                path: "banking",
                element: (
                    <BankingPage />
                ),
            },
            {
                path: "banking/accounts/:bankAccountId",
                element: (
                    <BankAccountDetailPage />
                ),
            },
            {
                path: "banking/transactions/new",
                element: (
                    <CreateBankTransactionPage />
                ),
            },
            {
                path: "banking/transfers/new",
                element: (
                    <CreateBankTransferPage />
                ),
            },
            {
                path: "banking/accounts/:bankAccountId/reconcile",
                element: (
                    <BankReconciliationPage />
                ),
            },
            {
                path: "accounting/periods",
                element: <AccountingPeriodsPage />,
            },
            {
                path: "accounting",
                element: (
                    <ChartOfAccountsPage />
                ),
            },
            {
                path: "accounting/accounts/new",
                element: (
                    <AccountFormPage mode="create" />
                ),
            },
            {
                path: "accounting/accounts/:accountId/edit",
                element: (
                    <AccountFormPage mode="edit" />
                ),
            },
            {
                path: "accounting/journals",
                element: (
                    <JournalRegisterPage />
                ),
            },
            {
                path: "accounting/journals/new",
                element: (
                    <CreateManualJournalPage />
                ),
            },
            {
                path: "accounting/journals/:journalEntryId",
                element: (
                    <JournalEntryDetailPage />
                ),
            },
            {
                path: "accounting/trial-balance",
                element: (
                    <TrialBalancePage />
                ),
            },
            {
                path: "accounting/general-ledger",
                element: (
                    <GeneralLedgerReportPage />
                ),
            },
            {
                path: "accounting/profit-and-loss",
                element: (
                    <ProfitAndLossPage />
                ),
            },
            {
                path: "accounting/balance-sheet",
                element: (
                    <BalanceSheetPage />
                ),
            },
            { path: "accounting/financial-recovery", element: <FinancialRecoveryReviewPage /> },
            {
                path: "accounting/finance-controls",
                element: (
                    <FinanceControlsPage />
                ),
            },
            {
                path: "accounting/reconciliation/ar",
                element: (
                    <AccountsReceivableGlReconciliationPage />
                ),
            },
            {
                path: "accounting/reconciliation/ap",
                element: (
                    <AccountsPayableGlReconciliationPage />
                ),
            },
            {
                path: "payroll",
                element: <PayrollOverviewPage />,
            },
            {
                path: "reports",
                element: <AgedReceivablesPage />,
            },
            {
                path: "reports/purchase-accounting-reconciliation",
                element: <PurchaseAccountingReconciliationPage />,
            },
            {
                path: "reports/purchase-posting-audit",
                element: <PurchasePostingAuditPage />,
            },
            {
                path: "reports/grni-outstanding",
                element: <GrniOutstandingReportPage />,
            },
            {
                path: "reports/aged-payables",
                element: (
                    <AgedPayablesPage />
                ),
            },
            {
                path: "contacts",
                element: <CustomersPage />,
            },
            {
                path: "contacts/customers/new",
                element: (
                    <CustomerFormPage mode="create" />
                ),
            },
            {
                path: "contacts/customers/:customerId/edit",
                element: (
                    <CustomerFormPage mode="edit" />
                ),
            },
            {
                path: "contacts/customers/:customerId",
                element: <CustomerDetailPage />,
            },
            {
                path: "contacts/customers/:customerId/locations",
                element: <CustomerDetailPage />,
            },
            {
                path: "contacts/customers/:customerId/contacts",
                element: <CustomerDetailPage />,
            },
            {
                path: "contacts/customers/:customerId/pricing",
                element: <CustomerDetailPage />,
            },
            {
                path: "contacts/customers/:customerId/sales",
                element: <CustomerDetailPage />,
            },
            {
                path: "contacts/customers/:customerId/activity",
                element: <CustomerDetailPage />,
            },
            {
                path: "contacts/suppliers",
                element: <SuppliersPage />,
            },
            {
                path: "contacts/suppliers/new",
                element: (
                    <SupplierFormPage mode="create" />
                ),
            },
            {
                path: "contacts/suppliers/:supplierId/edit",
                element: (
                    <SupplierFormPage mode="edit" />
                ),
            },
            {
                path: "contacts/suppliers/:supplierId",
                element: <SupplierDetailPage />,
            },
            {
                path: "documents",
                element: <DocumentsOverviewPage />,
            },
            {
                path: "settings",
                element: <SettingsOverviewPage />,
            },
        ],
    },
]);