import type {ContainerDraft} from '../../incoming-shipments/containerPurchaseModel';
/** One PO line per container; a line may be split across different containers. */
export function allocatePurchaseLine(containers:ContainerDraft[],target:number,line:ContainerDraft['lines'][number],remaining:number){
 if(!Number.isInteger(target)||!containers[target])throw Error('Choose an existing container.');
 if(!Number.isFinite(line.quantity)||line.quantity<=0||line.quantity>remaining)throw Error('Quantity exceeds the remaining quantity on this PO.');
 if(!line.purchaseOrderId||!line.lineId)throw Error('Choose a purchase order line.');
 return containers.map((c,i)=>{if(i!==target)return c;const prior=c.lines.find(l=>l.purchaseOrderId===line.purchaseOrderId&&l.lineId===line.lineId);return {...c,lines:prior?c.lines.map(l=>l===prior?{...l,quantity:l.quantity+line.quantity}:l):[...c.lines,line]};});
}
