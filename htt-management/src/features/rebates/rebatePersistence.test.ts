import {expect,it} from 'vitest';
import {migrateWorkspaceSnapshot,sealDatabase,parseDatabase,validateRepositories} from '../../../electron/security/businessSnapshot';
it('adds an empty rebate register to v36 without replacing existing business records',()=>{
 const old={schemaVersion:36 as const,storage:{},repositories:{sales:{invoices:[{id:'invoice-preserved'}]}}};
 const database={...sealDatabase(old),schemaVersion:36 as const};
 const shape={...database.repositories,workspace_supply_planning:{records:[],history:[]},workspace_rebates:{records:[],history:[]},salesBatches:{batches:[]},workspace_clearances:{records:[],history:[]},workspace_sales_claims:{records:[],history:[]},workspace_customer_displays:{records:[],history:[]},workspace_rebate_workspace:{records:[],history:[]}};
 expect(migrateWorkspaceSnapshot(database,shape)).toBe(true);
 expect(database.repositories.sales).toEqual({invoices:[{id:'invoice-preserved'}]});
 validateRepositories(database.repositories,shape);
 const saved=sealDatabase(database);expect(saved.schemaVersion).toBe(44);expect(parseDatabase(JSON.stringify(saved))).toEqual(saved);
});
