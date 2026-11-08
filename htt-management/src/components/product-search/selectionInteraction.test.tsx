import {beforeEach,describe,it,expect,vi} from 'vitest';
const hooks=vi.hoisted(()=>({values:[] as unknown[],cursor:0}));
vi.mock('react',async()=>{const real=await vi.importActual<typeof import('react')>('react');return {...real,useState:(initial:unknown)=>{const i=hooks.cursor++;if(!(i in hooks.values))hooks.values[i]=initial;return [hooks.values[i],(v:unknown)=>{hooks.values[i]=typeof v==='function'?(v as (x:unknown)=>unknown)(hooks.values[i]):v;}];},useRef:()=>({current:null}),useId:()=> 'lookup',useEffect:()=>{}};});
vi.mock('react-dom',()=>({createPortal:(children:unknown)=>children}));
import {ProductSearchSelect} from './ProductSearchSelect';
import {CustomerSearchSelect} from '../../features/sales/components/CustomerSearchSelect';
function nodes(e:any):any[]{return !e||typeof e!=='object'?[]:[e,...[e.props?.children].flat(Infinity).flatMap(nodes)];}
function event(key=''){return {key,preventDefault:vi.fn(),stopPropagation:vi.fn(),target:{value:''}};}
beforeEach(()=>{hooks.values=[];hooks.cursor=0;vi.stubGlobal('window',{innerWidth:1200,innerHeight:900});vi.stubGlobal('document',{body:{}});});
describe('document lookup selection interactions',()=>{
 for(const kind of ['customer','supplier','product'] as const){
 it(`${kind}: clicking a result selects its ID once and closes results without submitting the enclosing form`,()=>{
 const change=vi.fn();let value='';const props={onChange:(id:string)=>{value=id;change(id);}};
 function render(){hooks.cursor=0;return kind==='product'?ProductSearchSelect({...props,products:[{id:'p',sku:'OAK-BLK',name:'Black Oak'}],value}):CustomerSearchSelect({...props,entity:kind,customers:[{id:'c',code:'CUST-1',businessName:'Sydney Flooring',contacts:[]}],value});}
 let tree=render();nodes(tree).find(n=>n.props?.role==='combobox').props.onFocus();tree=render();const option=nodes(tree).find(n=>n.props?.role==='option');const click=event();option.props.onClick(click);tree=render();expect(change).toHaveBeenCalledExactlyOnceWith(kind==='product'?'p':'c');expect(click.preventDefault).toHaveBeenCalled();expect(click.stopPropagation).toHaveBeenCalled();expect(nodes(tree).find(n=>n.props?.role==='combobox').props['aria-expanded']).toBe(false);expect(nodes(tree).some(n=>n.props?.role==='listbox')).toBe(false);
 });
 it(`${kind}: keyboard search and Enter selects a result and does not submit`,()=>{
 const change=vi.fn();function render(){hooks.cursor=0;return kind==='product'?ProductSearchSelect({products:[{id:'p',sku:'OAK-BLK',name:'Black Oak'}],value:'',onChange:change}):CustomerSearchSelect({entity:kind,customers:[{id:'c',code:'SYD',businessName:'Sydney Flooring',contacts:[]}],value:'',onChange:change});}
 let tree=render();const input=nodes(tree).find(n=>n.props?.role==='combobox');input.props.onChange({target:{value:kind==='product'?'BLK':'Sydney'}});tree=render();const enter=event('Enter');nodes(tree).find(n=>n.props?.role==='combobox').props.onKeyDown(enter);expect(enter.preventDefault).toHaveBeenCalled();expect(change).toHaveBeenCalledWith(kind==='product'?'p':'c');
 });
 }
});
