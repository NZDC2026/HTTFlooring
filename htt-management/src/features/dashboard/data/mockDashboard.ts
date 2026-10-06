export interface DashboardMetric {
    label: string;
    value: string;
    change: number;
    description: string;
}

export interface MonthlyFinancialData {
    month: string;
    revenue: number;
    expenses: number;
}

export interface DashboardTransaction {
    id: string;
    date: string;
    reference: string;
    contact: string;
    type:
    | "Invoice"
    | "Payment"
    | "Bill"
    | "Purchase";
    amount: number;
    status:
    | "Paid"
    | "Sent"
    | "Overdue"
    | "Pending";
}

export const dashboardMetrics: DashboardMetric[] = [
    {
        label: "Revenue",
        value: "$284,920",
        change: 12.4,
        description: "Compared with last month",
    },
    {
        label: "Expenses",
        value: "$168,430",
        change: -3.2,
        description: "Compared with last month",
    },
    {
        label: "Net Profit",
        value: "$116,490",
        change: 18.7,
        description: "Compared with last month",
    },
    {
        label: "Cash Balance",
        value: "$428,300",
        change: 6.8,
        description: "Across connected accounts",
    },
];

export const financialChartData: MonthlyFinancialData[] = [
    {
        month: "May",
        revenue: 186000,
        expenses: 128000,
    },
    {
        month: "Jun",
        revenue: 218000,
        expenses: 142000,
    },
    {
        month: "Jul",
        revenue: 205000,
        expenses: 151000,
    },
    {
        month: "Aug",
        revenue: 246000,
        expenses: 158000,
    },
    {
        month: "Sep",
        revenue: 254000,
        expenses: 164000,
    },
    {
        month: "Oct",
        revenue: 284920,
        expenses: 168430,
    },
];

export const recentTransactions: DashboardTransaction[] = [
    {
        id: "1",
        date: "06 Oct 2026",
        reference: "INV-10241",
        contact: "ABC Flooring",
        type: "Invoice",
        amount: 4820,
        status: "Sent",
    },
    {
        id: "2",
        date: "06 Oct 2026",
        reference: "PAY-00842",
        contact: "Oak Living",
        type: "Payment",
        amount: 8400,
        status: "Paid",
    },
    {
        id: "3",
        date: "05 Oct 2026",
        reference: "INV-10240",
        contact: "Floor Plus",
        type: "Invoice",
        amount: 6120,
        status: "Paid",
    },
    {
        id: "4",
        date: "04 Oct 2026",
        reference: "INV-10239",
        contact: "Urban Floors",
        type: "Invoice",
        amount: 2120,
        status: "Overdue",
    },
    {
        id: "5",
        date: "04 Oct 2026",
        reference: "BILL-0412",
        contact: "Timber Supply Co.",
        type: "Bill",
        amount: 12680,
        status: "Pending",
    },
    {
        id: "6",
        date: "03 Oct 2026",
        reference: "PAY-00841",
        contact: "Melbourne Interiors",
        type: "Payment",
        amount: 9340,
        status: "Paid",
    },
    {
        id: "7",
        date: "02 Oct 2026",
        reference: "INV-10238",
        contact: "Living Spaces",
        type: "Invoice",
        amount: 3760,
        status: "Sent",
    },
    {
        id: "8",
        date: "01 Oct 2026",
        reference: "PO-00592",
        contact: "Natural Timber Co.",
        type: "Purchase",
        amount: 18200,
        status: "Pending",
    },
];