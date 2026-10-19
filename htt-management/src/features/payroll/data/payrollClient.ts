import { useSyncExternalStore } from 'react';
import { registerRepository } from '../../security/repositoryHost';
import { emptyPayroll, type PayrollState } from './payrollModel';
let state = emptyPayroll(), version = 0;
const listeners = new Set<() => void>();
const required = (_input?: any): any => { throw new Error('Use the secure desktop application.'); };
export const payrollClient = { setupDefaults: required, saveEmployee: required, saveItem: required, saveSettings: required, saveTime: required, changeTime: required, saveLeave: required, changeLeave: required, saveRun: required, changeRun: required, recordPayment: required, reversePayment: required, recordFiling: required, balances: required, obligations: required, exportRun: required, exportSlip: required };
registerRepository('payroll', { repository: payrollClient, read: 'payroll.read', commands: { setupDefaults: 'payroll.manage', saveEmployee: 'payroll.manage', saveItem: 'payroll.manage', saveSettings: 'payroll.manage', saveTime: 'payroll.manage', changeTime: 'payroll.manage', saveLeave: 'payroll.manage', changeLeave: 'payroll.manage', saveRun: 'payroll.manage', changeRun: 'payroll.manage', recordPayment: 'payroll.post', reversePayment: 'payroll.post', recordFiling: 'payroll.manage', balances: 'payroll.read', obligations: 'payroll.read', exportRun: 'payroll.read', exportSlip: 'payroll.read' }, snapshot: () => state, restore: v => { state = v; }, publish: () => { version++; listeners.forEach(f => f()); } });
export function usePayroll(): PayrollState { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); return state; }
