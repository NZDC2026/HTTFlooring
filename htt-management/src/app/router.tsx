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
import { InventoryPage } from "../features/inventory/pages/InventoryPage";
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
                element: <PlaceholderPage title="Banking" />,
            },
            {
                path: "accounting",
                element: <PlaceholderPage title="Accounting" />,
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