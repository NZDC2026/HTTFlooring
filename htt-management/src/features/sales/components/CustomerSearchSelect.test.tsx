import {describe,it,expect} from 'vitest';
import {customerSearchMatches} from './CustomerSearchSelect';
describe('customer search',()=>{
 const c={id:'a',code:'CUST-0601',businessName:'Sydney Flooring',tradingName:'Harbour Trade',email:'accounts@example.invalid',phone:'02 9000 0601',contacts:[{id:'c',firstName:'Jamie',lastName:'Lee',email:'jamie@example.invalid',mobile:'0412 345 678',isPrimary:true}]};
 it('finds customers by multiple words, code and contact details',()=>{for(const q of ['sydney flooring','0601','Harbour','Jamie Lee','0412','accounts@example.invalid'])expect(customerSearchMatches(c,q)).toBe(true);expect(customerSearchMatches(c,'Sydney unknown')).toBe(false);});
 it('finds a customer beyond the first 600 without requiring a full dropdown',()=>{const customers=Array.from({length:650},(_,i)=>({...c,id:String(i),businessName:`Flooring ${i}`,code:`CUST-${i}`}));expect(customers.filter(x=>customerSearchMatches(x,'CUST-649'))).toHaveLength(1);});
});
