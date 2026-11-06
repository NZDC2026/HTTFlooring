export type Item = {id:string;name:string;sku:string;unit:string;category:string;onHand:number;reserved?:number;damage?:number;cost?:number;currentValue?:number;lastPurchasePrice?:number;sell:number;active:boolean;sold:boolean;bought:boolean;stock:boolean;low:number};
export const samples:Item[] = [
 ['AquaGlow Berlin Oak','AG-WF02','m²','Timber',569.5326,20,14.8,28],
 ['Bonita Bonita Sample Board','SAM-001','pcs','Accessories',401,0,22,0],
 ['Bonita Natural Oak','BON-001','boxes','Timber',328,43,42.5,78],
 ['Bonita Cotton Oak','BON-002','boxes','Timber',215,25,42.5,78],
 ['Quercus European Oak','QUE-001','boxes','Timber',152,15,49,89],
 ['AquaGlow Los Angeles Oak','AG-WF01','m²','Hybrid',92.0673,0,14.8,28],
 ['Accessories Saw Blade 185 60T','ACC-001','pcs','Accessories',88,0,9.35,18.5],
 ['Flooring Adhesive 15kg','GLU-015','bucket','Accessories',36,4,65,95],
].map((r,i)=>({id:`sample-${i}`,name:String(r[0]),sku:String(r[1]),unit:String(r[2]),category:String(r[3]),onHand:Number(r[4]),reserved:Number(r[5]),damage:0,cost:Number(r[6]),currentValue:Number(r[4])*Number(r[6]),lastPurchasePrice:Number(r[6])*0.96,sell:Number(r[7]),active:true,sold:true,bought:true,stock:true,low:i===6?100:20}));
