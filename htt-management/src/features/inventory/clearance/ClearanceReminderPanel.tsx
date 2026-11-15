import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useWorkspaceRecords} from '../../business-workspace/workspaceRepository';
import {useSalesBatchOptions} from './batchSalesPricing';
import {clearanceReminders,clearanceRequestLabel} from './clearanceReminders';
import {stockAdjustmentRepository,useStockAdjustments,type StockAdjustment} from '../../stock-adjustments/stockAdjustmentRepository';
import {StockAdjustmentForm} from '../../stock-adjustments/StockAdjustments';
import {usePermission} from '../../security/usePermission';
export function ClearanceReminderPanel({today,onEdit}:{today:string;onEdit:(id:string,mode:'extend'|'price')=>void}){
 const rules=useWorkspaceRecords('clearances'),batches=useSalesBatchOptions(),adjustments=useStockAdjustments(),canManage=usePermission('promotions.manage'),canRequest=usePermission('inventory.adjust');
 const [error,setError]=useState(''),[review,setReview]=useState<StockAdjustment>();
 const reminders=clearanceReminders(rules,batches,adjustments,today);
 return <section data-ui="card" className="cls-panel cls-expiry" aria-label="Clearance expiry reminders"><header><h2>Expiry reminders</h2><small>7 days before expiry · Remaining batch stock · <Link to="/notifications">Open Notifications</Link></small></header><div className="cls-expiry-body">{reminders.length?reminders.map(({rule,remaining,daysLeft,request})=><div className="cls-expiry-row" key={rule.id}><div><b>{rule.name} · {rule.batchNumber}</b><p>{rule.shade?rule.shade+' · ':''}{remaining} base units left · Ends {rule.ends} · {request?clearanceRequestLabel(request):daysLeft<0?'Expired':daysLeft===0?'Ends today':`${daysLeft} days left`}</p></div><div className="cls-expiry-buttons">{canManage&&<><button data-ui="button" onClick={()=>onEdit(rule.id,'extend')}>Extend</button><button data-ui="button" onClick={()=>onEdit(rule.id,'price')}>Cut price</button></>}{request?<Link data-ui="button" to={`/inventory/adjustments?adjustment=${encodeURIComponent(request.id)}`}>Open {request.number}</Link>:canRequest&&<button data-ui="button" onClick={()=>{try{const row=stockAdjustmentRepository.requestClearanceWriteOff({operationId:crypto.randomUUID(),clearanceId:rule.id,expectedRevision:rule.revision});setReview(row);setError('');}catch(e){setError((e as Error).message);}}}>Request remaining stock write-off</button>}</div></div>):<p>No clearance batches need expiry follow-up.</p>}<p>Create a preparing Adjust Stock draft, upload at least one photo or attachment, then submit for review. Stock and accounts change only after authorised posting.</p>{error&&<p role="alert">{error}</p>}</div>{review&&<StockAdjustmentForm key={review.id+':'+review.revision} row={review} onClose={()=>setReview(undefined)} onSaved={setReview}/>}</section>;
}
