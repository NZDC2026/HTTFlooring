import type { InventorySite } from '../inventory/types/inventorySite';
/** Resolve within the current business region; never substitute a different city. */
export function shipmentWarehouse(companyName:string,sites:readonly InventorySite[]){
 const city=/\b(syd|sydney)\b/i.test(companyName)?'Sydney':/\b(melb|melbourne)\b/i.test(companyName)?'Melbourne':undefined;
 const site=city?sites.find(s=>s.status==='ACTIVE'&&(/warehouse|\bwh\b/i.test(s.name+' '+s.code))&&(city==='Sydney'?/syd|sydney/i:/mel|melbourne/i).test(s.name+' '+s.code)):undefined;
 return {city,site};
}
