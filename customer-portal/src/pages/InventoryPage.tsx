import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useLocalAccount } from "../services/account";
import PortalHeader from "../components/PortalHeader";
import SystemDate from "../components/SystemDate";
import SeriesRow from "../components/SeriesRow";
import { previewRanges } from "../data/portalPreview";
import { categorySubcategories, products } from "../data/products";
const categories=["All","Engineered Timber","Hybrid","Laminate","Accessories"];
export default function InventoryPage(){
 const [params,setParams]=useSearchParams();const {profile}=useLocalAccount();
 const query=params.get("q")??"",category=params.get("category")??"All",sub=params.get("subcategory")??"All",sort=params.get("sort")??"Relevance",promotion=params.get("promotion")==="1"||params.get("collection")==="promotion";
 const update=(key:string,value:string)=>setParams(previous=>{const next=new URLSearchParams(previous);if(key==="category")next.delete("subcategory");if(value)next.set(key,value);else next.delete(key);return next;},{replace:true});
 const base=previewRanges.filter(item=>(!promotion||item.promotion)&&(`${item.name} ${item.category} ${item.pattern}`.toLowerCase().includes(query.trim().toLowerCase())||products.some(product=>product.seriesId===item.id&&`${product.name} ${product.colour} ${product.sku} ${product.colourCode??""}`.toLowerCase().includes(query.trim().toLowerCase()))));
 const count=(cat:string,pattern="All")=>base.filter(item=>(cat==="All"||item.category===cat)&&(pattern==="All"||item.pattern===pattern)).length;
 const visible=base.filter(item=>(category==="All"||item.category===category)&&(sub==="All"||item.pattern===sub)).sort((a,b)=>sort==="Price: Low to High"?a.price-b.price:sort==="Price: High to Low"?b.price-a.price:0);
 const subcategories=category==="Accessories"?categorySubcategories.Accessories:["Plank","Herringbone","Chevron"];
 return <><PortalHeader/><main className="reference-inventory"><section className="reference-inventory-hero"><div className="reference-width"><SystemDate/><h1>Inventory Lookup</h1><p>Check current stock and your trade prices in {profile.region}.</p><form className="reference-stock-search" onSubmit={event=>event.preventDefault()}><Search size={17}/><input aria-label="Search inventory" placeholder="Search series, colour, SKU or keyword..." value={query} onChange={event=>update("q",event.target.value)}/><button>Search</button></form></div></section>
 <section className="reference-width inventory-results"><div className="reference-inventory-toolbar"><div className="reference-categories">{categories.map(item=><button key={item} className={category===item?"selected":""} aria-pressed={category===item} onClick={()=>update("category",item)}>{item} <span>{count(item)}</span></button>)}</div><div className="reference-sort"><label className="promotion-toggle"><input type="checkbox" checked={promotion} onChange={event=>{const checked=event.target.checked;setParams(previous=>{const next=new URLSearchParams(previous);next.delete("collection");if(checked)next.set("promotion","1");else next.delete("promotion");return next;},{replace:true});}}/><i/>On promotion</label><select aria-label="Sort inventory" value={sort} onChange={event=>update("sort",event.target.value)}><option value="Relevance">Sort: Relevance</option><option>Price: Low to High</option><option>Price: High to Low</option></select></div></div>
 {category!=="All"&&<div className="reference-subcategories"><span>{category} ›</span>{["All",...subcategories].map(item=><button key={item} aria-pressed={sub===item} disabled={count(category,item)===0} className={sub===item?"selected":""} onClick={()=>update("subcategory",item)}>{item} <small>{count(category,item)}</small></button>)}</div>}
 <p className="reference-result-count">{visible.length} series</p><div className="reference-range-grid">{visible.map(series=><SeriesRow key={series.id} series={series}/>)}{!visible.length&&<div className="empty-state"><p>No product series match your search.</p><button onClick={()=>setParams({})}>Clear filters</button></div>}</div><p className="reference-inventory-note">ⓘ Product prices exclude GST (quotes, orders and invoices show amounts incl. GST). Stock shown for {profile.region}.</p></section></main></>;
}
