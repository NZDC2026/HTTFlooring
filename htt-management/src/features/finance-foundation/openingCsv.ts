import { parseCsv } from '../page-previews/previewModel';
import type { OpeningInput } from './openingBalanceRepository';
export const openingCsvHeader = 'kind,id,reference,date,dueDate,debit,credit,amount,site,quantity,unitCost';
export function parseOpeningCsv(csv: string, meta: {
    operationId: string;
    date: string;
    reason: string;
}): OpeningInput {
    if (csv.length > 10000000)
        throw new Error('CSV exceeds 10 MB.');
    const [header, ...rows] = parseCsv(csv.replace(/^\uFEFF/, ''));
    if (header?.join(',') !== openingCsvHeader)
        throw new Error('Use the opening CSV template and its exact column headings.');
    if (rows.length > 20000)
        throw new Error('Too many CSV rows.');
    const result: OpeningInput = { ...meta, gl: [], ar: [], ap: [], banks: [], stock: [] };
    for (const [i, row] of rows.entries()) {
        if (row.length !== 11)
            throw new Error(`CSV row ${i + 2}: expected 11 columns.`);
        const [kind, id, reference, date, dueDate, debit, credit, amount, site, quantity, unitCost] = row.map(v => v.trim());
        const n = (s: string) => {
            if (!s || !/^[-+]?\d+(\.\d+)?$/.test(s) || !Number.isFinite(Number(s)))
                throw new Error(`CSV row ${i + 2}: invalid number.`);
            return Number(s);
        };
        if (kind === 'GL')
            result.gl.push({ accountId: id, debit: n(debit || '0'), credit: n(credit || '0') });
        else if (kind === 'AR' || kind === 'AP')
            result[kind === 'AR' ? 'ar' : 'ap'].push({ contactId: id, reference, date, dueDate, amount: n(amount) });
        else if (kind === 'BANK')
            result.banks.push({ bankAccountId: id, amount: n(amount) });
        else if (kind === 'STOCK')
            result.stock.push({ productId: id, siteId: site, quantity: n(quantity), unitCost: n(unitCost) });
        else
            throw new Error(`CSV row ${i + 2}: kind must be GL, AR, AP, BANK or STOCK.`);
    }
    return result;
}
