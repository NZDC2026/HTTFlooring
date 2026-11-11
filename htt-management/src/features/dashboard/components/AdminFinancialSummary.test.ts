import {expect,it} from 'vitest';
import {adminSummaryPeriods} from './AdminFinancialSummary';
it('uses the configured financial YTD and comparable last-year dates including leap day',()=>{
 expect(adminSummaryPeriods('2026-11-12')).toEqual({from:'2026-07-01',to:'2026-11-12',priorFrom:'2025-07-01',priorTo:'2025-11-12'});
 expect(adminSummaryPeriods('2024-02-29')).toEqual({from:'2023-07-01',to:'2024-02-29',priorFrom:'2022-07-01',priorTo:'2023-02-28'});
 expect(adminSummaryPeriods('2026-07-01').from).toBe('2026-07-01');
 expect(adminSummaryPeriods('2026-06-30').from).toBe('2025-07-01');
});
