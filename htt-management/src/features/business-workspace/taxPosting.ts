import { accountRepository } from '../accounting/data/accountRepository';
export function taxPostingLines(lines: {
    taxAmount: number;
    taxPaidAccountId?: string;
    taxCollectedAccountId?: string;
}[], direction: 'paid' | 'collected', debit: boolean, fallback: number) {
    const role = direction === 'paid' ? 'GST_RECEIVABLE' : 'GST_PAYABLE';
    const groups = new Map<string, number>();
    for (const line of lines) {
        const id = (direction === 'paid' ? line.taxPaidAccountId : line.taxCollectedAccountId) || accountRepository.requireBySystemRole(role).id;
        groups.set(id, (groups.get(id) ?? 0) + line.taxAmount);
    }
    if (!lines.length)
        groups.set(accountRepository.requireBySystemRole(role).id, fallback);
    return [...groups].filter(([, value]) => Math.round((value + Number.EPSILON) * 100) !== 0).map(([accountId, value]) => { const amount = Math.round((value + Number.EPSILON) * 100) / 100; return { accountId, debit: debit ? amount : 0, credit: debit ? 0 : amount }; });
}
