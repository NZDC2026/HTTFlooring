import type { Product } from "../../inventory/types/product";
export const priceCategories=["Timber","Hybrid","Laminate","Accessories"] as const;
export const accessoryTypes=["Plywood","Underlay","Floor Protection","Plastic Moisture Barrier","Scotia","Stair Noses","Aluminium Trim","Tool's Accessories","Glue","Primer","Self Leveling"] as const;
export type AccessoryType=typeof accessoryTypes[number];
export function priceSubcategories(category:string):readonly string[]{return category==="Timber"?flooringPatterns:["Hybrid","Laminate"].includes(category)?["Plank","Herringbone"]:category==="Accessories"?accessoryTypes:[];}
export const flooringPatterns=["Plank","Herringbone","Chevron"] as const;
export const priceCategoryLabel=(category:string)=>category==="Timber"?"Engineered Timber":category;
export function priceCatalogue(products:Product[],category:string,pattern:string,brand:string,query:string){
 const text=query.trim().toLowerCase();
 const selected=products.filter(p=>priceCategories.some(c=>c===p.category)&&(category==="All"||p.category===category)&&(pattern==="All"||(p.category==="Accessories"?p.accessoryType:p.pattern)===pattern)&&(brand==="All"||p.brand?.trim()===brand)&&[p.name,p.sku,p.brand,p.collection,p.pattern,p.accessoryType,priceCategoryLabel(p.category)].join(" ").toLowerCase().includes(text));
 const groups=new Map<string,{key:string;name:string;brand:string;category:string;products:Product[];patterns:string[]}>();
 for(const p of selected){const name=p.collection?.trim()||p.brand?.trim()||"Unassigned Series",brand=p.brand?.trim()||"No brand",key=JSON.stringify([p.category,brand,name]);const group=groups.get(key)||{key,name,brand,category:p.category,products:[],patterns:[]};group.products.push(p);const subcategory=p.category==="Accessories"?p.accessoryType:p.pattern;if(subcategory&&!group.patterns.includes(subcategory))group.patterns.push(subcategory);groups.set(key,group);}
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.key.localeCompare(b.key));
}
