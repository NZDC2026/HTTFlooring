/** Shared by the read-only preview and the authoritative create command. */
export function nextCustomerCode(customers:readonly {code:string}[]):string {
    const highest=customers.reduce((max,c)=>{const match=c.code.match(/(\d+)$/);const value=match?Number(match[1]):NaN;return Number.isFinite(value)?Math.max(max,value):max;},0);
    return `CUST-${String(highest+1).padStart(4,'0')}`;
}
