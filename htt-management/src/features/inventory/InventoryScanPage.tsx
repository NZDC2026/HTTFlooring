import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ScanLine,Search} from 'lucide-react';
import {mockProducts} from './data/mockProducts';

/** Barcode readers enter text like a keyboard; this lookup never changes stock. */
export function InventoryScanPage(){
 const [query,setQuery]=useState(''),[sample,setSample]=useState(false);
 const results=sample?[{id:'sample',name:'Sample · Bonita Natural Oak Hybrid',sku:'HYB-BON-NOK-7',barcode:'9300000012345'}]:query.trim()?mockProducts.filter(p=>[p.sku,p.name,p.setup?.barcode].some(v=>v?.toLowerCase().includes(query.trim().toLowerCase()))).slice(0,20).map(p=>({...p,barcode:p.setup?.barcode})):[];
 return <section style={{display:'grid',gap:18}}><header><h1 style={{fontSize:28,fontWeight:700}}>Scan</h1><p>Scan a product barcode or enter its SKU to find the product. Stock is not changed.</p></header><section data-ui="card" style={{padding:20}}><label style={{display:'flex',gap:10,alignItems:'center'}}><ScanLine size={20}/><input data-ui="field" aria-label="Scan barcode or SKU" autoFocus value={sample?'9300000012345':query} disabled={sample} onChange={e=>setQuery(e.target.value)} placeholder="Scan barcode or enter SKU…" style={{width:'100%',maxWidth:600}}/></label></section><label><input type="checkbox" checked={sample} onChange={e=>setSample(e.target.checked)}/> Sample · Populated product lookup · Read-only · No stock changes</label><section data-ui="card" style={{padding:20}}>{results.length?results.map(p=><div key={p.id} style={{padding:'12px 0',borderBottom:'1px solid #e5e9ed'}}><b>{p.name}</b><p>{p.sku} · {p.barcode||'No barcode recorded'}</p>{!sample&&<Link data-ui="button" to={'/inventory/products/'+p.id}>Open product</Link>}</div>):<p><Search size={16}/> {query?'No matching products. Check the barcode or SKU.':'Ready for a barcode or SKU.'}</p>}</section></section>;
}
