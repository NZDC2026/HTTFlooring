import type { SalesDocumentLine } from '../types/salesDocument';
export function ItemTypeSummary({ line }: {
    line: Pick<SalesDocumentLine, 'itemType'>;
}) { return line.itemType && line.itemType !== 'STOCK' ? <p className="text-xs text-slate-500">{line.itemType === 'SERVICE' ? 'Service' : 'Non-stock'} · No inventory dispatch</p> : null; }
