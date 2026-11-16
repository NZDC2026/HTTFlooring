import type {DateRange} from '../../../components/date-range/DateRangePicker';
import {daysAgo,priorYear} from '../data/customerDashboard';
export const customerDatePresets=['Today','Yesterday','Last 7 days','Last 30 days','This month','Last month','Last 90 days','This year','Last year','Last 12 months','This financial year','Last financial year','Custom'];
export const monthOffset=(value:string,n:number)=>{const d=new Date(value.slice(0,7)+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);return d.toISOString().slice(0,10);};
export function customerPeriod(preset:string,today:string):DateRange{
 const year=Number(today.slice(0,4)),month=Number(today.slice(5,7));
 if(preset==='Today')return{from:today,to:today};if(preset==='Yesterday'){const day=daysAgo(today,1);return{from:day,to:day};}
 if(/^Last (7|30|90) days$/.test(preset))return{from:daysAgo(today,Number(preset.split(' ')[1])-1),to:today};
 if(preset==='This month')return{from:today.slice(0,7)+'-01',to:today};if(preset==='Last month')return{from:monthOffset(today,-1),to:daysAgo(monthOffset(today,0),1)};
 if(preset==='Last year')return{from:`${year-1}-01-01`,to:`${year-1}-12-31`};
 if(preset==='Last financial year'){const start=month>=7?year:year-1;return{from:`${start-1}-07-01`,to:`${start}-06-30`};}
 if(preset==='This year')return{from:`${year}-01-01`,to:today};if(preset==='Last 12 months'){return{from:daysAgo(priorYear(today),-1),to:today};}
 return{from:`${month>=7?year:year-1}-07-01`,to:today};
}
export const shortPeriodDate=(date:string)=>new Date(date+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'});
