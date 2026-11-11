import {describe,it,expect} from 'vitest';
import {agingBucket,overdueDays} from './receivablesAging';
describe('due-date receivables aging',()=>{
 it('separates current and all inclusive overdue boundaries',()=>{
  expect([0,1,30,31,60,61,90,91].map(agingBucket)).toEqual([0,1,1,2,2,3,3,4]);
 });
 it('counts calendar days across month and leap-year boundaries',()=>{
  expect(overdueDays('2024-02-28','2024-03-01')).toBe(2);
  expect(overdueDays('2026-11-12','2026-11-11')).toBe(0);
  expect(overdueDays('2026-11-11','2026-11-11')).toBe(0);
 });
});
