import {describe,expect,it} from 'vitest';
import {daysUntilExpiry,expiryText,validateProductBatchMetadata} from './stockBatchExpiryModel';
import {samplePriceProducts} from '../price-updates/priceUpdateModel';
describe('batch expiry',()=>{
 it('uses calendar dates and includes fully reserved expiring stock',()=>{expect(daysUntilExpiry('2026-12-02','2026-11-16')).toBe(16);expect(daysUntilExpiry('2026-11-16','2026-11-16')).toBe(0);expect(expiryText(0)).toBe('Expires today');expect(expiryText(-1)).toBe('1 days overdue');expect(expiryText(145)).toBe('5 months left');});
 it('accepts only real receipt references from the same product and warehouse',()=>{const p=samplePriceProducts()[0],receipt={id:'receipt',siteId:'site',productId:p.id,quantityBase:20};const value={...p,batchMetadata:[{batchId:'receipt',siteId:'site',expiresOn:'2026-12-02'}]};expect(()=>validateProductBatchMetadata(value,[receipt])).not.toThrow();for(const patch of [{productId:'other'},{siteId:'other'},{quantityBase:-20}])expect(()=>validateProductBatchMetadata(value,[{...receipt,...patch}])).toThrow(/receipt/);expect(()=>validateProductBatchMetadata({...value,batchMetadata:[...value.batchMetadata,...value.batchMetadata]},[receipt])).toThrow();expect(receipt.quantityBase).toBe(20);});
});
