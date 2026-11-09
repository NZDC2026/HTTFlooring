import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {CollectionProofPanel} from './CollectionProofPanel';
vi.mock('./collectionProofRepository',()=>({useCollectionProofs:()=>[]}));
vi.mock('../sales/data/salesFulfilmentRepository',()=>({salesFulfilmentRepository:{subscribe:()=>()=>{},getSnapshot:()=>[],getAll:()=>[]}}));
it('shows read-only warehouse proof samples without management capture controls',()=>{
 const html=renderToStaticMarkup(<CollectionProofPanel sample/>);
 expect(html).toContain('Sample Jordan Lee');expect(html).toContain('Sample customer signature');expect(html).toContain('Read-only');expect(html).toContain('Warehouse');
 expect(html).not.toContain('<input');expect(html).not.toContain('<canvas');expect(html).not.toContain('Save Collection Proof');expect(html).not.toContain('Add Photos / Signature');
});

it('displays completed synthetic evidence directly in management without writing records',()=>{
 const html=renderToStaticMarkup(<CollectionProofPanel/>);
 expect(html).toContain('completed-pickup.png');expect(html).toContain('Sample Jordan Lee');expect(html).toContain('10:30 (Melbourne)');expect(html).toContain('Sample customer signature');expect(html).toContain('2 Box');expect(html).toContain('4.332 m²');expect(html).toContain('Pending collection');expect(html).not.toContain('<input');expect(html).not.toContain('<canvas');
 expect(html.indexOf('Sample · Completed warehouse pickup')).toBeLessThan(html.indexOf('<details>'));
});
