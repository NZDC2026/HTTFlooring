import { Link, useParams, useLocation } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { previewRanges } from "../data/portalPreview";
import { products } from "../data/products";
export default function PreviewRangePage(){
 const {id}=useParams();const location=useLocation();const range=previewRanges.find(item=>item.id===id);
 if(!range)return <><PortalHeader/><main className="reference-width"><h1>Series not found</h1><Link to="/inventory">Back to inventory</Link></main></>;
 const existing=products.filter(product=>product.seriesId===id);
 return <><PortalHeader/><main className="reference-width reference-range-detail"><Link to={`/inventory${location.state?.inventorySearch??""}`}>← Back to inventory</Link><h1>{range.name}</h1><p>{range.category} · {range.pattern} · {range.size}{range.pack&&` · ${range.pack} m² / box`}</p><h2>Available Colours <small>{range.count}</small></h2><div className="reference-colours">{range.swatches.map((swatch,index)=>{const product=existing[index];return <article className="reference-card" key={index}><div style={{background:swatch,height:100,borderRadius:6}}/><h3>{product?.colour??["Natural Oak","Smoked Oak","Warm Oak","Classic Oak","Honey Oak","Grey Oak","White Oak","Dark Oak","Latte Oak","Lime Wash"][index]}</h3><p>From ${range.price.toFixed(2)} / {range.category==="Accessories"?"length":"m²"}</p><p>{index<range.inStock?"In stock":"Incoming / made to order"}</p>{product&&<Link to={`/products/${product.id}`}>View product ↗</Link>}</article>;})}</div></main></>;
}
