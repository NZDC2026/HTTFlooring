import { useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, LockKeyhole, Search, X, Upload, ArrowLeft, ArrowRight } from 'lucide-react';
import { productRepository, useProducts } from '../../business-workspace/productRepository';
import { businessSettings } from '../../business-workspace/configurationState';
import { usePermission } from '../../security/usePermission';
import { publicPreview } from '../../security/webBridge';
import { NewProductPricing } from './NewProductPricing';
import { buildNewProduct, generateProductSku, newProductForm, productPhotoSchema, type ProductForm, type ProductPhoto, type ProductSetup } from './productSetup';
import './new-product.css';

type Photo = ProductPhoto & { synthetic?:boolean };
type Kind = Photo['kind'];
const galleryNames:Record<Kind,string>={main:'Main photo',board:'Display board colour',styled:'Styled image',installed:'Real installed photos'};
const samplePhotos=():Photo[]=>(['main','board','styled','installed'] as const).flatMap(kind=>Array.from({length:kind==='styled'?3:kind==='installed'?9:1},(_,i)=>({id:`sample-${kind}-${i}`,name:`Sample ${galleryNames[kind]} ${i+1}`,kind,mime:'image/png' as const,data:'',synthetic:true})));
const fmt=(n:number)=>n.toLocaleString('en-AU',{maximumFractionDigits:2,minimumFractionDigits:2});
function Field({label,required,children,help,className=''}:{label:string;required?:boolean;children:ReactNode;help?:ReactNode;className?:string}) {return <label className={`np-field ${className}`}><span className="np-label">{label}{required&&<b className="np-required"> *</b>}</span>{children}{help&&<small>{help}</small>}</label>;}
function PhotoTile({photo,onClick}:{photo:Photo;onClick:()=>void}) {return <button type="button" className={`np-photo ${photo.synthetic?`np-art-${photo.kind}`:''}`} onClick={onClick} aria-label={`Preview ${photo.name}`}>{!photo.synthetic&&<img src={`data:${photo.mime};base64,${photo.data}`} alt={photo.name}/>}</button>;}
export function NewProductPage() {
 const [params]=useSearchParams(), products=useProducts();
 const [sample,setSample]=useState(publicPreview||params.get('sample')==='1'), [role,setRole]=useState('Admin');
 const [f,setF]=useState(()=>newProductForm(publicPreview||params.get('sample')==='1',businessSettings().gstCode));
 const [photos,setPhotos]=useState<Photo[]>(()=>publicPreview||params.get('sample')==='1'?samplePhotos():[]);
 const [error,setError]=useState(''), [notice,setNotice]=useState(''), [saved,setSaved]=useState<{sku:string;name:string;status:string;id?:string}|null>(null);
 const [sessionSkus,setSessionSkus]=useState<string[]>([]), [gallery,setGallery]=useState<Kind>('styled'),[preview,setPreview]=useState<Photo|null>(null);
 const file=useRef<HTMLInputElement>(null), uploadKind=useRef<Kind>('main'), dialog=useRef<HTMLDialogElement>(null);
 const permission=usePermission('inventory.adjust'), costPermission=usePermission('inventory.cost.read');
 const canWrite=sample?role!=='Sales':permission, canCost=sample?role==='Admin':costPermission;
 const existing=sample?sessionSkus:products.map(p=>p.sku), duplicate=existing.some(s=>s.toLowerCase()===f.sku.trim().toLowerCase());
 const update=<K extends keyof ProductForm>(key:K,value:ProductForm[K])=>{setF(v=>({...v,[key]:value}));setSaved(null);setNotice('');setError('');};
 const back=`/inventory?tab=stock${sample?'&sample=1':''}`;
 const number=(key:keyof ProductForm,suffix?:string,extra?:ReactNode,required=false,readOnly=false)=> <div className={`np-input-wrap ${readOnly?'is-readonly':''}`}>{key==='cost'&&<span>$</span>}<input data-ui="field" type="number" step={key==='pallet'?'1':'any'} min={['length','width','thickness','coverage'].includes(key)?'0.000001':'0'} required={required} readOnly={readOnly} value={String(f[key])} onChange={e=>update(key,e.target.value as ProductForm[typeof key])}/>{suffix&&<span>{suffix}</span>}{extra&&<b>{extra}</b>}</div>;
 const input=(key:keyof ProductForm,required=false)=> <input data-ui="field" value={String(f[key])} required={required} maxLength={key==='sku'?80:key==='name'?180:200} onChange={e=>update(key,e.target.value as ProductForm[typeof key])}/>;
 const upload=(kind:Kind)=>{uploadKind.current=kind;if(file.current){file.current.multiple=kind==='styled'||kind==='installed';file.current.value='';file.current.click();}};
 async function readPhotos(files:FileList|null) {
  if(!files?.length)return;const kind=uploadKind.current;
  try {
   const next:Photo[]=[];
   for(const item of Array.from(files)){
    if(!['image/png','image/jpeg','image/webp'].includes(item.type)||item.size>2*1024*1024)throw Error('Choose PNG, JPEG or WebP photos, up to 2 MB each.');
    const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('Photo could not be read.'));reader.readAsDataURL(item);});
    next.push(productPhotoSchema.parse({id:crypto.randomUUID(),kind,name:item.name,mime:item.type,data}));
   }
   const combined=[...photos.filter(p=>!(['main','board'].includes(kind)&&p.kind===kind)),...next];
   if(combined.length>30||combined.reduce((n,p)=>n+p.data.length,0)>11_000_000)throw Error('Use at most 30 photos and 8 MB in total.');
   setPhotos(combined);setError('');setSaved(null);
  } catch(e){setError((e as Error).message);}
 }
 function openGallery(kind:Kind,photo:Photo|null=null){setGallery(kind);setPreview(photo);dialog.current?.showModal();}
 function reset(asSample:boolean){setF(newProductForm(asSample,businessSettings().gstCode));setPhotos(asSample?samplePhotos():[]);setError('');setSaved(null);setNotice('');}
 function save(another:boolean) {
  setError('');
  try{
   if(!canWrite)throw Error('Your role cannot create products.');
   if(duplicate)throw Error('This SKU is already in use. Generate a new SKU or enter a different one.');
   const product=buildNewProduct({...f,photos:photos.filter(p=>!p.synthetic).map(p=>({id:p.id,name:p.name,kind:p.kind,mime:p.mime,data:p.data}))},canCost);
   if(sample){setSessionSkus(v=>[...v,product.sku]);setSaved({sku:product.sku,name:product.name,status:f.status});setNotice(`Sample · ${f.status==='DRAFT'?'Draft saved':f.status==='ACTIVE'?'Product activated':'Inactive product saved'} in this preview only. No business records or stock were changed.`);}
   else{const stored=productRepository.save(product);setSaved({sku:stored.sku,name:stored.name,status:f.status,id:stored.id});setNotice(`${f.status==='DRAFT'?'Draft saved':f.status==='ACTIVE'?'Product created':'Inactive product saved'}. Opening stock remains zero.`);}
   window.scrollTo({top:0,behavior:'smooth'});
   if(another){const previous=f.sku;setF(newProductForm(false,businessSettings().gstCode));setPhotos([]);setSaved(null);setNotice(`${sample?'Sample · ':''}${previous} saved${sample?' in this preview only':''}. Ready for another product.`);window.scrollTo({top:0});}
  }catch(e){setError((e as Error).message);}
 }
 const coverage=Number(f.coverage)||0;
 return <section className="np-page" aria-label="New product workspace">
  <header className="np-topbar"><span><Link to={back}>Inventory</Link> / <Link to={back}>Products</Link> / <strong>New product</strong></span><div><Link className="np-global-search" to="/search"><Search size={15}/>Search anything...</Link>{sample&&<label>Preview as <select data-ui="field" aria-label="Sample preview role" value={role} onChange={e=>setRole(e.target.value)}><option>Admin</option><option>Warehouse</option><option>Sales</option></select></label>}</div></header>
  <div className="np-content"><div className="np-heading"><h1>New product <span data-ui="badge">{f.status==='DRAFT'?'Draft':f.status==='ACTIVE'?'Active':'Inactive'}</span></h1><span>Fields marked <b className="np-required">*</b> are required</span></div>
  {sample?<div className="np-sample"><strong>Sample data</strong> · This form is pre-filled with an example product. Saving here doesn't store anything.{!publicPreview&&<button type="button" onClick={()=>{setSample(false);reset(false);}}>Exit Sample</button>}</div>:<div className="np-live-note"><span>Create a product without changing warehouse stock.</span><button type="button" onClick={()=>{setSample(true);reset(true);}}>View populated Sample</button></div>}
  {(error||notice)&&<div className={`np-message ${error?'is-error':''}`} role={error?'alert':'status'}>{error||notice}{saved?.id&&<> <Link to={`/inventory/products/${saved.id}`}>View product</Link></>}{saved&&<span className="np-saved-result"><Check size={15}/>{saved.name} · {saved.sku} · {saved.status==='DRAFT'?'Draft · not available for sales':saved.status==='ACTIVE'?'Active':'Inactive'}</span>}</div>}
  {!canWrite&&<p className="np-message">{sample?'Sample · Sales role can preview this form but cannot create products.':'Your role can view products but cannot create them.'}</p>}
  <form id="new-product-form" onSubmit={e=>{e.preventDefault();save(false);}}>
  <fieldset disabled={!canWrite||!!saved}>
  <section data-ui="card" className="np-card"><h2>1 · Basic information</h2><div className="np-grid np-two">
   <Field label="Category" required><select data-ui="field" value={f.category} onChange={e=>update('category',e.target.value as ProductForm['category'])}>{[['Hybrid','Hybrid / SPC'],['Timber','Engineered Timber'],['Laminate','Laminate'],['Vinyl','Vinyl'],['Carpet','Carpet'],['Accessories','Accessories'],['Other','Other']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field>
   <Field label="Pattern"><select data-ui="field" value={f.pattern} onChange={e=>update('pattern',e.target.value as ProductForm['pattern'])}>{['Plank','Herringbone','Chevron'].map(p=><option key={p}>{p}</option>)}</select></Field>
   <Field label="SKU" required help={f.sku&&<span className={duplicate?'np-required':'np-green'}>{duplicate?'This SKU is already in use':'✓ Available'}</span>}><span className="np-sku">{input('sku',true)}<button type="button" data-ui="button" onClick={()=>update('sku',generateProductSku(f,existing))}>Generate</button></span></Field>
   <Field label="Status"><select data-ui="field" value={f.status} onChange={e=>update('status',e.target.value as ProductSetup['lifecycle'])}><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></Field>
  </div><div className="np-grid np-name"><Field label="Product name" required>{input('name',true)}</Field><Field label="Colour">{input('colour')}</Field></div>
  <div className="np-size-heading"><span><strong>Size <b className="np-required">*</b></strong> Length × width × thickness of one plank or tile</span>{f.length&&f.width&&f.thickness&&<span className="np-pill">{f.length} × {f.width} × {f.thickness} mm</span>}</div>
  <div className="np-grid np-three">{([['length','Length'],['width','Width'],['thickness','Thickness']] as const).map(([k,l])=><Field label={l} key={k}>{number(k,'mm',undefined,true)}</Field>)}<Field label="SQM per box" required help="As printed on the box label · orders round up to full boxes" className="np-coverage">{number('coverage','m² / box',undefined,true)}</Field></div>
  <Field label="Description" help={undefined}><small>Shown on quotes and invoices</small><textarea data-ui="field" value={f.description} maxLength={4000} onChange={e=>update('description',e.target.value)}/></Field>
  </section>
  <section data-ui="card" className="np-card np-internal"><div className="np-card-heading"><h2>2 · Specifications</h2><span className="np-pill np-neutral"><LockKeyhole size={11}/> Internal only</span></div><p>For staff and sales only — none of these fields appear on quotes, invoices or anything sent to customers</p><div className="np-grid np-five">
  <Field label="Surface finish"><select data-ui="field" value={f.finish} onChange={e=>update('finish',e.target.value)}>{['Matt','Satin','Gloss','Textured','Unfinished'].map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Material / core">{input('core')}</Field><Field label="Wear layer">{number('wear','mm')}</Field><Field label="Warranty">{number('warranty','years')}</Field><Field label="Wear layer warranty">{number('wearWarranty','years')}</Field><Field label="Default wastage" help="Plank usually needs 5–7%">{number('wastage','%')}</Field><Field label="Box weight">{number('weight','kg')}</Field><Field label="Boxes per pallet">{number('pallet','boxes')}</Field><Field label="Barcode (EAN)">{input('barcode')}</Field>
  </div></section>
  <NewProductPricing form={f} onChange={next=>{setF(next);setSaved(null);setError('');setNotice('');}} sample={sample} canCost={canCost} canWrite={canWrite&&!saved}/>
  <section data-ui="card" className="np-card"><h2>4 · Inventory</h2><p>Quantities in boxes.</p><div className="np-grid np-three"><Field label="Low stock alert" help="Warn me when stock drops to this">{number('low','boxes',`=${fmt(Number(f.low)*coverage)} m²`)}</Field><Field label="Restock up to" help="Suggested reorder tops up to this">{number('restock','boxes',`=${fmt(Number(f.restock)*coverage)} m²`)}</Field><Field label="Stock on hand" help="From warehouse stock · updates when goods are received or sold"><span className="np-stock-readonly"><span className="np-pill np-neutral">Read-only</span><span className="np-input-wrap is-readonly"><input data-ui="field" aria-label="Stock on hand" readOnly value="0"/><span>boxes</span><b>=0.00 m²</b></span></span></Field></div></section>
  <section data-ui="card" className="np-card"><h2>5 · Photos &amp; website</h2><p>Photos 2 and 3 are for the product page on your website. The main photo is for this system; real installed photos are for sales only.</p><div className="np-photo-grid">{(['main','board','styled','installed'] as const).map((kind,i)=>{const list=photos.filter(p=>p.kind===kind);return <section key={kind} className={`np-gallery-card ${kind==='installed'?'np-internal':''}`}><h3><span className="np-number">{i+1}</span>{galleryNames[kind]}{i>1&&!!list.length&&<span className="np-photo-count">({list.length})</span>}<span className={`np-pill ${i===1||i===2?'np-website':i===3?'np-neutral':''}`}>{i===0?'System':i===3?'Internal':'Website'}</span></h3><p>{['Thumbnail in front of the product name in the Products list','One photo of the showroom display board — shown as the colour on the website','Edited room images that open when the colour is clicked on the website','Unedited photos from real jobs. Not on the website — sales send them when a customer asks.'][i]}</p>{i>1&&<button type="button" className="np-manage" onClick={()=>openGallery(kind)}>Manage all — reorder or delete</button>}<div className="np-thumbnails">{list.slice(0,i>1?4:1).map((photo,j)=>j===3&&list.length>4?<button type="button" key={photo.id} className={`np-photo np-art-${kind} np-more`} onClick={()=>openGallery(kind)}>+{list.length-3}</button>:<PhotoTile key={photo.id} photo={photo} onClick={()=>openGallery(kind,photo)}/>)}{(i>1||!list.length)&&<button type="button" className="np-photo np-add" onClick={()=>upload(kind)}>+ Add</button>}</div>{i<2&&!!list.length&&<button type="button" className="np-replace" onClick={()=>upload(kind)}>Replace photo</button>}</section>;})}</div><small className="np-media-note">PNG, JPEG or WebP · 2 MB per photo · 8 MB total. Website photos are saved here; publishing requires a connected website.</small></section>
  </fieldset></form>{!sample&&permission&&<p className="np-live-note">Need non-stock, service, roll or piece units? <Link to="/inventory/products/new?editor=advanced">Open advanced catalogue setup</Link></p>}
  </div>
  <footer className="np-footer"><span className={error?'np-required':'np-green'}>{error?'Check required fields':saved?<><Check size={15}/> {sample?'Sample saved':'Saved'}</>:<><Check size={15}/> {duplicate?'SKU already in use':'Ready to save'}</>}</span><div><Link data-ui="button" className="np-cancel" to={back}>Cancel</Link><button data-ui="button" type="button" disabled={!canWrite||!!saved} onClick={()=>{const form=document.getElementById('new-product-form') as HTMLFormElement;if(form.reportValidity())save(true);}}>Save &amp; add another</button><button data-ui="button" className="np-primary" form="new-product-form" disabled={!canWrite||!!saved}>Save {f.status==='DRAFT'?'as draft':f.status==='ACTIVE'?'as active':'as inactive'}</button></div></footer>
  <input className="np-file" ref={file} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>void readPhotos(e.target.files)}/>
  <dialog ref={dialog} className="np-photo-dialog" data-module-theme="light" onClose={()=>setPreview(null)}><header><h2>{preview?preview.name:galleryNames[gallery]}</h2><button data-ui="button" aria-label="Close photo manager" onClick={()=>dialog.current?.close()}><X size={18}/></button></header>{sample&&<p className="np-sample">Sample · Changes stay in this preview only.</p>}{error&&<p role="alert" className="np-message is-error">{error}</p>}{preview?<><div className="np-large-photo"><PhotoTile photo={preview} onClick={()=>setPreview(null)}/></div><button data-ui="button" onClick={()=>setPreview(null)}>Back to gallery</button></>:<><div className="np-manage-grid">{photos.filter(p=>p.kind===gallery).map((p,i,list)=><div key={p.id}><PhotoTile photo={p} onClick={()=>setPreview(p)}/><small>{p.name}</small><div className="np-photo-actions"><button data-ui="button" aria-label={`Move ${p.name} earlier`} disabled={!i||!canWrite||!!saved} onClick={()=>setPhotos(all=>{const next=[...all],a=next.findIndex(v=>v.id===p.id),b=next.findIndex(v=>v.id===list[i-1].id);[next[a],next[b]]=[next[b],next[a]];return next;})}><ArrowLeft size={14}/></button><button data-ui="button" aria-label={`Move ${p.name} later`} disabled={i===list.length-1||!canWrite||!!saved} onClick={()=>setPhotos(all=>{const next=[...all],a=next.findIndex(v=>v.id===p.id),b=next.findIndex(v=>v.id===list[i+1].id);[next[a],next[b]]=[next[b],next[a]];return next;})}><ArrowRight size={14}/></button><button data-ui="button" disabled={!canWrite||!!saved} onClick={()=>setPhotos(all=>all.filter(v=>v.id!==p.id))}>Delete</button></div></div>)}</div><button data-ui="button" disabled={!canWrite||!!saved} onClick={()=>upload(gallery)}><Upload size={15}/> Add photos</button></>}</dialog>
 </section>;
}
