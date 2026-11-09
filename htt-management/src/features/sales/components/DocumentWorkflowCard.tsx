import {FileText} from 'lucide-react';

/** One visual language for sales, returns and purchasing, with each workflow's own stages. */
export function DocumentWorkflowCard({title,number,status='Draft',stages,current=0}:{title:string;number?:string;status?:string;stages:readonly string[];current?:number}){
 return <section className="entry-card entry-status" aria-label={`${title} workflow`}><div><FileText size={34}/><div><span>{title}</span><strong>{number||'New Document'}</strong></div><em>{status}</em></div><ol>{stages.map((stage,i)=><li key={stage} className={i===current?'active':i<current?'complete':''} aria-current={i===current?'step':undefined}>{stage}{i===current?' (Current)':''}</li>)}</ol></section>;
}
