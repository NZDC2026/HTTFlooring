import {it,expect} from 'vitest';
import {matchesRule,parseRuleConditions} from './ruleConditions';
const line={description:' Office supplies ',reference:'INV-42',payee:'Office Store',date:'2026-10-10',amount:-110,bankAccountId:'bank_001'};
const rule=(field:string,operator:string,value:string,to?:string)=>({conditions:JSON.stringify([{field,operator,value,...(to?{to}:{})}])});
it.each([['Description','Contains','OFFICE'],['Description','Starts with','office'],['Description','Ends with','supplies'],['Description','Not contains','bank'],['Reference','Equals','inv-42'],['Payee','Equals','office store'],['Amount','Equals','110'],['Amount','At least','110'],['Amount','At most','110'],['Amount','Between','100','110'],['Date','Equals','2026-10-10'],['Date','At least','2026-10-10'],['Date','At most','2026-10-10'],['Date','Between','2026-10-01','2026-10-10'],['Direction','Equals','MONEY_OUT']])('matches %s %s %s inclusively',(...args)=>{expect(matchesRule(rule(args[0],args[1],args[2],args[3]),line)).toBe(true);});
it.each([['Amount','Contains','110'],['Amount','Equals','-1'],['Amount','Equals','1.111'],['Amount','Between','20','10'],['Date','Equals','2026-02-30'],['Date','Between','2026-10-31','2026-10-01'],['Direction','Contains','MONEY_OUT'],['Payee','At least','store']])('rejects invalid %s %s %s',(...args)=>{expect(()=>parseRuleConditions(rule(args[0],args[1],args[2],args[3]))).toThrow();});
it('requires at least one and at most twenty conditions, strict fields and bounded priorities',()=>{
 for(const row of [{conditions:'[]'},{conditions:'invalid'},{conditions:JSON.stringify(Array.from({length:21},()=>({field:'Description',operator:'Contains',value:'x'})))},{...rule('Amount','Equals','1'),priority:'-1'},{...rule('Amount','Equals','1'),priority:'1.5'},{...rule('Amount','Equals','1'),priority:'1000'},{...rule('Amount','Equals','1'),automatic:'Maybe'},{...rule('Amount','Equals','1'),match:'Sometimes'}])expect(()=>parseRuleConditions(row)).toThrow();
});
it('does not match another bank or satisfy a missing payee negative condition',()=>{
 expect(matchesRule({...rule('Description','Contains','office'),bankAccountId:'bank_002'},line)).toBe(false);expect(matchesRule(rule('Payee','Not contains','excluded'),{...line,payee:undefined})).toBe(false);
});
