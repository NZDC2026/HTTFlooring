import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {ReturnConfirmation} from './ReturnConfirmation';
import {sampleInspectionItems,sampleInspectionOptions} from './ReturnInspectionItems';
it('uses invoice price per square metre for packs and reconciles the four-item example including GST',()=>{const html=renderToStaticMarkup(<ReturnConfirmation items={sampleInspectionItems} options={sampleInspectionOptions} customer="Harbour Flooring" invoice="INV-10418" date="2026-11-19" reason="Customer Return" number="CN-SAMPLE-10027" notes="One damaged box" sample apply={false} total={1120.87} onEdit={()=>{}}/>);for(const text of ['$50.00','$45.00','$120.00','$2.00','$541.50','$97.47','$360.00','$20.00','$1,018.97','$101.90','$1,120.87','CN-SAMPLE-10027'])expect(html).toContain(text);});
