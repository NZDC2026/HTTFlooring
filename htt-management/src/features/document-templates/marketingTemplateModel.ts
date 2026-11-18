import {z} from 'zod';
export const marketingUses=['Promotion','Price list','News'] as const;
export const marketingColours=['#2ba34a','#145a32','#207d78','#244bd9','#101828','#9a4415','#c31d24'];
export const marketingPolicySchema=z.object({version:z.literal(1),preset:z.enum(['promotion','prices','news']).optional(),name:z.string().trim().min(1).max(180),usedFor:z.enum(marketingUses),colour:z.string().regex(/^#[0-9a-fA-F]{6}$/),banner:z.number().int().min(0).max(9),headline:z.string().trim().min(1).max(300),text:z.string().max(5000),products:z.array(z.string().min(1).max(120)).max(100),button:z.string().max(100),destination:z.string().max(500),footer:z.string().max(1000)}).strict();
export type MarketingDesign=z.infer<typeof marketingPolicySchema>;
export const marketingProducts=[{id:'bonita-herringbone',name:'Bonita Herringbone',colour:'Natural Oak',price:112,picture:8},{id:'bonita-plank-natural',name:'Bonita Plank',colour:'Natural Oak',price:115,picture:0},{id:'bonita-plank-grey',name:'Bonita Plank',colour:'Grey Oak',price:115,picture:1},{id:'hybrid-natural',name:'Hybrid SPC',colour:'Natural Oak',price:54,picture:0},{id:'hybrid-grey',name:'Hybrid SPC',colour:'Grey Oak',price:54,picture:1},{id:'hybrid-blackbutt',name:'Hybrid SPC',colour:'Blackbutt',price:54,picture:2}];
export const marketingPresets:MarketingDesign[]=[
 {version:1,preset:'promotion',name:'Promotion — big banner',usedFor:'Promotion',colour:'#2ba34a',banner:0,headline:'November Hybrid sale — 10% off',text:'All Hybrid SPC colours are 10% off until 30 November. Stock is in the warehouse now.',products:['hybrid-natural','hybrid-grey','hybrid-blackbutt'],button:'Order now',destination:'Reply to this email',footer:'HTT Flooring · 12 Industrial Drive, Dandenong South VIC 3175 · Unsubscribe'},
 {version:1,preset:'prices',name:'Price list update',usedFor:'Price list',colour:'#244bd9',banner:1,headline:'New prices from 1 December',text:'Your updated price list is attached. Prices for Engineered are unchanged; Hybrid and Laminate change from 1 December.',products:[],button:'View my prices',destination:'Store portal',footer:'HTT Flooring · Unsubscribe'},
 {version:1,preset:'news',name:'New product',usedFor:'News',colour:'#207d78',banner:8,headline:'New: Bonita Herringbone',text:'Our best-selling Bonita now comes in herringbone. Display boards are available — ask your rep.',products:['bonita-herringbone'],button:'',destination:'Reply to this email',footer:'HTT Flooring · Unsubscribe'}
];
export function duplicateMarketing(d:MarketingDesign):MarketingDesign{const copy=structuredClone(d);delete copy.preset;copy.name+=' (copy)';return copy;}
export function newMarketingDesign():MarketingDesign{return {...structuredClone(marketingPresets[0]),preset:undefined,name:'New template',headline:'Your headline',text:'Write your message here.',products:[]};}
export const marketingPicture=(index:number)=>'/images/template-floor-'+index+'.svg';
export type MarketingEntry={id:string;design:MarketingDesign;row?:import('../business-workspace/configurationState').ConfigRow;unsaved?:boolean};
export function newMarketingEntry(rows:import('../business-workspace/configurationState').ConfigRow[]):MarketingEntry[]{
 const parsed=rows.filter(r=>r.kind==='Marketing email'&&r.marketingPolicy).flatMap(row=>{try{const result=marketingPolicySchema.safeParse(JSON.parse(row.marketingPolicy));return result.success?[{id:row.id,design:result.data,row}]:[];}catch{return [];}});
 return [...marketingPresets.flatMap(design=>{const saved=parsed.find(e=>e.design.preset===design.preset);return saved?(saved.row.status==='Active'?[saved]:[]):[{id:'preset-'+design.preset,design}];}),...parsed.filter(e=>!e.design.preset&&e.row.status==='Active')];
}
