import {emptyPayroll,employeeSchema,itemSchema,settingsSchema,runSchema,calculateTotals,type PayrollState} from '../payroll/data/payrollModel';
import {emptyFilingProfile,type FilingProfile} from './contract';
const meta=(id:string)=>({id,revision:1,history:[{actorId:'owner',at:'2026-10-01T00:00:00.000Z',action:'Created',reason:'Synthetic test fixture',revision:1}]});
export function fixture():{payroll:PayrollState;profile:FilingProfile}{
 const employee=employeeSchema.parse({...meta('employee-1'),code:'EMP-1',name:'Synthetic Employee',position:'Installer',email:'payroll@example.test',startDate:'2026-07-01',endDate:'',status:'Active',basis:'Salary',rate:1000,earningItemId:'salary',bankAccount:'123456 12345678',taxIdentifier:'123456789',superFund:'Synthetic APRA fund',superMemberId:'MEM-1',annualOpening:0,personalOpening:0});
 const item=(id:string,category:string)=>itemSchema.parse({...meta(id),code:id.toUpperCase(),name:id,category,method:'Fixed',rate:0,taxable:category==='Earnings',accountId:'expense',liabilityAccountId:'liability',active:true});
 const items=[item('salary','Earnings'),item('payg','Tax'),item('super','Employer contribution')],lines=items.map((item,i)=>({item,quantity:1,rate:[1000,100,120][i],amount:[1000,100,120][i],source:'Reviewed synthetic payroll'}));
 const settings=settingsSchema.parse({...meta('settings'),netAccountId:'net',taxItemId:'payg',currency:'AUD',region:'Australia',superItemId:'super',employerName:'Synthetic Employer',employerIdentifier:'51824753556'}),totals=calculateTotals(lines);
 const run=runSchema.parse({...meta('run-1'),name:'October synthetic payroll',start:'2026-10-01',end:'2026-10-14',payDate:'2026-10-15',employeeInputs:[{employeeId:employee.id,withholding:100,annualAccrual:0,personalAccrual:0,superAmount:120}],adjustments:[],taxReviewed:true,reviewReference:'Reviewed synthetic amounts',status:'Posted',slips:[{employee,lines,timeIds:[],leaveIds:[],annualAccrual:0,personalAccrual:0,totals}],totals,settings,sourceToken:'synthetic-token',journalId:'journal-1'});
 const payroll={...emptyPayroll(),employees:[employee],items,settings:[settings],runs:[run]},profile=emptyFilingProfile();
 profile.employer={abn:'51824753556',branch:'001',contactName:'Synthetic Reviewer',email:'reviewer@example.test',phone:'0400000000',historyFrom:'2026-07-01',historyConfirmed:true};
 profile.employees=[{employeeId:employee.id,payrollId:'PAY-1',givenName:'Synthetic',familyName:'Employee',dateOfBirth:'1990-01-01',address:'1 Test Street',suburb:'Sydney',state:'NSW',postcode:'2000',incomeType:'SAW',employmentBasis:'F',taxTreatment:'RTXXXX',usi:'TESTUSI001',fundAbn:'51824753556'}];
 profile.items=items.map((item,i)=>({itemId:item.id,category:(['GROSS','PAYG','SG'] as const)[i],providerCode:''}));return {payroll,profile};
}
