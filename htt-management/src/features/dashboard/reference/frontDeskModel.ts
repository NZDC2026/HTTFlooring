export type FrontDeskTodo={id:string;title:string;detail:string;badge:string;bucket:'Overdue'|'Today'|'Coming up';tone:'amber'|'red'|'blue';path:string;taskId?:string};
export const frontDeskSampleQuotes=[
 {id:'QT-2001',name:'Oak Living Pty Ltd',date:'2026-11-15',amount:313.50},
 {id:'QT-2002',name:'Sarah Nguyen',date:'2026-11-12',amount:1424.50},
 {id:'QT-2005',name:'Urban Floors',date:'2026-11-03',amount:1544.40},
 {id:'QT-2009',name:'Coastal Timber Floors',date:'2026-10-22',amount:9138.80},
 {id:'QT-2012',name:'Melbourne Interiors',date:'2026-10-13',amount:2846.91},
];
export function frontDeskSampleTodos():FrontDeskTodo[]{return [
 ...[['Coastal Timber Floors','SO-10521'],['ABC Flooring Pty Ltd','SO-10518'],['Floor Plus','SO-10512'],['Oak Living Pty Ltd','SO-10405']].map(([name,number],i)=>({id:'front-book-'+i,title:'Book carrier or pickup',detail:`${name} · ${number}`,badge:'To book',bucket:'Today' as const,tone:'amber' as const,path:'/sales?special=delivery'})),
 ...[['Sarah Nguyen','INV-3443','$1,084.60','23'],['Melbourne Interiors','INV-3436','$2,345.20','22'],['Urban Floors','INV-3435','$1,529.09','37'],['Oak Living Pty Ltd','INV-3431','$5,542.12','26']].map(([name,number,amount,days],i)=>({id:'front-chase-'+i,title:'Chase payment',detail:`${name} · ${number} · ${amount}`,badge:`${days} days late`,bucket:'Overdue' as const,tone:'red' as const,path:'/sales/invoice-reminders?filter=Overdue'})),
 ...frontDeskSampleQuotes.slice(0,3).map((q,i)=>({id:'front-quote-'+i,title:'Follow up quote',detail:`${q.name} · ${q.id} · $${q.amount.toLocaleString('en-AU',{minimumFractionDigits:2})}`,badge:'Quote',bucket:'Coming up' as const,tone:'blue' as const,path:'/sales?tab=QUOTE'})),
 ...[['Oak Living Pty Ltd','RT-0401'],['Melbourne Interiors','RT-0403']].map(([name,number],i)=>({id:'front-return-'+i,title:'Return to check',detail:`${name} · ${number}`,badge:'Waiting',bucket:'Today' as const,tone:'amber' as const,path:'/sales/credit-returns?queue=confirm'})),
 ];}
export function frontDeskScopeMatches(row:FrontDeskTodo,scope:string){return scope==='All'||scope===row.bucket;}
