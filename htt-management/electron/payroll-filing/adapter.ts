import type {ConnectorReceipt,ConnectorSettings,FilingReport} from '../../src/features/payroll-filing/contract';
/** Internal connector boundary. This is not an ATO/SuperStream wire schema or a vendor API claim.
 * Install a provider implementation only after obtaining and validating its official contract.
 * A submit implementation must return provider receipt evidence, never infer acceptance from HTTP 2xx.
 * lookup must be read-only and correlate the original request; unknown POSTs are never automatically resubmitted.
 */
export interface PayrollConnector{
 id:string;name:string;
 submit(report:FilingReport,requestId:string,settings:ConnectorSettings,signal:AbortSignal):Promise<ConnectorReceipt>;
 lookup(report:FilingReport,requestId:string,settings:ConnectorSettings,signal:AbortSignal):Promise<ConnectorReceipt|null>;
 poll(report:FilingReport,requestId:string,providerId:string,settings:ConnectorSettings,signal:AbortSignal):Promise<ConnectorReceipt>;
}
export class PayrollConnectors{
 private entries:Map<string,PayrollConnector>;
 constructor(adapters:PayrollConnector[]=[]){if(new Set(adapters.map(a=>a.id)).size!==adapters.length)throw new Error('Duplicate payroll connectors.');this.entries=new Map(adapters.map(a=>[a.id,a]));}
 list(){return [...this.entries.values()].map(a=>({id:a.id,name:a.name}));}
 require(id:string){const a=this.entries.get(id);if(!a)throw new Error('A verified provider-specific payroll connector is not installed. Obtain the STP/SuperStream provider contract before enabling transmission.');return a;}
}
