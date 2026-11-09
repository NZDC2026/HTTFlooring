import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {DispatchFollowupSample} from './DispatchFollowupsPanel';
it('previews pending, sent, extended, expired and Order states without writable business controls',()=>{const html=renderToStaticMarkup(<DispatchFollowupSample/>);for(const word of ['Sample','Read-only','Pending','follow-up sent','extended','Expired','released','Order remains active'])expect(html).toContain(word);expect(html).not.toContain('<form');expect(html).not.toContain('<input');});
