import type {ReminderRow} from '../../invoice-reminders/rules';
export const serviceTabs=['Price lists','Claims','Invoices & statements'] as const;
export type ServiceTab=typeof serviceTabs[number];
export const priceAudiences=['Store · Normal','Store · VIP','Store · VVIP','Store · Container','Installer · Normal','Installer · VIP','Installer · VVIP','Installer · Container','C Customer · Normal'];
export type ListProduct={id:string;category:string;product:string;colour:string;code:string;pack:string;area:number;price:number;promo?:number;until?:string;arrival?:string;stock?:boolean;future?:string};
export const priceListSample:ListProduct[]=[
 ['Engineered timber','Bonita Herringbone','Natural Oak','ENG-BH-NAT','1.52 m²/box',1.52,112,undefined,undefined,'28 Nov'],
 ['Engineered timber','Bonita Plank','Natural Oak','ENG-BP-NAT','2.13 m²/box',2.13,124,undefined,undefined,'28 Nov'],
 ['Engineered timber','Bonita Plank','Grey Oak','ENG-BP-GRY','2.13 m²/box',2.13,124,110.76,'20 Nov','28 Nov'],
 ['Hybrid SPC','Hybrid SPC','Natural Oak','HYB-65-NAT','2.2 m²/box',2.2,54,48.60,'30 Nov','18 Nov'],
 ['Hybrid SPC','Hybrid SPC','Grey Oak','HYB-65-GRY','2.2 m²/box',2.2,54,48.60,'30 Nov','18 Nov'],
 ['Hybrid SPC','Hybrid SPC','Blackbutt','HYB-65-BBT','2.2 m²/box',2.2,54,48.60,'30 Nov','18 Nov'],
 ['Laminate','Laminate 12mm','Alpine Oak','LAM-12-ALP','1.48 m²/box',1.48,34,undefined,undefined,'22 Dec'],
 ['Laminate','Laminate 12mm','Harbour Grey','LAM-12-HGR','1.48 m²/box',1.48,34,undefined,undefined,'22 Dec'],
 ['Accessories','Acoustic Underlay','2 mm · 20 m²','ACC-UND-20','roll',0,50],
 ['Accessories','Setto Timber Adhesive','15 L','ACC-SET-15','pail',0,79,undefined,undefined,'19 Nov'],
].map((v,i)=>({id:'sample-product-'+i,category:String(v[0]),product:String(v[1]),colour:String(v[2]),code:String(v[3]),pack:String(v[4]),area:Number(v[5]),price:Number(v[6]),promo:v[7] as number|undefined,until:v[8] as string|undefined,arrival:v[9] as string|undefined,stock:i!==8,future:i===6||i===7?'$29.92 from 1 Dec':undefined}));
export type Claim={id:string;number:string;date:string;channel:string;customerId:string;customer:string;product:string;productId?:string;invoice:string;invoiceId?:string;batch:string;problem:string;boxes:number;photos:{name:string;data?:string}[];notes:string;state:'New'|'Checking'|'Waiting for supplier'|'Approved'|'Closed';cost:number;recovered:number};
export const claimProblems=['Shade / colour difference','Faulty boards (warp, gaps, delamination)','Damaged on arrival','Missing / wrong goods','Other'];
export function sampleClaims():Claim[]{return [
 ['CL-1004','2026-11-15','Portal','Coastal Timber Floors','Hybrid SPC · Grey Oak','INV-3452','B2515-8',claimProblems[0],12,3,'New',0],
 ['CL-1003','2026-11-12','Phone','Floor Plus','Bonita Plank · Natural Oak','INV-3448','B2500-8',claimProblems[1],6,5,'Checking',0],
 ['CL-1002','2026-11-08','Email','ABC Flooring Pty Ltd','Hybrid SPC · Natural Oak','INV-3445','B2448-1','Damaged on arrival',10,2,'Waiting for supplier',612],
 ['CL-1001','2026-10-22','Phone','Oak Living Pty Ltd','Bonita Plank · Grey Oak','INV-3420','B2400-2',claimProblems[1],4,2,'Approved',352],
 ['CL-1000','2026-10-08','Portal','Melbourne Interiors','Laminate 12mm · Alpine Oak','INV-3400','B2300-1',claimProblems[0],3,1,'Closed',180],
].map((v,i)=>({id:'sample-claim-'+i,number:String(v[0]),date:String(v[1]),channel:String(v[2]),customerId:'sample-customer-'+i,customer:String(v[3]),product:String(v[4]),invoice:String(v[5]),batch:String(v[6]),problem:String(v[7]),boxes:Number(v[8]),photos:Array.from({length:Number(v[9])},(_,j)=>({name:`Site photo ${j+1}`})),state:v[10] as Claim['state'],cost:Number(v[11]),recovered:0,notes:'Customer supplied photographs of the floor and box end labels.'}));}
export function filterClaims(claims:Claim[],filter:string,query:string){return claims.filter(c=>(filter==='All'||filter==='Open'&&['New','Checking'].includes(c.state)||filter==='Waiting for supplier'&&c.state===filter||filter==='Decided'&&['Approved','Closed'].includes(c.state))&&[c.number,c.customer,c.invoice,c.product,c.problem].join(' ').toLowerCase().includes(query.trim().toLowerCase()));}
export const statementCustomers=[
 ['ABC Flooring Pty Ltd',21563.25,0,3,'accounts@abcflooring.com.au',7,'John'],
 ['Oak Living Pty Ltd',7319.62,5544.12,2,'emma@oakliving.com.au',16,'Emma'],
 ['Floor Plus',26041.16,0,5,'orders@floorplus.com.au',7,'Mia'],
 ['Urban Floors',1529.09,1529.09,1,'olivia@urbanfloors.com.au',16,'Olivia'],
 ['Melbourne Interiors',5388.24,2345.20,2,'james@melbint.com.au',16,'James'],
 ['Coastal Timber Floors',27614.29,0,5,'ben@coastaltimber.com.au',7,'Ben'],
 ['Westgate Flooring Depot',1425.60,0,1,'tom@westgatefd.com.au',16,'Tom'],
 ['Sarah Nguyen',1084.60,1084.60,1,'sarah.nguyen@email.com',0,'Sarah'],
] as const;
export function sampleReminderRows():ReminderRow[]{return statementCustomers.flatMap((c,i)=>Array.from({length:c[3]},(_,j)=>{const regular=c[2]>0?Math.round((c[1]-c[2])/(c[3]-1)*100)/100:Math.round(c[1]/c[3]*100)/100;const amount=j===0&&c[2]>0?c[2]:j===c[3]-1?c[1]-(c[2]>0?c[2]+regular*(c[3]-2):regular*(c[3]-1)):regular;return {id:`sample-invoice-${i}-${j}`,customerId:'sample-customer-'+i,number:i===0&&j===0?'INV-3445':`INV-${3450-i*5-j}`,customer:c[0],email:c[4],contactName:c[6],documentDate:'2026-11-01',dueDate:j===0&&c[2]>0?['','2026-10-21','','2026-10-10','2026-10-25','','','2026-10-24'][i]:'2026-11-30',days:j===0&&c[2]>0?-[0,26,0,37,22,0,0,23][i]:14,amount:Math.round(amount*100)/100,invoiceTotal:Math.round(amount*100)/100,status:j===0&&c[2]>0?'Overdue':'Later'};}));}
export const cash=(n:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(n);
export function claimAge(date:string,today:string){return Math.max(0,Math.floor((Date.parse(today)-Date.parse(date))/86400000));}
