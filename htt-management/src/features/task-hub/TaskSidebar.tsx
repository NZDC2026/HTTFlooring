import {useState} from 'react';
import {CalendarDays,User} from 'lucide-react';
import type {HubTask} from './taskHubModel';
export function calendarDays(month:string){
 const [year,m]=month.split('-').map(Number),start=new Date(Date.UTC(year,m-1,1));
 const count=new Date(Date.UTC(year,m,0)).getUTCDate();
 return [...Array.from({length:(start.getUTCDay()+6)%7},()=>''),...Array.from({length:count},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`)];
}
export function TaskCalendar({tasks,today,onSelect}:{tasks:HubTask[];today:string;onSelect:(date:string)=>void}){
 const [month,setMonth]=useState(today.slice(0,7)),[selected,setSelected]=useState('');
 const move=(offset:number)=>{const d=new Date(month+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+offset);setMonth(d.toISOString().slice(0,7));};
 return <section className="taskhub-card taskhub-calendar"><h2><CalendarDays size={18}/>Calendar</h2><div className="taskhub-calendar-month"><button aria-label="Previous month" onClick={()=>move(-1)}>‹</button><strong>{new Date(month+'-01T12:00:00Z').toLocaleDateString('en-AU',{month:'long',year:'numeric',timeZone:'UTC'})}</strong><button aria-label="Next month" onClick={()=>move(1)}>›</button></div><div className="taskhub-calendar-grid">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><small key={d}>{d}</small>)}{calendarDays(month).map((d,i)=>d?<button key={d} className={(d===today?'today ':'')+(d===selected?'selected':'')} onClick={()=>{setSelected(d);onSelect(d);}} title={`${d} · ${tasks.filter(t=>t.due===d).length} tasks`}>{Number(d.slice(-2))}{tasks.some(t=>t.due===d)&&<i className={tasks.some(t=>t.due===d&&t.status!=='Completed'&&d<today)?'overdue':''}/>}</button>:<span key={'empty'+i}/>)}</div><small>Click a date to filter tasks.</small></section>;
}
export function MyTaskProgress({tasks,userId,onClick}:{tasks:HubTask[];userId:string;onClick:()=>void}){
 const mine=tasks.filter(t=>t.owner===userId&&!['Inactive','Cancelled'].includes(t.status));
 const states=[{name:'Open',tone:'open'},{name:'In progress',tone:'progress'},{name:'Completed',tone:'completed'}].map(s=>({...s,count:mine.filter(t=>t.status===s.name).length}));
 return <section className="taskhub-card taskhub-progress"><button className="taskhub-heading" onClick={onClick}><h2><User size={18}/>My Tasks</h2><strong>{mine.length}</strong></button><div className="taskhub-progress-bar">{states.map(s=><span key={s.name} className={s.tone} style={{width:`${mine.length?s.count/mine.length*100:0}%`}}/>)}</div><div className="taskhub-progress-legend">{states.map(s=><small key={s.name}><i className={s.tone}/>{s.name} ({s.count})</small>)}</div></section>;
}
