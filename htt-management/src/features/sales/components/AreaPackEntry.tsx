import { areaPackSize, areaQuantity } from '../data/areaPacks';
export function AreaPackEntry({ productId, unitId, value, onChange }: {
    productId: string;
    unitId: string;
    value?: number;
    onChange: (area?: number) => void;
}) {
    const size = areaPackSize(productId, unitId);
    if (!size)
        return null;
    let summary = '';
    try {
        if (value !== undefined) {
            const result = areaQuantity(productId, unitId, 1, value);
            summary = `${result.quantity} whole packs · ${result.coveredArea} m² covered · ${Math.max(0, (result.coveredArea ?? 0) - value).toFixed(4)} m² extra`;
        }
    }
    catch {
        summary = 'Enter a valid positive area.';
    }
    return <label className="block text-xs text-slate-600">Required area (m²)<input aria-label="Required area (m²)" className="my-1 w-full rounded border p-2" type="number" min="0.00000001" step="any" value={value ?? ''} onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}/><span className="block">{summary || `${size} m² per pack. Blank uses quantity.`}</span></label>;
}
export function AreaPackSummary({ line }: {
    line: {
        requestedArea?: number;
        coveredArea?: number;
        areaPerPack?: number;
    };
}) { return line.areaPerPack ? <p className="text-xs text-slate-500">{line.requestedArea !== undefined ? `${line.requestedArea} m² required · ` : ''}{line.coveredArea} m² covered ({line.areaPerPack} m²/pack)</p> : null; }
