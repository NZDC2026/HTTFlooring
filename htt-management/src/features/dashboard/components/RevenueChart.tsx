import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import { financialChartData } from "../data/mockDashboard";

function formatMoney(value: number) {
    return `$${Math.round(value / 1000)}k`;
}

export function RevenueChart() {
    return (
        <Card>
            <CardContent>
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="font-display text-xl">
                            Revenue &amp; Expenses
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Monthly financial performance
                        </p>
                    </div>

                    <div className="flex gap-4 text-xs">
                        <Legend
                            color="#12352d"
                            label="Revenue"
                        />

                        <Legend
                            color="#b96d3a"
                            label="Expenses"
                        />
                    </div>
                </div>

                <div className="mt-6 h-[260px]">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <AreaChart
                            data={financialChartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -15,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="revenueGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#12352d"
                                        stopOpacity={0.18}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#12352d"
                                        stopOpacity={0}
                                    />
                                </linearGradient>

                                <linearGradient
                                    id="expenseGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#b96d3a"
                                        stopOpacity={0.14}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#b96d3a"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                vertical={false}
                                stroke="#e7e2da"
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#92968f",
                                    fontSize: 11,
                                }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatMoney}
                                tick={{
                                    fill: "#92968f",
                                    fontSize: 11,
                                }}
                            />

                            <Tooltip
                                formatter={(value) =>
                                    typeof value === "number"
                                        ? `$${value.toLocaleString()}`
                                        : value
                                }
                                contentStyle={{
                                    border: "1px solid #ddd7cd",
                                    borderRadius: "8px",
                                    boxShadow:
                                        "0 4px 12px rgba(25,31,27,.08)",
                                    fontSize: "12px",
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#12352d"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />

                            <Area
                                type="monotone"
                                dataKey="expenses"
                                stroke="#b96d3a"
                                strokeWidth={2}
                                fill="url(#expenseGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

function Legend({
    color,
    label,
}: {
    color: string;
    label: string;
}) {
    return (
        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
            />

            {label}
        </div>
    );
}