import { ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { productSeries } from "../data/products";
import type { PreviewRange } from "../data/portalPreview";
export default function SeriesRow({series}:{series:PreviewRange}){
 const location=useLocation();
 return <Link to={`${productSeries.some(item=>item.id===series.id)?"/series":"/ranges"}/${series.id}`} className="range-card" state={{inventorySearch:location.search}}>
 <div className={`range-image tone-${series.tone}`}>{series.promotion&&<span className="range-promo">PROMOTION</span>}</div>
 <div className="range-body"><small>{series.category}{series.category!=="Accessories"&&` · ${series.pattern}`}</small><h2>{series.name}</h2><div className="range-dimensions"><strong>{series.size}</strong>{series.pack&&<span> · {series.pack} m² / box</span>}</div>
 <div className="range-swatches">{series.swatches.slice(0,7).map((colour,index)=><i key={index} style={{background:colour}}/>)}{series.count>7&&<span>+{series.count-7}</span>}</div>
 <div className="range-metrics"><div><small>From</small><strong>${series.price.toFixed(2)}</strong><small>/ {series.category==="Accessories"?"length":"m²"} ex GST</small></div><div><small>Stock in Melbourne</small><strong className={series.stock?"range-stock":"range-made"}>{series.stock?`● ${series.stock} ${series.category==="Accessories"?"lengths":"m²"}`:"Made to order"}</strong>{series.stock>0&&<small>{series.inStock} of {series.count} colours</small>}</div></div>
 <div className="range-incoming">{series.incoming>0&&`▥ Incoming: ${series.incoming} ${series.incoming===1?"colour":"colours"} · next ${series.arrival}`}</div>
 <div className="range-footer"><span>{series.count} {series.count===1?"colour":"colours"}</span><strong>View colours <ArrowUpRight size={13}/></strong></div></div></Link>;
}
