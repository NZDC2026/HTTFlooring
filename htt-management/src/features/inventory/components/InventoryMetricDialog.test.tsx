import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {InventoryMetricDialog} from './InventoryMetricDialog';
const render=(metric:number,sample=true,canCost=true)=>renderToStaticMarkup(<MemoryRouter><InventoryMetricDialog metric={metric} sample={sample} canCost={canCost} onClose={()=>{}} onStock={()=>{}}/></MemoryRouter>);
describe('Inventory metric detail dialogs',()=>{
 it.each([[0,'Total Stock Value','Top products by value'],[1,'Available Stock','How it’s worked out'],[2,'Reserved for Orders','SO-10391'],[3,'Avg Days on Hand','How it’s calculated:']])('renders metric %s with its dedicated breakdown',(metric,title,detail)=>{const html=render(Number(metric));expect(html).toContain(String(title));expect(html).toContain(String(detail));expect(html).toContain('role="dialog"');expect(html).toContain('Sample · Read-only preview');expect(html).toContain('Export');});
 it('keeps sample figures out of the live and restricted valuation views',()=>{expect(render(0,false)).not.toContain('$2,438,760');expect(render(0,true,false)).toContain('Restricted');expect(render(0,true,false)).not.toContain('$81,320');});
});
