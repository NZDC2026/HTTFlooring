import {describe,it,expect} from 'vitest';
import {migrateWorkspaceSnapshot,sealDatabase,parseDatabase,type Database} from './businessSnapshot';
import {createHash} from 'node:crypto';
describe('sales claims schema migration',()=>{
 it('adds an empty claim register to schema 39 while preserving all financial and stock snapshots',()=>{
  const repositories={products:{products:[{id:'keep'}]},journals:{journalEntries:[{id:'keep-entry'}]},stock:{balances:[{quantityOnHand:99}]}};
  const db={schemaVersion:39,storage:{'htt:keep':'unchanged'},repositories:structuredClone(repositories)} as unknown as Database;
  expect(migrateWorkspaceSnapshot(db,{workspace_sales_claims:{records:[],history:[]}})).toBe(true);
  expect(db.repositories.workspace_sales_claims).toEqual({records:[],history:[]});
  for(const key of Object.keys(repositories))expect(db.repositories[key]).toEqual(repositories[key as keyof typeof repositories]);
  const sealed=sealDatabase(db);expect(sealed.schemaVersion).toBe(44);expect(parseDatabase(JSON.stringify(sealed))).toEqual(sealed);
 });
 it('rejects claim records falsely labelled as a legacy schema',()=>{
  const body={schemaVersion:39,savedAt:'2026-11-18T00:00:00Z',storage:{},repositories:{workspace_sales_claims:{records:[{id:'claim'}],history:[]}}};
  const db={...body,checksum:createHash('sha256').update(JSON.stringify(body)).digest('hex')};expect(()=>parseDatabase(JSON.stringify(db))).toThrow('schema 40');
 });
});
