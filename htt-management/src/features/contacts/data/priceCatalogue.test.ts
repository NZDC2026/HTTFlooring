import { expect,it } from "vitest";
import { priceCatalogue,priceCategoryLabel,priceSubcategories,accessoryTypes } from "./priceCatalogue";
import type { Product } from "../../inventory/types/product";
function product(id:string,patch:Partial<Product>={}):Product{return {id,sku:id,name:id,category:"Timber",brand:"HTT",collection:"Bonita",pattern:"Plank",status:"ACTIVE",baseUnitId:"m2",units:[],createdAt:"",updatedAt:"",...patch};}
const rows=[product("white"),product("black"),product("bonita-hb",{pattern:"Herringbone"}),product("heritage",{collection:"Heritage",pattern:"Chevron"}),product("hybrid",{category:"Hybrid",collection:"Urban"}),product("legacy",{collection:"European Oak",pattern:undefined})];
it("groups colours into series and supports category then pattern filtering",()=>{
 const all=priceCatalogue(rows,"Timber","All","All","");expect(all.find(g=>g.name==="Bonita")?.products).toHaveLength(3);
 expect(priceCatalogue(rows,"Timber","Plank","All","").map(g=>g.name)).toEqual(["Bonita"]);
 expect(priceCatalogue(rows,"Timber","Herringbone","All","")[0].products.map(p=>p.id)).toEqual(["bonita-hb"]);
 expect(priceCatalogue(rows,"Hybrid","All","All","").map(g=>g.name)).toEqual(["Urban"]);expect(priceCategoryLabel("Timber")).toBe("Engineered Timber");
});
it("does not invent a pattern for legacy products and retains every product",()=>{
 expect(priceCatalogue(rows,"All","All","All","").flatMap(g=>g.products)).toHaveLength(rows.length);
 expect(priceSubcategories("Timber")).not.toContain("Unspecified");
 expect(priceCatalogue(rows,"All","All","All","").find(g=>g.name==="European Oak")?.patterns).toEqual([]);
 expect(priceCatalogue(rows,"All","Plank","All","").some(g=>g.products.some(p=>p.id==="legacy"))).toBe(false);
});
it("searches colours and series and keeps identical series from different brands or categories separate",()=>{
 expect(priceCatalogue(rows,"All","All","All","BLACK")[0].products.map(p=>p.id)).toEqual(["black"]);
 const different=[product("one"),product("two",{brand:"Other"}),product("three",{category:"Hybrid"})];
 expect(priceCatalogue(different,"All","All","All","")).toHaveLength(3);expect(priceCatalogue(different,"All","All","Other","")).toHaveLength(1);
 expect(priceCatalogue(rows,"All","All","All","Heritage")[0].name).toBe("Heritage");
});

it("uses the requested category-specific subcategories and hides Vinyl and Carpet from pricing",()=>{
 expect(priceSubcategories('Timber')).toEqual(['Plank','Herringbone','Chevron']);
 expect(priceSubcategories('Hybrid')).toEqual(['Plank','Herringbone']);expect(priceSubcategories('Laminate')).toEqual(['Plank','Herringbone']);
 expect(priceSubcategories('Accessories')).toEqual(accessoryTypes);expect(accessoryTypes).toHaveLength(11);expect(priceSubcategories('All')).toEqual([]);
 const products=[product('vinyl',{category:'Vinyl'}),product('carpet',{category:'Carpet'}),product('scotia',{category:'Accessories',accessoryType:'Scotia',pattern:undefined}),product('glue',{category:'Accessories',accessoryType:'Glue',pattern:undefined})];
 expect(priceCatalogue(products,'All','All','All','').flatMap(g=>g.products).map(p=>p.id)).toEqual(['scotia','glue']);
 expect(priceCatalogue(products,'Accessories','Glue','All','')[0].products.map(p=>p.id)).toEqual(['glue']);expect(priceCatalogue(products,'Accessories','Scotia','All','')[0].patterns).toEqual(['Scotia']);
});
