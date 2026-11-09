import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {ProcurementDocumentSection,ProcurementAllocation} from './ProcurementSections';
import {procurementSamples} from './ProcurementPage';
import {procurementTotals} from './procurementTotals';
import {readInvoiceDrafts} from './procurementDrafts';
import {readDocuments} from './procurementDocuments';
import {parseProcurementLinks,procurementRoles} from './procurementRules';
describe('Procurement document sections',()=>{
 it('shows populated three-part samples and final area allocation',()=>{
 const {batches,orders}=procurementSamples();const b=batches.find(b=>b.id==='sample-open')!;
 const html=renderToStaticMarkup(<>{procurementRoles.map((role,i)=><ProcurementDocumentSection key={role} kind={(['materials','freight','customs'] as const)[i]} documents={readDocuments(b.documents)} sample orders={parseProcurementLinks(b.links).filter(l=>l.role===role).map(l=>orders.find(o=>o.id===l.orderId)!)}/>)}<ProcurementAllocation links={b.links} orders={orders}/></>);
 for(const text of ['Materials Order','Freight Order','Customs Clearance Order','BON-NAT-001','SEA FREIGHT','Port Service Charge','MBL-SAMPLE-108','Consignment No.','Landed Cost Allocation','1,732.8','26.43'])expect(html).toContain(text);
 });
 it('shows one reused materials invoice and exactly two new manual drafts in the mixed saved result',()=>{
 const {batches,orders}=procurementSamples();const batch=batches.find(b=>b.id==='sample-mixed')!;
 expect(parseProcurementLinks(batch.links)).toEqual([{role:'Materials',orderId:'bill:sample-existing-material'}]);
 const drafts=readInvoiceDrafts(batch.invoiceDrafts);expect(drafts.map(d=>d.role)).toEqual(['Freight','Customs Clearance']);expect(drafts.every(d=>d.status==='DRAFT'&&!!d.manual)).toBe(true);
 const totals=procurementTotals({links:batch.links,documents:batch.documents},orders);expect(totals.amounts).toEqual({Materials:42000,Freight:3080,'Customs Clearance':715});expect(totals.qty).toBe(1732.8);expect(totals.total).toBe(45795);
 const html=renderToStaticMarkup(<>{procurementRoles.map((role,i)=><ProcurementDocumentSection key={role} kind={(['materials','freight','customs'] as const)[i]} documents={readDocuments(batch.documents)} sample orders={parseProcurementLinks(batch.links).filter(l=>l.role===role).map(l=>orders.find(o=>o.id===l.orderId)!)}/>)}<ProcurementAllocation links={batch.links} documents={batch.documents} orders={orders}/></>);
 for(const text of ['MAT-INV-SAMPLE-2026-108','FRT-SAMPLE-108','CLR-SAMPLE-108','SEA FREIGHT','Port Service Charge','45,795.00','26.43'])expect(html).toContain(text);
 });
 it('shows saved selected quantity and allocation while retaining excluded sample products in details',()=>{
 const {batches,orders}=procurementSamples();const b=batches.find(b=>b.id==='sample-open')!;
 const totals=procurementTotals({links:b.links,documents:b.documents},orders);
 expect(totals.qty).toBe(1752.8);expect(totals.selectedQty).toBe(1732.8);expect(totals.landedCost).toBeCloseTo(45795/1732.8);
 const html=renderToStaticMarkup(<><ProcurementDocumentSection kind="materials" documents={readDocuments(b.documents)} sample orders={[]}/><ProcurementAllocation links={b.links} documents={b.documents} orders={orders}/></>);
 for(const text of ['Included','Excluded','Selected Qty','1,752.8','1,732.8','26.43'])expect(html).toContain(text);
 });
 it('retains compatibility with existing batches and rejects malformed documents',()=>{
 expect(readDocuments()).toEqual({materials:{},freight:{},customs:{}});
 expect(()=>readDocuments('{"materials":42}')).toThrow();
 });
});
