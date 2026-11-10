import {it,expect} from 'vitest';
import {listStateKey,readListState,writeListState} from './useListState';
import {rememberListLocation,listReturnLocation} from '../layouts/listReturnLocation';
it('restores list search, filters, dates and pagination after leaving the page',()=>{
 const key=listStateKey('sample-admin','/sales','Sample list');const value={query:'Sample Harbour',status:'ISSUED',dateFrom:'2026-10-01',dateTo:'2026-10-31',pagination:{pageIndex:3,pageSize:25}};
 writeListState(key,value);expect(readListState(key,{})).toEqual(value);
});
it('isolates users, routes and tables',()=>{writeListState(listStateKey('u1','/sales','table:a'),{page:2});for(const key of [listStateKey('u2','/sales','table:a'),listStateKey('u1','/purchases','table:a'),listStateKey('u1','/sales','table:b')])expect(readListState(key,{page:0})).toEqual({page:0});});
it('retains URL-based warehouse and date filters on legacy Back links',()=>{rememberListLocation('u1','/inventory','?site=melb&from=2026-10-01');expect(listReturnLocation('u1','/inventory')).toBe('/inventory?site=melb&from=2026-10-01');expect(listReturnLocation('u2','/inventory')).toBe('/inventory');expect(listReturnLocation('u1','/inventory?site=syd')).toBe('/inventory?site=syd');});
it('does not persist anonymous state',()=>{writeListState('',{query:'private'});expect(readListState('',{query:''})).toEqual({query:''});});
