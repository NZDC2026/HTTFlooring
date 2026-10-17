import { getProductById } from '../../inventory/data/mockProducts';
export function areaPackSize(productId: string, unitId: string): number | undefined {
    const p = getProductById(productId), unit = p?.units.find(u => u.id === unitId), base = p?.units.find(u => u.id === p.baseUnitId);
    return p?.status === 'ACTIVE' && p.itemType !== 'SERVICE' && unit?.active && base?.code === 'M2' && ['BOX', 'ROLL'].includes(unit.code) && Number.isFinite(unit.conversionToBase) && unit.conversionToBase > 0 ? unit.conversionToBase : undefined;
}
export function areaQuantity(productId: string, unitId: string, quantity: number, requestedArea?: number) {
    if (requestedArea === undefined)
        return { quantity };
    const areaPerPack = areaPackSize(productId, unitId);
    if (!areaPerPack)
        throw new Error('Area entry requires an active box or roll with an m² base unit.');
    if (!Number.isFinite(requestedArea) || requestedArea <= 0 || requestedArea > 1e9)
        throw new Error('Requested area must be finite, positive and no greater than 1,000,000,000 m².');
    // Remove floating point noise at exact pack boundaries, without under-covering a real decimal requirement.
    const ratio = requestedArea / areaPerPack, nearest = Math.round(ratio);
    const packs = nearest > 0 && Math.abs(ratio - nearest) <= Number.EPSILON * Math.max(1, Math.abs(ratio)) * 4 ? nearest : Math.ceil(ratio);
    if (!Number.isSafeInteger(packs) || packs <= 0)
        throw new Error('Invalid pack quantity.');
    return { quantity: packs, requestedArea, areaPerPack, coveredArea: Math.round(packs * areaPerPack * 1e8) / 1e8 };
}
export function validateAreaSnapshot(line: {
    quantity: number;
    requestedArea?: number;
    areaPerPack?: number;
    coveredArea?: number;
}) {
    if (line.requestedArea === undefined && line.areaPerPack === undefined && line.coveredArea === undefined)
        return;
    if (!Number.isFinite(line.areaPerPack) || !line.areaPerPack || line.areaPerPack <= 0 || !Number.isFinite(line.coveredArea) || Math.abs(line.coveredArea! - line.quantity * line.areaPerPack) > 1e-7)
        throw new Error('Invalid saved pack coverage.');
    if (line.requestedArea !== undefined) {
        const ratio = line.requestedArea / line.areaPerPack, nearest = Math.round(ratio), packs = nearest > 0 && Math.abs(ratio - nearest) <= Number.EPSILON * Math.max(1, Math.abs(ratio)) * 4 ? nearest : Math.ceil(ratio);
        if (!Number.isFinite(line.requestedArea) || line.requestedArea <= 0 || line.requestedArea > 1e9 || line.quantity !== packs)
            throw new Error('Invalid saved area quantity.');
    }
}
