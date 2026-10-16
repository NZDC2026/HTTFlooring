import { useState } from 'react';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Panel, Field, SampleTable, Cell, fieldClass } from '../prototype/PrototypeUI';
import { salesRepository } from '../sales/data/salesRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { businessDateKey, fiscalYearStart } from '../../lib/businessDate';
import { Link } from 'react-router-dom';
export function documentTaxSummary(input: {
    id: string;
    date: string;
    voidedAt?: string;
    void: boolean;
    kind: 'Sales' | 'Purchases';
    credit: boolean;
    lines: {
        taxCode?: string;
        taxReport?: string;
        lineSubtotal: number;
        taxAmount: number;
    }[];
}[], from: string, to: string) {
    const groups = new Map<string, {
        mapping: string;
        netSales: number;
        outputTax: number;
        netPurchases: number;
        inputTax: number;
    }>();
    for (const d of input) {
        const events = [{ date: d.date, sign: d.credit ? -1 : 1 }, ...(d.void && d.voidedAt ? [{ date: businessDateKey(d.voidedAt), sign: d.credit ? 1 : -1 }] : [])];
        if (d.void && !d.voidedAt)
            continue;
        for (const e of events) {
            if (e.date < from || e.date > to)
                continue;
            for (const line of d.lines) {
                const mapping = line.taxReport ?? ('Legacy / ' + (line.taxCode ?? 'unmapped')), row = groups.get(mapping) ?? { mapping, netSales: 0, outputTax: 0, netPurchases: 0, inputTax: 0 };
                if (d.kind === 'Sales') {
                    row.netSales += e.sign * line.lineSubtotal;
                    row.outputTax += e.sign * line.taxAmount;
                }
                else {
                    row.netPurchases += e.sign * line.lineSubtotal;
                    row.inputTax += e.sign * line.taxAmount;
                }
                groups.set(mapping, row);
            }
        }
    }
    return [...groups.values()].map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'number' ? Math.round((v + Number.EPSILON) * 100) / 100 : v])) as unknown as {
        mapping: string;
        netSales: number;
        outputTax: number;
        netPurchases: number;
        inputTax: number;
    });
}
export function TaxSummaryPage() {
    const today = businessDateKey(new Date().toISOString()), [from, setFrom] = useState(fiscalYearStart(today)), [to, setTo] = useState(today);
    const documents = [...salesRepository.getAll().filter(d => d.type === 'INVOICE' && d.status !== 'DRAFT').map(d => ({ id: d.id, date: d.documentDate, voidedAt: 'voidedAt' in d ? d.voidedAt : undefined, void: d.status === 'VOID', kind: 'Sales' as const, credit: false, lines: d.lines })), ...creditNoteRepository.getAll().filter(d => d.status !== 'DRAFT').map(d => ({ id: d.id, date: d.creditDate, voidedAt: d.voidedAt, void: d.status === 'VOID', kind: 'Sales' as const, credit: true, lines: d.lines })), ...supplierBillRepository.getAll().map(d => ({ id: d.id, date: d.billDate, voidedAt: d.voidedAt, void: d.status === 'VOID', kind: 'Purchases' as const, credit: false, lines: d.lines })), ...supplierCreditRepository.getAll().map(d => ({ id: d.id, date: d.creditDate, voidedAt: d.voidedAt, void: d.status === 'VOID', kind: 'Purchases' as const, credit: true, lines: d.lines }))];
    const rows = documentTaxSummary(documents, from, to);
    return <BusinessFrame title="Document tax summary"><Panel title="Accrual document tax"><p className="text-sm">Grouped by the report mapping saved on document lines. Includes invoices, bills, credits and dated void reversals. Opening balances do not recognize tax again. This is a document-tax working paper; bank categorisations and manual tax journals are reviewed separately in the general ledger. No statutory return is filed.</p><div className="grid gap-4 md:grid-cols-2"><Field label="From"><input className={fieldClass} type="date" value={from} onChange={e => setFrom(e.target.value)}/></Field><Field label="To"><input className={fieldClass} type="date" value={to} onChange={e => setTo(e.target.value)}/></Field></div>{from > to ? <p role="alert">From date must not exceed To date.</p> : <SampleTable headers={['Report mapping', 'Net sales', 'Output tax', 'Net purchases', 'Input tax']} empty={!rows.length}>{rows.map(r => <tr key={r.mapping}><Cell>{r.mapping}</Cell><Cell>{r.netSales.toFixed(2)}</Cell><Cell>{r.outputTax.toFixed(2)}</Cell><Cell>{r.netPurchases.toFixed(2)}</Cell><Cell>{r.inputTax.toFixed(2)}</Cell></tr>)}</SampleTable>}<Link className="underline" to="/accounting/general-ledger">Review general ledger</Link></Panel></BusinessFrame>;
}
