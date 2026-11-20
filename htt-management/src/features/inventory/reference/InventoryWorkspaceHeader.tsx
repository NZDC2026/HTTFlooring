import {Link} from 'react-router-dom';
import {Layers,List,ArrowRightLeft,Pencil,Box,LockKeyhole} from 'lucide-react';
export type InventoryWorkspaceTab='overview'|'stock'|'movements'|'adjustments'|'damage'|'reserved';
export function InventoryWorkspaceHeader({active,sample,onNavigate}:{active:InventoryWorkspaceTab;sample:boolean;onNavigate?:()=>void}){
 const tabs=[['overview','Overview','/inventory',Layers],['stock','Stock List','/inventory?tab=stock',List],['movements','Stock Movement','/inventory?tab=movements',ArrowRightLeft],['adjustments','Adjust Stock','/inventory/adjustments',Pencil],['damage','Damage Stock','/inventory/damage',Box],['reserved','Reserved Stock','/inventory?tab=stock&stock=reserved',LockKeyhole]] as const;
 return <><header className="iw-heading"><h1>Inventory</h1><p>Manage stock levels, movements and adjustments.</p></header><nav className="iw-nav" aria-label="Inventory tabs">{tabs.map(([key,label,url,Icon])=><Link key={key} data-ui="tab" aria-current={key===active?'page':undefined} to={url+(url.includes('?')?'&':'?')+'sample='+(sample?'1':'0')} onClick={onNavigate}><Icon size={15}/>{label}</Link>)}<Link data-ui="tab" to={'/inventory/scan'+(sample?'?sample=1':'')}>PDA / Scan</Link></nav></>;
}
