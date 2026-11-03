import { businessSettings } from '../../business-workspace/configurationState';
import { useFinanceOverview } from "../data/useFinanceOverview";
import { OutstandingAgeingCard } from "./ReceivablesCard";

export function PayablesCard() {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: businessSettings().timezone });
    const data = useFinanceOverview(today);
    return <OutstandingAgeingCard title="Accounts Payable" description="Outstanding supplier bills" total={data.payables} overdueCount={data.overdueBillCount} ageing={data.payableAgeing}/>;
}
