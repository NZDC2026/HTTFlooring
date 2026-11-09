import {useSyncExternalStore} from 'react';
import {PackageCheck} from 'lucide-react';
import {useCollectionProofs} from './collectionProofRepository';
import {salesFulfilmentRepository} from '../sales/data/salesFulfilmentRepository';
import './collection-proof.css';
/** Management is a read-only view. Evidence is captured by the warehouse at collection. */
export function CollectionProofPanel({orderId,sample=false,compact=false}:{orderId?:string;sample?:boolean;compact?:boolean}){
 const rows=useCollectionProofs();
 useSyncExternalStore(salesFulfilmentRepository.subscribe,salesFulfilmentRepository.getSnapshot,salesFulfilmentRepository.getSnapshot);
 const fulfils=salesFulfilmentRepository.getAll().filter(f=>!orderId||f.salesOrderId===orderId),proofs=rows.filter(r=>fulfils.some(f=>f.id===r.fulfilmentId));
 const preview=<div className="proof-sample"><b>Sample · Completed warehouse pickup · Read-only</b><small>Synthetic preview only · Photos and signatures below are not real collection evidence.</small>
 <article><div className="proof-sample-heading"><strong>SF-SAMPLE-002 · SO-SAMPLE-0004725</strong><span>Completed · Sample</span></div>
 <div className="proof-sample-metadata"><div><small>Collected by</small><b>Sample Jordan Lee</b></div><div><small>Collection time</small><b>09 Nov 2026, 10:30 (Melbourne)</b></div><div><small>Recorded by</small><b>Sample Jamie · Warehouse</b></div><div><small>Pickup location</small><b>Melbourne warehouse</b></div></div>
 <p>European Oak Natural · 2 Box · 4.332 m² · Collected in good condition.</p>
 <div className="proof-sample-evidence"><figure><a href="/samples/collection-proof/completed-pickup.png" target="_blank" rel="noreferrer"><img src="/samples/collection-proof/completed-pickup.png" alt="Sample synthetic warehouse pickup photo · two flooring boxes"/></a><figcaption>Sample pickup photo · Click to view full size</figcaption></figure><figure className="proof-signature-sample"><small>Customer signature · Sample</small><svg viewBox="0 0 240 65" role="img" aria-label="Sample customer signature"><path d="M20 45 Q50 5 45 40 T85 25 Q90 60 110 27 Q120 8 125 38 T155 30 Q180 8 180 39 L220 33" fill="none" stroke="#164632" strokeWidth="2.5"/></svg><figcaption>Sample Jordan Lee · Signed 09 Nov 2026, 10:30</figcaption></figure></div></article>
 <details><summary className="proof-preview-toggle">Sample · Pending collection</summary><p>SF-SAMPLE-001 · Awaiting warehouse photos / signature · Not yet collected</p></details><small>Warehouse capture → Management display. No business records are created.</small></div>;
 return <section className={'collection-proof '+(compact?'compact':'')}><header><h3><PackageCheck size={19}/>Collection / Delivery Proof</h3><small>Read-only · Recorded by warehouse</small></header>
 {sample?preview:<>{fulfils.filter(f=>!proofs.some(r=>r.fulfilmentId===f.id)).map(f=><p key={f.id}>{f.fulfilmentNumber} · {f.fulfilmentDate} · {f.lines.map(l=>l.fulfilledQuantity+' '+l.unitSymbol).join(', ')} · Awaiting warehouse photos / signature{f.status==='VOIDED'?' · Voided':''}</p>)}
 {proofs.length?proofs.map(r=>{const f=fulfils.find(f=>f.id===r.fulfilmentId);return <article key={r.id}><strong>{f?.fulfilmentNumber} · {f?.status==='VOIDED'?'Voided dispatch · Historical proof':'Proof recorded'}</strong><small>{f?.lines.map(l=>l.description+' · '+l.fulfilledQuantity+' '+l.unitSymbol).join(' / ')}</small><p>Collected by {r.recipientName} · {new Date(r.collectedAt).toLocaleString('en-AU')}</p><small>Recorded by {r.createdByName} · {new Date(r.createdAt).toLocaleString('en-AU')} · {r.photos.length} photo(s){r.signature?' · Signed':''}</small>{r.notes&&<p>{r.notes}</p>}<div className="proof-gallery">{r.photos.map((p,i)=><a key={i} href={p.data} download={p.name} title="Download photo"><img src={p.data} alt={'Collection photo '+(i+1)+' · '+r.recipientName}/></a>)}{r.signature&&<a href={r.signature} download={'signature-'+r.id+'.png'}><img className="proof-signature" src={r.signature} alt={'Customer signature · '+r.recipientName}/></a>}</div></article>;}):<p>No warehouse collection photos or customer signatures recorded.</p>}
 {!compact&&preview}</>}
 </section>;
}
