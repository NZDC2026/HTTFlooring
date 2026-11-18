export type DispatchJob={id:string;number:string;customer:string;place:string;address:string;contact:string;kind:'Order'|'Invoice';date:string;boxes:number;area:number;kg:number;wanted:string;stock?:string;method:'Carrier'|'Pickup';carrier:string;collection:string;freight:number;pallets:number;packed:boolean;conNote:string;status:'To book'|'Booked'|'With carrier'|'Done';notes?:string;receivedBy?:string;proof?:string;ready?:boolean};
export function canHandToCarrier(job:DispatchJob){return job.status==='Booked'&&job.method==='Carrier'&&job.packed&&job.conNote.trim().length>0;}
export function handToCarrier(job:DispatchJob):DispatchJob{if(!canHandToCarrier(job))throw Error('Pack the goods and enter the carrier con-note first.');return {...job,status:'With carrier'};}
export function completeDispatch(job:DispatchJob,recipient:string,proof:string):DispatchJob{if(job.method==='Carrier'&&job.status!=='With carrier')throw Error('Hand the goods to the carrier before recording delivery.');if(job.method==='Pickup'&&job.status!=='Booked')throw Error('Choose a booked pickup.');if(job.method==='Pickup'&&!job.packed)throw Error('Pack the pickup before collection.');if(!recipient.trim()||!proof.trim())throw Error('Add the recipient and delivery proof.');return {...job,status:'Done',receivedBy:recipient.trim(),proof:job.method==='Pickup'?'Signed':'Carrier POD'};}
const job=(id:string,number:string,customer:string,boxes:number,area:number,extra:Partial<DispatchJob>={}):DispatchJob=>({id,number,customer,boxes,area,kg:boxes*20,place:'',address:'',contact:'',kind:number.startsWith('INV')?'Invoice':'Order',date:'14 Nov',wanted:'—',method:'Carrier',carrier:'',collection:'2026-11-17',freight:0,pallets:1,packed:false,conNote:'',status:'To book',...extra});
export const dispatchSamples:DispatchJob[]=[
 job('b1','SO-10521','Coastal Timber Floors',140,298.2,{place:'Frankston',stock:'28 Nov',wanted:'Sat 28 Nov'}),
 job('b2','SO-10518','ABC Flooring Pty Ltd',80,121.6,{date:'13 Nov',place:'Dandenong South',stock:'28 Nov',wanted:'Sat 28 Nov'}),
 job('b3','INV-3450','Melbourne Interiors',26,39.5,{date:'13 Nov',place:'South Yarra'}),
 job('b4','SO-10512','Floor Plus',160,352,{date:'11 Nov',place:'Ringwood',stock:'18 Nov',wanted:'Wed 18 Nov'}),
 job('b5','SO-10405','Oak Living Pty Ltd',37,54.8,{date:'6 Nov',place:'Box Hill',wanted:'Sat 21 Nov'}),
 job('b6','SO-10407','Sarah Nguyen',29,44.1,{date:'2 Nov',place:'Glen Waverley',wanted:'Mon 23 Nov'}),
 job('b7','SO-10408','ABC Flooring Pty Ltd',92,136.2,{date:'31 Oct',place:'Dandenong South',wanted:'Tue 24 Nov'}),
 job('c1','SO-10402','Floor Plus',28,31.1,{status:'Booked',carrier:'Local carrier (pallet)',address:'41 Maroondah Hwy, Ringwood',freight:85}),
 job('c2','SO-10406','Melbourne Interiors',29,40.5,{status:'Booked',carrier:'Border Express',address:'220 Toorak Rd, South Yarra',freight:96,packed:true,notes:'Rear lane, call on arrival'}),
 job('c3','SO-10403','Coastal Timber Floors',174,334.9,{status:'With carrier',carrier:'Border Express',address:'8 Cranbourne Rd, Frankston',freight:168,pallets:2,packed:true,conNote:'BEX4471209',collection:'2026-11-13'}),
 job('p1','SO-10401','ABC Flooring Pty Ltd',63,93.2,{method:'Pickup',contact:'John Smith',status:'Booked'}),
 job('d1','INV-3454','Westgate Flooring Depot',0,0,{status:'Done',method:'Pickup',receivedBy:'Steve Lin',proof:'Signed',collection:'2026-11-16',wanted:'16 Nov · 08:40'}),
 job('d2','INV-3452','Coastal Timber Floors',0,0,{status:'Done',carrier:'Border Express',receivedBy:'Mark (site)',proof:'Carrier POD',wanted:'14 Nov · 10:12'}),
 job('d3','INV-3445','ABC Flooring Pty Ltd',0,0,{status:'Done',carrier:'Toll',receivedBy:'Left at reception',proof:'Carrier POD',wanted:'13 Nov · 13:05'})
];

export const opMoney=(n:number)=>n.toLocaleString('en-AU',{style:'currency',currency:'AUD'});
