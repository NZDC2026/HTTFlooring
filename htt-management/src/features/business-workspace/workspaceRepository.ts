import {physicalStockBatches} from '../inventory/data/productStockBatches';
import {validateClearance} from '../inventory/clearance/clearanceModel';
import {promotionAudienceSchema,readPromotionAudience,promotionCustomerTypes,promotionCustomerIdsSchema,readPromotionCustomerIds} from '../promotions/promotionAudience';
import {purchaseDueDate,purchaseDefaults} from '../purchase-settings/purchaseDefaults';
import {supplierRepository} from '../contacts/data/supplierRepository';
import {onProcurementExpenseDraftChange} from '../procurement/invoiceDraftEvents';
import {readDocuments} from '../procurement/procurementDocuments';
import type {ProcurementInvoiceDraft} from '../procurement/procurementDrafts';
import {expenseDraftRepository,type ExpensePayload} from '../direct-documents/managedDocumentRepository';
import {readInvoiceDrafts,refreshInvoiceDrafts} from '../procurement/procurementDrafts';
import {supplierBillRepository} from '../purchases/data/supplierBillRepository';
import {businessDateKey} from '../../lib/businessDate';
import {validateProcurement} from '../procurement/procurementRules';
function validateInternalTaskSource(input:Record<string,string>,snapshots:Record<string,any>){
 if(input.promotionId&&!snapshots.workspace_promotions?.records.some((r:ConfigRow)=>(r.campaignId||r.id)===input.promotionId&&r.deleted!=='true'))throw Error('Task promotion no longer exists.');
 if(input.sourceQuoteId&&!snapshots.sales?.quotes.some((q:any)=>q.id===input.sourceQuoteId&&q.customerId===input.customerId))throw Error('Task quote must belong to the selected customer.');
 if(input.sourceSalesDraftId&&!snapshots.managedSalesDocuments?.drafts.some((d:any)=>d.id===input.sourceSalesDraftId&&d.payload.customerId===input.customerId))throw Error('Task draft must belong to the selected customer.');
}
import {validateCompanyPaymentDetails} from '../payment-details/paymentDetails';
import { validateTaskDocument, type TaskDocument } from "../contacts/data/taskDocumentReference";
import { paymentTermsTypeSchema, validatePaymentTerms } from "../payment-terms/paymentTerms";
import { validTaskLocalTime } from "../delivery-tasks/deliveryTaskTime";
import { parseBulkStatus } from './bulkStatus';
import { reportPresentationSchema } from '../report-settings/reportPresentation';
import { parseRuleConditions } from '../bank-rules/ruleConditions';
import { runSavedReport } from '../saved-reports/savedReportCommand';
import { parseSavedReportConfiguration } from '../saved-reports/savedReportService';
import { generateSavedReportPack } from '../report-packs/reportPackCommand';
import { parseReportSelection } from '../report-packs/reportPackService';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository, snapshotRepositories } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { accountRepository } from '../accounting/data/accountRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { getProductById, getProductUnit } from '../inventory/data/mockProducts';
import { configurationRows, taxSnapshot, type ConfigRow } from './configurationState';
import type { Permission } from '../security/rbac';
import type { AccountSystemRole } from '../accounting/types/account';
let procurementExpenseWrite=false;
function procurementExpensePayload(draft:ProcurementInvoiceDraft):ExpensePayload{
 if(!draft.manual||draft.role==='Materials')throw Error('A freight / clearance manual invoice is required.');
 const account=accountRepository.getAll().find(a=>a.active&&a.type==='EXPENSE'&&a.allowManualPosting&&(draft.role==='Freight'?a.systemRole==='FREIGHT':a.systemRole==='OPERATING_EXPENSE'));
 if(!account)throw Error('Configure the freight / operating expense account before saving.');
 return {kind:'EXPENSE',supplierId:draft.manual.supplierId,supplierInvoiceNumber:draft.supplierInvoiceNumber,documentDate:draft.billDate,dueDate:draft.dueDate||purchaseDueDate(draft.billDate,purchaseDefaults(supplierRepository.getById(draft.manual.supplierId))),fx:draft.manual.fx,lines:draft.manual.lines.map(l=>{const tax=configurationRows['tax-codes']?.find(t=>t.status==='Active'&&(!l.taxCode||t.code===l.taxCode)&&Math.abs(Number(t.rate)/100-l.taxRate)<1e-8);if(!tax)throw Error('Configure an active tax code matching the invoice GST rate.');return {description:l.description,quantity:l.quantity,unitCost:l.unitCost,accountId:l.accountId??account.id,taxCode:tax.code,priceBasis:l.priceBasis??'Exclusive'};})};
}
function ensureProcurementExpenseDrafts(text:string){const drafts=readInvoiceDrafts(text);procurementExpenseWrite=true;try{for(const draft of drafts){if(!draft.manual||draft.role==='Materials'||draft.status!=='DRAFT')continue;const prior=draft.expenseDraftId?expenseDraftRepository.getAll().find(d=>d.id===draft.expenseDraftId):undefined;const payload=procurementExpensePayload(draft);if(prior&&prior.status!=='DRAFT')throw Error('The linked invoice is no longer a draft. Reload the batch.');const entry=prior&&JSON.stringify(prior.payload)===JSON.stringify(payload)?prior:expenseDraftRepository.save({operationId:'procurement:'+draft.id,...(prior?{id:prior.id,expectedRevision:prior.revision}:{}),payload});draft.expenseDraftId=entry.id;if(entry.payload.kind==='EXPENSE')draft.dueDate=entry.payload.dueDate??'';}return JSON.stringify(drafts);}finally{procurementExpenseWrite=false;}}
const strings = z.record(z.string(), z.string().max(20000));
const systemRoles: AccountSystemRole[] = ['BANK', 'ACCOUNTS_RECEIVABLE', 'INVENTORY', 'GRNI', 'PURCHASE_PRICE_VARIANCE', 'GST_RECEIVABLE', 'ACCOUNTS_PAYABLE', 'GST_PAYABLE', 'SALES_REVENUE', 'COST_OF_GOODS_SOLD', 'PURCHASES', 'FREIGHT', 'OPERATING_EXPENSE', 'RETAINED_EARNINGS', 'OWNERS_EQUITY'];
const now = () => new Date().toISOString();
export const workspaceDomains: Record<string, {
    read: Permission;
    write: Permission;
    required: string[];
    fields: string[];
}> = {
    clearances: {read:'inventory.read',write:'promotions.manage',required:['productId','siteId','batchId','batchNumber','unitId','initialQuantity','normalPrice','price','starts','ends','reason','allowBelowCost'],fields:['productId','siteId','batchId','batchNumber','unitId','initialQuantity','normalPrice','price','starts','ends','reason','allowBelowCost']},
    procurement: {read:'purchases.read',write:'purchases.write',required:['code','links'],fields:['code','links','notes','documents','invoiceDrafts']},
    'tax-codes': { read: 'inventory.read', write: 'accounting.post', required: ['code', 'rate', 'collected', 'paid'], fields: ['code', 'rate', 'collected', 'paid', 'basis', 'report'] },
    'linked-accounts': { read: 'accounting.read', write: 'accounting.post', required: ['role', 'accountId'], fields: ['role', 'accountId'] },
    rebates: { read: 'sales.read', write: 'sales.write', required: ['customerId','productId','starts','ends','cycle','rate','minArea','minSales'], fields: ['customerId','productId','starts','ends','cycle','rate','minArea','minSales','salesEnabled','salesContactId','deleted'] },
    promotions: { read: 'sales.read', write: 'promotions.manage', required: ['productId', 'unitId', 'starts', 'ends', 'price', 'priority', 'policy'], fields: ['code','promotionType','discountPercent','campaignStatus','notes','customerIds','customerTypes','campaignId', 'deleted', 'productId', 'unitId', 'customerId', 'starts', 'ends', 'price', 'priority', 'policy'] },
    jobs: { read: 'accounting.read', write: 'accounting.post', required: ['code', 'customerId', 'starts', 'ends', 'budget', 'costBudget'], fields: ['code', 'customerId', 'owner', 'starts', 'ends', 'budget', 'costBudget'] },
    tasks: { read: 'sales.read', write: 'sales.write', required: ['customerId', 'owner', 'due', 'priority', 'notes'], fields: ['promotionId','customerId', 'owner', 'due', 'priority', 'notes', 'taskType', 'documentType', 'documentId', 'sourceQuoteId', 'sourceSalesDraftId', 'completedAt', 'completedBy', 'completedByName', 'orderId', 'deliveryAt', 'deliveryAddress', 'ownerName', 'reminderAt', 'reminderTimeZone', 'snoozedUntil', 'paymentFollowupData'] },
    'bank-rules': { read: 'banking.read', write: 'banking.write', required: ['field', 'operator', 'value', 'accountId', 'taxCode'], fields: ['field', 'operator', 'value', 'accountId', 'taxCode', 'enabled', 'conditions', 'match', 'priority', 'automatic', 'bankAccountId'] },
    templates: { read: 'accounting.read', write: 'accounting.post', required: ['kind', 'subject', 'body'], fields: ['kind', 'subject', 'body', 'footer', 'logo', 'paper'] },
    'custom-reports': { read: 'accounting.read', write: 'accounting.post', required: ['dataset', 'columns', 'basis'], fields: ['dataset', 'columns', 'filter', 'basis', 'favourite'] },
    'report-packs': { read: 'accounting.read', write: 'accounting.post', required: ['periodStart', 'periodEnd', 'reports'], fields: ['periodStart', 'periodEnd', 'reports', 'cover', 'introduction'] },
    settings: { read: 'inventory.read', write: 'accounting.post', required: ['section'], fields: ['paymentBankName','paymentAccountName','paymentBsb','paymentAccountNumber','paymentInstructions','termsType', 'reportDefaults', 'termsPolicy', 'paymentMethod', 'section', 'companyName', 'currency', 'timezone', 'yearEnd', 'gstCode', 'quotePrefix', 'orderPrefix', 'invoicePrefix', 'creditPrefix', 'purchasePrefix', 'terms', 'sender', 'payCycle', 'payDay', 'filingRegion', 'basis', 'precision', 'header', 'logo', 'nextQuote', 'nextOrder', 'nextInvoice', 'nextCredit', 'nextPurchase', 'billPrefix', 'supplierCreditPrefix', 'nextBill', 'nextSupplierCredit', 'tradingName', 'identifier', 'email', 'phone', 'address'] },
};
const listeners = new Set<() => void>();
let revision = 0;
const emit = () => { revision++; listeners.forEach(fn => fn()); };
export const configurationHistory: Record<string, ConfigRow[]> = Object.fromEntries(Object.keys(workspaceDomains).map(k => [k, []]));
for (const key of Object.keys(workspaceDomains))
    configurationRows[key] = [];
const taxSeedAccounts = () => ({ collected: accountRepository.getAll().find(a => a.systemRole === 'GST_PAYABLE')?.id ?? '', paid: accountRepository.getAll().find(a => a.systemRole === 'GST_RECEIVABLE')?.id ?? '' });
// Match the existing engine's tax rate when migrating. No statutory rate is inferred from the user's locale.
configurationRows['tax-codes'] = [{ id: 'tax-gst', name: 'GST', status: 'Active', revision: '1', createdAt: now(), updatedAt: now(), code: 'GST', rate: '10', basis: 'Exclusive', report: 'GST', ...taxSeedAccounts() }, { id: 'tax-zero', name: 'Zero rated', status: 'Active', revision: '1', createdAt: now(), updatedAt: now(), code: 'ZERO', rate: '0', basis: 'Exclusive', report: 'Zero rated', ...taxSeedAccounts() }];
function requiredText(value: string | undefined, label: string) { if (!value?.trim())
    throw new Error(`${label} is required.`); }
function money(value: string | undefined, label: string) { if (!value?.trim() || !Number.isFinite(Number(value)) || Number(value) < 0)
    throw new Error(`${label} must be a non-negative number.`); }
function account(id: string | undefined, type?: string) { const a = accountRepository.getAll().find(a => a.id === id); if (!a?.active || type && a.type !== type)
    throw new Error('Select an active account of the correct type.'); return a; }
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value; }
function validate(domain: string, input: Record<string, string>, rows: ConfigRow[], checkReferences = true) {
    const spec = workspaceDomains[domain];
    if (!spec)
        throw new Error('Unknown workspace domain.');
    const keys = new Set(['id', 'name', 'status', 'revision', 'createdAt', 'updatedAt', ...spec.fields]);
    if (Object.keys(input).some(k => !keys.has(k)))
        throw new Error('Unsupported business field.');
    requiredText(input.name, 'Name');
    for (const key of spec.required)
        if(!(domain==='tasks'&&key==='customerId'&&input.promotionId))requiredText(input[key], key);
    if (!['Active', 'Inactive', 'Open', 'In progress', 'Completed'].includes(input.status ?? 'Active'))
        throw new Error('Invalid business status.');
    if(domain==='clearances'){validateClearance(input);if(checkReferences){const p=getProductById(input.productId);if(!p||input.unitId!==p.baseUnitId)throw Error('Select the clearance product base unit.');const snapshots=snapshotRepositories();const source=(snapshots.costMovements as {movements:import('../inventory/types/inventoryCost').InventoryCostMovement[]}).movements.find(m=>m.id===input.batchId&&m.productId===input.productId&&m.siteId===input.siteId&&m.quantityBase>0);if(!source)throw Error('Select a recorded batch for this product and site.');if(Number(input.initialQuantity)>source.quantityBase)throw Error('Clearance quantity exceeds the received batch quantity.');const prior=rows.find(r=>r.id===input.id);if(prior&&['productId','siteId','batchId','batchNumber','unitId','initialQuantity','normalPrice','starts'].some(k=>prior[k]!==input[k]))throw Error('Clearance batch scope and starting quantity cannot be changed.');if(!prior){const history=(snapshots.costMovements as {movements:import('../inventory/types/inventoryCost').InventoryCostMovement[]}).movements.filter(c=>c.productId===input.productId&&c.siteId===input.siteId),available=physicalStockBatches(history).find(b=>b.id===input.batchId)?.quantity??0;if(Number(input.initialQuantity)>available)throw Error('Clearance quantity exceeds the remaining batch stock.');}if(input.allowBelowCost==='true')trustedAuthorization.require('promotions.margin');if((input.status??'Active')==='Active'&&rows.some(r=>r.id!==input.id&&r.status==='Active'&&r.batchId===input.batchId&&r.siteId===input.siteId&&r.starts<=input.ends&&r.ends>=input.starts))throw Error('An active clearance already covers this batch and date range.');}}
    if(domain==='procurement'){readInvoiceDrafts(input.invoiceDrafts);validateProcurement(input,rows,checkReferences?(snapshotRepositories().purchaseOrders as {purchaseOrders:import('../purchases/types/purchaseOrder').PurchaseOrder[]}).purchaseOrders:undefined,checkReferences?(snapshotRepositories().supplierBills as {supplierBills:import('../purchases/types/supplierBill').SupplierBill[]}).supplierBills:undefined);}
    if (domain === 'tax-codes') {
        money(input.rate, 'Tax rate');
        if (input.basis && !['Exclusive','Inclusive'].includes(input.basis))
            throw new Error('Invalid entry basis.');
        if(checkReferences){
            const prior=rows.find(r=>r.id===input.id),snap=snapshotRepositories() as Record<string,any>;
            const defaultCode=configurationRows.settings?.find(r=>r.section==='business'&&r.status==='Active')?.gstCode??'GST';
            if(input.status==='Inactive'&&input.code===defaultCode)throw new Error('The default tax code must remain active. Change the business default first.');
            if(prior&&prior.code!==input.code&&(prior.code===defaultCode||snap.products.products.some((p:any)=>(p.taxCode??'GST')===prior.code)||(configurationRows['bank-rules']??[]).some(r=>r.taxCode===prior.code)||((snap.bankRuleApplications as {receipts:{decision:{taxCode:string}}[]}|undefined)?.receipts??[]).some(r=>r.decision.taxCode===prior.code)))throw new Error('A referenced tax code cannot be renamed. Create a new code and update future-use references.');
        }
        if (Number(input.rate) > 100)
            throw new Error('Tax rate cannot exceed 100%.');
        if (checkReferences) {
            const collected=account(input.collected,'LIABILITY'),paid=account(input.paid,'ASSET');
            const bankIds=((snapshotRepositories().bankAccounts as {bankAccounts:{glAccountId:string}[]}|undefined)?.bankAccounts??[]).map(b=>b.glAccountId);
            if(collected.systemRole&&collected.systemRole!=='GST_PAYABLE'||paid.systemRole&&paid.systemRole!=='GST_RECEIVABLE'||bankIds.includes(paid.id))throw new Error('Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.');

        }
        if (rows.some(r => r.id !== input.id && r.code.toLowerCase() === input.code.toLowerCase()))
            throw new Error('Tax code must be unique.');
        if (!/^[A-Z0-9_-]{1,24}$/.test(input.code))
            throw new Error('Use uppercase letters/numbers for a tax code.');
    }
    if (domain === 'linked-accounts' && checkReferences) {
        const old = accountRepository.requireBySystemRole(input.role as AccountSystemRole);
        const effective = input.status === 'Inactive' ? accountRepository.getAll().find(a => a.systemRole === input.role)?.id : input.accountId;
        const entries = (snapshotRepositories().journals as {
            journalEntries: {
                lines: {
                    accountId: string;
                }[];
            }[];
        } | undefined)?.journalEntries ?? [];
        if (effective !== old.id && entries.some(j => j.lines.some(l => l.accountId === old.id || l.accountId === effective)))
            throw new Error('A used posting account cannot be remapped without a ledger migration.');
    }
    if (domain === 'linked-accounts') {
        if (!systemRoles.includes(input.role as AccountSystemRole))
            throw new Error('Unknown account role.');
        const type = ['BANK', 'ACCOUNTS_RECEIVABLE', 'INVENTORY', 'GST_RECEIVABLE'].includes(input.role) ? 'ASSET' : ['GRNI', 'ACCOUNTS_PAYABLE', 'GST_PAYABLE'].includes(input.role) ? 'LIABILITY' : input.role === 'SALES_REVENUE' ? 'REVENUE' : ['RETAINED_EARNINGS', 'OWNERS_EQUITY'].includes(input.role) ? 'EQUITY' : 'EXPENSE';
        if (checkReferences)
            account(input.accountId, type);
        if (rows.some(r => r.id !== input.id && r.role === input.role))
            throw new Error('A linked account role may only have one mapping.');
    }
    if (domain === 'rebates') {
        if (!validDate(input.starts) || !validDate(input.ends) || input.starts > input.ends) throw Error('Choose a valid rebate date range.');
        if (!['Monthly','Quarterly'].includes(input.cycle)) throw Error('Choose Monthly or Quarterly.');
        for (const key of ['rate','minArea','minSales']) money(input[key], key);
        if (input.salesEnabled && !['true','false'].includes(input.salesEnabled)) throw Error('Invalid Sales option.');
        if (input.salesEnabled === 'true' && !input.salesContactId) throw Error('Select a customer contact for Sales.');
        if (checkReferences && input.salesEnabled === 'true' && !customerRepository.getById(input.customerId)?.contacts.some(c=>c.id===input.salesContactId)) throw Error('Sales contact must belong to this customer.');
        if (Number(input.rate) <= 0) throw Error('Rebate per m² must be greater than zero.');
        if (input.status === 'Active' && input.deleted !== 'true' && rows.some(r=>r.id!==input.id&&r.status==='Active'&&r.deleted!=='true'&&r.customerId===input.customerId&&r.productId===input.productId&&r.starts<=input.ends&&r.ends>=input.starts)) throw Error('An active rebate already covers this product and date range. Edit that rule or choose non-overlapping dates.');
        if (checkReferences && (!customerRepository.getById(input.customerId) || !getProductById(input.productId))) throw Error('Select a valid customer and product.');
    }
    if (domain === 'promotions') {
        if(input.campaignStatus&&input.campaignStatus!=='Active'&&input.status==='Active')throw Error('Inactive promotion lifecycle cannot apply live pricing.');
        if(input.campaignStatus&&!['Draft','Active','Paused','Ended','Archived'].includes(input.campaignStatus))throw Error('Invalid promotion lifecycle state.');
        if(input.promotionType&&!['Fixed Price','% Discount'].includes(input.promotionType))throw Error('Invalid promotion type.');
        if(input.discountPercent!==undefined&&(!Number.isFinite(Number(input.discountPercent))||Number(input.discountPercent)<0||Number(input.discountPercent)>100))throw Error('Discount must be 0–100%.');
        readPromotionAudience(input.customerTypes);
        const selectedCustomers=readPromotionCustomerIds(input.customerIds);if(checkReferences&&selectedCustomers.some(id=>!customerRepository.getById(id)))throw Error('Selected customer was not found.');
        const p = getProductById(input.productId);
        if (checkReferences && (!p || !getProductUnit(p.id, input.unitId)))
            throw new Error('Product/unit not found.');
        money(input.price, 'Price');
        if (!Number.isInteger(Number(input.priority)))
            throw new Error('Priority must be an integer.');
        if (!['Customer price first', 'Promotion first', 'Lowest eligible price'].includes(input.policy))
            throw new Error('Invalid price conflict policy.');
        if (!/([+-]\d\d:\d\d|Z)$/.test(input.starts) || !Number.isFinite(Date.parse(input.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(input.ends) || !Number.isFinite(Date.parse(input.ends)) || Date.parse(input.ends) <= Date.parse(input.starts))
            throw new Error('Promotion requires explicit time offsets and an end after start.');
    }
    if (checkReferences && input.customerId && !customerRepository.getById(input.customerId))
        throw new Error('Customer was not found.');
    if (domain === 'jobs') {
        money(input.budget, 'Revenue budget');
        money(input.costBudget, 'Cost budget');
        if(checkReferences)for(const key of ['budget','costBudget']){const amount=Number(input[key]);if(!Number.isSafeInteger(Math.round(amount*100))||Math.abs(Math.round(amount*100)/100-amount)>0.0000001)throw new Error('Project budgets require safe currency amounts with at most two decimals.');}
        if (!validDate(input.starts) || !validDate(input.ends) || input.ends < input.starts)
            throw new Error('Invalid project dates.');
        if (rows.some(r => r.id !== input.id && r.code.toLowerCase() === input.code.toLowerCase()))
            throw new Error('Job code must be unique.');
    }
    if (domain === 'tasks') {
        if(input.taskType&&!['Follow-up','Site Visit','Sample','Payment','Enquiry','Complaint','Delivery','Other'].includes(input.taskType))throw Error('Invalid task type.');
        if(input.reminderAt&&(!validTaskLocalTime(input.reminderAt)||!input.reminderTimeZone))throw Error('Enter a valid reminder time and timezone.');
        if(checkReferences)validateInternalTaskSource(input as Record<string,string>,snapshotRepositories() as Record<string,any>);
        if(checkReferences){const sales=snapshotRepositories().sales as {salesOrders:TaskDocument[];invoices:TaskDocument[]};validateTaskDocument(input.documentType,input.documentId,input.customerId,sales.salesOrders,sales.invoices,'customerId');}
        if (checkReferences && input.id && ((snapshotRepositories().salesVisits as {visits:{followupTaskId?:string;customerId:string}[]}|undefined)?.visits??[]).some(v=>v.followupTaskId===input.id&&v.customerId!==input.customerId)) throw new Error('A visit follow-up must retain the visit customer.');
        if (checkReferences && !['Open', 'In progress', 'Completed'].includes(input.status ?? 'Open')) throw new Error('Task status must be Open, In progress or Completed.');
        if (input.orderId) {
            if (!validTaskLocalTime(input.deliveryAt ?? '') || !validTaskLocalTime(input.reminderAt ?? '') ||
                input.deliveryAt.slice(0, 10) !== input.due || input.reminderAt > input.deliveryAt) {
                throw new Error('Enter valid delivery and reminder times. The reminder must be on or before delivery.');
            }
            if (!input.deliveryAddress?.trim() || input.deliveryAddress.length > 500) throw new Error('Enter a delivery address (up to 500 characters).');
            if (!input.reminderTimeZone) throw new Error('A delivery time zone is required.');
            new Intl.DateTimeFormat('en', { timeZone: input.reminderTimeZone });
            if (input.snoozedUntil && !z.iso.datetime().safeParse(input.snoozedUntil).success) throw new Error('Invalid snooze time.');
            if (checkReferences) {
                const sales = snapshotRepositories().sales as { salesOrders: { id: string; customerId: string }[] } | undefined;
                if (!sales?.salesOrders.some(order => order.id === input.orderId && order.customerId === input.customerId)) {
                    throw new Error('Select an order that belongs to this customer.');
                }
            }
        }
        if (!validDate(input.due) || !['Low', 'Normal', 'High'].includes(input.priority))
            throw new Error('Invalid due date or priority.');
    }
    if (domain === 'bank-rules') {
        if (checkReferences)
            account(input.accountId);
        parseRuleConditions(input);
        if(checkReferences&&input.bankAccountId&&input.bankAccountId!=='ALL'&&!(snapshotRepositories().bankAccounts as {bankAccounts:{id:string}[]}).bankAccounts.some(b=>b.id===input.bankAccountId))throw new Error('Bank rule scope account was not found.');
        if (checkReferences && !configurationRows['tax-codes'].some(r => r.status === 'Active' && r.code === input.taxCode))
            throw new Error('Active tax code not found.');
    }
    if (domain === 'custom-reports' && checkReferences) parseSavedReportConfiguration({dataset:input.dataset,columns:input.columns,basis:input.basis,filter:input.filter,favourite:input.favourite});
    if (domain === 'report-packs' && checkReferences) parseReportSelection(input.reports);
    if (domain === 'report-packs' && (!validDate(input.periodStart) || !validDate(input.periodEnd) || input.periodEnd < input.periodStart))
        throw new Error('Invalid report period.');
    if (domain === 'settings') {
        if (rows.some(r=>r.id!==input.id&&r.section===input.section)) throw new Error('One record per settings section is allowed.');
        if(input.section==='reports' && input.reportDefaults!==undefined){
            if(input.reportDefaults!=='Yes'||input.status!=='Active')throw new Error('Report defaults must remain active.');
            if(!/^[234]$/.test(input.precision))throw new Error('Amount precision must be 2, 3 or 4.');
            reportPresentationSchema.parse({header:input.header,precision:Number(input.precision),basis:input.basis,currency:input.currency});
        }
        if(input.section==='purchases' && (input.termsPolicy!==undefined || input.paymentMethod!==undefined)) {
            if(input.status!=='Active')throw new Error('Purchase settings must remain active.');
            if(!/^\d+$/.test(input.terms)||Number(input.terms)>365)throw new Error('Purchase terms must be 0–365 days.');
            validatePaymentTerms({paymentTermsDays:Number(input.terms),paymentTermsType:paymentTermsTypeSchema.parse(input.termsType)});
            if(!['SUPPLIER','PURCHASE_SETTINGS'].includes(input.termsPolicy))throw new Error('Invalid purchase terms policy.');
            if(!['BANK_TRANSFER','CARD','CASH','CHEQUE','OTHER'].includes(input.paymentMethod))throw new Error('Invalid preferred payment method.');
        }
        if(input.section==='business') {
            validateCompanyPaymentDetails(input);
            for(const field of ['companyName','currency','timezone','yearEnd','gstCode','basis','terms'])requiredText(input[field],field);
            if(input.status!=='Active')throw new Error('Business settings must remain active.');
            if(!['Exclusive','Inclusive'].includes(input.basis))throw new Error('Invalid price basis.');
            if(!/^\d+$/.test(input.terms)||Number(input.terms)>365)throw new Error('Payment terms must be 0–365 days.');
            validatePaymentTerms({paymentTermsDays:Number(input.terms),paymentTermsType:paymentTermsTypeSchema.parse(input.termsType)});
            if(!/^\d{2}-\d{2}$/.test(input.yearEnd)||!validDate('2001-'+input.yearEnd))throw new Error('Year end must be MM-DD.');
            for(const field of ['quotePrefix','orderPrefix','invoicePrefix','creditPrefix','purchasePrefix','billPrefix','supplierCreditPrefix']) if(input[field]&&!/^[A-Z0-9]{1,12}$/.test(input[field]))throw new Error('Number prefixes require 1–12 uppercase letters/numbers.');
            if(checkReferences) {
                if(!configurationRows['tax-codes'].some(r=>r.code===input.gstCode&&r.status==='Active'))throw new Error('Default tax code must be active.');
                const journals=(snapshotRepositories().journals as {journalEntries:unknown[]}).journalEntries;
                const old=rows.find(r=>r.id===input.id);const banks=(snapshotRepositories().bankAccounts as {bankAccounts:{currency:string}[]}).bankAccounts;
                const currency=old?.currency??banks[0]?.currency??'AUD';
                if(input.currency!==currency&&(journals.length||banks.length))throw new Error('Base currency is locked after bank accounts or financial postings exist. Create a separately initialized currency profile.');
            }
        }

        if (!['business', 'sales', 'purchases', 'payroll', 'reports'].includes(input.section))
            throw new Error('Unknown settings section.');
        if (input.currency && !(input.section==='reports'?['BASE','USD','AUD','CNY','NZD']:['USD','AUD','CNY','NZD']).includes(input.currency))
            throw new Error('Unsupported currency.');
        if (input.timezone) {
            try {
                new Intl.DateTimeFormat('en', { timeZone: input.timezone });
            }
            catch {
                throw new Error('Invalid time zone.');
            }
        }
        for (const key of ['nextQuote','nextOrder','nextInvoice','nextCredit','nextPurchase','nextBill','nextSupplierCredit'])
            if (input[key] && (!/^\d+$/.test(input[key]) || Number(input[key]) < 1 || !Number.isSafeInteger(Number(input[key])) || Number(input[key])>999999999))
                throw new Error('Next document numbers must be positive integers.');
    }
}
let batchContext:{batchId:string;batchRequest:string}|undefined;
function log(domain: string, row: ConfigRow, action: string) { configurationHistory[domain].push({ id: crypto.randomUUID(), name: action, status: 'Active', revision: '1', createdAt: now(), updatedAt: now(), ...batchContext, recordId: row.id, actorId: trustedAuthorization.current()?.userId ?? 'local-test', after: JSON.stringify(row) }); }
export const workspaceRepositories = Object.fromEntries(Object.keys(workspaceDomains).map(domain => {
    const repository = {
        run(raw:unknown) { if(domain!=='custom-reports') throw new Error('Saved-report execution is not available on this register.'); return runSavedReport(raw); },
        generate(raw:unknown) { if(domain!=='report-packs') throw new Error('Report generation is only available for report packs.'); return generateSavedReportPack(raw); },
        previewBulkStatus(raw:unknown) {const input=parseBulkStatus(domain,raw);return input.rows.map(({id,expectedRevision})=>{const row=configurationRows[domain].find(r=>r.id===id);if(!row||row.revision!==expectedRevision)throw new Error('A selected record changed or was removed. Reload and review the batch again.');validate(domain,{...row,status:input.status},configurationRows[domain]);return {id,name:row.name,from:row.status,to:input.status,revision:row.revision};});},
        bulkStatus(raw:unknown) {const input=parseBulkStatus(domain,raw),request=JSON.stringify({status:input.status,rows:input.rows.slice().sort((a,b)=>a.id.localeCompare(b.id))}),prior=configurationHistory[domain].filter(h=>h.batchId===input.operationId);
            if(prior.length){if(prior.length!==input.rows.length||prior.some(h=>h.batchRequest!==request||h.actorId!==trustedAuthorization.current()?.userId))throw new Error('Batch operation ID belongs to another request or actor.');return {batchId:input.operationId,records:prior.map(h=>JSON.parse(h.after) as ConfigRow)};}
            repository.previewBulkStatus(input);batchContext={batchId:input.operationId,batchRequest:request};try{return {batchId:input.operationId,records:input.rows.map(r=>repository.setStatus(r.id,input.status,r.expectedRevision))};}finally{batchContext=undefined;}
        },
        getAll: () => configurationRows[domain], getById: (id: string) => configurationRows[domain].find(r => r.id === id),
        save(raw: Record<string, string>, expectedRevision?: string) { const input = strings.parse(raw), existing = configurationRows[domain].find(r => r.id === input.id); if(domain==='tasks'&&(input.promotionId||existing?.promotionId)){trustedAuthorization.require('promotions.manage');if(existing?.promotionId&&input.promotionId!==existing.promotionId)throw Error('A promotion task must retain its promotion link.');} if(domain==='procurement'){if(input.id&&!existing)throw Error('Batch no longer exists.');input.code=existing?.code??'PB-'+String(Math.max(0,...configurationRows[domain].map(r=>Number(r.code.slice(3))))+1).padStart(6,'0');} if (existing && existing.revision !== expectedRevision)
            throw new Error('Record changed. Reload before saving.'); if (!existing && expectedRevision !== undefined)
            throw new Error('Record no longer exists.'); const timestamp = now(), row: ConfigRow = { ...input, id: existing?.id ?? crypto.randomUUID(), name: input.name.trim(), status: input.status ?? (domain === 'tasks' ? 'Open' : 'Active'), revision: String(Number(existing?.revision ?? '0') + 1), createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp }; if (domain === 'tasks') {
            delete row.completedAt; delete row.completedBy; delete row.completedByName;
            if (row.status === 'Completed') {
                row.completedAt = existing?.status === 'Completed' ? existing.completedAt || timestamp : timestamp;
                row.completedBy = existing?.status === 'Completed' ? existing.completedBy || trustedAuthorization.current()?.userId || 'local-test' : trustedAuthorization.current()?.userId ?? 'local-test';
                const displayName = existing?.status === 'Completed' ? existing.completedByName : trustedAuthorization.current()?.displayName;
                if (displayName) row.completedByName = displayName;
            }
        } if(domain==='procurement'){if(raw.invoiceDrafts!==undefined&&raw.invoiceDrafts!==(existing?.invoiceDrafts??''))throw Error('Invoice drafts are managed by the server.');const docs=JSON.parse(row.documents||'{}');for(const meta of Object.values(docs) as Record<string,string>[]){if(meta.mode==='manual'){const manual=JSON.parse(meta.manual||'{}');if(!(snapshotRepositories().suppliers as {suppliers:{id:string;status:string}[]}).suppliers.some(s=>s.id===manual.supplierId&&s.status==='ACTIVE'))throw Error('Choose an active supplier for each manual invoice.');}}row.invoiceDrafts=JSON.stringify(refreshInvoiceDrafts({...row,code:row.code,links:row.links},readInvoiceDrafts(existing?.invoiceDrafts),(snapshotRepositories().purchaseOrders as {purchaseOrders:import('../purchases/types/purchaseOrder').PurchaseOrder[]}).purchaseOrders,businessDateKey(timestamp)));row.invoiceDrafts=ensureProcurementExpenseDrafts(row.invoiceDrafts);} validate(domain, row, configurationRows[domain]); configurationRows[domain] = [...configurationRows[domain].filter(r => r.id !== row.id), row]; log(domain, row, existing ? 'Updated' : 'Created'); emit(); return row; },
        savePaymentFollowup(raw:unknown){
            if(domain!=='tasks')throw Error('Payment follow-ups belong to tasks.');
            const input=z.object({id:z.string().optional(),revision:z.string().optional(),customerId:z.string().min(1),owner:z.string().min(1),ownerName:z.string().max(200),due:z.string(),reminderAt:z.string(),reminderTimeZone:z.string(),notes:z.string().min(1).max(16000)}).strict().parse(raw);
            const prior=input.id?repository.getById(input.id):undefined;
            if(input.id&&(!prior||prior.taskType!=='Payment'||!prior.paymentFollowupData||prior.customerId!==input.customerId))throw Error('Select a payment follow-up for this customer.');
            const profile=z.object({kind:z.literal('payment-followup-v1'),status:z.enum(['Not Contacted','Contacted','Promised to Pay','Paid']),last:z.string().optional(),note:z.string().max(4000).optional(),promiseDate:z.string().optional(),promiseAmount:z.string().optional(),history:z.array(z.object({at:z.string(),action:z.string().max(200),note:z.string().max(4000)})).max(100).optional()}).strict().parse(JSON.parse(input.notes));
            if(!(snapshotRepositories().customers as {customers:{id:string}[]}).customers.some(c=>c.id===input.customerId))throw Error('Select an existing customer.');
            new Intl.DateTimeFormat('en',{timeZone:input.reminderTimeZone});
            if(profile.kind!=='payment-followup-v1'||!['Not Contacted','Contacted','Promised to Pay','Paid'].includes(profile.status))throw Error('Invalid payment follow-up status.');
            if(profile.promiseDate&&!validDate(profile.promiseDate))throw Error('Enter a valid promised payment date.');
            if(profile.status==='Promised to Pay'&&(!profile.promiseDate||!Number.isFinite(Number(profile.promiseAmount))||Number(profile.promiseAmount)<=0))throw Error('Enter the promised amount and date.');
            return repository.save({...(prior??{}),name:'Payment follow-up',customerId:input.customerId,owner:input.owner,ownerName:input.ownerName,due:input.due,reminderAt:input.reminderAt,reminderTimeZone:input.reminderTimeZone,notes:profile.note||'Payment follow-up',paymentFollowupData:input.notes,taskType:'Payment',priority:'Normal',status:profile.status==='Paid'?'Completed':'In progress'},input.revision);
        },
        saveCampaign(raw:unknown){
            if(domain!=='promotions')throw Error('Invalid campaign register.');
            const input=z.object({id:z.string().optional(),name:z.string().trim().min(1).max(180),starts:z.string(),ends:z.string(),priority:z.string().default('10'),policy:z.enum(['Promotion first','Customer price first','Lowest eligible price']).default('Lowest eligible price'),code:z.string().trim().max(80).optional(),promotionType:z.enum(['Fixed Price','% Discount']).default('Fixed Price'),discountPercent:z.number().min(0).max(100).default(0),campaignStatus:z.enum(['Draft','Active']).default('Active'),notes:z.string().max(2000).default(''),customerIds:promotionCustomerIdsSchema.optional(),customerTypes:promotionAudienceSchema.optional(),expected:z.array(z.object({id:z.string(),revision:z.string()}).strict()),lines:z.array(z.object({productId:z.string(),unitId:z.string(),price:z.number().finite().nonnegative()}).strict()).max(100),remove:z.boolean().optional()}).strict().parse(raw);
            const old=input.id?configurationRows.promotions.filter(r=>(r.campaignId||r.id)===input.id&&r.deleted!=='true'):[];
            if(input.id&&!old.length)throw Error('Activity no longer exists. Reload.');
            if(old.length!==input.expected.length||old.some(r=>!input.expected.some(e=>e.id===r.id&&e.revision===r.revision)))throw Error('Activity changed. Reload before saving.');
            if(!input.remove&&!input.lines.length)throw Error('Add at least one product.');
            if(new Set(input.lines.map(l=>l.productId+':'+l.unitId)).size!==input.lines.length)throw Error('Each product / unit can appear only once.');
            const id=input.id??crypto.randomUUID(),kept=new Set<string>(),code=input.code||old[0]?.code||'PROM-'+new Date().getFullYear()+'-'+String(new Set(configurationRows.promotions.map(r=>r.campaignId||r.id)).size+1).padStart(3,'0');
            if(configurationRows.promotions.some(r=>(r.campaignId||r.id)!==id&&r.code===code&&r.deleted!=='true'))throw Error('Promotion code is already in use.');
            if(!input.remove)for(const line of input.lines){const previous=old.find(r=>r.productId===line.productId&&r.unitId===line.unitId);const saved=repository.save({...(previous??{}),campaignId:id,customerId:'',customerIds:JSON.stringify(input.customerIds??[]),customerTypes:JSON.stringify(input.customerTypes??promotionCustomerTypes),name:input.name,code,promotionType:input.promotionType,discountPercent:String(input.discountPercent),notes:input.notes,campaignStatus:input.campaignStatus,status:input.campaignStatus==='Draft'?'Inactive':'Active',deleted:'false',starts:input.starts,ends:input.ends,priority:input.priority,policy:'Lowest eligible price',productId:line.productId,unitId:line.unitId,price:String(input.promotionType==='% Discount'?Number(((getProductUnit(line.productId,line.unitId)?.basePrice??0)*(1-input.discountPercent/100)).toFixed(2)):line.price)},previous?.revision);kept.add(saved.id);}
            for(const row of old.filter(r=>!kept.has(r.id)))repository.save({...row,status:'Inactive',deleted:'true'},row.revision);
            return id;
        },
        changeCampaign(raw:unknown){if(domain!=='promotions')throw Error('Invalid promotion register.');const input=z.object({id:z.string(),action:z.enum(['Active','Paused','Ended','Archived']),expected:z.array(z.object({id:z.string(),revision:z.string()}).strict())}).strict().parse(raw),old=configurationRows.promotions.filter(r=>(r.campaignId||r.id)===input.id&&r.deleted!=='true');if(!old.length||old.length!==input.expected.length||old.some(r=>!input.expected.some(e=>e.id===r.id&&e.revision===r.revision)))throw Error('Promotion changed. Reload before updating.');for(const r of old)repository.save({...r,campaignStatus:input.action,status:input.action==='Active'?'Active':'Inactive',policy:'Lowest eligible price'},r.revision);return input.id;},
        savePromotionTask(raw:unknown):ConfigRow{if(domain!=='promotions')throw Error('Invalid promotion register.');const input=z.object({campaignId:z.string(),name:z.string().trim().min(1).max(180),due:z.string(),notes:z.string().max(2000).default('')}).strict().parse(raw),campaign=configurationRows.promotions.find(r=>(r.campaignId||r.id)===input.campaignId&&r.deleted!=='true');if(!campaign)throw Error('Promotion no longer exists.');return workspaceRepositories.tasks.save({promotionId:input.campaignId,customerId:'',name:input.name,due:input.due,owner:trustedAuthorization.current()!.userId,ownerName:trustedAuthorization.current()?.displayName??trustedAuthorization.current()!.userId,status:'Open',priority:'Normal',taskType:'Other',notes:'Promotion ['+input.campaignId+'] · '+campaign.name+' · '+input.notes});},
        changePromotionTask(raw:unknown):ConfigRow{if(domain!=='promotions')throw Error('Invalid promotion register.');const input=z.object({campaignId:z.string(),taskId:z.string(),revision:z.string(),status:z.enum(['Open','In progress','Completed'])}).strict().parse(raw),task=workspaceRepositories.tasks.getById(input.taskId);if(!task||task.promotionId!==input.campaignId)throw Error('Task does not belong to this promotion.');return workspaceRepositories.tasks.save({...task,status:input.status},input.revision);},
        reviewInvoice(id:string,draftId:string,action:'approve'|'post',expectedRevision:string){
            if(domain!=='procurement')throw Error('Not a procurement batch.');if(!['approve','post'].includes(action))throw Error('Invalid invoice review action.');
            const principal=trustedAuthorization.require(action==='approve'?'accounting.post':'purchases.bill');
            const row=repository.getById(id);if(!row||row.revision!==expectedRevision)throw Error('Record changed. Reload before saving.');
            const drafts=readInvoiceDrafts(row.invoiceDrafts),draft=drafts.find(d=>d.id===draftId);if(!draft)throw Error('Invoice draft not found.');
            if(draft.status==='POSTED')return row;
            if(!draft.supplierInvoiceNumber.trim()||(!draft.manual&&(!draft.lines.some(l=>l.quantity>0))))throw Error('Complete the invoice reference and lines before review.');
            if(draft.manual){const supplier=(snapshotRepositories().suppliers as {suppliers:{id:string;status:string}[]}).suppliers.find(s=>s.id===draft.manual!.supplierId);if(!supplier||supplier.status!=='ACTIVE')throw Error('Choose an active supplier.');}

            if(draft.expenseDraftId){const entry=expenseDraftRepository.getAll().find(d=>d.id===draft.expenseDraftId);if(!entry)throw Error('Linked Supplier Invoice draft not found.');if(action==='approve')expenseDraftRepository.approve(entry.id,entry.revision);else expenseDraftRepository.post(entry.id,entry.revision);return repository.getById(id)!;}
            if(action==='approve'){if(draft.status!=='DRAFT')return row;if(draft.manual&&draft.role!=='Materials'){
                const payload=procurementExpensePayload(draft);
                const entry=expenseDraftRepository.save({operationId:'procurement:'+draft.id,payload});const approved=expenseDraftRepository.approve(entry.id,entry.revision);draft.expenseDraftId=approved.id;
            }draft.status='APPROVED';draft.approvedBy=principal.userId;draft.approvedAt=now();}
            else {if(draft.status!=='APPROVED')throw Error('Accounting approval is required before posting.');if(draft.manual&&draft.role==='Materials')throw Error('Match this material invoice to received purchase-order lines in the purchase billing workflow before posting; stock is not posted as an expense.');
                if(!draft.manual&&(draft.purchaseOrderIds??[draft.purchaseOrderId]).length!==1)throw Error('Match the multiple purchase orders to this invoice before posting.');
                const bill=draft.expenseDraftId?(()=>{const entry=expenseDraftRepository.getAll().find(d=>d.id===draft.expenseDraftId)!;const posted=expenseDraftRepository.post(entry.id,entry.revision);return {id:posted.documentId!};})():supplierBillRepository.create({purchaseOrderId:draft.purchaseOrderId,supplierInvoiceNumber:draft.supplierInvoiceNumber,billDate:draft.billDate,dueDate:draft.dueDate,lines:draft.lines.filter(l=>l.quantity>0)});draft.status='POSTED';draft.billId=bill.id;}
            const updated={...row,invoiceDrafts:JSON.stringify(drafts),revision:String(Number(row.revision)+1),updatedAt:now()};configurationRows[domain]=configurationRows[domain].map(r=>r.id===id?updated:r);log(domain,updated,action==='approve'?'Invoice draft approved':'Invoice draft posted');emit();return updated;
        },
        setStatus(id: string, status: string, expectedRevision: string) { const row = repository.getById(id); if (!row)
            throw new Error('Record was not found.'); return repository.save({ ...row, status }, expectedRevision); },
        addNote(id: string, note: string) { const row = repository.getById(id); if (!row || domain !== 'tasks' || !note.trim() || note.length > 4000)
            throw new Error('A valid task note is required.'); if(row.promotionId)trustedAuthorization.require('promotions.manage'); log(domain, { ...row, note: note.trim() }, 'Note added'); emit(); },
    };
    registerRepository('workspace_' + domain.replaceAll('-', '_'), { validate: (value, snapshots) => { validateConfigurationSnapshot(domain, value); validateConfigurationReferences(domain, value, snapshots); }, repository, read: workspaceDomains[domain].read, commands: { savePaymentFollowup:domain==='tasks'?'sales.manage':null, changePromotionTask:domain==='promotions'?'promotions.manage':null,changeCampaign:domain==='promotions'?'promotions.manage':null,savePromotionTask:domain==='promotions'?'promotions.manage':null,saveCampaign:domain==='promotions'?'promotions.manage':null, reviewInvoice:domain==='procurement'?'purchases.read':null, previewBulkStatus:workspaceDomains[domain].write, bulkStatus:workspaceDomains[domain].write, run: domain==='custom-reports'?'accounting.read':null, generate: domain==='report-packs'?'accounting.read':null, save: workspaceDomains[domain].write, setStatus: workspaceDomains[domain].write, addNote: domain === 'tasks' ? 'sales.write' : null }, snapshot: () => ({ records: configurationRows[domain], history: configurationHistory[domain] }), restore: value => { validateConfigurationSnapshot(domain, value); configurationRows[domain] = value.records; configurationHistory[domain] = value.history; }, publish: emit });
    return [domain, repository];
}));
export function validateConfigurationSnapshot(domain: string, value: unknown) { const snapshot = z.object({ records: z.array(strings), history: z.array(strings) }).strict().parse(value); const ids = new Set<string>(); for (const row of snapshot.records) {
    if (!row.id || ids.has(row.id) || !/^\d+$/.test(row.revision))
        throw new Error('Invalid workspace record identity.');
    ids.add(row.id);
    validate(domain, row, snapshot.records as ConfigRow[], false);
} if(domain && snapshot.history.some(h=>h.batchId)) {
    const batches=new Map<string,typeof snapshot.history>();for(const h of snapshot.history)if(h.batchId)batches.set(h.batchId,[...(batches.get(h.batchId)??[]),h]);
    for(const [batchId,entries] of batches){const request=JSON.parse(entries[0].batchRequest),input=parseBulkStatus(domain,{operationId:batchId,...request});if(entries.length!==input.rows.length||new Set(entries.map(h=>h.recordId)).size!==entries.length||entries.some(h=>h.batchRequest!==entries[0].batchRequest||!h.actorId||h.actorId!==entries[0].actorId))throw new Error('Incomplete or inconsistent bulk audit.');
        for(const h of entries){const r=input.rows.find(r=>r.id===h.recordId),after=strings.parse(JSON.parse(h.after));if(!r||after.id!==r.id||after.status!==input.status||Number(after.revision)!==Number(r.expectedRevision)+1)throw new Error('Bulk audit result does not match the reviewed request.');validate(domain,after,[],false);}
    }
} return snapshot; }
export function useWorkspaceRecords(domain: string) { useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => revision, () => revision); return configurationRows[domain] ?? []; }
export { systemRoles };
function validateConfigurationReferences(domain: string, value: unknown, snapshots: Record<string, unknown>) {
    const records = (value as {
        records: ConfigRow[];
    }).records;
    const accounts = (snapshots.accounts as {
        accounts: {
            id: string;
            type: string;
        }[];
    }).accounts;
    const products = (snapshots.products as {
        products: {
            id: string;
            units: {
                id: string;
            }[];
        }[];
    }).products;
    const customers = (snapshots.customers as {
        customers: {
            id: string;
        }[];
    }).customers;
    const taxes = (snapshots.workspace_tax_codes as {
        records: ConfigRow[];
    }).records;
    for (const row of records) {
        if(domain==='procurement')validateProcurement(row,records,(snapshots.purchaseOrders as {purchaseOrders:import('../purchases/types/purchaseOrder').PurchaseOrder[]}).purchaseOrders,(snapshots.supplierBills as {supplierBills:import('../purchases/types/supplierBill').SupplierBill[]}).supplierBills);
        if(domain==='tasks'){validateInternalTaskSource(row,snapshots as Record<string,any>);const sales=snapshots.sales as {salesOrders:TaskDocument[];invoices:TaskDocument[]};validateTaskDocument(row.documentType,row.documentId,row.customerId,sales.salesOrders,sales.invoices,'customerId');}
        if(domain==='clearances'){const p=(snapshots.products as {products:import('../inventory/types/product').Product[]}).products.find(p=>p.id===row.productId),source=(snapshots.costMovements as {movements:import('../inventory/types/inventoryCost').InventoryCostMovement[]}).movements.find(c=>c.id===row.batchId&&c.productId===row.productId&&c.siteId===row.siteId&&c.quantityBase>0);if(!p||p.baseUnitId!==row.unitId||!source||Number(row.initialQuantity)>source.quantityBase)throw Error('Backup clearance batch reference is invalid.');}
        if(domain==='rebates'&&(!customers.some(c=>c.id===row.customerId)||!products.some(p=>p.id===row.productId)))throw Error('Backup rebate reference is invalid.');
        if(domain==='promotions'&&readPromotionCustomerIds(row.customerIds).some(id=>!customers.some(c=>c.id===id)))throw Error('Backup promotion customer reference is invalid.');
        if (row.customerId && !customers.some(c => c.id === row.customerId))
            throw new Error('Backup workspace customer reference is invalid.');
        if (domain === 'promotions' && !products.some(p => p.id === row.productId && p.units.some(u => u.id === row.unitId)))
            throw new Error('Backup promotion product/unit reference is invalid.');
        if (domain === 'tax-codes' && (!accounts.some(a => a.id === row.collected && a.type === 'LIABILITY') || !accounts.some(a => a.id === row.paid && a.type === 'ASSET')))
            throw new Error('Backup tax account reference is invalid.');
        if (['bank-rules', 'linked-accounts'].includes(domain) && !accounts.some(a => a.id === row.accountId))
            throw new Error('Backup linked account reference is invalid.');
        if(domain==='bank-rules'&&row.bankAccountId&&row.bankAccountId!=='ALL'&&!(snapshots.bankAccounts as {bankAccounts:{id:string}[]}).bankAccounts.some(b=>b.id===row.bankAccountId))throw new Error('Backup bank-rule scope reference is invalid.');
        if (domain === 'bank-rules' && !taxes.some(t => t.code === row.taxCode))
            throw new Error('Backup bank-rule tax reference is invalid.');
    }
}

onProcurementExpenseDraftChange(entry=>{
 if(procurementExpenseWrite||!entry.operationId.startsWith('procurement:')||entry.payload.kind!=='EXPENSE')return;
 for(const row of configurationRows.procurement??[]){const drafts=readInvoiceDrafts(row.invoiceDrafts),draft=drafts.find(d=>d.expenseDraftId===entry.id);if(!draft)continue;
  const payload=entry.payload;const docs=readDocuments(row.documents);const key=draft.role==='Freight'?'freight':'customs';
  const manual={supplierId:payload.supplierId,...(payload.fx?{fx:payload.fx}:{}),lines:payload.lines.map((l,i)=>({accountId:l.accountId,taxCode:l.taxCode,description:l.description,quantity:l.quantity,unitSymbol:draft.manual?.lines[i]?.unitSymbol??'Charge',unitCost:l.unitCost,taxRate:entry.lines[i].taxRate??taxSnapshot(l.taxCode).taxRate,priceBasis:l.priceBasis??'Exclusive'}))};
  draft.manual=manual;draft.supplierInvoiceNumber=payload.supplierInvoiceNumber;draft.billDate=payload.documentDate;draft.dueDate=payload.dueDate??'';draft.status=entry.status;
  if(entry.status==='APPROVED'){draft.approvedBy=entry.history.at(-1)?.actorId;draft.approvedAt=entry.updatedAt;}if(entry.status==='DRAFT'){delete draft.approvedBy;delete draft.approvedAt;}if(entry.documentId)draft.billId=entry.documentId;
  docs[key]={...docs[key],mode:'manual',manual:JSON.stringify(manual),invoice:payload.supplierInvoiceNumber,invoiceDate:payload.documentDate,dueDate:payload.dueDate??''};
  const updated={...row,documents:JSON.stringify(docs),invoiceDrafts:JSON.stringify(drafts),revision:String(Number(row.revision)+1),updatedAt:now()};configurationRows.procurement=configurationRows.procurement.map(r=>r.id===row.id?updated:r);log('procurement',updated,'Supplier Invoice '+entry.status);emit();
 }
});
