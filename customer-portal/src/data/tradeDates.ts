export const dateISO=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const localDate=(iso:string)=>new Date(`${iso}T12:00:00`);
export function periodStart(period:string,now:Date):Date {
 if(period.includes('|')){const start=localDate(period.split('|')[1]);start.setHours(0,0,0,0);return start;}
 const y=now.getFullYear(),m=now.getMonth(),d=now.getDate();
 if(period==='Today')return new Date(y,m,d);
 if(period==='Yesterday')return new Date(y,m,d-1);
 if(period==='Last month')return new Date(y,m-1,1);
 if(period==='Last financial year')return new Date(y-(m<6?2:1),6,1);
 if(period==='All time')return new Date(2000,0,1);
 return new Date(y-(period==='This financial year'&&m<6?1:0),period==='This financial year'?6:period==='This year'?0:period==='This quarter'?Math.floor(m/3)*3:m,1);
}
export function periodEnd(period:string,now:Date):Date {
 let date=period.includes('|')?localDate(period.split('|')[2]):period==='Yesterday'?new Date(now.getFullYear(),now.getMonth(),now.getDate()-1):period==='Last month'?new Date(now.getFullYear(),now.getMonth(),0):period==='Last financial year'?new Date(now.getFullYear()-(now.getMonth()<6?1:0),5,30):new Date(now);
 date=new Date(date);date.setHours(23,59,59,999);return date;
}
export const periodLabel=(period:string)=>period.includes('|')?period.split('|')[0]:period;
export const rangeLabel=(period:string,now:Date)=>`${periodStart(period,now).toLocaleDateString('en-AU',{day:'numeric',month:'short'})} – ${periodEnd(period,now).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}`;
