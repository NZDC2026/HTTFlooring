import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {SourceRepairPanel} from './SourceRepairPanel';
it('makes compound source recovery discoverable without giving an auditor write controls',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><SourceRepairPanel rows={[]} actor="auditor" canWrite={false} refresh={()=>{}}/></MemoryRouter>);
 expect(html).toContain('Preview source metadata repair');expect(html).toContain('Read-only inspection');expect(html).not.toContain('Save source repair proposal');
});
it('retains withdrawn proposals in visible history without calling them executed',()=>{
 const row:any={operationId:'case',kind:'SOURCE_METADATA_REPAIR',state:'COMPLETED',note:'Source repair proposal withdrawn',repairProposalHistory:[{id:'prior',reference:'REVIEW-001',planJson:'{"changes":[]}' }]};
 const html=renderToStaticMarkup(<MemoryRouter><SourceRepairPanel rows={[row]} actor="reviewer" canWrite={true} refresh={()=>{}}/></MemoryRouter>);
 expect(html).toContain('Withdrawn source repair case');expect(html).toContain('Previous proposal');expect(html).not.toContain('Executed source repair');
});
