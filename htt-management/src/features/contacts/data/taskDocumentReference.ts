export type TaskDocument = {id:string;customerId?:string;supplierId?:string;status?:string};
export function validateTaskDocument(type:string|undefined,id:string|undefined,partyId:string,orders:readonly TaskDocument[],invoices:readonly TaskDocument[],party:"customerId"|"supplierId") {
    if(!type&&!id)return;
    if(!["Order","Invoice"].includes(type??"")||!id)throw Error("Select an order or invoice number.");
    const doc=(type==="Order"?orders:invoices).find(d=>d.id===id&&d[party]===partyId);
    if(!doc)throw Error("The selected document must belong to this customer or supplier.");
}
