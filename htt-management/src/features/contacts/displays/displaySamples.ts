import {type DisplayData} from './displayModel';
export function displaySamples():DisplayData{
 const boards:DisplayData['boards']=[
 ['Bonita Plank board · Natural Oak','DB-BP-NAT','Natural Oak','#c8a36b',2,185,'Jiangsu Lingge Wood','2026-10-01','v2 has the new oil finish',2],
 ['Bonita Plank board · Grey Oak','DB-BP-GRY','Grey Oak','#a19b92',2,185,'Jiangsu Lingge Wood','2026-10-01','New colour in v2',1],
 ['Bonita Herringbone board · Natural Oak','DB-BH-NAT','Natural Oak','#c8a36b',1,160,'Jiangsu Lingge Wood','2025-09-01','',2],
 ['Hybrid SPC 6.5 mm board · Natural Oak','DB-HYB-NAT','Natural Oak','#c8a36b',2,0,'Jiangsu Lingge Wood','2026-11-01','',2],
 ['Hybrid SPC 6.5 mm board · Grey Oak','DB-HYB-GRY','Grey Oak','#a19b92',2,0,'Jiangsu Lingge Wood','2026-11-01','',1],
 ['Hybrid SPC 6.5 mm board · Blackbutt','DB-HYB-BBT','Blackbutt','#b78357',2,0,'Jiangsu Lingge Wood','2026-11-01','New colour in v2',1],
 ['Laminate 12 mm board · Alpine Oak','DB-LAM-ALP','Alpine Oak','#dec9a2',1,120,'Guangdong Huayu Flooring','2025-03-01','',3],
 ['Laminate 12 mm board · Harbour Grey','DB-LAM-HGR','Harbour Grey','#8e9193',1,120,'Guangdong Huayu Flooring','2025-03-01','',2],
 ['2027 range brochure stand','BR-27','','brochure',1,35,'Made locally','2026-10-15','',12],
 ].map((r,i)=>({id:'board-'+i,name:String(r[0]),code:String(r[1]),colour:String(r[2]),swatch:String(r[3]),version:Number(r[4]),cost:Number(r[5]),supplier:String(r[6]),since:String(r[7]),notes:String(r[8]),stock:[{version:Number(r[4]),quantity:Number(r[9])}],...([1,5,7].includes(i)?{incoming:{quantity:i===5?4:3,eta:i===1?'2026-11-18':i===5?'2026-11-28':'2026-12-08',container:i===1?'MSKU4421912':i===5?'TGHU8812045':'',po:i===1?'PO-2026-0043':i===5?'PO-2026-0046':'PO-2026-0038',received:false}}:{})}));
 const names=['Oakleigh Flooring Studio 3','Cheltenham Floors','Geelong Floor Centre','Keilor Floor Centre 3','Ringwood Timber Floors','Richmond Flooring Studio','Doncaster Floors','Brunswick Flooring Studio','Preston Flooring 3','Wodonga Timber Floors','Frankston Flooring','Berwick Timber Floors 3','Werribee Carpets & Floors','Lilydale Flooring 3','Moorabbin Flooring','Essendon Timber Floors 3','Narre Warren Floor Centre 3','Werribee Timber Floors 3','Geelong Floors','Brunswick Floor Centre','Hoppers Crossing Floors','Bayswater Floor Centre','Traralgon Flooring Studio','Knox Floors','Coastal Timber Floors'];
 const codes=[1108,1056,1004,1112,1018,1032,1062,1012,1091,1039,1043,1099,1047,1103,1055,1111,1100,1087,1044,1052,1074,1022,1078,1026,6];
 const values=[100252,108464,116676,131928,65830,42810,75320,40028,105629,113841,97011,19321,24795,40438,100545,124009,36900,49302,13436,76788,74004,79479,95121,3631,52873.70];
 const seeds=[['hy3','br','hy4','he'],['hy4','he','la','bp1'],['la','bp1','bp0','old3'],['old4','he','la','old1'],['he','old0'],['la','old4'],['bp0','br'],['br','old4','old0','la'],['old4','old0','la'],['la','old1','bp0'],['old0','hy3','br'],['bp0','old3','br'],['br','hy4','bp0'],['br','hy4','he'],['old1','bp0','hy3'],['bp1','old0','hy3'],['he','la','bp1','old0'],['hy3','br','hy4'],['he','la','old1','bp0'],['old3','br','hy4','he'],['la','bp1'],['old0','hy3'],['bp0','old3'],['br','hy4'],['old0','la']];
 const stores:DisplayData['stores']=Array.from({length:116},(_,i)=>({id:'display-store-'+i,name:names[i]??['Bayside','Altona','Sunbury','Ballarat','Mornington','Box Hill','Coburg','Dandenong'][(i-25)%8]+' Flooring '+(Math.floor((i-25)/8)+1),code:'CUST-'+String(codes[i]??1200+i).padStart(4,'0'),rep:[0,1,8,10,13,22,23].includes(i)?'Mia Chen':[14,15,16].includes(i)?'House':'Jason Wu',checked:i===15?'2026-09-15':i===20||i===21?'2026-06-15':i===13?'2026-08-15':i===16?'2026-11-11':i===17?'2026-11-12':i===18?'2026-11-14':i===19?'2026-11-16':i===7||i===12||i===14?'2026-08-15':i<32?'2026-07-15':'2026-11-05',sales:values[i]??Math.round(15000+(i*7919)%120000)}));
 const placements:DisplayData['placements']=[];const add=(store:number,board:number,version=boards[board].version)=>{if(placements.some(p=>p.storeId===stores[store].id&&p.boardId===boards[board].id))return;placements.push({id:'placement-'+placements.length,storeId:stores[store].id,boardId:boards[board].id,version,quantity:1,condition:'Good',placed:'2026-01-01'});};
 seeds.forEach((tags,i)=>tags.forEach(tag=>{if(tag.startsWith('old'))add(i,Number(tag.slice(3)),1);else add(i,({hy3:3,hy4:4,he:2,la:6,bp0:0,bp1:1,br:8} as Record<string,number>)[tag]);}));
 const desiredOld=new Set(placements.filter(p=>p.version<boards.find(b=>b.id===p.boardId)!.version).map(p=>p.storeId));for(let i=25;desiredOld.size<53;i++)desiredOld.add(stores[i].id);
 for(const [b,targetOld] of [[0,15],[1,14],[3,14],[4,13]]){let count=placements.filter(p=>p.boardId===boards[b].id&&p.version<boards[b].version).length;while(count<targetOld){const candidate=stores.slice(0,104).filter(s=>desiredOld.has(s.id)&&!placements.some(p=>p.storeId===s.id&&p.boardId===boards[b].id)).sort((a,c)=>{const old=(id:string)=>placements.filter(p=>p.storeId===id&&p.version<boards.find(b=>b.id===p.boardId)!.version).length;return old(a.id)-old(c.id);})[0];add(stores.indexOf(candidate),b,1);count++;}}
 for(const [b,target] of [[0,38],[1,37],[2,37],[3,37],[4,37],[5,1],[6,37],[7,0],[8,37]]){while(placements.filter(p=>p.boardId===boards[b].id).length<target){const candidates=stores.slice(25,104).filter(s=>!placements.some(p=>p.storeId===s.id&&p.boardId===boards[b].id)).sort((a,c)=>placements.filter(p=>p.storeId===a.id).length-placements.filter(p=>p.storeId===c.id).length);add(stores.indexOf(candidates[0]),b);}}
 const extra=placements.find(p=>p.boardId==='board-3'&&p.version===2&&Number(p.storeId.split('-').at(-1))>25)!;extra.quantity=2;
 const damageStores=new Set([7,13,14,15,17,18,24].map(i=>stores[i].id));for(let i=25;damageStores.size<23;i++)damageStores.add(stores[i].id);for(const id of damageStores){const p=placements.find(p=>p.storeId===id)!;p.condition='Damaged';}
 // 32 stores have not been checked for at least 90 days, including the dated examples above.
 const overdue=stores.filter(s=>s.checked<'2026-08-18');for(const s of stores.slice(25)){if(overdue.length>=32)break;if(!overdue.includes(s)){s.checked='2026-07-15';overdue.push(s);}}
 const kits:DisplayData['kits']=[
 {id:'kit-0',name:'KIT-A',contents:'all ranges',cost:420,customerId:'',customer:'',repName:'Mia Chen',repSince:'2023-01-16'},
 {id:'kit-1',name:'KIT-B',contents:'all ranges',cost:420,customerId:'',customer:'',repName:'Jason Wu',repSince:'2024-03-04'},
 {id:'kit-2',name:'KIT-C',contents:'engineered',cost:260,customerId:'sample-oak',customer:'Oak Living Pty Ltd',customerKind:'Installer',out:'2026-11-02',due:'2026-11-16'},
 {id:'kit-3',name:'KIT-D',contents:'hybrid & laminate',cost:190,customerId:'sample-melbourne',customer:'Melbourne Interiors',customerKind:'Installer',out:'2026-10-20',due:'2026-11-03'},
 {id:'kit-4',name:'KIT-E',contents:'engineered',cost:260,customerId:'',customer:''},
 ];
 const given:DisplayData['given']=[
 ['Coastal Timber Floors','Store','Laminate 12mm · Harbour Grey',3,6,'2026-11-12','Amy','#929596'],
 ['Coastal Timber Floors','Store','Laminate 12mm · Alpine Oak',3,6,'2026-11-12','Amy','#dfcba5'],
 ['Urban Floors','Installer','Hybrid SPC · Blackbutt',2,9,'2026-11-10','Amy','#b78357'],
 ['Sarah Nguyen','C Customer','Bonita Plank · Grey Oak',2,14,'2026-11-05','Amy','#a19b92'],
 ['Melbourne Interiors','Installer','Bonita Herringbone · Natural Oak',2,14,'2026-10-21','Jason Wu','#c8a36b','INV-3450',2766.4,'2026-11-01'],
 ['Oak Living Pty Ltd','Installer','Hybrid SPC · Natural Oak',2,9,'2026-10-14','Amy','#c8a36b'],
 ['Floor Plus','Store','Bonita Plank · Grey Oak',4,14,'2026-09-30','Mia Chen','#a19b92','INV-3448',6361.2,'2026-11-03'],
 ['Urban Floors','Installer','Laminate 12mm · Alpine Oak',2,6,'2026-09-18','Amy','#dfcba5'],
 ].map((r,i)=>({id:'given-'+i,customerId:'sample-given-'+String(r[0]),customer:String(r[0]),customerKind:String(r[1]),item:String(r[2]),quantity:Number(r[3]),cost:Number(r[4]),date:String(r[5]),by:String(r[6]),swatch:String(r[7]),...(r[8]?{order:{number:String(r[8]),total:Number(r[9]),date:String(r[10])}}:{})}));
 return {boards,stores,placements,kits,given,plans:[]};
}
