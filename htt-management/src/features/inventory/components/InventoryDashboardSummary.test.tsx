import { renderToStaticMarkup } from 'react-dom/server';
import { describe,it,expect } from 'vitest';
import { InventoryDashboardSummary,inventoryUnit } from './InventoryDashboardSummary';
import { samples } from '../data/inventorySamples';
describe('inventory dashboard summaries',()=>{
 it('groups stock by unit and shows sample valuation without LM',()=>{const html=renderToStaticMarkup(<InventoryDashboardSummary items={samples} canCost sample/>);expect(html).toContain('Stock Overview by Unit');expect(html).toContain('Engineered Timber');expect(html).toContain('Stock Value by Category');expect(html).toContain('Sample');expect(html).not.toContain('>LM<');expect(inventoryUnit('boxes')).toBe('Box');});
 it('keeps valuation hidden without cost access',()=>{const html=renderToStaticMarkup(<InventoryDashboardSummary items={samples} canCost={false} sample/>);expect(html).not.toContain('Total Value');expect(html).toContain('Cost access is required');});
});
