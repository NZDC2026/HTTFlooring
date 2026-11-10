import { describe, expect, it } from 'vitest';
import { nextSupplierCode } from './supplierCode';
describe('supplier codes', () => {
 it('uses the supplied total and region', () => {
  expect(nextSupplierCode([],3,'VIC')).toBe('VIC-SUP-0004');
  expect(nextSupplierCode([],600,'NSW')).toBe('NSW-SUP-0601');
 });
 it('uses repository totals and avoids duplicates when saving', () => {
  expect(nextSupplierCode([{code:'SUP-0009'}],undefined,'VIC')).toBe('VIC-SUP-0002');
  expect(nextSupplierCode([{code:'NSW-SUP-0002'}],undefined,'NSW')).toBe('NSW-SUP-0003');
 });
});
