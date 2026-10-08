import { createHashRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
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
import { AccountsReceivableGlReconciliationPage } from "../features/accounting/pages/AccountsReceivableGlReconciliationPage";
import { AccountsPayableGlReconciliationPage } from "../features/accounting/pages/AccountsPayableGlReconciliationPage";
import { BankingPage } from "../features/banking/pages/BankingPage";
import { BankAccountDetailPage } from "../features/banking/pages/BankAccountDetailPage";
import { CreateBankTransactionPage } from "../features/banking/pages/CreateBankTransactionPage";
import { CreateBankTransferPage } from "../features/banking/pages/CreateBankTransferPage";
import { BankReconciliationPage } from "../features/banking/pages/BankReconciliationPage";
import { PlaceholderPage } from "../layouts/PlaceholderPage";

export const router = createHashRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: "dashboard",
                element: <DashboardPage />,
            },
            {
                path: "sales",
                element: <PlaceholderPage title="Sales" />,
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
                element: <PlaceholderPage title="Payroll" />,
            },
            {
                path: "reports",
                element: <AgedReceivablesPage />,
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
                element: <PlaceholderPage title="Documents" />,
            },
            {
                path: "settings",
                element: <PlaceholderPage title="Settings" />,
            },
        ],
    },
]);