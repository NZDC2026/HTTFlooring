import {Link} from 'react-router-dom';
import {documentEntryPath,documentEntryTabs} from './DocumentEntryTabs';
export function SalesCreateMenu({sample=false}:{sample?:boolean}){
 return <details className="sales-create-menu"><summary>Create ＋</summary><div>{(['ORDER','QUOTE','INVOICE'] as const).map(kind=>{const {label,Icon}=documentEntryTabs.find(t=>t.kind===kind)!;return <Link key={kind} to={documentEntryPath(kind,{sample})} onClick={e=>{const menu=e.currentTarget.closest('details');if(menu)menu.open=false;}}><Icon size={16}/>New {label}</Link>;})}</div></details>;
}
