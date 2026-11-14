import {describe,it,expect} from 'vitest';
import {createHash} from 'node:crypto';
import {migrateWorkspaceSnapshot,sealDatabase,parseDatabase,type Database} from './businessSnapshot';
describe('clearance snapshot migration',()=>{
 it('adds an empty register to version 37 without changing business records or storage',()=>{const repositories={products:{products:[{id:'keep-product'}]},journals:{journalEntries:[{id:'keep-journal'}]}},db={schemaVersion:37,storage:{'htt:keep':'keep'},repositories:structuredClone(repositories)} as unknown as Database;expect(migrateWorkspaceSnapshot(db,{workspace_clearances:{records:[],history:[]}})).toBe(true);expect(db.repositories.products).toEqual(repositories.products);expect(db.repositories.journals).toEqual(repositories.journals);expect(db.storage).toEqual({'htt:keep':'keep'});expect(db.repositories.workspace_clearances).toEqual({records:[],history:[]});expect(sealDatabase(db).schemaVersion).toBe(38);});
 it('rejects down-versioned clearance evidence even with a valid checksum',()=>{const body={schemaVersion:37,savedAt:'2026-11-14T00:00:00Z',storage:{},repositories:{workspace_clearances:{records:[{id:'clearance'}],history:[]}}};const db={...body,checksum:createHash('sha256').update(JSON.stringify(body)).digest('hex')};expect(()=>parseDatabase(JSON.stringify(db))).toThrow('requires snapshot schema 38');});
});
