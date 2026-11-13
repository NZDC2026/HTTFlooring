import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {AlertTriangle} from 'lucide-react';
import {useWorkspaceRecords} from '../business-workspace/workspaceRepository';
import {usePermission} from '../security/usePermission';
import {promotionCampaigns,endingSoon} from './promotionCampaigns';
import {samplePromotionRows,displayDate} from './promotionWorkspaceModel';
export function PromotionExpiryNotice({sample=false,role}:{sample?:boolean;role?:string|null}){const rows=useWorkspaceRecords('promotions'),read=usePermission('sales.read'),[now,setNow]=useState(Date.now());useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);const expiring=promotionCampaigns(sample?samplePromotionRows(Math.floor(now/86400000)*86400000):rows).filter(c=>endingSoon(c,now));if(!read||role==='Warehouse'||!expiring.length)return null;return <section className="promo-dashboard-reminder" aria-label="Promotions ending soon"><AlertTriangle size={22}/><div><h2>{expiring.length} promotion{expiring.length===1?'':'s'} ending soon{sample&&<small>Sample · Read-only</small>}</h2><p>{expiring.map(c=>c.name+' · '+displayDate(c.ends)).join(' · ')}</p></div><Link to={'/promotions?status=ending'+(sample?'&sample=1':'')}>Review promotions →</Link></section>}
