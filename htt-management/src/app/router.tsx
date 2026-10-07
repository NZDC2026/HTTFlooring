import { createHashRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { CustomersPage } from "../features/contacts/pages/CustomersPage";
import { CustomerDetailPage } from "../features/contacts/pages/CustomerDetailPage";
import { CustomerFormPage } from "../features/contacts/pages/CustomerFormPage";
import { QuoteDetailPage } from "../features/sales/pages/QuoteDetailPage";
import { SalesOrderDetailPage } from "../features/sales/pages/SalesOrderDetailPage";
import { InvoiceDetailPage } from "../features/sales/pages/InvoiceDetailPage";
import { CustomerStatementPage } from "../features/sales/pages/CustomerStatementPage";
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
                path: "sales/statements/:customerId",
                element: <CustomerStatementPage />,
            },
            {
                path: "purchases",
                element: <PlaceholderPage title="Purchases" />,
            },
            {
                path: "inventory",
                element: <PlaceholderPage title="Inventory" />,
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
                element: <PlaceholderPage title="Reports" />,
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