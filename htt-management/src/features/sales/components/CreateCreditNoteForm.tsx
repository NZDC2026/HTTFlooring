import {UserRound,FileText,Package,NotebookPen} from 'lucide-react';
import {DocumentWorkflowCard} from './DocumentWorkflowCard';
import './sales-entry.css';
import './document-entry-unified.css';
import {customerRepository} from '../../contacts/data/customerRepository';
import {businessDateKey} from '../../../lib/businessDate';
import { businessSettings } from '../../business-workspace/configurationState';
import {
    useMemo,
    useState,
} from "react";

import {
    calculateDocumentTotals,

} from "../data/salesCalculations";

import type {
    Invoice,
    SalesDocumentLine,
} from "../types/salesDocument";

export interface CreateCreditNoteValues {
    creditDate: string;
    reason: string;
    lines: SalesDocumentLine[];
}

interface Props {
    readOnlySample?: boolean;
    initialReason?: string;
    initialQuantities?: Record<string,number>;
    invoice: Invoice;

    onCancel: () => void;

    onSubmit: (
        values: CreateCreditNoteValues,
    ) => void;
}

interface CreditLineState {
    line: SalesDocumentLine;
    selected: boolean;
    quantity: number;
}

export function CreateCreditNoteForm({
    invoice,
    readOnlySample=false,
    initialReason='',
    initialQuantities,
    onCancel,
    onSubmit,
}: Props) {
    const [
        creditDate,
        setCreditDate,
    ] = useState(
        getToday(),
    );

    const [
        reason,
        setReason,
    ] = useState(initialReason);

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    const [
        creditLines,
        setCreditLines,
    ] = useState<
        CreditLineState[]
    >(() =>
        invoice.lines.map(
            (line) => ({
                line,
                selected: initialQuantities?Number(initialQuantities[line.id]??0)>0:true,
                quantity: initialQuantities?Math.min(line.quantity,Math.max(0,initialQuantities[line.id]??0)):line.quantity,
            }),
        ),
    );

    const selectedLines =
        useMemo<
            SalesDocumentLine[]
        >(
            () =>
                creditLines
                    .filter(
                        (item) =>
                            item.selected &&
                            item.quantity >
                            0,
                    )
                    .map(
                        (item) => {
                            const quantity =
                                item.quantity;

                            const calculation =
                                previewCreditLine({
                                    lineSubtotal:item.line.lineSubtotal,taxAmount:item.line.taxAmount,sourceQuantity:item.line.quantity,
                                    taxRate: item.line.taxRate ?? (item.line.lineSubtotal ? item.line.taxAmount / item.line.lineSubtotal : 0.1),
                                    quantity,

                                    standardUnitPrice:
                                        item.line
                                            .standardUnitPrice,

                                    unitPrice:
                                        item.line
                                            .unitPrice,
                                });

                            return {
                                ...item.line,

                                quantity,

                                ...calculation,
                            };
                        },
                    ),
            [creditLines],
        );

    const totals =
        useMemo(
            () =>
                calculateDocumentTotals(
                    selectedLines,
                ),
            [selectedLines],
        );

    function updateQuantity(
        index: number,
        quantity: number,
    ) {
        setCreditLines(
            (current) =>
                current.map(
                    (
                        item,
                        itemIndex,
                    ) => {
                        if (
                            itemIndex !==
                            index
                        ) {
                            return item;
                        }

                        const normalized =
                            Math.min(
                                item.line
                                    .quantity,
                                Math.max(
                                    0,
                                    quantity,
                                ),
                            );

                        return {
                            ...item,
                            quantity:
                                normalized,
                            selected:
                                normalized >
                                0,
                        };
                    },
                ),
        );
    }

    function toggleLine(
        index: number,
    ) {
        setCreditLines(
            (current) =>
                current.map(
                    (
                        item,
                        itemIndex,
                    ) =>
                        itemIndex ===
                            index
                            ? {
                                ...item,
                                selected:
                                    !item.selected,
                            }
                            : item,
                ),
        );
    }

    function handleSubmit() {
        if(readOnlySample)return;
        setError(null);

        if (
            !creditDate
        ) {
            setError(
                "Credit date is required.",
            );

            return;
        }

        if (
            creditDate <
            invoice.documentDate
        ) {
            setError(
                "Credit date cannot be earlier than the invoice date.",
            );

            return;
        }

        if (
            reason.trim().length <
            3
        ) {
            setError(
                "Please enter a credit reason.",
            );

            return;
        }

        if (
            selectedLines.length ===
            0
        ) {
            setError(
                "Select at least one invoice line to credit.",
            );

            return;
        }

        onSubmit({
            creditDate,
            reason:
                reason.trim(),
            lines:
                selectedLines,
        });
    }

    const customer=customerRepository.getById(invoice.customerId);
    return <div className="unified-credit-overlay"><div className="unified-credit-dialog sales-entry unified-entry" role="dialog" aria-modal="true" aria-label="Create Credit Note">
      <header className="entry-heading"><div className="entry-breadcrumb">Sales › Credit / Return › New Document</div><h1>Create Credit Note</h1><p>Return products at their original invoice prices. Inherited discounts are read-only and already included.</p></header>
      <nav className="entry-type-tabs"><span>Original Invoice</span><span className="active">Credit / Return</span><span>Apply to Invoice</span></nav>
      {error&&<p role="alert" className="entry-error">{error}</p>}
      {readOnlySample&&<p className="entry-sample">Sample · Read-only Credit / Return editor · No business records are changed.</p>}<fieldset disabled={readOnlySample}><div className="entry-layout"><main className="entry-main">
      <div className="entry-parties"><section className="entry-card"><h2><UserRound/>Customer</h2><strong>{customer?.businessName??invoice.customerId}</strong><small>{customer?.code}</small></section><section className="entry-card"><h2><FileText/>Billing To</h2><p>{invoice.recipient?.billingAddress??'Not recorded'}</p></section><section className="entry-card"><h2><FileText/>Original Invoice</h2><strong>{invoice.documentNumber}</strong><p>{invoice.documentDate}</p></section></div>
      <section className="entry-card entry-document"><h2><FileText/>Document Details</h2><div><label>Credit Date<input type="date" min={invoice.documentDate} value={creditDate} onChange={e=>setCreditDate(e.target.value)}/></label><label>Source Invoice<input readOnly value={invoice.documentNumber}/></label><label>Discount Treatment<input readOnly value="Inherited · No additional discount"/></label></div></section>
      <section className="entry-card entry-products"><header><h2><Package/>Products · Credit Lines</h2><small>Select original invoice items to return</small></header><div className="entry-table-scroll"><table><thead><tr>{['Select','Product / SKU','Unit','Invoice Qty','Return Qty','Area (m²)','Original Net Price','Discount %','Credit (incl. GST)'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{creditLines.map((item,index)=>{const line=item.line,calculated=selectedLines.find(l=>l.id===line.id);return <tr key={line.id}><td><input aria-label={'Select '+line.description} type="checkbox" checked={item.selected} onChange={()=>toggleLine(index)}/></td><td><strong>{line.description}</strong><small>{line.sku}</small></td><td>{line.unitSymbol}</td><td>{line.quantity}</td><td><input aria-label={'Return quantity '+line.description} className="credit-quantity" type="number" min="0" max={line.quantity} step={line.areaPerPack?1:'any'} value={item.quantity} onChange={e=>updateQuantity(index,Number(e.target.value))}/></td><td>{line.areaPerPack?(item.quantity*line.areaPerPack).toFixed(3):'—'}</td><td>{formatMoney(line.unitPrice)}</td><td><span className="inherited-discount" title="Inherited from original invoice; already included">{line.explicitDiscountPercent??line.discountPercent}%</span></td><td><b>{formatMoney(calculated?.lineTotal??0)}</b></td></tr>;})}</tbody></table></div><footer><b>{selectedLines.length} items</b><span>Discount inherited from original invoice</span></footer></section>
      <section className="entry-card entry-notes"><h2><NotebookPen/>Notes · Credit Reason</h2><textarea rows={3} placeholder="Reason for this credit / return…" value={reason} onChange={e=>setReason(e.target.value)}/></section>
      </main><aside className="entry-sidebar"><DocumentWorkflowCard title="CREDIT NOTE" stages={['Original Invoice','Credit / Return','Apply to Invoice']} current={1}/><section className="entry-card entry-summary"><h2>Pricing Summary ({businessSettings().currency})</h2><div><span>Subtotal (ex. GST)</span><b>{formatMoney(totals.subtotal)}</b></div><div><span>GST</span><b>{formatMoney(totals.taxAmount)}</b></div><div className="entry-grand"><b>Credit Total</b><strong>{formatMoney(totals.total)}</strong></div><small>Proportional original invoice amounts. No second discount is applied.</small></section></aside></div></fieldset>
      <footer className="entry-actions"><button className="primary" disabled={readOnlySample||!selectedLines.length} onClick={handleSubmit}>Create Credit Note</button><span>Save the credit before printing or applying it to an invoice.</span><button onClick={onCancel}>Cancel</button></footer>
    </div></div>;
}

function getToday() {
    return businessDateKey(new Date().toISOString());
}

function formatMoney(
    value: number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            style:
                "currency",
            currency:
                businessSettings().currency,
        },
    ).format(value);
}
function previewCreditLine({quantity,unitPrice,standardUnitPrice,lineSubtotal,taxAmount,sourceQuantity}:{quantity:number;unitPrice:number;standardUnitPrice:number;taxRate:number;lineSubtotal?:number;taxAmount?:number;sourceQuantity?:number}){
 const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
 const net=round((lineSubtotal??unitPrice*(sourceQuantity??quantity))*quantity/((sourceQuantity??quantity)||1));
 const tax=round((taxAmount??0)*quantity/((sourceQuantity??quantity)||1));
 return {lineSubtotal:net,taxAmount:tax,lineTotal:round(net+tax),discountAmount:round(standardUnitPrice-unitPrice),discountPercent:standardUnitPrice?round((standardUnitPrice-unitPrice)/standardUnitPrice*100):0};
}
