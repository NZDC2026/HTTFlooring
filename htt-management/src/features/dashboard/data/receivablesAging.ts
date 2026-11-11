export const agingLabels=['Current (not yet overdue)','1 – 30 days','31 – 60 days','61 – 90 days','> 90 days'];
export const agingColors=['#009b0c','#64bf40','#ffce32','#ff800a','#ff2929'];
export function overdueDays(due:string,date:string){return Math.max(0,Math.floor((Date.parse(date+'T00:00:00Z')-Date.parse(due+'T00:00:00Z'))/86400000));}
export function agingBucket(days:number){return days<=0?0:days<=30?1:days<=60?2:days<=90?3:4;}
