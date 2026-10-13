import { Link } from "react-router-dom";
import {
    AlertTriangle,
    CircleDollarSign,
    PackageSearch,
} from "lucide-react";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

const tasks = [
    {
        title: "4 overdue invoices",
        description: "$6,520 requires follow-up",
        icon: CircleDollarSign,
        type: "danger",
        path: "/sales",
    },
    {
        title: "18 bank transactions",
        description: "Waiting for reconciliation",
        icon: AlertTriangle,
        type: "warning",
        path: "/banking",
    },
    {
        title: "7 products low in stock",
        description: "Inventory requires attention",
        icon: PackageSearch,
        type: "neutral",
        path: "/inventory",
    },
];

export function TasksCard() {
    return (
        <Card>
            <CardContent>
                <h2 className="font-display text-xl">
                    Tasks &amp; Alerts
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Items requiring your attention
                </p>

                <div className="mt-5 divide-y divide-[var(--color-border)]">
                    {tasks.map((task) => {
                        const Icon = task.icon;

                        return (
                            <Link
                                to={task.path}
                                key={task.title}
                                className="flex w-full items-center gap-3 py-3 text-left"
                            >
                                <div
                                    className={
                                        task.type === "danger"
                                            ? "flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
                                            : task.type === "warning"
                                                ? "flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
                                                : "flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                                    }
                                >
                                    <Icon size={15} />
                                </div>

                                <div>
                                    <div className="text-xs font-medium">
                                        {task.title}
                                    </div>

                                    <div className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                                        {task.description}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}