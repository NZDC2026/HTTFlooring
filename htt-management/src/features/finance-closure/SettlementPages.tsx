import {businessSettings} from '../business-workspace/configurationState';
import { usePayments } from '../sales/data/usePayments';
import type { Receipt } from './settlementRepository';
import { useState, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Notice } from '../page-previews/PreviewWorkspace';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { customerSettlementRepository, supplierRefundRepository, useSettlements } from './settlementRepository';
import { salesRepository } from '../sales/data/salesRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { supplierRepository } from '../contacts/data/supplierRepository';
import { usePermission } from '../security/usePermission';
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: businessSettings().timezone });
export function SettlementPage({ kind, mode, id }: {
    kind: 'receipt' | 'customer-refund' | 'supplier-refund';
    mode: 'list' | 'new' | 'detail';
    id?: string;
}) {
    const data = useSettlements(), navigate = useNavigate(), supplier = kind === 'supplier-refund', refund = kind !== 'receipt', path = supplier ? '/purchases/refunds' : refund ? '/sales/refunds' : '/sales/receipts';
    useSyncExternalStore(salesRepository.subscribe, salesRepository.getSnapshot, salesRepository.getSnapshot);
    useSyncExternalStore(bankAccountRepository.subscribe, bankAccountRepository.getSnapshot, bankAccountRepository.getSnapshot);
    const canWrite = usePermission(supplier ? 'purchases.payment' : 'sales.payment'), canReadPurchases = usePermission('purchases.read');
    const payments = usePayments(), groupedIds = new Set(data.receipts.flatMap(r => r.paymentIds));
    const receiptRows: Receipt[] = [...data.receipts, ...payments.filter(p => !groupedIds.has(p.id)).map(p => ({ id: p.id, operationId: 'legacy:' + p.id, fingerprint: '', customerId: p.customerId, paymentDate: p.paymentDate, bankAccountId: p.bankAccountId, amount: p.amount, reference: p.reference ?? p.paymentNumber, paymentIds: [p.id], status: p.status === 'REVERSED' ? 'REVERSED' as const : 'POSTED' as const, reversalDate: p.reversedAt?.slice(0, 10) }))];
    const rows = supplier ? data.supplierRefunds : refund ? data.customerRefunds : receiptRows, row = rows.find(r => r.id === id);
    const [contactId, setContact] = useState(''), [date, setDate] = useState(today), [bank, setBank] = useState('bank_001'), [reference, setReference] = useState(''), [creditId, setCredit] = useState(''), [amount, setAmount] = useState(''), [allocations, setAllocations] = useState<Record<string, string>>({}), [error, setError] = useState(''), [reason, setReason] = useState(''), [reversalDate, setReversalDate] = useState(today), [operationId] = useState(() => crypto.randomUUID());
    const contacts = supplier ? supplierRepository.getAll().map(c => ({ id: c.id, name: c.businessName })) : customerRepository.getAll().map(c => ({ id: c.id, name: c.businessName }));
    const credits = (supplier ? supplierCreditRepository.getAll().map(c => ({ id: c.id, contactId: c.supplierId, number: c.creditNumber, available: c.amountAvailable, status: c.status })) : creditNoteRepository.getAll().map(c => ({ id: c.id, contactId: c.customerId, number: c.creditNoteNumber, available: c.amountAvailable, status: c.status }))).filter(c => c.contactId === contactId && c.available > 0 && c.status !== 'VOID');
    const invoices = salesRepository.getAll().filter(d => d.type === 'INVOICE' && d.customerId === contactId && !['VOID', 'DRAFT'].includes(d.status) && d.amountDue > 0);
    const title = supplier ? 'Supplier refunds' : refund ? 'Customer refunds' : 'Customer receipts';
    const act = (fn: () => void) => { try {
        fn();
        setError('');
    }
    catch (e) {
        setError((e as Error).message);
    } };
    return <BusinessFrame title={mode === 'new' ? `New ${refund ? 'refund' : 'receipt'}` : title} actions={<><Link className={buttonClass} to={path}>Register</Link>{canWrite && mode === 'list' && <Link className={buttonClass} to={path + '/new'}>New {refund ? 'refund' : 'receipt'}</Link>}{canReadPurchases && <Link className={buttonClass} to="/purchases/payments/new">Supplier payment</Link>}</>}><Notice error>{error}</Notice>{mode === 'list' ? <Panel title="Posted records"><SampleTable headers={['Date', 'Reference', 'Contact', 'Amount', 'Status']} empty={!rows.length}>{rows.map(r => <tr key={r.id}><Cell>{r.paymentDate}</Cell><Cell><Link className="underline" to={path + '/' + r.id}>{r.reference || r.id.slice(0, 8)}</Link></Cell><Cell>{contacts.find(c => c.id === ('customerId' in r ? r.customerId : r.contactId))?.name ?? '—'}</Cell><Cell>{r.amount.toFixed(2)}</Cell><Cell>{r.status}</Cell></tr>)}</SampleTable><p className="text-sm">Grouped multi-invoice receipts and earlier individual invoice payments share this register.</p></Panel> : mode === 'new' ? !canWrite ? <Notice error>Your role cannot record settlements.</Notice> : <form className="space-y-5" onSubmit={e => { e.preventDefault(); act(() => { let result; if (refund) {
        const input = { operationId, creditId, paymentDate: date, bankAccountId: bank, amount: Number(amount), reference };
        result = supplier ? supplierRefundRepository.create(input) : customerSettlementRepository.createRefund(input);
    }
    else
        result = customerSettlementRepository.recordReceipt({ operationId, customerId: contactId, paymentDate: date, bankAccountId: bank, reference, allocations: Object.entries(allocations).filter(([, v]) => Number(v) > 0).map(([invoiceId, value]) => ({ invoiceId, amount: Number(value) })) }); navigate(path + '/' + result.id); }); }}><Panel title="Settlement details"><div className="grid gap-4 md:grid-cols-2"><Field label={supplier ? 'Supplier' : 'Customer'}><select className={fieldClass} required value={contactId} onChange={e => { setContact(e.target.value); setAllocations({}); setCredit(''); }}><option value="">Select contact</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Payment date"><input required type="date" className={fieldClass} value={date} onChange={e => setDate(e.target.value)}/></Field><Field label="Bank account"><select className={fieldClass} value={bank} onChange={e => setBank(e.target.value)}>{bankAccountRepository.getAll().filter(b => b.active).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field><Field label="Reference"><input className={fieldClass} value={reference} onChange={e => setReference(e.target.value)}/></Field></div></Panel>{refund ? <Panel title="Unused credit"><p>Refunds are paid from an unused issued credit. Partial refunds are supported and do not create a second credit note.</p><Field label="Credit"><select required className={fieldClass} value={creditId} onChange={e => setCredit(e.target.value)}><option value="">Select credit</option>{credits.map(c => <option key={c.id} value={c.id}>{c.number} · available {c.available.toFixed(2)}</option>)}</select></Field><Field label="Refund amount"><input type="number" min="0.01" step="0.01" required className={fieldClass} value={amount} onChange={e => setAmount(e.target.value)}/></Field></Panel> : <Panel title="Allocate to invoices"><SampleTable headers={['Invoice', 'Due', 'Amount to allocate']} empty={!invoices.length}>{invoices.map(d => <tr key={d.id}><Cell>{d.documentNumber}</Cell><Cell>{d.type === 'INVOICE' ? d.amountDue.toFixed(2) : ''}</Cell><Cell><input aria-label={`Allocate ${d.documentNumber}`} type="number" min="0" max={d.type === 'INVOICE' ? d.amountDue : 0} step="0.01" className={fieldClass} value={allocations[d.id] ?? ''} onChange={e => setAllocations({ ...allocations, [d.id]: e.target.value })}/></Cell></tr>)}</SampleTable><p>Total receipt: {Object.values(allocations).reduce((s, v) => s + (Number(v) || 0), 0).toFixed(2)}</p></Panel>}<button className={buttonClass}>Record {refund ? 'refund' : 'receipt'}</button></form> : !row ? <Notice error>Record not found.</Notice> : <><Panel title="Settlement"><dl className="grid gap-4 md:grid-cols-2">{[['Date', row.paymentDate], ['Reference', row.reference || '—'], ['Amount', row.amount.toFixed(2)], ['Status', row.status], ['Bank', bankAccountRepository.getById(row.bankAccountId)?.name ?? '—'], ['Contact', contacts.find(c => c.id === ('customerId' in row ? row.customerId : row.contactId))?.name ?? '—']].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd>{value}</dd></div>)}</dl>{'paymentIds' in row && <SampleTable headers={['Invoice', 'Allocated amount']}>{row.paymentIds.map(id => { const p = payments.find(p => p.id === id), invoice = salesRepository.getAll().find(i => i.id === p?.invoiceId); return <tr key={id}><Cell><Link className="underline" to={'/sales/invoices/' + p?.invoiceId}>{invoice?.documentNumber ?? 'Invoice'}</Link></Cell><Cell>{p?.amount.toFixed(2)}</Cell></tr>; })}</SampleTable>}{'creditId' in row && <Link className="underline" to={(supplier ? '/purchases/credits/' : '/sales/credit-notes/') + row.creditId}>Source credit note</Link>}<Link className={buttonClass} to={'/banking/accounts/' + row.bankAccountId}>Bank ledger</Link></Panel>{canWrite && row.status === 'POSTED' && <Panel title="Reverse settlement"><p>Reversal preserves the original record and posts reversing ledger entries. Reconciled bank entries are protected.</p><Field label="Reason"><input required className={fieldClass} value={reason} onChange={e => setReason(e.target.value)}/></Field>{refund && <Field label="Reversal date"><input type="date" className={fieldClass} value={reversalDate} onChange={e => setReversalDate(e.target.value)}/></Field>}<button disabled={reason.trim().length < 3} className={buttonClass} onClick={() => act(() => { if (!refund) {
        if (data.receipts.some(r => r.id === row.id))
            customerSettlementRepository.reverseReceipt({ id: row.id, reason });
        else
            salesRepository.reverseInvoicePayment(row.id, reason);
    }
    else if (supplier)
        supplierRefundRepository.reverse({ id: row.id, reason, reversalDate });
    else
        customerSettlementRepository.reverseRefund({ id: row.id, reason, reversalDate }); })}>Reverse {refund ? 'refund' : 'receipt'}</button></Panel>}</>}</BusinessFrame>;
}
