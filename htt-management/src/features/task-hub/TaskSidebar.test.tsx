import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {calendarDays,TaskCalendar,MyTaskProgress} from './TaskSidebar';
import {taskSamples} from './taskHubModel';
it('calendar handles leap years and Monday alignment without timezone drift',()=>{
 const days=calendarDays('2028-02');expect(days.filter(Boolean)).toHaveLength(29);expect(days[0]).toBe('');expect(days[1]).toBe('2028-02-01');expect(days.at(-1)).toBe('2028-02-29');
});
it('calendar marks due dates and my tasks progress uses only signed-in owner',()=>{
 const tasks=taskSamples('2026-11-10','admin');
 const calendar=renderToStaticMarkup(<TaskCalendar tasks={tasks} today="2026-11-10" onSelect={()=>{}}/>);
 expect(calendar).toContain('November 2026');expect(calendar).toContain('2026-11-10 · 1 tasks');
 const progress=renderToStaticMarkup(<MyTaskProgress tasks={tasks} userId="admin" onClick={()=>{}}/>);
 expect(progress).toContain('Open (3)');expect(progress).toContain('Completed (1)');expect(progress).toContain('75%');
});
