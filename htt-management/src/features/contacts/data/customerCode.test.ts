import { describe, expect, it } from 'vitest';
import { customerCodeRegion, nextCustomerCode } from './customerCode';

describe('regional customer codes', () => {
 it('uses the passed unfiltered count for the preview', () => {
  expect(nextCustomerCode([], 5, 'VIC')).toBe('VIC-CUST-0006');
  expect(nextCustomerCode([], 600, 'NSW')).toBe('NSW-CUST-0601');
 });
 it('uses the current repository count at save and skips occupied codes', () => {
  expect(nextCustomerCode([{code:'VIC-CUST-0002'}], undefined, 'VIC')).toBe('VIC-CUST-0003');
  expect(nextCustomerCode([{code:'CUST-0009'}], undefined, 'NSW')).toBe('NSW-CUST-0002');
 });
 it('derives region from the account business workspace', () => {
  expect(customerCodeRegion({companyName:'HTT Flooring Melbourne'})).toBe('VIC');
  expect(customerCodeRegion({companyName:'HTT Flooring Sydney'})).toBe('NSW');
  expect(customerCodeRegion({state:'NSW'})).toBe('NSW');
 });
});
