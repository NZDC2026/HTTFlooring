import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { businessDateKey, fiscalYearStart } from '../../lib/businessDate';
import './date-range.css';
export interface DateRange { from: string; to: string }
const key=(date:Date)=>date.toISOString().slice(0,10);
export function dateRangePreset(preset:string,today:string):DateRange {
 if(preset==='All dates')return {from:'',to:''};
 if(preset==='Today')return {from:today,to:today};
 if(preset==='YTD')return {from:fiscalYearStart(today),to:today};
 const date=new Date(today+'T00:00:00Z');
 if(preset==='This Week'){date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);return {from:key(date),to:today};}
 date.setUTCDate(1);
 if(preset==='Last Month'){const end=new Date(date.getTime()-86400000);date.setUTCMonth(date.getUTCMonth()-1);return {from:key(date),to:key(end)};}
 if(preset==='3 months')date.setUTCMonth(date.getUTCMonth()-2);
 return {from:key(date),to:today};
}
export function calendarDays(month:string):string[]{
 const first=new Date(month.slice(0,7)+'-01T00:00:00Z');first.setUTCDate(1-(first.getUTCDay()+6)%7);
 return Array.from({length:42},(_,i)=>key(new Date(first.getTime()+i*86400000)));
}
function display(date:string){return date?new Date(date+'T00:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}):'All dates';}
/** Draft dates are committed together by Apply; cancelling leaves the report unchanged. */
export function DateRangePicker({from,to,onChange,label='Date Range',allowEmpty=true,preset}:{from:string;to:string;onChange:(range:DateRange,preset?:string)=>void;preset?:string;label?:string;allowEmpty?:boolean}){
 const today=businessDateKey(new Date().toISOString()),id=useId();
 const root=useRef<HTMLDivElement>(null),popup=useRef<HTMLDivElement>(null);
 const [open,setOpen]=useState(false),[active,setActive]=useState<'from'|'to'>('from'),[draft,setDraft]=useState({from,to}),[month,setMonth]=useState((from||to||today).slice(0,7)+'-01'),[position,setPosition]=useState({top:0,left:0});
 const [draftPreset,setDraftPreset]=useState<string|undefined>(preset);
 const openPicker=(field:'from'|'to')=>{if(open){setActive(field);setMonth((draft[field]||today).slice(0,7)+'-01');return;}setDraft({from,to});setDraftPreset(preset);setActive(field);setMonth((field==='from'?from||to||today:to||from||today).slice(0,7)+'-01');setOpen(true);};
 useEffect(()=>{
  if(!open)return;
  const place=()=>{const rect=root.current?.getBoundingClientRect();if(!rect)return;const width=Math.min(570,window.innerWidth-24),height=Math.min(450,window.innerHeight-24);setPosition({left:Math.max(12,Math.min(rect.left,window.innerWidth-width-12)),top:rect.bottom+height+8<=window.innerHeight?rect.bottom+8:Math.max(12,rect.top-height-8)});};
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node)&&!popup.current?.contains(e.target as Node))setOpen(false);};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);root.current?.querySelector<HTMLButtonElement>(`[data-endpoint="${active}"]`)?.focus();}};
  place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  popup.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
  return ()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open,active]);
 const choose=(date:string)=>{
   setDraftPreset(undefined);if(active==='from'){setDraft({from:date,to:draft.to&&draft.to>=date?draft.to:date});setActive('to');}else if(draft.from&&date<draft.from){setDraft({from:date,to:draft.from});}else setDraft({...draft,to:date});};
 const quick=(preset:string)=>{const range=dateRangePreset(preset,today);setDraft(range);setDraftPreset(preset);setMonth((range.from||today).slice(0,7)+'-01');};
 const move=(amount:number)=>{const date=new Date(month+'T00:00:00Z');date.setUTCMonth(date.getUTCMonth()+amount);setMonth(key(date));};
 const year=Number(month.slice(0,4)),currentYear=Number(today.slice(0,4)),yearTop=Math.max(currentYear+1,year+1),valid=(allowEmpty||!!draft.from&&!!draft.to)&&(!draft.from||!draft.to||draft.from<=draft.to);
 return <div ref={root} className="htt-date-range" role="group" aria-label={label}>
  <span className="htt-date-range-title"><CalendarDays size={19}/>{label}{preset&&<small className="htt-date-preset-label">{preset}</small>}</span>
  <div className="htt-date-range-fields">{(['from','to'] as const).map((field,i)=><span className="htt-date-endpoint-wrap" key={field}>{i===1&&<span className="htt-date-range-arrow">–</span>}<button type="button" data-endpoint={field} className={'htt-date-endpoint '+(open&&active===field?'is-active':'')} aria-label={label+' '+field} aria-haspopup="dialog" aria-expanded={open&&active===field} aria-controls={open?id:undefined} onClick={()=>openPicker(field)}><span><small>{field==='from'?'From':'To'}</small><strong>{display(open?draft[field]:field==='from'?from:to)}</strong></span><CalendarDays size={20}/></button></span>)}

  </div>
  {open&&typeof document!=='undefined'&&createPortal(<div ref={popup} id={id} className="htt-date-popover" role="dialog" aria-label="Select date range" style={position}>
   <div className="htt-date-calendar-body"><aside className="htt-date-years"><h3><CalendarDays size={17}/>Select Period</h3><div>{Array.from({length:Math.max(12,yearTop-year+2)},(_,i)=>yearTop-i).map(y=><button type="button" key={y} className={year===y?'selected':''} onClick={()=>setMonth(`${y}-${month.slice(5,7)}-01`)}>{y}{year===y&&<Check size={18}/>}</button>)}</div></aside>
    <div className="htt-date-calendar"><header><button type="button" aria-label="Previous month" onClick={()=>move(-1)}><ChevronLeft size={22}/></button><div className="htt-date-month-jump"><select aria-label="Calendar month" value={month.slice(5,7)} onChange={e=>setMonth(`${year}-${e.target.value}-01`)}>{Array.from({length:12},(_,i)=><option key={i} value={String(i+1).padStart(2,'0')}>{new Date(Date.UTC(2024,i,1)).toLocaleDateString('en-GB',{month:'long',timeZone:'UTC'})}</option>)}</select><select aria-label="Calendar year" value={year} onChange={e=>setMonth(`${e.target.value}-${month.slice(5,7)}-01`)}>{Array.from({length:Math.max(101,currentYear-year+2)},(_,i)=>currentYear+10-i).map(y=><option key={y}>{y}</option>)}</select></div><button type="button" aria-label="Next month" onClick={()=>move(1)}><ChevronRight size={22}/></button></header><p className="htt-date-selecting">Select {active==='from'?'start':'end'} date</p><div className="htt-date-weekdays">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><span key={d}>{d}</span>)}</div><div className="htt-date-days" role="grid" aria-label="Calendar">{calendarDays(month).map(date=><button type="button" role="gridcell" aria-label={display(date)} aria-selected={date===draft.from||date===draft.to} aria-current={date===today?'date':undefined} key={date} className={[date.slice(0,7)!==month.slice(0,7)?'outside':'',date===draft.from||date===draft.to?'endpoint':'',draft.from&&draft.to&&date>draft.from&&date<draft.to?'in-range':''].join(' ')} onClick={()=>choose(date)}>{Number(date.slice(8))}</button>)}</div></div>
   </div><footer><div>{['Today','This Month','Last Month'].map(p=><button type="button" key={p} onClick={()=>quick(p)}>{p}</button>)}</div><div><button type="button" onClick={()=>setOpen(false)}>Cancel</button><button type="button" className="htt-date-apply" disabled={!valid} onClick={()=>{onChange(draft,draftPreset);setOpen(false);}}>Apply</button></div></footer>
  </div>,document.body)}
 </div>;
}
