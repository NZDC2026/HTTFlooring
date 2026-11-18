import type {StockItem} from '../components/InventoryStockList';
export type ReferenceStockItem=StockItem&{pack?:number;eta?:string;incomingSold?:number;version?:number;colours?:number;subtype?:string;swatch?:string;out?:boolean;expired?:number;thumb?:string};
const row=(id:string,name:string,sku:string,category:string,unit:string,onHand:number,reserved:number,incoming:number,sell:number,cost:number,extra:Partial<ReferenceStockItem>={}):ReferenceStockItem=>({id,name,sku,category,unit,onHand,reserved,available:onHand-reserved,incoming,sell,cost,batch:0,note:'',description:'',active:true,sold:true,bought:true,stock:true,low:0,...extra});
export const inventoryReferenceSamples:ReferenceStockItem[]=[
 row('stock-sample-0','Bonita Plank – Natural Oak','ENG-BP-NAT','Engineered','m²',255.6,0,958.5,58.22,34.74,{pack:2.13,batch:3,eta:'28 Nov',description:'15/4 mm · 2200 × 220 mm · Natural matt · ABC grade',thumb:'oak',old:true}),
 row('stock-sample-1','Hybrid SPC – Grey Oak','HYB-65-GRY','Hybrid','m²',682,0,880,24.55,14.09,{pack:2.2,batch:2,eta:'18 Nov',description:'6.5 mm SPC · 1800 × 228 mm · Attached IXPE underlay',thumb:'grey'}),
 row('stock-sample-2','Laminate 12mm – Harbour Grey','LAM-12-HGR','Laminate','m²',296,0,148,22.97,12.84,{pack:1.48,batch:2,eta:'22 Dec',description:'1215 × 195 mm · AC4 · Northern grey',thumb:'grey',old:true}),
 row('stock-sample-3','TEMAC Timber Adhesive – 15kg','A5TI-TEMAC-15','Adhesive','pcs',180,20,40,61.82,36.8,{batch:2,eta:'21 Nov',thumb:'pail',description:'MS polymer · 15 kg pail · ≈ 15 m² per pail',batches:[{id:'sample-temac-1',siteId:'sample-site',number:'L-2604',received:'2026-04-04',onHand:20,reserved:20,expiresOn:'2026-12-02'},{id:'sample-temac-2',siteId:'sample-site',number:'L-2610',received:'2026-10-10',onHand:160,reserved:0,expiresOn:'2027-04-10'}]}),
 row('stock-sample-4','Acoustic Underlay – 2mm','AC-UNDER-KOLLA','Accessories','rolls',72,8,16,75,52,{batch:1,eta:'28 Nov',thumb:'roll',slow:true,description:'2 mm · 15 m² / roll · ΔLw 20 dB acoustic rating'}),
 row('stock-sample-5','Stair Nose – Oak','TR-STARR-ODK','Accessories','pcs',320,40,150,22.9,12.5,{batch:2,eta:'21 Nov',thumb:'dark',low:300,description:'Bullnose · 2.4 m length · matches Engineered Oak range'}),
 row('stock-sample-6','Moisture Barrier – 200µm','ME-TEMAC-40K','Accessories','rolls',28,6,30,49.9,28.8,{batch:1,eta:'28 Nov',thumb:'roll',low:25,description:'200 µm · 50 m² roll'}),
 row('stock-sample-7','Setto Self Levelling – 20kg','SL-SETFIC-00','Accessories','bags',36,4,0,52,29.5,{batch:2,available:28,expired:4,thumb:'bag',slow:true,description:'20 kg bag · ≈ 4 m² at 3 mm depth',batches:[{id:'sample-setto-1',siteId:'sample-site',number:'L-2512',received:'2025-12-20',onHand:4,reserved:0,expiresOn:'2026-11-01'},{id:'sample-setto-2',siteId:'sample-site',number:'L-2603',received:'2026-03-11',onHand:32,reserved:4,expiresOn:'2027-01-11'}]}),
 row('stock-sample-8','Bonita Herringbone – Natural Oak','ENG-BH-NAT','Engineered','m²',319.2,0,638.4,73.68,44.74,{pack:1.52,eta:'28 Nov',incomingSold:121.6,thumb:'oak',out:true,description:'14/3 mm · 600 × 90 mm · Crosswood brushed'}),
 row('stock-sample-9','Chevron – Herritage Oak','HT-CV-1800-OK','Engineered','m²',14,4,60,99.9,56,{pack:2,batch:1,eta:'5 Dec',low:20,thumb:'oak',description:'14/3 mm · 600 × 90 mm · Herritage smoked'}),
 row('r10','Bonita Herringbone – Grey Oak','ENG-BH-GRY','Engineered','m²',243.2,0,577.6,73.68,44.74,{pack:1.52,eta:'28 Nov',swatch:'#a19b92'}),
 row('r11','Bonita Herringbone – Smoked Oak','ENG-BH-SMK','Engineered','m²',60.8,0,456,77.63,47.04,{pack:1.52,eta:'28 Nov',low:65,swatch:'#6a4f3b'}),
 row('r12','Bonita Plank – Grey Oak','ENG-BP-GRY','Engineered','m²',191.7,85.2,553.8,58.22,34.74,{pack:2.13,eta:'9 Dec',incomingSold:213,low:120,swatch:'#a19b92'}),
 row('r13','Bonita Plank – Coastal White','ENG-BP-CWT','Engineered','m²',319.5,0,362.1,60.09,35.68,{pack:2.13,eta:'9 Dec',swatch:'#e7e1d6'}),
 row('r14','Hybrid SPC – Natural Oak','HYB-65-NAT','Hybrid','m²',572,0,880,24.55,14.09,{pack:2.2,eta:'18 Nov',swatch:'#c9a16a'}),
 row('r15','Hybrid SPC – Blackbutt','HYB-65-BBT','Hybrid','m²',154,88,880,24.55,14.09,{pack:2.2,eta:'18 Nov',incomingSold:264,low:80,swatch:'#b78258'}),
 row('r16','Hybrid SPC – Chalk White','HYB-65-CHK','Hybrid','m²',396,0,880,24.55,14.09,{pack:2.2,eta:'18 Nov',swatch:'#eae6de'}),
 row('r17','Laminate 12mm – Alpine Oak','LAM-12-ALP','Laminate','m²',207.2,0,133.2,22.97,12.84,{pack:1.48,eta:'22 Dec',swatch:'#dfc9a2'}),
 row('r18','Laminate 8mm – Alpine Oak','LAM-08-ALP','Laminate','m²',84,0,144,11.25,8.13,{pack:2.4,eta:'22 Dec',low:90,swatch:'#dfc9a2'}),
 row('r19','Hybrid 7mm – Natural Oak','HYB-70-NAT','Hybrid','m²',55,0,704,20.91,12.73,{pack:2.2,eta:'8 Dec',low:60,swatch:'#c9a16a'}),
 row('r20','Saigon Engineered – Rustic Oak','ENG-VN-OAK','Engineered','m²',112.2,0,0,51.61,31.18,{pack:1.87,swatch:'#a6794a'}),
 ...[
 ['Bonita Plank board','DB-BP',3,3,260,185,2,2,'Display board','#c9a16a'],['Bonita Herringbone board','DB-BH',2,0,220,160,1,0,'Display board','#c9a16a'],['Hybrid SPC 6.5 mm board','DB-HYB',4,4,0,0,2,3,'Display board','#b78258'],['Laminate 12 mm board','DB-LAM',5,3,160,120,1,2,'Display board','#dfc9a2'],['2027 range brochure stand','BR-27',12,0,0,35,1,0,'Display stand','stripe'],
 ['Bonita Herringbone offcut','OC-ENG-BH',60,0,5,3.2,0,0,'Offcut','#c9a16a'],['Bonita Plank offcut','OC-ENG-BP',103,60,5,3.2,0,2,'Offcut','#c9a16a'],['Hybrid SPC offcut','OC-HYB-65',236,120,3,1.8,0,3,'Offcut','#b78258'],['Laminate 12mm offcut','OC-LAM-12',195,0,2,1.1,0,2,'Offcut','#dfc9a2'],['Engineered swatch fan · 3 colours','SW-ENG',46,0,0,4.5,0,0,'Swatch','#c9a16a'],['Hybrid SPC swatch card · 3 colours','SW-HYB',12,150,0,2.2,0,0,'Swatch','#b78258'],['Laminate swatch card · 2 colours','SW-LAM',64,0,0,1.6,0,0,'Swatch','#dfc9a2'],['Full range colour book 2027','SW-BOOK',9,0,25,18,0,0,'Swatch','stripe']
 ].map((r,i)=>row('display-'+i,String(r[0]),String(r[1]),'Samples & displays','pcs',Number(r[2]),0,Number(r[3]),Number(r[4]),Number(r[5]),{version:Number(r[6])||undefined,colours:Number(r[7])||undefined,subtype:String(r[8]),swatch:String(r[9]),low:[0,1,2].includes(i)?4:i===10?15:i===12?10:0,eta:i===0||i===6||i===7?'18 Nov':i===2||i===10?'28 Nov':'8 Dec'}))
];
export const overviewSellers=[
 ['Engineered Oak 2200 – Natural','TM-OAK-2200-NA','Engineered','612 m²',36046.8,46,'1,152 m²','200 m²','21 Nov','10 wks'],
 ['SPC Hybrid 1800 – Grey Oak','MR-1806-GROT','Hybrid','438 m²',18790.2,43,'816 m²','120 m²','5 Dec','9 wks'],
 ['Herringbone – Crosswood Oak','CW-HB-1890-OK','Engineered','180 m²',16182,47,'0 m²','300 m²','21 Nov','< 1 wk'],
 ['21mm Laminate – Nthen Grey','LJK-1215-JAMEIN','Laminate','296 m²',9324,40,'480 m²','—','','8 wks'],
 ['TEMAC Timber Adhesive – 15kg','A5IT-TEMAC-15','Adhesive','88 pcs',5440.16,40,'160 pcs','40 pcs','21 Nov','9 wks'],
 ['Chevron – Herritage Oak','HT-CV-1800-OK','Engineered','42 m²',4195.8,44,'10 m²','60 m²','5 Dec','1 wk'],
 ['Stair Nose – Oak','TR-STARR-ODK','Accessories','182 pcs',4167.8,45,'280 pcs','150 pcs','21 Nov','7 wks'],
 ['Acoustic Underlay – 2mm','AC-UNDER-KOLLA','Accessories','41 rolls',3075,31,'64 rolls','16 rolls','28 Nov','7 wks'],
 ['Moisture Barrier – 200µm','ME-TEMAC-40K','Accessories','8 rolls',399.2,42,'22 rolls','30 rolls','28 Nov','9 wks'],
 ['Setto Self Levelling – 20kg','SL-SETFIC-00','Accessories','3 bags',156,43,'28 bags','—','','21 wks']
] as const;
