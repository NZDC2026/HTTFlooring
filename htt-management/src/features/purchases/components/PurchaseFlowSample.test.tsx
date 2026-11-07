import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {PurchaseFlowSample,purchaseFlowSampleSummary} from './PurchaseFlowSample';
it('shows a populated read-only linked purchasing workflow by default',()=>{const html=renderToStaticMarkup(<PurchaseFlowSample/>);for(const text of ['Quotation','PO-SAMPLE-10502','GR-SAMPLE-0103','BILL-SAMPLE-0102','European Oak','86.640 m²','Read-only Sample','Preview Convert to Order'])expect(html).toContain(text);});
it('calculates unreceived quantities across pending, partial and completed scenarios',()=>{expect(purchaseFlowSampleSummary('pending').outstanding).toBe(3599.96);expect(purchaseFlowSampleSummary('partial').outstanding).toBe(1799.98);expect(purchaseFlowSampleSummary('complete').outstanding).toBe(0);expect(purchaseFlowSampleSummary('complete').total).toBe(3959.96);});
