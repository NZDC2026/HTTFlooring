import { createHashRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
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
                element: <PlaceholderPage title="Contacts" />,
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