import { describe,it,expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DateRangePicker,dateRangePreset,calendarDays } from './DateRangePicker';
describe('shared inclusive reporting dates',()=>{
 it('handles calendar and fiscal boundaries',()=>{
  expect(dateRangePreset('Last Month','2024-03-10')).toEqual({from:'2024-02-01',to:'2024-02-29'});
  expect(dateRangePreset('Last Month','2026-01-10')).toEqual({from:'2025-12-01',to:'2025-12-31'});
  expect(dateRangePreset('This Month','2026-11-11')).toEqual({from:'2026-11-01',to:'2026-11-30'});
  expect(dateRangePreset('This Month','2024-02-10')).toEqual({from:'2024-02-01',to:'2024-02-29'});
  expect(dateRangePreset('This Month','2026-12-10')).toEqual({from:'2026-12-01',to:'2026-12-31'});
  expect(dateRangePreset('Today','2026-11-10')).toEqual({from:'2026-11-10',to:'2026-11-10'});
  expect(dateRangePreset('1 month','2024-02-29')).toEqual({from:'2024-02-01',to:'2024-02-29'});
  expect(dateRangePreset('3 months','2026-01-10')).toEqual({from:'2025-11-01',to:'2026-01-10'});
  expect(dateRangePreset('This Week','2026-11-01')).toEqual({from:'2026-10-26',to:'2026-11-01'});
  expect(dateRangePreset('YTD','2026-11-10')).toEqual({from:'2026-07-01',to:'2026-11-10'});
  expect(dateRangePreset('All dates','2026-11-10')).toEqual({from:'',to:''});
 });
 it('lays out Monday-first calendars across year and leap-day boundaries',()=>{
  const november=calendarDays('2026-11-01');expect(november).toHaveLength(42);expect(november[0]).toBe('2026-10-26');expect(november[6]).toBe('2026-11-01');
  expect(calendarDays('2024-02-01')).toContain('2024-02-29');expect(calendarDays('2027-01-01')[0]).toBe('2026-12-28');
 });
 it('renders formatted start/end buttons that open the custom dialog',()=>{
  const html=renderToStaticMarkup(<DateRangePicker from="2026-10-01" to="2026-11-10" allowEmpty={false} onChange={()=>{}}/>);
  expect(html).toContain('Date Range from');expect(html).toContain('Date Range to');
  expect(html).toContain('01 Oct 2026');expect(html).toContain('10 Nov 2026');expect(html).toContain('aria-haspopup="dialog"');
  expect(html).not.toContain('Quick Date');expect(html).not.toContain('All dates');
 });
});
